import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { repoApi, aiApi } from '../services/api'
import { Send, Bot, User, Loader2, FolderGit2, Plus, MessageSquare, X, Crown, Zap, Star } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'
import qrImage from '../assets/gpay-qr.jpeg'

const FREE_LIMIT = 10
const UPI_ID = 'abhishekpandey29632@oksbi'
const UPI_NAME = 'Abhishek Pandey'

const PLANS = [
  {
    id: 'daily',
    name: 'Daily Pass',
    price: '₹5',
    duration: '24 Hours',
    icon: Zap,
    gradient: 'from-blue-500 to-cyan-500',
    borderColor: '#3b82f6',
    features: ['Unlimited messages for 24 hrs', 'Full AI access', 'No restrictions'],
  },
  {
    id: 'monthly',
    name: 'Monthly Plan',
    price: '₹99',
    duration: '1 Month',
    icon: Star,
    gradient: 'from-purple-500 to-pink-500',
    borderColor: '#a855f7',
    popular: true,
    features: ['Unlimited messages', 'Priority responses', 'Full AI access', '30-day validity'],
  },
  {
    id: 'bimonthly',
    name: '2-Month Plan',
    price: '₹149',
    duration: '2 Months',
    icon: Crown,
    gradient: 'from-yellow-500 to-orange-500',
    borderColor: '#f59e0b',
    features: ['Unlimited messages', 'Priority responses', 'Full AI access', '60-day validity', 'Best value!'],
  },
]

