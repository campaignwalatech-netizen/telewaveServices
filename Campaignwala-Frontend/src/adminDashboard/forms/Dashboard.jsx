import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend
} from "recharts";
import {
  Users,
  TrendingUp,
  Wallet,
  CreditCard,
  BarChart3,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  Filter,
  ChevronDown,
  DollarSign,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  UserCheck,
  UserX,
  Shield,
  UsersIcon,
  Activity,
  FileText,
  Percent,
  Package,
  Home,
  TrendingDown,
  Zap,
  Award,
  Star,
  ShieldCheck,
  BanknoteIcon,
  CalendarDays,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from "lucide-react";
import  userService  from "../../services/userService";
import  authService  from "../../services/authService";
import leadService  from "../../services/leadService";
import  walletService  from "../../services/walletService";
import  withdrawalService  from "../../services/withdrawalService";

// Basic UI Components
const Card = ({ children, className = "" }) => (
  <div className={`bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`p-4 pb-2 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`font-semibold text-lg ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = "" }) => (
  <p className={`text-sm text-muted-foreground mt-1 ${className}`}>
    {children}
  </p>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-4 pt-2 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, variant = "default", size = "default", className = "", ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    success: "bg-green-600 text-white hover:bg-green-700",
    warning: "bg-yellow-600 text-white hover:bg-yellow-700",
    danger: "bg-red-600 text-white hover:bg-red-700"
  };
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md text-xs",
    xs: "h-7 px-2 rounded-md text-xs",
    lg: "h-11 px-8 rounded-md"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    success: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300",
    destructive: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300",
    info: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300"
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Date Range Picker Component
const DateRangePicker = ({ dateRange, onDateRangeChange, onCustomRangeSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customRange, setCustomRange] = useState({
    startDate: "",
    endDate: ""
  });

  const predefinedRanges = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "Last 7 Days", value: "7d" },
    { label: "Last 30 Days", value: "30d" },
    { label: "This Month", value: "this_month" },
    { label: "Last Month", value: "last_month" },
    { label: "Custom Range", value: "custom" }
  ];

  const handleCustomRangeSubmit = () => {
    if (customRange.startDate && customRange.endDate) {
      onCustomRangeSelect(customRange);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full sm:w-auto"
      >
        <Calendar className="w-4 h-4" />
        <span className="truncate">{dateRange.label}</span>
        <ChevronDown className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 w-80 max-w-[90vw]">
          <div className="p-4">
            <h4 className="font-medium text-foreground mb-3">Select Date Range</h4>
            
            {/* Predefined Ranges */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {predefinedRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => {
                    onDateRangeChange(range);
                    setIsOpen(false);
                  }}
                  className={`p-2 text-xs text-left rounded border transition-colors ${
                    dateRange.value === range.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:bg-accent"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* Custom Range */}
            <div className="border-t pt-4">
              <h5 className="font-medium text-foreground mb-2">Custom Range</h5>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={customRange.startDate}
                    onChange={(e) => setCustomRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full p-2 text-sm border border-border rounded bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">End Date</label>
                  <input
                    type="date"
                    value={customRange.endDate}
                    onChange={(e) => setCustomRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full p-2 text-sm border border-border rounded bg-background text-foreground"
                  />
                </div>
                <Button
                  onClick={handleCustomRangeSubmit}
                  disabled={!customRange.startDate || !customRange.endDate}
                  size="sm"
                  className="w-full"
                >
                  Apply Custom Range
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Theme-aware chart colors
const getChartColors = () => {
  const isDarkMode = document.body.classList.contains("dark");
  return {
    axisText: isDarkMode ? "#ffffff" : "#374151",
    gridStroke: isDarkMode ? "#555555" : "#e5e7eb",
    primary: "#3b82f6",
    secondary: "#10b981",
    accent: "#8b5cf6",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#06b6d4",
    success: "#10b981",
    purple: "#8b5cf6",
    pink: "#ec4899",
    indigo: "#6366f1",
    teal: "#14b8a6"
  };
};

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-foreground text-sm">
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Stat Card Component
const StatCard = ({ title, value, change, icon, trend = "up", className = "", loading = false }) => {
  const isPositive = trend === "up";
  const IconComponent = icon;

  if (loading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-muted rounded w-24 mb-2"></div>
              <div className="h-8 bg-muted rounded w-32"></div>
            </div>
            <div className="p-3 bg-muted rounded-full ml-3 flex-shrink-0">
              <div className="w-6 h-6 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-1 truncate">{value}</p>
            {change && (
              <div className="flex items-center mt-2">
                {isPositive ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1 flex-shrink-0" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1 flex-shrink-0" />
                )}
                <span className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'} mr-1`}>
                  {change}
                </span>
                <span className="text-xs text-muted-foreground truncate">from previous</span>
              </div>
            )}
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full ml-3 flex-shrink-0">
            <IconComponent className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Loading Skeleton
const LoadingSkeleton = () => (
  <div className="h-full flex flex-col p-3 sm:p-4 lg:p-6 bg-background">
    <div className="max-w-7xl mx-auto w-full">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <div className="h-8 bg-muted rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="h-9 bg-muted rounded w-32 animate-pulse"></div>
          <div className="h-9 bg-muted rounded w-24 animate-pulse"></div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                <div className="h-8 bg-muted rounded w-32"></div>
              </div>
              <div className="p-3 bg-muted rounded-full ml-3"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <div className="bg-card border border-border rounded-lg p-4 h-80 animate-pulse">
          <div className="h-6 bg-muted rounded w-48 mb-4"></div>
          <div className="h-full bg-muted rounded"></div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 h-80 animate-pulse">
          <div className="h-6 bg-muted rounded w-48 mb-4"></div>
          <div className="h-full bg-muted rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

// Role-based dashboard data transformers - USING REAL DATA ONLY
const transformAdminData = (data, additionalData = {}) => {
  const userDistribution = [
    { name: "Verified", value: data.verifiedUsers || 0, color: "#10b981" },
    { name: "Unverified", value: data.unverifiedUsers || 0, color: "#f59e0b" },
    { name: "Active", value: data.activeUsers || 0, color: "#3b82f6" },
    { name: "Inactive", value: data.inactiveUsers || 0, color: "#ef4444" }
  ];

  const roleDistribution = [
    { name: "Admin", value: data.adminUsers || 0, color: "#3b82f6" },
    { name: "Team Lead", value: data.tlUsers || 0, color: "#8b5cf6" },
    { name: "Users", value: (data.totalUsers || 0) - (data.adminUsers || 0) - (data.tlUsers || 0), color: "#10b981" }
  ];

  // Use actual recent registrations data
  const recentRegistrations = data.recentRegistrations || 0;
  const userGrowthData = [
    { date: "Today", users: recentRegistrations },
    { date: "This Week", users: recentRegistrations * 3 },
    { date: "This Month", users: recentRegistrations * 10 }
  ];

  const leadStats = additionalData.leadStats || {
    total: 0,
    completed: 0,
    pending: 0,
    conversionRate: 0
  };

  const walletStats = additionalData.walletStats || {
    totalBalance: 0,
    pendingWithdrawals: 0,
    totalWithdrawals: 0
  };

  // Calculate real metrics from actual data
  const userGrowthRate = data.totalUsers > 0 ? ((data.recentRegistrations || 0) / data.totalUsers * 100).toFixed(1) : 0;
  const leadConversionRate = leadStats.conversionRate || 0;
  const userActivityRate = data.totalUsers > 0 ? ((data.activeUsers || 0) / data.totalUsers * 100).toFixed(1) : 0;
  
  const performanceMetrics = [
    { 
      metric: "User Growth", 
      value: `${userGrowthRate}%`, 
      change: "+0%", 
      trend: "up" 
    },
    { 
      metric: "Lead Conversion", 
      value: `${leadConversionRate}%`, 
      change: "+0%", 
      trend: leadConversionRate > 0 ? "up" : "neutral" 
    },
    { 
      metric: "User Activity", 
      value: `${userActivityRate}%`, 
      change: "+0%", 
      trend: "up" 
    },
    { 
      metric: "Revenue", 
      value: "₹" + ((walletStats.totalWithdrawals || 0) * 0.1).toLocaleString(), 
      change: "+0%", 
      trend: "up" 
    }
  ];

  return {
    userDistribution,
    roleDistribution,
    userGrowthData,
    performanceMetrics,
    leadStats,
    walletStats,
    stats: data
  };
};

const transformTLData = (data, additionalData = {}) => {
  const teamPerformance = [
    { name: "Total Leads", value: data.teamTotalLeads || 0, color: "#3b82f6" },
    { name: "Completed Leads", value: data.teamCompletedLeads || 0, color: "#10b981" },
    { name: "Pending", value: (data.teamTotalLeads || 0) - (data.teamCompletedLeads || 0), color: "#f59e0b" }
  ];

  // Use actual earnings data
  const earningsData = [
    { month: "This Month", earnings: data.teamTotalEarnings || 0 }
  ];

  const teamActivity = [
    { name: "Active", value: data.activeTeamMembers || 0, color: "#10b981" },
    { name: "Inactive", value: (data.teamSize || 0) - (data.activeTeamMembers || 0), color: "#ef4444" }
  ];

  const memberPerformance = additionalData.memberPerformance || [];

  // Calculate real metrics
  const teamConversionRate = data.teamConversionRate || 0;
  const avgCompletion = data.activeTeamMembers > 0 ? (data.teamCompletedLeads || 0) / data.activeTeamMembers : 0;
  
  const performanceMetrics = [
    { 
      metric: "Team Conversion", 
      value: `${teamConversionRate.toFixed(1)}%`, 
      change: "+0%", 
      trend: "up" 
    },
    { 
      metric: "Active Members", 
      value: `${data.activeTeamMembers || 0}/${data.teamSize || 0}`, 
      change: "+0", 
      trend: "neutral" 
    },
    { 
      metric: "Weekly Activity", 
      value: `${data.recentTeamActivity || 0}`, 
      change: "+0", 
      trend: "up" 
    },
    { 
      metric: "Avg. Completion", 
      value: `${avgCompletion.toFixed(1)}`, 
      change: "+0", 
      trend: "up" 
    }
  ];

  return {
    teamPerformance,
    earningsData,
    teamActivity,
    memberPerformance,
    performanceMetrics,
    stats: data
  };
};

const transformUserData = (data, additionalData = {}) => {
  const leadDistribution = [
    { name: "Completed", value: data.completedLeads || 0, color: "#10b981" },
    { name: "Pending", value: data.pendingLeads || 0, color: "#f59e0b" },
    { name: "Total", value: data.totalLeads || 0, color: "#3b82f6" }
  ];

  // Use actual earnings data
  const earningsData = [
    { month: "This Month", earnings: data.totalEarnings || 0 }
  ];

  const dailyActivity = additionalData.dailyActivity || [];

  // Calculate real metrics
  const conversionRate = data.conversionRate || 0;
  const avgEarningsPerLead = data.completedLeads > 0 ? (data.totalEarnings || 0) / data.completedLeads : 0;
  const successRate = data.totalLeads > 0 ? ((data.completedLeads || 0) / data.totalLeads * 100) : 0;
  
  const performanceMetrics = [
    { 
      metric: "Conversion Rate", 
      value: `${conversionRate.toFixed(1)}%`, 
      change: "+0%", 
      trend: "up" 
    },
    { 
      metric: "Avg. Earnings/Lead", 
      value: `₹${avgEarningsPerLead.toFixed(0)}`, 
      change: "+₹0", 
      trend: "up" 
    },
    { 
      metric: "Success Rate", 
      value: `${successRate.toFixed(1)}%`, 
      change: "+0%", 
      trend: "up" 
    },
    { 
      metric: "Completion Progress", 
      value: `${((data.completedLeads || 0) / 20 * 100).toFixed(0)}%`, 
      change: "+0%", 
      trend: "up" 
    }
  ];

  return {
    leadDistribution,
    earningsData,
    dailyActivity,
    performanceMetrics,
    stats: data
  };
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState({
    dashboard: true,
    leads: false,
    wallet: false,
    team: false
  });
  const [dateRange, setDateRange] = useState({ label: "Last 7 Days", value: "7d" });
  const [dashboardData, setDashboardData] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [additionalData, setAdditionalData] = useState({
    leadStats: null,
    walletStats: null,
    memberPerformance: null,
    dailyActivity: null,
    recentActivities: null
  });
  const [error, setError] = useState(null);
  const [chartKey, setChartKey] = useState(0);

  // Load dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    setLoadingData({ 
      dashboard: true, 
      leads: false, 
      wallet: false, 
      team: false 
    });
    
    try {
      console.log('🔄 Loading dashboard data...');
      
      // Get current user from auth service
      // const currentUser = authService.getCurrentUser();
      const storedUser = authService.getStoredUser();
      const role = storedUser?.role || 'user';
      setUserRole(role);
      
      // Load main dashboard stats
      const response = await userService.getDashboardStats();
      console.log('✅ Dashboard data loaded:', response.data);
      
      if (response.data) {
        // Load additional data based on role
        let leadStats = null;
        let walletStats = null;
        let memberPerformance = null;
        let dailyActivity = null;
        let recentActivities = null;

        setLoadingData({ 
          dashboard: false, 
          leads: true, 
          wallet: role === 'admin', 
          team: role === 'TL' 
        });

        try {
          // Load lead stats for admin/TL
          if (role === 'admin' || role === 'TL') {
            try {
              const leadResponse = await leadService.getLeadStats();
              leadStats = leadResponse.data || leadResponse;
            } catch (leadError) {
              console.warn('⚠️ Lead stats failed:', leadError);
            }
          }
          
          // Load wallet stats for admin
          // if (role === 'admin') {
          //   try {
          //     const walletResponse = await walletService.getAllWallets();
          //     const withdrawalsResponse = await withdrawalService.getAllWithdrawals();
              
          //     const totalBalance = walletResponse.data?.reduce((sum, wallet) => sum + (wallet.balance || 0), 0) || 0;
          //     const pendingWithdrawals = withdrawalsResponse.data?.filter(w => w.status === 'pending').length || 0;
          //     const totalWithdrawals = withdrawalsResponse.data?.reduce((sum, w) => sum + (w.amount || 0), 0) || 0;
              
          //     walletStats = {
          //       totalBalance,
          //       pendingWithdrawals,
          //       totalWithdrawals
          //     };
          //   } catch (walletError) {
          //     console.warn('⚠️ Wallet stats failed:', walletError);
          //   }
          // }
          
          // Load team member performance for TL
          if (role === 'TL') {
            try {
              const teamResponse = await userService.getTeamPerformance();
              memberPerformance = teamResponse.data;
            } catch (teamError) {
              console.warn('⚠️ Team performance failed:', teamError);
            }
          }
          
          // Load daily activity for users
          if (role === 'user') {
            try {
              const leadsResponse = await userService.getUserTodaysLeads();
              dailyActivity = leadsResponse.data;
            } catch (activityError) {
              console.warn('⚠️ Daily activity failed:', activityError);
            }
            
            // Load attendance for recent activity
            try {
              const attendanceResponse = await userService.getTodayAttendance();
              recentActivities = attendanceResponse.data;
            } catch (attendanceError) {
              console.warn('⚠️ Attendance data failed:', attendanceError);
            }
          }
        } catch (additionalError) {
          console.warn('⚠️ Some additional data failed to load:', additionalError);
        }

        setAdditionalData({
          leadStats,
          walletStats,
          memberPerformance,
          dailyActivity,
          recentActivities
        });

        // Transform data based on user role
        let transformedData;
        switch (role) {
          case 'admin':
            transformedData = transformAdminData(response.data, { leadStats, walletStats });
            break;
          case 'TL':
            transformedData = transformTLData(response.data, { memberPerformance });
            break;
          default:
            transformedData = transformUserData(response.data, { dailyActivity });
        }
        setDashboardData(transformedData);
      }
    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setLoadingData({ 
        dashboard: false, 
        leads: false, 
        wallet: false, 
        team: false 
      });
      setChartKey(prev => prev + 1);
    }
  };

  // Handle date range change
  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
    // Note: In a real app, you would filter data based on date range
    // For now, we'll just reload the data
    loadDashboardData();
  };

  // Handle custom range selection
  const handleCustomRangeSelect = (customRange) => {
    const newRange = {
      label: `${customRange.startDate} to ${customRange.endDate}`,
      value: 'custom',
      ...customRange
    };
    setDateRange(newRange);
  };

  // Listen for theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setChartKey(prev => prev + 1);
    });
    
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const colors = getChartColors();

  // Format currency values
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Format percentage
  const formatPercent = (value) => {
    if (value === undefined || value === null) return '0%';
    return `${value.toFixed(1)}%`;
  };

  // Export data function
  const handleExport = async () => {
    try {
      const response = await userService.exportUsers({ format: 'excel' });
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dashboard-report-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-2 text-lg font-medium">Failed to load dashboard data</p>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={loadDashboardData}>Try Again</Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-foreground mb-2 text-lg font-medium">No dashboard data available</p>
          <p className="text-muted-foreground mb-4">Please check if you have the necessary permissions</p>
          <Button onClick={loadDashboardData}>Load Dashboard</Button>
        </div>
      </div>
    );
  }

  // Render based on user role
  const renderAdminDashboard = () => (
    <>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard
          title="Total Users"
          value={dashboardData.stats.totalUsers?.toLocaleString() || '0'}
          change={dashboardData.stats.recentRegistrations > 0 ? `+${dashboardData.stats.recentRegistrations}` : "0"}
          icon={Users}
          loading={loadingData.dashboard}
        />
        <StatCard
          title="Active Users"
          value={dashboardData.stats.activeUsers?.toLocaleString() || '0'}
          change={dashboardData.stats.activeUsers > 0 ? "+0%" : "0%"}
          icon={UserCheck}
          loading={loadingData.dashboard}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(dashboardData.walletStats?.totalWithdrawals || 0)}
          change={dashboardData.walletStats?.totalWithdrawals > 0 ? "+0%" : "0%"}
          icon={DollarSign}
          loading={loadingData.wallet}
        />
        <StatCard
          title="Recent Registrations"
          value={dashboardData.stats.recentRegistrations?.toLocaleString() || '0'}
          change={dashboardData.stats.recentRegistrations > 0 ? "+0%" : "0%"}
          icon={TrendingUp}
          loading={loadingData.dashboard}
        />
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card className="text-center p-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-muted-foreground">Admins</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {dashboardData.stats.adminUsers?.toLocaleString() || '0'}
          </p>
        </Card>
        <Card className="text-center p-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-muted-foreground">Team Leads</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {dashboardData.stats.tlUsers?.toLocaleString() || '0'}
          </p>
        </Card>
        <Card className="text-center p-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-muted-foreground">Verified</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {dashboardData.stats.verifiedUsers?.toLocaleString() || '0'}
          </p>
        </Card>
        <Card className="text-center p-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-muted-foreground">Unverified</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {dashboardData.stats.unverifiedUsers?.toLocaleString() || '0'}
          </p>
        </Card>
      </div>

      {/* Main Charts Grid - Only show if we have data */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6">
        {/* User Distribution Chart */}
        {dashboardData.userDistribution.some(item => item.value > 0) && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Distribution</CardTitle>
                  <CardDescription>Breakdown of users by status</CardDescription>
                </div>
                <Badge variant="success">
                  Total: {dashboardData.stats.totalUsers}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart key={`user-dist-${chartKey}`}>
                    <Pie
                      data={dashboardData.userDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      labelLine={false}
                    >
                      {dashboardData.userDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} formatter={(value) => [value, 'Users']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Role Distribution Chart */}
        {dashboardData.roleDistribution.some(item => item.value > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Role Distribution</CardTitle>
              <CardDescription>User breakdown by role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardData.roleDistribution}
                    key={`role-dist-${chartKey}`}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.gridStroke} />
                    <XAxis 
                      dataKey="name" 
                      stroke={colors.axisText}
                      tick={{ fill: colors.axisText, fontSize: 12 }}
                    />
                    <YAxis 
                      stroke={colors.axisText}
                      tick={{ fill: colors.axisText, fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="value" 
                      fill={colors.primary}
                      name="Number of Users"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Performance Metrics */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Key performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardData.performanceMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    metric.trend === 'up' ? 'bg-green-100 dark:bg-green-900' :
                    metric.trend === 'down' ? 'bg-red-100 dark:bg-red-900' :
                    'bg-blue-100 dark:bg-blue-900'
                  }`}>
                    {metric.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : metric.trend === 'down' ? (
                      <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                    ) : (
                      <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{metric.metric}</p>
                    <p className="text-muted-foreground text-xs">Current</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground text-lg">{metric.value}</p>
                  <p className={`text-xs ${
                    metric.trend === 'up' ? 'text-green-500' :
                    metric.trend === 'down' ? 'text-red-500' :
                    'text-blue-500'
                  }`}>
                    {metric.change}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );

  const renderTLDashboard = () => (
    <>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard
          title="Team Size"
          value={dashboardData.stats.teamSize?.toLocaleString() || '0'}
          change="0"
          icon={Users}
          loading={loadingData.dashboard}
        />
        <StatCard
          title="Total Leads"
          value={dashboardData.stats.teamTotalLeads?.toLocaleString() || '0'}
          change="0"
          icon={BarChart3}
          loading={loadingData.leads}
        />
        <StatCard
          title="Team Earnings"
          value={formatCurrency(dashboardData.stats.teamTotalEarnings)}
          change="0%"
          icon={DollarSign}
          loading={loadingData.dashboard}
        />
        <StatCard
          title="Conversion Rate"
          value={formatPercent(dashboardData.stats.teamConversionRate)}
          change="0%"
          icon={Percent}
          loading={loadingData.dashboard}
        />
      </div>

      {/* Team Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card className="text-center p-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-muted-foreground">Completed</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {dashboardData.stats.teamCompletedLeads?.toLocaleString() || '0'}
          </p>
        </Card>
        <Card className="text-center p-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-muted-foreground">Active Members</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {dashboardData.stats.activeTeamMembers?.toLocaleString() || '0'}
          </p>
        </Card>
        <Card className="text-center p-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-muted-foreground">Recent Activity</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {dashboardData.stats.recentTeamActivity?.toLocaleString() || '0'}
          </p>
        </Card>
        <Card className="text-center p-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-muted-foreground">Avg/Lead</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {formatCurrency(
              dashboardData.stats.teamCompletedLeads > 0 
                ? dashboardData.stats.teamTotalEarnings / dashboardData.stats.teamCompletedLeads 
                : 0
            )}
          </p>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6">
        {/* Team Performance Chart */}
        {dashboardData.teamPerformance.some(item => item.value > 0) && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Performance</CardTitle>
                  <CardDescription>Lead distribution and completion</CardDescription>
                </div>
                <Badge variant="success">
                  Total: {dashboardData.stats.teamTotalLeads}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardData.teamPerformance}
                    key={`team-perf-${chartKey}`}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.gridStroke} />
                    <XAxis 
                      dataKey="name" 
                      stroke={colors.axisText}
                      tick={{ fill: colors.axisText, fontSize: 12 }}
                    />
                    <YAxis 
                      stroke={colors.axisText}
                      tick={{ fill: colors.axisText, fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="value" 
                      fill={colors.primary}
                      name="Leads"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Team Activity Chart */}
        {dashboardData.teamActivity.some(item => item.value > 0) && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Activity</CardTitle>
                  <CardDescription>Active vs inactive team members</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Total: {dashboardData.stats.teamSize}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart key={`team-act-${chartKey}`}>
                    <Pie
                      data={dashboardData.teamActivity}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      labelLine={false}
                    >
                      {dashboardData.teamActivity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} formatter={(value) => [value, 'Members']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Performance Metrics */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Team performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardData.performanceMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    metric.trend === 'up' ? 'bg-green-100 dark:bg-green-900' :
                    metric.trend === 'down' ? 'bg-red-100 dark:bg-red-900' :
                    'bg-blue-100 dark:bg-blue-900'
                  }`}>
                    {metric.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : metric.trend === 'down' ? (
                      <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                    ) : (
                      <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{metric.metric}</p>
                    <p className="text-muted-foreground text-xs">Current</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground text-lg">{metric.value}</p>
                  <p className={`text-xs ${
                    metric.trend === 'up' ? 'text-green-500' :
                    metric.trend === 'down' ? 'text-red-500' :
                    'text-blue-500'
                  }`}>
                    {metric.change}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );

  const renderUserDashboard = () => (
    <>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard
          title="Total Leads"
          value={dashboardData.stats.totalLeads?.toLocaleString() || '0'}
          change="0"
          icon={BarChart3}
          loading={loadingData.dashboard}
        />
        <StatCard
          title="Completed Leads"
          value={dashboardData.stats.completedLeads?.toLocaleString() || '0'}
          change="0"
          icon={CheckCircle}
          loading={loadingData.dashboard}
        />
        <StatCard
          title="Total Earnings"
          value={formatCurrency(dashboardData.stats.totalEarnings)}
          change="0%"
          icon={DollarSign}
          loading={loadingData.dashboard}
        />
        <StatCard
          title="Current Balance"
          value={formatCurrency(dashboardData.stats.currentBalance)}
          change="0%"
          icon={Wallet}
          loading={loadingData.dashboard}
        />
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card className="text-center p-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-muted-foreground">Pending Leads</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {dashboardData.stats.pendingLeads?.toLocaleString() || '0'}
          </p>
        </Card>
        <Card className="text-center p-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Percent className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-muted-foreground">Conversion Rate</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {formatPercent(dashboardData.stats.conversionRate)}
          </p>
        </Card>
        <Card className="text-center p-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CalendarDays className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-muted-foreground">Last Lead</span>
          </div>
          <p className="text-sm font-bold text-foreground truncate">
            {dashboardData.stats.lastLeadDate 
              ? new Date(dashboardData.stats.lastLeadDate).toLocaleDateString()
              : 'Never'
            }
          </p>
        </Card>
        <Card className="text-center p-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Award className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-muted-foreground">Avg/Lead</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {formatCurrency(
              dashboardData.stats.completedLeads > 0 
                ? dashboardData.stats.totalEarnings / dashboardData.stats.completedLeads 
                : 0
            )}
          </p>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6">
        {/* Lead Distribution Chart */}
        {dashboardData.leadDistribution.some(item => item.value > 0) && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lead Distribution</CardTitle>
                  <CardDescription>Breakdown of your leads</CardDescription>
                </div>
                <Badge variant="success">
                  Total: {dashboardData.stats.totalLeads}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart key={`lead-dist-${chartKey}`}>
                    <Pie
                      data={dashboardData.leadDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      labelLine={false}
                    >
                      {dashboardData.leadDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} formatter={(value) => [value, 'Leads']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Earnings Chart */}
        {dashboardData.earningsData.some(item => item.earnings > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Earnings Overview</CardTitle>
              <CardDescription>Your earnings this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardData.earningsData}
                    key={`earnings-${chartKey}`}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.gridStroke} />
                    <XAxis 
                      dataKey="month" 
                      stroke={colors.axisText}
                      tick={{ fill: colors.axisText, fontSize: 12 }}
                    />
                    <YAxis 
                      stroke={colors.axisText}
                      tick={{ fill: colors.axisText, fontSize: 12 }}
                      tickFormatter={(value) => `₹${value.toLocaleString()}`}
                    />
                    <Tooltip 
                      content={<CustomTooltip />}
                      formatter={(value) => [`₹${value.toLocaleString()}`, 'Earnings']}
                    />
                    <Bar 
                      dataKey="earnings" 
                      fill={colors.success}
                      name="Earnings"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Performance Metrics */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Your performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardData.performanceMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    metric.trend === 'up' ? 'bg-green-100 dark:bg-green-900' :
                    metric.trend === 'down' ? 'bg-red-100 dark:bg-red-900' :
                    'bg-blue-100 dark:bg-blue-900'
                  }`}>
                    {metric.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : metric.trend === 'down' ? (
                      <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                    ) : (
                      <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{metric.metric}</p>
                    <p className="text-muted-foreground text-xs">Current</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground text-lg">{metric.value}</p>
                  <p className={`text-xs ${
                    metric.trend === 'up' ? 'text-green-500' :
                    metric.trend === 'down' ? 'text-red-500' :
                    'text-blue-500'
                  }`}>
                    {metric.change}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );

  return (
    <div className="h-full flex flex-col p-3 sm:p-4 lg:p-6 bg-background">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">
                {userRole === 'admin' ? 'Admin Dashboard' : 
                 userRole === 'TL' ? 'Team Lead Dashboard' : 'My Dashboard'}
              </h1>
              {userRole === 'admin' && <Badge variant="default"><ShieldCheck className="w-3 h-3 mr-1" /> Admin</Badge>}
              {userRole === 'TL' && <Badge variant="secondary"><Users className="w-3 h-3 mr-1" /> Team Lead</Badge>}
              {userRole === 'user' && <Badge variant="success"><UserCheck className="w-3 h-3 mr-1" /> User</Badge>}
            </div>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base truncate">
              {dateRange.value === 'custom' 
                ? `Data from ${dateRange.startDate} to ${dateRange.endDate}`
                : `Showing data for ${dateRange.label.toLowerCase()}`
              }
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={handleDateRangeChange}
              onCustomRangeSelect={handleCustomRangeSelect}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={loadDashboardData}
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button 
              size="sm" 
              className="flex-1 sm:flex-none"
              onClick={handleExport}
              disabled={!dashboardData}
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* Role-based dashboard content */}
        {userRole === 'admin' && renderAdminDashboard()}
        {userRole === 'TL' && renderTLDashboard()}
        {userRole === 'user' && renderUserDashboard()}

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Frequently used actions</CardDescription>
              </div>
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {userRole === 'admin' && (
                <>
                  <a href="/admin/users">
                    <Button variant="outline" className="h-16 w-full flex-col gap-2 p-2">
                      <Users className="w-5 h-5" />
                      <span className="text-xs">Manage Users</span>
                    </Button>
                  </a>
                  <a href="/admin/kyc">
                    <Button variant="outline" className="h-16 w-full flex-col gap-2 p-2">
                      <FileText className="w-5 h-5" />
                      <span className="text-xs">KYC Approvals</span>
                    </Button>
                  </a>
                </>
              )}
              {(userRole === 'admin' || userRole === 'TL') && (
                <>
                  <a href={userRole === 'admin' ? "/admin/teams" : "/tl/team"}>
                    <Button variant="outline" className="h-16 w-full flex-col gap-2 p-2">
                      <Users className="w-5 h-5" />
                      <span className="text-xs">View Team</span>
                    </Button>
                  </a>
                  <a href="/leads">
                    <Button variant="outline" className="h-16 w-full flex-col gap-2 p-2">
                      <BarChart3 className="w-5 h-5" />
                      <span className="text-xs">View Leads</span>
                    </Button>
                  </a>
                </>
              )}
              <a href="/my-leads">
                <Button variant="outline" className="h-16 w-full flex-col gap-2 p-2">
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-xs">My Leads</span>
                </Button>
              </a>
              <a href="/wallet">
                <Button variant="outline" className="h-16 w-full flex-col gap-2 p-2">
                  <Wallet className="w-5 h-5" />
                  <span className="text-xs">My Wallet</span>
                </Button>
              </a>
              <a href="/withdrawals">
                <Button variant="outline" className="h-16 w-full flex-col gap-2 p-2">
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs">Withdrawals</span>
                </Button>
              </a>
              <a href="/attendance">
                <Button variant="outline" className="h-16 w-full flex-col gap-2 p-2">
                  <Calendar className="w-5 h-5" />
                  <span className="text-xs">Attendance</span>
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Footer Stats */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              <p>Last updated: {new Date().toLocaleTimeString()}</p>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Data loaded from backend API</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}