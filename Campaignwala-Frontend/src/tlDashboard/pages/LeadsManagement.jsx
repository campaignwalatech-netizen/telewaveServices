import { useState, useEffect } from "react";
import { 
  Briefcase, 
  Filter, 
  Search, 
  Calendar, 
  User, 
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Download,
  Share2,
  Eye,
  Edit,
  MessageSquare,
  BarChart3
} from "lucide-react";
import axios from "axios";
import  api  from "../../services/api";

// Components
import LeadCard from "../Components/LeadCard";
// import LeadsFilter from "../Components/LeadsFilter";
// import AssignLeadModal from "../Components/modals/AssignLeadModal";
// import LeadsStats from "../Components/LeadsStats";

/**
 * Leads Management Page
 */
export default function LeadsManagement() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    search: ''
  });
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    fetchLeads();
  }, [filters]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${api}/api/leads/tl`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters
      });

      if (response.data.success) {
        setLeads(response.data.data.leads);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      // Mock data
      setLeads([
        {
          _id: "1",
          name: "Rajesh Kumar",
          email: "rajesh@example.com",
          phoneNumber: "9876543210",
          status: "pending",
          amount: 5000,
          createdAt: "2024-01-20T10:30:00Z",
          hrUserId: { name: "John Smith" },
          category: { name: "Insurance" },
          notes: "Interested in life insurance"
        },
        // Add more mock leads...
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleAssignLead = (lead) => {
    setSelectedLead(lead);
    setShowAssignModal(true);
  };

  const handleApproveLead = async (leadId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${api}/api/leads/${leadId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setLeads(leads.map(lead => 
          lead._id === leadId ? { ...lead, status: 'approved' } : lead
        ));
      }
    } catch (error) {
      console.error('Error approving lead:', error);
    }
  };

  const handleRejectLead = async (leadId, reason) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${api}/api/leads/${leadId}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setLeads(leads.map(lead => 
          lead._id === leadId ? { ...lead, status: 'rejected' } : lead
        ));
      }
    } catch (error) {
      console.error('Error rejecting lead:', error);
    }
  };

  const statusStats = {
    total: leads.length,
    pending: leads.filter(l => l.status === 'pending').length,
    approved: leads.filter(l => l.status === 'approved').length,
    completed: leads.filter(l => l.status === 'completed').length,
    rejected: leads.filter(l => l.status === 'rejected').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Leads Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage and assign leads to team members
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </button>
        </div>
      </div>

      {/* Leads Stats */}
      <LeadsStats stats={statusStats} />

      {/* Filters and Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads by name, email, or phone..."
                value={filters.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <LeadsFilter onFilterChange={handleFilterChange} />
            
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
              >
                <Briefcase className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Leads Grid/List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : leads.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leads.map((lead) => (
              <LeadCard
                key={lead._id}
                lead={lead}
                onAssign={() => handleAssignLead(lead)}
                onApprove={() => handleApproveLead(lead._id)}
                onReject={(reason) => handleRejectLead(lead._id, reason)}
                onViewDetails={() => setSelectedLead(lead)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => (
              <div
                key={lead._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        lead.status === 'pending' ? 'bg-yellow-500' :
                        lead.status === 'approved' ? 'bg-green-500' :
                        lead.status === 'completed' ? 'bg-blue-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {lead.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {lead.email} • {lead.phoneNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ₹{lead.amount}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleAssignLead(lead)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        title="Assign"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleApproveLead(lead._id)}
                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                        title="Approve"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <Briefcase className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No leads found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {filters.search ? 'Try a different search term' : 'No leads available for the selected filters'}
          </p>
          <button
            onClick={() => handleFilterChange({ status: 'all', search: '' })}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Assign Lead Modal */}
      {showAssignModal && selectedLead && (
        <AssignLeadModal
          lead={selectedLead}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedLead(null);
          }}
          onAssign={fetchLeads}
        />
      )}
    </div>
  );
}