import React, { useState } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminInvitePage = () => {
  const [formData, setFormData] = useState({
    email: '',
    role: 'admin'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setInviteLink('');

    try {
      const response = await adminAPI.sendInvite(formData);
      const data = await response.json();

      if (data.success) {
        setInviteLink(data.data.inviteLink);
        toast.success('Invitation link generated successfully!');
        setFormData({ email: '', role: 'admin' });
      } else {
        toast.error(data.message || 'Failed to generate invite link');
      }
    } catch (err) {
      console.error('Invite error:', err);
      toast.error(err.message || 'Failed to generate invite link');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success('Invite link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
       {/* Remove this entire Toast section */}

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Invitation System
          </h1>
          <p className="text-gray-600">
            Generate secure invitation links for new admin users
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg 
              className="w-5 h-5 text-blue-600 mt-0.5 mr-3" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                clipRule="evenodd" 
              />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                Security Notice
              </h3>
              <p className="text-sm text-blue-700">
                Admin and Operations roles can ONLY be created via invitation. 
                Invite links expire after 7 days.
              </p>
            </div>
          </div>
        </div>

        {/* Invite Form */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="newadmin@swiftmeal.ng"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                The invitation will be sent to this email
              </p>
            </div>

            {/* Role Selection */}
            <div>
              <label 
                htmlFor="role" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              >
                <option value="admin">Admin (Full Access)</option>
                <option value="operations">Operations (Order Management)</option>
                <option value="support">Support (Partner Kitchen)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select the appropriate role for the new user
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 text-white px-6 py-3 rounded-full font-medium hover:bg-red-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg 
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Generating...
                </>
              ) : (
                'Generate Invite Link'
              )}
            </button>
          </form>

          {/* Invite Link Display */}
          {inviteLink && (
            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-green-900">
                  ✅ Invitation Link Generated
                </h3>
                <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                  Expires in 7 days
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 px-4 py-2 bg-white border border-green-300 rounded-lg text-sm font-mono text-gray-700 focus:outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
                >
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
                    />
                  </svg>
                  Copy
                </button>
              </div>

              <p className="text-xs text-green-700 mt-3">
                Share this link with the new user. They can use it to create their account with the assigned role.
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            How It Works
          </h3>
          <ol className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 font-semibold mr-3 flex-shrink-0">
                1
              </span>
              <span>Enter the email address of the person you want to invite</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 font-semibold mr-3 flex-shrink-0">
                2
              </span>
              <span>Select the appropriate role (Admin, Operations, or Support)</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 font-semibold mr-3 flex-shrink-0">
                3
              </span>
              <span>Click "Generate Invite Link" to create a secure invitation</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 font-semibold mr-3 flex-shrink-0">
                4
              </span>
              <span>Copy and share the link with the new user (via email, Slack, etc.)</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 font-semibold mr-3 flex-shrink-0">
                5
              </span>
              <span>The user will be automatically assigned the selected role upon signup</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AdminInvitePage;
