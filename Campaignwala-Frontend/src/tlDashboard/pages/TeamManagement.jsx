// TeamManagement.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Search, Filter, CheckCircle, XCircle,
  RefreshCw, ArrowRight, ChevronDown, User, Shield,
  AlertCircle, BarChart3, Target, FileText, Hash,
  PhoneCall, Phone, Calendar, Mail, Check, Eye,
  Download, Upload, UserPlus, UserMinus, MoreVertical,
  TrendingUp, TrendingDown, Clock, Target as TargetIcon
} from 'lucide-react';
import dataService from '../../services/dataService';
import userService from '../../services/userService';
import leadService from '../../services/leadService';

const TeamManagement = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    active: 0,
    hold: 0,
    dead: 0,
    total: 0
  });
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [distributionCount, setDistributionCount] = useState(1);
  const [availableDataCount, setAvailableDataCount] = useState(0);
  const [showDistributeModal, setShowDistributeModal] = useState(false);
  const [availableDataList, setAvailableDataList] = useState([]);
  const [actionDropdownOpen, setActionDropdownOpen] = useState(null);
  const actionDropdownRefs = useRef({});

  useEffect(() => {
    fetchTeamData();
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      const isOutside = Object.values(actionDropdownRefs.current).every(ref => {
        return ref && !ref.contains(event.target);
      });
      
      if (isOutside) {
        setActionDropdownOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchTeamData = async () => {
    setLoading(true);
    try {
      console.log('Fetching team members and statistics...');
      
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
          for (const key in membersResult.data) {
            if (Array.isArray(membersResult.data[key])) {
              membersArray = membersResult.data[key];
              break;
            }
          }
        }
        
        // Fetch detailed statistics for each team member
        const membersWithStats = await Promise.all(
          membersArray.map(async (member) => {
            if (!member || !member._id) return null;
            
            try {
              // Get user statistics
              const statsResult = await userService.getUserStats(member._id);
              const statsData = statsResult.success ? statsResult.data : {};
              
              // Get user's today data count
              const todayDataResult = await dataService.getUserData({ 
                limit: 1000,
                status: 'all'
              });
              
              const todayDataList = todayDataResult.success ? todayDataResult.data || [] : [];
              
              // Calculate counts
              const todayData = todayDataList.length;
              const contactedData = todayDataList.filter(item => 
                item.status === 'contacted'
              ).length;
              const convertedData = todayDataList.filter(item => 
                item.status === 'converted'
              ).length;
              
              // Get withdrawal data
              const withdrawalData = statsData.withdrawnLeads || 0;
              
              return {
                ...member,
                stats: {
                  todayData,
                  contactedData,
                  convertedData,
                  generatedLeads: statsData.generatedLeads || 0,
                  withdrawalData,
                  totalCalls: statsData.totalCalls || 0,
                  successRate: todayData > 0 ? Math.round((convertedData / todayData) * 100) : 0
                }
              };
            } catch (error) {
              console.error(`Error fetching stats for member ${member._id}:`, error);
              return {
                ...member,
                stats: {
                  todayData: 0,
                  contactedData: 0,
                  convertedData: 0,
                  generatedLeads: 0,
                  withdrawalData: 0,
                  totalCalls: 0,
                  successRate: 0
                }
              };
            }
          })
        );
        
        const validMembers = membersWithStats.filter(member => member !== null);
        setTeamMembers(validMembers);
        
        // Calculate overall stats
        const activeCount = validMembers.filter(m => m.status === 'active').length;
        const holdCount = validMembers.filter(m => m.status === 'hold').length;
        const deadCount = validMembers.filter(m => m.status === 'dead' || m.status === 'ex').length;
        
        setStats({
          active: activeCount,
          hold: holdCount,
          dead: deadCount,
          total: validMembers.length
        });
        
        console.log('Team members with stats:', validMembers);
      } else {
        console.error('Failed to fetch team members:', membersResult.error);
        setTeamMembers([]);
      }
      
      // Get available data count
      const dataResult = await dataService.getTLData({ 
        status: 'assigned',
        limit: 1000
      });
      
      if (dataResult.success) {
        const dataList = dataResult.data || [];
        const availableData = dataList.filter(item => 
          !item.distributedTo || item.distributionStatus === 'assigned'
        );
        
        setAvailableDataCount(availableData.length);
        setAvailableDataList(availableData);
        console.log('Available data count:', availableData.length);
      } else {
        console.error('Failed to fetch available data:', dataResult.error);
        setAvailableDataCount(0);
        setAvailableDataList([]);
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
      setTeamMembers([]);
      setStats({ active: 0, hold: 0, dead: 0, total: 0 });
      setAvailableDataCount(0);
      setAvailableDataList([]);
    }
    setLoading(false);
  };

  const toggleActionDropdown = (memberId) => {
    setActionDropdownOpen(actionDropdownOpen === memberId ? null : memberId);
  };

  const handleDistributeClick = () => {
    if (availableDataCount === 0) {
      alert('No data available to distribute');
      return;
    }
    setShowDistributeModal(true);
  };

  const handleDistribute = async () => {
    if (selectedMembers.length === 0) {
      alert('Please select at least one team member');
      return;
    }
    
    if (distributionCount < 1) {
      alert('Please enter a valid number of data records to distribute');
      return;
    }
    
    if (distributionCount > availableDataCount) {
      alert(`Cannot distribute ${distributionCount} records. Only ${availableDataCount} available.`);
      return;
    }
    
    // Get the first N data IDs from available data
    const dataIdsToDistribute = availableDataList
      .slice(0, distributionCount)
      .map(data => data._id)
      .filter(id => id);
    
    if (dataIdsToDistribute.length === 0) {
      alert('No valid data records to distribute');
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
        'equal'
      );
      
      console.log('Distribution result:', distributionResult);
      setResult(distributionResult);
      
      if (distributionResult.success) {
        // Show success message
        setTimeout(() => {
          setShowDistributeModal(false);
          setSelectedMembers([]);
          setDistributionCount(1);
          fetchTeamData();
        }, 2000);
      } else {
        alert(`Error: ${distributionResult.error || distributionResult.message}`);
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

  const toggleMemberSelection = (memberId) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const selectAllMembers = () => {
    const filteredMembers = filterTeamMembers();
    const allIds = filteredMembers.map(member => member._id).filter(id => id);
    
    if (selectedMembers.length === allIds.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(allIds);
    }
  };

  const filterTeamMembers = () => {
    let filtered = teamMembers;
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(member => member.status === filterStatus);
    }
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(member =>
        (member.name && member.name.toLowerCase().includes(query)) ||
        (member.email && member.email.toLowerCase().includes(query)) ||
        (member.employeeId && member.employeeId.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'dead':
      case 'ex':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={14} />;
      case 'hold':
        return <Clock size={14} />;
      case 'dead':
      case 'ex':
        return <XCircle size={14} />;
      default:
        return <User size={14} />;
    }
  };

  const calculateLeadsPerMember = () => {
    if (selectedMembers.length === 0 || distributionCount === 0) {
      return { base: 0, extra: 0 };
    }
    
    const baseLeads = Math.floor(distributionCount / selectedMembers.length);
    const extraLeads = distributionCount % selectedMembers.length;
    
    return { base: baseLeads, extra: extraLeads };
  };

  const leadsPerMember = calculateLeadsPerMember();
  const filteredMembers = filterTeamMembers();

  // Action handlers
  const handleViewDetails = (member) => {
    // Navigate to member details page or open modal
    console.log('View details for:', member);
    alert(`Viewing details for ${member.name}`);
  };

  const handleSendMessage = (member) => {
    console.log('Send message to:', member);
    // Open messaging interface
  };

  const handleChangeStatus = async (memberId, newStatus) => {
    try {
      setLoading(true);
      let result;
      
      switch (newStatus) {
        case 'active':
          result = await userService.markUserActive(memberId, { reason: 'Changed by TL' });
          break;
        case 'hold':
          result = await userService.markUserHold(memberId, { 
            reason: 'Temporary hold', 
            holdUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
          });
          break;
        case 'dead':
          // Implement dead status change
          alert('Dead status change requires admin approval');
          break;
      }
      
      if (result && result.success) {
        setResult({
          success: true,
          message: `Status changed to ${newStatus} successfully`
        });
        fetchTeamData();
      }
    } catch (error) {
      console.error('Error changing status:', error);
      setResult({
        success: false,
        error: 'Failed to change status',
        message: error.message
      });
    } finally {
      setLoading(false);
      setActionDropdownOpen(null);
    }
  };

  const handleWithdrawData = async (memberId) => {
    if (!window.confirm('Withdraw all data from this member?')) {
      return;
    }
    
    try {
      setLoading(true);
      // Get member's assigned data
      const memberData = await dataService.getUserData({ 
        userId: memberId,
        status: 'assigned'
      });
      
      if (memberData.success && memberData.data && memberData.data.length > 0) {
        const dataIds = memberData.data.map(item => item._id);
        const withdrawResult = await dataService.withdrawDataFromTeam(
          dataIds,
          [memberId],
          'Withdrawn by TL'
        );
        
        if (withdrawResult.success) {
          setResult({
            success: true,
            message: `Withdrawn ${dataIds.length} data records from member`
          });
          fetchTeamData();
        }
      } else {
        alert('No assigned data found for this member');
      }
    } catch (error) {
      console.error('Error withdrawing data:', error);
      setResult({
        success: false,
        error: 'Failed to withdraw data',
        message: error.message
      });
    } finally {
      setLoading(false);
      setActionDropdownOpen(null);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Team Management</h1>
            <p className="text-gray-600">Manage your team members and distribute data</p>
          </div>
          <button
            onClick={handleDistributeClick}
            disabled={availableDataCount === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowRight size={18} />
            <span>Distribute Data ({availableDataCount} available)</span>
          </button>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <Users className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Members</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg mr-4">
              <Clock className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">On Hold</p>
              <p className="text-2xl font-bold">{stats.hold}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg mr-4">
              <XCircle className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Dead/Ex</p>
              <p className="text-2xl font-bold">{stats.dead}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <User className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex-1">
            <h3 className="font-semibold mb-4">Team Members</h3>
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name, email, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[150px]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="hold">On Hold</option>
                <option value="dead">Dead/Ex</option>
              </select>
              
              <button
                onClick={fetchTeamData}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            Showing {filteredMembers.length} of {teamMembers.length} members
          </div>
        </div>
      </div>
      
      {/* Team Members Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Team Members List</h2>
              <p className="text-gray-600 text-sm">All team members with their performance statistics</p>
            </div>
            {filteredMembers.length > 0 && (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  {selectedMembers.length} selected
                </div>
                <button
                  onClick={selectAllMembers}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {selectedMembers.length === filteredMembers.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading team data...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-lg mb-2">No team members found</p>
              <p className="text-sm">No team members have been assigned to your team yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-6 text-left w-12">
                    <input
                      type="checkbox"
                      checked={filteredMembers.length > 0 && selectedMembers.length === filteredMembers.length}
                      onChange={selectAllMembers}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name / Email
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Today's Data
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Called (Contacted)
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Closed (Converted)
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Generated Leads
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Withdrawal Data
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <tr key={member._id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member._id)}
                        onChange={() => toggleMemberSelection(member._id)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        disabled={member.status !== 'active'}
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-gray-900">{member.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-600">{member.email || 'No email'}</div>
                        {member.employeeId && (
                          <div className="text-xs text-gray-500">ID: {member.employeeId}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(member.status)}`}>
                          {getStatusIcon(member.status)}
                          <span className="ml-2 capitalize">{member.status || 'unknown'}</span>
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{member.stats.todayData}</div>
                        <div className="text-xs text-gray-500">Assigned</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{member.stats.contactedData}</div>
                        <div className="text-xs text-gray-500">
                          {member.stats.todayData > 0 
                            ? `${Math.round((member.stats.contactedData / member.stats.todayData) * 100)}%` 
                            : '0%'}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{member.stats.convertedData}</div>
                        <div className="text-xs text-gray-500">
                          {member.stats.contactedData > 0 
                            ? `${Math.round((member.stats.convertedData / member.stats.contactedData) * 100)}%` 
                            : '0%'}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-indigo-600">{member.stats.generatedLeads}</div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">{member.stats.withdrawalData}</div>
                        <div className="text-xs text-gray-500">Withdrawn</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="relative" ref={el => actionDropdownRefs.current[member._id] = el}>
                        <button
                          onClick={() => toggleActionDropdown(member._id)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <MoreVertical size={18} className="text-gray-600" />
                        </button>
                        
                        {actionDropdownOpen === member._id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <div className="py-1">
                              <button
                                onClick={() => handleViewDetails(member)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                              >
                                <Eye size={14} className="mr-2" />
                                View Details
                              </button>
                              
                              <button
                                onClick={() => handleSendMessage(member)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                              >
                                <Mail size={14} className="mr-2" />
                                Send Message
                              </button>
                              
                              <div className="border-t my-1"></div>
                              
                              {member.status !== 'active' && (
                                <button
                                  onClick={() => handleChangeStatus(member._id, 'active')}
                                  className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 flex items-center"
                                >
                                  <CheckCircle size={14} className="mr-2" />
                                  Mark as Active
                                </button>
                              )}
                              
                              {member.status !== 'hold' && (
                                <button
                                  onClick={() => handleChangeStatus(member._id, 'hold')}
                                  className="w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50 flex items-center"
                                >
                                  <Clock size={14} className="mr-2" />
                                  Put on Hold
                                </button>
                              )}
                              
                              {member.status !== 'dead' && (
                                <button
                                  onClick={() => handleChangeStatus(member._id, 'dead')}
                                  className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center"
                                >
                                  <XCircle size={14} className="mr-2" />
                                  Mark as Dead
                                </button>
                              )}
                              
                              <div className="border-t my-1"></div>
                              
                              <button
                                onClick={() => handleWithdrawData(member._id)}
                                className="w-full text-left px-4 py-2 text-sm text-orange-700 hover:bg-orange-50 flex items-center"
                              >
                                <UserMinus size={14} className="mr-2" />
                                Withdraw All Data
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Table Summary */}
        {filteredMembers.length > 0 && (
          <div className="p-6 border-t bg-gray-50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-sm text-gray-600">
                  Showing {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}
                </p>
                <div className="flex space-x-4 mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    <CheckCircle size={12} className="mr-1" />
                    Active: {stats.active}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                    <Clock size={12} className="mr-1" />
                    Hold: {stats.hold}
                  </span>
                  <span className="inline-flex items-center px-3 px-3 py-1 rounded-full text-xs bg-red-100 text-red-800">
                    <XCircle size={12} className="mr-1" />
                    Dead/Ex: {stats.dead}
                  </span>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>Available for distribution: {availableDataCount} data records</p>
                <p>Select members and click "Distribute Data" button</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Distribute Data Modal */}
      {showDistributeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Distribute Data to Team</h3>
                <button
                  onClick={() => setShowDistributeModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {/* Available Data Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-blue-800">Available Data</span>
                    <span className="text-xl font-bold text-blue-600">{availableDataCount}</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Total data records that can be distributed to selected team members
                  </p>
                </div>
                
                {/* Selected Members */}
                {selectedMembers.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-2">
                      Selected Members ({selectedMembers.length})
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedMembers.map(memberId => {
                        const member = teamMembers.find(m => m._id === memberId);
                        if (!member) return null;
                        
                        return (
                          <div key={memberId} className="p-2 bg-white rounded border text-sm">
                            <div className="font-medium truncate">{member.name}</div>
                            <div className="text-xs text-gray-500 truncate">{member.email}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Distribution Count Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Data Records to Distribute
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      value={distributionCount}
                      onChange={(e) => setDistributionCount(parseInt(e.target.value))}
                      className="w-full"
                      min="1"
                      max={Math.min(availableDataCount, 100)}
                    />
                    <input
                      type="number"
                      value={distributionCount}
                      onChange={(e) => {
                        const value = Math.max(1, Math.min(availableDataCount, parseInt(e.target.value) || 1));
                        setDistributionCount(value);
                      }}
                      className="w-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-bold"
                      min="1"
                      max={availableDataCount}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Enter how many data records to distribute ({availableDataCount} available)
                  </p>
                </div>
                
                {/* Distribution Preview */}
                {selectedMembers.length > 0 && distributionCount > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-3">Distribution Preview</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total records:</span>
                        <span className="font-bold">{distributionCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Team members:</span>
                        <span className="font-bold">{selectedMembers.length}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between text-sm font-medium">
                          <span className="text-gray-700">Each member will get:</span>
                          <span className="text-blue-600">
                            {leadsPerMember.base} record{leadsPerMember.base !== 1 ? 's' : ''}
                            {leadsPerMember.extra > 0 && ` (+${leadsPerMember.extra} extra for some)`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDistributeModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDistribute}
                  disabled={loading || distributionCount === 0 || selectedMembers.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
      )}
      
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
                <AlertCircle className="text-red-600" size={24} />
              )}
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.success ? 'Success!' : 'Error'}
              </h3>
              <p className={`mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                {result.message || result.error || (result.success ? 'Operation completed successfully' : 'An error occurred')}
              </p>
              
              {result.success && result.data && (
                <div className="mt-4">
                  {result.data.distributedCount !== undefined && (
                    <div className="flex items-center space-x-4">
                      <div className="bg-white/50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600">Data Distributed</div>
                        <div className="font-bold text-lg">{result.data.distributedCount}</div>
                      </div>
                      {result.data.userCount !== undefined && (
                        <div className="bg-white/50 p-3 rounded-lg">
                          <div className="text-sm text-gray-600">To Members</div>
                          <div className="font-bold text-lg">{result.data.userCount}</div>
                        </div>
                      )}
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

export default TeamManagement;