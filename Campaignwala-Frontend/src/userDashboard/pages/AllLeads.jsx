import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import leadService from "../../services/leadService";
import categoryService from "../../services/categoryService";

const AllLeads = ({ darkMode = useOutletContext() }) => {
  const [activeTab, setActiveTab] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [leadsData, setLeadsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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
    fetchLeads();
    fetchCategories();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await leadService.getAllLeads({
        hrUserId: user._id,
        limit: 100
      });
      
      if (response.success) {
        setLeadsData(response.data.leads || []);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories({
        status: 'active'
      });
      
      if (response.success) {
        setCategories(response.data?.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCategorySelect = (category) => {
    setCategoryFilter(category);
    setIsDropdownOpen(false);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // 🔍 Filter leads by status + category + search
  const filteredLeads = leadsData.filter((lead) => {
    // Status filter based on active tab
    let matchesStatus = true;
    switch (activeTab) {
      case "Pending":
        matchesStatus = lead.status === "pending";
        break;
      case "Approved":
        matchesStatus = lead.status === "approved";
        break;
      case "Completed":
        matchesStatus = lead.status === "completed";
        break;
      case "Rejected":
        matchesStatus = lead.status === "rejected";
        break;
      case "All":
      default:
        matchesStatus = true;
        break;
    }

    // Category filter
    const matchesCategory =
      categoryFilter === "All" || lead.category === categoryFilter;
    
    // Search filter
    const matchesSearch =
      (lead.customerName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (lead.customerContact || '').includes(searchQuery) ||
      (lead.leadId || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };

  // Mobile-friendly lead card component
  const LeadCard = ({ lead }) => (
    <div
      className={`p-4 rounded-lg border-2 mb-3 transition-all duration-200 hover:shadow-md ${
        darkMode
          ? "border-purple-500 bg-gray-800 hover:bg-gray-750"
          : "border-blue-200 bg-white hover:bg-blue-50"
      }`}
      onClick={() => {
        // Optional: Navigate to lead details on click
        // navigate(`/leads/${lead._id}`);
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm truncate">{lead.customerName}</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium border ${
                lead.status === "approved"
                  ? "bg-green-100 text-green-800 border-green-200"
                  : lead.status === "pending"
                  ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                  : lead.status === "completed"
                  ? "bg-blue-100 text-blue-800 border-blue-200"
                  : "bg-red-100 text-red-800 border-red-200"
              }`}
            >
              {lead.status === "approved" && "✅"}
              {lead.status === "pending" && "⏳"}
              {lead.status === "completed" && "✅✅"}
              {lead.status === "rejected" && "❌"}
              {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
            </span>
          </div>
          <div className="text-xs text-gray-500 mb-2">ID: {lead.leadId}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="font-medium">📞 Contact:</span>
          <div className="text-green-600 truncate">{lead.customerContact}</div>
        </div>
        <div>
          <span className="font-medium">🏷️ Category:</span>
          <div className="truncate">{lead.category}</div>
        </div>
        <div className="col-span-2">
          <span className="font-medium">🎯 Offer:</span>
          <div className="truncate" title={lead.offerName}>{lead.offerName}</div>
        </div>
        <div>
          <span className="font-medium">📅 Created:</span>
          <div className="text-gray-500">{formatDate(lead.createdAt)}</div>
        </div>
        <div>
          <span className="font-medium">🔄 Updated:</span>
          <div className="text-gray-500">{formatDate(lead.updatedAt)}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`min-h-screen pt-4 sm:pt-8 px-3 sm:px-6 transition-all duration-300 ${
        darkMode ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white" : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900"
      }`}
    >
      {/* Animated Background Elements - Hidden on mobile for performance */}
      <div className="hidden sm:block absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="hidden sm:block absolute top-0 right-0 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="hidden sm:block absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 w-full max-w-7xl mx-auto overflow-x-hidden">
        {/* Title */}
        <div className="mb-4 sm:mb-6 text-center sm:text-left">
          <h2
            className={`text-xl sm:text-2xl md:text-3xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}
          >
            {activeTab === "All" ? "All Leads" : `${activeTab} Leads`}
          </h2>
          <p className={`text-xs sm:text-sm mt-1 sm:mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            {activeTab === "All" 
              ? "Manage and track all your leads in one place" 
              : `Viewing ${activeTab.toLowerCase()} leads`}
          </p>
        </div>

        {/* Filter Section */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
          {/* Custom Category Dropdown */}
          <div className="w-full sm:w-1/2 lg:w-1/3 relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex justify-between items-center w-full px-3 py-2.5 rounded-lg border-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                darkMode
                  ? "bg-gray-800 border-purple-500 text-gray-200 hover:border-purple-400"
                  : "bg-white border-blue-300 text-gray-800 hover:border-blue-400"
              }`}
            >
              <span className="truncate">{categoryFilter}</span>
              <svg 
                className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''} ${
                  darkMode ? 'text-purple-400' : 'text-blue-500'
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
                className={`absolute z-50 w-full mt-1 rounded-lg shadow-lg border-2 max-h-60 overflow-y-auto ${
                  darkMode 
                    ? "bg-gray-800 border-purple-500" 
                    : "bg-white border-blue-300"
                }`}
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
                      whiteSpace: 'normal',
                      wordWrap: 'break-word'
                    }}
                  >
                    🏷️ {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Input */}
          <div className="w-full sm:w-1/2 lg:w-1/3">
            <input
              type="text"
              placeholder="🔍 Search by name or contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`px-3 py-2.5 rounded-lg border-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                darkMode
                  ? "bg-gray-800 border-purple-500 text-gray-200 placeholder-gray-400 focus:border-purple-400"
                  : "bg-white border-blue-300 text-gray-800 placeholder-gray-500 focus:border-blue-400"
              }`}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4 sm:mb-6 border-b pb-2">
          {["All", "Pending", "Approved", "Completed", "Rejected"].map((tab) => (
            <button
              key={tab}
              className={`px-3 sm:px-4 md:px-6 py-2 text-xs sm:text-sm md:text-base font-medium rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-1 ${
                activeTab === tab
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : darkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                  : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600"
              }`}
              onClick={() => handleTabClick(tab)}
            >
              {tab === "All" && "📊"}
              {tab === "Pending" && "⏳"}
              {tab === "Approved" && "✅"}
              {tab === "Completed" && "✅✅"}
              {tab === "Rejected" && "❌"}
              <span className="hidden sm:inline">{tab}</span>
              <span className="sm:hidden">
                {tab === "All" ? "All" : tab.slice(0, 3)}
              </span>
            </button>
          ))}
        </div>

        {/* Mobile View - Cards */}
        <div className="block lg:hidden">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="flex justify-center items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                Loading leads...
              </div>
            </div>
          ) : filteredLeads.length > 0 ? (
            <div className="space-y-3">
              {filteredLeads.map((lead) => (
                <LeadCard key={lead._id} lead={lead} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="flex flex-col items-center gap-2">
                <div className="text-4xl">📭</div>
                <p>No {activeTab.toLowerCase()} leads found.</p>
                <p className="text-sm">Try adjusting your filters or search terms.</p>
              </div>
            </div>
          )}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden lg:block">
          <div
            className={`rounded-2xl border-2 shadow-lg ${
              darkMode
                ? "border-purple-500 bg-gradient-to-br from-gray-800 to-gray-700"
                : "border-blue-300 bg-gradient-to-br from-white to-blue-50"
            } overflow-hidden transition-all duration-300 hover:shadow-xl`}
          >
            {/* Header */}
            <div
              className={`p-4 border-b ${
                darkMode ? "border-gray-700" : "border-blue-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                <h3
                  className={`text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}
                >
                  {activeTab === "All" ? "All Leads Overview" : `${activeTab} Leads Overview`}
                </h3>
              </div>
              <p
                className={`text-sm mt-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {activeTab === "All" 
                  ? "Showing your most recent leads across all statuses." 
                  : `Showing ${filteredLeads.length} ${activeTab.toLowerCase()} leads.`}
              </p>
            </div>

            {/* Responsive Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead
                  className={`${
                    darkMode
                      ? "bg-gradient-to-r from-gray-700 to-gray-600 text-gray-300"
                      : "bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700"
                  }`}
                >
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">📋 Lead ID</th>
                    <th className="text-left px-4 py-3 font-semibold">👤 Name</th>
                    <th className="text-left px-4 py-3 font-semibold">📞 Contact</th>
                    <th className="text-left px-4 py-3 font-semibold">🏷️ Category</th>
                    <th className="text-left px-4 py-3 font-semibold">🎯 Offer</th>
                    <th className="text-left px-4 py-3 font-semibold">📅 Created</th>
                    <th className="text-left px-4 py-3 font-semibold">🔄 Updated</th>
                    <th className="text-left px-4 py-3 font-semibold">📊 Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center py-8 text-gray-500">
                        <div className="flex justify-center items-center gap-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          Loading leads...
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
                            : "border-blue-100 hover:bg-blue-50"
                        } ${index % 2 === 0 ? (darkMode ? "bg-gray-800/50" : "bg-blue-50/30") : ""}`}
                      >
                        <td className="px-4 py-3 font-medium text-blue-600">{lead.leadId}</td>
                        <td className="px-4 py-3 font-semibold">{lead.customerName}</td>
                        <td className="px-4 py-3 text-green-600">{lead.customerContact}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-full text-xs">
                            {lead.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 truncate max-w-[150px]" title={lead.offerName}>
                          {lead.offerName}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{formatDate(lead.createdAt)}</td>
                        <td className="px-4 py-3 text-gray-500">{formatDate(lead.updatedAt)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${
                              lead.status === "approved"
                                ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200"
                                : lead.status === "pending"
                                ? "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200"
                                : lead.status === "completed"
                                ? "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200"
                                : "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200"
                            }`}
                          >
                            {lead.status === "approved" && "✅ "}
                            {lead.status === "pending" && "⏳ "}
                            {lead.status === "completed" && "✅✅ "}
                            {lead.status === "rejected" && "❌ "}
                            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-8 text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <div className="text-4xl">📭</div>
                          <p>No {activeTab.toLowerCase()} leads found.</p>
                          <p className="text-sm">Try adjusting your filters or search terms.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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

export default AllLeads;