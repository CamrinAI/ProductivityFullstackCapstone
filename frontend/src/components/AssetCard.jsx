import React, { useEffect, useState } from 'react';
import { Download, AlertTriangle, Save } from 'lucide-react';

export default function AssetCard({ asset, onRefresh, userId }) {
  const [loading, setLoading] = useState(false);
  const [serial, setSerial] = useState(asset.serial_number || '');
  const [savingSerial, setSavingSerial] = useState(false);
  const [localAvailable, setLocalAvailable] = useState(asset.is_available);
  const [localStatus, setLocalStatus] = useState(asset.status);

  useEffect(() => {
    setSerial(asset.serial_number || '');
    setLocalAvailable(asset.is_available);
    setLocalStatus(asset.status);
  }, [asset.serial_number, asset.is_available, asset.status]);

  const handleCheckout = async (prevAvailable, prevStatus) => {
    setLoading(true);
    try {
      await fetch(`http://localhost:3000/api/assets/${asset.id}/checkout?user_id=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-ID': userId },
        body: JSON.stringify({ location: 'Job Site' }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
      // rollback optimistic flip on failure
      setLocalAvailable(prevAvailable);
      setLocalStatus(prevStatus);
    }
    setLoading(false);
  };

  const handleCheckin = async (prevAvailable, prevStatus) => {
    setLoading(true);
    try {
      await fetch(`http://localhost:3000/api/assets/${asset.id}/checkin?user_id=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-ID': userId },
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

  const tierBadge = { sonic: '✅ SONIC', tails: '⚠️ TAILS', eggman: '🚨 EGGMAN' }[localStatus];
  const tierColor = { sonic: 'sonic-card', tails: 'tails-card', eggman: 'eggman-card' }[localStatus];

  const handleDownloadQR = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/assets/${asset.id}/qr?user_id=${userId}`);
      if (!res.ok) throw new Error('Failed to download QR');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `asset_${asset.id}_qr.png`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Could not download QR code');
    }
  };

  const handleSaveSerial = async () => {
    if (!serial.trim()) {
      alert('Enter a serial number');
      return;
    }
    setSavingSerial(true);
    try {
      await fetch(`http://localhost:3000/api/assets/${asset.id}/serial?user_id=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-ID': userId },
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

  return (
    <div className={tierColor}>
      <h3 className="font-bold text-lg mb-2">{asset.name}</h3>
      <p className="text-sm text-gray-400 mb-4">{tierBadge}</p>
      {asset.location && <p className="text-sm text-gray-400">📍 {asset.location}</p>}
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
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold disabled:opacity-50 flex items-center gap-1"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
        <button
          onClick={handleDownloadQR}
          className="w-full px-3 py-2 rounded font-semibold text-sm border border-gray-700 hover:border-blue-500 flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download QR
        </button>
      </div>
      <div className="mt-4 space-y-2">
        <button
          onClick={async () => {
            const wasAvailable = localAvailable;
            const nextAvailable = !wasAvailable;
            const nextStatus = nextAvailable ? 'sonic' : 'tails';
            optimisticFlip(nextAvailable, nextStatus);
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
      </div>
    </div>
  );
}
