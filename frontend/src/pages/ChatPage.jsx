import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { repoApi, aiApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { Send, Bot, User, Loader2, FolderGit2 } from 'lucide-react'
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

export default function ChatPage() {
  const { repoId } = useParams()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedRepo, setSelectedRepo] = useState(repoId ? Number(repoId) : null)
  const bottomRef = useRef(null)

  const { data: repos = [] } = useQuery({
    queryKey: ['repositories'],
    queryFn: () => repoApi.getAll().then((r) => r.data),
  })

  // Load chat history
  useQuery({
    queryKey: ['chatHistory', selectedRepo],
    queryFn: () => aiApi.getChatHistory(selectedRepo).then((r) => r.data),
    onSuccess: (data) => setMessages(data),
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (repoId) setSelectedRepo(Number(repoId))
  }, [repoId])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = { id: Date.now(), sender: 'USER', message: input }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      const { data } = await aiApi.chat({ message: input, repositoryId: selectedRepo })
      setMessages((m) => [...m, { id: Date.now() + 1, sender: 'AI', message: data.reply }])
    } catch (err) {
      toast.error('Failed to get AI response')
      setMessages((m) => m.filter((msg) => msg.id !== userMsg.id))
    } finally {
      setLoading(false)
    }
  }

  const completedRepos = repos.filter((r) => r.status === 'COMPLETED')

  return (
    <div className="flex flex-col h-full">
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

        {/* Repo selector */}
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
                ? 'Ask me anything about the selected repository — bugs, architecture, improvements!'
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
  )
}
