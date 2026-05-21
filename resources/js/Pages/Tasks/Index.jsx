import { useState, useCallback } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import AppLayout from '@/Layouts/AppLayout';
import CreateTaskModal from '@/Pages/Tasks/CreateTaskModal';
import TaskDetailModal from '@/Pages/Tasks/TaskDetailModal';
import '@/styles/contacts.css';

// ── Priority badge ────────────────────────────────────────────────────────────

function PriorityBadge({ priority, label, color }) {
    const bgMap = {
        low:    'rgba(107,114,128,0.12)',
        medium: 'rgba(59,130,246,0.12)',
        high:   'rgba(245,158,11,0.12)',
        urgent: 'var(--primary-faint)',
    };
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '2px 8px', borderRadius: 2,
            fontSize: 11, fontWeight: 600,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.04em', textTransform: 'uppercase',
            color, background: bgMap[priority] ?? 'var(--surface2)',
            border: `1px solid ${color}`,
        }}>
            <span style={{
                width: 5, height: 5, borderRadius: '50%', background: color,
                flexShrink: 0,
                boxShadow: priority === 'urgent' ? `0 0 6px ${color}` : 'none',
            }} />
            {label}
        </span>
    );
}

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLES = {
    pending:     { color: '#9CA3AF', border: '#374151', bg: 'rgba(156,163,175,0.08)' },
    in_progress: { color: '#60A5FA', border: '#1D4ED8', bg: 'rgba(96,165,250,0.08)' },
    completed:   { color: '#34D399', border: '#065F46', bg: 'rgba(52,211,153,0.08)' },
    cancelled:   { color: '#6B7280', border: '#374151', bg: 'rgba(107,114,128,0.06)' },
    other:       { color: '#A78BFA', border: '#5B21B6', bg: 'rgba(167,139,250,0.08)' },
};

function StatusBadge({ status, label }) {
    const s = STATUS_STYLES[status] ?? STATUS_STYLES.other;
    return (
        <span style={{
            display: 'inline-block', padding: '2px 8px', borderRadius: 2,
            fontSize: 11, fontWeight: 500,
            fontFamily: "'JetBrains Mono', monospace",
            color: s.color, background: s.bg,
            border: `1px solid ${s.border}`, whiteSpace: 'nowrap',
        }}>
            {label}
        </span>
    );
}

// ── Tag chip ──────────────────────────────────────────────────────────────────

function TagChip({ label }) {
    return (
        <span style={{
            display: 'inline-block', padding: '2px 8px', borderRadius: 2,
            fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
            color: 'var(--primary)', background: 'var(--primary-faint)',
            border: '1px solid var(--primary)', whiteSpace: 'nowrap',
        }}>
            {label}
        </span>
    );
}

// ── Deadline cell ─────────────────────────────────────────────────────────────

function DeadlineCell({ dueHuman, isOverdue, status }) {
    if (!dueHuman) {
        return (
            <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11, color: 'var(--text-muted)',
            }}>
                No deadline
            </span>
        );
    }
    const done  = status === 'completed' || status === 'cancelled';
    const color = done ? 'var(--text-muted)' : isOverdue ? 'var(--primary)' : 'var(--text-muted)';
    return (
        <div style={{ textAlign: 'right' }}>
            {isOverdue && !done && (
                <div style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10, color: 'var(--primary)',
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    marginBottom: 2, display: 'flex',
                    alignItems: 'center', gap: 4, justifyContent: 'flex-end',
                }}>
                    <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: 'var(--primary)',
                        boxShadow: '0 0 6px var(--primary)', display: 'inline-block',
                    }} />
                    Overdue
                </div>
            )}
            <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12, color,
                textDecoration: done ? 'line-through' : 'none',
            }}>
                {dueHuman}
            </div>
        </div>
    );
}

// ── Task row ──────────────────────────────────────────────────────────────────

