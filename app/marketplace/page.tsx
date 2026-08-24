"use client";

import { useEffect, useState } from "react";

interface Product {
  product_id: number;
  farmer_id: number | null;
  product_name: string;
  category: string;
  description: string | null;
  price: string | number;
  unit: string;
  stock: string | number;
  image_url: string | null;
  status: string;
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // ==========================================
  // FETCH PRODUCTS
  // ==========================================

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/products"
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load products"
        );
      }

      setProducts(data.products);
    } catch (error) {
      console.error("❌ Marketplace Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ==========================================
  // ADD TO CART
  // ==========================================

  const addToCart = (product: Product) => {
    try {
      const existingCart = JSON.parse(
        localStorage.getItem("cart") || "[]"
      );

      const existingProduct = existingCart.find(
        (item: any) =>
          item.product_id === product.product_id
      );

      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        existingCart.push({
          product_id: product.product_id,
          farmer_id: product.farmer_id,
          product_name: product.product_name,
          price: Number(product.price),
          unit: product.unit,
          image_url: product.image_url,
          quantity: 1,
        });
      }

      localStorage.setItem(
        "cart",
        JSON.stringify(existingCart)
      );

      setMessage(
        `✅ ${product.product_name} added to cart!`
      );

      setTimeout(() => {
        setMessage("");
      }, 2500);
    } catch (error) {
      console.error("❌ Cart Error:", error);
    }
  };

  // ==========================================
  // FILTER PRODUCTS
  // ==========================================

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.product_name
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" ||
      product.category === category;

    return matchesSearch && matchesCategory;
  });

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="marketplace-page min-h-screen bg-gradient-to-b from-green-50 to-white">

      {/* ======================================
          NAVBAR
      ====================================== */}

      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          <a href="/" className="smartagri-brand">
            <span>🌱</span>
            <div>
              <strong>Smart<span>Agri</span></strong>
              <small>Fresh • Local • Direct</small>
            </div>
          </a>

          <div className="market-nav-links">
            <a href="/marketplace" className="active">Marketplace</a>
            <a href="/orders">Orders</a>
            <a href="/cart">🛒 Cart</a>
            <a href="/login">Login</a>
          </div>

        </div>
      </nav>

      {/* ======================================
          HERO
      ====================================== */}

      <section className="max-w-7xl mx-auto px-6 pt-12 pb-8">

        <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-3xl p-8 md:p-12 text-white shadow-lg">

          <p className="text-green-100 font-semibold mb-2">
            🌾 FARMER DIRECT MARKETPLACE
          </p>

          <h2 className="text-4xl md:text-5xl font-bold">
            Fresh Products,
            <br />
            Direct From Farmers
          </h2>

          <p className="mt-4 text-green-50 max-w-2xl text-lg">
            Buy fresh vegetables, fruits, grains and other
            farm products directly from local farmers.
          </p>

        </div>

      </section>

      {/* ======================================
          SEARCH + FILTER
      ====================================== */}

      <section className="max-w-7xl mx-auto px-6">

        <div className="bg-white rounded-2xl shadow-md p-5 mb-8">

          <div className="flex flex-col md:flex-row gap-4">

            {/* SEARCH */}

            <div className="flex-1">

              <input
                type="text"
                placeholder="🔍 Search products..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full border border-gray-300 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-green-500"
              />

            </div>

            {/* CATEGORY */}

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="md:w-56 border border-gray-300 rounded-xl px-5 py-3 bg-white outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="All">All Categories</option>
              <option value="Vegetables">
                Vegetables
              </option>
              <option value="Fruits">
                Fruits
              </option>
              <option value="Grains">
                Grains
              </option>
              <option value="Dairy">
                Dairy
              </option>
              <option value="Other">
                Other
              </option>
            </select>

          </div>

        </div>

        {/* ======================================
            SUCCESS MESSAGE
        ====================================== */}

        {message && (
          <div className="fixed top-24 right-6 z-50 bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg font-semibold">
            {message}
          </div>
        )}

        {/* ======================================
            TITLE
        ====================================== */}

        <div className="flex justify-between items-center mb-6">

          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              🥬 Fresh Products
            </h2>

            <p className="text-gray-500 mt-1">
              Choose fresh products directly from farmers.
            </p>
          </div>

          <span className="hidden md:block bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
            {filteredProducts.length} Products
          </span>

        </div>

        {/* ======================================
            LOADING
        ====================================== */}

        {loading ? (

          <div className="bg-white rounded-2xl shadow p-12 text-center">

            <div className="text-5xl mb-4">
              🌱
            </div>

            <p className="text-gray-600 font-semibold">
              Loading fresh products...
            </p>

          </div>

        ) : filteredProducts.length === 0 ? (

          /* ======================================
              NO PRODUCTS
          ====================================== */

          <div className="bg-white rounded-2xl shadow p-12 text-center">

            <div className="text-6xl mb-4">
              🥕
            </div>

            <h3 className="text-2xl font-bold text-gray-700">
              No products found
            </h3>

            <p className="text-gray-500 mt-2">
              Try another search or category.
            </p>

          </div>

        ) : (

          /* ======================================
              PRODUCT GRID
          ====================================== */

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">

            {filteredProducts.map((product) => (

              <div
                key={product.product_id}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition duration-300"
              >

                {/* IMAGE */}

                <div className="h-52 bg-gray-100 overflow-hidden">

                  {product.image_url ? (

                    <img
                      src={product.image_url}
                      alt={product.product_name}
                      className="w-full h-full object-cover hover:scale-105 transition duration-300"
                    />

                  ) : (

                    <div className="h-full flex items-center justify-center text-7xl">
                      🌱
                    </div>

                  )}

                </div>

                {/* DETAILS */}

                <div className="p-5">

                  <div className="flex justify-between items-start">

                    <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                      {product.category}
                    </span>

                    <span className="text-green-600 text-xs font-semibold">
                      ● Fresh
                    </span>

                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mt-3">
                    {product.product_name}
                  </h3>

                  <p className="text-gray-500 text-sm mt-2 min-h-[40px]">
                    {product.description ||
                      "Fresh farm product directly from farmer."}
                  </p>

                  {/* PRICE */}

                  <div className="flex justify-between items-end mt-5">

                    <div>

                      <span className="text-2xl font-bold text-green-700">
                        ₹{Number(product.price).toFixed(2)}
                      </span>

                      <span className="text-gray-500 text-sm ml-1">
                        / {product.unit}
                      </span>

                    </div>

                    <span className="text-xs text-gray-500">
                      Stock: {product.stock}
                    </span>

                  </div>

                  {/* ADD CART */}

                  <button
                    onClick={() =>
                      addToCart(product)
                    }
                    className="w-full mt-5 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition"
                  >
                    🛒 Add to Cart
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

    </main>
  );
}