// UserClosedDataPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Phone, PhoneCall, CheckCircle, Clock, RefreshCw,
  User, FileText, AlertCircle, ArrowRight, Calendar,
  Target, ChevronRight, Filter, Search, Check,
  Sun, Moon, XCircle
} from 'lucide-react';
import dataService from '../../../services/dataService';
import userService from '../../../services/userService';

const UserClosedDataPage = ({ darkMode, setDarkMode }) => {
  const [closedData, setClosedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedData, setSelectedData] = useState([]);
  const [result, setResult] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [closedCounts, setClosedCounts] = useState({
    total: 0,
    converted: 0,
    rejected: 0,
    notReachable: 0
  });
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const dropdownRefs = useRef({});

  useEffect(() => {
    fetchClosedData();
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      const isOutside = Object.values(dropdownRefs.current).every(ref => {
        return ref && !ref.contains(event.target);
      });
      
      if (isOutside) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchClosedData = async () => {
    setLoading(true);
    try {
      console.log('Fetching closed data...');
      
      // Get user's closed data (data closed by the user)
      const dataResult = await dataService.getUserClosedData({
        closedType: 'all',
        page: 1,
        limit: 1000
      });
      console.log('Closed data result:', dataResult);
      
      if (dataResult.success) {
        const closedList = dataResult.data?.data || [];
        console.log('Closed data list:', closedList);
        
        // Process the data to extract user-specific assignment info
        const processedData = closedList.map(item => {
          // Extract user's assignment from teamAssignments if available
          let userAssignment = null;
          if (item.teamAssignments && Array.isArray(item.teamAssignments)) {
            // Find the user's assignment (not withdrawn)
            // The backend should already filter by user, but we need to find the specific assignment
            userAssignment = item.teamAssignments.find(ta => 
              ta.teamMember && 
              (ta.teamMember._id || ta.teamMember) && 
              !ta.withdrawn
            );
          }
          
          return {
            ...item,
            status: userAssignment?.status || item.status || 'rejected',
            responseType: userAssignment?.responseType,
            called: userAssignment?.status === 'contacted' || item.status === 'contacted',
            closed: true, // All data here is closed
            calledAt: userAssignment?.contactedAt || item.calledAt,
            closedAt: userAssignment?.convertedAt || userAssignment?.statusUpdatedAt || item.closedAt,
            _id: item._id || item.id,
            userAssignment: userAssignment,
            assignedAt: userAssignment?.assignedAt || item.assignedAt
          };
        });
        
        setClosedData(processedData);
        
        // Calculate counts based on closed status
        const counts = {
          total: processedData.length,
          converted: processedData.filter(item => item.status === 'converted').length,
          rejected: processedData.filter(item => item.status === 'rejected').length,
          notReachable: processedData.filter(item => item.status === 'not_reachable').length
        };
        setClosedCounts(counts);
      } else {
        console.error('Failed to fetch closed data:', dataResult.error);
        setClosedData([]);
        setClosedCounts({ total: 0, converted: 0, rejected: 0, notReachable: 0 });
      }
    } catch (error) {
      console.error('Error fetching closed data:', error);
      setClosedData([]);
      setClosedCounts({ total: 0, converted: 0, rejected: 0, notReachable: 0 });
    }
    setLoading(false);
  };

  const toggleDataSelection = (dataId) => {
    setSelectedData(prev =>
      prev.includes(dataId)
        ? prev.filter(id => id !== dataId)
        : [...prev, dataId]
    );
  };

  const selectAllData = () => {
    const filteredData = filterClosedData();
    const allIds = filteredData.map(data => data._id).filter(id => id);
    
    if (selectedData.length === allIds.length) {
      setSelectedData([]);
    } else {
      setSelectedData(allIds);
    }
  };

  const toggleDropdown = (dataId) => {
    setOpenDropdownId(openDropdownId === dataId ? null : dataId);
  };

  const filterClosedData = () => {
    let filtered = closedData;
    
    // Filter by closed type
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => {
        switch (filterStatus) {
          case 'converted':
            return item.status === 'converted';
          case 'rejected':
            return item.status === 'rejected';
          case 'not_reachable':
            return item.status === 'not_reachable';
          default:
            return true;
        }
      });
    }
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        (item.name && item.name.toLowerCase().includes(query)) ||
        (item.contact && item.contact.toLowerCase().includes(query)) ||
        (item.email && item.email.toLowerCase().includes(query)) ||
        (item.batchNumber && item.batchNumber.toLowerCase().includes(query)) ||
        (item.source && item.source.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Invalid Time';
    }
  };

  const formatDateFull = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusColor = (item) => {
    if (darkMode) {
      switch (item.status) {
        case 'converted':
          return 'bg-emerald-900/30 text-emerald-300';
        case 'rejected':
          return 'bg-red-900/30 text-red-300';
        case 'not_reachable':
          return 'bg-orange-900/30 text-orange-300';
        default:
          return 'bg-gray-800 text-gray-300';
      }
    } else {
      switch (item.status) {
        case 'converted':
          return 'bg-emerald-100 text-emerald-800';
        case 'rejected':
          return 'bg-red-100 text-red-800';
        case 'not_reachable':
          return 'bg-orange-100 text-orange-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
  };

  const getStatusText = (item) => {
    switch (item.status) {
      case 'converted':
        return 'Converted';
      case 'rejected':
        return 'Rejected';
      case 'not_reachable':
        return 'Not Reachable';
      default:
        return 'Closed';
    }
  };

  const getStatusIcon = (item) => {
    switch (item.status) {
      case 'converted':
        return <CheckCircle size={16} />;
      case 'rejected':
        return <XCircle size={16} />;
      case 'not_reachable':
        return <AlertCircle size={16} />;
      default:
        return <CheckCircle size={16} />;
    }
  };

  const getResponseTypeText = (responseType) => {
    switch (responseType) {
      case 'interested':
        return 'Interested';
      case 'not_interested':
        return 'Not Interested';
      case 'invalid_number':
        return 'Invalid Number';
      default:
        return responseType || '';
    }
  };

  const getResponseTypeColor = (responseType) => {
    if (darkMode) {
      switch (responseType) {
        case 'interested':
          return 'text-emerald-400';
        case 'not_interested':
          return 'text-blue-400';
        case 'invalid_number':
          return 'text-orange-400';
        default:
          return 'text-gray-400';
      }
    } else {
      switch (responseType) {
        case 'interested':
          return 'text-emerald-600';
        case 'not_interested':
          return 'text-blue-600';
        case 'invalid_number':
          return 'text-orange-600';
        default:
          return 'text-gray-600';
      }
    }
  };

  const filteredData = filterClosedData();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Mobile Header */}
      <div className={`sticky top-0 z-20 p-3 sm:p-4 border-b md:hidden ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } shadow-sm`}>
        <div className="flex justify-between items-center">
          <div className="flex-1 min-w-0">
            <h1 className={`text-lg sm:text-xl font-bold truncate ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Closed Data
            </h1>
            {filteredData.length > 0 && (
              <p className={`text-xs sm:text-sm mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {filteredData.length} record{filteredData.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-2">
            {(searchQuery || filterStatus !== 'all') && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
              }`}>
                Filtered
              </span>
            )}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showMobileFilters
                  ? darkMode ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-700'
                  : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              aria-label="Toggle filters"
            >
              <Filter size={20} />
            </button>
            <button
              onClick={() => fetchClosedData()}
              disabled={loading}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              } disabled:opacity-50`}
              aria-label="Refresh data"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 md:p-6">
        {/* Desktop Header */}
        <div className="hidden md:block mb-8">
          <div className="flex justify-between items-start md:items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">Closed Data</h1>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>View all data closed by you</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={fetchClosedData}
                disabled={loading}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} disabled:opacity-50`}
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
          <div className={`rounded-lg sm:rounded-xl shadow-sm sm:shadow p-2.5 sm:p-3 md:p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center">
              <div className={`p-1.5 sm:p-2 md:p-3 rounded-lg mr-2 sm:mr-3 md:mr-4 shrink-0 ${
                darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
              }`}>
                <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-[10px] sm:text-xs md:text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Closed</p>
                <p className="text-base sm:text-lg md:text-2xl font-bold truncate">{closedCounts.total}</p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-lg sm:rounded-xl shadow-sm sm:shadow p-2.5 sm:p-3 md:p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center">
              <div className={`p-1.5 sm:p-2 md:p-3 rounded-lg mr-2 sm:mr-3 md:mr-4 shrink-0 ${
                darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
              }`}>
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-[10px] sm:text-xs md:text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Converted</p>
                <p className="text-base sm:text-lg md:text-2xl font-bold truncate">{closedCounts.converted}</p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-lg sm:rounded-xl shadow-sm sm:shadow p-2.5 sm:p-3 md:p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center">
              <div className={`p-1.5 sm:p-2 md:p-3 rounded-lg mr-2 sm:mr-3 md:mr-4 shrink-0 ${
                darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'
              }`}>
                <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-[10px] sm:text-xs md:text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rejected</p>
                <p className="text-base sm:text-lg md:text-2xl font-bold truncate">{closedCounts.rejected}</p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-lg sm:rounded-xl shadow-sm sm:shadow p-2.5 sm:p-3 md:p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center">
              <div className={`p-1.5 sm:p-2 md:p-3 rounded-lg mr-2 sm:mr-3 md:mr-4 shrink-0 ${
                darkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-600'
              }`}>
                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-[10px] sm:text-xs md:text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Not Reachable</p>
                <p className="text-base sm:text-lg md:text-2xl font-bold truncate">{closedCounts.notReachable}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Filters Overlay */}
        {showMobileFilters && (
          <div className={`fixed inset-0 z-50 md:hidden ${darkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-sm`}>
            <div className="flex flex-col h-full overflow-y-auto">
              <div className={`sticky top-0 z-10 p-4 border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex justify-between items-center">
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Filters</h2>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                    aria-label="Close filters"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>
              </div>
              
              <div className="flex-1 p-4 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Search
                  </label>
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} size={18} />
                    <input
                      type="text"
                      placeholder="Search by name, contact..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg text-base ${
                        darkMode 
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      } border focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    />
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Filter by Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg text-base ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } border focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  >
                    <option value="all">All Closed</option>
                    <option value="converted">Converted</option>
                    <option value="rejected">Rejected</option>
                    <option value="not_reachable">Not Reachable</option>
                  </select>
                </div>
                
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                  <h3 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setFilterStatus('all');
                        setShowMobileFilters(false);
                      }}
                      className={`w-full px-4 py-2 rounded-lg text-sm font-medium ${
                        darkMode 
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                          : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300'
                      } transition-colors`}
                    >
                      Clear Filters
                    </button>
                    <button
                      onClick={() => {
                        fetchClosedData();
                        setShowMobileFilters(false);
                      }}
                      disabled={loading}
                      className={`w-full px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 ${
                        darkMode 
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                          : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300'
                      } disabled:opacity-50 transition-colors`}
                    >
                      <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                      <span>Refresh Data</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Desktop Filters */}
        <div className={`hidden md:block rounded-xl shadow p-6 mb-8 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex-1">
              <h3 className={`font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>Filter</h3>
              <div className="flex flex-wrap gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by name, contact..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300'
                    } border`}
                  />
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  } border`}
                >
                  <option value="all">All Closed</option>
                  <option value="converted">Converted</option>
                  <option value="rejected">Rejected</option>
                  <option value="not_reachable">Not Reachable</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Data Table */}
        <div className={`rounded-xl shadow overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`p-4 md:p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
              <div>
                <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>Closed Data List</h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Showing {filteredData.length} of {closedData.length} records
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {selectedData.length} selected
                </div>
                {filteredData.length > 0 && (
                  <button
                    onClick={selectAllData}
                    className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                  >
                    {selectedData.length === filteredData.length ? 'Deselect All' : 'Select All'}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className={`animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-4 ${
                  darkMode ? 'border-blue-400' : 'border-blue-600'
                }`}></div>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Loading closed data...</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-12">
                <FileText className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} size={48} />
                <p className={`text-lg mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>No closed data found</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {searchQuery || filterStatus !== 'all' 
                    ? 'Try changing your filters' 
                    : 'You haven\'t closed any data yet'}
                </p>
              </div>
            ) : (
              <div className="md:table w-full">
                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {filteredData.map((item) => (
                    <div
                      key={item._id}
                      className={`p-3 sm:p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}
                    >
                      <div className="flex justify-between items-start gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-2">
                            <input
                              type="checkbox"
                              checked={selectedData.includes(item._id)}
                              onChange={() => toggleDataSelection(item._id)}
                              className={`h-4 w-4 mt-0.5 rounded shrink-0 ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 text-blue-400 focus:ring-blue-500/30' 
                                  : 'border-gray-300 text-blue-600 focus:ring-blue-500'
                              }`}
                            />
                            <div className="min-w-0 flex-1">
                              <div className={`font-medium text-sm sm:text-base truncate ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                {item.name || 'Unknown'}
                              </div>
                              <div className={`text-xs sm:text-sm font-mono truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {item.contact || 'No contact'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-1.5 sm:space-y-2 ml-6 sm:ml-7">
                            <div className={`flex items-center text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              <FileText size={12} className="mr-1.5 sm:mr-2 shrink-0" />
                              <span className="truncate">Batch: {item.batchNumber || 'N/A'}</span>
                            </div>
                            
                            {item.source && (
                              <div className={`text-xs sm:text-sm truncate ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                                Source: {item.source}
                              </div>
                            )}
                            
                            {item.assignedAt && (
                              <div className={`text-xs sm:text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                                Assigned: {formatDateFull(item.assignedAt)}
                              </div>
                            )}
                            
                            {item.calledAt && (
                              <div className="text-xs sm:text-sm text-blue-500">
                                Called: {formatDate(item.calledAt)}
                              </div>
                            )}
                            
                            {item.closedAt && (
                              <div className="text-xs sm:text-sm text-green-500">
                                Closed: {formatDateFull(item.closedAt)}
                              </div>
                            )}
                            
                            {item.responseType && (
                              <div className={`text-xs sm:text-sm font-medium ${getResponseTypeColor(item.responseType)}`}>
                                <CheckCircle size={10} className="inline mr-1" />
                                Response: {getResponseTypeText(item.responseType)}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end shrink-0">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium mb-2 sm:mb-3 ${getStatusColor(item)}`}>
                            {getStatusIcon(item)}
                            <span className="ml-1 whitespace-nowrap">{getStatusText(item)}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Desktop Table View */}
                <table className="hidden md:table w-full">
                  <thead className={darkMode ? 'bg-gray-900/50' : 'bg-gray-50'}>
                    <tr>
                      <th className="py-3 px-6 text-left">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filteredData.length > 0 && selectedData.length === filteredData.length}
                            onChange={selectAllData}
                            className={`h-4 w-4 rounded ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-blue-400 focus:ring-blue-500/30' 
                                : 'border-gray-300 text-blue-600 focus:ring-blue-500'
                            }`}
                          />
                        </div>
                      </th>
                      <th className={`py-3 px-6 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Name / Contact
                      </th>
                      <th className={`py-3 px-6 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Details
                      </th>
                      <th className={`py-3 px-6 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Status
                      </th>
                      <th className={`py-3 px-6 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Closed At
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {filteredData.map((item) => (
                      <tr key={item._id} className={darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                        <td className="py-4 px-6">
                          <input
                            type="checkbox"
                            checked={selectedData.includes(item._id)}
                            onChange={() => toggleDataSelection(item._id)}
                            className={`h-4 w-4 rounded ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-blue-400 focus:ring-blue-500/30' 
                                : 'border-gray-300 text-blue-600 focus:ring-blue-500'
                            }`}
                          />
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <div className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                              {item.name || 'Unknown'}
                            </div>
                            <div className={`text-sm font-mono ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {item.contact || 'No contact'}
                            </div>
                            {item.email && (
                              <div className={`text-sm truncate ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                {item.email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <div className={`flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              <FileText size={14} className="mr-2" />
                              <span>Batch: {item.batchNumber || 'N/A'}</span>
                            </div>
                            {item.source && (
                              <div className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                Source: {item.source}
                              </div>
                            )}
                            {item.assignedAt && (
                              <div className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                Assigned: {formatDateFull(item.assignedAt)}
                              </div>
                            )}
                            {item.calledAt && (
                              <div className="text-sm text-blue-500">
                                Called: {formatDate(item.calledAt)}
                              </div>
                            )}
                            {item.responseType && (
                              <div className={`text-sm font-medium ${getResponseTypeColor(item.responseType)}`}>
                                <CheckCircle size={12} className="inline mr-1" />
                                Response: {getResponseTypeText(item.responseType)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item)}`}>
                              {getStatusIcon(item)}
                              <span className="ml-2">{getStatusText(item)}</span>
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {item.closedAt ? formatDateFull(item.closedAt) : 'N/A'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Data Summary */}
          {filteredData.length > 0 && (
            <div className={`p-4 md:p-6 border-t ${darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="mb-4 md:mb-0">
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Showing {filteredData.length} record{filteredData.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      darkMode ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      <CheckCircle size={12} className="mr-1" />
                      Converted: {closedCounts.converted}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      darkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800'
                    }`}>
                      <XCircle size={12} className="mr-1" />
                      Rejected: {closedCounts.rejected}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      darkMode ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-800'
                    }`}>
                      <AlertCircle size={12} className="mr-1" />
                      Not Reachable: {closedCounts.notReachable}
                    </span>
                  </div>
                </div>
                
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p>All data closed by you</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserClosedDataPage;

