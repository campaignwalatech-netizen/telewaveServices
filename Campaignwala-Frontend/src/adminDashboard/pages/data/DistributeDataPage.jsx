// DistributeDataPage.jsx - FIXED VERSION

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Users, Search, Upload, UserPlus, 
  CheckCircle, XCircle, RefreshCw,
  ArrowRight, ChevronDown, User, Crown,
  MoreVertical, FileText, Eye,
  Grid, List,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Info
} from 'lucide-react';
import dataService from '../../../services/dataService';
import userService from '../../../services/userService';
import toast, { Toaster } from 'react-hot-toast';

// Custom debounce function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const DistributeDataPage = ({ darkMode = false, setDarkMode }) => {
  // State for data table
  const [uploadedData, setUploadedData] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedData, setSelectedData] = useState([]);
  const [viewMode, setViewMode] = useState('table');
  const [batchFilter, setBatchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [availableBatches, setAvailableBatches] = useState([]);
  
  // State for distribution
  const [showDistributionModal, setShowDistributionModal] = useState(false);
  const [distributionType, setDistributionType] = useState('');
  const [count, setCount] = useState(10);
  const [selectedTL, setSelectedTL] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [TLs, setTLs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [availableDataCount, setAvailableDataCount] = useState(0);
  const [distributionCounts, setDistributionCounts] = useState({
    present_today: 0,
    without_data: 0,
    all_active: 0,
    team_leaders: 0,
    pending_data: 0
  });
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // Search debounce reference
  const debouncedSearchRef = useRef();

  // Initialize debounce
  useEffect(() => {
    debouncedSearchRef.current = debounce((searchValue) => {
      if (searchValue !== searchTerm) {
        setSearchTerm(searchValue);
        setCurrentPage(1);
      }
    }, 500);

    return () => {
      if (debouncedSearchRef.current) {
        debouncedSearchRef.current.cancel?.();
      }
    };
  }, []);

  // Fetch distribution counts with user details - FIXED VERSION
  const fetchDistributionCounts = async () => {
    try {
      console.log('Fetching distribution counts...');
      
      // Get counts from data service
      const countsResult = await dataService.getDistributionCounts();
      console.log('Counts result from dataService:', countsResult);
      
      // Extract pending_data count from the response
      let pendingDataCount = 0;
      if (countsResult.success) {
        // Try different possible response structures
        pendingDataCount = countsResult.counts?.pending_data || 
                          countsResult.data?.pending_data || 
                          countsResult.pending_data || 
                          0;
        console.log('Pending data count found:', pendingDataCount);
      }

      // Fetch user counts for each distribution type
      const [presentUsersResult, teamLeadersResult, allUsersResult] = await Promise.all([
        userService.getPresentUsers({ status: 'active' }),
        userService.getTeamLeaders({ status: 'active' }),
        userService.getAllUsers({ 
          role: 'user', 
          status: 'active',
          limit: 1000 
        }).catch(() => ({ success: false, data: [] }))
      ]);

      console.log('User results:', {
        presentUsers: presentUsersResult,
        teamLeaders: teamLeadersResult,
        allUsers: allUsersResult
      });

      // Process present users count
      let presentTodayCount = 0;
      if (presentUsersResult.success) {
        presentTodayCount = presentUsersResult.data?.length || 
                          presentUsersResult.count || 
                          presentUsersResult.users?.length || 
                          (presentUsersResult.data && Array.isArray(presentUsersResult.data) ? presentUsersResult.data.length : 0);
      }

      // Process team leaders count
      let teamLeadersCount = 0;
      if (teamLeadersResult.success) {
        teamLeadersCount = teamLeadersResult.data?.length || 
                          teamLeadersResult.count || 
                          teamLeadersResult.users?.length || 
                          (teamLeadersResult.data && Array.isArray(teamLeadersResult.data) ? teamLeadersResult.data.length : 0);
      }

      // Process all active users count - FIXED
      let allActiveCount = 0;
      if (allUsersResult.success) {
        // Check different possible response structures
        if (allUsersResult.data && Array.isArray(allUsersResult.data)) {
          allActiveCount = allUsersResult.data.length;
        } else if (allUsersResult.data?.users && Array.isArray(allUsersResult.data.users)) {
          allActiveCount = allUsersResult.data.users.length;
        } else if (allUsersResult.data?.data && Array.isArray(allUsersResult.data.data)) {
          allActiveCount = allUsersResult.data.data.length;
        } else if (allUsersResult.count) {
          allActiveCount = allUsersResult.count;
        } else if (allUsersResult.pagination?.total) {
          allActiveCount = allUsersResult.pagination.total;
        }
      }

      const counts = {
        present_today: presentTodayCount,
        all_active: allActiveCount,
        team_leaders: teamLeadersCount,
        pending_data: pendingDataCount,
        without_data: Math.max(0, presentTodayCount) // Using present count as base
      };

      console.log('Calculated counts:', counts);

      setDistributionCounts(counts);
      setAvailableDataCount(pendingDataCount);
      
    } catch (error) {
      console.error('Error fetching distribution counts:', error);
      // Set default counts on error
      const defaultCounts = {
        present_today: 0,
        without_data: 0,
        all_active: 0,
        team_leaders: 0,
        pending_data: 0
      };
      setDistributionCounts(defaultCounts);
      setAvailableDataCount(0);
    }
  };

  // Fetch uploaded data with filters
  const fetchUploadedData = useCallback(async (page = 1) => {
    try {
      setLoadingData(true);
      const filters = {
        page,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        batchNumber: batchFilter || undefined,
        status: statusFilter || undefined,
        date: dateFilter || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      // Remove undefined filters
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

      console.log('Fetching uploaded data with filters:', filters);
      const result = await dataService.getPendingData(filters);
      console.log('Uploaded data result:', result);
      
      if (result.success) {
        setUploadedData(result.data || []);
        setTotalItems(result.pagination?.total || result.data?.length || 0);
        setCurrentPage(page);
        
        // Update available data count from the uploaded data
        // This is a fallback if getDistributionCounts doesn't work
        if (result.data && result.data.length > 0) {
          // Count only pending data
          const pendingData = result.data.filter(item => 
            item.distributionStatus === 'pending' || 
            !item.distributionStatus
          );
          if (pendingData.length > 0 && availableDataCount === 0) {
            console.log('Setting available data count from uploaded data:', pendingData.length);
            setAvailableDataCount(pendingData.length);
            setDistributionCounts(prev => ({
              ...prev,
              pending_data: pendingData.length
            }));
          }
        }
      } else {
        console.error('Failed to fetch data:', result.error);
        setUploadedData([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setUploadedData([]);
      setTotalItems(0);
    } finally {
      setLoadingData(false);
    }
  }, [searchTerm, batchFilter, statusFilter, dateFilter, itemsPerPage, availableDataCount]);

  // Fetch available batches
  const fetchAvailableBatches = async () => {
    try {
      const batchesResult = await dataService.getAllBatches();
      if (batchesResult.success && batchesResult.data) {
        const batchNumbers = [...new Set(batchesResult.data.map(batch => batch.batchNumber))].filter(Boolean);
        setAvailableBatches(batchNumbers);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  // Fetch available users and TLs with better error handling - FIXED
  const fetchUsersAndTLs = async () => {
    try {
      console.log('Fetching users and TLs...');
      
      // Get active TLs
      const tlsResult = await userService.getTeamLeaders({ status: 'active' });
      console.log('TLs result:', tlsResult);
      
      let tlsData = [];
      if (tlsResult.success) {
        // Handle different response structures
        if (Array.isArray(tlsResult.data)) {
          tlsData = tlsResult.data;
        } else if (Array.isArray(tlsResult.users)) {
          tlsData = tlsResult.users;
        } else if (tlsResult.data?.data && Array.isArray(tlsResult.data.data)) {
          tlsData = tlsResult.data.data;
        }
      }
      setTLs(tlsData);
      console.log('TLs data set:', tlsData.length);
      
      // Get active users (HR)
      let usersResult;
      try {
        usersResult = await userService.getAllUsers({ 
          role: 'user', 
          status: 'active',
          limit: 1000 
        });
      } catch (error) {
        console.log('Trying getApprovedUsers...');
        usersResult = await userService.getApprovedUsers({ 
          status: 'active',
          limit: 1000 
        });
      }
      
      console.log('Users result:', usersResult);
      
      let usersData = [];
      if (usersResult.success) {
        // Handle different response structures
        if (Array.isArray(usersResult.data)) {
          usersData = usersResult.data;
        } else if (Array.isArray(usersResult.users)) {
          usersData = usersResult.users;
        } else if (usersResult.data?.users && Array.isArray(usersResult.data.users)) {
          usersData = usersResult.data.users;
        } else if (usersResult.data?.data && Array.isArray(usersResult.data.data)) {
          usersData = usersResult.data.data;
        } else if (usersResult.data && typeof usersResult.data === 'object') {
          // Try to extract array from nested structure
          for (const key in usersResult.data) {
            if (Array.isArray(usersResult.data[key])) {
              usersData = usersResult.data[key];
              break;
            }
          }
        }
      }
      
      setUsers(usersData);
      console.log('Users data set:', usersData.length);
      
    } catch (error) {
      console.error('Error fetching users/TLs:', error);
      setTLs([]);
      setUsers([]);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchUploadedData();
    fetchUsersAndTLs();
    fetchAvailableBatches();
    fetchDistributionCounts();
  }, []);

  // Refresh when filters change
  useEffect(() => {
    fetchUploadedData(1);
  }, [searchTerm, batchFilter, statusFilter, dateFilter, itemsPerPage]);

  // Handle search input with debounce
  const handleSearchChange = (value) => {
    if (debouncedSearchRef.current) {
      debouncedSearchRef.current(value);
    }
  };

  // Handle data selection
  const handleSelectData = (id) => {
    setSelectedData(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedData.length === uploadedData.length) {
      setSelectedData([]);
    } else {
      setSelectedData(uploadedData.map(item => item._id));
    }
  };

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1);
    fetchUploadedData(1);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setBatchFilter('');
    setStatusFilter('');
    setDateFilter('');
    setCurrentPage(1);
    fetchUploadedData(1);
  };

  // Refresh data
  const refreshData = () => {
    fetchUploadedData(currentPage);
    fetchDistributionCounts();
    fetchUsersAndTLs();
  };

  // Open distribution modal with specific type - FIXED
  const openDistributionModal = (type) => {
    setDistributionType(type);
    setShowDistributionModal(true);
    setResult(null);
    
    // Reset selections
    setSelectedTL('');
    setSelectedUser('');
    
    // Set default count based on availability and distribution type
    const maxCount = Math.min(100, availableDataCount || 10); // Default to 10 if 0
    let defaultCount;
    
    switch(type) {
      case 'present_today':
      case 'without_data':
        defaultCount = Math.min(10, maxCount);
        break;
      case 'all_active':
        defaultCount = Math.min(5, maxCount);
        break;
      case 'particular_employee':
      case 'team_leaders':
        defaultCount = Math.min(10, maxCount);
        break;
      default:
        defaultCount = Math.min(10, maxCount);
    }
    
    setCount(defaultCount);
  };

  // Handle distribution
  const handleDistribute = async () => {
    let distributionResult;
    setLoading(true);
    setResult(null);
    
    try {
      console.log('Starting distribution with type:', distributionType, 'count:', count);
      
      switch (distributionType) {
        case 'present_today':
        case 'without_data':
        case 'all_active':
        case 'team_leaders':
          distributionResult = await dataService.bulkAssignData(distributionType, count);
          break;
          
        case 'particular_employee':
          if (!selectedUser) {
            toast.error('Please select an employee');
            setLoading(false);
            return;
          }
          distributionResult = await dataService.assignDataToUser(count, selectedUser);
          break;
          
        case 'team_leaders_specific':
          if (!selectedTL) {
            toast.error('Please select a Team Leader');
            setLoading(false);
            return;
          }
          distributionResult = await dataService.assignDataToTL(count, selectedTL);
          break;
          
        default:
          toast.error('Invalid distribution type');
          setLoading(false);
          return;
      }

      console.log('Distribution result:', distributionResult);
      setResult(distributionResult);
      
      if (distributionResult.success) {
        toast.success(`Successfully distributed ${count} records!`);
        setTimeout(() => {
          setShowDistributionModal(false);
          refreshData();
        }, 2000);
      } else {
        toast.error(distributionResult.error || 'Failed to distribute data');
      }
    } catch (error) {
      console.error('Distribution error:', error);
      toast.error(error.message || 'An error occurred during distribution');
      setResult({
        success: false,
        error: 'An error occurred during distribution',
        details: error.message
      });
    }
    
    setLoading(false);
  };

  // Pagination handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchUploadedData(page);
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPrevPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // Calculate total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  // Items per page options
  const itemsPerPageOptions = [5, 10, 25, 50, 100];

  // Distribution type options with counts - FIXED
  const distributionOptions = [
    {
      id: 'present_today',
      title: 'Present HR Today',
      description: 'Distribute to HR users who are present today',
      icon: Users,
      color: 'bg-green-500',
      count: distributionCounts.present_today || 0,
      info: 'Users marked as present today'
    },
    {
      id: 'without_data',
      title: 'Present HR who didn\'t get Data Today',
      description: 'Distribute to present HR without assigned data today',
      icon: UserPlus,
      color: 'bg-blue-500',
      count: distributionCounts.without_data || 0,
      info: 'Present users with no leads assigned today'
    },
    {
      id: 'all_active',
      title: 'To All HR with Active Status',
      description: 'Distribute to all active HR users',
      icon: Users,
      color: 'bg-purple-500',
      count: distributionCounts.all_active || 0,
      info: 'All active HR users regardless of attendance'
    },
    {
      id: 'particular_employee',
      title: 'To Particular Employee',
      description: 'Distribute to a specific employee',
      icon: User,
      color: 'bg-orange-500',
      count: users.length || 0,
      info: 'Select specific employee from list'
    },
    {
      id: 'team_leaders',
      title: 'To Team Leaders',
      description: 'Distribute to Team Leaders',
      icon: Crown,
      color: 'bg-red-500',
      count: distributionCounts.team_leaders || 0,
      info: 'All active Team Leaders'
    },
    {
      id: 'team_leaders_specific',
      title: 'To Specific Team Leader',
      description: 'Distribute to a specific Team Leader',
      icon: Crown,
      color: 'bg-indigo-500',
      count: TLs.length || 0,
      info: 'Select specific Team Leader from list'
    }
  ];

  // Status options
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'distributed', label: 'Distributed' },
    { value: 'withdrawn', label: 'Withdrawn' }
  ];

  // Get available count for current distribution type
  const getAvailableCountForType = () => {
    if (distributionType === 'particular_employee') {
      return users.length;
    }
    if (distributionType === 'team_leaders_specific') {
      return TLs.length;
    }
    
    const option = distributionOptions.find(opt => opt.id === distributionType);
    return option ? option.count : 0;
  };

  // Get user details for display
  const getUserDisplayInfo = (userId) => {
    const user = users.find(u => u._id === userId);
    return user ? `${user.name || 'Unknown'} (${user.phoneNumber || user.email || 'No contact'})` : 'Unknown User';
  };

  const getTLDisplayInfo = (tlId) => {
    const tl = TLs.find(t => t._id === tlId);
    return tl ? `${tl.name || 'Unknown'} (${tl.phoneNumber || tl.email || 'No contact'})` : 'Unknown TL';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate actual pending data from uploadedData
  const actualPendingData = uploadedData.filter(item => 
    item.distributionStatus === 'pending' || !item.distributionStatus
  ).length;

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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Uploaded Data</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and distribute uploaded data</p>
        </div>
        
        {/* Action Buttons - FIXED: Allow opening modal even if availableDataCount is 0 */}
        <div className="flex space-x-3">
          <button
            onClick={refreshData}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg disabled:opacity-50"
            title="Refresh Data"
            disabled={loadingData}
          >
            <RefreshCw size={18} className={loadingData ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={() => openDistributionModal('')}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50"
            // REMOVED: disabled={availableDataCount === 0} - Allow opening modal to check status
          >
            <ArrowRight size={18} />
            <span>Distribute Data</span>
            {availableDataCount > 0 && (
              <span className="bg-blue-800 text-white text-xs px-2 py-1 rounded-full">
                {availableDataCount} available
              </span>
            )}
            {availableDataCount === 0 && uploadedData.length > 0 && (
              <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded-full">
                Check status
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards - FIXED: Show actual pending data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Uploaded</p>
              <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-gray-100">{totalItems}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Pending: <span className="font-semibold text-blue-600 dark:text-blue-400">{actualPendingData}</span>
          </div>
        </div>
        
        {distributionOptions.slice(0, 5).map((option) => (
          <div key={option.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{option.title}</p>
                <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-gray-100">{option.count}</p>
              </div>
              <div className={`w-12 h-12 ${option.color.replace('500', '100')} dark:${option.color.replace('500', '900')} rounded-full flex items-center justify-center`}>
                {React.createElement(option.icon, { className: `${option.color.replace('bg-', 'text-')} dark:${option.color.replace('bg-', 'text-').replace('600', '400')}`, size: 24 })}
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              {option.info}
            </div>
          </div>
        ))}
      </div>

      {/* Rest of the component remains mostly the same, but fix the modal opening logic */}

      {/* Distribution Modal - FIXED: Show actual pending data count */}
      {showDistributionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Distribute Data</h2>
                <button
                  onClick={() => setShowDistributionModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                  disabled={loading}
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {availableDataCount > 0 ? 
                  `You have ${availableDataCount} pending records to distribute` : 
                  'No pending data available. All data may already be distributed.'}
              </p>
            </div>

            {/* Distribution Options - FIXED: Show actual counts */}
            {!distributionType ? (
              <div className="p-6">
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Info className="text-yellow-600 mr-3" size={20} />
                    <div>
                      <p className="text-sm text-yellow-700 font-medium">
                        Data Availability Status
                      </p>
                      <p className="text-sm text-yellow-600 mt-1">
                        Total pending data: <span className="font-bold">{availableDataCount}</span> records
                        {uploadedData.length > 0 && (
                          <span className="ml-4">
                            (Filtered view: <span className="font-bold">{actualPendingData}</span> pending)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {distributionOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => openDistributionModal(option.id)}
                      disabled={option.count === 0}
                      className={`p-6 border-2 rounded-xl transition-all text-left hover:shadow-sm ${
                        option.count === 0
                          ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className={`${option.color} p-3 rounded-lg mr-4`}>
                          <option.icon className="text-white" size={24} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-800 dark:text-gray-100">{option.title}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{option.description}</p>
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-sm font-medium">
                              {option.count} {option.id.includes('team') ? 'TLs' : 'users'}
                            </div>
                          </div>
                          {option.info && (
                            <div className="mt-3 flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <Info size={14} className="mr-1" />
                              <span>{option.info}</span>
                            </div>
                          )}
                          {option.count === 0 && (
                            <div className="mt-2 text-xs text-red-500">
                              No {option.id.includes('team') ? 'Team Leaders' : 'users'} available
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                
                {/* Advanced Options Toggle */}
                <div className="mt-6 pt-6 border-t">
                  <button
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
                  >
                    <ChevronDown className={`mr-2 transform ${showAdvancedOptions ? 'rotate-180' : ''}`} size={16} />
                    Advanced Options
                  </button>
                  
                  {showAdvancedOptions && (
                    <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Distribution Settings</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Max per user:</span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">5 (default)</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Round robin:</span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">Enabled</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Daily limit per user:</span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">20</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Statistics</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Total users:</span>
                              <span className="font-medium text-blue-600 dark:text-blue-400">{users.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Total TLs:</span>
                              <span className="font-medium text-green-600 dark:text-green-400">{TLs.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Pending data:</span>
                              <span className="font-medium text-purple-600 dark:text-purple-400">{availableDataCount}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Distribution Form - FIXED: Show actual data availability */
              <div className="p-6">
                {/* Back button */}
                <button
                  onClick={() => setDistributionType('')}
                  className="mb-6 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
                  disabled={loading}
                >
                  ← Back to options
                </button>

                {/* Selected Option Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-4">
                      {distributionOptions.find(opt => opt.id === distributionType)?.icon && 
                        React.createElement(distributionOptions.find(opt => opt.id === distributionType).icon, {
                          className: "text-blue-600",
                          size: 24
                        })
                      }
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-800">
                        {distributionOptions.find(opt => opt.id === distributionType)?.title}
                      </h3>
                      <p className="text-sm text-blue-600">
                        {distributionOptions.find(opt => opt.id === distributionType)?.description}
                      </p>
                    </div>
                    <div className="bg-white px-3 py-1 rounded-lg border border-blue-200">
                      <span className="text-sm font-medium text-blue-700">
                        Available: {getAvailableCountForType()}
                      </span>
                    </div>
                  </div>
                  {availableDataCount === 0 && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-700">
                        <strong>Note:</strong> No pending data available. All data may already be distributed.
                      </p>
                    </div>
                  )}
                </div>

                {/* Count Input - FIXED: Allow manual input even if count is 0 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Data Records to Distribute
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      value={count}
                      onChange={(e) => setCount(parseInt(e.target.value))}
                      className="w-full"
                      min="1"
                      max={Math.max(1000, availableDataCount || 1000)} // Minimum range of 1-1000
                      disabled={availableDataCount === 0}
                    />
                    <input
                      type="number"
                      value={count}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        const max = Math.max(1000, availableDataCount || 1000);
                        const clampedValue = Math.max(1, Math.min(max, value));
                        setCount(clampedValue);
                      }}
                      className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                      min="1"
                      max={Math.max(1000, availableDataCount || 1000)}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Available: <span className="font-medium text-gray-900 dark:text-gray-100">{availableDataCount || 'Checking...'}</span> records</span>
                    <span>Will distribute: <span className="font-medium text-blue-600 dark:text-blue-400">{count}</span> records</span>
                  </div>
                  {availableDataCount === 0 && (
                    <div className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
                      <Info size={14} className="inline mr-1" />
                      You can still attempt distribution, but there may be no data available.
                    </div>
                  )}
                </div>

                {/* Additional Fields for Specific Options */}
                {distributionType === 'particular_employee' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Employee
                    </label>
                    <select
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={users.length === 0 || loading}
                    >
                      <option value="">Select Employee...</option>
                      {users.map(person => (
                        <option key={person._id} value={person._id}>
                          {person.name || 'Unknown'} - {person.phoneNumber || person.email || 'No contact'} 
                          {person.employeeId ? ` (${person.employeeId})` : ''}
                        </option>
                      ))}
                    </select>
                    {selectedUser && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Selected: {getUserDisplayInfo(selectedUser)}
                      </div>
                    )}
                    {users.length === 0 && (
                      <div className="mt-2 text-sm text-red-500 dark:text-red-400">
                        No active employees available
                      </div>
                    )}
                  </div>
                )}

                {distributionType === 'team_leaders_specific' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Team Leader
                    </label>
                    <select
                      value={selectedTL}
                      onChange={(e) => setSelectedTL(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={TLs.length === 0 || loading}
                    >
                      <option value="">Select Team Leader...</option>
                      {TLs.map(tl => (
                        <option key={tl._id} value={tl._id}>
                          {tl.name || 'Unknown'} - {tl.phoneNumber || tl.email || 'No contact'}
                          {tl.teamName ? ` (Team: ${tl.teamName})` : ''}
                        </option>
                      ))}
                    </select>
                    {selectedTL && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Selected: {getTLDisplayInfo(selectedTL)}
                      </div>
                    )}
                    {TLs.length === 0 && (
                      <div className="mt-2 text-sm text-red-500 dark:text-red-400">
                        No active Team Leaders available
                      </div>
                    )}
                  </div>
                )}

                {/* Distribution Summary */}
                <div className="mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Distribution Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Distribution Type:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {distributionOptions.find(opt => opt.id === distributionType)?.title}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Records to distribute:</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">{count}</span>
                    </div>
                    {distributionType === 'particular_employee' && selectedUser && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">To Employee:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {getUserDisplayInfo(selectedUser)}
                        </span>
                      </div>
                    )}
                    {distributionType === 'team_leaders_specific' && selectedTL && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">To Team Leader:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {getTLDisplayInfo(selectedTL)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Available data:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {availableDataCount} records
                      </span>
                    </div>
                    {availableDataCount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Remaining after distribution:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {Math.max(0, availableDataCount - count)} records
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons - FIXED: Allow attempting distribution even if count is 0 */}
                <div className="flex space-x-4">
                  <button
                    onClick={handleDistribute}
                    disabled={loading || 
                      (distributionType === 'particular_employee' && !selectedUser) ||
                      (distributionType === 'team_leaders_specific' && !selectedTL)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Distributing...</span>
                      </>
                    ) : (
                      <>
                        <ArrowRight size={18} />
                        <span>{availableDataCount > 0 ? 'Distribute Now' : 'Attempt Distribution'}</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setShowDistributionModal(false)}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>

                {/* Result Display */}
                {result && (
                  <div className={`mt-6 rounded-lg p-4 ${
                    result.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  }`}>
                    <div className="flex items-center">
                      {result.success ? (
                        <CheckCircle className="text-green-600 dark:text-green-400 mr-3" size={24} />
                      ) : (
                        <XCircle className="text-red-600 dark:text-red-400 mr-3" size={24} />
                      )}
                      <div className="flex-1">
                        <p className={`font-medium ${
                          result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                        }`}>
                          {result.success ? 'Success!' : 'Failed'}
                        </p>
                        <p className={`text-sm ${result.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                          {result.message || result.error || 'Distribution completed'}
                        </p>
                        {result.data && (
                          <div className={`mt-2 text-xs ${result.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {result.data.dataCount && `Records: ${result.data.dataCount}`}
                            {result.data.userName && ` • User: ${result.data.userName}`}
                            {result.data.distributedCount && ` • Distributed: ${result.data.distributedCount}`}
                            {result.data.userCount && ` • Users: ${result.data.userCount}`}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DistributeDataPage;