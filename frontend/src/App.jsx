import React, { useState, useEffect } from 'react';
import { Package, Plus, Mic, QrCode, AlertCircle, Zap } from 'lucide-react';
import AssetCard from './components/AssetCard';
import VoiceRecorder from './components/VoiceRecorder';

export default function App() {
  const [assets, setAssets] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [activeTab, setActiveTab] = useState('assets');
  const userId = "1";

  useEffect(() => {
    fetchAssets();
    fetchMaterials();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/assets?user_id=${userId}`);
      const data = await res.json();
      if (data.success) setAssets(data.assets);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const fetchMaterials = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/assets/materials?user_id=${userId}`);
      const data = await res.json();
      if (data.success) setMaterials(data.materials);
    } catch (e) {
      console.error(e);
    }
  };

  const counts = {
    sonic: assets.filter(a => a.status === 'sonic').length,
    tails: assets.filter(a => a.status === 'tails').length,
    eggman: assets.filter(a => a.status === 'eggman').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Header */}
      <header className="bg-black/50 border-b border-blue-500/20 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Trade-Tracker AI
              </h1>
            </div>
            <button
              onClick={() => setShowVoice(true)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg"
            >
              <Mic className="w-4 h-4" />
              Voice Update
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="sonic-card">
            <Zap className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">{counts.sonic}</div>
            <p className="text-sm opacity-90">SONIC • Good</p>
          </div>
          <div className="tails-card">
            <AlertCircle className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">{counts.tails}</div>
            <p className="text-sm opacity-90">TAILS • Maintenance</p>
          </div>
          <div className="eggman-card">
            <AlertCircle className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">{counts.eggman}</div>
            <p className="text-sm opacity-90">EGGMAN • Danger</p>
          </div>
        </div>

        {/* Tabs */}
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

        {/* Assets */}
        {activeTab === 'assets' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              <p className="col-span-full text-gray-400">Loading...</p>
            ) : assets.length === 0 ? (
              <p className="col-span-full text-gray-400">No assets. Create one to start.</p>
            ) : (
              assets.map(asset => (
                <AssetCard key={asset.id} asset={asset} onRefresh={fetchAssets} userId={userId} />
              ))
            )}
          </div>
        )}

        {/* Materials */}
        {activeTab === 'materials' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {materials.length === 0 ? (
              <p className="text-gray-400">No materials</p>
            ) : (
              materials.map(m => (
                <div key={m.id} className={`p-4 rounded-lg border ${m.needs_reorder ? 'bg-red-500/10 border-red-500/30' : 'bg-gray-800/50 border-gray-700'}`}>
                  <h4 className="font-semibold">{m.name}</h4>
                  <p className="text-sm text-gray-400">Qty: {m.quantity} {m.unit}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Voice Modal */}
      {showVoice && <VoiceRecorder onClose={() => { setShowVoice(false); fetchAssets(); }} userId={userId} />}
    </div>
  );
}
