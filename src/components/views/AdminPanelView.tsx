import { useState } from "react"
import { 
  Cpu, 
  Database, 
  Activity, 
  Settings, 
  KeyRound, 
  RefreshCw, 
  HardDrive, 
  Sparkles, 
  Lock
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export function AdminPanelView() {
  const { user, isAdmin } = useAuth()
  const [selectedModel, setSelectedModel] = useState("gemini-1.5-pro")
  const [temperature, setTemperature] = useState(0.2)
  const [chunkSize, setChunkSize] = useState(512)
  const [isReindexing, setIsReindexing] = useState(false)
  const [reindexProgress, setReindexProgress] = useState(0)

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 rounded-3xl bg-white border border-rose-200 text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
          <Lock className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Restricted Enterprise Admin Panel</h2>
        <p className="text-xs text-slate-500">
          Your current account role (<strong>{user?.role.toUpperCase() || "GUEST"}</strong>) does not have system administrator privileges.
        </p>
        <p className="text-xs text-purple-600 font-semibold">
          Click "Sign In" in the top bar and select "System Administrator (Jeel Khunt)" to unlock full admin access.
        </p>
      </div>
    )
  }

  const handleReindex = () => {
    setIsReindexing(true)
    setReindexProgress(15)

    setTimeout(() => setReindexProgress(55), 500)
    setTimeout(() => setReindexProgress(90), 1100)
    setTimeout(() => {
      setReindexProgress(100)
      setIsReindexing(false)
      alert("RAG Vector Index re-indexed successfully across all 1,420 document chunks!")
    }, 1600)
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-900/10 via-indigo-900/5 to-slate-900/10 border border-purple-500/20 glass-panel">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 preserve-3d animate-float-3d">
            <Settings className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Enterprise Admin Control Panel
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-100 text-purple-700 border border-purple-200">
                Root System Access
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Configure LLM foundation models, vector chunking strategies, API telemetry, and security policies.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleReindex}
            disabled={isReindexing}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isReindexing ? "animate-spin" : ""}`} />
            {isReindexing ? `Re-Indexing (${reindexProgress}%)...` : "Re-Index RAG Vector DB"}
          </button>
        </div>
      </div>

      {/* Telemetry Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between card-3d">
          <div>
            <div className="text-xs font-semibold text-slate-400">Active Foundation LLM</div>
            <div className="text-lg font-black text-purple-700 mt-1">Gemini 1.5 Pro</div>
            <div className="text-[11px] text-emerald-600 font-medium">Latency: 280ms</div>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
            <Cpu className="h-6 w-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between card-3d">
          <div>
            <div className="text-xs font-semibold text-slate-400">Vector ANN Search Latency</div>
            <div className="text-lg font-black text-slate-900 mt-1">24 ms</div>
            <div className="text-[11px] text-emerald-600 font-medium">99.9% Cache Hit Rate</div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <Activity className="h-6 w-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between card-3d">
          <div>
            <div className="text-xs font-semibold text-slate-400">Monthly AI Tokens</div>
            <div className="text-lg font-black text-slate-900 mt-1">4.8M / 10M</div>
            <div className="text-[11px] text-slate-500">48% Quota Used</div>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between card-3d">
          <div>
            <div className="text-xs font-semibold text-slate-400">Vector DB Storage</div>
            <div className="text-lg font-black text-slate-900 mt-1">128 GB / 1 TB</div>
            <div className="text-[11px] text-purple-600 font-medium">AES-256 Encrypted</div>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
            <HardDrive className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Model Configurator & Chunk Strategy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Model Provider Switcher */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6 card-3d">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Cpu className="h-4 w-4 text-purple-600" /> Model Provider Switcher
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
              Hot-Swappable
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Generative Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none cursor-pointer"
              >
                <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Recommended - 2M Context)</option>
                <option value="claude-3.5-sonnet">Anthropic Claude 3.5 Sonnet</option>
                <option value="gpt-4o">OpenAI GPT-4o Enterprise</option>
                <option value="llama-3-local">Local Llama 3 70B (Air-Gapped Private Server)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Model Temperature: {temperature}</span>
                <span className="text-slate-400 font-mono">0.0 (Deterministic) - 1.0 (Creative)</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Vector Chunking & Indexing Strategy */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6 card-3d">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-600" /> Vector Index Chunking Strategy
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
              Optimal
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chunk Size (Tokens)</label>
              <select
                value={chunkSize}
                onChange={(e) => setChunkSize(Number(e.target.value))}
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none cursor-pointer"
              >
                <option value={256}>256 Tokens (Fine-Grained Legal Clause Extraction)</option>
                <option value={512}>512 Tokens (Standard Balanced RAG Context)</option>
                <option value={1024}>1024 Tokens (Broad Page Level Context)</option>
              </select>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-center justify-between">
              <span>Overlap: <strong>64 Tokens</strong></span>
              <span>Embedding Metric: <strong>Cosine</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Actions Bar */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 card-3d">
        <div>
          <h3 className="font-bold text-sm flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-purple-400" /> API Keys & Security Audit Logs
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Rotate production secrets or download raw system logs.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => alert("Rotating API Secrets...")}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 cursor-pointer"
          >
            Rotate API Secret Keys
          </button>
          <button 
            onClick={() => alert("Exporting Security Audit Ledger...")}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-500/20 cursor-pointer"
          >
            Export System Ledger
          </button>
        </div>
      </div>
    </div>
  )
}
