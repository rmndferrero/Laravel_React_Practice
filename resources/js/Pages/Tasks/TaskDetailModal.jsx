import { useEffect } from 'react';

// ── Priority config ───────────────────────────────────────────────────────────

const PRIORITY_COLORS = {
    low:    '#6B7280',
    medium: '#3B82F6',
    high:   '#F59E0B',
    urgent: '#FF0000',
};

const STATUS_STYLES = {
    pending:     { color: '#9CA3AF', border: '#374151', bg: 'rgba(156,163,175,0.08)' },
    in_progress: { color: '#60A5FA', border: '#1D4ED8', bg: 'rgba(96,165,250,0.08)' },
    completed:   { color: '#34D399', border: '#065F46', bg: 'rgba(52,211,153,0.08)' },
    cancelled:   { color: '#6B7280', border: '#374151', bg: 'rgba(107,114,128,0.06)' },
    other:       { color: '#A78BFA', border: '#5B21B6', bg: 'rgba(167,139,250,0.08)' },
};

// ── Detail field ──────────────────────────────────────────────────────────────

function DetailField({ label, children, fullWidth }) {
    return (
        <div style={{ gridColumn: fullWidth ? '1 / -1' : undefined }}>
            <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: 6,
            }}>
                {label}
            </div>
            <div style={{
                fontSize: 13,
                color: 'var(--text)',
                lineHeight: 1.6,
            }}>
                {children ?? <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>—</span>}
            </div>
        </div>
    );
}

// ── Attachment row ────────────────────────────────────────────────────────────

function AttachmentRow({ attachment }) {
    const ext = attachment.original_name?.split('.').pop().toUpperCase() ?? '?';

    return (
        <a
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                textDecoration: 'none',
                transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = '0 0 8px var(--primary-glow)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--primary)',
                background: 'var(--primary-faint)',
                border: '1px solid var(--primary)',
                borderRadius: 2,
                padding: '1px 5px',
                flexShrink: 0,
            }}>
                {ext}
            </span>
            <span style={{
                flex: 1,
                fontSize: 12,
                color: 'var(--text)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            }}>
                {attachment.original_name}
            </span>
            <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: 'var(--text-muted)',
                flexShrink: 0,
            }}>
                {attachment.formatted_size}
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
        </a>
    );
}

// ── Main modal ────────────────────────────────────────────────────────────────

