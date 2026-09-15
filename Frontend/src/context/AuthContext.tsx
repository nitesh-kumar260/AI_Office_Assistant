import React, { createContext, useContext, useState, useEffect } from "react"

export type UserRole = "admin" | "legal" | "executive" | "auditor"

export interface UserProfile {
  id: string
  name: string
  email: string
  role: UserRole
  avatar: string
  title: string
  organization: string
}

export interface Workspace {
  id: string
  name: string
  memberCount: number
  tier: "Enterprise 3D" | "Professional" | "Standard"
  code: string
}

interface AuthContextType {
  user: UserProfile | null
  workspace: Workspace
  workspaces: Workspace[]
  setWorkspace: (ws: Workspace) => void
  login: (role?: UserRole, name?: string, email?: string) => void
  logout: () => void
  isAuthModalOpen: boolean
  setIsAuthModalOpen: (open: boolean) => void
  isAdmin: boolean
}

const DEFAULT_WORKSPACES: Workspace[] = [
  { id: "ws-1", name: "Ornitech Global Legal", memberCount: 24, tier: "Enterprise 3D", code: "ORN-LEG-88" },
  { id: "ws-2", name: "Executive Operations AI", memberCount: 12, tier: "Enterprise 3D", code: "ORN-EXE-01" },
  { id: "ws-3", name: "HR & Talent Compliance", memberCount: 8, tier: "Professional", code: "ORN-HR-14" },
]

const DEFAULT_USER: UserProfile = {
  id: "usr-admin-001",
  name: "Enterprise Admin",
  email: "admin@ornitech.ai",
  role: "admin",
  avatar: "EA",
  title: "System Administrator",
  organization: "Ornitech AI"
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("ornitech_user")
    if (saved) {
      try { return JSON.parse(saved) } catch (e) { console.error(e) }
    }
    return DEFAULT_USER
  })

  const [workspace, setWorkspaceState] = useState<Workspace>(() => {
    const saved = localStorage.getItem("ornitech_ws")
    if (saved) {
      try { return JSON.parse(saved) } catch (e) { console.error(e) }
    }
    return DEFAULT_WORKSPACES[0]
  })

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  useEffect(() => {
    if (user) {
      localStorage.setItem("ornitech_user", JSON.stringify(user))
    } else {
      localStorage.removeItem("ornitech_user")
    }
  }, [user])

  useEffect(() => {
    localStorage.setItem("ornitech_ws", JSON.stringify(workspace))
  }, [workspace])

  const setWorkspace = (ws: Workspace) => {
    setWorkspaceState(ws)
  }

  const login = (role: UserRole = "admin", name?: string, email?: string) => {
    const roleTitles: Record<UserRole, string> = {
      admin: "Enterprise Systems Administrator",
      legal: "Senior Corporate Legal Counsel",
      executive: "Executive Operations Director",
      auditor: "Lead Compliance Auditor"
    }

    const defaultNames: Record<UserRole, string> = {
      admin: "Enterprise Admin",
      legal: "Legal Counsel",
      executive: "Executive Director",
      auditor: "Compliance Auditor"
    }

    const userName = name || defaultNames[role]

    const newUser: UserProfile = {
      id: `usr-${role}-${Math.floor(100 + Math.random() * 900)}`,
      name: userName,
      email: email || `${role}@ornitech.ai`,
      role,
      avatar: userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
      title: roleTitles[role],
      organization: "Ornitech AI"
    }

    setUser(newUser)
    setIsAuthModalOpen(false)
  }

  const logout = () => {
    setUser(null)
  }

  const isAdmin = user?.role === "admin"

  return (
    <AuthContext.Provider value={{
      user,
      workspace,
      workspaces: DEFAULT_WORKSPACES,
      setWorkspace,
      login,
      logout,
      isAuthModalOpen,
      setIsAuthModalOpen,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
