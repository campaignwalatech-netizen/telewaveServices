import { useState, useEffect } from "react";
import { Edit2, Trash2, X, Eye, Image, Calendar, Upload } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import slideService from '../../services/slideService';

export default function AllSlidesTable() {
  const navigate = useNavigate();
  
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [selectedSlide, setSelectedSlide] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch slides on component mount
  useEffect(() => {
    fetchSlides();
  }, []);

  // Fetch slides when search query changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSlides();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch all slides from API
  const fetchSlides = async () => {
    try {
      setLoading(true);
      const params = {
        sortBy: 'order',
        order: 'asc',
        limit: 1000
      };

      // Add search query if exists
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      console.log('🔍 Fetching slides with params:', params);

      const response = await slideService.getAllSlides(params);
      
      console.log('✅ Slides fetched:', response.data.slides.length);

      if (response.success) {
        setSlides(response.data.slides);
      }
    } catch (error) {
      console.error('❌ Error fetching slides:', error);
      alert('Failed to load slides');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (slide) => {
    navigate('/admin/add-slide', { 
      state: { 
        editSlide: slide 
      }
    });
  };

  const handleDelete = (slide) => {
    setSelectedSlide(slide);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await slideService.deleteSlide(selectedSlide._id);
      if (response.success) {
        setSlides(slides.filter(s => s._id !== selectedSlide._id));
        setShowDeleteModal(false);
        setAlertMessage(`Slide "${selectedSlide.offerTitle}" deleted successfully!`);
        setShowSuccessAlert(true);
        setTimeout(() => setShowSuccessAlert(false), 3000);
      }
    } catch (error) {
      console.error('Error deleting slide:', error);
      alert(error.message || 'Failed to delete slide');
      setShowDeleteModal(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="h-full flex flex-col p-4 sm:p-6">
      {/* Success Alert */}
      {showSuccessAlert && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in">
          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
          </div>
          <span className="font-semibold">{alertMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-1">Slide Board</h1>
          {searchQuery && (
            <p className="text-xs sm:text-sm text-muted-foreground">
              {slides.length} result{slides.length !== 1 ? 's' : ''} found for "{searchQuery}"
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search slides..."
              className="pl-10 pr-10 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-80"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="flex-1 overflow-y-auto scrollbar-custom">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : slides.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground px-4">
            <Upload className="w-12 h-12 sm:w-16 sm:h-16 mb-4" />
            {searchQuery ? (
              <>
                <p className="text-base sm:text-lg font-semibold text-center">No slides found</p>
                <p className="text-xs sm:text-sm text-center">No results for "{searchQuery}"</p>
                <button
                  onClick={clearSearch}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-semibold"
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <p className="text-base sm:text-lg font-semibold text-center">No slides found</p>
                <p className="text-xs sm:text-sm text-center">Create your first slide to get started</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {slides.map((slide) => (
              <div key={slide._id} className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-border overflow-hidden hover:shadow-lg transition-all duration-200">
                {/* Slide Image */}
                <div className="relative">
                  <img 
                    src={slide.backgroundImage} 
                    alt={slide.offerTitle}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/280x160/e2e8f0/64748b?text=${encodeURIComponent(slide.offerTitle)}`;
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      slide.status === 'active' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-500 text-white'
                    }`}>
                      {slide.status}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4">
                  {/* Title */}
                  <h3 className="text-base font-semibold text-gray-900 dark:text-foreground mb-1">
                    {slide.offerTitle}
                  </h3>
                  
                  {/* Category */}
                  <p className="text-sm text-gray-500 dark:text-muted-foreground mb-2">
                    {slide.category?.name || 'No Category'}
                  </p>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                    {slide.description || 'No description available'}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{slide.views || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {slide.createdAt 
                          ? new Date(slide.createdAt).toLocaleDateString() 
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(slide)}
                      className="flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors text-xs font-medium"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(slide)}
                      className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors text-xs font-medium"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>



      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-foreground whitespace-nowrap">Confirm Delete</h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-foreground mb-6">
              Are you sure you want to delete slide <strong>"{selectedSlide?.offerTitle}"</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/80 transition-colors text-sm font-semibold whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors text-sm font-semibold whitespace-nowrap"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
