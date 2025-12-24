import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { XCircle, RefreshCw, Search, Filter } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const TLWithdrawnDataPage = () => {
  const { darkMode } = useOutletContext() || { darkMode: false };
  const [loading, setLoading] = useState(false);
  const [withdrawnData, setWithdrawnData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchWithdrawnData();
  }, []);

  const fetchWithdrawnData = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to fetch withdrawn data
      // const response = await dataService.getTLWithdrawnData();
      // if (response.success) {
      //   setWithdrawnData(response.data);
      // }
      setWithdrawnData([]);
      toast.success('Withdrawn data loaded successfully');
    } catch (error) {
      toast.error('Failed to load withdrawn data');
      console.error('Error fetching withdrawn data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = withdrawnData.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.name?.toLowerCase().includes(query) ||
      item.phone?.toLowerCase().includes(query) ||
      item.email?.toLowerCase().includes(query)
    );
  });

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
              <XCircle className="text-red-600 dark:text-red-400" />
              Withdrawn Data
            </h1>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
              View data that has been withdrawn from team members
            </p>
          </div>
          <button
            onClick={fetchWithdrawnData}
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

      {/* Search and Filters */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow p-4 mb-6 border`}>
        <div className="flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className={`absolute left-3 top-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={16} />
            <input
              placeholder="Search by name, phone, or email"
              className={`pl-10 border rounded w-full h-10 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow overflow-x-auto border`}>
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={32} />
            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Loading withdrawn data...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-12">
            <XCircle className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              No withdrawn data found
            </h3>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
              {searchQuery ? 'No data matches your search criteria.' : 'No data has been withdrawn yet.'}
            </p>
          </div>
        ) : (
          <table className="w-full min-w-max">
            <thead className={darkMode ? 'bg-gray-700 text-sm' : 'bg-gray-100 text-sm'}>
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="text-left">Phone</th>
                <th className="text-left">Email</th>
                <th className="text-left">Withdrawn Date</th>
                <th className="text-left">Reason</th>
                <th className="text-left">Withdrawn By</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredData.map((item, index) => (
                <tr 
                  key={index} 
                  className={darkMode ? 'hover:bg-gray-700 transition-colors border-b border-gray-700' : 'hover:bg-gray-50 transition-colors border-b border-gray-200'}
                >
                  <td className="p-3">{item.name || '-'}</td>
                  <td>{item.phone || '-'}</td>
                  <td>{item.email || '-'}</td>
                  <td>{item.withdrawnDate || '-'}</td>
                  <td>{item.reason || '-'}</td>
                  <td>{item.withdrawnBy || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TLWithdrawnDataPage;

