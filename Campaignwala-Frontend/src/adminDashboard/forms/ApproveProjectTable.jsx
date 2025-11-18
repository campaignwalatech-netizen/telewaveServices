import { useState, useRef, useEffect } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, FileSpreadsheet, ToggleLeft, ToggleRight, UserCheck, UserX, Loader2 } from "lucide-react";
import { getAllOffers, approveOffer, rejectOffer } from "../../services/offerService";

export default function ApproveOffersTable() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(""); // success, error, or empty
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingIds, setProcessingIds] = useState(new Set());

  // Fetch offers on component mount
  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch offers with lead information (offers that have lead data)
      const response = await getAllOffers({
        page: 1,
        limit: 100,
        sortBy: 'createdAt',
        order: 'desc'
      });
      
      if (response.success && response.data.offers) {
        // Filter offers that have lead information
      const offersWithLeadInfo = response.data.offers.filter(offer => 
          offer.leadId
        );
        setOffers(offersWithLeads);
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

  // Toggle approval status
  const toggleApproval = async (offerId, currentStatus) => {
    if (processingIds.has(offerId)) return;
    
    try {
      setProcessingIds(prev => new Set([...prev, offerId]));
      
      let response;
      if (currentStatus) {
        // If currently approved, reject it
        response = await rejectOffer(offerId, 'Unapproved by admin');
      } else {
        // If currently not approved, approve it
        response = await approveOffer(offerId);
      }
      
      if (response.success) {
        // Update local state
        setOffers(offers.map(offer => 
          offer._id === offerId ? response.data : offer
        ));
      } else {
        alert(response.message || 'Failed to update approval status');
      }
    } catch (err) {
      console.error('Error toggling approval:', err);
      alert(err.response?.data?.message || 'Failed to update approval status');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(offerId);
        return newSet;
      });
    }
  };

  // Export offers to Excel/CSV
  const exportToExcel = () => {
    const csvContent = "Lead ID,Name,Category,Commission 1,Commission 2,Date,Approval Status\n" + 
      offers.map(offer => 
        `${offer.leadId || 'N/A'},"${offer.name || 'N/A'}",${offer.category || 'N/A'},${offer.commission1 || 'N/A'},${offer.commission2 || 'N/A'},${new Date(offer.createdAt).toISOString().split('T')[0]},${offer.isApproved ? 'Approved' : 'Pending'}`
      ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Offers_Approval_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type - support both CSV and Excel
      const isValidFile = file.type === "text/csv" || 
                         file.name.endsWith('.csv') || 
                         file.name.endsWith('.xlsx') || 
                         file.name.endsWith('.xls');
      
      if (!isValidFile) {
        setUploadStatus("error");
        alert("Please select a valid CSV or Excel file (.csv, .xlsx, .xls)");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadStatus("error");
        alert("File size should be less than 10MB");
        return;
      }

      setIsUploading(true);
      
      // Simulate upload process
      setTimeout(() => {
        setUploadedFile(file);
        setUploadStatus("success");
        setIsUploading(false);
        console.log("CSV file uploaded:", file.name);
      }, 1500);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const isValidFile = file.type === "text/csv" || 
                         file.name.endsWith('.csv') || 
                         file.name.endsWith('.xlsx') || 
                         file.name.endsWith('.xls');
      
      if (isValidFile) {
        const event = { target: { files: [file] } };
        handleFileUpload(event);
      } else {
        alert("Please drop a CSV or Excel file");
      }
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadStatus("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };



  return (
    <div className="h-full flex flex-col bg-background">
      {/* Professional Header Section */}
      <div className="bg-card border-b border-border px-3 sm:px-6 py-4 sm:py-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <span className="break-words">Account Approval Center</span>
            </h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              Manage account approvals with Excel/CSV import and individual toggle controls
            </p>
          </div>
          
          {/* Right side with title and toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            {/* Export Button */}
            <button
              onClick={exportToExcel}
              disabled={loading || offers.length === 0}
              className="px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50 flex items-center gap-2 text-sm whitespace-nowrap"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden xs:inline">Export to CSV</span>
              <span className="xs:hidden">Export</span>
            </button>
            
            {/* Bulk Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-medium text-foreground">
                Unapprove</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={offers.some(offer => offer.isApproved)}
                  disabled={loading}
                  onChange={async () => {
                    const hasApproved = offers.some(offer => offer.isApproved);
                    // Bulk approval/unapproval could be implemented here
                    // For now, we'll just show a message
                    alert('unapproval will process all offers. This feature requires backend support for bulk operations.');
                  }}
                />
                <div className="w-10 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-3 sm:p-6">

        {/* Professional Upload Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-lg sm:rounded-xl border border-border shadow-sm overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 px-3 sm:px-6 py-3 sm:py-4 border-b border-border">
              <h3 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Excel/CSV File Upload
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Upload your account data file (.csv, .xlsx, .xls) for bulk processing
              </p>
            </div>

            {/* Upload Zone */}
            <div className="p-3 sm:p-6">
              <div
                className={`relative border-2 border-dashed rounded-lg sm:rounded-xl p-6 sm:p-12 text-center cursor-pointer transition-all duration-300 group ${
                  uploadStatus === "success" 
                    ? "border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20" 
                    : uploadStatus === "error"
                    ? "border-red-400 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20"
                    : "border-gray-300 hover:border-primary bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/50 dark:to-slate-900/50 hover:from-primary/5 hover:to-purple-50 dark:hover:to-purple-900/20"
                }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <div className="relative mb-6">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Upload className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">Processing Upload</h4>
                    <p className="text-sm text-muted-foreground">Please wait while we process your CSV file...</p>
                  </div>
                ) : uploadedFile ? (
                  <div className="flex flex-col items-center">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <h4 className="text-lg sm:text-xl font-bold text-foreground mb-2">Upload Successful!</h4>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-border mb-4 sm:mb-6 shadow-sm max-w-sm">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{uploadedFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(uploadedFile.size / 1024).toFixed(1)} KB • Processed successfully
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile();
                        }}
                        className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-sm sm:text-base whitespace-nowrap w-auto"
                      >
                        Upload Different File
                      </button>
                      <button className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-sm sm:text-base whitespace-nowrap w-auto">
                        Process Accounts
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <h4 className="text-base sm:text-xl font-bold text-foreground mb-4 sm:mb-8">
                      Choose File Type to Upload
                    </h4>
                    
                    {/* File Type Selection Icons */}
                    <div className="flex items-center gap-4 sm:gap-8 mb-4 sm:mb-8">
                      {/* XLS File Upload */}
                      <div 
                        className="flex flex-col items-center cursor-pointer group"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = '.xlsx,.xls';
                          input.onchange = handleFileUpload;
                          input.click();
                        }}
                      >
                        <div className="w-16 h-24 sm:w-24 sm:h-32 bg-gray-600 rounded-lg flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-105 transition-transform duration-200 shadow-lg relative overflow-hidden">
                          {/* File corner fold */}
                          <div className="absolute top-0 right-0 w-4 h-4 sm:w-6 sm:h-6 bg-gray-500 transform rotate-45 translate-x-2 sm:translate-x-3 -translate-y-2 sm:-translate-y-3"></div>
                          <div className="absolute top-0 right-0 w-3 h-3 sm:w-4 sm:h-4 border-l border-b border-gray-400"></div>
                          
                          {/* XLS text */}
                          <span className="text-white font-bold text-sm sm:text-lg">XLS</span>
                          
                          {/* Upload arrows */}
                          <div className="absolute right-1 sm:right-2 top-6 sm:top-8 space-y-1">
                            <div className="w-0 h-0 border-l-2 border-r-2 border-b-3 border-transparent border-b-orange-400"></div>
                            <div className="w-0 h-0 border-l-2 border-r-2 border-b-3 border-transparent border-b-orange-400"></div>
                            <div className="w-0 h-0 border-l-2 border-r-2 border-b-3 border-transparent border-b-orange-400"></div>
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-foreground group-hover:text-primary">Upload Excel File</span>
                      </div>

                      {/* CSV File Upload */}
                      <div 
                        className="flex flex-col items-center cursor-pointer group"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = '.csv';
                          input.onchange = handleFileUpload;
                          input.click();
                        }}
                      >
                        <div className="w-16 h-24 sm:w-24 sm:h-32 bg-slate-600 rounded-lg flex flex-col items-center justify-center mb-2 sm:mb-3 group-hover:scale-105 transition-transform duration-200 shadow-lg relative">
                          {/* Cloud icon */}
                          <div className="bg-white rounded-full p-1 sm:p-2 mb-1 sm:mb-2">
                            <div className="w-6 h-4 sm:w-8 sm:h-6 bg-slate-600 rounded-t-full relative">
                              <div className="absolute inset-x-0 top-1 sm:top-2 h-1 sm:h-2 bg-slate-600 rounded-full"></div>
                              <div className="absolute left-1/2 transform -translate-x-1/2 top-2 sm:top-4 w-0 h-0 border-l-2 border-r-2 border-t-3 border-transparent border-t-slate-600"></div>
                            </div>
                          </div>
                          
                          {/* CSV text */}
                          <span className="text-white font-bold text-xs sm:text-sm">CSV</span>
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-foreground group-hover:text-primary">Upload CSV File</span>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-center text-xs sm:text-sm max-w-md px-4">
                      Click on Excel (XLS) or CSV icon to upload your account data file. 
                      Maximum file size: 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Status Messages */}
            {uploadStatus === "success" && (
              <div className="mx-3 sm:mx-6 mb-3 sm:mb-4 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg sm:rounded-xl flex items-center gap-2 sm:gap-3 shadow-sm">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-green-800 dark:text-green-200">
                    Upload Complete
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    Your CSV file has been processed and is ready for Offers approval
                  </p>
                </div>
              </div>
            )}

            {uploadStatus === "error" && (
              <div className="mx-3 sm:mx-6 mb-3 sm:mb-4 p-3 sm:p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-lg sm:rounded-xl flex items-center gap-2 sm:gap-3 shadow-sm">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-red-800 dark:text-red-200">
                    Upload Failed
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300">
                    Please check your file format and try again
                  </p>
                </div>
              </div>
            )}
          </div>



          {/* Professional Instructions Card */}
          <div className="mt-6 sm:mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg sm:rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
            <div className="p-4 sm:p-6">
              <h4 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                Excel/CSV Format Requirements
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h5 className="text-xs sm:text-sm font-semibold text-foreground mb-2 sm:mb-3">Required Columns</h5>
                  <div className="space-y-1 sm:space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <span className="font-medium">Lead ID</span>
                      <span className="text-muted-foreground">(Unique identifier)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                      <span className="font-medium">Offer Name</span>
                      <span className="text-muted-foreground">(Offer name)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0"></div>
                      <span className="font-medium">Category</span>
                      <span className="text-muted-foreground">(Offer category)</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="text-xs sm:text-sm font-semibold text-foreground mb-2 sm:mb-3">Additional Fields</h5>
                  <div className="space-y-1 sm:space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      <span className="font-medium">Commission 1</span>
                      <span className="text-muted-foreground">(Required)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                      <span className="font-medium">Commission 2</span>
                      <span className="text-muted-foreground">(Optional)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></div>
                      <span className="font-medium">Customer Contact</span>
                      <span className="text-muted-foreground">(YYYY-MM-DD)</span>
                    </div>
                    {/* <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="font-medium">Status</span>
                      <span className="text-muted-foreground">(Pending/Approved)</span>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
