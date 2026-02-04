import React, { useState, useEffect } from 'react';
import { Package, Search, Plus, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import AssetCard from './components/AssetCard';

/**
 * Trade Tracker - Main Application Component
 * 
 * Job site asset and material management system
 * 
 * Features:
 * - Real-time asset inventory with pagination
 * - Search and filter tools
 * - Asset checkout/checkin tracking
 * - Material consumables management
 * - Role-based access control (Worker, Foreman, Superintendent)
 */
function App() {
  const [tools, setTools] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('tools');
  const [dataLoaded, setDataLoaded] = useState(false);

  // Fetch all tools from backend
  const fetchTools = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/tools`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) setTools(data.tools || data.items || []);
    } catch (e) {
      console.error('Failed to fetch tools:', e);
    }
    setLoading(false);
  };

  // Fetch all materials from backend
  const fetchMaterials = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/tools/materials`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) setMaterials(data.materials);
    } catch (e) {
      console.error('Failed to fetch materials:', e);
    }
  };

  // Initialize: load tools and materials on mount
  useEffect(() => {
    if (!dataLoaded) {
      fetchTools();
      fetchMaterials();
      setDataLoaded(true);
    }
  }, [dataLoaded]);

  // Pagination state and handler
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  const fetchToolsPaged = async (nextPage = page) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/tools?page=${nextPage}&per_page=${perPage}`);
      const data = await res.json();
      if (data.success) {
        setTools(data.tools || []);
      }
    } catch (e) {
      console.error('Failed to fetch tools (paged):', e);
    }
    setLoading(false);
  };

  // Re-fetch when page changes
  useEffect(() => {
    if (dataLoaded) {
      fetchToolsPaged(page);
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
                  Trade Tracker
                </h1>
                <p className="text-sm text-gray-400">Digital Tool Crib</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-64"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Status Dashboard */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-500/10 border-blue-500/30 border rounded-lg p-6">
            <CheckCircle className="w-6 h-6 mb-2 text-blue-400" />
            <div className="text-2xl font-bold">{tools.filter(t => t.is_available).length}</div>
            <p className="text-sm opacity-90">Available</p>
          </div>
          <div className="bg-yellow-500/10 border-yellow-500/30 border rounded-lg p-6">
            <AlertTriangle className="w-6 h-6 mb-2 text-yellow-400" />
            <div className="text-2xl font-bold">
              {tools.filter(t => !t.is_available || t.status === 'maintenance').length}
            </div>
            <p className="text-sm opacity-90">Checked Out / Maintenance</p>
          </div>
          <div className="bg-red-500/10 border-red-500/30 border rounded-lg p-6">
            <XCircle className="w-6 h-6 mb-2 text-red-400" />
            <div className="text-2xl font-bold">{tools.filter(t => t.status === 'damaged').length}</div>
            <p className="text-sm opacity-90">Damaged</p>
          </div>
        </div>

        {/* Tab Navigation: Switch between Tools and Materials views */}
        <div className="flex gap-4 mb-8 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('tools')}
            className={`pb-4 font-semibold border-b-2 transition ${
              activeTab === 'tools' ? 'border-blue-400 text-blue-400' : 'border-transparent text-gray-400'
            }`}
          >
            Tools ({tools.length})
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

        {/* Tools Tab: Display tool cards with checkout controls */}
        {activeTab === 'tools' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {loading ? (
                <p className="col-span-full text-gray-400">Loading...</p>
              ) : tools.length === 0 ? (
                <p className="col-span-full text-gray-400">No tools. Create one to start.</p>
              ) : (
                tools
                  .filter(tool => 
                    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (tool.serial_number && tool.serial_number.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                  .map(tool => (
                    <AssetCard key={tool.id} asset={tool} onRefresh={fetchTools} />
                  ))
              )}
            </div>
            {/* Pagination Controls: Navigate through paginated assets */}
            <div className="flex items-center justify-end gap-2 mt-4">
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
                  <p className="text-sm text-gray-400">Qty: {m.quantity} {m.unit}</p>
                  {/* Quick quantity adjustment buttons for materials */}
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={async () => {
                        try {
                          await fetch(`http://localhost:3000/api/tools/materials/${m.id}`, {
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
                          await fetch(`http://localhost:3000/api/tools/materials/${m.id}`, {
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
                          await fetch(`http://localhost:3000/api/tools/materials/${m.id}`, {
                            method: 'DELETE'
                          });
                          fetchMaterials();
                        } catch (e) {
                          console.error('Delete material failed', e);
                        }
                      }}
                      className="ml-auto px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                    >Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button: Add Tool */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => alert('Add new tool - functionality coming soon')}
          className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 shadow-xl flex items-center justify-center text-white border border-blue-400/40"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}

export default App;
