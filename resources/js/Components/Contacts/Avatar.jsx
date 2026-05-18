export default function Avatar({ contact, size = 40 }) {
    const initials = `${contact.first_name?.[0] ?? ''}${contact.last_name?.[0] ?? ''}`.toUpperCase();
    
    // Updated to technical/monochrome colors
    const colors = [
        '#333333', '#404040', '#2A2A2A', '#1C1B1B', 
        '#FF0000' // Occasional primary red for contrast
    ];
    const color = colors[(contact.id ?? 0) % colors.length];

    if (contact?.avatar_url) {
        return (
            <img
                src={contact.avatar_url}
                alt={contact.full_name}
                style={{
                    width: size, height: size,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    flexShrink: 0,
                    border: '2px solid var(--border)',
                }}
            />
        );
    }

    return (
        <div style={{
            width: size, height: size,
            borderRadius: '50%', // Full round as requested
            backgroundColor: color === '#FF0000' ? 'var(--primary-faint)' : 'var(--surface2)',
            border: `1px solid ${color === '#FF0000' ? 'var(--primary)' : 'var(--border)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            fontSize: size * 0.36,
            fontWeight: 600,
            fontFamily: "'Inter', sans-serif",
            color: color === '#FF0000' ? 'var(--primary)' : 'var(--text)',
        }}>
            {initials || '?'}
        </div>
    );
}