/**
 * Utility Functions for EnviroWatch
 */

/**
 * Get AQI level and color
 */
export function getAQILevel(aqi: number): { level: string; color: string; bgColor: string } {
  if (aqi <= 50) {
    return { level: 'Good', color: 'text-green-700', bgColor: 'bg-green-100' };
  } else if (aqi <= 100) {
    return { level: 'Moderate', color: 'text-yellow-700', bgColor: 'bg-yellow-100' };
  } else if (aqi <= 150) {
    return { level: 'Unhealthy for Sensitive Groups', color: 'text-orange-700', bgColor: 'bg-orange-100' };
  } else if (aqi <= 200) {
    return { level: 'Unhealthy', color: 'text-red-700', bgColor: 'bg-red-100' };
  } else if (aqi <= 300) {
    return { level: 'Very Unhealthy', color: 'text-purple-700', bgColor: 'bg-purple-100' };
  } else {
    return { level: 'Hazardous', color: 'text-red-900', bgColor: 'bg-red-200' };
  }
}

/**
 * Get water quality level based on parameters
 */
export function getWaterQualityLevel(ph?: number, dissolvedOxygen?: number): { level: string; color: string; bgColor: string } {
  if (!ph || !dissolvedOxygen) {
    return { level: 'Unknown', color: 'text-gray-700', bgColor: 'bg-gray-100' };
  }

  const phOk = ph >= 6.5 && ph <= 8.5;
  const doOk = dissolvedOxygen >= 5;

  if (phOk && doOk) {
    return { level: 'Good', color: 'text-green-700', bgColor: 'bg-green-100' };
  } else if ((phOk && dissolvedOxygen >= 4) || (doOk && ph >= 6 && ph <= 9)) {
    return { level: 'Fair', color: 'text-yellow-700', bgColor: 'bg-yellow-100' };
  } else {
    return { level: 'Poor', color: 'text-red-700', bgColor: 'bg-red-100' };
  }
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format number with decimals
 */
export function formatNumber(num: number | undefined | null, decimals: number = 1): string {
  if (num === undefined || num === null) return 'N/A';
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(numValue)) return 'N/A';
  return numValue.toFixed(decimals);
}

/**
 * Get monitoring point type icon
 */
export function getPointTypeIcon(type: string): string {
  switch (type) {
    case 'air':
      return '💨';
    case 'river':
      return '🌊';
    case 'marine':
      return '🌊';
    default:
      return '📍';
  }
}

/**
 * Get status badge color
 */
export function getStatusBadge(status: string): { text: string; className: string } {
  switch (status.toLowerCase()) {
    case 'active':
      return { text: 'Active', className: 'badge badge-success' };
    case 'inactive':
      return { text: 'Inactive', className: 'badge badge-danger' };
    case 'maintenance':
      return { text: 'Maintenance', className: 'badge badge-warning' };
    default:
      return { text: status, className: 'badge badge-info' };
  }
}

/**
 * Truncate text
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

/**
 * Calculate time ago
 */
export function timeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diff = now.getTime() - past.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}
