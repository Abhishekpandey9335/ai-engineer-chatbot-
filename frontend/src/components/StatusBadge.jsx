export default function StatusBadge({ status }) {
  const classes = {
    PENDING:   'badge-pending',
    CLONING:   'badge-cloning',
    SCANNING:  'badge-scanning',
    COMPLETED: 'badge-completed',
    FAILED:    'badge-failed',
  }
  return (
    <span className={classes[status] || 'badge-pending'}>
      {status}
    </span>
  )
}