export default function TaskDetailModal({ task, onClose, onEdit }) {
    if (!task) return null;

    const priorityColor = PRIORITY_COLORS[task.priority] ?? '#6B7280';
    const statusStyle   = STATUS_STYLES[task.status]     ?? STATUS_STYLES.other;

    // Close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    // Prevent body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 100,
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(12px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 24,
            }}
            onClick={onClose}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    width: '100%',
                    maxWidth: 640,
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid var(--border)',
                    flexShrink: 0,
                }}>
                    {/* Top row: ID + close */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 12,
                        marginBottom: 10,
                    }}>
                        <div style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 10,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: 'var(--text-muted)',
                        }}>
                            Task · ID:{task.id}
                            {task.is_overdue && (
                                <span style={{
                                    marginLeft: 12,
                                    color: 'var(--primary)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                }}>
                                    <span style={{
                                        width: 6, height: 6,
                                        borderRadius: '50%',
                                        background: 'var(--primary)',
                                        boxShadow: '0 0 6px var(--primary)',
                                        display: 'inline-block',
                                    }} />
                                    OVERDUE
                                </span>
                            )}
                        </div>
                        <button type="button" onClick={onClose} className="btn-icon"
                            style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>
                            ✕
                        </button>
                    </div>

                    {/* Task name */}
                    <h2 style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: task.status === 'completed' ? 'var(--text-muted)' : 'var(--text)',
                        textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                        margin: '0 0 12px',
                        letterSpacing: '-0.01em',
                        lineHeight: 1.3,
                    }}>
                        {task.name}
                    </h2>

                    {/* Priority + Status badges */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {/* Priority */}
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '3px 10px', borderRadius: 2,
                            fontSize: 11, fontWeight: 600,
                            fontFamily: "'JetBrains Mono', monospace",
                            letterSpacing: '0.04em', textTransform: 'uppercase',
                            color: priorityColor,
                            background: `${priorityColor}18`,
                            border: `1px solid ${priorityColor}`,
                        }}>
                            <span style={{
                                width: 6, height: 6, borderRadius: '50%',
                                background: priorityColor, flexShrink: 0,
                                boxShadow: task.priority === 'urgent' ? `0 0 6px ${priorityColor}` : 'none',
                            }} />
                            {task.priority_label}
                        </span>

                        {/* Status */}
                        <span style={{
                            display: 'inline-block',
                            padding: '3px 10px', borderRadius: 2,
                            fontSize: 11, fontWeight: 500,
                            fontFamily: "'JetBrains Mono', monospace",
                            color: statusStyle.color,
                            background: statusStyle.bg,
                            border: `1px solid ${statusStyle.border}`,
                        }}>
                            {task.status_label}
                        </span>
                    </div>
                </div>

                {/* Scrollable body */}
                <div style={{ overflowY: 'auto', flex: 1, padding: '24px' }}>

                    {/* Description */}
                    {task.description && (
                        <div style={{ marginBottom: 24 }}>
                            <div style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 10, letterSpacing: '0.1em',
                                textTransform: 'uppercase', color: 'var(--text-muted)',
                                marginBottom: 8,
                            }}>
                                Description
                            </div>
                            <div style={{
                                fontSize: 13, color: 'var(--text)',
                                lineHeight: 1.7,
                                whiteSpace: 'pre-wrap',
                                background: 'var(--surface2)',
                                border: '1px solid var(--border)',
                                borderRadius: 4,
                                padding: '12px 16px',
                            }}>
                                {task.description}
                            </div>
                        </div>
                    )}

                    {/* Detail grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '20px 32px',
                        marginBottom: 24,
                    }}>
                        <DetailField label="Deadline">
                            {task.due_at_human ? (
                                <span style={{ color: task.is_overdue ? 'var(--primary)' : 'var(--text)' }}>
                                    {task.due_at_human}
                                </span>
                            ) : null}
                        </DetailField>

                        <DetailField label="Created">
                            {task.created_at}
                        </DetailField>
                    </div>

                    {/* Tags */}
                    {task.tags_array?.length > 0 && (
                        <div style={{ marginBottom: 24 }}>
                            <div style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 10, letterSpacing: '0.1em',
                                textTransform: 'uppercase', color: 'var(--text-muted)',
                                marginBottom: 8,
                            }}>
                                Tags
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {task.tags_array.map(tag => (
                                    <span key={tag} style={{
                                        display: 'inline-block',
                                        padding: '3px 10px', borderRadius: 2,
                                        fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
                                        fontWeight: 500, color: 'var(--primary)',
                                        background: 'var(--primary-faint)',
                                        border: '1px solid var(--primary)',
                                    }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Attachments */}
                    {task.attachments?.length > 0 && (
                        <div>
                            <div style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 10, letterSpacing: '0.1em',
                                textTransform: 'uppercase', color: 'var(--text-muted)',
                                marginBottom: 8,
                            }}>
                                Attachments
                                <span style={{ marginLeft: 8, color: 'var(--text-muted)' }}>
                                    {task.attachments.length}
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {task.attachments.map(a => (
                                    <AttachmentRow key={a.id} attachment={a} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid var(--border)',
                    background: 'var(--surface2)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 10,
                    flexShrink: 0,
                    borderRadius: '0 0 8px 8px',
                }}>
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={onClose}
                        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}
                    >
                        CLOSE
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={onEdit}
                        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}
                    >
                        EDIT RECORD
                    </button>
                </div>
            </div>
        </div>
    );
}