import { useState, useEffect } from "react";
import { 
  Share2, 
  Users, 
  Calendar, 
  Filter, 
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MessageSquare,
  MoreVertical,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import tlService from "../../services/tlService";
// import AssignmentCard from "../components/AssignmentCard";
// import AssignLeadModal from "../components/modals/AssignLeadModal";
// import AssignmentStats from "../components/AssignmentStats";

/**
 * TL Assignments Page
 */
export default function TLAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'week',
    search: ''
  });
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    completed: 0
  });

  useEffect(() => {
    fetchAssignments();
    fetchTeamMembers();
  }, [filters.dateRange]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await tlService.getLeadAssignments();
      if (response.success) {
        setAssignments(response.data.assignments);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      // Mock data
      const mockAssignments = [
        {
          id: 1,
          leadId: "L001",
          leadName: "Rajesh Kumar",
          leadEmail: "rajesh@example.com",
          leadPhone: "9876543210",
          assignedTo: {
            id: "U001",
            name: "John Smith",
            email: "john@example.com"
          },
          assignedBy: "You",
          assignedDate: "2024-01-20T10:30:00Z",
          status: "accepted",
          dueDate: "2024-01-27",
          amount: 5000,
          category: "Insurance",
          notes: "Interested in life insurance",
          followUps: 2,
          lastFollowUp: "2024-01-22T14:30:00Z"
        },
        // Add more mock assignments...
      ];
      setAssignments(mockAssignments);
      setStats({
        total: 12,
        pending: 3,
        accepted: 6,
        rejected: 1,
        completed: 2
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await tlService.getTeamMembers();
      if (response.success) {
        setTeamMembers(response.data.teamMembers || []);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleAssignLead = (lead) => {
    setSelectedLead(lead);
    setShowAssignModal(true);
  };

  const handleStatusUpdate = async (assignmentId, newStatus) => {
    try {
      // Update assignment status
      console.log('Updating assignment:', assignmentId, 'to', newStatus);
      
      setAssignments(assignments.map(assignment => 
        assignment.id === assignmentId 
          ? { ...assignment, status: newStatus }
          : assignment
      ));

      // Update stats
      setStats(prev => ({
        ...prev,
        [assignment.status]: Math.max(0, prev[assignment.status] - 1),
        [newStatus]: prev[newStatus] + 1
      }));
    } catch (error) {
      console.error('Error updating assignment status:', error);
    }
  };

  const handleFollowUp = (assignmentId) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (assignment) {
      const updatedAssignment = {
        ...assignment,
        followUps: (assignment.followUps || 0) + 1,
        lastFollowUp: new Date().toISOString()
      };
      setAssignments(assignments.map(a => 
        a.id === assignmentId ? updatedAssignment : a
      ));
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (filters.status !== 'all' && assignment.status !== filters.status) {
      return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        assignment.leadName.toLowerCase().includes(searchLower) ||
        assignment.leadEmail.toLowerCase().includes(searchLower) ||
        assignment.assignedTo.name.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    accepted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Lead Assignments
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage and track lead assignments to team members
          </p>
        </div>
        
        <button
          onClick={() => setShowAssignModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center space-x-2 mt-4 md:mt-0"
        >
          <Share2 className="w-4 h-4" />
          <span>Assign New Lead</span>
        </button>
      </div>

      {/* Assignment Stats */}
      <AssignmentStats stats={stats} />

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search assignments by lead or team member..."
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {['all', 'pending', 'accepted', 'rejected', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleFilterChange({ status })}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
                    filters.status === status
                      ? 'bg-white dark:bg-gray-600 shadow'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange({ dateRange: e.target.value })}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignments Grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredAssignments.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAssignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              onStatusUpdate={handleStatusUpdate}
              onFollowUp={handleFollowUp}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <Share2 className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No assignments found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {filters.search ? 'Try a different search term' : 'Start by assigning your first lead'}
          </p>
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            Assign New Lead
          </button>
        </div>
      )}

      {/* Assignment Summary */}
      {filteredAssignments.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Assignment Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Average Response Time
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    2.4 hrs
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    Acceptance Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    85%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    Total Follow-ups
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    42
                  </p>
                </div>
                <MessageSquare className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Lead Modal */}
      {showAssignModal && (
        <AssignLeadModal
          teamMembers={teamMembers}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedLead(null);
          }}
          onAssign={(assignData) => {
            console.log('Assigning lead:', assignData);
            fetchAssignments(); // Refresh assignments
          }}
        />
      )}
    </div>
  );
}