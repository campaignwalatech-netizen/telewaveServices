import { useState, useEffect } from 'react';
import userService from '../../services/userService';
import { 
  Search, 
  Users, 
  Eye, 
  Edit, 
  RefreshCw, 
  Mail, 
  Phone,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  MoreVertical,
  Settings,
  Shield,
  Download,
  Upload,
  TrendingUp,
  Clock,
  Award,
  BarChart3,
  Target,
  Check,
  X,
  UserPlus,
  UserCheck,
  UserX,
  Filter,
  UserMinus,
  AlertCircle,
  Clock4,
  ShieldAlert,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Key,
  Hash,
  Link,
  UserCog,
  Building
} from 'lucide-react';

// Basic UI Components
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
    orange: 'bg-orange-600 text-white hover:bg-orange-700'
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
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
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

// TL Assignment Component
const TLAssignmentButton = ({ user, teamLeaders, onAssignTL, loading = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTL, setSelectedTL] = useState(user.reportingTo?._id || '');

  const handleAssignTL = async () => {
    if (!selectedTL) {
      alert('Please select a Team Leader');
      return;
    }

    const tl = teamLeaders.find(t => t._id === selectedTL);
    if (tl) {
      await onAssignTL(user._id, tl._id, tl.name);
      setIsOpen(false);
    }
  };

  const currentTL = teamLeaders.find(t => t._id === user.reportingTo?._id);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="min-w-[120px]"
      >
        <UserCog className="w-4 h-4 mr-2" />
        {currentTL ? 'Change TL' : 'Assign TL'}
      </Button>

      {isOpen && (
        <div className="absolute left-0 top-10 z-50 w-64 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
          <div className="p-3 space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">Select Team Leader</label>
              <Select
                value={selectedTL}
                onValueChange={setSelectedTL}
                className="w-full"
              >
                <option value="">Select TL...</option>
                {teamLeaders.map((tl) => (
                  <option key={tl._id} value={tl._id}>
                    {tl.name} ({tl.teamMembers?.length || 0} members)
                  </option>
                ))}
              </Select>
            </div>
            
            {selectedTL && (
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <p className="text-sm">
                  <span className="font-medium">Selected: </span>
                  {teamLeaders.find(t => t._id === selectedTL)?.name}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleAssignTL}
                disabled={!selectedTL || loading}
                className="flex-1"
                size="sm"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Assign
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Matched Fields Component
const MatchedFields = ({ user }) => {
  const calculateMatches = () => {
    const matches = [];
    
    // Check for duplicate email pattern
    if (user.email) {
      const emailPattern = user.email.split('@')[0];
      if (emailPattern.length <= 5) {
        matches.push(`Email pattern: ${emailPattern}`);
      }
    }
    
    // Check phone number patterns
    if (user.phoneNumber) {
      const lastFour = user.phoneNumber.slice(-4);
      if (/^\d{4}$/.test(lastFour)) {
        matches.push(`Phone ends: ${lastFour}`);
      }
    }
    
    // Check name patterns
    if (user.name) {
      const nameParts = user.name.split(' ');
      if (nameParts.length === 1 && nameParts[0].length <= 4) {
        matches.push(`Short name: ${nameParts[0]}`);
      }
    }
    
    // Check registration date (fresh within 7 days)
    const registrationDate = new Date(user.createdAt);
    const today = new Date();
    const daysSinceReg = Math.floor((today - registrationDate) / (1000 * 60 * 60 * 24));
    if (daysSinceReg <= 7) {
      matches.push(`Registered ${daysSinceReg} days ago`);
    }
    
    // Check if user has any previous history
    if (!user.lastActivity && !user.statistics?.totalLeads) {
      matches.push('No activity history');
    }
    
    return matches;
  };

  const matches = calculateMatches();
  
  return (
    <div className="relative group">
      <Badge variant={matches.length > 0 ? 'warning' : 'success'}>
        {matches.length} matches
      </Badge>
      
      {matches.length > 0 && (
        <div className="absolute left-0 top-10 z-50 w-64 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
          <div className="space-y-2">
            <p className="text-sm font-medium">Matched Patterns:</p>
            <ul className="text-xs space-y-1">
              {matches.map((match, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Hash className="w-3 h-3 text-gray-500" />
                  {match}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ user }) => {
  const getStatusInfo = () => {
    const registrationDate = new Date(user.createdAt);
    const today = new Date();
    const daysSinceReg = Math.floor((today - registrationDate) / (1000 * 60 * 60 * 24));
    
    if (daysSinceReg === 0) {
      return { label: 'Today', variant: 'success', icon: <UserPlus className="w-3 h-3" /> };
    } else if (daysSinceReg === 1) {
      return { label: 'Yesterday', variant: 'success', icon: <UserCheck className="w-3 h-3" /> };
    } else if (daysSinceReg <= 3) {
      return { label: `${daysSinceReg} days`, variant: 'info', icon: <Clock4 className="w-3 h-3" /> };
    } else if (daysSinceReg <= 7) {
      return { label: `${daysSinceReg} days`, variant: 'warning', icon: <AlertCircle className="w-3 h-3" /> };
    } else {
      return { label: `${daysSinceReg}+ days`, variant: 'destructive', icon: <UserX className="w-3 h-3" /> };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Badge variant={statusInfo.variant} className="flex items-center gap-1">
      {statusInfo.icon}
      Fresh Join ({statusInfo.label})
    </Badge>
  );
};

export default function NotApprovedUsers() {
  const [users, setUsers] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [filters, setFilters] = useState({
    search: '',
    page: 1,
    limit: 20
  });

  const [sort, setSort] = useState({
    key: 'createdAt',
    direction: 'desc'
  });

  // Enhance user data
  const enhanceUserData = (user) => {
    // Calculate days since registration
    const registrationDate = new Date(user.createdAt);
    const today = new Date();
    const daysSinceReg = Math.floor((today - registrationDate) / (1000 * 60 * 60 * 24));
    
    // Get previous TL info
    const previousTL = user.oldReportingTo?.name || '-';
    
    // Check if user is fresh join (not approved yet)
    const isFreshJoin = !user.isVerified || user.status === 'pending_approval' || daysSinceReg <= 30;
    
    // Calculate matched fields
    const matchedFields = [];
    if (user.email && user.email.split('@')[0].length <= 5) matchedFields.push('email');
    if (user.phoneNumber && /^(\d)\1{5,}$/.test(user.phoneNumber)) matchedFields.push('phone');
    if (user.name && user.name.split(' ').length === 1) matchedFields.push('name');

    return {
      ...user,
      daysSinceReg,
      previousTL,
      isFreshJoin,
      matchedFields,
      matchedCount: matchedFields.length,
      registrationDate: registrationDate.toLocaleDateString('en-IN'),
      registrationTime: registrationDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Fetch not approved users (fresh joins)
  const fetchNotApprovedUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: filters.page,
        limit: filters.limit,
        sort: sort.key,
        order: sort.direction,
        ...(filters.search && { search: filters.search }),
        status: 'pending_approval', // Fetch only pending approval users
        isVerified: false // Not verified users
      };

      const response = await userService.getAllUsersWithStats(params);
      
      if (response.success) {
        const enhancedUsers = response.data.users
          .map(enhanceUserData)
          .filter(user => user.isFreshJoin); // Filter only fresh joins
        
        setUsers(enhancedUsers);
      } else {
        setError(response.message || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching not approved users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Team Leaders for assignment
  const fetchTeamLeaders = async () => {
    try {
      const response = await userService.getAllUsersWithStats({ 
        role: 'TL',
        status: 'active'
      });
      if (response.success) {
        setTeamLeaders(response.data.users);
      }
    } catch (err) {
      console.error('Error fetching team leaders:', err);
    }
  };

  // Assign TL to user
  const assignTLToUser = async (userId, tlId, tlName) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      
      // First assign TL
      const assignResponse = await userService.updateUser(userId, {
        reportingTo: { _id: tlId, name: tlName },
        status: 'active', // Auto-approve when TL is assigned
        isVerified: true
      });
      
      if (assignResponse.success) {
        setSuccess(`User assigned to TL ${tlName} and approved successfully`);
        await fetchNotApprovedUsers(); // Refresh list (user will be removed as they're now approved)
      } else {
        setError(assignResponse.message || 'Failed to assign TL');
      }
    } catch (err) {
      console.error('Error assigning TL:', err);
      setError(err.message || 'Failed to assign TL');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Approve user directly
  const approveUser = async (userId) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      const response = await userService.approveUserRegistration(userId);
      
      if (response.success) {
        setSuccess('User approved successfully');
        await fetchNotApprovedUsers();
      } else {
        setError(response.message || 'Failed to approve user');
      }
    } catch (err) {
      console.error('Error approving user:', err);
      setError(err.message || 'Failed to approve user');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      const response = await userService.deleteUser(userId);
      
      if (response.success) {
        setSuccess('User deleted successfully');
        await fetchNotApprovedUsers();
      } else {
        setError(response.message || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.message || 'Failed to delete user');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Export not approved users
  const exportUsers = async () => {
    try {
      setLoading(true);
      const blob = await userService.exportUsers({
        format: 'excel',
        ...filters,
        status: 'pending_approval'
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `not_approved_users_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccess('Not approved users exported successfully');
    } catch (err) {
      console.error('Error exporting users:', err);
      setError(err.message || 'Failed to export users');
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchNotApprovedUsers();
    fetchTeamLeaders();
  }, [filters.page, filters.limit, sort]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (filters.page !== 1) {
        setFilters(prev => ({ ...prev, page: 1 }));
      } else {
        fetchNotApprovedUsers();
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
    const todayRegistrations = users.filter(u => u.daysSinceReg === 0).length;
    const weekOldRegistrations = users.filter(u => u.daysSinceReg > 7).length;
    const usersWithTL = users.filter(u => u.reportingTo).length;
    
    return {
      totalUsers,
      todayRegistrations,
      weekOldRegistrations,
      usersWithTL,
      usersWithoutTL: totalUsers - usersWithTL
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Not Approved Users</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage new registrations and users pending admin approval
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Export */}
          <Button
            variant="outline"
            size="sm"
            onClick={exportUsers}
            disabled={loading}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          {/* Refresh */}
          <Button 
            onClick={() => { fetchNotApprovedUsers(); fetchTeamLeaders(); }} 
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
                <p className="text-sm text-gray-500">Pending Approval</p>
                <p className="text-3xl font-bold text-orange-600">{stats.totalUsers}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <ShieldAlert className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Users waiting for approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today's Registrations</p>
                <p className="text-3xl font-bold text-green-600">{stats.todayRegistrations}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <UserPlus className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Registered today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Without TL</p>
                <p className="text-3xl font-bold text-blue-600">{stats.usersWithoutTL}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <UserMinus className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Need TL assignment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Old Registrations</p>
                <p className="text-3xl font-bold text-red-600">{stats.weekOldRegistrations}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <Clock4 className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Registered 7 days ago
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
                placeholder="Search by name, email, phone..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-9"
                disabled={loading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Not Approved Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" />
            Pending Approval Users
            {users.length > 0 && (
              <Badge variant="orange" className="ml-2">
                {users.length} pending
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
                    <TableHead sortable onSort={handleSort} sortKey="createdAt" currentSort={sort}>
                      Status
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="name" currentSort={sort}>
                      Name
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="email" currentSort={sort}>
                      Email Id
                    </TableHead>
                    <TableHead>
                      Phone Number
                    </TableHead>
                    <TableHead>
                      Assign TL
                    </TableHead>
                    <TableHead>
                      Previous TL
                    </TableHead>
                    <TableHead>
                      Matched Fields
                    </TableHead>
                    <TableHead>
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center">
                          <RefreshCw className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                          <span className="text-lg">Loading users...</span>
                          <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the data</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                        <UserCheck className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-xl font-medium">No users pending approval</p>
                        <p className="text-sm mt-2">
                          {filters.search 
                            ? 'Try adjusting your search filters' 
                            : 'All users are approved! Great job!'}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user._id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <TableCell>
                          <div className="space-y-2">
                            <StatusBadge user={user} />
                            <div className="text-xs text-gray-500">
                              {user.registrationDate} at {user.registrationTime}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                              <User className="w-4 h-4 text-orange-600 dark:text-orange-300" />
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-xs text-gray-500">
                                ID: {user._id?.substring(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="text-sm truncate max-w-[200px]">{user.email}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="font-mono text-sm">{user.phoneNumber}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="min-w-[140px]">
                            <TLAssignmentButton 
                              user={user}
                              teamLeaders={teamLeaders}
                              onAssignTL={assignTLToUser}
                              loading={actionLoading[user._id]}
                            />
                            {!user.reportingTo && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => approveUser(user._id)}
                                disabled={actionLoading[user._id]}
                                className="mt-2 w-full"
                              >
                                <Check className="w-3 h-3 mr-2" />
                                Approve Directly
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-sm">
                            {user.previousTL !== '-' ? (
                              <div className="flex items-center gap-2 text-orange-600">
                                <UserMinus className="w-4 h-4" />
                                {user.previousTL}
                              </div>
                            ) : (
                              <span className="text-gray-500">No previous TL</span>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <MatchedFields user={user} />
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteUser(user._id)}
                              disabled={actionLoading[user._id]}
                              title="Delete User"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => approveUser(user._id)}
                              disabled={actionLoading[user._id]}
                              title="Approve User"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
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
            Showing {users.length} users pending approval
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