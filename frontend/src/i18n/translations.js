export const translations = {
  pl: {
    nav: {
      new: "Nowości",
      sale: "Promocje",
      instagram: "Instagram",
      adminPanel: "Panel admina",
      search: "Szukaj...",
      account: "Konto",
      login: "Zaloguj",
      register: "Rejestracja",
      myAccount: "Moje konto",
      logout: "Wyloguj",
      cart: "Koszyk",
    },

    filter: {
      title: "Filtry",
      price: "Cena",
      categories: "Kategorie",
      size: "Rozmiar",
      gender: "Płeć",

      genderAll: "Wszystko",
      genderMen: "Męskie",
      genderWomen: "Damskie",
      genderUnisex: "Unisex",

      clear: "Wyczyść filtry",

      from: "Od",
      to: "Do",
      minPrice: "Cena minimalna",
      maxPrice: "Cena maksymalna",
      invalidPriceRange:
        "Cena minimalna nie może być większa od ceny maksymalnej.",
    },

    sort: {
      label: "Sortowanie",
      newest: "Najnowsze",
      oldest: "Najstarsze",
      priceAscending: "Cena: od najniższej",
      priceDescending: "Cena: od najwyższej",
    },

    home: {
      heroEyebrow: "Archiwum Mody",
      heroTitle: "Vintage & Designer",
      shopNow: "Odkryj kolekcję",
      newArrivals: "Nowości",
      onSale: "Promocje",
      allProducts: "Wszystkie produkty",
      productsCount: "{count} produktów",
    },

    empty: {
      title: "Archiwum jest puste",
      subtitle:
        "Nie znaleźliśmy produktów dla wybranych filtrów. Spróbuj zmienić kryteria wyszukiwania.",
      cta: "Wyczyść filtry",
    },

    product: {
      designer: "Projektant",
      size: "Rozmiar",
      category: "Kategoria",
      addToCart: "Dodaj do koszyka",
      addedToCart: "Dodano do koszyka",
      new: "Nowość",
      sale: "Promocja",
      outOfStock: "Wyprzedane",
    },

    cart: {
      title: "Koszyk",
      empty: "Twój koszyk jest pusty",
      continueShopping: "Kontynuuj zakupy",
      subtotal: "Suma",
      total: "Razem",
      checkout: "Przejdź do płatności",
      quantity: "Ilość",
      remove: "Usuń",
    },

    auth: {
      loginTitle: "Zaloguj się",
      registerTitle: "Rejestracja",
      email: "E-mail",
      password: "Hasło",
      name: "Imię",
      submit: "Zaloguj",
      submitRegister: "Zarejestruj",
      withGoogle: "Kontynuuj z Google",
      noAccount: "Nie masz konta?",
      haveAccount: "Masz już konto?",
      or: "lub",
    },

    checkout: {
      processing: "Przetwarzanie płatności...",
      success: "Płatność zakończona sukcesem",
      pending: "Płatność oczekuje",
      failed: "Płatność nie powiodła się",
      thankYou: "Dziękujemy za zakupy w ARCHIW",
      orderConfirmed: "Twoje zamówienie zostało potwierdzone.",
      backHome: "Wróć do strony głównej",
    },

    footer: {
      terms: "Regulamin",
      returns: "Zwroty",
      privacy: "Polityka prywatności",
      copy: "© ARCHIW 2026",
      tagline: "Vintage & Designer",
    },

    admin: {
      title: "Panel Administratora",

      sidebar: {
        navigation: "Nawigacja panelu administratora",
        products: "Produkty",
        addProduct: "Dodaj produkt",
        categories: "Kategorie",
        orders: "Zamówienia",
        users: "Użytkownicy",
      },
    
      stats: {
        products: "Produkty",
        active: "aktywne",
        summary: "{all} produktów, {active} aktywnych",
      },
    
      actions: {
        refresh: "Odśwież",
        add: "Dodaj",
        addProduct: "Dodaj produkt",
        saveChanges: "Zapisz zmiany",
        saving: "Zapisywanie...",
        edit: "Edytuj",
        cancelEdit: "Anuluj edycję",
        backToProducts: "Wróć do produktów",
        disable: "Wyłącz",
        deleteImage: "Usuń zdjęcie",
      },

      form: {
        newProduct: "Nowy produkt",
        productNumber: "Produkt #{id}",
        editProduct: "Edytuj produkt",
        addProduct: "Dodaj produkt",
        requiredFields: "Pola oznaczone gwiazdką są wymagane.",

        sections: {
          productData: "Dane produktu",
          categoriesVisibility: "Kategorie i widoczność",
          discount: "Promocja",
          images: "Zdjęcia",
        },

        fields: {
          name: "Nazwa",
          price: "Cena w PLN",
          brand: "Marka",
          size: "Rozmiar",
          gender: "Płeć",
          stock: "Stan magazynowy",
          description: "Opis",
          categories: "Kategorie",
          discountPercent: "Rabat w %",
          discountStart: "Początek",
          discountEnd: "Koniec",
          categoryName: "Nazwa kategorii",
        },

        placeholders: {
          name: "Np. Vintage Levi's 501",
          price: "0.00",
          brand: "Np. Levi's",
          size: "Np. M, 32/32",
          categoryName: "Nazwa kategorii",
        },

        gender: {
          unisex: "Unisex",
          men: "Męskie",
          women: "Damskie",
        },

        visibility: {
          activeTitle: "Produkt aktywny",
          activeDescription: "Widoczny w sklepie",
          newTitle: "Nowość",
          newDescription: "Oznaczenie nowego produktu",
        },

        discount: {
          enable: "Włącz promocję dla tego produktu",
        },

        images: {
          description:
            "Pierwsze zdjęcie będzie głównym zdjęciem produktu.",
          choose: "Wybierz zdjęcia produktu",
          supportedFormats:
            "JPG, PNG, WEBP, BMP, GIF lub TIFF, maksymalnie 10 MB",
          selectedFiles: "Wybrane pliki: {count}",
        },
      },

      categories: {
        empty: "Brak kategorii w bazie.",
        addTitle: "Dodaj kategorię",
        addDescription:
          "Nowa kategoria pojawi się w formularzu produktu.",
        listTitle: "Lista kategorii",
        loading: "Pobieranie kategorii...",
        count: "Liczba kategorii: {count}",
      },

      products: {
        title: "Produkty",
        editHint:
          "Kliknij „Edytuj”, aby wczytać dane do formularza.",
        loading: "Pobieranie produktów...",
        empty: "Nie ma jeszcze żadnych produktów.",
        noImage: "Brak zdjęcia",
        noBrand: "Bez marki",
        noSize: "Brak rozmiaru",
        stock: "stan",
        active: "Aktywny",
        disabled: "Wyłączony",
        new: "Nowość",
      },

      confirm: {
        disableProduct: "Wyłączyć produkt „{name}”?",
        deleteImage: "Usunąć to zdjęcie?",
      },

      success: {
        productUpdated: "Produkt został zaktualizowany.",
        productCreated: "Produkt został dodany.",
        productDisabled: "Produkt został wyłączony.",
        imageDeleted: "Zdjęcie zostało usunięte.",
        categoryCreated: "Kategoria została dodana.",
      },

      error: {
        panelLoad: "Nie udało się pobrać panelu administratora",
        invalidProduct: "Podaj prawidłową nazwę i cenę produktu",
        invalidDiscount:
          "Rabat musi być większy od 0 i mniejszy od 100%",
        productSave: "Nie udało się zapisać produktu",
        productDisable: "Nie udało się wyłączyć produktu",
        imageDelete: "Nie udało się usunąć zdjęcia",
        categoryCreate: "Nie udało się dodać kategorii",
        categoriesLoad: "Nie udało się pobrać kategorii",
      },
    },
  },

  en: {
    nav: {
      new: "New",
      sale: "Sale",
      instagram: "Instagram",
      adminPanel: "Admin panel",
      search: "Search...",
      account: "Account",
      login: "Log in",
      register: "Sign up",
      myAccount: "My account",
      logout: "Log out",
      cart: "Cart",
    },

    filter: {
      title: "Filters",
      price: "Price",
      categories: "Categories",
      size: "Size",
      gender: "Gender",

      genderAll: "All",
      genderMen: "Men",
      genderWomen: "Women",
      genderUnisex: "Unisex",

      clear: "Clear filters",

      from: "From",
      to: "To",
      minPrice: "Minimum price",
      maxPrice: "Maximum price",
      invalidPriceRange:
        "The minimum price cannot be greater than the maximum price.",
    },

    sort: {
      label: "Sort by",
      newest: "Newest",
      oldest: "Oldest",
      priceAscending: "Price: low to high",
      priceDescending: "Price: high to low",
    },

    home: {
      heroEyebrow: "Fashion Archive",
      heroTitle: "Vintage & Designer",
      shopNow: "Discover the collection",
      newArrivals: "New arrivals",
      onSale: "On sale",
      allProducts: "All products",
      productsCount: "{count} products",
    },

    empty: {
      title: "The archive is empty",
      subtitle:
        "No products match your filters. Try adjusting the criteria.",
      cta: "Clear filters",
    },

    product: {
      designer: "Designer",
      size: "Size",
      category: "Category",
      addToCart: "Add to cart",
      addedToCart: "Added to cart",
      new: "New",
      sale: "Sale",
      outOfStock: "Sold out",
    },

    cart: {
      title: "Cart",
      empty: "Your cart is empty",
      continueShopping: "Continue shopping",
      subtotal: "Subtotal",
      total: "Total",
      checkout: "Checkout",
      quantity: "Qty",
      remove: "Remove",
    },

    auth: {
      loginTitle: "Log in",
      registerTitle: "Sign up",
      email: "Email",
      password: "Password",
      name: "Name",
      submit: "Log in",
      submitRegister: "Sign up",
      withGoogle: "Continue with Google",
      noAccount: "No account?",
      haveAccount: "Already have an account?",
      or: "or",
    },

    checkout: {
      processing: "Processing payment...",
      success: "Payment successful",
      pending: "Payment pending",
      failed: "Payment failed",
      thankYou: "Thank you for shopping at ARCHIW",
      orderConfirmed: "Your order has been confirmed.",
      backHome: "Back to home",
    },

    footer: {
      terms: "Terms of Service",
      returns: "Returns",
      privacy: "Privacy",
      copy: "© ARCHIW 2026",
      tagline: "Vintage & Designer",
    },

    admin: {
      title: "Admin Panel",

      sidebar: {
        navigation: "Admin panel navigation",
        products: "Products",
        addProduct: "Add product",
        categories: "Categories",
        orders: "Orders",
        users: "Users",
      },
    
      stats: {
        products: "Products",
        active: "active",
        summary: "{all} products, {active} active",
      },
    
      actions: {
        refresh: "Refresh",
        add: "Add",
        addProduct: "Add product",
        saveChanges: "Save changes",
        saving: "Saving...",
        edit: "Edit",
        cancelEdit: "Cancel editing",
        backToProducts: "Back to products",
        disable: "Disable",
        deleteImage: "Delete image",
      },

      form: {
        newProduct: "New product",
        productNumber: "Product #{id}",
        editProduct: "Edit product",
        addProduct: "Add product",
        requiredFields:
          "Fields marked with an asterisk are required.",

        sections: {
          productData: "Product details",
          categoriesVisibility: "Categories and visibility",
          discount: "Discount",
          images: "Images",
        },

        fields: {
          name: "Name",
          price: "Price in PLN",
          brand: "Brand",
          size: "Size",
          gender: "Gender",
          stock: "Stock",
          description: "Description",
          categories: "Categories",
          discountPercent: "Discount in %",
          discountStart: "Start",
          discountEnd: "End",
          categoryName: "Category name",
        },

        placeholders: {
          name: "E.g. Vintage Levi's 501",
          price: "0.00",
          brand: "E.g. Levi's",
          size: "E.g. M, 32/32",
          categoryName: "Category name",
        },

        gender: {
          unisex: "Unisex",
          men: "Men",
          women: "Women",
        },

        visibility: {
          activeTitle: "Active product",
          activeDescription: "Visible in the store",
          newTitle: "New",
          newDescription: "Marks the product as new",
        },

        discount: {
          enable: "Enable a discount for this product",
        },

        images: {
          description:
            "The first image will be the main product image.",
          choose: "Choose product images",
          supportedFormats:
            "JPG, PNG, WEBP, BMP, GIF or TIFF, maximum 10 MB",
          selectedFiles: "Selected files: {count}",
        },
      },

      categories: {
          empty: "No categories in the database.",
          addTitle: "Add category",
          addDescription:
            "The new category will appear in the product form.",
          listTitle: "Category list",
          loading: "Loading categories...",
          count: "Categories: {count}",
        },

      products: {
        title: "Products",
        editHint:
          "Click “Edit” to load the data into the form.",
        loading: "Loading products...",
        empty: "There are no products yet.",
        noImage: "No image",
        noBrand: "No brand",
        noSize: "No size",
        stock: "stock",
        active: "Active",
        disabled: "Disabled",
        new: "New",
      },

      confirm: {
        disableProduct: "Disable product “{name}”?",
        deleteImage: "Delete this image?",
      },

      success: {
        productUpdated: "The product has been updated.",
        productCreated: "The product has been added.",
        productDisabled: "The product has been disabled.",
        imageDeleted: "The image has been deleted.",
        categoryCreated: "The category has been added.",
      },

      error: {
        panelLoad: "Failed to load the admin panel",
        invalidProduct:
          "Enter a valid product name and price",
        invalidDiscount:
          "The discount must be greater than 0 and less than 100%",
        productSave: "Failed to save the product",
        productDisable: "Failed to disable the product",
        imageDelete: "Failed to delete the image",
        categoryCreate: "Failed to add the category",
        categoriesLoad: "Failed to load categories",
      },
    },
  },
};