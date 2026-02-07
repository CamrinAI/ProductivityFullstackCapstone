import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

/**
 * AddMaterialModal - Modal for creating new materials
 */
export default function AddMaterialModal({ isOpen, onClose, onMaterialAdded }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    unit: 'box',
    quantity: 0,
    min_stock: 5
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' || name === 'min_stock' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/tools/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        onMaterialAdded();
        setFormData({ name: '', unit: 'box', quantity: 0, min_stock: 5 });
        onClose();
      } else {
        setError(data.error || 'Failed to create material');
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
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Plus className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold">Add New Material</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded text-red-300 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">Material Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Bolts"
              required
              disabled={loading}
              className="w-full bg-gray-700/50 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">Unit</label>
            <input
              type="text"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              placeholder="e.g., box, pack"
              disabled={loading}
              className="w-full bg-gray-700/50 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                disabled={loading}
                className="w-full bg-gray-700/50 border border-gray-600 rounded px-4 py-2 text-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">Min Stock</label>
              <input
                type="number"
                name="min_stock"
                value={formData.min_stock}
                onChange={handleChange}
                disabled={loading}
                className="w-full bg-gray-700/50 border border-gray-600 rounded px-4 py-2 text-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

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
              {loading ? 'Creating...' : 'Create Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
