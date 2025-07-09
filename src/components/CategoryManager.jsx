import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCategories } from '../contexts/CategoryContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiEdit, FiTrash2, FiX, FiCheck, FiGrid, FiSave } = FiIcons;

const CategoryManager = ({ isOpen, onClose }) => {
  const { categories, availableIcons, addCategory, updateCategory, deleteCategory, getIconComponent } = useCategories();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: 'FiGrid',
    color: '#3b82f6',
  });

  const colorOptions = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#6366f1',
    '#06b6d4', '#f43f5e', '#22c55e', '#eab308', '#a855f7',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingCategory) {
      updateCategory(editingCategory.id, formData);
      setEditingCategory(null);
    } else {
      addCategory(formData);
    }

    setFormData({ name: '', icon: 'FiGrid', color: '#3b82f6' });
    setShowAddModal(false);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color,
    });
    setShowAddModal(true);
  };

  const handleDelete = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      deleteCategory(categoryId);
    }
  };

  const handleCancel = () => {
    setShowAddModal(false);
    setEditingCategory(null);
    setFormData({ name: '', icon: 'FiGrid', color: '#3b82f6' });
  };

  const handleModalClose = () => {
    if (!showAddModal) {
      onClose();
    }
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
            onClick={handleModalClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 relative max-h-[85vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <SafeIcon icon={FiGrid} className="w-6 h-6 mr-2 text-primary-600" />
                Manage Categories
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </button>
            </div>

            {/* Categories List */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 140px)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Your Categories</h3>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                  <SafeIcon icon={FiPlus} className="w-4 h-4 mr-2" />
                  Add Category
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category) => {
                  const IconComponent = getIconComponent(category.icon);
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 rounded-xl p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                          style={{ backgroundColor: category.color + '20' }}
                        >
                          <SafeIcon 
                            icon={IconComponent} 
                            className="w-5 h-5" 
                            style={{ color: category.color }}
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{category.name}</h4>
                          <p className="text-xs text-gray-500">
                            {category.isDefault ? 'Default category' : 'Custom category'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg transition-colors"
                          title="Edit category"
                        >
                          <SafeIcon icon={FiEdit} className="w-4 h-4" />
                        </button>
                        {!category.isDefault && (
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="p-2 text-danger-600 hover:bg-danger-100 rounded-lg transition-colors"
                            title="Delete category"
                          >
                            <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add/Edit Category Modal - Separate from main modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={handleCancel}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 relative max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h3>
                  <button
                    onClick={handleCancel}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <SafeIcon icon={FiX} className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Category Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter category name"
                      required
                    />
                  </div>

                  {/* Icon Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choose Icon
                    </label>
                    <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                      {availableIcons.map((iconData) => (
                        <button
                          key={iconData.key}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, icon: iconData.key }))}
                          className={`p-2 rounded-lg transition-colors ${
                            formData.icon === iconData.key
                              ? 'bg-primary-100 text-primary-600 border-2 border-primary-500'
                              : 'hover:bg-gray-100 border-2 border-transparent'
                          }`}
                          title={iconData.name}
                        >
                          <SafeIcon icon={iconData.icon} className="w-5 h-5" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choose Color
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, color }))}
                          className={`w-10 h-10 rounded-full border-2 transition-all ${
                            formData.color === color
                              ? 'border-gray-800 scale-110'
                              : 'border-gray-300 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <div className="flex items-center">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                        style={{ backgroundColor: formData.color + '20' }}
                      >
                        <SafeIcon 
                          icon={getIconComponent(formData.icon)} 
                          className="w-4 h-4" 
                          style={{ color: formData.color }}
                        />
                      </div>
                      <span className="font-medium text-gray-900">{formData.name || 'Category Name'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
                    >
                      {editingCategory ? 'Update' : 'Add'} Category
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default CategoryManager;