import { useState } from "react";
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { repoApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { FolderGit2, CheckCircle2, Clock, MessageSquareCode, ArrowRight, Loader2 } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import qrImage from "../assets/gpay-qr.jpeg";

const UPI_ID = "abhishekpandey29632@oksbi";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { data: repos = [], isLoading } = useQuery({
    queryKey: ['repositories'],
    queryFn: () => repoApi.getAll().then((r) => r.data),
  })

  const [copied, setCopied] = useState(false);
  const [showDonateQR, setShowDonateQR] = useState(false);
  const [donationAmt, setDonationAmt] = useState(99);
  const [customAmt, setCustomAmt] = useState("");
  const AMOUNTS = [49, 99, 199, 499];
  const finalAmt = customAmt ? parseInt(customAmt) : donationAmt;

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = {
    total: repos.length,
    completed: repos.filter((r) => r.status === 'COMPLETED').length,
    failed: repos.filter((r) => r.status === 'FAILED').length,
    pending: repos.filter((r) => ['PENDING', 'CLONING', 'SCANNING'].includes(r.status)).length,
    reports: repos.reduce((a, r) => a + (r.reportCount || 0), 0),
  }

  return (
    <div className="p-8">

      {/* QR Modal */}
      {showDonateQR && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.7)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
        }} onClick={() => setShowDonateQR(false)}>
          <div style={{
            background: "white", borderRadius: "20px", padding: "2rem",
            textAlign: "center", maxWidth: "320px", width: "100%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "1rem" }}>
              <div style={{ background: "linear-gradient(135deg, #4285F4, #34A853, #FBBC05, #EA4335)", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "white", fontSize: "13px", fontWeight: "800" }}>G</span>
              </div>
              <span style={{ fontWeight: "700", fontSize: "16px", color: "#1F2937" }}>Pay</span>
              <span style={{ background: "#EEF2FF", color: "#4F46E5", fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "999px" }}>SCAN & PAY</span>
            </div>
            <div style={{ background: "#EEF2FF", color: "#4F46E5", fontWeight: "700", fontSize: "15px", padding: "8px 16px", borderRadius: "10px", marginBottom: "1rem" }}>
              ₹{finalAmt} donate karein
            </div>
            <div style={{ border: "2px solid #E0E7FF", borderRadius: "14px", padding: "10px", display: "inline-block", marginBottom: "1rem" }}>
              <img src={qrImage} alt="GPay QR" style={{ width: "180px", height: "180px", borderRadius: "8px", display: "block" }} />
            </div>
            <div style={{ fontWeight: "700", fontSize: "14px", color: "#1F2937", marginBottom: "4px" }}>Abhishekpandey9335</div>
            <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "1rem" }}>GPay, PhonePe, Paytm — kisi bhi UPI app se scan karein</div>
            <div onClick={copyUPI} style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: copied ? "#F0FDF4" : "#F9FAFB",
              border: `1px dashed ${copied ? "#34A853" : "#A5B4FC"}`,
              borderRadius: "10px", padding: "8px 16px", cursor: "pointer",
              fontSize: "13px", fontWeight: "600", color: copied ? "#16A34A" : "#4F46E5",
              marginBottom: "1rem", transition: "all 0.2s",
            }}>
              <span>{copied ? "✅" : "📋"}</span>
              <span>{UPI_ID}</span>
              <span style={{ fontSize: "11px", fontWeight: "400", color: copied ? "#16A34A" : "#9CA3AF" }}>
                {copied ? "Copied!" : "Copy"}
              </span>
            </div>
            <button onClick={() => setShowDonateQR(false)} style={{
              display: "block", width: "100%", padding: "10px",
              border: "1px solid #E5E7EB", borderRadius: "10px",
              cursor: "pointer", background: "white", color: "#6B7280", fontSize: "14px",
            }}>Close</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Welcome back, <span className="text-brand-400">{user?.displayName}</span> 👋
        </h1>
        <p className="text-gray-400 mt-1">Here's an overview of your AI-powered code analysis</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Repos', value: stats.total, icon: FolderGit2, color: 'text-brand-400', bg: 'bg-brand-600/10' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-600/10' },
          { label: 'In Progress', value: stats.pending, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-600/10' },
          { label: 'AI Reports', value: stats.reports, icon: MessageSquareCode, color: 'text-purple-400', bg: 'bg-purple-600/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`p-3 rounded-xl ${bg}`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{isLoading ? '–' : value}</p>
              <p className="text-sm text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Repos */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Recent Repositories</h2>
          <Link to="/repositories" className="text-brand-400 text-sm hover:text-brand-300 flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
          </div>
        ) : repos.length === 0 ? (
          <div className="text-center py-10">
            <FolderGit2 className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400">No repositories yet</p>
            <Link to="/repositories" className="btn-primary mt-4 inline-flex">Add Repository</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {repos.slice(0, 5).map((repo) => (
              <Link key={repo.id} to={`/repositories/${repo.id}`}
                className="flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors group">
                <div className="flex items-center gap-3">
                  <FolderGit2 className="w-5 h-5 text-brand-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-200 group-hover:text-white">{repo.repoName}</p>
                    <p className="text-xs text-gray-500">{repo.repoUrl}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{repo.reportCount} reports</span>
                  <StatusBadge status={repo.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Link to="/repositories" className="card hover:border-brand-600/50 transition-colors group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-600/10 rounded-xl">
              <FolderGit2 className="w-6 h-6 text-brand-400" />
            </div>
            <div>
              <p className="font-semibold text-white">Scan a Repository</p>
              <p className="text-sm text-gray-400">Add a GitHub repo for AI analysis</p>
            </div>
            <ArrowRight className="ml-auto text-gray-600 group-hover:text-brand-400 transition-colors" />
          </div>
        </Link>
        <Link to="/chat" className="card hover:border-brand-600/50 transition-colors group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-600/10 rounded-xl">
              <MessageSquareCode className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="font-semibold text-white">Chat with AI</p>
              <p className="text-sm text-gray-400">Ask questions about your code</p>
            </div>
            <ArrowRight className="ml-auto text-gray-600 group-hover:text-purple-400 transition-colors" />
          </div>
        </Link>
      </div>

      {/* ── Donate Footer ── */}
      <div style={{
        marginTop: "2.5rem",
        background: "linear-gradient(135deg, #1e1b4b 0%, #2e1065 100%)",
        border: "1px solid #3730a3",
        borderRadius: "20px",
        padding: "2rem",
        textAlign: "center",
      }}>
        <div style={{ display: "inline-block", background: "rgba(79,70,229,0.3)", border: "1px solid #4F46E5", color: "#a5b4fc", fontSize: "11px", fontWeight: "700", padding: "4px 14px", borderRadius: "999px", marginBottom: "0.75rem", letterSpacing: "1px" }}>
          ❤️ SUPPORT US
        </div>
        <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "white", marginBottom: "0.4rem" }}>
          Hamare Startup ko Support Karein 🚀
        </h3>
        <p style={{ color: "#a5b4fc", fontSize: "13px", marginBottom: "1.5rem", maxWidth: "380px", margin: "0 auto 1.5rem", lineHeight: "1.6" }}>
          Aapka ek chhota sa donation hamare AI platform ko aur behtar banata hai. Dil se shukriya! 🙏
        </p>

        {/* Amount Buttons */}
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap", marginBottom: "1rem" }}>
          {AMOUNTS.map((amt) => (
            <button key={amt}
              onClick={() => { setDonationAmt(amt); setCustomAmt(""); }}
              style={{
                padding: "8px 18px", borderRadius: "8px", fontWeight: "600", fontSize: "13px", cursor: "pointer",
                border: (donationAmt === amt && !customAmt) ? "2px solid #818cf8" : "1px solid #3730a3",
                background: (donationAmt === amt && !customAmt) ? "#4F46E5" : "rgba(79,70,229,0.15)",
                color: (donationAmt === amt && !customAmt) ? "white" : "#a5b4fc",
                transition: "all 0.15s",
              }}>
              ₹{amt}
            </button>
          ))}
        </div>

        {/* Custom Amount */}
        <div style={{ marginBottom: "1.25rem" }}>
          <input
            type="number"
            placeholder="Custom amount (₹)"
            value={customAmt}
            onChange={(e) => { setCustomAmt(e.target.value); setDonationAmt(null); }}
            style={{
              padding: "8px 14px", borderRadius: "8px",
              border: "1px solid #3730a3", fontSize: "13px", width: "180px",
              outline: "none", textAlign: "center",
              background: "rgba(255,255,255,0.05)", color: "white",
            }}
          />
        </div>

        {/* Pay Button */}
        <button
          onClick={() => setShowDonateQR(true)}
          style={{
            background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
            color: "white", border: "none",
            padding: "14px 40px", borderRadius: "12px", fontSize: "15px",
            fontWeight: "700", cursor: "pointer",
            boxShadow: "0 4px 20px rgba(79,70,229,0.5)",
            letterSpacing: "0.3px",
          }}>
          💸 Donate Now — ₹{finalAmt || "?"}
        </button>

        <p style={{ color: "#6366f1", fontSize: "11px", marginTop: "1rem" }}>
          ✨ GPay · PhonePe · Paytm · BHIM — koi bhi UPI app
        </p>
      </div>

    </div>
  )
}