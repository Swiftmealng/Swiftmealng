import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { riderAPI, tokenManager } from '../../services/api';

const RiderProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [profile, setProfile] = useState({
    name: 'Mike Johnson',
    email: 'mike@swiftmeal.ng',
    phone: '+234 805 678 9012',
    vehicleType: 'motorcycle',
    vehicleNumber: 'ABC-123-XY',
    photoUrl: null
  });

  const [stats] = useState({
    totalDeliveries: 245,
    rating: 4.8,
    totalEarnings: 450000,
    completionRate: 98.5,
    averageTime: 22,
    onTimeRate: 95
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoPreview) return;

    const file = fileInputRef.current?.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const user = tokenManager.getUser();
      const riderId = user?._id || user?.id;
      
      const response = await riderAPI.uploadPhoto(riderId, file);
      
      if (response.success) {
        setProfile({ ...profile, photoUrl: response.data.photoUrl });
        setPhotoPreview(null);
      }
      
      setIsLoading(false);
      
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo');
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const user = tokenManager.getUser();
      const riderId = user?._id || user?.id;
      
      const response = await riderAPI.updateProfile(riderId, {
        vehicleType: profile.vehicleType,
        vehicleNumber: profile.vehicleNumber,
        phone: profile.phone
      });
      
      if (response.success) {
        setIsEditing(false);
      }
      
      setIsLoading(false);
      
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/rider/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600">Manage your rider profile</p>
            </div>
          </div>
          
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 bg-[#FF0000] text-white rounded-full font-semibold hover:bg-[#E00000] transition-colors"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setPhotoPreview(null);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="px-6 py-2 bg-[#FF0000] text-white rounded-full font-semibold hover:bg-[#E00000] transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Profile Photo Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Photo</h2>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              {photoPreview || profile.photoUrl ? (
                <img
                  src={photoPreview || profile.photoUrl}
                  alt="Profile"
                  className="h-32 w-32 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                  <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{profile.name}</h3>
              <p className="text-gray-600 mb-4">Professional Rider</p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
              
              {photoPreview ? (
                <div className="flex gap-2">
                  <button
                    onClick={handlePhotoUpload}
                    disabled={isLoading}
                    className="px-4 py-2 bg-[#00A651] text-white rounded-full font-semibold hover:bg-[#008A43] transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Uploading...' : 'Upload Photo'}
                  </button>
                  <button
                    onClick={() => setPhotoPreview(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-colors"
                >
                  Change Photo
                </button>
              )}
              
              <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF (max 5MB)</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                disabled={!isEditing}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                disabled={!isEditing}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                disabled={!isEditing}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
              <select
                value={profile.vehicleType}
                onChange={(e) => setProfile({ ...profile, vehicleType: e.target.value })}
                disabled={!isEditing}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="motorcycle">Motorcycle</option>
                <option value="bicycle">Bicycle</option>
                <option value="car">Car</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Number</label>
              <input
                type="text"
                value={profile.vehicleNumber}
                onChange={(e) => setProfile({ ...profile, vehicleNumber: e.target.value })}
                disabled={!isEditing}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="ABC-123-XY"
              />
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Deliveries</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDeliveries}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Rating</p>
              <div className="flex items-center gap-1">
                <p className="text-2xl font-bold text-gray-900">{stats.rating}</p>
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
              <p className="text-2xl font-bold text-[#00A651]">₦{stats.totalEarnings.toLocaleString()}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Avg Delivery Time</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageTime} min</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">On-Time Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.onTimeRate}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderProfile;
