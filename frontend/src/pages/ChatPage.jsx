import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { repoApi, aiApi } from '../services/api'
import { Send, Bot, User, Loader2, FolderGit2, Plus, MessageSquare, X, ChevronDown } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'

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

export default function ChatPage() {
  const { repoId } = useParams()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedRepo, setSelectedRepo] = useState(repoId ? Number(repoId) : null)
  const [conversations, setConversations] = useState([])
  const [activeConvId, setActiveConvId] = useState(null)
  const [showMobileHistory, setShowMobileHistory] = useState(false)
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

  // Mobile history open hone pe scroll band
  useEffect(() => {
    document.body.style.overflow = showMobileHistory ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showMobileHistory])

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

    const userMsg = { id: Date.now(), sender: 'USER', message: input }
    setMessages((m) => [...m, userMsg])
    const currentInput = input
    setInput('')
    setLoading(true)

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

  // ── History Panel (shared between desktop sidebar & mobile drawer)
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
          <p className="text-center text-gray-600 text-xs mt-6 px-4">
            No conversations yet. Start chatting!
          </p>
        ) : (
          <>
            <p className="text-xs text-gray-500 px-2 pb-2 uppercase tracking-wider font-medium">Recent</p>
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => openConversation(conv)}
                className={`w-full text-left flex items-start gap-2 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                  activeConvId === conv.id
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
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
    </div>
  )

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Desktop: Left History Sidebar ── */}
      <div className="hidden lg:flex w-60 bg-gray-950 border-r border-gray-800 flex-col flex-shrink-0">
        <HistoryPanel />
      </div>

      {/* ── Mobile: History Drawer Overlay ── */}
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
          <button
            onClick={() => setShowMobileHistory(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <HistoryPanel />
      </div>

      {/* ── Main Chat Area ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-3 border-b border-gray-800 bg-gray-900 flex-shrink-0">

          {/* Mobile: history toggle button */}
          <button
            onClick={() => setShowMobileHistory(true)}
            className="lg:hidden flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 text-gray-400 text-xs transition-colors flex-shrink-0"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>History</span>
          </button>

          {/* Bot icon + title */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-1.5 bg-brand-600/10 rounded-lg flex-shrink-0">
              <Bot className="w-4 h-4 text-brand-400" />
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold text-white text-sm leading-tight">AI Chat</h1>
              <p className="text-xs text-gray-500 truncate hidden sm:block">Ask questions about your code</p>
            </div>
          </div>

          {/* Repo selector */}
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

          {/* Mobile: New chat button */}
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
                {selectedRepo
                  ? 'Ask me anything about the selected repository!'
                  : 'Select a repository for context-aware answers, or ask any coding question!'}
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

        {/* Input */}
        <form onSubmit={sendMessage} className="px-3 py-3 border-t border-gray-800 bg-gray-900 flex-shrink-0">
          <div className="flex gap-2 items-end">
            <input
              ref={inputRef}
              type="text"
              className="input flex-1 text-sm py-2.5 min-w-0"
              placeholder={selectedRepo ? 'Ask about this repository...' : 'Ask anything...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              style={{ fontSize: '16px' }}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="btn-primary px-3 py-2.5 flex items-center gap-1.5 flex-shrink-0"
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}