import { useState, useCallback } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import debounce from 'lodash/debounce';

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ contact, size = 40 }) {
    const initials = `${contact.first_name?.[0] ?? ''}${contact.last_name?.[0] ?? ''}`.toUpperCase();
    const colors = [
        '#4f7fe4', '#e4754f', '#4fc4e4', '#a44fe4',
        '#e44f9a', '#4fe48a', '#e4c44f', '#e44f4f',
    ];
    const color = colors[(contact.id ?? 0) % colors.length];

    if (contact.avatar_url) {
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
            borderRadius: '50%',
            backgroundColor: color + '22',
            border: `2px solid ${color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            fontSize: size * 0.36,
            fontWeight: 700,
            color: color,
            letterSpacing: '0.03em',
        }}>
            {initials}
        </div>
    );
}

// ─── Sort Icon ────────────────────────────────────────────────────────────────

function SortIcon({ field, currentSort, direction }) {
    const active = currentSort === field;
    return (
        <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 1, marginLeft: 4, opacity: active ? 1 : 0.3 }}>
            <span style={{ fontSize: 8, lineHeight: 1, color: active && direction === 'asc' ? 'var(--accent)' : 'inherit' }}>▲</span>
            <span style={{ fontSize: 8, lineHeight: 1, color: active && direction === 'desc' ? 'var(--accent)' : 'inherit' }}>▼</span>
        </span>
    );
}

// ─── Tag Badge ────────────────────────────────────────────────────────────────

function Tag({ label }) {
    return (
        <span style={{
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 600,
            background: 'var(--accent-faint)',
            color: 'var(--accent)',
            border: '1px solid var(--accent-muted)',
            whiteSpace: 'nowrap',
        }}>
            {label}
        </span>
    );
}

// ─── Flash Message ────────────────────────────────────────────────────────────

function Flash({ message }) {
    if (!message) return null;
    return (
        <div style={{
            padding: '12px 20px',
            background: 'var(--success-bg)',
            color: 'var(--success)',
            borderRadius: 10,
            border: '1px solid var(--success-border)',
            fontSize: 14,
            fontWeight: 500,
            marginBottom: 20,
        }}>
            ✓ {message}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ContactsIndex({ contacts, filters, companies, countries }) {
    const { props } = usePage();
    const flash = props.flash ?? {};

    const [dark, setDark] = useState(() =>
        window.matchMedia('(prefers-color-scheme: dark)').matches
    );
    const [selected, setSelected] = useState([]);
    const [confirmBulk, setConfirmBulk] = useState(false);

    // ── Search (debounced) ───────────────────────────────────────────────────

    const applyFilter = useCallback(
        debounce((params) => {
            router.get(route('contacts.index'), { ...filters, ...params }, {
                preserveState: true,
                replace: true,
            });
        }, 350),
        [filters]
    );

    function handleSearch(e) {
        applyFilter({ search: e.target.value, page: 1 });
    }

    function handleFilter(key, value) {
        router.get(route('contacts.index'), { ...filters, [key]: value, page: 1 }, {
            preserveState: true, replace: true,
        });
    }

    function handleSort(field) {
        const direction =
            filters.sort === field && filters.direction === 'asc' ? 'desc' : 'asc';
        router.get(route('contacts.index'), { ...filters, sort: field, direction }, {
            preserveState: true, replace: true,
        });
    }

    // ── Selection ────────────────────────────────────────────────────────────

    const allIds = contacts.data.map(c => c.id);
    const allChecked = allIds.length > 0 && allIds.every(id => selected.includes(id));

    function toggleAll() {
        setSelected(allChecked ? [] : allIds);
    }

    function toggleOne(id) {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    }

    // ── Delete ───────────────────────────────────────────────────────────────

    function deleteSingle(id) {
        if (!confirm('Delete this contact?')) return;
        router.delete(route('contacts.destroy', id));
    }

    function bulkDelete() {
        router.post(route('contacts.bulk-destroy'), { ids: selected }, {
            onSuccess: () => { setSelected([]); setConfirmBulk(false); },
        });
    }

    // ── Pagination ───────────────────────────────────────────────────────────

    function goToPage(url) {
        if (url) router.get(url, {}, { preserveState: true });
    }

    // ─── CSS Vars (theme) ────────────────────────────────────────────────────

    const theme = dark ? {
        '--bg': '#0f1117',
        '--surface': '#181c27',
        '--surface2': '#1f2436',
        '--border': '#2a2f45',
        '--text': '#e8eaf2',
        '--text-muted': '#6b7394',
        '--accent': '#6c8ef5',
        '--accent-faint': '#6c8ef511',
        '--accent-muted': '#6c8ef533',
        '--danger': '#f5696c',
        '--danger-bg': '#f5696c11',
        '--danger-border': '#f5696c33',
        '--success': '#4fc98a',
        '--success-bg': '#4fc98a11',
        '--success-border': '#4fc98a33',
        '--hover': '#ffffff08',
        '--shadow': '0 4px 24px #00000060',
    } : {
        '--bg': '#f4f6fb',
        '--surface': '#ffffff',
        '--surface2': '#f0f3fa',
        '--border': '#e2e7f0',
        '--text': '#1a1d2e',
        '--text-muted': '#8892b0',
        '--accent': '#4f72e4',
        '--accent-faint': '#4f72e411',
        '--accent-muted': '#4f72e433',
        '--danger': '#e4504f',
        '--danger-bg': '#e4504f11',
        '--danger-border': '#e4504f33',
        '--success': '#2fa869',
        '--success-bg': '#2fa86911',
        '--success-border': '#2fa86933',
        '--hover': '#00000006',
        '--shadow': '0 4px 24px #0000000f',
    };

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <>
            <Head title="Contacts" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                body {
                    font-family: 'DM Sans', sans-serif;
                    background: var(--bg);
                    color: var(--text);
                    transition: background 0.25s, color 0.25s;
                }

                .contacts-wrap {
                    min-height: 100vh;
                    padding: 32px 24px;
                    max-width: 1100px;
                    margin: 0 auto;
                }

                .page-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 28px;
                    flex-wrap: wrap;
                    gap: 14px;
                }

                .page-title {
                    font-size: 26px;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                    color: var(--text);
                }

                .page-title span {
                    font-size: 15px;
                    font-weight: 400;
                    color: var(--text-muted);
                    margin-left: 10px;
                }

                .header-actions { display: flex; align-items: center; gap: 10px; }

                .btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 9px 18px;
                    border-radius: 9px;
                    font-size: 14px;
                    font-weight: 600;
                    font-family: 'DM Sans', sans-serif;
                    cursor: pointer;
                    border: none;
                    transition: all 0.15s;
                    text-decoration: none;
                    white-space: nowrap;
                }

                .btn-primary {
                    background: var(--accent);
                    color: #fff;
                }
                .btn-primary:hover { filter: brightness(1.1); }

                .btn-ghost {
                    background: transparent;
                    color: var(--text-muted);
                    border: 1px solid var(--border);
                }
                .btn-ghost:hover { background: var(--hover); color: var(--text); }

                .btn-danger {
                    background: var(--danger-bg);
                    color: var(--danger);
                    border: 1px solid var(--danger-border);
                }
                .btn-danger:hover { filter: brightness(0.92); }

                .btn-icon {
                    padding: 8px;
                    background: transparent;
                    border: 1px solid var(--border);
                    color: var(--text-muted);
                    border-radius: 9px;
                    cursor: pointer;
                    font-size: 16px;
                    display: inline-flex;
                    align-items: center;
                    transition: all 0.15s;
                }
                .btn-icon:hover { background: var(--hover); color: var(--text); }

                /* Controls bar */
                .controls {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                    align-items: center;
                }

                .search-wrap {
                    flex: 1;
                    min-width: 200px;
                    position: relative;
                }

                .search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                    font-size: 15px;
                    pointer-events: none;
                }

                .input {
                    width: 100%;
                    padding: 9px 12px 9px 36px;
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 9px;
                    font-size: 14px;
                    font-family: 'DM Sans', sans-serif;
                    color: var(--text);
                    outline: none;
                    transition: border 0.15s, box-shadow 0.15s;
                }
                .input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-muted); }
                .input::placeholder { color: var(--text-muted); }

                .select {
                    padding: 9px 32px 9px 12px;
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 9px;
                    font-size: 14px;
                    font-family: 'DM Sans', sans-serif;
                    color: var(--text);
                    outline: none;
                    cursor: pointer;
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238892b0' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 10px center;
                    transition: border 0.15s;
                }
                .select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-muted); }

                /* Bulk bar */
                .bulk-bar {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 16px;
                    background: var(--accent-faint);
                    border: 1px solid var(--accent-muted);
                    border-radius: 10px;
                    margin-bottom: 16px;
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--accent);
                    flex-wrap: wrap;
                }

                /* Table card */
                .table-card {
                    background: var(--surface);
                    border-radius: 14px;
                    border: 1px solid var(--border);
                    box-shadow: var(--shadow);
                    overflow: hidden;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                }

                thead th {
                    padding: 12px 16px;
                    text-align: left;
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    color: var(--text-muted);
                    background: var(--surface2);
                    border-bottom: 1px solid var(--border);
                    white-space: nowrap;
                    cursor: pointer;
                    user-select: none;
                    transition: color 0.15s;
                }
                thead th:hover { color: var(--text); }
                thead th.no-sort { cursor: default; }
                thead th:first-child { border-radius: 0; }

                tbody tr {
                    border-bottom: 1px solid var(--border);
                    transition: background 0.1s;
                }
                tbody tr:last-child { border-bottom: none; }
                tbody tr:hover { background: var(--hover); }
                tbody tr.selected-row { background: var(--accent-faint); }

                td {
                    padding: 14px 16px;
                    font-size: 14px;
                    vertical-align: middle;
                }

                .contact-info { display: flex; align-items: center; gap: 12px; }
                .contact-name { font-weight: 600; color: var(--text); font-size: 14px; }
                .contact-meta { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

                .row-actions { display: flex; gap: 6px; align-items: center; }

                .action-btn {
                    padding: 5px 10px;
                    border-radius: 7px;
                    font-size: 12px;
                    font-weight: 600;
                    font-family: 'DM Sans', sans-serif;
                    cursor: pointer;
                    border: 1px solid var(--border);
                    background: transparent;
                    color: var(--text-muted);
                    text-decoration: none;
                    transition: all 0.15s;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                }
                .action-btn:hover { background: var(--hover); color: var(--text); }
                .action-btn.danger { color: var(--danger); border-color: var(--danger-border); }
                .action-btn.danger:hover { background: var(--danger-bg); }

                /* Checkbox */
                .cb {
                    width: 17px;
                    height: 17px;
                    accent-color: var(--accent);
                    cursor: pointer;
                }

                /* Pagination */
                .pagination {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 20px;
                    border-top: 1px solid var(--border);
                    font-size: 13px;
                    color: var(--text-muted);
                    flex-wrap: wrap;
                    gap: 10px;
                }
                .page-btns { display: flex; gap: 6px; }
                .page-btn {
                    padding: 5px 11px;
                    border-radius: 7px;
                    border: 1px solid var(--border);
                    background: transparent;
                    color: var(--text);
                    font-size: 13px;
                    font-family: 'DM Sans', sans-serif;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .page-btn:hover:not(:disabled) { background: var(--hover); }
                .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
                .page-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }

                /* Empty state */
                .empty {
                    padding: 60px 20px;
                    text-align: center;
                    color: var(--text-muted);
                }
                .empty-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.5; }
                .empty h3 { font-size: 17px; color: var(--text); margin-bottom: 6px; }
                .empty p { font-size: 14px; }

                /* Confirm overlay */
                .overlay {
                    position: fixed; inset: 0;
                    background: #00000055;
                    backdrop-filter: blur(3px);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 100;
                    padding: 20px;
                }
                .confirm-card {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    padding: 28px;
                    max-width: 380px;
                    width: 100%;
                    box-shadow: var(--shadow);
                }
                .confirm-card h3 { font-size: 17px; font-weight: 700; margin-bottom: 8px; }
                .confirm-card p { font-size: 14px; color: var(--text-muted); margin-bottom: 20px; }
                .confirm-actions { display: flex; gap: 10px; justify-content: flex-end; }

                /* Responsive */
                @media (max-width: 700px) {
                    .contacts-wrap { padding: 20px 14px; }
                    .hide-mobile { display: none !important; }
                    .page-title { font-size: 20px; }
                    td, th { padding: 11px 10px; }
                }

                @media (max-width: 480px) {
                    .controls { gap: 8px; }
                    .search-wrap { min-width: 100%; }
                }
            `}</style>

            <div style={theme} className="contacts-wrap">

                {/* Header */}
                <div className="page-header">
                    <div className="page-title">
                        Contacts
                        <span>{contacts.total} total</span>
                    </div>
                    <div className="header-actions">
                        <button
                            className="btn-icon"
                            onClick={() => setDark(d => !d)}
                            title="Toggle theme"
                        >
                            {dark ? '☀️' : '🌙'}
                        </button>
                        <Link href={route('contacts.create')} className="btn btn-primary">
                            + New Contact
                        </Link>
                    </div>
                </div>

                <Flash message={flash.success} />

                {/* Controls */}
                <div className="controls">
                    <div className="search-wrap">
                        <span className="search-icon">🔍</span>
                        <input
                            className="input"
                            type="search"
                            placeholder="Search name, email, phone, company…"
                            defaultValue={filters.search ?? ''}
                            onChange={handleSearch}
                        />
                    </div>

                    {companies.length > 0 && (
                        <select
                            className="select"
                            value={filters.company ?? ''}
                            onChange={e => handleFilter('company', e.target.value)}
                        >
                            <option value="">All Companies</option>
                            {companies.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    )}

                    {countries.length > 0 && (
                        <select
                            className="select"
                            value={filters.country ?? ''}
                            onChange={e => handleFilter('country', e.target.value)}
                        >
                            <option value="">All Countries</option>
                            {countries.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    )}

                    {(filters.search || filters.company || filters.country) && (
                        <button
                            className="btn btn-ghost"
                            onClick={() => router.get(route('contacts.index'))}
                        >
                            ✕ Clear
                        </button>
                    )}
                </div>

                {/* Bulk action bar */}
                {selected.length > 0 && (
                    <div className="bulk-bar">
                        <span>{selected.length} selected</span>
                        <button
                            className="btn btn-danger"
                            onClick={() => setConfirmBulk(true)}
                        >
                            🗑 Delete Selected
                        </button>
                        <button
                            className="btn btn-ghost"
                            style={{ marginLeft: 'auto' }}
                            onClick={() => setSelected([])}
                        >
                            Deselect All
                        </button>
                    </div>
                )}

                {/* Table */}
                <div className="table-card">
                    {contacts.data.length === 0 ? (
                        <div className="empty">
                            <div className="empty-icon">👤</div>
                            <h3>No contacts found</h3>
                            <p>Try adjusting your search or filters, or add a new contact.</p>
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th className="no-sort" style={{ width: 40 }}>
                                        <input
                                            type="checkbox"
                                            className="cb"
                                            checked={allChecked}
                                            onChange={toggleAll}
                                        />
                                    </th>
                                    <th onClick={() => handleSort('last_name')}>
                                        Name <SortIcon field="last_name" currentSort={filters.sort} direction={filters.direction} />
                                    </th>
                                    <th className="hide-mobile" onClick={() => handleSort('email')}>
                                        Email <SortIcon field="email" currentSort={filters.sort} direction={filters.direction} />
                                    </th>
                                    <th className="hide-mobile">Phone</th>
                                    <th className="hide-mobile" onClick={() => handleSort('company')}>
                                        Company <SortIcon field="company" currentSort={filters.sort} direction={filters.direction} />
                                    </th>
                                    <th className="hide-mobile no-sort">Tags</th>
                                    <th className="no-sort" style={{ width: 110 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contacts.data.map(contact => (
                                    <tr
                                        key={contact.id}
                                        className={selected.includes(contact.id) ? 'selected-row' : ''}
                                    >
                                        <td>
                                            <input
                                                type="checkbox"
                                                className="cb"
                                                checked={selected.includes(contact.id)}
                                                onChange={() => toggleOne(contact.id)}
                                            />
                                        </td>
                                        <td>
                                            <div className="contact-info">
                                                <Avatar contact={contact} size={38} />
                                                <div>
                                                    <div className="contact-name">{contact.full_name}</div>
                                                    <div className="contact-meta hide-desktop" style={{ display: 'none' }}>
                                                        {contact.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="hide-mobile" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                                            {contact.email ?? '—'}
                                        </td>
                                        <td className="hide-mobile" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                                            {contact.phone ?? '—'}
                                        </td>
                                        <td className="hide-mobile" style={{ fontWeight: 500, fontSize: 13 }}>
                                            {contact.company ?? '—'}
                                        </td>
                                        <td className="hide-mobile">
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                                {contact.tags_array?.slice(0, 3).map(tag => (
                                                    <Tag key={tag} label={tag} />
                                                ))}
                                                {contact.tags_array?.length > 3 && (
                                                    <Tag label={`+${contact.tags_array.length - 3}`} />
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="row-actions">
                                                <Link
                                                    href={route('contacts.edit', contact.id)}
                                                    className="action-btn"
                                                >
                                                    ✏️
                                                </Link>
                                                <button
                                                    className="action-btn danger"
                                                    onClick={() => deleteSingle(contact.id)}
                                                >
                                                    🗑
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* Pagination */}
                    {contacts.last_page > 1 && (
                        <div className="pagination">
                            <span>
                                Showing {contacts.from}–{contacts.to} of {contacts.total}
                            </span>
                            <div className="page-btns">
                                <button
                                    className="page-btn"
                                    disabled={!contacts.prev_page_url}
                                    onClick={() => goToPage(contacts.prev_page_url)}
                                >
                                    ← Prev
                                </button>
                                {contacts.links
                                    .filter(l => !isNaN(Number(l.label)))
                                    .map(link => (
                                        <button
                                            key={link.label}
                                            className={`page-btn${link.active ? ' active' : ''}`}
                                            onClick={() => goToPage(link.url)}
                                        >
                                            {link.label}
                                        </button>
                                    ))
                                }
                                <button
                                    className="page-btn"
                                    disabled={!contacts.next_page_url}
                                    onClick={() => goToPage(contacts.next_page_url)}
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bulk delete confirm modal */}
            {confirmBulk && (
                <div className="overlay" onClick={() => setConfirmBulk(false)}>
                    <div className="confirm-card" onClick={e => e.stopPropagation()} style={theme}>
                        <h3>Delete {selected.length} contact{selected.length > 1 ? 's' : ''}?</h3>
                        <p>This action cannot be undone. The selected contacts will be permanently removed.</p>
                        <div className="confirm-actions">
                            <button className="btn btn-ghost" onClick={() => setConfirmBulk(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={bulkDelete}>
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}