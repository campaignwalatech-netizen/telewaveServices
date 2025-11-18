import { useState, useEffect } from "react";
import { Search, User, CreditCard, Building, CheckCircle, XCircle, ArrowLeft, Eye } from "lucide-react";
import userService from "../../services/userService";
import { toast } from "react-hot-toast";

export default function KYCReview() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentView, setCurrentView] = useState("table"); // "table" or "details"
  const [actionType, setActionType] = useState(""); // "approve" or "reject"
  const [kycUsers, setKycUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Fetch pending KYC requests on mount
  useEffect(() => {
    console.log('🔄 KYCReview: Component mounted, fetching pending KYC requests...');
    fetchPendingKYC();
  }, []);

  const fetchPendingKYC = async () => {
    try {
      console.log('🌐 userService.getPendingKYCRequests called');
      setLoading(true);
      const response = await userService.getPendingKYCRequests({
        page: 1,
        limit: 100,
        sortBy: 'kycDetails.kycSubmittedAt',
        order: 'desc'
      });
      console.log('📥 getPendingKYCRequests response:', response);
      
      if (response.success) {
        console.log('✅ Pending KYC requests:', response.data.users);
        console.log('📊 Total pending KYC:', response.data.users.length);
        
        // Transform data to match UI structure
        const transformedUsers = response.data.users.map(user => ({
          userId: user._id,
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'N/A',
          email: user.email || 'N/A',
          phone: user.phoneNumber || 'N/A',
          gender: user.gender || 'N/A',
          address: user.address1 || 'N/A',
          zipCode: user.zip || 'N/A',
          panNumber: user.kycDetails?.panNumber || 'N/A',
          aadhaarNumber: user.kycDetails?.aadhaarNumber || 'N/A',
          accountNumber: user.bankDetails?.accountNumber || 'N/A',
          ifscCode: user.bankDetails?.ifscCode || 'N/A',
          bankName: user.bankDetails?.bankName || 'N/A',
          branchAddress: user.bankDetails?.branchAddress || 'N/A',
          submittedDate: user.kycDetails?.kycSubmittedAt ? new Date(user.kycDetails.kycSubmittedAt).toISOString().split('T')[0] : 'N/A',
          status: 'Pending',
          // Store original user data
          originalData: user
        }));
        
        setKycUsers(transformedUsers);
      } else {
        console.error('❌ API returned success: false');
        toast.error('Failed to fetch KYC requests');
      }
    } catch (error) {
      console.error('❌ Error fetching KYC requests:', error);
      console.error('❌ Error details:', error.message);
      toast.error(error.message || 'Failed to fetch KYC requests');
    } finally {
      setLoading(false);
      console.log('✅ Loading complete');
    }
  };

  // Filter users based on search
  const filteredUsers = kycUsers.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (user, action) => {
    console.log('📋 View Details clicked for:', user.userId);
    setSelectedUser(user);
    setActionType(action);
    setCurrentView("details");
  };

  const handleBackToTable = () => {
    setCurrentView("table");
    setSelectedUser(null);
    setActionType("");
  };

  const handleApprove = async () => {
    try {
      console.log('🌐 userService.approveKYC called for:', selectedUser.userId);
      setProcessing(true);
      
      const response = await userService.approveKYC(selectedUser.userId, {
        remarks: 'KYC approved by admin'
      });
      
      console.log('📥 Approve KYC response:', response);
      
      if (response.success) {
        console.log('✅ KYC approved successfully');
        toast.success(`KYC approved for ${selectedUser.fullName}`);
        handleBackToTable();
        fetchPendingKYC(); // Refresh the list
      } else {
        console.error('❌ Approve failed:', response.message);
        toast.error(response.message || 'Failed to approve KYC');
      }
    } catch (error) {
      console.error('❌ Error approving KYC:', error);
      console.error('❌ Error details:', error.message);
      toast.error(error.message || 'Failed to approve KYC');
    } finally {
      setProcessing(false);
      console.log('✅ Approve process complete');
    }
  };

  const handleReject = async () => {
    const reason = prompt("Please enter reason for rejection:");
    if (!reason || reason.trim() === '') {
      toast.error('Rejection reason is required');
      return;
    }
    
    try {
      console.log('🌐 userService.rejectKYC called for:', selectedUser.userId);
      console.log('📤 Reject reason:', reason);
      setProcessing(true);
      
      const response = await userService.rejectKYC(selectedUser.userId, {
        reason: reason.trim()
      });
      
      console.log('📥 Reject KYC response:', response);
      
      if (response.success) {
        console.log('✅ KYC rejected successfully');
        toast.success(`KYC rejected for ${selectedUser.fullName}`);
        handleBackToTable();
        fetchPendingKYC(); // Refresh the list
      } else {
        console.error('❌ Reject failed:', response.message);
        toast.error(response.message || 'Failed to reject KYC');
      }
    } catch (error) {
      console.error('❌ Error rejecting KYC:', error);
      console.error('❌ Error details:', error.message);
      toast.error(error.message || 'Failed to reject KYC');
    } finally {
      setProcessing(false);
      console.log('✅ Reject process complete');
    }
  };

  return (
    <div className="h-full flex flex-col p-3 sm:p-4 bg-background">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {currentView === "details" && (
              <button
                onClick={handleBackToTable}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-semibold">
                K
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {currentView === "table" 
                ? "KYC Review - Pending Applications" 
                : `KYC Review - ${selectedUser?.fullName}`
              }
            </h1>
          </div>
        </div>

        {/* Search - Only show in table view */}
        {currentView === "table" && (
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {currentView === "table" ? (
          // Table View - List of KYC Applications
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                Pending KYC Applications ({filteredUsers.length})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] table-fixed">
                <colgroup>
                  <col className="w-24" />
                  <col className="w-40" />
                  <col className="w-56" />
                  <col className="w-32" />
                  <col className="w-28" />
                  <col className="w-24" />
                  <col className="w-40" />
                </colgroup>
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      User ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Full Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user) => (
                    <tr key={user.userId} className="hover:bg-muted/50">
                      <td className="px-4 py-4 text-sm font-medium text-foreground whitespace-nowrap">
                        {user.userId}
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground whitespace-nowrap">
                        {user.fullName}
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground truncate" title={user.email}>
                        {user.email}
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground whitespace-nowrap">
                        {user.phone}
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground whitespace-nowrap">
                        {user.submittedDate}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 whitespace-nowrap">
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleViewDetails(user, "view")}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {loading && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        Loading KYC requests...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              
              {!loading && filteredUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No KYC applications found matching your search.' : 'No pending KYC applications found.'}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Details View - Individual KYC Review
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Details Card */}
              <div className="bg-card rounded-lg border border-border p-5">
                <div className="flex items-center mb-4">
                  <User className="w-5 h-5 text-primary mr-2" />
                  <h2 className="text-base font-bold text-foreground">User Details</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      User ID
                    </label>
                    <p className="text-sm text-foreground font-medium">{selectedUser?.userId}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Full Name
                    </label>
                    <p className="text-sm text-foreground font-medium">{selectedUser?.fullName}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Email Address
                    </label>
                    <p className="text-sm text-foreground">{selectedUser?.email}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Phone Number
                    </label>
                    <p className="text-sm text-foreground">{selectedUser?.phone}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Gender
                    </label>
                    <p className="text-sm text-foreground">{selectedUser?.gender}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Address
                    </label>
                    <p className="text-sm text-foreground">{selectedUser?.address}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      ZIP Code
                    </label>
                    <p className="text-sm text-foreground">{selectedUser?.zipCode}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {/* PAN Card Details Card */}
                <div className="bg-card rounded-lg border border-border p-5">
                  <div className="flex items-center mb-4">
                    <CreditCard className="w-5 h-5 text-primary mr-2" />
                    <h2 className="text-base font-bold text-foreground">PAN Card Details</h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        PAN Number
                      </label>
                      <p className="text-sm text-foreground font-medium">{selectedUser?.panNumber}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Aadhaar Number
                      </label>
                      <p className="text-sm text-foreground font-medium">{selectedUser?.aadhaarNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Bank Account Details Card */}
                <div className="bg-card rounded-lg border border-border p-5">
                  <div className="flex items-center mb-4">
                    <Building className="w-5 h-5 text-primary mr-2" />
                    <h2 className="text-base font-bold text-foreground">Bank Account Details</h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Account Number
                      </label>
                      <p className="text-sm text-foreground font-medium">{selectedUser?.accountNumber}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        IFSC Code
                      </label>
                      <p className="text-sm text-foreground">{selectedUser?.ifscCode}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Bank Name
                      </label>
                      <p className="text-sm text-foreground">{selectedUser?.bankName}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Branch Address
                      </label>
                      <p className="text-sm text-foreground">{selectedUser?.branchAddress}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Always show in detail view */}
            <div className="mt-8 flex justify-center space-x-4">
              <button
                onClick={handleBackToTable}
                disabled={processing}
                className="px-6 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back to List
              </button>
              <button
                onClick={handleReject}
                disabled={processing}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="w-4 h-4" />
                <span>{processing ? 'Processing...' : 'Reject KYC'}</span>
              </button>
              <button
                onClick={handleApprove}
                disabled={processing}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{processing ? 'Processing...' : 'Approve KYC'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}