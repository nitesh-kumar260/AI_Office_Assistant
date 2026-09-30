import React from "react"
import { 
  LayoutDashboard, 
  Search, 
  MessageSquare, 
  Scan, 
  Mail, 
  Volume2, 
  Workflow, 
  ChevronLeft,
  ChevronRight,
  Terminal,
  GitCompare,
  FileCheck2,
  FileBarChart2,
  PenTool,
  Building2,
  Database,
  LogIn,
  X,
  UploadCloud,
  ScanLine
} from "lucide-react"
import { cn } from "@/lib/utils"

export type ViewType = 
  | "dashboard"
  | "search"
  | "chat"
  | "ocr"
  | "email"
  | "meeting"
  | "automation"
  | "compare"
  | "contracts"
  | "reports"
  | "signatures"
  | "workspace"
  | "rag-search"
  | "auth"
  | "upload_doc"
  | "extract_info"


interface SidebarProps {
  currentView: ViewType
  setCurrentView: (view: ViewType) => void
  isMobileOpen?: boolean
  setIsMobileOpen?: (open: boolean) => void
}

export function Sidebar({ 
  currentView, 
  setCurrentView, 
  isMobileOpen = false, 
  setIsMobileOpen 
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  const categories = [
    {
      title: "Core Intelligence",
      items: [
        { id: "dashboard", label: "Overview", icon: LayoutDashboard },
        { id: "auth", label: "Login / Sign Up", icon: LogIn, badge: "SSO" },
        { id: "search", label: "Semantic Search", icon: Search },
        { id: "chat", label: "Chat with Docs", icon: MessageSquare },
      ]
    },
    {
      title: "Legal & Document AI",
      items: [
        { id: "upload_doc", label: "Document Vault", icon: UploadCloud, badge: "Db" },
        { id: "extract_info", label: "Info Extractor", icon: ScanLine, badge: "OCR" },
        { id: "compare", label: "Doc Comparison", icon: GitCompare, badge: "Diff" },
        { id: "contracts", label: "Contract Digest", icon: FileCheck2, badge: "Risk" },
        { id: "signatures", label: "Digital Signatures", icon: PenTool, badge: "SHA" },
        { id: "ocr", label: "OCR Scanner", icon: Scan },
      ]
    },


    {
      title: "Automation & Enterprise",
      items: [
        { id: "reports", label: "Auto Reports", icon: FileBarChart2, badge: "AI" },
        { id: "rag-search", label: "RAG Vector Engine", icon: Database },
        { id: "workspace", label: "Team Workspace", icon: Building2 },
        { id: "automation", label: "Workflow Engine", icon: Workflow },
        { id: "email", label: "Email Drafter", icon: Mail },
        { id: "meeting", label: "Meeting Summary", icon: Volume2 },
      ]
    }
  ] as const

  const handleSelectView = (view: ViewType) => {
    setCurrentView(view)
    if (setIsMobileOpen) {
      setIsMobileOpen(false)
    }
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen?.(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-60 md:hidden animate-in fade-in duration-200"
        />
      )}

      <aside 
        className={cn(
          "border-r border-slate-200/85 h-screen sticky top-0 flex flex-col transition-all duration-300 shrink-0",
          // Desktop sizing
          "hidden md:flex glass z-30",
          isCollapsed ? "w-20" : "w-64",
          // Mobile Drawer Sizing
          isMobileOpen && "fixed inset-y-0 left-0 flex w-72 bg-white dark:bg-slate-900 shadow-2xl z-70 border-r border-slate-200 max-w-[85vw]"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-4 border-b border-slate-200/85 justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white shadow-md shadow-purple-500/25 shrink-0 transition-transform duration-300 hover:scale-105 cursor-pointer">
              <Terminal className="h-5 w-5" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col min-w-0">
                <span className="font-black tracking-wider bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent text-sm truncate leading-tight">
                  ORNITECH AI
                </span>
                <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase truncate leading-tight mt-0.5">
                  Enterprise 3D
                </span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          {!isCollapsed && !isMobileOpen && (
            <button 
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          {/* Mobile close button */}
          {isMobileOpen && (
            <button 
              onClick={() => setIsMobileOpen?.(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto min-h-0">
          {categories.map((cat, idx) => (
            <div key={idx} className="space-y-1">
              {(!isCollapsed || isMobileOpen) && (
                <div className="px-3 text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase mb-1.5">
                  {cat.title}
                </div>
              )}

              {cat.items.map((item) => {
                const Icon = item.icon
                const isActive = currentView === item.id

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectView(item.id as ViewType)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative cursor-pointer text-xs font-medium",
                      isActive 
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25 border border-purple-500" 
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent"
                    )}
                  >
                    <Icon className={cn(
                      "h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900"
                    )} />
                    
                    {(!isCollapsed || isMobileOpen) && (
                      <span className="truncate flex-1 text-left">
                        {item.label}
                      </span>
                    )}

                    {(!isCollapsed || isMobileOpen) && "badge" in item && item.badge && (
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase",
                        isActive ? "bg-white/20 text-white" : "bg-purple-100 text-purple-700"
                      )}>
                        {item.badge}
                      </span>
                    )}

                    {/* Tooltip for Collapsed Desktop State */}
                    {isCollapsed && !isMobileOpen && (
                      <div className="absolute left-22 scale-0 group-hover:scale-100 transition-all origin-left bg-slate-900 text-white text-xs font-semibold py-2 px-3 rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer Toggle */}
        <div className="p-3 border-t border-slate-200/85 flex items-center justify-between shrink-0 bg-slate-50/50">
          {isCollapsed && !isMobileOpen ? (
            <button 
              onClick={() => setIsCollapsed(false)}
              className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors mx-auto cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <div className="flex items-center justify-between w-full px-2">
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-bold text-slate-700">Client Ready 3D</span>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Node
                </span>
              </div>
              <span className="text-[10px] font-mono text-purple-600 font-bold bg-purple-100 px-2 py-0.5 rounded">
                v2.5
              </span>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
