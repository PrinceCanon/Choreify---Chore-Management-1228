import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import * as FiIcons from 'react-icons/fi';

const CategoryContext = createContext();

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};

// Predefined icon library with friendly names
const AVAILABLE_ICONS = [
  { name: 'Cleaning', icon: FiIcons.FiDroplet, key: 'FiDroplet' },
  { name: 'Kitchen', icon: FiIcons.FiCoffee, key: 'FiCoffee' },
  { name: 'Laundry', icon: FiIcons.FiShirt, key: 'FiShirt' },
  { name: 'Garden', icon: FiIcons.FiSun, key: 'FiSun' },
  { name: 'Maintenance', icon: FiIcons.FiTool, key: 'FiTool' },
  { name: 'Shopping', icon: FiIcons.FiShoppingCart, key: 'FiShoppingCart' },
  { name: 'Pet Care', icon: FiIcons.FiHeart, key: 'FiHeart' },
  { name: 'Trash', icon: FiIcons.FiTrash2, key: 'FiTrash2' },
  { name: 'Bathroom', icon: FiIcons.FiDroplet, key: 'FiDroplet' },
  { name: 'Bedroom', icon: FiIcons.FiMoon, key: 'FiMoon' },
  { name: 'Living Room', icon: FiIcons.FiMonitor, key: 'FiMonitor' },
  { name: 'Office', icon: FiIcons.FiBriefcase, key: 'FiBriefcase' },
  { name: 'Car', icon: FiIcons.FiTruck, key: 'FiTruck' },
  { name: 'Bills', icon: FiIcons.FiCreditCard, key: 'FiCreditCard' },
  { name: 'Health', icon: FiIcons.FiActivity, key: 'FiActivity' },
  { name: 'Study', icon: FiIcons.FiBook, key: 'FiBook' },
  { name: 'Exercise', icon: FiIcons.FiZap, key: 'FiZap' },
  { name: 'Cooking', icon: FiIcons.FiCoffee, key: 'FiCoffee' },
  { name: 'Organizer', icon: FiIcons.FiGrid, key: 'FiGrid' },
  { name: 'Important', icon: FiIcons.FiStar, key: 'FiStar' },
  { name: 'Urgent', icon: FiIcons.FiAlertTriangle, key: 'FiAlertTriangle' },
  { name: 'Routine', icon: FiIcons.FiRepeat, key: 'FiRepeat' },
  { name: 'Fun', icon: FiIcons.FiSmile, key: 'FiSmile' },
  { name: 'Work', icon: FiIcons.FiLayers, key: 'FiLayers' },
  { name: 'Personal', icon: FiIcons.FiUser, key: 'FiUser' },
];

const CategoryProvider = ({ children }) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [categories, setCategories] = useState([]);

  // Default categories
  const defaultCategories = [
    {
      id: 'default-cleaning',
      name: 'Cleaning',
      icon: 'FiDroplet',
      color: '#3b82f6',
      isDefault: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'default-kitchen',
      name: 'Kitchen',
      icon: 'FiCoffee',
      color: '#f59e0b',
      isDefault: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'default-laundry',
      name: 'Laundry',
      icon: 'FiShirt',
      color: '#8b5cf6',
      isDefault: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'default-maintenance',
      name: 'Maintenance',
      icon: 'FiTool',
      color: '#ef4444',
      isDefault: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'default-shopping',
      name: 'Shopping',
      icon: 'FiShoppingCart',
      color: '#10b981',
      isDefault: true,
      createdAt: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    if (user) {
      loadCategories();
    }
  }, [user]);

  const loadCategories = () => {
    const savedCategories = localStorage.getItem('choreify_categories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      // Initialize with default categories
      setCategories(defaultCategories);
      localStorage.setItem('choreify_categories', JSON.stringify(defaultCategories));
    }
  };

  const saveCategories = (updatedCategories) => {
    setCategories(updatedCategories);
    localStorage.setItem('choreify_categories', JSON.stringify(updatedCategories));
  };

  const addCategory = (categoryData) => {
    const newCategory = {
      id: uuidv4(),
      ...categoryData,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };

    const updatedCategories = [...categories, newCategory];
    saveCategories(updatedCategories);
    showNotification('Category created successfully!', 'success');
    return newCategory;
  };

  const updateCategory = (categoryId, updates) => {
    const updatedCategories = categories.map(category =>
      category.id === categoryId ? { ...category, ...updates } : category
    );
    saveCategories(updatedCategories);
    showNotification('Category updated successfully!', 'success');
  };

  const deleteCategory = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (category?.isDefault) {
      showNotification('Cannot delete default categories', 'error');
      return false;
    }

    const updatedCategories = categories.filter(category => category.id !== categoryId);
    saveCategories(updatedCategories);
    showNotification('Category deleted successfully!', 'success');
    return true;
  };

  const getCategoryById = (categoryId) => {
    return categories.find(category => category.id === categoryId);
  };

  const getIconComponent = (iconKey) => {
    const iconData = AVAILABLE_ICONS.find(icon => icon.key === iconKey);
    return iconData ? iconData.icon : FiIcons.FiCircle;
  };

  const value = {
    categories,
    availableIcons: AVAILABLE_ICONS,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getIconComponent,
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

export default CategoryProvider;