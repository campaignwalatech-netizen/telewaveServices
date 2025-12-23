import { useState, useEffect, useRef, useCallback } from 'react';
import userService from '../../services/userService';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Search, 
  Users, 
  CheckCircle, 
  RefreshCw, 
  Mail, 
  Phone,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Calendar,
  User,
  XCircle,
  Settings,
  Shield,
  Download,
  Filter,
  CalendarDays,
  PhoneCall,
  UserCheck,
  ArrowUpDown,
  Trash2,
  DollarSign,
  Clock4,
  CalendarCheck,
  FileText,
  UserCircle,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  CalendarClock,
  Shield as ShieldIcon,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  Activity,
  Clock,
  Users as UsersIcon,
  Percent,
  Zap,
  Award,
  Star,
  ThumbsUp,
  Target as TargetIcon
} from 'lucide-react';

// Basic UI Components (same as before)
const TableContainer = ({ children, className = '' }) => (
  <div className={`relative overflow-hidden ${className}`}>
    {children}
  </div>
);

const TableWrapper = ({ children, className = '' }) => (
  <div className={`overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 ${className}`}>
    {children}
  </div>
);

const Table = ({ children, className = '' }) => (
  <div className={`w-full border rounded-lg overflow-hidden min-w-max ${className}`}>
    <table className="w-full">{children}</table>
  </div>
);

const TableHeader = ({ children }) => (
  <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">{children}</thead>
);

const TableRow = ({ children, className = '' }) => (
  <tr className={`border-b transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${className}`}>{children}</tr>
);

const TableHead = ({ children, className = '', sortable = false, onSort, sortKey, currentSort = { key: '', direction: 'asc' } }) => {
  const isActive = sortKey === currentSort.key;
  const isAsc = currentSort.direction === 'asc';
  
  return (
    <th 
      className={`h-12 px-4 text-left align-middle font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap ${className} ${
        sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors' : ''
      }`}
      onClick={sortable ? () => onSort(sortKey) : undefined}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortable && (
          <div className="flex flex-col">
            <ChevronUp 
              className={`w-3 h-3 -mb-1 ${
                isActive && isAsc ? 'text-blue-600' : 'text-gray-400'
              }`} 
            />
            <ChevronDown 
              className={`w-3 h-3 -mt-1 ${
                isActive && !isAsc ? 'text-blue-600' : 'text-gray-400'
              }`} 
            />
          </div>
        )}
      </div>
    </th>
  );
};

const TableBody = ({ children }) => (
  <tbody>{children}</tbody>
);

const TableCell = ({ children, className = '' }) => (
  <td className={`p-4 align-middle whitespace-nowrap ${className}`}>{children}</td>
);

