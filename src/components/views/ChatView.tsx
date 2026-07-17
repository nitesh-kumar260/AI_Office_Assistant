import { useState, useEffect, useRef } from "react"
import { Send, Sparkles, FileText, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatViewProps {
  initialSelectedDoc?: string | null
  clearInitialDoc?: () => void
}

interface Message {
  role: "user" | "assistant"
  content: string
  citations?: string[]
}

const mockDocAnswers: Record<string, string> = {
  "remote_work_handbook_2026.pdf": "Based on the Remote Work Handbook (2026), employees are allowed to work remotely up to 3 days per week. The core hours for virtual meetings and collaboration are between 10:00 AM and 3:00 PM EST. There is also a home-office equipment stipend of up to $500 available annually.",
  "q3_corporate_milestones.pdf": "According to the Q3 Corporate Milestones, the primary target is to scale the vector database pipeline to support 100M active vectors while reducing chatbot query response times to less than 150ms. Additionally, the sales division aims to secure 15 new enterprise contracts.",
  "compliance_handbook_v2.docx": "The Compliance Handbook specifies that all uploaded enterprise assets are automatically stripped of personal identification information (PII) before vector representations are generated. A strict security ledger requires all raw document uploads to be scrubbed after 90 days.",
  "marketing_strategy_q3.pptx": "The Q3 Marketing Strategy focuses on marketing AI productivity accelerators. Objectives include scaling leads by 40% using programmatic campaigns and developing video testimonials that show document parsing efficiency.",
}

export function ChatView({ initialSelectedDoc, clearInitialDoc }: ChatViewProps) {
  const [selectedDocs, setSelectedDocs] = useState<string[]>([
    "remote_work_handbook_2026.pdf",
    "q3_corporate_milestones.pdf",
  ])

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your AI Knowledge Assistant. I have indexed your selected document assets. Ask me anything about their contents.",
    },
  ])

  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const availableDocs = [
    "remote_work_handbook_2026.pdf",
    "q3_corporate_milestones.pdf",
    "compliance_handbook_v2.docx",
    "marketing_strategy_q3.pptx",
  ]

  // If a document was pre-selected from search results, handle selection and add automated prompt
  useEffect(() => {
    if (initialSelectedDoc) {
      if (!selectedDocs.includes(initialSelectedDoc)) {
        setSelectedDocs((prev) => [...prev, initialSelectedDoc])
      }
      
      // Auto-trigger prompt
      setInput(`Summarize the document "${initialSelectedDoc}"`)
      if (clearInitialDoc) {
        clearInitialDoc()
      }
    }
  }, [initialSelectedDoc])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const handleToggleDoc = (doc: string) => {
    if (selectedDocs.includes(doc)) {
      setSelectedDocs(selectedDocs.filter((d) => d !== doc))
    } else {
      setSelectedDocs([...selectedDocs, doc])
    }
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isTyping) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI response lookup in documents
    setTimeout(() => {
      let aiContent = "I could not find references to that query in the currently selected document context. Try checking additional document layers."
      let citations: string[] = []

      // Check if user is asking about specific document
      const queryLower = userMessage.content.toLowerCase()
      
      selectedDocs.forEach((doc) => {
        const docBaseName = doc.replace(/\.[^/.]+$/, "").replace(/_/g, " ")
        if (queryLower.includes(doc.toLowerCase()) || queryLower.includes(docBaseName.toLowerCase()) || queryLower.includes("summarize") || queryLower.includes("policy") || queryLower.includes("goal") || queryLower.includes("security")) {
          if (mockDocAnswers[doc] && citations.length === 0) {
            aiContent = mockDocAnswers[doc]
            citations.push(doc)
          }
        }
      })

      // Generic summary matching
      if (citations.length === 0 && selectedDocs.length > 0) {
        const primaryDoc = selectedDocs[0]
        aiContent = `Looking into the document ${primaryDoc}: ${mockDocAnswers[primaryDoc]}`
        citations.push(primaryDoc)
      }

      setMessages((prev) => [...prev, { role: "assistant", content: aiContent, citations }])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
      {/* Document Context Sidebar */}
      <div className="glass-panel p-5 rounded-2xl border-slate-200/80 flex flex-col justify-between h-full lg:col-span-1">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-neutral-850 text-sm tracking-wide uppercase font-mono">
              Vector Context
            </h3>
            <p className="text-[11px] text-neutral-500 mt-1">
              Select which database entities are loaded into the short-term memory scope.
            </p>
          </div>

          <div className="space-y-2">
            {availableDocs.map((doc) => {
              const isChecked = selectedDocs.includes(doc)
              return (
                <button
                  key={doc}
                  onClick={() => handleToggleDoc(doc)}
                  className={cn(
                    "w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer group",
                    isChecked
                      ? "bg-purple-50 border-purple-200 text-purple-600"
                      : "bg-slate-100/85 border-slate-200/60 text-neutral-600 hover:bg-slate-200/60"
                  )}
                >
                  <FileText className={cn(
                    "h-4 w-4 mt-0.5 shrink-0 transition-colors",
                    isChecked ? "text-purple-600" : "text-neutral-450 group-hover:text-neutral-600"
                  )} />
                  <div className="overflow-hidden">
                    <span className="text-xs font-semibold block truncate leading-tight">{doc}</span>
                    <span className="text-[9px] font-mono text-neutral-455 block mt-0.5">Vector Scope [Active]</span>
                  </div>
                  {isChecked && (
                    <CheckCircle2 className="h-4 w-4 text-purple-600 ml-auto shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-[10px] text-purple-600 leading-normal font-mono">
          Model: Gemini-2.5-Pro-Tuned
          <br />
          Tokens loaded: ~4.2k
        </div>
      </div>

      {/* Chat Workspace */}
      <div className="glass-panel rounded-2xl border-slate-200/80 flex flex-col h-full lg:col-span-3 overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-100/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse-glow" />
            <div>
              <h3 className="font-bold text-neutral-850 text-sm">Gemini Document Session</h3>
              <p className="text-[10px] text-neutral-550">
                Active context: {selectedDocs.length} files selected
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg text-[10px] font-mono text-purple-600 font-semibold uppercase">
            <Sparkles className="h-3 w-3" />
            Context Enabled
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-3 max-w-[85%]",
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-purple-600 text-white rounded-tr-none"
                  : "bg-slate-100 border border-slate-200/60 text-neutral-800 rounded-tl-none"
              )}>
                {msg.content}
                
                {/* Citations Footer */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[9px] uppercase font-mono text-neutral-400 font-bold tracking-wider">Citations:</span>
                    {msg.citations.map((cite) => (
                      <span
                        key={cite}
                        className="inline-flex items-center gap-1 text-[9px] font-mono bg-purple-50 border border-purple-100 text-purple-600 px-2 py-0.5 rounded-md"
                      >
                        <FileText className="h-2.5 w-2.5" />
                        {cite}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3 mr-auto items-center">
              <div className="bg-slate-105 border border-slate-200 p-4 rounded-2xl rounded-tl-none text-xs text-neutral-600 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="font-mono text-[10px] text-neutral-500 ml-1">Searching embedding structures...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={handleSend}
          className="p-4 border-t border-slate-200 bg-slate-100/40 flex gap-2 shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              selectedDocs.length > 0
                ? "Ask about the contents of your active files..."
                : "Please select a document context from the left panel..."
            }
            disabled={selectedDocs.length === 0}
            className="flex-1 px-4 py-3 rounded-xl bg-white border border-slate-200 text-neutral-800 placeholder-neutral-400 text-sm focus:outline-none focus:border-purple-500/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || selectedDocs.length === 0}
            className="p-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all disabled:opacity-50 cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
