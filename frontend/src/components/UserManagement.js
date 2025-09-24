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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
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

  // New enhanced action handlers
  const handleViewUser = (userItem) => {
    // Show user details in a modal or navigate to user profile
    showNotification(`Viewing details for ${userItem.firstName} ${userItem.lastName}`, 'info');
    // TODO: Implement view user modal
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
        {/* Header */}
        <div className="bg-primary rounded-xl shadow-theme-md p-6 border border-theme">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-primary">User Management</h2>
              <p className="text-secondary mt-2">Manage system users, roles, and permissions</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 rounded-xl font-medium transition-all duration-300 border-none bg-accent-primary text-white shadow-theme-md hover-accent hover:transform hover:-translate-y-1 hover:shadow-theme-lg group"
            >
              <i className="fas fa-plus mr-2 group-hover:animate-bounce"></i>Create User
            </button>
          </div>

        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Users Table */}
        <div className="bg-primary rounded-xl shadow-theme-md overflow-hidden border border-theme">
          <table className="min-w-full divide-y divide-theme">
            <thead className="bg-tertiary">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-primary divide-y divide-theme">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <i className="fas fa-users text-4xl text-secondary mb-4"></i>
                      <h3 className="text-lg font-medium text-primary mb-2">No users found</h3>
                      <p className="text-secondary">
                        No users have been created yet
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((userItem) => (
                <tr key={userItem.id} className="hover:bg-tertiary transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-accent-primary flex items-center justify-center text-white font-medium">
                          {userItem.firstName?.[0]}{userItem.lastName?.[0]}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-primary">
                          {userItem.firstName} {userItem.lastName}
                        </div>
                        <div className="text-sm text-secondary">{userItem.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative">
                      <select
                        value={userItem.role}
                        onChange={(e) => handleRoleChange(userItem.id, e.target.value)}
                        className={`appearance-none px-3 py-2 pr-8 rounded-lg text-sm font-medium border-0 cursor-pointer transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-50 ${getRoleBadgeColor(userItem.role)} ${updatingRole === userItem.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={userItem.id === user.id || updatingRole === userItem.id}
                      >
                        <option value="Employee">👤 Employee</option>
                        <option value="Manager">👔 Manager</option>
                        <option value="Admin">👑 Admin</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        {updatingRole === userItem.id ? (
                          <i className="fas fa-spinner fa-spin text-xs opacity-70"></i>
                        ) : (
                          <i className="fas fa-chevron-down text-xs opacity-70"></i>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {userItem.department || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      userItem.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {userItem.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {/* View User */}
                      <button
                        onClick={() => handleViewUser(userItem)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        title="View User Details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      
                      {/* Edit User */}
                      <button
                        onClick={() => handleEditUser(userItem)}
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
                        title="Edit User"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      
                      {/* Reset Password */}
                      <button
                        onClick={() => handleResetPassword(userItem)}
                        className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-all duration-200"
                        title="Reset Password"
                        disabled={userItem.id === user.id}
                      >
                        <i className="fas fa-key"></i>
                      </button>
                      
                      {/* Toggle Status */}
                      <button
                        onClick={() => userItem.isActive ? handleDeactivateUser(userItem.id) : handleActivateUser(userItem.id)}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          userItem.isActive 
                            ? 'text-red-600 hover:text-red-800 hover:bg-red-50' 
                            : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                        }`}
                        title={userItem.isActive ? 'Deactivate User' : 'Activate User'}
                        disabled={userItem.id === user.id}
                      >
                        <i className={`fas ${userItem.isActive ? 'fa-user-slash' : 'fa-user-check'}`}></i>
                      </button>
                      
                      {/* Delete User */}
                      <button
                        onClick={() => handleDeleteUser(userItem)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Delete User"
                        disabled={userItem.id === user.id}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {newUser.id ? 'Edit User' : 'Create New User'}
              </h3>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password {newUser.id && <span className="text-gray-500">(leave blank to keep current)</span>}
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={!newUser.id}
                    placeholder={newUser.id ? "Leave blank to keep current password" : "Enter password"}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={newUser.firstName}
                      onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={newUser.lastName}
                      onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <div className="relative">
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                      className="w-full appearance-none px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    >
                      <option value="Employee">👤 Employee - Basic access to view and manage assigned assets</option>
                      <option value="Manager">👔 Manager - Enhanced access to manage team and department assets</option>
                      <option value="Admin">👑 Admin - Full system access and user management</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <i className="fas fa-chevron-down text-gray-400"></i>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {newUser.role === 'Employee' && 'Can view and manage assigned assets only'}
                    {newUser.role === 'Manager' && 'Can manage team assets and view department reports'}
                    {newUser.role === 'Admin' && 'Full system access including user management and all assets'}
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create User
                  </button>
                </div>
              </form>
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