function TaskRow({ task, onView, onEdit }) {
    const [hovered, setHovered] = useState(false);

    function handleDelete(e) {
        e.stopPropagation();
        if (!confirm(`Delete "${task.name}"?`)) return;
        router.delete(route('tasks.destroy', task.id));
    }

    function handleEdit(e) {
        e.stopPropagation();
        onEdit(task);
    }

    return (
        <div
            onClick={() => onView(task)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 16,
                padding: '14px 20px',
                borderBottom: '1px solid var(--border)',
                background: hovered ? 'var(--hover)' : 'transparent',
                transition: 'background 0.12s ease',
                cursor: 'pointer',
                alignItems: 'center',
            }}
        >
            {/* Left: main info */}
            <div style={{ minWidth: 0 }}>
                {/* Row 1: name + badges */}
                <div style={{
                    display: 'flex', alignItems: 'center',
                    gap: 10, flexWrap: 'wrap', marginBottom: 6,
                }}>
                    <span style={{
                        fontSize: 14, fontWeight: 600,
                        color: task.status === 'completed' ? 'var(--text-muted)' : 'var(--text)',
                        textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                        letterSpacing: '-0.01em',
                    }}>
                        {task.name}
                    </span>
                    <PriorityBadge
                        priority={task.priority}
                        label={task.priority_label}
                        color={task.priority_color}
                    />
                    <StatusBadge status={task.status} label={task.status_label} />
                </div>

                {/* Row 2: description preview */}
                {task.description && (
                    <div style={{
                        fontSize: 12, color: 'var(--text-muted)',
                        marginBottom: 8, overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                        {task.description}
                    </div>
                )}

                {/* Row 3: tags + attachment count */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {task.tags_array?.slice(0, 4).map(tag => (
                        <TagChip key={tag} label={tag} />
                    ))}
                    {task.attachments?.length > 0 && (
                        <span style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 10, color: 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2">
                                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                            </svg>
                            {task.attachments.length} file{task.attachments.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            </div>

            {/* Right: deadline + row actions */}
            <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'flex-end', gap: 10, flexShrink: 0,
            }}>
                <DeadlineCell
                    dueHuman={task.due_at_human}
                    isOverdue={task.is_overdue}
                    status={task.status}
                />

                {/* Action buttons — visible on hover */}
                {hovered && (
                    <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                        <button
                            onClick={handleEdit}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--border)',
                                borderRadius: 3, padding: '3px 8px',
                                fontSize: 11,
                                fontFamily: "'JetBrains Mono', monospace",
                                color: 'var(--text-muted)', cursor: 'pointer',
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.color = 'var(--text)';
                                e.currentTarget.style.borderColor = 'var(--primary)';
                                e.currentTarget.style.background = 'var(--primary-faint)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.color = 'var(--text-muted)';
                                e.currentTarget.style.borderColor = 'var(--border)';
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--border)',
                                borderRadius: 3, padding: '3px 8px',
                                fontSize: 11,
                                fontFamily: "'JetBrains Mono', monospace",
                                color: 'var(--text-muted)', cursor: 'pointer',
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.color = 'var(--primary)';
                                e.currentTarget.style.borderColor = 'var(--primary)';
                                e.currentTarget.style.background = 'var(--primary-faint)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.color = 'var(--text-muted)';
                                e.currentTarget.style.borderColor = 'var(--border)';
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Date group ────────────────────────────────────────────────────────────────

function DateGroup({ dateLabel, tasks, onView, onEdit }) {
    return (
        <div style={{ marginBottom: 24 }}>
            <div style={{
                display: 'flex', alignItems: 'center',
                gap: 12, marginBottom: 8, padding: '0 4px',
            }}>
                <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11, letterSpacing: '0.08em',
                    textTransform: 'uppercase', color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                }}>
                    {dateLabel}
                </span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10, color: 'var(--text-muted)',
                }}>
                    {tasks.length}
                </span>
            </div>

            <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8, overflow: 'hidden',
                transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
                onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.boxShadow   = '0 0 12px var(--primary-glow)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow   = 'none';
                }}
            >
                {tasks.map(task => (
                    <TaskRow
                        key={task.id}
                        task={task}
                        onView={onView}
                        onEdit={onEdit}
                    />
                ))}
            </div>
        </div>
    );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, accent, warning }) {
    const highlight = accent || (warning && value > 0);
    return (
        <div style={{
            background: 'var(--surface)',
            border: `1px solid ${highlight ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: 8, padding: '16px 20px',
            position: 'relative', overflow: 'hidden',
            boxShadow: highlight ? '0 0 12px var(--primary-glow)' : 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
        }}>
            {highlight && (
                <div style={{
                    position: 'absolute', top: 0, left: 0,
                    width: '100%', height: 2, background: 'var(--primary)',
                }} />
            )}
            <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8,
            }}>
                {label}
            </div>
            <div style={{
                fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1,
                color: highlight ? 'var(--primary)' : 'var(--text)',
            }}>
                {value}
            </div>
        </div>
    );
}

// ── Flash ─────────────────────────────────────────────────────────────────────

function Flash({ message }) {
    if (!message) return null;
    return (
        <div style={{
            padding: '10px 16px',
            background: 'rgba(52,211,153,0.08)',
            border: '1px solid #065F46',
            borderRadius: 4, fontSize: 13, color: '#34D399',
            marginBottom: 20,
            fontFamily: "'JetBrains Mono', monospace",
        }}>
            ✓ {message}
        </div>
    );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ filtered }) {
    return (
        <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11, letterSpacing: '0.08em',
                textTransform: 'uppercase', marginBottom: 12,
            }}>
                {filtered ? '// No tasks match filters' : '// No tasks yet'}
            </div>
            <div style={{ fontSize: 13 }}>
                {filtered
                    ? 'Try adjusting your search or filters.'
                    : 'Create your first task using the button above.'}
            </div>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TasksIndex({ tasks, stats, filters, statuses, priorities }) {
    const { props } = usePage();
    const flash = props.flash ?? {};

    // Three mutually exclusive modal states:
    // null = nothing open
    // { mode: 'create' } = create modal
    // { mode: 'detail', task } = detail modal
    // { mode: 'edit',   task } = edit modal (CreateTaskModal pre-filled)
    const [modal, setModal] = useState(null);

    const closeModal = () => setModal(null);
    const openCreate = () => setModal({ mode: 'create' });
    const openDetail = (task) => setModal({ mode: 'detail', task });
    const openEdit   = (task) => setModal({ mode: 'edit', task });

    // When "Edit Record" is clicked inside detail modal
    const handleDetailEdit = (task) => {
        setModal({ mode: 'edit', task });
    };

    const applyFilter = useCallback(
        debounce((params) => {
            router.get(route('tasks.index'), { ...filters, ...params }, {
                preserveState: true, replace: true,
            });
        }, 350),
        [filters]
    );

    function formatDateLabel(dateStr) {
        const date      = new Date(dateStr);
        const today     = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const sameDay = (a, b) =>
            a.getFullYear() === b.getFullYear() &&
            a.getMonth()    === b.getMonth()    &&
            a.getDate()     === b.getDate();

        if (sameDay(date, today))     return 'Today';
        if (sameDay(date, yesterday)) return 'Yesterday';

        return date.toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric',
            year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
        });
    }

    function groupByDate(items) {
        const groups = {};
        items.forEach(task => {
            const label = formatDateLabel(task.created_at);
            if (!groups[label]) groups[label] = [];
            groups[label].push(task);
        });
        return groups;
    }

    const taskList  = tasks?.data ?? [];
    const grouped   = groupByDate(taskList);
    const hasFilter = !!(filters.search || filters.status || filters.priority);

    return (
        <AppLayout currentPage="tasks">
            <Head title="Tasks" />

            {/* Page header */}
            <div style={{
                display: 'flex', alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: 24, borderBottom: '1px solid var(--border)',
                paddingBottom: 24, gap: 16, flexWrap: 'wrap',
            }}>
                <div>
                    <div style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 11, letterSpacing: '0.1em',
                        textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6,
                    }}>
                        Task Management
                    </div>
                    <h1 style={{
                        fontSize: 28, fontWeight: 700, color: 'var(--text)',
                        letterSpacing: '-0.02em', margin: 0,
                    }}>
                        Tasks
                        <span style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 13, fontWeight: 400,
                            color: 'var(--text-muted)', marginLeft: 12,
                        }}>
                            {stats.total} total
                        </span>
                    </h1>
                </div>
                <button
                    onClick={openCreate}
                    className="btn btn-primary"
                    style={{ alignSelf: 'flex-end' }}
                >
                    + New Task
                </button>
            </div>

            <Flash message={flash.success} />

            {/* Stat cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: 12, marginBottom: 28,
            }}>
                <StatCard label="Total"       value={stats.total}       accent />
                <StatCard label="Pending"     value={stats.pending} />
                <StatCard label="In Progress" value={stats.in_progress} />
                <StatCard label="Completed"   value={stats.completed} />
                <StatCard label="Overdue"     value={stats.overdue}     warning />
            </div>

            {/* Filters */}
            <div style={{
                display: 'flex', gap: 10, marginBottom: 24,
                flexWrap: 'wrap', alignItems: 'center',
            }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <span style={{
                        position: 'absolute', left: 12, top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)', fontSize: 13, pointerEvents: 'none',
                    }}>🔍</span>
                    <input
                        className="input"
                        type="search"
                        placeholder="Search tasks..."
                        defaultValue={filters.search ?? ''}
                        onChange={e => applyFilter({ search: e.target.value, page: 1 })}
                        style={{ paddingLeft: 36 }}
                    />
                </div>
                <select
                    className="input"
                    style={{ width: 'auto', minWidth: 140 }}
                    value={filters.status ?? ''}
                    onChange={e => applyFilter({ status: e.target.value, page: 1 })}
                >
                    <option value="">All Statuses</option>
                    {Object.entries(statuses).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                    ))}
                </select>
                <select
                    className="input"
                    style={{ width: 'auto', minWidth: 140 }}
                    value={filters.priority ?? ''}
                    onChange={e => applyFilter({ priority: e.target.value, page: 1 })}
                >
                    <option value="">All Priorities</option>
                    {Object.entries(priorities).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                    ))}
                </select>
                {hasFilter && (
                    <button
                        className="btn btn-ghost"
                        onClick={() => router.get(route('tasks.index'), {}, { replace: true })}
                        style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}
                    >
                        Clear ×
                    </button>
                )}
            </div>

            {/* Task list */}
            {taskList.length === 0 ? (
                <div style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)', borderRadius: 8,
                }}>
                    <EmptyState filtered={hasFilter} />
                </div>
            ) : (
                Object.entries(grouped).map(([dateLabel, dateTasks]) => (
                    <DateGroup
                        key={dateLabel}
                        dateLabel={dateLabel}
                        tasks={dateTasks}
                        onView={openDetail}
                        onEdit={openEdit}
                    />
                ))
            )}

            {/* Pagination */}
            {tasks?.last_page > 1 && (
                <div style={{
                    display: 'flex', justifyContent: 'center',
                    gap: 8, marginTop: 32, flexWrap: 'wrap',
                }}>
                    {tasks.links.map((link, i) => (
                        <button
                            key={i}
                            disabled={!link.url || link.active}
                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            style={{
                                padding: '6px 12px', borderRadius: 4,
                                border: link.active ? '1px solid var(--primary)' : '1px solid var(--border)',
                                background: link.active ? 'var(--primary-faint)' : 'transparent',
                                color: link.active ? 'var(--primary)' : 'var(--text-muted)',
                                fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                                cursor: link.url && !link.active ? 'pointer' : 'default',
                                opacity: !link.url ? 0.4 : 1,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* ── Modals ── */}

            {/* Create */}
            {modal?.mode === 'create' && (
                <CreateTaskModal onClose={closeModal} />
            )}

            {/* Detail */}
            {modal?.mode === 'detail' && (
                <TaskDetailModal
                    task={modal.task}
                    onClose={closeModal}
                    onEdit={() => handleDetailEdit(modal.task)}
                />
            )}

            {/* Edit */}
            {modal?.mode === 'edit' && (
                <CreateTaskModal
                    editTask={modal.task}
                    onClose={closeModal}
                />
            )}
        </AppLayout>
    );
}