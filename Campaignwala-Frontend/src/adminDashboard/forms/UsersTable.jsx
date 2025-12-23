import { 
  Download, 
  Search, 
  Filter, 
  X, 
  Upload, 
  Eye, 
  Edit, 
  MoreVertical,
  User,
  Mail,
  Phone,
  Calendar,
  Wallet,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  UserX,
  RefreshCw,
  ChevronDown,
  Shield,
  TrendingUp,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import userService from "../../services/userService";
import toast, { Toaster } from "react-hot-toast";

// Enhanced UI Components (keep all your existing components the same)
const Card = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    destructive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500 shadow-sm',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-400 dark:hover:bg-gray-700'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2'
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Modal = ({ isOpen, onClose, children, title, size = 'md' }) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity p-4">
      <div className={`w-full ${sizeClasses[size]} mx-auto animate-in fade-in duration-200`}>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 rounded-lg"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change, icon: Icon, trend = 'up', className = '' }) => (
  <Card className={`p-4 sm:p-6 ${className}`}>
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">{title}</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1 truncate">{value}</p>
        {change && (
          <p className={`text-xs font-medium mt-1 ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? '↑' : '↓'} {change}
          </p>
        )}
      </div>
      <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex-shrink-0 ml-3">
        <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
      </div>
    </div>
  </Card>
);

// Enhanced User Details Modal
const UserDetailsModal = ({ isOpen, onClose, user, onStatusChange }) => {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Details" size="lg">
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header with Basic Info */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">{user.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
              <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                <Badge variant={user.isActive && !user.isEx ? 'success' : user.isEx ? 'destructive' : 'warning'}>
                  {user.isEx ? 'Ex User' : user.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="info" className="capitalize">
                  {user.role}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl">
            <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{user.totalLeads || 0}</div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Total Leads</div>
          </div>
          <div className="text-center p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg sm:rounded-xl">
            <div className="text-lg sm:text-2xl font-bold text-green-600">{user.approvedLeads || 0}</div>
            <div className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-1">Approved</div>
          </div>
          <div className="text-center p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg sm:rounded-xl">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">{user.completedLeads || 0}</div>
            <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 mt-1">Completed</div>
          </div>
          <div className="text-center p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 rounded-lg sm:rounded-xl">
            <div className="text-lg sm:text-2xl font-bold text-red-600">{user.rejectedLeads || 0}</div>
            <div className="text-xs sm:text-sm text-red-600 dark:text-red-400 mt-1">Rejected</div>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
              <User className="w-4 h-4" />
              Personal Information
            </h4>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center py-1 sm:py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Phone</span>
                <span className="text-xs sm:text-sm font-medium text-right">{user.phoneNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-1 sm:py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Joined On</span>
                <span className="text-xs sm:text-sm font-medium">{user.joinDate || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-1 sm:py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Last Active</span>
                <span className="text-xs sm:text-sm font-medium">{user.lastActive || 'Never'}</span>
              </div>
              <div className="flex justify-between items-center py-1 sm:py-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Email Verified</span>
                {user.isVerified ? (
                  <Badge variant="success" className="flex items-center gap-1 text-xs">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                    <XCircle className="w-3 h-3" />
                    Not Verified
                  </Badge>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
              <Wallet className="w-4 h-4" />
              Financial Information
            </h4>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center p-2 sm:p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Earnings</span>
                <span className="text-sm sm:text-lg font-bold text-green-600">{user.totalEarnings || '₹0'}</span>
              </div>
              <div className="flex justify-between items-center p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Current Balance</span>
                <span className="text-sm sm:text-lg font-bold text-blue-600">{user.currentBalance || '₹0'}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* KYC & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
              <Shield className="w-4 h-4" />
              KYC Status
            </h4>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <Badge 
                variant={
                  user.kycDetails?.kycStatus === 'approved' ? 'success' :
                  user.kycDetails?.kycStatus === 'pending' ? 'warning' :
                  user.kycDetails?.kycStatus === 'rejected' ? 'destructive' : 'default'
                }
                className="self-start sm:self-auto"
              >
                {user.kycDetails?.kycStatus || 'Not Submitted'}
              </Badge>
              <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                View KYC
              </Button>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">Quick Actions</h4>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2">
              <Button variant="secondary" size="sm" className="flex-1 sm:flex-none">
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">Send Email</span>
              </Button>
              <Button variant="secondary" size="sm" className="flex-1 sm:flex-none">
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit Profile</span>
              </Button>
              {!user.isEx && (
                <Button 
                  variant="warning" 
                  size="sm"
                  onClick={() => onStatusChange(user._id, 'block')}
                  className="flex-1 sm:flex-none"
                >
                  <Ban className="w-4 h-4" />
                  <span className="hidden sm:inline">Block User</span>
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Modal>
  );
};

// Status Dropdown Component
const StatusDropdown = ({ user, onStatusChange, loading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusConfig = (user) => {
    if (user.isEx) {
      return {
        label: 'Ex User',
        variant: 'destructive',
        icon: Ban
      };
    }
    return user.isActive ? {
      label: 'Active',
      variant: 'success',
      icon: CheckCircle
    } : {
      label: 'Inactive',
      variant: 'warning',
      icon: Clock
    };
  };

  const statusConfig = getStatusConfig(user);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${
          statusConfig.variant === 'success' ? 'text-green-700' :
          statusConfig.variant === 'warning' ? 'text-yellow-700' :
          'text-red-700'
        }`}
      >
        <statusConfig.icon className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="hidden xs:inline">{statusConfig.label}</span>
        <ChevronDown className="w-3 h-3" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-36 sm:w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
          <div className="p-1 sm:p-2 space-y-1">
            {!user.isEx && user.isActive && (
              <button
                onClick={() => {
                  onStatusChange(user._id, 'deactivate');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-md transition-colors"
              >
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                Set Inactive
              </button>
            )}
            
            {!user.isEx && !user.isActive && (
              <button
                onClick={() => {
                  onStatusChange(user._id, 'activate');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
              >
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                Activate
              </button>
            )}
            
            {!user.isEx && (
              <button
                onClick={() => {
                  onStatusChange(user._id, 'block');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                <Ban className="w-3 h-3 sm:w-4 sm:h-4" />
                Block as Ex
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Scrollable Table Container with Custom Scrollbars
const ScrollableTableContainer = ({ children, className = '' }) => (
  <div className={`relative ${className}`}>
    <div className="overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
      {children}
    </div>
  </div>
);

export default function UsersTable({ userType }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    ex: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Enhanced user type configurations
  const userTypeConfigs = {
    active: {
      label: "Active Users",
      description: "Users currently active on the platform",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800"
    },
    hold: {
      label: "On Hold Users",
      description: "Users temporarily inactive",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      borderColor: "border-yellow-200 dark:border-yellow-800"
    },
    ex: {
      label: "Ex Users",
      description: "Blocked or former users",
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-200 dark:border-red-800"
    }
  };

  const config = userTypeConfigs[userType];

  // Fetch users from backend API - only once on mount and when userType changes
  useEffect(() => {
    fetchUsers();
  }, [userType]);

  // Filter users locally when search term or filter role changes
  useEffect(() => {
    filterUsers();
  }, [searchTerm, filterRole, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await userService.getAllUsersWithStats({
        page: 1,
        limit: 100
      });

      if (response.success) {
        const fetchedUsers = response.data.users || [];
        setUsers(fetchedUsers);
      } else {
        const errorMsg = response.message || 'Failed to fetch users';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      const errorMsg = err.message || 'Failed to load users';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!users.length) {
      setFilteredUsers([]);
      return;
    }

    let filtered = [...users];

    // First, filter by user type
    if (userType === 'active') {
      filtered = filtered.filter(user => user.isActive === true && !user.isEx);
    } else if (userType === 'hold') {
      filtered = filtered.filter(user => user.isActive === false && !user.isEx);
    } else if (userType === 'ex') {
      filtered = filtered.filter(user => user.isEx === true);
    }

    // Then, apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(user => {
        return (
          user.name?.toLowerCase().includes(search) ||
          user.email?.toLowerCase().includes(search) ||
          user.phoneNumber?.includes(searchTerm)
        );
      });
    }

    // Finally, apply role/leads filter
    if (filterRole !== 'all') {
      if (filterRole === 'high_leads') {
        filtered = filtered.filter(user => user.totalLeads > 30);
      } else if (filterRole === 'moderate_leads') {
        filtered = filtered.filter(user => user.totalLeads >= 10 && user.totalLeads <= 30);
      } else if (filterRole === 'low_leads') {
        filtered = filtered.filter(user => user.totalLeads < 10);
      }
    }

    setFilteredUsers(filtered);
    
    // Calculate stats based on filtered users
    setStats({
      total: filtered.length,
      active: filtered.filter(u => u.isActive && !u.isEx).length,
      inactive: filtered.filter(u => !u.isActive && !u.isEx).length,
      ex: filtered.filter(u => u.isEx).length
    });

    // Reset to first page when filters change
    setCurrentPage(1);
  };

  const handleStatusChange = async (userId, action) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      
      if (action === 'activate' || action === 'deactivate') {
        await userService.toggleUserStatus(userId);
      } else if (action === 'block') {
        await userService.markUserAsEx(userId);
      }
      
      await fetchUsers(); // Refresh the entire user list
    } catch (error) {
      console.error(`❌ Error ${action} user:`, error);
      toast.error(`Failed to ${action} user: ${error.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleExport = () => {
    console.log("Exporting users...");
    // Implement export functionality
  };

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <>
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
        <div className="h-full flex items-center justify-center p-4 sm:p-8">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 sm:w-12 sm:h-12 animate-spin text-blue-600 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-lg">Loading users...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
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
        <div className="h-full flex items-center justify-center p-4 sm:p-8">
          <Card className="p-6 sm:p-8 text-center max-w-md w-full">
            <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">Error loading users</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-4 sm:mb-6">{error}</p>
            <Button onClick={fetchUsers} className="w-full sm:w-auto">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          </Card>
        </div>
      </>
    );
  }

  return (
    <div className="h-full flex flex-col p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
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
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white truncate">{config.label}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">{config.description}</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Button variant="secondary" onClick={handleExport} size="sm" className="flex-1 sm:flex-none">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button onClick={fetchUsers} disabled={loading} size="sm" className="flex-1 sm:flex-none">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <StatCard
          title="Total Users"
          value={stats.total}
          icon={User}
        />
        <StatCard
          title="Active"
          value={stats.active}
          change="+12%"
          trend="up"
          icon={TrendingUp}
        />
        <StatCard
          title="On Hold"
          value={stats.inactive}
          change="-5%"
          trend="down"
          icon={Clock}
        />
        <StatCard
          title="Ex Users"
          value={stats.ex}
          icon={Ban}
        />
      </div>

      {/* Filters Section */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
            />
          </div>
          <div className="flex gap-2 sm:gap-3">
            <div className="relative flex-1 sm:flex-none">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full sm:w-48 pl-10 pr-8 py-2 sm:py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer text-sm sm:text-base"
              >
                <option value="all">All Users</option>
                <option value="high_leads">High Leads (&gt;30)</option>
                <option value="moderate_leads">Moderate Leads (10-30)</option>
                <option value="low_leads">Low Leads (&lt;10)</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Table Section */}
      <Card className="flex-1 flex flex-col min-h-0">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">User Management</h3>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
        
        <ScrollableTableContainer className="flex-1">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0 z-10">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">User</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Contact</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Leads</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Earnings</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Joined</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 sm:px-6 py-3">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white truncate text-sm sm:text-base">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">ID: {user._id?.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{user.phoneNumber || 'N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3">
                    <StatusDropdown
                      user={user}
                      onStatusChange={handleStatusChange}
                      loading={actionLoading[user._id]}
                    />
                  </td>
                  <td className="px-4 sm:px-6 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Total:</span>
                        <span className="font-semibold">{user.totalLeads || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-green-600">Approved:</span>
                        <span className="font-semibold">{user.approvedLeads || 0}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3">
                    <div className="space-y-1">
                      <div className="text-xs sm:text-sm font-semibold text-green-600 truncate">{user.totalEarnings || '₹0'}</div>
                      <div className="text-xs sm:text-sm text-blue-600 truncate">{user.currentBalance || '₹0'}</div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3">
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {user.joinDate || 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewUser(user)}
                        title="View Details"
                        className="h-8 w-8 sm:h-9 sm:w-9"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="More Options"
                        className="h-8 w-8 sm:h-9 sm:w-9"
                      >
                        <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollableTableContainer>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 sm:py-12 flex-1 flex items-center justify-center">
            <div>
              <User className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">No users found</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                {searchTerm || filterRole !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : `No ${config.label.toLowerCase()} found`}
              </p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 sm:h-9 sm:w-9"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "primary" : "ghost"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="h-8 w-8 sm:h-9 sm:w-9 text-xs"
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 sm:h-9 sm:w-9"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        user={selectedUser}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}