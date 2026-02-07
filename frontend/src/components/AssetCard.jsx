import React, { useEffect, useState } from 'react';
import { Wrench } from 'lucide-react';

/**
 * ToolCard Component
 * 
 * Displays a single tool with:
 * - Status indicator
 * - Location management
 * - Serial number assignment
 * - Checkout/Checkin toggle buttons
 * - Status management (damaged/maintenance)
 */
export default function AssetCard({ asset, onRefresh, userId }) {
  const [loading, setLoading] = useState(false);
  const [serial, setSerial] = useState(asset.serial_number || '');
  const [savingSerial, setSavingSerial] = useState(false);
  const [localAvailable, setLocalAvailable] = useState(asset.is_available);
  const [localStatus, setLocalStatus] = useState(asset.status);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

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
        body: JSON.stringify({ location: 'Job Site', checked_out_by: userId }),
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

  const updateStatus = async (newStatus) => {
    try {
      await fetch(`http://localhost:3000/api/tools/${asset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      setLocalStatus(newStatus);
      setShowStatusMenu(false);
      onRefresh();
    } catch (e) {
      console.error('Update status failed', e);
    }
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col h-full">
      <h3 className="font-bold text-lg mb-2">{asset.name}</h3>
      <div className="flex items-center gap-2 mb-4">
        <p className="text-sm text-gray-400">
          {localAvailable ? '✅ Available' : '🔴 Checked Out'}
        </p>
        {localStatus === 'damaged' && (
          <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded">
            Damaged
          </span>
        )}
        {localStatus === 'maintenance' && (
          <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded">
            Maintenance
          </span>
        )}
      </div>
      
      {/* Location Input */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3">
        <input
          value={locationInput}
          onChange={(e) => setLocationInput(e.target.value)}
          placeholder="Location"
          className="flex-1 bg-gray-900/60 border border-gray-700 rounded px-3 py-2 text-sm focus:border-blue-500 min-w-0"
        />
        <button
          onClick={updateLocation}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm whitespace-nowrap"
        >
          Update
        </button>
      </div>

      {/* Serial Number Input */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
        <input
          value={serial}
          onChange={(e) => setSerial(e.target.value)}
          placeholder="Serial number"
          className="flex-1 bg-gray-900/60 border border-gray-700 rounded px-3 py-2 text-sm focus:border-blue-500 min-w-0"
        />
        <button
          onClick={handleSaveSerial}
          disabled={savingSerial}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold disabled:opacity-50 whitespace-nowrap"
        >
          Save
        </button>
      </div>

      {/* Action Buttons - Stack vertically */}
      <div className="mt-auto space-y-2">
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
          className={`w-full px-3 py-2 rounded font-semibold text-sm transition ${
            localAvailable 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-green-600 hover:bg-green-700'
          } disabled:opacity-50`}
        >
          {localAvailable ? '📤 Check Out' : '📥 Check In'}
        </button>

        {/* Status Button with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="w-full px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-sm font-semibold transition flex items-center justify-center gap-2"
          >
            <Wrench className="w-4 h-4" />
            Set Status
          </button>
          
          {showStatusMenu && (
            <div className="absolute bottom-full mb-2 left-0 right-0 bg-gray-900 border border-gray-700 rounded shadow-xl z-10">
              <button
                onClick={() => updateStatus('available')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-800 text-green-400"
              >
                ✅ Available
              </button>
              <button
                onClick={() => updateStatus('maintenance')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-800 text-yellow-400"
              >
                🔧 Maintenance
              </button>
              <button
                onClick={() => updateStatus('damaged')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-800 text-red-400"
              >
                ⚠️ Damaged
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
