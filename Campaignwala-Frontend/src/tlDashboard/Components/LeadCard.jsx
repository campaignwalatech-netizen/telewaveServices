import { useState } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Eye,
  Share2,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  MessageSquare,
  AlertCircle
} from "lucide-react";

/**
 * Lead Card Component
 * Displays lead information and actions
 */
export default function LeadCard({ lead, onAssign, onApprove, onReject, onViewDetails }) {
  const [showActions, setShowActions] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleReject = () => {
    if (rejectReason.trim()) {
      onReject(rejectReason);
      setRejectReason('');
      setShowRejectModal(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {lead.name}
              </h4>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[lead.status]}`}>
                {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
              </span>
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-10">
                <button
                  onClick={() => {
                    onViewDetails();
                    setShowActions(false);
                  }}
                  className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
                <button
                  onClick={() => {
                    onAssign();
                    setShowActions(false);
                  }}
                  className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Assign Lead</span>
                </button>
                {lead.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        onApprove();
                        setShowActions(false);
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowRejectModal(true);
                        setShowActions(false);
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Lead Info */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">{lead.email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">{lead.phoneNumber}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatDate(lead.createdAt)}
            </span>
          </div>
        </div>

        {/* Category and Amount */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {lead.category?.name || 'N/A'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              ₹{lead.amount?.toLocaleString('en-IN') || '0'}
            </p>
          </div>
        </div>

        {/* Assigned To */}
        {lead.hrUserId?.name && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Assigned To</p>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                <User className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-medium text-gray-900 dark:text-white">
                {lead.hrUserId.name}
              </span>
            </div>
          </div>
        )}

        {/* Notes */}
        {lead.notes && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Notes</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
              {lead.notes}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onViewDetails}
            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </button>
          
          {lead.status === 'pending' && (
            <>
              <button
                onClick={onApprove}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                title="Approve"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                title="Reject"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
          
          <button
            onClick={onAssign}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
            title="Assign"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Reject Lead
                </h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Please provide a reason for rejecting this lead:
              </p>
              
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject Lead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}