const Button = ({ children, variant = 'default', size = 'default', className = '', ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800',
    success: 'bg-green-600 text-white hover:bg-green-700',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
    info: 'bg-blue-600 text-white hover:bg-blue-700',
  };
  const sizes = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 rounded-md text-xs',
    icon: 'h-9 w-9'
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

const Input = ({ className = '', ...props }) => (
  <input
    className={`flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

const Select = ({ value, onValueChange, children, className = '', placeholder = "Select..." }) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className={`flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  >
    <option value="">{placeholder}</option>
    {children}
  </select>
);

const SelectItem = ({ value, children }) => (
  <option value={value}>{children}</option>
);

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    destructive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    outline: 'text-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-600',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Card = ({ children, className = '' }) => (
  <div className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

// Attendance Badge Component
const AttendanceBadge = ({ user }) => {
  const getVariant = () => {
    switch(user.attendance?.todayStatus) {
      case 'present': return "success";
      case 'absent': return "destructive";
      case 'late': return "warning";
      case 'half-day': return "orange";
      default: return "secondary";
    }
  };

  const getLabel = () => {
    switch(user.attendance?.todayStatus) {
      case 'present': return 'Present';
      case 'absent': return 'Absent';
      case 'late': return 'Late';
      case 'half-day': return 'Half Day';
      default: return 'Not Marked';
    }
  };

  const getIcon = () => {
    switch(user.attendance?.todayStatus) {
      case 'present': return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'absent': return <XCircle className="w-3 h-3 mr-1" />;
      case 'late': return <Clock className="w-3 h-3 mr-1" />;
      case 'half-day': return <Activity className="w-3 h-3 mr-1" />;
      default: return <Calendar className="w-3 h-3 mr-1" />;
    }
  };

  return (
    <Badge variant={getVariant()} className="min-w-[80px] justify-center">
      <div className="flex items-center">
        {getIcon()}
        {getLabel()}
      </div>
    </Badge>
  );
};

// Performance Score Component
const PerformanceScore = ({ score }) => {
  const getColor = () => {
    if (score >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    if (score >= 40) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
    return 'text-red-600 bg-red-100 dark:bg-red-900/20';
  };

  const getIcon = () => {
    if (score >= 80) return <Award className="w-3 h-3" />;
    if (score >= 60) return <TrendingUp className="w-3 h-3" />;
    if (score >= 40) return <Target className="w-3 h-3" />;
    return <TrendingDown className="w-3 h-3" />;
  };

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${getColor()}`}>
      {getIcon()}
      <span className="text-xs font-bold">{score}%</span>
    </div>
  );
};

export default function PresentUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'active',
    role: 'all',
    page: 1,
    limit: 20
  });

  const [sort, setSort] = useState({
    key: 'attendance.checkInTime',
    direction: 'desc'
  });

  // Search debounce
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Enhance user data with calculated fields
  const enhanceUserData = (user) => {
    const today = getTodayDate();
    
    // Calculate lead statistics
    const totalLeads = user.statistics?.totalLeads || 0;
    const completedLeads = user.statistics?.completedLeads || 0;
    const pendingLeads = user.statistics?.pendingLeads || 0;
    const rejectedLeads = user.statistics?.rejectedLeads || 0;
    
    // Get CALLED data
    const calledLeads = user.statistics?.calledLeads || 
                       user.statistics?.contactedLeads || 
                       user.dailyStats?.called || 0;
    
    // Get CLOSED data
    const closedLeads = user.statistics?.closedLeads || 
                       user.statistics?.completedLeads || 
                       user.dailyStats?.closed || 0;
    
    const conversionRate = totalLeads > 0 ? (completedLeads / totalLeads * 100) : 0;
    
    // Attendance data for today
    const attendanceToday = user.attendance?.history?.find(a => a.date === today) || {};
    const checkInTime = attendanceToday.checkInTime || '-';
    const checkOutTime = attendanceToday.checkOutTime || '-';
    const attendanceStatus = user.attendance?.todayStatus || 'not_marked';
    const isPresent = attendanceStatus === 'present';
    
    // Today's stats
    const todayCalled = user.dailyStats?.[today]?.called || 0;
    const todayClosed = user.dailyStats?.[today]?.closed || 0;
    
    // Performance score (based on today's activity)
    const performanceScore = calculatePerformanceScore(user, today);
    
    // TL info
    const tlName = user.reportingTo?.name || 
                   user.tlDetails?.managedBy?.name || 
                   user.tlName || 
                   '-';

    return {
      ...user,
      totalLeads,
      completedLeads,
      pendingLeads,
      rejectedLeads,
      conversionRate: conversionRate.toFixed(2),
      attendanceStatus,
      attendanceToday,
      checkInTime,
      checkOutTime,
      isPresent,
      tlName,
      openLeads: pendingLeads + rejectedLeads,
      salary: user.financials?.salary || '-',
      joinDate: new Date(user.createdAt).toLocaleDateString('en-IN'),
      calledLeads,
      closedLeads,
      todayCalled,
      todayClosed,
      performanceScore,
      // Additional metrics
      attendanceStreak: user.attendance?.currentStreak || 0,
      totalPresent: user.attendance?.totalPresent || 0,
      lastActive: user.lastActive ? new Date(user.lastActive).toLocaleString('en-IN') : '-',
      canReceiveLeads: user.status === 'active' && isPresent
    };
  };

  // Calculate performance score (0-100)
  const calculatePerformanceScore = (user, today) => {
    let score = 50; // Base score
    
    // Attendance weight: 30%
    if (user.attendance?.todayStatus === 'present') score += 30;
    else if (user.attendance?.todayStatus === 'late') score += 20;
    else if (user.attendance?.todayStatus === 'half-day') score += 10;
    
    // Today's activity weight: 40%
    const todayCalled = user.dailyStats?.[today]?.called || 0;
    const todayClosed = user.dailyStats?.[today]?.closed || 0;
    
    if (todayCalled > 0) score += Math.min(todayCalled * 2, 20); // Max 20 points
    if (todayClosed > 0) score += Math.min(todayClosed * 5, 20); // Max 20 points
    
    // Conversion rate weight: 30%
    const conversionRate = parseFloat(user.statistics?.conversionRate) || 0;
    score += Math.min(conversionRate * 0.3, 30);
    
    return Math.min(Math.round(score), 100);
  };

  // Fetch present users - FIXED API CALL
  const fetchPresentUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: filters.page,
        limit: filters.limit,
        sort: sort.key,
        order: sort.direction,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.role !== 'all' && { role: filters.role }),
        attendanceStatus: 'present', // Only fetch present users
        date: getTodayDate()
      };

      // First, try the specific present users endpoint
      let response;
      try {
        response = await userService.getPresentUsers(params);
      } catch (apiError) {
        console.log('Specific present users API failed, trying getAllUsersWithStats:', apiError);
        // Fallback to getAllUsersWithStats and filter for present users
        const allUsersResponse = await userService.getAllUsersWithStats(params);
        
        if (allUsersResponse.success && allUsersResponse.data) {
          // Filter users who are present today
          const today = getTodayDate();
          const allUsers = allUsersResponse.data.users || allUsersResponse.data || [];
          const presentUsers = allUsers.filter(user => 
            user.attendance?.todayStatus === 'present' || 
            user.attendance?.status === 'present' ||
            (user.attendance?.history && 
             user.attendance.history.some(a => a.date === today && a.status === 'present'))
          );
          
          response = {
            success: true,
            data: {
              users: presentUsers,
              total: presentUsers.length,
              page: filters.page,
              limit: filters.limit,
              totalPages: Math.ceil(presentUsers.length / filters.limit)
            }
          };
        } else {
          response = allUsersResponse;
        }
      }
      
      console.log('API Response:', response); // Debug log
      
      if (response && response.success) {
        // Handle different response structures
        let usersData = [];
        
        if (response.data && Array.isArray(response.data.users)) {
          usersData = response.data.users;
        } else if (response.data && Array.isArray(response.data)) {
          usersData = response.data;
        } else if (Array.isArray(response.users)) {
          usersData = response.users;
        } else if (response.data) {
          // If data is not an array, try to extract users
          usersData = Object.values(response.data).find(val => Array.isArray(val)) || [];
        }
        
        console.log('Processed users data:', usersData.length, 'users'); // Debug log
        
        // Filter for present users (in case the API didn't filter)
        const today = getTodayDate();
        const filteredUsers = usersData.filter(user => {
          const isPresent = 
            user.attendance?.todayStatus === 'present' || 
            user.attendance?.status === 'present' ||
            (user.attendance?.history && 
             user.attendance.history.some(a => a.date === today && a.status === 'present'));
          
          return isPresent;
        });
        
        const enhancedUsers = filteredUsers.map(enhanceUserData);
        setUsers(enhancedUsers);
      } else {
        const errorMsg = response?.message || 'Failed to fetch present users';
        setError(errorMsg);
        toast.error(errorMsg);
        setUsers([]);
      }
    } catch (err) {
      console.error('Error fetching present users:', err);
      const errorMsg = err.message || 'Failed to fetch present users';
      setError(errorMsg);
      toast.error(errorMsg);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [filters.page, filters.limit, filters.status, filters.role, filters.search, sort]);

  // Handle search with debounce
  const handleSearch = (value) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    setSearchTimeout(setTimeout(() => {
      setFilters(prev => ({ ...prev, search: value, page: 1 }));
    }, 300));
  };

  // Export present users
  const exportPresentUsers = async () => {
    try {
      setLoading(true);
      // First try the specific export endpoint, then fallback
      let blob;
      try {
        blob = await userService.exportPresentUsers({
          format: 'excel',
          ...filters
        });
      } catch (exportError) {
        console.log('Specific export failed, using getAllUsersWithStats:', exportError);
        // Fallback: get all users and filter present ones
        const response = await userService.getAllUsersWithStats({
          ...filters,
          attendanceStatus: 'present'
        });
        
        if (response.success) {
          // Create a simple CSV export
          const today = getTodayDate();
          const csvContent = "data:text/csv;charset=utf-8,";
          const headers = ["Name", "Email", "Phone", "Role", "TL Name", "Check-in Time", "Calls Today", "Closed Today", "Performance Score"];
          
          const rows = users.map(user => [
            user.name,
            user.email,
            user.phoneNumber,
            user.role,
            user.tlName,
            user.checkInTime,
            user.todayCalled,
            user.todayClosed,
            user.performanceScore
          ].map(cell => `"${cell}"`).join(','));
          
          const csv = [headers.join(','), ...rows].join('\n');
          blob = new Blob([csv], { type: 'text/csv' });
        } else {
          throw new Error('Failed to fetch data for export');
        }
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `present-users-${getTodayDate()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      const successMsg = 'Present users exported successfully';
      setSuccess(successMsg);
      toast.success(`✅ ${successMsg}`);
    } catch (err) {
      console.error('Error exporting present users:', err);
      const errorMsg = err.message || 'Failed to export present users';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Mark attendance
  const markAttendance = async (userId, status) => {
    try {
      const response = await userService.markAttendance(userId, {
        status,
        date: getTodayDate(),
        notes: 'Marked from Present Users page'
      });
      
      if (response.success) {
        const successMsg = `Attendance marked as ${status} successfully`;
        setSuccess(successMsg);
        toast.success(`✅ ${successMsg}`);
        await fetchPresentUsers();
      } else {
        const errorMsg = response.message || 'Failed to mark attendance';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Error marking attendance:', err);
      const errorMsg = err.message || 'Failed to mark attendance';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  // Effects
  useEffect(() => {
    fetchPresentUsers();
  }, [filters.page, filters.limit, filters.status, filters.role, filters.search, sort]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSort = (key) => {
    setSort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const formatTime = (timeString) => {
    if (!timeString || timeString === '-') return 'N/A';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Time';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === '-') return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Get today's stats
  const getTodayStats = () => {
    const totalPresent = users.length;
    const totalCalledToday = users.reduce((sum, user) => sum + (user.todayCalled || 0), 0);
    const totalClosedToday = users.reduce((sum, user) => sum + (user.todayClosed || 0), 0);
    const avgPerformance = users.length > 0 
      ? Math.round(users.reduce((sum, user) => sum + (user.performanceScore || 0), 0) / users.length)
      : 0;
    
    return {
      totalPresent,
      totalCalledToday,
      totalClosedToday,
      avgPerformance
    };
  };

  const todayStats = getTodayStats();

  return (
    <div className="space-y-6 p-6">
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
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-8 h-8 text-green-600" />
            Today's Present Users
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage users who are present today ({getTodayDate()})
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Export */}
          <Button
            variant="outline"
            size="sm"
            onClick={exportPresentUsers}
            disabled={loading || users.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          {/* Refresh */}
          <Button 
            onClick={fetchPresentUsers} 
            disabled={loading}
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Success & Error Messages */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Today's Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Total Present Today</p>
                <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                  {todayStats.totalPresent}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  <UsersIcon className="w-3 h-3 inline mr-1" />
                  Active workforce
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 dark:from-blue-900/20 dark:to-cyan-900/20 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Calls Today</p>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                  {todayStats.totalCalledToday}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  <PhoneCall className="w-3 h-3 inline mr-1" />
                  Total calls made
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <PhoneCall className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 dark:from-purple-900/20 dark:to-violet-900/20 dark:border-purple-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Closed Today</p>
                <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                  {todayStats.totalClosedToday}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  <CheckCircle className="w-3 h-3 inline mr-1" />
                  Deals completed
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 dark:from-orange-900/20 dark:to-amber-900/20 dark:border-orange-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Avg Performance</p>
                <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                  {todayStats.avgPerformance}%
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  <BarChart3 className="w-3 h-3 inline mr-1" />
                  Team average
                </p>
              </div>
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
                <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search present users by name, email, phone..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
                disabled={loading}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select 
                value={filters.role} 
                onValueChange={(value) => handleFilterChange('role', value)}
                placeholder="Role"
                className="w-full sm:w-[150px]"
                disabled={loading}
              >
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="TL">Team Lead</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </Select>

              <Select 
                value={filters.status} 
                onValueChange={(value) => handleFilterChange('status', value)}
                placeholder="Status"
                className="w-full sm:w-[150px]"
                disabled={loading}
              >
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="hold">Hold</SelectItem>
                <SelectItem value="all">All Status</SelectItem>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Present Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Present Users List
            {users.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {users.length} present today
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <TableContainer>
            <TableWrapper>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead sortable onSort={handleSort} sortKey="name" currentSort={sort}>
                      <UserCircle className="w-4 h-4 inline mr-1" />
                      Name
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="role" currentSort={sort}>
                      <ShieldIcon className="w-4 h-4 inline mr-1" />
                      Role
                    </TableHead>
                    <TableHead>
                      <PhoneIcon className="w-4 h-4 inline mr-1" />
                      Phone
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="attendance.todayStatus" currentSort={sort}>
                      <CalendarCheck className="w-4 h-4 inline mr-1" />
                      Attendance
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="attendance.checkInTime" currentSort={sort}>
                      <ClockIcon className="w-4 h-4 inline mr-1" />
                      Check-in
                    </TableHead>
                    <TableHead>
                      <ClockIcon className="w-4 h-4 inline mr-1" />
                      Check-out
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="todayCalled" currentSort={sort}>
                      <PhoneCall className="w-4 h-4 inline mr-1" />
                      Calls Today
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="todayClosed" currentSort={sort}>
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Closed Today
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="performanceScore" currentSort={sort}>
                      <TargetIcon className="w-4 h-4 inline mr-1" />
                      Performance
                    </TableHead>
                    <TableHead>
                      <UserCheck className="w-4 h-4 inline mr-1" />
                      TL Name
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="attendanceStreak" currentSort={sort}>
                      <Zap className="w-4 h-4 inline mr-1" />
                      Streak
                    </TableHead>
                    <TableHead>
                      <CalendarIcon className="w-4 h-4 inline mr-1" />
                      Last Active
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center">
                          <RefreshCw className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                          <span className="text-lg">Loading present users...</span>
                          <p className="text-sm text-gray-500 mt-2">Fetching today's attendance data</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-12 text-gray-500">
                        <UserCheck className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-xl font-medium">No users present today</p>
                        <p className="text-sm mt-2">
                          {(filters.search || filters.role !== 'all' || filters.status !== 'active') 
                            ? 'Try adjusting your search filters' 
                            : 'No users have marked attendance as "Present" today'}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user._id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        {/* Name */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-xs text-gray-500 truncate max-w-[150px]">
                                <MailIcon className="w-3 h-3 inline mr-1" />
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        
                        {/* Role */}
                        <TableCell>
                          <Badge variant={
                            user.role === 'admin' ? 'destructive' : 
                            user.role === 'TL' ? 'default' : 
                            'secondary'
                          }>
                            {user.role}
                          </Badge>
                        </TableCell>
                        
                        {/* Phone */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="font-mono text-sm">{user.phoneNumber}</span>
                          </div>
                        </TableCell>
                        
                        {/* Attendance */}
                        <TableCell>
                          <AttendanceBadge user={user} />
                        </TableCell>
                        
                        {/* Check-in Time */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium">{formatTime(user.checkInTime)}</span>
                          </div>
                        </TableCell>
                        
                        {/* Check-out Time */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium">
                              {user.checkOutTime && user.checkOutTime !== '-' 
                                ? formatTime(user.checkOutTime) 
                                : 'Not checked out'}
                            </span>
                          </div>
                        </TableCell>
                        
                        {/* Calls Today */}
                        <TableCell>
                          <div className="text-center">
                            <div className="flex flex-col items-center">
                              <span className={`font-bold text-lg ${
                                user.todayCalled > 0 ? 'text-blue-600' : 'text-gray-500'
                              }`}>
                                {user.todayCalled}
                              </span>
                              <span className="text-xs text-gray-500">
                                calls
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        
                        {/* Closed Today */}
                        <TableCell>
                          <div className="text-center">
                            <div className="flex flex-col items-center">
                              <span className={`font-bold text-lg ${
                                user.todayClosed > 0 ? 'text-green-600' : 'text-gray-500'
                              }`}>
                                {user.todayClosed}
                              </span>
                              <span className="text-xs text-gray-500">
                                closed
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        
                        {/* Performance */}
                        <TableCell>
                          <PerformanceScore score={user.performanceScore} />
                        </TableCell>
                        
                        {/* TL Name */}
                        <TableCell>
                          <span className="text-sm font-medium">{user.tlName}</span>
                        </TableCell>
                        
                        {/* Attendance Streak */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <span className="font-bold">{user.attendanceStreak}</span>
                            <span className="text-xs text-gray-500">days</span>
                          </div>
                        </TableCell>
                        
                        {/* Last Active */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-purple-500" />
                            <span className="text-sm">{formatTime(user.lastActive)}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableWrapper>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Pagination */}
      {users.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            Showing {users.length} users present today
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={filters.page === 1 || loading}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              <span className="text-sm">Page {filters.page}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={users.length < filters.limit || loading}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Top Performers Section */}
      {users.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Today's Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Top by Calls */}
              <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-gray-800 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300">
                    <PhoneCall className="w-4 h-4 inline mr-2" />
                    Most Calls
                  </h4>
                  <Badge variant="info">{Math.max(...users.map(u => u.todayCalled || 0))}</Badge>
                </div>
                {users
                  .filter(u => u.todayCalled > 0)
                  .sort((a, b) => (b.todayCalled || 0) - (a.todayCalled || 0))
                  .slice(0, 3)
                  .map((user, index) => (
                    <div key={user._id} className="flex items-center justify-between py-2 border-b border-blue-50 dark:border-blue-800/30 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                      <Badge variant="info">{user.todayCalled} calls</Badge>
                    </div>
                  ))}
              </div>
              
              {/* Top by Closed */}
              <div className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/10 dark:to-gray-800 border border-green-100 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-green-700 dark:text-green-300">
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    Most Closed
                  </h4>
                  <Badge variant="success">{Math.max(...users.map(u => u.todayClosed || 0))}</Badge>
                </div>
                {users
                  .filter(u => u.todayClosed > 0)
                  .sort((a, b) => (b.todayClosed || 0) - (a.todayClosed || 0))
                  .slice(0, 3)
                  .map((user, index) => (
                    <div key={user._id} className="flex items-center justify-between py-2 border-b border-green-50 dark:border-green-800/30 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                      <Badge variant="success">{user.todayClosed} closed</Badge>
                    </div>
                  ))}
              </div>
              
              {/* Top by Performance */}
              <div className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/10 dark:to-gray-800 border border-purple-100 dark:border-purple-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-purple-700 dark:text-purple-300">
                    <TrendingUp className="w-4 h-4 inline mr-2" />
                    Best Performance
                  </h4>
                  <Badge variant="purple">{Math.max(...users.map(u => u.performanceScore || 0))}%</Badge>
                </div>
                {users
                  .sort((a, b) => (b.performanceScore || 0) - (a.performanceScore || 0))
                  .slice(0, 3)
                  .map((user, index) => (
                    <div key={user._id} className="flex items-center justify-between py-2 border-b border-purple-50 dark:border-purple-800/30 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                      <PerformanceScore score={user.performanceScore} />
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}