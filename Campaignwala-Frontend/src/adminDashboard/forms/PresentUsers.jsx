import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import userService from '../../services/userService';
import { 
  Search, 
  Users, 
  Eye, 
  Calendar,
  User,
  Phone,
  Mail,
  CheckCircle,
  TrendingUp,
  Clock,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  BarChart3,
  Target,
  Check,
  X,
  CalendarDays,
  UserCheck,
  Building
} from 'lucide-react';

// Reuse the same UI components
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
    info: 'bg-blue-600 text-white hover:bg-blue-700'
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
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
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

// Attendance Status Component
const AttendanceStatus = ({ user }) => {
  const getStatusVariant = (status) => {
    switch(status) {
      case 'present': return 'success';
      case 'late': return 'warning';
      case 'half-day': return 'orange';
      case 'absent': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'present': return <CheckCircle className="w-4 h-4" />;
      case 'late': return <Clock className="w-4 h-4" />;
      case 'half-day': return <Clock className="w-4 h-4" />;
      case 'absent': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'present': return 'Present';
      case 'late': return 'Late';
      case 'half-day': return 'Half Day';
      case 'absent': return 'Absent';
      default: return 'Not Marked';
    }
  };

  return (
    <Badge 
      variant={getStatusVariant(user.todayStatus)}
      className="flex items-center gap-1"
    >
      {getStatusIcon(user.todayStatus)}
      {getStatusText(user.todayStatus)}
    </Badge>
  );
};

