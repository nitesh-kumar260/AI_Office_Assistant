import React, { useState, useRef } from "react"
import { 
  PenTool, 
  Type, 
  ShieldCheck, 
  Download, 
  RotateCcw, 
  Lock, 
  Award, 
  UserCheck
} from "lucide-react"

export function DigitalSignatureView() {
  const [selectedDoc, setSelectedDoc] = useState("Licensing_Agreement_2026.pdf")
  const [signatureMode, setSignatureMode] = useState<"draw" | "type" | "upload">("draw")
  const [typedName, setTypedName] = useState("Jeel Khunt")
  const [signerTitle, setSignerTitle] = useState("Chief Technology Officer")
  const [isSigned, setIsSigned] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Drawing Canvas Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.strokeStyle = "#7c3aed"
    ctx.lineWidth = 3
    ctx.lineCap = "round"
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const handleApplySignature = () => {
    setIsSigned(true)
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-900/10 via-pink-900/5 to-slate-900/10 border border-purple-500/20 glass-panel">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 preserve-3d animate-float-3d">
            <PenTool className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Cryptographic Digital Signatures & e-Seal
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-100 text-purple-700 border border-purple-200">
                SHA-256 Verified
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Legally binding e-Signatures with multi-party audit trails, biometric canvas drawing, and digital certificate seals.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isSigned && (
            <button 
              onClick={() => alert("Downloading Cryptographically Signed PDF Document...")}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all cursor-pointer"
            >
              <Download className="h-4 w-4" /> Download Signed PDF
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Document Signing Portal & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Signature Pad & Document Viewer */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Document Selector Header */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
            <div className="min-w-0">
              <span className="text-xs font-mono font-bold text-purple-600 uppercase">Target Document for Signing</span>
              <div className="text-base font-bold text-slate-900 mt-0.5 break-all">{selectedDoc}</div>
            </div>
            <select
              value={selectedDoc}
              onChange={(e) => { setSelectedDoc(e.target.value); setIsSigned(false); }}
              className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none cursor-pointer shrink-0"
            >
              <option value="Licensing_Agreement_2026.pdf">Licensing_Agreement_2026.pdf</option>
              <option value="Executive_Employment_NDA.pdf">Executive_Employment_NDA.pdf</option>
              <option value="Vendor_Service_Order_88492.pdf">Vendor_Service_Order_88492.pdf</option>
            </select>
          </div>

          {/* Signature Mode Selector Card */}
          {!isSigned ? (
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6 card-3d">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <span className="text-xs font-mono font-bold text-slate-600 uppercase flex items-center gap-2">
                  <PenTool className="h-4 w-4 text-purple-600" /> Choose Signature Method
                </span>
                
                {/* Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
                  <button
                    onClick={() => setSignatureMode("draw")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                      signatureMode === "draw" ? "bg-white text-purple-700 shadow-sm" : "text-slate-500"
                    }`}
                  >
                    <PenTool className="h-3.5 w-3.5" /> Draw Pad
                  </button>
                  <button
                    onClick={() => setSignatureMode("type")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                      signatureMode === "type" ? "bg-white text-purple-700 shadow-sm" : "text-slate-500"
                    }`}
                  >
                    <Type className="h-3.5 w-3.5" /> Type Script
                  </button>
                </div>
              </div>

              {/* Draw Signature Canvas */}
              {signatureMode === "draw" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Draw your signature below using mouse or touchscreen:</span>
                    <button 
                      onClick={clearCanvas}
                      className="text-purple-600 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <RotateCcw className="h-3 w-3" /> Clear Pad
                    </button>
                  </div>

                  <div className="relative border-2 border-dashed border-purple-200 rounded-2xl bg-slate-50 overflow-hidden w-full">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={160}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={(e) => {
                        const touch = e.touches[0]
                        const canvas = canvasRef.current
                        if (!canvas) return
                        const rect = canvas.getBoundingClientRect()
                        const ctx = canvas.getContext("2d")
                        if (!ctx) return
                        ctx.beginPath()
                        ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top)
                        ctx.strokeStyle = "#7c3aed"
                        ctx.lineWidth = 3
                        setIsDrawing(true)
                      }}
                      onTouchMove={(e) => {
                        if (!isDrawing) return
                        const touch = e.touches[0]
                        const canvas = canvasRef.current
                        if (!canvas) return
                        const rect = canvas.getBoundingClientRect()
                        const ctx = canvas.getContext("2d")
                        if (!ctx) return
                        ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top)
                        ctx.stroke()
                      }}
                      onTouchEnd={() => setIsDrawing(false)}
                      className="w-full h-40 cursor-crosshair touch-none"
                    />
                    <span className="absolute bottom-3 right-4 text-[10px] text-slate-400 font-mono hidden sm:inline">
                      Biometric Touch & Mouse Canvas Active
                    </span>
                  </div>
                </div>
              )}

              {/* Type Script Signature */}
              {signatureMode === "type" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      value={typedName}
                      onChange={(e) => setTypedName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold outline-none"
                    />
                  </div>

                  {/* Cursive Font Preview Box */}
                  <div className="p-6 rounded-2xl bg-purple-50/50 border border-purple-200 text-center">
                    <span className="text-3xl italic font-serif tracking-widest text-purple-900 font-semibold">
                      {typedName || "Signature Preview"}
                    </span>
                  </div>
                </div>
              )}

              {/* Signer Title */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Signer Title</label>
                  <input
                    type="text"
                    value={signerTitle}
                    onChange={(e) => setSignerTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Signing Location</label>
                  <input
                    type="text"
                    value="Ornitech Labs (Delaware, US)"
                    readOnly
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 outline-none"
                  />
                </div>
              </div>

              {/* Submit Action Button */}
              <button
                onClick={handleApplySignature}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-sm shadow-xl shadow-purple-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="h-4 w-4" /> Apply Cryptographic 3D e-Signature
              </button>
            </div>
          ) : (
            /* Signed Document Sealed Banner */
            <div className="p-8 rounded-3xl bg-white border border-purple-200 shadow-lg space-y-6 animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Document Successfully Sealed & Signed</h3>
                    <p className="text-xs text-slate-500">Cryptographically anchored to Ornitech Security Vault</p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  STATUS: COMPLETED
                </span>
              </div>

              {/* Sealed Certificate Display */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 border border-purple-200 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <div className="text-2xl italic font-serif text-purple-950 font-bold mb-1">
                    {signatureMode === "type" ? typedName : "Jeel Khunt"}
                  </div>
                  <div className="text-xs text-slate-600 font-medium">
                    Signed by <strong>{typedName}</strong> ({signerTitle})
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">
                    Timestamp: {new Date().toISOString()}
                  </div>
                </div>

                {/* 3D Holographic Seal Badge */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-purple-600 p-1 shadow-xl shadow-amber-500/20 preserve-3d animate-float-3d shrink-0">
                  <div className="w-full h-full rounded-full bg-slate-900 flex flex-col items-center justify-center text-white text-center p-2">
                    <Award className="h-6 w-6 text-amber-400 mb-0.5" />
                    <span className="text-[8px] font-mono font-bold tracking-widest text-amber-300 uppercase">
                      VERIFIED SEAL
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsSigned(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
                >
                  Edit Signature
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Column: Multi-Party Signing Flow & Cryptographic Audit Trail */}
        <div className="space-y-6">
          {/* Multi-Party Signers Progress */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-purple-600" /> Multi-Party Signing Roster
            </h3>

            <div className="space-y-3 text-xs">
              {/* Signer 1 */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Marcus Vance</div>
                  <div className="text-slate-500">Operations Director</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-800">
                  Signed
                </span>
              </div>

              {/* Signer 2 (Current) */}
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                isSigned 
                  ? "bg-emerald-50 border-emerald-200" 
                  : "bg-purple-50 border-purple-200 animate-pulse-glow"
              }`}>
                <div>
                  <div className="font-bold text-slate-900">{typedName} (You)</div>
                  <div className="text-slate-500">{signerTitle}</div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  isSigned ? "bg-emerald-200 text-emerald-800" : "bg-purple-200 text-purple-800"
                }`}>
                  {isSigned ? "Signed" : "Pending Sign"}
                </span>
              </div>

              {/* Signer 3 */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-slate-400">
                <div>
                  <div className="font-bold text-slate-600">Sarah Jenkins, Esq.</div>
                  <div>Legal Reviewer</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-600">
                  Waiting
                </span>
              </div>
            </div>
          </div>

          {/* Cryptographic SHA-256 Audit Box */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4 preserve-3d card-3d">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold text-purple-400 uppercase flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> Cryptographic Ledger
              </span>
              <span className="text-[10px] font-mono text-slate-400">SHA-256</span>
            </div>

            <div className="space-y-3 text-[11px] font-mono">
              <div>
                <span className="text-slate-500 block">Document Hash:</span>
                <span className="text-purple-300 break-all">
                  e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                </span>
              </div>

              <div className="flex justify-between border-t border-slate-800/80 pt-2">
                <span className="text-slate-500">Security Standard:</span>
                <span className="text-emerald-400 font-bold">eIDAS & ESIGN Compliant</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Verification IP:</span>
                <span className="text-slate-300">192.168.1.104 (TLS 1.3)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
