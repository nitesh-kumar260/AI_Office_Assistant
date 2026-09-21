import { useState } from "react"
import { 
  GitCompare, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Sparkles, 
  ArrowRightLeft, 
  Layers, 
  ShieldAlert,
  Filter
} from "lucide-react"

interface DiffItem {
  type: "added" | "deleted" | "modified" | "unchanged"
  clause: string
  docAContent?: string
  docBContent?: string
  content?: string
  riskLevel?: "low" | "medium" | "high"
  impact?: string
}

export function DocumentComparisonView() {
  const [docA, setDocA] = useState("MSA_Vendor_Agreement_v1.0.pdf")
  const [docB, setDocB] = useState("MSA_Vendor_Agreement_v2.1_Updated.pdf")
  const [viewMode, setViewMode] = useState<"split" | "unified">("split")
  const [filterRisk, setFilterRisk] = useState<"all" | "high" | "medium">("all")
  const [isComparing, setIsComparing] = useState(false)

  const diffItems: DiffItem[] = [
    {
      type: "modified",
      clause: "Section 4.1 - Payment Terms & Net Interest Rate",
      docAContent: "Payment shall be processed within 45 days of receipt of valid invoice. Late payments shall incur 1.5% interest per month.",
      docBContent: "Payment shall be processed within 15 days of receipt of valid invoice. Late payments shall incur 3.0% interest per month plus standard administrative fee.",
      riskLevel: "medium",
      impact: "Accelerated cash outflow deadline with 100% increase in late penalty rate."
    },
    {
      type: "deleted",
      clause: "Section 7.3 - Cure Period for Convenience Termination",
      docAContent: "Either party may terminate this agreement without cause upon providing 60 calendar days prior written notice with a 14-day cure option.",
      docBContent: "[REMOVED IN VERSION 2.1]",
      riskLevel: "high",
      impact: "Removal of cure window exposes organization to immediate contract termination without remediation period."
    },
    {
      type: "added",
      clause: "Section 12.8 - AI Data Model Processing & IP Grant",
      docAContent: "[NOT PRESENT IN VERSION 1.0]",
      docBContent: "Client hereby grants Provider a non-exclusive, worldwide, royalty-free license to use anonymized operational data for training generative AI foundation models.",
      riskLevel: "high",
      impact: "Grants third-party rights to train AI models on enterprise operational telemetry. Requires legal review."
    },
    {
      type: "modified",
      clause: "Section 15.2 - Limitation of Liability Cap",
      docAContent: "Aggregate liability of either party under this agreement shall not exceed $1,000,000 USD or total fees paid in preceding 12 months.",
      docBContent: "Aggregate liability of Provider shall be capped at 1x total fees paid. Aggregate liability of Client shall be uncapped for IP infringement and data breach.",
      riskLevel: "high",
      impact: "Asymmetric liability cap favors Provider, leaving Client exposed to uncapped claims."
    },
    {
      type: "unchanged",
      clause: "Section 18.1 - Governing Law & Arbitration Jurisdiction",
      content: "This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without giving effect to conflict of laws principles.",
      riskLevel: "low",
      impact: "Standard jurisdiction clause retained without modifications."
    }
  ]

  const handleSimulateCompare = () => {
    setIsComparing(true)
    setTimeout(() => setIsComparing(false), 800)
  }

  const filteredDiffs = diffItems.filter(item => {
    if (filterRisk === "high") return item.riskLevel === "high"
    if (filterRisk === "medium") return item.riskLevel === "medium" || item.riskLevel === "high"
    return true
  })

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-900/10 via-indigo-900/5 to-slate-900/10 border border-purple-500/20 glass-panel">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 preserve-3d animate-float-3d">
            <GitCompare className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                3D Document Comparison Engine
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-100 text-purple-700 border border-purple-200">
                AI Legal Diff
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Visual side-by-side contract comparison, semantic diff extraction, and clause risk scoring.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleSimulateCompare}
            disabled={isComparing}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Sparkles className={`h-4 w-4 text-purple-400 ${isComparing ? "animate-spin" : ""}`} />
            {isComparing ? "Analyzing Diffs..." : "Re-Analyze Discrepancies"}
          </button>

          <button 
            onClick={() => alert("Downloading Legal Comparison Report (PDF)...")}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" /> Export Diff Report
          </button>
        </div>
      </div>

      {/* Document Selectors & Comparison Setup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Document A Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all card-3d">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
              <FileText className="h-4 w-4" /> Baseline Document (v1.0)
            </span>
            <span className="text-[11px] font-semibold text-slate-400 px-2 py-0.5 rounded-md bg-slate-100">
              Original Draft
            </span>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 min-w-0">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-600 font-bold text-xs shrink-0">PDF</div>
            <select 
              value={docA}
              onChange={(e) => setDocA(e.target.value)}
              className="flex-1 min-w-0 w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="MSA_Vendor_Agreement_v1.0.pdf">MSA_Vendor_Agreement_v1.0.pdf (Jan 2024)</option>
              <option value="Employment_Contract_2024.pdf">Employment_Contract_2024.pdf</option>
              <option value="SLA_Standard_Enterprise.pdf">SLA_Standard_Enterprise.pdf</option>
            </select>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Size: 2.4 MB • 18 Pages</span>
            <span className="text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Hash Verified
            </span>
          </div>
        </div>

        {/* Document B Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all card-3d min-w-0">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
              <FileText className="h-4 w-4" /> Revision Document (v2.1)
            </span>
            <span className="text-[11px] font-semibold text-purple-700 px-2 py-0.5 rounded-md bg-purple-50">
              Revised Counterpart
            </span>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 min-w-0">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700 font-bold text-xs shrink-0">PDF</div>
            <select 
              value={docB}
              onChange={(e) => setDocB(e.target.value)}
              className="flex-1 min-w-0 w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="MSA_Vendor_Agreement_v2.1_Updated.pdf">MSA_Vendor_Agreement_v2.1_Updated.pdf (Jul 2026)</option>
              <option value="Employment_Contract_2026_Proposed.pdf">Employment_Contract_2026_Proposed.pdf</option>
              <option value="SLA_Customized_Client.pdf">SLA_Customized_Client.pdf</option>
            </select>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Size: 2.7 MB • 21 Pages</span>
            <span className="text-purple-600 font-medium flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> 5 Key Discrepancies Found
            </span>
          </div>
        </div>
      </div>

      {/* AI Comparison Intelligence Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Similarity Score */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="relative w-14 h-14 flex items-center justify-center rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 font-black text-lg">
            84%
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Semantic Similarity</div>
            <div className="text-sm font-bold text-slate-800">High Match Index</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">16% Textual Deviation</div>
          </div>
        </div>

        {/* Added Clauses */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold text-xl">
            +1
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Added Clauses</div>
            <div className="text-sm font-bold text-slate-800">1 New Section</div>
            <div className="text-[11px] text-slate-500">AI Data Model Grant</div>
          </div>
        </div>

        {/* Deleted Clauses */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center font-bold text-xl">
            -1
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Removed Clauses</div>
            <div className="text-sm font-bold text-slate-800">1 Omitted Section</div>
            <div className="text-[11px] text-rose-600 font-medium">Convenience Cure Period</div>
          </div>
        </div>

        {/* High Risk Flags */}
        <div className="p-5 rounded-3xl bg-white border border-rose-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
            <ShieldAlert className="h-7 w-7 text-rose-600 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">High Risk Discrepancies</div>
            <div className="text-sm font-bold text-rose-600">3 Legal Warnings</div>
            <div className="text-[11px] text-slate-500">Requires Legal Approval</div>
          </div>
        </div>
      </div>

      {/* Control Bar: View Toggle & Risk Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-100 border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase mr-2">Diff Mode:</span>
          <button
            onClick={() => setViewMode("split")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "split" ? "bg-white text-purple-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ArrowRightLeft className="h-3.5 w-3.5" /> Side-by-Side Split
          </button>
          <button
            onClick={() => setViewMode("unified")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "unified" ? "bg-white text-purple-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="h-3.5 w-3.5" /> Unified Inline
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Filter Risk:
          </span>
          <button
            onClick={() => setFilterRisk("all")}
            className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer ${
              filterRisk === "all" ? "bg-slate-800 text-white" : "bg-white text-slate-600 hover:bg-slate-200"
            }`}
          >
            Show All (5)
          </button>
          <button
            onClick={() => setFilterRisk("high")}
            className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer ${
              filterRisk === "high" ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-700 hover:bg-rose-100"
            }`}
          >
            High Risk Only (3)
          </button>
        </div>
      </div>

      {/* Discrepancy Breakdown Section */}
      <div className="space-y-4">
        {filteredDiffs.map((diff, index) => (
          <div 
            key={index} 
            className={`p-6 rounded-3xl bg-white border transition-all ${
              diff.riskLevel === "high" 
                ? "border-rose-200 shadow-sm hover:border-rose-300" 
                : diff.riskLevel === "medium" 
                ? "border-amber-200 shadow-sm" 
                : "border-slate-200"
            }`}
          >
            {/* Clause Title Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase ${
                  diff.type === "added" ? "bg-emerald-100 text-emerald-700" :
                  diff.type === "deleted" ? "bg-rose-100 text-rose-700" :
                  diff.type === "modified" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                }`}>
                  {diff.type}
                </span>
                <h3 className="font-bold text-slate-900 text-sm">{diff.clause}</h3>
              </div>

              {diff.riskLevel && (
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                    diff.riskLevel === "high" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                    diff.riskLevel === "medium" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {diff.riskLevel === "high" && <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />}
                    {diff.riskLevel.toUpperCase()} RISK
                  </span>
                </div>
              )}
            </div>

            {/* Side-by-Side Split Diff View */}
            {viewMode === "split" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                {/* Doc A Text */}
                <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 text-slate-800">
                  <div className="font-bold text-[11px] text-rose-700 mb-2 uppercase tracking-wide">
                    Baseline (v1.0):
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {diff.docAContent || diff.content}
                  </p>
                </div>

                {/* Doc B Text */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-slate-800">
                  <div className="font-bold text-[11px] text-emerald-700 mb-2 uppercase tracking-wide">
                    Revision (v2.1):
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {diff.docBContent || diff.content}
                  </p>
                </div>
              </div>
            ) : (
              /* Unified Inline Diff View */
              <div className="p-4 rounded-2xl bg-slate-50 font-mono text-xs space-y-2">
                {diff.docAContent && (
                  <div className="p-2.5 rounded-lg bg-rose-100/70 text-rose-900 border-l-4 border-rose-500">
                    <span className="font-bold mr-2">- [REMOVED]:</span>
                    {diff.docAContent}
                  </div>
                )}
                {diff.docBContent && (
                  <div className="p-2.5 rounded-lg bg-emerald-100/70 text-emerald-900 border-l-4 border-emerald-500">
                    <span className="font-bold mr-2">+ [ADDED]:</span>
                    {diff.docBContent}
                  </div>
                )}
                {diff.content && (
                  <div className="p-2.5 rounded-lg bg-white text-slate-700">
                    {diff.content}
                  </div>
                )}
              </div>
            )}

            {/* AI Executive Assessment Banner */}
            {diff.impact && (
              <div className="mt-4 p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80 flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                <div className="text-xs text-purple-900">
                  <span className="font-bold text-purple-950 mr-1">AI Risk Assessment:</span>
                  {diff.impact}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
