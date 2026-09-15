import React, { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import type { UserRole } from "@/context/AuthContext"
import { 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  Building2, 
  Terminal,
  Zap,
  CheckCircle2
} from "lucide-react"

interface AuthViewProps {
  onNavigateToDashboard: () => void
}

export function AuthView({ onNavigateToDashboard }: AuthViewProps) {
  const { login, user, logout } = useAuth()
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin")

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(selectedRole, name || undefined, email || undefined)
    onNavigateToDashboard()
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 scroll-3d-perspective">
      
      {/* Hero Header with 3D Float */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-3xl bg-gradient-to-r from-purple-900/15 via-indigo-900/10 to-slate-900/15 border border-purple-500/30 glass-panel preserve-3d animate-float-3d">
        <div className="flex items-start gap-4 min-w-0">
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 text-white shadow-xl shadow-purple-500/30 preserve-3d shrink-0">
            <Terminal className="h-8 w-8 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Ornitech Authentication Portal
              </h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-100 text-purple-700 border border-purple-200 shrink-0">
                Client Ready 3D
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Enterprise Single Sign-On (SSO), Role-Based Access Control (RBAC), and 3D security verification.
            </p>
          </div>
        </div>

        {user && (
          <div className="flex items-center justify-between sm:justify-start gap-3 p-3.5 rounded-2xl bg-white border border-purple-200 shadow-sm font-mono text-xs w-full sm:w-auto shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center shrink-0">
                {user.avatar}
              </div>
              <div>
                <div className="font-bold text-slate-900">{user.name}</div>
                <div className="text-[10px] text-purple-600 font-bold uppercase">{user.role} Active</div>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="ml-2 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors font-sans text-xs cursor-pointer whitespace-nowrap shrink-0"
            >
              Log Out
            </button>
          </div>
        )}
      </div>

      {/* Main Form Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Security Safeguards Info Box */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4 scroll-3d-card-cyan border border-slate-800">
            <h3 className="font-bold text-sm text-cyan-400 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" /> Enterprise Security Safeguards
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your organizational credentials are protected by bank-grade encryption and granular permission hierarchies.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300 font-mono pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> OAuth 2.0 & SAML 2.0 SSO Integration
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> AES-256 Encrypted Session Tokens
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> Granular Role-Based Access Control (RBAC)
              </li>
            </ul>
          </div>
        </div>

        {/* Dedicated Sign In / Sign Up Form */}
        <div className="lg:col-span-8">
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6 scroll-3d-card">
            
            {/* Form Mode Selector Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-600">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {mode === "login" ? "Sign In to Your Workspace" : "Register Enterprise Organization"}
                  </h2>
                  <p className="text-xs text-slate-400">Enter your credentials below</p>
                </div>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setMode("login")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mode === "login" ? "bg-white text-purple-700 shadow-sm" : "text-slate-500"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setMode("signup")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mode === "signup" ? "bg-white text-purple-700 shadow-sm" : "text-slate-500"
                  }`}
                >
                  Register New
                </button>
              </div>
            </div>

            {/* Custom Auth Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alexander Vance"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Enterprise Work Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@ornitech.ai"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                  />
                  <Building2 className="absolute right-4 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                  />
                  <Lock className="absolute right-4 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target RBAC Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all cursor-pointer"
                >
                  <option value="admin">System Administrator (Full Root Access)</option>
                  <option value="legal">Legal Counsel (Document Signing & Contract Review)</option>
                  <option value="executive">Executive Director (Reports & Analytics)</option>
                  <option value="auditor">Compliance Auditor (Read-only Verification)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-black text-sm shadow-xl shadow-purple-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="h-4 w-4" />
                {mode === "login" ? "Enter Ornitech Workspace" : "Create New Organization Workspace"}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}
