import { Head, router, usePage, Link } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import debounce from 'lodash/debounce';
import AppLayout from '@/Layouts/AppLayout';

export default function ConnectionsIndex({ pendingRequests, activeConnections, searchResults, filters }) {
    const { props } = usePage();
    const flash = props.flash ?? {};
    const [search, setSearch] = useState(filters?.search || '');

    // Debounced search to prevent spamming the server
    const handleSearch = useCallback(
        debounce((value) => {
            router.get(route('connections.index'), { search: value }, { preserveState: true, replace: true });
        }, 400), []
    );

    const onSearchChange = (e) => {
        setSearch(e.target.value);
        handleSearch(e.target.value);
    };

    const sendRequest = (userId) => {
        router.post(route('connections.store'), { connected_user_id: userId }, { preserveScroll: true });
    };

    const acceptRequest = (connectionId) => {
        router.put(route('connections.update', connectionId), {}, { preserveScroll: true });
    };

    const removeConnection = (connectionId) => {
        if (confirm('Are you sure you want to remove this connection?')) {
            router.delete(route('connections.destroy', connectionId), { preserveScroll: true });
        }
    };

    return (
        <AppLayout currentPage="connections">
            <Head title="Connections" />

            {/* Page Header */}
            <div style={{ marginBottom: 32, borderBottom: '1px solid var(--border)', paddingBottom: 24 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                </div>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>
                    Connections
                </h1>
            </div>

            {flash.success && (
                <div style={{ padding: '10px 16px', background: 'rgba(52,211,153,0.08)', border: '1px solid #065F46', borderRadius: 4, fontSize: 13, color: '#34D399', marginBottom: 20, fontFamily: "'JetBrains Mono', monospace" }}>
                    ✓ {flash.success}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                
                {/* LEFT COLUMN: Search & Pending */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    
                    {/* Search Panel */}
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 24 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', margin: '0 0 16px 0' }}>Find Users</h2>
                        <input
                            type="search"
                            className="input"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={onSearchChange}
                            style={{ width: '100%', marginBottom: 16 }}
                        />

                        {searchResults.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {searchResults.map(user => (
                                    <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--surface2)', borderRadius: 4, border: '1px solid var(--border)' }}>
                                        <div>
                                            <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{user.name}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.email}</div>
                                        </div>
                                        <button onClick={() => sendRequest(user.id)} className="btn btn-primary" style={{ padding: '4px 12px', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                                            CONNECT
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {search && searchResults.length === 0 && (
                            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No users found matching "{search}".</div>
                        )}
                    </div>

                    {/* Pending Requests Panel */}
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 24 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', margin: '0 0 16px 0' }}>
                            Pending Requests ({pendingRequests.length})
                        </h2>
                        {pendingRequests.length === 0 ? (
                            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No pending requests.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {pendingRequests.map(req => (
                                    <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid var(--border)' }}>
                                        <div>
                                            <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{req.sender.name}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>wants to connect</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button onClick={() => acceptRequest(req.id)} className="btn btn-primary" style={{ padding: '4px 12px', fontSize: 11 }}>ACCEPT</button>
                                            <button onClick={() => removeConnection(req.id)} className="btn btn-ghost" style={{ padding: '4px 12px', fontSize: 11 }}>DECLINE</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Active Network */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 24, alignSelf: 'start' }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', margin: '0 0 16px 0' }}>
                        Your Network ({activeConnections.length})
                    </h2>
                    {activeConnections.length === 0 ? (
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>You haven't added any connections yet.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {activeConnections.map((user, i) => (
                                <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i !== activeConnections.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                    <div>
                                        <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{user.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.email}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <Link href={route('conversations.direct', user.id)} method="post" as="button" className="btn btn-ghost" style={{ padding: '4px 12px', fontSize: 11 }}>MESSAGE</Link>
                                        {/* To remove an active connection, we need to pass the connection ID, not the user ID. We'll handle this detail when we link it up perfectly, for now UI placeholder. */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
            </div>
        </AppLayout>
    );
}   