"use client";

export default function FarmerOrdersPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-6">

        <div className="mb-8">
          <p className="text-green-600 font-semibold">
            🌱 Farmer Dashboard
          </p>

          <h1 className="text-4xl font-bold text-gray-800 mt-2">
            Customer Orders
          </h1>

          <p className="text-gray-500 mt-2">
            View and manage orders placed by customers.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-10 text-center">
          <div className="text-6xl mb-4">
            🛒
          </div>

          <h2 className="text-2xl font-bold text-gray-700">
            No Orders Yet
          </h2>

          <p className="text-gray-500 mt-2">
            Customer orders will appear here.
          </p>
        </div>

      </div>
    </main>
  );
}