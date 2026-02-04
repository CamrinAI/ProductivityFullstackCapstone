import React, { useEffect, useState } from 'react';
import { Download, AlertTriangle, Save } from 'lucide-react';

/**
 * ToolCard Component
 * 
 * Displays a single tool with:
 * - Status indicator
 * - Location management
 * - Serial number assignment
 * - Checkout/Checkin toggle buttons
 * - Delete tool action
 */
export default function AssetCard({ asset, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [serial, setSerial] = useState(asset.serial_number || '');
  const [savingSerial, setSavingSerial] = useState(false);
  const [localAvailable, setLocalAvailable] = useState(asset.is_available);
  const [localStatus, setLocalStatus] = useState(asset.status);

  // Sync local state when asset prop changes
  useEffect(() => {
    setSerial(asset.serial_number || '');
    setLocalAvailable(asset.is_available);
    setLocalStatus(asset.status);
  }, [asset.serial_number, asset.is_available, asset.status]);

  // Toggle tool checkout status and log location
  const handleCheckout = async (prevAvailable, prevStatus) => {
    setLoading(true);
    try {
      await fetch(`http://localhost:3000/api/tools/${asset.id}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: 'Job Site' }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
      // Rollback optimistic UI update on error
      setLocalAvailable(prevAvailable);
      setLocalStatus(prevStatus);
    }
    setLoading(false);
  };

  // Toggle tool checkin status and update location
  const handleCheckin = async (prevAvailable, prevStatus) => {
    setLoading(true);
    try {
      await fetch(`http://localhost:3000/api/tools/${asset.id}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: 'Warehouse' }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
      setLocalAvailable(prevAvailable);
      setLocalStatus(prevStatus);
    }
    setLoading(false);
  };

  const handleSaveSerial = async () => {
    if (!serial.trim()) {
      alert('Enter a serial number');
      return;
    }
    setSavingSerial(true);
    try {
      await fetch(`http://localhost:3000/api/tools/${asset.id}/serial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serial_number: serial.trim() }),
      });
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Could not save serial number');
    }
    setSavingSerial(false);
  };

  const optimisticFlip = (nextAvailable, nextStatus) => {
    setLocalAvailable(nextAvailable);
    setLocalStatus(nextStatus);
  };

  const [locationInput, setLocationInput] = useState(asset.location || '');
  const updateLocation = async () => {
    try {
      await fetch(`http://localhost:3000/api/tools/${asset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: locationInput })
      });
      onRefresh();
    } catch (e) {
      console.error('Update location failed', e);
    }
  };
  const deleteTool = async () => {
    if (!confirm('Delete this tool?')) return;
    try {
      await fetch(`http://localhost:3000/api/tools/${asset.id}`, {
        method: 'DELETE'
      });
      onRefresh();
    } catch (e) {
      console.error('Delete tool failed', e);
    }
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
      <h3 className="font-bold text-lg mb-2">{asset.name}</h3>
      <p className="text-sm text-gray-400 mb-4">{localAvailable ? '✅ Available' : '🔴 Checked Out'}</p>
      <div className="flex items-center gap-2">
        <input
          value={locationInput}
          onChange={(e) => setLocationInput(e.target.value)}
          placeholder="Location"
          className="flex-1 bg-gray-900/60 border border-gray-700 rounded px-3 py-2 text-sm focus:border-blue-500"
        />
        <button
          onClick={updateLocation}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
        >
          Update
        </button>
        <button
          onClick={deleteTool}
          className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
        >
          Delete
        </button>
      </div>
      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2">
          <input
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            placeholder="Serial number"
            className="flex-1 bg-gray-900/60 border border-gray-700 rounded px-3 py-2 text-sm focus:border-blue-500"
          />
          <button
            onClick={handleSaveSerial}
            disabled={savingSerial}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <button
          onClick={async () => {
            const wasAvailable = localAvailable;
            const nextAvailable = !wasAvailable;
            optimisticFlip(nextAvailable, 'available');
            wasAvailable
              ? await handleCheckout(wasAvailable, localStatus)
              : await handleCheckin(wasAvailable, localStatus);
          }}
          disabled={loading}
          className={`w-full px-3 h-12 rounded font-semibold text-sm ${
            localAvailable ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
          } disabled:opacity-50`}
        >
          {localAvailable ? '📤 Check Out' : '📥 Check In'}
        </button>
        <button
          onClick={deleteTool}
          className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-semibold"
        >
          Delete Tool
        </button>
      </div>
    </div>
  );
}
