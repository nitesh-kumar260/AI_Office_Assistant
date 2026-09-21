import { useState, useEffect } from "react";
import {
  ScanLine,
  Trash2,
  CheckCircle2,
  RefreshCw,
  FileSpreadsheet,
  UserCheck,
  CreditCard,
  Building2,
  Copy,
  Database
} from "lucide-react";


type DocType = "invoice" | "pan" | "aadhaar" | "gst";

interface ExtractionItem {
  _id: string;
  documentType: DocType;
  fileName: string;
  extractedData: Record<string, string>;
  createdAt: string;
}

export function Extract_Info() {
  const [activeType, setActiveType] = useState<DocType>("invoice");
  const [history, setHistory] = useState<ExtractionItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ExtractionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [fileName, setFileName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const backendUrl = "http://localhost:5000/api/extractions";

  // Fetch extraction logs from backend
  const fetchHistory = async (selectLatest = false) => {
    try {
      setLoading(true);
      const res = await fetch(backendUrl);
      if (!res.ok) throw new Error("Failed to fetch extraction history");
      const data = await res.json();
      setHistory(data);
      if (selectLatest && data.length > 0) {
        setSelectedItem(data[0]);
      } else if (data.length > 0 && !selectedItem) {
        setSelectedItem(data[0]);
      }
    } catch (err) {
      console.warn("Backend connection offline.", err);
      setHistory([]);
      setSelectedItem(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Simulated OCR parsing logic based on Document Type
  const getMockExtractedFields = (type: DocType, name: string): Record<string, string> => {
    const formattedName = name.split(".")[0].replace(/[_-]/g, " ").toUpperCase();

    switch (type) {
      case "invoice":
        return {
          invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          vendorName: formattedName || "GLOBAL TECH SUPPLIERS",
          gstin: `27${Math.random().toString(36).substring(2, 12).toUpperCase()}1Z${Math.floor(Math.random() * 9)}`,
          billingDate: new Date().toISOString().split("T")[0],
          dueDate: new Date(Date.now() + 30 * 24 * 3600000).toISOString().split("T")[0],
          taxableAmount: "85,400.00",
          cgst: "7,686.00",
          sgst: "7,686.00",
          totalAmount: "1,00,772.00",
          paymentStatus: "Pending Approval"
        };
      case "pan":
        return {
          panNumber: `${Math.random().toString(36).substring(2, 7).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}${Math.random().toString(36).substring(2, 3).toUpperCase()}`,
          fullName: "Ravi",
          fatherName: "Dharmesh",
          dateOfBirth: "2001-05-14",
          signaturePresent: "Verified"
        };
      case "aadhaar":
        return {
          aadhaarNumber: `${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
          fullName: "Ravi",
          gender: "Male",
          dateOfBirth: "2001-05-14",
          address: "G-12, Salt Lake Sector V, Kolkata, West Bengal - 700091"
        };
      case "gst":
        return {
          gstin: `19${Math.random().toString(36).substring(2, 12).toUpperCase()}2Z${Math.floor(Math.random() * 9)}`,
          legalName: "ORNITECH INTELLIGENCE LABS PRIVATE LIMITED",
          tradeName: "Ornitech Intelligence Labs",
          constitutionOfBusiness: "Private Limited Company",
          dateOfLiability: "2025-10-12",
          registrationType: "Regular"
        };
    }
  };

  const processFile = async (file: File) => {
    setFileName(file.name);
    setIsScanning(true);

    // Simulate scanning animation progress (2.5 seconds)
    setTimeout(async () => {
      const extractedData = getMockExtractedFields(activeType, file.name);

      try {
        // Save extraction to MongoDB via Backend
        const res = await fetch(backendUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentType: activeType,
            fileName: file.name,
            extractedData
          })
        });

        if (res.ok) {
          fetchHistory(true);
        } else {
          throw new Error("Failed to save to backend database");
        }
      } catch (err) {
        console.warn("Backend unavailable, adding to history locally.", err);
        const newLocalItem: ExtractionItem = {
          _id: "local-ext-" + Date.now(),
          documentType: activeType,
          fileName: file.name,
          extractedData,
          createdAt: new Date().toISOString()
        };
        setHistory(prev => [newLocalItem, ...prev]);
        setSelectedItem(newLocalItem);
      } finally {
        setIsScanning(false);
      }
    }, 2500);
  };

  // Delete extraction record
  const handleDeleteRecord = async (id: string) => {
    try {
      if (id.startsWith("mock-") || id.startsWith("local-")) {
        setHistory(prev => prev.filter(item => item._id !== id));
        if (selectedItem?._id === id) setSelectedItem(null);
        return;
      }

      const res = await fetch(`${backendUrl}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete record");

      setHistory(prev => prev.filter(item => item._id !== id));
      if (selectedItem?._id === id) setSelectedItem(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Copy field to clipboard
  const handleCopy = (val: string, fieldName: string) => {
    navigator.clipboard.writeText(val);
    setCopySuccess(fieldName);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  // Details title cleaner
  const getFieldLabel = (key: string): string => {
    const labels: Record<string, string> = {
      invoiceNumber: "Invoice Number",
      vendorName: "Vendor Name",
      gstin: "GSTIN / Tax ID",
      billingDate: "Billing Date",
      dueDate: "Payment Due Date",
      taxableAmount: "Taxable Value (INR)",
      cgst: "CGST (9%)",
      sgst: "SGST (9%)",
      totalAmount: "Total Value (INR)",
      paymentStatus: "Invoice Status",
      panNumber: "PAN Number",
      fullName: "Full Name",
      fatherName: "Father's Name",
      dateOfBirth: "Date of Birth",
      signaturePresent: "Signature Audit",
      aadhaarNumber: "Aadhaar Card Number",
      gender: "Gender",
      address: "Residential Address",
      legalName: "Legal Business Name",
      tradeName: "Trade Name",
      constitutionOfBusiness: "Business Type",
      dateOfLiability: "Effective Registration Date",
      registrationType: "Registration Type"
    };
    return labels[key] || key.replace(/([A-Z])/g, " $1").trim();
  };

  const getDocTypeColor = (type: DocType): string => {
    const colors = {
      invoice: "from-purple-500 to-indigo-600 bg-purple-50 text-purple-700 border-purple-100",
      pan: "from-purple-500 to-indigo-600 bg-purple-50 text-purple-700 border-purple-100",
      aadhaar: "from-purple-500 to-indigo-600 bg-purple-50 text-purple-700 border-purple-100",
      gst: "from-purple-500 to-indigo-600 bg-purple-50 text-purple-700 border-purple-100"
    };
    return colors[type] || "from-purple-500 to-indigo-600 bg-purple-50 text-purple-700 border-purple-100";
  };

  const getDocTypeIcon = (type: DocType) => {
    switch (type) {
      case "invoice": return <FileSpreadsheet className="h-5 w-5" />;
      case "pan": return <CreditCard className="h-5 w-5" />;
      case "aadhaar": return <UserCheck className="h-5 w-5" />;
      case "gst": return <Building2 className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-900/10 via-indigo-900/5 to-slate-900/10 border border-purple-500/20 glass-panel">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 preserve-3d animate-float-3d">
            <ScanLine className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Identity & Invoice Extractor
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-100 text-purple-700 border border-purple-200">
                AI Parser
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Extract structural details from Invoices, PAN Cards, Aadhaar Cards, and GST certificates. Parsed data is committed to MongoDB collections.
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchHistory()}
          className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all flex items-center gap-2 cursor-pointer bg-white"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Select document type selectors */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(["invoice", "pan", "aadhaar", "gst"] as DocType[]).map((type) => {
          const isActive = activeType === type;
          const config = {
            invoice: { label: "Invoices", desc: "Receipts & Bills" },
            pan: { label: "PAN Card", desc: "Tax Identity Card" },
            aadhaar: { label: "Aadhaar Card", desc: "Resident Identity" },
            gst: { label: "GST Certificate", desc: "Business Tax Cert" }
          }[type];

          return (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`p-5 rounded-2xl border transition-all text-left flex flex-col justify-between h-28 cursor-pointer relative overflow-hidden group ${isActive
                ? `border-purple-600 shadow-md ring-2 ring-purple-500/10`
                : "border-slate-200 bg-white hover:border-purple-300 hover:shadow"
                }`}
            >
              {isActive && (
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-tr ${getDocTypeColor(type).split(" ")[0]} ${getDocTypeColor(type).split(" ")[1]} opacity-5 rounded-bl-full pointer-events-none`} />
              )}

              <div className={`p-2.5 rounded-xl border shrink-0 ${isActive ? getDocTypeColor(type).split(" ").slice(2).join(" ") : "bg-slate-50 border-slate-100 text-slate-500 group-hover:text-purple-600 transition-colors"
                }`}>
                {getDocTypeIcon(type)}
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-800">{config.label}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{config.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Upload drop panel */}
        <div className="lg:col-span-1 space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`p-8 rounded-3xl border-2 border-dashed transition-all relative overflow-hidden flex flex-col items-center justify-center min-h-[280px] text-center bg-white shadow-sm ${dragActive
              ? "border-purple-600 bg-purple-50/30 shadow-lg"
              : "border-slate-300 hover:border-purple-400"
              }`}
          >
            <input
              type="file"
              id="extractor-file-upload"
              accept="image/*,.pdf"
              onChange={handleFileInput}
              disabled={isScanning}
              className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />

            {isScanning ? (
              <div className="space-y-4">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 border-4 border-purple-100 rounded-full" />
                  <div className="absolute inset-0 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  <ScanLine className="h-6 w-6 text-purple-600 absolute top-5 left-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Analyzing Document Structure</h4>
                  <p className="text-xs text-slate-400 mt-1 truncate max-w-[200px] mx-auto">{fileName}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 rounded-2xl bg-purple-50 text-purple-600 mb-4">
                  <ScanLine className="h-8 w-8" />
                </div>
                <h3 className="text-md font-bold text-slate-800">
                  Drop {activeType.toUpperCase()} file here
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                  Supports scan formats (JPG, PNG, PDF)
                </p>
                <span className="mt-4 px-4 py-2 bg-slate-950 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-all cursor-pointer">
                  Select Document
                </span>
              </>
            )}

            {/* Glowing scanning laser line */}
            {isScanning && (
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-scan-laser z-10" />
            )}
          </div>

          {/* History log list */}
          <div className="glass-panel p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
            <h4 className="text-xs font-black tracking-wider text-slate-400 uppercase flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Database className="h-4 w-4 text-indigo-500" />
                Extraction History
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-50 border border-slate-100 font-bold">
                {history.length} Saved
              </span>
            </h4>

            {loading ? (
              <div className="py-12 flex justify-center">
                <RefreshCw className="h-5 w-5 animate-spin text-purple-600" />
              </div>
            ) : history.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No saved extractions found in database.</p>
            ) : (
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${selectedItem?._id === item._id
                      ? "bg-purple-50/55 border-purple-200"
                      : "border-slate-100 hover:border-purple-200 hover:bg-slate-50/50 bg-white"
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg border text-xs shrink-0 ${getDocTypeColor(item.documentType).split(" ").slice(2).join(" ")
                        }`}>
                        {getDocTypeIcon(item.documentType)}
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-slate-800 truncate">
                          {item.fileName}
                        </h5>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRecord(item._id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Extracted Details Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm min-h-[460px] flex flex-col">

            {selectedItem ? (
              <div className="flex-1 flex flex-col">
                {/* Panel Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border text-sm ${getDocTypeColor(selectedItem.documentType).split(" ").slice(2).join(" ")
                      }`}>
                      {getDocTypeIcon(selectedItem.documentType)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-md flex items-center gap-2">
                        {selectedItem.fileName}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        Document Type: {selectedItem.documentType.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Extraction Validated
                  </span>
                </div>

                {/* Grid Fields List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                  {Object.entries(selectedItem.extractedData).map(([key, val]) => (
                    <div
                      key={key}
                      className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-purple-200 hover:bg-white transition-all flex items-center justify-between group"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-sans block">
                          {getFieldLabel(key)}
                        </span>
                        <span className="text-sm font-bold text-slate-800 font-mono break-all pr-4">
                          {val}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopy(val, key)}
                        className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer shrink-0"
                        title="Copy to Clipboard"
                      >
                        {copySuccess === key ? (
                          <span className="text-[10px] font-bold text-purple-600">Copied!</span>
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                  <span className="font-mono">
                    ID: {selectedItem._id}
                  </span>
                  <span>
                    Indexed: {new Date(selectedItem.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 py-16">
                <ScanLine className="h-16 w-16 text-slate-200 animate-pulse-glow" />
                <h4 className="font-bold text-slate-700 mt-4">No Document Selected</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
                  Select a past extraction record from the list or drop a new scan to start parsing metadata.
                </p>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
export default Extract_Info;
