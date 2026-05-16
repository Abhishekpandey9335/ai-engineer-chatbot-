import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => !!s.token);

  const handleFeatureClick = (route) => {
    if (isAuthenticated) {
      navigate(route);
    } else {
      navigate("/signup");
    }
  };

  const handleRazorpay = (amount, planName) => {
    const options = {
      key: "YOUR_RAZORPAY_KEY_ID", // Razorpay dashboard se key lo
      amount: amount * 100, // paise mein
      currency: "INR",
      name: "AI Engineer Agent",
      description: `${planName} Plan`,
      image: "https://ai-engineer-chatbot.vercel.app/favicon.ico",
      handler: function (response) {
        alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
        navigate("/signup");
      },
      prefill: {
        name: "",
        email: "",
      },
      theme: {
        color: "#4F46E5",
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const loadRazorpay = (amount, planName) => {
    if (window.Razorpay) {
      handleRazorpay(amount, planName);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => handleRazorpay(amount, planName);
    document.body.appendChild(script);
  };

  const features = [
    {
      icon: "🐛",
      title: "Bug Detection",
      desc: "AI automatically finds bugs and suggests fixes in your code",
      route: "/repositories",
    },
    {
      icon: "🔒",
      title: "Security Audit",
      desc: "Detect security vulnerabilities in your codebase instantly",
      route: "/repositories",
    },
    {
      icon: "💬",
      title: "AI Chat",
      desc: "Chat directly with your codebase — ask anything about your code",
      route: "/chat",
    },
    {
      icon: "📊",
      title: "Analytics",
      desc: "Track your repo health, reports, and activity over time",
      route: "/analytics",
    },
  ];

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "960px", margin: "0 auto", padding: "2rem 1rem" }}>

      {/* Navbar */}
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

      {/* Hero */}
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

      {/* Features */}
      <div style={{ marginBottom: "3rem" }}>
        <h2 style={{ textAlign: "center", fontWeight: "700", marginBottom: "1.5rem", fontSize: "1.5rem" }}>What can you do?</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          {features.map((f) => (
            <div key={f.title}
              onClick={() => handleFeatureClick(f.route)}
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

      {/* Pricing */}
      <div style={{ marginBottom: "3rem" }}>
        <h2 style={{ textAlign: "center", fontWeight: "700", marginBottom: "0.5rem", fontSize: "1.5rem" }}>Plans & Pricing</h2>
        <p style={{ textAlign: "center", color: "#6B7280", fontSize: "14px", marginBottom: "1.5rem" }}>
          Start free, upgrade when you need more
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>

          {/* Free Plan */}
          <div style={{ border: "1px solid #E5E7EB", borderRadius: "12px", padding: "1.5rem" }}>
            <div style={{ fontWeight: "600", marginBottom: "8px" }}>Free</div>
            <div style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "4px" }}>₹0</div>
            <div style={{ color: "#6B7280", fontSize: "13px", marginBottom: "16px" }}>Always free</div>
            {["2 repos/month", "Basic code review", "AI chat (10 messages)"].map(f => (
              <div key={f} style={{ fontSize: "13px", marginBottom: "6px" }}>✅ {f}</div>
            ))}
            <button
              onClick={() => navigate("/signup")}
              style={{ width: "100%", marginTop: "16px", padding: "10px", border: "1px solid #D1D5DB", borderRadius: "8px", cursor: "pointer", background: "white" }}>
              Get Started
            </button>
          </div>

          {/* Pro Plan */}
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
            <button
              onClick={() => loadRazorpay(299, "Pro")}
              style={{ width: "100%", marginTop: "16px", padding: "10px", border: "none", borderRadius: "8px", cursor: "pointer", background: "#4F46E5", color: "white", fontWeight: "600" }}>
              Buy Now — ₹299/mo
            </button>
          </div>

          {/* Team Plan */}
          <div style={{ border: "1px solid #E5E7EB", borderRadius: "12px", padding: "1.5rem" }}>
            <div style={{ fontWeight: "600", marginBottom: "8px" }}>Team</div>
            <div style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "4px" }}>
              ₹999<span style={{ fontSize: "14px", fontWeight: "400", color: "#6B7280" }}>/mo</span>
            </div>
            <div style={{ color: "#6B7280", fontSize: "13px", marginBottom: "16px" }}>For teams & startups</div>
            {["5 team members", "Shared dashboard", "Custom reports", "Dedicated support"].map(f => (
              <div key={f} style={{ fontSize: "13px", marginBottom: "6px" }}>✅ {f}</div>
            ))}
            <button
              onClick={() => loadRazorpay(999, "Team")}
              style={{ width: "100%", marginTop: "16px", padding: "10px", border: "1px solid #D1D5DB", borderRadius: "8px", cursor: "pointer", background: "white" }}>
              Buy Now — ₹999/mo
            </button>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", color: "#9CA3AF", fontSize: "13px", paddingTop: "2rem", borderTop: "1px solid #E5E7EB" }}>
        AI Engineer Agent · Built with Spring Boot + React + GPT-4o
      </div>
    </div>
  );
}