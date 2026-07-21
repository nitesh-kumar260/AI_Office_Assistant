import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Files, 
  Scan, 
  MessageSquare, 
  Mail, 
  Volume2, 
  ArrowUpRight, 
  Clock, 
  Lightbulb, 
  Calendar,
  Activity
} from "lucide-react"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid
} from "recharts"
import { cn } from "@/lib/utils"
import type { ViewType } from "../Sidebar"

interface DashboardViewProps {
  onNavigate: (view: ViewType) => void
}

const mockChartData = [
  { day: "Mon", Search: 400, OCR: 240, AI: 310, Email: 180 },
  { day: "Tue", Search: 600, OCR: 380, AI: 450, Email: 240 },
  { day: "Wed", Search: 800, OCR: 480, AI: 580, Email: 300 },
  { day: "Thu", Search: 500, OCR: 300, AI: 400, Email: 200 },
  { day: "Fri", Search: 950, OCR: 620, AI: 890, Email: 420 },
  { day: "Sat", Search: 300, OCR: 150, AI: 220, Email: 110 },
  { day: "Sun", Search: 450, OCR: 220, AI: 340, Email: 170 },
]

export function DashboardView({ onNavigate }: DashboardViewProps) {
  const [greetingIndex, setGreetingIndex] = useState(0)
  const greetings = [
    "Gemini Engine Online. Awaiting instructions.",
    "System running optimally. 24% load.",
    "Vectors synchronized. 12,482 documents indexed.",
    "Drafted 18 emails today with 94% approval rating."
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % greetings.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  // Quick stats values
  const stats = [
    { label: "Total Documents", value: 12482, change: "+12.4%", icon: Files, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { label: "OCR Scans", value: 348, change: "+8.2%", icon: Scan, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { label: "AI Chats", value: 1429, change: "+24.5%", icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
    { label: "Emails Drafted", value: 891, change: "+14.1%", icon: Mail, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    { label: "Meetings Summarized", value: 112, change: "+5.3%", icon: Volume2, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
  ]

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-850 tracking-tight">
            AI Operations Center
          </h1>
          <p className="text-neutral-500 mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
            <span className="font-mono text-sm tracking-wide text-purple-600">
              {greetings[greetingIndex]}
            </span>
          </p>
        </div>
        
        {/* Quick Node Indicator */}
        <div className="flex gap-2">
          <div className="glass px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-mono text-neutral-500">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            VDB Status: Synced
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className={cn(
                "glass-card glass-card-hover p-5 rounded-2xl flex flex-col justify-between border-slate-100 scroll-3d-card",
                stat.border
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-500 tracking-wider uppercase">
                  {stat.label}
                </span>
                <div className={cn("p-2 rounded-xl", stat.bg)}>
                  <Icon className={cn("h-4 w-4", stat.color)} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-neutral-850 font-mono">
                  {stat.value.toLocaleString()}
                </span>
                <span className="text-xs font-mono text-green-600 font-bold">
                  {stat.change}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Action Grid */}
      <div>
        <h2 className="text-lg font-bold text-neutral-850 mb-4">Command Core</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Run OCR Scan", desc: "Extract text from file", view: "ocr" as ViewType, color: "from-emerald-50/60 to-teal-50/20 hover:border-emerald-300/45 text-emerald-800" },
            { title: "Query Vector Search", desc: "Look up semantic files", view: "search" as ViewType, color: "from-blue-50/60 to-indigo-50/20 hover:border-blue-300/45 text-blue-800" },
            { title: "Launch Document Chat", desc: "Interact with pdf repository", view: "chat" as ViewType, color: "from-purple-50/60 to-pink-50/20 hover:border-purple-300/45 text-purple-800" },
            { title: "Draft Email Dispatch", desc: "Generate professional copy", view: "email" as ViewType, color: "from-amber-50/60 to-orange-50/20 hover:border-amber-300/45 text-amber-800" },
          ].map((action, i) => (
            <motion.button
              key={action.title}
              onClick={() => onNavigate(action.view)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              className={cn(
                "glass-card p-5 rounded-2xl text-left border border-slate-200/80 bg-gradient-to-br flex items-center justify-between group cursor-pointer",
                action.color
              )}
            >
              <div>
                <h3 className="font-semibold text-neutral-850 group-hover:text-purple-600 transition-colors">
                  {action.title}
                </h3>
                <p className="text-xs text-neutral-500 mt-1">{action.desc}</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-neutral-400 group-hover:text-purple-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main Charts & Timeline Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity Analytics Chart */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-neutral-850 flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-600" />
                Productivity Analytics
              </h3>
              <p className="text-xs text-neutral-500">Total requests processed per service channel</p>
            </div>
            <div className="flex gap-3 text-xs font-mono">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> AI</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Search</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> OCR</span>
            </div>
          </div>

          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSearch" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", color: "#0f172a", fontSize: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }} 
                  itemStyle={{ color: "#0f172a" }}
                />
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                <Area type="monotone" dataKey="AI" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorAI)" />
                <Area type="monotone" dataKey="Search" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSearch)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Recommendations Panel */}
        <div className="glass-panel p-6 rounded-2xl border-slate-200/80 space-y-6">
          <h3 className="font-bold text-neutral-850 flex items-center gap-2 border-b border-slate-200/85 pb-3">
            <Lightbulb className="h-4 w-4 text-amber-600" />
            AI Suggestions
          </h3>
          
          <div className="space-y-4">
            {[
              {
                title: "Automate OCR -> Email sequence",
                desc: "You run this workflow manually 14 times a week. Create a node connection to automate it.",
                impact: "Saves ~4 hrs/week"
              },
              {
                title: "Sync missing invoices",
                desc: "5 scanned PDF assets in your workspace don't have vector indices yet. Index them.",
                impact: "Improves Chat Context"
              },
              {
                title: "Action Items Pending",
                desc: "3 critical action items from 'Q3 Strategy Meeting Summary' are unassigned. Delegate them.",
                impact: "Resolves 3 Tasks"
              }
            ].map((sugg, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2 hover:bg-slate-100/50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-purple-600 font-mono tracking-wide">{sugg.impact}</span>
                </div>
                <h4 className="text-sm font-semibold text-neutral-850">{sugg.title}</h4>
                <p className="text-xs text-neutral-500 leading-relaxed">{sugg.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity & Upcoming Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity timeline */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 border-slate-200/80 space-y-5">
          <h3 className="font-bold text-neutral-850 flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            Operational History
          </h3>

          <div className="relative pl-6 border-l border-slate-200 space-y-6 ml-3">
            {[
              { action: "Email Draft Generated", detail: "Prepared partnership outreach mail for sales-lead", time: "12 mins ago", icon: Mail, iconColor: "text-amber-600", bg: "bg-amber-50" },
              { action: "Meeting Summary Synced", detail: "Parsed 'Vite 6 Migration Sync' recording, generated 5 action items", time: "1 hour ago", icon: Volume2, iconColor: "text-rose-600", bg: "bg-rose-50" },
              { action: "OCR Scanning Completed", detail: "Extracted structure from 'receipt_july26.jpg' with 98.2% confidence", time: "2 hours ago", icon: Scan, iconColor: "text-emerald-600", bg: "bg-emerald-50" },
              { action: "Index Synchronized", detail: "Added 12 new items to the document vector repository", time: "Yesterday", icon: Files, iconColor: "text-blue-600", bg: "bg-blue-50" },
            ].map((act, i) => {
              const ActIcon = act.icon
              return (
                <div key={i} className="relative group">
                  <div className={cn("absolute -left-10 top-0.5 p-1.5 rounded-full border border-slate-200/60", act.bg)}>
                    <ActIcon className={cn("h-3 w-3", act.iconColor)} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-neutral-850 group-hover:text-purple-600 transition-colors">
                        {act.action}
                      </h4>
                      <span className="text-[10px] font-mono text-neutral-400">{act.time}</span>
                    </div>
                    <p className="text-xs text-neutral-500">{act.detail}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming Meetings Calendar */}
        <div className="glass-panel p-6 rounded-2xl border-slate-200/80 space-y-5">
          <h3 className="font-bold text-neutral-850 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-rose-600" />
            Upcoming Operations
          </h3>

          <div className="space-y-4">
            {[
              { title: "Weekly Sprint Review", time: "Today, 4:00 PM", details: "Review progress and assign next week tasks" },
              { title: "AI Strategy Brainstorm", time: "Tomorrow, 11:30 AM", details: "Define core agent requirements" },
              { title: "Engineering Sync", time: "July 18, 2:00 PM", details: "Discuss system migration parameters" }
            ].map((meet, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex gap-3 items-start">
                <div className="p-2 rounded-lg bg-slate-100 text-neutral-600 font-mono text-[10px] leading-tight text-center shrink-0 w-12">
                  <span className="block font-bold">JUL</span>
                  <span className="block text-sm font-bold text-purple-600">{16 + i}</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-neutral-850">{meet.title}</h4>
                  <p className="text-xs text-purple-600 font-mono">{meet.time}</p>
                  <p className="text-[11px] text-neutral-500 leading-normal">{meet.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
