// TodayAssignedDataPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar, User, FileText, Download, Filter, Search,
  RefreshCw, Mail, Phone, Clock, Info, CheckCircle
} from 'lucide-react';
import dataService from '../../../services/dataService';
import userService from '../../../services/userService';
import toast, { Toaster } from 'react-hot-toast';

const TodayAssignedDataPage = ({ darkMode = false, setDarkMode }) => {
  const [assignedData, setAssignedData] = useState([]);
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
    assignedTo: '',
    assignedType: 'all',
    sortBy: 'assignedAt',
    sortOrder: 'desc'
  });
  const [stats, setStats] = useState({
    totalAssigned: 0,
    assignedToUsers: 0,
    assignedToTLs: 0,
    directAssignments: 0,
    bulkAssignments: 0
  });
  const [exporting, setExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);
  const [apiError, setApiError] = useState(null);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const fetchAssignedData = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const today = getTodayDate();
      console.log('Fetching today assigned data with filters:', filters);
      
      // Build params for API call (without pagination - we'll paginate after filtering)
      const params = {
        search: filters.search || undefined,
        batchNumber: filters.batchNumber || undefined,
        assignedTo: filters.assignedTo || undefined,
        assignedType: filters.assignedType !== 'all' ? filters.assignedType : undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        limit: 10000 // Get large dataset to filter properly
      };

      // Remove undefined params
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });

      console.log('API params:', params);
      
      // Get all data (we'll filter by assigned date on client side)
      // This gets all data, then we filter for today's assignments
      const result = await dataService.getPendingData(params);
      
      console.log('API Response:', result);
      
      if (result.success) {
        const data = result.data || [];
        console.log('Processed data sample:', data.length > 0 ? data[0] : 'No data');
        
        // Filter data that was assigned TODAY
        const todayAssigned = data.filter(item => {
          // Check assignedAt (direct assignment from admin)
          if (item.assignedAt) {
            const assignedDate = new Date(item.assignedAt).toISOString().split('T')[0];
            if (assignedDate === today) {
              return true;
            }
          }
          
          // Check teamAssignments for assignments made today
          if (item.teamAssignments && Array.isArray(item.teamAssignments)) {
            const todayAssignments = item.teamAssignments.filter(ta => {
              if (ta.withdrawn) return false;
              if (ta.assignedAt) {
                const taDate = new Date(ta.assignedAt).toISOString().split('T')[0];
                return taDate === today;
              }
              return false;
            });
            
            if (todayAssignments.length > 0) {
              return true;
            }
          }
          
          return false;
        });

        console.log('Today assigned data:', todayAssigned.length, 'items');
        
        // Apply pagination to filtered results
        const startIndex = (pagination.page - 1) * pagination.limit;
        const endIndex = startIndex + pagination.limit;
        const paginatedData = todayAssigned.slice(startIndex, endIndex);
        
        setAssignedData(paginatedData);
        setPagination(prev => ({
          ...prev,
          total: todayAssigned.length,
          totalPages: Math.ceil(todayAssigned.length / pagination.limit) || 1
        }));
      } else {
        console.error('Failed to fetch assigned data:', result.error);
        const errorMsg = result.error || 'Failed to fetch assigned data';
        setApiError(errorMsg);
        toast.error(errorMsg);
        setAssignedData([]);
      }
    } catch (error) {
      console.error('Error fetching assigned data:', error);
      const errorMsg = error.message || 'Error fetching data';
      setApiError(errorMsg);
      toast.error(errorMsg);
      setAssignedData([]);
    }
    setLoading(false);
  }, [pagination.page, pagination.limit, filters]);

  const fetchStats = useCallback(async () => {
    try {
      const today = getTodayDate();
      // Get all data to calculate stats
      const result = await dataService.getPendingData({
        limit: 10000
      });
      
      if (result.success) {
        const data = result.data || [];
        // Filter data assigned today
        const todayAssigned = data.filter(item => {
          // Check assignedAt (direct assignment from admin)
          if (item.assignedAt) {
            const assignedDate = new Date(item.assignedAt).toISOString().split('T')[0];
            if (assignedDate === today) {
              return true;
            }
          }
          
          // Check teamAssignments for assignments made today
          if (item.teamAssignments && Array.isArray(item.teamAssignments)) {
            const todayAssignments = item.teamAssignments.filter(ta => {
              if (ta.withdrawn) return false;
              if (ta.assignedAt) {
                const taDate = new Date(ta.assignedAt).toISOString().split('T')[0];
                return taDate === today;
              }
              return false;
            });
            
            if (todayAssignments.length > 0) {
              return true;
            }
          }
          
          return false;
        });

        const assignedToUsers = todayAssigned.filter(item => 
          item.assignedType === 'direct_user' || item.assignedType === 'all_active' || item.assignedType === 'present_today' || item.assignedType === 'without_data'
        ).length;
        const assignedToTLs = todayAssigned.filter(item => item.assignedType === 'tl').length;
        const directAssignments = todayAssigned.filter(item => item.assignedType === 'direct_user').length;
        const bulkAssignments = todayAssigned.filter(item => 
          item.assignedType === 'all_active' || item.assignedType === 'present_today' || item.assignedType === 'without_data'
        ).length;

        setStats({
          totalAssigned: todayAssigned.length,
          assignedToUsers,
          assignedToTLs,
          directAssignments,
          bulkAssignments
        });
      } else {
        calculateStatsFromData();
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      calculateStatsFromData();
    }
  }, [assignedData]);

  const calculateStatsFromData = () => {
    const assignedToUsers = assignedData.filter(item => 
      item.assignedType === 'direct_user' || item.assignedType === 'all_active' || item.assignedType === 'present_today' || item.assignedType === 'without_data'
    ).length;
    const assignedToTLs = assignedData.filter(item => item.assignedType === 'tl').length;
    const directAssignments = assignedData.filter(item => item.assignedType === 'direct_user').length;
    const bulkAssignments = assignedData.filter(item => 
      item.assignedType === 'all_active' || item.assignedType === 'present_today' || item.assignedType === 'without_data'
    ).length;

    setStats({
      totalAssigned: assignedData.length,
      assignedToUsers,
      assignedToTLs,
      directAssignments,
      bulkAssignments
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
    fetchAssignedData();
    fetchUsersList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters]);

  useEffect(() => {
    fetchStats();
  }, [assignedData]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const today = getTodayDate();
      const params = {
        status: 'assigned',
        assignedDate: today,
        search: filters.search || undefined,
        batchNumber: filters.batchNumber || undefined,
        assignedTo: filters.assignedTo || undefined,
        assignedType: filters.assignedType !== 'all' ? filters.assignedType : undefined
      };

      // Remove undefined params
      Object.keys(params).forEach(key => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      const result = await dataService.exportDataToExcel(params);
      
      if (result.success) {
        console.log('Export successful');
        toast.success('Export successful! Download started.');
      } else {
        toast.error(result.error || 'Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
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

  const getAssignedTypeLabel = (type) => {
    const labels = {
      'direct_user': 'Direct to User',
      'tl': 'To Team Leader',
      'all_active': 'All Active Users',
      'present_today': 'Present Today',
      'without_data': 'Without Data Today'
    };
    return labels[type] || type || 'Unknown';
  };

  const getAssignedToUser = (item) => {
    if (item.assignedTo) {
      return {
        name: item.assignedTo.name || item.assignedTo.fullName || 'Unknown User',
        contact: item.assignedTo.phoneNumber || item.assignedTo.email || 'N/A',
        userId: item.assignedTo._id || item.assignedTo.id
      };
    }

    // Check teamAssignments
    if (item.teamAssignments && Array.isArray(item.teamAssignments)) {
      const activeAssignment = item.teamAssignments.find(ta => !ta.withdrawn);
      if (activeAssignment && activeAssignment.teamMember) {
        const user = activeAssignment.teamMember;
        return {
          name: user.name || user.fullName || 'Unknown User',
          contact: user.phoneNumber || user.email || 'N/A',
          userId: user._id
        };
      }
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
      assignedTo: '',
      assignedType: 'all',
      sortBy: 'assignedAt',
      sortOrder: 'desc'
    });
  };

  const handleRefresh = () => {
    fetchAssignedData();
    fetchStats();
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: darkMode ? {
            background: '#1F2937',
            color: '#fff',
            border: '1px solid #374151'
          } : {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: darkMode ? {
              background: '#065F46',
              border: '1px solid #047857'
            } : {
              background: '#059669',
            },
          },
          error: {
            duration: 5000,
            style: darkMode ? {
              background: '#7F1D1D',
              border: '1px solid #991B1B'
            } : {
              background: '#DC2626',
            },
          },
        }}
      />
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">Today's Assigned Data</h1>
        <p className="text-gray-600 dark:text-gray-400">View all data records that were assigned today</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Assigned</p>
              <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-gray-100">{stats.totalAssigned}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">To Users</p>
              <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-gray-100">{stats.assignedToUsers}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <User className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">To Team Leaders</p>
              <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-gray-100">{stats.assignedToTLs}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <User className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Direct Assignments</p>
              <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-gray-100">{stats.directAssignments}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
              <User className="text-orange-600 dark:text-orange-400" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Bulk Assignments</p>
              <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-gray-100">{stats.bulkAssignments}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
              <User className="text-indigo-600 dark:text-indigo-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
          <div className="flex items-center space-x-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Today's Assigned Data Records</h3>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
              {getTodayDate()}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg flex items-center"
            >
              <Filter size={18} className="mr-2" />
              Filters
              {showFilters && <span className="ml-2">▼</span>}
            </button>
            
            <button
              onClick={handleExport}
              disabled={exporting || loading || assignedData.length === 0}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center disabled:opacity-50"
            >
              <Download size={18} className="mr-2" />
              {exporting ? 'Exporting...' : 'Export Excel'}
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by name, phone..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Assignment Type
                </label>
                <select
                  value={filters.assignedType}
                  onChange={(e) => handleFilterChange('assignedType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="direct_user">Direct to User</option>
                  <option value="tl">To Team Leader</option>
                  <option value="all_active">All Active Users</option>
                  <option value="present_today">Present Today</option>
                  <option value="without_data">Without Data Today</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Batch Number
                </label>
                <input
                  type="text"
                  placeholder="Batch number"
                  value={filters.batchNumber}
                  onChange={(e) => handleFilterChange('batchNumber', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Assigned To
                </label>
                <select
                  value={filters.assignedTo}
                  onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="assignedAt">Assigned Time</option>
                  <option value="name">Name</option>
                  <option value="createdAt">Created Time</option>
                  <option value="batchNumber">Batch Number</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg w-full"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Today's Assigned Data List</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Showing {assignedData.length} of {pagination.total} assigned records for today
              </p>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading assigned data...</p>
            </div>
          ) : apiError ? (
            <div className="text-center py-12 text-red-500 dark:text-red-400">
              <Info className="mx-auto mb-4" size={48} />
              <p className="text-lg mb-2 text-gray-900 dark:text-gray-100">Error Loading Data</p>
              <p className="text-sm mb-4 text-gray-600 dark:text-gray-400">{apiError}</p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : assignedData.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <FileText className="mx-auto mb-4 text-gray-400 dark:text-gray-500" size={48} />
              <p className="text-lg mb-2 text-gray-900 dark:text-gray-100">No assigned data found</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">No records were assigned today or match your filters</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Date
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Assignment Type
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User Contact
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Assigned Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {assignedData.map((item) => {
                  const assignedToUser = getAssignedToUser(item);
                  const userFromList = getUserFromList(assignedToUser.userId);
                  const assignedDate = item.assignedAt || 
                                     (item.teamAssignments && item.teamAssignments.find?.(ta => !ta.withdrawn)?.assignedAt);

                  return (
                    <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {formatDate(assignedDate)}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{item.name || 'Unknown'}</div>
                          {item.email && (
                            <div className="text-sm truncate flex items-center text-gray-500 dark:text-gray-400">
                              <Mail size={12} className="mr-1" />
                              {item.email}
                            </div>
                          )}
                          {item.batchNumber && (
                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              Batch: {item.batchNumber}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-mono text-gray-900 dark:text-gray-100">{item.contact || 'N/A'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.assignedType === 'direct_user' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                            : item.assignedType === 'tl'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        }`}>
                          {getAssignedTypeLabel(item.assignedType)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <User size={14} className="mr-2 text-gray-400 dark:text-gray-500" />
                          <span className="font-medium text-gray-900 dark:text-gray-100">{assignedToUser.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {userFromList ? (userFromList.phoneNumber || userFromList.email || 'N/A') : assignedToUser.contact}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDateTime(assignedDate)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination */}
        {assignedData.length > 0 && pagination.totalPages > 1 && (
          <div className="p-6 border-t bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Page {pagination.page} of {pagination.totalPages} • 
                  Showing {assignedData.length} of {pagination.total} records
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                          : 'border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

export default TodayAssignedDataPage;

