import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Upload, UserPlus, 
  Target, CheckCircle, XCircle, RefreshCw,
  ArrowRight, ChevronDown, User, Crown
} from 'lucide-react';
import dataService from '../../../services/dataService';
import userService from '../../../services/userService';

const DistributeDataPage = () => {
  const [distributionType, setDistributionType] = useState('single_tl');
  const [count, setCount] = useState(50);
  const [selectedTL, setSelectedTL] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [pendingDataCount, setPendingDataCount] = useState(0);
  const [TLs, setTLs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      // Get pending data count
      const dataResult = await dataService.getPendingDataCount();
      setPendingDataCount(dataResult);
      
      // Get TLs
      const tlsResult = await userService.getAllTLs();
      if (tlsResult.success) {
        setTLs(tlsResult.data);
      }
      
      // Get active users
      const usersResult = await userService.getActiveUsers();
      if (usersResult.success) {
        setUsers(usersResult.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
  const handleDistribute = async () => {
    if (distributionType === 'single_tl' && !selectedTL) {
      alert('Please select a TL');
      return;
    }
    
    if (distributionType === 'single_user' && !selectedUser) {
      alert('Please select a user');
      return;
    }
    
    if (count <= 0) {
      alert('Please enter a valid count');
      return;
    }
    
    if (count > pendingDataCount) {
      alert(`Only ${pendingDataCount} pending data available`);
      return;
    }
    
    setLoading(true);
    
    try {
      let distributionResult;
      
      if (distributionType === 'single_tl') {
        distributionResult = await dataService.assignDataToTL(count, selectedTL);
      } else if (distributionType === 'single_user') {
        distributionResult = await dataService.assignDataToUser(count, selectedUser);
      }
      
      setResult(distributionResult);
      
      if (distributionResult.success) {
        alert(`Successfully assigned ${count} data records`);
        fetchData(); // Refresh data
        // Reset form
        setCount(50);
        setSelectedTL('');
        setSelectedUser('');
      } else {
        alert(`Error: ${distributionResult.error}`);
      }
    } catch (error) {
      console.error('Distribution error:', error);
      alert('An error occurred during distribution');
    }
    
    setLoading(false);
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Distribute Data</h1>
        <p className="text-gray-600">Assign data to TLs or users in bulk</p>
      </div>
      
      {/* Stats Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white mb-8">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-blue-100">Available for Distribution</p>
            <p className="text-3xl font-bold mt-2">{pendingDataCount} Data</p>
            <p className="text-blue-200 text-sm mt-2">Ready to be assigned</p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Target size={28} />
          </div>
        </div>
      </div>
      
      {/* Distribution Form */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Distribution Settings</h2>
        
        {/* Distribution Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Distribution Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setDistributionType('single_tl')}
              className={`p-4 rounded-lg border-2 transition-all flex items-center ${
                distributionType === 'single_tl'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className={`p-2 rounded-lg mr-4 ${
                distributionType === 'single_tl' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Crown className={distributionType === 'single_tl' ? 'text-blue-600' : 'text-gray-600'} />
              </div>
              <div className="text-left">
                <div className="font-medium">To Team Leader</div>
                <div className="text-sm text-gray-600">Assign data to a specific TL</div>
              </div>
            </button>
            
            <button
              onClick={() => setDistributionType('single_user')}
              className={`p-4 rounded-lg border-2 transition-all flex items-center ${
                distributionType === 'single_user'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className={`p-2 rounded-lg mr-4 ${
                distributionType === 'single_user' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <User className={distributionType === 'single_user' ? 'text-blue-600' : 'text-gray-600'} />
              </div>
              <div className="text-left">
                <div className="font-medium">To User</div>
                <div className="text-sm text-gray-600">Assign data directly to a user</div>
              </div>
            </button>
          </div>
        </div>
        
        {/* Count Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Data Records
          </label>
          <div className="relative">
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="1"
              max={pendingDataCount}
            />
            <div className="absolute right-3 top-3 text-gray-500">
              out of {pendingDataCount} available
            </div>
          </div>
          <div className="flex space-x-2 mt-3">
            {[10, 25, 50, 100].map((num) => (
              <button
                key={num}
                onClick={() => setCount(num)}
                className={`px-3 py-1 rounded text-sm ${
                  count === num
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
        
        {/* Target Selection */}
        {distributionType === 'single_tl' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Team Leader
            </label>
            <div className="relative">
              <select
                value={selectedTL}
                onChange={(e) => setSelectedTL(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="">Choose a TL</option>
                {TLs.map(tl => (
                  <option key={tl._id} value={tl._id}>
                    {tl.name} - {tl.teamMembers?.length || 0} team members
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 text-gray-400" size={20} />
            </div>
          </div>
        )}
        
        {distributionType === 'single_user' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select User
            </label>
            <div className="relative">
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="">Choose a user</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} - {user.phoneNumber}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 text-gray-400" size={20} />
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handleDistribute}
            disabled={loading || pendingDataCount === 0}
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
                <span>Distribute Data</span>
              </>
            )}
          </button>
          
          <button
            onClick={fetchData}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <RefreshCw size={18} />
            <span>Refresh</span>
          </button>
        </div>
      </div>
      
      {/* Result Display */}
      {result && (
        <div className={`rounded-xl p-6 ${
          result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start">
            <div className={`p-2 rounded-lg mr-4 ${
              result.success ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {result.success ? (
                <CheckCircle className="text-green-600" size={24} />
              ) : (
                <XCircle className="text-red-600" size={24} />
              )}
            </div>
            <div>
              <h3 className={`font-semibold ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.success ? 'Distribution Successful!' : 'Distribution Failed'}
              </h3>
              <p className={`mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                {result.data?.message || result.error}
              </p>
              {result.data && (
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div className="bg-white/50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Assigned Count</div>
                    <div className="font-bold">{result.data.assignedCount}</div>
                  </div>
                  {result.data.tlName && (
                    <div className="bg-white/50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">Assigned To</div>
                      <div className="font-bold">{result.data.tlName}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistributeDataPage;