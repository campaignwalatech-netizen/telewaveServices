import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, Upload, Filter, TrendingUp, 
  CheckCircle, XCircle, Clock, DollarSign, RefreshCw,
  Download, Search, Plus, MoreVertical, Eye, Edit, 
  Trash2, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import dataService from '../../../services/dataService';

const DataDashboard = () => {
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
      // Fetch stats
      const statsResult = await dataService.getDataAnalytics({
        startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
        endDate: new Date()
      });
      
      if (statsResult.success) {
        setStats(statsResult.data);
      }
      
      // Fetch recent batches
      const batchesResult = await dataService.getAllBatches({
        page: 1,
        limit: 5
      });
      
      if (batchesResult.success) {
        setRecentBatches(batchesResult.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
    setLoading(false);
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Management Dashboard</h1>
          <p className="text-gray-600">Monitor and manage all data operations</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center space-x-2"
          >
            <RefreshCw size={16} />
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
          <div key={index} className="bg-white rounded-xl shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold mt-2">{stat.value.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  {stat.trend === 'up' ? (
                    <ArrowUpRight size={14} className="text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight size={14} className="text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                  <span className="text-gray-500 text-sm ml-2">from last week</span>
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
      <div className="bg-white rounded-xl shadow mb-8">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Recent Batches</h2>
              <p className="text-gray-600 text-sm">Latest data batches uploaded</p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All →
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-left text-sm font-medium text-gray-600">Batch Number</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Total Data</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Assigned</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Pending</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Date</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentBatches.map((batch) => (
                <tr key={batch._id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-medium text-blue-600">{batch.batchNumber}</div>
                  </td>
                  <td className="p-4">{batch.total}</td>
                  <td className="p-4">
                    <span className="font-medium">{batch.assignedCount || 0}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-medium">{batch.pendingCount || 0}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      batch.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : batch.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {batch.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">
                    {new Date(batch.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Eye size={16} className="text-gray-600" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreVertical size={16} className="text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Upload className="text-blue-600" size={24} />
          </div>
          <h3 className="font-semibold mb-2">Upload New Data</h3>
          <p className="text-gray-600 text-sm">Add fresh data to the system</p>
        </button>
        
        <button className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="text-green-600" size={24} />
          </div>
          <h3 className="font-semibold mb-2">Distribute Data</h3>
          <p className="text-gray-600 text-sm">Assign data to TLs or users</p>
        </button>
        
        <button className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="text-purple-600" size={24} />
          </div>
          <h3 className="font-semibold mb-2">View Analytics</h3>
          <p className="text-gray-600 text-sm">Data performance insights</p>
        </button>
        
        <button className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Download className="text-orange-600" size={24} />
          </div>
          <h3 className="font-semibold mb-2">Export Reports</h3>
          <p className="text-gray-600 text-sm">Download data reports</p>
        </button>
      </div>
    </div>
  );
};

export default DataDashboard;