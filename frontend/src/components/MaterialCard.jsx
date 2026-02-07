import React, { useState } from 'react';
import { Package, Plus, Minus } from 'lucide-react';

/**
 * MaterialCard Component
 * 
 * Displays a single material/consumable with:
 * - Quantity display
 * - Increment/Decrement buttons
 * - Low stock warning
 * - Unit type
 */
export default function MaterialCard({ material, onRefresh }) {
  const [loading, setLoading] = useState(false);

  const updateQuantity = async (newQuantity) => {
    if (newQuantity < 0) return;
    
    setLoading(true);
    try {
      await fetch(`http://localhost:3000/api/tools/materials/${material.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity })
      });
      onRefresh();
    } catch (e) {
      console.error('Update quantity failed', e);
    } finally {
      setLoading(false);
    }
  };

  const deleteMaterial = async () => {
    if (!confirm(`Delete ${material.name}?`)) return;
    try {
      await fetch(`http://localhost:3000/api/tools/materials/${material.id}`, {
        method: 'DELETE'
      });
      onRefresh();
    } catch (e) {
      console.error('Delete material failed', e);
    }
  };

  return (
    <div className={`rounded-lg p-4 border flex flex-col h-full ${
      material.needs_reorder 
        ? 'bg-red-500/10 border-red-500/30' 
        : 'bg-gray-800/50 border-gray-700'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-lg">{material.name}</h3>
        </div>
        {material.needs_reorder && (
          <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded">
            Low Stock
          </span>
        )}
      </div>

      <div className="mb-4">
        <div className="text-3xl font-bold text-center text-blue-400 mb-1">
          {material.quantity}
        </div>
        <p className="text-sm text-gray-400 text-center">{material.unit}</p>
        <p className="text-xs text-gray-500 text-center mt-1">
          Min: {material.min_stock}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="mt-auto space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => updateQuantity(material.quantity - 1)}
            disabled={loading || material.quantity <= 0}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded font-semibold text-sm transition"
          >
            <Minus className="w-4 h-4" />
            Remove
          </button>
          <button
            onClick={() => updateQuantity(material.quantity + 1)}
            disabled={loading}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded font-semibold text-sm transition"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* Quick increment buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => updateQuantity(material.quantity + 5)}
            disabled={loading}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-xs font-semibold transition"
          >
            +5
          </button>
          <button
            onClick={() => updateQuantity(material.quantity + 10)}
            disabled={loading}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-xs font-semibold transition"
          >
            +10
          </button>
          <button
            onClick={() => updateQuantity(material.quantity + 25)}
            disabled={loading}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-xs font-semibold transition"
          >
            +25
          </button>
        </div>

        <button
          onClick={deleteMaterial}
          className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs font-semibold transition"
        >
          Delete Material
        </button>
      </div>
    </div>
  );
}
