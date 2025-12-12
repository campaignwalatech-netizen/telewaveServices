import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Users, Search, Filter, Upload, UserPlus, 
  Target, CheckCircle, XCircle, RefreshCw,
  ArrowRight, ChevronDown, User, Crown,
  MoreVertical, Download, FileText, Eye,
  Grid, List, Filter as FilterIcon, Settings,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import dataService from '../../../services/dataService';
import userService from '../../../services/userService';

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

const DistributeDataPage = () => {
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
  
  // State for distribution modal
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
        debouncedSearchRef.current.cancel?.(); // If using lodash-like API
      }
    };
  }, []);

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

      const result = await dataService.getPendingData(filters);
      
      if (result.success) {
        setUploadedData(result.data || []);
        setTotalItems(result.pagination?.total || 0);
        setCurrentPage(page);
      } else {
        console.error('Failed to fetch data:', result.error);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingData(false);
    }
  }, [searchTerm, batchFilter, statusFilter, dateFilter, itemsPerPage]);

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

  // Fetch available users and TLs
  const fetchUsersAndTLs = async () => {
    try {
      // Get TLs
      const tlsResult = await userService.getAllUsers({ role: 'TL', status: 'active' });
      if (tlsResult.success) {
        setTLs(tlsResult.data || []);
      }
      
      // Get users (HR)
      const usersResult = await userService.getAllUsers({ role: 'user', status: 'active' });
      if (usersResult.success) {
        setUsers(usersResult.data || []);
      }

      // Get pending data count
      const countResult = await dataService.getPendingData({ page: 1, limit: 1 });
      if (countResult.success) {
        setAvailableDataCount(countResult.pagination?.total || 0);
      } else {
        // Fallback: count from current data
        setAvailableDataCount(totalItems);
      }
    } catch (error) {
      console.error('Error fetching users/TLs:', error);
    }
  };

  useEffect(() => {
    fetchUploadedData();
    fetchUsersAndTLs();
    fetchAvailableBatches();
  }, [fetchUploadedData]);

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

  // Open distribution modal with specific type
  const openDistributionModal = (type) => {
    setDistributionType(type);
    setShowDistributionModal(true);
    setResult(null);
  };

  // Handle distribution
  const handleDistribute = async () => {
    let distributionResult;

    setLoading(true);
    
    try {
      switch (distributionType) {
        case 'present_today':
          distributionResult = await dataService.bulkAssignData('present_today', count);
          break;
          
        case 'without_data':
          distributionResult = await dataService.bulkAssignData('without_data', count);
          break;
          
        case 'all_active':
          distributionResult = await dataService.bulkAssignData('all_active', count);
          break;
          
        case 'particular_employee':
          if (!selectedUser) {
            alert('Please select an employee');
            setLoading(false);
            return;
          }
          distributionResult = await dataService.assignDataToUser(count, selectedUser);
          break;
          
        case 'team_leaders':
          if (!selectedTL) {
            alert('Please select a Team Leader');
            setLoading(false);
            return;
          }
          distributionResult = await dataService.assignDataToTL(count, selectedTL);
          break;
          
        default:
          alert('Invalid distribution type');
          setLoading(false);
          return;
      }

      setResult(distributionResult);
      
      if (distributionResult.success) {
        alert('Data distributed successfully!');
        setShowDistributionModal(false);
        fetchUploadedData();
        fetchUsersAndTLs();
      } else {
        alert(`Error: ${distributionResult.error}`);
      }
    } catch (error) {
      console.error('Distribution error:', error);
      alert('An error occurred during distribution');
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
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Items per page options
  const itemsPerPageOptions = [5, 10, 25, 50, 100];

  // Distribution type options
  const distributionOptions = [
    {
      id: 'present_today',
      title: 'Present HR Today',
      description: 'Distribute to HR users who are present today',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      id: 'without_data',
      title: 'Present HR who didn\'t get Data Today',
      description: 'Distribute to present HR without assigned data today',
      icon: UserPlus,
      color: 'bg-blue-500'
    },
    {
      id: 'all_active',
      title: 'To All HR with Active Status',
      description: 'Distribute to all active HR users',
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      id: 'particular_employee',
      title: 'To Particular Employee',
      description: 'Distribute to a specific employee',
      icon: User,
      color: 'bg-orange-500'
    },
    {
      id: 'team_leaders',
      title: 'To Team Leaders',
      description: 'Distribute to Team Leaders',
      icon: Crown,
      color: 'bg-red-500'
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Uploaded Data</h1>
          <p className="text-gray-600">Manage and distribute uploaded data</p>
        </div>
        
        {/* Distribution Button */}
        <div className="relative">
          <button
            onClick={() => openDistributionModal('')}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium flex items-center space-x-2"
          >
            <ArrowRight size={18} />
            <span>Distribute Data</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Total Uploaded</p>
              <p className="text-2xl font-bold mt-2">{totalItems}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Available for Distribution</p>
              <p className="text-2xl font-bold mt-2">{availableDataCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Target className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Selected</p>
              <p className="text-2xl font-bold mt-2">{selectedData.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <CheckCircle className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Current Page</p>
              <p className="text-2xl font-bold mt-2">{currentPage} / {totalPages || 1}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <List className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
        {/* Table Header with Filters */}
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            {/* Left side: Search and View Mode */}
            <div className="flex items-center space-x-4">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name, phone, batch..."
                  defaultValue={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="Table View"
                >
                  <List size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('card')}
                  className={`p-2 rounded-lg ${viewMode === 'card' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="Card View"
                >
                  <Grid size={18} />
                </button>
              </div>
            </div>

            {/* Right side: Filters and Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Batch Filter */}
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Batches</option>
                {availableBatches.map(batch => (
                  <option key={batch} value={batch}>{batch}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>

              {/* Date Filter */}
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />

              {/* Action Buttons */}
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Apply Filters
              </button>
              
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                Clear All
              </button>

              {/* Items per page selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {itemsPerPageOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <span className="text-sm text-gray-600">per page</span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left w-12">
                  <input
                    type="checkbox"
                    checked={uploadedData.length > 0 && selectedData.length === uploadedData.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loadingData ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                      <p className="text-gray-500">Loading data...</p>
                    </div>
                  </td>
                </tr>
              ) : uploadedData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="text-gray-400 mb-4" size={48} />
                      <p className="text-gray-500 text-lg font-medium mb-2">No data found</p>
                      <p className="text-gray-400">Try adjusting your filters or search term</p>
                    </div>
                  </td>
                </tr>
              ) : (
                uploadedData.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedData.includes(item._id)}
                        onChange={() => handleSelectData(item._id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{item.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900 font-mono">{item.contact || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {item.batchNumber || 'Default'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs rounded-full ${
                        item.distributionStatus === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : item.distributionStatus === 'assigned'
                          ? 'bg-blue-100 text-blue-800'
                          : item.distributionStatus === 'distributed'
                          ? 'bg-purple-100 text-purple-800'
                          : item.distributionStatus === 'withdrawn'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.distributionStatus || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button 
                          className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900"
                          title="More Options"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Left side: Items info */}
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
            <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
            <span className="font-medium">{totalItems}</span> entries
            {selectedData.length > 0 && (
              <span className="ml-4">
                (<span className="font-medium text-blue-600">{selectedData.length}</span> selected)
              </span>
            )}
          </div>

          {/* Right side: Pagination controls */}
          <div className="flex items-center space-x-2">
            {/* Page size selector (duplicate for mobile) */}
            <div className="flex items-center space-x-2 md:hidden">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                  fetchUploadedData(1);
                }}
                className="px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {itemsPerPageOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Pagination buttons */}
            <div className="flex items-center space-x-1">
              <button
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className="p-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                title="First Page"
              >
                <ChevronsLeft size={16} />
              </button>
              
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="p-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Page numbers */}
              <div className="flex items-center space-x-1">
                {(() => {
                  const pages = [];
                  const maxVisible = 5;
                  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                  let end = Math.min(totalPages, start + maxVisible - 1);
                  
                  if (end - start + 1 < maxVisible) {
                    start = Math.max(1, end - maxVisible + 1);
                  }

                  for (let i = start; i <= end; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => goToPage(i)}
                        className={`px-3 py-1 rounded ${
                          currentPage === i 
                            ? 'bg-blue-600 text-white' 
                            : 'border hover:bg-gray-50'
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }
                  return pages;
                })()}
              </div>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="p-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
              
              <button
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
                className="p-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                title="Last Page"
              >
                <ChevronsRight size={16} />
              </button>
            </div>

            {/* Page info */}
            <div className="text-sm text-gray-600 hidden md:block">
              Page {currentPage} of {totalPages || 1}
            </div>
          </div>
        </div>
      </div>

      {/* Distribution Modal */}
      {showDistributionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Distribute Data</h2>
                <button
                  onClick={() => setShowDistributionModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-600 mt-2">Choose how you want to distribute the data</p>
            </div>

            {/* Distribution Options */}
            {!distributionType ? (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {distributionOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => openDistributionModal(option.id)}
                      className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all text-left hover:shadow-sm"
                    >
                      <div className="flex items-start">
                        <div className={`${option.color} p-3 rounded-lg mr-4`}>
                          <option.icon className="text-white" size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{option.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Distribution Form */
              <div className="p-6">
                {/* Back button */}
                <button
                  onClick={() => setDistributionType('')}
                  className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
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
                    <div>
                      <h3 className="font-semibold text-blue-800">
                        {distributionOptions.find(opt => opt.id === distributionType)?.title}
                      </h3>
                      <p className="text-sm text-blue-600">
                        {distributionOptions.find(opt => opt.id === distributionType)?.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Count Input */}
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
                      max={Math.min(100, availableDataCount)}
                    />
                    <input
                      type="number"
                      value={count}
                      onChange={(e) => setCount(Math.max(1, Math.min(availableDataCount, parseInt(e.target.value) || 1)))}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                      min="1"
                      max={availableDataCount}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Available: <span className="font-medium">{availableDataCount}</span> records
                  </p>
                </div>

                {/* Additional Fields for Specific Options */}
                {(distributionType === 'particular_employee' || distributionType === 'team_leaders') && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {distributionType === 'particular_employee' ? 'Select Employee' : 'Select Team Leader'}
                    </label>
                    <select
                      value={distributionType === 'particular_employee' ? selectedUser : selectedTL}
                      onChange={(e) => 
                        distributionType === 'particular_employee' 
                          ? setSelectedUser(e.target.value)
                          : setSelectedTL(e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select {distributionType === 'particular_employee' ? 'Employee' : 'Team Leader'}...</option>
                      {(distributionType === 'particular_employee' ? users : TLs).map(person => (
                        <option key={person._id} value={person._id}>
                          {person.name} ({person.phoneNumber || person.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={handleDistribute}
                    disabled={loading}
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
                        <span>Distribute Now</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setShowDistributionModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>

                {/* Result Display */}
                {result && (
                  <div className={`mt-6 rounded-lg p-4 ${
                    result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center">
                      {result.success ? (
                        <CheckCircle className="text-green-600 mr-3" size={24} />
                      ) : (
                        <XCircle className="text-red-600 mr-3" size={24} />
                      )}
                      <div>
                        <p className={`font-medium ${
                          result.success ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {result.success ? 'Success!' : 'Failed'}
                        </p>
                        <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                          {result.data?.message || result.error}
                        </p>
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