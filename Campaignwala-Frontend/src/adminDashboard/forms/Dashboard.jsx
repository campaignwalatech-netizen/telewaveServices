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
  Area
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
  MoreVertical
} from "lucide-react";

// Basic UI Components
const Card = ({ children, className = "" }) => (
  <div className={`bg-card border border-border rounded-lg shadow-sm ${className}`}>
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
    ghost: "hover:bg-accent hover:text-accent-foreground"
  };
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md text-xs"
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
    success: "bg-green-100 text-green-800 border-green-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    destructive: "bg-red-100 text-red-800 border-red-200"
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${variants[variant]} ${className}`}>
      {children}
    </span>
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
    accent: "#8b5cf6"
  };
};

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
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

// Mock data - Replace with actual API calls
const mockData = {
  // User registration data (date-wise)
  userRegistrations: [
    { date: "2025-01-01", users: 45 },
    { date: "2025-01-02", users: 52 },
    { date: "2025-01-03", users: 48 },
    { date: "2025-01-04", users: 65 },
    { date: "2025-01-05", users: 58 },
    { date: "2025-01-06", users: 72 },
    { date: "2025-01-07", users: 68 },
    { date: "2025-01-08", users: 55 },
    { date: "2025-01-09", users: 62 },
    { date: "2025-01-10", users: 75 }
  ],

  // Leads generated category-wise
  leadsByCategory: [
    { category: "Demat Account", leads: 1250, color: "#3b82f6" },
    { category: "Bank Account", leads: 890, color: "#10b981" },
    { category: "Credit Card", leads: 670, color: "#8b5cf6" },
    { category: "Personal Loan", leads: 450, color: "#f59e0b" },
    { category: "Insurance", leads: 320, color: "#ef4444" },
    { category: "Mutual Fund", leads: 280, color: "#06b6d4" }
  ],

  // Payment data
  payments: [
    { date: "2025-01-01", wallet: 12500, withdrawal: 4500 },
    { date: "2025-01-02", wallet: 13200, withdrawal: 5200 },
    { date: "2025-01-03", wallet: 11800, withdrawal: 3800 },
    { date: "2025-01-04", wallet: 14500, withdrawal: 6200 },
    { date: "2025-01-05", wallet: 12800, withdrawal: 4100 },
    { date: "2025-01-06", wallet: 15200, withdrawal: 5800 },
    { date: "2025-01-07", wallet: 13800, withdrawal: 4900 },
    { date: "2025-01-08", wallet: 14200, withdrawal: 5300 },
    { date: "2025-01-09", wallet: 12900, withdrawal: 4200 },
    { date: "2025-01-10", wallet: 14800, withdrawal: 5600 }
  ],

  // Quick stats
  stats: {
    totalUsers: 12547,
    activeUsers: 8943,
    totalLeads: 3860,
    pendingLeads: 1250,
    approvedLeads: 1860,
    completedLeads: 750,
    totalRevenue: "₹2,84,500",
    totalWithdrawals: "₹1,45,200",
    walletBalance: "₹1,39,300"
  },

  // Recent activities
  recentActivities: [
    { id: 1, user: "John Doe", action: "Registered", time: "2 min ago", amount: "-" },
    { id: 2, user: "Alice Smith", action: "Lead Completed", time: "5 min ago", amount: "₹500" },
    { id: 3, user: "Bob Johnson", action: "Withdrawal", time: "10 min ago", amount: "₹2,000" },
    { id: 4, user: "Carol Davis", action: "New Lead", time: "15 min ago", amount: "-" },
    { id: 5, user: "David Wilson", action: "KYC Approved", time: "20 min ago", amount: "-" }
  ]
};

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("7d");
  const [data, setData] = useState(mockData);
  const [chartKey, setChartKey] = useState(0);

  // Refresh data
  const refreshData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setData(mockData);
      setLoading(false);
      setChartKey(prev => prev + 1);
    }, 1000);
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

  const colors = getChartColors();

  return (
    <div className="h-full flex flex-col p-4 lg:p-6 bg-background">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard Overview</h1>
            <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Users */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{data.stats.totalUsers.toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-xs text-green-500">+12.5%</span>
                    <span className="text-xs text-muted-foreground ml-1">from last week</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Leads */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{data.stats.totalLeads.toLocaleString()}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="success" className="text-xs">Approved: {data.stats.approvedLeads}</Badge>
                    <Badge variant="warning" className="text-xs">Pending: {data.stats.pendingLeads}</Badge>
                  </div>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{data.stats.totalRevenue}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-xs text-green-500">+8.3%</span>
                    <span className="text-xs text-muted-foreground ml-1">from last month</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Wallet className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Balance */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Wallet Balance</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{data.stats.walletBalance}</p>
                  <div className="flex items-center mt-2">
                    <CreditCard className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-xs text-muted-foreground">Withdrawals: {data.stats.totalWithdrawals}</span>
                  </div>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                  <CreditCard className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* User Registrations Chart */}
          <Card>
            <CardHeader>
              <CardTitle>User Registrations</CardTitle>
              <CardDescription>New user registrations over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={data.userRegistrations}
                  key={chartKey}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.gridStroke} />
                  <XAxis 
                    dataKey="date" 
                    stroke={colors.axisText}
                    tick={{ fill: colors.axisText }}
                  />
                  <YAxis 
                    stroke={colors.axisText}
                    tick={{ fill: colors.axisText }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke={colors.primary} 
                    fill={colors.primary}
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Leads by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Leads by Category</CardTitle>
              <CardDescription>Distribution of leads across different categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart key={`pie-${chartKey}`}>
                  <Pie
                    data={data.leadsByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="leads"
                    label={({ category, percent }) => `${category} (${(percent * 100).toFixed(1)}%)`}
                  >
                    {data.leadsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Payments and Withdrawals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Payments Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Payments & Withdrawals</CardTitle>
              <CardDescription>Wallet payments and withdrawal trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={data.payments}
                  key={`bar-${chartKey}`}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.gridStroke} />
                  <XAxis 
                    dataKey="date" 
                    stroke={colors.axisText}
                    tick={{ fill: colors.axisText }}
                  />
                  <YAxis 
                    stroke={colors.axisText}
                    tick={{ fill: colors.axisText }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="wallet" fill={colors.primary} name="Wallet Payments" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="withdrawal" fill={colors.secondary} name="Withdrawals" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest user activities and transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        activity.action.includes('Registered') ? 'bg-blue-100 dark:bg-blue-900' :
                        activity.action.includes('Completed') ? 'bg-green-100 dark:bg-green-900' :
                        activity.action.includes('Withdrawal') ? 'bg-orange-100 dark:bg-orange-900' :
                        activity.action.includes('New Lead') ? 'bg-purple-100 dark:bg-purple-900' :
                        'bg-gray-100 dark:bg-gray-900'
                      }`}>
                        {activity.action.includes('Registered') && <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                        {activity.action.includes('Completed') && <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />}
                        {activity.action.includes('Withdrawal') && <CreditCard className="w-4 h-4 text-orange-600 dark:text-orange-400" />}
                        {activity.action.includes('New Lead') && <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                        {activity.action.includes('KYC') && <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{activity.user}</p>
                        <p className="text-muted-foreground text-xs">{activity.action}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {activity.amount !== '-' && (
                        <p className="font-medium text-foreground text-sm">{activity.amount}</p>
                      )}
                      <p className="text-muted-foreground text-xs">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" size="sm">
                View All Activities
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used admin actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Button variant="outline" className="h-16 flex-col gap-2">
                <Users className="w-5 h-5" />
                <span className="text-xs">Manage Users</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2">
                <BarChart3 className="w-5 h-5" />
                <span className="text-xs">View Leads</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2">
                <Wallet className="w-5 h-5" />
                <span className="text-xs">Payments</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2">
                <CreditCard className="w-5 h-5" />
                <span className="text-xs">Withdrawals</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}