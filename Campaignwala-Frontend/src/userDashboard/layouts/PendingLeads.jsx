import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import leadService from "../../services/leadService";
import api from "../../services/api";

const PendingLeads = ({ darkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("");
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

  // Detect active tab from URL
  useEffect(() => {
    if (location.pathname.includes("approved")) setActiveTab("Approved");
    else if (location.pathname.includes("rejected")) setActiveTab("Rejected");
    else if (location.pathname.includes("pending")) setActiveTab("Pending");
    else setActiveTab("");
  }, [location.pathname]);

  useEffect(() => {
    fetchLeads();
    fetchCategories();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await leadService.getAllLeads({
        hrUserId: user._id,
        status: 'pending',
        limit: 100
      });
      
      if (response.success) {
        setLeadsData(response.data.leads || []);
      }
    } catch (error) {
      console.error('Error fetching pending leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories', {
        params: { status: 'active' }
      });
      if (response.data.success) {
        setCategories(response.data.data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "Pending") navigate("/user/pending-leads");
    if (tab === "Approved") navigate("/user/approved-leads");
    if (tab === "Rejected") navigate("/user/rejected-leads");
  };

  const handleCategorySelect = (category) => {
    setCategoryFilter(category);
    setIsDropdownOpen(false);
  };

  // 🔍 Filter logic
  const filteredLeads = leadsData.filter((lead) => {
    const matchesCategory =
      categoryFilter === "All" || lead.category === categoryFilter;
    const matchesSearch =
      (lead.customerName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (lead.offerName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (lead.customerContact || '').includes(searchQuery) ||
      (lead.leadId || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        darkMode ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white" : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900"
      }`}
      style={{
        margin: 0,
        padding: 0,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "flex-start",
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* ✅ Changed padding here */}
      <div className="relative z-10 w-full p-4 sm:px-5 lg:px-6 pb-6 sm:pb-8">
        {/* Page Title */}
        <div className="mb-4 sm:mb-6">
          <h1
            className={`text-xl sm:text-2xl md:text-3xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}
          >
            ⏳ Pending Leads
          </h1>
          <p className={`text-sm mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Leads awaiting admin review and approval
          </p>
        </div>

        {/* 🔽 Filter Section - Custom Dropdown */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-4 sm:mb-6">
          {/* Custom Category Dropdown */}
          <div className="w-full sm:w-1/3 relative" ref={dropdownRef}>
            <button
  type="button"
  role="combobox"
  aria-expanded={isDropdownOpen}
  aria-controls="category-options"
  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
  className={`flex justify-between items-center w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-md border-2 text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
    darkMode
      ? "bg-gray-800 border-purple-500 text-gray-200 hover:border-purple-400"
      : "bg-white border-blue-300 text-gray-800 hover:border-blue-400"
  }`}
>
              <span className="truncate">🏷️ {categoryFilter}</span>
              <svg
                className={`h-4 w-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""} ${
                  darkMode ? "text-purple-400" : "text-blue-500"
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

            {isDropdownOpen && (
              <div
              id="category-options"
                className={`absolute z-50 w-full mt-1 rounded-md shadow-lg border-2 max-h-60 overflow-y-auto ${
                  darkMode
                    ? "bg-gray-800 border-purple-500"
                    : "bg-white border-blue-300"
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
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      : darkMode
                      ? "text-gray-200 hover:bg-gray-700 border-gray-700"
                      : "text-gray-800 hover:bg-blue-50 border-gray-200"
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
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                        : darkMode
                        ? "text-gray-200 hover:bg-gray-700 border-gray-700"
                        : "text-gray-800 hover:bg-blue-50 border-gray-200"
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

          {/* Search Input */}
          <input
            type="text"
            placeholder="🔍 Search by name or offer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-md border-2 text-xs sm:text-sm md:text-base w-full sm:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
              darkMode
                ? "bg-gray-800 border-purple-500 text-gray-200 placeholder-gray-400 focus:border-purple-400"
                : "bg-white border-blue-300 text-gray-800 placeholder-gray-500 focus:border-blue-400"
            }`}
          />
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-start gap-2 mb-4 sm:mb-6 border-b pb-2">
          {["Pending", "Approved", "Rejected"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base font-medium rounded-t-md transition-all duration-300 transform hover:scale-105 ${
                activeTab === tab
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : darkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                  : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600"
              }`}
            >
              {tab === "Pending" && "⏳"}
              {tab === "Approved" && "✅"}
              {tab === "Rejected" && "❌"}
              {" "}{tab} Leads
            </button>
          ))}
        </div>

        {/* Table Container */}
        <div
          className={`rounded-2xl border-2 shadow-lg transition-all duration-300 hover:shadow-xl ${
            darkMode
              ? "border-purple-500 bg-gradient-to-br from-gray-800 to-gray-700"
              : "border-blue-300 bg-gradient-to-br from-white to-blue-50"
          } overflow-hidden`}
        >
          <div
            className={`p-3 sm:p-4 border-b ${
              darkMode ? "border-gray-700" : "border-blue-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full animate-pulse"></div>
              <h2
                className={`text-base sm:text-lg md:text-xl font-semibold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent`}
              >
                📋 Leads Awaiting Review
              </h2>
            </div>
            <p className={`text-xs sm:text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              These leads are currently under review by the admin team
            </p>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-xs sm:text-sm md:text-base">
              <thead
                className={`${
                  darkMode
                    ? "bg-gradient-to-r from-gray-700 to-gray-600 text-gray-300"
                    : "bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700"
                }`}
              >
                <tr>
                  <th className="text-left px-3 sm:px-4 py-2 sm:py-3 font-semibold">📋 Lead ID</th>
                  <th className="text-left px-3 sm:px-4 py-2 sm:py-3 font-semibold">👤 Name</th>
                  <th className="text-left px-3 sm:px-4 py-2 sm:py-3 font-semibold">🏷️ Category</th>
                  <th className="text-left px-3 sm:px-4 py-2 sm:py-3 font-semibold">🎯 Offer</th>
                  <th className="text-left px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap font-semibold">
                    📅 Created Date
                  </th>
                  <th className="text-left px-3 sm:px-4 py-2 sm:py-3 font-semibold">📊 Sub-Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-6 sm:py-8 text-gray-500">
                      <div className="flex justify-center items-center gap-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
                        Loading leads...
                      </div>
                    </td>
                  </tr>
                ) : filteredLeads.length > 0 ? (
                  filteredLeads.map((lead, index) => (
                    <tr
                      key={lead._id}
                      className={`border-t transition-all duration-200 hover:scale-[1.01] ${
                        darkMode ? "border-gray-700 hover:bg-gray-700/50" : "border-blue-100 hover:bg-blue-50"
                      } ${index % 2 === 0 ? (darkMode ? "bg-gray-800/50" : "bg-blue-50/30") : ""}`}
                    >
                      <td className="px-3 sm:px-4 py-2 sm:py-3 font-medium text-blue-600 whitespace-nowrap">
                        {lead.leadId}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 font-semibold">{lead.customerName}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                        <span className="px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-full text-xs">
                          {lead.category}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3">{lead.offerName}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-gray-500">
                        {formatDate(lead.createdAt)}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                        <span className="px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs md:text-sm font-medium bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200">
                          ⏳ Awaiting Admin Review
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-8 text-gray-500 dark:text-gray-400"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-4xl">📭</div>
                        <p>No leads found</p>
                        <p className="text-sm">All your leads have been processed or try adjusting your filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col gap-3 p-3 sm:p-4">
            {loading ? (
              <div className="text-center py-6 sm:py-8 text-gray-500">
                <div className="flex justify-center items-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
                  Loading  leads...
                </div>
              </div>
            ) : filteredLeads.length > 0 ? (
              filteredLeads.map((lead) => (
                <div
                  key={lead._id}
                  className={`p-3 sm:p-4 rounded-xl border-2 shadow-md transition-all duration-200 hover:shadow-lg ${
                    darkMode
                      ? "border-purple-500 bg-gradient-to-br from-gray-800 to-gray-700 hover:border-purple-400"
                      : "border-blue-300 bg-gradient-to-br from-white to-blue-50 hover:border-blue-400"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <div className="flex-1 min-w-0 mr-2">
                      <h3 className={`font-semibold text-sm sm:text-base truncate ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}>
                        👤 {lead.customerName}
                      </h3>
                      <p className="text-xs text-blue-500 mt-0.5">ID: {lead.leadId}</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200 whitespace-nowrap flex-shrink-0">
                      ⏳ Pending
                    </span>
                  </div>
                  
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex items-start">
                      <span className={`text-xs sm:text-sm font-medium min-w-[80px] ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}>
                        🏷️ Category:
                      </span>
                      <span className="text-xs sm:text-sm flex-1">{lead.category}</span>
                    </div>
                    
                    <div className="flex items-start">
                      <span className={`text-xs sm:text-sm font-medium min-w-[80px] ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}>
                        🎯 Offer:
                      </span>
                      <span className="text-xs sm:text-sm flex-1">{lead.offerName}</span>
                    </div>
                    
                    <div className="flex items-start">
                      <span className={`text-xs sm:text-sm font-medium min-w-[80px] ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}>
                        📅 Created:
                      </span>
                      <span className="text-xs sm:text-sm flex-1">{formatDate(lead.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-sm py-6 text-gray-500 dark:text-gray-400">
                <div className="flex flex-col items-center gap-2">
                  <div className="text-4xl">📭</div>
                  <p>No leads found.</p>
                  <p className="text-xs">Try adjusting your search or filters.</p>
                </div>
              </div>
            )}
          </div>
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

export default PendingLeads;