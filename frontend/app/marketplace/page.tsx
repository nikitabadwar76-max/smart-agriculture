"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { API_BASE_URL } from "../../lib/api";

interface Product {
  product_id: number;
  farmer_id: number;
  product_name: string;
  category: string;
  description?: string;
  price: string | number;
  unit: string;
  stock: string | number;
  image_url?: string;
  status?: string;
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartCount, setCartCount] = useState(0);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/products`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      console.log("Products API:", data);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load products"
        );
      }

      setProducts(Array.isArray(data.products) ? data.products : []);

    } catch (error) {
      console.error("Product fetch error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load products"
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);
  
  useEffect(() => {
  const savedCart = localStorage.getItem("cart");

  if (!savedCart) {
    setCartCount(0);
    return;
  }

  try {
    const cart = JSON.parse(savedCart);

    const count = cart.reduce(
      (total: number, item: any) =>
        total + Number(item.quantity || 0),
      0
    );

    setCartCount(count);
  } catch {
    setCartCount(0);
  }
}, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.product_name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        product.category
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" ||
        product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  return (
    <main className="min-h-screen bg-gray-50">

      {/* NAVBAR */}

      <nav className="bg-white border-b sticky top-0 z-50">

        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <Link
            href="/"
            className="text-2xl font-extrabold text-green-700"
          >
            🌱 SmartAgri
          </Link>

          <div className="flex items-center gap-6">

            <Link
              href="/"
              className="text-gray-600 hover:text-green-600 font-medium"
            >
              Home
            </Link>

            <Link
              href="/marketplace"
              className="text-green-700 font-bold"
            >
              Marketplace
            </Link>

            <Link
  href="/cart"
  className="relative ..."
>
  <span className="relative">
    🛒
    {cartCount > 0 && (
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
        {cartCount}
      </span>
    )}
  </span>
  <span>Cart</span>
</Link>

            <Link
  href="/profile"
  className="text-gray-600 hover:text-green-600 font-medium"
>
  Profile
</Link>

          

          </div>

        </div>

      </nav>


      {/* HERO */}

      <section className="bg-gradient-to-r from-green-700 to-emerald-600 text-white">

        <div className="max-w-7xl mx-auto px-6 py-16">

          <p className="uppercase tracking-widest text-green-100 font-semibold text-sm">
            Fresh • Local • Direct
          </p>

          <h1 className="text-4xl md:text-5xl font-extrabold mt-3">
            Fresh Products Marketplace 🌾
          </h1>

          <p className="text-green-50 text-lg mt-4 max-w-2xl">
            Shop fresh products directly from local farmers
            and support sustainable agriculture.
          </p>

        </div>

      </section>


      {/* MAIN */}

      <section className="max-w-7xl mx-auto px-6 py-10">

        {/* SEARCH */}

        <div className="bg-white rounded-2xl shadow-sm border p-5 mb-10">

          <div className="flex flex-col md:flex-row gap-4">

            <input
              type="text"
              placeholder="🔎 Search products..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="flex-1 border border-gray-300 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-green-500"
            />

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="md:w-56 border border-gray-300 rounded-xl px-5 py-3 bg-white outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="All">
                All Categories
              </option>

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


        {/* ERROR */}

        {error && (

          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 mb-8">

            <h3 className="font-bold text-lg">
              Unable to load products
            </h3>

            <p className="mt-1">
              {error}
            </p>

            <button
              onClick={fetchProducts}
              className="mt-4 bg-red-600 text-white px-5 py-2 rounded-lg font-semibold"
            >
              Try Again
            </button>

          </div>

        )}


        {/* TITLE */}

        <div className="flex justify-between items-center mb-6">

          <div>

            <h2 className="text-3xl font-bold text-gray-800">
              🌾 Fresh Products
            </h2>

            <p className="text-gray-500 mt-1">
              Choose fresh products directly from farmers.
            </p>

          </div>

          <span className="hidden md:block bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
            {filteredProducts.length} Products
          </span>

        </div>


        {/* LOADING */}

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

          /* PRODUCT GRID */

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
                      onError={(e) => {
                        e.currentTarget.style.display =
                          "none";
                      }}
                    />

                  ) : (

                    <div className="h-full flex items-center justify-center text-7xl">
                      🌱
                    </div>

                  )}

                </div>


                {/* DETAILS */}

                <div className="p-5">

                  <div className="flex justify-between items-start gap-2">

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
                    onClick={() => {
                      const existingCart =
                        JSON.parse(
                          localStorage.getItem("cart") || "[]"
                        );

                      const existingIndex =
                        existingCart.findIndex(
                          (item: Product) =>
                            item.product_id ===
                            product.product_id
                        );

                      if (existingIndex >= 0) {
                        existingCart[existingIndex].quantity =
                          (existingCart[existingIndex].quantity || 1) +
                          1;
                      } else {
                        existingCart.push({
                          ...product,
                          quantity: 1,
                        });
                      }

                      localStorage.setItem(
                        "cart",
                        JSON.stringify(existingCart)
                      );
                      const newCount = existingCart.reduce(
  (total: number, item: Product) =>
    total + Number(item.quantity || 0),
  0
);

setCartCount(newCount);

                      alert(
                        `${product.product_name} added to cart!`
                      );
                    }}
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