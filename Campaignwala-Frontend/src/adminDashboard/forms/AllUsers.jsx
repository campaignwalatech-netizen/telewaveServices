import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import userService from '../../services/userService';
import { 
  Search, 
  Users, 
  Eye, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Mail, 
  Phone,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Filter,
  Download,
  Upload,
  MoreVertical,
  Ban,
  UserX,
  Calendar,
  Briefcase,
  MapPin,
  CreditCard,
  FileText,
  Shield,
  Activity,
  Target,
  TrendingUp,
  Clock,
  User,
  Home,
  Building,
  Globe,
  PhoneCall,
  Smartphone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Award,
  BarChart3,
  Wallet,
  Banknote,
  Check,
  X,
  Pause,
  Play,
  ShieldAlert,
  UserCheck,
  UserMinus,
  Users as UsersIcon,
  FileSpreadsheet,
  Settings,
  Key,
  Star
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
  <thead className="bg-muted/50 sticky top-0 z-10">{children}</thead>
);

const TableRow = ({ children, className = '' }) => (
  <tr className={`border-b transition-colors hover:bg-muted/50 ${className}`}>{children}</tr>
);

const TableHead = ({ children, className = '', sortable = false, onSort, sortKey, currentSort = { key: '', direction: 'asc' } }) => {
  const isActive = sortKey === currentSort.key;
  const isAsc = currentSort.direction === 'asc';
  
  return (
    <th 
      className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap ${className} ${
        sortable ? 'cursor-pointer hover:bg-muted/70 transition-colors' : ''
      }`}
      onClick={sortable ? () => onSort(sortKey) : undefined}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortable && (
          <div className="flex flex-col">
            <ChevronUp 
              className={`w-3 h-3 -mb-1 ${
                isActive && isAsc ? 'text-primary' : 'text-muted-foreground/50'
              }`} 
            />
            <ChevronDown 
              className={`w-3 h-3 -mt-1 ${
                isActive && !isAsc ? 'text-primary' : 'text-muted-foreground/50'
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
  const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
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
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

// Simplified Select component without nested divs
const Select = ({ value, onValueChange, children, className = '', placeholder = "Select..." }) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
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
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    outline: 'text-foreground border',
    success: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300',
    info: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300',
    purple: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300',
    orange: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-300'
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Card = ({ children, className = '' }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
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

// Status Toggle Button Component
const StatusToggleButton = ({ user, onToggle, loading = false }) => {
  if (user.isEx) {
    return (
      <Badge variant="destructive" className="cursor-not-allowed">
        Ex User
      </Badge>
    );
  }

  const getVariant = () => {
    switch(user.status) {
      case 'active': return "success";
      case 'inactive': return "warning";
      case 'hold': return "orange";
      case 'blocked': return "destructive";
      case 'pending_approval': return "warning";
      default: return "secondary";
    }
  };

  const getLabel = () => {
    switch(user.status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'hold': return 'On Hold';
      case 'blocked': return 'Blocked';
      case 'pending_approval': return 'Pending';
      default: return user.status || 'Unknown';
    }
  };

  return (
    <Button
      variant={getVariant()}
      size="sm"
      onClick={onToggle}
      disabled={loading}
      className="min-w-[100px]"
    >
      {loading ? (
        <RefreshCw className="w-3 h-3 animate-spin mr-1" />
      ) : null}
      {getLabel()}
    </Button>
  );
};

// Enhanced Status Management Modal
const StatusManagementModal = ({ user, onClose, onAction }) => {
  const [actionType, setActionType] = useState('');
  const [reason, setReason] = useState('');
  const [holdUntil, setHoldUntil] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (!actionType) {
      alert('Please select an action');
      return;
    }

    setLoading(true);
    try {
      let data = {};
      
      if (actionType === 'hold') {
        if (!holdUntil) {
          alert('Please select hold until date');
          setLoading(false);
          return;
        }
        data = { reason, holdUntil: new Date(holdUntil).toISOString() };
      } else if (actionType === 'block') {
        if (!reason.trim()) {
          alert('Please provide a reason for blocking');
          setLoading(false);
          return;
        }
        data = { reason };
      } else if (actionType === 'active') {
        data = { reason };
      }

      await onAction(user._id, actionType, data);
      onClose();
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Manage User Status
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <XCircle className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Current Status */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Current Status</p>
              <Badge variant={
                user.status === 'active' ? 'success' :
                user.status === 'hold' ? 'orange' :
                user.status === 'blocked' ? 'destructive' :
                user.status === 'pending_approval' ? 'warning' : 'secondary'
              }>
                {user.status?.toUpperCase()}
              </Badge>
            </div>

            {/* Action Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Select Action</label>
              <div className="grid grid-cols-2 gap-2">
                {user.status !== 'active' && (
                  <button
                    onClick={() => setActionType('active')}
                    className={`p-3 rounded-lg border flex flex-col items-center justify-center ${actionType === 'active' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200'}`}
                  >
                    <Play className="w-5 h-5 text-green-600 mb-1" />
                    <span className="text-sm font-medium">Mark Active</span>
                  </button>
                )}
                {user.status !== 'hold' && (
                  <button
                    onClick={() => setActionType('hold')}
                    className={`p-3 rounded-lg border flex flex-col items-center justify-center ${actionType === 'hold' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200'}`}
                  >
                    <Pause className="w-5 h-5 text-orange-600 mb-1" />
                    <span className="text-sm font-medium">Put on Hold</span>
                  </button>
                )}
                {user.status !== 'blocked' && (
                  <button
                    onClick={() => setActionType('block')}
                    className={`p-3 rounded-lg border flex flex-col items-center justify-center ${actionType === 'block' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200'}`}
                  >
                    <Ban className="w-5 h-5 text-red-600 mb-1" />
                    <span className="text-sm font-medium">Block User</span>
                  </button>
                )}
                {user.status === 'pending_approval' && (
                  <button
                    onClick={() => setActionType('approve')}
                    className={`p-3 rounded-lg border flex flex-col items-center justify-center ${actionType === 'approve' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200'}`}
                  >
                    <Check className="w-5 h-5 text-blue-600 mb-1" />
                    <span className="text-sm font-medium">Approve</span>
                  </button>
                )}
              </div>
            </div>

            {/* Reason Input */}
            {actionType && actionType !== 'approve' && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  {actionType === 'hold' ? 'Hold Reason (Optional)' : 'Block Reason (Required)'}
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  rows="3"
                  placeholder={actionType === 'block' ? 'Please specify the reason for blocking...' : 'Optional reason for hold...'}
                />
              </div>
            )}

            {/* Hold Until Date */}
            {actionType === 'hold' && (
              <div>
                <label className="block text-sm font-medium mb-2">Hold Until Date</label>
                <Input
                  type="date"
                  value={holdUntil}
                  onChange={(e) => setHoldUntil(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAction}
                variant={actionType === 'block' ? 'destructive' : actionType === 'approve' ? 'success' : 'default'}
                className="flex-1"
                disabled={loading || (actionType === 'block' && !reason.trim())}
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {actionType === 'approve' ? 'Approve User' : `Confirm ${actionType}`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// KYC Management Modal
const KYCManagementModal = ({ user, onClose, onAction }) => {
  const [action, setAction] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!action) {
      alert('Please select an action');
      return;
    }

    if (action === 'reject' && !reason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setLoading(true);
    try {
      await onAction(user._id, action, { remarks: reason });
      onClose();
    } catch (error) {
      console.error('KYC action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Manage KYC Status
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <XCircle className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Current KYC Status */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Current KYC Status</p>
              <Badge variant={
                user.kycDetails?.kycStatus === 'approved' ? 'success' :
                user.kycDetails?.kycStatus === 'pending' ? 'warning' :
                user.kycDetails?.kycStatus === 'rejected' ? 'destructive' : 'secondary'
              }>
                {user.kycDetails?.kycStatus?.toUpperCase() || 'NOT SUBMITTED'}
              </Badge>
              {user.kycDetails?.panNumber && (
                <p className="text-sm mt-2">PAN: {user.kycDetails.panNumber}</p>
              )}
            </div>

            {/* Action Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Select Action</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAction('approve')}
                  className={`p-3 rounded-lg border flex flex-col items-center justify-center ${action === 'approve' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200'}`}
                  disabled={user.kycDetails?.kycStatus === 'approved'}
                >
                  <CheckCircle className="w-5 h-5 text-green-600 mb-1" />
                  <span className="text-sm font-medium">Approve KYC</span>
                </button>
                <button
                  onClick={() => setAction('reject')}
                  className={`p-3 rounded-lg border flex flex-col items-center justify-center ${action === 'reject' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200'}`}
                  disabled={user.kycDetails?.kycStatus === 'rejected'}
                >
                  <XCircle className="w-5 h-5 text-red-600 mb-1" />
                  <span className="text-sm font-medium">Reject KYC</span>
                </button>
              </div>
            </div>

            {/* Reason for Rejection */}
            {action === 'reject' && (
              <div>
                <label className="block text-sm font-medium mb-2">Rejection Reason</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  rows="3"
                  placeholder="Please specify the reason for rejection..."
                  required
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                variant={action === 'reject' ? 'destructive' : 'success'}
                className="flex-1"
                disabled={loading || !action || (action === 'reject' && !reason.trim())}
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {action === 'approve' ? 'Approve KYC' : 'Reject KYC'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Role Change Modal
const RoleChangeModal = ({ user, onClose, onChangeRole }) => {
  const [newRole, setNewRole] = useState(user.role);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleChange = async () => {
    if (newRole === user.role) {
      alert('Please select a different role');
      return;
    }

    setLoading(true);
    try {
      await onChangeRole(user._id, newRole, reason);
      onClose();
    } catch (error) {
      console.error('Role change failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Change User Role
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <XCircle className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Current Role */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Current Role</p>
              <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'TL' ? 'purple' : 'default'}>
                {user.role?.toUpperCase()}
              </Badge>
            </div>

            {/* New Role Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Select New Role</label>
              <div className="grid grid-cols-3 gap-2">
                {['user', 'TL', 'admin'].map((role) => (
                  <button
                    key={role}
                    onClick={() => setNewRole(role)}
                    className={`p-3 rounded-lg border flex flex-col items-center justify-center ${newRole === role ? 'border-primary bg-primary/10' : 'border-gray-200'}`}
                  >
                    {role === 'admin' ? <ShieldAlert className="w-5 h-5 text-red-600 mb-1" /> :
                     role === 'TL' ? <UsersIcon className="w-5 h-5 text-purple-600 mb-1" /> :
                     <User className="w-5 h-5 text-blue-600 mb-1" />}
                    <span className="text-sm font-medium">{role.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reason Input */}
            <div>
              <label className="block text-sm font-medium mb-2">Reason for Change (Optional)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2 border rounded-md"
                rows="3"
                placeholder="Optional reason for role change..."
              />
            </div>

            {/* Warning for TL to User change */}
            {user.role === 'TL' && newRole === 'user' && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Changing from TL to User will remove all team members and TL permissions.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRoleChange}
                variant="default"
                className="flex-1"
                disabled={loading || newRole === user.role}
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Change Role
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// User Details Modal Component
const UserDetailsModal = ({ user, onClose, onEdit, onStatusChange, onKYCChange, onRoleChange }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <User className="w-6 h-6" />
                {user.name} - User Details
              </h2>
              <p className="text-gray-500 dark:text-gray-400">ID: {user._id}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <XCircle className="w-6 h-6" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Basic Information */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onStatusChange(user)} title="Change Status">
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onRoleChange(user)} title="Change Role">
                      <Key className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                    <p className="font-medium">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {user.phoneNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                    <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'TL' ? 'purple' : 'default'}>
                      {user.role}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                    <Badge variant={
                      user.status === 'active' ? 'success' :
                      user.status === 'hold' ? 'warning' :
                      user.status === 'blocked' ? 'destructive' :
                      user.status === 'pending_approval' ? 'orange' : 'secondary'
                    }>
                      {user.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Is Active</p>
                    <Badge variant={user.isActive ? 'success' : 'warning'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Is Ex User</p>
                    <Badge variant={user.isEx ? 'destructive' : 'success'}>
                      {user.isEx ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Account Created</p>
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(user.createdAt).toLocaleDateString()} at {new Date(user.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
                    <Badge variant="outline">{user.gender || 'Not specified'}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</p>
                    <p className="font-medium">
                      {user.dob ? new Date(user.dob).toLocaleDateString() : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Age</p>
                    <p className="font-medium">{user.age || 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Column 2: Address & Contact */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Address Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                    <p className="font-medium flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      {user.address1 || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">City</p>
                    <p className="font-medium">{user.city || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">State</p>
                    <p className="font-medium">{user.state || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ZIP Code</p>
                    <p className="font-medium">{user.zip || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Country</p>
                    <p className="font-medium flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      {user.country}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Attendance Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Attendance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Today's Status</p>
                    <Badge variant={
                      user.attendance?.todayStatus === 'present' ? 'success' :
                      user.attendance?.todayStatus === 'absent' ? 'destructive' :
                      user.attendance?.todayStatus === 'late' ? 'warning' : 'secondary'
                    }>
                      {user.attendance?.todayStatus?.toUpperCase() || 'Not marked'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Current Streak</p>
                    <p className="font-medium flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      {user.attendance?.streak || 0} days
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Stats</p>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <div className="text-center">
                        <p className="text-green-600 font-bold">{user.attendance?.monthlyStats?.present || 0}</p>
                        <p className="text-xs text-gray-500">Present</p>
                      </div>
                      <div className="text-center">
                        <p className="text-red-600 font-bold">{user.attendance?.monthlyStats?.absent || 0}</p>
                        <p className="text-xs text-gray-500">Absent</p>
                      </div>
                      <div className="text-center">
                        <p className="text-yellow-600 font-bold">{user.attendance?.monthlyStats?.late || 0}</p>
                        <p className="text-xs text-gray-500">Late</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last Marked</p>
                    <p className="font-medium">
                      {user.attendance?.lastMarkedDate ? new Date(user.attendance.lastMarkedDate).toLocaleString() : 'Never'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Can Receive Leads Today</p>
                    <Badge variant={user.canReceiveLeads ? 'success' : 'destructive'}>
                      {user.canReceiveLeads ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Column 3: Statistics & Performance */}
            <div className="space-y-4">
              {/* Lead Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Lead Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{user.statistics?.totalLeads || 0}</p>
                      <p className="text-sm text-gray-500">Total Leads</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{user.statistics?.completedLeads || 0}</p>
                      <p className="text-sm text-gray-500">Completed</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">{user.statistics?.pendingLeads || 0}</p>
                      <p className="text-sm text-gray-500">Pending</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{user.statistics?.rejectedLeads || 0}</p>
                      <p className="text-sm text-gray-500">Rejected</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Conversion Rate</p>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-600" />
                      <p className="font-bold text-green-600">{user.statistics?.conversionRate || 0}%</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Today's Leads</p>
                    <p className="font-medium">{user.statistics?.todaysLeads || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last Lead Date</p>
                    <p className="font-medium">
                      {user.statistics?.lastLeadDate ? new Date(user.statistics.lastLeadDate).toLocaleDateString() : 'No leads yet'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    Financial Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Earnings</p>
                    <p className="font-bold text-green-600 text-xl flex items-center gap-2">
                      <Banknote className="w-5 h-5" />
                      ₹{(user.statistics?.totalEarnings || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Current Balance</p>
                    <p className="font-bold text-blue-600 text-xl">₹{(user.statistics?.currentBalance || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Withdrawals</p>
                    <p className="font-bold text-purple-600">₹{(user.statistics?.totalWithdrawals || 0).toLocaleString('en-IN')}</p>
                  </div>
                </CardContent>
              </Card>

              {/* KYC Status */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    KYC Status
                  </CardTitle>
                  {user.kycDetails?.kycStatus === 'pending' && (
                    <Button variant="outline" size="sm" onClick={() => onKYCChange(user)}>
                      Manage KYC
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">KYC Status</p>
                    <Badge variant={
                      user.kycDetails?.kycStatus === 'approved' ? 'success' :
                      user.kycDetails?.kycStatus === 'pending' ? 'warning' :
                      user.kycDetails?.kycStatus === 'rejected' ? 'destructive' : 'secondary'
                    }>
                      {user.kycDetails?.kycStatus?.toUpperCase() || 'NOT SUBMITTED'}
                    </Badge>
                  </div>
                  {user.kycDetails?.panNumber && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">PAN Number</p>
                      <p className="font-medium">{user.kycDetails.panNumber}</p>
                    </div>
                  )}
                  {user.kycDetails?.aadhaarNumber && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Aadhaar Number</p>
                      <p className="font-medium">{user.kycDetails.aadhaarNumber}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Submitted At</p>
                    <p className="font-medium">
                      {user.kycDetails?.kycSubmittedAt ? new Date(user.kycDetails.kycSubmittedAt).toLocaleString() : 'Not submitted'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* TL Specific Information (if applicable) */}
          {user.role === 'TL' && (
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Team Lead Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Team Size</p>
                      <p className="text-2xl font-bold">{user.tlDetails?.totalTeamMembers || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Daily Lead Quota</p>
                      <p className="text-2xl font-bold">{user.tlDetails?.dailyLeadQuota || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Assigned Leads</p>
                      <p className="text-lg font-medium">{user.tlDetails?.assignedLeads?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Team Performance</p>
                      <p className="text-lg font-medium">{user.tlDetails?.teamPerformance || 0}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Bank Details */}
          {user.bankDetails && Object.keys(user.bankDetails).length > 0 && (
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Bank Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.bankDetails.bankName && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Bank Name</p>
                        <p className="font-medium">{user.bankDetails.bankName}</p>
                      </div>
                    )}
                    {user.bankDetails.accountHolderName && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Account Holder</p>
                        <p className="font-medium">{user.bankDetails.accountHolderName}</p>
                      </div>
                    )}
                    {user.bankDetails.accountNumber && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Account Number</p>
                        <p className="font-medium">{user.bankDetails.accountNumber}</p>
                      </div>
                    )}
                    {user.bankDetails.ifscCode && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">IFSC Code</p>
                        <p className="font-medium">{user.bankDetails.ifscCode}</p>
                      </div>
                    )}
                    {user.bankDetails.upiId && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">UPI ID</p>
                        <p className="font-medium">{user.bankDetails.upiId}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Verification Status</p>
                      <Badge variant={user.bankDetails.isVerified ? 'success' : 'warning'}>
                        {user.bankDetails.isVerified ? 'Verified' : 'Not Verified'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Additional Information */}
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last Activity</p>
                    <p className="font-medium">
                      {user.lastActivity ? new Date(user.lastActivity).toLocaleString() : 'Never'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Verified</p>
                    <Badge variant={user.isVerified ? 'success' : 'warning'}>
                      {user.isVerified ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Performance Rating</p>
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <Award 
                          key={i} 
                          className={`w-4 h-4 ${i < (user.performance?.rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                        />
                      ))}
                      <span className="font-medium">({user.performance?.rating || 0}/5)</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Signup Source</p>
                    <p className="font-medium">{user.metadata?.signupSource || 'web'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Reported To</p>
                    <p className="font-medium">{user.reportingTo ? 'TL Assigned' : 'Not Assigned'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Can Mark Attendance</p>
                    <Badge variant={user.role === 'user' ? 'info' : 'secondary'}>
                      {user.role === 'user' ? 'Yes' : 'No (TL/Admin)'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dropdown Menu Component for Actions
const ActionMenu = ({ 
  user, 
  onView, 
  onEdit, 
  onStatus, 
  onRole, 
  onKYC, 
  onBlock, 
  onDelete, 
  loading = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="hover:bg-gray-100 dark:hover:bg-gray-800"
        title="More Actions"
      >
        <MoreVertical className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-10 z-50 w-56 rounded-md border bg-white shadow-lg dark:bg-gray-800">
          <div className="p-2 space-y-1">
            {/* View Details */}
            <button
              onClick={() => { onView(); setIsOpen(false); }}
              disabled={loading}
              className="flex items-center w-full px-3 py-2 text-sm text-left text-blue-600 rounded-md hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Full Details
            </button>

            {/* Edit User */}
            <button
              onClick={() => { onEdit(); setIsOpen(false); }}
              disabled={loading}
              className="flex items-center w-full px-3 py-2 text-sm text-left text-green-600 rounded-md hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit User Profile
            </button>

            {/* Manage Status */}
            <button
              onClick={() => { onStatus(); setIsOpen(false); }}
              disabled={loading}
              className="flex items-center w-full px-3 py-2 text-sm text-left text-orange-600 rounded-md hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage Status
            </button>

            {/* Change Role */}
            <button
              onClick={() => { onRole(); setIsOpen(false); }}
              disabled={loading}
              className="flex items-center w-full px-3 py-2 text-sm text-left text-purple-600 rounded-md hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Key className="w-4 h-4 mr-2" />
              Change Role
            </button>

            {/* Manage KYC */}
            {user.kycDetails?.kycStatus === 'pending' && (
              <button
                onClick={() => { onKYC(); setIsOpen(false); }}
                disabled={loading}
                className="flex items-center w-full px-3 py-2 text-sm text-left text-yellow-600 rounded-md hover:bg-yellow-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Shield className="w-4 h-4 mr-2" />
                Manage KYC
              </button>
            )}

            <div className="border-t my-1"></div>

            {/* Block as Ex User */}
            <button
              onClick={() => { onBlock(); setIsOpen(false); }}
              disabled={loading || user.isEx}
              className="flex items-center w-full px-3 py-2 text-sm text-left text-red-600 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Ban className="w-4 h-4 mr-2" />
              <div>
                <div className="font-medium">Block as Ex User</div>
                <div className="text-xs text-red-500 mt-0.5">
                  {user.isEx ? 'Already Ex User' : 'Block user access'}
                </div>
              </div>
            </button>

            {/* Delete User */}
            <button
              onClick={() => { onDelete(); setIsOpen(false); }}
              disabled={loading}
              className="flex items-center w-full px-3 py-2 text-sm text-left text-red-600 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserX className="w-4 h-4 mr-2" />
              <div>
                <div className="font-medium">Delete User</div>
                <div className="text-xs text-red-500 mt-0.5">
                  Permanently remove user
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function AllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    role: 'all',
    page: 1,
    limit: 10
  });

  const [sort, setSort] = useState({
    key: 'createdAt',
    direction: 'desc'
  });

  // Enhanced user data with calculated fields
  const enhanceUserData = (user) => {
    // Calculate lead statistics
    const totalLeads = user.statistics?.totalLeads || 0;
    const completedLeads = user.statistics?.completedLeads || 0;
    const pendingLeads = user.statistics?.pendingLeads || 0;
    const rejectedLeads = user.statistics?.rejectedLeads || 0;
    const conversionRate = totalLeads > 0 ? (completedLeads / totalLeads * 100) : 0;
    
    // Calculate financial statistics
    const totalEarnings = user.statistics?.totalEarnings || 0;
    const currentBalance = user.statistics?.currentBalance || 0;
    const totalWithdrawals = user.statistics?.totalWithdrawals || 0;
    
    // Calculate age if DOB exists
    let age = null;
    if (user.dob) {
      const today = new Date();
      const birthDate = new Date(user.dob);
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }
    
    // Determine if user can receive leads today
    let canReceiveLeads = false;
    if (user.status === 'active') {
      if (user.role === 'user') {
        const today = new Date();
        const todayStart = new Date(today.setHours(0, 0, 0, 0));
        
        // Check attendance
        const isPresentToday = user.attendance?.todayStatus === 'present' && 
          user.attendance?.todayMarkedAt && 
          new Date(user.attendance.todayMarkedAt) >= todayStart;
        
        // Check last lead distribution
        const lastDistDate = user.leadDistribution?.lastLeadDistributionDate;
        const receivedLeadsToday = lastDistDate && 
          new Date(lastDistDate).toDateString() === today.toDateString();
        
        canReceiveLeads = isPresentToday && !receivedLeadsToday;
      } else if (user.role === 'TL') {
        // TLs can receive leads regardless of attendance
        const today = new Date();
        const lastDistDate = user.leadDistribution?.lastLeadDistributionDate;
        const receivedLeadsToday = lastDistDate && 
          new Date(lastDistDate).toDateString() === today.toDateString();
        
        canReceiveLeads = !receivedLeadsToday;
      }
    }
    
    return {
      ...user,
      totalLeads,
      completedLeads,
      pendingLeads,
      rejectedLeads,
      conversionRate: conversionRate.toFixed(2),
      totalEarnings,
      currentBalance,
      totalWithdrawals,
      age,
      canReceiveLeads,
      formattedTotalEarnings: `₹${totalEarnings.toLocaleString('en-IN')}`,
      formattedCurrentBalance: `₹${currentBalance.toLocaleString('en-IN')}`,
      joinDate: new Date(user.createdAt).toLocaleDateString('en-IN'),
      joinDateTime: new Date(user.createdAt).toLocaleString('en-IN'),
      lastActive: user.lastActivity ? new Date(user.lastActivity).toLocaleDateString('en-IN') : 'Never',
      lastActiveFull: user.lastActivity ? new Date(user.lastActivity).toLocaleString('en-IN') : 'Never'
    };
  };

  // ==================== ADMIN SERVICE INTEGRATIONS ====================

  // Fetch users with stats
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

  // Get users by status
  const fetchUsersByStatus = async (status) => {
    try {
      setLoading(true);
      const response = await userService.getUsersByStatus(status, {
        page: filters.page,
        limit: filters.limit
      });
      
      if (response.success) {
        const enhancedUsers = response.data.users.map(enhanceUserData);
        setUsers(enhancedUsers);
      }
    } catch (err) {
      console.error('Error fetching users by status:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (userId, data) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      const response = await userService.updateUser(userId, data);
      
      if (response.success) {
        setSuccess('User profile updated successfully');
        await fetchUsers();
      } else {
        setError(response.message || 'Failed to update user');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.message || 'Failed to update user');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Approve user registration
  const approveUserRegistration = async (userId) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      const response = await userService.approveUserRegistration(userId);
      
      if (response.success) {
        setSuccess('User approved successfully');
        await fetchUsers();
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

  // Mark user as Hold
  const markUserHold = async (userId, data) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      const response = await userService.markUserHold(userId, data);
      
      if (response.success) {
        setSuccess('User put on hold successfully');
        await fetchUsers();
      } else {
        setError(response.message || 'Failed to put user on hold');
      }
    } catch (err) {
      console.error('Error putting user on hold:', err);
      setError(err.message || 'Failed to put user on hold');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Mark user as Active
  const markUserActive = async (userId, data = {}) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      const response = await userService.markUserActive(userId, data);
      
      if (response.success) {
        setSuccess('User activated successfully');
        await fetchUsers();
      } else {
        setError(response.message || 'Failed to activate user');
      }
    } catch (err) {
      console.error('Error activating user:', err);
      setError(err.message || 'Failed to activate user');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Block user
  const blockUser = async (userId, data) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      const response = await userService.blockUser(userId, data);
      
      if (response.success) {
        setSuccess('User blocked successfully');
        await fetchUsers();
      } else {
        setError(response.message || 'Failed to block user');
      }
    } catch (err) {
      console.error('Error blocking user:', err);
      setError(err.message || 'Failed to block user');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Change user role
  const changeUserRole = async (userId, data) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      const response = await userService.changeUserRole(userId, data);
      
      if (response.success) {
        setSuccess('User role changed successfully');
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

  // Update TL permissions
  const updateTLPermissions = async (userId, permissions) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      const response = await userService.updateTLPermissions(userId, permissions);
      
      if (response.success) {
        setSuccess('TL permissions updated successfully');
        await fetchUsers();
      } else {
        setError(response.message || 'Failed to update TL permissions');
      }
    } catch (err) {
      console.error('Error updating TL permissions:', err);
      setError(err.message || 'Failed to update TL permissions');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Toggle user active status
  const toggleUserStatus = async (userId) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      const response = await userService.toggleUserStatus(userId);
      
      if (response.success) {
        setSuccess('User status toggled successfully');
        await fetchUsers();
      } else {
        setError(response.message || 'Failed to toggle user status');
      }
    } catch (err) {
      console.error('Error toggling user status:', err);
      setError(err.message || 'Failed to toggle user status');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Mark user as Ex
  const markUserAsEx = async (userId) => {
    if (!window.confirm('Are you sure you want to mark this user as Ex? This will block their access to the platform.')) return;
    
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      const response = await userService.markUserAsEx(userId);
      
      if (response.success) {
        setSuccess('User marked as Ex successfully');
        await fetchUsers();
      } else {
        setError(response.message || 'Failed to mark user as Ex');
      }
    } catch (err) {
      console.error('Error marking user as Ex:', err);
      setError(err.message || 'Failed to mark user as Ex');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone and will permanently remove all user data.')) return;
    
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

  // Approve KYC
  const approveKYC = async (userId, data = {}) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      const response = await userService.approveKYC(userId, data);
      
      if (response.success) {
        setSuccess('KYC approved successfully');
        await fetchUsers();
      } else {
        setError(response.message || 'Failed to approve KYC');
      }
    } catch (err) {
      console.error('Error approving KYC:', err);
      setError(err.message || 'Failed to approve KYC');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Reject KYC
  const rejectKYC = async (userId, data) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      const response = await userService.rejectKYC(userId, data);
      
      if (response.success) {
        setSuccess('KYC rejected successfully');
        await fetchUsers();
      } else {
        setError(response.message || 'Failed to reject KYC');
      }
    } catch (err) {
      console.error('Error rejecting KYC:', err);
      setError(err.message || 'Failed to reject KYC');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Export users
  const exportUsers = async () => {
    try {
      setLoading(true);
      const blob = await userService.exportUsers({
        format: 'excel',
        ...filters
      });
      
      // Create download link
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

  // Bulk upload users
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

  // Handle status management action
  const handleStatusAction = async (userId, actionType, data) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      
      let response;
      switch(actionType) {
        case 'active':
          response = await markUserActive(userId, data);
          break;
        case 'hold':
          response = await markUserHold(userId, data);
          break;
        case 'block':
          response = await blockUser(userId, data);
          break;
        case 'approve':
          response = await approveUserRegistration(userId);
          break;
        default:
          throw new Error('Invalid action type');
      }
      
      if (response?.success) {
        await fetchUsers();
      }
    } catch (err) {
      console.error('Error performing status action:', err);
      setError(err.message || 'Failed to perform action');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Handle KYC action
  const handleKYCAction = async (userId, action, data) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      
      if (action === 'approve') {
        await approveKYC(userId, data);
      } else if (action === 'reject') {
        await rejectKYC(userId, data);
      }
      
      await fetchUsers();
    } catch (err) {
      console.error('Error performing KYC action:', err);
      setError(err.message || 'Failed to perform KYC action');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Handle role change
  const handleRoleChange = async (userId, newRole, reason = '') => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      await changeUserRole(userId, { newRole, reason });
      await fetchUsers();
    } catch (err) {
      console.error('Error changing role:', err);
      setError(err.message || 'Failed to change role');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // ==================== EFFECTS & HANDLERS ====================

  useEffect(() => {
    fetchUsers();
  }, [filters.page, filters.limit, filters.status, filters.role, sort]);

  // Handle search with debounce
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

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  // Handle sort
  const handleSort = (key) => {
    setSort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // View user details
  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  // Handle file upload for bulk upload
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

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Users</h1>
          <p className="text-muted-foreground">
            Manage and view all registered users with comprehensive statistics
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
                title="Bulk Upload Users"
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
            title="Export Users"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          {/* Refresh */}
          <Button 
            onClick={fetchUsers} 
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
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, phone, PAN, Aadhaar..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-9"
                disabled={loading}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select 
                value={filters.status} 
                onValueChange={(value) => handleFilterChange('status', value)}
                placeholder="Status"
                className="w-full sm:w-[180px]"
                disabled={loading}
              >
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="hold">On Hold</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="ex">Ex Users</SelectItem>
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
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="TL">Team Lead</SelectItem>
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
                    <TableHead sortable onSort={handleSort} sortKey="name" currentSort={sort}>
                      User Information
                    </TableHead>
                    <TableHead>Contact & Role</TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="status" currentSort={sort}>
                      Status
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="statistics.totalLeads" currentSort={sort}>
                      Leads
                    </TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="attendance.todayStatus" currentSort={sort}>
                      Attendance
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="kycDetails.kycStatus" currentSort={sort}>
                      KYC
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center">
                          <RefreshCw className="w-10 h-10 animate-spin text-primary mb-4" />
                          <span className="text-lg">Loading users...</span>
                          <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the data</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
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
                          <div className="min-w-[250px]">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">{user.name}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'TL' ? 'purple' : 'default'}>
                                    {user.role}
                                  </Badge>
                                  <Badge variant={user.isVerified ? 'success' : 'secondary'}>
                                    {user.isVerified ? 'Verified' : 'Unverified'}
                                  </Badge>
                                  {user.isEx && (
                                    <Badge variant="destructive">Ex User</Badge>
                                  )}
                                  {user.status === 'pending_approval' && (
                                    <Badge variant="warning">Pending</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Joined: {user.joinDate} • ID: {user._id?.substring(0, 8)}...
                                </p>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-2 min-w-[200px]">
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                              <p className="text-sm truncate" title={user.email}>{user.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                              <p className="text-sm">{user.phoneNumber}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                              <p className="text-sm truncate" title={`${user.city}, ${user.state}`}>
                                {user.city || 'City not set'}, {user.state || 'State not set'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-2">
                            <StatusToggleButton 
                              user={user}
                              onToggle={() => toggleUserStatus(user._id)}
                              loading={actionLoading[user._id]}
                            />
                            <div className="text-xs text-gray-500">
                              Last Active: {user.lastActive}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-2 min-w-[120px]">
                            <div className="grid grid-cols-2 gap-1">
                              <div className="text-center">
                                <div className="text-lg font-bold text-blue-600">{user.totalLeads}</div>
                                <div className="text-xs text-gray-500">Total</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-green-600">{user.completedLeads}</div>
                                <div className="text-xs text-gray-500">Done</div>
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-medium">{user.conversionRate}%</div>
                              <div className="text-xs text-gray-500">Conversion</div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-2 min-w-[150px]">
                            <div>
                              <p className="text-sm font-medium text-green-600">{user.formattedTotalEarnings}</p>
                              <p className="text-xs text-gray-500">Total Earned</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-blue-600">{user.formattedCurrentBalance}</p>
                              <p className="text-xs text-gray-500">Balance</p>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-2 min-w-[120px]">
                            <Badge variant={
                              user.attendance?.todayStatus === 'present' ? 'success' :
                              user.attendance?.todayStatus === 'absent' ? 'destructive' :
                              user.attendance?.todayStatus === 'late' ? 'warning' :
                              user.attendance?.todayStatus === 'half-day' ? 'orange' : 'secondary'
                            }>
                              {user.attendance?.todayStatus?.toUpperCase() || 'NOT MARKED'}
                            </Badge>
                            {user.attendance?.streak > 0 && (
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                {user.attendance.streak} day streak
                              </div>
                            )}
                            {user.canReceiveLeads && (
                              <Badge variant="success" className="text-xs">
                                Can Get Leads
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1 min-w-[120px]">
                            <Badge variant={
                              user.kycDetails?.kycStatus === 'approved' ? 'success' :
                              user.kycDetails?.kycStatus === 'pending' ? 'warning' :
                              user.kycDetails?.kycStatus === 'rejected' ? 'destructive' : 'secondary'
                            }>
                              {user.kycDetails?.kycStatus?.toUpperCase() || 'NOT SUBMITTED'}
                            </Badge>
                            {user.kycDetails?.panNumber && (
                              <p className="text-xs text-gray-500 truncate" title={`PAN: ${user.kycDetails.panNumber}`}>
                                PAN: {user.kycDetails.panNumber}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[140px]">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => viewUserDetails(user)}
                              title="View Full Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              title="View Profile"
                            >
                              <Link to={`/admin/user/${user._id}`}>
                                <User className="w-4 h-4" />
                              </Link>
                            </Button>
                            
                            <ActionMenu
                              user={user}
                              onView={() => viewUserDetails(user)}
                              onEdit={() => console.log('Edit user:', user._id)}
                              onStatus={() => {
                                setSelectedUser(user);
                                setShowStatusModal(true);
                              }}
                              onRole={() => {
                                setSelectedUser(user);
                                setShowRoleModal(true);
                              }}
                              onKYC={() => {
                                setSelectedUser(user);
                                setShowKYCModal(true);
                              }}
                              onBlock={() => markUserAsEx(user._id)}
                              onDelete={() => deleteUser(user._id)}
                              loading={actionLoading[user._id]}
                            />
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
          <div className="text-sm text-muted-foreground">
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
              <span className="text-sm text-foreground">Page {filters.page}</span>
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

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedUser(null);
          }}
          onEdit={() => console.log('Edit user:', selectedUser._id)}
          onStatusChange={(user) => {
            setSelectedUser(user);
            setShowStatusModal(true);
          }}
          onKYCChange={(user) => {
            setSelectedUser(user);
            setShowKYCModal(true);
          }}
          onRoleChange={(user) => {
            setSelectedUser(user);
            setShowRoleModal(true);
          }}
        />
      )}

      {/* Status Management Modal */}
      {showStatusModal && selectedUser && (
        <StatusManagementModal
          user={selectedUser}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedUser(null);
          }}
          onAction={handleStatusAction}
        />
      )}

      {/* KYC Management Modal */}
      {showKYCModal && selectedUser && (
        <KYCManagementModal
          user={selectedUser}
          onClose={() => {
            setShowKYCModal(false);
            setSelectedUser(null);
          }}
          onAction={handleKYCAction}
        />
      )}

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <RoleChangeModal
          user={selectedUser}
          onClose={() => {
            setShowRoleModal(false);
            setSelectedUser(null);
          }}
          onChangeRole={handleRoleChange}
        />
      )}
    </div>
  );
}