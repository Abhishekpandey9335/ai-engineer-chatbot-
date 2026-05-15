import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { repoApi, aiApi } from '../services/api'
import {
  ArrowLeft, FolderGit2, Play, MessageSquareCode, FileText,
  Bug, Shield, Code2, Loader2, ChevronDown, ChevronUp, GitBranch
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import StatusBadge from '../components/StatusBadge'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const REPORT_TYPES = [
  { value: 'GENERAL',       label: 'General Review',    icon: FileText,          color: 'text-blue-400' },
  { value: 'CODE_REVIEW',   label: 'Code Review',       icon: Code2,             color: 'text-brand-400' },
  { value: 'BUG_DETECTION', label: 'Bug Detection',     icon: Bug,               color: 'text-red-400' },
  { value: 'DOCUMENTATION', label: 'Documentation',     icon: FileText,          color: 'text-green-400' },
  { value: 'SECURITY_AUDIT','label': 'Security Audit',  icon: Shield,            color: 'text-orange-400' },
]

function ReportCard({ report }) {
  const [expanded, setExpanded] = useState(false)
  const typeInfo = REPORT_TYPES.find((t) => t.value === report.reportType) || REPORT_TYPES[0]
  const Icon = typeInfo.icon

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${typeInfo.color}`} />
          <div className="text-left">
            <p className="font-medium text-gray-200">{typeInfo.label}</p>
            <p className="text-xs text-gray-500">
              {report.filePath ? `File: ${report.filePath}` : 'Full repository'} •{' '}
              {new Date(report.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-700">
          <div className="mt-4 prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{report.report}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}

export default function RepositoryDetailPage() {
  const { id } = useParams()
  const [selectedType, setSelectedType] = useState('GENERAL')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const qc = useQueryClient()

  const { data: repo, isLoading } = useQuery({
    queryKey: ['repository', id],
    queryFn: () => repoApi.getById(id).then((r) => r.data),
    refetchInterval: (data) =>
      ['PENDING', 'CLONING', 'SCANNING'].includes(data?.status) ? 3000 : false,
  })

  const analyzeMutation = useMutation({
    mutationFn: (data) => aiApi.review(data),
    onSuccess: () => {
      toast.success('AI analysis complete!')
      qc.invalidateQueries(['repository', id])
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Analysis failed'),
  })

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      await analyzeMutation.mutateAsync({ repositoryId: Number(id), reportType: selectedType })
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
      </div>
    )
  }

  if (!repo) return <div className="p-8 text-red-400">Repository not found</div>

  const canAnalyze = repo.status === 'COMPLETED'

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Link to="/repositories" className="flex items-center gap-2 text-gray-400 hover:text-gray-200 text-sm mb-4 w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Repositories
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-800 rounded-xl">
              <FolderGit2 className="w-6 h-6 text-brand-400" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">{repo.repoName}</h1>
                <StatusBadge status={repo.status} />
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <GitBranch className="w-3 h-3" /> {repo.defaultBranch}
                </span>
                <a href={repo.repoUrl} target="_blank" rel="noopener noreferrer"
                  className="hover:text-brand-400 truncate max-w-xs">{repo.repoUrl}</a>
              </div>
            </div>
          </div>
          <Link to={`/chat/${id}`} className="btn-secondary flex items-center gap-2">
            <MessageSquareCode className="w-4 h-4" /> Chat with Repo
          </Link>
        </div>
      </div>

      {/* Scanning indicator */}
      {['PENDING', 'CLONING', 'SCANNING'].includes(repo.status) && (
        <div className="card mb-6 flex items-center gap-3 border-brand-600/30 bg-brand-600/5">
          <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
          <div>
            <p className="font-medium text-brand-300">
              {repo.status === 'CLONING' ? 'Cloning repository...' : 'Running AI analysis...'}
            </p>
            <p className="text-sm text-gray-400">This may take a minute. The page will update automatically.</p>
          </div>
        </div>
      )}

      {/* Run AI Analysis */}
      {canAnalyze && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Run AI Analysis</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {REPORT_TYPES.map(({ value, label, icon: Icon, color }) => (
              <button
                key={value}
                onClick={() => setSelectedType(value)}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all',
                  selectedType === value
                    ? 'bg-brand-600/20 border-brand-600/50 text-brand-300'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600'
                )}
              >
                <Icon className={`w-4 h-4 ${color}`} />
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="btn-primary flex items-center gap-2"
          >
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </div>
      )}

      {/* Reports */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">
          AI Reports ({repo.reports?.length || 0})
        </h2>
        {!repo.reports || repo.reports.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-2 text-gray-700" />
            <p>No reports yet. Run an analysis above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {repo.reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
