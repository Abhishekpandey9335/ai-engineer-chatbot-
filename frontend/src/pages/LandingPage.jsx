import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import qrImage from "../assets/gpay-qr.jpeg";

const UPI_ID = "abhishekpandey29632@oksbi";
const UPI_NAME = "Abhishek Pandey";

export default function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => !!s.token);

  const [donationAmt, setDonationAmt] = useState(99);
  const [customAmt, setCustomAmt] = useState("");
  const [copied, setCopied] = useState(false);
  const [thankYou, setThankYou] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showProQR, setShowProQR] = useState(false);
  const [showTeamQR, setShowTeamQR] = useState(false);

  const AMOUNTS = [49, 99, 199, 499];
  const finalAmt = customAmt ? parseInt(customAmt) : donationAmt;

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setThankYou(true);
    setTimeout(() => setCopied(false), 2000);
    setTimeout(() => setThankYou(false), 5000);
  };

  const handleFeatureClick = (route) => {
    if (isAuthenticated) navigate(route);
    else navigate("/signup");
  };

  const QRModal = ({ amount, onClose }) => (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.85)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
      backdropFilter: "blur(4px)",
    }} onClick={onClose}>
      <div style={{
        background: "#0f0f1a", border: "1px solid #2d2b55",
        borderRadius: "24px", padding: "2rem",
        textAlign: "center", maxWidth: "340px", width: "100%",
        boxShadow: "0 25px 80px rgba(79,70,229,0.3)",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "1rem" }}>
          <div style={{ background: "linear-gradient(135deg, #4285F4, #34A853, #FBBC05, #EA4335)", borderRadius: "50%", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontSize: "14px", fontWeight: "800" }}>G</span>
          </div>
          <span style={{ fontWeight: "700", fontSize: "17px", color: "white" }}>Pay</span>
          <span style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8", fontSize: "10px", fontWeight: "700", padding: "3px 10px", borderRadius: "999px", border: "1px solid #4338ca" }}>SCAN & PAY</span>
        </div>
        {amount > 0 && (
          <div style={{ background: "rgba(99,102,241,0.15)", border: "1px solid #4338ca", color: "#a5b4fc", fontWeight: "700", fontSize: "16px", padding: "10px 20px", borderRadius: "12px", marginBottom: "1.25rem" }}>
            ₹{amount} pay karein
          </div>
        )}
        <div style={{ background: "white", border: "3px solid #4F46E5", borderRadius: "16px", padding: "12px", display: "inline-block", marginBottom: "1.25rem" }}>
          <img src={qrImage} alt="GPay QR" style={{ width: "190px", height: "190px", borderRadius: "8px", display: "block" }} />
        </div>
        <div style={{ fontWeight: "700", fontSize: "15px", color: "white", marginBottom: "4px" }}>Abhishekpandey9335</div>
        <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "1.25rem" }}>GPay · PhonePe · Paytm · BHIM</div>
        <div onClick={copyUPI} style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: copied ? "rgba(34,197,94,0.1)" : "rgba(99,102,241,0.1)",
          border: `1px dashed ${copied ? "#22c55e" : "#4F46E5"}`,
          borderRadius: "10px", padding: "10px 16px", cursor: "pointer",
          fontSize: "13px", fontWeight: "600", color: copied ? "#22c55e" : "#818cf8",
          marginBottom: "1.25rem", transition: "all 0.2s", width: "100%", justifyContent: "center",
        }}>
          <span>{copied ? "✅" : "📋"}</span>
          <span>{UPI_ID}</span>
          <span style={{ fontSize: "11px", fontWeight: "400", opacity: 0.7 }}>{copied ? "Copied!" : "Copy"}</span>
        </div>
        <button onClick={onClose} style={{
          display: "block", width: "100%", padding: "11px",
          border: "1px solid #2d2b55", borderRadius: "12px",
          cursor: "pointer", background: "transparent", color: "#6b7280", fontSize: "14px",
        }}>✕ Close</button>
      </div>
    </div>
  );

  const features = [
    { icon: "🐛", title: "Bug Detection", desc: "AI automatically finds and fixes bugs in your codebase instantly", route: "/repositories" },
    { icon: "🔒", title: "Security Audit", desc: "Detect critical security vulnerabilities before they reach production", route: "/repositories" },
    { icon: "💬", title: "AI Chat", desc: "Chat directly with your codebase — ask anything about your code", route: "/chat" },
    { icon: "📊", title: "Analytics", desc: "Track repo health, generate reports, and monitor activity over time", route: "/analytics" },
  ];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#050510", minHeight: "100vh", color: "white" }}>

      {/* QR Modals */}
      {showQR && <QRModal amount={finalAmt} onClose={() => setShowQR(false)} />}
      {showProQR && <QRModal amount={299} onClose={() => setShowProQR(false)} />}
      {showTeamQR && <QRModal amount={999} onClose={() => setShowTeamQR(false)} />}

      {/* ── Navbar ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(5,5,16,0.85)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0 2rem",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", height: "64px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, #4F46E5, #7C3AED)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>🤖</div>
            <span style={{ fontWeight: "700", fontSize: "17px", letterSpacing: "-0.3px" }}>AI Engineer Agent</span>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {isAuthenticated ? (
              <button onClick={() => navigate("/dashboard")} style={{ padding: "9px 20px", border: "none", borderRadius: "10px", background: "linear-gradient(135deg, #4F46E5, #7C3AED)", color: "white", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}>
                Dashboard →
              </button>
            ) : (
              <>
                <button onClick={() => navigate("/login")} style={{ padding: "9px 20px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", background: "transparent", color: "#d1d5db", cursor: "pointer", fontSize: "14px" }}>
                  Login
                </button>
                <button onClick={() => navigate("/signup")} style={{ padding: "9px 20px", border: "none", borderRadius: "10px", background: "linear-gradient(135deg, #4F46E5, #7C3AED)", color: "white", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}>
                  Get Started Free
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 2rem" }}>

        {/* ── Hero ── */}
        <div style={{ textAlign: "center", padding: "6rem 0 5rem", position: "relative" }}>
          {/* Glow */}
          <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "300px", background: "radial-gradient(ellipse, rgba(79,70,229,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc", fontSize: "12px", fontWeight: "600", padding: "6px 16px", borderRadius: "999px", marginBottom: "2rem", letterSpacing: "0.3px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4F46E5", display: "inline-block" }}></span>
            Powered by GPT-4o · Spring Boot · React
          </div>

          <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", fontWeight: "800", lineHeight: "1.15", marginBottom: "1.5rem", letterSpacing: "-1px" }}>
            AI-powered code review<br />
            <span style={{ background: "linear-gradient(135deg, #818cf8, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              for modern developers
            </span>
          </h1>

          <p style={{ color: "#9ca3af", fontSize: "18px", maxWidth: "520px", margin: "0 auto 2.5rem", lineHeight: "1.7" }}>
            Paste your GitHub repo URL and get instant bug detection, security audits, and AI-powered insights in under 60 seconds.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate(isAuthenticated ? "/dashboard" : "/signup")}
              style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)", color: "white", border: "none", padding: "15px 36px", borderRadius: "12px", fontSize: "16px", cursor: "pointer", fontWeight: "700", letterSpacing: "0.2px", boxShadow: "0 0 40px rgba(79,70,229,0.4)" }}>
              Start for Free →
            </button>
            {!isAuthenticated && (
              <button onClick={() => navigate("/login")}
                style={{ background: "transparent", color: "#d1d5db", border: "1px solid rgba(255,255,255,0.12)", padding: "15px 36px", borderRadius: "12px", fontSize: "16px", cursor: "pointer" }}>
                Sign In
              </button>
            )}
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", justifyContent: "center", gap: "3rem", marginTop: "4rem", flexWrap: "wrap" }}>
            {[["10K+", "Repos Scanned"], ["99%", "Bug Detection Rate"], ["60s", "Avg Analysis Time"]].map(([val, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.75rem", fontWeight: "800", background: "linear-gradient(135deg, #818cf8, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{val}</div>
                <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Features ── */}
        <div style={{ marginBottom: "5rem" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={{ display: "inline-block", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#818cf8", fontSize: "11px", fontWeight: "700", padding: "4px 14px", borderRadius: "999px", marginBottom: "1rem", letterSpacing: "1px" }}>
              FEATURES
            </div>
            <h2 style={{ fontSize: "2rem", fontWeight: "700", letterSpacing: "-0.5px" }}>Everything you need</h2>
            <p style={{ color: "#6b7280", marginTop: "0.5rem", fontSize: "15px" }}>Powerful tools to ship better, safer code</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            {features.map((f) => (
              <div key={f.title} onClick={() => handleFeatureClick(f.route)}
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "1.75rem", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.08)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}>
                <div style={{ fontSize: "2rem", marginBottom: "14px" }}>{f.icon}</div>
                <h3 style={{ fontWeight: "700", marginBottom: "8px", fontSize: "16px" }}>{f.title}</h3>
                <p style={{ color: "#6b7280", fontSize: "13px", lineHeight: "1.6", marginBottom: "16px" }}>{f.desc}</p>
                <span style={{ color: "#818cf8", fontSize: "13px", fontWeight: "600" }}>
                  {isAuthenticated ? "Open →" : "Try it →"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Pricing ── */}
        <div style={{ marginBottom: "5rem" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={{ display: "inline-block", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#818cf8", fontSize: "11px", fontWeight: "700", padding: "4px 14px", borderRadius: "999px", marginBottom: "1rem", letterSpacing: "1px" }}>
              PRICING
            </div>
            <h2 style={{ fontSize: "2rem", fontWeight: "700", letterSpacing: "-0.5px" }}>Simple, transparent pricing</h2>
            <p style={{ color: "#6b7280", marginTop: "0.5rem", fontSize: "15px" }}>Start free, upgrade when you need more power</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", alignItems: "start" }}>

            {/* Free */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "2rem" }}>
              <div style={{ fontWeight: "700", fontSize: "15px", marginBottom: "8px", color: "#9ca3af" }}>Free</div>
              <div style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "4px" }}>₹0</div>
              <div style={{ color: "#6b7280", fontSize: "13px", marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Forever free</div>
              {["2 repos/month", "Basic code review", "AI chat (10 messages)"].map(f => (
                <div key={f} style={{ fontSize: "13px", marginBottom: "10px", color: "#d1d5db", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80", fontSize: "12px" }}>✓</span> {f}
                </div>
              ))}
              <button onClick={() => navigate("/signup")} style={{ width: "100%", marginTop: "1.5rem", padding: "12px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", cursor: "pointer", background: "transparent", color: "#d1d5db", fontSize: "14px", fontWeight: "600" }}>
                Get Started
              </button>
            </div>

            {/* Pro */}
            <div style={{ background: "linear-gradient(135deg, rgba(79,70,229,0.15), rgba(124,58,237,0.1))", border: "1px solid rgba(99,102,241,0.5)", borderRadius: "20px", padding: "2rem", position: "relative" }}>
              <div style={{ position: "absolute", top: "-13px", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #4F46E5, #7C3AED)", color: "white", fontSize: "11px", fontWeight: "700", padding: "4px 16px", borderRadius: "999px", whiteSpace: "nowrap", letterSpacing: "0.5px" }}>
                ⚡ MOST POPULAR
              </div>
              <div style={{ fontWeight: "700", fontSize: "15px", marginBottom: "8px", color: "#a5b4fc" }}>Pro</div>
              <div style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "4px" }}>₹299</div>
              <div style={{ color: "#6b7280", fontSize: "13px", marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>per month</div>
              {["Unlimited repos", "All AI features", "Security audit", "Priority support"].map(f => (
                <div key={f} style={{ fontSize: "13px", marginBottom: "10px", color: "#d1d5db", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80", fontSize: "12px" }}>✓</span> {f}
                </div>
              ))}
              <button onClick={() => setShowProQR(true)} style={{ width: "100%", marginTop: "1.5rem", padding: "12px", border: "none", borderRadius: "10px", cursor: "pointer", background: "linear-gradient(135deg, #4F46E5, #7C3AED)", color: "white", fontSize: "14px", fontWeight: "700", boxShadow: "0 0 30px rgba(79,70,229,0.4)" }}>
                Buy Now — ₹299/mo
              </button>
            </div>

            {/* Team */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "2rem" }}>
              <div style={{ fontWeight: "700", fontSize: "15px", marginBottom: "8px", color: "#9ca3af" }}>Team</div>
              <div style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "4px" }}>₹999</div>
              <div style={{ color: "#6b7280", fontSize: "13px", marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>per month</div>
              {["5 team members", "Shared dashboard", "Custom reports", "Dedicated support"].map(f => (
                <div key={f} style={{ fontSize: "13px", marginBottom: "10px", color: "#d1d5db", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80", fontSize: "12px" }}>✓</span> {f}
                </div>
              ))}
              <button onClick={() => setShowTeamQR(true)} style={{ width: "100%", marginTop: "1.5rem", padding: "12px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", cursor: "pointer", background: "transparent", color: "#d1d5db", fontSize: "14px", fontWeight: "600" }}>
                Buy Now — ₹999/mo
              </button>
            </div>
          </div>
        </div>

        {/* ══ DONATE SECTION — DARK ══ */}
        <div style={{
          marginBottom: "4rem",
          background: "linear-gradient(135deg, #0a0a1f 0%, #0d0b24 50%, #0a0a1f 100%)",
          border: "1px solid rgba(99,102,241,0.25)",
          borderRadius: "24px",
          padding: "3rem 2rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Background glow */}
          <div style={{ position: "absolute", top: "-50%", left: "50%", transform: "translateX(-50%)", width: "500px", height: "300px", background: "radial-gradient(ellipse, rgba(79,70,229,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", fontSize: "11px", fontWeight: "700", padding: "5px 14px", borderRadius: "999px", marginBottom: "1.25rem", letterSpacing: "1px" }}>
              ❤️ SUPPORT OUR MISSION
            </div>

            <h2 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "0.75rem", letterSpacing: "-0.5px" }}>
              Fuel the Future of AI Dev Tools
            </h2>
            <p style={{ color: "#6b7280", fontSize: "15px", maxWidth: "440px", margin: "0 auto 2.5rem", lineHeight: "1.75" }}>
              Aapka ek chhota sa support hamare indie AI platform ko aur powerful banata hai. Dil se shukriya! 🙏
            </p>

            {/* Amount Buttons */}
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginBottom: "1.25rem" }}>
              {AMOUNTS.map((amt) => (
                <button key={amt}
                  onClick={() => { setDonationAmt(amt); setCustomAmt(""); }}
                  style={{
                    padding: "10px 24px", borderRadius: "10px", fontWeight: "700", fontSize: "14px", cursor: "pointer",
                    border: (donationAmt === amt && !customAmt) ? "1.5px solid #4F46E5" : "1px solid rgba(255,255,255,0.1)",
                    background: (donationAmt === amt && !customAmt) ? "linear-gradient(135deg, #4F46E5, #7C3AED)" : "rgba(255,255,255,0.04)",
                    color: (donationAmt === amt && !customAmt) ? "white" : "#9ca3af",
                    transition: "all 0.15s",
                    boxShadow: (donationAmt === amt && !customAmt) ? "0 0 20px rgba(79,70,229,0.3)" : "none",
                  }}>
                  ₹{amt}
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div style={{ marginBottom: "2rem" }}>
              <input
                type="number"
                placeholder="Custom amount (₹)"
                value={customAmt}
                onChange={(e) => { setCustomAmt(e.target.value); setDonationAmt(null); }}
                style={{
                  padding: "10px 18px", borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontSize: "14px", width: "200px", outline: "none",
                  textAlign: "center", background: "rgba(255,255,255,0.05)",
                  color: "white",
                }}
              />
            </div>

            {finalAmt > 0 && (
              <p style={{ color: "#a5b4fc", fontWeight: "700", fontSize: "15px", marginBottom: "1.75rem" }}>
                Aap ₹{finalAmt} donate karenge ✨
              </p>
            )}

            {/* Pay Button */}
            <button onClick={() => setShowQR(true)} style={{
              background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
              color: "white", border: "none",
              padding: "16px 52px", borderRadius: "14px", fontSize: "16px",
              fontWeight: "700", cursor: "pointer",
              boxShadow: "0 0 50px rgba(79,70,229,0.45)",
              letterSpacing: "0.3px", marginBottom: "2.5rem",
              transition: "all 0.2s",
            }}>
              💸 Pay Now — ₹{finalAmt || "?"}
            </button>

            {/* QR Card */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(99,102,241,0.2)",
              borderRadius: "20px",
              padding: "1.75rem",
              display: "inline-block",
              marginBottom: "1.5rem",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "1.25rem" }}>
                <div style={{ background: "linear-gradient(135deg, #4285F4, #34A853, #FBBC05, #EA4335)", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "white", fontSize: "13px", fontWeight: "800" }}>G</span>
                </div>
                <span style={{ fontWeight: "700", fontSize: "15px", color: "white" }}>Pay</span>
                <span style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8", fontSize: "10px", fontWeight: "700", padding: "2px 10px", borderRadius: "999px", border: "1px solid #4338ca" }}>SCAN & PAY</span>
              </div>

              <div style={{ background: "white", border: "3px solid #4F46E5", borderRadius: "14px", padding: "10px", display: "inline-block", marginBottom: "1.25rem" }}>
                <img src={qrImage} alt="GPay QR Code" style={{ width: "175px", height: "175px", display: "block", borderRadius: "8px" }} />
              </div>

              <div style={{ fontWeight: "700", fontSize: "15px", color: "white", marginBottom: "4px" }}>Abhishekpandey9335</div>
              <div style={{ fontSize: "12px", color: "#4b5563", marginBottom: "1.25rem" }}>GPay · PhonePe · Paytm · BHIM</div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
                <span style={{ color: "#4b5563", fontSize: "11px" }}>ya UPI ID copy karein</span>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
              </div>

              <div onClick={copyUPI} style={{
                display: "inline-flex", alignItems: "center", gap: "10px",
                background: copied ? "rgba(34,197,94,0.1)" : "rgba(99,102,241,0.08)",
                border: `1px dashed ${copied ? "#22c55e" : "#4F46E5"}`,
                borderRadius: "10px", padding: "10px 18px", cursor: "pointer",
                fontSize: "13px", fontWeight: "600",
                color: copied ? "#22c55e" : "#818cf8", transition: "all 0.2s",
              }}>
                <span style={{ fontSize: "16px" }}>{copied ? "✅" : "📋"}</span>
                <span>{UPI_ID}</span>
                <span style={{ fontSize: "11px", fontWeight: "400", opacity: 0.7 }}>{copied ? "Copied!" : "Copy"}</span>
              </div>
            </div>

            {thankYou && (
              <div style={{
                background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
                color: "#4ade80", borderRadius: "12px", padding: "12px 24px",
                fontSize: "14px", fontWeight: "600", maxWidth: "380px", margin: "0 auto 1rem",
              }}>
                🎉 Bahut shukriya! Aapka support hamare liye bahut mayne rakhta hai! ❤️
              </div>
            )}

            <p style={{ color: "#374151", fontSize: "12px", marginTop: "1rem" }}>
              ✨ Koi bhi UPI app se pay kar sakte ho — GPay · PhonePe · Paytm · BHIM
            </p>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "2rem", textAlign: "center" }}>
        <div style={{ color: "#374151", fontSize: "13px" }}>
          © 2025 AI Engineer Agent · Built with Spring Boot + React + GPT-4o
        </div>
      </div>
    </div>
  );
}