import { useState, useEffect, useCallback } from "react";
import {
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
  BarChart,
  Bar,
} from "recharts";
import { ChevronLeft, ChevronRight, Search, Download, Filter } from "lucide-react";
import leadService from '../../services/leadService';
import userService from '../../services/userService';

// Simple Card components for the dashboard
const Card = ({ className = "", children }) => (
  <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ className = "", children }) => (
  <div className={`p-4 pb-2 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ className = "", children }) => (
  <h3 className={`font-semibold text-lg ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ className = "", children }) => (
  <p className={`text-sm mt-1 text-gray-600 dark:text-gray-400 ${className}`}>
    {children}
  </p>
);

const CardContent = ({ className = "", children }) => (
  <div className={`p-4 pt-2 ${className}`}>
    {children}
  </div>
);

// Theme-aware chart colors
const getChartColors = (darkMode) => {
  return {
    axisText: darkMode ? '#ffffff' : '#374151',
    dotFill: darkMode ? '#ffffff' : '#3b82f6',
    dotStroke: darkMode ? '#ffffff' : '#3b82f6',
    gridStroke: darkMode ? '#555555' : '#e5e7eb',
    primary: darkMode ? '#3b82f6' : '#2563eb'
  };
};

// Custom label renderer
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }, darkMode) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text 
      x={x} 
      y={y} 
      fill={darkMode ? "#ffffff" : "#374151"} 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={11}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, darkMode }) => {
  if (active && payload && payload.length) {
    return (
      <div className={`${
        darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"
      } border rounded-lg p-3 shadow-lg`}>
        {label && (
          <div className={`font-medium mb-2 pb-1 border-b ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}>
            {label}
          </div>
        )}
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="font-medium">
              {entry.name || entry.dataKey}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Calendar Component
function Calendar({ month, year, onDateSelect, onMonthChange, startDate, endDate, darkMode }) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className={`${
      darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
    } border rounded-lg p-4 min-w-[260px] sm:min-w-[300px] lg:min-w-[340px]`}>
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => onMonthChange(-1)} 
          className={`p-1 hover:bg-opacity-20 rounded transition-colors ${
            darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
          }`}
        >
          <ChevronLeft className={`w-5 h-5 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`} />
        </button>
        <div className="text-center">
          <div className={`font-semibold text-sm sm:text-base ${
            darkMode ? "text-white" : "text-gray-900"
          }`}>{monthNames[month]}</div>
          <div className={`text-xs sm:text-sm ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}>{year}</div>
        </div>
        <button 
          onClick={() => onMonthChange(1)} 
          className={`p-1 hover:bg-opacity-20 rounded transition-colors ${
            darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
          }`}
        >
          <ChevronRight className={`w-5 h-5 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-3">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className={`text-center text-xs py-1 w-8 sm:w-9 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          } font-semibold`}>
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          let isInRange = false;
          let isStart = false;
          let isEnd = false;
          
          if (day && startDate && endDate) {
            const currentDate = new Date(year, month, day);
            isStart = currentDate.toDateString() === startDate.toDateString();
            isEnd = currentDate.toDateString() === endDate.toDateString();
            isInRange = currentDate >= startDate && currentDate <= endDate && !isStart && !isEnd;
          }

          return (
            <button
              key={idx}
              onClick={() => day && onDateSelect(new Date(year, month, day))}
              className={`
                w-8 h-8 sm:w-9 sm:h-9 text-sm sm:text-base font-medium rounded flex items-center justify-center transition-colors
                ${isStart || isEnd ? "bg-blue-600 text-white" : ""}
                ${isInRange ? "bg-blue-600 bg-opacity-20 text-blue-600" : ""}
                ${day && !isStart && !isEnd && !isInRange ? 
                  `${darkMode ? "text-white hover:bg-blue-600" : "text-gray-900 hover:bg-blue-600 hover:text-white"} cursor-pointer` : ""}
                ${!day ? `${darkMode ? "text-gray-600" : "text-gray-400"} cursor-default` : ""}
              `}
              disabled={!day}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AnalyticsDashboard({ darkMode = false }) {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedUser, setSelectedUser] = useState("All Users");
  const [showCalendar, setShowCalendar] = useState(false);
  const [chartKey, setChartKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);

  // Fetch initial data
  useEffect(() => {
    fetchUsers();
    fetchCategories();
  }, []);

  // Fetch analytics data when filters change
  useEffect(() => {
    fetchAnalyticsData();
  }, [startDate, endDate, selectedUser, selectedCategory]);

  const fetchUsers = async () => {
    try {
      const response = await leadService.getAllUsers();
      if (response.success) {
        setUsers(response.data || []);
      } else {
        // Fallback: Try to get users from userService if available
        try {
          const userResponse = await userService.getAllUsers();
          setUsers(userResponse.data || []);
        } catch (error) {
          console.error('Error fetching users from userService:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Set empty array as fallback
      setUsers([]);
    }
  };

  const fetchCategories = async () => {
    try {
      // Get categories from leads data
      const response = await leadService.getAllLeads({ limit: 1000 });
      if (response.success) {
        const uniqueCategories = [...new Set(response.data.leads?.map(lead => lead.category).filter(Boolean) || [])];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Set default categories as fallback
      setCategories(['Loan', 'Insurance', 'Credit Card', 'Investment']);
    }
  };

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        hrUserId: selectedUser !== "All Users" ? selectedUser : undefined,
        category: selectedCategory !== "All Categories" ? selectedCategory : undefined
      };

      console.log('📊 Fetching analytics with params:', params);
      
      const response = await leadService.getLeadAnalytics(params);
      console.log('📊 Analytics response:', response);
      
      if (response.success) {
        setAnalyticsData(response.data);
      } else {
        // If analytics API fails, calculate analytics from getAllLeads
        console.warn('Analytics API failed, calculating from leads data');
        await calculateAnalyticsFromLeads(params);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // If analytics API fails, calculate analytics from getAllLeads
      console.warn('Using leads data for analytics due to API error');
      await calculateAnalyticsFromLeads();
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics data from getAllLeads as fallback
  const calculateAnalyticsFromLeads = async (params = {}) => {
    try {
      const allLeadsResponse = await leadService.getAllLeads({
        ...params,
        limit: 10000 // Get all leads for accurate analytics
      });

      if (allLeadsResponse.success) {
        const leads = allLeadsResponse.data.leads || [];
        
        // Calculate analytics data manually
        const calculatedData = calculateAnalytics(leads, params);
        setAnalyticsData(calculatedData);
      } else {
        // Final fallback: generate mock data
        setAnalyticsData(generateMockData());
      }
    } catch (error) {
      console.error('Error calculating analytics from leads:', error);
      setAnalyticsData(generateMockData());
    }
  };

  // Calculate analytics from leads data
  const calculateAnalytics = (leads, params) => {
    // Filter leads by date range
    const filteredLeads = leads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      const start = new Date(params.startDate || startDate);
      const end = new Date(params.endDate || endDate);
      return leadDate >= start && leadDate <= end;
    });

    // Filter by category if specified
    const categoryFilteredLeads = params.category 
      ? filteredLeads.filter(lead => lead.category === params.category)
      : filteredLeads;

    // Filter by user if specified
    const userFilteredLeads = params.hrUserId
      ? categoryFilteredLeads.filter(lead => lead.hrUserId === params.hrUserId)
      : categoryFilteredLeads;

    const finalLeads = userFilteredLeads;

    // Calculate date-wise stats
    const dateWiseStats = {};
    finalLeads.forEach(lead => {
      const date = formatDate(new Date(lead.createdAt));
      dateWiseStats[date] = (dateWiseStats[date] || 0) + 1;
    });

    // Calculate status distribution
    const statusDistribution = {
      pending: 0,
      approved: 0,
      completed: 0,
      rejected: 0
    };
    finalLeads.forEach(lead => {
      const status = lead.status?.toLowerCase() || 'pending';
      if (statusDistribution[status] !== undefined) {
        statusDistribution[status]++;
      }
    });

    // Calculate category distribution
    const categoryDistribution = {};
    finalLeads.forEach(lead => {
      if (lead.category) {
        categoryDistribution[lead.category] = (categoryDistribution[lead.category] || 0) + 1;
      }
    });

    // Calculate user distribution
    const userDistribution = {};
    finalLeads.forEach(lead => {
      if (lead.hrUserId) {
        const user = users.find(u => u._id === lead.hrUserId);
        const userName = user ? (user.name || user.email || `User ${user._id}`) : `User ${lead.hrUserId}`;
        userDistribution[userName] = (userDistribution[userName] || 0) + 1;
      }
    });

    return {
      totalLeads: finalLeads.length,
      dateWiseStats,
      statusDistribution,
      categoryDistribution,
      userDistribution
    };
  };

  // Generate mock data for fallback
  const generateMockData = () => {
    const dateWiseStats = {};
    const statusDistribution = {
      pending: Math.floor(Math.random() * 50) + 20,
      approved: Math.floor(Math.random() * 30) + 10,
      completed: Math.floor(Math.random() * 20) + 5,
      rejected: Math.floor(Math.random() * 15) + 5
    };
    
    const categoryDistribution = {};
    const userDistribution = {};
    
    // Generate date-wise data for last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = formatDate(date);
      dateWiseStats[dateStr] = Math.floor(Math.random() * 10) + 1;
    }
    
    // Generate category distribution
    categories.forEach(cat => {
      categoryDistribution[cat] = Math.floor(Math.random() * 20) + 5;
    });
    
    // Generate user distribution
    users.slice(0, 5).forEach(user => {
      userDistribution[user.name || `User ${user._id}`] = Math.floor(Math.random() * 15) + 3;
    });
    
    return {
      totalLeads: Object.values(statusDistribution).reduce((a, b) => a + b, 0),
      dateWiseStats,
      statusDistribution,
      categoryDistribution,
      userDistribution
    };
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const applyQuickFilter = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setStartDate(start);
    setEndDate(end);
    setCalendarMonth(start.getMonth());
    setCalendarYear(start.getFullYear());
  };

  const handleDateSelect = (date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } else {
      if (date < startDate) {
        setEndDate(startDate);
        setStartDate(date);
      } else {
        setEndDate(date);
      }
    }
  };

  const handleMonthChange = (direction) => {
    let newMonth = calendarMonth + direction;
    let newYear = calendarYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    setCalendarMonth(newMonth);
    setCalendarYear(newYear);
  };

  const dateRangeText = endDate 
    ? `${formatDate(startDate)} ~ ${formatDate(endDate)}` 
    : `${formatDate(startDate)}`;

  // Process data for charts
  const getDateWiseData = () => {
    if (!analyticsData?.dateWiseStats) return [];
    
    return Object.entries(analyticsData.dateWiseStats)
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        count,
        fullDate: date
      }))
      .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));
  };

  const getStatusDistribution = () => {
    if (!analyticsData?.statusDistribution) return [];
    
    const colors = ["#a855f7", "#06b6d4", "#3b82f6", "#10b981", "#f97316", "#84cc16"];
    
    return Object.entries(analyticsData.statusDistribution)
      .filter(([_, count]) => count > 0) // Only show statuses with data
      .map(([status, count], index) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
        color: colors[index % colors.length]
      }));
  };

  const getCategoryDistribution = () => {
    if (!analyticsData?.categoryDistribution) return [];
    
    const colors = ["#a855f7", "#06b6d4", "#3b82f6", "#10b981", "#f97316", "#84cc16", "#ef4444", "#8b5cf6"];
    
    return Object.entries(analyticsData.categoryDistribution)
      .filter(([_, count]) => count > 0) // Only show categories with data
      .map(([category, count], index) => ({
        name: category,
        value: count,
        color: colors[index % colors.length]
      }));
  };

  const getUserDistribution = () => {
    if (!analyticsData?.userDistribution) return [];
    
    const colors = ["#a855f7", "#06b6d4", "#3b82f6", "#10b981", "#f97316", "#84cc16", "#ef4444", "#8b5cf6"];
    
    return Object.entries(analyticsData.userDistribution)
      .filter(([_, count]) => count > 0) // Only show users with data
      .map(([user, count], index) => ({
        name: user.length > 10 ? user.substring(0, 10) + '...' : user,
        value: count,
        fullName: user,
        color: colors[index % colors.length]
      }));
  };

  const getMetrics = () => {
    if (!analyticsData) {
      return [
        { label: "Total Leads", value: "0", icon: "📊" },
        { label: "Pending", value: "0", icon: "⏳" },
        { label: "Approved", value: "0", icon: "✓" },
        { label: "Completed", value: "0", icon: "✅" },
        { label: "Rejected", value: "0", icon: "❌" },
      ];
    }

    const total = analyticsData.totalLeads || 0;
    const statusDist = analyticsData.statusDistribution || {};

    return [
      { 
        label: "Total Leads", 
        value: total.toLocaleString(), 
        icon: "📊" 
      },
      { 
        label: "Pending", 
        value: (statusDist.pending || 0).toLocaleString(), 
        icon: "⏳" 
      },
      { 
        label: "Approved", 
        value: (statusDist.approved || 0).toLocaleString(), 
        icon: "✓" 
      },
      { 
        label: "Completed", 
        value: (statusDist.completed || 0).toLocaleString(), 
        icon: "✅" 
      },
      { 
        label: "Rejected", 
        value: (statusDist.rejected || 0).toLocaleString(), 
        icon: "❌" 
      },
    ];
  };

  const metrics = getMetrics();
  const dateWiseData = getDateWiseData();
  const statusDistribution = getStatusDistribution();
  const categoryDistribution = getCategoryDistribution();
  const userDistribution = getUserDistribution();
  const chartColors = getChartColors(darkMode);

  return (
    <div className={`h-full flex flex-col p-3 sm:p-4 lg:p-6 ${
      darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
    }`}>
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}>
            Analytics Dashboard
          </h1>
          <p className={`text-sm sm:text-base ${
            darkMode ? "text-gray-400" : "text-gray-600"
          }`}>
            Lead management and performance metrics
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="relative">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className={`w-full sm:w-auto px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left text-sm sm:text-base min-w-[200px] flex items-center gap-2 ${
                darkMode 
                  ? "bg-gray-800 border-gray-700 text-white hover:border-gray-600" 
                  : "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
              }`}
            >
              <Filter className="w-4 h-4" />
              {dateRangeText}
            </button>

            {showCalendar && (
              <div className={`absolute top-full left-0 mt-2 z-50 border rounded-lg p-4 shadow-lg max-w-xs sm:max-w-none overflow-auto max-h-96 ${
                darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}>
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Quick filters */}
                  <div className="flex flex-col gap-2 pr-4 border-r border-gray-300 dark:border-gray-700">
                    <button
                      onClick={() => {
                        applyQuickFilter(0);
                        setShowCalendar(false);
                      }}
                      className="text-left px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm transition-colors"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => {
                        applyQuickFilter(1);
                        setShowCalendar(false);
                      }}
                      className="text-left px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm transition-colors"
                    >
                      Yesterday
                    </button>
                    <button
                      onClick={() => {
                        applyQuickFilter(7);
                        setShowCalendar(false);
                      }}
                      className="text-left px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm transition-colors"
                    >
                      Last 7 days
                    </button>
                    <button
                      onClick={() => {
                        applyQuickFilter(30);
                        setShowCalendar(false);
                      }}
                      className="text-left px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm transition-colors"
                    >
                      Last 30 days
                    </button>
                    <button
                      onClick={() => {
                        const today = new Date();
                        setStartDate(new Date(today.getFullYear(), today.getMonth(), 1));
                        setEndDate(today);
                        setCalendarMonth(today.getMonth());
                        setCalendarYear(today.getFullYear());
                        setShowCalendar(false);
                      }}
                      className="text-left px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm transition-colors"
                    >
                      This month
                    </button>
                    <button
                      onClick={() => {
                        const today = new Date();
                        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1);
                        setStartDate(new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1));
                        setEndDate(new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0));
                        setCalendarMonth(lastMonth.getMonth());
                        setCalendarYear(lastMonth.getFullYear());
                        setShowCalendar(false);
                      }}
                      className="text-left px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm transition-colors"
                    >
                      Last month
                    </button>
                  </div>

                  {/* Calendar */}
                  <Calendar
                    month={calendarMonth}
                    year={calendarYear}
                    onDateSelect={handleDateSelect}
                    onMonthChange={handleMonthChange}
                    startDate={startDate}
                    endDate={endDate}
                    darkMode={darkMode}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Dropdowns */}
          <div className="flex flex-row gap-2 sm:gap-3 sm:ml-auto overflow-x-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 border rounded-lg focus:outline-none text-xs sm:text-base w-auto min-w-[100px] sm:min-w-[150px] flex-shrink-0 ${
                darkMode 
                  ? "bg-gray-800 border-gray-700 text-white" 
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option>All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 border rounded-lg focus:outline-none text-xs sm:text-base w-auto min-w-[90px] sm:min-w-[150px] flex-shrink-0 ${
                darkMode 
                  ? "bg-gray-800 border-gray-700 text-white" 
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option>All Users</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name || user.email || `User ${user._id}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {metrics.map((metric, idx) => (
            <div key={idx} className={`border hover:border-blue-500 transition-colors rounded-lg p-3 sm:p-4 ${
              darkMode 
                ? "bg-gray-800 border-gray-700 hover:border-blue-400" 
                : "bg-white border-gray-200 hover:border-blue-500"
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className={`text-xs sm:text-sm mb-1 break-words ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                    {metric.label}
                  </p>
                  <p className={`text-lg sm:text-2xl lg:text-3xl font-bold break-all ${
                    darkMode ? "text-blue-400" : "text-blue-600"
                  }`}>
                    {metric.value}
                  </p>
                </div>
                <span className="text-lg sm:text-xl lg:text-2xl ml-2 flex-shrink-0">
                  {metric.icon}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Date Wise Leads Created */}
          <Card className={darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}>
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className={darkMode ? "text-white" : "text-gray-900"}>
                Date Wise Leads Created
              </CardTitle>
              <CardDescription>
                Lead creation trend over time
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={dateWiseData}
                  key={chartKey}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.gridStroke} />
                  <XAxis
                    dataKey="date"
                    stroke={chartColors.axisText}
                    tick={{ fill: chartColors.axisText, fontSize: 12 }}
                  />
                  <YAxis
                    stroke={chartColors.axisText}
                    tick={{ fill: chartColors.axisText, fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                  <Bar
                    dataKey="count"
                    fill={chartColors.primary}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Leads by Status */}
          <Card className={darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}>
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className={darkMode ? "text-white" : "text-gray-900"}>
                Leads by Status
              </CardTitle>
              <CardDescription>
                Distribution by lead status
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center p-2 sm:p-4">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={(props) => renderCustomLabel(props, darkMode)}
                    labelLine={false}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Leads by Category */}
          <Card className={darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}>
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className={darkMode ? "text-white" : "text-gray-900"}>
                Leads by Category
              </CardTitle>
              <CardDescription>
                Category breakdown
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center p-2 sm:p-4">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={(props) => renderCustomLabel(props, darkMode)}
                    labelLine={false}
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Leads by User */}
          <Card className={darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}>
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className={darkMode ? "text-white" : "text-gray-900"}>
                Leads by User
              </CardTitle>
              <CardDescription>
                User performance distribution
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center p-2 sm:p-4">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={(props) => renderCustomLabel(props, darkMode)}
                    labelLine={false}
                  >
                    {userDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Legend */}
        {(statusDistribution.length > 0 || categoryDistribution.length > 0 || userDistribution.length > 0) && (
          <div className={`mt-6 sm:mt-8 p-3 sm:p-4 border rounded-lg ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <h4 className={`font-semibold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
              Chart Legend
            </h4>
            <div className="flex flex-wrap gap-3 sm:gap-6">
              {[...statusDistribution, ...categoryDistribution, ...userDistribution].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className={`text-xs sm:text-sm ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}