export default function PresentUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [filters, setFilters] = useState({
    search: '',
    attendanceStatus: 'present', // Default to present only
    role: 'all',
    page: 1,
    limit: 20
  });

  const [sort, setSort] = useState({
    key: 'name',
    direction: 'asc'
  });

  // Enhance user data for attendance view
  const enhanceUserData = (user) => {
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Check if attendance was marked today
    const attendanceToday = user.attendance?.todayMarkedAt && 
      new Date(user.attendance.todayMarkedAt).toISOString().split('T')[0] === today;
    
    const todayStatus = attendanceToday ? user.attendance?.todayStatus : 'not_marked';
    
    // Calculate total present days
    const totalPresent = user.attendance?.totalPresent || 0;
    const totalDays = user.attendance?.totalDays || 1;
    const attendancePercentage = (totalPresent / totalDays * 100).toFixed(1);
    
    // Time info
    const checkInTime = attendanceToday && user.attendance?.todayCheckIn ? 
      new Date(user.attendance.todayCheckIn).toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }) : '-';
    
    const checkOutTime = attendanceToday && user.attendance?.todayCheckOut ? 
      new Date(user.attendance.todayCheckOut).toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }) : '-';

    return {
      ...user,
      todayStatus,
      totalPresentDays: totalPresent,
      attendancePercentage,
      checkInTime,
      checkOutTime,
      isMarkedToday: attendanceToday,
      markedAt: attendanceToday ? 
        new Date(user.attendance.todayMarkedAt).toLocaleTimeString('en-IN') : '-'
    };
  };

  // Fetch all users and filter for present ones
  const fetchPresentUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: filters.page,
        limit: filters.limit,
        sort: sort.key,
        order: sort.direction,
        ...(filters.search && { search: filters.search }),
        ...(filters.role !== 'all' && { role: filters.role })
      };

      // Use the existing getAllUsersWithStats method
      const response = await userService.getAllUsersWithStats(params);
      
      if (response.success) {
        // Filter users based on attendance status
        const allUsers = response.data.users.map(enhanceUserData);
        
        let filteredUsers = allUsers;
        
        // Apply attendance filter
        if (filters.attendanceStatus === 'present') {
          filteredUsers = allUsers.filter(user => user.todayStatus === 'present');
        } else if (filters.attendanceStatus === 'late') {
          filteredUsers = allUsers.filter(user => user.todayStatus === 'late');
        } else if (filters.attendanceStatus === 'half-day') {
          filteredUsers = allUsers.filter(user => user.todayStatus === 'half-day');
        } else if (filters.attendanceStatus === 'absent') {
          filteredUsers = allUsers.filter(user => user.todayStatus === 'absent');
        } else if (filters.attendanceStatus === 'not_marked') {
          filteredUsers = allUsers.filter(user => user.todayStatus === 'not_marked');
        }
        // For 'all', don't filter
        
        setUsers(filteredUsers);
      } else {
        setError(response.message || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Mark attendance using existing method
  const markAttendance = async (userId, status) => {
    try {
      setLoading(true);
      // Assuming you have an updateUser method that can update attendance
      const response = await userService.updateUser(userId, {
        'attendance.todayStatus': status,
        'attendance.todayMarkedAt': new Date().toISOString(),
        'attendance.todayCheckIn': status === 'present' || status === 'late' ? 
          new Date().toISOString() : null
      });
      
      if (response.success) {
        setSuccess(`Attendance marked as ${status} successfully`);
        await fetchPresentUsers();
      } else {
        setError(response.message || 'Failed to mark attendance');
      }
    } catch (err) {
      console.error('Error marking attendance:', err);
      setError(err.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  // Export attendance report
  const exportAttendanceReport = async () => {
    try {
      setLoading(true);
      // Use existing export method with attendance filter
      const blob = await userService.exportUsers({
        format: 'excel',
        ...filters,
        exportType: 'attendance'
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const today = new Date().toISOString().split('T')[0];
      a.download = `attendance_report_${today}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccess('Attendance report exported successfully');
    } catch (err) {
      console.error('Error exporting report:', err);
      setError(err.message || 'Failed to export report');
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchPresentUsers();
  }, [filters.page, filters.limit, filters.role, filters.attendanceStatus, sort]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (filters.page !== 1) {
        setFilters(prev => ({ ...prev, page: 1 }));
      } else {
        fetchPresentUsers();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters.search]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

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

  // Calculate statistics
  const calculateStats = () => {
    const totalUsers = users.length;
    const presentUsers = users.filter(u => u.todayStatus === 'present').length;
    const lateUsers = users.filter(u => u.todayStatus === 'late').length;
    const absentUsers = users.filter(u => u.todayStatus === 'absent').length;
    const notMarked = users.filter(u => u.todayStatus === 'not_marked').length;
    
    const attendancePercentage = totalUsers > 0 ? 
      ((presentUsers + lateUsers) / totalUsers * 100).toFixed(1) : 0;
    
    return {
      totalUsers,
      presentUsers,
      lateUsers,
      absentUsers,
      notMarked,
      attendancePercentage
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            Present Users - Today
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage today's attendance for all users
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Export Report */}
          <Button
            variant="outline"
            size="sm"
            onClick={exportAttendanceReport}
            disabled={loading}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Present Today</p>
                <p className="text-3xl font-bold text-green-600">{stats.presentUsers}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Users marked as present
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Late Arrivals</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.lateUsers}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Users marked as late
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Not Marked</p>
                <p className="text-3xl font-bold text-blue-600">{stats.notMarked}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Attendance not marked yet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Attendance %</p>
                <p className="text-3xl font-bold text-purple-600">{stats.attendancePercentage}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Present + Late / Total
            </p>
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
                placeholder="Search users by name, email, phone..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-9"
                disabled={loading}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Select 
                value={filters.attendanceStatus} 
                onValueChange={(value) => handleFilterChange('attendanceStatus', value)}
                placeholder="Attendance Status"
                className="w-full sm:w-[180px]"
                disabled={loading}
              >
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="half-day">Half Day</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="not_marked">Not Marked</SelectItem>
                <SelectItem value="all">All Status</SelectItem>
              </Select>

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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Present Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Today's Attendance
            {users.length > 0 && (
              <Badge variant="success" className="ml-2">
                {stats.presentUsers} Present
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
                      User Name
                    </TableHead>
                    <TableHead>
                      Role
                    </TableHead>
                    <TableHead>
                      Phone
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="attendance.todayStatus" currentSort={sort}>
                      Status
                    </TableHead>
                    <TableHead>
                      Check-In
                    </TableHead>
                    <TableHead>
                      Total Present Days
                    </TableHead>
                    <TableHead>
                      Team Lead
                    </TableHead>
                    <TableHead>
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center">
                          <RefreshCw className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                          <span className="text-lg">Loading attendance...</span>
                          <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the data</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                        <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-xl font-medium">No users found</p>
                        <p className="text-sm mt-2">
                          {filters.attendanceStatus !== 'all' 
                            ? `No users marked as ${filters.attendanceStatus} today` 
                            : 'No users in the system'}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user._id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant={user.role === 'TL' ? 'purple' : user.role === 'admin' ? 'destructive' : 'default'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="font-mono text-sm">{user.phoneNumber}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <AttendanceStatus user={user} />
                          {user.todayStatus === 'late' && (
                            <p className="text-xs text-yellow-600 mt-1">
                              Late arrival
                            </p>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{user.checkInTime}</span>
                          </div>
                          {user.markedAt !== '-' && (
                            <p className="text-xs text-gray-500 mt-1">
                              Marked at: {user.markedAt}
                            </p>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-blue-500" />
                            <span className="font-bold">{user.totalPresentDays}</span>
                            <span className="text-xs text-gray-500">
                              ({user.attendancePercentage}%)
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <span className="text-sm">
                            {user.reportingTo?.name || '-'}
                          </span>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              title="View Profile"
                            >
                              <Link to={`/admin/user/${user._id}`}>
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>
                            
                            {/* Quick attendance actions */}
                            {user.todayStatus !== 'present' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markAttendance(user._id, 'present')}
                                disabled={loading}
                                title="Mark as Present"
                                className="h-8 px-2"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            
                            {user.todayStatus !== 'absent' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markAttendance(user._id, 'absent')}
                                disabled={loading}
                                title="Mark as Absent"
                                className="h-8 px-2"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
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
            Showing {users.length} users
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
    </div>
  );
}