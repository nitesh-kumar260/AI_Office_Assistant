import React, { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import type { UserRole } from "@/context/AuthContext"
import { X, ShieldCheck, KeyRound, Lock, Building2 } from "lucide-react"

export function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login, user } = useAuth()
  const [tab, setTab] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin")

  if (!isAuthModalOpen) return null

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(selectedRole, name || undefined, email || undefined)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white/90 dark:bg-slate-900/90 rounded-3xl border border-purple-500/30 shadow-2xl overflow-hidden glass-panel perspective-1000">

        {/* Glow Header Accent */}
        <div className="h-2 w-full bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400" />

        {/* Modal Header */}
        <div className="px-8 pt-6 pb-4 flex items-center justify-between border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-600/10 text-purple-600 border border-purple-200">
              <ShieldCheck className="h-6 w-6 animate-pulse-glow" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Ornitech Enterprise Portal
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-mono font-semibold">v2.5 3D</span>
              </h2>
              <p className="text-xs text-slate-500">Secure SSO & Role-Based Access Control System</p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Form Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                tab === "login" ? "bg-white text-purple-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Sign In Existing
            </button>
            <button
              onClick={() => setTab("signup")}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                tab === "signup" ? "bg-white text-purple-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Register New Organization
            </button>
          </div>

          {/* Custom Auth Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {tab === "signup" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alexander Vance"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                />
                <Building2 className="absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                />
                <Lock className="absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target RBAC Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
              >
                <option value="admin">System Administrator (Full Permissions)</option>
                <option value="legal">Legal Counsel (Document Signing & Contract Review)</option>
                <option value="executive">Executive Director (Reports & Workspace Management)</option>
                <option value="auditor">Compliance Auditor (Read-only Verification)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-sm shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="h-4 w-4" />
              {tab === "login" ? "Sign In to Workspace" : "Register Organization Workspace"}
            </button>
          </form>

          {user && (
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-center">
              <span className="text-xs text-purple-700 font-medium">
                Currently logged in as <strong>{user.name}</strong> ({user.role.toUpperCase()})
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
