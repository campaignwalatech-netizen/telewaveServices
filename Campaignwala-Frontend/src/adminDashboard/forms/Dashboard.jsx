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
  AlertCircle
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
    ghost: "hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80"
  };
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md text-xs",
    xs: "h-7 px-2 rounded-md text-xs"
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
    info: "#06b6d4"
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

// Enhanced mock data with date-wise granular data
const generateMockData = (dateRange) => {
  const getDateRange = () => {
    const now = new Date();
    switch (dateRange.value) {
      case 'today':
        return { start: new Date(now), end: new Date(now) };
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return { start: yesterday, end: yesterday };
      case '7d':
        const start7d = new Date(now);
        start7d.setDate(start7d.getDate() - 7);
        return { start: start7d, end: now };
      case '30d':
        const start30d = new Date(now);
        start30d.setDate(start30d.getDate() - 30);
        return { start: start30d, end: now };
      case 'this_month':
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: thisMonthStart, end: now };
      case 'last_month':
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        return { start: lastMonthStart, end: lastMonthEnd };
      case 'custom':
        return { 
          start: new Date(dateRange.startDate), 
          end: new Date(dateRange.endDate) 
        };
      default:
        return { start: new Date(now), end: new Date(now) };
    }
  };

  const { start, end } = getDateRange();
  const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  
  // Generate date-wise data
  const userRegistrations = [];
  const leadsData = [];
  const paymentData = [];
  
  for (let i = 0; i <= daysDiff; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    
    // Random but realistic data
    const users = Math.floor(Math.random() * 100) + 20;
    const leads = Math.floor(Math.random() * 50) + 10;
    const wallet = Math.floor(Math.random() * 20000) + 5000;
    const withdrawal = Math.floor(Math.random() * 10000) + 2000;
    const revenue = Math.floor(Math.random() * 15000) + 3000;
    
    userRegistrations.push({
      date: dateString,
      users,
      leads,
      revenue
    });
    
    paymentData.push({
      date: dateString,
      wallet,
      withdrawal,
      revenue
    });
  }

  return {
    userRegistrations,
    leadsByCategory: [
      { category: "Demat Account", leads: 1250, color: "#3b82f6" },
      { category: "Bank Account", leads: 890, color: "#10b981" },
      { category: "Credit Card", leads: 670, color: "#8b5cf6" },
      { category: "Personal Loan", leads: 450, color: "#f59e0b" },
      { category: "Insurance", leads: 320, color: "#ef4444" },
      { category: "Mutual Fund", leads: 280, color: "#06b6d4" }
    ],
    payments: paymentData,
    performanceMetrics: [
      { metric: "Conversion Rate", value: "24.5%", change: "+2.3%", trend: "up" },
      { metric: "Avg. Response Time", value: "2.4h", change: "-0.8h", trend: "down" },
      { metric: "User Satisfaction", value: "4.8/5", change: "+0.2", trend: "up" },
      { metric: "Completion Rate", value: "87.2%", change: "+3.1%", trend: "up" }
    ],
    stats: {
      totalUsers: userRegistrations.reduce((sum, day) => sum + day.users, 0),
      activeUsers: Math.floor(userRegistrations.reduce((sum, day) => sum + day.users, 0) * 0.7),
      totalLeads: userRegistrations.reduce((sum, day) => sum + day.leads, 0),
      pendingLeads: Math.floor(userRegistrations.reduce((sum, day) => sum + day.leads, 0) * 0.3),
      approvedLeads: Math.floor(userRegistrations.reduce((sum, day) => sum + day.leads, 0) * 0.5),
      completedLeads: Math.floor(userRegistrations.reduce((sum, day) => sum + day.leads, 0) * 0.2),
      totalRevenue: userRegistrations.reduce((sum, day) => sum + day.revenue, 0),
      totalWithdrawals: paymentData.reduce((sum, day) => sum + day.withdrawal, 0),
      walletBalance: paymentData.reduce((sum, day) => sum + day.wallet, 0) - paymentData.reduce((sum, day) => sum + day.withdrawal, 0)
    },
    recentActivities: [
      { id: 1, user: "John Doe", action: "Registered", time: "2 min ago", amount: "-", type: "user" },
      { id: 2, user: "Alice Smith", action: "Lead Completed", time: "5 min ago", amount: "₹500", type: "success" },
      { id: 3, user: "Bob Johnson", action: "Withdrawal", time: "10 min ago", amount: "₹2,000", type: "payment" },
      { id: 4, user: "Carol Davis", action: "New Lead", time: "15 min ago", amount: "-", type: "lead" },
      { id: 5, user: "David Wilson", action: "KYC Approved", time: "20 min ago", amount: "-", type: "success" }
    ],
    dateRange: {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    }
  };
};

