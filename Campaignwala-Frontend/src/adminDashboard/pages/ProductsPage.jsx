import { useState } from "react";
import { useTheme } from "../../context-api/ThemeContext";
import { Package, Search, Plus } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import { useNavigate } from "react-router-dom";

export default function OffersPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userPhone = localStorage.getItem("userPhone");

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userPhone");
    navigate("/");
  };

  const Offers = [
    { id: 1, name: "Product A", category: "Electronics", price: "₹25,000", stock: 45, status: "In Stock" },
    { id: 2, name: "Product B", category: "Fashion", price: "₹1,500", stock: 120, status: "In Stock" },
    { id: 3, name: "Product C", category: "Home", price: "₹8,000", stock: 0, status: "Out of Stock" },
    { id: 4, name: "Product D", category: "Electronics", price: "₹45,000", stock: 15, status: "Low Stock" },
  ];

  return (
    <div className={`min-h-screen ${theme === "dark" ? "dark" : ""}`}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <AdminSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          userPhone={userPhone}
          handleLogout={handleLogout}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader setSidebarOpen={setSidebarOpen} />

          <main className="flex-1 overflow-y-auto p-6 bg-gray-100 dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Offers</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your product inventory</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#570df8] text-white rounded-lg hover:opacity-90 transition">
                <Plus size={20} />
                <span>Add Product</span>
              </button>
            </div>

            {/* Offers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Offers.map((product) => (
                <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                      <Package className="text-white" size={24} />
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      product.status === "In Stock" 
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                        : product.status === "Low Stock"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}>
                      {product.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{product.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-[#570df8]">{product.price}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Stock: {product.stock}</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm">
                      Edit
                    </button>
                    <button className="flex-1 px-3 py-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition text-sm">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
