import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { repoApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { FolderGit2, CheckCircle2, AlertCircle, Clock, MessageSquareCode, ArrowRight, Loader2 } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { data: repos = [], isLoading } = useQuery({
    queryKey: ['repositories'],
    queryFn: () => repoApi.getAll().then((r) => r.data),
  })

  const stats = {
    total: repos.length,
    completed: repos.filter((r) => r.status === 'COMPLETED').length,
    failed: repos.filter((r) => r.status === 'FAILED').length,
    pending: repos.filter((r) => ['PENDING', 'CLONING', 'SCANNING'].includes(r.status)).length,
    reports: repos.reduce((a, r) => a + (r.reportCount || 0), 0),
  }

  return (
    <div className="p-8">
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
            <Link to="/repositories" className="btn-primary mt-4 inline-flex">
              Add Repository
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {repos.slice(0, 5).map((repo) => (
              <Link
                key={repo.id}
                to={`/repositories/${repo.id}`}
                className="flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors group"
              >
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
    </div>
  )
}
