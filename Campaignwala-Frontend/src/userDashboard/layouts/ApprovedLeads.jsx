import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import leadService from "../../services/leadService";
import api from "../../services/api";

const ApprovedLeads = ({ darkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Approved");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [leadsData, setLeadsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (location.pathname.includes("approved")) setActiveTab("Approved");
    else if (location.pathname.includes("rejected")) setActiveTab("Rejected");
    else if (location.pathname.includes("pending")) setActiveTab("Pending");
  }, [location.pathname]);

  useEffect(() => {
    fetchLeads();
    fetchCategories();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const response = await leadService.getAllLeads({
        hrUserId: user._id,
        status: "approved",
        limit: 100,
      });

      if (response.success) {
        setLeadsData(response.data.leads || []);
      }
    } catch (error) {
      console.error("Error fetching approved leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories", {
        params: { status: "active" },
      });
      if (response.data.success) {
        setCategories(response.data.data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleCategorySelect = (category) => {
    setCategoryFilter(category);
    setIsDropdownOpen(false);
  };

  const filteredLeads = leadsData.filter((lead) => {
    const matchesCategory =
      categoryFilter === "All" || lead.category === categoryFilter;
    const matchesSearch =
      (lead.customerName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (lead.offerName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (lead.customerContact || "").includes(searchQuery) ||
      (lead.leadId || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN");
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "Pending") navigate("/user/pending-leads");
    if (tab === "Approved") navigate("/user/approved-leads");
    if (tab === "Rejected") navigate("/user/rejected-leads");
  };

  return (
    <div
      className={`min-h-screen pt-4 transition-all duration-300 w-full ${
        darkMode ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white" : "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 text-gray-900"
      }`} // ✅ changed pt-20 → pt-4 and ensured w-full
    >
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 px-2 sm:px-4 lg:px-6 pb-8 w-full"> {/* ✅ removed max-w and centered spacing */}
        {/* Page Title */}
        <div className="mb-6">
          <h1
            className={`text-xl sm:text-3xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent`}
          >
            ✅ Approved Leads
          </h1>
          <p className={`text-sm mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Successfully approved leads with earned commissions
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-6 w-full">
          {/* Custom Category Dropdown */}
          <div className="w-full sm:w-1/3 relative" ref={dropdownRef}>
            {/* Dropdown Button */}
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex justify-between items-center w-full px-4 py-2 rounded-md border-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 ${
                darkMode
                  ? "bg-gray-800 border-green-500 text-gray-200 hover:border-green-400"
                  : "bg-white border-green-300 text-gray-800 hover:border-green-400"
              }`}
            >
              <span className="truncate">🏷️ {categoryFilter}</span>
              <svg
                className={`h-4 w-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""} ${
                  darkMode ? "text-green-400" : "text-green-500"
                }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                className={`absolute z-50 w-full mt-1 rounded-md shadow-lg border-2 max-h-60 overflow-y-auto ${
                  darkMode ? "bg-gray-800 border-green-500" : "bg-white border-green-300"
                }`}
                style={{
                  maxHeight: "40vh",
                  overflowY: "auto",
                }}
              >
                <button
                  onClick={() => handleCategorySelect("All")}
                  className={`block w-full text-left px-4 py-3 text-sm border-b transition-all ${
                    categoryFilter === "All"
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                      : darkMode
                      ? "text-gray-200 hover:bg-gray-700 border-gray-700"
                      : "text-gray-800 hover:bg-green-50 border-gray-200"
                  }`}
                >
                  📊 All Categories
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => handleCategorySelect(cat.name)}
                    className={`block w-full text-left px-4 py-3 text-sm border-b transition-all ${
                      categoryFilter === cat.name
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                        : darkMode
                        ? "text-gray-200 hover:bg-gray-700 border-gray-700"
                        : "text-gray-800 hover:bg-green-50 border-gray-200"
                    }`}
                    style={{
                      whiteSpace: "normal",
                      wordWrap: "break-word",
                    }}
                  >
                    🏷️ {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <input
            type="text"
            placeholder="🔍 Search by name, offer, or contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`px-4 py-2 rounded-md border-2 text-sm sm:text-base w-full sm:w-1/3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 ${
              darkMode
                ? "bg-gray-800 border-green-500 text-gray-200 placeholder-gray-400 focus:border-green-400"
                : "bg-white border-green-300 text-gray-800 placeholder-gray-500 focus:border-green-400"
            }`}
          />
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b pb-2">
          {["Pending", "Approved", "Rejected"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`px-4 sm:px-6 py-2 text-sm sm:text-base font-medium rounded-t-md transition-all duration-300 transform hover:scale-105 ${
                activeTab === tab
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                  : darkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                  : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-600"
              }`}
            >
              {tab === "Pending" && "⏳"}
              {tab === "Approved" && "✅"}
              {tab === "Rejected" && "❌"}
              {" "}{tab} Leads
            </button>
          ))}
        </div>

        {/* Table (Desktop/Tablet) */}
        <div
          className={`hidden sm:block rounded-2xl border-2 shadow-lg transition-all duration-300 hover:shadow-xl ${
            darkMode ? "border-green-500 bg-gradient-to-br from-gray-800 to-gray-700" : "border-green-300 bg-gradient-to-br from-white to-green-50"
          }`}
        >
          <div className={`p-4 border-b ${darkMode ? "border-gray-700" : "border-green-200"}`}>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse"></div>
              <h2
                className={`text-lg sm:text-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent`}
              >
                📈 Approved Leads Overview
              </h2>
            </div>
            <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Your successfully approved leads and earned commissions
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm sm:text-base">
              <thead
                className={`${
                  darkMode ? "bg-gradient-to-r from-gray-700 to-gray-600 text-gray-300" : "bg-gradient-to-r from-green-100 to-emerald-100 text-gray-700"
                }`}
              >
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">📋 Lead ID</th>
                  <th className="text-left px-4 py-3 font-semibold">👤 Name</th>
                  <th className="text-left px-4 py-3 font-semibold">🏷️ Category</th>
                  <th className="text-left px-4 py-3 font-semibold">🎯 Offer</th>
                  <th className="text-left px-4 py-3 whitespace-nowrap font-semibold">
                    📅 Created Date
                  </th>
                  <th className="text-left px-4 py-3 whitespace-nowrap font-semibold">
                    ✅ Approved Date
                  </th>
                  <th className="text-left px-4 py-3 font-semibold">💰 Commission</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      <div className="flex justify-center items-center gap-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                        Loading approved leads...
                      </div>
                    </td>
                  </tr>
                ) : filteredLeads.length > 0 ? (
                  filteredLeads.map((lead, index) => (
                    <tr
                      key={lead._id}
                      className={`border-t transition-all duration-200 hover:scale-[1.01] ${
                        darkMode
                          ? "border-gray-700 hover:bg-gray-700/50"
                          : "border-green-100 hover:bg-green-50"
                      } ${index % 2 === 0 ? (darkMode ? "bg-gray-800/50" : "bg-green-50/30") : ""}`}
                    >
                      <td className="py-3 px-4 font-medium text-green-600">{lead.leadId}</td>
                      <td className="py-3 px-4 font-semibold">{lead.customerName}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-full text-xs">
                          {lead.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">{lead.offerName}</td>
                      <td className="py-3 px-4 text-gray-500">{formatDate(lead.createdAt)}</td>
                      <td className="py-3 px-4 text-green-600 font-semibold">{formatDate(lead.updatedAt)}</td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full text-sm font-semibold border border-green-200">
                          ₹{lead.commission1 || 0}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-4xl">📭</div>
                        <p>No approved leads found.</p>
                        <p className="text-sm">All your approved leads will appear here.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden flex flex-col gap-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="flex justify-center items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                Loading approved leads...
              </div>
            </div>
          ) : filteredLeads.length > 0 ? (
            filteredLeads.map((lead) => (
              <div
                key={lead._id}
                className={`p-4 rounded-xl border-2 shadow-md transition-all duration-200 hover:shadow-lg ${
                  darkMode
                    ? "border-green-500 bg-gradient-to-br from-gray-800 to-gray-700 hover:border-green-400"
                    : "border-green-300 bg-gradient-to-br from-white to-green-50 hover:border-green-400"
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-lg">👤 {lead.customerName}</span>
                  <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full text-sm font-semibold border border-green-200">
                    ₹{lead.commission1 || 0}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <strong className="min-w-16">📋 ID:</strong>
                    <span className="text-green-600">{lead.leadId}</span>
                  </div>
                  <div className="flex items-center">
                    <strong className="min-w-16">🏷️ Category:</strong>
                    <span>{lead.category}</span>
                  </div>
                  <div className="flex items-center">
                    <strong className="min-w-16">🎯 Offer:</strong>
                    <span>{lead.offerName}</span>
                  </div>
                  <div className="flex items-center">
                    <strong className="min-w-16">📅 Created:</strong>
                    <span className="text-gray-500">{formatDate(lead.createdAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <strong className="min-w-16">✅ Approved:</strong>
                    <span className="text-green-600 font-semibold">{formatDate(lead.updatedAt)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              <div className="flex flex-col items-center gap-2">
                <div className="text-4xl">📭</div>
                <p>No approved leads found.</p>
                <p className="text-xs">Try adjusting your search or filters.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add custom styles for animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default ApprovedLeads;