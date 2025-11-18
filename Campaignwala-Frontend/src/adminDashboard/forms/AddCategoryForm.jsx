import { useState, useRef, useEffect } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { createCategory, updateCategory } from "../../services/categoryService";

export default function AddCategoryForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const editCategory = location.state?.editCategory;
  const isEditMode = !!editCategory;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    iconImage: null,
    status: "active"
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef(null);

  // Populate form data when in edit mode
  useEffect(() => {
    console.log("🔍 Component loaded, isEditMode:", isEditMode);
    console.log("📝 Edit category data:", editCategory);
    
    if (editCategory) {
      setFormData({
        name: editCategory.name || "",
        description: editCategory.description || "",
        icon: editCategory.icon || "",
        iconImage: null,
        status: editCategory.status || "active"
      });
      
      // Set image preview if iconImage exists
      if (editCategory.iconImage) {
        setImagePreview(editCategory.iconImage);
      }
    }
  }, [editCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🚀 Form submitted!");
    console.log("📋 Form data:", formData);
    console.log("🖼️ Icon image:", formData.iconImage);
    console.log("🔧 Is edit mode:", isEditMode);
    
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      // Prepare data for API
      const categoryData = {
        name: formData.name,
        description: formData.description,
        icon: formData.icon || "",
        status: formData.status
      };

      // Convert image to base64 if present
      if (formData.iconImage) {
        console.log("📸 Converting image to base64...");
        const reader = new FileReader();
        reader.readAsDataURL(formData.iconImage);
        await new Promise((resolve) => {
          reader.onload = () => {
            categoryData.iconImage = reader.result;
            console.log("✅ Image converted to base64");
            resolve();
          };
        });
      } else {
        categoryData.iconImage = "";
      }

      console.log("📤 Sending data to API:", categoryData);

      let response;
      if (isEditMode) {
        console.log("✏️ Updating category with ID:", editCategory._id);
        response = await updateCategory(editCategory._id, categoryData);
      } else {
        console.log("➕ Creating new category");
        response = await createCategory(categoryData);
      }

      console.log("✅ API Response:", response);

      if (response.success) {
        setSuccessMessage(
          isEditMode 
            ? "✅ Category updated successfully!" 
            : "✅ Category created successfully!"
        );
        
        // Navigate back after 1.5 seconds
        setTimeout(() => {
          navigate('/admin/all-categories');
        }, 1500);
      } else {
        throw new Error(response.message || "Operation failed");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      console.error("❌ Error response:", error.response);
      setErrorMessage(
        error.response?.data?.message || 
        error.message || 
        `Failed to ${isEditMode ? 'update' : 'create'} category. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    console.log("📝 Field changed:", e.target.name, "=", e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    console.log("🖼️ Image upload triggered");
    const file = e.target.files[0];
    if (file) {
      console.log("📁 File selected:", file.name, file.type, file.size);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        console.warn("⚠️ Invalid file type:", file.type);
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        console.warn("⚠️ File too large:", file.size);
        return;
      }

      setFormData({ ...formData, iconImage: file });
      console.log("✅ File added to form data");
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        console.log("✅ Image preview created");
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, iconImage: null });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="h-full flex flex-col p-3 sm:p-4">
      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
        {isEditMode ? "Edit Category" : "Add New Category"}
      </h2>
      
      <div className="flex-1 overflow-y-auto scrollbar-custom min-h-0">
      <form onSubmit={handleSubmit} className="bg-card rounded-lg border border-border p-4 sm:p-6 max-w-2xl">
        
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg text-green-800 dark:text-green-200 text-sm">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-800 dark:text-red-200 text-sm">
            {errorMessage}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Category Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter category name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter category description..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Icon Name (Optional)</label>
            <input
              type="text"
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., marketing, social (fallback if no image)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Category Icon Image</label>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            {/* Upload area */}
            <div className="space-y-4">
              {!imagePreview ? (
                <div
                  onClick={triggerFileInput}
                  className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
                >
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    Click to upload category icon
                    <br />
                    <span className="text-xs">PNG, JPG up to 5MB</span>
                  </p>
                </div>
              ) : (
                <div className="relative inline-block">
                  <div className="w-32 h-32 border border-border rounded-lg overflow-hidden bg-muted">
                    <img
                      src={imagePreview}
                      alt="Category icon preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/80 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              {imagePreview && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm flex items-center gap-2"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Change Image
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isEditMode ? "Updating..." : "Adding..."}
              </>
            ) : (
              <>{isEditMode ? "Update Category" : "Add Category"}</>
            )}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => navigate('/admin/all-categories')}
            className="px-6 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/80 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
