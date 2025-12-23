import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, Upload, Filter, TrendingUp, 
  CheckCircle, XCircle, Clock, DollarSign, RefreshCw,
  Download, Search, Plus, MoreVertical, Eye, Edit, 
  Trash2, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import dataService from '../../../services/dataService';
import toast, { Toaster } from 'react-hot-toast';

const DataDashboard = ({ darkMode = false, setDarkMode }) => {
  const [stats, setStats] = useState({
    totalData: 0,
    pending: 0,
    assigned: 0,
    distributed: 0,
    converted: 0,
    withdrawn: 0
  });
  
  const [recentBatches, setRecentBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch stats - format dates as ISO strings
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);
      
      const statsResult = await dataService.getDataAnalytics({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      } else if (statsResult.error) {
        console.warn('Analytics API error:', statsResult.error);
        // Don't show error toast for analytics, just use default stats
        // The error is likely a backend issue with the analytics endpoint
      }
      
      // Fetch recent batches
      const batchesResult = await dataService.getAllBatches({
        page: 1,
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      if (batchesResult.success) {
        // Handle different possible response structures
        // API might return {batches: [...]} or the batches array directly
        let batches = [];
        if (Array.isArray(batchesResult.data)) {
          batches = batchesResult.data;
        } else if (batchesResult.data?.batches && Array.isArray(batchesResult.data.batches)) {
          batches = batchesResult.data.batches;
        } else if (batchesResult.data?.data?.batches && Array.isArray(batchesResult.data.data.batches)) {
          batches = batchesResult.data.data.batches;
        }
        setRecentBatches(batches);
      } else {
        const errorMsg = batchesResult.error || 'Failed to load batches';
        toast.error(errorMsg);
        setRecentBatches([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error(error.message || 'Failed to fetch dashboard data');
      setRecentBatches([]);
    } finally {
      setLoading(false);
    }
  };
  
  const statCards = [
    { 
      title: 'Total Data', 
      value: stats.totalData, 
      icon: BarChart3, 
      color: 'bg-blue-500',
      change: '+12%',
      trend: 'up'
    },
    { 
      title: 'Pending', 
      value: stats.pending, 
      icon: Clock, 
      color: 'bg-yellow-500',
      change: '+5%',
      trend: 'up'
    },
    { 
      title: 'Assigned', 
      value: stats.assigned, 
      icon: Users, 
      color: 'bg-purple-500',
      change: '+18%',
      trend: 'up'
    },
    { 
      title: 'Distributed', 
      value: stats.distributed, 
      icon: TrendingUp, 
      color: 'bg-green-500',
      change: '+23%',
      trend: 'up'
    },
    { 
      title: 'Converted', 
      value: stats.converted, 
      icon: CheckCircle, 
      color: 'bg-emerald-500',
      change: '+8%',
      trend: 'up'
    },
    { 
      title: 'Withdrawn', 
      value: stats.withdrawn, 
      icon: XCircle, 
      color: 'bg-red-500',
      change: '-3%',
      trend: 'down'
    },
  ];
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Data Management Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor and manage all data operations</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Upload size={16} />
            <span>Upload Data</span>
          </button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-gray-100">{stat.value.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  {stat.trend === 'up' ? (
                    <ArrowUpRight size={14} className="text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight size={14} className="text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {stat.change}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">from last week</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                <stat.icon className={`${stat.color.replace('bg-', 'text-')}`} size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Recent Batches */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow mb-8`}>
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Batches</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Latest data batches uploaded</p>
            </div>
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
              View All →
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Batch Number</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Total Data</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Assigned</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Pending</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Status</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Date</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentBatches && recentBatches.length > 0 ? (
                recentBatches.map((batch) => (
                <tr key={batch._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="p-4">
                    <div className="font-medium text-blue-600 dark:text-blue-400">{batch.batchNumber}</div>
                  </td>
                  <td className="p-4 text-gray-900 dark:text-gray-100">{batch.total}</td>
                  <td className="p-4">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{batch.assignedCount || 0}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{batch.pendingCount || 0}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      batch.status === 'completed' 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : batch.status === 'in-progress'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                    }`}>
                      {batch.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">
                    {new Date(batch.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <Eye size={16} className="text-gray-600 dark:text-gray-400" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <MoreVertical size={16} className="text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No batches found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl shadow p-6 hover:shadow-md transition-shadow text-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Upload className="text-blue-600 dark:text-blue-400" size={24} />
          </div>
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Upload New Data</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Add fresh data to the system</p>
        </button>
        
        <button className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl shadow p-6 hover:shadow-md transition-shadow text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
          </div>
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Distribute Data</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Assign data to TLs or users</p>
        </button>
        
        <button className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl shadow p-6 hover:shadow-md transition-shadow text-center">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="text-purple-600 dark:text-purple-400" size={24} />
          </div>
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">View Analytics</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Data performance insights</p>
        </button>
        
        <button className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl shadow p-6 hover:shadow-md transition-shadow text-center">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Download className="text-orange-600 dark:text-orange-400" size={24} />
          </div>
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Export Reports</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Download data reports</p>
        </button>
      </div>
    </div>
  );
};

export default DataDashboard;