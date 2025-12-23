import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const UserQueryForm = ({ darkMode: propDarkMode }) => {
  const navigate = useNavigate();
  
  // Use prop if available, otherwise read from localStorage
  const [darkMode, setDarkMode] = useState(() => {
    if (propDarkMode !== undefined) return propDarkMode;
    const savedTheme = localStorage.getItem('userTheme') || localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // Sync with prop changes
  useEffect(() => {
    if (propDarkMode !== undefined) {
      setDarkMode(propDarkMode);
    }
  }, [propDarkMode]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, message } = formData;

    if (!name || !email || !message) {
      const errorMsg = "Please fill in all required fields.";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const errorMsg = "Please enter a valid email address.";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setError("");
    setSubmitted(true);

    try {
      // TODO: Replace with actual API call
      // const response = await queryService.submitQuery(formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("✅ Your query has been submitted successfully! We'll get back to you soon.");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
      setSubmitted(false);
    } catch (error) {
      const errorMsg = error.message || "Failed to submit query. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
      setSubmitted(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center md:justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-10 ${
        darkMode
          ? "bg-gray-900 text-gray-200"
          : "bg-gradient-to-br from-blue-50 to-purple-50 text-gray-900"
      }`}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#059669',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#DC2626',
            },
          },
        }}
      />
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className={`self-start mb-4 sm:mb-6 flex items-center gap-2 text-sm sm:text-base font-medium px-3 py-2 rounded-md transition ${
          darkMode
            ? "bg-gray-800 hover:bg-gray-700 text-gray-200"
            : "bg-white hover:bg-gray-100 text-gray-800 border border-gray-300"
        }`}
      >
        ← Back
      </button>

      <div
        className={`w-full max-w-md sm:max-w-lg md:max-w-xl p-6 sm:p-8 rounded-2xl shadow-lg border mt-4 sm:mt-6 md:mt-0 ${
          darkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">
          Submit Your Query
        </h2>

        {submitted ? (
          <div className="text-center">
            <p className="text-green-500 font-semibold text-base sm:text-lg mb-4">
              Thank you for your query! We'll get back to you soon.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  name: "",
                  email: "",
                  subject: "",
                  message: "",
                });
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Submit Another Query
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm sm:text-base mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={`w-full px-3 py-2 sm:py-3 rounded-md border focus:outline-none focus:ring-2 transition-all duration-200 text-sm sm:text-base ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-400"
                    : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500"
                }`}
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`w-full px-3 py-2 sm:py-3 rounded-md border focus:outline-none focus:ring-2 transition-all duration-200 text-sm sm:text-base ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-400"
                    : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500"
                }`}
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base mb-1">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Enter subject (optional)"
                className={`w-full px-3 py-2 sm:py-3 rounded-md border focus:outline-none focus:ring-2 transition-all duration-200 text-sm sm:text-base ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-400"
                    : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500"
                }`}
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base mb-1">
                Message *
              </label>
              <textarea
                name="message"
                rows="4"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message here..."
                className={`w-full px-3 py-2 sm:py-3 rounded-md border focus:outline-none focus:ring-2 resize-none transition-all duration-200 text-sm sm:text-base ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-400"
                    : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500"
                }`}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitted}
              className={`w-full py-2 sm:py-3 rounded-md font-semibold text-sm sm:text-base transition duration-300 ${
                darkMode
                  ? "bg-blue-600 hover:bg-blue-500 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {submitted ? "Submitting..." : "Submit Query"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserQueryForm;