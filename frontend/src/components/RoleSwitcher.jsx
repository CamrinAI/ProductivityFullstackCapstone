import React, { useState } from 'react';
import { Shield, Minimize2, Maximize2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * RoleSwitcher - Demo component for testing role-based access
 * Allows users to change their role on the fly for testing purposes
 * Should be removed in production
 */
export default function RoleSwitcher({ currentRole, onRoleChange }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

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
      // Get token from AuthContext or localStorage as fallback
      const authToken = token || localStorage.getItem('access_token');
      
      if (!authToken) {
        setError('Not authenticated. Please log in again.');
        setLoading(false);
        return;
      }

      console.log('Attempting role change with token:', authToken ? 'Token present' : 'No token');

      const res = await fetch('http://localhost:3000/api/auth/change-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await res.json();
      console.log('Role change response:', res.status, data);

      if (res.ok && data.success) {
        // Update token with new one
        if (data.access_token) {
          localStorage.setItem('access_token', data.access_token);
        }
        // Reload page to refresh auth state
        setTimeout(() => window.location.reload(), 300);
      } else {
        setError(data.error || data.details || `Failed to change role (${res.status})`);
      }
    } catch (err) {
      console.error('Role change error:', err);
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // Minimized view
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-4 py-3 hover:bg-gray-700 rounded-lg transition"
        >
          <Shield className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold">Role Switcher</span>
          <Maximize2 className="w-3 h-3 text-gray-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-2xl max-w-xs z-50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold">Role Switcher (Demo)</h3>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="p-1 hover:bg-gray-700 rounded transition"
          title="Minimize"
        >
          <Minimize2 className="w-3 h-3 text-gray-400" />
        </button>
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
