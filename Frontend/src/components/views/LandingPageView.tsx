import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import {
  Terminal,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Scan,
  ScanLine,
  GitCompare,
  FileCheck2,
  PenTool,
  Database,
  FileBarChart2,
  Building2,
  FileText,
  Zap,
  CheckCircle2,
  Lock,
  ChevronRight,
  Menu,
  X,
  LogIn
} from "lucide-react"

interface LandingPageViewProps {
  onOpenAuth: () => void
}

export function LandingPageView({ onOpenAuth }: LandingPageViewProps) {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const capabilities = [
    {
      id: "ai-processing",
      title: "AI Document Processing",
      description: "Automated multi-format document parsing, semantic classification, and neural metadata tagging.",
      icon: FileText,
      badge: "Core AI",
      color: "from-purple-500 to-indigo-600",
      accent: "bg-purple-50 text-purple-600 border-purple-200"
    },
    {
      id: "ocr",
      title: "Optical Character Recognition (OCR)",
      description: "High-precision multi-lingual text extraction from scanned images, PDFs, and handwritten notes.",
      icon: Scan,
      badge: "Vision AI",
      color: "from-blue-500 to-cyan-600",
      accent: "bg-blue-50 text-blue-600 border-blue-200"
    },
    {
      id: "extraction",
      title: "Document Extraction",
      description: "Instant entity extraction converting unstructured key-value pairs and tables into clean structured data.",
      icon: ScanLine,
      badge: "Structured Data",
      color: "from-emerald-500 to-teal-600",
      accent: "bg-emerald-50 text-emerald-600 border-emerald-200"
    },
    {
      id: "comparison",
      title: "Document Comparison",
      description: "Side-by-side visual & semantic diff analysis to spot legal clause modifications and contract revisions instantly.",
      icon: GitCompare,
      badge: "Diff Analysis",
      color: "from-orange-500 to-amber-600",
      accent: "bg-orange-50 text-orange-600 border-orange-200"
    },
    {
      id: "contracts",
      title: "Contract Summarization",
      description: "Automated risk assessment, liability identification, and executive digests for legal contracts.",
      icon: FileCheck2,
      badge: "Legal Intelligence",
      color: "from-purple-600 to-pink-600",
      accent: "bg-pink-50 text-pink-600 border-pink-200"
    },
    {
      id: "rag",
      title: "RAG Vector Engine",
      description: "Retrieval-Augmented Generation across your entire organizational document repository with exact source citations.",
      icon: Database,
      badge: "Vector DB",
      color: "from-indigo-500 to-purple-600",
      accent: "bg-indigo-50 text-indigo-600 border-indigo-200"
    },
    {
      id: "reports",
      title: "Automated Reports",
      description: "Generate comprehensive, exportable executive reports and visual business intelligence with a single click.",
      icon: FileBarChart2,
      badge: "Analytics",
      color: "from-cyan-500 to-blue-600",
      accent: "bg-cyan-50 text-cyan-600 border-cyan-200"
    },
    {
      id: "signatures",
      title: "Digital Signatures",
      description: "Cryptographically verified e-signature workflows with SHA-256 audit trails and compliance logging.",
      icon: PenTool,
      badge: "Cryptographic",
      color: "from-rose-500 to-red-600",
      accent: "bg-rose-50 text-rose-600 border-rose-200"
    },
    {
      id: "workspace",
      title: "Team Workspace",
      description: "Role-based access control (RBAC), multi-tenant organization boundaries, and collaborative team spaces.",
      icon: Building2,
      badge: "Enterprise RBAC",
      color: "from-violet-500 to-purple-600",
      accent: "bg-violet-50 text-violet-600 border-violet-200"
    }
  ]

  const stats = [
    { label: "Extraction Accuracy", value: "99.4%" },
    { label: "Workflow Velocity", value: "10x Faster" },
    { label: "Enterprise Security", value: "AES-256" },
    { label: "Document Formats", value: "50+ Supported" }
  ]

  const workflowSteps = [
    {
      step: "01",
      title: "Central Document Vault",
      desc: "Upload contracts, invoices, reports, and scans into an encrypted, multi-tenant vector database."
    },
    {
      step: "02",
      title: "Neural AI Processing",
      desc: "Our vision OCR & LLM engines parse layout, extract structured tables, and index embeddings instantly."
    },
    {
      step: "03",
      title: "Actionable Insights & Signatures",
      desc: "Ask RAG queries, compare diffs, run contract digests, auto-generate reports, and sign electronically."
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans w-full max-w-full overflow-x-hidden selection:bg-purple-500 selection:text-white">

      {/* Background glow effects */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Public Header / Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/80 dark:border-slate-800 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

          {/* Logo & Brand Name */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white shadow-lg shadow-purple-500/25 shrink-0">
              <Terminal className="h-6 w-6" />
            </div>
            <div>
              <span className="font-black text-lg tracking-wider bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent block leading-tight">
                ORNITECH AI
              </span>
              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase block leading-tight">
                AI Office Assistant
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#overview" className="hover:text-purple-600 transition-colors">Overview</a>
            <a href="#capabilities" className="hover:text-purple-600 transition-colors">Capabilities</a>
            <a href="#workflow" className="hover:text-purple-600 transition-colors">How It Works</a>
            <a href="#security" className="hover:text-purple-600 transition-colors">Security</a>
          </nav>

          {/* Header Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-600">
                  Signed in as <strong className="text-slate-900">{user.name}</strong>
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={onOpenAuth}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer flex items-center gap-2"
                >
                  <LogIn className="h-4 w-4 text-purple-600" />
                  Sign In
                </button>
                <button
                  onClick={onOpenAuth}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-2"
                >
                  Get Started <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 pt-2 pb-6 space-y-4">
            <nav className="flex flex-col space-y-3 text-sm font-semibold text-slate-700">
              <a
                href="#overview"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-purple-600 py-1"
              >
                Overview
              </a>
              <a
                href="#capabilities"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-purple-600 py-1"
              >
                Capabilities
              </a>
              <a
                href="#workflow"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-purple-600 py-1"
              >
                How It Works
              </a>
              <a
                href="#security"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-purple-600 py-1"
              >
                Security
              </a>
            </nav>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAuth() }}
                className="w-full py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2"
              >
                <LogIn className="h-4 w-4 text-purple-600" />
                Sign In
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAuth() }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-purple-500/20 flex items-center justify-center gap-2"
              >
                Get Started Free <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="overview" className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-6 max-w-4xl mx-auto">

          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200 text-purple-700 text-xs font-semibold shadow-sm">
            <Sparkles className="h-4 w-4 text-purple-600 animate-pulse" />
            <span>AI Office Assistant v2.5 Enterprise Edition</span>
            <span className="bg-purple-600 text-white text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold">
              3D AI Engine
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            The Autonomous Intelligence Platform for{" "}
            <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Enterprise Document Operations
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Eliminate document manual processing bottlenecks. Unify high-precision OCR, instant structured extraction, legal contract digests, RAG semantic search, automated reports, and cryptographic digital signatures in a secure, role-governed environment.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-sm shadow-xl shadow-purple-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap className="h-5 w-5 fill-current" />
              Get Started Now
            </button>
            <a
              href="#capabilities"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-100 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              Explore Capabilities <ChevronRight className="h-4 w-4 text-slate-400" />
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-purple-100 shadow-sm text-center space-y-1"
              >
                <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-xs font-semibold text-slate-500 font-mono">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Hero Interactive Mockup Showcase */}
        <div className="mt-14 max-w-5xl mx-auto rounded-3xl p-3 sm:p-5 bg-slate-900 shadow-2xl border border-slate-800 relative">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="ml-2 text-slate-400">ornitech-ai-workspace.internal/dashboard</span>
            </div>
            <span className="hidden sm:inline text-purple-400 font-semibold">Active RAG Node: Online</span>
          </div>

          <div className="p-4 sm:p-8 bg-slate-950 rounded-2xl text-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-purple-400">
                <span className="flex items-center gap-1.5"><Scan className="h-4 w-4" /> OCR Scanner</span>
                <span className="text-[10px] bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded">PDF Parsed</span>
              </div>
              <p className="text-xs text-slate-400">Extracted 42 parameters from Master Services Agreement with 99.8% confidence.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-400">
                <span className="flex items-center gap-1.5"><Database className="h-4 w-4" /> RAG Vector Engine</span>
                <span className="text-[10px] bg-cyan-900/60 text-cyan-300 px-2 py-0.5 rounded">1,420 Chunks</span>
              </div>
              <p className="text-xs text-slate-400">Indexed organizational repository. Fast cosine similarity search across all documents.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                <span className="flex items-center gap-1.5"><PenTool className="h-4 w-4" /> E-Sign Compliance</span>
                <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded">SHA-256 Valid</span>
              </div>
              <p className="text-xs text-slate-400">Cryptographically verified signature stamp applied with immutable ledger tracking.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Capabilities / Features Section */}
      <section id="capabilities" className="py-16 sm:py-24 bg-white border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">

          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider">
              Comprehensive Platform Capabilities
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Everything Your Organization Needs for Intelligent Document Intelligence
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Built from the ground up to solve complex enterprise document workflows with precision, speed, and strict security controls.
            </p>
          </div>

          {/* Capabilities Grid (9 Requirements Explicitly Met) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap) => {
              const IconComponent = cap.icon
              return (
                <div
                  key={cap.id}
                  className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 hover:border-purple-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-2xl bg-white border ${cap.accent} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 uppercase">
                        {cap.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                        {cap.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed mt-2">
                        {cap.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-purple-600">
                    <span onClick={onOpenAuth} className="hover:underline cursor-pointer flex items-center gap-1">
                      Access Capability <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* How It Works Workflow Section */}
      <section id="workflow" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="space-y-12">

          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold text-purple-600 uppercase tracking-widest">
              Seamless Integration Flow
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
              How AI Office Assistant Powers Your Enterprise
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Three simple steps to transition from manual document handling to automated intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {workflowSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-white border border-slate-200 shadow-lg relative space-y-4"
              >
                <div className="text-4xl font-black text-purple-600/20 font-mono">
                  {step.step}
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Enterprise Security Section */}
      <section id="security" className="py-16 sm:py-20 bg-slate-900 text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-900/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold">
              <Lock className="h-3.5 w-3.5" /> Bank-Grade Enterprise Compliance
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Built for High-Stakes Legal & Operational Security
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Your organizational documents and sensitive contract data remain strictly isolated within enterprise role-based security boundaries.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Role-Based Access Control (RBAC)</div>
                  <div className="text-slate-400 text-[11px]">Admin, Legal Counsel, Executive & Auditor personas.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">SHA-256 Cryptographic Audit</div>
                  <div className="text-slate-400 text-[11px]">Immutable digital signatures and timestamp verification.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">AES-256 Vector Indexing</div>
                  <div className="text-slate-400 text-[11px]">End-to-end encrypted embeddings stored in dedicated vaults.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Single Sign-On (SSO) Ready</div>
                  <div className="text-slate-400 text-[11px]">OAuth 2.0 & SAML integration support.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-900/40 via-indigo-900/40 to-slate-900 border border-purple-500/30 space-y-6 text-center">
            <ShieldCheck className="h-16 w-16 text-purple-400 mx-auto animate-pulse" />
            <h3 className="text-xl font-bold text-white">Ready to Secure & Streamline Your Workspace?</h3>
            <p className="text-xs text-slate-300">
              Sign in with your enterprise credentials or register a new workspace to start processing documents.
            </p>
            <button
              onClick={onOpenAuth}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-purple-500/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              Sign In to AI Office Assistant <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-600 text-white">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">ORNITECH AI</span>
              <span className="text-slate-500 block text-[10px]">AI Office Assistant Enterprise</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400 font-medium">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security Statement</span>
            <span>API Docs</span>
          </div>

          <div className="text-slate-500 text-[11px] text-center md:text-right">
            &copy; {new Date().getFullYear()} Ornitech AI. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  )
}
