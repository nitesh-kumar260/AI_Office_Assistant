import { useState } from "react"
import { 
  FileBarChart2, 
  Sparkles, 
  Download, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Zap, 
  PieChart, 
  Layers,
  FileSpreadsheet
} from "lucide-react"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

export function AutoReportView() {
  const [template, setTemplate] = useState("compliance")
  const [dateRange, setDateRange] = useState("q3_2026")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [reportReady, setReportReady] = useState(true)

  const analyticsData = [
    { month: "Jan", docs: 120, risks: 14, automatedHours: 420 },
    { month: "Feb", docs: 180, risks: 22, automatedHours: 610 },
    { month: "Mar", docs: 240, risks: 18, automatedHours: 890 },
    { month: "Apr", docs: 310, risks: 29, automatedHours: 1120 },
    { month: "May", docs: 390, risks: 15, automatedHours: 1450 },
    { month: "Jun", docs: 460, risks: 12, automatedHours: 1780 },
    { month: "Jul", docs: 540, risks: 9, automatedHours: 2100 },
  ]

  const handleGenerateReport = () => {
    setIsGenerating(true)
    setReportReady(false)
    setGenerationProgress(10)
    setCurrentStep("Initializing AI Vector Database Query...")

    setTimeout(() => {
      setGenerationProgress(40)
      setCurrentStep("Extracting Departmental KPI Metrics & Compliance Telemetry...")
    }, 600)

    setTimeout(() => {
      setGenerationProgress(75)
      setCurrentStep("Synthesizing Executive Insights & Chart Visualizations...")
    }, 1200)

    setTimeout(() => {
      setGenerationProgress(100)
      setCurrentStep("Report Rendered Successfully!")
      setIsGenerating(false)
      setReportReady(true)
    }, 1800)
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-emerald-900/10 via-teal-900/5 to-slate-900/10 border border-emerald-500/20 glass-panel">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30 preserve-3d animate-float-3d">
            <FileBarChart2 className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Auto-Generated Executive Reports
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                AI Analytics Engine
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Instant synthesis of enterprise legal compliance, team throughput, and financial contract obligations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Sparkles className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
            {isGenerating ? "Synthesizing Report..." : "Generate New Executive Report"}
          </button>
        </div>
      </div>

      {/* Generation Progress Overlay (If active) */}
      {isGenerating && (
        <div className="p-6 rounded-3xl bg-white border border-emerald-200 shadow-xl space-y-3 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-emerald-700 uppercase flex items-center gap-2">
              <Zap className="h-4 w-4 animate-bounce" /> {currentStep}
            </span>
            <span className="text-xs font-bold font-mono text-emerald-800">{generationProgress}%</span>
          </div>

          <div className="w-full h-3 bg-emerald-50 rounded-full overflow-hidden border border-emerald-100">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
              style={{ width: `${generationProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Configuration Cards & Template Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Template Selector */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm card-3d">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
              <Layers className="h-4 w-4" /> 1. Report Template
            </span>
            <span className="text-[10px] font-semibold text-slate-400">Preset Architecture</span>
          </div>

          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none cursor-pointer"
          >
            <option value="compliance">Enterprise Legal Compliance & Risk Audit</option>
            <option value="executive">Executive Weekly AI Productivity Digest</option>
            <option value="financial">Vendor Contract Expiry & Financial Obligations</option>
            <option value="workflow">Departmental Document Workflow Telemetry</option>
          </select>

          <p className="text-xs text-slate-500 mt-3">
            Includes executive summaries, high-risk clause counts, and auto-generated data charts.
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm card-3d">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-600 flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> 2. Time Horizon
            </span>
            <span className="text-[10px] font-semibold text-teal-700 px-2 py-0.5 rounded-md bg-teal-50">
              Live Data Range
            </span>
          </div>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none cursor-pointer"
          >
            <option value="q3_2026">Q3 2026 (July - September)</option>
            <option value="ytd_2026">Year to Date 2026</option>
            <option value="month">Current Month (July 2026)</option>
            <option value="week">Past 7 Days</option>
          </select>

          <p className="text-xs text-slate-500 mt-3">
            Filtering 540 processed enterprise documents across 3 active workspaces.
          </p>
        </div>

        {/* Auto-Delivery Schedule */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm card-3d">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> 3. Auto-Schedule Email
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Scheduled
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-center justify-between">
            <span className="font-semibold">Every Monday at 08:00 AM EST</span>
            <button 
              onClick={() => alert("Report email schedule updated.")}
              className="text-[11px] font-bold text-purple-700 underline cursor-pointer"
            >
              Modify
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-3">
            Recipients: <strong>board-members@ornitech.ai</strong>
          </p>
        </div>
      </div>

      {/* Generated Report Output View (When Ready) */}
      {reportReady && (
        <div className="space-y-6">
          {/* Executive Summary & KPI Stats Grid */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-emerald-600">
                  CONFIDENTIAL EXECUTIVE REPORT • ORNITECH AI
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  Q3 Enterprise Compliance & Document Throughput Audit
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Generated on July 19, 2026 for Chief Technology Officer & Legal Steering Committee
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => alert("Downloading Report CSV...")}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Export CSV
                </button>
                <button 
                  onClick={() => alert("Downloading PDF Report...")}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  <Download className="h-4 w-4" /> Download PDF
                </button>
              </div>
            </div>

            {/* KPI Cards inside Report */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-semibold text-slate-500">Total Processed Documents</div>
                <div className="text-3xl font-black text-slate-900 mt-1">540 Docs</div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" /> +38% MoM Acceleration
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-semibold text-slate-500">Legal Discrepancies Prevented</div>
                <div className="text-3xl font-black text-slate-900 mt-1">118 Risks</div>
                <div className="text-[11px] text-purple-600 font-semibold mt-1">
                  9 Audit Escalations Flagged
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-semibold text-slate-500">Hours Automated by AI</div>
                <div className="text-3xl font-black text-slate-900 mt-1">2,100 Hours</div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                  Estimated $168,000 Cost Saved
                </div>
              </div>
            </div>

            {/* Interactive Recharts Analytics Visualization */}
            <div className="pt-4">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <PieChart className="h-4 w-4 text-emerald-600" /> Monthly Document Throughput vs Risk Mitigation (2026)
              </h3>

              <div className="h-72 w-full pt-2 min-h-[250px] relative">
                <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                  <AreaChart data={analyticsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorDocs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRisks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="docs" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorDocs)" name="Processed Documents" />
                    <Area type="monotone" dataKey="risks" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRisks)" name="Risk Flags Identified" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Executive Synthesis Narrative */}
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 text-xs text-slate-800 space-y-2">
              <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-emerald-600" /> AI Executive Synthesis Summary
              </h4>
              <p className="leading-relaxed text-slate-700">
                During Q3 2026, document processing throughput expanded by 38% month-over-month. The legal AI vector engine automatically flagged 118 clause discrepancies across vendor contracts, saving an estimated 2,100 legal review hours. Zero non-compliance breaches were recorded across all enterprise operations.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
