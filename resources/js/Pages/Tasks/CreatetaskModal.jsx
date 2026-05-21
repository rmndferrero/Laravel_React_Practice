import { useEffect, useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUSES = [
    { value: 'pending',     label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed',   label: 'Completed' },
    { value: 'cancelled',   label: 'Cancelled' },
    { value: 'other',       label: 'Other' },
];

const PRIORITIES = [
    { value: 'low',    label: 'Low',    color: '#6B7280' },
    { value: 'medium', label: 'Medium', color: '#3B82F6' },
    { value: 'high',   label: 'High',   color: '#F59E0B' },
    { value: 'urgent', label: 'Urgent', color: '#FF0000' },
];

const ALLOWED_EXTENSIONS = ['jpg','jpeg','png','gif','webp','pdf','doc','docx','xls','xlsx','txt','csv','zip'];
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

// ── Sub-components ────────────────────────────────────────────────────────────

function FieldLabel({ children, required }) {
    return (
        <label style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            display: 'block',
            marginBottom: 6,
        }}>
            {children}
            {required && <span style={{ color: 'var(--primary)', marginLeft: 3 }}>*</span>}
        </label>
    );
}

function FieldError({ message }) {
    if (!message) return null;
    return (
        <div style={{
            fontSize: 11,
            color: 'var(--primary)',
            fontFamily: "'JetBrains Mono', monospace",
            marginTop: 4,
        }}>
            {message}
        </div>
    );
}

function CharCount({ current, max }) {
    const near = current > max * 0.85;
    const over  = current > max;
    return (
        <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: over ? 'var(--primary)' : near ? '#F59E0B' : 'var(--text-muted)',
            marginLeft: 'auto',
        }}>
            {current}/{max}
        </span>
    );
}

function PriorityOption({ option, selected, onClick }) {
    return (
        <button
            type="button"
            onClick={() => onClick(option.value)}
            style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: 4,
                border: `1px solid ${selected ? option.color : 'var(--border)'}`,
                background: selected
                    ? `${option.color}18`
                    : 'transparent',
                color: selected ? option.color : 'var(--text-muted)',
                fontSize: 12,
                fontWeight: selected ? 600 : 400,
                fontFamily: "'JetBrains Mono', monospace",
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
            }}
        >
            <span style={{
                width: 6, height: 6,
                borderRadius: '50%',
                background: option.color,
                flexShrink: 0,
                boxShadow: selected && option.value === 'urgent'
                    ? `0 0 6px ${option.color}`
                    : 'none',
            }} />
            {option.label}
        </button>
    );
}

function FileRow({ file, onRemove, isExisting }) {
    const ext  = file.original_name
        ? file.original_name.split('.').pop().toUpperCase()
        : file.name?.split('.').pop().toUpperCase() ?? '?';

    const size = file.formatted_size
        ?? (file.size < 1048576
            ? `${(file.size / 1024).toFixed(1)} KB`
            : `${(file.size / 1048576).toFixed(1)} MB`);

    const name = file.original_name ?? file.name ?? 'Unknown';

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 12px',
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            fontSize: 12,
        }}>
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
                color: 'var(--text)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            }}>
                {name}
            </span>
            <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: 'var(--text-muted)',
                flexShrink: 0,
            }}>
                {size}
            </span>
            <button
                type="button"
                onClick={onRemove}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '0 2px',
                    fontSize: 14,
                    lineHeight: 1,
                    flexShrink: 0,
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                title={isExisting ? 'Remove attachment' : 'Remove file'}
            >
                ×
            </button>
        </div>
    );
}

// ── Main modal ────────────────────────────────────────────────────────────────

