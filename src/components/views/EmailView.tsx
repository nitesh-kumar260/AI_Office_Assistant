import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Sparkles, Copy, Check, RefreshCw, Send, Settings, User } from "lucide-react"
import { cn } from "@/lib/utils"

export function EmailView() {
  const [recipient, setRecipient] = useState("Engineering Team")
  const [keyPoints, setKeyPoints] = useState("Remind them about the upcoming Friday deadline for scaling the vector database pipeline. Note that we need to test index latency below 150ms.")
  const [tone, setTone] = useState<"professional" | "casual" | "urgent" | "friendly">("professional")
  const [length, setLength] = useState<"short" | "detailed">("detailed")
  const [isGenerating, setIsGenerating] = useState(false)
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [copied, setCopied] = useState(false)
  const [sent, setSent] = useState(false)

  const handleGenerate = () => {
    if (!keyPoints.trim() || isGenerating) return
    setIsGenerating(true)
    setSent(false)

    // Simulate AI drafting response
    setTimeout(() => {
      let subj = ""
      let bdy = ""

      if (tone === "professional") {
        subj = `Action Required: Vector Database Pipeline Scaling & Latency Testing`
        bdy = `Hi Team,\n\nThis is a quick reminder regarding our scheduled milestones for this week. Please ensure that the vector database pipeline scaling is completed ahead of our Friday deadline.\n\nSpecifically, we need to guarantee that latency tests verify response queries remain under the 150ms threshold. Let me know if you run into any blocks or need additional server partition allocations.\n\nBest regards,\nOperations Coordinator`
      } else if (tone === "urgent") {
        subj = `URGENT: Vector Pipeline Deadline & Latency Thresholds`
        bdy = `Team,\n\nWe have a critical deadline this Friday to scale the vector database pipeline. We must verify that search queries register under 150ms immediately.\n\nAny delays on this will block the dashboard integration, so please prioritize this testing sequence today. Report any blockers directly on Slack.\n\nThanks,\nOps Center`
      } else if (tone === "casual") {
        subj = `Quick heads-up: Friday vector pipeline check-in`
        bdy = `Hey everyone,\n\nHope your week is going well! Just sending a friendly nudge about scaling the vector database pipeline by Friday.\n\nLet's make sure we run some latency checks to keep responses under 150ms. Shout if you need a hand with any database stuff!\n\nCheers,\nOps`
      } else {
        subj = `Friendly Reminder: Friday Vector Database Milestones`
        bdy = `Hi team!\n\nJust wrapping up some weekly checklists and wanted to send a quick reminder about wrapping up our vector database pipeline scaling by Friday. \n\nWe are aiming to hit a query latency of under 150ms to keep our dashboard smooth. You all are doing amazing work, let me know if I can support in any way!\n\nHave a great afternoon,\nOps Manager`
      }

      if (length === "short") {
        bdy = bdy.split("\n\n").slice(0, -1).join("\n\n") + `\n\nThanks!`
      }

      setSubject(subj)
      setBody(bdy)
      setIsGenerating(false)
    }, 1200)
  }

  const handleCopy = () => {
    const fullText = `Subject: ${subject}\n\n${body}`
    navigator.clipboard.writeText(fullText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSend = () => {
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-neutral-850 tracking-tight flex items-center gap-3">
          <Mail className="h-7 w-7 text-amber-600 animate-pulse-glow" />
          AI Email Drafter
        </h1>
        <p className="text-neutral-500 mt-1">
          Compose drafts driven by contextual inputs. AI builds structure, refines tone, and structures key points instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Input Configuration Panel */}
        <div className="glass-panel p-6 rounded-2xl border-slate-200/80 lg:col-span-2 space-y-6">
          <h3 className="font-bold text-neutral-850 text-sm uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-200/85 pb-3">
            <Settings className="h-4 w-4 text-neutral-400" />
            Parameters
          </h3>

          <div className="space-y-4">
            {/* Recipient */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-500 font-mono block">Recipient</label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 h-4 w-4 text-neutral-450 z-10" />
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g. Sales Team, CEO"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-250 text-neutral-800 text-xs focus:outline-none focus:border-amber-500/60"
                />
              </div>
            </div>

            {/* Key points */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-500 font-mono block">Key Points / Context</label>
              <textarea
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                placeholder="What details should be mentioned in this dispatch?"
                className="w-full h-32 p-3.5 rounded-xl bg-white border border-slate-250 text-neutral-800 text-xs focus:outline-none focus:border-amber-500/60 resize-none leading-relaxed"
              />
            </div>

            {/* Tone Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-500 font-mono block">Tone</label>
              <div className="grid grid-cols-2 gap-2">
                {(["professional", "casual", "urgent", "friendly"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={cn(
                      "py-2 px-3 rounded-lg border text-[10px] font-semibold tracking-wider uppercase transition-all cursor-pointer",
                      tone === t
                        ? "bg-amber-50 border-amber-200 text-amber-700"
                        : "bg-slate-100/80 border-slate-200/60 text-neutral-600 hover:bg-slate-200/60"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Length */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-500 font-mono block">Length</label>
              <div className="flex gap-2">
                {(["short", "detailed"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLength(l)}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-lg border text-[10px] font-semibold tracking-wider uppercase transition-all cursor-pointer",
                      length === l
                        ? "bg-amber-50 border-amber-200 text-amber-700"
                        : "bg-slate-100/80 border-slate-200/60 text-neutral-600 hover:bg-slate-200/60"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !keyPoints.trim()}
            className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-amber-500/10 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="h-4.5 w-4.5" />
            Generate Draft
          </button>
        </div>

        {/* Right Preview & Action Panel */}
        <div className="glass-panel p-6 rounded-2xl border-slate-200/80 lg:col-span-3 h-[490px] flex flex-col">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center space-y-4"
              >
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <span className="w-12 h-12 rounded-full border-2 border-amber-500/10 border-t-amber-600 animate-spin absolute" />
                  <Mail className="h-5 w-5 text-amber-600" />
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-neutral-850">Composing Draft</h4>
                  <p className="text-xs text-neutral-500 font-mono">Synthesizing tone parameters and references...</p>
                </div>
              </motion.div>
            ) : subject ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col justify-between h-full"
              >
                <div className="space-y-4 flex-1 flex flex-col">
                  {/* Top Bar actions */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 shrink-0">
                    <span className="text-xs font-semibold text-neutral-500 uppercase font-mono">Draft Composition</span>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopy}
                        className="p-1.5 rounded-lg bg-slate-100 text-neutral-500 hover:text-neutral-950 transition-colors cursor-pointer"
                        title="Copy to Clipboard"
                      >
                        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={handleGenerate}
                        className="p-1.5 rounded-lg bg-slate-100 text-neutral-500 hover:text-neutral-955 transition-colors cursor-pointer"
                        title="Re-generate"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Mail Editor */}
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex gap-2 items-center text-xs text-neutral-600 font-mono">
                      <span className="text-neutral-400 font-bold">Subject:</span>
                      <span className="text-neutral-850 font-bold">{subject}</span>
                    </div>

                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="w-full h-64 p-4 rounded-xl bg-white border border-slate-250 text-neutral-850 text-xs font-mono focus:outline-none focus:border-amber-500/50 resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* Footer Send */}
                <div className="mt-4 pt-4 border-t border-slate-200 flex shrink-0">
                  <button
                    onClick={handleSend}
                    className={cn(
                      "w-full py-3 rounded-xl font-semibold text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg",
                      sent 
                        ? "bg-emerald-50 border border-emerald-100 text-emerald-650"
                        : "bg-slate-100 hover:bg-slate-200/60 border border-slate-200 text-neutral-650"
                    )}
                  >
                    {sent ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Dispatched Successfully
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        Dispatch Email
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="intro"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-neutral-500">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-neutral-850">Preview Dispatch Panel</h3>
                  <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
                    Set up your email parameters in the configurations panel and tap "Generate Draft" to construct a professional draft.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
