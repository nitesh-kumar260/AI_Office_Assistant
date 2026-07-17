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
  Terminal
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

interface SidebarProps {
  currentView: ViewType
  setCurrentView: (view: ViewType) => void
}

export function Sidebar({ currentView, setCurrentView }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  const menuItems = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "search", label: "Semantic Search", icon: Search },
    { id: "chat", label: "Chat with Docs", icon: MessageSquare },
    { id: "ocr", label: "OCR Scanner", icon: Scan },
    { id: "email", label: "Email Drafter", icon: Mail },
    { id: "meeting", label: "Meeting Summary", icon: Volume2 },
    { id: "automation", label: "Workflow Engine", icon: Workflow },
  ] as const

  return (
    <aside 
      className={cn(
        "glass border-r border-slate-200/85 h-screen sticky top-0 flex flex-col transition-all duration-300 z-50",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Logo Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200/85 justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-600">
            <Terminal className="h-5 w-5 animate-pulse-glow" />
          </div>
          {!isCollapsed && (
            <span className="font-bold tracking-wider bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              ORNITECH AI
            </span>
          )}
        </div>
        {!isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(true)}
            className="p-1 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative cursor-pointer",
                isActive 
                  ? "bg-purple-50 text-purple-600 border border-purple-200/60" 
                  : "text-neutral-500 hover:text-neutral-900 hover:bg-slate-100 border border-transparent"
              )}
            >
              {/* Highlight active strip */}
              {isActive && (
                <div className="absolute left-0 top-3 bottom-3 w-1 bg-purple-600 rounded-r-md" />
              )}
              
              <Icon className={cn(
                "h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110",
                isActive ? "text-purple-600" : "text-neutral-400 group-hover:text-neutral-900"
              )} />
              
              {!isCollapsed && (
                <span className="font-medium text-sm tracking-wide transition-opacity">
                  {item.label}
                </span>
              )}

              {/* Tooltip for Collapsed State */}
              {isCollapsed && (
                <div className="absolute left-22 scale-0 group-hover:scale-100 transition-all origin-left bg-white border border-slate-200 text-neutral-800 text-xs font-semibold py-2 px-3 rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer Toggle */}
      <div className="p-4 border-t border-slate-200/85 flex items-center justify-center">
        {isCollapsed ? (
          <button 
            onClick={() => setIsCollapsed(false)}
            className="p-2 rounded-xl bg-slate-100 text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        ) : (
          <div className="flex items-center gap-3 px-2 py-1 overflow-hidden">
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-neutral-600">Workspace V1.0</span>
              <span className="text-[10px] text-green-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                Active Node
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
