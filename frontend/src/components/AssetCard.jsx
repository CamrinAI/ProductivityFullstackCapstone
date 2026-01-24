import React, { useState } from 'react';
import { Download, AlertTriangle } from 'lucide-react';

export default function AssetCard({ asset, onRefresh, userId }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
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
    }
    setLoading(false);
  };

  const handleCheckin = async () => {
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
    }
    setLoading(false);
  };

  const tierBadge = { sonic: '✅ SONIC', tails: '⚠️ TAILS', eggman: '🚨 EGGMAN' }[asset.status];
  const tierColor = { sonic: 'sonic-card', tails: 'tails-card', eggman: 'eggman-card' }[asset.status];

  return (
    <div className={tierColor}>
      <h3 className="font-bold text-lg mb-2">{asset.name}</h3>
      <p className="text-sm text-gray-400 mb-4">{tierBadge}</p>
      {asset.location && <p className="text-sm text-gray-400">📍 {asset.location}</p>}
      <div className="mt-4 space-y-2">
        <button
          onClick={asset.is_available ? handleCheckout : handleCheckin}
          disabled={loading}
          className={`w-full px-3 py-2 rounded font-semibold text-sm ${
            asset.is_available ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
          } disabled:opacity-50`}
        >
          {asset.is_available ? '📤 Check Out' : '📥 Check In'}
        </button>
      </div>
    </div>
  );
}
