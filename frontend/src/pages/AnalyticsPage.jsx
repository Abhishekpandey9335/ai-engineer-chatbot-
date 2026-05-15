import { useQuery } from '@tanstack/react-query'
import { repoApi } from '../services/api'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { Loader2, TrendingUp } from 'lucide-react'

const STATUS_COLORS = {
  COMPLETED: '#22c55e', PENDING: '#eab308',
  SCANNING: '#a855f7', FAILED: '#ef4444', CLONING: '#3b82f6'
}

const REPORT_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6']

export default function AnalyticsPage() {
  const { data: repos = [], isLoading } = useQuery({
    queryKey: ['repositories'],
    queryFn: () => repoApi.getAll().then((r) => r.data),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
      </div>
    )
  }

  // Status distribution
  const statusCounts = repos.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {})
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }))

  // Repos by report count
  const repoReportData = repos
    .filter((r) => r.reportCount > 0)
    .sort((a, b) => b.reportCount - a.reportCount)
    .slice(0, 8)
    .map((r) => ({ name: r.repoName, reports: r.reportCount }))

  // Repos added over time
  const byDate = repos.reduce((acc, r) => {
    const date = new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})
  const timelineData = Object.entries(byDate).map(([date, count]) => ({ date, count }))

  const totalReports = repos.reduce((a, r) => a + (r.reportCount || 0), 0)
  const completionRate = repos.length > 0
    ? Math.round((statusCounts.COMPLETED || 0) / repos.length * 100)
    : 0

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 mt-1">Insights about your AI-powered code analysis</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Repositories', value: repos.length },
          { label: 'Total AI Reports', value: totalReports },
          { label: 'Completion Rate', value: `${completionRate}%` },
          { label: 'Failed Scans', value: statusCounts.FAILED || 0 },
        ].map(({ label, value }) => (
          <div key={label} className="card text-center">
            <p className="text-3xl font-bold text-white mb-1">{value}</p>
            <p className="text-sm text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {repos.length === 0 ? (
        <div className="card text-center py-16">
          <TrendingUp className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400">No data yet. Add repositories to see analytics.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Pie */}
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4">Repository Status</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Reports bar */}
          {repoReportData.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">Reports per Repository</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={repoReportData}>
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }} />
                  <Bar dataKey="reports" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Timeline */}
          {timelineData.length > 1 && (
            <div className="card lg:col-span-2">
              <h2 className="text-lg font-semibold text-white mb-4">Repositories Added Over Time</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={timelineData}>
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
