import { useState, useEffect } from "react";
import { Edit2, Trash2, X, Download, Search, Filter, Upload, CheckCircle, Copy, Video, Loader2, Link as LinkIcon } from "lucide-react";
import { getAllOffers, deleteOffer, updateOffer } from "../../services/offerService";
import { getAllCategories } from "../../services/categoryService";

export default function AllOffersTable() {
  const [Offers, setOffers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Fetch offers on component mount
  useEffect(() => {
    fetchOffers();
    fetchCategories();
  }, [searchTerm]);

  const fetchCategories = async () => {
    try {
      const response = await getAllCategories({ 
        status: 'active',
        limit: 100,
        sortBy: 'name',
        order: 'asc'
      });
      
      if (response.success && response.data.categories) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        search: searchTerm,
        page: 1,
        limit: 100,
        sortBy: 'createdAt',
        order: 'desc'
      };

      const response = await getAllOffers(params);
      
      if (response.success) {
        setOffers(response.data.offers);
      } else {
        setError(response.message || 'Failed to fetch offers');
      }
    } catch (err) {
      console.error('Error fetching offers:', err);
      setError(err.response?.data?.message || 'Failed to load offers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;

    try {
      setDeleting(true);
      const response = await deleteOffer(selectedProduct._id);
      
      if (response.success) {
        setOffers(Offers.filter(p => p._id !== selectedProduct._id));
        setShowDeleteModal(false);
        setAlertMessage(`"${selectedProduct.name}" deleted successfully!`);
        setShowSuccessAlert(true);
        setTimeout(() => setShowSuccessAlert(false), 3000);
        setSelectedProduct(null);
      } else {
        alert(response.message || 'Failed to delete offer');
      }
    } catch (err) {
      console.error('Error deleting offer:', err);
      alert(err.response?.data?.message || 'Failed to delete offer. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setEditForm({ ...product });
    setShowEditModal(true);
  };

  const confirmEdit = async () => {
    if (!selectedProduct) return;

    try {
      setUpdating(true);
      const response = await updateOffer(selectedProduct._id, editForm);
      
      if (response.success) {
        setOffers(Offers.map(p => p._id === selectedProduct._id ? response.data : p));
        setShowEditModal(false);
        setAlertMessage(`"${editForm.name}" updated successfully!`);
        setShowSuccessAlert(true);
        setTimeout(() => setShowSuccessAlert(false), 3000);
        setSelectedProduct(null);
      } else {
        alert(response.message || 'Failed to update offer');
      }
    } catch (err) {
      console.error('Error updating offer:', err);
      alert(err.response?.data?.message || 'Failed to update offer. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleExport = () => {
    try {
      const csvData = Offers.map(offer => ({
        Name: offer.name,
        Category: offer.category,
        'Latest Stage': offer.latestStage,
        'Commission 1': offer.commission1,
        'Commission 2': offer.commission2,
        Created: new Date(offer.createdAt).toLocaleDateString()
      }));

      const headers = Object.keys(csvData[0]).join(',');
      const rows = csvData.map(row => Object.values(row).join(',')).join('\n');
      const csv = `${headers}\n${rows}`;

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `offers_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      setAlertMessage("Offers exported successfully!");
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
    } catch (err) {
      console.error('Error exporting offers:', err);
      alert('Failed to export offers');
    }
  };

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    setAlertMessage("Link copied to clipboard!");
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 3000);
  };

  const filteredOffers = Offers;

  return (
    <div className="h-full flex flex-col p-3 sm:p-4">
      {/* Success Alert */}
      {showSuccessAlert && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {alertMessage}
        </div>
      )}

      {/* Header */}
      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">All Offers</h2>

      {/* Filters and Actions */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search offers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto scrollbar-custom min-h-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-foreground">Loading offers...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-destructive mb-4">
              <X className="w-16 h-16" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Offers</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={fetchOffers}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No offers found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? `No offers match "${searchTerm}"` : 'No offers available'}
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead className="bg-muted sticky top-0 z-10">
              <tr className="border-b border-border">
                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Image</th>
                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Date</th>
                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Offers Name</th>
                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Category</th>
                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Latest Stage</th>
                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Commission 1</th>
                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Commission 2</th>
                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Link</th>
                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Video</th>
                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>{filteredOffers.map((product, index) => {
              const gradientColors = [
                'from-purple-500 to-pink-500',
                'from-blue-500 to-cyan-500',
                'from-green-500 to-emerald-500',
                'from-orange-500 to-red-500',
                'from-indigo-500 to-purple-500',
                'from-yellow-500 to-orange-500'
              ];
              const gradient = gradientColors[index % gradientColors.length];
              
              return (
              <tr key={product._id} className="border-b border-border hover:bg-muted/50">
                <td className="px-3 py-2">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-12 h-12 rounded object-cover" />
                  ) : (
                    <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded flex items-center justify-center text-white font-bold text-lg`}>
                      {product.name?.charAt(0)?.toUpperCase() || 'O'}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                  {new Date(product.createdAt).toLocaleDateString()}
                </td>
                <td className="px-3 py-2 font-medium whitespace-nowrap">{product.name}</td>
                <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{product.category}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className="px-2 py-1 rounded text-xs bg-muted whitespace-nowrap">{product.latestStage || 'Pending'}</span>
                </td>
                <td className="px-3 py-2 text-green-600 font-semibold whitespace-nowrap">{product.commission1}</td>
                <td className="px-3 py-2 text-blue-600 font-semibold whitespace-nowrap">{product.commission2}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {product.link ? (
                    <button
                      onClick={() => handleCopyLink(product.link)}
                      className="text-primary hover:text-primary/80"
                      title="Copy Link"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                  )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {product.video ? (
                    <a
                      href={product.video}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80"
                      title="View Video"
                    >
                      <Video className="w-4 h-4" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                  )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-primary hover:text-primary/80"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )}
            )}</tbody>
          </table>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border p-4 sm:p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-foreground">Confirm Delete</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-foreground mb-6">
              Are you sure you want to delete <strong>{selectedProduct?.name}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-foreground">Edit Offer</h3>
              <button
                onClick={() => setShowEditModal(false)}
                disabled={updating}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); confirmEdit(); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Offer Name</label>
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                  <select
                    value={editForm.category || ''}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Link</label>
                  <input
                    type="url"
                    value={editForm.link || ''}
                    onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Latest Stage</label>
                  <select
                    value={editForm.latestStage || 'Pending'}
                    onChange={(e) => setEditForm({ ...editForm, latestStage: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Upload">Upload</option>
                    <option value="Number">Number</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Commission 1 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={editForm.commission1 || ''}
                    onChange={(e) => setEditForm({ ...editForm, commission1: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., 10%"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Commission 2 <span className="text-gray-400">(optional)</span></label>
                  <input
                    type="text"
                    value={editForm.commission2 || ''}
                    onChange={(e) => setEditForm({ ...editForm, commission2: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., 15%"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Commission 1 Comment</label>
                  <textarea
                    value={editForm.commission1Comment || ''}
                    onChange={(e) => setEditForm({ ...editForm, commission1Comment: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    rows="2"
                    placeholder="Comment for commission 1"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Commission 2 Comment</label>
                  <textarea
                    value={editForm.commission2Comment || ''}
                    onChange={(e) => setEditForm({ ...editForm, commission2Comment: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    rows="2"
                    placeholder="Comment for commission 2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                  <textarea
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    rows="3"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Video Link</label>
                  <input
                    type="url"
                    value={editForm.videoLink || ''}
                    onChange={(e) => setEditForm({ ...editForm, videoLink: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Terms and Conditions</label>
                  <textarea
                    value={editForm.termsAndConditions || ''}
                    onChange={(e) => setEditForm({ ...editForm, termsAndConditions: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    rows="3"
                    placeholder="Enter terms and conditions..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Offer'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}