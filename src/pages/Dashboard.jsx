import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useChores } from '../contexts/ChoreContext';
import { useAuth } from '../hooks/useAuth';
import ChoreCard from '../components/ChoreCard';
import ChoreModal from '../components/ChoreModal';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiFilter, FiCheckSquare, FiClock, FiAlertTriangle, FiTrendingUp } = FiIcons;

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    chores, 
    addChore, 
    updateChore, 
    completeChore, 
    uncompleteChore, 
    deleteChore,
    getChoresByStatus,
    getOverdueChores,
    getTodaysChores 
  } = useChores();
  
  const [showModal, setShowModal] = useState(false);
  const [editingChore, setEditingChore] = useState(null);
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('pending');

  const completedChores = getChoresByStatus(true);
  const pendingChores = getChoresByStatus(false);
  const overdueChores = getOverdueChores();
  const todaysChores = getTodaysChores();

  const handleAddChore = (choreData) => {
    addChore(choreData);
  };

  const handleEditChore = (choreData) => {
    updateChore(editingChore.id, choreData);
    setEditingChore(null);
  };

  const handleCompleteChore = (choreId) => {
    const chore = chores.find(c => c.id === choreId);
    if (chore.completed) {
      uncompleteChore(choreId);
    } else {
      completeChore(choreId);
    }
  };

  const handleDeleteChore = (choreId) => {
    if (window.confirm('Are you sure you want to delete this chore?')) {
      deleteChore(choreId);
    }
  };

  const openEditModal = (chore) => {
    setEditingChore(chore);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingChore(null);
  };

  const getFilteredChores = () => {
    let filtered = viewMode === 'completed' ? completedChores : pendingChores;
    
    if (filter === 'today') {
      filtered = filtered.filter(chore => 
        chore.dueDate && new Date(chore.dueDate).toDateString() === new Date().toDateString()
      );
    } else if (filter === 'overdue') {
      filtered = filtered.filter(chore => 
        chore.dueDate && new Date(chore.dueDate) < new Date() && !chore.completed
      );
    } else if (filter === 'mine') {
      filtered = filtered.filter(chore => chore.assignedTo === user.name);
    }
    
    return filtered;
  };

  const stats = [
    {
      name: 'Total Chores',
      value: chores.length,
      icon: FiCheckSquare,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      name: 'Completed',
      value: completedChores.length,
      icon: FiCheckSquare,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
    },
    {
      name: 'Overdue',
      value: overdueChores.length,
      icon: FiAlertTriangle,
      color: 'text-danger-600',
      bgColor: 'bg-danger-50',
    },
    {
      name: 'Due Today',
      value: todaysChores.length,
      icon: FiClock,
      color: 'text-warning-600',
      bgColor: 'bg-warning-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Let's get those chores done today
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center mt-4 sm:mt-0"
        >
          <SafeIcon icon={FiPlus} className="w-5 h-5 mr-2" />
          Add Chore
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`card p-6 ${stat.bgColor}`}
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color} ${stat.bgColor}`}>
                <SafeIcon icon={stat.icon} className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'pending'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending ({pendingChores.length})
          </button>
          <button
            onClick={() => setViewMode('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'completed'
                ? 'bg-success-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed ({completedChores.length})
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiFilter} className="w-5 h-5 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Chores</option>
            <option value="today">Due Today</option>
            <option value="overdue">Overdue</option>
            <option value="mine">Assigned to Me</option>
          </select>
        </div>
      </div>

      {/* Chores List */}
      <div className="space-y-4">
        {getFilteredChores().length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={FiCheckSquare} className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {viewMode === 'completed' ? 'No completed chores yet' : 'No chores found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {viewMode === 'completed' 
                ? 'Complete some chores to see them here' 
                : 'Add your first chore to get started'}
            </p>
            {viewMode === 'pending' && (
              <button
                onClick={() => setShowModal(true)}
                className="btn-primary"
              >
                <SafeIcon icon={FiPlus} className="w-5 h-5 mr-2" />
                Add Your First Chore
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {getFilteredChores().map((chore) => (
              <ChoreCard
                key={chore.id}
                chore={chore}
                onComplete={handleCompleteChore}
                onEdit={openEditModal}
                onDelete={handleDeleteChore}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Chore Modal */}
      <ChoreModal
        isOpen={showModal}
        onClose={closeModal}
        onSubmit={editingChore ? handleEditChore : handleAddChore}
        chore={editingChore}
      />
    </div>
  );
};

export default Dashboard;