// Stat Card Component
const StatCard = ({ title, value, change, icon, trend = "up", className = "" }) => {
  const isPositive = trend === "up";
  const IconComponent = icon;

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
                  <TrendingUp className="w-4 h-4 text-red-500 mr-1 flex-shrink-0 transform rotate-180" />
                )}
                <span className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'} mr-1`}>
                  {change}
                </span>
                <span className="text-xs text-muted-foreground truncate">from previous period</span>
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

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ label: "Last 7 Days", value: "7d" });
  const [data, setData] = useState(() => generateMockData({ label: "Last 7 Days", value: "7d" }));
  const [chartKey, setChartKey] = useState(0);

  // Refresh data based on date range
  const refreshData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const newData = generateMockData(dateRange);
      setData(newData);
      setLoading(false);
      setChartKey(prev => prev + 1);
    }, 1000);
  };

  // Handle date range change
  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
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

  // Refresh data when date range changes
  useEffect(() => {
    refreshData();
  }, [dateRange]);

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

  // Format currency values
  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="h-full flex flex-col p-3 sm:p-4 lg:p-6 bg-background">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">
              Dashboard Overview
            </h1>
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
              onClick={refreshData}
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button size="sm" className="flex-1 sm:flex-none">
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatCard
            title="Total Users"
            value={data.stats.totalUsers.toLocaleString()}
            change="+12.5%"
            icon={Users}
          />
          <StatCard
            title="Total Leads"
            value={data.stats.totalLeads.toLocaleString()}
            change="+8.3%"
            icon={BarChart3}
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(data.stats.totalRevenue)}
            change="+15.2%"
            icon={DollarSign}
          />
          <StatCard
            title="Wallet Balance"
            value={formatCurrency(data.stats.walletBalance)}
            change="+5.7%"
            icon={Wallet}
          />
        </div>

        {/* Lead Status Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-muted-foreground">Pending</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              {data.stats.pendingLeads.toLocaleString()}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-muted-foreground">Approved</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              {data.stats.approvedLeads.toLocaleString()}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-muted-foreground">Completed</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              {data.stats.completedLeads.toLocaleString()}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-muted-foreground">Active Users</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              {data.stats.activeUsers.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* User Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>User Activity Overview</CardTitle>
              <CardDescription>User registrations, leads, and revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.userRegistrations}
                    key={chartKey}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.gridStroke} />
                    <XAxis 
                      dataKey="date" 
                      stroke={colors.axisText}
                      tick={{ fill: colors.axisText, fontSize: 12 }}
                    />
                    <YAxis 
                      stroke={colors.axisText}
                      tick={{ fill: colors.axisText, fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke={colors.primary}
                      strokeWidth={2}
                      dot={{ fill: colors.primary, strokeWidth: 2, r: 3 }}
                      name="Users"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="leads" 
                      stroke={colors.secondary}
                      strokeWidth={2}
                      dot={{ fill: colors.secondary, strokeWidth: 2, r: 3 }}
                      name="Leads"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke={colors.accent}
                      strokeWidth={2}
                      dot={{ fill: colors.accent, strokeWidth: 2, r: 3 }}
                      name="Revenue"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Leads by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Leads by Category</CardTitle>
              <CardDescription>Distribution of leads across different categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart key={`pie-${chartKey}`}>
                    <Pie
                      data={data.leadsByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="leads"
                      label={({ category, percent }) => `${(percent * 100).toFixed(1)}%`}
                    >
                      {data.leadsByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* Payments and Withdrawals */}
          <Card>
            <CardHeader>
              <CardTitle>Payments & Withdrawals</CardTitle>
              <CardDescription>Wallet payments and withdrawal trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data.payments}
                    key={`area-${chartKey}`}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.gridStroke} />
                    <XAxis 
                      dataKey="date" 
                      stroke={colors.axisText}
                      tick={{ fill: colors.axisText, fontSize: 12 }}
                    />
                    <YAxis 
                      stroke={colors.axisText}
                      tick={{ fill: colors.axisText, fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="wallet" 
                      stackId="1"
                      stroke={colors.primary} 
                      fill={colors.primary}
                      fillOpacity={0.6}
                      name="Wallet Payments"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="withdrawal" 
                      stackId="1"
                      stroke={colors.secondary} 
                      fill={colors.secondary}
                      fillOpacity={0.6}
                      name="Withdrawals"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.performanceMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        metric.trend === 'up' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                      }`}>
                        {metric.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <TrendingUp className="w-4 h-4 text-red-600 dark:text-red-400 transform rotate-180" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{metric.metric}</p>
                        <p className="text-muted-foreground text-xs">Current period</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground text-lg">{metric.value}</p>
                      <p className={`text-xs ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {metric.change}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest user activities and transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`p-2 rounded-full flex-shrink-0 ${
                        activity.type === 'user' ? 'bg-blue-100 dark:bg-blue-900' :
                        activity.type === 'success' ? 'bg-green-100 dark:bg-green-900' :
                        activity.type === 'payment' ? 'bg-orange-100 dark:bg-orange-900' :
                        activity.type === 'lead' ? 'bg-purple-100 dark:bg-purple-900' :
                        'bg-gray-100 dark:bg-gray-900'
                      }`}>
                        {activity.type === 'user' && <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                        {activity.type === 'success' && <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />}
                        {activity.type === 'payment' && <CreditCard className="w-4 h-4 text-orange-600 dark:text-orange-400" />}
                        {activity.type === 'lead' && <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground text-sm truncate">{activity.user}</p>
                        <p className="text-muted-foreground text-xs truncate">{activity.action}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
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

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Frequently used admin actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Button variant="outline" className="h-16 flex-col gap-2 p-2">
                  <Users className="w-5 h-5" />
                  <span className="text-xs">Manage Users</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col gap-2 p-2">
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-xs">View Leads</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col gap-2 p-2">
                  <Wallet className="w-5 h-5" />
                  <span className="text-xs">Payments</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col gap-2 p-2">
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs">Withdrawals</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col gap-2 p-2">
                  <Calendar className="w-5 h-5" />
                  <span className="text-xs">Reports</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col gap-2 p-2">
                  <Filter className="w-5 h-5" />
                  <span className="text-xs">Analytics</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}