export default function CreateTaskModal({ onClose, editTask = null }) {
    const isEditing = !!editTask;
    const fileInputRef = useRef();

    // Track new files separately (File objects) + existing attachments to keep
    const [newFiles, setNewFiles]         = useState([]);
    const [fileErrors, setFileErrors]     = useState([]);
    // Existing attachments from the server (edit mode)
    const [existingAttachments, setExistingAttachments] = useState(
        editTask?.attachments ?? []
    );

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name:          editTask?.name          ?? '',
        description:   editTask?.description   ?? '',
        status:        editTask?.status        ?? 'pending',
        status_custom: editTask?.status_custom ?? '',
        priority:      editTask?.priority      ?? 'medium',
        due_at:        editTask?.due_at
            ? editTask.due_at.slice(0, 16)  // format for datetime-local input
            : '',
        tags:          editTask?.tags          ?? '',
        contact_id:    editTask?.contact_id    ?? '',
        _method:       isEditing ? 'PUT' : 'POST',
    });

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

    function handleFileSelect(e) {
        const selected = Array.from(e.target.files);
        const errs = [];
        const valid = [];

        selected.forEach(file => {
            const ext = file.name.split('.').pop().toLowerCase();
            if (!ALLOWED_EXTENSIONS.includes(ext)) {
                errs.push(`${file.name}: unsupported file type.`);
                return;
            }
            if (file.size > MAX_FILE_BYTES) {
                errs.push(`${file.name}: exceeds 10 MB limit.`);
                return;
            }
            const totalFiles = newFiles.length + existingAttachments.length + valid.length;
            if (totalFiles >= 10) {
                errs.push('Maximum of 10 attachments per task.');
                return;
            }
            valid.push(file);
        });

        setFileErrors(errs);
        setNewFiles(prev => [...prev, ...valid]);

        // Reset input so same file can be re-added after removal
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    function removeNewFile(index) {
        setNewFiles(prev => prev.filter((_, i) => i !== index));
    }

    function removeExistingAttachment(attachmentId) {
        setExistingAttachments(prev => prev.filter(a => a.id !== attachmentId));
    }

    function handleSubmit(e) {
        e.preventDefault();

        // Build FormData manually to include File objects
        const fd = new FormData();
        Object.entries(data).forEach(([key, val]) => {
            if (val !== null && val !== undefined) fd.append(key, val);
        });
        newFiles.forEach(file => fd.append('attachments[]', file));

        // Send IDs of existing attachments the user wants to KEEP
        // (backend can diff against current attachments to find deletions)
        existingAttachments.forEach(a => fd.append('keep_attachment_ids[]', a.id));

        const routeName = isEditing ? 'tasks.update' : 'tasks.store';
        const routeArgs = isEditing ? editTask.id : undefined;

        post(route(routeName, routeArgs), {
            data: fd,
            forceFormData: true,
            onSuccess: () => { reset(); onClose(); },
        });
    }

    const tagList   = data.tags
        ? data.tags.split(',').map(t => t.trim()).filter(Boolean)
        : [];

    const totalAttachments = newFiles.length + existingAttachments.length;

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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0,
                }}>
                    <div>
                        <div style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 10,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: 'var(--text-muted)',
                            marginBottom: 4,
                        }}>
                            {isEditing ? `Edit · ID:${editTask.id}` : 'New Record'}
                        </div>
                        <h2 style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: 'var(--text)',
                            margin: 0,
                            letterSpacing: '-0.01em',
                        }}>
                            {isEditing ? 'Edit Task' : 'Create Task'}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-icon"
                        style={{ fontSize: 18, lineHeight: 1 }}
                    >
                        ✕
                    </button>
                </div>

                {/* Scrollable form body */}
                <div style={{ overflowY: 'auto', flex: 1 }}>
                    <form onSubmit={handleSubmit} id="task-form">
                        <div style={{ padding: '24px 24px 0' }}>

                            {/* ── Task Name ── */}
                            <div style={{ marginBottom: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 6 }}>
                                    <FieldLabel required>Task Name</FieldLabel>
                                    <CharCount current={data.name.length} max={100} />
                                </div>
                                <input
                                    className={`input${errors.name ? ' error' : ''}`}
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    maxLength={100}
                                    placeholder="What needs to be done?"
                                    autoFocus
                                />
                                <FieldError message={errors.name} />
                            </div>

                            {/* ── Description ── */}
                            <div style={{ marginBottom: 20 }}>
                                <FieldLabel>Description</FieldLabel>
                                <textarea
                                    className={`textarea${errors.description ? ' error' : ''}`}
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    placeholder="Add details, bullet points, or notes..."
                                    rows={4}
                                    style={{ resize: 'vertical', minHeight: 96 }}
                                />
                                <FieldError message={errors.description} />
                            </div>

                            {/* ── Priority ── */}
                            <div style={{ marginBottom: 20 }}>
                                <FieldLabel required>Priority</FieldLabel>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    {PRIORITIES.map(opt => (
                                        <PriorityOption
                                            key={opt.value}
                                            option={opt}
                                            selected={data.priority === opt.value}
                                            onClick={val => setData('priority', val)}
                                        />
                                    ))}
                                </div>
                                <FieldError message={errors.priority} />
                            </div>

                            {/* ── Status ── */}
                            <div style={{ marginBottom: 20 }}>
                                <FieldLabel required>Status</FieldLabel>
                                <select
                                    className={`select${errors.status ? ' error' : ''}`}
                                    value={data.status}
                                    onChange={e => setData('status', e.target.value)}
                                >
                                    {STATUSES.map(s => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                                <FieldError message={errors.status} />

                                {/* Custom status text — only when Other selected */}
                                {data.status === 'other' && (
                                    <div style={{ marginTop: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 4 }}>
                                            <FieldLabel required>Describe Status</FieldLabel>
                                            <CharCount current={data.status_custom.length} max={20} />
                                        </div>
                                        <input
                                            className={`input${errors.status_custom ? ' error' : ''}`}
                                            type="text"
                                            value={data.status_custom}
                                            onChange={e => setData('status_custom', e.target.value)}
                                            maxLength={20}
                                            placeholder="e.g. Blocked, On Hold..."
                                            autoFocus
                                        />
                                        <FieldError message={errors.status_custom} />
                                    </div>
                                )}
                            </div>

                            {/* ── Deadline ── */}
                            <div style={{ marginBottom: 20 }}>
                                <FieldLabel>Deadline</FieldLabel>
                                <input
                                    className={`input${errors.due_at ? ' error' : ''}`}
                                    type="datetime-local"
                                    value={data.due_at}
                                    onChange={e => setData('due_at', e.target.value)}
                                    style={{ colorScheme: 'dark' }}
                                />
                                <FieldError message={errors.due_at} />
                            </div>

                            {/* ── Tags ── */}
                            <div style={{ marginBottom: 20 }}>
                                <FieldLabel>Tags</FieldLabel>
                                <input
                                    className={`input${errors.tags ? ' error' : ''}`}
                                    type="text"
                                    value={data.tags}
                                    onChange={e => setData('tags', e.target.value)}
                                    placeholder="comma, separated, tags (max 30 chars each)"
                                />
                                <FieldError message={errors.tags} />

                                {/* Tag preview */}
                                {tagList.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                                        {tagList.map((tag, i) => (
                                            <span key={i} style={{
                                                display: 'inline-block',
                                                padding: '2px 8px',
                                                borderRadius: 2,
                                                fontSize: 11,
                                                fontFamily: "'JetBrains Mono', monospace",
                                                fontWeight: 500,
                                                color: tag.length > 30 ? 'var(--primary)' : 'var(--primary)',
                                                background: 'var(--primary-faint)',
                                                border: `1px solid ${tag.length > 30 ? 'var(--primary)' : 'var(--primary)'}`,
                                            }}>
                                                {tag.length > 30
                                                    ? <span title="Tag too long — max 30 chars">{tag.slice(0, 30)}⚠</span>
                                                    : tag
                                                }
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* ── File Attachments ── */}
                            <div style={{ marginBottom: 24 }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                                    <FieldLabel>Attachments</FieldLabel>
                                    <span style={{
                                        fontFamily: "'JetBrains Mono', monospace",
                                        fontSize: 10,
                                        color: totalAttachments >= 10 ? 'var(--primary)' : 'var(--text-muted)',
                                    }}>
                                        {totalAttachments}/10 · max 10 MB each
                                    </span>
                                </div>

                                {/* Drop zone / trigger */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept={ALLOWED_EXTENSIONS.map(e => `.${e}`).join(',')}
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                />
                                {totalAttachments < 10 && (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px dashed var(--border)',
                                            borderRadius: 4,
                                            background: 'transparent',
                                            color: 'var(--text-muted)',
                                            fontSize: 12,
                                            fontFamily: "'JetBrains Mono', monospace",
                                            cursor: 'pointer',
                                            transition: 'all 0.15s',
                                            marginBottom: 8,
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = 'var(--primary)';
                                            e.currentTarget.style.color = 'var(--text)';
                                            e.currentTarget.style.background = 'var(--primary-faint)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = 'var(--border)';
                                            e.currentTarget.style.color = 'var(--text-muted)';
                                            e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        + Attach files
                                        <span style={{ marginLeft: 8, opacity: 0.6 }}>
                                            jpg · png · pdf · doc · xls · txt · zip
                                        </span>
                                    </button>
                                )}

                                {/* File errors */}
                                {fileErrors.map((err, i) => (
                                    <div key={i} style={{
                                        fontSize: 11,
                                        color: 'var(--primary)',
                                        fontFamily: "'JetBrains Mono', monospace",
                                        marginBottom: 4,
                                    }}>
                                        ⚠ {err}
                                    </div>
                                ))}

                                {/* Existing attachments (edit mode) */}
                                {existingAttachments.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 6 }}>
                                        {existingAttachments.map(a => (
                                            <FileRow
                                                key={a.id}
                                                file={a}
                                                isExisting
                                                onRemove={() => removeExistingAttachment(a.id)}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* New files queued */}
                                {newFiles.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {newFiles.map((file, i) => (
                                            <FileRow
                                                key={i}
                                                file={file}
                                                onRemove={() => removeNewFile(i)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>{/* end padding div */}
                    </form>
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
                        disabled={processing}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="task-form"
                        className="btn btn-primary"
                        disabled={processing}
                    >
                        {processing
                            ? 'Saving...'
                            : isEditing ? 'Save Changes' : 'Create Task'
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}