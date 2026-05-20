import { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { useTheme } from '@/context/ThemeContext';
import '@/styles/contacts.css';

const NAV_ITEMS = [
    {
        key: 'dashboard',
        label: 'Dashboard',
        route: 'dashboard',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
            </svg>
        ),
    },
    {
        key: 'tasks',
        label: 'Tasks',
        route: 'dashboard', // placeholder until tasks route exists
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
        ),
    },
    {
        key: 'contacts',
        label: 'Contacts',
        route: 'contacts.index',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
        ),
    },
    {
        key: 'settings',
        label: 'Settings',
        route: 'profile.edit',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
        ),
    },
];

function SidebarContent({ currentKey, onNavClick }) {
    const { props } = usePage();
    const user = props.auth?.user;
    const { dark, toggle } = useTheme();

    function handleLogout() {
        router.post(route('logout'));
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            padding: '0',
        }}>
            {/* Logo / Brand */}
            <div style={{
                padding: '24px 20px 20px',
                borderBottom: '1px solid var(--border)',
            }}>
                <div style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    marginBottom: 4,
                }}>
                </div>
                <div style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: 'var(--primary)',
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                }}>
                    TaskMS
                </div>
            </div>

            {/* Nav Items */}
            <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
                <div style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    padding: '0 8px',
                    marginBottom: 8,
                }}>
                </div>

                {NAV_ITEMS.map((item) => {
                    const isActive = currentKey === item.key;
                    return (
                        <Link
                            key={item.key}
                            href={route(item.route)}
                            onClick={onNavClick}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '10px 12px',
                                borderRadius: 4,
                                marginBottom: 2,
                                textDecoration: 'none',
                                fontSize: 14,
                                fontWeight: isActive ? 600 : 400,
                                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                background: isActive ? 'var(--primary-faint)' : 'transparent',
                                border: `1px solid ${isActive ? 'var(--primary)' : 'transparent'}`,
                                transition: 'all 0.15s ease',
                                position: 'relative',
                            }}
                            onMouseEnter={e => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'var(--hover)';
                                    e.currentTarget.style.color = 'var(--text)';
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = 'var(--text-muted)';
                                    e.currentTarget.style.borderColor = 'transparent';
                                }
                            }}
                        >
                            {/* Active indicator bar */}
                            {isActive && (
                                <div style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: 3,
                                    height: '60%',
                                    background: 'var(--primary)',
                                    borderRadius: '0 2px 2px 0',
                                    boxShadow: '0 0 8px var(--primary-glow)',
                                }} />
                            )}
                            <span style={{ color: isActive ? 'var(--primary)' : 'inherit', flexShrink: 0 }}>
                                {item.icon}
                            </span>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom: User + Theme toggle + Logout */}
            <div style={{
                padding: '12px',
                borderTop: '1px solid var(--border)',
            }}>
                {/* Theme toggle */}
                <button
                    onClick={toggle}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 4,
                        border: '1px solid transparent',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        fontSize: 13,
                        cursor: 'pointer',
                        marginBottom: 4,
                        transition: 'all 0.15s ease',
                        textAlign: 'left',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'var(--hover)';
                        e.currentTarget.style.color = 'var(--text)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-muted)';
                    }}
                >
                    <span style={{ fontSize: 16 }}>{dark ? '☀️' : '🌙'}</span>
                    <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                {/* User info */}
                {user && (
                    <div style={{
                        padding: '10px 12px',
                        borderRadius: 4,
                        background: 'var(--surface2)',
                        border: '1px solid var(--border)',
                        marginBottom: 6,
                    }}>
                        <div style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: 'var(--text)',
                            marginBottom: 2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                            {user.name}
                        </div>
                        <div style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 10,
                            color: 'var(--text-muted)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                            {user.email}
                        </div>
                    </div>
                )}

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 4,
                        border: '1px solid transparent',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        fontSize: 13,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        textAlign: 'left',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'var(--primary-faint)';
                        e.currentTarget.style.color = 'var(--primary)';
                        e.currentTarget.style.borderColor = 'var(--primary)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.borderColor = 'transparent';
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}

export default function AppLayout({ children, currentPage = 'dashboard' }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    // Close drawer on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) setMobileOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Prevent body scroll when mobile drawer is open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    const SIDEBAR_W = 220;

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            background: 'var(--bg)',
            color: 'var(--text)',
            position: 'relative',
        }}>
            {/* ── Desktop Sidebar ── */}
            <aside style={{
                width: SIDEBAR_W,
                flexShrink: 0,
                background: 'var(--surface)',
                borderRight: '1px solid var(--border)',
                position: 'fixed',
                top: 0,
                left: 0,
                height: '100vh',
                overflowY: 'auto',
                zIndex: 40,
                display: 'flex',
                flexDirection: 'column',
            }}
                className="hide-mobile"
            >
                <SidebarContent currentKey={currentPage} onNavClick={() => {}} />
            </aside>

            {/* ── Mobile Overlay ── */}
            {mobileOpen && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.75)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 49,
                    }}
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ── Mobile Drawer ── */}
            <aside style={{
                width: SIDEBAR_W,
                background: 'var(--surface)',
                borderRight: '1px solid var(--border)',
                position: 'fixed',
                top: 0,
                left: 0,
                height: '100vh',
                zIndex: 50,
                transform: mobileOpen ? 'translateX(0)' : `translateX(-${SIDEBAR_W}px)`,
                transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
            }}
                className="show-mobile-only"
            >
                <SidebarContent
                    currentKey={currentPage}
                    onNavClick={() => setMobileOpen(false)}
                />
            </aside>

            {/* ── Main content area ── */}
            <div style={{
                flex: 1,
                marginLeft: SIDEBAR_W,
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
            }}
                className="main-content-area"
            >
                {/* Mobile top bar */}
                <div style={{
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'var(--surface)',
                    borderBottom: '1px solid var(--border)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 30,
                }}
                    className="mobile-topbar"
                >
                    <div style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: 'var(--primary)',
                        letterSpacing: '-0.03em',
                    }}>
                        TaskMS
                    </div>
                    <button
                        onClick={() => setMobileOpen(true)}
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            borderRadius: 4,
                            padding: '6px 8px',
                            cursor: 'pointer',
                            color: 'var(--text)',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Page content */}
                <main style={{ flex: 1, padding: '32px' }} className="app-main">
                    {children}
                </main>
            </div>

            {/* Responsive style overrides */}
            <style>{`
                @media (max-width: 767px) {
                    .hide-mobile { display: none !important; }
                    .show-mobile-only { display: flex !important; }
                    .mobile-topbar { display: flex !important; }
                    .main-content-area { margin-left: 0 !important; }
                    .app-main { padding: 16px !important; }
                }
                @media (min-width: 768px) {
                    .show-mobile-only { display: none !important; }
                }
            `}</style>
        </div>
    );
}