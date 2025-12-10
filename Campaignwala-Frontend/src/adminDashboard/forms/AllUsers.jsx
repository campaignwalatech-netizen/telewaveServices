import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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
  Key,
  Shield,
  FileSpreadsheet,
  Upload,
  TrendingUp,
  Clock,
  Download,
  Check,
  X,
  Pause,
  Play,
  Ban,
  UserX,
  Filter,
  CalendarDays,
  PhoneCall,
  UserCheck,
  AlertCircle,
  ArrowUpDown,
  Trash2,
  DollarSign,
  Bookmark,
  Target,
  TrendingDown
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

// Role Change Component
const RoleChangeButton = ({ user, onChangeRole, loading = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleChange = async (newRole) => {
    if (newRole !== user.role) {
      await onChangeRole(user._id, newRole);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant={user.role === 'TL' ? 'default' : user.role === 'admin' ? 'destructive' : 'default'}
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="min-w-[80px]"
      >
        {loading ? (
          <RefreshCw className="w-3 h-3 animate-spin mr-1" />
        ) : null}
        {user.role}
        <ChevronDown className="w-3 h-3 ml-1" />
      </Button>

      {isOpen && (
        <div className="absolute left-0 top-10 z-50 w-32 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
          <div className="p-1 space-y-1">
            {user.role !== 'user' && (
              <button
                onClick={() => handleRoleChange('user')}
                disabled={loading}
                className="flex items-center w-full px-3 py-2 text-sm text-left rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50"
              >
                User
              </button>
            )}
            {user.role !== 'TL' && (
              <button
                onClick={() => handleRoleChange('TL')}
                disabled={loading}
                className="flex items-center w-full px-3 py-2 text-sm text-left text-purple-600 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/20 disabled:opacity-50"
              >
                TL
              </button>
            )}
            
          </div>
        </div>
      )}
    </div>
  );
};

// Status Change Component
const StatusChangeButton = ({ user, onChangeStatus, loading = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getVariant = () => {
    switch(user.status) {
      case 'active': return "success";
      case 'hold': return "warning";
      case 'dead': return "destructive";
      case 'inactive': return "gray";
      default: return "secondary";
    }
  };

  const getLabel = () => {
    switch(user.status) {
      case 'active': return 'Active';
      case 'hold': return 'Hold';
      case 'dead': return 'Dead';
      case 'inactive': return 'Inactive';
      default: return user.status || 'Unknown';
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus !== user.status) {
      await onChangeStatus(user._id, newStatus);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant={getVariant()}
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="min-w-[80px]"
      >
        {loading ? (
          <RefreshCw className="w-3 h-3 animate-spin mr-1" />
        ) : null}
        {getLabel()}
        <ChevronDown className="w-3 h-3 ml-1" />
      </Button>

      {isOpen && (
        <div className="absolute left-0 top-10 z-50 w-32 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
          <div className="p-1 space-y-1">
            {user.status !== 'active' && (
              <button
                onClick={() => handleStatusChange('active')}
                disabled={loading}
                className="flex items-center w-full px-3 py-2 text-sm text-left text-green-600 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50"
              >
                Active
              </button>
            )}
            {user.status !== 'hold' && (
              <button
                onClick={() => handleStatusChange('hold')}
                disabled={loading}
                className="flex items-center w-full px-3 py-2 text-sm text-left text-yellow-600 rounded-md hover:bg-yellow-50 dark:hover:bg-yellow-900/20 disabled:opacity-50"
              >
                Hold
              </button>
            )}
            {user.status !== 'dead' && (
              <button
                onClick={() => handleStatusChange('dead')}
                disabled={loading}
                className="flex items-center w-full px-3 py-2 text-sm text-left text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
              >
                Dead
              </button>
            )}
            {user.status !== 'inactive' && (
              <button
                onClick={() => handleStatusChange('inactive')}
                disabled={loading}
                className="flex items-center w-full px-3 py-2 text-sm text-left text-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900/20 disabled:opacity-50"
              >
                Inactive
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Attendance Component
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

  return (
    <Badge variant={getVariant()} className="min-w-[80px] justify-center">
      {getLabel()}
    </Badge>
  );
};

// TL Change Component
const TLChangeButton = ({ user, teamLeaders, onChangeTL, loading = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTLChange = async (tlId, tlName) => {
    if (tlId !== user.reportingTo?._id) {
      await onChangeTL(user._id, tlId, tlName);
      setIsOpen(false);
    }
  };

  const currentTLName = user.reportingTo?.name || 'Not Assigned';

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading || teamLeaders.length === 0}
        className="min-w-[120px]"
      >
        {currentTLName}
        <ChevronDown className="w-3 h-3 ml-1" />
      </Button>

      {isOpen && (
        <div className="absolute left-0 top-10 z-50 w-48 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg max-h-60 overflow-y-auto">
          <div className="p-1 space-y-1">
            <button
              onClick={() => handleTLChange('', 'Not Assigned')}
              className="flex items-center w-full px-3 py-2 text-sm text-left rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Not Assigned
            </button>
            {teamLeaders.map((tl) => (
              <button
                key={tl._id}
                onClick={() => handleTLChange(tl._id, tl.name)}
                className={`flex items-center w-full px-3 py-2 text-sm text-left rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 ${
                  user.reportingTo?._id === tl._id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                {tl.name} ({tl.teamMembers?.length || 0})
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Open Leads Withrow Component
const OpenLeadsWithrow = ({ openLeads, onWithrow }) => {
  const [showWithrow, setShowWithrow] = useState(false);
  const [amount, setAmount] = useState('');

  const handleWithrow = () => {
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
      onWithrow(parseFloat(amount));
      setAmount('');
      setShowWithrow(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Badge variant={openLeads > 0 ? 'warning' : 'success'}>
          {openLeads}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowWithrow(!showWithrow)}
          title="Withrow"
          className="h-6 w-6"
        >
          <DollarSign className="w-3 h-3" />
        </Button>
      </div>

      {showWithrow && (
        <div className="absolute right-0 top-10 z-50 w-48 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
          <div className="space-y-2">
            <label className="text-xs font-medium">Withrow Amount</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="h-8 text-sm"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleWithrow}
                className="flex-1 h-8"
              >
                Withrow
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWithrow(false)}
                className="h-8"
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

// Action Menu Component
const ActionMenu = ({ user, onEdit, onDelete, loading = false }) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onEdit}
        disabled={loading}
        title="Edit User"
      >
        <Edit className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        disabled={loading}
        title="Delete User"
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default function AllUsers() {
  const [users, setUsers] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    // 🔹 Default role filter set to "user"
    role: 'user',
    page: 1,
    limit: 20
  });

  const [sort, setSort] = useState({
    key: 'createdAt',
    direction: 'desc'
  });

  // Enhance user data with calculated fields
  const enhanceUserData = (user) => {
    // Calculate lead statistics
    const totalLeads = user.statistics?.totalLeads || 0;
    const completedLeads = user.statistics?.completedLeads || 0;
    const pendingLeads = user.statistics?.pendingLeads || 0;
    const rejectedLeads = user.statistics?.rejectedLeads || 0;
    const conversionRate = totalLeads > 0 ? (completedLeads / totalLeads * 100) : 0;
    
    // Attendance
    const totalPresent = user.attendance?.totalPresent || 0;
    const attendanceStatus = user.attendance?.todayStatus || 'not_marked';
    
    // Rollback data
    const rollbackData = user.rollback?.total || 0;
    const rollbackDate = user.rollback?.lastDate ? 
      new Date(user.rollback.lastDate).toLocaleDateString('en-IN') : '-';
    
    // Lead data
    const lastData = user.leadDistribution?.lastLeadDate ? 
      new Date(user.leadDistribution.lastLeadDate).toLocaleDateString('en-IN') : '-';
    const dateAssigned = user.leadDistribution?.lastAssignedDate ? 
      new Date(user.leadDistribution.lastAssignedDate).toLocaleDateString('en-IN') : '-';
    
    // TL info
    const tlName = user.reportingTo?.name || '-';
    const manageTL = user.tlDetails?.managedBy?.name || '-';

    return {
      ...user,
      totalLeads,
      completedLeads,
      pendingLeads,
      rejectedLeads,
      conversionRate: conversionRate.toFixed(2),
      totalPresent,
      attendanceStatus,
      rollbackData,
      rollbackDate,
      lastData,
      dateAssigned,
      tlName,
      manageTL,
      openLeads: pendingLeads + rejectedLeads,
      salary: user.financials?.salary || '-',
      joinDate: new Date(user.createdAt).toLocaleDateString('en-IN'),
      calledLeads: user.statistics?.calledLeads || 0,
      closedLeads: user.statistics?.closedLeads || 0,
      canReceiveLeads: user.status === 'active' && attendanceStatus === 'present'
    };
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: filters.page,
        limit: filters.limit,
        sort: sort.key,
        order: sort.direction,
        ...(filters.search && { search: filters.search }),
        ...(filters.status !== 'all' && { 
          ...(filters.status === 'ex' ? { isEx: true } : { status: filters.status })
        }),
        ...(filters.role !== 'all' && { role: filters.role })
      };

      const response = await userService.getAllUsersWithStats(params);
      
      if (response.success) {
        const enhancedUsers = response.data.users.map(enhanceUserData);
        setUsers(enhancedUsers);
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

  // Fetch Team Leaders for TL change dropdown
  const fetchTeamLeaders = async () => {
    try {
      const response = await userService.getAllUsersWithStats({ role: 'TL' });
      if (response.success) {
        setTeamLeaders(response.data.users);
      }
    } catch (err) {
      console.error('Error fetching team leaders:', err);
    }
  };

  // Change user role
  const changeUserRole = async (userId, newRole) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      const response = await userService.changeUserRole(userId, { newRole });
      
      if (response.success) {
        setSuccess(`User role changed to ${newRole} successfully`);
        await fetchUsers();
      } else {
        setError(response.message || 'Failed to change user role');
      }
    } catch (err) {
      console.error('Error changing user role:', err);
      setError(err.message || 'Failed to change user role');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Change user status
  const changeUserStatus = async (userId, newStatus) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      
      let response;
      if (newStatus === 'active') {
        response = await userService.markUserActive(userId);
      } else if (newStatus === 'hold') {
        response = await userService.markUserHold(userId, { reason: 'Manual status change' });
      } else if (newStatus === 'dead') {
        response = await userService.blockUser(userId, { reason: 'Marked as dead' });
      } else if (newStatus === 'inactive') {
        response = await userService.toggleUserStatus(userId);
      }
      
      if (response?.success) {
        setSuccess(`User status changed to ${newStatus} successfully`);
        await fetchUsers();
      } else {
        setError(response?.message || 'Failed to change user status');
      }
    } catch (err) {
      console.error('Error changing user status:', err);
      setError(err.message || 'Failed to change user status');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Change TL assignment
  const changeUserTL = async (userId, tlId, tlName) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      const response = await userService.updateUser(userId, {
        reportingTo: tlId ? { _id: tlId, name: tlName } : null
      });
      
      if (response.success) {
        setSuccess(`TL assigned successfully`);
        await fetchUsers();
      } else {
        setError(response.message || 'Failed to assign TL');
      }
    } catch (err) {
      console.error('Error assigning TL:', err);
      setError(err.message || 'Failed to assign TL');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Handle withrow
  const handleWithrow = async (userId, amount) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      const response = await userService.processWithdrawal(userId, { amount });
      
      if (response.success) {
        setSuccess(`Withrow of ₹${amount} processed successfully`);
        await fetchUsers();
      } else {
        setError(response.message || 'Failed to process withrow');
      }
    } catch (err) {
      console.error('Error processing withrow:', err);
      setError(err.message || 'Failed to process withrow');
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
        await fetchUsers();
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

  // Edit user
  const editUser = (user) => {
    console.log('Edit user:', user);
    // You can implement edit functionality here
  };

  // Export users
  const exportUsers = async () => {
    try {
      setLoading(true);
      const blob = await userService.exportUsers({
        format: 'excel',
        ...filters
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccess('Users exported successfully');
    } catch (err) {
      console.error('Error exporting users:', err);
      setError(err.message || 'Failed to export users');
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk upload
  const handleBulkUpload = async (file) => {
    try {
      setLoading(true);
      const response = await userService.bulkUploadUsers(file);
      
      if (response.success) {
        setSuccess(`${response.data?.processed || 0} users uploaded successfully`);
        await fetchUsers();
      } else {
        setError(response.message || 'Failed to upload users');
      }
    } catch (err) {
      console.error('Error uploading users:', err);
      setError(err.message || 'Failed to upload users');
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchUsers();
    fetchTeamLeaders();
  }, [filters.page, filters.limit, filters.status, filters.role, sort]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (filters.page !== 1) {
        setFilters(prev => ({ ...prev, page: 1 }));
      } else {
        fetchUsers();
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

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.name.match(/\.(csv|xlsx|xls)$/)) {
        setError('Please upload a CSV or Excel file');
        return;
      }
      handleBulkUpload(file);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Users</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all users with detailed information and actions
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Bulk Upload */}
          <div className="relative">
            <input
              type="file"
              id="bulk-upload"
              className="hidden"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              disabled={loading}
            />
            <label htmlFor="bulk-upload">
              <Button
                variant="outline"
                size="sm"
                as="span"
                disabled={loading}
                className="cursor-pointer"
              >
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </Button>
            </label>
          </div>
          
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
            onClick={() => { fetchUsers(); fetchTeamLeaders(); }} 
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
            <div className="flex flex-col sm:flex-row gap-3">
              

              <Select 
                value={filters.role== 'user' ? 'all' : filters.role} 
                onValueChange={(value) => handleFilterChange('role', value)}
                placeholder="User"
                className="w-full sm:w-[150px]"
                disabled={loading}
              >
                {/* <SelectItem value="all">All Roles</SelectItem> */}
                {/* <SelectItem value="user">User</SelectItem> */}
                {/* <SelectItem value="TL">Team Lead</SelectItem> */}
                {/* <SelectItem value="admin">Admin</SelectItem> */}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table with Horizontal Scroll */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Users List
            {users.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {users.length} users
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
                      Joined On
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="role" currentSort={sort}>
                      Role
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="name" currentSort={sort}>
                      Name
                    </TableHead>
                    <TableHead>
                      Phone Number
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="status" currentSort={sort}>
                      Status
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="attendance.todayStatus" currentSort={sort}>
                      Attendance
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="rollbackData" currentSort={sort}>
                      RollBack Data
                    </TableHead>
                    <TableHead>
                      RollBack Date
                    </TableHead>
                    <TableHead>
                      TL Name
                    </TableHead>
                    <TableHead>
                      Manage TL
                    </TableHead>
                    <TableHead>
                      Last Data
                    </TableHead>
                    <TableHead>
                      Called
                    </TableHead>
                    <TableHead>
                      Closed
                    </TableHead>
                    <TableHead>
                      Date Assigned
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="totalPresent" currentSort={sort}>
                      Total Present
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="salary" currentSort={sort}>
                      Salary
                    </TableHead>
                    <TableHead>
                      Email Id
                    </TableHead>
                    <TableHead>
                      Open Leads
                    </TableHead>
                    <TableHead>
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={19} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center">
                          <RefreshCw className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                          <span className="text-lg">Loading users...</span>
                          <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the data</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={19} className="text-center py-12 text-gray-500">
                        <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-xl font-medium">No users found</p>
                        <p className="text-sm mt-2">
                          {(filters.search || filters.status !== 'all' || filters.role !== 'all') 
                            ? 'Try adjusting your search filters' 
                            : 'No users in the system yet'}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user._id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{user.joinDate}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <RoleChangeButton 
                            user={user}
                            onChangeRole={changeUserRole}
                            loading={actionLoading[user._id]}
                          />
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-xs text-gray-500">ID: {user._id?.substring(0, 6)}...</p>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="font-mono text-sm">{user.phoneNumber}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <StatusChangeButton 
                            user={user}
                            onChangeStatus={changeUserStatus}
                            loading={actionLoading[user._id]}
                          />
                        </TableCell>
                        
                        <TableCell>
                          <AttendanceBadge user={user} />
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-center">
                            {user.rollbackData > 0 ? (
                              <Badge variant="destructive">{user.rollbackData}</Badge>
                            ) : (
                              <span className="text-gray-500">0</span>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <span className="text-sm">{user.rollbackDate}</span>
                        </TableCell>
                        
                        <TableCell>
                          <span className="text-sm font-medium">{user.tlName}</span>
                        </TableCell>
                        
                        <TableCell>
                          <TLChangeButton 
                            user={user}
                            teamLeaders={teamLeaders}
                            onChangeTL={changeUserTL}
                            loading={actionLoading[user._id]}
                          />
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{user.lastData}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-center">
                            <span className="font-medium">{user.calledLeads}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-center">
                            <span className="font-medium text-green-600">{user.closedLeads}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <span className="text-sm">{user.dateAssigned}</span>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-center">
                            <span className="font-bold">{user.totalPresent}</span>
                            {user.conversionRate > 0 && (
                              <p className="text-xs text-gray-500">{user.conversionRate}% conversion</p>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-right">
                            {user.salary && user.salary !== '-' ? (
                              <div className="flex items-center justify-end gap-1">
                                <span className="font-bold text-green-600">₹{user.salary.toLocaleString('en-IN')}</span>
                              </div>
                            ) : (
                              <span className="text-gray-500">{user.salary}</span>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[200px]">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="text-sm truncate">{user.email}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <OpenLeadsWithrow 
                            openLeads={user.openLeads}
                            onWithrow={(amount) => handleWithrow(user._id, amount)}
                          />
                        </TableCell>
                        
                        <TableCell>
                          <ActionMenu
                            user={user}
                            onEdit={() => editUser(user)}
                            onDelete={() => deleteUser(user._id)}
                            loading={actionLoading[user._id]}
                          />
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
