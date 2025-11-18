import React, { useState, useEffect } from "react";
import userService from "../../services/userService";
import authService from "../../services/authService";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import OtpModal from "../../components/OtpModal";

const KYCDetails = ({ darkMode }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    address1: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    pan: "",
    aadhaar: "",
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    ifsc: "AXIS0000001",
    branch: "",
    upiId: "",
  });

  // Section edit toggles
  const [editPersonal, setEditPersonal] = useState(false);
  const [editKYC, setEditKYC] = useState(false);
  const [editBank, setEditBank] = useState(false);
  
  // Loading and status states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kycStatus, setKycStatus] = useState('not_submitted');
  const [rejectionReason, setRejectionReason] = useState('');
  
  // OTP Modal states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'personal', 'kyc', 'bank'
  const [userEmail, setUserEmail] = useState('');

  // Fetch KYC details on mount
  useEffect(() => {
    console.log('🔄 KYCDetails: Component mounted, fetching KYC details...');
    fetchKYCDetails();
  }, []);

  const fetchKYCDetails = async () => {
    try {
      console.log('🌐 userService.getKYCDetails called');
      setLoading(true);
      const response = await userService.getKYCDetails();
      console.log('📥 getKYCDetails response:', response);
      
      if (response.success && response.data) {
        const user = response.data;
        console.log('✅ User KYC data:', user);
        
        // Populate form with user data
        setForm({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phoneNumber || '',
          dob: user.dob || '',
          gender: user.gender || '',
          address1: user.address1 || '',
          city: user.city || '',
          state: user.state || '',
          zip: user.zip || '',
          country: user.country || '',
          pan: user.kycDetails?.panNumber || '',
          aadhaar: user.kycDetails?.aadhaarNumber || '',
          bankName: user.bankDetails?.bankName || '',
          accountHolder: user.bankDetails?.accountHolderName || '',
          accountNumber: user.bankDetails?.accountNumber || '',
          ifsc: user.bankDetails?.ifscCode || '',
          branch: user.bankDetails?.branchAddress || '',
          upiId: user.bankDetails?.upiId || '',
        });
        
        // Set KYC status
        setKycStatus(user.kycDetails?.kycStatus || 'not_submitted');
        setRejectionReason(user.kycDetails?.kycRejectionReason || '');
        setUserEmail(user.email || '');
        console.log('✅ KYC Status:', user.kycDetails?.kycStatus);
      } else {
        console.error('❌ API returned success: false');
        toast.error('Failed to fetch KYC details');
      }
    } catch (error) {
      console.error('❌ Error fetching KYC details:', error);
      console.error('❌ Error details:', error.message);
      toast.error(error.message || 'Failed to fetch KYC details');
    } finally {
      setLoading(false);
      console.log('✅ Loading complete');
    }
  };

  const labelClass = `block text-sm font-medium mb-1 ${
    darkMode ? "text-gray-300" : "text-gray-700"
  }`;

  const smallInput = (editable) =>
    `w-full rounded-md border p-2 text-sm outline-none transition duration-200 ${
      editable
        ? darkMode
          ? "bg-gray-800 border-gray-700 text-gray-100 focus:border-blue-500"
          : "bg-white border-gray-300 focus:border-blue-600"
        : darkMode
        ? "bg-gray-800 border-gray-700 text-gray-400 cursor-not-allowed"
        : "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
    }`;

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSavePersonal = async () => {
    if (!editPersonal) {
      setEditPersonal(true);
      return;
    }

    // Trigger OTP verification before saving
    try {
      console.log('🔐 Requesting OTP for Personal Details update...');
      const response = await authService.sendEmailOTP('profile-update');
      
      if (response.success) {
        setPendingAction('personal');
        setShowOtpModal(true);
        
        // Show static OTP in development
        if (response.data?.otp) {
          console.log('🔑 Development OTP:', response.data.otp);
          toast.success(`OTP sent! Use: ${response.data.otp}`);
        }
      } else {
        toast.error(response.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('❌ Error sending OTP:', error);
      toast.error(error.message || 'Failed to send OTP');
    }
  };

  const savePersonalDetails = async () => {
    try {
      console.log('🌐 Saving Personal Details...');
      setSubmitting(true);
      
      const data = {
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phone,
        dob: form.dob,
        gender: form.gender,
        address1: form.address1,
        city: form.city,
        state: form.state,
        zip: form.zip,
        country: form.country,
      };
      
      console.log('📤 Personal Details payload:', data);
      const response = await userService.updateKYCDetails(data);
      console.log('📥 Update response:', response);
      
      if (response.success) {
        console.log('✅ Personal details updated successfully');
        toast.success('Personal details updated successfully');
        setEditPersonal(false);
        fetchKYCDetails(); // Refresh data
      } else {
        console.error('❌ Update failed:', response.message);
        toast.error(response.message || 'Failed to update personal details');
      }
    } catch (error) {
      console.error('❌ Error updating personal details:', error);
      toast.error(error.message || 'Failed to update personal details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveKYC = async () => {
    if (!editKYC) {
      setEditKYC(true);
      return;
    }

    // Trigger OTP verification before saving
    try {
      console.log('🔐 Requesting OTP for KYC Documents update...');
      const response = await authService.sendEmailOTP('profile-update');
      
      if (response.success) {
        setPendingAction('kyc');
        setShowOtpModal(true);
        
        // Show static OTP in development
        if (response.data?.otp) {
          console.log('🔑 Development OTP:', response.data.otp);
          toast.success(`OTP sent! Use: ${response.data.otp}`);
        }
      } else {
        toast.error(response.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('❌ Error sending OTP:', error);
      toast.error(error.message || 'Failed to send OTP');
    }
  };

  const saveKYCDetails = async () => {
    try {
      console.log('🌐 Saving KYC Documents...');
      setSubmitting(true);
      
      // Send data directly (not nested in kycDetails)
      const data = {
        panNumber: form.pan,
        aadhaarNumber: form.aadhaar,
      };
      
      console.log('📤 KYC Documents payload:', data);
      const response = await userService.updateKYCDetails(data);
      console.log('📥 Update response:', response);
      
      if (response.success) {
        console.log('✅ KYC documents updated successfully');
        toast.success('KYC documents updated successfully');
        setEditKYC(false);
        fetchKYCDetails(); // Refresh data
      } else {
        console.error('❌ Update failed:', response.message);
        toast.error(response.message || 'Failed to update KYC documents');
      }
    } catch (error) {
      console.error('❌ Error updating KYC documents:', error);
      toast.error(error.message || 'Failed to update KYC documents');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveBank = async () => {
    if (!editBank) {
      setEditBank(true);
      return;
    }

    // Trigger OTP verification before saving
    try {
      console.log('🔐 Requesting OTP for Bank Details update...');
      const response = await authService.sendEmailOTP('profile-update');
      
      if (response.success) {
        setPendingAction('bank');
        setShowOtpModal(true);
        
        // Show static OTP in development
        if (response.data?.otp) {
          console.log('🔑 Development OTP:', response.data.otp);
          toast.success(`OTP sent! Use: ${response.data.otp}`);
        }
      } else {
        toast.error(response.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('❌ Error sending OTP:', error);
      toast.error(error.message || 'Failed to send OTP');
    }
  };

  const saveBankDetails = async () => {
    try {
      console.log('🌐 Saving Bank Details...');
      setSubmitting(true);
      
      // Send data directly (not nested in bankDetails)
      const data = {
        bankName: form.bankName,
        accountHolderName: form.accountHolder,
        accountNumber: form.accountNumber,
        ifscCode: form.ifsc,
        branchAddress: form.branch,
        upiId: form.upiId,
      };
      
      console.log('📤 Bank Details payload:', data);
      const response = await userService.updateKYCDetails(data);
      console.log('📥 Update response:', response);
      
      if (response.success) {
        console.log('✅ Bank details updated successfully');
        toast.success('Bank details updated successfully');
        setEditBank(false);
        fetchKYCDetails(); // Refresh data
      } else {
        console.error('❌ Update failed:', response.message);
        toast.error(response.message || 'Failed to update bank details');
      }
    } catch (error) {
      console.error('❌ Error updating bank details:', error);
      toast.error(error.message || 'Failed to update bank details');
    } finally {
      setSubmitting(false);
    }
  };

  // OTP Verification Handler
  const handleVerifyOTP = async (otp) => {
    try {
      console.log('🔐 Verifying OTP for action:', pendingAction);
      const response = await authService.verifyEmailOTP(otp);
      
      if (response.success) {
        console.log('✅ OTP verified successfully');
        toast.success('OTP verified successfully');
        setShowOtpModal(false);
        
        // Execute the pending action
        if (pendingAction === 'personal') {
          await savePersonalDetails();
        } else if (pendingAction === 'kyc') {
          await saveKYCDetails();
        } else if (pendingAction === 'bank') {
          await saveBankDetails();
        }
        
        setPendingAction(null);
      } else {
        toast.error(response.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('❌ Error verifying OTP:', error);
      toast.error(error.message || 'Failed to verify OTP');
    }
  };

  // Resend OTP Handler
  const handleResendOTP = async () => {
    try {
      console.log('🔄 Resending OTP...');
      const response = await authService.sendEmailOTP('profile-update');
      
      if (response.success) {
        toast.success('OTP sent successfully');
        
        // Show static OTP in development
        if (response.data?.otp) {
          console.log('🔑 Development OTP:', response.data.otp);
          toast.success(`New OTP: ${response.data.otp}`);
        }
      } else {
        toast.error(response.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('❌ Error resending OTP:', error);
      toast.error(error.message || 'Failed to resend OTP');
    }
  };

  const handleSubmitKYC = async () => {
    try {
      console.log('🌐 Submitting KYC for approval...');
      setSubmitting(true);
      
      // Validate required fields
      if (!form.firstName || !form.lastName || !form.pan || !form.aadhaar || !form.accountNumber) {
        toast.error('Please fill all required fields (Personal Details, PAN, Aadhaar, Bank Account)');
        setSubmitting(false);
        return;
      }
      
      // Send data in the format backend expects
      const data = {
        // Personal Details - direct properties
        firstName: form.firstName,
        lastName: form.lastName,
        dob: form.dob,
        gender: form.gender,
        address1: form.address1,
        city: form.city,
        state: form.state,
        zip: form.zip,
        country: form.country,
        // KYC Documents - direct properties
        panNumber: form.pan,
        aadhaarNumber: form.aadhaar,
        // Bank Details - direct properties
        bankName: form.bankName,
        accountHolderName: form.accountHolder,
        accountNumber: form.accountNumber,
        ifscCode: form.ifsc,
        branchAddress: form.branch,
        upiId: form.upiId,
      };
      
      console.log('📤 Full KYC submission payload:', data);
      const response = await userService.updateKYCDetails(data);
      console.log('📥 Submit response:', response);
      
      if (response.success) {
        console.log('✅ KYC submitted successfully for approval');
        toast.success('KYC submitted successfully! Pending admin approval.');
        fetchKYCDetails(); // Refresh to show updated status
      } else {
        console.error('❌ Submit failed:', response.message);
        toast.error(response.message || 'Failed to submit KYC');
      }
    } catch (error) {
      console.error('❌ Error submitting KYC:', error);
      toast.error(error.message || 'Failed to submit KYC');
    } finally {
      setSubmitting(false);
    }
  };

  const sectionHeader = (title, editable, toggleFn) => (
    <div className="flex justify-between items-center mb-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      <button
        onClick={toggleFn}
        disabled={submitting || kycStatus === 'approved'}
        className={`text-sm px-3 py-1 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed ${
          editable
            ? darkMode
              ? "bg-green-700 hover:bg-green-600 text-white"
              : "bg-green-500 hover:bg-green-600 text-white"
            : darkMode
            ? "bg-blue-700 hover:bg-blue-600 text-white"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
      >
        {submitting ? 'Saving...' : (editable ? "Save" : "Edit")}
      </button>
    </div>
  );

  // Show loading state
  if (loading) {
    return (
      <div
        className={`min-h-screen py-8 px-0 transition-all duration-300 ${
          darkMode ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"
        }`}
      >
        <div className="max-w-full px-4">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading KYC details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Get status display
  const getStatusDisplay = () => {
    switch (kycStatus) {
      case 'approved':
        return {
          text: 'Approved',
          class: darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'
        };
      case 'pending':
        return {
          text: 'Pending Review by Admin',
          class: darkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-700'
        };
      case 'rejected':
        return {
          text: 'Rejected',
          class: darkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700'
        };
      default:
        return {
          text: 'Not Submitted',
          class: darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div
      className={`min-h-screen py-8 px-0 transition-all duration-300 ${
        darkMode ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* ✅ Changed pt-16 to py-8 to remove extra top padding */}
      <div className="max-w-full px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 mb-4 px-4 py-2 rounded-lg transition duration-200 ${
            darkMode 
              ? "bg-gray-800 hover:bg-gray-700 text-gray-300" 
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        {/* Header */}
        <h2 className="text-xl font-bold mb-2">KYC/Personal Details</h2>
        <div className="mb-6">
          <p className="text-sm font-medium">
            KYC Verification Status:{" "}
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${statusDisplay.class}`}
            >
              {statusDisplay.text}
            </span>
          </p>
          {kycStatus === 'rejected' && rejectionReason && (
            <div className={`mt-3 p-3 rounded-lg ${
              darkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
            }`}>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                Rejection Reason: {rejectionReason}
              </p>
            </div>
          )}
        </div>

        {/* Personal Details */}
        <section
          className={`${
            darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
          } border rounded-xl p-6 shadow-sm mb-6`}
        >
          {sectionHeader("Personal Details", editPersonal, handleSavePersonal)}
          <p className="text-sm text-gray-500 mb-5">
            Ensure all details are accurate and up-to-date for verification.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              ["First Name", "firstName"],
              ["Last Name", "lastName"],
              ["Email Address", "email"],
              ["Phone Number", "phone"],
              ["Date of Birth", "dob", "date"],
              ["Gender", "gender", "select"],
              ["Address Line 1", "address1"],
              ["City", "city"],
              ["State", "state"],
              ["ZIP Code", "zip"],
              ["Country", "country"],
            ].map(([label, name, type]) => (
              <div key={name}>
                <label className={labelClass}>{label}</label>
                {type === "select" ? (
                  <select
                    name={name}
                    value={form[name]}
                    onChange={handleInput}
                    disabled={!editPersonal || kycStatus === 'approved'}
                    className={smallInput(editPersonal && kycStatus !== 'approved')}
                  >
                    <option value="">Select Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                ) : (
                  <input
                    type={type || "text"}
                    name={name}
                    value={form[name]}
                    onChange={handleInput}
                    readOnly={!editPersonal || kycStatus === 'approved'}
                    className={smallInput(editPersonal && kycStatus !== 'approved')}
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* KYC Documents */}
        <section
          className={`${
            darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
          } border rounded-xl p-6 shadow-sm mb-6`}
        >
          {sectionHeader("KYC Documents", editKYC, handleSaveKYC)}
          <p className="text-sm text-gray-500 mb-5">
            Please upload clear images of your PAN Card and Aadhar Card.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>PAN Card</label>
              <input
                name="pan"
                value={form.pan}
                onChange={handleInput}
                readOnly={!editKYC || kycStatus === 'approved'}
                className={smallInput(editKYC && kycStatus !== 'approved')}
                placeholder="ABCDE1234F"
              />
            </div>

            <div>
              <label className={labelClass}>Aadhaar Card</label>
              <input
                name="aadhaar"
                value={form.aadhaar}
                onChange={handleInput}
                readOnly={!editKYC || kycStatus === 'approved'}
                className={smallInput(editKYC && kycStatus !== 'approved')}
                placeholder="1234 5678 9012"
              />
            </div>
          </div>
        </section>

        {/* Bank Details */}
        <section
          className={`${
            darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
          } border rounded-xl p-6 shadow-sm mb-6`}
        >
          {sectionHeader("Bank Details", editBank, handleSaveBank)}
          <p className="text-sm text-gray-500 mb-5">
            Provide your bank account details for smooth withdrawals.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Bank Name</label>
              <input
                name="bankName"
                value={form.bankName}
                onChange={handleInput}
                readOnly={!editBank || kycStatus === 'approved'}
                className={smallInput(editBank && kycStatus !== 'approved')}
              />
            </div>
            <div>
              <label className={labelClass}>Account Holder Name</label>
              <input
                name="accountHolder"
                value={form.accountHolder}
                onChange={handleInput}
                readOnly={!editBank || kycStatus === 'approved'}
                className={smallInput(editBank && kycStatus !== 'approved')}
              />
            </div>
            <div>
              <label className={labelClass}>Account Number</label>
              <input
                name="accountNumber"
                value={form.accountNumber}
                onChange={handleInput}
                readOnly={!editBank || kycStatus === 'approved'}
                className={smallInput(editBank && kycStatus !== 'approved')}
              />
            </div>
            <div>
              <label className={labelClass}>IFSC Code</label>
              <input
                name="ifsc"
                value={form.ifsc}
                onChange={handleInput}
                readOnly={!editBank || kycStatus === 'approved'}
                className={smallInput(editBank && kycStatus !== 'approved')}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Branch Address</label>
              <input
                name="branch"
                value={form.branch}
                onChange={handleInput}
                readOnly={!editBank || kycStatus === 'approved'}
                className={smallInput(editBank && kycStatus !== 'approved')}
              />
            </div>
            <div>
              <label className={labelClass}>UPI ID (Optional)</label>
              <input
                name="upiId"
                value={form.upiId}
                onChange={handleInput}
                readOnly={!editBank || kycStatus === 'approved'}
                className={smallInput(editBank && kycStatus !== 'approved')}
                placeholder="yourname@upi"
              />
            </div>
          </div>
        </section>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button 
            onClick={handleSubmitKYC}
            disabled={submitting || kycStatus === 'approved' || kycStatus === 'pending'}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : (kycStatus === 'pending' ? 'KYC Submitted (Pending Review)' : (kycStatus === 'approved' ? 'KYC Approved' : 'Submit KYC for Approval'))}
          </button>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <OtpModal
        isOpen={showOtpModal}
        onClose={() => {
          setShowOtpModal(false);
          setPendingAction(null);
        }}
        onVerify={handleVerifyOTP}
        onResend={handleResendOTP}
        email={userEmail}
        purpose="profile-update"
        darkMode={true}
      />
    </div>
  );
};

// ✅ Export with MemoryRouter fallback (for tests)
const WrappedKYCDetails = (props) => (
  typeof window === "undefined"
    ? <MemoryRouter><KYCDetails {...props} /></MemoryRouter>
    : <KYCDetails {...props} />
);

export default WrappedKYCDetails;