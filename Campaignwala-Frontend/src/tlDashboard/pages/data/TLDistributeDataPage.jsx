// TLDistributeDataPage.jsx - SIMPLIFIED VERSION

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Users, Search, Filter, CheckCircle, XCircle,
  RefreshCw, ArrowRight, ChevronDown, User, Shield,
  AlertCircle, BarChart3, Target, FileText, Hash
} from 'lucide-react';
import dataService from '../../../services/dataService';
import userService from '../../../services/userService';
import toast, { Toaster } from 'react-hot-toast';

const TLDistributeDataPage = () => {
  const { darkMode } = useOutletContext() || { darkMode: false };
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [availableDataCount, setAvailableDataCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [distributionCount, setDistributionCount] = useState(1);
  const [availableDataList, setAvailableDataList] = useState([]); // For reference only
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('Fetching team members and available data count...');
      
      // Get team members
      const membersResult = await userService.getTeamMembers();
      console.log('Team members result:', membersResult);
      
      if (membersResult.success) {
        // Extract array from nested structure
        let membersArray = [];
        if (Array.isArray(membersResult.data)) {
          membersArray = membersResult.data;
        } else if (membersResult.data && Array.isArray(membersResult.data.members)) {
          membersArray = membersResult.data.members;
        } else if (membersResult.data && Array.isArray(membersResult.data.data)) {
          membersArray = membersResult.data.data;
        } else if (membersResult.data && Array.isArray(membersResult.data.users)) {
          membersArray = membersResult.data.users;
        } else if (membersResult.data && typeof membersResult.data === 'object') {
          // Try to extract array from object values
          for (const key in membersResult.data) {
            if (Array.isArray(membersResult.data[key])) {
              membersArray = membersResult.data[key];
              break;
            }
          }
        }
        console.log('Extracted team members array:', membersArray);
        setTeamMembers(membersArray);
      } else {
        console.error('Failed to fetch team members:', membersResult.error);
        setTeamMembers([]);
      }
      
      // Get available data count - Use TL data endpoint
      const dataResult = await dataService.getTLData({ 
        status: 'assigned',
        limit: 1000 // Get all to count
      });
      console.log('Available data result:', dataResult);
      
      if (dataResult.success) {
        const dataList = dataResult.data || [];
        // Filter for data that's not yet distributed to team members
        const availableData = dataList.filter(item => 
          item.distributionStatus === 'assigned' || 
          (item.assignedTo && !item.distributedTo)
        );
        
        setAvailableDataCount(availableData.length);
        setAvailableDataList(availableData); // Store for distribution
        console.log('Available data count:', availableData.length);
      } else {
        console.error('Failed to fetch available data:', dataResult.error);
        setAvailableDataCount(0);
        setAvailableDataList([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setTeamMembers([]);
      setAvailableDataCount(0);
      setAvailableDataList([]);
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
  
  const selectAllTeamMembers = () => {
    if (selectedMembers.length === teamMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(teamMembers.map(member => member._id).filter(id => id));
    }
  };
  
  const handleDistribute = async () => {
    if (selectedMembers.length === 0) {
      toast.error('Please select at least one team member');
      return;
    }
    
    if (distributionCount < 1) {
      toast.error('Please enter a valid number of data records to distribute');
      return;
    }
    
    if (distributionCount > availableDataCount) {
      toast.error(`Cannot distribute ${distributionCount} records. Only ${availableDataCount} available.`);
      return;
    }
    
    // Get the first N data IDs from available data
    const dataIdsToDistribute = availableDataList
      .slice(0, distributionCount)
      .map(data => data._id)
      .filter(id => id);
    
    if (dataIdsToDistribute.length === 0) {
      toast.error('No valid data records to distribute');
      return;
    }
    
    setLoading(true);
    setResult(null);
    
    try {
      console.log('Distributing data:', {
        dataIds: dataIdsToDistribute,
        teamMemberIds: selectedMembers,
        distributionCount,
        availableDataCount
      });
      
      // Use dataService for distribution
      const distributionResult = await dataService.distributeDataToTeam(
        dataIdsToDistribute,
        selectedMembers,
        'equal' // Always use equal distribution for simplicity
      );
      
      console.log('Distribution result:', distributionResult);
      setResult(distributionResult);
      
      if (distributionResult.success) {
        toast.success(`Successfully distributed ${distributionCount} records to ${selectedMembers.length} team member(s)`);
        // Reset selections and count
        setSelectedMembers([]);
        setDistributionCount(1);
        // Refresh data
        fetchData();
      } else {
        toast.error(`Error: ${distributionResult.error || distributionResult.message}`);
      }
    } catch (error) {
      console.error('Distribution error:', error);
      setResult({
        success: false,
        error: 'An error occurred during distribution',
        message: error.message
      });
    }
    
    setLoading(false);
  };
  
  // Get member name by ID
  const getMemberName = (memberId) => {
    const member = teamMembers.find(m => m && m._id === memberId);
    return member ? (member.name || 'Unknown Member') : 'Unknown Member';
  };
  
  // Calculate how many leads each member will get
  const calculateLeadsPerMember = () => {
    if (selectedMembers.length === 0 || distributionCount === 0) {
      return 0;
    }
    
    const baseLeads = Math.floor(distributionCount / selectedMembers.length);
    const extraLeads = distributionCount % selectedMembers.length;
    
    return {
      base: baseLeads,
      extra: extraLeads,
      totalMembers: selectedMembers.length,
      distributionCount
    };
  };
  
  const leadsPerMember = calculateLeadsPerMember();
  
  // Filter valid team members (with IDs)
  const validTeamMembers = teamMembers.filter(member => member && member._id);
  
  return (
    <div className={`p-6 min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: darkMode ? '#1f2937' : '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#059669',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#DC2626',
            },
          },
        }}
      />
      <div className="mb-8">
        <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Distribute Data to Team</h1>
        <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Select team members and enter how many data records to distribute</p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow p-4 border`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-lg mr-4 ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
              <Users className={darkMode ? 'text-blue-400' : 'text-blue-600'} size={20} />
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Team Members</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{validTeamMembers.length}</p>
            </div>
          </div>
        </div>
        
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow p-4 border`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-lg mr-4 ${darkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
              <Target className={darkMode ? 'text-green-400' : 'text-green-600'} size={20} />
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Available Data</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{availableDataCount}</p>
            </div>
          </div>
        </div>
        
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow p-4 border`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-lg mr-4 ${darkMode ? 'bg-orange-900/30' : 'bg-orange-100'}`}>
              <Hash className={darkMode ? 'text-orange-400' : 'text-orange-600'} size={20} />
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>To Distribute</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{distributionCount}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Team Members Section */}
        <div className={`lg:col-span-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow border`}>
          <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex justify-between items-center">
              <div>
                <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Select Team Members</h2>
                <p className={darkMode ? 'text-gray-300 text-sm' : 'text-gray-600 text-sm'}>Choose who will receive data</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {selectedMembers.length} of {validTeamMembers.length} selected
                </div>
                {validTeamMembers.length > 0 && (
                  <button
                    onClick={selectAllTeamMembers}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    {selectedMembers.length === validTeamMembers.length ? 'Deselect All' : 'Select All'}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Loading team members...</p>
              </div>
            ) : validTeamMembers.length === 0 ? (
              <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Users className="mx-auto mb-4 text-gray-400" size={32} />
                <p>No team members found</p>
                <p className="text-sm mt-2">Team members will appear here when they are assigned to your team.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {validTeamMembers.map(member => (
                  member && member._id ? (
                    <div
                      key={member._id}
                      onClick={() => toggleTeamMember(member._id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedMembers.includes(member._id)
                          ? darkMode
                            ? 'border-blue-500 bg-blue-900/30'
                            : 'border-blue-500 bg-blue-50'
                          : darkMode
                            ? 'border-gray-700 hover:border-blue-500 hover:bg-gray-700'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                          selectedMembers.includes(member._id)
                            ? darkMode
                              ? 'bg-blue-900/50 text-blue-400'
                              : 'bg-blue-100 text-blue-600'
                            : darkMode
                              ? 'bg-gray-700 text-gray-400'
                              : 'bg-gray-100 text-gray-600'
                        }`}>
                          <User size={18} />
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{member.name || 'Unknown Member'}</div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {member.phoneNumber || member.email || 'No contact'}
                          </div>
                          <div className="flex items-center space-x-4 mt-2">
                            {member.employeeId && (
                              <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                                ID: {member.employeeId}
                              </span>
                            )}
                            <span className={`text-xs px-2 py-1 rounded ${
                              member.status === 'active' 
                                ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                                : member.status === 'inactive' 
                                  ? darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
                                  : darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {member.status || 'unknown'}
                            </span>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedMembers.includes(member._id)
                            ? 'bg-blue-600 border-blue-600'
                            : darkMode
                              ? 'border-gray-600'
                              : 'border-gray-300'
                        }`}>
                          {selectedMembers.includes(member._id) && (
                            <CheckCircle size={12} className="text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Distribution Control Section */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow border`}>
          <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-lg mr-4 ${darkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                <Target className={darkMode ? 'text-green-400' : 'text-green-600'} size={20} />
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Distribution Control</h2>
                <p className={darkMode ? 'text-gray-300 text-sm' : 'text-gray-600 text-sm'}>Set how many to distribute</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              {/* Available Data Info */}
              <div className={`border rounded-lg p-4 ${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>Available Data</span>
                  <span className={`text-xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{availableDataCount}</span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                  Total data records assigned to you that can be distributed
                </p>
              </div>
              
              {/* Distribution Count Input */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Number to Distribute
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    value={distributionCount}
                    onChange={(e) => setDistributionCount(parseInt(e.target.value))}
                    className="w-full"
                    min="1"
                    max={Math.min(availableDataCount, 100)} // Limit max to 100 or available count
                  />
                  <input
                    type="number"
                    value={distributionCount}
                    onChange={(e) => {
                      const value = Math.max(1, Math.min(availableDataCount, parseInt(e.target.value) || 1));
                      setDistributionCount(value);
                    }}
                    className={`w-32 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-bold ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    min="1"
                    max={availableDataCount}
                  />
                </div>
                <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Enter how many data records to distribute ({availableDataCount} available)
                </p>
              </div>
              
              {/* Distribution Preview */}
              {selectedMembers.length > 0 && distributionCount > 0 && (
                <div className={`border rounded-lg p-4 ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Distribution Preview</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Total records:</span>
                      <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{distributionCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Team members:</span>
                      <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedMembers.length}</span>
                    </div>
                    <div className={`border-t pt-2 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                      <div className="flex justify-between text-sm font-medium">
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Each member will get:</span>
                        <span className="text-blue-600 dark:text-blue-400">
                          {leadsPerMember.base} record{leadsPerMember.base !== 1 ? 's' : ''}
                          {leadsPerMember.extra > 0 && ` (+${leadsPerMember.extra} extra for some)`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Quick Action Buttons */}
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setDistributionCount(Math.min(10, availableDataCount))}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${
                      darkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    Distribute 10
                  </button>
                  <button
                    onClick={() => setDistributionCount(Math.min(20, availableDataCount))}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${
                      darkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    Distribute 20
                  </button>
                  <button
                    onClick={() => setDistributionCount(Math.min(50, availableDataCount))}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${
                      darkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    Distribute 50
                  </button>
                </div>
                <button
                  onClick={() => setDistributionCount(availableDataCount)}
                  className={`w-full px-4 py-2 font-medium rounded-lg text-sm transition-colors ${
                    darkMode 
                      ? 'bg-blue-900/30 hover:bg-blue-900/50 text-blue-300' 
                      : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                  }`}
                >
                  Distribute All ({availableDataCount})
                </button>
              </div>
              
              {/* Action Buttons */}
              <div className={`pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={fetchData}
                    disabled={loading}
                    className={`px-4 py-3 border rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 transition-colors ${
                      darkMode 
                        ? 'border-gray-600 hover:bg-gray-700 text-gray-300' 
                        : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    <span>Refresh Data</span>
                  </button>
                  
                  <button
                    onClick={handleDistribute}
                    disabled={loading || distributionCount === 0 || selectedMembers.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Distributing...</span>
                      </>
                    ) : (
                      <>
                        <ArrowRight size={18} />
                        <span>Distribute {distributionCount} Record{distributionCount !== 1 ? 's' : ''}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Selected Members Preview */}
      {selectedMembers.length > 0 && (
        <div className={`mt-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow p-6 border`}>
          <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Selected Members ({selectedMembers.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedMembers.map(memberId => {
              const member = teamMembers.find(m => m && m._id === memberId);
              if (!member) return null;
              
              return (
                <div key={memberId} className={`p-3 border rounded-lg ${
                  darkMode 
                    ? 'border-blue-800 bg-blue-900/30' 
                    : 'border-blue-200 bg-blue-50'
                }`}>
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      darkMode ? 'bg-blue-900/50' : 'bg-blue-100'
                    }`}>
                      <User size={14} className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{member.name}</div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {member.employeeId ? `ID: ${member.employeeId}` : 'No ID'}
                      </div>
                    </div>
                    <div className={`text-xs font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      ~{leadsPerMember.base} lead{leadsPerMember.base !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Result Display */}
      {result && (
        <div className={`mt-6 rounded-xl p-6 border ${
          result.success 
            ? darkMode 
              ? 'bg-green-900/20 border-green-800' 
              : 'bg-green-50 border-green-200' 
            : darkMode 
              ? 'bg-red-900/20 border-red-800' 
              : 'bg-red-50 border-red-200'
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
                result.success 
                  ? darkMode ? 'text-green-400' : 'text-green-800' 
                  : darkMode ? 'text-red-400' : 'text-red-800'
              }`}>
                {result.success ? 'Distribution Complete!' : 'Distribution Failed'}
              </h3>
              <p className={`mt-1 ${
                result.success 
                  ? darkMode ? 'text-green-300' : 'text-green-700' 
                  : darkMode ? 'text-red-300' : 'text-red-700'
              }`}>
                {result.message || result.error || (result.success ? 'Data distributed successfully' : 'An error occurred')}
              </p>
              
              {result.success && result.data && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {result.data.distributedCount !== undefined && (
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-white/50'}`}>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Data Distributed</div>
                      <div className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{result.data.distributedCount}</div>
                    </div>
                  )}
                  {result.data.userCount !== undefined && (
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-white/50'}`}>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>To Members</div>
                      <div className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{result.data.userCount}</div>
                    </div>
                  )}
                  {result.data.remainingData !== undefined && (
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-white/50'}`}>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Remaining Data</div>
                      <div className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{result.data.remainingData}</div>
                    </div>
                  )}
                </div>
              )}
              
              {result.data?.distributionDetails && (
                <div className={`mt-4 rounded-lg p-4 ${darkMode ? 'bg-gray-700/50' : 'bg-white/50'}`}>
                  <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Distribution Details:</h4>
                  <div className="space-y-2">
                    {Object.entries(result.data.distributionDetails).map(([memberId, count]) => (
                      <div key={memberId} className="flex justify-between text-sm">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{getMemberName(memberId)}:</span>
                        <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{count} leads</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {result.data?.errors && result.data.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Errors:</h4>
                  <div className="space-y-1">
                    {result.data.errors.map((error, index) => (
                      <div key={index} className={`text-sm flex items-start ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                        <AlertCircle size={14} className="mr-2 mt-0.5 shrink-0" />
                        <span>{error}</span>
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