import { useState, useEffect, useRef } from "react"
import { Sidebar } from "./components/Sidebar"
import type { ViewType } from "./components/Sidebar"
import { DashboardView } from "./components/views/DashboardView"
import { SearchView } from "./components/views/SearchView"
import { ChatView } from "./components/views/ChatView"
import { OCRView } from "./components/views/OCRView"
import { EmailView } from "./components/views/EmailView"
import { MeetingView } from "./components/views/MeetingView"
import { AutomationView } from "./components/views/AutomationView"
import { DocumentComparisonView } from "./components/views/DocumentComparisonView"
import { ContractSummarizationView } from "./components/views/ContractSummarizationView"
import { AutoReportView } from "./components/views/AutoReportView"
import { DigitalSignatureView } from "./components/views/DigitalSignatureView"
import { TeamWorkspaceView } from "./components/views/TeamWorkspaceView"
import { RAGSearchView } from "./components/views/RAGSearchView"
import { AuthView } from "./components/views/AuthView"
import { Upload_doc } from "./components/views/Upload_doc"
import { Extract_Info } from "./components/views/Extract_Info"
import { DocChatbotDrawer } from "./components/DocChatbotDrawer"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { Bell, Building2, LogIn, Menu, Bot, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard")
  const [initialSelectedDoc, setInitialSelectedDoc] = useState<string | null>(null)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false)
  const mainRef = useRef<HTMLDivElement>(null)
  const { user, workspace } = useAuth()

  useEffect(() => {
    const mainEl = mainRef.current
    if (!mainEl) return

    const handleScroll = () => {
      if (mainEl.scrollTop > 10) {
        setIsHeaderScrolled(true)
      } else {
        setIsHeaderScrolled(false)
      }
    }

    mainEl.addEventListener("scroll", handleScroll)
    return () => mainEl.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSelectDocForChat = (docName: string) => {
    setInitialSelectedDoc(docName)
    setCurrentView("chat")
  }

  const renderActiveView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardView onNavigate={(view) => setCurrentView(view as ViewType)} />
      case "auth":
        return <AuthView onNavigateToDashboard={() => setCurrentView("dashboard")} />
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
      case "compare":
        return <DocumentComparisonView />
      case "contracts":
        return <ContractSummarizationView />
      case "reports":
        return <AutoReportView />
      case "signatures":
        return <DigitalSignatureView />
      case "workspace":
        return <TeamWorkspaceView />
      case "rag-search":
        return <RAGSearchView />
      case "upload_doc":
        return <Upload_doc />
      case "extract_info":
        return <Extract_Info />
      default:
        return <DashboardView onNavigate={(view) => setCurrentView(view as ViewType)} />
    }
  }

  return (
    <div className="flex bg-slate-50 h-screen text-neutral-800 font-sans relative w-full max-w-full overflow-hidden scroll-3d-perspective">
      {/* Background visual glow accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation Sidebar */}
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-hidden h-full">
        
        {/* Top Control Bar Header */}
        <header className={cn(
          "h-16 px-3 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-40 transition-all duration-300 shrink-0 w-full max-w-full overflow-hidden",
          isHeaderScrolled 
            ? "bg-white/90 backdrop-blur-lg border-b border-purple-200/80 shadow-md shadow-purple-500/5" 
            : "bg-slate-50/80 backdrop-blur-md border-b border-slate-200/85"
        )}>
          
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            {/* Mobile Hamburger Trigger */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 md:hidden cursor-pointer shrink-0"
              title="Open Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 min-w-0">
              <Building2 className="h-3.5 w-3.5 text-purple-600 shrink-0" />
              <span className="truncate max-w-[70px] xs:max-w-[110px] sm:max-w-xs">{workspace.name}</span>
            </div>
            <span className="text-neutral-300 font-bold hidden sm:inline">/</span>
            <span className="text-xs font-mono font-bold text-purple-600 uppercase tracking-wide hidden sm:inline">
              {currentView}
            </span>
          </div>

          {/* User Profile & Actions Bar */}
          <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4 shrink-0">
            
            {/* AI Document Chatbot Navbar Trigger */}
            <button 
              onClick={() => setIsChatbotOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-purple-500/20 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0"
              title="Open AI Chatbot for Documents"
            >
              <Bot className="h-4 w-4 animate-bounce-subtle shrink-0" />
              <span className="hidden sm:inline">AI Doc Chatbot</span>
              <Sparkles className="h-3 w-3 text-purple-200 hidden sm:inline shrink-0" />
            </button>

            <button className="p-1.5 sm:p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-slate-100 transition-colors relative cursor-pointer shrink-0">
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-purple-500 rounded-full" />
              <Bell className="h-4.5 w-4.5" />
            </button>
            
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />

            {/* Auth / Account Profile Button */}
            {user ? (
              <button 
                onClick={() => setCurrentView("auth")}
                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-all text-left cursor-pointer shrink-0"
              >
                <div className="flex flex-col text-right hidden md:flex">
                  <span className="text-xs font-semibold text-neutral-800 flex items-center justify-end gap-1">
                    {user.name}
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 uppercase">
                      {user.role}
                    </span>
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">{user.email}</span>
                </div>
                
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-md shadow-purple-500/20 shrink-0">
                  {user.avatar}
                </div>
              </button>
            ) : (
              <button
                onClick={() => setCurrentView("auth")}
                className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <LogIn className="h-4 w-4 shrink-0" /> <span className="hidden sm:inline">Sign In / Sign Up</span>
              </button>
            )}
          </div>
        </header>

        {/* View Workspace wrapper */}
        <main 
          ref={mainRef}
          className="flex-1 overflow-y-auto px-3 sm:px-6 md:px-8 py-4 md:py-8 w-full max-w-full overflow-x-hidden scroll-3d-perspective"
        >
          {renderActiveView()}
        </main>
      </div>

      {/* Global AI Document Chatbot Sliding Drawer */}
      <DocChatbotDrawer 
        isOpen={isChatbotOpen} 
        onClose={() => setIsChatbotOpen(false)} 
      />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
