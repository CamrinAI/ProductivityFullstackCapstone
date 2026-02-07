import React, { useState, useEffect } from 'react';
import { Wrench, Search, Plus, CheckCircle, AlertTriangle, XCircle, LogOut, User, Users } from 'lucide-react';
import AssetCard from './components/AssetCard';
import MaterialCard from './components/MaterialCard';
import LoginPage from './pages/LoginPage';
import AddToolModal from './components/AddToolModal';
import AddMaterialModal from './components/AddMaterialModal';
import OnsiteList from './components/OnsiteList';
import { useAuth } from './context/AuthContext';


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
  const { user, logout, loading: authLoading } = useAuth();
  const [tools, setTools] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('tools');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showAddTool, setShowAddTool] = useState(false);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  // Sort helpers: available first, checked out next, damaged/maintenance last
  const toolStatusRank = (tool) => {
    if (tool.status === 'damaged' || tool.status === 'maintenance') return 2;
    if (!tool.is_available) return 1;
    return 0;
  };

  const sortedTools = [...tools].sort((a, b) => toolStatusRank(a) - toolStatusRank(b));
  const sortedMaterials = [...materials].sort((a, b) => (a.needs_reorder ? 1 : 0) - (b.needs_reorder ? 1 : 0));

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

  // Fetch all users for onsite list
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`http://localhost:3000/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) setUsers(data.users || []);
    } catch (e) {
      console.error('Failed to fetch users:', e);
    }
  };

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

  // Initialize: load tools and materials on mount
  useEffect(() => {
    if (!dataLoaded && user) {
      fetchTools();
      fetchMaterials();
      fetchUsers();
      setDataLoaded(true);
    }
  }, [dataLoaded, user]);

  // Re-fetch when page changes
  useEffect(() => {
    if (dataLoaded && user) {
      fetchToolsPaged(page);
    }
  }, [page, perPage]);

  // Show loading state or login page
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="mb-4">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          </div>
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  // Check user role for permissions
  const canManageTools = user.role === 'superintendent' || user.role === 'foreman';
  const isAdmin = user.role === 'superintendent';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Navigation Header */}
      <header className="bg-black/50 border-b border-blue-500/20 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wrench className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Trade Tracker
                </h1>
                <p className="text-sm text-gray-400">Digital Tool Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* User Greeting */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
                <User className="w-4 h-4 text-blue-400" />
                <span className="text-sm">
                  Hello, <span className="font-semibold text-blue-400">{user.username}</span>
                  {user.role !== 'technician' && (
                    <span className="ml-2 text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                      {user.role === 'superintendent' ? 'Superintendent' : 'Foreman'}
                    </span>
                  )}
                </span>
              </div>

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

              {/* Logout Button */}
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm mb-6 text-gray-400">
          <button 
            onClick={() => {
              setActiveTab('tools');
              setSearchQuery('');
              setPage(1);
            }}
            className="hover:text-blue-400 cursor-pointer transition"
          >
            Home
          </button>
          <span>/</span>
          <button 
            onClick={() => setActiveTab('tools')}
            className="hover:text-blue-400 cursor-pointer transition"
          >
            Tools
          </button>
          <span>/</span>
          <span className="text-gray-300">
            {activeTab === 'tools' ? 'Dashboard' : activeTab === 'onsite' ? 'Onsite' : 'Materials'}
          </span>
        </div>

        {/* Role-Based Access Info */}
        {(canManageTools || isAdmin) && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-400 mb-1">Management Access Granted</h3>
                <p className="text-sm text-gray-300">
                  {isAdmin 
                    ? 'As a Superintendent, you have full access to create, edit, and delete tools and materials.'
                    : 'As a Foreman, you can create, edit, and manage tools.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

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

        {/* Tab Navigation: Switch between Tools, Onsite, and Materials views */}
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
            onClick={() => setActiveTab('onsite')}
            className={`pb-4 font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'onsite' ? 'border-blue-400 text-blue-400' : 'border-transparent text-gray-400'
            }`}
          >
            <Users className="w-4 h-4" />
            Onsite ({tools.filter(t => !t.is_available).length} active)
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
                sortedTools
                  .filter(tool => 
                    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (tool.serial_number && tool.serial_number.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                  .map(tool => (
                    <AssetCard key={tool.id} asset={tool} onRefresh={fetchTools} userId={user?.id} />
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

        {/* Onsite Tab: Display employees and their checked out tools */}
        {activeTab === 'onsite' && (
          <OnsiteList tools={tools} users={users} />
        )}

        {/* Materials Tab: Display consumable inventory with quantity adjustments */}
        {activeTab === 'materials' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-200">Materials</h3>
              <button
                onClick={() => setShowAddMaterial(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold"
              >
                Add Material
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {materials.length === 0 ? (
                <p className="col-span-full text-gray-400">No materials</p>
              ) : (
                sortedMaterials.map(m => (
                  <MaterialCard key={m.id} material={m} onRefresh={fetchMaterials} />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button: Add Tool */}
      {canManageTools && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setShowAddTool(true)}
            className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 shadow-xl flex items-center justify-center text-white border border-blue-400/40 transition hover:scale-110"
            title="Add new tool"
          >
            <Plus className="w-8 h-8" />
          </button>
        </div>
      )}

      {/* Add Tool Modal */}
      <AddToolModal
        isOpen={showAddTool}
        onClose={() => setShowAddTool(false)}
        onToolAdded={fetchTools}
      />

      <AddMaterialModal
        isOpen={showAddMaterial}
        onClose={() => setShowAddMaterial(false)}
        onMaterialAdded={fetchMaterials}
      />

      {/* Future Implementation: Role Switcher for testing role-based permissions */}
    </div>
  );
}

export default App;
