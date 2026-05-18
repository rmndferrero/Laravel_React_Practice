export function SortIcon({ field, currentSort, direction }) {
    const active = currentSort === field;
    return (
        <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 1, marginLeft: 4, opacity: active ? 1 : 0.3 }}>
            <span style={{ fontSize: 8, lineHeight: 1, color: active && direction === 'asc' ? 'var(--accent)' : 'inherit' }}>▲</span>
            <span style={{ fontSize: 8, lineHeight: 1, color: active && direction === 'desc' ? 'var(--accent)' : 'inherit' }}>▼</span>
        </span>
    );
}

export function Tag({ label, active = false }) {
    return (
        <span style={{
            display: 'inline-block', 
            padding: '2px 8px', 
            borderRadius: '2px', // Sharper 2px radius
            fontSize: '11px', 
            fontWeight: 500, 
            fontFamily: "'JetBrains Mono', monospace", // Technical font
            // Active state applies the black/red styling, inactive is gray
            background: active ? '#000000' : 'var(--surface2)',
            color: active ? 'var(--primary)' : 'var(--text-muted)', 
            border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
            whiteSpace: 'nowrap',
        }}>
            {label}
        </span>
    );
}

export function Flash({ message }) {
    if (!message) return null;
    return (
        <div style={{
            padding: '12px 20px', background: 'var(--success-bg)', color: 'var(--success)',
            borderRadius: 10, border: '1px solid var(--success-border)',
            fontSize: 14, fontWeight: 500, marginBottom: 20,
        }}>
            ✓ {message}
        </div>
    );
}