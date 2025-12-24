import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BarChart3, TrendingUp, Users, Target, RefreshCw } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const TLDataDashboard = () => {
  const { darkMode } = useOutletContext() || { darkMode: false };
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalData: 0,
    distributedData: 0,
    calledData: 0,
    closedData: 0,
    pendingData: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to fetch TL data statistics
      // const response = await dataService.getTLDataStats();
      // if (response.success) {
      //   setStats(response.data);
      // }
      toast.success('Stats loaded successfully');
    } catch (error) {
      toast.error('Failed to load statistics');
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <BarChart3 className="text-blue-600 dark:text-blue-400" />
              Data Dashboard
            </h1>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
              Overview of your data distribution and performance
            </p>
          </div>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow p-6 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Data</p>
              <p className={`text-2xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.totalData}</p>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
              <Target className={darkMode ? 'text-blue-400' : 'text-blue-600'} size={24} />
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow p-6 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Distributed</p>
              <p className={`text-2xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.distributedData}</p>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
              <Users className={darkMode ? 'text-green-400' : 'text-green-600'} size={24} />
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow p-6 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Called</p>
              <p className={`text-2xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.calledData}</p>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'}`}>
              <TrendingUp className={darkMode ? 'text-yellow-400' : 'text-yellow-600'} size={24} />
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow p-6 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Closed</p>
              <p className={`text-2xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.closedData}</p>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
              <BarChart3 className={darkMode ? 'text-purple-400' : 'text-purple-600'} size={24} />
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow p-6 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending</p>
              <p className={`text-2xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.pendingData}</p>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-orange-900/30' : 'bg-orange-100'}`}>
              <Target className={darkMode ? 'text-orange-400' : 'text-orange-600'} size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder for charts and additional content */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow p-6 border`}>
        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Data Analytics
        </h2>
        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
          Charts and detailed analytics will be displayed here.
        </p>
      </div>
    </div>
  );
};

export default TLDataDashboard;

