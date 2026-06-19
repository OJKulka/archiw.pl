import axios from "axios";

const API = "/api";

const api = axios.create({
  baseURL: API,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("archiw_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getApiError = (error, fallback = "Wystąpił błąd") => {
  const detail = error?.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.msg)
      .filter(Boolean)
      .join(", ");
  }

  return detail || error?.message || fallback;
};

export const fetchProducts = async (params = {}) => {
  try {
    const cleanParams = { ...params };

    if (Array.isArray(cleanParams.categories)) {
      cleanParams.category = cleanParams.categories[0] || undefined;
      delete cleanParams.categories;
    }

    if (Array.isArray(cleanParams.sizes)) {
      cleanParams.size = cleanParams.sizes[0] || undefined;
      delete cleanParams.sizes;
    }

    if (Array.isArray(cleanParams.price)) {
      cleanParams.price_min = cleanParams.price[0];
      cleanParams.price_max = cleanParams.price[1];
      delete cleanParams.price;
    }

    Object.keys(cleanParams).forEach((key) => {
      if (
        cleanParams[key] === undefined ||
        cleanParams[key] === null ||
        cleanParams[key] === "" ||
        cleanParams[key] === "all"
      ) {
        delete cleanParams[key];
      }
    });

    const { data } = await api.get("/products", { params: cleanParams });
    return data;
  } catch (e) {
    console.error("fetchProducts failed", e);
    return { products: [], count: 0, error: e?.message };
  }
};

export const fetchProduct = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

export const fetchFilters = async () => {
  try {
    const { data } = await api.get("/products/filters");
    return data;
  } catch {
    return { categories: [], sizes: [], genders: [], price_min: 0, price_max: 1000 };
  }
};

export const createCheckout = async (items, originUrl) => {
  const { data } = await api.post("/checkout/session", {
    items,
    origin_url: originUrl,
  });

  return data;
};

export const getCheckoutStatus = async (sessionId) => {
  const { data } = await api.get(`/checkout/status/${sessionId}`);
  return data;
};

export const login = async (email, password) => {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
};

export const register = async (name, email, password) => {
  const { data } = await api.post("/auth/register", { name, email, password });
  return data;
};

export const me = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

export const logout = async () => {
  const { data } = await api.post("/auth/logout");
  return data;
};

// Panel administratora
export const fetchAdminProducts = async () => {
  const { data } = await api.get("/admin/products");
  return data;
};

export const fetchAdminProduct = async (productId) => {
  const { data } = await api.get(`/admin/products/${productId}`);
  return data;
};

export const createAdminProduct = async (payload) => {
  const { data } = await api.post("/admin/products", payload);
  return data;
};

export const updateAdminProduct = async (productId, payload) => {
  const { data } = await api.patch(`/admin/products/${productId}`, payload);
  return data;
};

export const disableAdminProduct = async (productId) => {
  const { data } = await api.delete(`/admin/products/${productId}`);
  return data;
};

export const fetchAdminCategories = async () => {
  const { data } = await api.get("/admin/categories");
  return data;
};

export const createAdminCategory = async (name, slug = null) => {
  const { data } = await api.post("/admin/categories", {
    name,
    slug: slug || null,
  });
  return data;
};

export const uploadAdminProductImage = async (productId, image, sortOrder = 0) => {
  const formData = new FormData();
  formData.append("image", image);

  const { data } = await api.post(`/admin/products/${productId}/images`, formData, {
    params: { sort_order: sortOrder },
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
};

export const deleteAdminProductImage = async (productId, imagePath) => {
  const { data } = await api.delete(`/admin/products/${productId}/images`, {
    data: { image_path: imagePath },
  });
  return data;
};

export default api;
