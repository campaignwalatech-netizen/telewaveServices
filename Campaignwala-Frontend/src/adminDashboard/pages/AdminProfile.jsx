import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Edit2, Save, X, Lock, Eye, EyeOff } from 'lucide-react';
import authService from '../../services/authService';
import toast, { Toaster } from 'react-hot-toast';

const AdminProfile = ({ darkMode, setDarkMode }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    role: 'admin'
  });

  const [editData, setEditData] = useState({
    name: '',
    phoneNumber: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch admin profile
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfile();
      
      if (response.success) {
        const user = response.data?.user || response.data;
        setProfileData({
          name: user.name || 'Admin User',
          email: user.email || 'N/A',
          phoneNumber: user.phoneNumber || 'N/A',
          role: user.role || 'admin'
        });
        setEditData({
          name: user.name || '',
          phoneNumber: user.phoneNumber || ''
        });
      } else {
        toast.error(response.message || 'Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(error.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      name: profileData.name,
      phoneNumber: profileData.phoneNumber
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      name: profileData.name,
      phoneNumber: profileData.phoneNumber
    });
  };

  const handleSave = async () => {
    // Validation
    if (!editData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (editData.phoneNumber && !/^[0-9]{10}$/.test(editData.phoneNumber)) {
      toast.error('Phone number must be 10 digits');
      return;
    }

    try {
      setSaving(true);
      const response = await authService.updateProfile({
        name: editData.name.trim(),
        phoneNumber: editData.phoneNumber || undefined
      });

      if (response.success) {
        toast.success('Profile updated successfully');
        setProfileData(prev => ({
          ...prev,
          name: editData.name.trim(),
          phoneNumber: editData.phoneNumber
        }));
        setIsEditing(false);
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    // Validation
    if (!passwordData.currentPassword) {
      toast.error('Current password is required');
      return;
    }

    if (!passwordData.newPassword) {
      toast.error('New password is required');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    try {
      setChangingPassword(true);
      const response = await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });

      if (response.success) {
        toast.success('Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordForm(false);
      } else {
        toast.error(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const getUserInitial = () => {
    if (!profileData.name || profileData.name === 'Loading...') {
      return 'A';
    }
    return profileData.name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: darkMode ? {
            background: '#1F2937',
            color: '#fff',
            border: '1px solid #374151'
          } : {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: darkMode ? {
              background: '#065F46',
              border: '1px solid #047857'
            } : {
              background: '#059669',
            },
          },
          error: {
            duration: 5000,
            style: darkMode ? {
              background: '#7F1D1D',
              border: '1px solid #991B1B'
            } : {
              background: '#DC2626',
            },
          },
        }}
      />

      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Admin Profile
        </h1>
        <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage your profile information and security settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className={`lg:col-span-2 rounded-xl shadow-lg overflow-hidden ${
          darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          {/* Profile Header */}
          <div
            className="h-32 w-full relative"
            style={{
              background: darkMode
                ? 'linear-gradient(135deg, #1F2937, #374151, #4B5563)'
                : 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)'
            }}
          >
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
              <div className={`w-24 h-24 rounded-full border-4 ${
                darkMode ? 'border-gray-800 bg-gray-700' : 'border-white bg-blue-100'
              } flex items-center justify-center shadow-lg`}>
                <span className={`text-3xl font-bold ${
                  darkMode ? 'text-white' : 'text-blue-600'
                }`}>
                  {getUserInitial()}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-16 pb-6 px-6">
            <div className="text-center mb-6">
              <h2 className={`text-2xl font-bold mb-1 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {profileData.name}
              </h2>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
                darkMode
                  ? 'bg-purple-900/30 text-purple-300 border border-purple-700'
                  : 'bg-purple-100 text-purple-700 border border-purple-200'
              }`}>
                <Shield size={14} />
                <span className="text-sm font-medium capitalize">{profileData.role}</span>
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-4">
              <div className={`flex items-center gap-4 p-4 rounded-lg ${
                darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}>
                <div className={`p-2 rounded-lg ${
                  darkMode ? 'bg-gray-600' : 'bg-blue-100'
                }`}>
                  <Mail className={darkMode ? 'text-blue-400' : 'text-blue-600'} size={20} />
                </div>
                <div className="flex-1">
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Email Address
                  </p>
                  <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {profileData.email}
                  </p>
                </div>
              </div>

              <div className={`flex items-center gap-4 p-4 rounded-lg ${
                darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}>
                <div className={`p-2 rounded-lg ${
                  darkMode ? 'bg-gray-600' : 'bg-green-100'
                }`}>
                  <Phone className={darkMode ? 'text-green-400' : 'text-green-600'} size={20} />
                </div>
                <div className="flex-1">
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Phone Number
                  </p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.phoneNumber}
                      onChange={(e) => setEditData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="Enter phone number"
                      className={`w-full mt-1 px-3 py-2 rounded-lg border ${
                        darkMode
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      maxLength={10}
                    />
                  ) : (
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {profileData.phoneNumber}
                    </p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className={`flex items-center gap-4 p-4 rounded-lg ${
                  darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                  <div className={`p-2 rounded-lg ${
                    darkMode ? 'bg-gray-600' : 'bg-purple-100'
                  }`}>
                    <User className={darkMode ? 'text-purple-400' : 'text-purple-600'} size={20} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Full Name
                    </p>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your name"
                      className={`w-full mt-1 px-3 py-2 rounded-lg border ${
                        darkMode
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
                  >
                    <X size={18} />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                  <Edit2 size={18} />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Security Card */}
        <div className={`rounded-xl shadow-lg p-6 ${
          darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${
              darkMode ? 'bg-gray-700' : 'bg-red-100'
            }`}>
              <Lock className={darkMode ? 'text-red-400' : 'text-red-600'} size={20} />
            </div>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Security
            </h3>
          </div>

          {!showPasswordForm ? (
            <div>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Keep your account secure by changing your password regularly.
              </p>
              <button
                onClick={() => setShowPasswordForm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
              >
                <Lock size={18} />
                <span>Change Password</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                    className={`w-full px-3 py-2 pr-10 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                    className={`w-full px-3 py-2 pr-10 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                    className={`w-full px-3 py-2 pr-10 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {changingPassword ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Changing...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  disabled={changingPassword}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
                >
                  <X size={18} />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;

