// CalledDataPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Phone, PhoneCall, PhoneForwarded, PhoneOff, PhoneMissed,
  RefreshCw, User, FileText, Download, Filter, Search,
  BarChart3, Calendar, ChevronDown, Mail, Clock, Info, MessageSquare
} from 'lucide-react';
import dataService from '../../../services/dataService';
import userService from '../../../services/userService';

const CalledDataPage = () => {
  const [calledData, setCalledData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1
  });
  const [filters, setFilters] = useState({
    search: '',
    batchNumber: '',
    responseType: 'all', // all, interested, not_interested, call_back, invalid_number
    startDate: '',
    endDate: '',
    assignedTo: '',
    sortBy: 'teamAssignments.contactedAt',
    sortOrder: 'desc'
  });
  const [stats, setStats] = useState({
    totalCalled: 0,
    interested: 0,
    notInterested: 0,
    callBack: 0,
    invalidNumber: 0,
    averageCallsPerData: 0
  });
  const [exporting, setExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);
  const [apiError, setApiError] = useState(null);

  const fetchCalledData = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      console.log('Fetching called data with filters:', filters);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        batchNumber: filters.batchNumber || undefined,
        responseType: filters.responseType !== 'all' ? filters.responseType : undefined,
        assignedTo: filters.assignedTo || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      };

      // Remove undefined params
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });

      console.log('API params:', params);
      const result = await dataService.getCalledData(params);
      
      console.log('API Response:', result);
      
      if (result.success) {
        const data = result.data || [];
        console.log('Processed data sample:', data.length > 0 ? data[0] : 'No data');
        
        // Transform the data for called/contacted status
        const processedData = data.map(item => {
          // Find the contacted team assignment
          const contactedAssignment = item.teamAssignments?.find(ta => 
            ta.status === 'contacted' && !ta.withdrawn
          );

          if (contactedAssignment) {
            return {
              ...item,
              status: 'contacted',
              contactedAt: contactedAssignment.contactedAt || contactedAssignment.updatedAt,
              contactedBy: contactedAssignment.teamMember,
              callCount: contactedAssignment.callCount || 1,
              responseType: contactedAssignment.responseType || 'not_interested',
              callNotes: contactedAssignment.callNotes || contactedAssignment.notes,
              followUpDate: contactedAssignment.followUpDate,
              assignedAt: contactedAssignment.assignedAt || item.assignedAt,
              assignedTo: contactedAssignment.teamMember || item.assignedTo
            };
          }
          
          // Fallback to item data
          return {
            ...item,
            status: item.status || 'unknown',
            contactedAt: item.contactedAt || item.updatedAt,
            contactedBy: item.assignedTo,
            callCount: 1,
            responseType: item.responseType || 'not_interested',
            callNotes: item.notes,
            followUpDate: item.followUpDate,
            assignedAt: item.assignedAt
          };
        }).filter(item => item.status === 'contacted'); // Only show contacted items

        console.log('Filtered called data:', processedData.length, 'items');
        setCalledData(processedData);
        setPagination(prev => ({
          ...prev,
          total: result.pagination?.total || processedData.length,
          totalPages: result.pagination?.pages || Math.ceil(processedData.length / pagination.limit) || 1
        }));
      } else {
        console.error('Failed to fetch called data:', result.error);
        setApiError(result.error || 'Failed to fetch called data');
        setCalledData([]);
      }
    } catch (error) {
      console.error('Error fetching called data:', error);
      setApiError(error.message || 'Error fetching data');
      setCalledData([]);
    }
    setLoading(false);
  }, [pagination.page, pagination.limit, filters]);

  const fetchStats = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const params = {
        startDate: filters.startDate || today,
        endDate: filters.endDate || today,
        responseType: filters.responseType !== 'all' ? filters.responseType : undefined
      };

      const result = await dataService.getCalledStats(params);
      
      if (result.success && result.data) {
        setStats({
          totalCalled: result.data.totalCalled || 0,
          interested: result.data.interested || 0,
          notInterested: result.data.notInterested || 0,
          callBack: result.data.callBack || 0,
          invalidNumber: result.data.invalidNumber || 0,
          averageCallsPerData: result.data.averageCallsPerData || 0
        });
      } else {
        // Calculate stats from current data if API fails
        calculateStatsFromData();
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Calculate stats from current data
      calculateStatsFromData();
    }
  }, [filters, calledData]);

  const calculateStatsFromData = () => {
    const interested = calledData.filter(item => item.responseType === 'interested').length;
    const notInterested = calledData.filter(item => item.responseType === 'not_interested').length;
    const callBack = calledData.filter(item => item.responseType === 'call_back').length;
    const invalidNumber = calledData.filter(item => item.responseType === 'invalid_number').length;
    const totalCalled = calledData.length;
    
    const totalCallCount = calledData.reduce((sum, item) => sum + (item.callCount || 1), 0);
    const averageCallsPerData = totalCalled > 0 ? (totalCallCount / totalCalled).toFixed(1) : 0;

    setStats({
      totalCalled,
      interested,
      notInterested,
      callBack,
      invalidNumber,
      averageCallsPerData: parseFloat(averageCallsPerData)
    });
  };

  const fetchUsersList = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const result = await userService.getAllUsers({ limit: 100, status: 'active' });
      console.log('Users list API response:', result);
      
      if (result && result.success) {
        const usersArray = Array.isArray(result.data) ? result.data : [];
        
        if (usersArray.length === 0) {
          console.warn('No users found in response');
          setUsersError('No active users found');
        }
        
        console.log('Users array length:', usersArray.length);
        setUsersList(usersArray);
      } else {
        console.error('Failed to fetch users:', result?.error);
        setUsersError(result?.error || 'Failed to load users');
        setUsersList([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsersError(error.message || 'Error loading users');
      setUsersList([]);
    }
    setUsersLoading(false);
  };

  useEffect(() => {
    fetchCalledData();
    fetchUsersList();
  }, [pagination.page, filters]);

  useEffect(() => {
    fetchStats();
  }, [calledData]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {
        responseType: filters.responseType !== 'all' ? filters.responseType : undefined,
        search: filters.search || undefined,
        batchNumber: filters.batchNumber || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        assignedTo: filters.assignedTo || undefined
      };

      // Remove undefined params
      Object.keys(params).forEach(key => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      const result = await dataService.exportCalledDataToExcel(params);
      
      if (result.success) {
        console.log('Export successful');
        // Handle download
        if (result.data?.url) {
          window.open(result.data.url, '_blank');
        } else if (result.data?.blob) {
          const url = window.URL.createObjectURL(result.data.blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `called-data-export-${new Date().toISOString().split('T')[0]}.xlsx`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      } else {
        alert(`Export failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data');
    }
    setExporting(false);
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getResponseTypeConfig = (responseType) => {
    const configs = {
      interested: {
        color: 'bg-emerald-100 text-emerald-800',
        icon: PhoneCall,
        label: 'Interested'
      },
      not_interested: {
        color: 'bg-red-100 text-red-800',
        icon: PhoneMissed,
        label: 'Not Interested'
      },
      call_back: {
        color: 'bg-blue-100 text-blue-800',
        icon: PhoneForwarded,
        label: 'Call Back'
      },
      invalid_number: {
        color: 'bg-orange-100 text-orange-800',
        icon: PhoneOff,
        label: 'Invalid Number'
      },
      unknown: {
        color: 'bg-gray-100 text-gray-800',
        icon: Phone,
        label: 'Unknown'
      }
    };
    return configs[responseType] || configs.unknown;
  };

  const getContactedByUser = (item) => {
    // First check if we have direct contactedBy info
    if (item.contactedBy) {
      return {
        name: item.contactedBy.name || item.contactedBy.fullName || 'Unknown User',
        contact: item.contactedBy.phoneNumber || item.contactedBy.email || 'N/A',
        userId: item.contactedBy._id || item.contactedBy.id
      };
    }

    // Check teamAssignments
    if (item.teamAssignments && Array.isArray(item.teamAssignments)) {
      const contactedAssignment = item.teamAssignments.find(ta => 
        ta.status === 'contacted' && !ta.withdrawn
      );
      if (contactedAssignment && contactedAssignment.teamMember) {
        const user = contactedAssignment.teamMember;
        return {
          name: user.name || user.fullName || 'Unknown User',
          contact: user.phoneNumber || user.email || 'N/A',
          userId: user._id
        };
      }
    }

    // Check assignedTo
    if (item.assignedTo) {
      return {
        name: item.assignedTo.name || item.assignedTo.fullName || 'Unknown User',
        contact: item.assignedTo.phoneNumber || item.assignedTo.email || 'N/A',
        userId: item.assignedTo._id || item.assignedTo.id
      };
    }

    return { name: 'Not Assigned', contact: 'N/A', userId: null };
  };

  const getUserFromList = (userId) => {
    if (!userId || !Array.isArray(usersList)) return null;
    return usersList.find(user => user._id === userId || user.id === userId);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      batchNumber: '',
      responseType: 'all',
      startDate: '',
      endDate: '',
      assignedTo: '',
      sortBy: 'teamAssignments.contactedAt',
      sortOrder: 'desc'
    });
  };

  const getResponseTypeText = (responseType) => {
    switch (responseType) {
      case 'interested':
        return 'Interested';
      case 'not_interested':
        return 'Not Interested';
      case 'call_back':
        return 'Call Back';
      case 'invalid_number':
        return 'Invalid Number';
      default:
        return responseType || 'No Response';
    }
  };

  const handleRefresh = () => {
    fetchCalledData();
    fetchStats();
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Called Data</h1>
        <p className="text-gray-600">View all data records that have been contacted by users (Clicked on the call button)</p>
      </div>

      {/* Stats Overview */}
      
      {/* Controls */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
          <div className="flex items-center space-x-4">
            <h3 className="font-semibold text-gray-800">Called Data Records</h3>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <Filter size={18} className="mr-2" />
              Filters
              {showFilters && <ChevronDown size={18} className="ml-2 transform rotate-180" />}
            </button>
            
            <button
              onClick={handleExport}
              disabled={exporting || loading || calledData.length === 0}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center disabled:opacity-50"
            >
              <Download size={18} className="mr-2" />
              {exporting ? 'Exporting...' : 'Export Excel'}
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t pt-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by name, phone..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Type
                </label>
                <select
                  value={filters.responseType}
                  onChange={(e) => handleFilterChange('responseType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Responses</option>
                  <option value="interested">Interested</option>
                  <option value="not_interested">Not Interested</option>
                  <option value="call_back">Call Back</option>
                  <option value="invalid_number">Invalid Number</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch Number
                </label>
                <input
                  type="text"
                  placeholder="Batch number"
                  value={filters.batchNumber}
                  onChange={(e) => handleFilterChange('batchNumber', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Called By
                </label>
                <select
                  value={filters.assignedTo}
                  onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={usersLoading || usersError}
                >
                  <option value="">All Users</option>
                  {usersLoading ? (
                    <option disabled>Loading users...</option>
                  ) : usersError ? (
                    <option disabled>Error loading users</option>
                  ) : Array.isArray(usersList) && usersList.length > 0 ? (
                    usersList.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.name || user.fullName || `User ${user._id?.substring(0, 6)}`}
                      </option>
                    ))
                  ) : (
                    <option disabled>No users available</option>
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="teamAssignments.contactedAt">Contacted Time</option>
                  <option value="name">Name</option>
                  <option value="assignedAt">Assigned Time</option>
                  <option value="createdAt">Created Time</option>
                  <option value="batchNumber">Batch Number</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 w-full"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Called Data List</h2>
              <p className="text-gray-600 text-sm">
                Showing {calledData.length} of {pagination.total} contacted records
                {filters.responseType !== 'all' && ` • Response: ${getResponseTypeText(filters.responseType)}`}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-800">
                <PhoneCall size={12} className="mr-1" />
                Interested: {stats.interested}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                <PhoneMissed size={12} className="mr-1" />
                Not Interested: {stats.notInterested}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                <PhoneForwarded size={12} className="mr-1" />
                Call Back: {stats.callBack}
              </span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading called data...</p>
            </div>
          ) : apiError ? (
            <div className="text-center py-12 text-red-500">
              <Info className="mx-auto mb-4" size={48} />
              <p className="text-lg mb-2">Error Loading Data</p>
              <p className="text-sm mb-4">{apiError}</p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : calledData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-lg mb-2">No called data found</p>
              <p className="text-sm">No records have been contacted yet or match your filters</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Call Count
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Called By
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Contact
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacted Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {calledData.map((item) => {
                  const responseConfig = getResponseTypeConfig(item.responseType);
                  const ResponseIcon = responseConfig.icon;
                  const contactedByUser = getContactedByUser(item);
                  const userFromList = getUserFromList(contactedByUser.userId);
                  
                  // Get the contacted date
                  const contactedDate = item.contactedAt || item.updatedAt;

                  // Get assigned date
                  const assignedDate = item.assignedAt;

                  return (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-900">
                          {formatDate(contactedDate)}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-gray-900">{item.name || 'Unknown'}</div>
                          {item.email && (
                            <div className="text-sm text-gray-500 truncate flex items-center">
                              <Mail size={12} className="mr-1" />
                              {item.email}
                            </div>
                          )}
                          {item.batchNumber && (
                            <div className="text-xs text-gray-400 mt-1">
                              Batch: {item.batchNumber}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-mono text-gray-900">{item.contact || 'N/A'}</div>
                        {item.priority && (
                          <div className={`text-xs px-2 py-0.5 mt-1 rounded-full inline-block ${
                            item.priority === 'high' ? 'bg-red-100 text-red-800' :
                            item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {item.priority}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <ResponseIcon size={14} className="mr-2" />
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${responseConfig.color}`}>
                            {responseConfig.label}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <Phone size={14} className="mr-1 text-gray-400" />
                            {item.callCount || 1}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <User size={14} className="mr-2 text-gray-400" />
                          <span className="font-medium text-gray-900">{contactedByUser.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-600">
                          {userFromList ? (userFromList.phoneNumber || userFromList.email || 'N/A') : contactedByUser.contact}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-600">
                          {formatDateTime(contactedDate)}
                        </div>
                        {item.followUpDate && (
                          <div className="text-xs text-blue-600 flex items-center mt-1">
                            <Calendar size={12} className="mr-1" />
                            Follow-up: {formatDate(item.followUpDate)}
                          </div>
                        )}
                        {item.callNotes && (
                          <div className="text-xs text-gray-500 mt-1 truncate max-w-xs" title={item.callNotes}>
                            <MessageSquare size={12} className="inline mr-1" />
                            {item.callNotes.length > 30 ? `${item.callNotes.substring(0, 30)}...` : item.callNotes}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination */}
        {calledData.length > 0 && pagination.totalPages > 1 && (
          <div className="p-6 border-t bg-gray-50">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages} • 
                  Showing {calledData.length} of {pagination.total} records
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg ${
                        pagination.page === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalledDataPage;