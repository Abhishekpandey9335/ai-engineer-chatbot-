import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { repoApi } from '../services/api'
import { FolderGit2, Plus, Trash2, ExternalLink, GitBranch, Loader2, X } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import toast from 'react-hot-toast'

function ScanModal({ onClose, onScan }) {
  const [form, setForm] = useState({ repoUrl: '', branch: 'main' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onScan(form)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-white">Add Repository</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">GitHub URL</label>
            <input
              type="url"
              className="input"
              placeholder="https://github.com/owner/repo"
              value={form.repoUrl}
              onChange={(e) => setForm({ ...form, repoUrl: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Branch</label>
            <input
              type="text"
              className="input"
              placeholder="main"
              value={form.branch}
              onChange={(e) => setForm({ ...form, branch: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {loading ? 'Scanning...' : 'Start Scan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function RepositoriesPage() {
  const [showModal, setShowModal] = useState(false)
  const qc = useQueryClient()

  const { data: repos = [], isLoading } = useQuery({
    queryKey: ['repositories'],
    queryFn: () => repoApi.getAll().then((r) => r.data),
    refetchInterval: 5000,
  })

  const scanMutation = useMutation({
    mutationFn: (data) => repoApi.scan(data),
    onSuccess: () => {
      toast.success('Repository queued for scanning!')
      qc.invalidateQueries(['repositories'])
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to scan'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => repoApi.delete(id),
    onSuccess: () => {
      toast.success('Repository deleted')
      qc.invalidateQueries(['repositories'])
    },
    onError: () => toast.error('Failed to delete'),
  })

  const handleDelete = (e, id) => {
    e.preventDefault()
    if (confirm('Delete this repository?')) deleteMutation.mutate(id)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Repositories</h1>
          <p className="text-gray-400 mt-1">Manage and analyze your GitHub repositories</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Repository
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
        </div>
      ) : repos.length === 0 ? (
        <div className="card text-center py-16">
          <FolderGit2 className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No repositories yet</h3>
          <p className="text-gray-400 mb-6">Add a GitHub repository to start AI-powered code analysis</p>
          <button onClick={() => setShowModal(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add First Repository
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {repos.map((repo) => (
            <Link
              key={repo.id}
              to={`/repositories/${repo.id}`}
              className="card hover:border-gray-700 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="p-2 bg-gray-800 rounded-lg mt-0.5">
                    <FolderGit2 className="w-5 h-5 text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-white group-hover:text-brand-300 transition-colors">
                        {repo.repoName}
                      </h3>
                      <StatusBadge status={repo.status} />
                    </div>
                    <p className="text-sm text-gray-400 truncate">{repo.repoUrl}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <GitBranch className="w-3 h-3" /> {repo.defaultBranch}
                      </span>
                      <span>{repo.reportCount} AI reports</span>
                      <span>{new Date(repo.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <a
                    href={repo.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={(e) => handleDelete(e, repo.id)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <ScanModal
          onClose={() => setShowModal(false)}
          onScan={(data) => scanMutation.mutateAsync(data)}
        />
      )}
    </div>
  )
}
