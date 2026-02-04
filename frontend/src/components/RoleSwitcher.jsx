import React, { useState } from 'react';
import { Shield } from 'lucide-react';

/**
 * RoleSwitcher - Demo component for testing role-based access
 * Allows users to change their role on the fly for testing purposes
 * Should be removed in production
 */
export default function RoleSwitcher({ currentRole, onRoleChange }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    { value: 'technician', label: 'Technician', color: 'gray' },
    { value: 'foreman', label: 'Foreman', color: 'yellow' },
    { value: 'superintendent', label: 'Superintendent', color: 'red' }
  ];

  const handleRoleChange = async (newRole) => {
    if (newRole === currentRole) return;
    
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('http://localhost:3000/api/auth/change-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await res.json();

      if (data.success) {
        // Update token if new one is provided
        if (data.access_token) {
          localStorage.setItem('access_token', data.access_token);
        }
        onRoleChange(data.user);
      } else {
        setError(data.error || 'Failed to change role');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-2xl max-w-xs">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-semibold">Role Switcher (Demo)</h3>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-500/20 border border-red-500/30 rounded text-red-300 text-xs">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {roles.map((role) => (
          <button
            key={role.value}
            onClick={() => handleRoleChange(role.value)}
            disabled={loading || role.value === currentRole}
            className={`w-full px-3 py-2 rounded text-sm font-medium transition ${
              role.value === currentRole
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 cursor-default'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600'
            } disabled:opacity-50`}
          >
            {role.label}
            {role.value === currentRole && ' (Current)'}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Switch roles to test permissions. Remove in production.
      </p>
    </div>
  );
}
