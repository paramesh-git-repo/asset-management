import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import RoleBasedRoute from './RoleBasedRoute';
import ConfirmationModal from './ConfirmationModal';
import Notification from './Notification';

const UserManagement = () => {
  const { user, getAuthHeaders } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState(null);
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

  // Load users
  useEffect(() => {
    loadUsers();
  }, []);

  // Helper function to show notifications
  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5002/api/auth/users', {
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
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5002/api/auth/register', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newUser)
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
        showNotification('User created successfully!', 'success');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to create user');
        showNotification(data.message || 'Failed to create user', 'error');
      }
    } catch (err) {
      setError('Error creating user');
      showNotification('Error creating user', 'error');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`http://localhost:5002/api/auth/users/${userId}/role`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        loadUsers();
        showNotification('User role updated successfully!', 'success');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update user role');
        showNotification(data.message || 'Failed to update user role', 'error');
      }
    } catch (err) {
      setError('Error updating user role');
      showNotification('Error updating user role', 'error');
    }
  };

  const handleDeactivateUser = (userId) => {
    const userToDeactivateData = users.find(u => u.id === userId);
    setUserToDeactivate(userId);
    setShowConfirmModal(true);
  };

  const confirmDeactivateUser = async () => {
    if (!userToDeactivate) return;
    
    try {
      const response = await fetch(`http://localhost:5002/api/auth/users/${userToDeactivate}/deactivate`, {
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
    } catch (err) {
      setError('Error deactivating user');
      showNotification('Error deactivating user', 'error');
    } finally {
      setUserToDeactivate(null);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800';
      case 'Manager': return 'bg-blue-100 text-blue-800';
      case 'Employee': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
            <p className="text-gray-600">Manage system users and their roles</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-plus mr-2"></i>Create User
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((userItem) => (
                <tr key={userItem.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                          {userItem.firstName?.[0]}{userItem.lastName?.[0]}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {userItem.firstName} {userItem.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{userItem.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={userItem.role}
                      onChange={(e) => handleRoleChange(userItem.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${getRoleBadgeColor(userItem.role)}`}
                    >
                      <option value="Employee">Employee</option>
                      <option value="Manager">Manager</option>
                      <option value="Admin">Admin</option>
                    </select>
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
                    <button
                      onClick={() => handleDeactivateUser(userItem.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={userItem.id === user.id}
                    >
                      <i className="fas fa-user-slash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create New User</h3>
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
                    Password
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
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
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
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
          }}
          onConfirm={confirmDeactivateUser}
          title="Deactivate User"
          message="Are you sure you want to deactivate this user? This action can be reversed later."
          confirmText="Deactivate"
          cancelText="Cancel"
          type="warning"
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
