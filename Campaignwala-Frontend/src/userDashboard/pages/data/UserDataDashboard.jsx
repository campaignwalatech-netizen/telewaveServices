// UserDataDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target, PhoneCall, CheckCircle, Clock, AlertCircle,
  TrendingUp, ArrowRight, Calendar, RefreshCw, Sun, Moon,
  BarChart3, Users, FileText
} from 'lucide-react';
import dataService from '../../../services/dataService';
import toast, { Toaster } from 'react-hot-toast';

const UserDataDashboard = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    today: {
      total: 0,
      pending: 0,
      called: 0,
      closed: 0,
      converted: 0
    },
    previous: {
      total: 0,
      pending: 0,
      called: 0,
      closed: 0,
      converted: 0
    },
    closed: {
      total: 0,
      converted: 0,
      rejected: 0,
      notReachable: 0
    },
    overall: {
      totalAssigned: 0,
      totalCalled: 0,
      totalConverted: 0,
      conversionRate: 0
    }
  });

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [todayResult, previousResult, closedResult] = await Promise.all([
        dataService.getUserTodayData({ limit: 10000 }),
        dataService.getUserPreviousData({ limit: 10000 }),
        dataService.getUserClosedData({ limit: 10000 })
      ]);

      // Process today's data
      let todayData = [];
      if (todayResult.success && todayResult.data?.data) {
        todayData = todayResult.data.data.map(item => {
          let userAssignment = null;
          if (item.teamAssignments && Array.isArray(item.teamAssignments)) {
            userAssignment = item.teamAssignments.find(ta => 
              ta.teamMember && !ta.withdrawn
            );
          }
          return {
            status: userAssignment?.status || item.status || 'pending'
          };
        });
      }

      // Process previous data
      let previousData = [];
      if (previousResult.success && previousResult.data?.data) {
        previousData = previousResult.data.data.map(item => {
          let userAssignment = null;
          if (item.teamAssignments && Array.isArray(item.teamAssignments)) {
            userAssignment = item.teamAssignments.find(ta => 
              ta.teamMember && !ta.withdrawn
            );
          }
          return {
            status: userAssignment?.status || item.status || 'pending'
          };
        });
      }

      // Process closed data
      let closedData = [];
      if (closedResult.success && closedResult.data?.data) {
        closedData = closedResult.data.data.map(item => {
          let userAssignment = null;
          if (item.teamAssignments && Array.isArray(item.teamAssignments)) {
            userAssignment = item.teamAssignments.find(ta => 
              ta.teamMember && !ta.withdrawn
            );
          }
          return {
            status: userAssignment?.status || item.status || 'rejected'
          };
        });
      }

      // Calculate today's stats
      const todayStats = {
        total: todayData.length,
        pending: todayData.filter(item => item.status === 'pending').length,
        called: todayData.filter(item => item.status === 'contacted').length,
        closed: todayData.filter(item => 
          ['converted', 'rejected', 'not_reachable'].includes(item.status)
        ).length,
        converted: todayData.filter(item => item.status === 'converted').length
      };

      // Calculate previous stats
      const previousStats = {
        total: previousData.length,
        pending: previousData.filter(item => item.status === 'pending').length,
        called: previousData.filter(item => item.status === 'contacted').length,
        closed: previousData.filter(item => 
          ['converted', 'rejected', 'not_reachable'].includes(item.status)
        ).length,
        converted: previousData.filter(item => item.status === 'converted').length
      };

      // Calculate closed stats
      const closedStats = {
        total: closedData.length,
        converted: closedData.filter(item => item.status === 'converted').length,
        rejected: closedData.filter(item => item.status === 'rejected').length,
        notReachable: closedData.filter(item => item.status === 'not_reachable').length
      };

      // Calculate overall stats
      const allData = [...todayData, ...previousData, ...closedData];
      const totalAssigned = allData.length;
      const totalCalled = allData.filter(item => item.status === 'contacted').length;
      const totalConverted = allData.filter(item => item.status === 'converted').length;
      const conversionRate = totalCalled > 0 ? (totalConverted / totalCalled) * 100 : 0;

      setStats({
        today: todayStats,
        previous: previousStats,
        closed: closedStats,
        overall: {
          totalAssigned,
          totalCalled,
          totalConverted,
          conversionRate
        }
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${
            darkMode ? 'border-blue-400' : 'border-blue-600'
          }`}></div>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
    }`}>
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

      <div className="p-3 sm:p-4 md:p-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Data Dashboard
              </h1>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                Overview of your data management and performance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className={`rounded-xl shadow p-4 sm:p-6 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Assigned
              </span>
              <Target className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={20} />
            </div>
            <p className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.overall.totalAssigned}
            </p>
          </div>

          <div className={`rounded-xl shadow p-4 sm:p-6 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Conversion Rate
              </span>
              <TrendingUp className={`${darkMode ? 'text-green-400' : 'text-green-600'}`} size={20} />
            </div>
            <p className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.overall.conversionRate.toFixed(1)}%
            </p>
          </div>

          <div className={`rounded-xl shadow p-4 sm:p-6 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Called
              </span>
              <PhoneCall className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={20} />
            </div>
            <p className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.overall.totalCalled}
            </p>
          </div>

          <div className={`rounded-xl shadow p-4 sm:p-6 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Converted
              </span>
              <CheckCircle className={`${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} size={20} />
            </div>
            <p className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.overall.totalConverted}
            </p>
          </div>
        </div>

        {/* Data Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Today's Data Card */}
          <div 
            onClick={() => navigate('/user/data-today')}
            className={`rounded-xl shadow p-6 cursor-pointer transition-all hover:scale-105 ${
              darkMode ? 'bg-gray-800 border-2 border-blue-600 hover:border-blue-500' : 'bg-white border-2 border-blue-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Today's Data
              </h3>
              <Calendar className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={24} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Total</span>
                <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.today.total}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Pending</span>
                <span className={`font-semibold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  {stats.today.pending}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Called</span>
                <span className={`font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {stats.today.called}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Converted</span>
                <span className={`font-semibold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  {stats.today.converted}
                </span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  View Details
                </span>
                <ArrowRight className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={18} />
              </div>
            </div>
          </div>

          {/* Previous Data Card */}
          <div 
            onClick={() => navigate('/user/data-previous')}
            className={`rounded-xl shadow p-6 cursor-pointer transition-all hover:scale-105 ${
              darkMode ? 'bg-gray-800 border-2 border-purple-600 hover:border-purple-500' : 'bg-white border-2 border-purple-200 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Previous Data
              </h3>
              <Clock className={`${darkMode ? 'text-purple-400' : 'text-purple-600'}`} size={24} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Total</span>
                <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.previous.total}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Pending</span>
                <span className={`font-semibold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  {stats.previous.pending}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Called</span>
                <span className={`font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {stats.previous.called}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Converted</span>
                <span className={`font-semibold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  {stats.previous.converted}
                </span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  View Details
                </span>
                <ArrowRight className={`${darkMode ? 'text-purple-400' : 'text-purple-600'}`} size={18} />
              </div>
            </div>
          </div>

          {/* Closed Data Card */}
          <div 
            onClick={() => navigate('/user/data-closed')}
            className={`rounded-xl shadow p-6 cursor-pointer transition-all hover:scale-105 ${
              darkMode ? 'bg-gray-800 border-2 border-green-600 hover:border-green-500' : 'bg-white border-2 border-green-200 hover:border-green-300'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Closed Data
              </h3>
              <CheckCircle className={`${darkMode ? 'text-green-400' : 'text-green-600'}`} size={24} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Total</span>
                <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.closed.total}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Converted</span>
                <span className={`font-semibold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  {stats.closed.converted}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Rejected</span>
                <span className={`font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                  {stats.closed.rejected}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Not Reachable</span>
                <span className={`font-semibold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                  {stats.closed.notReachable}
                </span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  View Details
                </span>
                <ArrowRight className={`${darkMode ? 'text-green-400' : 'text-green-600'}`} size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className={`rounded-xl shadow p-4 sm:p-6 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={20} />
              <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Today Pending
              </span>
            </div>
            <p className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.today.pending}
            </p>
          </div>

          <div className={`rounded-xl shadow p-4 sm:p-6 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <PhoneCall className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={20} />
              <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Today Called
              </span>
            </div>
            <p className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.today.called}
            </p>
          </div>

          <div className={`rounded-xl shadow p-4 sm:p-6 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className={`${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} size={20} />
              <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Today Converted
              </span>
            </div>
            <p className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.today.converted}
            </p>
          </div>

          <div className={`rounded-xl shadow p-4 sm:p-6 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className={`${darkMode ? 'text-green-400' : 'text-green-600'}`} size={20} />
              <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Overall Rate
              </span>
            </div>
            <p className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.overall.conversionRate.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className={`rounded-xl shadow p-6 ${
          darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Quick Navigation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/user/data-today')}
              className={`p-4 rounded-lg border-2 transition-all hover:scale-105 text-left ${
                darkMode 
                  ? 'bg-gray-700 border-blue-600 hover:border-blue-500' 
                  : 'bg-blue-50 border-blue-200 hover:border-blue-300'
              }`}
            >
              <Calendar className={`mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={24} />
              <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Today's Data</p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {stats.today.total} records
              </p>
            </button>

            <button
              onClick={() => navigate('/user/data-previous')}
              className={`p-4 rounded-lg border-2 transition-all hover:scale-105 text-left ${
                darkMode 
                  ? 'bg-gray-700 border-purple-600 hover:border-purple-500' 
                  : 'bg-purple-50 border-purple-200 hover:border-purple-300'
              }`}
            >
              <Clock className={`mb-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} size={24} />
              <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Previous Data</p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {stats.previous.total} records
              </p>
            </button>

            <button
              onClick={() => navigate('/user/data-closed')}
              className={`p-4 rounded-lg border-2 transition-all hover:scale-105 text-left ${
                darkMode 
                  ? 'bg-gray-700 border-green-600 hover:border-green-500' 
                  : 'bg-green-50 border-green-200 hover:border-green-300'
              }`}
            >
              <CheckCircle className={`mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`} size={24} />
              <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Closed Data</p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {stats.closed.total} records
              </p>
            </button>

            <button
              onClick={() => navigate('/user/data-analytics')}
              className={`p-4 rounded-lg border-2 transition-all hover:scale-105 text-left ${
                darkMode 
                  ? 'bg-gray-700 border-indigo-600 hover:border-indigo-500' 
                  : 'bg-indigo-50 border-indigo-200 hover:border-indigo-300'
              }`}
            >
              <BarChart3 className={`mb-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} size={24} />
              <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Analytics</p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                View detailed insights
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDataDashboard;

