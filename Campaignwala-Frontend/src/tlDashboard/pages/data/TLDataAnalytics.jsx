import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BarChart3, TrendingUp, PieChart, RefreshCw } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const TLDataAnalytics = () => {
  const { darkMode } = useOutletContext() || { darkMode: false };
  const [loading, setLoading] = useState(false);
  const [analytics] = useState({
    conversionRate: 0,
    averageCallsPerDay: 0,
    topPerformers: [],
    distributionTrends: [],
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to fetch analytics
      // const response = await dataService.getTLDataAnalytics();
      // if (response.success) {
      //   setAnalytics(response.data);
      // }
      toast.success('Analytics loaded successfully');
    } catch (error) {
      toast.error('Failed to load analytics');
      console.error('Error fetching analytics:', error);
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
              <PieChart className="text-purple-600 dark:text-purple-400" />
              Data Analytics
            </h1>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
              Detailed analytics and insights for your data management
            </p>
          </div>
          <button
            onClick={fetchAnalytics}
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow p-6 border`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Conversion Rate</h3>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
              <TrendingUp className={darkMode ? 'text-green-400' : 'text-green-600'} size={24} />
            </div>
          </div>
          <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {analytics.conversionRate.toFixed(2)}%
          </p>
          <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Overall conversion rate from calls to closed
          </p>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow p-6 border`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Average Calls/Day</h3>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
              <BarChart3 className={darkMode ? 'text-blue-400' : 'text-blue-600'} size={24} />
            </div>
          </div>
          <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {analytics.averageCallsPerDay.toFixed(1)}
          </p>
          <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Average number of calls per day
          </p>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow p-6 mb-6 border`}>
        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Performance Charts
        </h2>
        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
          Charts and visualizations will be displayed here.
        </p>
      </div>

      {/* Top Performers */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow p-6 border`}>
        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Top Performers
        </h2>
        {analytics.topPerformers.length === 0 ? (
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            No performance data available yet.
          </p>
        ) : (
          <div className="space-y-3">
            {analytics.topPerformers.map((performer, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700/50 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {performer.name}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {performer.stats}
                    </p>
                  </div>
                  <span className={`text-lg font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    #{index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TLDataAnalytics;

