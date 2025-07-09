import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { useCollaboration } from '../contexts/CollaborationContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMessageSquare, FiX, FiSend, FiEdit, FiTrash2, FiUser } = FiIcons;

const ChoreCommentsModal = ({ isOpen, onClose, choreId, choreTitle }) => {
  const { user } = useAuth();
  const { getCommentsByChoreId, addComment, updateComment, deleteComment } = useCollaboration();
  
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState('');
  
  const commentsEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Load comments
  useEffect(() => {
    if (isOpen && choreId) {
      const choreComments = getCommentsByChoreId(choreId);
      setComments(choreComments);
      // Focus input when opened
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, choreId, getCommentsByChoreId]);
  
  // Scroll to bottom when comments change
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    // Pass the chore title to the addComment function
    const newComment = addComment(choreId, commentText, choreTitle);
    if (newComment) {
      setComments([...comments, newComment]);
      setCommentText('');
    }
  };
  
  const handleEdit = (commentId) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      setEditingCommentId(commentId);
      setEditText(comment.text);
    }
  };
  
  const handleSaveEdit = (commentId) => {
    if (!editText.trim()) return;
    
    const updatedComment = updateComment(commentId, editText);
    if (updatedComment) {
      setComments(comments.map(c => c.id === commentId ? updatedComment : c));
      setEditingCommentId(null);
      setEditText('');
    }
  };
  
  const handleDelete = (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
    }
  };
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return format(date, 'MMM d, yyyy');
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
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <SafeIcon icon={FiMessageSquare} className="w-6 h-6 mr-2 text-secondary-600" />
                Comments on "{choreTitle}"
              </h2>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </button>
            </div>
            
            {/* Comments List */}
            <div className="p-4 overflow-y-auto" style={{ maxHeight: '60vh', minHeight: '200px' }}>
              {comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <SafeIcon icon={FiMessageSquare} className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No comments yet.</p>
                  <p className="text-sm">Be the first to comment!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map(comment => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-100 mr-2 flex-shrink-0">
                            {comment.userAvatar ? (
                              <img src={comment.userAvatar} alt={comment.userName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-primary-700">
                                <SafeIcon icon={FiUser} className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center">
                              <span className="font-medium text-gray-900">{comment.userName}</span>
                              <span className="text-xs text-gray-500 ml-2">{formatTimestamp(comment.timestamp)}</span>
                              {comment.edited && (
                                <span className="text-xs text-gray-500 ml-2">(edited)</span>
                              )}
                            </div>
                            
                            {editingCommentId === comment.id ? (
                              <div className="mt-1">
                                <textarea
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all duration-200 text-sm"
                                  rows={2}
                                  autoFocus
                                />
                                <div className="flex justify-end mt-2 space-x-2">
                                  <button 
                                    onClick={() => setEditingCommentId(null)}
                                    className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button 
                                    onClick={() => handleSaveEdit(comment.id)}
                                    className="px-3 py-1 text-xs bg-secondary-600 hover:bg-secondary-700 text-white rounded-lg transition-colors"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-700 text-sm mt-1">{comment.text}</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Comment actions (only for owner) */}
                        {user.id === comment.userId && !editingCommentId && (
                          <div className="flex space-x-1">
                            <button 
                              onClick={() => handleEdit(comment.id)}
                              className="p-1 text-gray-500 hover:text-secondary-600 hover:bg-secondary-50 rounded-full transition-colors"
                              title="Edit comment"
                            >
                              <SafeIcon icon={FiEdit} className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(comment.id)}
                              className="p-1 text-gray-500 hover:text-danger-600 hover:bg-danger-50 rounded-full transition-colors"
                              title="Delete comment"
                            >
                              <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={commentsEndRef} />
                </div>
              )}
            </div>
            
            {/* New Comment Form */}
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleSubmit} className="flex items-end space-x-2">
                <div className="flex-1">
                  <label htmlFor="comment-input" className="block text-sm font-medium text-gray-700 mb-1">
                    Add a comment
                  </label>
                  <textarea
                    id="comment-input"
                    ref={inputRef}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Type your comment here..."
                    rows={2}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-4 py-3 bg-secondary-600 hover:bg-secondary-700 text-white rounded-xl transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <SafeIcon icon={FiSend} className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ChoreCommentsModal;