import { useState, useEffect } from "react";
import { Edit2, Trash2, X, Download, Search, Filter, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllCategories, deleteCategory } from "../../services/categoryService";

export default function AllCategoriesTable() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleting, setDeleting] = useState(false);

  // Fetch categories on component mount and when filters change
  useEffect(() => {
    fetchCategories();
  }, [searchTerm, filterStatus]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        status: filterStatus,
        search: searchTerm,
        page: 1,
        limit: 100,
        sortBy: 'createdAt',
        order: 'desc'
      };

      const response = await getAllCategories(params);
      
      if (response.success) {
        setCategories(response.data.categories);
      } else {
        setError(response.message || 'Failed to fetch categories');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.response?.data?.message || 'Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedCategory) return;

    try {
      setDeleting(true);
      const response = await deleteCategory(selectedCategory._id);
      
      if (response.success) {
        // Remove from local state
        setCategories(categories.filter(c => c._id !== selectedCategory._id));
        setShowDeleteModal(false);
        setSelectedCategory(null);
        // Show success message
        alert('Category deleted successfully!');
      } else {
        alert(response.message || 'Failed to delete category');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      alert(err.response?.data?.message || 'Failed to delete category. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (category) => {
    // Navigate to AddCategoryForm with category data for editing
    navigate('/admin/add-category', { state: { editCategory: category } });
  };

  const handleAddNew = () => {
    navigate('/admin/add-category');
  };

  const handleExport = () => {
    try {
      const csvData = categories.map(cat => ({
        Name: cat.name,
        Description: cat.description,
        Count: cat.count,
        Status: cat.status,
        Created: new Date(cat.createdAt).toLocaleDateString()
      }));

      const headers = Object.keys(csvData[0]).join(',');
      const rows = csvData.map(row => Object.values(row).join(',')).join('\n');
      const csv = `${headers}\n${rows}`;

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `categories_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting categories:', err);
      alert('Failed to export categories');
    }
  };

  const filteredCategories = categories;

  return (
    <div className="h-full flex flex-col p-3 sm:p-4">
      {/* Header with Title */}
      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">All Categories</h2>

      {/* Filters and Export in one line */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-9 pr-8 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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

      {/* Categories Grid with fixed height */}
      <div className="flex-1 overflow-y-auto scrollbar-custom min-h-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-foreground">Loading categories...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-destructive mb-4">
              <X className="w-16 h-16" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Categories</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={fetchCategories}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <div key={category._id} className="bg-card rounded-lg border border-border p-4 sm:p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-base sm:text-lg font-bold text-foreground break-words">{category.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      category.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {category.status.charAt(0).toUpperCase() + category.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 break-words">{category.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground whitespace-nowrap">
                      <span className="font-bold">{category.count}</span> Offers
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(category)} className="text-primary hover:text-primary/80 text-sm font-semibold inline-flex items-center gap-1">
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button onClick={() => handleDelete(category)} className="text-destructive hover:text-destructive/80 text-sm font-semibold inline-flex items-center gap-1">
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <Search className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No categories found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? `No categories match "${searchTerm}". Try adjusting your search.`
                    : "No categories available. Click Add New to create one."
                  }
                </p>
                <button
                  onClick={handleAddNew}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Add New Category
                </button>
              </div>
            )}
          </div>
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
                className="text-muted-foreground hover:text-foreground"
                disabled={deleting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-foreground mb-6">
              Are you sure you want to delete <strong>{selectedCategory?.name}</strong> category?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={confirmDelete} 
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground text-sm rounded-lg hover:bg-destructive/90 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                className="flex-1 px-4 py-2 bg-muted text-foreground text-sm rounded-lg hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Floating Button */}
      <button
        onClick={handleAddNew}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-110 flex items-center justify-center z-40"
        title="Add New Category"
      >
        <span className="text-2xl font-bold">+</span>
      </button>
    </div>
  );
}
