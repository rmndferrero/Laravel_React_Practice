import { useState, useCallback } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import Avatar from '@/Components/Contacts/Avatar';
import { SortIcon, Tag, Flash } from '@/Components/Contacts/TableComponents';
import ContactModal from '@/Components/Contacts/ContactModal.jsx';
import AppLayout from '@/Layouts/AppLayout';
import '@/styles/contacts.css'; // Kept for any leftover base component styles

export default function ContactsIndex({ contacts, filters, companies, countries }) {
    const { props } = usePage();
    const flash = props.flash ?? {};
    
    const [selected, setSelected] = useState([]);
    const [confirmBulk, setConfirmBulk] = useState(false);
    const [viewContact, setViewContact] = useState(null);

    const applyFilter = useCallback(
        debounce((params) => {
            router.get(route('contacts.index'), { ...filters, ...params }, { preserveState: true, replace: true });
        }, 350), [filters]
    );

    const handleSearch = (e) => applyFilter({ search: e.target.value, page: 1 });
    
    function handleSort(field) {
        const direction = filters.sort === field && filters.direction === 'asc' ? 'desc' : 'asc';
        router.get(route('contacts.index'), { ...filters, sort: field, direction }, { preserveState: true, replace: true });
    }

    const allIds = contacts.data.map(c => c.id);
    const allChecked = allIds.length > 0 && allIds.every(id => selected.includes(id));
    const toggleAll = () => setSelected(allChecked ? [] : allIds);
    const toggleOne = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    function deleteSingle(id) {
        if (!confirm('Delete this contact?')) return;
        router.delete(route('contacts.destroy', id));
    }

    function bulkDelete() {
        router.post(route('contacts.bulk-destroy'), { ids: selected }, {
            preserveScroll: true,
            onSuccess: () => { 
                setSelected([]); 
                setConfirmBulk(false); 
            },
        });
    }

    return (
        <AppLayout currentPage="contacts">
            <Head title="Contacts"/>
            
            <div style={{ paddingBottom: 60 }}>
                {/* Page Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: 24,
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: 24,
                    gap: 16,
                    flexWrap: 'wrap',
                }}>
                    <div>
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
                            Contacts
                            <span style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 13,
                                fontWeight: 400,
                                color: 'var(--text-muted)',
                                marginLeft: 12,
                            }}>
                                {contacts.total} total
                            </span>
                        </h1>
                    </div>

                    <Link href={route('contacts.create')} className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>
                        + New Contact
                    </Link>
                </div>

                <Flash message={flash.success} />
                
                {/* Search & Controls */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <div style={{ position: 'relative', width: '100%', maxWidth: 400, minWidth: 200 }}>
                        <span style={{
                            position: 'absolute', left: 12, top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-muted)', fontSize: 13, pointerEvents: 'none',
                        }}>🔍</span>
                        <input 
                            className="input" 
                            type="search" 
                            placeholder="Search contacts..." 
                            defaultValue={filters.search ?? ''} 
                            onChange={handleSearch} 
                            style={{ paddingLeft: 36, width: '100%' }}
                        />
                    </div>
                </div>

                {/* Bulk Delete Bar */}
                {selected.length > 0 && (
                    <div style={{
                        background: 'var(--primary-faint)',
                        border: '1px solid var(--primary)',
                        borderRadius: 8,
                        padding: '12px 20px',
                        marginBottom: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        animation: 'fadeIn 0.2s ease-out'
                    }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.05em' }}>
                            {selected.length} RECORD(S) SELECTED
                        </span>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button className="btn btn-ghost" onClick={() => setSelected([])} style={{ background: 'transparent' }}>Deselect All</button>
                            <button className="btn btn-danger" onClick={() => setConfirmBulk(true)}>Delete Selected</button>
                        </div>
                    </div>
                )}

                {/* Data Table Container */}
                <div style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    overflowX: 'auto',
                }}>
                    {contacts.data.length === 0 ? (
                        <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
                                No records found
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Try adjusting your search or create a new contact.</div>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
                                    <th style={{ padding: '12px 20px', width: 40 }}>
                                        <input type="checkbox" className="cb" checked={allChecked} onChange={toggleAll} />
                                    </th>
                                    <th onClick={() => handleSort('last_name')} style={thStyle}>
                                        <div style={thFlex}>NAME <SortIcon field="last_name" currentSort={filters.sort} direction={filters.direction} /></div>
                                    </th>
                                    <th className="hide-mobile" onClick={() => handleSort('email')} style={thStyle}>
                                        <div style={thFlex}>EMAIL <SortIcon field="email" currentSort={filters.sort} direction={filters.direction}/></div>
                                    </th>
                                    <th className="hide-mobile" style={thStyle}>PHONE</th>
                                    <th className="hide-mobile" onClick={() => handleSort('company')} style={thStyle}>
                                        <div style={thFlex}>ORGANIZATION <SortIcon field="company" currentSort={filters.sort} direction={filters.direction}/></div>
                                    </th>
                                    <th className="hide-mobile" style={thStyle}>TAGS</th>
                                    <th style={{ ...thStyle, textAlign: 'right' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contacts.data.map((contact, index) => (
                                    <tr 
                                        key={contact.id} 
                                        onClick={() => setViewContact(contact)} 
                                        style={{ 
                                            borderBottom: index !== contacts.data.length - 1 ? '1px solid var(--border)' : 'none',
                                            cursor: 'pointer',
                                            background: selected.includes(contact.id) ? 'var(--hover)' : 'transparent',
                                            transition: 'background 0.15s ease'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--hover)'}
                                        onMouseLeave={e => e.currentTarget.style.background = selected.includes(contact.id) ? 'var(--hover)' : 'transparent'}
                                    >
                                        <td onClick={e => e.stopPropagation()} style={{ padding: '14px 20px' }}>
                                            <input type="checkbox" className="cb" checked={selected.includes(contact.id)} onChange={() => toggleOne(contact.id)} />
                                        </td>
                                        <td style={{ padding: '14px 20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <Avatar contact={contact} size={36} />
                                                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
                                                    {contact.full_name}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="hide-mobile" style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-muted)' }}>{contact.email ?? '—'}</td>
                                        <td className="hide-mobile" style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>{contact.phone ?? '—'}</td>
                                        <td className="hide-mobile" style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-muted)' }}>{contact.company ?? '—'}</td>
                                        <td className="hide-mobile" style={{ padding: '14px 20px' }}>
                                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                {contact.tags_array?.slice(0, 2).map(tag => (
                                                    <span key={tag} style={{ 
                                                        fontFamily: "'JetBrains Mono', monospace", fontSize: 10, padding: '2px 8px', borderRadius: 2, 
                                                        background: 'var(--surface2)', color: 'var(--text-muted)', border: '1px solid var(--border)' 
                                                    }}>{tag}</span>
                                                ))}
                                                {contact.tags_array?.length > 2 && (
                                                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-muted)' }}>+{contact.tags_array.length - 2}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td onClick={e => e.stopPropagation()} style={{ padding: '14px 20px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                                <Link href={route('contacts.edit', contact.id)} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 16 }}>✏️</Link>
                                                <button onClick={() => deleteSingle(contact.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16 }}>🗑</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Bulk Confirm Modal */}
            {confirmBulk && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setConfirmBulk(false)}>
                    <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 32, width: '100%', maxWidth: 400 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: '0 0 16px 0' }}>Delete {selected.length} contacts?</h3>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                            <button className="btn btn-ghost" onClick={() => setConfirmBulk(false)}>Cancel</button>
                            <button className="btn btn-danger" onClick={bulkDelete}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            <ContactModal contact={viewContact} onClose={() => setViewContact(null)} />
        </AppLayout>
    );
}

// Reusable inline styles for table headers to keep markup clean
const thStyle = {
    padding: '12px 20px',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    letterSpacing: '0.05em',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    userSelect: 'none'
};

const thFlex = {
    display: 'flex', 
    alignItems: 'center', 
    gap: 6
};