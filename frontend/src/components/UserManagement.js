import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import RoleBasedRoute from './RoleBasedRoute';
import ConfirmationModal from './ConfirmationModal';
import Notification from './Notification';
import config from '../config/config';

const UserManagement = () => {
  const { user, getAuthHeaders } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDeactivate, setUserToDeactivate] = useState(null);
  const [confirmAction, setConfirmAction] = useState('deactivate'); // 'deactivate' or 'delete'
  const [updatingRole, setUpdatingRole] = useState(null); // Track which user's role is being updated
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  
  
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'Employee',
    department: '',
    position: ''
  });

  // Helper function to show notifications
  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
  };

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.API_BASE_URL}/auth/users`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data.users);
        setError(''); // Clear any previous errors
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to load users');
        showNotification(errorData.message || 'Failed to load users', 'error');
      }
    } catch (err) {
      setError('Error loading users');
      showNotification('Error loading users', 'error');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Load users
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Simple display of all users
  const currentUsers = users;

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const isEdit = !!newUser.id;
      const url = isEdit 
        ? `${config.API_BASE_URL}/auth/users/${newUser.id}`
        : `${config.API_BASE_URL}/auth/register`;
      
      const method = isEdit ? 'PUT' : 'POST';
      
      // For edit, don't send password if it's empty
      const userData = isEdit && !newUser.password 
        ? { ...newUser, password: undefined }
        : newUser;

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        setShowCreateModal(false);
        setNewUser({
          username: '',
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          role: 'Employee',
          department: '',
          position: ''
        });
        loadUsers();
        showNotification(isEdit ? 'User updated successfully!' : 'User created successfully!', 'success');
      } else {
        const data = await response.json();
        const action = isEdit ? 'update' : 'create';
        setError(data.message || `Failed to ${action} user`);
        showNotification(data.message || `Failed to ${action} user`, 'error');
      }
    } catch (err) {
      const action = newUser.id ? 'updating' : 'creating';
      setError(`Error ${action} user`);
      showNotification(`Error ${action} user`, 'error');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingRole(userId);
    try {
      // Find the user to get their name for the notification
      const userToUpdate = users.find(u => u.id === userId);
      const userName = userToUpdate ? `${userToUpdate.firstName} ${userToUpdate.lastName}` : 'User';
      
      const response = await fetch(`${config.API_BASE_URL}/auth/users/${userId}/role`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        loadUsers();
        showNotification(`✅ ${userName}'s role updated to ${newRole}`, 'success');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update user role');
        showNotification(`❌ Failed to update ${userName}'s role: ${data.message || 'Unknown error'}`, 'error');
      }
    } catch (err) {
      setError('Error updating user role');
      showNotification('❌ Error updating user role. Please try again.', 'error');
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleDeactivateUser = (userId) => {
    setUserToDeactivate(userId);
    setConfirmAction('deactivate');
    setShowConfirmModal(true);
  };

  const confirmDeactivateUser = async () => {
    if (!userToDeactivate) return;
    
    try {
      if (confirmAction === 'delete') {
        // Delete user permanently
        const response = await fetch(`${config.API_BASE_URL}/auth/users/${userToDeactivate}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        if (response.ok) {
          loadUsers();
          showNotification('User deleted successfully', 'success');
        } else {
          const data = await response.json();
          setError(data.message || 'Failed to delete user');
          showNotification(data.message || 'Failed to delete user', 'error');
        }
      } else {
        // Deactivate user
        const response = await fetch(`${config.API_BASE_URL}/auth/users/${userToDeactivate}/deactivate`, {
          method: 'PUT',
          headers: getAuthHeaders()
        });

        if (response.ok) {
          loadUsers();
          showNotification('User deactivated successfully!', 'success');
        } else {
          const data = await response.json();
          setError(data.message || 'Failed to deactivate user');
          showNotification(data.message || 'Failed to deactivate user', 'error');
        }
      }
    } catch (err) {
      const action = confirmAction === 'delete' ? 'deleting' : 'deactivating';
      setError(`Error ${action} user`);
      showNotification(`Error ${action} user`, 'error');
    } finally {
      setUserToDeactivate(null);
      setConfirmAction('deactivate');
    }
  };

  // Enhanced action handlers
  const handleViewUser = (userItem) => {
    setSelectedUser(userItem);
    setShowViewModal(true);
  };

  const handleEditUser = (userItem) => {
    // Set the user to edit and show edit modal
    setNewUser({
      id: userItem.id,
      username: userItem.username,
      email: userItem.email,
      password: '', // Don't pre-fill password
      firstName: userItem.firstName,
      lastName: userItem.lastName,
      role: userItem.role,
      department: userItem.department || '',
      position: userItem.position || ''
    });
    setShowCreateModal(true);
    showNotification(`Editing user: ${userItem.firstName} ${userItem.lastName}`, 'info');
  };

  const handleResetPassword = async (userItem) => {
    try {
      const newPassword = prompt(`Enter new password for ${userItem.firstName} ${userItem.lastName}:`);
      if (!newPassword) return;
      
      if (newPassword.length < 8) {
        showNotification('Password must be at least 8 characters long', 'error');
        return;
      }

      const response = await fetch(`${config.API_BASE_URL}/auth/reset-password/${userItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ newPassword })
      });

      if (response.ok) {
        showNotification(`Password reset successfully for ${userItem.firstName} ${userItem.lastName}`, 'success');
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || 'Failed to reset password', 'error');
      }
    } catch (err) {
      showNotification('Error resetting password', 'error');
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/auth/users/${userId}/activate`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        await loadUsers(); // Reload users
        showNotification('User activated successfully', 'success');
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || 'Failed to activate user', 'error');
      }
    } catch (err) {
      showNotification('Error activating user', 'error');
    }
  };

  const handleDeleteUser = (userItem) => {
    setUserToDeactivate(userItem.id);
    setConfirmAction('delete');
    setShowConfirmModal(true);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin': 
        return 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg hover:shadow-xl';
      case 'Manager': 
        return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:shadow-xl';
      case 'Employee': 
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl';
      default: 
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg hover:shadow-xl';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading users...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we fetch user data</p>
        </div>
      </div>
    );
  }

  return (
    <RoleBasedRoute requiredRole="Admin" fallback={
      <div className="text-center py-12">
        <i className="fas fa-lock text-6xl text-gray-400 mb-4"></i>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">You need Admin privileges to access user management.</p>
      </div>
    }>
      <div className="space-y-6">
        {/* Header with Create User Button */}
        <div className="flex items-center justify-between">
            <div>
            <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
            <p className="text-gray-600 mt-1">Manage system users, roles, and permissions</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
            >
            <i className="fas fa-plus mr-2"></i>
            Create User
            </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Enhanced Users Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-user text-gray-400"></i>
                      User
                    </div>
                </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-user-tag text-gray-400"></i>
                  Role
                    </div>
                </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-building text-gray-400"></i>
                  Department
                    </div>
                </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-toggle-on text-gray-400"></i>
                  Status
                    </div>
                </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-cog text-gray-400"></i>
                  Actions
                    </div>
                </th>
              </tr>
            </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.length === 0 ? (
                <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                        <div className="p-4 bg-gray-100 rounded-full mb-4">
                          <i className="fas fa-users text-4xl text-gray-400"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No users found</h3>
                        <p className="text-gray-500 mb-4">Create your first user to get started</p>
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
                        >
                          <i className="fas fa-plus mr-2"></i>
                          Create First User
                        </button>
                    </div>
                  </td>
                </tr>
              ) : (
                  currentUsers.map((userItem) => (
                <tr key={userItem.id} className="hover:bg-blue-50 transition-all duration-200 border-b border-gray-100">
                  <td className="px-6 py-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                          {userItem.firstName?.[0]}{userItem.lastName?.[0]}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-base font-semibold text-gray-900">
                          {userItem.firstName} {userItem.lastName}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <i className="fas fa-envelope text-gray-400"></i>
                          {userItem.email}
                        </div>
                        {userItem.position && (
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <i className="fas fa-briefcase text-gray-400"></i>
                            {userItem.position}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="relative">
                      <select
                        value={userItem.role}
                        onChange={(e) => handleRoleChange(userItem.id, e.target.value)}
                        className={`appearance-none px-4 py-2 pr-10 rounded-xl text-sm font-semibold border-0 cursor-pointer transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 ${getRoleBadgeColor(userItem.role)} ${updatingRole === userItem.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={userItem.id === user.id || updatingRole === userItem.id}
                      >
                        <option value="Employee">👤 Employee</option>
                        <option value="Manager">👔 Manager</option>
                        <option value="Admin">👑 Admin</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        {updatingRole === userItem.id ? (
                          <i className="fas fa-spinner fa-spin text-sm opacity-70"></i>
                        ) : (
                          <i className="fas fa-chevron-down text-sm opacity-70"></i>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-building text-gray-400"></i>
                      <span className="text-sm font-medium text-gray-700">
                        {userItem.department || (
                          <span className="text-gray-400 italic">Not assigned</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${userItem.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        userItem.isActive 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {userItem.isActive ? '🟢 Active' : '🔴 Inactive'}
                    </span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-1">
                      {/* View User */}
                      <button
                        onClick={() => handleViewUser(userItem)}
                        className="p-2.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-xl transition-all duration-200 group"
                        title="View User Details"
                      >
                        <i className="fas fa-eye group-hover:scale-110 transition-transform duration-200"></i>
                      </button>
                      
                      {/* Edit User */}
                      <button
                        onClick={() => handleEditUser(userItem)}
                        className="p-2.5 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-xl transition-all duration-200 group"
                        title="Edit User"
                      >
                        <i className="fas fa-edit group-hover:scale-110 transition-transform duration-200"></i>
                      </button>
                      
                      {/* Reset Password */}
                      <button
                        onClick={() => handleResetPassword(userItem)}
                        className="p-2.5 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 rounded-xl transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Reset Password"
                        disabled={userItem.id === user.id}
                      >
                        <i className="fas fa-key group-hover:scale-110 transition-transform duration-200"></i>
                      </button>
                      
                      {/* Toggle Status */}
                      <button
                        onClick={() => userItem.isActive ? handleDeactivateUser(userItem.id) : handleActivateUser(userItem.id)}
                        className={`p-2.5 rounded-xl transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed ${
                          userItem.isActive 
                            ? 'text-red-600 hover:text-red-800 hover:bg-red-100' 
                            : 'text-green-600 hover:text-green-800 hover:bg-green-100'
                        }`}
                        title={userItem.isActive ? 'Deactivate User' : 'Activate User'}
                        disabled={userItem.id === user.id}
                      >
                        <i className={`fas ${userItem.isActive ? 'fa-user-slash' : 'fa-user-check'} group-hover:scale-110 transition-transform duration-200`}></i>
                      </button>
                      
                      {/* Delete User */}
                      <button
                        onClick={() => handleDeleteUser(userItem)}
                        className="p-2.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-xl transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete User"
                        disabled={userItem.id === user.id}
                      >
                        <i className="fas fa-trash group-hover:scale-110 transition-transform duration-200"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

        {/* Enhanced View User Modal */}
        {showViewModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white font-bold text-2xl">
                      {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{selectedUser.firstName} {selectedUser.lastName}</h3>
                      <p className="text-blue-100">{selectedUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-white hover:text-gray-200 transition-colors duration-200"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">Username</label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <i className="fas fa-user text-gray-400"></i>
                        <span className="text-gray-800">{selectedUser.username}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">Role</label>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${getRoleBadgeColor(selectedUser.role)}`}>
                          {selectedUser.role === 'Admin' && '👑 Admin'}
                          {selectedUser.role === 'Manager' && '👔 Manager'}
                          {selectedUser.role === 'Employee' && '👤 Employee'}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">Status</label>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${selectedUser.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          selectedUser.isActive 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {selectedUser.isActive ? '🟢 Active' : '🔴 Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">Department</label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <i className="fas fa-building text-gray-400"></i>
                        <span className="text-gray-800">{selectedUser.department || 'Not assigned'}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">Position</label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <i className="fas fa-briefcase text-gray-400"></i>
                        <span className="text-gray-800">{selectedUser.position || 'Not specified'}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">Permissions</label>
                      <div className="space-y-2">
                        {selectedUser.permissions && selectedUser.permissions.length > 0 ? (
                          selectedUser.permissions.map((permission, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <i className="fas fa-check-circle text-green-500 text-sm"></i>
                              <span className="text-sm text-gray-700 capitalize">{permission.replace(/_/g, ' ')}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-500 italic text-sm">No specific permissions</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleEditUser(selectedUser);
                    }}
                    className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors duration-200 font-medium"
                  >
                    <i className="fas fa-edit mr-2"></i>
                    Edit User
                  </button>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors duration-200 font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Create/Edit User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="bg-gray-50 text-gray-900 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                      <i className={`fas ${newUser.id ? 'fa-user-edit' : 'fa-user-plus'} text-xl`}></i>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">
                {newUser.id ? 'Edit User' : 'Create New User'}
              </h3>
                      <p className="text-gray-600">
                        {newUser.id ? 'Update user information' : 'Add a new user to the system'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleCreateUser} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 mt-4">
                        <i className="fas fa-user mr-2 text-gray-400"></i>
                    Username
                  </label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter username"
                    required
                  />
                </div>
                    
                <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 mt-4">
                        <i className="fas fa-envelope mr-2 text-gray-400"></i>
                    Email
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter email address"
                    required
                  />
                </div>
                  </div>
                  
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 mt-4">
                      <i className="fas fa-lock mr-2 text-gray-400"></i>
                      Password {newUser.id && <span className="text-gray-500 text-sm">(leave blank to keep current)</span>}
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required={!newUser.id}
                      placeholder={newUser.id ? "Leave blank to keep current password" : "Enter password (min 8 characters)"}
                  />
                </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 mt-4">
                        <i className="fas fa-user mr-2 text-gray-400"></i>
                      First Name
                    </label>
                    <input
                      type="text"
                      value={newUser.firstName}
                      onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter first name"
                      required
                    />
                  </div>
                    
                  <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 mt-4">
                        <i className="fas fa-user mr-2 text-gray-400"></i>
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={newUser.lastName}
                      onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 mt-4">
                        <i className="fas fa-building mr-2 text-gray-400"></i>
                        Department
                      </label>
                      <input
                        type="text"
                        value={newUser.department}
                        onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter department"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 mt-4">
                        <i className="fas fa-briefcase mr-2 text-gray-400"></i>
                        Position
                      </label>
                      <input
                        type="text"
                        value={newUser.position}
                        onChange={(e) => setNewUser({...newUser, position: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter job position"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 mt-4">
                      <i className="fas fa-user-tag mr-2 text-gray-400"></i>
                    Role
                  </label>
                  <div className="relative">
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                        className="w-full appearance-none px-4 py-4 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white hover:border-gray-300 shadow-sm hover:shadow-md"
                    >
                      <option value="Employee">👤 Employee - Basic access to view and manage assigned assets</option>
                      <option value="Manager">👔 Manager - Enhanced access to manage team and department assets</option>
                      <option value="Admin">👑 Admin - Full system access and user management</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-chevron-down text-gray-500 text-sm"></i>
                      </div>
                    </div>
                  </div>
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
                        <div className="text-sm text-blue-700">
                    {newUser.role === 'Employee' && 'Can view and manage assigned assets only'}
                    {newUser.role === 'Manager' && 'Can manage team assets and view department reports'}
                    {newUser.role === 'Admin' && 'Full system access including user management and all assets'}
                  </div>
                </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                      className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                      className="px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                  >
                      <i className={`fas ${newUser.id ? 'fa-save' : 'fa-user-plus'} mr-2`}></i>
                      {newUser.id ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </form>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          show={showConfirmModal}
          onHide={() => {
            setShowConfirmModal(false);
            setUserToDeactivate(null);
            setConfirmAction('deactivate');
          }}
          onConfirm={confirmDeactivateUser}
          title={confirmAction === 'delete' ? 'Delete User' : 'Deactivate User'}
          message={confirmAction === 'delete' 
            ? 'Are you sure you want to permanently delete this user? This action cannot be undone and all user data will be lost.'
            : 'Are you sure you want to deactivate this user? This action can be reversed later.'
          }
          confirmText={confirmAction === 'delete' ? 'Delete' : 'Deactivate'}
          cancelText="Cancel"
          type={confirmAction === 'delete' ? 'danger' : 'warning'}
        />

        {/* Notification */}
        <Notification
          show={notification.show}
          onHide={() => setNotification({ show: false, message: '', type: 'info' })}
          message={notification.message}
          type={notification.type}
        />
      </div>
    </RoleBasedRoute>
  );
};

export default UserManagement;
