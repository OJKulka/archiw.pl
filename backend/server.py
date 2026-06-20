from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, Request, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
import bcrypt
import jwt as pyjwt
from pathlib import Path
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import pymysql
from pymysql.cursors import DictCursor
import stripe
import re
import unicodedata
from uuid import uuid4
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

def get_rate_limit_ip(request: Request) -> str:
    return (
        request.headers.get("CF-Connecting-IP")
        or get_remote_address(request)
    )


limiter = Limiter(key_func=get_rate_limit_ip)

app.state.limiter = limiter
app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler,
)

WEB_ROOT = Path(
    os.environ.get("WEB_ROOT", r"C:\www")
).resolve()

PRODUCT_IMAGE_DIR = WEB_ROOT / "uploads" / "products"
PRODUCT_IMAGE_URL_PREFIX = "/uploads/products"

PRODUCT_IMAGE_DIR.mkdir(parents=True, exist_ok=True)

JWT_SECRET = os.environ.get("JWT_SECRET", "")
JWT_ALG = "HS256"
STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
stripe.api_key = STRIPE_SECRET_KEY


app = FastAPI()
api_router = APIRouter(prefix="/api")

def get_rate_limit_ip(request: Request) -> str:
    return (
        request.headers.get("CF-Connecting-IP")
        or get_remote_address(request)
    )


limiter = Limiter(key_func=get_rate_limit_ip)

app.state.limiter = limiter
app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler,
)

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def get_db():
    return pymysql.connect(
        host=os.environ["DB_HOST"],
        port=int(os.environ.get("DB_PORT", 3306)),
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        database=os.environ["DB_NAME"],
        charset="utf8mb4",
        cursorclass=DictCursor,
        autocommit=True,
    )


class RegisterReq(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None


class LoginReq(BaseModel):
    email: EmailStr
    password: str


class CartItemIn(BaseModel):
    product_id: int
    quantity: int = 1


class CheckoutReq(BaseModel):
    items: List[CartItemIn]
    origin_url: str


class AdminDiscountIn(BaseModel):
    discount_percent: float = Field(ge=0, le=100)
    is_active: bool = True
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None


class AdminProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    slug: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = None
    price: float = Field(gt=0)
    brand: Optional[str] = Field(default=None, max_length=255)
    size: Optional[str] = Field(default=None, max_length=100)
    gender: Optional[str] = Field(default=None, max_length=100)
    stock: int = Field(default=1, ge=0)
    is_active: bool = True
    is_new: bool = False
    categories: List[str] = Field(default_factory=list)
    images: List[str] = Field(default_factory=list)
    discount: Optional[AdminDiscountIn] = None


class AdminProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    slug: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = None
    price: Optional[float] = Field(default=None, gt=0)
    brand: Optional[str] = Field(default=None, max_length=255)
    size: Optional[str] = Field(default=None, max_length=100)
    gender: Optional[str] = Field(default=None, max_length=100)
    stock: Optional[int] = Field(default=None, ge=0)
    is_active: Optional[bool] = None
    is_new: Optional[bool] = None
    categories: Optional[List[str]] = None
    images: Optional[List[str]] = None
    discount: Optional[AdminDiscountIn] = None


class AdminCategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    slug: Optional[str] = Field(default=None, max_length=255)


class AdminImageDelete(BaseModel):
    image_path: str


def _hash_pw(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def _verify_pw(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def _create_jwt(user_id: int) -> str:
    if not JWT_SECRET:
        raise HTTPException(500, "JWT_SECRET not configured")

    payload = {
        "user_id": int(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "iat": datetime.now(timezone.utc),
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def _normalize_bool(value: Optional[bool]) -> Optional[int]:
    if value is None:
        return None
    return 1 if value else 0


async def get_current_user(authorization: Optional[str] = Header(default=None)) -> Optional[dict]:
    if not authorization or not authorization.lower().startswith("bearer "):
        return None

    token = authorization.split(" ", 1)[1]

    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        user_id = int(payload["user_id"])
    except Exception:
        return None

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, email, name, role, created_at
                FROM users
                WHERE id = %s
                LIMIT 1
                """,
                (user_id,),
            )
            return cur.fetchone()
    finally:
        conn.close()


async def require_user(user=Depends(get_current_user)) -> dict:
    if not user:
        raise HTTPException(401, "Not authenticated")
    return user


async def require_admin(user=Depends(get_current_user)) -> dict:
    if not user:
        raise HTTPException(401, "Not authenticated")
    if user.get("role") != "admin":
        raise HTTPException(403, "Administrator permissions required")
    return user


def _model_dump(model, *, exclude_unset: bool = False) -> dict:
    if hasattr(model, "model_dump"):
        return model.model_dump(exclude_unset=exclude_unset)
    return model.dict(exclude_unset=exclude_unset)


def _fields_set(model) -> set:
    return set(
        getattr(
            model,
            "model_fields_set",
            getattr(model, "__fields_set__", set()),
        )
    )


def _slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = value.encode("ascii", "ignore").decode("ascii")
    value = re.sub(r"[^a-zA-Z0-9]+", "-", value.lower()).strip("-")
    return value or "produkt"


def _unique_product_slug(cur, requested_slug: str, exclude_product_id: Optional[int] = None) -> str:
    base = _slugify(requested_slug)
    candidate = base
    suffix = 2

    while True:
        if exclude_product_id is None:
            cur.execute("SELECT id FROM products WHERE slug = %s LIMIT 1", (candidate,))
        else:
            cur.execute(
                "SELECT id FROM products WHERE slug = %s AND id <> %s LIMIT 1",
                (candidate, exclude_product_id),
            )

        if not cur.fetchone():
            return candidate

        candidate = f"{base}-{suffix}"
        suffix += 1


def _validate_discount_dates(discount: AdminDiscountIn):
    if discount.starts_at and discount.ends_at and discount.ends_at <= discount.starts_at:
        raise HTTPException(400, "Discount end date must be later than start date")


def _replace_product_categories(cur, product_id: int, category_slugs: List[str]):
    normalized = list(dict.fromkeys(_slugify(slug) for slug in category_slugs if slug.strip()))

    cur.execute("DELETE FROM product_categories WHERE product_id = %s", (product_id,))

    for slug in normalized:
        cur.execute("SELECT id FROM categories WHERE slug = %s LIMIT 1", (slug,))
        category = cur.fetchone()
        if not category:
            raise HTTPException(400, f"Unknown category: {slug}")

        cur.execute(
            """
            INSERT INTO product_categories (product_id, category_id)
            VALUES (%s, %s)
            """,
            (product_id, category["id"]),
        )


def _replace_product_images(cur, product_id: int, images: List[str]):
    cur.execute("DELETE FROM product_images WHERE product_id = %s", (product_id,))

    for sort_order, image_path in enumerate(images):
        image_path = image_path.strip()
        if not image_path:
            continue

        cur.execute(
            """
            INSERT INTO product_images (product_id, image_path, sort_order)
            VALUES (%s, %s, %s)
            """,
            (product_id, image_path, sort_order),
        )


def _replace_product_discount(cur, product_id: int, discount: Optional[AdminDiscountIn]):
    cur.execute("DELETE FROM product_discounts WHERE product_id = %s", (product_id,))

    if discount is None:
        return

    _validate_discount_dates(discount)

    cur.execute(
        """
        INSERT INTO product_discounts (
            product_id, discount_percent, is_active, starts_at, ends_at
        )
        VALUES (%s, %s, %s, %s, %s)
        """,
        (
            product_id,
            discount.discount_percent,
            _normalize_bool(discount.is_active),
            discount.starts_at,
            discount.ends_at,
        ),
    )


def _get_admin_product(cur, product_id: int) -> dict:
    cur.execute(
        """
        SELECT
            id, name, slug, description, price, brand, size, gender,
            stock, is_active, is_new, created_at
        FROM products
        WHERE id = %s
        LIMIT 1
        """,
        (product_id,),
    )
    product = cur.fetchone()
    if not product:
        raise HTTPException(404, "Product not found")

    cur.execute(
        """
        SELECT c.id, c.name, c.slug
        FROM categories c
        JOIN product_categories pc ON pc.category_id = c.id
        WHERE pc.product_id = %s
        ORDER BY c.name
        """,
        (product_id,),
    )
    product["categories"] = cur.fetchall()

    cur.execute(
        """
        SELECT image_path, sort_order
        FROM product_images
        WHERE product_id = %s
        ORDER BY sort_order ASC
        """,
        (product_id,),
    )
    product["images"] = cur.fetchall()

    cur.execute(
        """
        SELECT discount_percent, is_active, starts_at, ends_at
        FROM product_discounts
        WHERE product_id = %s
        LIMIT 1
        """,
        (product_id,),
    )
    product["discount"] = cur.fetchone()

    product["price"] = float(product["price"])
    product["is_active"] = bool(product["is_active"])
    product["is_new"] = bool(product["is_new"])

    if product["discount"]:
        product["discount"]["discount_percent"] = float(
            product["discount"]["discount_percent"]
        )
        product["discount"]["is_active"] = bool(product["discount"]["is_active"])

    return product


def _safe_attr(obj, attr: str):
    if not obj:
        return None
    return getattr(obj, attr, None)


def _metadata_value(session, key: str):
    metadata = getattr(session, "metadata", None)
    if not metadata:
        return None
    return getattr(metadata, key, None)


def _update_order_after_stripe_session(session_id: str) -> dict:
    try:
        session = stripe.checkout.Session.retrieve(session_id)
    except Exception as e:
        raise HTTPException(500, f"Stripe status error: {str(e)}")

    session_status = _safe_attr(session, "status")
    payment_status = _safe_attr(session, "payment_status")
    amount_total = _safe_attr(session, "amount_total")
    currency = _safe_attr(session, "currency")
    payment_intent_id = _safe_attr(session, "payment_intent")
    order_id = _metadata_value(session, "order_id")

    customer = _safe_attr(session, "customer_details")
    shipping = _safe_attr(session, "shipping_details")
    
    customer_email = _safe_attr(customer, "email")
    customer_name = _safe_attr(customer, "name")
    customer_phone = _safe_attr(customer, "phone")
    
    shipping_name = _safe_attr(shipping, "name")
    
    shipping_address = _safe_attr(shipping, "address")
    customer_address = _safe_attr(customer, "address")
    
    address = shipping_address or customer_address
    
    shipping_country = _safe_attr(address, "country")
    shipping_city = _safe_attr(address, "city")
    shipping_postal_code = _safe_attr(address, "postal_code")
    shipping_line1 = _safe_attr(address, "line1")
    shipping_line2 = _safe_attr(address, "line2")

    conn = get_db()
    try:
        with conn.cursor() as cur:
            if not order_id:
                cur.execute(
                    """
                    SELECT order_id
                    FROM payments
                    WHERE provider_session_id = %s
                    LIMIT 1
                    """,
                    (session_id,),
                )
                row = cur.fetchone()
                if row:
                    order_id = row["order_id"]

            if payment_status == "paid":
                if not order_id:
                    raise HTTPException(500, "Order not found for this Stripe session")

                cur.execute("SELECT status FROM orders WHERE id = %s LIMIT 1", (order_id,))
                order_row = cur.fetchone()
                if not order_row:
                    raise HTTPException(500, "Order not found in database")

                already_paid = order_row["status"] == "paid"

                cur.execute("UPDATE orders SET status = 'paid' WHERE id = %s", (order_id,))

                cur.execute(
                    """
                    UPDATE payments
                    SET status = 'paid',
                        provider_payment_intent_id = %s
                    WHERE order_id = %s
                      AND provider_session_id = %s
                    """,
                    (str(payment_intent_id) if payment_intent_id else None, order_id, session_id),
                )

                cur.execute(
                    """
                    INSERT INTO order_addresses (
                        order_id, type, email, full_name, phone,
                        country, city, postal_code, line1, line2
                    )
                    VALUES (%s, 'shipping', %s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        email = VALUES(email),
                        full_name = VALUES(full_name),
                        phone = VALUES(phone),
                        country = VALUES(country),
                        city = VALUES(city),
                        postal_code = VALUES(postal_code),
                        line1 = VALUES(line1),
                        line2 = VALUES(line2)
                    """,
                    (
                        order_id,
                        customer_email,
                        shipping_name or customer_name,
                        customer_phone,
                        shipping_country,
                        shipping_city,
                        shipping_postal_code,
                        shipping_line1,
                        shipping_line2,
                    ),
                )

                if not already_paid:
                    cur.execute(
                        """
                        SELECT product_id, quantity
                        FROM order_items
                        WHERE order_id = %s
                          AND product_id IS NOT NULL
                        """,
                        (order_id,),
                    )
                    bought_items = cur.fetchall()

                    for item in bought_items:
                        cur.execute(
                            """
                            UPDATE products
                            SET stock = GREATEST(stock - %s, 0)
                            WHERE id = %s
                            """,
                            (item["quantity"], item["product_id"]),
                        )

                        cur.execute(
                            """
                            UPDATE products
                            SET is_active = 0
                            WHERE id = %s
                              AND stock <= 0
                            """,
                            (item["product_id"],),
                        )

            elif session_status == "expired":
                cur.execute(
                    "UPDATE payments SET status = 'expired' WHERE provider_session_id = %s",
                    (session_id,),
                )
                cur.execute(
                    """
                    UPDATE orders o
                    JOIN payments p ON p.order_id = o.id
                    SET o.status = 'cancelled'
                    WHERE p.provider_session_id = %s
                    """,
                    (session_id,),
                )

        return {
            "status": session_status,
            "payment_status": payment_status,
            "amount_total": amount_total,
            "currency": currency,
            "order_id": order_id,
            "customer_email": customer_email,
            "customer_name": customer_name,
            "customer_phone": customer_phone,
            "shipping_country": shipping_country,
            "shipping_city": shipping_city,
            "shipping_postal_code": shipping_postal_code,
            "shipping_line1": shipping_line1,
            "shipping_line2": shipping_line2,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Database update error: {str(e)}")
    finally:
        conn.close()


@api_router.get("/")
async def root():
    return {"message": "ARCHIW API", "status": "ok"}


@api_router.post("/auth/register")
async def register(payload: RegisterReq):
    email = payload.email.lower().strip()
    if len(payload.password) < 6:
        raise HTTPException(400, "Password must have at least 6 characters")

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM users WHERE email = %s LIMIT 1", (email,))
            if cur.fetchone():
                raise HTTPException(400, "Email already registered")

            cur.execute(
                """
                INSERT INTO users (email, password_hash, name, role)
                VALUES (%s, %s, %s, 'user')
                """,
                (email, _hash_pw(payload.password), payload.name or email.split("@")[0]),
            )
            user_id = cur.lastrowid
            cur.execute(
                "SELECT id, email, name, role, created_at FROM users WHERE id = %s",
                (user_id,),
            )
            user = cur.fetchone()

        token = _create_jwt(user["id"])
        return {"token": token, "user": user}
    finally:
        conn.close()


@api_router.post("/auth/login")
@limiter.limit("5/minute")
async def login(request: Request, payload: LoginReq):
    email = payload.email.lower().strip()
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, email, password_hash, name, role, created_at
                FROM users
                WHERE email = %s
                LIMIT 1
                """,
                (email,),
            )
            user = cur.fetchone()

        if not user or not _verify_pw(payload.password, user["password_hash"]):
            raise HTTPException(401, "Invalid credentials")

        token = _create_jwt(user["id"])
        return {
            "token": token,
            "user": {
                "id": user["id"],
                "email": user["email"],
                "name": user["name"],
                "role": user["role"],
                "created_at": user["created_at"],
            },
        }
    finally:
        conn.close()


@api_router.get("/auth/me")
async def me(user=Depends(get_current_user)):
    if not user:
        raise HTTPException(401, "Not authenticated")
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "created_at": user["created_at"],
    }


@api_router.post("/auth/logout")
async def logout():
    return {"ok": True}


@api_router.get("/products")
async def list_products(
    gender: Optional[str] = None,
    category: Optional[str] = None,
    size: Optional[str] = None,
    price_min: Optional[float] = None,
    price_max: Optional[float] = None,
    on_sale: Optional[bool] = None,
    is_new: Optional[bool] = None,
    q: Optional[str] = None,
    sort: str = "newest",
):
    conn = get_db()

    try:
        sql = """
            SELECT
                p.id,
                p.name,
                p.slug,
                p.description,
                p.price AS original_price,
                CASE
                    WHEN pd.discount_percent IS NOT NULL
                    THEN ROUND(p.price * (1 - pd.discount_percent), 2)
                    ELSE p.price
                END AS price,
                pd.discount_percent,
                p.brand AS designer,
                p.size,
                p.gender,
                p.stock,
                p.is_active,
                p.created_at,
                COALESCE(p.is_new, 0) AS is_new,
                GROUP_CONCAT(DISTINCT c.slug) AS categories
            FROM products p
            LEFT JOIN product_discounts pd
                 ON pd.product_id = p.id
                AND pd.is_active = 1
                AND (pd.starts_at IS NULL OR pd.starts_at <= NOW())
                AND (pd.ends_at IS NULL OR pd.ends_at >= NOW())
            LEFT JOIN product_categories pc ON pc.product_id = p.id
            LEFT JOIN categories c ON c.id = pc.category_id
            WHERE p.is_active = 1
        """

        params = []

        if gender and gender != "all":
            normalized_gender = gender.strip().lower()
            gender_aliases = {
                "male": [
                    "male",
                    "men",
                    "man",
                    "m",
                    "męskie",
                    "meskie",
                    "męski",
                    "meski",
                    "mężczyzna",
                    "mezczyzna",
                    "mężczyźni",
                    "mezczyzni",
                ],
                "female": [
                    "female",
                    "women",
                    "woman",
                    "f",
                    "damskie",
                    "damska",
                    "kobieta",
                    "kobiety",
                ],
                "unisex": [
                    "unisex",
                    "uni",
                ],
            }
            accepted_values = gender_aliases.get(
                normalized_gender,
                [normalized_gender],
            )
            placeholders = ", ".join(["%s"] * len(accepted_values))
            sql += (
                f" AND LOWER(TRIM(COALESCE(p.gender, ''))) "
                f"IN ({placeholders})"
            )
            params.extend(accepted_values)

        if size and size != "all":
            sql += " AND p.size = %s"
            params.append(size)

        if on_sale is not None:
            if on_sale:
                sql += " AND pd.discount_percent IS NOT NULL"
            else:
                sql += " AND pd.discount_percent IS NULL"

        if is_new is not None:
            sql += " AND COALESCE(p.is_new, 0) = %s"
            params.append(1 if is_new else 0)

        if q:
            sql += " AND (p.name LIKE %s OR p.brand LIKE %s OR p.description LIKE %s)"
            like = f"%{q}%"
            params.extend([like, like, like])

        sql += """
            GROUP BY p.id
        """

        having_conditions = []

        # Filtry cenowe korzystają z aliasu `price`, czyli ceny po promocji.
        if price_min is not None:
            having_conditions.append("price >= %s")
            params.append(price_min)

        if price_max is not None:
            having_conditions.append("price <= %s")
            params.append(price_max)

        if category and category != "all":
            having_conditions.append("FIND_IN_SET(%s, categories)")
            params.append(category)

        if having_conditions:
            sql += " HAVING " + " AND ".join(having_conditions)

        sort_options = {
            "newest": "p.created_at DESC, p.id DESC",
            "oldest": "p.created_at ASC, p.id ASC",
            "price_asc": "price ASC, p.created_at DESC, p.id DESC",
            "price_desc": "price DESC, p.created_at DESC, p.id DESC",
        }
        order_by = sort_options.get(sort, sort_options["newest"])
        sql += f" ORDER BY {order_by}"

        with conn.cursor() as cur:
            cur.execute(sql, params)
            products = cur.fetchall()

            for product in products:
                cur.execute(
                    """
                    SELECT image_path
                    FROM product_images
                    WHERE product_id = %s
                    ORDER BY sort_order ASC
                    """,
                    (product["id"],),
                )

                images = cur.fetchall()

                product["images"] = [img["image_path"] for img in images]
                product["currency"] = "PLN"

                product["price"] = float(product["price"])

                product["original_price"] = (
                    float(product["original_price"])
                    if product.get("original_price") is not None
                    else None
                )

                product["discount_percent"] = (
                    float(product["discount_percent"])
                    if product.get("discount_percent") is not None
                    else None
                )

                product["on_sale"] = product["discount_percent"] is not None
                product["is_new"] = bool(product.get("is_new"))

                product["categories"] = (
                    product["categories"].split(",")
                    if product.get("categories")
                    else []
                )

                product["category"] = (
                    product["categories"][0]
                    if product["categories"]
                    else None
                )

        return {
            "products": products,
            "count": len(products),
        }

    finally:
        conn.close()


@api_router.get("/products/filters")
async def product_filters():
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT slug FROM categories ORDER BY name")
            categories = [row["slug"] for row in cur.fetchall()]
            cur.execute("SELECT DISTINCT size FROM products WHERE size IS NOT NULL AND is_active = 1 ORDER BY size")
            sizes = [row["size"] for row in cur.fetchall()]
            cur.execute(
                """
                SELECT
                    MIN(final_price) AS min_price,
                    MAX(final_price) AS max_price
                FROM (
                    SELECT
                        CASE
                            WHEN pd.discount_percent IS NOT NULL
                            THEN ROUND(p.price * (1 - pd.discount_percent), 2)
                            ELSE p.price
                        END AS final_price
                    FROM products p
                    LEFT JOIN product_discounts pd
                        ON pd.product_id = p.id
                       AND pd.is_active = 1
                       AND (pd.starts_at IS NULL OR pd.starts_at <= NOW())
                       AND (pd.ends_at IS NULL OR pd.ends_at >= NOW())
                    WHERE p.is_active = 1
                ) prices
                """
            )
            prices = cur.fetchone()

        return {
            "categories": categories,
            "sizes": sizes,
            "price_min": float(prices["min_price"] or 0),
            "price_max": float(prices["max_price"] or 1000),
        }
    finally:
        conn.close()


@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    p.id,
                    p.name,
                    p.slug,
                    p.description,
                    p.price AS original_price,
                    CASE
                        WHEN pd.discount_percent IS NOT NULL
                        THEN ROUND(p.price * (1 - pd.discount_percent), 2)
                        ELSE p.price
                    END AS price,
                    pd.discount_percent,
                    p.brand AS designer,
                    p.size,
                    p.gender,
                    p.stock,
                    p.is_active,
                    p.created_at,
                    COALESCE(p.is_new, 0) AS is_new,
                    GROUP_CONCAT(DISTINCT c.slug) AS categories
                FROM products p
                LEFT JOIN product_discounts pd
                    ON pd.product_id = p.id
                   AND pd.is_active = 1
                   AND (pd.starts_at IS NULL OR pd.starts_at <= NOW())
                   AND (pd.ends_at IS NULL OR pd.ends_at >= NOW())
                LEFT JOIN product_categories pc ON pc.product_id = p.id
                LEFT JOIN categories c ON c.id = pc.category_id
                WHERE (CAST(p.id AS CHAR) = %s OR p.slug = %s)
                  AND p.is_active = 1
                GROUP BY p.id
                LIMIT 1
                """,
                (product_id, product_id),
            )

            product = cur.fetchone()

            if not product:
                raise HTTPException(404, "Product not found")

            cur.execute(
                """
                SELECT image_path
                FROM product_images
                WHERE product_id = %s
                ORDER BY sort_order ASC
                """,
                (product["id"],),
            )

            images = cur.fetchall()

            product["images"] = [img["image_path"] for img in images]
            product["currency"] = "PLN"
            product["price"] = float(product["price"])
            product["original_price"] = float(product["original_price"]) if product["discount_percent"] is not None else None
            product["discount_percent"] = float(product["discount_percent"]) if product["discount_percent"] is not None else None
            product["on_sale"] = product["discount_percent"] is not None
            product["is_new"] = bool(product["is_new"])
            product["categories"] = product["categories"].split(",") if product["categories"] else []
            product["category"] = product["categories"][0] if product["categories"] else None

        return product

    finally:
        conn.close()




@api_router.get("/admin/products")
async def admin_list_products(admin=Depends(require_admin)):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM products ORDER BY created_at DESC, id DESC")
            product_ids = [row["id"] for row in cur.fetchall()]
            products = [_get_admin_product(cur, product_id) for product_id in product_ids]

        return {"products": products, "count": len(products)}
    finally:
        conn.close()


@api_router.get("/admin/products/{product_id}")
async def admin_get_product(product_id: int, admin=Depends(require_admin)):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            return _get_admin_product(cur, product_id)
    finally:
        conn.close()


@api_router.post("/admin/products", status_code=201)
async def admin_create_product(
    payload: AdminProductCreate,
    admin=Depends(require_admin),
):
    conn = get_db()
    try:
        conn.begin()
        with conn.cursor() as cur:
            slug = _unique_product_slug(cur, payload.slug or payload.name)

            cur.execute(
                """
                INSERT INTO products (
                    name, slug, description, price, brand, size, gender,
                    stock, is_active, is_new
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    payload.name.strip(),
                    slug,
                    payload.description,
                    payload.price,
                    payload.brand,
                    payload.size,
                    payload.gender,
                    payload.stock,
                    _normalize_bool(payload.is_active),
                    _normalize_bool(payload.is_new),
                ),
            )
            product_id = cur.lastrowid

            _replace_product_categories(cur, product_id, payload.categories)
            _replace_product_images(cur, product_id, payload.images)
            _replace_product_discount(cur, product_id, payload.discount)

            product = _get_admin_product(cur, product_id)

        conn.commit()
        return product
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        logger.exception("Could not create product")
        raise HTTPException(500, f"Could not create product: {str(e)}")
    finally:
        conn.close()


@api_router.patch("/admin/products/{product_id}")
async def admin_update_product(
    product_id: int,
    payload: AdminProductUpdate,
    admin=Depends(require_admin),
):
    fields = _fields_set(payload)
    data = _model_dump(payload, exclude_unset=True)

    conn = get_db()
    try:
        conn.begin()
        with conn.cursor() as cur:
            cur.execute("SELECT id, name FROM products WHERE id = %s LIMIT 1", (product_id,))
            current = cur.fetchone()
            if not current:
                raise HTTPException(404, "Product not found")

            columns = {
                "name": "name",
                "description": "description",
                "price": "price",
                "brand": "brand",
                "size": "size",
                "gender": "gender",
                "stock": "stock",
                "is_active": "is_active",
                "is_new": "is_new",
            }

            assignments = []
            params = []

            for field_name, column_name in columns.items():
                if field_name not in fields:
                    continue

                value = data.get(field_name)
                if field_name in {"is_active", "is_new"}:
                    value = _normalize_bool(value)
                if field_name == "name" and isinstance(value, str):
                    value = value.strip()

                assignments.append(f"{column_name} = %s")
                params.append(value)

            if "slug" in fields:
                requested_slug = payload.slug or payload.name or current["name"]
                slug = _unique_product_slug(cur, requested_slug, product_id)
                assignments.append("slug = %s")
                params.append(slug)

            if assignments:
                params.append(product_id)
                cur.execute(
                    f"UPDATE products SET {', '.join(assignments)} WHERE id = %s",
                    params,
                )

            if "categories" in fields:
                _replace_product_categories(cur, product_id, payload.categories or [])

            if "images" in fields:
                _replace_product_images(cur, product_id, payload.images or [])

            if "discount" in fields:
                _replace_product_discount(cur, product_id, payload.discount)

            product = _get_admin_product(cur, product_id)

        conn.commit()
        return product
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        logger.exception("Could not update product")
        raise HTTPException(500, f"Could not update product: {str(e)}")
    finally:
        conn.close()


@api_router.delete("/admin/products/{product_id}")
async def admin_disable_product(product_id: int, admin=Depends(require_admin)):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE products SET is_active = 0 WHERE id = %s",
                (product_id,),
            )
            if cur.rowcount == 0:
                raise HTTPException(404, "Product not found")

        return {"ok": True, "product_id": product_id, "is_active": False}
    finally:
        conn.close()


@api_router.get("/admin/categories")
async def admin_list_categories(admin=Depends(require_admin)):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id, name, slug FROM categories ORDER BY name")
            categories = cur.fetchall()

        return {"categories": categories}
    finally:
        conn.close()


@api_router.post("/admin/categories", status_code=201)
async def admin_create_category(
    payload: AdminCategoryCreate,
    admin=Depends(require_admin),
):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            slug = _slugify(payload.slug or payload.name)

            cur.execute(
                "SELECT id FROM categories WHERE slug = %s LIMIT 1",
                (slug,),
            )
            if cur.fetchone():
                raise HTTPException(400, "Category slug already exists")

            cur.execute(
                "INSERT INTO categories (name, slug) VALUES (%s, %s)",
                (payload.name.strip(), slug),
            )
            category_id = cur.lastrowid

            cur.execute(
                "SELECT id, name, slug FROM categories WHERE id = %s",
                (category_id,),
            )
            return cur.fetchone()
    finally:
        conn.close()


@api_router.post("/admin/products/{product_id}/images", status_code=201)
async def admin_upload_product_image(
    product_id: int,
    image: UploadFile = File(...),
    sort_order: int = 0,
    admin=Depends(require_admin),
):
    allowed_types = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
    }

    extension = allowed_types.get(image.content_type or "")
    if not extension:
        raise HTTPException(400, "Only JPG, PNG and WEBP files are allowed")

    content = await image.read()
    if not content:
        raise HTTPException(400, "Empty image file")
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(400, "Image cannot be larger than 10 MB")

    upload_dir = Path(
        os.environ.get(
            "PRODUCT_IMAGE_DIR",
            r"C:\www\uploads\products",
        )
    )
    url_prefix = os.environ.get(
        "PRODUCT_IMAGE_URL_PREFIX",
        "/uploads/products",
    ).rstrip("/")

    upload_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{product_id}-{uuid4().hex}{extension}"
    file_path = PRODUCT_IMAGE_DIR / filename
    image_path = f"{PRODUCT_IMAGE_URL_PREFIX}/{filename}"

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM products WHERE id = %s LIMIT 1", (product_id,))
            if not cur.fetchone():
                raise HTTPException(404, "Product not found")

            file_path.write_bytes(content)

            cur.execute(
                """
                INSERT INTO product_images (product_id, image_path, sort_order)
                VALUES (%s, %s, %s)
                """,
                (product_id, image_path, sort_order),
            )

        return {
            "product_id": product_id,
            "image_path": image_path,
            "sort_order": sort_order,
        }
    except Exception:
        if file_path.exists():
            file_path.unlink(missing_ok=True)
        raise
    finally:
        conn.close()


@api_router.delete("/admin/products/{product_id}/images")
async def admin_delete_product_image(
    product_id: int,
    payload: AdminImageDelete,
    admin=Depends(require_admin),
):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM product_images
                WHERE product_id = %s AND image_path = %s
                """,
                (product_id, payload.image_path),
            )
            if cur.rowcount == 0:
                raise HTTPException(404, "Image not found")

        upload_dir = Path(
            os.environ.get(
                "PRODUCT_IMAGE_DIR",
                r"C:\www\uploads\products",
            )
        )
        filename = Path(payload.image_path).name
        local_file = upload_dir / filename

        try:
            local_file.resolve().relative_to(upload_dir.resolve())
            local_file.unlink(missing_ok=True)
        except (ValueError, OSError):
            logger.warning("Could not delete image file: %s", local_file)

        return {"ok": True}
    finally:
        conn.close()


@api_router.post("/checkout/session")
async def create_checkout(payload: CheckoutReq, user=Depends(get_current_user)):
    if not STRIPE_SECRET_KEY:
        raise HTTPException(500, "Stripe not configured")
    if not payload.items:
        raise HTTPException(400, "Empty cart")

    user_id = user["id"] if user else None
    conn = get_db()
    try:
        total_grosze = 0
        line_items = []
        order_items = []

        with conn.cursor() as cur:
            for item in payload.items:
                cur.execute(
                    """
                    SELECT
                        p.id,
                        p.name,
                        p.slug,
                        p.price AS original_price,
                        CASE
                            WHEN pd.discount_percent IS NOT NULL
                            THEN ROUND(p.price * (1 - pd.discount_percent), 2)
                            ELSE p.price
                        END AS price,
                        pd.discount_percent,
                        p.brand,
                        p.size,
                        p.stock,
                        (
                            SELECT image_path
                            FROM product_images
                            WHERE product_id = p.id
                            ORDER BY sort_order ASC
                            LIMIT 1
                        ) AS product_image
                    FROM products p
                    LEFT JOIN product_discounts pd
                        ON pd.product_id = p.id
                       AND pd.is_active = 1
                       AND (pd.starts_at IS NULL OR pd.starts_at <= NOW())
                       AND (pd.ends_at IS NULL OR pd.ends_at >= NOW())
                    WHERE p.id = %s AND p.is_active = 1
                    LIMIT 1
                    """,
                    (item.product_id,),
                )

                product = cur.fetchone()
                if not product:
                    raise HTTPException(400, f"Product not found: {item.product_id}")

                quantity = max(1, int(item.quantity))
                if int(product["stock"]) < quantity:
                    raise HTTPException(400, f"Product is out of stock: {product['name']}")

                unit_price = float(product["price"])
                unit_price_grosze = int(round(unit_price * 100))
                item_total_grosze = unit_price_grosze * quantity
                total_grosze += item_total_grosze

                line_items.append({
                    "price_data": {
                        "currency": "pln",
                        "product_data": {"name": product["name"]},
                        "unit_amount": unit_price_grosze,
                    },
                    "quantity": quantity,
                })

                order_items.append({
                    "product_id": product["id"],
                    "product_name": product["name"],
                    "product_slug": product["slug"],
                    "product_image": product["product_image"],
                    "brand": product["brand"],
                    "size": product["size"],
                    "unit_price": unit_price,
                    "quantity": quantity,
                    "total_price": item_total_grosze / 100,
                })

            total = total_grosze / 100

            cur.execute(
                """
                INSERT INTO orders (order_number, user_id, total, currency, status)
                VALUES (NULL, %s, %s, 'PLN', 'pending_payment')
                """,
                (user_id, total),
            )
            order_id = cur.lastrowid
            order_number = f"ARCHIW-{order_id:06d}"

            cur.execute("UPDATE orders SET order_number = %s WHERE id = %s", (order_number, order_id))

            for item in order_items:
                cur.execute(
                    """
                    INSERT INTO order_items (
                        order_id, product_id, product_name, product_slug,
                        product_image, brand, size, unit_price, quantity, total_price
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        order_id,
                        item["product_id"],
                        item["product_name"],
                        item["product_slug"],
                        item["product_image"],
                        item["brand"],
                        item["size"],
                        item["unit_price"],
                        item["quantity"],
                        item["total_price"],
                    ),
                )

            cur.execute(
                """
                INSERT INTO payments (order_id, provider, amount, currency, status)
                VALUES (%s, 'stripe', %s, 'PLN', 'unpaid')
                """,
                (order_id, total),
            )
            payment_id = cur.lastrowid

            session_args = {
                "mode": "payment",
                "payment_method_types": ["card", "blik"],
                "line_items": line_items,

                "customer_creation": "always",
                "billing_address_collection": "required",
                "phone_number_collection": {
                    "enabled": True,
                },
                "shipping_address_collection": {
                    "allowed_countries": ["PL"],
                },

                "success_url": f"{payload.origin_url}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}",
                "cancel_url": f"{payload.origin_url}/cart",

                "metadata": {
                    "order_id": str(order_id),
                    "payment_id": str(payment_id),
                    "order_number": order_number,
                },
            }

        if user and user.get("email"):
            session_args["customer_email"] = user["email"]

        session = stripe.checkout.Session.create(**session_args)

        with conn.cursor() as cur:
            cur.execute("UPDATE payments SET provider_session_id = %s WHERE id = %s", (session.id, payment_id))

        return {
            "url": session.url,
            "session_id": session.id,
            "order_id": order_id,
            "order_number": order_number,
        }
    finally:
        conn.close()


@api_router.get("/checkout/status/{session_id}")
async def checkout_status(session_id: str):
    return _update_order_after_stripe_session(session_id)


@api_router.post("/webhooks/stripe")
async def stripe_webhook(request: Request):
    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(500, "Stripe webhook not configured")

    payload = await request.body()
    sig_header = request.headers.get("Stripe-Signature", "")

    try:
        event = stripe.Webhook.construct_event(payload=payload, sig_header=sig_header, secret=STRIPE_WEBHOOK_SECRET)
    except Exception as e:
        raise HTTPException(400, f"Webhook error: {str(e)}")

    if event["type"] in ["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.expired"]:
        session = event["data"]["object"]
        _update_order_after_stripe_session(session["id"])

    return {"ok": True}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "https://archiw.pl,http://localhost:3000").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
