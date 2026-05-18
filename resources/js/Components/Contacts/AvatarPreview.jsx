export default function AvatarPreview({ contact, previewUrl, size = 80 }) {
    const initials = contact
        ? `${contact.first_name?.[0] ?? ''}${contact.last_name?.[0] ?? ''}`.toUpperCase()
        : '?';

    // Image state (uploaded or existing)
    if (previewUrl || contact?.avatar_url) {
        return (
            <img
                src={previewUrl || contact.avatar_url}
                alt="Avatar preview"
                style={{
                    width: size, height: size,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1px solid var(--border)',
                }}
            />
        );
    }
    
    // Fallback "Command Center" state
    return (
        <div style={{
            width: size, height: size,
            borderRadius: '50%',
            background: 'var(--surface2)',
            border: `1px dashed var(--text-muted)`, // Dashed border for "empty/upload" state
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.35,
            fontWeight: 500,
            fontFamily: "'JetBrains Mono', monospace",
            color: 'var(--text-muted)',
            letterSpacing: '-1px'
        }}>
            {initials || 'ID'}
        </div>
    );
}