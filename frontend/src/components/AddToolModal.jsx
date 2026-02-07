import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

/**
 * AddToolModal - Modal for creating new tools
 * Allows users with proper permissions to add tools to inventory
 */
export default function AddToolModal({ isOpen, onClose, onToolAdded }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    asset_type: 'equipment',
    description: '',
    serial_number: '',
    location: 'Warehouse'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('http://localhost:3000/api/tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        onToolAdded();
        setFormData({
          name: '',
          asset_type: 'equipment',
          description: '',
          serial_number: '',
          location: 'Warehouse'
        });
        onClose();
      } else {
        setError(data.error || 'Failed to create tool');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Plus className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold">Add New Tool</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded transition"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded text-red-300 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              Tool Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Cordless Drill"
              required
              disabled={loading}
              className="w-full bg-gray-700/50 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              Asset Type
            </label>
            <select
              name="asset_type"
              value={formData.asset_type}
              onChange={handleChange}
              disabled={loading}
              className="w-full bg-gray-700/50 border border-gray-600 rounded px-4 py-2 text-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
            >
              <option value="equipment">Equipment</option>
              <option value="tool">Hand Tool</option>
              <option value="power-tool">Power Tool</option>
              <option value="safety">Safety Gear</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional description"
              disabled={loading}
              rows="2"
              className="w-full bg-gray-700/50 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              Serial Number
            </label>
            <input
              type="text"
              name="serial_number"
              value={formData.serial_number}
              onChange={handleChange}
              placeholder="Optional"
              disabled={loading}
              className="w-full bg-gray-700/50 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Warehouse, Job Site"
              disabled={loading}
              className="w-full bg-gray-700/50 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-semibold transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold text-white transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Tool'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
