import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Award, 
  Users,
  Target,
  Calendar,
  Download,
  Filter,
  Eye,
  ChevronRight,
  Star,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import tlService from "../../services/tlService";
// import PerformanceChart from "../Components/charts/PerformanceChart";
// import TeamLeaderboard from "../Components/tables/TeamLeaderboard";
// import PerformanceMetrics from "../Components/PerformanceMetrics";

/**
 * TL Performance Page
 */
export default function TLPerformance() {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('conversion');

  useEffect(() => {
    fetchPerformanceData();
  }, [timeRange]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await tlService.getTeamPerformance(timeRange);
      if (response.success) {
        setPerformanceData(response.data);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
      // Mock data for development
      setPerformanceData({
        teamSize: 12,
        activeMembers: 8,
        totalLeads: 156,
        completedLeads: 108,
        pendingLeads: 32,
        rejectedLeads: 16,
        totalEarnings: 45200,
        avgResponseTime: 2.4,
        teamConversion: 69.2,
        averageRating: 4.3,
        performanceTrend: 12.5,
        topPerformers: [
          { rank: 1, name: "John Smith", leads: 45, conversion: 82.5, rating: 4.8 },
          { rank: 2, name: "Sarah Johnson", leads: 38, conversion: 78.3, rating: 4.6 },
          { rank: 3, name: "Mike Wilson", leads: 32, conversion: 75.2, rating: 4.4 },
          { rank: 4, name: "Emma Davis", leads: 28, conversion: 72.8, rating: 4.2 },
          { rank: 5, name: "David Brown", leads: 25, conversion: 68.5, rating: 4.1 },
        ],
        monthlyTrend: [
          { month: 'Jan', leads: 120, completed: 85, conversion: 70.8 },
          { month: 'Feb', leads: 135, completed: 95, conversion: 70.4 },
          { month: 'Mar', leads: 142, completed: 102, conversion: 71.8 },
          { month: 'Apr', leads: 156, completed: 108, conversion: 69.2 },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const timeRanges = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'quarter', label: 'This Quarter' },
    { id: 'year', label: 'This Year' }
  ];

  const metrics = [
    { id: 'conversion', label: 'Conversion Rate', icon: TrendingUp, color: 'blue' },
    { id: 'leads', label: 'Total Leads', icon: BarChart3, color: 'green' },
    { id: 'earnings', label: 'Total Earnings', icon: Award, color: 'purple' },
    { id: 'rating', label: 'Average Rating', icon: Star, color: 'yellow' }
  ];

  const handleExport = async () => {
    try {
      const blob = await tlService.exportTeamReport('excel', { range: timeRange });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `team-performance-${timeRange}-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Team Performance
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track and analyze your team's performance metrics
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
            {timeRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  timeRange === range.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Performance Metrics */}
      {performanceData && (
        <PerformanceMetrics data={performanceData} />
      )}

      {/* Metrics Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Performance Metrics
          </h3>
          <Filter className="w-5 h-5 text-gray-500" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <button
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                selectedMetric === metric.id
                  ? `border-${metric.color}-500 bg-${metric.color}-50 dark:bg-${metric.color}-900/20`
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-${metric.color}-100 dark:bg-${metric.color}-900/30`}>
                  <metric.icon className={`w-5 h-5 text-${metric.color}-600 dark:text-${metric.color}-400`} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {metric.label}
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                    {metric.id === 'conversion' ? `${performanceData?.teamConversion}%` :
                     metric.id === 'leads' ? performanceData?.totalLeads :
                     metric.id === 'earnings' ? `₹${performanceData?.totalEarnings?.toLocaleString()}` :
                     metric.id === 'rating' ? performanceData?.averageRating : 'N/A'}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Charts and Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Performance Trend
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Monthly performance overview
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Leads</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                </div>
              </div>
            </div>
            <PerformanceChart 
              data={performanceData?.monthlyTrend || []} 
              metric={selectedMetric}
            />
          </div>
        </div>

        {/* Team Leaderboard */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Top Performers
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  This {timeRange}'s leaders
                </p>
              </div>
              <Award className="w-5 h-5 text-yellow-500" />
            </div>
            <TeamLeaderboard 
              performers={performanceData?.topPerformers || []} 
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Team</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {performanceData?.activeMembers || 0}/{performanceData?.teamSize || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {performanceData?.completedLeads || 0}/{performanceData?.totalLeads || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {performanceData?.avgResponseTime || 0} hrs
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Performance Trend</p>
              <div className="flex items-center space-x-2 mt-1">
                {performanceData?.performanceTrend > 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                )}
                <p className={`text-2xl font-bold ${
                  performanceData?.performanceTrend > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {performanceData?.performanceTrend > 0 ? '+' : ''}{performanceData?.performanceTrend}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}