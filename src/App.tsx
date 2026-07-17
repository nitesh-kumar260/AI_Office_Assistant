import { useState } from "react"
import { Sidebar } from "./components/Sidebar"
import type { ViewType } from "./components/Sidebar"
import { DashboardView } from "./components/views/DashboardView"
import { SearchView } from "./components/views/SearchView"
import { ChatView } from "./components/views/ChatView"
import { OCRView } from "./components/views/OCRView"
import { EmailView } from "./components/views/EmailView"
import { MeetingView } from "./components/views/MeetingView"
import { AutomationView } from "./components/views/AutomationView"
import { Bell, User } from "lucide-react"

function App() {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard")
  const [initialSelectedDoc, setInitialSelectedDoc] = useState<string | null>(null)

  const handleSelectDocForChat = (docName: string) => {
    setInitialSelectedDoc(docName)
    setCurrentView("chat")
  }

  const renderActiveView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardView onNavigate={(view) => setCurrentView(view)} />
      case "search":
        return <SearchView onSelectDocForChat={handleSelectDocForChat} />
      case "chat":
        return (
          <ChatView 
            initialSelectedDoc={initialSelectedDoc} 
            clearInitialDoc={() => setInitialSelectedDoc(null)} 
          />
        )
      case "ocr":
        return <OCRView />
      case "email":
        return <EmailView />
      case "meeting":
        return <MeetingView />
      case "automation":
        return <AutomationView />
      default:
        return <DashboardView onNavigate={(view) => setCurrentView(view)} />
    }
  }

  return (
    <div className="flex bg-slate-50 min-h-screen text-neutral-800 font-sans relative">
      {/* Decorative Particle Glow background elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/3 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/3 rounded-full blur-[100px] pointer-events-none" />

      {/* Navigation Sidebar */}
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Control Bar */}
        <header className="h-16 px-8 border-b border-slate-200/85 flex items-center justify-between sticky top-0 bg-slate-50/80 backdrop-blur-md z-40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-widest text-neutral-400 uppercase">
              Operational Domain
            </span>
            <span className="text-neutral-300 font-bold">/</span>
            <span className="text-xs font-mono font-bold text-purple-600 uppercase tracking-wide">
              {currentView === "dashboard" ? "Overview" : currentView}
            </span>
          </div>

          {/* Actions & Profile widgets */}
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-slate-100 transition-colors relative cursor-pointer">
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-purple-500 rounded-full" />
              <Bell className="h-4.5 w-4.5" />
            </button>
            
            <div className="h-8 w-px bg-slate-200" />

            <div className="flex items-center gap-3">
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="text-xs font-semibold text-neutral-800">Operator</span>
                <span className="text-[10px] text-neutral-400 font-mono">ID: ORN-482</span>
              </div>
              <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-600">
                <User className="h-4.5 w-4.5" />
              </div>
            </div>
          </div>
        </header>

        {/* View Workspace wrapper */}
        <main className="flex-1 overflow-y-auto px-8 py-8">
          {renderActiveView()}
        </main>
      </div>
    </div>
  )
}

export default App
