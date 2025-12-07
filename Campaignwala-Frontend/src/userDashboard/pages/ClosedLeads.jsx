import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import leadService from "../../services/leadService";
import categoryService from "../../services/categoryService";

const ClosedLeads = ({ darkMode = useOutletContext() }) => {
  const [activeTab, setActiveTab] = useState("Closed");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [leadsData, setLeadsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    closed: 0,
    conversionRate: 0
  });
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
    fetchClosedLeads();
    fetchCategories();
  }, []);

  const fetchClosedLeads = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Fetch all leads first
      const response = await leadService.getAllLeads({
        hrUserId: user._id,
        limit: 200
      });
      
      if (response.success) {
        const allLeads = response.data.leads || [];
        
        // Filter for closed leads (completed or closed status)
        const closedLeads = allLeads.filter(lead => 
          lead.status === "completed" || lead.status === "closed"
        );
        
        setLeadsData(closedLeads);
        
        // Calculate stats
        const completedLeads = closedLeads.filter(lead => lead.status === "completed").length;
        const closedStatusLeads = closedLeads.filter(lead => lead.status === "closed").length;
        const totalClosed = closedLeads.length;
        
        setStats({
          total: totalClosed,
          completed: completedLeads,
          closed: closedStatusLeads,
          conversionRate: totalClosed > 0 ? Math.round((completedLeads / totalClosed) * 100) : 0
        });
      }
    } catch (error) {
      console.error('Error fetching closed leads:', error);
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

  // Filter leads by status + category + search
  const filteredLeads = leadsData.filter((lead) => {
    // Status filter based on active tab
    let matchesStatus = true;
    switch (activeTab) {
      case "Completed":
        matchesStatus = lead.status === "completed";
        break;
      case "Closed":
        matchesStatus = lead.status === "closed";
        break;
      case "All Closed":
      default:
        matchesStatus = lead.status === "completed" || lead.status === "closed";
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

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { emoji: "✅", label: "Completed", color: "bg-green-100 text-green-800 border-green-200" },
      closed: { emoji: "🔒", label: "Closed", color: "bg-gray-100 text-gray-800 border-gray-200" }
    };
    
    return statusConfig[status] || { emoji: "❓", label: status, color: "bg-gray-100 text-gray-800 border-gray-200" };
  };

  // Mobile-friendly lead card component
  const LeadCard = ({ lead }) => {
    const statusBadge = getStatusBadge(lead.status);
    
    return (
      <div
        className={`p-4 rounded-lg border-2 mb-3 transition-all duration-200 hover:shadow-md cursor-pointer ${
          lead.status === "completed"
            ? darkMode
              ? "border-emerald-500 bg-gray-800 hover:bg-gray-750"
              : "border-emerald-200 bg-white hover:bg-emerald-50"
            : darkMode
              ? "border-gray-500 bg-gray-800 hover:bg-gray-750"
              : "border-gray-200 bg-white hover:bg-gray-50"
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
                className={`px-2 py-1 rounded-full text-xs font-medium border ${statusBadge.color}`}
              >
                {statusBadge.emoji} {statusBadge.label}
              </span>
            </div>
            <div className="text-xs text-gray-500 mb-2">ID: {lead.leadId}</div>
          </div>
          <div className={`text-xs px-2 py-1 rounded-full ${
            lead.status === "completed"
              ? darkMode ? 'bg-emerald-900/50' : 'bg-emerald-100'
              : darkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            {formatDate(lead.updatedAt)}
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
            <span className="font-medium">🔒 Closed:</span>
            <div className="text-gray-500">{formatDateTime(lead.updatedAt)}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen pt-4 sm:pt-8 px-3 sm:px-6 transition-all duration-300 ${
        darkMode ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white" : "bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 text-gray-900"
      }`}
    >
      {/* Animated Background Elements */}
      <div className="hidden sm:block absolute top-0 left-0 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="hidden sm:block absolute top-0 right-0 w-72 h-72 bg-gray-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="hidden sm:block absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 w-full max-w-7xl mx-auto overflow-x-hidden">
        {/* Title */}
        <div className="mb-4 sm:mb-6 text-center sm:text-left">
          <h2
            className={`text-xl sm:text-2xl md:text-3xl font-semibold bg-gradient-to-r from-emerald-600 to-gray-600 bg-clip-text text-transparent`}
          >
            Closed Leads
          </h2>
          <p className={`text-xs sm:text-sm mt-1 sm:mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            View completed and closed leads - Analyze your closure performance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 sm:mb-6">
          <div className={`p-3 rounded-xl border-2 ${darkMode ? 'border-emerald-500 bg-gray-800' : 'border-emerald-200 bg-white'} shadow-sm`}>
            <div className="text-xs text-gray-500 mb-1">Total Closed</div>
            <div className="text-xl font-bold text-emerald-600">{stats.total}</div>
          </div>
          <div className={`p-3 rounded-xl border-2 ${darkMode ? 'border-emerald-500 bg-gray-800' : 'border-emerald-200 bg-white'} shadow-sm`}>
            <div className="text-xs text-gray-500 mb-1">Completed</div>
            <div className="text-xl font-bold text-emerald-600">{stats.completed}</div>
          </div>
          <div className={`p-3 rounded-xl border-2 ${darkMode ? 'border-gray-500 bg-gray-800' : 'border-gray-200 bg-white'} shadow-sm`}>
            <div className="text-xs text-gray-500 mb-1">Closed Status</div>
            <div className="text-xl font-bold text-gray-600">{stats.closed}</div>
          </div>
          <div className={`p-3 rounded-xl border-2 ${darkMode ? 'border-blue-500 bg-gray-800' : 'border-blue-200 bg-white'} shadow-sm`}>
            <div className="text-xs text-gray-500 mb-1">Completion Rate</div>
            <div className="text-xl font-bold text-blue-600">{stats.conversionRate}%</div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
          {/* Custom Category Dropdown */}
          <div className="w-full sm:w-1/2 lg:w-1/3 relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex justify-between items-center w-full px-3 py-2.5 rounded-lg border-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200 ${
                darkMode
                  ? "bg-gray-800 border-emerald-500 text-gray-200 hover:border-emerald-400"
                  : "bg-white border-emerald-300 text-gray-800 hover:border-emerald-400"
              }`}
            >
              <span className="truncate">{categoryFilter}</span>
              <svg 
                className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''} ${
                  darkMode ? 'text-emerald-400' : 'text-emerald-500'
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
                    ? "bg-gray-800 border-emerald-500" 
                    : "bg-white border-emerald-300"
                }`}
              >
                <button
                  onClick={() => handleCategorySelect("All")}
                  className={`block w-full text-left px-4 py-3 text-sm border-b transition-all ${
                    categoryFilter === "All"
                      ? "bg-gradient-to-r from-emerald-500 to-gray-500 text-white"
                      : darkMode
                      ? "text-gray-200 hover:bg-gray-700 border-gray-700"
                      : "text-gray-800 hover:bg-emerald-50 border-gray-200"
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
                        ? "bg-gradient-to-r from-emerald-500 to-gray-500 text-white"
                        : darkMode
                        ? "text-gray-200 hover:bg-gray-700 border-gray-700"
                        : "text-gray-800 hover:bg-emerald-50 border-gray-200"
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
              placeholder="🔍 Search closed leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`px-3 py-2.5 rounded-lg border-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200 ${
                darkMode
                  ? "bg-gray-800 border-emerald-500 text-gray-200 placeholder-gray-400 focus:border-emerald-400"
                  : "bg-white border-emerald-300 text-gray-800 placeholder-gray-500 focus:border-emerald-400"
              }`}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4 sm:mb-6 border-b pb-2">
          {["All Closed", "Completed", "Closed"].map((tab) => (
            <button
              key={tab}
              className={`px-3 sm:px-4 md:px-6 py-2 text-xs sm:text-sm md:text-base font-medium rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-1 ${
                activeTab === tab
                  ? tab === "Completed"
                    ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg"
                    : tab === "Closed"
                    ? "bg-gradient-to-r from-gray-600 to-slate-600 text-white shadow-lg"
                    : "bg-gradient-to-r from-emerald-600 to-gray-600 text-white shadow-lg"
                  : darkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                  : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-gray-50 hover:text-emerald-600"
              }`}
              onClick={() => handleTabClick(tab)}
            >
              {tab === "All Closed" && "🔒"}
              {tab === "Completed" && "✅"}
              {tab === "Closed" && "🔐"}
              <span className="hidden sm:inline">{tab}</span>
              <span className="sm:hidden">
                {tab === "All Closed" ? "All" : tab.slice(0, 3)}
              </span>
            </button>
          ))}
        </div>

        {/* Mobile View - Cards */}
        <div className="block lg:hidden">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="flex justify-center items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                Loading closed leads...
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
                ? "border-emerald-500 bg-gradient-to-br from-gray-800 to-gray-700"
                : "border-emerald-300 bg-gradient-to-br from-white to-emerald-50"
            } overflow-hidden transition-all duration-300 hover:shadow-xl`}
          >
            {/* Header */}
            <div
              className={`p-4 border-b ${
                darkMode ? "border-gray-700" : "border-emerald-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-gray-500 rounded-full animate-pulse"></div>
                <h3
                  className={`text-lg font-semibold bg-gradient-to-r from-emerald-600 to-gray-600 bg-clip-text text-transparent`}
                >
                  {activeTab === "All Closed" ? "Closed Leads Overview" : `${activeTab} Leads Overview`}
                </h3>
                <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-emerald-100'}`}>
                  {stats.conversionRate}% Completion Rate
                </span>
              </div>
              <p
                className={`text-sm mt-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {activeTab === "All Closed" 
                  ? `Showing ${filteredLeads.length} closed leads (${stats.completed} completed, ${stats.closed} closed status).` 
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
                      : "bg-gradient-to-r from-emerald-100 to-gray-100 text-gray-700"
                  }`}
                >
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">📋 Lead ID</th>
                    <th className="text-left px-4 py-3 font-semibold">👤 Name</th>
                    <th className="text-left px-4 py-3 font-semibold">📞 Contact</th>
                    <th className="text-left px-4 py-3 font-semibold">🏷️ Category</th>
                    <th className="text-left px-4 py-3 font-semibold">🎯 Offer</th>
                    <th className="text-left px-4 py-3 font-semibold">📅 Created</th>
                    <th className="text-left px-4 py-3 font-semibold">🔒 Closed Date</th>
                    <th className="text-left px-4 py-3 font-semibold">📊 Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center py-8 text-gray-500">
                        <div className="flex justify-center items-center gap-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                          Loading closed leads...
                        </div>
                      </td>
                    </tr>
                  ) : filteredLeads.length > 0 ? (
                    filteredLeads.map((lead, index) => {
                      const statusBadge = getStatusBadge(lead.status);
                      
                      return (
                        <tr
                          key={lead._id}
                          className={`border-t transition-all duration-200 hover:scale-[1.01] ${
                            darkMode 
                              ? "border-gray-700 hover:bg-gray-700/50" 
                              : "border-emerald-100 hover:bg-emerald-50"
                          } ${index % 2 === 0 ? (darkMode ? "bg-gray-800/50" : "bg-emerald-50/30") : ""}`}
                        >
                          <td className="px-4 py-3 font-medium text-emerald-600">{lead.leadId}</td>
                          <td className="px-4 py-3 font-semibold">{lead.customerName}</td>
                          <td className="px-4 py-3 text-green-600">{lead.customerContact}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-gradient-to-r from-emerald-100 to-gray-100 text-emerald-800 rounded-full text-xs">
                              {lead.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 truncate max-w-[150px]" title={lead.offerName}>
                            {lead.offerName}
                          </td>
                          <td className="px-4 py-3 text-gray-500">{formatDate(lead.createdAt)}</td>
                          <td className="px-4 py-3 text-gray-500">{formatDateTime(lead.updatedAt)}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${statusBadge.color}`}
                            >
                              {statusBadge.emoji} {statusBadge.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
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

export default ClosedLeads;