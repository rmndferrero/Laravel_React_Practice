import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import '@/styles/contacts.css';

function StatCard({ label, value, sub, accent = false }) {
    return (
        <div style={{
            background: 'var(--surface)',
            border: `1px solid ${accent ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: 8,
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxShadow: accent ? '0 0 12px var(--primary-glow)' : 'none',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {accent && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: 2,
                    background: 'var(--primary)',
                    boxShadow: '0 0 8px var(--primary-glow)',
                }} />
            )}
            <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
            }}>
                {label}
            </div>
            <div style={{
                fontSize: 32,
                fontWeight: 700,
                color: accent ? 'var(--primary)' : 'var(--text)',
                letterSpacing: '-0.02em',
                lineHeight: 1,
            }}>
                {value}
            </div>
            {sub && (
                <div style={{
                    fontSize: 12,
                    color: 'var(--text-muted)',
                }}>
                    {sub}
                </div>
            )}
        </div>
    );
}

function SectionHeading({ title, mono }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 12,
            marginBottom: 16,
        }}>
            <h2 style={{
                fontSize: 16,
                fontWeight: 600,
                color: 'var(--text)',
                margin: 0,
            }}>
                {title}
            </h2>
            {mono && (
                <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    color: 'var(--text-muted)',
                }}>
                    {mono}
                </span>
            )}
        </div>
    );
}

function EmptyState({ message }) {
    return (
        <div style={{
            padding: '32px 24px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            letterSpacing: '0.04em',
            border: '1px dashed var(--border)',
            borderRadius: 8,
        }}>
            {message}
        </div>
    );
}

// Added the data props here:
export default function Dashboard({ taskStats, contactStats, upcomingTasks, recentContacts }) {
    const { props } = usePage();
    const user = props.auth?.user;

    // Wired the real backend data into your stats array
    const stats = [
        { label: 'Total Tasks',    value: taskStats?.total || 0,       sub: 'Registered tasks',       accent: true },
        { label: 'In Progress',    value: taskStats?.in_progress || 0, sub: 'Active work items' },
        { label: 'Overdue',        value: taskStats?.overdue || 0,     sub: 'Needs immediate action' },
        { label: 'Total Contacts', value: contactStats?.total || 0,    sub: 'In your address book' },
    ];

    return (
        <AppLayout currentPage="dashboard">
            <Head title="Dashboard" />

            {/* Page header */}
            <div style={{
                marginBottom: 32,
                borderBottom: '1px solid var(--border)',
                paddingBottom: 24,
            }}>
                <div style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    marginBottom: 6,
                }}>
                </div>
                <h1 style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: 'var(--text)',
                    letterSpacing: '-0.02em',
                    margin: 0,
                }}>
                    Dashboard
                </h1>
                {user && (
                    <p style={{
                        marginTop: 6,
                        fontSize: 14,
                        color: 'var(--text-muted)',
                    }}>
                        Welcome back, <span style={{ color: 'var(--text)', fontWeight: 500 }}>{user.name}</span>.
                    </p>
                )}
            </div>

            {/* Stat cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 16,
                marginBottom: 40,
            }}>
                {stats.map((s, i) => (
                    <StatCard key={i} {...s} />
                ))}
            </div>

            {/* Two-column section */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 24,
            }}
                className="dashboard-two-col"
            >
                {/* Recent Tasks */}
                <div>
                    <SectionHeading title="Upcoming Tasks" />
                    <div style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        overflow: 'hidden',
                    }}>
                        {upcomingTasks && upcomingTasks.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {upcomingTasks.map((task, i) => (
                                    <div key={task.id} style={{
                                        padding: '16px 20px',
                                        borderBottom: i !== upcomingTasks.length - 1 ? '1px solid var(--border)' : 'none',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>
                                                {task.name}
                                            </div>
                                            <div style={{
                                                fontFamily: "'JetBrains Mono', monospace",
                                                fontSize: 10,
                                                textTransform: 'uppercase',
                                                color: 'var(--text-muted)'
                                            }}>
                                                <span style={{ color: task.priority_color }}>{task.priority_label}</span> • {task.status_label}
                                            </div>
                                        </div>
                                        <div style={{
                                            fontFamily: "'JetBrains Mono', monospace",
                                            fontSize: 11,
                                            color: task.is_overdue ? 'var(--primary)' : 'var(--text-muted)',
                                            textAlign: 'right'
                                        }}>
                                            {task.due_at_human || 'NO DEADLINE'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState message="// No upcoming tasks" />
                        )}
                    </div>
                </div>

                {/* Recent Contacts */}
                <div>
                    <SectionHeading title="Recent Contacts" />
                    <div style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        overflow: 'hidden',
                    }}>
                        {/* We leave this empty for now until you query recent contacts in the backend! */}
                {recentContacts && recentContacts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {recentContacts.map((contact, i) => (
                        <div key={contact.id} style={{
                            padding: '16px 20px',
                            borderBottom: i !== recentContacts.length - 1 ? '1px solid var(--border)' : 'none',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>
                                    {contact.full_name}
                                </div>
                                <div style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: 11,
                                    color: 'var(--text-muted)'
                                }}>
                                    {contact.company || 'NO_COMPANY'}
                                </div>
                            </div>
                            <div style={{
                                fontSize: 12,
                                color: 'var(--text-muted)',
                                textAlign: 'right'
                            }}>
                                {contact.email || '—'}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState message="// No recent contacts" />
            )}
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 767px) {
                    .dashboard-two-col {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </AppLayout>
    );
}