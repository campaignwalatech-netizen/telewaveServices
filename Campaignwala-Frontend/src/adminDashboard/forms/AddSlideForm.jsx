import { useState, useRef, useEffect } from "react";
import { Upload, X, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from 'react-router-dom';
import slideService from '../../services/slideService';
import categoryService from '../../services/categoryService';
import { getOffersByCategory } from '../../services/offerService';

export default function AddSlideForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const editSlide = location.state?.editSlide;
  const isEditMode = Boolean(editSlide);

  const [formData, setFormData] = useState({
    offerTitle: "",
    category: "",
    OffersId: "",
    backgroundImage: null,
    description: ""
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offersLoading, setOffersLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [offersIdError, setOffersIdError] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Populate form with slide data when in edit mode
  useEffect(() => {
    if (editSlide) {
      setFormData({
        offerTitle: editSlide.offerTitle || "",
        category: editSlide.category?._id || editSlide.category || "",
        OffersId: editSlide.OffersId || "",
        backgroundImage: editSlide.backgroundImage || null,
        description: editSlide.description || ""
      });
      if (editSlide.backgroundImage) {
        setImagePreview(editSlide.backgroundImage);
      }
      // Fetch offers for the selected category in edit mode
      if (editSlide.category?._id || editSlide.category) {
        fetchOffersByCategory(editSlide.category?._id || editSlide.category);
      }
    }
  }, [editSlide]);

  // Fetch all categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getAllCategories({
        status: 'active',
        limit: 1000
      });
      if (response.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // Fetch offers when category changes
  const fetchOffersByCategory = async (categoryId) => {
    if (!categoryId) {
      setOffers([]);
      setFormData(prev => ({ ...prev, OffersId: '' }));
      return;
    }

    try {
      console.log('📁 Fetching offers for category ID:', categoryId);
      setOffersLoading(true);
      const response = await getOffersByCategory(categoryId);
      console.log('📦 API Response:', response);
      
      if (response.success) {
        console.log('✅ Offers loaded:', response.data);
        setOffers(response.data);
      } else {
        console.log('⚠️ No offers found');
        setOffers([]);
      }
    } catch (error) {
      console.error('❌ Error fetching offers:', error);
      setOffers([]);
    } finally {
      setOffersLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitLoading(true);

      // Validation
      if (!formData.offerTitle || !formData.category || !formData.OffersId || !formData.backgroundImage) {
        alert('❌ Please fill all required fields!');
        setSubmitLoading(false);
        return;
      }

      // Prepare data for API
      const slideData = {
        offerTitle: formData.offerTitle.trim(),
        category: formData.category,
        OffersId: formData.OffersId.trim(),
        backgroundImage: formData.backgroundImage,
        description: formData.description ? formData.description.trim() : ''
      };

      console.log('Submitting slide data:', slideData);
      
      if (isEditMode) {
        // Update existing slide
        const response = await slideService.updateSlide(editSlide._id, slideData);
        if (response.success) {
          alert("Slide updated successfully!");
          navigate('/admin/all-slides');
        }
      } else {
        // Create new slide
        const response = await slideService.createSlide(slideData);
        if (response.success) {
          alert("Slide added successfully!");
          navigate('/admin/all-slides');
        }
      }
    } catch (error) {
      console.error('Error saving slide:', error);
      
      // Display user-friendly error message
      const errorMessage = error.message || error.error || 'Failed to save slide';
      
      if (errorMessage.includes('Offers ID already exists')) {
        setOffersIdError(true);
        alert('❌ Offers ID Already Exists!\n\nPlease select a different offer from the dropdown.');
        document.querySelector('select[name="OffersId"]')?.focus();
      } else if (errorMessage.includes('validation')) {
        alert('❌ Validation Error!\n\nPlease check all required fields and try again.');
      } else {
        alert(`❌ Error: ${errorMessage}`);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // When category changes, fetch offers for that category
    if (name === 'category') {
      console.log('🏷️ Category changed to:', value);
      const selectedCategory = categories.find(cat => cat._id === value);
      console.log('📋 Selected category details:', selectedCategory);
      
      fetchOffersByCategory(value);
      setFormData(prev => ({
        ...prev,
        category: value,
        OffersId: '' // Reset OffersId when category changes
      }));
      return;
    }
    
    // Clear OffersId error when user selects
    if (name === 'OffersId') {
      console.log('🎯 Offer ID selected:', value);
      setOffersIdError(false);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      // Convert to base64 for API
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target.result;
        setFormData(prev => ({
          ...prev,
          backgroundImage: base64Image
        }));
        setImagePreview(base64Image);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      backgroundImage: null
    }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="h-full flex flex-col p-3 sm:p-4">
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => navigate('/admin/all-slides')}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Slides
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          {isEditMode ? 'Edit Slide' : 'Add New Slide'}
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-custom min-h-0">
        <form onSubmit={handleSubmit} className="bg-card rounded-lg border border-border p-4 sm:p-6 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Offer Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Offer Title *
              </label>
              <input
                type="text"
                name="offerTitle"
                value={formData.offerTitle}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter attractive offer title..."
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={loading}
              >
                <option value="">
                  {loading ? 'Loading categories...' : 'Select Category'}
                </option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Offers ID */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Offers ID *
              </label>
              <select
                name="OffersId"
                value={formData.OffersId}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 transition-colors ${
                  offersIdError 
                    ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10' 
                    : 'border-border focus:ring-primary'
                }`}
                required
                disabled={!formData.category || offersLoading}
              >
                <option value="">
                  {!formData.category 
                    ? 'First select a category' 
                    : offersLoading 
                    ? 'Loading offers...' 
                    : offers.length === 0 
                    ? 'No offers available in this category'
                    : 'Select Offer ID'
                  }
                </option>
                {offers.map((offer) => (
                  <option key={offer._id} value={offer.offersId || offer.leadId || offer._id}>
                    {offer.name} - {offer.offersId || offer.leadId || 'No ID'}
                  </option>
                ))}
              </select>
              {offersIdError && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-semibold">
                  ⚠️ This Offers ID already exists! Please select a different offer.
                </p>
              )}
              {!formData.category && (
                <p className="mt-1 text-xs text-muted-foreground">
                  💡 Please select a category first to see available offers
                </p>
              )}
            </div>

            {/* Background Image */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Background Image *
              </label>
              
              <div className="space-y-4">
                {/* Upload Area */}
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Click to upload background image
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supported formats: JPG, PNG, GIF (Max 5MB)
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Background preview" 
                      className="w-full h-48 object-cover rounded-lg border border-border"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Enter slide description (optional)..."
                maxLength={500}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {formData.description.length}/500 characters
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  offerTitle: "",
                  category: "",
                  OffersId: "",
                  backgroundImage: null,
                  description: ""
                });
                setImagePreview(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="px-6 py-2 bg-destructive text-destructive-foreground border border-destructive rounded-lg hover:bg-destructive/80 transition-colors"
              disabled={submitLoading}
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitLoading}
            >
              {submitLoading 
                ? (isEditMode ? 'Updating...' : 'Adding...') 
                : (isEditMode ? 'Update Slide' : 'Add Slide')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
