import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import userService from '../../services/userService';
import toast, { Toaster } from 'react-hot-toast';
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
  TrendingDown,
  Clock4,
  CalendarCheck,
  FileText,
  AlertTriangle,
  UserCircle,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Calendar as CalendarIcon,
  PhoneForwarded,
  PhoneOff,
  PhoneMissed,
  Clock as ClockIcon,
  CalendarClock,
  UserCheck as UserCheckIcon,
  Shield as ShieldIcon
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

// Role Change Component - Only for users (can change to TL)
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

  // Only show role change dropdown for users (not TL or admin)
  if (user.role !== 'user') {
    return (
      <Badge variant="secondary" className="min-w-[80px] justify-center">
        {user.role === 'TL' ? 'TL' : user.role === 'admin' ? 'Admin' : user.role}
      </Badge>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="default"
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
            <button
              onClick={() => handleRoleChange('TL')}
              disabled={loading}
              className="flex items-center w-full px-3 py-2 text-sm text-left text-purple-600 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/20 disabled:opacity-50"
            >
              TL
            </button>
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
      default: return "secondary";
    }
  };

  const getLabel = () => {
    switch(user.status) {
      case 'active': return 'Active';
      case 'hold': return 'Hold';
      case 'dead': return 'Dead';
      default: return 'Active'; // Default to Active if status is not one of the three
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
          </div>
        </div>
      )}
    </div>
  );
};

