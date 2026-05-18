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

  const handleRazorpay = (amount, planName) => {
    const options = {
      key: "YOUR_RAZORPAY_KEY_ID",
      amount: amount * 100,
      currency: "INR",
      name: "AI Engineer Agent",
      description: `${planName} Plan`,
      image: "https://ai-engineer-chatbot.vercel.app/favicon.ico",
      handler: function (response) {
        alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
        navigate("/signup");
      },
      prefill: { name: "", email: "" },
      theme: { color: "#4F46E5" },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const loadRazorpay = (amount, planName) => {
    if (window.Razorpay) { handleRazorpay(amount, planName); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => handleRazorpay(amount, planName);
    document.body.appendChild(script);
  };

  const features = [
    { icon: "🐛", title: "Bug Detection", desc: "AI automatically finds bugs and suggests fixes in your code", route: "/repositories" },
    { icon: "🔒", title: "Security Audit", desc: "Detect security vulnerabilities in your codebase instantly", route: "/repositories" },
    { icon: "💬", title: "AI Chat", desc: "Chat directly with your codebase — ask anything about your code", route: "/chat" },
    { icon: "📊", title: "Analytics", desc: "Track your repo health, reports, and activity over time", route: "/analytics" },
  ];

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "960px", margin: "0 auto", padding: "2rem 1rem" }}>

      {/* ── Navbar ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
        <div style={{ fontWeight: "700", fontSize: "18px" }}>🤖 AI Engineer Agent</div>
        <div style={{ display: "flex", gap: "12px" }}>
          {isAuthenticated ? (
            <button onClick={() => navigate("/dashboard")}
              style={{ padding: "8px 18px", border: "none", borderRadius: "8px", background: "#4F46E5", color: "white", cursor: "pointer" }}>
              Go to Dashboard
            </button>
          ) : (
            <>
              <button onClick={() => navigate("/login")}
                style={{ padding: "8px 18px", border: "1px solid #D1D5DB", borderRadius: "8px", background: "white", cursor: "pointer" }}>
                Login
              </button>
              <button onClick={() => navigate("/signup")}
                style={{ padding: "8px 18px", border: "none", borderRadius: "8px", background: "#4F46E5", color: "white", cursor: "pointer" }}>
                Sign Up Free
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Hero ── */}
      <div style={{ textAlign: "center", padding: "2rem 0 3rem" }}>
        <div style={{ display: "inline-block", background: "#EEF2FF", color: "#4F46E5", fontSize: "12px", padding: "4px 14px", borderRadius: "999px", marginBottom: "1.5rem" }}>
          ✨ Powered by GPT-4o
        </div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "700", lineHeight: "1.3", marginBottom: "1rem" }}>
          Paste your GitHub repo URL<br />
          <span style={{ color: "#4F46E5" }}>AI will review your code instantly</span>
        </h1>
        <p style={{ color: "#6B7280", fontSize: "16px", maxWidth: "500px", margin: "0 auto 2rem", lineHeight: "1.6" }}>
          Bug detection, security audit, AI chat — all in one place. Complete analysis in 60 seconds.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button onClick={() => navigate(isAuthenticated ? "/dashboard" : "/signup")}
            style={{ background: "#4F46E5", color: "white", border: "none", padding: "14px 32px", borderRadius: "10px", fontSize: "16px", cursor: "pointer", fontWeight: "600" }}>
            Get Started Free →
          </button>
          {!isAuthenticated && (
            <button onClick={() => navigate("/login")}
              style={{ background: "white", color: "#374151", border: "1px solid #D1D5DB", padding: "14px 32px", borderRadius: "10px", fontSize: "16px", cursor: "pointer" }}>
              Login
            </button>
          )}
        </div>
      </div>

      {/* ── Features ── */}
      <div style={{ marginBottom: "3rem" }}>
        <h2 style={{ textAlign: "center", fontWeight: "700", marginBottom: "1.5rem", fontSize: "1.5rem" }}>What can you do?</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          {features.map((f) => (
            <div key={f.title} onClick={() => handleFeatureClick(f.route)}
              style={{ border: "1px solid #E5E7EB", borderRadius: "12px", padding: "1.5rem", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#4F46E5"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#E5E7EB"}>
              <div style={{ fontSize: "2rem", marginBottom: "10px" }}>{f.icon}</div>
              <h3 style={{ fontWeight: "600", marginBottom: "6px" }}>{f.title}</h3>
              <p style={{ color: "#6B7280", fontSize: "13px", lineHeight: "1.5", marginBottom: "12px" }}>{f.desc}</p>
              <span style={{ color: "#4F46E5", fontSize: "13px", fontWeight: "500" }}>
                {isAuthenticated ? "Open →" : "Try it →"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Pricing ── */}
      <div style={{ marginBottom: "3rem" }}>
        <h2 style={{ textAlign: "center", fontWeight: "700", marginBottom: "0.5rem", fontSize: "1.5rem" }}>Plans & Pricing</h2>
        <p style={{ textAlign: "center", color: "#6B7280", fontSize: "14px", marginBottom: "1.5rem" }}>
          Start free, upgrade when you need more
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>

          {/* Free */}
          <div style={{ border: "1px solid #E5E7EB", borderRadius: "12px", padding: "1.5rem" }}>
            <div style={{ fontWeight: "600", marginBottom: "8px" }}>Free</div>
            <div style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "4px" }}>₹0</div>
            <div style={{ color: "#6B7280", fontSize: "13px", marginBottom: "16px" }}>Always free</div>
            {["2 repos/month", "Basic code review", "AI chat (10 messages)"].map(f => (
              <div key={f} style={{ fontSize: "13px", marginBottom: "6px" }}>✅ {f}</div>
            ))}
            <button onClick={() => navigate("/signup")}
              style={{ width: "100%", marginTop: "16px", padding: "10px", border: "1px solid #D1D5DB", borderRadius: "8px", cursor: "pointer", background: "white" }}>
              Get Started
            </button>
          </div>

          {/* Pro */}
          <div style={{ border: "2px solid #4F46E5", borderRadius: "12px", padding: "1.5rem", position: "relative" }}>
            <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "#4F46E5", color: "white", fontSize: "11px", padding: "3px 14px", borderRadius: "999px", whiteSpace: "nowrap" }}>
              Most Popular
            </div>
            <div style={{ fontWeight: "600", marginBottom: "8px" }}>Pro</div>
            <div style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "4px" }}>
              ₹299<span style={{ fontSize: "14px", fontWeight: "400", color: "#6B7280" }}>/mo</span>
            </div>
            <div style={{ color: "#6B7280", fontSize: "13px", marginBottom: "16px" }}>For serious developers</div>
            {["Unlimited repos", "All AI features", "Security audit", "Priority support"].map(f => (
              <div key={f} style={{ fontSize: "13px", marginBottom: "6px" }}>✅ {f}</div>
            ))}
            <button onClick={() => loadRazorpay(299, "Pro")}
              style={{ width: "100%", marginTop: "16px", padding: "10px", border: "none", borderRadius: "8px", cursor: "pointer", background: "#4F46E5", color: "white", fontWeight: "600" }}>
              Buy Now — ₹299/mo
            </button>
          </div>

          {/* Team */}
          <div style={{ border: "1px solid #E5E7EB", borderRadius: "12px", padding: "1.5rem" }}>
            <div style={{ fontWeight: "600", marginBottom: "8px" }}>Team</div>
            <div style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "4px" }}>
              ₹999<span style={{ fontSize: "14px", fontWeight: "400", color: "#6B7280" }}>/mo</span>
            </div>
            <div style={{ color: "#6B7280", fontSize: "13px", marginBottom: "16px" }}>For teams & startups</div>
            {["5 team members", "Shared dashboard", "Custom reports", "Dedicated support"].map(f => (
              <div key={f} style={{ fontSize: "13px", marginBottom: "6px" }}>✅ {f}</div>
            ))}
            <button onClick={() => loadRazorpay(999, "Team")}
              style={{ width: "100%", marginTop: "16px", padding: "10px", border: "1px solid #D1D5DB", borderRadius: "8px", cursor: "pointer", background: "white" }}>
              Buy Now — ₹999/mo
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
              💛 DONATE SECTION
      ══════════════════════════════════════ */}
      <div style={{
        marginBottom: "3rem",
        background: "linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)",
        border: "1px solid #C7D2FE",
        borderRadius: "20px",
        padding: "2.5rem 2rem",
        textAlign: "center",
      }}>

        <div style={{ display: "inline-block", background: "#EEF2FF", border: "1px solid #C7D2FE", color: "#4F46E5", fontSize: "11px", fontWeight: "700", padding: "4px 14px", borderRadius: "999px", marginBottom: "1rem", letterSpacing: "1px" }}>
          ❤️ SUPPORT US
        </div>

        <h2 style={{ fontSize: "1.75rem", fontWeight: "700", marginBottom: "0.5rem", color: "#1F2937" }}>
          Donate for Our Startup 🚀
        </h2>
        <p style={{ color: "#6B7280", fontSize: "14px", maxWidth: "420px", margin: "0 auto 2rem", lineHeight: "1.7" }}>
          Aapka ek chhota sa support hamare AI platform ko aur behtar banane mein help karega. Dil se shukriya! 🙏
        </p>

        {/* Amount Buttons */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginBottom: "1rem" }}>
          {AMOUNTS.map((amt) => (
            <button key={amt}
              onClick={() => { setDonationAmt(amt); setCustomAmt(""); }}
              style={{
                padding: "10px 22px", borderRadius: "10px", fontWeight: "600", fontSize: "14px", cursor: "pointer",
                border: (donationAmt === amt && !customAmt) ? "2px solid #4F46E5" : "1px solid #D1D5DB",
                background: (donationAmt === amt && !customAmt) ? "#4F46E5" : "white",
                color: (donationAmt === amt && !customAmt) ? "white" : "#374151",
                transition: "all 0.15s",
              }}>
              ₹{amt}
            </button>
          ))}
        </div>

        {/* Custom Amount */}
        <div style={{ marginBottom: "1.5rem" }}>
          <input
            type="number"
            placeholder="Ya custom amount daalein (₹)"
            value={customAmt}
            onChange={(e) => { setCustomAmt(e.target.value); setDonationAmt(null); }}
            style={{ padding: "10px 16px", borderRadius: "10px", border: "1px solid #D1D5DB", fontSize: "14px", width: "220px", outline: "none", textAlign: "center" }}
          />
        </div>

        {finalAmt > 0 && (
          <p style={{ color: "#4F46E5", fontWeight: "700", fontSize: "15px", marginBottom: "1.5rem" }}>
            Aap ₹{finalAmt} donate karenge 🎉
          </p>
        )}

        {/* ── QR Code Card ── */}
        <div style={{
          background: "white",
          border: "1px solid #E0E7FF",
          borderRadius: "20px",
          padding: "2rem 2rem 1.5rem",
          display: "inline-block",
          margin: "0 auto 1.75rem",
          boxShadow: "0 4px 24px rgba(79,70,229,0.10)",
          minWidth: "240px",
        }}>
          {/* GPay logo row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "1rem" }}>
            <div style={{ background: "linear-gradient(135deg, #4285F4, #34A853, #FBBC05, #EA4335)", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontSize: "13px", fontWeight: "800" }}>G</span>
            </div>
            <span style={{ fontWeight: "700", fontSize: "16px", color: "#1F2937", letterSpacing: "0.5px" }}>Pay</span>
            <span style={{ background: "#EEF2FF", color: "#4F46E5", fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "999px" }}>SCAN & PAY</span>
          </div>

          {/* QR Image */}
          <div style={{
            background: "white",
            border: "2px solid #E0E7FF",
            borderRadius: "14px",
            padding: "10px",
            display: "inline-block",
            marginBottom: "1rem",
          }}>
            <img
              src={qrImage}
              alt="GPay QR Code — abhishekpandey29632@oksbi"
              style={{ width: "180px", height: "180px", display: "block", borderRadius: "8px" }}
            />
          </div>

          {/* Name */}
          <div style={{ fontWeight: "700", fontSize: "15px", color: "#1F2937", marginBottom: "4px" }}>
            Abhishekpandey9335
          </div>
          <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "1rem" }}>
            Scan with GPay, PhonePe, Paytm — any UPI app
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
            <div style={{ flex: 1, height: "1px", background: "#E5E7EB" }} />
            <span style={{ color: "#9CA3AF", fontSize: "11px" }}>ya UPI ID copy karein</span>
            <div style={{ flex: 1, height: "1px", background: "#E5E7EB" }} />
          </div>

          {/* UPI ID Copy Chip */}
          <div
            onClick={copyUPI}
            style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              background: copied ? "#F0FDF4" : "#F9FAFB",
              border: `1px dashed ${copied ? "#34A853" : "#A5B4FC"}`,
              borderRadius: "10px", padding: "10px 18px",
              cursor: "pointer", fontSize: "13px",
              fontWeight: "600", color: copied ? "#16A34A" : "#4F46E5",
              transition: "all 0.2s",
            }}>
            <span style={{ fontSize: "16px" }}>{copied ? "✅" : "📋"}</span>
            <span>{UPI_ID}</span>
            <span style={{ fontSize: "11px", fontWeight: "400", color: copied ? "#16A34A" : "#9CA3AF" }}>
              {copied ? "Copied!" : "Copy"}
            </span>
          </div>
        </div>

        {/* Thank You Message */}
        {thankYou && (
          <div style={{
            background: "#F0FDF4", border: "1px solid #86EFAC",
            color: "#16A34A", borderRadius: "10px", padding: "12px 20px",
            fontSize: "14px", fontWeight: "600", maxWidth: "360px", margin: "0 auto 1rem",
          }}>
            🎉 Bahut shukriya! Aapka support hamare liye bahut mayne rakhta hai! ❤️
          </div>
        )}

        {/* Help text */}
        <p style={{ color: "#9CA3AF", fontSize: "12px", marginTop: "0.5rem" }}>
          ✨ Koi bhi UPI app se pay kar sakte ho — GPay, PhonePe, Paytm, BHIM
        </p>
      </div>

      {/* ── Footer ── */}
      <div style={{ textAlign: "center", color: "#9CA3AF", fontSize: "13px", paddingTop: "2rem", borderTop: "1px solid #E5E7EB" }}>
        AI Engineer Agent · Built with Spring Boot + React + GPT-4o
      </div>
    </div>
  );
}