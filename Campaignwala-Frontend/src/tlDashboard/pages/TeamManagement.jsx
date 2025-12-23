import { useEffect, useState, useCallback } from 'react'
import {
  Users,
  Search,
  RefreshCw,
  Download,
  PhoneCall,
  CheckCircle,
  Calendar,
  Mail,
  DollarSign,
  UserCheck,
  FileText,
  Phone,
  UserX,
  MoreVertical,
} from 'lucide-react'

import userService from '../../services/userService'

// --------------------
// UI HELPERS
// --------------------
const Badge = ({ children, variant = 'default' }) => {
  const map = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${map[variant]}`}>
      {children}
    </span>
  )
}

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN') : '-'

const AttendanceBadge = ({ present, total }) => {
  const percentage = total > 0 ? ((present / total) * 100).toFixed(0) : 0
  
  let variant = 'default'
  if (percentage >= 90) variant = 'success'
  else if (percentage >= 75) variant = 'warning'
  else variant = 'danger'
  
  return (
    <Badge variant={variant}>
      {present}/{total} ({percentage}%)
    </Badge>
  )
}

// --------------------
// MAIN COMPONENT
// --------------------
export default function TeamManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalUsers, setTotalUsers] = useState(0)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    pages: 1,
  })

  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    page: 1,
    limit: 20,
  })

  // --------------------
  // FETCH TEAM USERS (Only users under logged-in TL)
  // --------------------
  const fetchTeamUsers = useCallback(async () => {
    try {
      setLoading(true)

      const params = {
        page: filters.page,
        limit: filters.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.status !== 'all' && { status: filters.status }),
      }

      const res = await userService.getTeamUsersWithStats(params)

      if (res.success) {
        // Handle embedded data structure
        const enriched = res.data.users.map((u) => {
          // Handle embedded attendance
          const attendanceData = u.attendance || {}
          const monthlyStats = attendanceData.monthlyStats || {}
          const totalWorkingDays = (monthlyStats.present || 0) + (monthlyStats.absent || 0) + (monthlyStats.late || 0) || 30
          const totalPresent = monthlyStats.present || 0
          
          // Handle rollback data
          const rollbackData = u.rollback || {}
          const rollbackTotal = rollbackData.total || 0
          const rollbackLastDate = rollbackData.lastDate
          
          // Handle statistics
          const stats = u.statistics || {}
          const called = stats.calledLeads || stats.called || 0
          const closed = stats.closedLeads || stats.closed || 0
          const conversion = called > 0 ? ((closed / called) * 100).toFixed(2) : '0.00'
          
          // Handle financials
          const financials = u.financials || {}
          
          // Handle lead distribution
          const leadDist = u.leadDistribution || {}
          
          // Handle withdraw data (might come from separate field or use rollback)
          const withdrawData = u.withdraw || {}
          const withdrawTotal = withdrawData.total || rollbackTotal
          
          return {
            ...u,
            // Main fields
            joinedOn: formatDate(u.createdAt),
            name: u.name,
            phoneNumber: u.phoneNumber,
            status: u.status,
            
            // Attendance - use the calculated values
            attendancePresent: totalPresent,
            attendanceTotal: totalWorkingDays,
            
            // Rollback
            rollbackData: rollbackTotal,
            rollbackDate: formatDate(rollbackLastDate),
            
            // Lead data
            lastData: formatDate(leadDist.lastLeadDate),
            called,
            closed,
            conversion,
            dateAssigned: formatDate(leadDist.lastAssignedDate),
            
            // Additional
            totalPresent,
            salary: financials.salary || '-',
            email: u.email,
            withdrawData: withdrawTotal,
          }
        })

        setUsers(enriched)
        setTotalUsers(res.data.pagination?.total || 0)
        setPagination(res.data.pagination || { page: 1, limit: 20, pages: 1 })
      }
    } catch (error) {
      console.error('Error fetching team users:', error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  // --------------------
  // EXPORT EXCEL
  // --------------------
  const exportExcel = async () => {
    try {
      const blob = await userService.exportUsers({
        format: 'excel',
        ...filters,
      })

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'team-management.xlsx'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting Excel:', error)
    }
  }

  // --------------------
  // ACTION HANDLERS
  // --------------------
  const handleStatusChange = async (userId, newStatus) => {
    try {
      const res = await userService.updateUserStatus(userId, { status: newStatus })
      if (res.success) {
        // Update local state
        setUsers(users.map(u => 
          u._id === userId ? { ...u, status: newStatus } : u
        ))
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleViewDetails = (userId) => {
    // Implement view details logic
    console.log('View details for:', userId)
  }

  // --------------------
  // EFFECTS
  // --------------------
  useEffect(() => {
    fetchTeamUsers()
  }, [fetchTeamUsers])

  // --------------------
  // PAGINATION
  // --------------------
  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }))
  }

  // --------------------
  // RENDER
  // --------------------
  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="text-blue-600" />
            Team Management
          </h1>
          <p className="text-gray-600">
            Manage your team members and track their performance
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportExcel}
            className="border px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <Download size={16} />
            Export Excel
          </button>

          <button
            onClick={fetchTeamUsers}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded shadow flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-3 text-gray-400" size={16} />
          <input
            placeholder="Search name / phone / email"
            className="pl-10 border rounded w-full h-10 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.search}
            onChange={(e) =>
              setFilters((p) => ({ ...p, search: e.target.value, page: 1 }))
            }
          />
        </div>

        <select
          className="border rounded h-10 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filters.status}
          onChange={(e) =>
            setFilters((p) => ({ ...p, status: e.target.value, page: 1 }))
          }
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="hold">Hold</option>
          <option value="dead">Dead</option>
        </select>

        <div className="text-gray-600 flex items-center">
          Total Members: <span className="font-bold ml-1">{totalUsers}</span>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full min-w-max">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="p-3 text-left">Joined On</th>
              <th className="text-left">Name</th>
              <th className="text-left">Phone Number</th>
              <th className="text-left">Status</th>
              <th className="text-left">Attendance</th>
              <th className="text-left">RollBack Data</th>
              <th className="text-left">RollBack Date</th>
              <th className="text-left">Last Data</th>
              <th className="text-left">Called</th>
              <th className="text-left">Closed</th>
              <th className="text-left">Date Assigned</th>
              <th className="text-left">Total Present</th>
              <th className="text-left">Salary</th>
              <th className="text-left">Email Id</th>
              <th className="text-left">Withdraw Data</th>
              <th className="text-left">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan="16" className="text-center p-8">
                  <RefreshCw className="animate-spin mx-auto mb-2" />
                  Loading team data...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="16" className="text-center p-8 text-gray-500">
                  No team members found
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                  {/* Joined On */}
                  <td className="p-3">{u.joinedOn}</td>
                  
                  {/* Name */}
                  <td className="font-medium">{u.name}</td>
                  
                  {/* Phone Number */}
                  <td>
                    <div className="flex items-center gap-1">
                      <Phone size={14} className="text-gray-500" />
                      {u.phoneNumber || '-'}
                    </div>
                  </td>
                  
                  {/* Status */}
                  <td>
                    <Badge
                      variant={
                        u.status === 'active'
                          ? 'success'
                          : u.status === 'hold'
                          ? 'warning'
                          : 'danger'
                      }
                    >
                      {u.status}
                    </Badge>
                  </td>
                  
                  {/* Attendance */}
                  <td>
                    <AttendanceBadge 
                      present={u.attendancePresent} 
                      total={u.attendanceTotal} 
                    />
                  </td>
                  
                  {/* RollBack Data */}
                  <td>
                    <Badge variant="danger">{u.rollbackData}</Badge>
                  </td>
                  
                  {/* RollBack Date */}
                  <td>{u.rollbackDate}</td>
                  
                  {/* Last Data */}
                  <td>{u.lastData}</td>
                  
                  {/* Called */}
                  <td>
                    <div className="flex items-center gap-1">
                      <PhoneCall size={14} className="text-blue-500" />
                      {u.called}
                    </div>
                  </td>
                  
                  {/* Closed */}
                  <td>
                    <div className="flex items-center gap-1">
                      <CheckCircle size={14} className="text-green-500" />
                      {u.closed}
                    </div>
                  </td>
                  
                  {/* Date Assigned */}
                  <td>{u.dateAssigned}</td>
                  
                  {/* Total Present */}
                  <td>
                    <div className="flex items-center gap-1">
                      <UserCheck size={14} className="text-purple-500" />
                      {u.totalPresent}
                    </div>
                  </td>
                  
                  {/* Salary */}
                  <td className="font-semibold text-green-600">
                    {u.salary === '-' ? '-' : `₹${u.salary}`}
                  </td>
                  
                  {/* Email Id */}
                  <td className="truncate max-w-[200px]">
                    <div className="flex items-center gap-1">
                      <Mail size={14} className="text-gray-500" />
                      {u.email || '-'}
                    </div>
                  </td>
                  
                  {/* Withdraw Data */}
                  <td>
                    <div className="flex items-center gap-1">
                      <FileText size={14} className="text-orange-500" />
                      {u.withdrawData}
                    </div>
                  </td>
                  
                  {/* Action */}
                  <td>
                    <div className="relative group">
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <MoreVertical size={18} />
                      </button>
                      <div className="absolute right-0 mt-1 w-48 bg-white border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                        <button
                          onClick={() => handleViewDetails(u._id)}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleStatusChange(u._id, 'active')}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-green-600 transition-colors"
                          disabled={u.status === 'active'}
                        >
                          Mark as Active
                        </button>
                        <button
                          onClick={() => handleStatusChange(u._id, 'hold')}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-yellow-600 transition-colors"
                          disabled={u.status === 'hold'}
                        >
                          Mark as Hold
                        </button>
                        <button
                          onClick={() => handleStatusChange(u._id, 'dead')}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 transition-colors"
                          disabled={u.status === 'dead'}
                        >
                          Mark as Dead
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, totalUsers)} of {totalUsers} entries
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`px-3 py-1 border rounded ${pagination.page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 transition-colors'}`}
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                let pageNum
                if (pagination.pages <= 5) {
                  pageNum = i + 1
                } else if (pagination.page <= 3) {
                  pageNum = i + 1
                } else if (pagination.page >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + i
                } else {
                  pageNum = pagination.page - 2 + i
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 border rounded transition-colors ${pagination.page === pageNum ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className={`px-3 py-1 border rounded ${pagination.page === pagination.pages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 transition-colors'}`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}