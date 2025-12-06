import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import leadService from "../../services/leadService";
import categoryService from "../../services/categoryService";

const PreviousLeads = ({ darkMode = useOutletContext() }) => {
  const [activeTab, setActiveTab] = useState("Previous");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [leadsData, setLeadsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState("last7days"); // last7days, last30days, custom
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
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
    fetchPreviousLeads();
    fetchCategories();
  }, [dateFilter, customStartDate, customEndDate]);

  const fetchPreviousLeads = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Calculate date range based on filter
      let startDate, endDate;
      const today = new Date();
      
      switch (dateFilter) {
        case "last7days":
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 7);
          endDate = new Date(today);
          endDate.setDate(today.getDate() - 1);
          break;
        case "last30days":
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 30);
          endDate = new Date(today);
          endDate.setDate(today.getDate() - 1);
          break;
        case "custom":
          if (customStartDate && customEndDate) {
            startDate = new Date(customStartDate);
            endDate = new Date(customEndDate);
          } else {
            // Default to last 7 days if custom dates not set
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 7);
            endDate = new Date(today);
            endDate.setDate(today.getDate() - 1);
          }
          break;
        default:
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 7);
          endDate = new Date(today);
          endDate.setDate(today.getDate() - 1);
      }
      
      // Set start to beginning of day and end to end of day
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      const response = await leadService.getAllLeads({
        hrUserId: user._id,
        limit: 100,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      if (response.success) {
        setLeadsData(response.data.leads || []);
      }
    } catch (error) {
      console.error('Error fetching previous leads:', error);
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

  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
  };

  const getDateRangeText = () => {
    const today = new Date();
    let startDate, endDate;
    
    switch (dateFilter) {
      case "last7days":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        endDate = new Date(today);
        endDate.setDate(today.getDate() - 1);
        break;
      case "last30days":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 30);
        endDate = new Date(today);
        endDate.setDate(today.getDate() - 1);
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          endDate = new Date(customEndDate);
        } else {
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 7);
          endDate = new Date(today);
          endDate.setDate(today.getDate() - 1);
        }
        break;
      default:
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        endDate = new Date(today);
        endDate.setDate(today.getDate() - 1);
    }
    
    return `${startDate.toLocaleDateString('en-IN')} to ${endDate.toLocaleDateString('en-IN')}`;
  };

  // Filter leads by status + category + search
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
      case "Previous":
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
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Mobile-friendly lead card component
  const LeadCard = ({ lead }) => (
    <div
      className={`p-4 rounded-lg border-2 mb-3 transition-all duration-200 hover:shadow-md cursor-pointer ${
        darkMode
          ? "border-amber-500 bg-gray-800 hover:bg-gray-750"
          : "border-amber-200 bg-white hover:bg-amber-50"
      }`}
      onClick={() => {
        // Optional: Navigate to lead details
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
        <div className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-amber-100'}`}>
          {formatDate(lead.createdAt)}
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
        darkMode ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white" : "bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 text-gray-900"
      }`}
    >
      {/* Animated Background Elements */}
      <div className="hidden sm:block absolute top-0 left-0 w-72 h-72 bg-amber-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="hidden sm:block absolute top-0 right-0 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="hidden sm:block absolute -bottom-8 left-20 w-72 h-72 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 w-full max-w-7xl mx-auto overflow-x-hidden">
        {/* Title */}
        <div className="mb-4 sm:mb-6 text-center sm:text-left">
          <h2
            className={`text-xl sm:text-2xl md:text-3xl font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent`}
          >
            Previous Leads
          </h2>
          <p className={`text-xs sm:text-sm mt-1 sm:mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            View and manage leads from previous dates - {getDateRangeText()}
          </p>
        </div>

        {/* Date Filter Section */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleDateFilterChange("last7days")}
              className={`px-3 py-2 text-xs rounded-lg transition-all duration-200 ${
                dateFilter === "last7days"
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white"
                  : darkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              📅 Last 7 Days
            </button>
            <button
              onClick={() => handleDateFilterChange("last30days")}
              className={`px-3 py-2 text-xs rounded-lg transition-all duration-200 ${
                dateFilter === "last30days"
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white"
                  : darkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              📅 Last 30 Days
            </button>
            <button
              onClick={() => handleDateFilterChange("custom")}
              className={`px-3 py-2 text-xs rounded-lg transition-all duration-200 ${
                dateFilter === "custom"
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white"
                  : darkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              📅 Custom Range
            </button>
          </div>
          
          {dateFilter === "custom" && (
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className={`px-3 py-2 rounded-lg border-2 text-sm ${
                  darkMode
                    ? "bg-gray-800 border-amber-500 text-gray-200"
                    : "bg-white border-amber-300 text-gray-800"
                }`}
              />
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className={`px-3 py-2 rounded-lg border-2 text-sm ${
                  darkMode
                    ? "bg-gray-800 border-amber-500 text-gray-200"
                    : "bg-white border-amber-300 text-gray-800"
                }`}
              />
              <button
                onClick={fetchPreviousLeads}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  darkMode
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "bg-amber-500 hover:bg-amber-600 text-white"
                }`}
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {/* Filter Section */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
          {/* Custom Category Dropdown */}
          <div className="w-full sm:w-1/2 lg:w-1/3 relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex justify-between items-center w-full px-3 py-2.5 rounded-lg border-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200 ${
                darkMode
                  ? "bg-gray-800 border-amber-500 text-gray-200 hover:border-amber-400"
                  : "bg-white border-amber-300 text-gray-800 hover:border-amber-400"
              }`}
            >
              <span className="truncate">{categoryFilter}</span>
              <svg 
                className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''} ${
                  darkMode ? 'text-amber-400' : 'text-amber-500'
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
                    ? "bg-gray-800 border-amber-500" 
                    : "bg-white border-amber-300"
                }`}
              >
                <button
                  onClick={() => handleCategorySelect("All")}
                  className={`block w-full text-left px-4 py-3 text-sm border-b transition-all ${
                    categoryFilter === "All"
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                      : darkMode
                      ? "text-gray-200 hover:bg-gray-700 border-gray-700"
                      : "text-gray-800 hover:bg-amber-50 border-gray-200"
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
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                        : darkMode
                        ? "text-gray-200 hover:bg-gray-700 border-gray-700"
                        : "text-gray-800 hover:bg-amber-50 border-gray-200"
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
              placeholder="🔍 Search previous leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`px-3 py-2.5 rounded-lg border-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200 ${
                darkMode
                  ? "bg-gray-800 border-amber-500 text-gray-200 placeholder-gray-400 focus:border-amber-400"
                  : "bg-white border-amber-300 text-gray-800 placeholder-gray-500 focus:border-amber-400"
              }`}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4 sm:mb-6 border-b pb-2">
          {["Previous", "Pending", "Approved", "Completed", "Rejected"].map((tab) => (
            <button
              key={tab}
              className={`px-3 sm:px-4 md:px-6 py-2 text-xs sm:text-sm md:text-base font-medium rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-1 ${
                activeTab === tab
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg"
                  : darkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                  : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:text-amber-600"
              }`}
              onClick={() => handleTabClick(tab)}
            >
              {tab === "Previous" && "📅"}
              {tab === "Pending" && "⏳"}
              {tab === "Approved" && "✅"}
              {tab === "Completed" && "✅✅"}
              {tab === "Rejected" && "❌"}
              <span className="hidden sm:inline">{tab}</span>
              <span className="sm:hidden">
                {tab === "Previous" ? "Prev" : tab.slice(0, 3)}
              </span>
            </button>
          ))}
        </div>

        {/* Mobile View - Cards */}
        <div className="block lg:hidden">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="flex justify-center items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
                Loading previous leads...
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
                <p>No {activeTab.toLowerCase()} leads found in selected date range.</p>
                <p className="text-sm">Try adjusting your date range, filters, or search terms.</p>
              </div>
            </div>
          )}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden lg:block">
          <div
            className={`rounded-2xl border-2 shadow-lg ${
              darkMode
                ? "border-amber-500 bg-gradient-to-br from-gray-800 to-gray-700"
                : "border-amber-300 bg-gradient-to-br from-white to-amber-50"
            } overflow-hidden transition-all duration-300 hover:shadow-xl`}
          >
            {/* Header */}
            <div
              className={`p-4 border-b ${
                darkMode ? "border-gray-700" : "border-amber-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-pulse"></div>
                <h3
                  className={`text-lg font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent`}
                >
                  {activeTab === "Previous" ? "Previous Leads Overview" : `${activeTab} Leads Overview`}
                </h3>
                <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-amber-100'}`}>
                  {getDateRangeText()}
                </span>
              </div>
              <p
                className={`text-sm mt-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {activeTab === "Previous" 
                  ? `Showing ${filteredLeads.length} leads from selected date range.` 
                  : `Showing ${filteredLeads.length} ${activeTab.toLowerCase()} leads from selected date range.`}
              </p>
            </div>

            {/* Responsive Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead
                  className={`${
                    darkMode
                      ? "bg-gradient-to-r from-gray-700 to-gray-600 text-gray-300"
                      : "bg-gradient-to-r from-amber-100 to-orange-100 text-gray-700"
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
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
                          Loading previous leads...
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
                            : "border-amber-100 hover:bg-amber-50"
                        } ${index % 2 === 0 ? (darkMode ? "bg-gray-800/50" : "bg-amber-50/30") : ""}`}
                      >
                        <td className="px-4 py-3 font-medium text-amber-600">{lead.leadId}</td>
                        <td className="px-4 py-3 font-semibold">{lead.customerName}</td>
                        <td className="px-4 py-3 text-green-600">{lead.customerContact}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 rounded-full text-xs">
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
                          <p>No {activeTab.toLowerCase()} leads found in selected date range.</p>
                          <p className="text-sm">Try adjusting your date range, filters, or search terms.</p>
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

export default PreviousLeads;