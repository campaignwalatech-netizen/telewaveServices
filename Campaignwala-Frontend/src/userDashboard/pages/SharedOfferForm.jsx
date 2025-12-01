import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import offerService from "../../services/offerService";
import leadService from "../../services/leadService";
import api from "../../services/api";

const SharedOfferForm = ({ darkMode }) => {
  const { offerId, hrUserId } = useParams();
  const navigate = useNavigate();
  
  const [offer, setOffer] = useState(null);
  // No need to store hrUser - backend fetches it automatically
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    customerName: "",
    customerContact: ""
  });

  const [formErrors, setFormErrors] = useState({});
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  useEffect(() => {
    fetchOfferDetails();
    // No need to fetch HR user details - backend will handle it
  }, [offerId, hrUserId]);

  const fetchOfferDetails = async () => {
    try {
      setLoading(true);
      const response = await offerService.getOfferById(offerId);
      if (response.success) {
        setOffer(response.data);
      } else {
        setError("Offer not found");
      }
    } catch (err) {
      setError(err.message || "Failed to load offer details");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.customerName.trim()) {
      errors.customerName = "Full name is required";
    } else if (formData.customerName.trim().length < 3) {
      errors.customerName = "Name must be at least 3 characters";
    }

    if (!formData.customerContact.trim()) {
      errors.customerContact = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.customerContact.trim())) {
      errors.customerContact = "Enter a valid 10-digit phone number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      console.log('📤 Submitting lead with data:', {
        offerId: offer._id,
        hrUserId: hrUserId,
        customerName: formData.customerName,
        customerContact: formData.customerContact
      });
      
      // Create lead - backend will automatically fetch HR details
      const leadData = {
        offerId: offer._id,
        hrUserId: hrUserId,
        customerName: formData.customerName,
        customerContact: formData.customerContact
      };

      const response = await leadService.createLead(leadData);
      
      console.log('✅ Lead creation response:', response);
      
      if (response.success) {
        alert("Thank you! Your interest has been submitted successfully. We will contact you soon.");
        navigate("/");
      } else {
        setError(response.message || "Failed to submit. Please try again.");
      }
    } catch (err) {
      console.error('❌ Lead creation error:', err);
      setError(err.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Loading offer details...</p>
        </div>
      </div>
    );
  }

  if (error && !offer) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}>
        <div className="text-center p-6">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-all duration-300 ${
      darkMode ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" : "bg-gradient-to-br from-red-700 via-red-600 to-red-700"
    }`}>
      <div className="w-full max-w-md">
        {/* Modern Card Container */}
        <div className={`rounded-3xl shadow-2xl overflow-hidden ${
          darkMode ? "bg-gray-800" : "bg-white/95 backdrop-blur-sm"
        }`}>
          {/* Offer Logo/Image */}
          <div className="flex justify-center pt-8 pb-4">
            {offer?.image ? (
              <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-lg">
                <img 
                  src={offer.image} 
                  alt={offer.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className={`w-32 h-32 rounded-2xl shadow-lg flex items-center justify-center text-4xl font-bold ${
                darkMode ? "bg-blue-600 text-white" : "bg-blue-600 text-white"
              }`}>
                {offer?.name?.charAt(0) || "O"}
              </div>
            )}
          </div>

          {/* Category Name */}
          <h2 className={`text-2xl font-bold text-center px-6 pb-6 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}>
            {offer?.name || "Special Offer"}
          </h2>

          {/* Form Section */}
          <div className="px-8 pb-8">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name Input */}
              <div>
                <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  <svg className={`w-5 h-5 ${darkMode ? "text-red-400" : "text-red-600"}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                  </svg>
                  Full Name
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={`w-full px-4 py-3.5 rounded-xl border-2 text-sm transition-all focus:outline-none focus:ring-2 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/30"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:ring-red-500/30"
                  } ${formErrors.customerName ? "border-red-500" : ""}`}
                />
                {formErrors.customerName && (
                  <p className="text-red-500 text-xs mt-1.5 ml-1">{formErrors.customerName}</p>
                )}
              </div>

              {/* Phone Number Input */}
              <div>
                <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  <svg className={`w-5 h-5 ${darkMode ? "text-red-400" : "text-red-600"}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                  </svg>
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="customerContact"
                  value={formData.customerContact}
                  onChange={handleInputChange}
                  placeholder="Enter your 10-digit phone number"
                  maxLength="10"
                  className={`w-full px-4 py-3.5 rounded-xl border-2 text-sm transition-all focus:outline-none focus:ring-2 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/30"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:ring-red-500/30"
                  } ${formErrors.customerContact ? "border-red-500" : ""}`}
                />
                {formErrors.customerContact && (
                  <p className="text-red-500 text-xs mt-1.5 ml-1">{formErrors.customerContact}</p>
                )}
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="termsCheckbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 focus:ring-2 cursor-pointer"
                />
                <label 
                  htmlFor="termsCheckbox" 
                  className={`text-xs cursor-pointer ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  By submitting, you agree to our terms and conditions
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-4 rounded-xl font-bold text-white text-base shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${
                  darkMode
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    : "bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900"
                } ${
                  submitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd"/>
                    </svg>
                    CONTINUE
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedOfferForm;