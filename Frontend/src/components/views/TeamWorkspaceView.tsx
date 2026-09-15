import { useState } from "react"
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  FolderGit2, 
  UserPlus, 
  Activity, 
  Check, 
  MoreVertical 
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import type { UserRole } from "@/context/AuthContext"

interface TeamMember {
  id: string
  name: string
  email: string
  role: UserRole
  department: string
  status: "Active" | "Pending Invite" | "Away"
  lastActive: string
  avatar: string
}

export function TeamWorkspaceView() {
  const { user, workspace, workspaces, setWorkspace } = useAuth()
  const [activeTab, setActiveTab] = useState<"members" | "rbac" | "folders" | "audit">("members")
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<UserRole>("legal")
  const [showInviteModal, setShowInviteModal] = useState(false)

  const [members, setMembers] = useState<TeamMember[]>(() => {
    if (user) {
      return [{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: "Enterprise Workspace",
        status: "Active",
        lastActive: "Just now",
        avatar: user.avatar
      }]
    }
    return []
  })

  const auditLogs: any[] = []

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    const newMem: TeamMember = {
      id: `m-${Date.now()}`,
      name: inviteEmail.split("@")[0].replace(".", " "),
      email: inviteEmail,
      role: inviteRole,
      department: "Enterprise Workspace",
      status: "Pending Invite",
      lastActive: "Invited",
      avatar: inviteEmail.slice(0, 2).toUpperCase()
    }

    setMembers([...members, newMem])
    setInviteEmail("")
    setShowInviteModal(false)
  }

  const roleColors: Record<UserRole, string> = {
    admin: "bg-purple-100 text-purple-700 border-purple-200",
    legal: "bg-blue-100 text-blue-700 border-blue-200",
    executive: "bg-emerald-100 text-emerald-700 border-emerald-200",
    auditor: "bg-amber-100 text-amber-700 border-amber-200"
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Workspace Switcher */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-900/10 via-indigo-900/5 to-slate-900/10 border border-purple-500/20 glass-panel">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 preserve-3d animate-float-3d">
            <Building2 className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Enterprise Team Workspace & RBAC
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-100 text-purple-700 border border-purple-200">
                {workspace.tier}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Organization-wide member roles, department permissions matrix, and shared document vaults.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Workspace Select dropdown */}
          <select
            value={workspace.id}
            onChange={(e) => {
              const selected = workspaces.find(w => w.id === e.target.value)
              if (selected) setWorkspace(selected)
            }}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-sm outline-none cursor-pointer"
          >
            {workspaces.map(ws => (
              <option key={ws.id} value={ws.id}>{ws.name} ({ws.memberCount} members)</option>
            ))}
          </select>

          <button 
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all cursor-pointer"
          >
            <UserPlus className="h-4 w-4" /> Invite Team Member
          </button>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between card-3d">
          <div>
            <div className="text-xs font-semibold text-slate-400">Total Active Members</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{members.length} Users</div>
            <div className="text-[11px] text-purple-600 font-medium">4 Roles Defined</div>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between card-3d">
          <div>
            <div className="text-xs font-semibold text-slate-400">Shared Department Folders</div>
            <div className="text-2xl font-black text-slate-900 mt-1">14 Vaults</div>
            <div className="text-[11px] text-emerald-600 font-medium">1,420 Encrypted Files</div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <FolderGit2 className="h-6 w-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between card-3d">
          <div>
            <div className="text-xs font-semibold text-slate-400">Active Automated Workflows</div>
            <div className="text-2xl font-black text-slate-900 mt-1">38 Live Pipelines</div>
            <div className="text-[11px] text-blue-600 font-medium">Auto-Sync Enabled</div>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
            <Activity className="h-6 w-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between card-3d">
          <div>
            <div className="text-xs font-semibold text-slate-400">Security Index</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">100% Compliant</div>
            <div className="text-[11px] text-slate-500">2FA & SSO Active</div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 overflow-x-auto whitespace-nowrap pb-1">
        <button
          onClick={() => setActiveTab("members")}
          className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === "members" ? "border-purple-600 text-purple-700" : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Team Members ({members.length})
        </button>
        <button
          onClick={() => setActiveTab("rbac")}
          className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === "rbac" ? "border-purple-600 text-purple-700" : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          RBAC Permission Matrix
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === "audit" ? "border-purple-600 text-purple-700" : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Live Workspace Audit Feed
        </button>
      </div>

      {/* Members Tab */}
      {activeTab === "members" && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm overflow-x-auto space-y-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-mono uppercase text-[11px]">
                <th className="pb-3 font-semibold min-w-[180px]">User Profile</th>
                <th className="pb-3 font-semibold min-w-[150px]">Department</th>
                <th className="pb-3 font-semibold min-w-[100px]">Role</th>
                <th className="pb-3 font-semibold min-w-[80px]">Status</th>
                <th className="pb-3 font-semibold min-w-[110px]">Last Active</th>
                <th className="pb-3 font-semibold text-right min-w-[60px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((mem) => (
                <tr key={mem.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 min-w-[180px]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-md shadow-purple-500/20">
                        {mem.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{mem.name}</div>
                        <div className="text-slate-400 text-[11px]">{mem.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 font-medium text-slate-700 min-w-[150px]">{mem.department}</td>
                  <td className="py-4 min-w-[100px]">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${roleColors[mem.role]}`}>
                      {mem.role}
                    </span>
                  </td>
                  <td className="py-4 min-w-[80px]">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                      mem.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {mem.status}
                    </span>
                  </td>
                  <td className="py-4 text-slate-500 min-w-[110px]">{mem.lastActive}</td>
                  <td className="py-4 text-right min-w-[60px]">
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* RBAC Permission Matrix Tab */}
      {activeTab === "rbac" && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm overflow-x-auto space-y-4">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Role-Based Access Control (RBAC) Matrix</h3>
            <p className="text-xs text-slate-500">Fine-grained security capabilities across workspace roles.</p>
          </div>

          <table className="w-full text-left text-xs border border-slate-200 rounded-2xl overflow-hidden">
            <thead className="bg-slate-50 text-slate-600 font-mono uppercase text-[11px]">
              <tr>
                <th className="p-3 min-w-[240px]">Capability / Permission</th>
                <th className="p-3 text-center min-w-[80px]">Admin</th>
                <th className="p-3 text-center min-w-[100px]">Legal Counsel</th>
                <th className="p-3 text-center min-w-[90px]">Executive</th>
                <th className="p-3 text-center min-w-[90px]">Auditor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              <tr>
                <td className="p-3 font-semibold min-w-[240px]">Compare Documents & Contract Diffing</td>
                <td className="p-3 text-center text-emerald-600 min-w-[80px]"><Check className="h-4 w-4 mx-auto" /></td>
                <td className="p-3 text-center text-emerald-600 min-w-[100px]"><Check className="h-4 w-4 mx-auto" /></td>
                <td className="p-3 text-center text-emerald-600 min-w-[90px]"><Check className="h-4 w-4 mx-auto" /></td>
                <td className="p-3 text-center text-slate-300 min-w-[90px]">—</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold min-w-[240px]">Apply Cryptographic Digital Signatures</td>
                <td className="p-3 text-center text-emerald-600 min-w-[80px]"><Check className="h-4 w-4 mx-auto" /></td>
                <td className="p-3 text-center text-emerald-600 min-w-[100px]"><Check className="h-4 w-4 mx-auto" /></td>
                <td className="p-3 text-center text-slate-300 min-w-[90px]">—</td>
                <td className="p-3 text-center text-slate-300 min-w-[90px]">—</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold min-w-[240px]">Generate Executive AI Reports</td>
                <td className="p-3 text-center text-emerald-600 min-w-[80px]"><Check className="h-4 w-4 mx-auto" /></td>
                <td className="p-3 text-center text-slate-300 min-w-[100px]">—</td>
                <td className="p-3 text-center text-emerald-600 min-w-[90px]"><Check className="h-4 w-4 mx-auto" /></td>
                <td className="p-3 text-center text-emerald-600 min-w-[90px]"><Check className="h-4 w-4 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-3 font-semibold min-w-[240px]">Manage Enterprise Admin Settings & Model Switcher</td>
                <td className="p-3 text-center text-emerald-600 min-w-[80px]"><Check className="h-4 w-4 mx-auto" /></td>
                <td className="p-3 text-center text-slate-300 min-w-[100px]">—</td>
                <td className="p-3 text-center text-slate-300 min-w-[90px]">—</td>
                <td className="p-3 text-center text-slate-300 min-w-[90px]">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Audit Feed Tab */}
      {activeTab === "audit" && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Workspace Security Audit Feed</h3>
          <div className="space-y-3">
            {auditLogs.map((log, i) => {
              const Icon = log.icon
              return (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white shadow-sm">
                      <Icon className={`h-4 w-4 ${log.color}`} />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">{log.user}</span>
                      <span className="text-slate-500 mx-1.5">{log.action}</span>
                      <span className="font-mono text-purple-700 font-semibold">{log.target}</span>
                    </div>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">{log.time}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Invite Modal Overlay */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-purple-200">
            <h3 className="font-bold text-slate-900 text-base">Invite Team Member</h3>
            <form onSubmit={handleInviteMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@ornitech.ai"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none"
                >
                  <option value="legal">Legal Counsel</option>
                  <option value="executive">Executive Director</option>
                  <option value="auditor">Compliance Auditor</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs cursor-pointer"
                >
                  Send Workspace Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
