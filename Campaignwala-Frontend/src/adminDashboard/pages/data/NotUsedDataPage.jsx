// NotUsedDataPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, Download, Filter, Search,
  RefreshCw, Mail, Phone, Clock, Info, AlertCircle, XCircle
} from 'lucide-react';
import dataService from '../../../services/dataService';
import toast, { Toaster } from 'react-hot-toast';

const NotUsedDataPage = ({ darkMode = false }) => {
  const [unusedData, setUnusedData] = useState([]);
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
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [stats, setStats] = useState({
    totalUnused: 0,
    oldestUnused: null,
    newestUnused: null,
    batchesCount: 0
  });
  const [exporting, setExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [apiError, setApiError] = useState(null);

  const fetchUnusedData = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      console.log('Fetching unused data with filters:', filters);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        batchNumber: filters.batchNumber || undefined,
        status: 'pending', // Only get pending/unused data
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
      
      // Use getPendingData to get all pending data, then filter for truly unused
      const result = await dataService.getPendingData(params);
      
      console.log('API Response:', result);
      
      if (result.success) {
        const data = result.data || [];
        console.log('Processed data sample:', data.length > 0 ? data[0] : 'No data');
        
        // Filter data that hasn't been assigned at all (not used = not assigned)
        const trulyUnused = data.filter(item => {
          // Data is unused if:
          // 1. distributionStatus is 'pending' (not assigned/distributed)
          // 2. No assignedTo field (never assigned to anyone)
          // 3. No active teamAssignments (no active assignments, or all withdrawn)
          
          const hasAssignedTo = item.assignedTo && item.assignedTo._id;
          
          const hasActiveTeamAssignments = item.teamAssignments && 
                                         Array.isArray(item.teamAssignments) && 
                                         item.teamAssignments.some(ta => !ta.withdrawn);
          
          // Unused = pending status AND no assignment to anyone
          return item.distributionStatus === 'pending' && 
                 !hasAssignedTo && 
                 !hasActiveTeamAssignments;
        });

        console.log('Unused data:', trulyUnused.length, 'items');
        setUnusedData(trulyUnused);
        setPagination(prev => ({
          ...prev,
          total: result.pagination?.total || trulyUnused.length,
          totalPages: result.pagination?.pages || Math.ceil(trulyUnused.length / pagination.limit) || 1
        }));
      } else {
        console.error('Failed to fetch unused data:', result.error);
        const errorMsg = result.error || 'Failed to fetch unused data';
        setApiError(errorMsg);
        toast.error(errorMsg);
        setUnusedData([]);
      }
    } catch (error) {
      console.error('Error fetching unused data:', error);
      const errorMsg = error.message || 'Error fetching data';
      setApiError(errorMsg);
      toast.error(errorMsg);
      setUnusedData([]);
    }
    setLoading(false);
  }, [pagination.page, pagination.limit, filters]);

  const calculateStatsFromData = useCallback(() => {
    const batches = [...new Set(unusedData.map(item => item.batchNumber))].filter(Boolean);
    const dates = unusedData
      .map(item => item.createdAt)
      .filter(Boolean)
      .sort((a, b) => new Date(a) - new Date(b));

    setStats({
      totalUnused: unusedData.length,
      oldestUnused: dates.length > 0 ? dates[0] : null,
      newestUnused: dates.length > 0 ? dates[dates.length - 1] : null,
      batchesCount: batches.length
    });
  }, [unusedData]);

  const fetchStats = useCallback(async () => {
    try {
      const result = await dataService.getPendingData({
        status: 'pending',
        limit: 10000 // Get all to calculate stats
      });
      
      if (result.success) {
        const data = result.data || [];
        const trulyUnused = data.filter(item => {
          const hasAssignedTo = item.assignedTo && item.assignedTo._id;
          const hasActiveTeamAssignments = item.teamAssignments && 
                                         Array.isArray(item.teamAssignments) && 
                                         item.teamAssignments.some(ta => !ta.withdrawn);
          return item.distributionStatus === 'pending' && 
                 !hasAssignedTo && 
                 !hasActiveTeamAssignments;
        });

        const batches = [...new Set(trulyUnused.map(item => item.batchNumber))].filter(Boolean);
        const dates = trulyUnused
          .map(item => item.createdAt)
          .filter(Boolean)
          .sort((a, b) => new Date(a) - new Date(b));

        setStats({
          totalUnused: trulyUnused.length,
          oldestUnused: dates.length > 0 ? dates[0] : null,
          newestUnused: dates.length > 0 ? dates[dates.length - 1] : null,
          batchesCount: batches.length
        });
      } else {
        calculateStatsFromData();
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      calculateStatsFromData();
    }
  }, [calculateStatsFromData]);

  useEffect(() => {
    fetchUnusedData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters]);

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unusedData]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {
        status: 'pending',
        search: filters.search || undefined,
        batchNumber: filters.batchNumber || undefined
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
    } catch {
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
    } catch {
      return 'Invalid Date';
    }
  };

  const getDaysSinceCreated = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const created = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - created);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } catch {
      return 'N/A';
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      batchNumber: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const handleRefresh = () => {
    fetchUnusedData();
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
        <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">Not Used Data</h1>
        <p className="text-gray-600 dark:text-gray-400">View all data records that haven't been assigned or used yet</p>
      </div>

      
      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
          <div className="flex items-center space-x-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Unused Data Records</h3>
            <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-medium">
              Not Assigned
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
              disabled={exporting || loading || unusedData.length === 0}
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
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="createdAt">Created Time</option>
                  <option value="name">Name</option>
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
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Unused Data List</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Showing {unusedData.length} of {pagination.total} unused records
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                <AlertCircle size={12} className="mr-1" />
                Not Assigned
              </span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading unused data...</p>
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
          ) : unusedData.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <FileText className="mx-auto mb-4 text-gray-400 dark:text-gray-500" size={48} />
              <p className="text-lg mb-2 text-gray-900 dark:text-gray-100">No unused data found</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">All data has been assigned or used, or no data matches your filters</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Created Date
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Batch Number
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Days Since Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {unusedData.map((item) => {
                  return (
                    <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {formatDate(item.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDateTime(item.createdAt)}
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
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-mono text-gray-900 dark:text-gray-100">{item.contact || 'N/A'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {item.batchNumber || 'N/A'}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          <XCircle size={12} className="mr-1" />
                          Not Used
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {getDaysSinceCreated(item.createdAt)}
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
        {unusedData.length > 0 && pagination.totalPages > 1 && (
          <div className="p-6 border-t bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Page {pagination.page} of {pagination.totalPages} • 
                  Showing {unusedData.length} of {pagination.total} records
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

export default NotUsedDataPage;

