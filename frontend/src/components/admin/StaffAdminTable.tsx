import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AdminService, type StaffUser } from '../../services/admin.service';
import './StaffAdminTable.css';

interface StaffAdminTableProps {
  staff: StaffUser[];
  onStaffUpdated: () => void;
}

export const StaffAdminTable = ({ staff, onStaffUpdated }: StaffAdminTableProps) => {
  const { token, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleToggleActive = async (id: string, name: string, currentActive: boolean) => {
    if (!token) {
      logout();
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to ${currentActive ? 'deactivate' : 'activate'} ${name}?\n\n${
        currentActive
          ? 'Deactivated users will not be able to log in.'
          : 'Activated users will be able to log in.'
      }`
    );

    if (!confirmed) return;

    setIsLoading(true);
    setError('');
    try {
      await AdminService.toggleStaffActive(token, id, !currentActive);
      onStaffUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle staff status');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="staff-admin-table">
      <h2>Staff Management</h2>

      {error && <div className="error-message">{error}</div>}

      <table className="staff-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {staff.length === 0 ? (
            <tr>
              <td colSpan={5} className="no-data">No staff found</td>
            </tr>
          ) : (
            staff.map((user) => (
              <tr key={user.id}>
                <td className="name-cell">{user.name}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="date-cell">{formatDate(user.createdAt)}</td>
                <td>
                  <button
                    onClick={() => handleToggleActive(user.id, user.name, user.isActive)}
                    disabled={isLoading}
                    className={`action-button ${user.isActive ? 'danger' : 'success'}`}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
