import { useState, useEffect } from "react";
import { CheckCircle, XCircle, X, Download, Search, Filter, ChevronDown, Info } from "lucide-react";
import withdrawalService from "../../services/withdrawalService";
import { toast } from "react-hot-toast";

export default function PaymentWithdrawalTable() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [actionType, setActionType] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [comments, setComments] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Statuses");

  // Fetch withdrawals on component mount
  useEffect(() => {
    console.log('🔄 PaymentWithdrawalTable: Component mounted, fetching withdrawals...');
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      console.log('🌐 withdrawalService.getAllWithdrawals called');
      setLoading(true);
      const response = await withdrawalService.getAllWithdrawals({
        sortBy: 'requestDate',
        order: 'desc',
        limit: 100
      });
      console.log('📥 withdrawalService.getAllWithdrawals response:', response);
      
      if (response.success) {
        console.log('✅ Withdrawals data:', response.data.withdrawals);
        console.log('📊 Total withdrawals:', response.data.withdrawals.length);
        setWithdrawals(response.data.withdrawals);
      } else {
        console.error('❌ API returned success: false');
        toast.error('Failed to fetch withdrawals');
      }
    } catch (error) {
      console.error('❌ Error fetching withdrawals:', error);
      console.error('❌ Error details:', error.message);
      toast.error(error.message || 'Failed to fetch withdrawals');
    } finally {
      setLoading(false);
      console.log('✅ Loading complete');
    }
  };

  const statusColors = {
    pending: "bg-yellow-50 text-yellow-600 border-yellow-200",
    approved: "bg-green-50 text-green-600 border-green-200",
    rejected: "bg-red-50 text-red-600 border-red-200",
    processing: "bg-blue-50 text-blue-600 border-blue-200",
  };

  const handleAction = (withdrawal, action) => {
    setSelectedWithdrawal(withdrawal);
    setActionType(action);
    setShowModal(true);
  };

  const handleViewDetails = (withdrawal) => {
    console.log('📋 View Details clicked for:', withdrawal.withdrawalId);
    setSelectedWithdrawal(withdrawal);
    setShowDetailsModal(true);
    setSelectedAction("");
    setTransactionId("");
    setRejectReason("");
    setComments("");
  };

  const handleApprove = async () => {
    if (!transactionId.trim()) {
      toast.error("Please enter transaction ID");
      return;
    }
    
    try {
      console.log('🌐 withdrawalService.approveWithdrawal called for:', selectedWithdrawal.withdrawalId);
      console.log('📤 Approve data:', { transactionId: transactionId.trim(), adminNotes: comments.trim() });
      setProcessing(true);
      
      const response = await withdrawalService.approveWithdrawal(selectedWithdrawal.withdrawalId, {
        transactionId: transactionId.trim(),
        adminNotes: comments.trim()
      });
      
      console.log('📥 Approve withdrawal response:', response);
      
      if (response.success) {
        console.log('✅ Withdrawal approved successfully');
        toast.success('Withdrawal request approved successfully!');
        setShowDetailsModal(false);
        setSelectedAction("");
        setTransactionId("");
        setComments("");
        fetchWithdrawals(); // Refresh the list
      } else {
        console.error('❌ Approve failed:', response.message);
        toast.error(response.message || 'Failed to approve withdrawal');
      }
    } catch (error) {
      console.error('❌ Error approving withdrawal:', error);
      console.error('❌ Error details:', error.message);
      toast.error(error.message || 'Failed to approve withdrawal');
    } finally {
      setProcessing(false);
      console.log('✅ Approve process complete');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please enter rejection reason");
      return;
    }
    
    try {
      console.log('🌐 withdrawalService.rejectWithdrawal called for:', selectedWithdrawal.withdrawalId);
      console.log('📤 Reject data:', { reason: rejectReason.trim(), adminNotes: comments.trim() });
      setProcessing(true);
      
      const response = await withdrawalService.rejectWithdrawal(selectedWithdrawal.withdrawalId, {
        reason: rejectReason.trim(),
        adminNotes: comments.trim()
      });
      
      console.log('📥 Reject withdrawal response:', response);
      
      if (response.success) {
        console.log('✅ Withdrawal rejected successfully');
        toast.success('Withdrawal request rejected successfully!');
        setShowDetailsModal(false);
        setSelectedAction("");
        setRejectReason("");
        setComments("");
        fetchWithdrawals(); // Refresh the list
      } else {
        console.error('❌ Reject failed:', response.message);
        toast.error(response.message || 'Failed to reject withdrawal');
      }
    } catch (error) {
      console.error('❌ Error rejecting withdrawal:', error);
      console.error('❌ Error details:', error.message);
      toast.error(error.message || 'Failed to reject withdrawal');
    } finally {
      setProcessing(false);
      console.log('✅ Reject process complete');
    }
  };

  // Calculate statistics
  const totalRequests = withdrawals.length;
  const approvedRequests = withdrawals.filter(w => w.status === 'approved').length;
  const pendingRequests = withdrawals.filter(w => w.status === 'pending').length;
  const rejectedRequests = withdrawals.filter(w => w.status === 'rejected').length;

  // Filter withdrawals by search and status
  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const matchesSearch = searchTerm === "" || 
      withdrawal.withdrawalId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "All Statuses" || withdrawal.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    console.log("Exporting withdrawal data...");
    alert("Export functionality will be implemented soon!");
  };

  return (
    <div className="h-full flex flex-col p-2 sm:p-3 lg:p-4 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground">Payment Withdrawal Requests</h1>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export Data</span>
          <span className="sm:hidden">Export</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
        <div className="bg-card rounded-lg border border-border p-2 sm:p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Requests</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">{totalRequests}</p>
              <p className="text-xs text-muted-foreground hidden sm:block">Overall count of all withdrawal requests</p>
            </div>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-2 sm:p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Approved Requests</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">{approvedRequests}</p>
              <p className="text-xs text-muted-foreground hidden sm:block">Requests successfully processed and approved</p>
            </div>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-2 sm:p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Pending Requests</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">{pendingRequests}</p>
              <p className="text-xs text-muted-foreground hidden sm:block">Requests awaiting review or processing</p>
            </div>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-2 sm:p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Denied Requests</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">{rejectedRequests}</p>
              <p className="text-xs text-muted-foreground hidden sm:block">Requests that were rejected or cancelled</p>
            </div>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-2">
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Filter Requests</h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by Lead ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none bg-background border border-border rounded-lg px-4 py-2 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-auto"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="processing">Processing</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-card rounded-lg border border-border overflow-hidden mt-1">
        <div className="max-h-[500px] overflow-y-auto overflow-x-auto scrollbar-hide">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">WITHDRAWAL ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">USER NAME</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">EMAIL</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">REQUEST DATE</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">AMOUNT</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">STATUS</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">ACCOUNT NUMBER</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background">
              {filteredWithdrawals.map((withdrawal) => (
                <tr key={withdrawal.withdrawalId} className="hover:bg-muted/20">
                  <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{withdrawal.withdrawalId}</td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground whitespace-nowrap">{withdrawal.userId?.name || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{withdrawal.userId?.email || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{new Date(withdrawal.requestDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-foreground whitespace-nowrap">₹{withdrawal.amount?.toFixed(2) || '0.00'}</td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${statusColors[withdrawal.status]}`}>
                      {withdrawal.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{withdrawal.bankDetails?.accountNumber || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    <button
                      onClick={() => handleViewDetails(withdrawal)}
                      className="flex items-center gap-1 px-2 py-1 text-blue-600 hover:text-blue-800 text-xs font-medium cursor-pointer"
                      style={{ 
                        textDecoration: 'none', 
                        userSelect: 'none', 
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                        background: 'none', 
                        border: 'none',
                        outline: 'none',
                        WebkitTouchCallout: 'none',
                        WebkitTapHighlightColor: 'transparent'
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      onSelectStart={(e) => e.preventDefault()}
                      onDragStart={(e) => e.preventDefault()}
                    >
                      <Info className="w-3 h-3 pointer-events-none" />
                      <span style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>View Details</span>
                    </button>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-muted-foreground">
                    Loading withdrawal requests...
                  </td>
                </tr>
              )}
              {!loading && filteredWithdrawals.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-muted-foreground">
                    {searchTerm || filterStatus !== "All Statuses" 
                      ? "No withdrawal requests match your filters" 
                      : "No withdrawal requests found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="border-t border-border px-6 py-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground border border-border rounded">
                ← Previous
              </button>
              <span className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded">1</span>
              <span className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground cursor-pointer">2</span>
              <button className="px-3 py-1 text-sm text-primary hover:text-primary/80">
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border p-4 sm:p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-bold text-foreground whitespace-nowrap">
                Confirm {actionType === "approve" ? "Approval" : "Rejection"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-foreground mb-6 break-words">
              Are you sure you want to {actionType} withdrawal request for <strong>{selectedWithdrawal?.userId?.name || 'N/A'}</strong> with amount <strong>₹{selectedWithdrawal?.amount || 0}</strong>?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowModal(false)} 
                className={`flex-1 px-4 py-2 text-sm rounded-lg whitespace-nowrap ${
                  actionType === "approve" 
                    ? "bg-green-600 text-white hover:bg-green-700" 
                    : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                }`}
              >
                OK
              </button>
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground text-sm rounded-lg hover:bg-destructive/80 whitespace-nowrap">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-foreground">Withdrawal Details</h3>
              <button 
                onClick={() => setShowDetailsModal(false)} 
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Withdrawal Information */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-3">Withdrawal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Withdrawal ID:</span>
                    <span className="ml-2 font-medium text-foreground">{selectedWithdrawal.withdrawalId}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">User Name:</span>
                    <span className="ml-2 font-medium text-foreground">{selectedWithdrawal.userId?.name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <span className="ml-2 font-medium text-foreground">{selectedWithdrawal.userId?.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Request Date:</span>
                    <span className="ml-2 font-medium text-foreground">{new Date(selectedWithdrawal.requestDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="ml-2 font-semibold text-foreground text-lg">₹{selectedWithdrawal.amount?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium border ${statusColors[selectedWithdrawal.status]}`}>
                      {selectedWithdrawal.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-3">Bank Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Account Holder:</span>
                    <span className="ml-2 font-medium text-foreground">{selectedWithdrawal.bankDetails?.accountHolderName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Account Number:</span>
                    <span className="ml-2 font-medium text-foreground">{selectedWithdrawal.bankDetails?.accountNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bank Name:</span>
                    <span className="ml-2 font-medium text-foreground">{selectedWithdrawal.bankDetails?.bankName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">IFSC Code:</span>
                    <span className="ml-2 font-medium text-foreground">{selectedWithdrawal.bankDetails?.ifscCode || 'N/A'}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-muted-foreground">Branch Name:</span>
                    <span className="ml-2 font-medium text-foreground">{selectedWithdrawal.bankDetails?.branchName || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Action Section - Available for all withdrawals */}
              <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-4">Admin Action</h4>
                
                {/* Action Buttons */}
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => {
                      setSelectedAction("approve");
                      setRejectReason("");
                      setTransactionId("");
                      setComments("");
                    }}
                    className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors flex items-center gap-2 ${
                      selectedAction === "approve" 
                        ? "bg-green-600 text-white" 
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedAction("reject");
                      setRejectReason("");
                      setTransactionId("");
                      setComments("");
                    }}
                    className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors flex items-center gap-2 ${
                      selectedAction === "reject" 
                        ? "bg-red-600 text-white" 
                        : "bg-red-100 text-red-700 hover:bg-red-200"
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>

                {/* Approve Form - Only show when approve is selected */}
                {selectedAction === "approve" && (
                  <div className="border border-green-200 bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-4">
                    <h5 className="font-medium text-green-800 dark:text-green-200 mb-3">
                      Approve Payment
                    </h5>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Transaction ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                          placeholder="Enter transaction ID (e.g., TXN123456)"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Additional Comments (Optional)
                        </label>
                        <textarea
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                          rows={2}
                          placeholder="Add any additional notes..."
                        />
                      </div>
                      
                      <button
                        onClick={handleApprove}
                        disabled={processing}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {processing ? 'Processing...' : 'Confirm Approval'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Reject Form - Only show when reject is selected */}
                {selectedAction === "reject" && (
                  <div className="border border-red-200 bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-4">
                    <h5 className="font-medium text-red-800 dark:text-red-200 mb-3">
                      Reject Payment
                    </h5>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Rejection Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                          rows={3}
                          placeholder="Enter reason for rejection..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Additional Comments (Optional)
                        </label>
                        <textarea
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                          rows={2}
                          placeholder="Add any additional notes..."
                        />
                      </div>
                      
                      <button
                        onClick={handleReject}
                        disabled={processing}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-4 h-4" />
                        {processing ? 'Processing...' : 'Confirm Rejection'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
