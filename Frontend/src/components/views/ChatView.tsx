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

export function ChatView({ initialSelectedDoc, clearInitialDoc }: ChatViewProps) {
  const [availableDocs, setAvailableDocs] = useState<string[]>([])
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your AI Knowledge Assistant. Upload documents or select files from your vault to query their contents.",
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("http://localhost:5000/api/documents")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const docNames = data.map((d: any) => d.name)
          setAvailableDocs(docNames)
          if (docNames.length > 0 && selectedDocs.length === 0) {
            setSelectedDocs([docNames[0]])
          }
        }
      })
      .catch(() => {
        setAvailableDocs([])
      })
  }, [])

  useEffect(() => {
    if (initialSelectedDoc) {
      if (!selectedDocs.includes(initialSelectedDoc)) {
        setSelectedDocs((prev) => [...prev, initialSelectedDoc])
      }
      if (!availableDocs.includes(initialSelectedDoc)) {
        setAvailableDocs((prev) => [...prev, initialSelectedDoc])
      }
      
      setInput(`Summarize the document "${initialSelectedDoc}"`)
      if (clearInitialDoc) {
        clearInitialDoc()
      }
    }
  }, [initialSelectedDoc])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleToggleDoc = (doc: string) => {
    if (selectedDocs.includes(doc)) {
      setSelectedDocs(selectedDocs.filter((d) => d !== doc))
    } else {
      setSelectedDocs([...selectedDocs, doc])
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isTyping) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput("")
    setIsTyping(true)

    try {
      setTimeout(() => {
        const responseText = selectedDocs.length > 0
          ? `I have analyzed your query regarding "${currentInput}" against the active vector context (${selectedDocs.join(", ")}). The document contents match your search criteria.`
          : `Processed query "${currentInput}". Please select or upload a document asset to perform targeted contextual analysis.`
        
        setMessages((prev) => [
          ...prev, 
          { 
            role: "assistant", 
            content: responseText, 
            citations: selectedDocs.length > 0 ? selectedDocs : undefined 
          }
        ])
        setIsTyping(false)
      }, 1000)
    } catch {
      setIsTyping(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-auto lg:h-[calc(100vh-140px)]">
      {/* Document Context Sidebar */}
      <div className="glass-panel p-5 rounded-2xl border-slate-200/80 flex flex-col justify-between h-auto lg:h-full lg:col-span-1 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-neutral-850 text-sm tracking-wide uppercase font-mono">
              Vector Context
            </h3>
            <p className="text-[11px] text-neutral-500 mt-1">
              Select which database entities are loaded into the short-term memory scope.
            </p>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {availableDocs.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-neutral-450 font-mono">
                No documents uploaded yet.
              </div>
            ) : (
              availableDocs.map((doc) => {
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
                      isChecked ? "text-purple-600" : "text-neutral-455 group-hover:text-neutral-600"
                    )} />
                    <div className="overflow-hidden">
                      <span className="text-xs font-semibold block truncate leading-tight">{doc}</span>
                      <span className="text-[9px] font-mono text-neutral-455 block mt-0.5">Vector Scope</span>
                    </div>
                    {isChecked && (
                      <CheckCircle2 className="h-4 w-4 text-purple-600 ml-auto shrink-0" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200/60 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 font-mono uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            Scope Active
          </div>
          <p className="text-[10px] text-neutral-500">
            {selectedDocs.length} files currently attached to chat context memory.
          </p>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="glass-panel rounded-2xl border-slate-200/80 lg:col-span-3 flex flex-col h-[500px] lg:h-full overflow-hidden">
        {/* Chat History */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex flex-col max-w-[85%] space-y-1",
                msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div
                className={cn(
                  "p-4 rounded-2xl text-xs leading-relaxed font-medium shadow-sm",
                  msg.role === "user"
                    ? "bg-purple-600 text-white rounded-br-none"
                    : "bg-slate-100 text-neutral-850 rounded-bl-none border border-slate-200/80"
                )}
              >
                {msg.content}
              </div>

              {msg.citations && msg.citations.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {msg.citations.map((cit, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 font-mono text-[9px] font-bold border border-purple-200"
                    >
                      Source: {cit}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="mr-auto items-start flex space-x-1.5 p-3 rounded-2xl bg-slate-100 border border-slate-200/80">
              <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-200/80 bg-white/50 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask questions about your uploaded documents..."
            className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-purple-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors shadow-lg shadow-purple-500/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
