import { Download, Search, Filter, X } from "lucide-react";
import { useState, useEffect } from "react";
import leadService from "../../services/leadService";

export default function LeadsTable({ status }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCampaign, setFilterCampaign] = useState("all");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    completed: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, [status, searchTerm, filterCampaign]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = {
        status: status === 'all' ? undefined : status,
        search: searchTerm || undefined,
        limit: 100
      };
      
      const response = await leadService.getAllLeads(params);
      
      if (response.success) {
        let fetchedLeads = response.data.leads || [];
        
        // Apply campaign filter
        if (filterCampaign !== 'all') {
          fetchedLeads = fetchedLeads.filter(lead => 
            lead.category?.toLowerCase().includes(filterCampaign.toLowerCase())
          );
        }
        
        // Format leads for display
        const formattedLeads = fetchedLeads.map(lead => ({
          _id: lead._id,
          leadId: lead.leadId,
          date: new Date(lead.createdAt).toISOString().split('T')[0],
          offerName: lead.offerName,
          category: lead.category,
          userName: lead.hrName,
          userContact: lead.hrContact,
          customerName: lead.customerName,
          customerContact: lead.customerContact,
          commission1: lead.commission1 || 'N/A',
          commission2: lead.commission2 || 'N/A',
          commission1Paid: lead.commission1Paid || false,
          commission2Paid: lead.commission2Paid || false,
          status: lead.status
        }));
        
        setLeads(formattedLeads);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await leadService.getLeadStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const [allLeads, setAllLeads] = useState({
    pending: [
      { 
        leadId: "LD001", 
        date: "2024-10-15", 
        offerName: "Brand Awareness Campaign",
        category: "Digital Marketing", 
        userName: "Rajesh Kumar", 
        userContact: "+91 9876543210", 
        customerName: "Amit Enterprises", 
        customerContact: "+91 9876543220", 
        offer: "₹50,000",
        status: "pending" 
      },
      { 
        leadId: "LD002", 
        date: "2024-10-16", 
        offerName: "Website Optimization",
        category: "SEO Campaign", 
        userName: "Priya Sharma", 
        userContact: "+91 9876543211", 
        customerName: "Tech Solutions Ltd", 
        customerContact: "+91 9876543221", 
        offer: "₹75,000",
        status: "pending" 
      },
      { 
        leadId: "LD003", 
        date: "2024-10-17", 
        offerName: "Instagram Growth Package",
        category: "Social Media", 
        userName: "Amit Patel", 
        userContact: "+91 9876543212", 
        customerName: "Fashion Hub", 
        customerContact: "+91 9876543222", 
        offer: "₹30,000",
        status: "pending" 
      },
    ],
    approved: [
      { 
        leadId: "LD004", 
        date: "2024-10-14", 
        offerName: "Email Newsletter Campaign",
        category: "Email Marketing", 
        userName: "Sneha Reddy", 
        userContact: "+91 9876543213", 
        customerName: "Global Corp", 
        customerContact: "+91 9876543223", 
        offer: "₹1,20,000",
        status: "approved" 
      },
      { 
        leadId: "LD005", 
        date: "2024-10-13", 
        offerName: "Blog Content Package",
        category: "Content Creation", 
        userName: "Vikram Singh", 
        userContact: "+91 9876543214", 
        customerName: "StartUp Inc", 
        customerContact: "+91 9876543224", 
        offer: "₹85,000",
        status: "approved" 
      },
    ],
    completed: [
      { 
        leadId: "LD006", 
        date: "2024-10-10", 
        offerName: "Brand Identity Campaign",
        category: "Brand Awareness", 
        userName: "Anita Desai", 
        userContact: "+91 9876543215", 
        customerName: "Retail Chain", 
        customerContact: "+91 9876543225", 
        offer: "₹2,50,000",
        status: "completed" 
      },
      { 
        leadId: "LD007", 
        date: "2024-10-08", 
        offerName: "New Product Marketing",
        category: "Product Launch", 
        userName: "Rohit Mehta", 
        userContact: "+91 9876543216", 
        customerName: "Innovation Labs", 
        customerContact: "+91 9876543226", 
        offer: "₹1,80,000",
        status: "completed" 
      },
    ],
    rejected: [
      { 
        leadId: "LD008", 
        date: "2024-10-12", 
        offerName: "Basic SEO Package",
        category: "SEO Services", 
        userName: "Kavita Joshi", 
        userContact: "+91 9876543217", 
        customerName: "Local Business", 
        customerContact: "+91 9876543227", 
        offer: "₹25,000",
        status: "rejected" 
      },
    ],
  });

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    approved: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  const handleExport = () => {
    console.log("Exporting leads...");
    alert("Export functionality will be implemented soon!");
  };

  const handleViewLead = (lead) => {
    setSelectedLead(lead);
    setShowViewModal(true);
  };

  // Function to handle status change
  const handleStatusChange = async (lead, newStatus) => {
    try {
      let response;
      
      if (newStatus === 'approved') {
        response = await leadService.approveLead(lead._id);
        if (response.success) {
          alert(response.message || 'Lead approved successfully!');
        }
      } else if (newStatus === 'completed') {
        response = await leadService.approveLead(lead._id);
        if (response.success) {
          alert(response.message || 'Lead completed successfully!');
        }
      } else if (newStatus === 'rejected') {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return; // User cancelled
        response = await leadService.rejectLead(lead._id, reason);
      } else {
        // For pending and completed, use updateLeadStatus
        response = await leadService.updateLeadStatus(lead._id, { status: newStatus });
      }
      
      if (response.success) {
        alert(`Lead status changed to ${newStatus} successfully!`);
        fetchLeads(); // Refresh the leads list
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
      alert('Failed to update lead status. Please try again.');
    }
  };

  return (
    <div className="h-full flex flex-col p-3 sm:p-4">
      {/* Header with Title */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground capitalize whitespace-nowrap">{status} Leads</h2>
        <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap ${statusColors[status]}`}>
          {leads.length} Total
        </span>
      </div>

      {/* Filters and Export in one line */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by ID, name, category, offer, contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <select
            value={filterCampaign}
            onChange={(e) => setFilterCampaign(e.target.value)}
            className="pl-9 pr-8 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
          >
            <option value="all">All Campaigns</option>
            <option value="marketing">Marketing</option>
            <option value="seo">SEO</option>
            <option value="social">Social Media</option>
          </select>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Table with fixed height */}
      <div className="flex-1 bg-card rounded-lg border border-border overflow-hidden flex flex-col min-h-0">
        <div className="overflow-x-auto scrollbar-custom flex-1">
          <table className="w-full min-w-[1400px]">
          <thead className="bg-muted">
            <tr>
              <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Date</th>
              <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Lead ID</th>
              <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Offer Name</th>
              <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Category</th>
              <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">USER Name</th>
              <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">USER Contact</th>
              <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Customer Name</th>
              <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Customer Contact</th>
              <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Commission 1</th>
              <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Commission 2</th>
              <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Status</th>
              <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-3 sm:px-4 md:px-6 py-6 sm:py-8 text-center text-sm text-muted-foreground">
                  No {status} leads found
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.leadId} className="hover:bg-muted/50">
                  <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm text-foreground whitespace-nowrap">{lead.date}</td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm font-medium text-foreground whitespace-nowrap">{lead.leadId}</td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm font-medium text-foreground whitespace-nowrap">{lead.offerName}</td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm text-foreground whitespace-nowrap">{lead.category}</td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm text-foreground whitespace-nowrap">{lead.userName}</td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm text-foreground whitespace-nowrap">{lead.userContact}</td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm text-foreground whitespace-nowrap">{lead.customerName}</td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm text-foreground whitespace-nowrap">{lead.customerContact}</td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm font-semibold text-foreground whitespace-nowrap">
                    <span className={lead.commission1Paid ? "text-gray-400 line-through" : "text-green-600"}>
                      ₹{lead.commission1}
                    </span>
                    {lead.commission1Paid && <span className="ml-2 text-xs text-green-600">✓ Paid</span>}
                  </td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm font-semibold text-foreground whitespace-nowrap">
                    <span className={lead.commission2Paid ? "text-gray-400 line-through" : "text-blue-600"}>
                      ₹{lead.commission2}
                    </span>
                    {lead.commission2Paid && <span className="ml-2 text-xs text-blue-600">✓ Paid</span>}
                  </td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm whitespace-nowrap">
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary ${statusColors[lead.status]}`}
                      disabled={lead.status === 'completed' || lead.status === 'rejected'}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="completed">Completed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm whitespace-nowrap">
                    <button 
                      onClick={() => handleViewLead(lead)}
                      className="text-primary hover:text-primary/80 text-sm font-semibold whitespace-nowrap"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-foreground">View Lead Details</h3>
              <button onClick={() => setShowViewModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Lead ID</label>
                <p className="text-sm text-muted-foreground">{selectedLead.leadId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Date</label>
                <p className="text-sm text-muted-foreground">{selectedLead.date}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Offer Name</label>
                <p className="text-sm font-medium text-foreground">{selectedLead.offerName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                <p className="text-sm text-muted-foreground">{selectedLead.category}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">USER Name</label>
                <p className="text-sm text-muted-foreground">{selectedLead.userName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">USER Contact</label>
                <p className="text-sm text-muted-foreground">{selectedLead.userContact}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Customer Name</label>
                <p className="text-sm text-muted-foreground">{selectedLead.customerName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Customer Contact</label>
                <p className="text-sm text-muted-foreground">{selectedLead.customerContact}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Commission 1</label>
                <p className="text-sm font-semibold text-green-600">{selectedLead.commission1}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Commission 2</label>
                <p className="text-sm font-semibold text-blue-600">{selectedLead.commission2}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[selectedLead.status]}`}>
                  {selectedLead.status.charAt(0).toUpperCase() + selectedLead.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}