// Attendance Component
const AttendanceBadge = ({ user }) => {
  // Get today's attendance status - check if marked today
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const todayMarkedAt = user.attendance?.todayMarkedAt ? new Date(user.attendance.todayMarkedAt) : null;
  const isMarkedToday = todayMarkedAt && todayMarkedAt >= todayDate;
  
  // Get the status - if marked today, use todayStatus, otherwise default to absent
  const attendanceStatus = isMarkedToday ? (user.attendance?.todayStatus || 'absent') : 'absent';
  
  const getVariant = () => {
    switch(attendanceStatus) {
      case 'present': return "success";
      case 'absent': return "destructive";
      case 'late': return "success"; // Show late as present (success)
      case 'half-day': return "success"; // Show half-day as present (success)
      default: return "destructive"; // Default to absent (destructive)
    }
  };

  const getLabel = () => {
    switch(attendanceStatus) {
      case 'present': return 'Present';
      case 'absent': return 'Absent';
      case 'late': return 'Present'; // Show late as present
      case 'half-day': return 'Present'; // Show half-day as present
      default: return 'Absent'; // Default to Absent if not marked
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

  const currentTLName = user.reportingTo?.name || user.tlName || 'Not Assigned';

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

// Delete/Block Modal Component
const DeleteBlockModal = ({ user, isOpen, onClose, onConfirm, loading = false }) => {
  const [actionType, setActionType] = useState('block'); // 'block' or 'delete'
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActionType('block');
      setReason('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason');
      return;
    }
    onConfirm(actionType, reason);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {actionType === 'block' ? 'Block User' : 'Delete User Permanently'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            User: <span className="font-medium">{user?.name || 'Unknown'}</span>
          </p>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Action Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="block"
                  checked={actionType === 'block'}
                  onChange={(e) => setActionType(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">Block User</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="delete"
                  checked={actionType === 'delete'}
                  onChange={(e) => setActionType(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">Delete Permanently</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for blocking or deleting this user..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
              disabled={loading}
            />
          </div>

          {actionType === 'delete' && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-700 dark:text-red-300">
                <strong>Warning:</strong> This action cannot be undone. All user data will be permanently deleted.
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !reason.trim()}
            className={`px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
              actionType === 'delete' 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {loading ? 'Processing...' : actionType === 'delete' ? 'Delete Permanently' : 'Block User'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Action Menu Component
const ActionMenu = ({ onEdit, onDelete, loading = false }) => {
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
        title="Delete/Block User"
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
    role: 'user',
    page: 1,
    limit: 20
  });

  const [sort, setSort] = useState({
    key: 'createdAt',
    direction: 'desc'
  });

  // Search debounce
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Enhance user data with calculated fields - UPDATED
  const enhanceUserData = (user) => {
    // Calculate lead statistics
    const totalLeads = user.statistics?.totalLeads || 0;
    const completedLeads = user.statistics?.completedLeads || 0;
    const pendingLeads = user.statistics?.pendingLeads || 0;
    const rejectedLeads = user.statistics?.rejectedLeads || 0;
    
    const conversionRate = totalLeads > 0 ? (completedLeads / totalLeads * 100) : 0;
    
    // Calculate today's date string for dailyStats lookup
    const todayDateStr = new Date().toISOString().split('T')[0];
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    
    // Attendance - Only show present/absent
    // Check if attendance was marked today
    const todayMarkedAt = user.attendance?.todayMarkedAt ? new Date(user.attendance.todayMarkedAt) : null;
    const isMarkedToday = todayMarkedAt && todayMarkedAt >= todayDate;
    
    // Get the status - if marked today, use todayStatus, otherwise default to absent
    const attendanceStatus = isMarkedToday ? (user.attendance?.todayStatus || 'absent') : 'absent';
    const totalPresent = user.attendance?.totalPresent || user.attendance?.monthlyStats?.present || 0;
    
    // Rollback data (withdrawal data) - Updated to handle both array and object format
    const rollbackData = user.rollback?.total || (Array.isArray(user.rollback?.data) ? user.rollback.data.length : 0);
    const rollbackDate = user.rollback?.lastDate ? 
      new Date(user.rollback.lastDate).toLocaleDateString('en-IN') : '-';
    
    // Last Data - Show last assigned data numbers (count of last assigned data)
    // Check multiple possible locations for lastDataCount
    const lastDataCount = user.lastAssignedDataCount || 
                         user.leadDistribution?.lastDataCount || 
                         user.leadDistribution?.lastAssignedDataCount ||
                         user.statistics?.lastAssignedCount || 
                         0;
    const lastData = lastDataCount > 0 ? lastDataCount.toString() : '-';
    
    // Date Assigned - Last data assignment date
    // Check multiple possible locations for lastAssignedDate
    const lastAssignedDateRaw = user.lastAssignedDate || 
                               user.leadDistribution?.lastAssignedDate ||
                               user.leadDistribution?.lastLeadDistributionDate;
    const dateAssigned = lastAssignedDateRaw ? 
      new Date(lastAssignedDateRaw).toLocaleDateString('en-IN') : '-';
    
    // TL info - Get from reportingTo (now populated from backend)
    const tlName = user.reportingTo?.name || 
                   user.tlDetails?.managedBy?.name || 
                   user.tlName || 
                   '-';
    
    const manageTL = user.reportingTo?.name || user.tlDetails?.managedBy?.name || '-';

    // Calculate today's stats - Updated to use dailyStats from backend
    // Check dailyStats first, then fallback to direct properties, then 0
    // Try multiple date formats to ensure we get the data
    const todayCalled = user.dailyStats?.[todayDateStr]?.called ?? 
                       user.dailyStats?.[new Date().toISOString().split('T')[0]]?.called ??
                       user.todayCalled ?? 
                       0;
    const todayClosed = user.dailyStats?.[todayDateStr]?.closed ?? 
                       user.dailyStats?.[new Date().toISOString().split('T')[0]]?.closed ??
                       user.todayClosed ?? 
                       0;
    
    // Open Data - Total data not closed or converted from all user data since registration
    // Formula: totalLeads - completedLeads (converted) = open data
    const openData = totalLeads - completedLeads; // All data minus converted = open data

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
      lastData, // Now shows count instead of date
      dateAssigned,
      tlName,
      manageTL,
      openData, // Renamed from openLeads to openData
      openLeads: pendingLeads + rejectedLeads, // Keep for backward compatibility
      salary: user.financials?.salary || user.wallet?.balance || user.currentBalance || '-',
      joinDate: new Date(user.createdAt).toLocaleDateString('en-IN'),
      canReceiveLeads: user.status === 'active' && attendanceStatus === 'present',
      todayCalled,
      todayClosed,
      // Add performance metrics
      performance: {
        calledToday: todayCalled,
        closedToday: todayClosed,
        conversionRate: conversionRate
      }
    };
  };

  // Fetch all users
  const fetchUsers = useCallback(async () => {
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
        const errorMsg = response.message || 'Failed to fetch users';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      const errorMsg = err.message || 'Failed to fetch users';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [filters.page, filters.limit, filters.status, filters.role, filters.search, sort]);

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

  // Handle search with debounce
  const handleSearch = (value) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    setSearchTimeout(setTimeout(() => {
      setFilters(prev => ({ ...prev, search: value, page: 1 }));
    }, 300));
  };

  // Change user role - Updated to remove from previous TL when changed to TL
  const changeUserRole = async (userId, newRole) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      
      // Find the user to get their current TL
      const currentUser = users.find(u => u._id === userId);
      const previousTLId = currentUser?.reportingTo?._id || currentUser?.reportingTo;
      
      // Change the role
      const response = await userService.changeUserRole(userId, { newRole });
      
      if (response.success) {
        // If changing to TL, remove from previous TL
        if (newRole === 'TL' && previousTLId) {
          try {
            await userService.updateUser(userId, {
              reportingTo: null // Remove from previous TL
            });
            toast.success('User removed from previous TL');
          } catch (tlErr) {
            console.warn('Failed to remove from previous TL:', tlErr);
            // Don't fail the role change if TL removal fails
          }
        }
        
        const successMsg = `User role changed to ${newRole} successfully`;
        setSuccess(successMsg);
        toast.success(`✅ ${successMsg}`);
        await fetchUsers();
      } else {
        const errorMsg = response.message || 'Failed to change user role';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Error changing user role:', err);
      const errorMsg = err.message || 'Failed to change user role';
      setError(errorMsg);
      toast.error(errorMsg);
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
      }
      
      if (response?.success) {
        const successMsg = `User status changed to ${newStatus} successfully`;
        setSuccess(successMsg);
        toast.success(`✅ ${successMsg}`);
        await fetchUsers();
      } else {
        const errorMsg = response?.message || 'Failed to change user status';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Error changing user status:', err);
      const errorMsg = err.message || 'Failed to change user status';
      setError(errorMsg);
      toast.error(errorMsg);
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
        const successMsg = `TL assigned successfully`;
        setSuccess(successMsg);
        toast.success(`✅ ${successMsg}`);
        await fetchUsers();
      } else {
        const errorMsg = response.message || 'Failed to assign TL';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Error assigning TL:', err);
      const errorMsg = err.message || 'Failed to assign TL';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Handle withdrawal - kept for OpenLeadsWithrow component (currently not used in table)
  // Uncomment if OpenLeadsWithrow component is used in the table
  /*
  const handleWithrow = async (userId, amount) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      const response = await userService.processWithdrawal(userId, { amount });
      
      if (response.success) {
        const successMsg = `Withrow of ₹${amount} processed successfully`;
        setSuccess(successMsg);
        toast.success(`✅ ${successMsg}`);
        await fetchUsers();
      } else {
        const errorMsg = response.message || 'Failed to process withrow';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Error processing withrow:', err);
      const errorMsg = err.message || 'Failed to process withrow';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };
  */

  // Delete/Block user with reason
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState(null);

  const handleDeleteClick = (user) => {
    setSelectedUserForDelete(user);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async (actionType, reason) => {
    if (!selectedUserForDelete) return;
    
    const userId = selectedUserForDelete._id;
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    
    try {
      let response;
      
      if (actionType === 'block') {
        // Block the user with reason
        response = await userService.blockUser(userId, { reason });
      } else {
        // Delete permanently - try to pass reason if API supports it
        try {
          // Try with reason first (if backend supports it)
          response = await userService.deleteUser(userId);
          // If backend doesn't support reason in delete, we'll still proceed
          // The reason is logged for admin reference
          console.log(`Deleting user ${userId} with reason: ${reason}`);
        } catch {
          // If delete fails, try without reason
          response = await userService.deleteUser(userId);
        }
      }
      
      if (response && response.success) {
        const successMsg = actionType === 'block' 
          ? `User blocked successfully. Reason: ${reason}` 
          : `User deleted permanently. Reason: ${reason}`;
        setSuccess(successMsg);
        toast.success(`✅ ${actionType === 'block' ? 'User blocked' : 'User deleted'} successfully`);
        setDeleteModalOpen(false);
        setSelectedUserForDelete(null);
        await fetchUsers();
      } else {
        const errorMsg = response?.message || `Failed to ${actionType} user`;
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error(`Error ${actionType}ing user:`, err);
      const errorMsg = err.message || `Failed to ${actionType} user`;
      setError(errorMsg);
      toast.error(errorMsg);
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
      
      const successMsg = 'Users exported successfully';
      setSuccess(successMsg);
      toast.success(`✅ ${successMsg}`);
    } catch (err) {
      console.error('Error exporting users:', err);
      const errorMsg = err.message || 'Failed to export users';
      setError(errorMsg);
      toast.error(errorMsg);
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
        const successMsg = `${response.data?.processed || 0} users uploaded successfully`;
        setSuccess(successMsg);
        toast.success(`✅ ${successMsg}`);
        await fetchUsers();
      } else {
        const errorMsg = response.message || 'Failed to upload users';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Error uploading users:', err);
      const errorMsg = err.message || 'Failed to upload users';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchUsers();
    fetchTeamLeaders();
  }, [filters.page, filters.limit, filters.status, filters.role, sort, fetchUsers]);

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

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString || dateString === '-') return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Get performance color
  const getPerformanceColor = (value, type) => {
    if (type === 'conversion') {
      if (value >= 70) return 'text-green-600';
      if (value >= 50) return 'text-yellow-600';
      return 'text-red-600';
    }
    if (value > 0) return 'text-green-600';
    return 'text-gray-600';
  };

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
            <UserCheck className="w-8 h-8 text-green-600" />
            Approved Users
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all approved users with detailed information and actions
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
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
                disabled={loading}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select 
                value={filters.status} 
                onValueChange={(value) => handleFilterChange('status', value)}
                placeholder="Status"
                className="w-full sm:w-[150px]"
                disabled={loading}
              >
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="hold">Hold</SelectItem>
                <SelectItem value="dead">Dead</SelectItem>
              </Select>

              <Select 
                value={filters.role === 'user' ? 'all' : filters.role} 
                onValueChange={(value) => handleFilterChange('role', value)}
                placeholder="Role"
                className="w-full sm:w-[150px]"
                disabled={loading}
              >
                {/* <SelectItem value="all">All Roles</SelectItem> */}
                <SelectItem value="user">User</SelectItem>
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
            Approved Users List
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
                      <CalendarClock className="w-4 h-4 inline mr-1" />
                      Joined On
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="role" currentSort={sort}>
                      <ShieldIcon className="w-4 h-4 inline mr-1" />
                      Role
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="name" currentSort={sort}>
                      <UserCircle className="w-4 h-4 inline mr-1" />
                      Name
                    </TableHead>
                    <TableHead>
                      <PhoneIcon className="w-4 h-4 inline mr-1" />
                      Phone Number
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="status" currentSort={sort}>
                      <UserCheckIcon className="w-4 h-4 inline mr-1" />
                      Status
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="attendance.todayStatus" currentSort={sort}>
                      <CalendarCheck className="w-4 h-4 inline mr-1" />
                      Attendance
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="rollbackData" currentSort={sort}>
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      RollBack Data
                    </TableHead>
                    <TableHead>
                      <CalendarDays className="w-4 h-4 inline mr-1" />
                      RollBack Date
                    </TableHead>
                    <TableHead>
                      <UserCheck className="w-4 h-4 inline mr-1" />
                      TL Name
                    </TableHead>
                    <TableHead>
                      <User className="w-4 h-4 inline mr-1" />
                      Manage TL
                    </TableHead>
                    <TableHead>
                      <FileText className="w-4 h-4 inline mr-1" />
                      Last Data
                    </TableHead>
                    <TableHead>
                      <CalendarIcon className="w-4 h-4 inline mr-1" />
                      Date Assigned
                    </TableHead>
                    <TableHead>
                      <PhoneCall className="w-4 h-4 inline mr-1" />
                      Today Called
                    </TableHead>
                    <TableHead>
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Today Closed
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="totalPresent" currentSort={sort}>
                      <Clock4 className="w-4 h-4 inline mr-1" />
                      Total Present
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="salary" currentSort={sort}>
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Salary
                    </TableHead>
                    <TableHead>
                      <MailIcon className="w-4 h-4 inline mr-1" />
                      Email Id
                    </TableHead>
                    <TableHead>
                      <FileText className="w-4 h-4 inline mr-1" />
                      Open Data
                    </TableHead>
                    <TableHead>
                      <Settings className="w-4 h-4 inline mr-1" />
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
                        {/* Joined On */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{user.joinDate}</span>
                          </div>
                        </TableCell>
                        
                        {/* Role */}
                        <TableCell>
                          <RoleChangeButton 
                            user={user}
                            onChangeRole={changeUserRole}
                            loading={actionLoading[user._id]}
                          />
                        </TableCell>
                        
                        {/* Name */}
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
                        
                        {/* Phone Number */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="font-mono text-sm">{user.phoneNumber}</span>
                          </div>
                        </TableCell>
                        
                        {/* Status */}
                        <TableCell>
                          <StatusChangeButton 
                            user={user}
                            onChangeStatus={changeUserStatus}
                            loading={actionLoading[user._id]}
                          />
                        </TableCell>
                        
                        {/* Attendance */}
                        <TableCell>
                          <AttendanceBadge user={user} />
                        </TableCell>
                        
                        {/* RollBack Data (Withdrawal Data) */}
                        <TableCell>
                          <div className="text-center">
                            {user.rollbackData > 0 ? (
                              <Badge variant="destructive">{user.rollbackData}</Badge>
                            ) : (
                              <span className="text-gray-500">0</span>
                            )}
                          </div>
                        </TableCell>
                        
                        {/* RollBack Date */}
                        <TableCell>
                          <span className="text-sm">{formatDate(user.rollbackDate)}</span>
                        </TableCell>
                        
                        {/* TL Name - FIXED */}
                        <TableCell>
                          <span className="text-sm font-medium">{user.tlName || '-'}</span>
                        </TableCell>
                        
                        {/* Manage TL */}
                        <TableCell>
                          <TLChangeButton 
                            user={user}
                            teamLeaders={teamLeaders}
                            onChangeTL={changeUserTL}
                            loading={actionLoading[user._id]}
                          />
                        </TableCell>
                        
                        {/* Last Data - Show count of last assigned data */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium">{user.lastData}</span>
                          </div>
                        </TableCell>
                        
                        {/* Date Assigned */}
                        <TableCell>
                          <span className="text-sm">{formatDate(user.dateAssigned)}</span>
                        </TableCell>
                        
                        {/* Today Called */}
                        <TableCell>
                          <div className="text-center">
                            <div className="flex flex-col items-center">
                              <span className={`font-medium ${getPerformanceColor(user.todayCalled || 0, 'count')}`}>
                                {user.todayCalled ?? 0}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        
                        {/* Today Closed */}
                        <TableCell>
                          <div className="text-center">
                            <div className="flex flex-col items-center">
                              <span className={`font-medium ${getPerformanceColor(user.todayClosed || 0, 'count')}`}>
                                {user.todayClosed ?? 0}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        
                        {/* Total Present (till now from attendance history) */}
                        <TableCell>
                          <div className="text-center">
                            <span className="font-bold">{user.totalPresent}</span>
                            <div className="text-xs text-gray-500">
                              <Clock className="w-3 h-3 inline mr-1" />
                              Days
                            </div>
                          </div>
                        </TableCell>
                        
                        {/* Salary */}
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
                        
                        {/* Email Id */}
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[200px]">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="text-sm truncate">{user.email}</span>
                          </div>
                        </TableCell>
                        
                        {/* Open Data - Total data not closed or converted */}
                        <TableCell>
                          <div className="text-center">
                            <Badge variant={user.openData > 0 ? 'warning' : 'success'}>
                              {user.openData || 0}
                            </Badge>
                          </div>
                        </TableCell>
                        
                        {/* Action */}
                        <TableCell>
                          <ActionMenu
                            onEdit={() => editUser(user)}
                            onDelete={() => handleDeleteClick(user)}
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
            Showing {users.length} approved users
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

      {/* Quick Stats Card */}
      {users.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Active Users</p>
                  <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                    {users.filter(u => u.status === 'active').length}
                  </p>
                </div>
                <UserCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Total Called Today</p>
                  <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                    {users.reduce((sum, user) => sum + (user.todayCalled || 0), 0)}
                  </p>
                </div>
                <PhoneCall className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Total Closed Today</p>
                  <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                    {users.reduce((sum, user) => sum + (user.todayClosed || 0), 0)}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Open Data</p>
                  <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                    {users.reduce((sum, user) => sum + (user.openData || 0), 0)}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete/Block Modal */}
      <DeleteBlockModal
        user={selectedUserForDelete}
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedUserForDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        loading={selectedUserForDelete ? actionLoading[selectedUserForDelete._id] : false}
      />
    </div>
  );
}