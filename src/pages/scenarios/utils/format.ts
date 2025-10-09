export function formatRelativeDate(iso?: string, fallback?: string) {
    if (!iso) return fallback || "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return fallback || "";
  
    const today = new Date();
    const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
    const a = startOfDay(today).getTime();
    const b = startOfDay(d).getTime();
    const diffDays = Math.floor((a - b) / (1000 * 60 * 60 * 24));
  
    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays <= 7) return `${diffDays} days ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }
  
  export function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  