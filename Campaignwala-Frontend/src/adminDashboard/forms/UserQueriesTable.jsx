import { useState, useEffect } from "react";
import { X, Send } from "lucide-react";
import Button from "../../components/Button.jsx";
import { useTheme } from "../../context-api/ThemeContext.jsx";
import queryService from "../../services/queryService.js";

export default function UserQueriesTable() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100,
    total: 0,
    pages: 0
  });

  // Fetch queries from API
  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: 'createdAt',
        order: 'desc'
      };

      const response = await queryService.getAllQueries(params);

      if (response.success) {
        // Transform API data to match UI format
        const transformedQueries = response.data.queries.map(query => ({
          id: query._id,
          user: query.user,
          email: query.email,
          subject: query.subject,
          message: query.message,
          date: formatDate(query.createdAt),
          status: query.status,
          hasReplied: query.hasReplied,
          replies: query.replies.map(reply => ({
            id: reply._id,
            message: reply.message,
            date: formatDate(reply.date),
            time: formatTime(reply.date)
          }))
        }));

        setQueries(transformedQueries);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages
        }));
      }
    } catch (err) {
      console.error('Error fetching queries:', err);
      setError(err.message || 'Failed to fetch queries');
    } finally {
      setLoading(false);
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Format time helper
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleReply = (query) => {
    setSelectedQuery(query);
    setShowReplyModal(true);
    setReplyMessage("");
  };

  const handleSendReply = async () => {
    if (replyMessage.trim()) {
      try {
        const replyData = {
          message: replyMessage.trim(),
          repliedByName: 'Admin'
        };

        const response = await queryService.addReply(selectedQuery.id, replyData);

        if (response.success) {
          // Update local state
          const newReply = {
            id: Date.now(),
            message: replyMessage.trim(),
            date: formatDate(new Date()),
            time: formatTime(new Date())
          };

          setQueries(queries.map(q =>
            q.id === selectedQuery.id ? {
              ...q,
              status: "Replied",
              hasReplied: true,
              replies: [...(q.replies || []), newReply]
            } : q
          ));

          setShowReplyModal(false);
          setReplyMessage("");
          alert('Reply sent successfully!');
        }
      } catch (err) {
        console.error('Error sending reply:', err);
        alert(err.message || 'Failed to send reply');
      }
    }
  };

  const handleCloseModal = () => {
    setShowReplyModal(false);
    setSelectedQuery(null);
    setReplyMessage("");
  };

  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground">QUERIES</h1>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading queries...</p>
        </div>
      ) : error ? (
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-destructive">Error: {error}</p>
          <button
            onClick={fetchQueries}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      ) : queries.length === 0 ? (
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-muted-foreground">No queries found</p>
        </div>
      ) : (
        <>
          {/* Queries Cards */}
          <div className="max-w-4xl mx-auto space-y-6">
            {queries.map((query) => (
          <div key={query.id} className="bg-card rounded-lg shadow-md border border-border p-6">
            {/* User Info Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{query.user}</h3>
                <p className="text-sm text-muted-foreground">{query.date}</p>
              </div>
              {/* Reply button with custom purple color #561ED0 */}
              <button
                onClick={() => handleReply(query)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  query.hasReplied 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'text-white hover:opacity-90'
                }`}
                style={{
                  backgroundColor: query.hasReplied ? undefined : '#561ED0'
                }}
              >
                {query.hasReplied ? 'Reply Again' : 'Reply'}
              </button>
            </div>
            
            {/* Query Subject */}
            <h4 className={`text-base font-medium mb-2 ${query.hasReplied ? 'text-green-600' : 'text-foreground'}`}>
              {query.subject}
            </h4>
            
            {/* Query Message */}
            <p className={`text-sm leading-relaxed mb-3 ${query.hasReplied ? 'text-green-700' : 'text-muted-foreground'}`}>
              {query.message}
            </p>
            
            {/* Email Info and Reply Count */}
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                Email: {query.email}
              </div>
              {query.hasReplied && query.replies && query.replies.length > 0 && (
                <div className="text-xs text-green-600 font-medium">
                  {query.replies.length} {query.replies.length === 1 ? 'Reply' : 'Replies'} Sent
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
        </>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedQuery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-border">
            {/* Modal Header - Fixed */}
            <div className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between flex-shrink-0 rounded-t-lg">
              <h2 className="text-xl font-semibold">Reply to Query</h2>
              <button 
                onClick={handleCloseModal}
                className="text-primary-foreground hover:text-primary-foreground/80 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Original Query Info */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Original Query:</h3>
                <div className="bg-muted rounded-lg p-4 space-y-2 text-foreground">
                  <div><span className="font-medium">From:</span> {selectedQuery.user} ({selectedQuery.email})</div>
                  <div><span className="font-medium">Date:</span> {selectedQuery.date}</div>
                  <div><span className="font-medium">Subject:</span> {selectedQuery.subject}</div>
                  <div><span className="font-medium">Message:</span> {selectedQuery.message}</div>
                </div>
              </div>

              {/* Previous Replies */}
              {selectedQuery.replies && selectedQuery.replies.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Previous Replies:</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto border border-border rounded-lg p-3 bg-muted">
                    {selectedQuery.replies.map((reply) => (
                      <div key={reply.id} className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs text-green-600 font-medium">Admin Reply</span>
                          <span className="text-xs text-green-500">{reply.date} at {reply.time}</span>
                        </div>
                        <p className="text-sm text-green-700">{reply.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply Input */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  {selectedQuery.hasReplied ? 'Send Another Reply:' : 'Your Reply:'}
                </h3>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your response here..."
                  className="w-full h-32 p-3 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendReply}
                  disabled={!replyMessage.trim()}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
