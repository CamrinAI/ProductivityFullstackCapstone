import React, { useState, useEffect } from 'react';
import { Package, Plus, Mic, QrCode, AlertCircle, Zap } from 'lucide-react';
import AssetCard from './components/AssetCard';
import VoiceRecorder from './components/VoiceRecorder';

/**
 * Trade-Tracker AI - Main Application Component
 * 
 * Displays asset and material inventory with Sonic-tier status system:
 * - SONIC (Blue): Asset in good condition, recently checked in
 * - TAILS (Yellow): Maintenance needed, moderate checkout duration
 * - EGGMAN (Red): Danger, over 30 days checked out or marked unavailable
 * 
 * Features:
 * - Real-time asset inventory with pagination
 * - Voice-to-inventory updates via OpenAI
 * - Asset checkout/checkin tracking
 * - QR code generation for physical labeling
 * - Material consumables management
 */
function App() {
  const [assets, setAssets] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [activeTab, setActiveTab] = useState('assets');
  const [dataLoaded, setDataLoaded] = useState(false);

  // Fetch all assets from backend
  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/assets`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) setAssets(data.assets || data.items || []);
    } catch (e) {
      console.error('Failed to fetch assets:', e);
    }
    setLoading(false);
  };

  // Fetch all materials from backend
  const fetchMaterials = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/assets/materials`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) setMaterials(data.materials);
    } catch (e) {
      console.error('Failed to fetch materials:', e);
    }
  };

  // Initialize: load assets and materials on mount
  useEffect(() => {
    if (!dataLoaded) {
      fetchAssets();
      fetchMaterials();
      setDataLoaded(true);
    }
  }, [dataLoaded]);

  // Pagination state and handler
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  const fetchAssetsPaged = async (nextPage = page) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/assets?page=${nextPage}&per_page=${perPage}`);
      const data = await res.json();
      if (data.success) {
        setAssets(data.assets || []);
      }
    } catch (e) {
      console.error('Failed to fetch assets (paged):', e);
    }
    setLoading(false);
  };

  // Re-fetch when page changes
  useEffect(() => {
    if (dataLoaded) {
      fetchAssetsPaged(page);
    }
  }, [page, perPage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Navigation Header */}
      <header className="bg-black/50 border-b border-blue-500/20 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Trade-Tracker AI
                </h1>
                <p className="text-sm text-gray-400">Asset Management System 📦</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Voice Update Button: Opens audio recorder modal */}
              <button
                onClick={() => setShowVoice(true)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-5 h-12 rounded-lg text-sm font-semibold"
              >
                <Mic className="w-4 h-4" />
                Voice Update
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sonic Tier Status Dashboard */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Status Summary Cards: Categorize assets by health tier */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="sonic-card">
            <Zap className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">{assets.filter(a => a.status === 'sonic').length}</div>
            <p className="text-sm opacity-90">SONIC • Good</p>
          </div>
          <div className="tails-card">
            <AlertCircle className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">{assets.filter(a => a.status === 'tails').length}</div>
            <p className="text-sm opacity-90">TAILS • Maintenance</p>
          </div>
          <div className="eggman-card">
            <AlertCircle className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">{assets.filter(a => a.status === 'eggman').length}</div>
            <p className="text-sm opacity-90">EGGMAN • Danger</p>
          </div>
        </div>

        {/* Tab Navigation: Switch between Assets and Materials views */}
        <div className="flex gap-4 mb-8 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('assets')}
            className={`pb-4 font-semibold border-b-2 transition ${
              activeTab === 'assets' ? 'border-blue-400 text-blue-400' : 'border-transparent text-gray-400'
            }`}
          >
            Assets ({assets.length})
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`pb-4 font-semibold border-b-2 transition ${
              activeTab === 'materials' ? 'border-blue-400 text-blue-400' : 'border-transparent text-gray-400'
            }`}
          >
            Materials ({materials.length})
          </button>
        </div>

        {/* Assets Tab: Display asset cards with checkout/QR controls */}
        {activeTab === 'assets' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              <p className="col-span-full text-gray-400">Loading...</p>
            ) : assets.length === 0 ? (
              <p className="col-span-full text-gray-400">No assets. Create one to start.</p>
            ) : (
              assets.map(asset => (
                <AssetCard key={asset.id} asset={asset} onRefresh={fetchAssets} />
              ))
            )}
            {/* Pagination Controls: Navigate through paginated assets */}
            <div className="col-span-full flex items-center justify-end gap-2 mt-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage(Math.max(1, page - 1))}
                className="px-3 py-2 border border-gray-700 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                className="px-3 py-2 border border-gray-700 rounded"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Materials Tab: Display consumable inventory with quantity adjustments */}
        {activeTab === 'materials' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {materials.length === 0 ? (
              <p className="text-gray-400">No materials</p>
            ) : (
              materials.map(m => (
                <div key={m.id} className={`p-4 rounded-lg border ${m.needs_reorder ? 'bg-red-500/10 border-red-500/30' : 'bg-gray-800/50 border-gray-700'}`}>
                  <h4 className="font-semibold">{m.name}</h4>
                  <p className="text-sm text-gray-400">Qty: {m.quantity} {m.unit}</p>                  {/* Quick quantity adjustment buttons for materials */}
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={async () => {
                        try {
                          await fetch(`http://localhost:3000/api/assets/materials/${m.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ quantity: Math.max(0, (m.quantity || 0) + 1) })
                          });
                          fetchMaterials();
                        } catch (e) {
                          console.error('Increase qty failed', e);
                        }
                      }}
                      className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
                    >+1</button>
                    <button
                      onClick={async () => {
                        try {
                          await fetch(`http://localhost:3000/api/assets/materials/${m.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ quantity: Math.max(0, (m.quantity || 0) - 1) })
                          });
                          fetchMaterials();
                        } catch (e) {
                          console.error('Decrease qty failed', e);
                        }
                      }}
                      className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-xs"
                    >-1</button>
                    <button
                      onClick={async () => {
                        if (!confirm('Delete this material?')) return;
                        try {
                          await fetch(`http://localhost:3000/api/assets/materials/${m.id}`, {
                            method: 'DELETE'
                          });
                          fetchMaterials();
                        } catch (e) {
                          console.error('Delete material failed', e);
                        }
                      }}
                      className="ml-auto px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                    >Delete</button>
                  </div>                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Voice Recorder Modal: Triggered by Voice Update button */}
      {showVoice && <VoiceRecorder onClose={() => { setShowVoice(false); fetchAssets(); }} />}

      {/* Floating Action Button: QR Code Scanner (placeholder) */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => alert('QR scanning coming soon — connect to html5-qrcode here')}
          className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 shadow-xl flex items-center justify-center text-white border border-blue-400/40"
        >
          <QrCode className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
}

export default App;
