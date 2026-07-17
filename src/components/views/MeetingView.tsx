import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Volume2, CheckCircle2, User, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const mockMeetings = [
  {
    name: "vite_6_migration_sync.mp3",
    length: "14:32",
    speakers: "Sarah (Lead Dev), John (PM)",
    takeaways: [
      "Vite 6 introduces environment API changes which require standard updates in our node middleware layers.",
      "The scaling is prioritized for this sprint to avoid technical debt before building the custom dashboard widgets.",
      "Vite CSS plugins will handle Tailwind CSS v4 assets compilation directly without PostCSS configs."
    ],
    actions: [
      { task: "Update Vite version inside package.json to latest stable", assignee: "Sarah", priority: "High", due: "July 18" },
      { task: "Verify build pipelines compile index.css without errors", assignee: "Sarah", priority: "High", due: "July 19" },
      { task: "Run test benchmarks on local client HMR delays", assignee: "John", priority: "Medium", due: "July 20" },
    ],
    transcript: [
      { speaker: "John (PM)", text: "Let's kick off the migration sync. Sarah, what is the status of the Vite 6 migration setup?" },
      { speaker: "Sarah (Lead Dev)", text: "The initial tests are looking good. The main change is how the Environment API handles client bundles. We will need to adjust our middleware in server/dev.ts." },
      { speaker: "John (PM)", text: "Excellent. Can we get that finished by Friday so the UI dashboard doesn't run into compiling blockers?" },
      { speaker: "Sarah (Lead Dev)", text: "Yes, I will commit the package.json upgrades today and verify the CSS builds compile correctly." }
    ]
  },
  {
    name: "q3_marketing_brainstorm.wav",
    length: "28:15",
    speakers: "Alice (Director), Mark (Growth)",
    takeaways: [
      "Focus organic outreach on AI-accelerated workflows to showcase vector indexing speed.",
      "Collaborate with engineering to log performance benchmarks (e.g. 150ms latency query checks).",
      "Launch three short promotional videos highlighting the OCR drag-and-drop character extraction interface."
    ],
    actions: [
      { task: "Schedule video production reviews for OCR layouts", assignee: "Alice", priority: "Medium", due: "July 22" },
      { task: "Draft copy highlighting the 150ms similarity search speeds", assignee: "Mark", priority: "High", due: "July 20" }
    ],
    transcript: [
      { speaker: "Alice (Director)", text: "Mark, what's our main hook for the Q3 campaign launch?" },
      { speaker: "Mark (Growth)", text: "We need to focus on productivity. Companies lose hours scanning files. Highlighting the OCR scanner and how search results load in under 150ms will be huge." },
      { speaker: "Alice (Director)", text: "Agreed. Let's make sure we show the side-by-side comparison of the scanner output in our videos." }
    ]
  }
]

export function MeetingView() {
  const [selectedMeeting, setSelectedMeeting] = useState<typeof mockMeetings[0] | null>(null)
  const [status, setStatus] = useState<"idle" | "transcribing" | "completed">("idle")
  const [activeTab, setActiveTab] = useState<"takeaways" | "actions" | "transcript">("takeaways")
  const [waveformBars, setWaveformBars] = useState<number[]>([])

  // Initialize a nice mock waveform values set
  useEffect(() => {
    const bars = Array.from({ length: 30 }, () => Math.floor(Math.random() * 40) + 10)
    setWaveformBars(bars)
  }, [])

  // Animate waveform values when transcribing
  useEffect(() => {
    if (status !== "transcribing") return
    const interval = setInterval(() => {
      setWaveformBars(Array.from({ length: 30 }, () => Math.floor(Math.random() * 45) + 5))
    }, 150)
    return () => clearInterval(interval)
  }, [status])

  const handleSelectMeeting = (meet: typeof mockMeetings[0]) => {
    setSelectedMeeting(meet)
    setStatus("transcribing")
    
    // Simulate transcribing delays
    setTimeout(() => {
      setStatus("completed")
      setActiveTab("takeaways")
    }, 3000)
  }

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-neutral-850 tracking-tight flex items-center gap-3">
          <Volume2 className="h-7 w-7 text-rose-600 animate-pulse-glow" />
          Meeting Summarizer
        </h1>
        <p className="text-neutral-500 mt-1">
          Upload calls or voice records. AI transcribes conversation channels, segments speaker nodes, and outlines action requirements.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {status === "idle" ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Main File Selector Box */}
            <div className="glass-panel p-8 rounded-2xl border-slate-200/80 md:col-span-2 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px] border-dashed border-2 border-slate-250 hover:border-rose-500/50 transition-colors">
              <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                <Volume2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-neutral-850 text-base">Ingest Call Audio</h3>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Drag and drop audio formats here. Supports MP3, WAV, M4A records.
                </p>
              </div>
            </div>

            {/* Simulated Demo List */}
            <div className="glass-panel p-6 rounded-2xl border-slate-200/80 flex flex-col space-y-4">
              <div>
                <h3 className="font-bold text-neutral-850 text-sm uppercase tracking-wider font-mono">Recorded Sessions</h3>
                <p className="text-[10px] text-neutral-500 mt-0.5">Click to run transcription analytics on previous syncs.</p>
              </div>

              <div className="space-y-3 flex-1 flex flex-col justify-center">
                {mockMeetings.map((meet) => (
                  <button
                    key={meet.name}
                    onClick={() => handleSelectMeeting(meet)}
                    className="p-4 rounded-xl bg-slate-100/85 border border-slate-200/60 hover:border-rose-500/50 text-left hover:bg-slate-200/60 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="overflow-hidden space-y-1 flex-1 pr-2">
                      <span className="text-xs font-bold text-neutral-850 block truncate">{meet.name}</span>
                      <span className="text-[9px] text-neutral-500 block truncate">{meet.speakers}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono text-neutral-450 group-hover:text-rose-600 transition-colors">
                      <Clock className="h-3 w-3" />
                      {meet.length}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : status === "transcribing" ? (
          <motion.div
            key="transcribing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-panel p-10 rounded-2xl border-slate-200/80 flex flex-col items-center justify-center space-y-6"
          >
            {/* Waves */}
            <div className="h-20 flex items-center gap-1">
              {waveformBars.map((val, i) => (
                <div
                  key={i}
                  className="w-1 bg-rose-500 rounded-full transition-all duration-150"
                  style={{ height: `${val}%` }}
                />
              ))}
            </div>

            <div className="text-center space-y-2 w-full max-w-sm">
              <h3 className="font-bold text-neutral-850">Segmenting Speakers & Transcribing</h3>
              <p className="text-xs text-neutral-500 font-mono">
                Ingesting "{selectedMeeting?.name}"... Running speech-to-text filters...
              </p>
              <div className="w-full h-1 bg-slate-205 rounded-full overflow-hidden mt-3">
                <div className="h-full bg-rose-500 animate-pulse-glow" style={{ width: "60%" }} />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="completed"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-6"
          >
            {/* Sidebar Details Info */}
            <div className="glass-panel p-5 rounded-2xl border-slate-200/80 h-fit space-y-4 lg:col-span-1">
              <div>
                <span className="text-[10px] font-mono text-rose-600 font-bold uppercase tracking-wider">Session Parameters</span>
                <h3 className="font-bold text-neutral-850 text-sm mt-1">{selectedMeeting?.name}</h3>
              </div>

              <div className="space-y-3 pt-2 text-xs border-t border-slate-200">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Duration:</span>
                  <span className="font-mono text-neutral-800">{selectedMeeting?.length}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-neutral-500 block">Speakers:</span>
                  <span className="text-neutral-800 block font-medium">{selectedMeeting?.speakers}</span>
                </div>
              </div>

              <button
                onClick={() => setStatus("idle")}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-205 text-neutral-800 font-semibold text-xs tracking-wider transition-colors cursor-pointer"
              >
                Summarize Another
              </button>
            </div>

            {/* Main Tabs Dashboard */}
            <div className="glass-panel rounded-2xl border border-slate-200/80 flex flex-col h-[520px] lg:col-span-3 overflow-hidden">
              {/* Tab Header Selector */}
              <div className="flex border-b border-slate-200 bg-slate-100/40 shrink-0">
                {[
                  { id: "takeaways", label: "Takeaways" },
                  { id: "actions", label: "Action Items" },
                  { id: "transcript", label: "Full Transcript" }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={cn(
                      "flex-1 py-4 text-xs font-semibold uppercase tracking-wider border-b-2 font-mono transition-all cursor-pointer",
                      activeTab === t.id
                        ? "border-rose-500 text-rose-600 bg-rose-50/60"
                        : "border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-slate-100"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="flex-1 p-6 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {activeTab === "takeaways" && (
                    <motion.div
                      key="takeaways"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      {selectedMeeting?.takeaways.map((take, i) => (
                        <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200/65 flex gap-3 items-start">
                          <CheckCircle2 className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                          <p className="text-xs text-neutral-700 leading-relaxed">{take}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {activeTab === "actions" && (
                    <motion.div
                      key="actions"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-250 text-neutral-500 font-mono font-bold uppercase tracking-wider">
                              <th className="py-2.5 px-3">Task Action</th>
                              <th className="py-2.5 px-3">Owner</th>
                              <th className="py-2.5 px-3">Priority</th>
                              <th className="py-2.5 px-3">Due</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedMeeting?.actions.map((act, i) => (
                              <tr key={i} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                                <td className="py-3.5 px-3 font-medium text-neutral-850">{act.task}</td>
                                <td className="py-3.5 px-3 text-neutral-600 font-medium">
                                  <span className="inline-flex items-center gap-1.5">
                                    <User className="h-3 w-3 text-rose-600" />
                                    {act.assignee}
                                  </span>
                                </td>
                                <td className="py-3.5 px-3">
                                  <span className={cn(
                                    "px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase font-mono",
                                    act.priority === "High" 
                                      ? "bg-rose-50 border border-rose-100 text-rose-650" 
                                      : "bg-amber-50 border border-amber-100 text-amber-650"
                                  )}>
                                    {act.priority}
                                  </span>
                                </td>
                                <td className="py-3.5 px-3 text-neutral-500 font-mono text-[10px]">{act.due}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "transcript" && (
                    <motion.div
                      key="transcript"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4 font-mono text-xs"
                    >
                      {selectedMeeting?.transcript.map((line, i) => (
                        <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-rose-600 font-bold border-b border-slate-200/60 pb-1">
                            <span>{line.speaker}</span>
                            <span>Segment #{i + 1}</span>
                          </div>
                          <p className="text-neutral-600 leading-relaxed pt-1.5">{line.text}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
