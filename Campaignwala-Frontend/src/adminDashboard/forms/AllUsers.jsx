import { useState, useEffect } from 'react';
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
  ChevronRight
} from 'lucide-react';

// Basic UI Components
const Table = ({ children, className = '' }) => (
  <div className={`w-full border rounded-lg overflow-hidden ${className}`}>
    <table className="w-full">{children}</table>
  </div>
);

const TableHeader = ({ children }) => (
  <thead className="bg-muted/50">{children}</thead>
);

const TableRow = ({ children, className = '' }) => (
  <tr className={`border-b transition-colors hover:bg-muted/50 ${className}`}>{children}</tr>
);

const TableHead = ({ children, className = '' }) => (
  <th className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground ${className}`}>
    {children}
  </th>
);

const TableBody = ({ children }) => (
  <tbody>{children}</tbody>
);

const TableCell = ({ children, className = '' }) => (
  <td className={`p-4 align-middle ${className}`}>{children}</td>
);

const Button = ({ children, variant = 'default', size = 'default', className = '', ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
  };
  const sizes = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 rounded-md text-xs'
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

const Select = ({ value, onValueChange, children, className = '' }) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  >
    {children}
  </select>
);

const SelectTrigger = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

const SelectValue = ({ placeholder }) => <option value="">{placeholder}</option>;

const SelectContent = ({ children }) => <>{children}</>;

const SelectItem = ({ value, children }) => (
  <option value={value}>{children}</option>
);

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    outline: 'text-foreground border',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200'
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

export default function AllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    page: 1,
    limit: 10
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: filters.page,
        limit: filters.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.status !== 'all' && { 
          ...(filters.status === 'ex' ? { isEx: true } : { isActive: filters.status === 'active' })
        })
      };

      const response = await userService.getAllUsers(params);
      
      if (response.success) {
        setUsers(response.data.users || []);
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
  }, [filters.page, filters.limit, filters.status]);

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

  // Handle status change
  const handleStatusChange = (value) => {
    setFilters(prev => ({ ...prev, status: value, page: 1 }));
  };

  // Handle search input
  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
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
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(userId);
        fetchUsers(); // Refresh the list
      } catch (err) {
        setError(err.message || 'Failed to delete user');
      }
    }
  };

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Hold': return 'warning';
      case 'Ex': return 'destructive';
      default: return 'secondary';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Users</h1>
          <p className="text-muted-foreground">
            Manage and view all registered users
          </p>
        </div>
        <Button onClick={fetchUsers} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or phone..."
                value={filters.search}
                onChange={handleSearchChange}
                className="pl-9"
              />
            </div>
            <Select value={filters.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="hold">Hold</SelectItem>
                <SelectItem value="ex">Ex Users</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Users Table */}
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
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2">Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No users found</p>
              {filters.search || filters.status !== 'all' ? (
                <p className="text-sm">Try adjusting your filters</p>
              ) : null}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Information</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Leads Stats</TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead>Joined On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-lg">{user.name || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">ID: {user.id?.substring(0, 8)}...</p>
                          {user.role === 'admin' && (
                            <Badge variant="outline" className="mt-1">Admin</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <p className="text-sm">{user.email || 'N/A'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <p className="text-sm">{user.phone || 'N/A'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(user.status)} className="text-xs">
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Total:</span>
                            <span className="font-medium">{user.totalLeads}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Completed:</span>
                            <span className="text-green-600">{user.completed}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pending:</span>
                            <span className="text-yellow-600">{user.pending}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Rejected:</span>
                            <span className="text-red-600">{user.rejected}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Total Earned:</span>
                            <span className="font-medium text-green-600">{user.totalEarnings}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Current Bal:</span>
                            <span className="text-blue-600">{user.currentBalance}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{formatDate(user.joinedOn)}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            title="View Details"
                          >
                            <Link to={`/admin/user-details/${user.id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleUserStatus(user.id, user.status)}
                            title={user.status === 'Active' ? 'Deactivate User' : 'Activate User'}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {user.status !== 'Ex' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markUserAsEx(user.id)}
                              title="Mark as Ex User"
                              className="text-orange-600 hover:text-orange-700"
                            >
                              EX
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteUser(user.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {users.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {users.length} users
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={filters.page === 1 || loading}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
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