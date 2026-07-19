import { useState } from "react"
import { 
  Database, 
  Search, 
  Sliders, 
  Sparkles, 
  Layers, 
  FileText, 
  Cpu, 
  Zap,
  ArrowRight
} from "lucide-react"

interface VectorChunk {
  id: string
  docTitle: string
  pageNumber: number
  similarityScore: number
  distance: number
  content: string
  keywords: string[]
}

export function RAGSearchView() {
  const [query, setQuery] = useState("What are our indemnification limits for AI model data breaches?")
  const [vectorWeight, setVectorWeight] = useState(80) // 80% vector, 20% BM25 keyword
  const [distanceMetric, setDistanceMetric] = useState<"cosine" | "euclidean">("cosine")
  const [isSearching, setIsSearching] = useState(false)

  const chunks: VectorChunk[] = [
    {
      id: "chunk-9482",
      docTitle: "MSA_Vendor_Agreement_v2.1.pdf",
      pageNumber: 14,
      similarityScore: 96.4,
      distance: 0.036,
      content: "Section 15.2 - Data Breach Indemnification Cap: In no event shall Provider's total aggregate liability for unauthorized disclosure or security breaches involving trained AI models exceed $2,000,000 USD per calendar year.",
      keywords: ["Indemnification", "Data Breach", "AI Model", "$2,000,000 Cap"]
    },
    {
      id: "chunk-3310",
      docTitle: "SLA_Standard_Enterprise.pdf",
      pageNumber: 8,
      similarityScore: 89.1,
      distance: 0.109,
      content: "Section 9.1 - Security Safeguards: Provider maintains SOC 2 Type II compliance and AES-256 encryption at rest. In the event of a security incident affecting customer data, notification shall be issued within 24 hours.",
      keywords: ["SOC 2 Type II", "AES-256", "24-Hour Notice"]
    },
    {
      id: "chunk-1094",
      docTitle: "Cloud_Infrastructure_Policy_2026.pdf",
      pageNumber: 3,
      similarityScore: 82.5,
      distance: 0.175,
      content: "Section 4 text: Intellectual Property and AI Weights. Model embeddings generated during retrieval augmented operations remain the sole property of the Enterprise Client.",
      keywords: ["IP Rights", "Model Embeddings", "Sole Property"]
    },
    {
      id: "chunk-7721",
      docTitle: "Security_Audit_Report_Q2.pdf",
      pageNumber: 22,
      similarityScore: 78.9,
      distance: 0.211,
      content: "Audit Finding #12: All vector search queries are encrypted in transit via TLS 1.3 and hashed prior to entering vector index storage nodes.",
      keywords: ["Vector Search", "TLS 1.3", "Hashed Embeddings"]
    }
  ]

  const handleExecuteSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    setTimeout(() => setIsSearching(false), 600)
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-cyan-900/10 via-blue-900/5 to-slate-900/10 border border-cyan-500/20 glass-panel">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30 preserve-3d animate-float-3d">
            <Database className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                RAG Vector Engine & Semantic Search
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">
                1536d Hybrid Search
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Retrieval-Augmented Generation visualizer, chunk similarity inspector, and hybrid BM25 + Vector tuning.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Index Status: 1,420 Chunks Active
          </div>
        </div>
      </div>

      {/* RAG Query Input Bar */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 card-3d-cyan">
        <form onSubmit={handleExecuteSearch} className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask any semantic query across workspace vector index..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
            />
            <Search className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className={`h-4 w-4 ${isSearching ? "animate-spin" : ""}`} />
            {isSearching ? "Retrieving Vector Chunks..." : "Execute RAG Search"}
          </button>
        </form>

        {/* Hybrid Search Tuning Slider */}
        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs border-t border-slate-100">
          <div className="flex items-center gap-4 flex-1">
            <span className="font-mono font-bold text-slate-500 uppercase flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-cyan-600" /> Hybrid Balance:
            </span>
            <div className="flex-1 flex items-center gap-3 max-w-xs">
              <span className="font-semibold text-slate-500 text-[11px]">BM25 (20%)</span>
              <input
                type="range"
                min={0}
                max={100}
                value={vectorWeight}
                onChange={(e) => setVectorWeight(Number(e.target.value))}
                className="flex-1 accent-cyan-600 cursor-pointer"
              />
              <span className="font-semibold text-cyan-700 text-[11px]">Vector ({vectorWeight}%)</span>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono">
            <span className="text-slate-400">Distance:</span>
            <button
              onClick={() => setDistanceMetric("cosine")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                distanceMetric === "cosine" ? "bg-cyan-100 text-cyan-800 border border-cyan-200" : "bg-slate-100 text-slate-600"
              }`}
            >
              Cosine Similarity
            </button>
            <button
              onClick={() => setDistanceMetric("euclidean")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                distanceMetric === "euclidean" ? "bg-cyan-100 text-cyan-800 border border-cyan-200" : "bg-slate-100 text-slate-600"
              }`}
            >
              Euclidean
            </button>
          </div>
        </div>
      </div>

      {/* RAG Pipeline Flow Visualization Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono shadow-md">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400"><Cpu className="h-4 w-4" /></span>
          <span>1. User Query Embedding</span>
        </div>
        <ArrowRight className="h-4 w-4 text-slate-600 hidden sm:block" />
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400"><Database className="h-4 w-4" /></span>
          <span>2. Vector ANN Retrieval</span>
        </div>
        <ArrowRight className="h-4 w-4 text-slate-600 hidden sm:block" />
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400"><Zap className="h-4 w-4" /></span>
          <span>3. Hybrid Re-Ranking</span>
        </div>
        <ArrowRight className="h-4 w-4 text-slate-600 hidden sm:block" />
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400"><Sparkles className="h-4 w-4" /></span>
          <span>4. LLM Context Generation</span>
        </div>
      </div>

      {/* Retrieved Vector Chunks Inspection Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-600" /> Top {chunks.length} Retrieved Semantic Vector Chunks
          </h2>
          <span className="text-xs text-slate-400 font-mono">Query Execution Time: 28ms</span>
        </div>

        {chunks.map((chunk) => (
          <div key={chunk.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 hover:border-cyan-300 transition-all card-3d-cyan">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-cyan-50 text-cyan-700 font-mono text-xs font-bold border border-cyan-200">
                  {chunk.id}
                </span>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" /> {chunk.docTitle}
                  </h3>
                  <span className="text-[11px] text-slate-400">Page {chunk.pageNumber}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 font-mono">
                <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  {chunk.similarityScore}% Match Score
                </div>
                <div className="text-[11px] text-slate-400">
                  Dist: {chunk.distance}
                </div>
              </div>
            </div>

            {/* Chunk Text snippet */}
            <p className="text-xs text-slate-700 leading-relaxed font-mono bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              "{chunk.content}"
            </p>

            {/* Keyword badges */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] font-mono text-slate-400">Keywords:</span>
              {chunk.keywords.map((kw, i) => (
                <span key={i} className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600">
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
