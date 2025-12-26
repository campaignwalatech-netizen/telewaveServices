// UserTodayDataPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Phone, PhoneCall, CheckCircle, Clock, RefreshCw,
  User, FileText, AlertCircle, ArrowRight, Calendar,
  Target, ChevronRight, Filter, Search, Check,
  Sun, Moon
} from 'lucide-react';
import dataService from '../../../services/dataService';
import userService from '../../../services/userService';

const UserTodayDataPage = ({ darkMode, setDarkMode }) => {
  const [todayData, setTodayData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedData, setSelectedData] = useState([]);
  const [result, setResult] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [todaysCounts, setTodaysCounts] = useState({
    total: 0,
    pending: 0,
    called: 0,
    closed: 0
  });
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const dropdownRefs = useRef({});

  useEffect(() => {
    fetchTodayData();
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      // Check if click is outside any dropdown
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

  // Helper function to map close type to backend status and response type
  const mapCloseTypeToStatus = (closeType) => {
    switch (closeType) {
      case 'converted':
        return { 
          status: 'converted', 
          responseType: 'interested',
          notes: 'Interested - Marked as converted'
        };
      case 'closed':
        return { 
          status: 'rejected', 
          responseType: 'not_interested',
          notes: 'Not Interested - Closed by user'
        };
      case 'not_reachable':
        return { 
          status: 'not_reachable', 
          responseType: 'invalid_number',
          notes: 'Invalid Number - Not reachable'
        };
      default:
        return { 
          status: 'rejected', 
          responseType: 'not_interested',
          notes: 'Closed by user'
        };
    }
  };

  const fetchTodayData = async () => {
    setLoading(true);
    try {
      console.log('Fetching today\'s assigned data...');
      
      // Get user's today data
      const dataResult = await dataService.getUserTodayData();
      console.log('Today data result:', dataResult);
      
      if (dataResult.success) {
        const todayList = dataResult.data?.data || [];
        console.log('Today data list:', todayList);
        
        // Process the data to extract user-specific assignment info
        const processedData = todayList.map(item => {
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
            // Use assignment status if available, otherwise use item status
            status: userAssignment?.status || item.status || 'pending',
            // Extract response type from assignment
            responseType: userAssignment?.responseType,
            // Helper fields for frontend display
            called: userAssignment?.status === 'contacted' || item.status === 'contacted',
            closed: ['converted', 'rejected', 'not_reachable'].includes(userAssignment?.status || item.status),
            // Extract timestamps from assignment
            calledAt: userAssignment?.contactedAt || item.calledAt,
            closedAt: userAssignment?.convertedAt || userAssignment?.statusUpdatedAt || item.closedAt,
            // For backward compatibility
            _id: item._id || item.id,
            // Store the assignment for reference
            userAssignment: userAssignment
          };
        });
        
        setTodayData(processedData);
        
        // Calculate counts based on processed status
        const counts = {
          total: processedData.length,
          pending: processedData.filter(item => 
            item.status === 'pending'
          ).length,
          called: processedData.filter(item => 
            item.status === 'contacted'
          ).length,
          closed: processedData.filter(item => 
            ['converted', 'rejected', 'not_reachable'].includes(item.status)
          ).length
        };
        setTodaysCounts(counts);
      } else {
        console.error('Failed to fetch today\'s data:', dataResult.error);
        setTodayData([]);
        setTodaysCounts({ total: 0, pending: 0, called: 0, closed: 0 });
      }
    } catch (error) {
      console.error('Error fetching today\'s data:', error);
      setTodayData([]);
      setTodaysCounts({ total: 0, pending: 0, called: 0, closed: 0 });
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
    const filteredData = filterTodayData();
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

  const handleCall = async (dataId, phoneNumber) => {
    if (!phoneNumber) {
      alert('No phone number available');
      return;
    }

    try {
      console.log('Calling contact:', phoneNumber);
      
      // Mark as contacted
      const updateResult = await dataService.updateDataStatus(dataId, 'contacted', 'Called by user');
      
      if (updateResult.success) {
        // Update local state
        setTodayData(prev =>
          prev.map(item =>
            item._id === dataId
              ? { 
                  ...item, 
                  called: true, 
                  status: 'contacted', 
                  calledAt: new Date().toISOString(),
                  // Clear any previous response type when calling
                  responseType: null,
                  // Increment call attempts
                  callAttempts: (item.callAttempts || 0) + 1,
                  lastCallAt: new Date().toISOString()
                }
              : item
          )
        );
        
        // Close dropdown if open
        setOpenDropdownId(null);
        
        // Open dialer with phone number
        window.open(`tel:${phoneNumber}`, '_blank');
        
        // Show success message
        setResult({
          success: true,
          message: `Call initiated with ${phoneNumber}`,
          data: { 
            calledAt: new Date().toISOString(),
            status: 'contacted'
          }
        });
        
        // Refresh counts
        setTimeout(() => {
          const newCounts = { ...todaysCounts };
          newCounts.called++;
          newCounts.pending = Math.max(0, newCounts.pending - 1);
          setTodaysCounts(newCounts);
        }, 500);
      } else {
        alert(`Failed to update status: ${updateResult.error}`);
      }
    } catch (error) {
      console.error('Call error:', error);
      setResult({
        success: false,
        error: 'Failed to initiate call',
        message: error.message
      });
    }
  };

  const handleClose = async (dataId, closeType = 'closed') => {
    // Close dropdown first
    setOpenDropdownId(null);
    
    try {
      console.log('Closing data:', dataId, closeType);
      
      // Map close type to backend status and notes
      const { status, responseType, notes } = mapCloseTypeToStatus(closeType);
      
      const updateResult = await dataService.updateDataStatus(dataId, status, notes);
      
      if (updateResult.success) {
        // Update local state
        setTodayData(prev =>
          prev.map(item =>
            item._id === dataId
              ? { 
                  ...item, 
                  closed: true, 
                  status: status, 
                  closedAt: new Date().toISOString(),
                  closedType: closeType,
                  responseType: responseType,
                  statusUpdatedAt: new Date().toISOString(),
                  // Clear called flag if it was set
                  called: status === 'contacted'
                }
              : item
          )
        );
        
        // Remove from selected if present
        setSelectedData(prev => prev.filter(id => id !== dataId));
        
        // Show success message
        const messages = {
          'converted': 'Data marked as converted! (Interested)',
          'closed': 'Data marked as not interested',
          'not_reachable': 'Data marked as invalid number'
        };
        
        setResult({
          success: true,
          message: messages[closeType] || 'Data closed successfully',
          data: { 
            closedAt: new Date().toISOString(), 
            status: status,
            responseType: responseType
          }
        });
        
        // Refresh counts
        setTimeout(() => {
          const newCounts = { ...todaysCounts };
          newCounts.closed++;
          
          // Check if it was called before closing
          const item = todayData.find(d => d._id === dataId);
          if (item && (item.called || item.status === 'contacted')) {
            newCounts.called = Math.max(0, newCounts.called - 1);
          } else {
            newCounts.pending = Math.max(0, newCounts.pending - 1);
          }
          setTodaysCounts(newCounts);
        }, 500);
      } else {
        alert(`Failed to close data: ${updateResult.error}`);
      }
    } catch (error) {
      console.error('Close error:', error);
      setResult({
        success: false,
        error: 'Failed to close data',
        message: error.message
      });
    }
  };

  const handleBulkClose = async (closeType) => {
    if (selectedData.length === 0) {
      alert('Please select at least one data record to close');
      return;
    }

    const confirmMessage = closeType === 'converted' 
      ? `Mark ${selectedData.length} selected records as converted (Interested)?`
      : `Close ${selectedData.length} selected records?`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { status, responseType, notes } = mapCloseTypeToStatus(closeType);
      const bulkNotes = `Bulk ${closeType === 'converted' ? 'converted' : 'closed'}: ${notes}`;
      
      const results = [];
      const errors = [];
      
      for (const dataId of selectedData) {
        try {
          const updateResult = await dataService.updateDataStatus(dataId, status, bulkNotes);
          
          if (updateResult.success) {
            results.push({ dataId, success: true });
          } else {
            errors.push({ dataId, error: updateResult.error });
          }
        } catch (error) {
          errors.push({ dataId, error: error.message });
        }
      }
      
      // Update local state for successful closes
      if (results.length > 0) {
        setTodayData(prev =>
          prev.map(item =>
            selectedData.includes(item._id) && results.some(r => r.dataId === item._id)
              ? { 
                  ...item, 
                  closed: true, 
                  status: status,
                  closedAt: new Date().toISOString(),
                  closedType: closeType,
                  responseType: responseType,
                  statusUpdatedAt: new Date().toISOString()
                }
              : item
          )
        );
      }
      
      setResult({
        success: errors.length === 0,
        message: `${results.length} records ${closeType === 'converted' ? 'converted' : 'closed'} successfully${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
        data: { 
          closedCount: results.length, 
          errorCount: errors.length,
          status: status,
          responseType: responseType
        },
        errors: errors.length > 0 ? errors : undefined
      });
      
      // Clear selection
      setSelectedData([]);
      
      // Refresh counts
      setTimeout(() => {
        fetchTodayData();
      }, 1000);
      
    } catch (error) {
      console.error('Bulk close error:', error);
      setResult({
        success: false,
        error: 'Failed to bulk close data',
        message: error.message
      });
    }
    
    setLoading(false);
  };

  const filterTodayData = () => {
    let filtered = todayData;
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => {
        switch (filterStatus) {
          case 'pending':
            return item.status === 'pending';
          case 'called':
            return item.status === 'contacted';
          case 'closed':
            return ['converted', 'rejected', 'not_reachable'].includes(item.status);
          case 'converted':
            return item.status === 'converted';
          case 'contacted':
            return item.status === 'contacted';
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
        case 'contacted':
          return 'bg-blue-900/30 text-blue-300';
        case 'pending':
        default:
          return 'bg-yellow-900/30 text-yellow-300';
      }
    } else {
      switch (item.status) {
        case 'converted':
          return 'bg-emerald-100 text-emerald-800';
        case 'rejected':
          return 'bg-red-100 text-red-800';
        case 'not_reachable':
          return 'bg-orange-100 text-orange-800';
        case 'contacted':
          return 'bg-blue-100 text-blue-800';
        case 'pending':
        default:
          return 'bg-yellow-100 text-yellow-800';
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
      case 'contacted':
        return 'Called';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  const getStatusIcon = (item) => {
    switch (item.status) {
      case 'converted':
        return <CheckCircle size={16} />;
      case 'rejected':
      case 'not_reachable':
        return <AlertCircle size={16} />;
      case 'contacted':
        return <PhoneCall size={16} />;
      case 'pending':
      default:
        return <Clock size={16} />;
    }
  };

  // Helper function to get response type text
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

  // Helper function to get response type color
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

  const filteredData = filterTodayData();

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
              Today's Data
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
              onClick={() => fetchTodayData()}
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
              <h1 className="text-2xl font-bold mb-2">Today's Assigned Data</h1>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage your assigned data for today</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={fetchTodayData}
                disabled={loading}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} disabled:opacity-50`}
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Stats Overview - Mobile First */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
          <div className={`rounded-lg sm:rounded-xl shadow-sm sm:shadow p-2.5 sm:p-3 md:p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center">
              <div className={`p-1.5 sm:p-2 md:p-3 rounded-lg mr-2 sm:mr-3 md:mr-4 shrink-0 ${
                darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
              }`}>
                <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-[10px] sm:text-xs md:text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Assigned</p>
                <p className="text-base sm:text-lg md:text-2xl font-bold truncate">{todaysCounts.total}</p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-lg sm:rounded-xl shadow-sm sm:shadow p-2.5 sm:p-3 md:p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center">
              <div className={`p-1.5 sm:p-2 md:p-3 rounded-lg mr-2 sm:mr-3 md:mr-4 shrink-0 ${
                darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-600'
              }`}>
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-[10px] sm:text-xs md:text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending</p>
                <p className="text-base sm:text-lg md:text-2xl font-bold truncate">{todaysCounts.pending}</p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-lg sm:rounded-xl shadow-sm sm:shadow p-2.5 sm:p-3 md:p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center">
              <div className={`p-1.5 sm:p-2 md:p-3 rounded-lg mr-2 sm:mr-3 md:mr-4 shrink-0 ${
                darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
              }`}>
                <PhoneCall className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-[10px] sm:text-xs md:text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Called</p>
                <p className="text-base sm:text-lg md:text-2xl font-bold truncate">{todaysCounts.called}</p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-lg sm:rounded-xl shadow-sm sm:shadow p-2.5 sm:p-3 md:p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center">
              <div className={`p-1.5 sm:p-2 md:p-3 rounded-lg mr-2 sm:mr-3 md:mr-4 shrink-0 ${
                darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'
              }`}>
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-[10px] sm:text-xs md:text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Closed</p>
                <p className="text-base sm:text-lg md:text-2xl font-bold truncate">{todaysCounts.closed}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Filters Overlay */}
        {showMobileFilters && (
          <div className={`fixed inset-0 z-50 md:hidden ${darkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-sm`}>
            <div className="flex flex-col h-full overflow-y-auto">
              {/* Mobile Filter Header */}
              <div className={`sticky top-0 z-10 p-4 border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex justify-between items-center">
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Filters & Actions</h2>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                    aria-label="Close filters"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>
              </div>
              
              {/* Mobile Filter Content - Scrollable */}
              <div className="flex-1 p-4 space-y-4">
                {/* Search Input */}
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
                
                {/* Status Filter */}
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
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="called">Called</option>
                    <option value="closed">Closed</option>
                    <option value="converted">Converted</option>
                    <option value="contacted">Contacted</option>
                  </select>
                </div>
                
                {/* Selected Count Display */}
                {selectedData.length > 0 && (
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                    <p className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedData.length} record{selectedData.length !== 1 ? 's' : ''} selected
                    </p>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          handleBulkClose('converted');
                          setShowMobileFilters(false);
                        }}
                        disabled={loading}
                        className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <CheckCircle size={18} />
                        <span>Mark as Converted</span>
                      </button>
                      <button
                        onClick={() => {
                          handleBulkClose('closed');
                          setShowMobileFilters(false);
                        }}
                        disabled={loading}
                        className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-lg font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Check size={18} />
                        <span>Mark as Closed</span>
                      </button>
                      <button
                        onClick={() => {
                          handleBulkClose('not_reachable');
                          setShowMobileFilters(false);
                        }}
                        disabled={loading}
                        className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded-lg font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <AlertCircle size={18} />
                        <span>Mark as Invalid Number</span>
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Quick Actions */}
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
                        fetchTodayData();
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
        
        {/* Desktop Filters and Actions */}
        <div className={`hidden md:block rounded-xl shadow p-6 mb-8 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex-1">
              <h3 className={`font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>Filter & Actions</h3>
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
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="called">Called</option>
                  <option value="closed">Closed</option>
                  <option value="converted">Converted</option>
                  <option value="contacted">Contacted</option>
                </select>
              </div>
            </div>
            
            {/* Bulk Actions - Desktop */}
            {selectedData.length > 0 && (
              <div className="flex flex-col space-y-3">
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedData.length} record{selectedData.length !== 1 ? 's' : ''} selected
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleBulkClose('converted')}
                    disabled={loading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50"
                  >
                    <CheckCircle size={18} />
                    <span>Mark as Converted</span>
                  </button>
                  <button
                    onClick={() => handleBulkClose('closed')}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Check size={18} />
                    <span>Mark as Closed</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Data Table */}
        <div className={`rounded-xl shadow overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`p-4 md:p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
              <div>
                <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>Today's Data List</h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Showing {filteredData.length} of {todayData.length} records
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
                <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Loading today's data...</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-12">
                <FileText className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} size={48} />
                <p className={`text-lg mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>No data found</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {searchQuery || filterStatus !== 'all' 
                    ? 'Try changing your filters' 
                    : 'No data has been assigned to you today'}
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
                                Assigned: {formatDate(item.assignedAt)}
                              </div>
                            )}
                            
                            {item.calledAt && (
                              <div className="text-xs sm:text-sm text-blue-500">
                                Called: {formatDate(item.calledAt)}
                              </div>
                            )}
                            
                            {item.closedAt && (
                              <div className="text-xs sm:text-sm text-green-500">
                                Closed: {formatDate(item.closedAt)}
                              </div>
                            )}
                            
                            {item.responseType && (
                              <div className={`text-xs sm:text-sm font-medium ${getResponseTypeColor(item.responseType)}`}>
                                <CheckCircle size={10} className="inline mr-1" />
                                Response: {getResponseTypeText(item.responseType)}
                              </div>
                            )}
                            
                            {item.callAttempts > 0 && (
                              <div className="text-xs sm:text-sm text-purple-500">
                                <PhoneCall size={10} className="inline mr-1" />
                                Calls: {item.callAttempts}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end shrink-0">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium mb-2 sm:mb-3 ${getStatusColor(item)}`}>
                            {getStatusIcon(item)}
                            <span className="ml-1 whitespace-nowrap">{getStatusText(item)}</span>
                          </span>
                          
                          {/* Actions for Mobile */}
                          {!['converted', 'rejected', 'not_reachable'].includes(item.status) && (
                            <div className="flex flex-col space-y-1.5 sm:space-y-2 w-full sm:w-auto">
                              <button
                                onClick={() => handleCall(item._id, item.contact)}
                                disabled={loading || item.status === 'contacted'}
                                className={`px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center justify-center space-x-1 text-xs sm:text-sm w-full sm:w-auto ${
                                  item.status === 'contacted'
                                    ? darkMode
                                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : darkMode
                                    ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-800/30 active:bg-blue-700/30'
                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200 active:bg-blue-300'
                                } transition-colors`}
                              >
                                <Phone size={12} className="sm:w-3.5 sm:h-3.5" />
                                <span className="whitespace-nowrap">{item.status === 'contacted' ? 'Called' : 'Call'}</span>
                              </button>
                              
                              <div className="relative w-full sm:w-auto" ref={el => dropdownRefs.current[item._id] = el}>
                                <button
                                  onClick={() => toggleDropdown(item._id)}
                                  disabled={loading}
                                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center justify-center space-x-1 text-xs sm:text-sm w-full sm:w-auto ${
                                    darkMode 
                                      ? 'bg-green-900/30 text-green-300 hover:bg-green-800/30 active:bg-green-700/30' 
                                      : 'bg-green-100 text-green-700 hover:bg-green-200 active:bg-green-300'
                                  } transition-colors`}
                                >
                                  <CheckCircle size={12} className="sm:w-3.5 sm:h-3.5" />
                                  <span className="whitespace-nowrap">Close</span>
                                  <ChevronRight size={12} className="sm:w-3.5 sm:h-3.5" />
                                </button>
                                
                                {/* Dropdown Menu */}
                                {openDropdownId === item._id && (
                                  <div className={`absolute right-0 top-full mt-1 w-48 sm:w-56 rounded-lg shadow-lg z-20 ${
                                    darkMode 
                                      ? 'bg-gray-800 border-gray-700' 
                                      : 'bg-white border-gray-200'
                                  } border`}>
                                    <div className="py-1">
                                      <button
                                        onClick={() => handleClose(item._id, 'converted')}
                                        className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                                          darkMode
                                            ? 'text-emerald-300 hover:bg-emerald-900/30'
                                            : 'text-emerald-700 hover:bg-emerald-50'
                                        }`}
                                      >
                                        <CheckCircle size={14} className="mr-2" />
                                        Interested (Convert)
                                      </button>
                                      <button
                                        onClick={() => handleClose(item._id, 'closed')}
                                        className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                                          darkMode
                                            ? 'text-green-300 hover:bg-green-900/30'
                                            : 'text-green-700 hover:bg-green-50'
                                        }`}
                                      >
                                        <Check size={14} className="mr-2" />
                                        Not Interested
                                      </button>
                                      
                                      <button
                                        onClick={() => handleClose(item._id, 'not_reachable')}
                                        className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                                          darkMode
                                            ? 'text-orange-300 hover:bg-orange-900/30'
                                            : 'text-orange-700 hover:bg-orange-50'
                                        }`}
                                      >
                                        <AlertCircle size={14} className="mr-2" />
                                        Invalid Number
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Show closed status if already closed */}
                          {['converted', 'rejected', 'not_reachable'].includes(item.status) && (
                            <div className="flex flex-col items-end">
                              <span className="text-sm font-medium">
                                {item.status === 'converted' ? 'Converted' : 
                                 item.status === 'rejected' ? 'Rejected' : 
                                 'Not Reachable'}
                              </span>
                              {item.responseType && (
                                <span className={`text-xs ${getResponseTypeColor(item.responseType)}`}>
                                  ({getResponseTypeText(item.responseType)})
                                </span>
                              )}
                            </div>
                          )}
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
                        Actions
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
                                Assigned: {formatDate(item.assignedAt)}
                              </div>
                            )}
                            {item.calledAt && (
                              <div className="text-sm text-blue-500">
                                Called: {formatDate(item.calledAt)}
                              </div>
                            )}
                            {item.closedAt && (
                              <div className="text-sm text-green-500">
                                Closed: {formatDate(item.closedAt)}
                              </div>
                            )}
                            {/* Response Type Display */}
                            {item.responseType && (
                              <div className={`text-sm font-medium ${getResponseTypeColor(item.responseType)}`}>
                                <CheckCircle size={12} className="inline mr-1" />
                                Response: {getResponseTypeText(item.responseType)}
                              </div>
                            )}
                            {/* Call attempts display */}
                            {item.callAttempts > 0 && (
                              <div className="text-sm text-purple-500">
                                <PhoneCall size={12} className="inline mr-1" />
                                Calls: {item.callAttempts}
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
                          <div className="flex items-center space-x-2">
                            {/* Show actions only if not closed/converted/rejected/not_reachable */}
                            {!['converted', 'rejected', 'not_reachable'].includes(item.status) && (
                              <>
                                <button
                                  onClick={() => handleCall(item._id, item.contact)}
                                  disabled={loading || item.status === 'contacted'}
                                  className={`px-3 py-2 rounded-lg flex items-center space-x-2 ${
                                    item.status === 'contacted'
                                      ? darkMode
                                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                      : darkMode
                                      ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-800/30'
                                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                  }`}
                                >
                                  <Phone size={16} />
                                  <span>{item.status === 'contacted' ? 'Called' : 'Call'}</span>
                                </button>
                                
                                <div className="relative" ref={el => dropdownRefs.current[item._id] = el}>
                                  <button
                                    onClick={() => toggleDropdown(item._id)}
                                    disabled={loading}
                                    className={`px-3 py-2 rounded-lg flex items-center space-x-2 ${
                                      darkMode 
                                        ? 'bg-green-900/30 text-green-300 hover:bg-green-800/30' 
                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                    }`}
                                  >
                                    <CheckCircle size={16} />
                                    <span>Close</span>
                                    <ChevronRight size={16} />
                                  </button>
                                  
                                  {/* Dropdown Menu */}
                                  {openDropdownId === item._id && (
                                    <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-10 ${
                                      darkMode 
                                        ? 'bg-gray-800 border-gray-700' 
                                        : 'bg-white border-gray-200'
                                    } border`}>
                                      <div className="py-1">
                                        <button
                                          onClick={() => handleClose(item._id, 'converted')}
                                          className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                                            darkMode
                                              ? 'text-emerald-300 hover:bg-emerald-900/30'
                                              : 'text-emerald-700 hover:bg-emerald-50'
                                          }`}
                                        >
                                          <CheckCircle size={14} className="mr-2" />
                                          Interested (Convert)
                                        </button>
                                        <button
                                          onClick={() => handleClose(item._id, 'closed')}
                                          className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                                            darkMode
                                              ? 'text-green-300 hover:bg-green-900/30'
                                              : 'text-green-700 hover:bg-green-50'
                                          }`}
                                        >
                                          <Check size={14} className="mr-2" />
                                          Not Interested
                                        </button>
                                        
                                        <button
                                          onClick={() => handleClose(item._id, 'not_reachable')}
                                          className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                                            darkMode
                                              ? 'text-orange-300 hover:bg-orange-900/30'
                                              : 'text-orange-700 hover:bg-orange-50'
                                          }`}
                                        >
                                          <AlertCircle size={14} className="mr-2" />
                                          Invalid Number
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                            
                            {/* Show closed status if already closed */}
                            {['converted', 'rejected', 'not_reachable'].includes(item.status) && (
                              <div className="flex flex-col items-start">
                                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {item.status === 'converted' ? 'Converted' : 
                                   item.status === 'rejected' ? 'Rejected' : 
                                   'Not Reachable'}
                                </span>
                                {item.responseType && (
                                  <span className={`text-xs ${getResponseTypeColor(item.responseType)}`}>
                                    ({getResponseTypeText(item.responseType)})
                                  </span>
                                )}
                              </div>
                            )}
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
                      darkMode ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      <Clock size={12} className="mr-1" />
                      Pending: {todaysCounts.pending}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'
                    }`}>
                      <PhoneCall size={12} className="mr-1" />
                      Called: {todaysCounts.called}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'
                    }`}>
                      <CheckCircle size={12} className="mr-1" />
                      Closed: {todaysCounts.closed}
                    </span>
                  </div>
                </div>
                
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p>Assigned today: {formatDateFull(todayData[0]?.assignedAt)}</p>
                  <p>Data automatically moves to previous if not closed</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Result Display */}
        {result && (
          <div className={`mt-6 rounded-xl p-4 md:p-6 ${
            result.success 
              ? darkMode 
                ? 'bg-emerald-900/20 border border-emerald-800/50' 
                : 'bg-green-50 border border-green-200'
              : darkMode 
                ? 'bg-red-900/20 border border-red-800/50' 
                : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start">
              <div className={`p-2 rounded-lg mr-4 ${
                result.success 
                  ? darkMode ? 'bg-emerald-900/30' : 'bg-green-100'
                  : darkMode ? 'bg-red-900/30' : 'bg-red-100'
              }`}>
                {result.success ? (
                  <CheckCircle className={darkMode ? 'text-emerald-400' : 'text-green-600'} size={24} />
                ) : (
                  <AlertCircle className={darkMode ? 'text-red-400' : 'text-red-600'} size={24} />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${
                  result.success 
                    ? darkMode ? 'text-emerald-300' : 'text-green-800'
                    : darkMode ? 'text-red-300' : 'text-red-800'
                }`}>
                  {result.success ? 'Success!' : 'Error'}
                </h3>
                <p className={`mt-1 ${
                  result.success 
                    ? darkMode ? 'text-emerald-400' : 'text-green-700'
                    : darkMode ? 'text-red-400' : 'text-red-700'
                }`}>
                  {result.message || result.error}
                </p>
                
                {result.data && (
                  <div className="mt-4">
                    {result.data.closedCount && (
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {result.data.closedCount} record{result.data.closedCount !== 1 ? 's' : ''} updated
                      </p>
                    )}
                    {result.data.errorCount > 0 && (
                      <p className={`text-sm mt-2 ${
                        darkMode ? 'text-red-400' : 'text-red-600'
                      }`}>
                        {result.data.errorCount} error{result.data.errorCount !== 1 ? 's' : ''} occurred
                      </p>
                    )}
                    {result.data.responseType && (
                      <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Response: {getResponseTypeText(result.data.responseType)}
                      </p>
                    )}
                  </div>
                )}
                
                {result.errors && result.errors.length > 0 && (
                  <div className="mt-4">
                    <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Errors:</h4>
                    <div className="space-y-1">
                      {result.errors.map((error, index) => (
                        <div key={index} className={`text-sm flex items-start ${
                          darkMode ? 'text-red-400' : 'text-red-600'
                        }`}>
                          <AlertCircle size={14} className="mr-2 mt-0.5 shrink-0" />
                          <span>ID {error.dataId}: {error.error}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTodayDataPage;