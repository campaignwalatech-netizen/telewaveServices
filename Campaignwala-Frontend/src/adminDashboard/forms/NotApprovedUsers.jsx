import { useState, useEffect, useRef } from 'react';
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
  Upload,
  TrendingUp,
  Clock,
  Download,
  Check,
  X,
  UserX,
  Filter,
  CalendarDays,
  PhoneCall,
  UserCheck,
  AlertCircle,
  ArrowUpDown,
  Trash2,
  DollarSign,
  Target,
  TrendingDown,
  Clock as ClockIcon,
  MailCheck,
  UserPlus,
  ShieldAlert,
  Hourglass,
  CalendarClock,
  UserCog,
  CheckSquare,
  Ban,
  ThumbsUp,
  ThumbsDown,
  UserCheck as UserCheckIcon,
  Shield,
  Clock4,
  CalendarCheck,
  FileText,
  AlertTriangle,
  UserCircle,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Calendar as CalendarIcon
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

// Registration Status Badge
const RegistrationStatusBadge = ({ status }) => {
  const getVariant = () => {
    switch(status) {
      case 'email_verification_pending': return "warning";
      case 'admin_approval_pending': return "orange";
      case 'tl_assignment_pending': return "info";
      case 'approved': return "success";
      case 'rejected': return "destructive";
      default: return "secondary";
    }
  };

  const getLabel = () => {
    switch(status) {
      case 'email_verification_pending': return 'Email Pending';
      case 'admin_approval_pending': return 'Admin Approval';
      case 'tl_assignment_pending': return 'TL Assignment';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return status || 'Unknown';
    }
  };

  return (
    <Badge variant={getVariant()} className="min-w-[120px] justify-center">
      {getLabel()}
    </Badge>
  );
};

// Approve/Reject Buttons Component
const ApprovalButtons = ({ user, onApprove, onReject, loading = false }) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="success"
        size="sm"
        onClick={() => onApprove(user._id)}
        disabled={loading}
        className="min-w-[80px]"
      >
        {loading ? (
          <RefreshCw className="w-3 h-3 animate-spin mr-1" />
        ) : (
          <Check className="w-3 h-3 mr-1" />
        )}
        Approve
      </Button>
      
      <Button
        variant="destructive"
        size="sm"
        onClick={() => onReject(user._id)}
        disabled={loading}
        className="min-w-[80px]"
      >
        {loading ? (
          <RefreshCw className="w-3 h-3 animate-spin mr-1" />
        ) : (
          <X className="w-3 h-3 mr-1" />
        )}
        Reject
      </Button>
    </div>
  );
};

// TL Assignment Component for Pending Users
const TLPendingAssignment = ({ user, teamLeaders, onAssignTL, loading = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTL, setSelectedTL] = useState('');
  const [notes, setNotes] = useState('');
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

  const handleAssignTL = async () => {
    if (!selectedTL) {
      alert('Please select a Team Leader');
      return;
    }

    const tl = teamLeaders.find(t => t._id === selectedTL);
    if (tl) {
      await onAssignTL(user._id, tl._id, tl.name, notes);
      setIsOpen(false);
      setSelectedTL('');
      setNotes('');
    }
  };

  const currentTLName = user.reportingTo?.name || 'Not Assigned';

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant={user.registrationStatus === 'tl_assignment_pending' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading || teamLeaders.length === 0}
        className="min-w-[140px]"
      >
        {user.registrationStatus === 'tl_assignment_pending' ? 'Assign TL' : currentTLName}
        <ChevronDown className="w-3 h-3 ml-1" />
      </Button>

      {isOpen && (
        <div className="absolute left-0 top-10 z-50 w-64 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
          <div className="p-3 space-y-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Select Team Leader</label>
              <Select
                value={selectedTL}
                onValueChange={setSelectedTL}
                className="w-full"
              >
                <SelectItem value="">Select TL</SelectItem>
                {teamLeaders.map((tl) => (
                  <SelectItem key={tl._id} value={tl._id}>
                    {tl.name} ({tl.teamMembers?.length || 0} members)
                  </SelectItem>
                ))}
              </Select>
            </div>
            
            <div>
              <label className="text-xs font-medium mb-1 block">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-16 p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                placeholder="Add notes about this assignment..."
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAssignTL}
                disabled={!selectedTL || loading}
                className="flex-1"
              >
                {loading ? (
                  <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <Check className="w-3 h-3 mr-1" />
                )}
                Assign
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="flex-1"
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
const ActionMenu = ({ user, onViewDetails, onDelete, loading = false }) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onViewDetails}
        disabled={loading}
        title="View Details"
      >
        <Eye className="w-4 h-4" />
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

export default function NotApprovedUsers() {
  const [users, setUsers] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [filters, setFilters] = useState({
    search: '',
    registrationStatus: 'all',
    page: 1,
    limit: 20
  });

  const [sort, setSort] = useState({
    key: 'createdAt',
    direction: 'desc'
  });

  // Enhance user data with calculated fields
  const enhanceUserData = (user) => {
    const joinDate = new Date(user.createdAt).toLocaleDateString('en-IN');
    const registrationDate = new Date(user.createdAt).toLocaleString('en-IN');
    const emailVerified = user.emailVerified ? 'Yes' : 'No';
    const emailVerifiedDate = user.emailVerifiedAt ? 
      new Date(user.emailVerifiedAt).toLocaleDateString('en-IN') : '-';

    return {
      ...user,
      joinDate,
      registrationDate,
      emailVerified,
      emailVerifiedDate,
      waitingSince: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) + ' days'
    };
  };

  // Fetch not approved users (pending_approval status)
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
        ...(filters.registrationStatus !== 'all' && { registrationStatus: filters.registrationStatus })
      };

      const response = await userService.getNotApprovedUsers(params);
      
      if (response.success) {
        const enhancedUsers = response.data.users.map(enhanceUserData);
        setUsers(enhancedUsers);
      } else {
        setError(response.message || 'Failed to fetch pending users');
      }
    } catch (err) {
      console.error('Error fetching pending users:', err);
      setError(err.message || 'Failed to fetch pending users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Team Leaders for TL assignment dropdown
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

  // Approve User (Admin approval)
  const approveUser = async (userId) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      const response = await userService.approveUser(userId, { notes: 'Approved by admin' });
      
      if (response.success) {
        setSuccess('User approved successfully! User is now pending TL assignment.');
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

  // Reject User
  const rejectUser = async (userId) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;
    
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      const response = await userService.rejectUser(userId, { reason });
      
      if (response.success) {
        setSuccess('User rejected successfully');
        await fetchNotApprovedUsers();
      } else {
        setError(response.message || 'Failed to reject user');
      }
    } catch (err) {
      console.error('Error rejecting user:', err);
      setError(err.message || 'Failed to reject user');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Assign TL to user (for tl_assignment_pending users)
  const assignTL = async (userId, tlId, tlName, notes = '') => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      const response = await userService.assignUserToTL(userId, { 
        tlId, 
        tlName,
        notes 
      });
      
      if (response.success) {
        setSuccess(`User assigned to TL ${tlName} successfully! User is now active.`);
        await fetchNotApprovedUsers();
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

  // View user details
  const viewUserDetails = (user) => {
    console.log('View user details:', user);
    // You can implement modal or navigate to user details page
    alert(`Viewing details for: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phoneNumber}\nStatus: ${user.registrationStatus}`);
  };

  // Export not approved users
  const exportNotApprovedUsers = async () => {
    try {
      setLoading(true);
      const blob = await userService.exportNotApprovedUsers({
        format: 'excel',
        ...filters
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pending_users_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccess('Pending users exported successfully');
    } catch (err) {
      console.error('Error exporting pending users:', err);
      setError(err.message || 'Failed to export pending users');
    } finally {
      setLoading(false);
    }
  };

  // Bulk approve users
  const bulkApproveUsers = async () => {
    if (users.length === 0) {
      setError('No users to approve');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to approve ${users.length} users?`)) return;
    
    try {
      setLoading(true);
      const userIds = users.map(user => user._id);
      const response = await userService.bulkApproveUsers({ userIds });
      
      if (response.success) {
        setSuccess(`Successfully approved ${response.data?.approvedCount || 0} users`);
        await fetchNotApprovedUsers();
      } else {
        setError(response.message || 'Failed to bulk approve users');
      }
    } catch (err) {
      console.error('Error bulk approving users:', err);
      setError(err.message || 'Failed to bulk approve users');
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchNotApprovedUsers();
    fetchTeamLeaders();
  }, [filters.page, filters.limit, filters.registrationStatus, sort]);

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

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-yellow-600" />
            Pending Approval Users
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review and approve user registrations. Assign TLs to complete activation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Pending Count Badge */}
          <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <Hourglass className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
              {users.length} Pending Approval
            </span>
          </div>
          
          {/* Bulk Approve */}
          <Button
            variant="success"
            size="sm"
            onClick={bulkApproveUsers}
            disabled={loading || users.length === 0}
          >
            <Check className="w-4 h-4 mr-2" />
            Bulk Approve
          </Button>
          
          {/* Export */}
          <Button
            variant="outline"
            size="sm"
            onClick={exportNotApprovedUsers}
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

      {/* Registration Flow Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
                Registration Approval Flow
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
                <Badge variant="warning">1. Email Verification</Badge>
                <ChevronRight className="w-4 h-4" />
                <Badge variant="orange">2. Admin Approval</Badge>
                <ChevronRight className="w-4 h-4" />
                <Badge variant="info">3. TL Assignment</Badge>
                <ChevronRight className="w-4 h-4" />
                <Badge variant="success">4. Active User</Badge>
              </div>
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-400">
              Total Pending Users: <span className="font-bold">{users.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search pending users by name, email, phone..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-9"
                disabled={loading}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select 
                value={filters.registrationStatus} 
                onValueChange={(value) => handleFilterChange('registrationStatus', value)}
                placeholder="Registration Status"
                className="w-full sm:w-[180px]"
                disabled={loading}
              >
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="email_verification_pending">Email Pending</SelectItem>
                <SelectItem value="admin_approval_pending">Admin Approval</SelectItem>
                <SelectItem value="tl_assignment_pending">TL Assignment</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-yellow-600" />
            Pending Approval Users List
            {users.length > 0 && (
              <Badge variant="warning" className="ml-2">
                {users.length} pending users
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
                      <CalendarClock className="w-4 h-4 inline mr-1" />
                      Registered On
                    </TableHead>
                    <TableHead>
                      <UserCog className="w-4 h-4 inline mr-1" />
                      Registration Status
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="name" currentSort={sort}>
                      <UserCircle className="w-4 h-4 inline mr-1" />
                      Name
                    </TableHead>
                    <TableHead>
                      <PhoneIcon className="w-4 h-4 inline mr-1" />
                      Phone Number
                    </TableHead>
                    <TableHead>
                      <MailIcon className="w-4 h-4 inline mr-1" />
                      Email ID
                    </TableHead>
                    <TableHead>
                      <Shield className="w-4 h-4 inline mr-1" />
                      Email Verified
                    </TableHead>
                    <TableHead>
                      <Clock4 className="w-4 h-4 inline mr-1" />
                      Waiting Since
                    </TableHead>
                    <TableHead>
                      <UserCheckIcon className="w-4 h-4 inline mr-1" />
                      Approve/Reject
                    </TableHead>
                    <TableHead>
                      <CalendarCheck className="w-4 h-4 inline mr-1" />
                      TL Assignment
                    </TableHead>
                    <TableHead>
                      <AlertTriangle className="w-4 h-4 inline mr-1" />
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center">
                          <RefreshCw className="w-10 h-10 animate-spin text-yellow-600 mb-4" />
                          <span className="text-lg">Loading pending users...</span>
                          <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the data</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-12 text-gray-500">
                        <Hourglass className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-xl font-medium">No pending approval users</p>
                        <p className="text-sm mt-2">
                          {(filters.search || filters.registrationStatus !== 'all') 
                            ? 'Try adjusting your search filters' 
                            : 'All users have been approved or no pending registrations'}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user._id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-gray-500" />
                            <div>
                              <span className="text-sm">{user.joinDate}</span>
                              <p className="text-xs text-gray-500">{user.registrationDate.split(',')[1]}</p>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <RegistrationStatusBadge status={user.registrationStatus} />
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                              <User className="w-4 h-4 text-yellow-600 dark:text-yellow-300" />
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
                          <div className="flex items-center gap-2 min-w-[200px]">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="text-sm truncate">{user.email}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-center">
                            <Badge variant={user.emailVerified === 'Yes' ? 'success' : 'warning'}>
                              {user.emailVerified}
                            </Badge>
                            {user.emailVerifiedDate !== '-' && (
                              <p className="text-xs text-gray-500 mt-1">{user.emailVerifiedDate}</p>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-center">
                            <span className="font-medium">{user.waitingSince}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          {user.registrationStatus === 'admin_approval_pending' ? (
                            <ApprovalButtons 
                              user={user}
                              onApprove={approveUser}
                              onReject={rejectUser}
                              loading={actionLoading[user._id]}
                            />
                          ) : user.registrationStatus === 'rejected' ? (
                            <Badge variant="destructive" className="min-w-[120px] justify-center">
                              Rejected
                            </Badge>
                          ) : (
                            <span className="text-sm text-gray-500">-</span>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          {user.registrationStatus === 'tl_assignment_pending' ? (
                            <TLPendingAssignment 
                              user={user}
                              teamLeaders={teamLeaders}
                              onAssignTL={assignTL}
                              loading={actionLoading[user._id]}
                            />
                          ) : user.registrationStatus === 'approved' ? (
                            <Badge variant="success" className="min-w-[120px] justify-center">
                              TL Assigned
                            </Badge>
                          ) : (
                            <span className="text-sm text-gray-500">-</span>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <ActionMenu
                            user={user}
                            onViewDetails={() => viewUserDetails(user)}
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
            Showing {users.length} pending approval users
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

      {/* Quick Stats */}
      {users.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Email Pending</p>
                  <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                    {users.filter(u => u.registrationStatus === 'email_verification_pending').length}
                  </p>
                </div>
                <MailCheck className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Admin Approval</p>
                  <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                    {users.filter(u => u.registrationStatus === 'admin_approval_pending').length}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">TL Assignment</p>
                  <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                    {users.filter(u => u.registrationStatus === 'tl_assignment_pending').length}
                  </p>
                </div>
                <UserCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">Rejected</p>
                  <p className="text-2xl font-bold text-red-800 dark:text-red-200">
                    {users.filter(u => u.registrationStatus === 'rejected').length}
                  </p>
                </div>
                <Ban className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}