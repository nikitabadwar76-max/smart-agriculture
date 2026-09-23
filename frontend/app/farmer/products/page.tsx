"use client";

import Link from "next/link"; 
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../../lib/api";

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

const API_URL = `${API_BASE_URL}/api/products`;

const emptyForm = {
  product_name: "",
  category: "Vegetables",
  description: "",
  price: "",
  unit: "kg",
  stock: "",
  image_url: "",
};

export default function FarmerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState(emptyForm);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  // ==========================================
  // FETCH PRODUCTS
  // ==========================================

  const fetchProducts = async () => {
    setFetching(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Backend returned status ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch products");
      }

      if (!Array.isArray(data.products)) {
        throw new Error("Invalid products data received from backend");
      }

      setProducts(data.products);
    } catch (err) {
      console.error("❌ Error fetching products:", err);

      if (err instanceof TypeError) {
        setError(
          "Cannot connect to backend. Check the configured API server."
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load products.");
      }

      setProducts([]);
    } finally {
      setFetching(false);
    }
  };

  // ==========================================
  // LOAD PRODUCTS
  // ==========================================

  useEffect(() => {
    fetchProducts();
  }, []);

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // ADD / UPDATE PRODUCT
  // ==========================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const isEditing = editingProductId !== null;

      const url = isEditing ? `${API_URL}/${editingProductId}` : API_URL;

      const method = isEditing ? "PUT" : "POST";

      const farmerId = localStorage.getItem("farmer_id") || "1";

      const productData = {
        farmer_id: Number(farmerId),
        product_name: formData.product_name.trim(),
        category: formData.category,
        description: formData.description.trim(),
        price: Number(formData.price),
        unit: formData.unit,
        stock: Number(formData.stock),
        image_url: formData.image_url.trim() || null,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            (isEditing ? "Failed to update product" : "Failed to add product")
        );
      }

      setMessage(
        isEditing
          ? "✅ Product updated successfully!"
          : "✅ Product added successfully!"
      );

      setFormData(emptyForm);
      setEditingProductId(null);

      await fetchProducts();
    } catch (err) {
      console.error("❌ Product operation error:", err);

      if (err instanceof TypeError) {
        setError(
          "Cannot connect to backend. Make sure the backend is running."
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // EDIT PRODUCT
  // ==========================================

  const handleEdit = (product: Product) => {
    setEditingProductId(product.product_id);

    setFormData({
      product_name: product.product_name,
      category: product.category,
      description: product.description || "",
      price: String(product.price),
      unit: product.unit,
      stock: String(product.stock),
      image_url: product.image_url || "",
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // CANCEL EDIT
  // ==========================================

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setFormData(emptyForm);
    setMessage("");
    setError("");
  };

  // ==========================================
  // DELETE PRODUCT
  // ==========================================

  const handleDelete = async (productId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API_URL}/${productId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete product");
      }

      setMessage("🗑️ Product deleted successfully!");

      if (editingProductId === productId) {
        handleCancelEdit();
      }

      await fetchProducts();
    } catch (err) {
      console.error("❌ Delete product error:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to delete product.");
      }
    }
  };

  // ==========================================
  // PAGE RENDER
  // ==========================================

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-10">
      <div className="max-w-7xl mx-auto px-6">

        {/* TOP NAVIGATION BAR */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm mb-8 border border-gray-100">
          <div className="flex gap-4">
            <Link
              href="/farmer/products"
              className="font-bold text-green-700 bg-green-50 px-4 py-2 rounded-xl"
            >
              🌱 Manage Products
            </Link>
            <Link
              href="/farmer/orders"
              className="font-semibold text-gray-600 hover:text-green-700 px-4 py-2"
            >
              📦 Customer Orders
            </Link>
          </div>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="text-red-600 text-sm font-semibold hover:underline cursor-pointer"
          >
            Logout
          </button>
        </div>

        {/* HEADER */}
        <div className="mb-10">
          <p className="text-green-600 font-bold">🌱 FARMER DASHBOARD</p>

          <h1 className="text-4xl font-extrabold text-gray-800 mt-2">
            My Products
          </h1>

          <p className="text-gray-500 mt-2">
            Add, edit and manage your farm products.
          </p>
        </div>

        {/* FORM */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-12">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-2xl">
              {editingProductId !== null ? "✏️" : "🌱"}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {editingProductId !== null
                  ? "Edit Product"
                  : "Add New Product"}
              </h2>

              <p className="text-gray-500 text-sm">
                Enter your product information below.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* NAME */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Name
              </label>

              <input
                type="text"
                name="product_name"
                value={formData.product_name}
                onChange={handleChange}
                placeholder="Example: Fresh Tomato"
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* CATEGORY + UNIT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Grains">Grains</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Unit
                </label>

                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="gram">Gram</option>
                  <option value="piece">Piece</option>
                  <option value="dozen">Dozen</option>
                  <option value="liter">Liter</option>
                </select>
              </div>
            </div>

            {/* PRICE + STOCK */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price (₹)
                </label>

                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Example: 50"
                  min="0"
                  step="0.01"
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Available Stock
                </label>

                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="Example: 100"
                  min="0"
                  step="0.01"
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your fresh farm product..."
                rows={4}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>

            {/* IMAGE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Image URL
              </label>

              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/product.jpg"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* MESSAGES */}
            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 font-semibold">
                {message}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 font-semibold">
                ❌ {error}
              </div>
            )}

            {/* BUTTONS */}
            <div className="flex flex-col md:flex-row gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl transition cursor-pointer"
              >
                {loading
                  ? editingProductId !== null
                    ? "Updating Product..."
                    : "Adding Product..."
                  : editingProductId !== null
                  ? "💾 Update Product"
                  : "🌱 Add Product to Marketplace"}
              </button>

              {editingProductId !== null && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="md:w-40 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* PRODUCTS LIST */}
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                📦 My Products
              </h2>

              <p className="text-gray-500">
                Products currently available in your marketplace.
              </p>
            </div>

            <span className="bg-green-100 text-green-700 px-5 py-2 rounded-full font-bold">
              {products.length} Products
            </span>
          </div>

          {/* ERROR */}
          {error && products.length === 0 && !fetching && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
              <p className="text-red-700 font-semibold">❌ {error}</p>

              <button
                type="button"
                onClick={fetchProducts}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold cursor-pointer"
              >
                🔄 Try Again
              </button>
            </div>
          )}

          {/* LOADING */}
          {fetching ? (
            <div className="bg-white rounded-2xl shadow p-10 text-center">
              <div className="text-4xl mb-3">🌱</div>
              <p className="text-gray-600 font-semibold">
                Loading your products...
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow">
              <div className="text-6xl mb-4">🥕</div>

              <h3 className="text-xl font-bold text-gray-700">
                No products found
              </h3>

              <p className="text-gray-500 mt-2">
                Add your first farm product above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.product_id}
                  className="bg-white rounded-3xl shadow-md overflow-hidden hover:shadow-xl transition duration-300"
                >
                  {/* IMAGE */}
                  <div className="h-52 bg-gray-100">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-6xl">
                        🌱
                      </div>
                    )}
                  </div>

                  {/* DETAILS */}
                  <div className="p-6">
                    <span className="inline-block bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                      {product.category}
                    </span>

                    <h3 className="text-xl font-extrabold text-gray-800 mt-3">
                      {product.product_name}
                    </h3>

                    <p className="text-gray-500 text-sm mt-2 min-h-[40px]">
                      {product.description || "Fresh farm product"}
                    </p>

                    <div className="flex justify-between items-end mt-5">
                      <div>
                        <div className="text-2xl font-extrabold text-green-700">
                          ₹{Number(product.price).toFixed(2)}
                        </div>

                        <div className="text-gray-500 text-sm">
                          per {product.unit}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-gray-400">Stock</div>

                        <div className="font-bold text-gray-700">
                          {product.stock} {product.unit}
                        </div>
                      </div>
                    </div>

                    {/* STATUS */}
                    <div className="mt-4">
                      {product.status === "available" ? (
                        <span className="text-green-600 font-bold text-sm">
                          ● Available
                        </span>
                      ) : (
                        <span className="text-red-500 font-bold text-sm">
                          ● Out of Stock
                        </span>
                      )}
                    </div>

                    {/* BUTTONS */}
                    <div className="flex gap-3 mt-5">
                      <button
                        type="button"
                        onClick={() => handleEdit(product)}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-3 rounded-xl transition cursor-pointer"
                      >
                        ✏️ Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(product.product_id)}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl transition cursor-pointer"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}