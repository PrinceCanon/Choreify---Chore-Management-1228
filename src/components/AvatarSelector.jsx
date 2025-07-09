import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { compressImage, fileToBase64, isValidImage } from '../utils/imageCompression';
import { useNotification } from '../contexts/NotificationContext';

const { FiX, FiUpload, FiCamera, FiUser } = FiIcons;

const AvatarSelector = ({ isOpen, onClose, onSelect, currentAvatar }) => {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const [isUploading, setIsUploading] = useState(false);
  const { showNotification } = useNotification();

  // Predefined avatar options
  const avatarOptions = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=1&backgroundColor=b6e3f4,c0aede,d1d4f9',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=2&backgroundColor=b6e3f4,c0aede,d1d4f9',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=3&backgroundColor=b6e3f4,c0aede,d1d4f9',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=4&backgroundColor=b6e3f4,c0aede,d1d4f9',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=5&backgroundColor=b6e3f4,c0aede,d1d4f9',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=6&backgroundColor=b6e3f4,c0aede,d1d4f9',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=7&backgroundColor=b6e3f4,c0aede,d1d4f9',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=8&backgroundColor=b6e3f4,c0aede,d1d4f9',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=9&backgroundColor=b6e3f4,c0aede,d1d4f9',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=10&backgroundColor=b6e3f4,c0aede,d1d4f9',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=11&backgroundColor=b6e3f4,c0aede,d1d4f9',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=12&backgroundColor=b6e3f4,c0aede,d1d4f9',
  ];

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!isValidImage(file)) {
      showNotification('Please upload a valid image file (JPEG, PNG, GIF, WebP) under 5MB', 'error');
      return;
    }

    setIsUploading(true);
    try {
      // Compress the image
      const compressedFile = await compressImage(file, {
        maxWidth: 300,
        maxHeight: 300,
        quality: 0.8
      });

      // Convert to base64
      const base64String = await fileToBase64(compressedFile);
      setSelectedAvatar(base64String);
      showNotification('Image uploaded and compressed successfully!', 'success');
    } catch (error) {
      showNotification('Failed to process image. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    onSelect(selectedAvatar);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 relative max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Choose Avatar</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </button>
            </div>

            {/* Current Selection */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                  {selectedAvatar ? (
                    <img
                      src={selectedAvatar}
                      alt="Selected avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <SafeIcon icon={FiUser} className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Current Selection</h3>
                  <p className="text-sm text-gray-500">
                    {selectedAvatar ? 'Avatar selected' : 'No avatar selected'}
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Section */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-medium text-gray-900 mb-4">Upload Custom Image</h3>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="avatar-upload"
                  disabled={isUploading}
                />
                <label
                  htmlFor="avatar-upload"
                  className={`flex items-center justify-center w-full p-4 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                    isUploading
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      : 'border-gray-300 hover:border-primary-500 hover:bg-primary-50'
                  }`}
                >
                  <div className="text-center">
                    <SafeIcon
                      icon={isUploading ? FiCamera : FiUpload}
                      className={`w-8 h-8 mx-auto mb-2 ${
                        isUploading ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    />
                    <p className="text-sm font-medium text-gray-900">
                      {isUploading ? 'Processing...' : 'Click to upload'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      JPEG, PNG, GIF, WebP (max 5MB)
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Predefined Avatars */}
            <div className="p-6">
              <h3 className="font-medium text-gray-900 mb-4">Choose from Gallery</h3>
              <div className="grid grid-cols-4 gap-3">
                {avatarOptions.map((avatar, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`w-full aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      selectedAvatar === avatar
                        ? 'border-primary-500 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={avatar}
                      alt={`Avatar option ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="flex-1 border-2 border-gray-300 hover:border-primary-500 text-gray-700 hover:text-primary-500 font-medium py-3 px-6 rounded-xl hover:bg-primary-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!selectedAvatar}
                className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-medium py-3 px-6 rounded-xl shadow-lg transition-all duration-200 disabled:cursor-not-allowed"
              >
                Save Avatar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AvatarSelector;