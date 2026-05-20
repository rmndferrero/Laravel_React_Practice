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

export default function Dashboard() {
    const { props } = usePage();
    const user = props.auth?.user;

    // Placeholder data — will be replaced by real query props later
    const stats = [
        { label: 'Total Tasks',    value: '—',  sub: 'No tasks yet',          accent: true },
        { label: 'In Progress',    value: '—',  sub: 'Active work items'                   },
        { label: 'Completed',      value: '—',  sub: 'Finished tasks'                      },
        { label: 'Total Contacts', value: '—',  sub: 'In your address book'                },
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
                    <SectionHeading title="Recent Tasks"/>
                    <div style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        overflow: 'hidden',
                    }}>
                        <EmptyState message="// Tasks will appear here" />
                    </div>
                </div>

                {/* Recent Contacts */}
                <div>
                    <SectionHeading title="Recent Contacts"/>
                    <div style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        overflow: 'hidden',
                    }}>
                        <EmptyState message="// Contacts will appear here" />
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