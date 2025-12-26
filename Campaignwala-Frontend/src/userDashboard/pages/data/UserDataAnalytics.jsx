// UserDataAnalytics.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, TrendingUp, PieChart, RefreshCw, Target,
  PhoneCall, CheckCircle, Clock, AlertCircle, Calendar,
  ArrowUpRight, ArrowDownRight, Sun, Moon
} from 'lucide-react';
import {
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import dataService from '../../../services/dataService';
import toast, { Toaster } from 'react-hot-toast';

const UserDataAnalytics = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalAssigned: 0,
    totalCalled: 0,
    totalClosed: 0,
    totalConverted: 0,
    totalRejected: 0,
    totalNotReachable: 0,
    conversionRate: 0,
    averageCallsPerDay: 0,
    dailyStats: [],
    statusDistribution: [],
    weeklyTrend: [],
    monthlyTrend: []
  });

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all user data to calculate analytics
      const [todayResult, previousResult, closedResult] = await Promise.all([
        dataService.getUserTodayData({ limit: 10000 }),
        dataService.getUserPreviousData({ limit: 10000 }),
        dataService.getUserClosedData({ limit: 10000 })
      ]);

      let allData = [];
      
      // Process today's data
      if (todayResult.success && todayResult.data?.data) {
        const todayData = todayResult.data.data.map(item => {
          let userAssignment = null;
          if (item.teamAssignments && Array.isArray(item.teamAssignments)) {
            userAssignment = item.teamAssignments.find(ta => 
              ta.teamMember && !ta.withdrawn
            );
          }
          return {
            ...item,
            status: userAssignment?.status || item.status || 'pending',
            assignedAt: userAssignment?.assignedAt || item.assignedAt,
            calledAt: userAssignment?.contactedAt || item.calledAt,
            closedAt: userAssignment?.convertedAt || userAssignment?.statusUpdatedAt || item.closedAt
          };
        });
        allData = [...allData, ...todayData];
      }

      // Process previous data
      if (previousResult.success && previousResult.data?.data) {
        const previousData = previousResult.data.data.map(item => {
          let userAssignment = null;
          if (item.teamAssignments && Array.isArray(item.teamAssignments)) {
            userAssignment = item.teamAssignments.find(ta => 
              ta.teamMember && !ta.withdrawn
            );
          }
          return {
            ...item,
            status: userAssignment?.status || item.status || 'pending',
            assignedAt: userAssignment?.assignedAt || item.assignedAt,
            calledAt: userAssignment?.contactedAt || item.calledAt,
            closedAt: userAssignment?.convertedAt || userAssignment?.statusUpdatedAt || item.closedAt
          };
        });
        allData = [...allData, ...previousData];
      }

      // Process closed data
      if (closedResult.success && closedResult.data?.data) {
        const closedData = closedResult.data.data.map(item => {
          let userAssignment = null;
          if (item.teamAssignments && Array.isArray(item.teamAssignments)) {
            userAssignment = item.teamAssignments.find(ta => 
              ta.teamMember && !ta.withdrawn
            );
          }
          return {
            ...item,
            status: userAssignment?.status || item.status || 'rejected',
            assignedAt: userAssignment?.assignedAt || item.assignedAt,
            calledAt: userAssignment?.contactedAt || item.calledAt,
            closedAt: userAssignment?.convertedAt || userAssignment?.statusUpdatedAt || item.closedAt
          };
        });
        allData = [...allData, ...closedData];
      }

      // Calculate statistics
      const totalAssigned = allData.length;
      const totalCalled = allData.filter(item => item.status === 'contacted' || item.calledAt).length;
      const totalClosed = allData.filter(item => 
        ['converted', 'rejected', 'not_reachable'].includes(item.status)
      ).length;
      const totalConverted = allData.filter(item => item.status === 'converted').length;
      const totalRejected = allData.filter(item => item.status === 'rejected').length;
      const totalNotReachable = allData.filter(item => item.status === 'not_reachable').length;

      // Calculate conversion rate
      const conversionRate = totalCalled > 0 
        ? (totalConverted / totalCalled) * 100 
        : 0;

      // Calculate daily stats (last 7 days)
      const dailyStats = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayData = allData.filter(item => {
          const assignedDate = item.assignedAt ? new Date(item.assignedAt).toISOString().split('T')[0] : null;
          return assignedDate === dateStr;
        });

        dailyStats.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          assigned: dayData.length,
          called: dayData.filter(item => item.status === 'contacted' || item.calledAt).length,
          converted: dayData.filter(item => item.status === 'converted').length,
          closed: dayData.filter(item => 
            ['converted', 'rejected', 'not_reachable'].includes(item.status)
          ).length
        });
      }

      // Calculate average calls per day (last 7 days)
      const last7DaysCalls = dailyStats.reduce((sum, day) => sum + day.called, 0);
      const averageCallsPerDay = last7DaysCalls / 7;

      // Status distribution for pie chart
      const statusDistribution = [
        { name: 'Converted', value: totalConverted, color: '#10b981' },
        { name: 'Rejected', value: totalRejected, color: '#ef4444' },
        { name: 'Not Reachable', value: totalNotReachable, color: '#f97316' },
        { name: 'Called', value: totalCalled - totalClosed, color: '#3b82f6' },
        { name: 'Pending', value: totalAssigned - totalCalled - totalClosed, color: '#eab308' }
      ].filter(item => item.value > 0);

      // Weekly trend (last 4 weeks)
      const weeklyTrend = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - (i * 7) - 6);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const weekData = allData.filter(item => {
          if (!item.assignedAt) return false;
          const assignedDate = new Date(item.assignedAt);
          return assignedDate >= weekStart && assignedDate <= weekEnd;
        });

        weeklyTrend.push({
          week: `Week ${4 - i}`,
          assigned: weekData.length,
          converted: weekData.filter(item => item.status === 'converted').length,
          closed: weekData.filter(item => 
            ['converted', 'rejected', 'not_reachable'].includes(item.status)
          ).length
        });
      }

      setAnalytics({
        totalAssigned,
        totalCalled,
        totalClosed,
        totalConverted,
        totalRejected,
        totalNotReachable,
        conversionRate,
        averageCallsPerDay,
        dailyStats,
        statusDistribution,
        weeklyTrend,
        monthlyTrend: [] // Can be added later
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Chart colors based on dark mode
  const chartColors = {
    axisText: darkMode ? '#e5e7eb' : '#374151',
    gridStroke: darkMode ? '#4b5563' : '#e5e7eb',
    primary: darkMode ? '#3b82f6' : '#2563eb',
    success: darkMode ? '#10b981' : '#059669',
    warning: darkMode ? '#eab308' : '#d97706',
    danger: darkMode ? '#ef4444' : '#dc2626'
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-lg shadow-lg border ${
          darkMode 
            ? 'bg-gray-800 border-gray-700 text-white' 
            : 'bg-white border-gray-200 text-gray-900'
        }`}>
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${
            darkMode ? 'border-blue-400' : 'border-blue-600'
          }`}></div>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading analytics...</p>
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
              <h1 className={`text-2xl sm:text-3xl font-bold flex items-center gap-2 mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <PieChart className="text-purple-600 dark:text-purple-400" size={28} />
                Data Analytics
              </h1>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                Track your performance and data management insights
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
                onClick={fetchAnalytics}
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

        {/* Key Metrics Cards */}
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
              {analytics.totalAssigned}
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
              {analytics.conversionRate.toFixed(1)}%
            </p>
          </div>

          <div className={`rounded-xl shadow p-4 sm:p-6 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Avg Calls/Day
              </span>
              <PhoneCall className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={20} />
            </div>
            <p className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {analytics.averageCallsPerDay.toFixed(1)}
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
              {analytics.totalConverted}
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Daily Performance Chart */}
          <div className={`rounded-xl shadow p-4 sm:p-6 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Daily Performance (Last 7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.dailyStats} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.gridStroke} />
                <XAxis 
                  dataKey="date" 
                  stroke={chartColors.axisText}
                  tick={{ fill: chartColors.axisText, fontSize: 12 }}
                />
                <YAxis 
                  stroke={chartColors.axisText}
                  tick={{ fill: chartColors.axisText, fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                <Legend />
                <Bar dataKey="assigned" fill={chartColors.primary} name="Assigned" radius={[4, 4, 0, 0]} />
                <Bar dataKey="called" fill={chartColors.warning} name="Called" radius={[4, 4, 0, 0]} />
                <Bar dataKey="converted" fill={chartColors.success} name="Converted" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution Pie Chart */}
          <div className={`rounded-xl shadow p-4 sm:p-6 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Status Distribution
            </h3>
            {analytics.statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={analytics.statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>No data available</p>
              </div>
            )}
          </div>

          {/* Weekly Trend Chart */}
          <div className={`rounded-xl shadow p-4 sm:p-6 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Weekly Trend (Last 4 Weeks)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.weeklyTrend} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.gridStroke} />
                <XAxis 
                  dataKey="week" 
                  stroke={chartColors.axisText}
                  tick={{ fill: chartColors.axisText, fontSize: 12 }}
                />
                <YAxis 
                  stroke={chartColors.axisText}
                  tick={{ fill: chartColors.axisText, fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="assigned" 
                  stroke={chartColors.primary} 
                  name="Assigned"
                  strokeWidth={2}
                  dot={{ fill: chartColors.primary }}
                />
                <Line 
                  type="monotone" 
                  dataKey="converted" 
                  stroke={chartColors.success} 
                  name="Converted"
                  strokeWidth={2}
                  dot={{ fill: chartColors.success }}
                />
                <Line 
                  type="monotone" 
                  dataKey="closed" 
                  stroke={chartColors.danger} 
                  name="Closed"
                  strokeWidth={2}
                  dot={{ fill: chartColors.danger }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Summary */}
          <div className={`rounded-xl shadow p-4 sm:p-6 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Performance Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CheckCircle className={darkMode ? 'text-emerald-400' : 'text-emerald-600'} size={20} />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Converted</span>
                </div>
                <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.totalConverted}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <AlertCircle className={darkMode ? 'text-red-400' : 'text-red-600'} size={20} />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Rejected</span>
                </div>
                <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.totalRejected}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <AlertCircle className={darkMode ? 'text-orange-400' : 'text-orange-600'} size={20} />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Not Reachable</span>
                </div>
                <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.totalNotReachable}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <PhoneCall className={darkMode ? 'text-blue-400' : 'text-blue-600'} size={20} />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Total Called</span>
                </div>
                <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.totalCalled}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className={darkMode ? 'text-yellow-400' : 'text-yellow-600'} size={20} />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Pending</span>
                </div>
                <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.totalAssigned - analytics.totalCalled - analytics.totalClosed}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`rounded-xl shadow p-4 sm:p-6 ${
          darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/user/data-today')}
              className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                darkMode 
                  ? 'bg-gray-700 border-blue-600 hover:border-blue-500' 
                  : 'bg-blue-50 border-blue-200 hover:border-blue-300'
              }`}
            >
              <Calendar className={`mx-auto mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={24} />
              <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Today's Data</p>
            </button>
            <button
              onClick={() => navigate('/user/data-previous')}
              className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                darkMode 
                  ? 'bg-gray-700 border-purple-600 hover:border-purple-500' 
                  : 'bg-purple-50 border-purple-200 hover:border-purple-300'
              }`}
            >
              <Clock className={`mx-auto mb-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} size={24} />
              <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Previous Data</p>
            </button>
            <button
              onClick={() => navigate('/user/data-closed')}
              className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                darkMode 
                  ? 'bg-gray-700 border-green-600 hover:border-green-500' 
                  : 'bg-green-50 border-green-200 hover:border-green-300'
              }`}
            >
              <CheckCircle className={`mx-auto mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`} size={24} />
              <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Closed Data</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDataAnalytics;

