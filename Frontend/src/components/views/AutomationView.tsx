import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Workflow, Cpu, Play, ArrowRight, CheckCircle2, AlertCircle, ToggleLeft, ToggleRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Node {
  id: string
  label: string
  type: "trigger" | "process" | "ai" | "action"
  desc: string
  active: boolean
}

export function AutomationView() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: "1", label: "Document Uploaded", type: "trigger", desc: "Listens for folder inclusions", active: true },
    { id: "2", label: "OCR Scan Extraction", type: "process", desc: "Converts images to raw characters", active: true },
    { id: "3", label: "Gemini Summary Engine", type: "ai", desc: "Extracts key actions & summaries", active: true },
    { id: "4", label: "Auto Email Dispatch", type: "action", desc: "Mails draft to coordinator", active: true },
  ])

  const [activeStep, setActiveStep] = useState<number>(-1)
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const handleToggleNode = (id: string) => {
    if (isRunning) return
    setNodes(nodes.map(n => n.id === id ? { ...n, active: !n.active } : n))
  }

  const handleRunWorkflow = () => {
    if (isRunning) return
    setIsRunning(true)
    setLogs([])
    setActiveStep(0)

    const activeNodes = nodes.filter(n => n.active)
    if (activeNodes.length === 0) {
      setIsRunning(false)
      setActiveStep(-1)
      return
    }

    const steps = activeNodes.map((n, idx) => ({
      node: n,
      log: `Executing Node [${n.label}]... SUCCESS.`,
      delay: (idx + 1) * 1500
    }))

    setLogs([`Starting execution of workflow: "Ingestion Pipeline"`])

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setActiveStep(idx + 1)
        setLogs(prev => [...prev, step.log])

        if (idx === steps.length - 1) {
          setTimeout(() => {
            setIsRunning(false)
            setActiveStep(-1)
            setLogs(prev => [...prev, "Workflow run completed. 0 errors, 1 run logged."])
          }, 1000)
        }
      }, step.delay)
    })
  }

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-850 tracking-tight flex items-center gap-3">
            <Workflow className="h-7 w-7 text-purple-600 animate-pulse-glow" />
            Workflow Engine
          </h1>
          <p className="text-neutral-500 mt-1">
            Build serverless automation paths. Connect document events directly to translation nodes, OCR queues, and model endpoints.
          </p>
        </div>

        <button
          onClick={handleRunWorkflow}
          disabled={isRunning || nodes.filter(n => n.active).length === 0}
          className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
        >
          <Play className="h-4 w-4" />
          Test Pipeline
        </button>
      </div>

      {/* Visual Canvas */}
      <div className="glass-panel p-8 rounded-2xl border-slate-200/80 relative min-h-[300px] flex flex-col justify-center overflow-x-auto">
        {/* Holographic background grid */}
        <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row items-center justify-start lg:justify-center gap-8 lg:gap-4 w-full min-w-max py-4">
          {nodes.map((node, index) => {
            const isActive = node.active
            const isProcessing = isRunning && index === activeStep
            const isCompleted = isRunning && index < activeStep
            
            return (
              <div key={node.id} className="flex flex-col lg:flex-row items-center justify-center shrink-0 w-full lg:w-auto">
                {/* Node Box */}
                <button
                  onClick={() => handleToggleNode(node.id)}
                  disabled={isRunning}
                  className={cn(
                    "w-60 p-5 rounded-2xl text-left border transition-all relative flex flex-col justify-between cursor-pointer",
                    !isActive 
                      ? "bg-slate-100/40 border-slate-200/60 opacity-55 text-neutral-450"
                      : isProcessing
                      ? "bg-purple-50 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.15)] text-neutral-850"
                      : isCompleted
                      ? "bg-green-50 border-green-300 text-neutral-850"
                      : "bg-white border border-slate-200 text-neutral-700 hover:border-slate-350 hover:bg-slate-50/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn(
                       "text-[9px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border",
                      !isActive 
                        ? "border-slate-200 bg-slate-100 text-neutral-400"
                        : node.type === "trigger"
                        ? "border-blue-200 bg-blue-50 text-blue-650"
                        : node.type === "process"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-650"
                        : node.type === "ai"
                        ? "border-purple-200 bg-purple-50 text-purple-650"
                        : "border-amber-200 bg-amber-50 text-amber-650"
                    )}>
                      {node.type}
                    </span>

                    {/* Toggle Indicator */}
                    {!isRunning && (
                      <div className="text-neutral-400 hover:text-neutral-700 transition-colors">
                        {isActive ? <ToggleRight className="h-5 w-5 text-purple-600" /> : <ToggleLeft className="h-5 w-5" />}
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <h4 className={cn(
                      "text-xs font-bold transition-colors",
                      isActive ? "text-neutral-850" : "text-neutral-450"
                    )}>
                      {node.label}
                    </h4>
                    <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed">
                      {node.desc}
                    </p>
                  </div>

                  {/* Processing Status Text */}
                  {isProcessing && (
                    <div className="absolute inset-x-0 bottom-2 text-center text-[8px] font-mono text-purple-600 font-bold uppercase animate-pulse">
                      Processing Node...
                    </div>
                  )}
                </button>

                {/* Connection Arrow */}
                {index < nodes.length - 1 && (
                  <div className={cn(
                    "flex items-center justify-center transition-colors shrink-0",
                    "my-2 lg:my-0 lg:mx-4",
                    !isActive || !nodes[index + 1].active
                      ? "text-neutral-300"
                      : isCompleted
                      ? "text-green-600"
                      : "text-neutral-400"
                  )}>
                    <ArrowRight className={cn(
                      "h-5 w-5 transition-transform",
                      "rotate-90 lg:rotate-0"
                    )} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Execution Logs */}
      <div className="glass-panel p-6 rounded-2xl border-slate-200/80 space-y-4">
        <h3 className="font-bold text-neutral-850 text-sm uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-200 pb-3">
          <Cpu className="h-4 w-4 text-neutral-500 animate-pulse" />
          Execution Log Output
        </h3>

        <div className="p-4 rounded-xl bg-white border border-slate-200 h-48 overflow-y-auto space-y-2 font-mono text-xs text-neutral-600">
          <AnimatePresence>
            {logs.length > 0 ? (
              logs.map((log, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex items-start gap-2",
                    log.includes("SUCCESS") ? "text-green-600 animate-fade-in" : log.includes("completed") ? "text-purple-600 font-bold" : "text-neutral-500"
                  )}
                >
                  {log.includes("SUCCESS") ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  )}
                  <span>{log}</span>
                </motion.div>
              ))
            ) : (
              <div className="text-center text-neutral-400 py-12">
                Awaiting test trigger. Select "Test Pipeline" above to run diagnostic simulations.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
