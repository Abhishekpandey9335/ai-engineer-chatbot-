import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { repoApi, aiApi } from '../services/api'
import { Send, Bot, User, Loader2, FolderGit2, Plus, MessageSquare } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'

function Message({ msg }) {
  const isAI = msg.sender === 'AI' || msg.role === 'AI'
  return (
    <div className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isAI ? 'bg-brand-600' : 'bg-gray-700'}`}>
        {isAI ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
      </div>
      <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
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
  const bottomRef = useRef(null)

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
          id: idx,
          date,
          messages: msgs,
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

  const startNewChat = () => {
    setActiveConvId(null)
    setMessages([])
    setInput('')
  }

  const openConversation = (conv) => {
    setActiveConvId(conv.id)
    setMessages(conv.messages)
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
            id: Date.now(),
            date: 'Today',
            title: currentInput.length > 35 ? currentInput.substring(0, 35) + '...' : currentInput,
            messages: [userMsg, aiMsg],
          }
          setActiveConvId(newConv.id)
          return [newConv, ...prev]
        } else {
          return prev.map((c) =>
            c.id === activeConvId
              ? { ...c, messages: [...c.messages, userMsg, aiMsg] }
              : c
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

  return (
    <div className="flex h-full">

      {/* LEFT SIDEBAR */}
      <div className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col flex-shrink-0">
        <div className="p-3">
          <button
            onClick={startNewChat}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-700 hover:bg-gray-800 text-gray-300 text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {conversations.length === 0 ? (
            <p className="text-center text-gray-600 text-xs mt-8 px-4">
              No conversations yet. Start chatting!
            </p>
          ) : (
            <>
              <p className="text-xs text-gray-500 px-2 py-2 uppercase tracking-wider font-medium">
                Recent
              </p>
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

      {/* MAIN CHAT AREA */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 bg-gray-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-600/10 rounded-lg">
              <Bot className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h1 className="font-semibold text-white">AI Chat</h1>
              <p className="text-xs text-gray-400">Ask questions about your code</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-gray-400" />
            <select
              value={selectedRepo || ''}
              onChange={(e) => setSelectedRepo(e.target.value ? Number(e.target.value) : null)}
              className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500"
            >
              <option value="">General Chat</option>
              {completedRepos.map((r) => (
                <option key={r.id} value={r.id}>{r.repoName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="p-4 bg-brand-600/10 rounded-2xl mb-4">
                <Bot className="w-10 h-10 text-brand-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Engineer Agent</h3>
              <p className="text-gray-400 max-w-sm">
                {selectedRepo
                  ? 'Ask me anything about the selected repository!'
                  : 'Select a repository for context-aware answers, or ask any coding question!'}
              </p>
              <div className="grid grid-cols-1 gap-2 mt-4 w-full max-w-sm">
                {['What bugs can you find?', 'Explain the architecture', 'How can I improve this code?'].map((q) => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="text-left px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors"
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
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
                <span className="text-sm text-gray-400">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 border-t border-gray-800 bg-gray-900">
          <div className="flex gap-3">
            <input
              type="text"
              className="input flex-1"
              placeholder={selectedRepo ? 'Ask about this repository...' : 'Ask anything...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="btn-primary px-4 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}