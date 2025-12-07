import { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Filter, 
  Search, 
  Mail, 
  Phone, 
  TrendingUp,
  Award,
  Clock,
  MoreVertical,
  Eye,
  MessageSquare,
  BarChart3,
  Edit,
  Trash2
} from "lucide-react";
import axios from "axios";
import  api  from "../../services/api";

// Components
import TeamMemberCard from "../Components/TeamMemberCard";
import AddTeamMemberModal from "../Components/modals/AddTeamMemberModal";
// import TeamStats from "../Components/TeamStats";

/**
 * Team Management Page
 */
export default function TeamManagement() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    avgConversion: 0,
    totalEarnings: 0
  });

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${api}/api/users/tl/team-members`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setTeamMembers(response.data.data.teamMembers);
        setStats(response.data.data.teamStats);
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
      // Mock data for development
      setTeamMembers([
        {
          _id: "1",
          name: "John Smith",
          email: "john@example.com",
          phoneNumber: "9876543210",
          statistics: {
            totalLeads: 45,
            completedLeads: 32,
            pendingLeads: 8,
            totalEarnings: 8500,
            conversionRate: 71.1
          },
          performance: { rating: 4.5 },
          createdAt: "2024-01-15T10:30:00Z"
        },
        // Add more mock members...
      ]);
      setStats({
        totalMembers: 12,
        activeMembers: 8,
        avgConversion: 68.5,
        totalEarnings: 24500
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMember = async (memberData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${api}/api/users/tl/team-members`,
        memberData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setTeamMembers([...teamMembers, response.data.data.teamMember]);
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error adding team member:', error);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(
          `${api}/api/users/tl/team-members/${memberId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          setTeamMembers(teamMembers.filter(member => member._id !== memberId));
        }
      } catch (error) {
        console.error('Error removing team member:', error);
      }
    }
  };

  const handleViewDetails = (member) => {
    setSelectedMember(member);
    // Show member details modal or navigate to member page
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Team Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your team members and monitor their performance
          </p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center space-x-2 mt-4 md:mt-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Team Stats */}
      <TeamStats stats={stats} />

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search team members by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Sort by Performance</span>
            </button>
          </div>
        </div>
      </div>

      {/* Team Members Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <TeamMemberCard
              key={member._id}
              member={member}
              onViewDetails={() => handleViewDetails(member)}
              onRemove={() => handleRemoveMember(member._id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <Users className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No team members found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery ? 'Try a different search term' : 'Start by adding your first team member'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            Add Team Member
          </button>
        </div>
      )}

      {/* Add Team Member Modal */}
      {showAddModal && (
        <AddTeamMemberModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddMember}
        />
      )}
    </div>
  );
}