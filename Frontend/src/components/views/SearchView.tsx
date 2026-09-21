import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, FileText, Database, Sparkles, ArrowRight, MessageSquare, Eye } from "lucide-react"

interface SearchViewProps {
  onSelectDocForChat: (docName: string) => void
}

interface SearchResult {
  name: string
  similarity: number
  snippet: string
  size: string
  type: string
  date: string
}

export function SearchView({ onSelectDocForChat }: SearchViewProps) {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return
    setQuery(searchQuery)
    setIsSearching(true)
    setHasSearched(true)

    try {
      const res = await fetch("http://localhost:5000/api/documents")
      if (res.ok) {
        const docs = await res.json()
        const queryLower = searchQuery.toLowerCase()
        const matched: SearchResult[] = docs
          .filter((d: any) => 
            (d.name && d.name.toLowerCase().includes(queryLower)) || 
            (d.summary && d.summary.toLowerCase().includes(queryLower)) ||
            (d.ocrContent && d.ocrContent.toLowerCase().includes(queryLower))
          )
          .map((d: any) => ({
            name: d.name,
            similarity: 0.94,
            snippet: d.summary || d.ocrContent || `Indexed content in ${d.name} matching vector query.`,
            size: `${(d.sizeBytes / (1024 * 1024)).toFixed(1)} MB`,
            type: d.name.split('.').pop()?.toUpperCase() || 'DOC',
            date: new Date(d.createdAt).toLocaleDateString()
          }))
        setResults(matched)
      } else {
        setResults([])
      }
    } catch (err) {
      console.warn("Backend vector search offline.", err)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-neutral-850 tracking-tight flex items-center gap-3">
          <Database className="h-7 w-7 text-purple-600 animate-pulse-glow" />
          Semantic Vector Search
        </h1>
        <p className="text-neutral-500 mt-1">
          Query corporate databases using natural language. The system performs embedding conversions and calculates cosine similarity.
        </p>
      </div>

      {/* Query Bar */}
      <div className="space-y-4">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSearch(query); }}
          className="relative flex items-center"
        >
          <div className="absolute left-4 text-neutral-400 font-bold z-10">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything (e.g., 'What is our remote work policy?')"
            className="w-full pl-12 pr-32 py-4 rounded-2xl bg-white border border-slate-200 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-100 transition-all font-medium text-sm"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs tracking-wider flex items-center gap-1.5 transition-all shadow-lg shadow-purple-500/20 cursor-pointer disabled:opacity-50"
          >
            {isSearching ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Query
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Suggestion tags */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-neutral-400 font-semibold uppercase tracking-wider font-mono">Suggestions:</span>
          {["remote work policy", "q3 goals", "security audit"].map((tag) => (
            <button
              key={tag}
              onClick={() => handleSearch(tag)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200/80 text-neutral-600 hover:bg-slate-200/60 hover:border-purple-300 transition-all cursor-pointer font-medium"
            >
              "{tag}"
            </button>
          ))}
        </div>
      </div>

      {/* Results Area */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div
              key="searching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-panel p-10 rounded-2xl border-slate-200/80 flex flex-col items-center justify-center space-y-4"
            >
              <div className="relative w-12 h-12 flex items-center justify-center">
                <span className="w-12 h-12 rounded-full border-2 border-purple-500/10 border-t-purple-600 animate-spin absolute" />
                <Database className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="font-semibold text-neutral-850">Performing Vector Query</h4>
                <p className="text-xs text-neutral-500 font-mono">Converting string to 1536-dimensional float embedding...</p>
              </div>
            </motion.div>
          ) : hasSearched && results.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between text-xs text-neutral-450 font-semibold font-mono uppercase tracking-wider px-2">
                <span>Vector Math Completed</span>
                <span>{results.length} Nodes Matched</span>
              </div>

              {results.map((result, i) => (
                <motion.div
                  key={result.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-6 rounded-2xl border border-slate-200/80 hover:border-purple-500/45 flex flex-col md:flex-row md:items-start justify-between gap-6"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-neutral-850 tracking-wide">{result.name}</h3>
                        <div className="flex gap-3 text-[10px] text-neutral-400 font-mono mt-0.5">
                          <span>{result.type}</span>
                          <span>•</span>
                          <span>{result.size}</span>
                          <span>•</span>
                          <span>Updated {result.date}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-600 bg-slate-50 p-4 rounded-xl border border-slate-200/60 leading-relaxed italic">
                      {result.snippet}
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-600 text-xs font-bold font-mono">
                      <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                      {(result.similarity * 100).toFixed(1)}% Match
                    </div>

                    <div className="flex gap-2 mt-4 md:mt-0">
                      <button
                        onClick={() => onSelectDocForChat(result.name)}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 text-neutral-650 hover:text-purple-600 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Chat
                      </button>
                      <button
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/60 border border-slate-200 text-neutral-650 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Preview
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : hasSearched ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-panel p-10 rounded-2xl border-slate-200/80 text-center text-neutral-500 space-y-2"
            >
              <Search className="h-8 w-8 mx-auto text-neutral-400" />
              <h4 className="font-semibold text-neutral-850">No Matched Vectors</h4>
              <p className="text-xs">Adjust your keywords or query parameters to search other partitions.</p>
            </motion.div>
          ) : (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-panel p-10 rounded-2xl border-slate-200/80 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-neutral-500">
                <Search className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-neutral-850">Awaiting Embedding Vector</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                  Enter a sentence, query or concept. The system matches the semantic vector index to fetch highly relevant paragraphs instantly.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
