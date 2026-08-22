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

export default function FarmerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const [formData, setFormData] = useState({
    product_name: "",
    category: "Vegetables",
    description: "",
    price: "",
    unit: "kg",
    stock: "",
    image_url: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [editingProductId, setEditingProductId] = useState<number | null>(
    null
  );

  // ==========================================
  // FETCH PRODUCTS
  // ==========================================

  const fetchProducts = async () => {
    try {
      setFetching(true);

      const response = await fetch(
        "http://localhost:5000/api/products"
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to fetch products"
        );
      }

      setProducts(data.products);
    } catch (err: any) {
      console.error("❌ Error fetching products:", err);

      setError(
        err.message || "Failed to load products."
      );
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
      HTMLInputElement |
        HTMLTextAreaElement |
        HTMLSelectElement
    >
  ) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  // ==========================================
  // ADD / UPDATE PRODUCT
  // ==========================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const isEditing = editingProductId !== null;

      let url =
        "http://localhost:5000/api/products";

      let method = "POST";

      if (isEditing) {
        url =
          "http://localhost:5000/api/products/" +
          editingProductId;

        method = "PUT";
      }

      const productData: {
        farmer_id?: number;
        product_name: string;
        category: string;
        description: string;
        price: number;
        unit: string;
        stock: number;
        image_url: string | null;
      } = {
        product_name: formData.product_name,
        category: formData.category,
        description: formData.description,
        price: Number(formData.price),
        unit: formData.unit,
        stock: Number(formData.stock),
        image_url: formData.image_url || null,
      };

      // Temporary farmer ID only for new products
      if (!isEditing) {
        productData.farmer_id = 1;
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            (isEditing
              ? "Failed to update product"
              : "Failed to add product")
        );
      }

      setMessage(
        isEditing
          ? "✅ Product updated successfully!"
          : "✅ Product added successfully!"
      );

      // Clear form
      setFormData({
        product_name: "",
        category: "Vegetables",
        description: "",
        price: "",
        unit: "kg",
        stock: "",
        image_url: "",
      });

      // Exit edit mode
      setEditingProductId(null);

      // Refresh products
      await fetchProducts();
    } catch (err: any) {
      console.error(
        "❌ Product operation error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong"
      );
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

    setFormData({
      product_name: "",
      category: "Vegetables",
      description: "",
      price: "",
      unit: "kg",
      stock: "",
      image_url: "",
    });

    setMessage("");
    setError("");
  };

  // ==========================================
  // DELETE PRODUCT
  // ==========================================

  const handleDelete = async (
    productId: number
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/products/" +
          productId,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to delete product"
        );
      }

      setMessage(
        "🗑️ Product deleted successfully!"
      );

      if (editingProductId === productId) {
        handleCancelEdit();
      }

      await fetchProducts();
    } catch (err: any) {
      console.error(
        "❌ Delete product error:",
        err
      );

      setError(
        err.message ||
          "Failed to delete product"
      );
    }
  };

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-6">

        {/* ======================================
            HEADER
        ====================================== */}

        <div className="mb-10">
          <p className="text-green-600 font-semibold">
            🌱 Farmer Dashboard
          </p>

          <h1 className="text-4xl font-bold text-gray-800 mt-2">
            My Products
          </h1>

          <p className="text-gray-500 mt-2">
            Add and manage your fresh farm products.
          </p>
        </div>

        {/* ======================================
            ADD / EDIT PRODUCT FORM
        ====================================== */}

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">

          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {editingProductId !== null
              ? "✏️ Edit Product"
              : "➕ Add New Product"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* PRODUCT NAME */}

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
                  <option value="kg">
                    Kilogram (kg)
                  </option>

                  <option value="gram">
                    Gram
                  </option>

                  <option value="piece">
                    Piece
                  </option>

                  <option value="dozen">
                    Dozen
                  </option>

                  <option value="liter">
                    Liter
                  </option>
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

            {/* IMAGE URL */}

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

            {/* SUCCESS MESSAGE */}

            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 font-medium">
                {message}
              </div>
            )}

            {/* ERROR MESSAGE */}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 font-medium">
                ❌ {error}
              </div>
            )}

            {/* BUTTONS */}

            <div className="flex flex-col md:flex-row gap-3">

              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl transition"
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
                  className="md:w-40 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 rounded-xl transition"
                >
                  Cancel
                </button>
              )}

            </div>

          </form>
        </div>

        {/* ======================================
            PRODUCTS LIST
        ====================================== */}

        <div>

          <div className="flex justify-between items-center mb-6">

            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                📦 Products
              </h2>

              <p className="text-gray-500">
                Products currently available in the system.
              </p>
            </div>

            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
              {products.length} Products
            </span>

          </div>

          {/* LOADING */}

          {fetching ? (
            <div className="bg-white rounded-2xl p-10 text-center">
              Loading products...
            </div>
          ) : products.length === 0 ? (

            /* NO PRODUCTS */

            <div className="bg-white rounded-2xl p-10 text-center shadow">

              <div className="text-5xl mb-4">
                🥕
              </div>

              <h3 className="text-xl font-bold text-gray-700">
                No products added yet
              </h3>

              <p className="text-gray-500 mt-2">
                Add your first farm product above.
              </p>

            </div>

          ) : (

            /* PRODUCTS */

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

              {products.map((product) => (

                <div
                  key={product.product_id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition"
                >

                  {/* IMAGE */}

                  <div className="h-48 bg-gray-100">

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

                  <div className="p-5">

                    <span className="text-sm text-green-600 font-semibold">
                      {product.category}
                    </span>

                    <h3 className="text-xl font-bold text-gray-800 mt-2">
                      {product.product_name}
                    </h3>

                    <p className="text-gray-500 text-sm mt-2">
                      {product.description ||
                        "Fresh farm product"}
                    </p>

                    <div className="flex justify-between items-center mt-4">

                      <div>

                        <span className="text-xl font-bold text-green-700">
                          ₹{Number(product.price).toFixed(2)}
                        </span>

                        <span className="text-gray-500 text-sm">
                          /{product.unit}
                        </span>

                      </div>

                      <span className="text-sm text-gray-500">
                        Stock: {product.stock}
                      </span>

                    </div>

                    {/* STATUS */}

                    <div className="mt-4">

                      {product.status === "available" ? (

                        <span className="text-green-600 font-semibold text-sm">
                          ● Available
                        </span>

                      ) : (

                        <span className="text-red-500 font-semibold text-sm">
                          ● Out of Stock
                        </span>

                      )}

                    </div>

                    {/* EDIT + DELETE */}

                    <div className="flex gap-3 mt-5">

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(product)
                        }
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-2.5 rounded-xl transition"
                      >
                        ✏️ Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            product.product_id
                          )
                        }
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2.5 rounded-xl transition"
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

