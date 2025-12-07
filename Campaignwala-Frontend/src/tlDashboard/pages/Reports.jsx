import { useState, useEffect } from "react";
import { 
  BarChart3, 
  Download, 
  FileText, 
  Calendar, 
  Filter,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  Eye,
  Printer,
  Share2,
  Mail,
  CheckCircle,
  XCircle
} from "lucide-react";
import tlService from "../../services/tlService";
// import ReportChart from "../Components/charts/ReportChart";
// import ReportTable from "../Components/tables/ReportTable";
// import ReportFilters from "../Components/ReportFilters";

/**
 * TL Reports Page
 */
export default function TLReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    dateRange: 'month',
    format: 'excel'
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [filters.dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      setReports([
        {
          id: 1,
          title: "Team Performance Report",
          type: "performance",
          dateRange: "Jan 2024",
          generatedAt: "2024-01-15T10:30:00Z",
          size: "2.4 MB",
          downloads: 42,
          status: "completed",
          metrics: {
            teamSize: 12,
            totalLeads: 156,
            conversionRate: 69.2,
            totalEarnings: 45200,
            avgResponseTime: 2.4
          }
        },
        {
          id: 2,
          title: "Lead Distribution Report",
          type: "leads",
          dateRange: "Dec 2023",
          generatedAt: "2023-12-20T14:45:00Z",
          size: "1.8 MB",
          downloads: 28,
          status: "completed",
          metrics: {
            totalLeads: 142,
            pending: 32,
            approved: 78,
            completed: 102,
            rejected: 16
          }
        },
        {
          id: 3,
          title: "Team Earnings Report",
          type: "earnings",
          dateRange: "Q4 2023",
          generatedAt: "2024-01-05T09:15:00Z",
          size: "3.2 MB",
          downloads: 35,
          status: "completed",
          metrics: {
            totalEarnings: 125800,
            teamEarnings: 45200,
            avgEarnings: 3766,
            topEarner: "John Smith",
            topEarnings: 15200
          }
        },
        {
          id: 4,
          title: "Monthly Activity Report",
          type: "activity",
          dateRange: "Jan 2024",
          generatedAt: "2024-01-16T11:20:00Z",
          size: "1.5 MB",
          downloads: 24,
          status: "generating",
          metrics: {
            activeDays: 22,
            totalActivities: 456,
            avgDailyActivities: 20.7,
            mostActiveMember: "Sarah Johnson",
            activitiesCount: 78
          }
        }
      ]);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const generateReport = async (type) => {
    try {
      setGenerating(true);
      // Generate report logic
      console.log('Generating report:', type);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add new report to list
      const newReport = {
        id: reports.length + 1,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
        type,
        dateRange: filters.dateRange,
        generatedAt: new Date().toISOString(),
        size: "1.2 MB",
        downloads: 0,
        status: "completed",
        metrics: {}
      };
      
      setReports([newReport, ...reports]);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = async (reportId) => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) return;

      // Simulate download
      const blob = new Blob(['Report content'], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title.toLowerCase().replace(/\s+/g, '-')}-${report.dateRange}.${filters.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Update download count
      setReports(reports.map(r => 
        r.id === reportId ? { ...r, downloads: r.downloads + 1 } : r
      ));
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const shareReport = (reportId) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      // Implement share logic
      console.log('Sharing report:', report.title);
    }
  };

  const reportTypes = [
    { id: 'performance', label: 'Performance', icon: TrendingUp, color: 'blue' },
    { id: 'leads', label: 'Leads', icon: BarChart3, color: 'green' },
    { id: 'earnings', label: 'Earnings', icon: DollarSign, color: 'purple' },
    { id: 'activity', label: 'Activity', icon: Clock, color: 'orange' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Generate and analyze detailed team reports
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <button
            onClick={() => generateReport('comprehensive')}
            disabled={generating}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            <span>{generating ? 'Generating...' : 'Generate Report'}</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {reportTypes.map((type) => (
          <div
            key={type.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => generateReport(type.id)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {type.label} Reports
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {reports.filter(r => r.type === type.id).length}
                </p>
              </div>
              <div className={`p-3 rounded-full bg-${type.color}-100 dark:bg-${type.color}-900/30`}>
                <type.icon className={`w-6 h-6 text-${type.color}-600 dark:text-${type.color}-400`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <ReportFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Report Generation Options */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Generate New Report
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => generateReport(type.id)}
              disabled={generating}
              className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-${type.color}-100 dark:bg-${type.color}-900/30`}>
                  <type.icon className={`w-5 h-5 text-${type.color}-600 dark:text-${type.color}-400`} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {type.label} Report
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Generate detailed {type.label.toLowerCase()} analysis
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Reports
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Generated and downloaded reports
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange({ type: e.target.value })}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="performance">Performance</option>
                <option value="leads">Leads</option>
                <option value="earnings">Earnings</option>
                <option value="activity">Activity</option>
              </select>
            </div>
          </div>
        </div>
        
        <ReportTable 
          reports={reports}
          loading={loading}
          onDownload={downloadReport}
          onShare={shareReport}
          onView={setSelectedReport}
        />
      </div>

      {/* Report Statistics Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Report Statistics
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Monthly report generation and downloads
            </p>
          </div>
          <BarChart3 className="w-5 h-5 text-gray-500" />
        </div>
        <ReportChart reports={reports} />
      </div>
    </div>
  );
}