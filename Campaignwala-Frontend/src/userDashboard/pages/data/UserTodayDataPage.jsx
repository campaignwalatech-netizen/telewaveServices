// UserTodayDataPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Phone, PhoneCall, CheckCircle, Clock, RefreshCw,
  User, FileText, AlertCircle, ArrowRight, Calendar,
  Target, ChevronRight, Filter, Search, Check
} from 'lucide-react';
import dataService from '../../../services/dataService';
import userService from '../../../services/userService';

const UserTodayDataPage = () => {
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
            // This assumes the current user's assignment is in teamAssignments
            userAssignment = item.teamAssignments.find(ta => !ta.withdrawn);
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
  };

  const filteredData = filterTodayData();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Today's Assigned Data</h1>
        <p className="text-gray-600">Manage your assigned data for today</p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <Target className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Assigned</p>
              <p className="text-2xl font-bold">{todaysCounts.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg mr-4">
              <Clock className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold">{todaysCounts.pending}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <PhoneCall className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Called</p>
              <p className="text-2xl font-bold">{todaysCounts.called}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Closed</p>
              <p className="text-2xl font-bold">{todaysCounts.closed}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters and Actions */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex-1">
            <h3 className="font-semibold mb-4">Filter & Actions</h3>
            <div className="flex flex-wrap gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name, contact..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="called">Called</option>
                <option value="closed">Closed</option>
                <option value="converted">Converted</option>
                <option value="contacted">Contacted</option>
              </select>
              
              <button
                onClick={fetchTodayData}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
          
          {/* Bulk Actions */}
          {selectedData.length > 0 && (
            <div className="flex flex-col space-y-3">
              <div className="text-sm text-gray-600">
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
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Today's Data List</h2>
              <p className="text-gray-600 text-sm">
                Showing {filteredData.length} of {todayData.length} records
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {selectedData.length} selected
              </div>
              {filteredData.length > 0 && (
                <button
                  onClick={selectAllData}
                  className="text-sm text-blue-600 hover:text-blue-800"
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
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading today's data...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-lg mb-2">No data found</p>
              <p className="text-sm">No data has been assigned to you today</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-6 text-left">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filteredData.length > 0 && selectedData.length === filteredData.length}
                        onChange={selectAllData}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </div>
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name / Contact
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedData.includes(item._id)}
                        onChange={() => toggleDataSelection(item._id)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-gray-900">{item.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-600 font-mono">{item.contact || 'No contact'}</div>
                        {item.email && (
                          <div className="text-sm text-gray-500 truncate">{item.email}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <FileText size={14} className="mr-2" />
                          <span>Batch: {item.batchNumber || 'N/A'}</span>
                        </div>
                        {item.source && (
                          <div className="text-sm text-gray-500">
                            Source: {item.source}
                          </div>
                        )}
                        {item.assignedAt && (
                          <div className="text-sm text-gray-500">
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
                          <div className="text-sm text-purple-600">
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
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
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
                                className="px-3 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg flex items-center space-x-2"
                              >
                                <CheckCircle size={16} />
                                <span>Close</span>
                                <ChevronRight size={16} />
                              </button>
                              
                              {/* Dropdown Menu */}
                              {openDropdownId === item._id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                  <div className="py-1">
                                    <button
                                      onClick={() => handleClose(item._id, 'converted')}
                                      className="w-full text-left px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50 flex items-center"
                                    >
                                      <CheckCircle size={14} className="mr-2" />
                                      Interested (Convert)
                                    </button>
                                    <button
                                      onClick={() => handleClose(item._id, 'closed')}
                                      className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 flex items-center"
                                    >
                                      <Check size={14} className="mr-2" />
                                      Not Interested
                                    </button>
                                    
                                    <button
                                      onClick={() => handleClose(item._id, 'not_reachable')}
                                      className="w-full text-left px-4 py-2 text-sm text-orange-700 hover:bg-orange-50 flex items-center"
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
                            <span className="text-sm font-medium text-gray-700">
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
          )}
        </div>
        
        {/* Data Summary */}
        {filteredData.length > 0 && (
          <div className="p-6 border-t bg-gray-50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-sm text-gray-600">
                  Showing {filteredData.length} record{filteredData.length !== 1 ? 's' : ''}
                </p>
                <div className="flex space-x-4 mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                    <Clock size={12} className="mr-1" />
                    Pending: {todaysCounts.pending}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    <PhoneCall size={12} className="mr-1" />
                    Called: {todaysCounts.called}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    <CheckCircle size={12} className="mr-1" />
                    Closed: {todaysCounts.closed}
                  </span>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>Assigned today: {formatDateFull(todayData[0]?.assignedAt)}</p>
                <p>Data automatically moves to previous if not closed</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Result Display */}
      {result && (
        <div className={`mt-6 rounded-xl p-6 ${
          result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start">
            <div className={`p-2 rounded-lg mr-4 ${
              result.success ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {result.success ? (
                <CheckCircle className="text-green-600" size={24} />
              ) : (
                <AlertCircle className="text-red-600" size={24} />
              )}
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.success ? 'Success!' : 'Error'}
              </h3>
              <p className={`mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                {result.message || result.error}
              </p>
              
              {result.data && (
                <div className="mt-4">
                  {result.data.closedCount && (
                    <p className="text-sm text-gray-600">
                      {result.data.closedCount} record{result.data.closedCount !== 1 ? 's' : ''} updated
                    </p>
                  )}
                  {result.data.errorCount > 0 && (
                    <p className="text-sm text-red-600 mt-2">
                      {result.data.errorCount} error{result.data.errorCount !== 1 ? 's' : ''} occurred
                    </p>
                  )}
                  {result.data.responseType && (
                    <p className="text-sm text-gray-600 mt-2">
                      Response: {getResponseTypeText(result.data.responseType)}
                    </p>
                  )}
                </div>
              )}
              
              {result.errors && result.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Errors:</h4>
                  <div className="space-y-1">
                    {result.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-600 flex items-start">
                        <AlertCircle size={14} className="mr-2 mt-0.5 flex-shrink-0" />
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
  );
};

export default UserTodayDataPage;