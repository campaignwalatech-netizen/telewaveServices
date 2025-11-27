import { useState, useEffect } from "react";
import { CheckCircle, XCircle, X, Download, Search, Filter, ChevronDown, Info, Upload, Clock, AlertCircle, Ban } from "lucide-react";
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
  const [sortBy, setSortBy] = useState("requestDate");
  const [sortOrder, setSortOrder] = useState("desc");

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
        sortBy: sortBy,
        order: sortOrder,
        limit: 100
      });
      console.log('📥 withdrawalService.getAllWithdrawals response:', response);
      
      if (response.success) {
        console.log('✅ Withdrawals data:', response.data.withdrawals);
        console.log('📊 Total withdrawals:', response.data.withdrawals?.length || 0);
        setWithdrawals(response.data.withdrawals || []);
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
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    approved: "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    processing: "bg-blue-50 text-blue-700 border-blue-200",
    cancelled: "bg-gray-50 text-gray-700 border-gray-200"
  };

  const statusIcons = {
    pending: <Clock className="w-3 h-3" />,
    approved: <CheckCircle className="w-3 h-3" />,
    rejected: <XCircle className="w-3 h-3" />,
    processing: <Clock className="w-3 h-3" />,
    cancelled: <Ban className="w-3 h-3" />
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
      console.log('🌐 withdrawalService.approveWithdrawal called for:', selectedWithdrawal._id);
      console.log('📤 Approve data:', { 
        transactionId: transactionId.trim(), 
        adminNotes: comments.trim() 
      });
      setProcessing(true);
      
      const response = await withdrawalService.approveWithdrawal(selectedWithdrawal._id, {
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
      console.log('🌐 withdrawalService.rejectWithdrawal called for:', selectedWithdrawal._id);
      console.log('📤 Reject data:', { 
        reason: rejectReason.trim(), 
        adminNotes: comments.trim() 
      });
      setProcessing(true);
      
      const response = await withdrawalService.rejectWithdrawal(selectedWithdrawal._id, {
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
  const processingRequests = withdrawals.filter(w => w.status === 'processing').length;

  // Calculate total amounts
  const totalAmount = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);
  const pendingAmount = withdrawals
    .filter(w => w.status === 'pending')
    .reduce((sum, w) => sum + (w.amount || 0), 0);

  // Filter withdrawals by search and status
  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const matchesSearch = searchTerm === "" || 
      withdrawal.withdrawalId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.bankDetails?.accountNumber?.includes(searchTerm);
    
    const matchesStatus = filterStatus === "All Statuses" || withdrawal.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    console.log("Exporting withdrawal data...");
    // Simple CSV export implementation
    const headers = ['Withdrawal ID', 'User Name', 'Email', 'Amount', 'Status', 'Request Date', 'Account Number', 'Bank Name'];
    const csvData = filteredWithdrawals.map(w => [
      w.withdrawalId,
      w.userId?.name || 'N/A',
      w.userId?.email || 'N/A',
      `₹${w.amount?.toFixed(2) || '0.00'}`,
      w.status,
      new Date(w.requestDate).toLocaleDateString(),
      w.bankDetails?.accountNumber || 'N/A',
      w.bankDetails?.bankName || 'N/A'
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `withdrawals-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully!');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      processing: 'Processing',
      cancelled: 'Cancelled'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="h-full flex flex-col p-4 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Withdrawal Requests</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage and process user withdrawal requests
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalRequests}</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingRequests}</p>
            </div>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Approved</p>
              <p className="text-2xl font-bold text-green-600">{approvedRequests}</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{rejectedRequests}</p>
            </div>
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Amount</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">₹{totalAmount.toFixed(2)}</p>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending Amount</p>
              <p className="text-lg font-bold text-yellow-600">₹{pendingAmount.toFixed(2)}</p>
            </div>
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, name, email, or account number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  WITHDRAWAL ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  USER DETAILS
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  REQUEST DATE
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  AMOUNT
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  STATUS
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  BANK DETAILS
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-800">
              {filteredWithdrawals.map((withdrawal) => (
                <tr key={withdrawal._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white whitespace-nowrap">
                    {withdrawal.withdrawalId}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {withdrawal.userId?.name || 'N/A'}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                        {withdrawal.userId?.email || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                    {formatDateTime(withdrawal.requestDate)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      ₹{withdrawal.amount?.toFixed(2) || '0.00'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusColors[withdrawal.status]}`}>
                      {statusIcons[withdrawal.status]}
                      {getStatusDisplay(withdrawal.status)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-col">
                      <span className="text-gray-900 dark:text-white font-mono">
                        {withdrawal.bankDetails?.accountNumber ? `****${withdrawal.bankDetails.accountNumber.slice(-4)}` : 'N/A'}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                        {withdrawal.bankDetails?.bankName || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    <button
                      onClick={() => handleViewDetails(withdrawal)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <Info className="w-3 h-3" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
              
              {loading && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      Loading withdrawal requests...
                    </div>
                  </td>
                </tr>
              )}
              
              {!loading && filteredWithdrawals.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center gap-3">
                      <Info className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white mb-1">No withdrawal requests found</p>
                        <p className="text-sm">
                          {searchTerm || filterStatus !== "All Statuses" 
                            ? "Try adjusting your search or filter criteria" 
                            : "There are no withdrawal requests at the moment"}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Withdrawal Request Details</h3>
              <button 
                onClick={() => setShowDetailsModal(false)} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Withdrawal Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Withdrawal ID:</span>
                      <span className="font-mono text-gray-900 dark:text-white">{selectedWithdrawal.withdrawalId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Request Date:</span>
                      <span className="text-gray-900 dark:text-white">{formatDateTime(selectedWithdrawal.requestDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusColors[selectedWithdrawal.status]}`}>
                        {statusIcons[selectedWithdrawal.status]}
                        {getStatusDisplay(selectedWithdrawal.status)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400 text-lg">
                        ₹{selectedWithdrawal.amount?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">User Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Name:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedWithdrawal.userId?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Email:</span>
                      <span className="text-gray-900 dark:text-white">{selectedWithdrawal.userId?.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                      <span className="text-gray-900 dark:text-white">{selectedWithdrawal.userId?.phoneNumber || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Bank Account Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Account Holder:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedWithdrawal.bankDetails?.accountHolderName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Account Number:</span>
                    <span className="font-mono text-gray-900 dark:text-white">{selectedWithdrawal.bankDetails?.accountNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Bank Name:</span>
                    <span className="text-gray-900 dark:text-white">{selectedWithdrawal.bankDetails?.bankName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">IFSC Code:</span>
                    <span className="font-mono text-gray-900 dark:text-white">{selectedWithdrawal.bankDetails?.ifscCode || 'N/A'}</span>
                  </div>
                  <div className="md:col-span-2 flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Branch:</span>
                    <span className="text-gray-900 dark:text-white text-right">{selectedWithdrawal.bankDetails?.branchName || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Admin Actions - Only show for pending/processing withdrawals */}
              {(selectedWithdrawal.status === 'pending' || selectedWithdrawal.status === 'processing') && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Admin Action Required</h4>
                  
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
                          : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50"
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve Payment
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
                          : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Request
                    </button>
                  </div>

                  {/* Approve Form */}
                  {selectedAction === "approve" && (
                    <div className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <h5 className="font-medium text-green-800 dark:text-green-200 mb-3">
                        Approve Withdrawal Payment
                      </h5>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Transaction ID <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            placeholder="Enter bank transaction ID (e.g., TXN123456789)"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Additional Notes (Optional)
                          </label>
                          <textarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            rows={3}
                            placeholder="Add any additional notes or comments..."
                          />
                        </div>
                        
                        <button
                          onClick={handleApprove}
                          disabled={processing || !transactionId.trim()}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {processing ? 'Processing Approval...' : 'Confirm Approval'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Reject Form */}
                  {selectedAction === "reject" && (
                    <div className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                      <h5 className="font-medium text-red-800 dark:text-red-200 mb-3">
                        Reject Withdrawal Request
                      </h5>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Rejection Reason <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                            rows={3}
                            placeholder="Please provide a clear reason for rejecting this withdrawal request..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Additional Comments (Optional)
                          </label>
                          <textarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                            rows={2}
                            placeholder="Add any additional notes..."
                          />
                        </div>
                        
                        <button
                          onClick={handleReject}
                          disabled={processing || !rejectReason.trim()}
                          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <XCircle className="w-4 h-4" />
                          {processing ? 'Processing Rejection...' : 'Confirm Rejection'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Show transaction details for approved withdrawals */}
              {selectedWithdrawal.status === 'approved' && selectedWithdrawal.transactionDetails && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Transaction Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Transaction ID:</span>
                      <span className="font-mono text-gray-900 dark:text-white">{selectedWithdrawal.transactionDetails.transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Approved Date:</span>
                      <span className="text-gray-900 dark:text-white">{formatDateTime(selectedWithdrawal.approvedDate)}</span>
                    </div>
                    {selectedWithdrawal.transactionDetails.adminNotes && (
                      <div className="md:col-span-2">
                        <span className="text-gray-600 dark:text-gray-400">Admin Notes:</span>
                        <p className="text-gray-900 dark:text-white mt-1">{selectedWithdrawal.transactionDetails.adminNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Show rejection details for rejected withdrawals */}
              {selectedWithdrawal.status === 'rejected' && selectedWithdrawal.rejectionDetails && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Rejection Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Rejection Reason:</span>
                      <span className="text-gray-900 dark:text-white">{selectedWithdrawal.rejectionDetails.reason}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Rejected Date:</span>
                      <span className="text-gray-900 dark:text-white">{formatDateTime(selectedWithdrawal.rejectedDate)}</span>
                    </div>
                    {selectedWithdrawal.rejectionDetails.adminNotes && (
                      <div className="md:col-span-2">
                        <span className="text-gray-600 dark:text-gray-400">Admin Notes:</span>
                        <p className="text-gray-900 dark:text-white mt-1">{selectedWithdrawal.rejectionDetails.adminNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}