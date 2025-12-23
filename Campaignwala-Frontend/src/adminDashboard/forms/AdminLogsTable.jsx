import { useState, useEffect } from "react";
import { Eye, X } from "lucide-react";
import adminLogService from "../../services/adminLogService";
import toast, { Toaster } from "react-hot-toast";

export default function AdminLogsTable() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100,
    total: 0,
    pages: 0
  });

  // Fetch logs from API
  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminLogService.getAllAdminLogs({
        page: pagination.page,
        limit: pagination.limit,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      if (response.success && response.data) {
        // Transform API data to UI format
        const transformedLogs = response.data.logs.map(log => ({
          id: log._id || log.logId,
          admin: log.adminName,
          action: log.action,
          timestamp: formatTimestamp(log.createdAt),
          ip: log.ipAddress || 'Unknown',
          severity: log.severity,
          details: log.details || 'No additional details available.'
        }));

        setLogs(transformedLogs);
        
        if (response.data.pagination) {
          setPagination({
            page: response.data.pagination.currentPage,
            limit: response.data.pagination.limit,
            total: response.data.pagination.totalLogs,
            pages: response.data.pagination.totalPages
          });
        }
      }
    } catch (err) {
      console.error('Error fetching admin logs:', err);
      const errorMsg = err.message || 'Failed to load admin logs';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Format timestamp
  const formatTimestamp = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // Handle export logs
  const handleExportLogs = async () => {
    try {
      // Fetch all logs (without pagination limit)
      const response = await adminLogService.getAllAdminLogs({
        limit: 10000,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      if (response.success && response.data && response.data.logs) {
        adminLogService.downloadCSV(response.data.logs);
        toast.success('✅ Logs exported successfully!');
      }
    } catch (err) {
      console.error('Error exporting logs:', err);
      toast.error('Failed to export logs');
    }
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedLog(null);
  };

  const severityColors = {
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <div className="p-6">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Admin Activity Logs</h2>
        <button 
          onClick={handleExportLogs}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm whitespace-nowrap"
        >
          Export Logs
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin logs...</p>
        </div>
      ) : error ? (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button
            onClick={fetchLogs}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <p className="text-muted-foreground">No admin logs found</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
            <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Admin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">IP Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Severity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-muted/50">
                <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">{log.id}</td>
                <td className="px-6 py-4 text-sm font-medium text-foreground whitespace-nowrap">{log.admin}</td>
                <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">{log.action}</td>
                <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">{log.timestamp}</td>
                <td className="px-6 py-4 text-sm text-foreground font-mono whitespace-nowrap">{log.ip}</td>
                <td className="px-6 py-4 text-sm whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase whitespace-nowrap ${severityColors[log.severity]}`}>
                    {log.severity}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap">
                  <button
                    onClick={() => handleViewDetails(log)}
                    className="text-white hover:opacity-90 transition-colors px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 whitespace-nowrap"
                    style={{ backgroundColor: '#561ED0' }}
                  >
                    <Eye className="w-3 h-3" />
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="text-white px-6 py-4 flex items-center justify-between" style={{ backgroundColor: '#561ED0' }}>
              <h2 className="text-xl font-semibold">Admin Log Details</h2>
              <button 
                onClick={handleCloseModal}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              {/* Log Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Log ID</h3>
                    <p className="text-gray-900 font-medium">#{selectedLog.id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Admin</h3>
                    <p className="text-gray-900 font-medium">{selectedLog.admin}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Action</h3>
                    <p className="text-gray-900">{selectedLog.action}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Timestamp</h3>
                    <p className="text-gray-900 font-mono text-sm">{selectedLog.timestamp}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">IP Address</h3>
                    <p className="text-gray-900 font-mono text-sm">{selectedLog.ip}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Severity</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase inline-block ${severityColors[selectedLog.severity]}`}>
                      {selectedLog.severity}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detailed Description */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Detailed Description</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">{selectedLog.details}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t bg-gray-50 px-6 py-4 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
