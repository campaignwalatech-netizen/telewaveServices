import { useState, useEffect } from 'react';
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
  Pause,
  Play,
  Ban,
  UserX,
  Filter,
  Building,
  UserCheck,
  Bookmark,
  CalendarDays,
  PhoneCall,
  Briefcase,
  AlertCircle,
  FileSpreadsheet,
  DollarSign,
  FileText,
  PhoneForwarded,
  PhoneOff,
  PhoneMissed,
  CalendarClock,
  Clock4,
  CalendarCheck,
  UserCircle,
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

// Action Menu Component
const ActionMenu = ({ user, onView, onEdit, onStatus, onBlock, loading = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="hover:bg-gray-100 dark:hover:bg-gray-700"
        title="More Actions"
      >
        <MoreVertical className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-10 z-50 w-48 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
          <div className="p-2 space-y-1">
            <button
              onClick={() => { onView(); setIsOpen(false); }}
              disabled={loading}
              className="flex items-center w-full px-3 py-2 text-sm text-left text-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </button>
            <button
              onClick={() => { onEdit(); setIsOpen(false); }}
              disabled={loading}
              className="flex items-center w-full px-3 py-2 text-sm text-left text-green-600 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit TL
            </button>
            <button
              onClick={() => { onStatus(); setIsOpen(false); }}
              disabled={loading}
              className="flex items-center w-full px-3 py-2 text-sm text-left text-orange-600 rounded-md hover:bg-orange-50 dark:hover:bg-orange-900/20 disabled:opacity-50"
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage Status
            </button>
            <div className="border-t my-1"></div>
            <button
              onClick={() => { onBlock(); setIsOpen(false); }}
              disabled={loading || user.isEx}
              className="flex items-center w-full px-3 py-2 text-sm text-left text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
            >
              <Ban className="w-4 h-4 mr-2" />
              Block as Ex
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Team Members Modal Component
const TeamMembersModal = ({ isOpen, onClose, tlId, tlName, filterType = 'all' }) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && tlId) {
      fetchTeamMembers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, tlId, filterType]);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get all users and filter by reportingTo
      const response = await userService.getAllUsersWithStats({ 
        limit: 1000,
        role: 'user'
      });
      
      if (response.success) {
        // Filter users by reportingTo matching tlId (handle both ObjectId and string comparison)
        const members = response.data.users.filter(user => {
          const reportingToId = user.reportingTo?._id || user.reportingTo;
          return reportingToId && (
            reportingToId.toString() === tlId.toString() || 
            reportingToId === tlId ||
            (typeof reportingToId === 'string' && typeof tlId === 'string' && reportingToId === tlId)
          );
        });
        
        // If filterType is 'present', filter by attendance
        if (filterType === 'present') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const filtered = members.filter(member => {
            const todayMarkedAt = member.attendance?.todayMarkedAt ? new Date(member.attendance.todayMarkedAt) : null;
            const isMarkedToday = todayMarkedAt && todayMarkedAt >= today;
            const attendanceStatus = isMarkedToday ? (member.attendance?.todayStatus || 'absent') : 'absent';
            return attendanceStatus === 'present' || attendanceStatus === 'late' || attendanceStatus === 'half-day';
          });
          setTeamMembers(filtered);
        } else {
          setTeamMembers(members);
        }
      } else {
        setError(response.message || 'Failed to fetch team members');
      }
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError(err.message || 'Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Team Members - {tlName}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {filterType === 'present' ? 'Present Team Members' : 'All Team Members'} ({teamMembers.length})
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-500">Loading team members...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <AlertCircle className="w-10 h-10 mx-auto mb-4" />
              <p>{error}</p>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No team members found</p>
              <p className="text-sm mt-2">
                {filterType === 'present' 
                  ? 'No team members are present today' 
                  : 'This TL has no team members assigned'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {teamMembers.map((member) => {
                const todayDate = new Date();
                todayDate.setHours(0, 0, 0, 0);
                const todayMarkedAt = member.attendance?.todayMarkedAt ? new Date(member.attendance.todayMarkedAt) : null;
                const isMarkedToday = todayMarkedAt && todayMarkedAt >= todayDate;
                const attendanceStatus = isMarkedToday ? (member.attendance?.todayStatus || 'absent') : 'absent';
                const todayDateStr = new Date().toISOString().split('T')[0];
                const todayCalled = member.dailyStats?.[todayDateStr]?.called ?? member.todayCalled ?? 0;
                const todayClosed = member.dailyStats?.[todayDateStr]?.closed ?? member.todayClosed ?? 0;
                
                return (
                  <div
                    key={member._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {member.name}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {member.phoneNumber}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {member.email}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                          <Badge variant={member.status === 'active' ? 'success' : 'warning'} className="mt-1">
                            {member.status || 'N/A'}
                          </Badge>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Attendance</p>
                          <Badge 
                            variant={attendanceStatus === 'present' || attendanceStatus === 'late' || attendanceStatus === 'half-day' ? 'success' : 'destructive'} 
                            className="mt-1"
                          >
                            {attendanceStatus === 'present' || attendanceStatus === 'late' || attendanceStatus === 'half-day' ? 'Present' : 'Absent'}
                          </Badge>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Today Called</p>
                          <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">{todayCalled}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Today Closed</p>
                          <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-1">{todayClosed}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Total Leads</p>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                            {member.statistics?.totalLeads || 0}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Open Data</p>
                          <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mt-1">
                            {(member.statistics?.totalLeads || 0) - (member.statistics?.completedLeads || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function AllTeamLeaders() {
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Team Members Modal state
  const [teamMembersModal, setTeamMembersModal] = useState({
    isOpen: false,
    tlId: null,
    tlName: '',
    filterType: 'all' // 'all' or 'present'
  });
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    page: 1,
    limit: 20
  });

  const [sort, setSort] = useState({
    key: 'createdAt',
    direction: 'desc'
  });

  // Enhance TL data with calculated fields
  const enhanceTLData = (tl) => {
    // TL specific stats
    const savedLeads = tl.tlDetails?.savedLeads || 0;
    const savedDate = tl.tlDetails?.lastSavedDate ? 
      new Date(tl.tlDetails.lastSavedDate).toLocaleDateString('en-IN') : '-';
    
    // HR statistics
    const totalHR = tl.tlDetails?.teamMembers?.length || tl.teamMembers?.length || 0;
    const presentHR = tl.teamAttendance?.presentCount || 0;
    const newHR = tl.tlDetails?.newHiresThisMonth || 0;
    
    // Lead statistics
    const pendingAccounts = tl.tlDetails?.pendingAccounts || 0;
    const lastLeadDate = tl.leadDistribution?.lastLeadDate ? 
      new Date(tl.leadDistribution.lastLeadDate).toLocaleDateString('en-IN') : '-';
    const dateAssigned = tl.leadDistribution?.lastAssignedDate ? 
      new Date(tl.leadDistribution.lastAssignedDate).toLocaleDateString('en-IN') : '-';
    
    // Open leads calculation
    const totalAssignedLeads = tl.tlDetails?.totalAssignedLeads || 0;
    const completedLeads = tl.statistics?.completedLeads || 0;
    const openLeads = totalAssignedLeads - completedLeads;

    // Performance metrics
    const conversionRate = tl.statistics?.totalLeads > 0 ? 
      (tl.statistics?.completedLeads / tl.statistics?.totalLeads * 100).toFixed(2) : 0;

    // Calculate today's date string for dailyStats lookup
    const todayDateStr = new Date().toISOString().split('T')[0];
    
    // Today's stats
    const todayCalled = tl.dailyStats?.[todayDateStr]?.called ?? tl.todayCalled ?? 0;
    const todayClosed = tl.dailyStats?.[todayDateStr]?.closed ?? tl.todayClosed ?? 0;
    
    // Attendance
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const todayMarkedAt = tl.attendance?.todayMarkedAt ? new Date(tl.attendance.todayMarkedAt) : null;
    const isMarkedToday = todayMarkedAt && todayMarkedAt >= todayDate;
    const attendanceStatus = isMarkedToday ? (tl.attendance?.todayStatus || 'absent') : 'absent';
    const totalPresent = tl.attendance?.totalPresent || tl.attendance?.monthlyStats?.present || 0;
    
    // Rollback data
    const rollbackData = tl.rollback?.total || (Array.isArray(tl.rollback?.data) ? tl.rollback.data.length : 0);
    const rollbackDate = tl.rollback?.lastDate ? 
      new Date(tl.rollback.lastDate).toLocaleDateString('en-IN') : '-';
    
    // Last Data
    const lastDataCount = tl.lastAssignedDataCount || 
                           tl.leadDistribution?.lastDataCount || 
                           tl.leadDistribution?.lastAssignedDataCount ||
                           tl.statistics?.lastAssignedCount || 
                           0;
    const lastData = lastDataCount > 0 ? lastDataCount.toString() : '-';
    
    // Salary
    const salary = tl.financials?.salary || tl.wallet?.balance || tl.currentBalance || '-';

    return {
      ...tl,
      savedLeads,
      savedDate,
      totalHR,
      presentHR,
      newHR,
      pendingAccounts,
      lastLeadDate,
      dateAssigned,
      openLeads: Math.max(openLeads, 0),
      joinDate: new Date(tl.createdAt).toLocaleDateString('en-IN'),
      joinDateTime: new Date(tl.createdAt).toLocaleString('en-IN'),
      attendancePercentage: totalHR > 0 ? ((presentHR / totalHR) * 100).toFixed(1) : 0,
      conversionRate,
      teamPerformance: tl.tlDetails?.teamPerformance || 0,
      dailyLeadQuota: tl.tlDetails?.dailyLeadQuota || 0,
      monthlyTarget: tl.tlDetails?.monthlyTarget || 0,
      achievedTarget: tl.tlDetails?.achievedTarget || 0,
      todayCalled,
      todayClosed,
      attendanceStatus,
      totalPresent,
      rollbackData,
      rollbackDate,
      lastData,
      salary
    };
  };

  // Fetch Team Leaders with stats
  const fetchTeamLeaders = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: filters.page,
        limit: filters.limit,
        sort: sort.key,
        order: sort.direction,
        role: 'TL', // Only fetch TLs
        ...(filters.search && { search: filters.search }),
        ...(filters.status !== 'all' && { 
          ...(filters.status === 'ex' ? { isEx: true } : { status: filters.status })
        })
      };

      const response = await userService.getAllUsersWithStats(params);
      
      if (response.success) {
        // Fetch all users to calculate presentHR for each TL
        let allUsers = [];
        try {
          const usersResponse = await userService.getAllUsersWithStats({ 
            limit: 10000,
            role: 'user'
          });
          if (usersResponse.success) {
            allUsers = usersResponse.data.users || [];
          }
        } catch (userErr) {
          console.warn('Failed to fetch users for presentHR calculation:', userErr);
        }

        // Calculate presentHR for each TL
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const enhancedTLs = response.data.users.map(tl => {
          // Calculate presentHR by counting team members who are present today
          const teamMembers = allUsers.filter(user => {
            const reportingToId = user.reportingTo?._id || user.reportingTo;
            const tlId = tl._id;
            return reportingToId && (
              reportingToId.toString() === tlId.toString() || 
              reportingToId === tlId ||
              (typeof reportingToId === 'string' && typeof tlId === 'string' && reportingToId === tlId)
            );
          });

          // Count present team members (same logic as modal)
          const presentCount = teamMembers.filter(member => {
            const todayMarkedAt = member.attendance?.todayMarkedAt ? new Date(member.attendance.todayMarkedAt) : null;
            const isMarkedToday = todayMarkedAt && todayMarkedAt >= today;
            const attendanceStatus = isMarkedToday ? (member.attendance?.todayStatus || 'absent') : 'absent';
            return attendanceStatus === 'present' || attendanceStatus === 'late' || attendanceStatus === 'half-day';
          }).length;

          // Override presentHR with calculated value
          const enhancedTL = enhanceTLData(tl);
          enhancedTL.presentHR = presentCount;
          enhancedTL.totalHR = teamMembers.length; // Also update totalHR to match actual count
          
          return enhancedTL;
        });
        
        setTeamLeaders(enhancedTLs);
      } else {
        const errorMsg = response.message || 'Failed to fetch team leaders';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Error fetching team leaders:', err);
      const errorMsg = err.message || 'Failed to fetch team leaders';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Update TL profile (for future use)
  // const updateTLProfile = async (tlId, data) => {
  //   try {
  //     setActionLoading(prev => ({ ...prev, [tlId]: true }));
  //     const response = await userService.updateUser(tlId, data);
  //     
  //     if (response.success) {
  //       const successMsg = 'Team Leader profile updated successfully';
  //       setSuccess(successMsg);
  //       toast.success(`✅ ${successMsg}`);
  //       await fetchTeamLeaders();
  //     } else {
  //       const errorMsg = response.message || 'Failed to update team leader';
  //       setError(errorMsg);
  //       toast.error(errorMsg);
  //     }
  //   } catch (err) {
  //     console.error('Error updating team leader:', err);
  //     const errorMsg = err.message || 'Failed to update team leader';
  //     setError(errorMsg);
  //     toast.error(errorMsg);
  //   } finally {
  //     setActionLoading(prev => ({ ...prev, [tlId]: false }));
  //   }
  // };

  // Mark TL as Ex
  const markTLAsEx = async (tlId) => {
    if (!window.confirm('Are you sure you want to mark this Team Leader as Ex? This will block their access.')) return;
    
    try {
      setActionLoading(prev => ({ ...prev, [tlId]: true }));
      const response = await userService.markUserAsEx(tlId);
      
      if (response.success) {
        const successMsg = 'Team Leader marked as Ex successfully';
        setSuccess(successMsg);
        toast.success(`✅ ${successMsg}`);
        await fetchTeamLeaders();
      } else {
        const errorMsg = response.message || 'Failed to mark team leader as Ex';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Error marking team leader as Ex:', err);
      const errorMsg = err.message || 'Failed to mark team leader as Ex';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setActionLoading(prev => ({ ...prev, [tlId]: false }));
    }
  };

  // Delete TL
  const deleteTL = async (tlId) => {
    if (!window.confirm('Are you sure you want to delete this Team Leader? This action cannot be undone.')) return;
    
    try {
      setActionLoading(prev => ({ ...prev, [tlId]: true }));
      const response = await userService.deleteUser(tlId);
      
      if (response.success) {
        const successMsg = 'Team Leader deleted successfully';
        setSuccess(successMsg);
        toast.success(`✅ ${successMsg}`);
        await fetchTeamLeaders();
      } else {
        const errorMsg = response.message || 'Failed to delete team leader';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Error deleting team leader:', err);
      const errorMsg = err.message || 'Failed to delete team leader';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setActionLoading(prev => ({ ...prev, [tlId]: false }));
    }
  };

  // Toggle TL status
  const toggleTLStatus = async (tlId) => {
    try {
      setActionLoading(prev => ({ ...prev, [tlId]: true }));
      const response = await userService.toggleUserStatus(tlId);
      
      if (response.success) {
        const successMsg = 'Team Leader status updated successfully';
        setSuccess(successMsg);
        toast.success(`✅ ${successMsg}`);
        await fetchTeamLeaders();
      } else {
        const errorMsg = response.message || 'Failed to update status';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Error updating team leader status:', err);
      const errorMsg = err.message || 'Failed to update status';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setActionLoading(prev => ({ ...prev, [tlId]: false }));
    }
  };

  // Export TLs
  const exportTeamLeaders = async () => {
    try {
      setLoading(true);
      const blob = await userService.exportUsers({
        format: 'excel',
        role: 'TL',
        ...filters
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `team_leaders_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      const successMsg = 'Team Leaders exported successfully';
      setSuccess(successMsg);
      toast.success(`✅ ${successMsg}`);
    } catch (err) {
      console.error('Error exporting team leaders:', err);
      const errorMsg = err.message || 'Failed to export team leaders';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchTeamLeaders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.limit, filters.status, sort]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (filters.page !== 1) {
        setFilters(prev => ({ ...prev, page: 1 }));
      } else {
        fetchTeamLeaders();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const totalTLs = teamLeaders.length;
    const activeTLs = teamLeaders.filter(tl => tl.status === 'active').length;
    const totalTeamMembers = teamLeaders.reduce((sum, tl) => sum + tl.totalHR, 0);
    const presentTeamMembers = teamLeaders.reduce((sum, tl) => sum + tl.presentHR, 0);
    const totalSavedLeads = teamLeaders.reduce((sum, tl) => sum + tl.savedLeads, 0);
    const totalOpenLeads = teamLeaders.reduce((sum, tl) => sum + tl.openLeads, 0);

    return {
      totalTLs,
      activeTLs,
      totalTeamMembers,
      presentTeamMembers,
      totalSavedLeads,
      totalOpenLeads,
      attendancePercentage: totalTeamMembers > 0 ? 
        ((presentTeamMembers / totalTeamMembers) * 100).toFixed(1) : 0
    };
  };

  const stats = calculateStats();

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
          <h1 className="text-3xl font-bold tracking-tight">All Team Leaders</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and monitor all team leaders with detailed performance metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Export */}
          <Button
            variant="outline"
            size="sm"
            onClick={exportTeamLeaders}
            disabled={loading}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          {/* Refresh */}
          <Button 
            onClick={fetchTeamLeaders} 
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
                <p className="text-sm text-gray-500">Total Team Leaders</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalTLs}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.activeTLs} active, {stats.totalTLs - stats.activeTLs} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Team Size</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalTeamMembers}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.presentTeamMembers} present ({stats.attendancePercentage}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Saved Leads</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalSavedLeads}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Bookmark className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Total leads saved by all TLs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Open Leads</p>
                <p className="text-3xl font-bold text-orange-600">{stats.totalOpenLeads}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Pending leads across all teams
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
                placeholder="Search team leaders by name, email, phone..."
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
                <SelectItem value="ex">Ex Team Leaders</SelectItem>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Leaders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Team Leaders List
            {teamLeaders.length > 0 && (
              <Badge variant="purple" className="ml-2">
                {teamLeaders.length} TLs
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
                    <TableHead sortable onSort={handleSort} sortKey="name" currentSort={sort}>
                      <UserCircle className="w-4 h-4 inline mr-1" />
                      Name
                    </TableHead>
                    <TableHead>
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone Number
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="status" currentSort={sort}>
                      <UserCheck className="w-4 h-4 inline mr-1" />
                      Status
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="attendance.todayStatus" currentSort={sort}>
                      <CalendarCheck className="w-4 h-4 inline mr-1" />
                      Attendance
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="savedLeads" currentSort={sort}>
                      <Bookmark className="w-4 h-4 inline mr-1" />
                      Saved Leads
                    </TableHead>
                    <TableHead>
                      <CalendarDays className="w-4 h-4 inline mr-1" />
                      Saved Date
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="totalHR" currentSort={sort}>
                      <Users className="w-4 h-4 inline mr-1" />
                      Total HR
                    </TableHead>
                    <TableHead>
                      <UserCheck className="w-4 h-4 inline mr-1" />
                      Present HR
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="pendingAccounts" currentSort={sort}>
                      <AlertCircle className="w-4 h-4 inline mr-1" />
                      Pending Accounts
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
                    <TableHead>
                      <FileText className="w-4 h-4 inline mr-1" />
                      Last Data
                    </TableHead>
                    <TableHead>
                      <CalendarIcon className="w-4 h-4 inline mr-1" />
                      Date Assigned
                    </TableHead>
                    <TableHead>
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Last Lead
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="salary" currentSort={sort}>
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Salary
                    </TableHead>
                    <TableHead>
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      RollBack Data
                    </TableHead>
                    <TableHead>
                      <CalendarDays className="w-4 h-4 inline mr-1" />
                      RollBack Date
                    </TableHead>
                    <TableHead>
                      <Users className="w-4 h-4 inline mr-1" />
                      New HR
                    </TableHead>
                    <TableHead>
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email Id
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="openLeads" currentSort={sort}>
                      <FileText className="w-4 h-4 inline mr-1" />
                      Open Leads
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
                      <TableCell colSpan={22} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center">
                          <RefreshCw className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                          <span className="text-lg">Loading team leaders...</span>
                          <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the data</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : teamLeaders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={22} className="text-center py-12 text-gray-500">
                        <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-xl font-medium">No team leaders found</p>
                        <p className="text-sm mt-2">
                          {(filters.search || filters.status !== 'all') 
                            ? 'Try adjusting your search filters' 
                            : 'No team leaders in the system yet'}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    teamLeaders.map((tl) => (
                      <TableRow key={tl._id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{tl.joinDate}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                              <User className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                            </div>
                            <div>
                              <p className="font-medium">{tl.name}</p>
                              <p className="text-xs text-gray-500">ID: {tl._id?.substring(0, 6)}...</p>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="font-mono text-sm">{tl.phoneNumber}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <StatusToggleButton 
                            user={tl}
                            onToggle={() => toggleTLStatus(tl._id)}
                            loading={actionLoading[tl._id]}
                          />
                        </TableCell>
                        
                        {/* Attendance */}
                        <TableCell>
                          <Badge 
                            variant={tl.attendanceStatus === 'present' || tl.attendanceStatus === 'late' || tl.attendanceStatus === 'half-day' ? 'success' : 'destructive'} 
                            className="min-w-[80px] justify-center"
                          >
                            {tl.attendanceStatus === 'present' || tl.attendanceStatus === 'late' || tl.attendanceStatus === 'half-day' ? 'Present' : 'Absent'}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-center">
                            {tl.savedLeads > 0 ? (
                              <Badge variant="success" className="text-lg px-3 py-1">
                                {tl.savedLeads}
                              </Badge>
                            ) : (
                              <span className="text-gray-500">0</span>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <span className="text-sm">{tl.savedDate}</span>
                        </TableCell>
                        
                        {/* Total HR - Clickable */}
                        <TableCell>
                          <div className="text-center">
                            <button
                              onClick={() => setTeamMembersModal({
                                isOpen: true,
                                tlId: tl._id,
                                tlName: tl.name,
                                filterType: 'all'
                              })}
                              className="font-bold text-lg text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                              title="Click to view all team members"
                            >
                              {tl.totalHR}
                            </button>
                          </div>
                        </TableCell>
                        
                        {/* Present HR - Clickable */}
                        <TableCell>
                          <div className="text-center">
                            <button
                              onClick={() => setTeamMembersModal({
                                isOpen: true,
                                tlId: tl._id,
                                tlName: tl.name,
                                filterType: 'present'
                              })}
                              className="font-bold text-green-600 hover:text-green-800 hover:underline cursor-pointer transition-colors"
                              title="Click to view present team members"
                            >
                              {tl.presentHR}
                            </button>
                            <p className="text-xs text-gray-500">present today</p>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-center">
                            {tl.pendingAccounts > 0 ? (
                              <Badge variant="warning">{tl.pendingAccounts}</Badge>
                            ) : (
                              <span className="text-green-600 font-medium">0</span>
                            )}
                          </div>
                        </TableCell>
                        
                        {/* Today Called */}
                        <TableCell>
                          <div className="text-center">
                            <span className="font-medium text-blue-600">{tl.todayCalled ?? 0}</span>
                          </div>
                        </TableCell>
                        
                        {/* Today Closed */}
                        <TableCell>
                          <div className="text-center">
                            <span className="font-medium text-green-600">{tl.todayClosed ?? 0}</span>
                          </div>
                        </TableCell>
                        
                        {/* Total Present */}
                        <TableCell>
                          <div className="text-center">
                            <span className="font-bold">{tl.totalPresent}</span>
                            <div className="text-xs text-gray-500">
                              <Clock className="w-3 h-3 inline mr-1" />
                              Days
                            </div>
                          </div>
                        </TableCell>
                        
                        {/* Last Data */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium">{tl.lastData}</span>
                          </div>
                        </TableCell>
                        
                        {/* Date Assigned */}
                        <TableCell>
                          <span className="text-sm">{tl.dateAssigned}</span>
                        </TableCell>
                        
                        {/* Last Lead */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{tl.lastLeadDate}</span>
                          </div>
                        </TableCell>
                        
                        {/* Salary */}
                        <TableCell>
                          <div className="text-right">
                            {tl.salary && tl.salary !== '-' ? (
                              <div className="flex items-center justify-end gap-1">
                                <span className="font-bold text-green-600">₹{typeof tl.salary === 'number' ? tl.salary.toLocaleString('en-IN') : tl.salary}</span>
                              </div>
                            ) : (
                              <span className="text-gray-500">{tl.salary}</span>
                            )}
                          </div>
                        </TableCell>
                        
                        {/* RollBack Data */}
                        <TableCell>
                          <div className="text-center">
                            {tl.rollbackData > 0 ? (
                              <Badge variant="destructive">{tl.rollbackData}</Badge>
                            ) : (
                              <span className="text-gray-500">0</span>
                            )}
                          </div>
                        </TableCell>
                        
                        {/* RollBack Date */}
                        <TableCell>
                          <span className="text-sm">{tl.rollbackDate}</span>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-center">
                            {tl.newHR > 0 ? (
                              <Badge variant="info">{tl.newHR} new</Badge>
                            ) : (
                              <span className="text-gray-500">0</span>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[200px]">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="text-sm truncate">{tl.email}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-center">
                            {tl.openLeads > 0 ? (
                              <div className="space-y-1">
                                <Badge variant={tl.openLeads > 10 ? 'destructive' : 'warning'}>
                                  {tl.openLeads}
                                </Badge>
                                {tl.conversionRate > 0 && (
                                  <p className="text-xs text-gray-500">
                                    {tl.conversionRate}% conversion
                                  </p>
                                )}
                              </div>
                            ) : (
                              <Badge variant="success">0</Badge>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              title="View Profile"
                            >
                              <Link to={`/admin/user/${tl._id}`}>
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => console.log('Edit TL:', tl._id)}
                              title="Edit TL"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            
                            <ActionMenu
                              user={tl}
                              onView={() => console.log('View TL details:', tl._id)}
                              onEdit={() => console.log('Edit TL:', tl._id)}
                              onStatus={() => console.log('Manage TL status:', tl._id)}
                              onBlock={() => markTLAsEx(tl._id)}
                              loading={actionLoading[tl._id]}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteTL(tl._id)}
                              disabled={actionLoading[tl._id]}
                              title="Delete TL"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
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
      {teamLeaders.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            Showing {teamLeaders.length} team leaders
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
              disabled={teamLeaders.length < filters.limit || loading}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Team Members Modal */}
      <TeamMembersModal
        isOpen={teamMembersModal.isOpen}
        onClose={() => setTeamMembersModal({ isOpen: false, tlId: null, tlName: '', filterType: 'all' })}
        tlId={teamMembersModal.tlId}
        tlName={teamMembersModal.tlName}
        filterType={teamMembersModal.filterType}
      />
    </div>
  );
}