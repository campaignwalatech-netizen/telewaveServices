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
  Upload
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
    ghost: 'hover:bg-accent hover:text-accent-foreground'
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
    info: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300'
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

// Status indicator component
const StatusIndicator = ({ isActive, isEx, className = '' }) => {
  if (isEx) {
    return <Badge variant="destructive" className={className}>Ex User</Badge>;
  }
  return isActive ? 
    <Badge variant="success" className={className}>Active</Badge> : 
    <Badge variant="warning" className={className}>Inactive</Badge>;
};

export default function AllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const tableRef = useRef(null);
  
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
    // Calculate lead statistics (you'll need to fetch this from your API)
    const totalLeads = user.leadStats?.total || 0;
    const completedLeads = user.leadStats?.completed || 0;
    const pendingLeads = user.leadStats?.pending || 0;
    const rejectedLeads = user.leadStats?.rejected || 0;
    
    // Calculate earnings (you'll need to fetch this from wallet service)
    const totalEarnings = user.walletStats?.totalEarned || 0;
    const currentBalance = user.walletStats?.currentBalance || 0;
    
    return {
      ...user,
      totalLeads,
      completedLeads,
      pendingLeads,
      rejectedLeads,
      totalEarnings: `₹${totalEarnings.toLocaleString('en-IN')}`,
      currentBalance: `₹${currentBalance.toLocaleString('en-IN')}`,
      joinDate: new Date(user.createdAt).toLocaleDateString('en-IN'),
      lastActive: user.lastActivity ? new Date(user.lastActivity).toLocaleDateString('en-IN') : 'Never'
    };
  };

  // Fetch users
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
          ...(filters.status === 'ex' ? { isEx: true } : { isActive: filters.status === 'active' })
        }),
        ...(filters.role !== 'all' && { role: filters.role })
      };

      const response = await userService.getAllUsers(params);
      
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

  // Toggle user status
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await userService.toggleUserStatus(userId);
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError(err.message || 'Failed to update user status');
    }
  };

  // Mark user as Ex
  const markUserAsEx = async (userId) => {
    if (window.confirm('Are you sure you want to mark this user as Ex?')) {
      try {
        await userService.markUserAsEx(userId);
        fetchUsers(); // Refresh the list
      } catch (err) {
        setError(err.message || 'Failed to mark user as Ex');
      }
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await userService.deleteUser(userId);
        fetchUsers(); // Refresh the list
      } catch (err) {
        setError(err.message || 'Failed to delete user');
      }
    }
  };

  // Export users
  const exportUsers = () => {
    // Implement export functionality
    console.log('Exporting users...');
  };

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
          <Button
            variant="outline"
            size="sm"
            onClick={exportUsers}
            title="Export Users"
          >
            <Upload className="w-4 h-4 mr-2" />
            Export
          </Button>
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

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or phone..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select 
                value={filters.status} 
                onValueChange={(value) => handleFilterChange('status', value)}
                placeholder="Status"
                className="w-full sm:w-[150px]"
              >
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="ex">Ex Users</SelectItem>
              </Select>

              <Select 
                value={filters.role} 
                onValueChange={(value) => handleFilterChange('role', value)}
                placeholder="Role"
                className="w-full sm:w-[150px]"
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

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
                    <TableHead>Contact</TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="role" currentSort={sort}>
                      Role
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="isActive" currentSort={sort}>
                      Status
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="totalLeads" currentSort={sort}>
                      Total Leads
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="completedLeads" currentSort={sort}>
                      Completed
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="pendingLeads" currentSort={sort}>
                      Pending
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="rejectedLeads" currentSort={sort}>
                      Rejected
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="totalEarnings" currentSort={sort}>
                      Total Earned
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="currentBalance" currentSort={sort}>
                      Current Balance
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="createdAt" currentSort={sort}>
                      Joined On
                    </TableHead>
                    <TableHead sortable onSort={handleSort} sortKey="lastActivity" currentSort={sort}>
                      Last Active
                    </TableHead>
                    <TableHead>KYC Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={15} className="text-center py-8">
                        <div className="flex justify-center items-center">
                          <RefreshCw className="w-8 h-8 animate-spin text-primary mr-3" />
                          <span>Loading users...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={15} className="text-center py-8 text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No users found</p>
                        {(filters.search || filters.status !== 'all' || filters.role !== 'all') && (
                          <p className="text-sm mt-1">Try adjusting your filters</p>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user._id} className="group">
                        <TableCell>
                          <div className="min-w-[200px]">
                            <p className="font-semibold text-foreground">{user.name}</p>
                            <p className="text-sm text-muted-foreground">ID: {user._id?.substring()}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 min-w-[180px]">
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                              <p className="text-sm truncate">{user.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                              <p className="text-sm">{user.phoneNumber}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              user.role === 'admin' ? 'destructive' : 
                              user.role === 'TL' ? 'info' : 'secondary'
                            }
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusIndicator 
                            isActive={user.isActive} 
                            isEx={user.isEx}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="text-center font-semibold text-foreground">
                            {user.totalLeads}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center text-green-600 font-medium">
                            {user.completedLeads}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center text-yellow-600 font-medium">
                            {user.pendingLeads}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center text-red-600 font-medium">
                            {user.rejectedLeads}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-green-600 font-semibold whitespace-nowrap">
                            {user.totalEarnings}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-blue-600 font-semibold whitespace-nowrap">
                            {user.currentBalance}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm whitespace-nowrap">
                            {user.joinDate}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm whitespace-nowrap text-muted-foreground">
                            {user.lastActive}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              user.kycDetails?.kycStatus === 'approved' ? 'success' :
                              user.kycDetails?.kycStatus === 'pending' ? 'warning' :
                              user.kycDetails?.kycStatus === 'rejected' ? 'destructive' : 'secondary'
                            }
                          >
                            {user.kycDetails?.kycStatus || 'Not Submitted'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2 min-w-[140px]">
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              title="View Details"
                            >
                              <Link to={`/admin/user/${user._id}`}>
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleUserStatus(user._id, user.isActive)}
                              title={user.isActive ? 'Deactivate User' : 'Activate User'}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {!user.isEx && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => markUserAsEx(user._id)}
                                title="Mark as Ex User"
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                              >
                                EX
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteUser(user._id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
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
          <div className="text-sm text-muted-foreground">
            Showing {users.length} of {users.length} users
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
    </div>
  );
}