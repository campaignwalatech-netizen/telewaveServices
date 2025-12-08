import React, { useState, useEffect } from 'react';
import { 
  Phone, MessageSquare, CheckCircle, XCircle, Clock,
  Filter, Search, RefreshCw, ChevronDown, MoreVertical,
  Eye, Edit, User, Calendar, Target
} from 'lucide-react';
import dataService from '../../../services/dataService';

const UserTodayDataPage = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchTodayData();
  }, []);
  
  useEffect(() => {
    filterData();
  }, [data, statusFilter, searchTerm]);
  
  const fetchTodayData = async () => {
    setLoading(true);
    try {
      const result = await dataService.getUserTodayData();
      if (result.success) {
        setData(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching today\'s data:', error);
    }
    setLoading(false);
  };
  
  const filterData = () => {
    let filtered = [...data];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name?.toLowerCase().includes(term) ||
        item.contact?.includes(term)
      );
    }
    
    setFilteredData(filtered);
  };
  
  const updateDataStatus = async (dataId, newStatus) => {
    try {
      const result = await dataService.updateDataStatus(dataId, newStatus);
      if (result.success) {
        alert('Status updated successfully!');
        fetchTodayData(); // Refresh data
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };
  
  const statusOptions = [
    { value: 'all', label: 'All Status', color: 'bg-gray-100 text-gray-800' },
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'contacted', label: 'Contacted', color: 'bg-blue-100 text-blue-800' },
    { value: 'converted', label: 'Converted', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
    { value: 'not_reachable', label: 'Not Reachable', color: 'bg-orange-100 text-orange-800' },
  ];
  
  const statusActions = [
    { status: 'contacted', label: 'Mark as Contacted', icon: Phone, color: 'bg-blue-500 hover:bg-blue-600' },
    { status: 'converted', label: 'Mark as Converted', icon: CheckCircle, color: 'bg-green-500 hover:bg-green-600' },
    { status: 'rejected', label: 'Mark as Rejected', icon: XCircle, color: 'bg-red-500 hover:bg-red-600' },
    { status: 'not_reachable', label: 'Not Reachable', icon: XCircle, color: 'bg-orange-500 hover:bg-orange-600' },
  ];
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Today's Data</h1>
            <p className="text-gray-600">Manage your assigned data for today</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchTodayData}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center space-x-2"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        
        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <Target className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Assigned</p>
                <p className="text-2xl font-bold">{data.length}</p>
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
                <p className="text-2xl font-bold">
                  {data.filter(item => item.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Converted</p>
                <p className="text-2xl font-bold">
                  {data.filter(item => item.status === 'converted').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <Phone className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Contacted</p>
                <p className="text-2xl font-bold">
                  {data.filter(item => item.status === 'contacted').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Data
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 text-gray-400" size={20} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Data Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {filteredData.length === 0 ? (
          <div className="text-center py-12">
            <Target className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Found</h3>
            <p className="text-gray-600">
              {data.length === 0 ? "You haven't been assigned any data today." : "No data matches your filters."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-4 text-left text-sm font-medium text-gray-600">Name</th>
                    <th className="p-4 text-left text-sm font-medium text-gray-600">Contact</th>
                    <th className="p-4 text-left text-sm font-medium text-gray-600">Status</th>
                    <th className="p-4 text-left text-sm font-medium text-gray-600">Assigned Time</th>
                    <th className="p-4 text-left text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item) => {
                    const statusOption = statusOptions.find(opt => opt.value === item.status) || statusOptions[0];
                    
                    return (
                      <tr key={item._id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <User className="text-blue-600" size={16} />
                            </div>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-gray-500">
                                Batch: {item.batchNumber}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-mono">{item.contact}</div>
                          <button
                            onClick={() => window.open(`tel:${item.contact}`, '_blank')}
                            className="text-blue-600 hover:text-blue-700 text-sm mt-1 flex items-center"
                          >
                            <Phone size={12} className="mr-1" />
                            Call Now
                          </button>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusOption.color}`}>
                            {statusOption.label}
                          </span>
                        </td>
                        <td className="p-4">
                          {item.assignedAt ? (
                            <>
                              <div>{new Date(item.assignedAt).toLocaleTimeString()}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(item.assignedAt).toLocaleDateString()}
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            {statusActions.map(action => (
                              <button
                                key={action.status}
                                onClick={() => updateDataStatus(item._id, action.status)}
                                disabled={item.status === action.status}
                                className={`px-3 py-1 text-white rounded text-sm flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed ${action.color}`}
                              >
                                <action.icon size={12} />
                                <span>{action.label.split(' ').pop()}</span>
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Pagination would go here */}
          </>
        )}
      </div>
      
      {/* Quick Action Buttons */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {statusActions.map(action => (
          <button
            key={action.status}
            onClick={() => {
              // Could implement bulk action here
              alert(`Bulk ${action.label} feature coming soon!`);
            }}
            className={`p-4 rounded-xl text-white flex items-center justify-center space-x-2 ${action.color}`}
          >
            <action.icon size={18} />
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserTodayDataPage;