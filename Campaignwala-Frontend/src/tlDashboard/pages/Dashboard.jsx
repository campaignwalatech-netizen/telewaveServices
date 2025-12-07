import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  DollarSign, 
  Clock,
  Award,
  BarChart3,
  Calendar,
  ArrowUp,
  ArrowDown,
  Target,
  CheckCircle,
  XCircle,
  Clock as ClockIcon
} from "lucide-react";
import axios from "axios";
import api from "../../services/api";

// TL Dashboard Components
import StatCard from "../Components/StatCard";
import TeamPerformanceChart from "../Components/charts/TeamPerformanceChart";
// import RecentLeadsTable from "../components/tables/RecentLeadsTable";
// import TopPerformers from "../components/TopPerformers";
// import ActivityFeed from "../components/ActivityFeed";
// import QuickStats from "../components/QuickStats";

/**
 * TL Dashboard Main Page
 */
export default function TLDashboard() {
  const [stats, setStats] = useState({
    teamMembers: 0,
    activeLeads: 0,
    completedLeads: 0,
    pendingApprovals: 0,
    teamConversion: 0,
    totalEarnings: 0,
    avgResponseTime: 0,
    teamRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('today');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${api}/api/dashboard/tl`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { range: timeRange }
      });

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching TL dashboard data:', error);
      // Fallback to mock data
      setStats({
        teamMembers: 12,
        activeLeads: 45,
        completedLeads: 156,
        pendingApprovals: 8,
        teamConversion: 68.5,
        totalEarnings: 24500,
        avgResponseTime: 2.5,
        teamRating: 4.2
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Team Members",
      value: stats.teamMembers,
      icon: Users,
      color: "blue",
      change: "+2",
      changeType: "increase",
      description: "Active team members"
    },
    {
      title: "Active Leads",
      value: stats.activeLeads,
      icon: Briefcase,
      color: "green",
      change: "+12%",
      changeType: "increase",
      description: "Currently assigned"
    },
    {
      title: "Completed Leads",
      value: stats.completedLeads,
      icon: CheckCircle,
      color: "purple",
      change: "+8",
      changeType: "increase",
      description: "This month"
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApprovals,
      icon: ClockIcon,
      color: "orange",
      change: "-3",
      changeType: "decrease",
      description: "Awaiting review"
    },
    {
      title: "Team Conversion",
      value: `${stats.teamConversion}%`,
      icon: TrendingUp,
      color: "teal",
      change: "+5.2%",
      changeType: "increase",
      description: "Overall rate"
    },
    {
      title: "Total Earnings",
      value: `₹${stats.totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      color: "yellow",
      change: "+15%",
      changeType: "increase",
      description: "Team earnings"
    }
  ];

  const timeRanges = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'quarter', label: 'This Quarter' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Team Leader Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor team performance, manage leads, and track progress
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
          
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Schedule Report</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      {/* <QuickStats /> */}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} loading={loading} />
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Performance Chart */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Team Performance
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Leads completed vs targets
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Actual</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Target</span>
                </div>
              </div>
            </div>
            <TeamPerformanceChart />
          </div>
        </div>

        {/* Top Performers */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Top Performers
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  This week's leaders
                </p>
              </div>
              <Award className="w-5 h-5 text-yellow-500" />
            </div>
            {/* <TopPerformers /> */}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Leads
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Latest lead submissions
                </p>
              </div>
              <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
                View All →
              </button>
            </div>
            {/* <RecentLeadsTable /> */}
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Activity Feed
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Team updates
                </p>
              </div>
              <Clock className="w-5 h-5 text-gray-500" />
            </div>
            {/* <ActivityFeed /> */}
          </div>
        </div>
      </div>
    </div>
  );
}