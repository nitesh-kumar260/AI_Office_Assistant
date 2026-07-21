import React, { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { 
  Bot, 
  Sparkles, 
  X, 
  Send, 
  FileText, 
  UploadCloud, 
  Trash2, 
  CheckCircle2, 
  Maximize2, 
  Minimize2, 
  Paperclip, 
  Zap, 
  ShieldCheck,
  Database,
  ChevronDown,
  Layers
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DocChatbotDrawerProps {
  isOpen: boolean
  onClose: () => void
}

interface DocumentContextItem {
  id: string
  name: string
  size: string
  type: "pdf" | "docx" | "xlsx" | "txt"
  selected: boolean
  badge?: string
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  citations?: string[]
}

const initialDocs: DocumentContextItem[] = [
  { id: "doc-1", name: "MSA_Vendor_Agreement_v2.1.pdf", size: "1.5 MB", type: "pdf", selected: true, badge: "Legal" },
  { id: "doc-2", name: "IP_Licensing_Framework_Final.pdf", size: "894 KB", type: "pdf", selected: true, badge: "IP" },
  { id: "doc-3", name: "Q3_Compliance_Audit_Draft.docx", size: "2.4 MB", type: "docx", selected: false, badge: "Audit" },
  { id: "doc-4", name: "Remote_Work_Handbook_2026.pdf", size: "1.1 MB", type: "pdf", selected: false, badge: "HR" }
]

const prebuiltPrompts = [
  "Summarize key terms & obligations",
  "Identify risk & liability caps",
  "Extract payment schedules",
  "Check data privacy standards"
]

const mockResponses: Record<string, { answer: string; citations: string[] }> = {
  "summarize key terms & obligations": {
    answer: "Based on the selected documents (**MSA_Vendor_Agreement_v2.1.pdf** & **IP_Licensing_Framework_Final.pdf**):\n\n1. **Service Scope**: Vendors provide continuous maintenance and AI pipeline integration support.\n2. **Termination Clause**: Either party may terminate with 30-day prior written notification.\n3. **IP Ownership**: All telemetry and custom model weights generated remain sole property of Ornitech AI.",
    citations: ["MSA_Vendor_Agreement_v2.1.pdf", "IP_Licensing_Framework_Final.pdf"]
  },
  "identify risk & liability caps": {
    answer: "Liability Analysis from active context:\n\n• **Direct Damage Cap**: Capped at 2x total contract value paid in preceding 12 months.\n• **Consequential Damages**: Excluded, except for breaches of Confidentiality (Section 8) or IP Infringement (Section 12).\n• **Indemnification**: Full indemnity provided for third-party IP claims.",
    citations: ["MSA_Vendor_Agreement_v2.1.pdf"]
  },
  "extract payment schedules": {
    answer: "Deliverables & Payment Terms:\n\n• **Invoice Schedule**: Net-30 days upon invoice issuance.\n• **Milestone Deliverable 1**: Vector indexing benchmark completion (<150ms query latency).\n• **Late Payment Fee**: 1.5% monthly compound interest on overdue balances.",
    citations: ["MSA_Vendor_Agreement_v2.1.pdf", "Q3_Compliance_Audit_Draft.docx"]
  },
  "check data privacy standards": {
    answer: "Data Security Compliance:\n\n• **Scrubbing Ledger**: Automatic stripping of PII prior to vector embeddings generation.\n• **Audit Cycle**: 90-day retention window for raw document staging before permanent scrub.\n• **Encryption**: AES-256 at rest, TLS 1.3 in transit across all active node channels.",
    citations: ["Q3_Compliance_Audit_Draft.docx"]
  }
}

export function DocChatbotDrawer({ isOpen, onClose }: DocChatbotDrawerProps) {
  const [documents, setDocuments] = useState<DocumentContextItem[]>(initialDocs)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      content: "Hello! I am **DocuMind AI**, your document intelligence assistant. Select active documents from the scope bar and ask questions or choose a quick prompt below.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: ["MSA_Vendor_Agreement_v2.1.pdf", "IP_Licensing_Framework_Final.pdf"]
    }
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [typingStep, setTypingStep] = useState("Indexing vector embeddings...")
  const [widthMode, setWidthMode] = useState<"compact" | "medium" | "wide">("medium")
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [uploadFileName, setUploadFileName] = useState<string | null>(null)
  const [showDocSelector, setShowDocSelector] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Prevent background body scrolling when chatbot drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isTyping, isOpen])

  // Toggle document selection
  const toggleDocSelection = (id: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, selected: !doc.selected } : doc
    ))
  }

  const selectedDocs = documents.filter(d => d.selected)

  // Send query logic
  const handleSendQuery = (queryText?: string) => {
    const textToSend = queryText || input
    if (!textToSend.trim() || isTyping) return

    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMsg])
    if (!queryText) setInput("")
    setIsTyping(true)

    // Multi-stage AI reasoning steps simulation
    setTypingStep("Loading document vector scope...")
    setTimeout(() => {
      setTypingStep("Scanning semantic embeddings...")
      setTimeout(() => {
        setTypingStep("Synthesizing response & citations...")
        setTimeout(() => {
          generateAIAnswer(textToSend)
        }, 400)
      }, 400)
    }, 400)
  }

  const generateAIAnswer = (userQuery: string) => {
    const lower = userQuery.toLowerCase()
    let responseObj = mockResponses[lower]

    if (!responseObj) {
      const matchedKey = Object.keys(mockResponses).find(k => 
        lower.includes(k.split(" ")[0]) || 
        lower.includes("summary") || 
        lower.includes("contract") || 
        lower.includes("risk") || 
        lower.includes("payment") ||
        lower.includes("privacy")
      )
      
      if (matchedKey) {
        responseObj = mockResponses[matchedKey]
      } else {
        const activeDocNames = selectedDocs.map(d => d.name)
        responseObj = {
          answer: activeDocNames.length > 0
            ? `Analyzed **${activeDocNames.join(", ")}** for: "${userQuery}".\n\nNo high-risk clauses detected. The document structure aligns with enterprise compliance policies. Standard SLAs and confidentiality terms apply.`
            : "No documents are currently selected in your active context scope. Click 'Manage Scope' above to check at least one file.",
          citations: activeDocNames.slice(0, 2)
        }
      }
    }

    const aiMsg: ChatMessage = {
      id: "ai-" + Date.now(),
      role: "assistant",
      content: responseObj.answer,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: responseObj.citations
    }

    setMessages(prev => [...prev, aiMsg])
    setIsTyping(false)
  }

  // Handle mock file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadFileName(file.name)
    setUploadProgress(10)

    let progress = 10
    const interval = setInterval(() => {
      progress += 25
      if (progress >= 100) {
        clearInterval(interval)
        setUploadProgress(100)

        setTimeout(() => {
          const newDoc: DocumentContextItem = {
            id: "doc-" + Date.now(),
            name: file.name,
            size: (file.size / 1024 > 1024 ? (file.size / (1024 * 1024)).toFixed(1) + " MB" : (file.size / 1024).toFixed(0) + " KB"),
            type: file.name.endsWith(".docx") ? "docx" : file.name.endsWith(".xlsx") ? "xlsx" : "pdf",
            selected: true,
            badge: "New"
          }

          setDocuments(prev => [newDoc, ...prev])
          setUploadProgress(null)
          setUploadFileName(null)

          setMessages(prev => [
            ...prev,
            {
              id: "msg-upload-" + Date.now(),
              role: "assistant",
              content: `Indexed **${file.name}** into memory. Added as active vector context for queries.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              citations: [file.name]
            }
          ])
        }, 300)
      } else {
        setUploadProgress(progress)
      }
    }, 150)
  }

  // Clear chat
  const handleClearChat = () => {
    setMessages([
      {
        id: "msg-reset",
        role: "assistant",
        content: "Conversation reset. Select documents from the context scope and start a new inquiry.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ])
  }

  if (!isOpen) return null

  const widthClasses = {
    compact: "w-full sm:w-[450px]",
    medium: "w-full sm:w-[600px] lg:w-[720px]",
    wide: "w-full sm:w-[800px] lg:w-[960px]"
  }[widthMode]

  return createPortal(
    <>
      {/* Viewport Backdrop Overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-[9999] animate-in fade-in duration-200"
      />

      {/* Viewport Locked Drawer Shell */}
      <aside 
        className={cn(
          "fixed top-0 right-0 bottom-0 h-full w-full bg-slate-50 border-l border-slate-200/90 shadow-2xl z-[9999] flex flex-col transition-all duration-300 transform animate-in slide-in-from-right max-w-full overflow-hidden",
          widthClasses
        )}
      >
        {/* Fixed Header Bar */}
        <div className="h-16 px-4 sm:px-6 border-b border-slate-200 flex items-center justify-between bg-white/95 backdrop-blur-md shrink-0 z-20">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 text-white shadow-md shadow-purple-500/25 shrink-0">
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-black text-sm text-slate-850 truncate tracking-tight">
                  AI Chatbot for Documents
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-purple-100 text-purple-700 uppercase shrink-0">
                  Demo
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono truncate">
                Interactive Document Intelligence Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Toggle Scope Popover */}
            <button
              onClick={() => setShowDocSelector(!showDocSelector)}
              className={cn(
                "px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border shadow-2xs",
                showDocSelector 
                  ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20" 
                  : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
              )}
              title="Toggle Active Documents Scope"
            >
              <Database className="h-3.5 w-3.5" />
              <span className="text-[11px] font-bold">{selectedDocs.length} Docs</span>
              <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", showDocSelector && "rotate-180")} />
            </button>

            {/* Width Toggle */}
            <button
              onClick={() => {
                if (widthMode === "compact") setWidthMode("medium")
                else if (widthMode === "medium") setWidthMode("wide")
                else setWidthMode("compact")
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors hidden sm:flex cursor-pointer"
              title="Resize drawer width"
            >
              {widthMode === "wide" ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            {/* Clear Chat */}
            <button
              onClick={handleClearChat}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Clear conversation"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scope Banner Bar */}
        <div className="px-4 py-2 bg-purple-50/90 border-b border-purple-100 flex items-center justify-between text-xs shrink-0 relative z-10">
          <div className="flex items-center gap-2 overflow-hidden">
            <ShieldCheck className="h-4 w-4 text-purple-600 shrink-0" />
            <span className="text-[11px] font-bold text-purple-950 truncate">
              Context Scope: {selectedDocs.length > 0 ? selectedDocs.map(d => d.name).join(", ") : "No documents selected"}
            </span>
          </div>
          <button
            onClick={() => setShowDocSelector(!showDocSelector)}
            className="text-[10px] font-mono font-bold text-purple-700 hover:text-purple-900 hover:underline flex items-center gap-1 shrink-0 cursor-pointer ml-2"
          >
            {showDocSelector ? "Close Scope" : "Manage Scope"}
          </button>
        </div>

        {/* Popover Document Selector Drawer overlay */}
        {showDocSelector && (
          <div className="bg-white border-b border-purple-200/80 p-4 shadow-xl animate-in slide-in-from-top-2 duration-200 z-30 shrink-0 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-purple-600" />
                <h3 className="text-xs font-mono font-bold uppercase text-slate-700 tracking-wider">
                  Select Document Assets for Memory Scope ({selectedDocs.length}/{documents.length})
                </h3>
              </div>
              <button 
                onClick={() => setShowDocSelector(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Mini Upload Dropzone */}
              <div className="md:col-span-1 p-3 rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/40 text-center flex flex-col items-center justify-center space-y-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept=".pdf,.docx,.xlsx,.txt"
                />
                <UploadCloud className="h-6 w-6 text-purple-600" />
                <p className="text-[11px] font-bold text-purple-900">
                  Upload file to chatbot
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold shadow-sm cursor-pointer transition-all w-full"
                >
                  Browse File
                </button>
              </div>

              {/* Uploading indicator */}
              {uploadProgress !== null && (
                <div className="md:col-span-1 p-3 rounded-2xl bg-slate-100 space-y-1.5 flex flex-col justify-center">
                  <div className="flex justify-between text-[10px] font-mono font-bold text-slate-700">
                    <span className="truncate">{uploadFileName}</span>
                    <span className="text-purple-600">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              {/* Document Items List */}
              <div className="md:col-span-2 space-y-2 max-h-48 overflow-y-auto pr-1">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => toggleDocSelection(doc.id)}
                    className={cn(
                      "p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 group text-left",
                      doc.selected 
                        ? "bg-purple-50/90 border-purple-300 text-purple-900 shadow-2xs" 
                        : "bg-slate-50 border-slate-200/70 text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        doc.selected ? "text-purple-600" : "text-slate-400 group-hover:text-slate-600"
                      )} />
                      <span className="text-xs font-semibold truncate">
                        {doc.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[9px] font-mono text-slate-400">{doc.size}</span>
                      {doc.selected && (
                        <CheckCircle2 className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Chat Feed Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/60 min-h-0">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3 max-w-[95%] sm:max-w-[85%]",
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-md shadow-purple-500/20 shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div className="space-y-1 min-w-0">
                <div
                  className={cn(
                    "p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs break-words",
                    msg.role === "user"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none"
                      : "bg-white border border-slate-200/90 text-slate-800 rounded-tl-none glass-panel"
                  )}
                >
                  {msg.content}

                  {/* Citations Footer */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[9px] uppercase font-mono text-slate-400 font-bold tracking-wider">
                        Indexed Sources:
                      </span>
                      {msg.citations.map((cite, cIdx) => (
                        <span
                          key={cIdx}
                          className="inline-flex items-center gap-1 text-[9px] font-mono bg-purple-50 border border-purple-200/80 text-purple-700 px-2 py-0.5 rounded-md font-semibold"
                        >
                          <FileText className="h-2.5 w-2.5" />
                          {cite}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className={cn(
                  "text-[9px] font-mono text-slate-400 block px-1",
                  msg.role === "user" ? "text-right" : "text-left"
                )}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 mr-auto items-center">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-md shrink-0">
                <Bot className="h-4 w-4 animate-spin" />
              </div>
              <div className="bg-white border border-purple-200 p-3.5 rounded-2xl rounded-tl-none text-xs text-slate-600 flex items-center gap-2.5 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="font-mono text-[10px] text-purple-700 font-bold">{typingStep}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-4 py-2 bg-slate-100/90 border-t border-slate-200/70 overflow-x-auto flex gap-2 shrink-0 scrollbar-none">
          {prebuiltPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuery(prompt)}
              disabled={isTyping || selectedDocs.length === 0}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:text-purple-700 hover:border-purple-300 hover:bg-purple-50/60 transition-all shrink-0 cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-2xs"
            >
              <Sparkles className="h-3 w-3 text-purple-600" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>

        {/* Bottom Input Area */}
        <form 
          onSubmit={(e) => {
            e.preventDefault()
            handleSendQuery()
          }}
          className="p-3 sm:p-4 border-t border-slate-200 bg-white flex items-center gap-2 shrink-0"
        >
          <button
            type="button"
            onClick={() => setShowDocSelector(!showDocSelector)}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer shrink-0"
            title="Manage Document Scope"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              selectedDocs.length > 0
                ? "Ask about selected documents..."
                : "Select a document from context scope to start..."
            }
            disabled={selectedDocs.length === 0 || isTyping}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-purple-500 focus:bg-white transition-all disabled:opacity-50 min-w-0"
          />

          <button
            type="submit"
            disabled={!input.trim() || selectedDocs.length === 0 || isTyping}
            className="p-2.5 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-purple-500/20 shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

        {/* Fixed Footer Info bar */}
        <div className="h-7 px-4 border-t border-slate-200 bg-slate-100/90 flex items-center justify-between text-[10px] text-slate-400 font-mono shrink-0">
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3 text-purple-600" />
            <span>Node: Vector-Embeddings-v2</span>
          </div>
          <span>Frontend Only Demo</span>
        </div>
      </aside>
    </>,
    document.body
  )
}
