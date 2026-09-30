import React, { useState } from "react"
import { 
  FileCheck2, 
  Sparkles, 
  AlertOctagon, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  Scale, 
  Download, 
  Send, 
  MessageSquare, 
  Clock,
  Briefcase
} from "lucide-react"

export function ContractSummarizationView() {
  const [selectedContract, setSelectedContract] = useState("cloud_sla")
  const [userQuestion, setUserQuestion] = useState("")
  const [chatHistory, setChatHistory] = useState<{ sender: "user" | "ai"; text: string }[]>([
    {
      sender: "ai",
      text: "I have fully ingested and analyzed the Cloud Infrastructure & SLA Contract (2026-2028). You can ask me any question about clauses, indemnities, liability caps, or renewal dates."
    }
  ])

  const contractsData = {
    cloud_sla: {
      title: "Cloud Infrastructure & SLA Agreement",
      parties: ["Ornitech Systems Corp", "Apex Cloud Solutions Inc."],
      effectiveDate: "August 1, 2026",
      expirationDate: "July 31, 2028 (2 Years)",
      renewalNotice: "60 Days Prior to Expiration",
      contractValue: "$480,000 USD / Year",
      overallRisk: 78,
      riskLevel: "Moderate",
      jurisdiction: "Delaware, USA",
      clauses: [
        {
          name: "1. Service Level Agreement (SLA) & Uptime Guarantee",
          summary: "99.99% quarterly uptime requirement with tier-based service credits for downtime exceeding 15 minutes.",
          risk: "Low",
          recommendation: "Favorable SLA standard. Verify automated downtime monitoring telemetry."
        },
        {
          name: "2. Limitation of Liability Cap",
          summary: "Provider aggregate liability capped at 12 months' fees ($480k), excluding gross negligence and data breaches.",
          risk: "Medium",
          recommendation: "Ensure cyber insurance policy covers potential data breach liabilities exceeding $480k."
        },
        {
          name: "3. Intellectual Property Rights",
          summary: "Client retains all ownership of custom workflows, trained AI embeddings, and proprietary data.",
          risk: "Low",
          recommendation: "Strong IP protection clause included. Standard non-exclusive usage."
        },
        {
          name: "4. Unilateral Price Escalation",
          summary: "Provider reserves right to increase annual subscription fees by up to 10% upon annual renewal.",
          risk: "High",
          recommendation: "Negotiate a fixed price cap of max 3% to prevent unpredictable operational cost expansion."
        }
      ]
    },
    nda_enterprise: {
      title: "Mutual Non-Disclosure & IP Protection NDA",
      parties: ["Ornitech Intelligence Labs", "Vanguard AI Technologies"],
      effectiveDate: "January 15, 2026",
      expirationDate: "January 15, 2029 (3 Years)",
      renewalNotice: "N/A - Standard Term",
      contractValue: "N/A (Mutual NDA)",
      overallRisk: 92,
      riskLevel: "Low",
      jurisdiction: "California, USA",
      clauses: [
        {
          name: "1. Definition of Confidential Info",
          summary: "Includes source code, AI weight parameters, prompt architectures, customer metrics, and business roadmaps.",
          risk: "Low",
          recommendation: "Broad definition protects all trade secrets effectively."
        },
        {
          name: "2. Non-Solicitation of AI Engineers",
          summary: "Both parties agree not to solicit or hire key engineering staff during contract and 12 months after.",
          risk: "Medium",
          recommendation: "Check local state enforceability regarding non-compete/non-solicit terms."
        }
      ]
    }
  }

  const current = contractsData[selectedContract as keyof typeof contractsData] || contractsData.cloud_sla

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userQuestion.trim()) return

    const questionText = userQuestion
    setUserQuestion("")

    setChatHistory(prev => [
      ...prev,
      { sender: "user", text: questionText },
      { 
        sender: "ai", 
        text: `Based on Section 4 & Section 15 of ${current.title}, ${
          questionText.toLowerCase().includes("penalty") || questionText.toLowerCase().includes("cost") || questionText.toLowerCase().includes("price")
            ? "The annual fee is $480,000 USD with a potential 10% price escalation clause upon renewal. Late payments incur a 1.5% monthly penalty."
            : questionText.toLowerCase().includes("terminate") || questionText.toLowerCase().includes("cancel")
            ? "Termination requires written notice 60 days prior to the expiration date. Early termination without cause incurs a 25% remaining contract fee."
            : "The contract contains standard enterprise safeguards with explicit IP retention, Delaware jurisdiction, and a 99.99% uptime SLA."
        }`
      }
    ])
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-900/10 via-indigo-900/5 to-slate-900/10 border border-purple-500/20 glass-panel">
        <div className="flex items-start gap-4 min-w-0">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 preserve-3d animate-float-3d shrink-0">
            <FileCheck2 className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                AI Contract Summarization & Risk Digest
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-100 text-purple-700 border border-purple-200 shrink-0">
                Legal AI Engine
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Automated legal contract parsing, financial obligation extraction, and risk scorecard generation.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto shrink-0">
          <select
            value={selectedContract}
            onChange={(e) => setSelectedContract(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-sm outline-none cursor-pointer"
          >
            <option value="cloud_sla">Cloud SLA & Infrastructure Agreement</option>
            <option value="nda_enterprise">Mutual NDA & IP Protection</option>
          </select>

          <button 
            onClick={() => alert("Exporting Executive Summary Deck (PDF)...")}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Download className="h-4 w-4 shrink-0" /> Download Summary Deck
          </button>
        </div>
      </div>

      {/* Contract Executive Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Risk Radar Meter Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between card-3d">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
              <Scale className="h-4 w-4" /> Legal Risk Scorecard
            </span>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
              current.overallRisk > 85 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            }`}>
              {current.riskLevel} Risk
            </span>
          </div>

          <div className="my-4 sm:my-6 flex items-center gap-3 sm:gap-5">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl sm:text-2xl shadow-xl shadow-blue-500/20">
              {current.overallRisk}
              <span className="text-[10px] sm:text-xs font-normal text-blue-200">/100</span>
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900">Safety Index Rating</div>
              <div className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">
                Parsed across 4 critical risk dimensions: Liability, Financial Escalation, SLA, and IP Retention.
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Jurisdiction: <strong>{current.jurisdiction}</strong></span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Checked
            </span>
          </div>
        </div>

        {/* Financial Commitments Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between card-3d">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" /> Financial Terms
            </span>
            <span className="text-[10px] font-semibold text-slate-400">Fixed + Variable</span>
          </div>

          <div className="my-4 space-y-2">
            <div className="text-2xl font-black text-slate-900">{current.contractValue}</div>
            <div className="text-xs text-slate-500">
              Annual Recurring License Fee paid in quarterly installments.
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Watch out: Max 10% price escalation clause active upon renewal.</span>
          </div>
        </div>

        {/* Key Dates Timeline Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between card-3d">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> Critical Milestones
            </span>
            <span className="text-[10px] font-semibold text-purple-700 px-2 py-0.5 rounded-md bg-purple-50">
              Active Term
            </span>
          </div>

          <div className="my-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-blue-500" /> Effective Date:
              </span>
              <span className="font-bold text-slate-800">{current.effectiveDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-rose-500" /> Expiration:
              </span>
              <span className="font-bold text-slate-800">{current.expirationDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-500" /> Notice Window:
              </span>
              <span className="font-bold text-amber-700">{current.renewalNotice}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Parties: {current.parties.join(" ↔ ")}
          </div>
        </div>
      </div>

      {/* Main Grid: Clauses Breakdown & AI Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clause Extraction Table (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-blue-600" /> Key Legal Clauses & Action Items
            </h2>
            <span className="text-xs text-slate-400">{current.clauses.length} Critical Clauses Extracted</span>
          </div>

          {current.clauses.map((clause, idx) => (
            <div key={idx} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">{clause.name}</h3>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  clause.risk === "High" ? "bg-rose-100 text-rose-700" :
                  clause.risk === "Medium" ? "bg-amber-100 text-amber-700" :
                  "bg-emerald-100 text-emerald-700"
                }`}>
                  {clause.risk} Risk
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                {clause.summary}
              </p>

              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold mr-1">AI Recommendation:</span>
                  {clause.recommendation}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Contract Assistant Chat Widget (1 Column) */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between h-[520px]">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Contract Copilot</h3>
                  <p className="text-[11px] text-slate-400">Instant answers to legal queries</p>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Chat Messages scroll area */}
            <div className="mt-4 space-y-3 overflow-y-auto max-h-[340px] pr-1">
              {chatHistory.map((msg, i) => (
                <div 
                  key={i} 
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === "user" 
                      ? "bg-blue-600 text-white ml-6 rounded-br-none" 
                      : "bg-slate-100 text-slate-800 mr-6 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
          </div>

          {/* Ask Input Form */}
          <form onSubmit={handleAskQuestion} className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              placeholder="Ask about penalties, IP, or renewal..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
            <button 
              type="submit"
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
