/**
 * Export utilities for generating reports
 * Supports CSV and PDF formats
 */

export function exportToCSV(filename, headers, rows) {
  const csvContent = [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function generateActivityReport(activities) {
  const headers = ['Date', 'User', 'Action', 'Entity Type', 'Description'];
  const rows = activities.map(a => [
    new Date(a.created_date).toLocaleDateString(),
    a.user_name,
    a.action_type,
    a.entity_type,
    a.description.substring(0, 100)
  ]);

  return { headers, rows };
}

export function generateAnalyticsReport(snapshots) {
  const headers = ['Date', 'Active Users', 'Total Users', 'Engagement Rate', 'Total Posts', 'Active Groups'];
  const rows = snapshots.map(s => [
    new Date(s.snapshot_date).toLocaleDateString(),
    s.active_users,
    s.total_users,
    `${s.engagement_rate}%`,
    s.total_posts,
    s.active_groups
  ]);

  return { headers, rows };
}

export function downloadJSON(filename, data) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}