// ─────────────────────────────────────────────
// PREMIUM MODAL
// ─────────────────────────────────────────────
function PremiumModal({ onClose }) {
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [copied, setCopied] = useState(false)

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('UPI ID copied!')
  }

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.85)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#0f0f1a', border: '1px solid #2d2b55',
          borderRadius: '24px', width: '100%', maxWidth: '480px',
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 25px 80px rgba(79,70,229,0.3)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {!selectedPlan ? (
          <>
            {/* Header */}
            <div style={{ padding: '1.75rem 1.75rem 1.25rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'relative' }}>
              <button
                onClick={onClose}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '18px' }}
              >✕</button>
              <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, #f59e0b, #f97316)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Crown style={{ width: '26px', height: '26px', color: 'white' }} />
              </div>
              <h2 style={{ color: 'white', fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.5rem' }}>Upgrade to Premium</h2>
              <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: 1.6 }}>
                You've used your <span style={{ color: '#fbbf24', fontWeight: '700' }}>{FREE_LIMIT} free messages</span>.
                Choose a plan to continue chatting!
              </p>
            </div>

            {/* Plans */}
            <div style={{ padding: '1.25rem 1.5rem' }}>
              {PLANS.map((plan) => {
                const Icon = plan.icon
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    style={{
                      position: 'relative', border: `1px solid ${plan.borderColor}`,
                      borderRadius: '16px', background: 'rgba(255,255,255,0.04)',
                      padding: '1.1rem 1.25rem', marginBottom: '12px',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'scale(1.01)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'scale(1)' }}
                  >
                    {plan.popular && (
                      <span style={{
                        position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)',
                        background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                        color: 'white', fontSize: '10px', fontWeight: '800',
                        padding: '3px 14px', borderRadius: '999px', whiteSpace: 'nowrap', letterSpacing: '0.5px',
                      }}>MOST POPULAR</span>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `linear-gradient(135deg, ${plan.borderColor}, ${plan.borderColor}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon style={{ width: '18px', height: '18px', color: 'white' }} />
                        </div>
                        <div>
                          <p style={{ color: 'white', fontWeight: '700', fontSize: '15px', marginBottom: '2px' }}>{plan.name}</p>
                          <p style={{ color: '#6b7280', fontSize: '12px' }}>{plan.duration}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ color: plan.borderColor, fontSize: '1.6rem', fontWeight: '800' }}>{plan.price}</p>
                      </div>
                    </div>
                    <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {plan.features.map(f => (
                        <span key={f} style={{ background: 'rgba(255,255,255,0.06)', color: '#d1d5db', fontSize: '11px', padding: '3px 10px', borderRadius: '999px' }}>✓ {f}</span>
                      ))}
                    </div>
                    <button
                      style={{
                        marginTop: '12px', width: '100%', padding: '10px',
                        border: 'none', borderRadius: '10px', cursor: 'pointer',
                        background: `linear-gradient(135deg, ${plan.borderColor}, ${plan.borderColor}bb)`,
                        color: 'white', fontSize: '13px', fontWeight: '700',
                      }}
                    >
                      Select {plan.name} →
                    </button>
                  </div>
                )
              })}
            </div>
            <div style={{ padding: '0 1.5rem 1.5rem', textAlign: 'center' }}>
              <p style={{ color: '#374151', fontSize: '11px' }}>After payment, your plan will be activated manually within a few minutes.</p>
            </div>
          </>
        ) : (
          <>
            {/* Payment Screen */}
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                <button
                  onClick={() => setSelectedPlan(null)}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', cursor: 'pointer', borderRadius: '8px', padding: '6px 12px', fontSize: '13px' }}
                >← Back</button>
                <h2 style={{ color: 'white', fontWeight: '700', fontSize: '16px', flex: 1 }}>Pay for {selectedPlan.name}</h2>
                <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '18px' }}>✕</button>
              </div>

              {/* Plan summary */}
              <div style={{ border: `1px solid ${selectedPlan.borderColor}`, borderRadius: '14px', background: 'rgba(255,255,255,0.04)', padding: '1rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '4px' }}>{selectedPlan.name}</p>
                <p style={{ color: selectedPlan.borderColor, fontSize: '2.5rem', fontWeight: '800', margin: '0 0 4px' }}>{selectedPlan.price}</p>
                <p style={{ color: '#6b7280', fontSize: '12px' }}>{selectedPlan.duration}</p>
              </div>

              {/* QR Code - Real Image */}
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <p style={{ color: 'white', fontWeight: '600', fontSize: '14px', marginBottom: '1rem' }}>Scan QR Code to Pay</p>

                {/* GPay header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '1rem' }}>
                  <div style={{ background: 'linear-gradient(135deg, #4285F4, #34A853, #FBBC05, #EA4335)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: 'white', fontSize: '13px', fontWeight: '800' }}>G</span>
                  </div>
                  <span style={{ fontWeight: '700', fontSize: '15px', color: 'white' }}>Pay</span>
                  <span style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8', fontSize: '10px', fontWeight: '700', padding: '2px 10px', borderRadius: '999px', border: '1px solid #4338ca' }}>SCAN & PAY</span>
                </div>

                {/* Actual QR image */}
                <div style={{ background: 'white', border: `3px solid ${selectedPlan.borderColor}`, borderRadius: '16px', padding: '10px', display: 'inline-block', marginBottom: '1rem' }}>
                  <img src={qrImage} alt="GPay QR" style={{ width: '180px', height: '180px', borderRadius: '8px', display: 'block' }} />
                </div>

                <div style={{ fontWeight: '700', fontSize: '14px', color: 'white', marginBottom: '4px' }}>Abhishekpandey9335</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '1.25rem' }}>GPay · PhonePe · Paytm · BHIM</div>

                {/* UPI ID copy */}
                <div
                  onClick={copyUPI}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '10px',
                    background: copied ? 'rgba(34,197,94,0.1)' : 'rgba(99,102,241,0.1)',
                    border: `1px dashed ${copied ? '#22c55e' : '#4F46E5'}`,
                    borderRadius: '10px', padding: '10px 18px', cursor: 'pointer',
                    fontSize: '13px', fontWeight: '600',
                    color: copied ? '#22c55e' : '#818cf8',
                    transition: 'all 0.2s', width: '100%', justifyContent: 'center',
                    marginBottom: '1.25rem',
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{copied ? '✅' : '📋'}</span>
                  <span>{UPI_ID}</span>
                  <span style={{ fontSize: '11px', fontWeight: '400', opacity: 0.7 }}>{copied ? 'Copied!' : 'Copy'}</span>
                </div>
              </div>

              {/* Warning note */}
              <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '12px', padding: '12px', marginBottom: '1.25rem', textAlign: 'center' }}>
                <p style={{ color: '#fbbf24', fontSize: '12px' }}>
                  ⚠️ After payment, send screenshot on WhatsApp/email to activate your plan. Plan will be activated within a few minutes.
                </p>
              </div>

              <button
                onClick={onClose}
                style={{
                  width: '100%', padding: '12px', border: 'none', borderRadius: '12px',
                  cursor: 'pointer', background: `linear-gradient(135deg, ${selectedPlan.borderColor}, ${selectedPlan.borderColor}bb)`,
                  color: 'white', fontSize: '14px', fontWeight: '700',
                }}
              >
                ✓ I've Completed Payment
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// MESSAGE COMPONENT (unchanged)
// ─────────────────────────────────────────────
function Message({ msg }) {
  const isAI = msg.sender === 'AI' || msg.role === 'AI'
  return (
    <div className={`flex gap-2 ${isAI ? '' : 'flex-row-reverse'}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${isAI ? 'bg-brand-600' : 'bg-gray-700'}`}>
        {isAI ? <Bot className="w-3.5 h-3.5 text-white" /> : <User className="w-3.5 h-3.5 text-white" />}
      </div>
      <div className={`max-w-[80%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${
        isAI
          ? 'bg-gray-800 text-gray-200 rounded-tl-sm'
          : 'bg-brand-600 text-white rounded-tr-sm'
      }`}>
        {isAI ? (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{msg.message || msg.content || ''}</ReactMarkdown>
          </div>
        ) : (
          <p>{msg.message || msg.content || ''}</p>
        )}
      </div>
    </div>
  )
}

function getConversationTitle(messages) {
  const firstUserMsg = messages.find((m) => m.sender === 'USER')
  if (!firstUserMsg) return 'New Conversation'
  const text = firstUserMsg.message || ''
  return text.length > 35 ? text.substring(0, 35) + '...' : text
}

function groupByDate(messages) {
  const groups = {}
  messages.forEach((msg) => {
    let dateLabel = 'Today'
    if (msg.createdAt) {
      const d = Array.isArray(msg.createdAt)
        ? new Date(msg.createdAt[0], msg.createdAt[1] - 1, msg.createdAt[2])
        : new Date(msg.createdAt)
      dateLabel = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    }
    if (!groups[dateLabel]) groups[dateLabel] = []
    groups[dateLabel].push(msg)
  })
  return groups
}

// ─────────────────────────────────────────────
// MAIN CHAT PAGE
// ─────────────────────────────────────────────
export default function ChatPage() {
  const { repoId } = useParams()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedRepo, setSelectedRepo] = useState(repoId ? Number(repoId) : null)
  const [conversations, setConversations] = useState([])
  const [activeConvId, setActiveConvId] = useState(null)
  const [showMobileHistory, setShowMobileHistory] = useState(false)

  // ── Premium state ──
  const [showPremium, setShowPremium] = useState(false)
  const [msgCount, setMsgCount] = useState(() => {
    return parseInt(localStorage.getItem('freeMsgCount') || '0', 10)
  })
  const [isPremium] = useState(() => {
    return localStorage.getItem('isPremium') === 'true'
  })

  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const { data: repos = [] } = useQuery({
    queryKey: ['repositories'],
    queryFn: () => repoApi.getAll().then((r) => r.data),
  })

  useQuery({
    queryKey: ['chatHistory', selectedRepo],
    queryFn: () => aiApi.getChatHistory(selectedRepo).then((r) => r.data),
    onSuccess: (data) => {
      if (data && data.length > 0) {
        const grouped = groupByDate(data)
        const convList = Object.entries(grouped).map(([date, msgs], idx) => ({
          id: idx, date, messages: msgs,
          title: getConversationTitle(msgs),
        }))
        setConversations(convList.reverse())
        if (activeConvId === null && convList.length > 0) {
          const latest = convList[0]
          setActiveConvId(latest.id)
          setMessages(latest.messages)
        }
      }
    },
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (repoId) setSelectedRepo(Number(repoId))
  }, [repoId])

  useEffect(() => {
    document.body.style.overflow = showMobileHistory ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showMobileHistory])

  useEffect(() => {
    localStorage.setItem('freeMsgCount', String(msgCount))
  }, [msgCount])

  const startNewChat = () => {
    setActiveConvId(null)
    setMessages([])
    setInput('')
    setShowMobileHistory(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const openConversation = (conv) => {
    setActiveConvId(conv.id)
    setMessages(conv.messages)
    setShowMobileHistory(false)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    // ── FREE LIMIT CHECK ──
    if (!isPremium && msgCount >= FREE_LIMIT) {
      setShowPremium(true)
      return
    }

    const userMsg = { id: Date.now(), sender: 'USER', message: input }
    setMessages((m) => [...m, userMsg])
    const currentInput = input
    setInput('')
    setLoading(true)

    if (!isPremium) {
      setMsgCount((prev) => prev + 1)
    }

    try {
      const { data } = await aiApi.chat({ message: currentInput, repositoryId: selectedRepo })
      const aiMsg = { id: Date.now() + 1, sender: 'AI', message: data.reply }
      setMessages((m) => [...m, aiMsg])

      setConversations((prev) => {
        if (activeConvId === null) {
          const newConv = {
            id: Date.now(), date: 'Today',
            title: currentInput.length > 35 ? currentInput.substring(0, 35) + '...' : currentInput,
            messages: [userMsg, aiMsg],
          }
          setActiveConvId(newConv.id)
          return [newConv, ...prev]
        } else {
          return prev.map((c) =>
            c.id === activeConvId ? { ...c, messages: [...c.messages, userMsg, aiMsg] } : c
          )
        }
      })
    } catch (err) {
      toast.error('Failed to get AI response')
      setMessages((m) => m.filter((msg) => msg.id !== userMsg.id))
    } finally {
      setLoading(false)
    }
  }

  const completedRepos = repos.filter((r) => r.status === 'COMPLETED')

  const HistoryPanel = () => (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-800">
        <button
          onClick={startNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-700 hover:bg-gray-800 text-gray-300 text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {conversations.length === 0 ? (
          <p className="text-center text-gray-600 text-xs mt-6 px-4">No conversations yet. Start chatting!</p>
        ) : (
          <>
            <p className="text-xs text-gray-500 px-2 pb-2 uppercase tracking-wider font-medium">Recent</p>
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => openConversation(conv)}
                className={`w-full text-left flex items-start gap-2 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                  activeConvId === conv.id ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{conv.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{conv.date}</p>
                </div>
              </button>
            ))}
          </>
        )}
      </div>

      {/* Free messages counter - sidebar bottom */}
      {!isPremium && (
        <div className="p-3 border-t border-gray-800">
          <div className="bg-gray-800 rounded-lg p-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-400">Free Messages</span>
              <span className={`text-xs font-semibold ${msgCount >= FREE_LIMIT ? 'text-red-400' : 'text-gray-300'}`}>
                {Math.min(msgCount, FREE_LIMIT)}/{FREE_LIMIT}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  msgCount >= FREE_LIMIT ? 'bg-red-500' : msgCount >= FREE_LIMIT * 0.7 ? 'bg-yellow-500' : 'bg-brand-500'
                }`}
                style={{ width: `${Math.min((msgCount / FREE_LIMIT) * 100, 100)}%` }}
              />
            </div>
            {msgCount >= FREE_LIMIT && (
              <button
                onClick={() => setShowPremium(true)}
                className="mt-2 w-full text-xs py-1.5 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
              >
                ⚡ Upgrade to Premium
              </button>
            )}
          </div>
        </div>
      )}

      {isPremium && (
        <div className="p-3 border-t border-gray-800">
          <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <p className="text-xs font-semibold" style={{ color: '#fbbf24' }}>👑 Premium Active</p>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="flex h-full overflow-hidden">

      {/* Premium Modal */}
      {showPremium && <PremiumModal onClose={() => setShowPremium(false)} />}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-60 bg-gray-950 border-r border-gray-800 flex-col flex-shrink-0">
        <HistoryPanel />
      </div>

      {/* Mobile Overlay */}
      {showMobileHistory && (
        <div
          className="fixed inset-0 z-50 bg-black/60 lg:hidden"
          style={{ backdropFilter: 'blur(2px)' }}
          onClick={() => setShowMobileHistory(false)}
        />
      )}
      <div
        className="fixed top-0 left-0 h-full w-72 bg-gray-900 border-r border-gray-800 z-50 flex flex-col lg:hidden transition-transform duration-300 ease-in-out"
        style={{ transform: showMobileHistory ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
          <span className="font-semibold text-white text-sm">Chat History</span>
          <button onClick={() => setShowMobileHistory(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800">
            <X className="w-4 h-4" />
          </button>
        </div>
        <HistoryPanel />
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-3 border-b border-gray-800 bg-gray-900 flex-shrink-0">
          <button
            onClick={() => setShowMobileHistory(true)}
            className="lg:hidden flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 text-gray-400 text-xs transition-colors flex-shrink-0"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>History</span>
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-1.5 bg-brand-600/10 rounded-lg flex-shrink-0">
              <Bot className="w-4 h-4 text-brand-400" />
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold text-white text-sm leading-tight">AI Chat</h1>
              <p className="text-xs text-gray-500 truncate hidden sm:block">Ask questions about your code</p>
            </div>
          </div>

          {/* Premium badge in header */}
          {!isPremium && (
            <button
              onClick={() => setShowPremium(true)}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0"
              style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }}
            >
              <Crown className="w-3 h-3" />
              {msgCount >= FREE_LIMIT ? 'Upgrade Now' : `${FREE_LIMIT - msgCount} left`}
            </button>
          )}
          {isPremium && (
            <span className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }}>
              <Crown className="w-3 h-3" /> Premium
            </span>
          )}

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <FolderGit2 className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
            <select
              value={selectedRepo || ''}
              onChange={(e) => setSelectedRepo(e.target.value ? Number(e.target.value) : null)}
              className="bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-brand-500 max-w-[130px] sm:max-w-[180px]"
            >
              <option value="">General Chat</option>
              {completedRepos.map((r) => (
                <option key={r.id} value={r.id}>{r.repoName}</option>
              ))}
            </select>
          </div>

          <button
            onClick={startNewChat}
            className="lg:hidden p-2 rounded-lg border border-gray-700 hover:bg-gray-800 text-gray-400 transition-colors flex-shrink-0"
            title="New Chat"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="p-4 bg-brand-600/10 rounded-2xl mb-3">
                <Bot className="w-8 h-8 text-brand-400" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">AI Engineer Agent</h3>
              <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
                {selectedRepo ? 'Ask me anything about the selected repository!' : 'Select a repository for context-aware answers, or ask any coding question!'}
              </p>
              <div className="flex flex-col gap-2 mt-4 w-full max-w-xs">
                {['What bugs can you find?', 'Explain the architecture', 'How can I improve this code?'].map((q) => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); inputRef.current?.focus() }}
                    className="text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <Message key={msg.id} msg={msg} />
          ))}

          {loading && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-gray-800 px-3 py-2.5 rounded-2xl rounded-tl-sm flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
                <span className="text-sm text-gray-400">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <form onSubmit={sendMessage} className="px-3 py-3 border-t border-gray-800 bg-gray-900 flex-shrink-0">
          {/* Warning: 2 messages remaining */}
          {!isPremium && msgCount >= FREE_LIMIT - 2 && msgCount < FREE_LIMIT && (
            <div className="mb-2 px-3 py-2 rounded-lg text-center" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
              <p className="text-xs" style={{ color: '#fbbf24' }}>
                ⚠️ Only <strong>{FREE_LIMIT - msgCount}</strong> free message{FREE_LIMIT - msgCount > 1 ? 's' : ''} remaining!{' '}
                <button type="button" onClick={() => setShowPremium(true)} style={{ textDecoration: 'underline', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', color: '#fbbf24' }}>
                  Upgrade now
                </button>
              </p>
            </div>
          )}
          {/* Limit reached */}
          {!isPremium && msgCount >= FREE_LIMIT && (
            <div className="mb-2 px-3 py-2 rounded-lg text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <p className="text-xs" style={{ color: '#f87171' }}>
                🔒 Free limit reached.{' '}
                <button type="button" onClick={() => setShowPremium(true)} style={{ textDecoration: 'underline', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', color: '#fbbf24' }}>
                  Upgrade to Premium
                </button>{' '}
                to continue chatting.
              </p>
            </div>
          )}
          <div className="flex gap-2 items-end">
            <input
              ref={inputRef}
              type="text"
              className="input flex-1 text-sm py-2.5 min-w-0"
              placeholder={
                !isPremium && msgCount >= FREE_LIMIT
                  ? '🔒 Upgrade to Premium to send more messages...'
                  : selectedRepo
                  ? 'Ask about this repository...'
                  : 'Ask anything...'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading || (!isPremium && msgCount >= FREE_LIMIT)}
              style={{ fontSize: '16px' }}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading || (!isPremium && msgCount >= FREE_LIMIT)}
              className="btn-primary px-3 py-2.5 flex items-center gap-1.5 flex-shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}