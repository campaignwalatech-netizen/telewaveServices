import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Upload, UserPlus, 
  Target, CheckCircle, XCircle, RefreshCw,
  ArrowRight, ChevronDown, User, Crown,
  MoreVertical, Download, FileText, Eye,
  Grid, List, Filter as FilterIcon, Settings
} from 'lucide-react';
import dataService from '../../../services/dataService';
import userService from '../../../services/userService';

const DistributeDataPage = () => {
  // State for data table
  const [uploadedData, setUploadedData] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedData, setSelectedData] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
  
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

  // Fetch uploaded data
  const fetchUploadedData = async (page = 1) => {
    try {
      setLoadingData(true);
      const result = await dataService.getPendingData({
        page,
        limit: itemsPerPage,
        search: searchTerm || undefined
      });
      
      if (result.success) {
        setUploadedData(result.data || []);
        setTotalItems(result.pagination?.total || 0);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingData(false);
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
      }
    } catch (error) {
      console.error('Error fetching users/TLs:', error);
    }
  };

  useEffect(() => {
    fetchUploadedData();
    fetchUsersAndTLs();
  }, []);

  useEffect(() => {
    fetchUploadedData(1);
  }, [searchTerm]);

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
          // Distribute to present HR today
          distributionResult = await dataService.bulkAssignData('present_today', count);
          break;
          
        case 'without_data':
          // Distribute to HR who didn't get data today
          distributionResult = await dataService.bulkAssignData('without_data', count);
          break;
          
        case 'all_active':
          // Distribute to all active HR
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
        fetchUploadedData(); // Refresh data
        fetchUsersAndTLs(); // Refresh counts
      } else {
        alert(`Error: ${distributionResult.error}`);
      }
    } catch (error) {
      console.error('Distribution error:', error);
      alert('An error occurred during distribution');
    }
    
    setLoading(false);
  };

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

  // Calculate total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
        {/* Table Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <button className="p-2 border rounded-lg hover:bg-gray-50">
              <FilterIcon size={18} />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            >
              <List size={18} />
            </button>
            <button 
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-lg ${viewMode === 'card' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            >
              <Grid size={18} />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedData.length === uploadedData.length && uploadedData.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
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
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : uploadedData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No data found
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
                        className="rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{item.contact}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {item.batchNumber || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        item.distributionStatus === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.distributionStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => fetchUploadedData(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => fetchUploadedData(pageNum)}
                  className={`px-3 py-1 rounded ${
                    currentPage === pageNum 
                      ? 'bg-blue-600 text-white' 
                      : 'border hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => fetchUploadedData(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
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
                      className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
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
                  <input
                    type="number"
                    value={count}
                    onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    max={availableDataCount}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Available: {availableDataCount} records
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
                      <option value="">Choose...</option>
                      {(distributionType === 'particular_employee' ? users : TLs).map(person => (
                        <option key={person._id} value={person._id}>
                          {person.name} ({person.phoneNumber})
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