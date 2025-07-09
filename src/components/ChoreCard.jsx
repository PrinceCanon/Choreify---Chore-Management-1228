import React from 'react';
import { motion } from 'framer-motion';
import { format, isToday, isPast } from 'date-fns';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiClock, FiUser, FiCalendar, FiCheck, FiX, FiEdit, FiTrash2 } = FiIcons;

const ChoreCard = ({ chore, onComplete, onEdit, onDelete, showActions = true }) => {
  const isOverdue = chore.dueDate && isPast(new Date(chore.dueDate)) && !chore.completed;
  const isDueToday = chore.dueDate && isToday(new Date(chore.dueDate));

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-danger-600 bg-danger-50';
      case 'medium':
        return 'text-warning-600 bg-warning-50';
      case 'low':
        return 'text-success-600 bg-success-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = () => {
    if (chore.completed) return 'border-success-200 bg-success-50';
    if (isOverdue) return 'border-danger-200 bg-danger-50';
    if (isDueToday) return 'border-warning-200 bg-warning-50';
    return 'border-gray-200 bg-white';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`card card-hover p-4 ${getStatusColor()}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h3 className={`font-semibold text-lg ${chore.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {chore.title}
            </h3>
            {chore.priority && (
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(chore.priority)}`}>
                {chore.priority}
              </span>
            )}
          </div>

          {chore.description && (
            <p className="text-gray-600 text-sm mb-3">{chore.description}</p>
          )}

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {chore.dueDate && (
              <div className="flex items-center">
                <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-1" />
                <span className={isOverdue ? 'text-danger-600 font-medium' : ''}>
                  {format(new Date(chore.dueDate), 'MMM d, yyyy')}
                </span>
              </div>
            )}
            {chore.assignedTo && (
              <div className="flex items-center">
                <SafeIcon icon={FiUser} className="w-4 h-4 mr-1" />
                <span>Assigned to {chore.assignedTo}</span>
              </div>
            )}
            {chore.recurring && (
              <div className="flex items-center">
                <SafeIcon icon={FiClock} className="w-4 h-4 mr-1" />
                <span>Repeats {chore.recurring}</span>
              </div>
            )}
          </div>

          {chore.completed && chore.completedAt && (
            <div className="mt-2 text-sm text-success-600">
              <SafeIcon icon={FiCheck} className="w-4 h-4 mr-1 inline" />
              Completed on {format(new Date(chore.completedAt), 'MMM d, yyyy')}
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex items-center space-x-2 ml-4">
            {!chore.completed ? (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onComplete(chore.id)}
                className="p-2 text-success-600 hover:bg-success-100 rounded-lg transition-colors"
                title="Mark as complete"
              >
                <SafeIcon icon={FiCheck} className="w-5 h-5" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onComplete(chore.id)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Mark as incomplete"
              >
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onEdit(chore)}
              className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg transition-colors"
              title="Edit chore"
            >
              <SafeIcon icon={FiEdit} className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete(chore.id)}
              className="p-2 text-danger-600 hover:bg-danger-100 rounded-lg transition-colors"
              title="Delete chore"
            >
              <SafeIcon icon={FiTrash2} className="w-5 h-5" />
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChoreCard;