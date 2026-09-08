import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Scan, Upload, FileText, Check, Copy, RefreshCw, Layers } from "lucide-react"
import { cn } from "@/lib/utils"

const mockDocs = [
  {
    name: "invoice_9482.png",
    text: "INVOICE #9482\nDate: July 12, 2026\nVendor: Ornitech Solutions Ltd.\nClient: Acme Corporation\n\nLine Items:\n1. Cloud Vector Storage Module - Qty 1 - $450.00\n2. Pipeline Automation Consulting - Qty 2 hrs - $300.00\n\nTotal Due: $750.00\nPayment Terms: Net 30 days\nStatus: Pending Payment\nTax ID: ORN-93-8472",
  },
  {
    name: "service_agreement.pdf",
    text: "SERVICE AGREEMENT & SLA\n\nThis agreement is made between Ornitech Solutions (Service Provider) and the purchasing entity (Subscriber). \n\n1. SERVICE SPECIFICATIONS\nSubscriber receives full API keys, database indexes, and access to Gemini processing models with guaranteed uptime of 99.9%.\n\n2. DATA INTEGRITY\nAll customer data uploaded for vectorization is processed in memory and encrypted at rest with private KMS protocols. Retention schedules strictly adhere to SOC-2 guidelines.",
  }
]

export function OCRView() {
  const [selectedFile, setSelectedFile] = useState<typeof mockDocs[0] | null>(null)
  const [status, setStatus] = useState<"idle" | "uploading" | "scanning" | "completed">("idle")
  const [progress, setProgress] = useState(0)
  const [editableText, setEditableText] = useState("")
  const [copied, setCopied] = useState(false)
  const [indexed, setIndexed] = useState(false)

  const uploadIntervalRef = useRef<any>(null)
  const scanIntervalRef = useRef<any>(null)
  const copyTimeoutRef = useRef<any>(null)

  useEffect(() => {
    return () => {
      if (uploadIntervalRef.current) clearInterval(uploadIntervalRef.current)
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current)
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
    }
  }, [])

  const handleSelectMockFile = (doc: typeof mockDocs[0]) => {
    if (uploadIntervalRef.current) clearInterval(uploadIntervalRef.current)
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current)

    setSelectedFile(doc)
    setStatus("uploading")
    setProgress(0)
    setIndexed(false)
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          uploadIntervalRef.current = null
          setStatus("scanning")
          triggerScanning(doc)
          return 100
        }
        return prev + 20
      })
    }, 150)
    uploadIntervalRef.current = interval
  }

  const triggerScanning = (doc: typeof mockDocs[0]) => {
    setProgress(0)
    
    // Simulate OCR scanning progression
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          scanIntervalRef.current = null
          setStatus("completed")
          setEditableText(doc.text)
          return 100
        }
        return prev + 10
      })
    }, 250)
    scanIntervalRef.current = interval
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(editableText)
    setCopied(true)
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
    copyTimeoutRef.current = setTimeout(() => {
      setCopied(false)
      copyTimeoutRef.current = null
    }, 2000)
  }

  const handleIndexFile = () => {
    if (!selectedFile) return
    setIndexed(true)
  }

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-neutral-850 tracking-tight flex items-center gap-3">
          <Scan className="h-7 w-7 text-emerald-600 animate-pulse-glow" />
          OCR Document Scanner
        </h1>
        <p className="text-neutral-500 mt-1">
          Upload images or PDFs. The OCR engine parses layout grids, sanitizes headers, and processes characters into digital text.
        </p>
      </div>

      {/* Upload Zone or Processing Panel */}
      <AnimatePresence mode="wait">
        {status === "idle" ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Drag & Drop Main Panel */}
            <div className="glass-panel p-8 rounded-2xl border-slate-200/80 md:col-span-2 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px] border-dashed border-2 border-slate-250 hover:border-emerald-500/50 transition-colors">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Upload className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-neutral-850 text-base">Select Document to Ingest</h3>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Drag and drop files here, or click to browse. Supports PDF, JPEG, PNG formats.
                </p>
              </div>
            </div>

            {/* Simulated Demo Files Checklist */}
            <div className="glass-panel p-6 rounded-2xl border-slate-200/80 flex flex-col space-y-4">
              <div>
                <h3 className="font-bold text-neutral-850 text-sm uppercase tracking-wider font-mono">Demo Assets</h3>
                <p className="text-[10px] text-neutral-500 mt-0.5">Click a sample document to test the scanner pipeline.</p>
              </div>

              <div className="space-y-3 flex-1 justify-center flex flex-col">
                {mockDocs.map((doc) => (
                  <button
                    key={doc.name}
                    onClick={() => handleSelectMockFile(doc)}
                    className="p-4 rounded-xl bg-slate-100/85 border border-slate-200/60 hover:border-emerald-500/50 text-left hover:bg-slate-200/60 transition-all cursor-pointer flex items-center gap-3 group"
                  >
                    <FileText className="h-5 w-5 text-neutral-400 group-hover:text-emerald-600 transition-colors shrink-0" />
                    <div className="overflow-hidden">
                      <span className="text-xs font-bold text-neutral-850 block truncate">{doc.name}</span>
                      <span className="text-[9px] text-neutral-500 block font-mono mt-0.5">Scan Asset</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : status === "uploading" || status === "scanning" ? (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-panel p-10 rounded-2xl border-slate-200/80 flex flex-col items-center justify-center space-y-6"
          >
            {/* Holographic scanning target */}
            <div className="relative w-48 h-48 rounded-xl bg-slate-100 border border-slate-250 overflow-hidden flex items-center justify-center shadow-2xl">
              <FileText className={cn(
                "h-20 w-20 text-neutral-400 transition-all duration-300",
                status === "scanning" ? "text-emerald-500/40 scale-110" : "scale-100"
              )} />
              
              {/* Green Laser line */}
              {status === "scanning" && (
                <div className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_rgba(52,211,153,1)] animate-laser" />
              )}
            </div>

            <div className="text-center space-y-2 w-full max-w-sm">
              <h3 className="font-bold text-neutral-850">
                {status === "uploading" ? "Uploading Document Assets" : "Analyzing Layout Structure"}
              </h3>
              <p className="text-xs text-neutral-550 font-mono">
                {status === "uploading" 
                  ? `Transferring "${selectedFile?.name}" over secure SSL...` 
                  : "Resolving optical characters and parsing metadata..."}
              </p>
              
              {/* Progress bar */}
              <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden mt-3">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-150" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <span className="text-[10px] font-mono text-emerald-600 font-bold block mt-1">{progress}% Complete</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="completed"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Left Preview Panel */}
            <div className="glass-panel p-6 rounded-2xl border-slate-200/80 flex flex-col h-[480px]">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-xs font-semibold text-neutral-500 uppercase font-mono">Document Preview</span>
                <span className="text-[10px] text-emerald-600 font-mono font-bold bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="h-3 w-3" /> Ingested
                </span>
              </div>
              <div className="flex-1 mt-4 p-5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center font-mono text-neutral-600 text-xs overflow-y-auto leading-relaxed whitespace-pre-line relative">
                {/* Visual grid watermark to feel high-tech */}
                <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
                <div className="relative text-left w-full h-full max-h-full">
                  {selectedFile?.text}
                </div>
              </div>
            </div>

            {/* Right Extracted Text Panel */}
            <div className="glass-panel p-6 rounded-2xl border border-emerald-200 flex flex-col h-[480px] justify-between">
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs font-semibold text-neutral-500 uppercase font-mono">Extracted Output</span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="p-1.5 rounded-lg bg-slate-100 text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
                      title="Copy Output"
                    >
                      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => setStatus("idle")}
                      className="p-1.5 rounded-lg bg-slate-100 text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
                      title="Reset / Scan Another"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <textarea
                  value={editableText}
                  onChange={(e) => setEditableText(e.target.value)}
                  className="w-full flex-1 p-4 rounded-xl bg-white border border-slate-250 text-neutral-800 text-xs font-mono focus:outline-none focus:border-emerald-500/50 resize-none"
                />
              </div>

              {/* Action Bar */}
              <div className="mt-4 pt-4 border-t border-slate-200 flex gap-2">
                <button
                  onClick={handleIndexFile}
                  disabled={indexed}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-semibold text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg",
                    indexed 
                      ? "bg-emerald-50 border border-emerald-100 text-emerald-650"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/10"
                  )}
                >
                  <Layers className="h-3.5 w-3.5" />
                  {indexed ? "Vector Index Added" : "Index to Vector Database"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
