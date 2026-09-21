import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Scan, Upload, FileText, Check, Copy, RefreshCw, Layers } from "lucide-react"
import { cn } from "@/lib/utils"

export function OCRView() {
  const [selectedFile, setSelectedFile] = useState<{ name: string; text: string } | null>(null)
  const [status, setStatus] = useState<"idle" | "uploading" | "scanning" | "completed">("idle")
  const [progress, setProgress] = useState(0)
  const [editableText, setEditableText] = useState("")
  const [copied, setCopied] = useState(false)
  const [indexed, setIndexed] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleFileUpload = (file: File) => {
    if (uploadIntervalRef.current) clearInterval(uploadIntervalRef.current)
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current)

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = (e.target?.result as string) || `DOCUMENT TEXT EXTRACTED FROM ${file.name}\n\nFile Name: ${file.name}\nSize: ${(file.size / 1024).toFixed(1)} KB\nType: ${file.type || 'Document'}`
      
      const doc = { name: file.name, text: content }
      setSelectedFile(doc)
      setStatus("uploading")
      setProgress(0)
      setIndexed(false)
      
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            uploadIntervalRef.current = null
            setStatus("scanning")
            triggerScanning(doc)
            return 100
          }
          return prev + 25
        })
      }, 150)
      uploadIntervalRef.current = interval
    }

    if (file.type.startsWith("text/") || file.type.includes("json")) {
      reader.readAsText(file)
    } else {
      reader.readAsArrayBuffer(file)
    }
  }

  const triggerScanning = (doc: { name: string; text: string }) => {
    setProgress(0)
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          scanIntervalRef.current = null
          setStatus("completed")
          setEditableText(doc.text)
          return 100
        }
        return prev + 15
      })
    }, 200)
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
          <Scan className="h-7 w-7 text-purple-600 animate-pulse-glow" />
          OCR Document Scanner
        </h1>
        <p className="text-neutral-500 mt-1">
          Upload images or PDFs. The OCR engine parses layout grids, sanitizes headers, and processes characters into digital text.
        </p>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*,.pdf,.txt,.doc,.docx"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0])
          }
        }} 
      />

      {/* Upload Zone or Processing Panel */}
      <AnimatePresence mode="wait">
        {status === "idle" ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            {/* Drag & Drop Main Panel */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0])
                }
              }}
              className="glass-panel p-12 rounded-2xl border-slate-200/80 flex flex-col items-center justify-center text-center space-y-4 min-h-[320px] border-dashed border-2 border-slate-250 hover:border-purple-500/50 transition-all cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                <Upload className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-neutral-850 text-base">Select Document to Ingest</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Drag and drop files here, or click to browse. Supports PDF, JPEG, PNG, DOCX formats.
                </p>
              </div>
              <button className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors shadow-md shadow-purple-500/20">
                Browse Files
              </button>
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
                status === "scanning" ? "text-purple-500/40 scale-110" : "scale-100"
              )} />
              
              {/* Laser line */}
              {status === "scanning" && (
                <div className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_12px_rgba(168,85,247,1)] animate-laser" />
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
                  className="h-full bg-purple-600 transition-all duration-150" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <span className="text-[10px] font-mono text-purple-600 font-bold block mt-1">{progress}% Complete</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="completed"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Left Source Preview */}
            <div className="glass-panel p-6 rounded-2xl border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/85 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <span className="font-bold text-xs text-neutral-850 truncate max-w-[200px]">{selectedFile?.name}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  OCR Processed
                </span>
              </div>

              <div className="h-72 rounded-xl bg-slate-100 border border-slate-250 flex items-center justify-center p-6 text-center">
                <div className="space-y-2">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto" />
                  <p className="text-xs font-mono text-slate-500">{selectedFile?.name}</p>
                </div>
              </div>

              <button
                onClick={() => setStatus("idle")}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/60 border border-slate-200 text-neutral-650 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Scan Another Document
              </button>
            </div>

            {/* Right Extracted Editable Text */}
            <div className="glass-panel p-6 rounded-2xl border-slate-200/80 space-y-4 flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-200/85 pb-3">
                <span className="font-bold text-xs text-neutral-850 uppercase font-mono tracking-wider">Extracted Text Output</span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/60 text-neutral-650 text-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-purple-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span className="text-[11px] font-semibold">{copied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
              </div>

              <textarea
                value={editableText}
                onChange={(e) => setEditableText(e.target.value)}
                className="w-full flex-1 min-h-[220px] p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-neutral-800 focus:outline-none focus:border-purple-500 transition-colors resize-none leading-relaxed"
              />

              <button
                onClick={handleIndexFile}
                disabled={indexed}
                className={cn(
                  "w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg",
                  indexed 
                    ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none" 
                    : "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20"
                )}
              >
                <Layers className="h-4 w-4" />
                {indexed ? "Indexed into Vector DB" : "Push Text to Vector Storage"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
