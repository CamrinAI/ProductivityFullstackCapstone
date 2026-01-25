import React, { useState, useEffect } from 'react';
import { Package, Plus, Mic, QrCode, AlertCircle, Zap, LogOut } from 'lucide-react';
import AssetCard from './components/AssetCard';
import VoiceRecorder from './components/VoiceRecorder';
import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { user, token, logout, loading: authLoading } = useAuth();
  const [assets, setAssets] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [activeTab, setActiveTab] = useState('assets');
  const [dataLoaded, setDataLoaded] = useState(false);

  // Fetch assets
  const fetchAssets = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/assets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) setAssets(data.assets || data.items || []);
    } catch (e) {
      console.error('Failed to fetch assets:', e);
    }
    setLoading(false);
  };

  // Fetch materials
  const fetchMaterials = async () => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:3000/api/assets/materials`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) setMaterials(data.materials);
    } catch (e) {
      console.error('Failed to fetch materials:', e);
    }
  };

  // Load data once when user is authenticated
  useEffect(() => {
    if (token && user && !dataLoaded) {
      fetchAssets();
      fetchMaterials();
      setDataLoaded(true);
    }
  }, [token, user, dataLoaded]);

  // If still loading auth, show loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login page
  if (!user || !token) {
    return <LoginPage />;
  }

  const counts = {
    sonic: assets.filter(a => a.status === 'sonic').length,
    tails: assets.filter(a => a.status === 'tails').length,
    eggman: assets.filter(a => a.status === 'eggman').length,
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Header */}
      <header className="bg-black/50 border-b border-blue-500/20 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Trade-Tracker AI
                </h1>
                <p className="text-sm text-gray-400">Welcome, {user.username}! 👋</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowVoice(true)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-5 h-12 rounded-lg text-sm font-semibold"
              >
                <Mic className="w-4 h-4" />
                Voice Update
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-5 h-12 rounded-lg text-sm font-semibold"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
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
                <AssetCard key={asset.id} asset={asset} onRefresh={fetchAssets} token={token} />
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
      {showVoice && <VoiceRecorder onClose={() => { setShowVoice(false); fetchAssets(); }} token={token} />}

      {/* Floating QR scan FAB */}
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

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
