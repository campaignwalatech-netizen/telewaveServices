import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // ✅ added useNavigate
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/slices/authSlice";
import offerService from "../../services/offerService";

const ZeroFeeDemat = ({ darkMode }) => {
  const { offerId } = useParams();
  const navigate = useNavigate(); // ✅ for back button
  const user = useSelector(selectUser);
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (offerId) {
      fetchOfferDetails();
    } else {
      fetchFirstDematOffer();
    }
  }, [offerId]);

  const fetchOfferDetails = async () => {
    try {
      setLoading(true);
      const response = await offerService.getOfferById(offerId);
      if (response.success) setOffer(response.data);
    } catch (error) {
      console.error("Error fetching offer:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFirstDematOffer = async () => {
    try {
      setLoading(true);
      const response = await offerService.getAllOffers({ limit: 100 });
      if (response.success) {
        const allOffers = response.data.offers || [];
        const dematOffer = allOffers.find((o) =>
          o.category?.toUpperCase().includes("DEMAT")
        );
        setOffer(dematOffer);
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    const userId = user?._id || user?.id;
    if (!userId) {
      alert("Please login to generate your share link.");
      return;
    }
    const shareLink = offer
      ? `${window.location.origin}/share/${offer._id}/${userId}`
      : "https://campaignwaala.com/ref/johndoe/demat";
    navigator.clipboard.writeText(shareLink);
    alert("Link copied to clipboard!");
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen pt-16 pb-16 flex items-center justify-center ${
          darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
        }`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3">Loading offer details...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen pt-8 pb-16 transition-all duration-300 ${
        darkMode ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white" : "bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-900"
      }`}
    >
      {/* ✅ Back Button */}
      <button
        onClick={() => navigate(-1)}
        className={`mb-4 flex items-center gap-2 px-4 py-2 rounded-md font-medium shadow-sm transition-all duration-200 ${
          darkMode
            ? "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
            : "bg-white hover:bg-blue-50 text-gray-800 border border-blue-200"
        }`}
      >
        ← Back
      </button>

      {/* Header */}
      <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-center md:text-left bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {offer?.name || "Zero-Fee Demat Account"}
      </h2>

      {/* Earning Structure */}
      <section
        className={`rounded-xl p-4 sm:p-5 mb-6 shadow-md border ${
          darkMode
            ? "bg-gray-800 border-blue-800"
            : "bg-white border-blue-200"
        }`}
      >
        <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-blue-600 dark:text-blue-400">
          💰 Earning Structure
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm sm:text-base">
          <div
            className={`p-3 rounded-lg border ${
              darkMode
                ? "bg-gray-700 border-green-800 text-gray-300"
                : "bg-green-50 border-green-200 text-gray-700"
            }`}
          >
            <p className="font-semibold text-green-700 dark:text-green-400">Base Commission:</p>
            <p className="text-green-600 dark:text-green-300">{offer?.commission1 || "₹500 per approved application"}</p>
            {offer?.commission1Comment && (
              <p className="text-xs mt-1 opacity-75">
                {offer.commission1Comment}
              </p>
            )}
          </div>

          <div
            className={`p-3 rounded-lg border ${
              darkMode
                ? "bg-gray-700 border-yellow-800 text-gray-300"
                : "bg-yellow-50 border-yellow-200 text-gray-700"
            }`}
          >
            <p className="font-semibold text-yellow-700 dark:text-yellow-400">Bonus for 5+ Applications:</p>
            <p className="text-yellow-600 dark:text-yellow-300">{offer?.commission2 || "Additional ₹100 per application"}</p>
            {offer?.commission2Comment && (
              <p className="text-xs mt-1 opacity-75">
                {offer.commission2Comment}
              </p>
            )}
          </div>

          <div
            className={`p-3 rounded-lg border ${
              darkMode
                ? "bg-gray-700 border-purple-800 text-gray-300"
                : "bg-purple-50 border-purple-200 text-gray-700"
            }`}
          >
            <p className="font-semibold text-purple-700 dark:text-purple-400">Monthly Target Bonus:</p>
            <p className="text-purple-600 dark:text-purple-300">₹2000 for 20+ applications</p>
          </div>
        </div>
      </section>

      {/* Terms & Conditions */}
      <section
        className={`rounded-xl p-4 sm:p-5 mb-6 shadow-md border ${
          darkMode
            ? "bg-gray-800 border-yellow-800"
            : "bg-white border-yellow-200"
        }`}
      >
        <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
          📜 Terms & Conditions
        </h3>
        {offer?.termsAndConditions ? (
          <div className="text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {offer.termsAndConditions}
          </div>
        ) : (
          <ul className="text-sm sm:text-base space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">•</span>
              Applicants must be Indian citizens aged 18 or above.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">•</span>
              A minimum CIBIL score of 700 is required.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">•</span>
              Income proof is mandatory for approval.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">•</span>
              Freelancer Wala reserves the right to review and approve all
              applications.
            </li>
          </ul>
        )}
      </section>

      {/* Trackable Link Section */}
      <section
        className={`rounded-xl p-4 sm:p-5 shadow-md border ${
          darkMode
            ? "bg-gray-800 border-green-800"
            : "bg-white border-green-200"
        }`}
      >
        <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-green-600 dark:text-green-400">
          🔗 Your Unique Trackable Link
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            readOnly
            value={
              offer
                ? `${window.location.origin}/share/${offer._id}/${
                    user?._id || user?.id || "user"
                  }`
                : "Loading..."
            }
            className={`flex-1 px-4 py-2 rounded-md border text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-gray-200"
                : "bg-blue-50 border-blue-300 text-gray-800"
            }`}
          />
          <button
            onClick={copyLink}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-md hover:from-blue-700 hover:to-purple-700 transition transform hover:scale-105"
          >
            Copy Link
          </button>
        </div>
      </section>
    </div>
  );
};

export default ZeroFeeDemat;