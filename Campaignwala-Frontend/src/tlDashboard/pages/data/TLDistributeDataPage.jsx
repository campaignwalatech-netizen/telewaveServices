import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, CheckCircle, XCircle,
  RefreshCw, ArrowRight, ChevronDown, User, Shield,
  AlertCircle, BarChart3, Target
} from 'lucide-react';
import dataService from '../../../services/dataService';

const TLDistributeDataPage = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [availableData, setAvailableData] = useState([]);
  const [selectedData, setSelectedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // Get team members
      const membersResult = await dataService.getTLTeamMembers();
      if (membersResult.success) {
        setTeamMembers(membersResult.data || []);
      }
      
      // Get available data
      const dataResult = await dataService.getAvailableDataForDistribution();
      if (dataResult.success) {
        setAvailableData(dataResult.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };
  
  const toggleTeamMember = (memberId) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };
  
  const toggleDataItem = (dataId) => {
    setSelectedData(prev =>
      prev.includes(dataId)
        ? prev.filter(id => id !== dataId)
        : [...prev, dataId]
    );
  };
  
  const handleDistribute = async () => {
    if (selectedMembers.length === 0) {
      alert('Please select at least one team member');
      return;
    }
    
    if (selectedData.length === 0) {
      alert('Please select at least one data record');
      return;
    }
    
    setLoading(true);
    
    try {
      const distributionResult = await dataService.distributeDataToTeam(
        selectedData,
        selectedMembers,
        'manual'
      );
      
      setResult(distributionResult);
      
      if (distributionResult.success) {
        alert(`Successfully distributed ${distributionResult.data?.distributedCount || 0} data records`);
        // Reset selections
        setSelectedMembers([]);
        setSelectedData([]);
        // Refresh data
        fetchData();
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
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Distribute Data to Team</h1>
        <p className="text-gray-600">Assign data to your team members</p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <Users className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Team Members</p>
              <p className="text-2xl font-bold">{teamMembers.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <Target className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Available Data</p>
              <p className="text-2xl font-bold">{availableData.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <BarChart3 className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Selected</p>
              <p className="text-2xl font-bold">{selectedData.length}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Team Members Section */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">Team Members</h2>
                <p className="text-gray-600 text-sm">Select members to receive data</p>
              </div>
              <div className="text-sm text-gray-500">
                {selectedMembers.length} selected
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {teamMembers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="mx-auto mb-4 text-gray-400" size={32} />
                <p>No team members found</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {teamMembers.map(member => (
                  <div
                    key={member._id}
                    onClick={() => toggleTeamMember(member._id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedMembers.includes(member._id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                        selectedMembers.includes(member._id)
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <User size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-600">{member.phoneNumber}</div>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                            Leads: {member.statistics?.totalLeads || 0}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                            Converted: {member.statistics?.completedLeads || 0}
                          </span>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedMembers.includes(member._id)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {selectedMembers.includes(member._id) && (
                          <CheckCircle size={12} className="text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Available Data Section */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">Available Data</h2>
                <p className="text-gray-600 text-sm">Select data to distribute</p>
              </div>
              <div className="text-sm text-gray-500">
                {selectedData.length} selected
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {availableData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="mx-auto mb-4 text-gray-400" size={32} />
                <p>No available data for distribution</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {availableData.map(data => (
                  <div
                    key={data._id}
                    onClick={() => toggleDataItem(data._id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedData.includes(data._id)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                        selectedData.includes(data._id)
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <FileText size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{data.name}</div>
                        <div className="text-sm text-gray-600">{data.contact}</div>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                            Batch: {data.batchNumber}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                            {new Date(data.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedData.includes(data._id)
                          ? 'bg-green-600 border-green-600'
                          : 'border-gray-300'
                      }`}>
                        {selectedData.includes(data._id) && (
                          <CheckCircle size={12} className="text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Action Section */}
      <div className="mt-8 bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold">Distribution Summary</h3>
            <p className="text-gray-600 text-sm">
              {selectedData.length} data records to {selectedMembers.length} team members
            </p>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={fetchData}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <RefreshCw size={18} />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={handleDistribute}
              disabled={loading || selectedData.length === 0 || selectedMembers.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Distributing...</span>
                </>
              ) : (
                <>
                  <ArrowRight size={18} />
                  <span>Distribute Selected</span>
                </>
              )}
            </button>
          </div>
        </div>
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
                <XCircle className="text-red-600" size={24} />
              )}
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.success ? 'Distribution Complete!' : 'Distribution Failed'}
              </h3>
              <p className={`mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                {result.data?.message || result.error}
              </p>
              
              {result.success && result.data && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Data Distributed</div>
                    <div className="font-bold">{result.data.distributedCount}</div>
                  </div>
                  <div className="bg-white/50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">To Members</div>
                    <div className="font-bold">{result.data.userCount}</div>
                  </div>
                  <div className="bg-white/50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Total Assignments</div>
                    <div className="font-bold">{result.data.totalDistributions}</div>
                  </div>
                </div>
              )}
              
              {result.data?.errors && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Errors:</h4>
                  <div className="space-y-1">
                    {result.data.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-600 flex items-start">
                        <AlertCircle size={14} className="mr-2 mt-0.5 flex-shrink-0" />
                        {error}
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

export default TLDistributeDataPage;