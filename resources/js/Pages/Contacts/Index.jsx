import { useState, useCallback } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import Avatar from '@/Components/Contacts/Avatar.jsx';
import { SortIcon, Tag, Flash } from '@/Components/Contacts/TableComponents.jsx';
import '@/styles/contacts.css';
import ContactModal from '@/Components/Contacts/ContactModal.jsx';
import { useTheme } from '@/context/ThemeContext.jsx'; 

export default function ContactsIndex({ contacts, filters, companies, countries }) {
    const { props } = usePage();
    const flash = props.flash ?? {};

    const { dark, toggle } = useTheme();
    
    // Removed the duplicate state declarations
    const [selected, setSelected] = useState([]);
    const [confirmBulk, setConfirmBulk] = useState(false);
    const [viewContact, setViewContact] = useState(null);

    const applyFilter = useCallback(
        debounce((params) => {
            router.get(route('contacts.index'), { ...filters, ...params }, { preserveState: true, replace: true });
        }, 350), [filters]
    );

    const handleSearch = (e) => applyFilter({ search: e.target.value, page: 1 });
    const handleFilter = (key, value) => router.get(route('contacts.index'), { ...filters, [key]: value, page: 1 }, { preserveState: true, replace: true });
    
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
            onSuccess: () => { setSelected([]); setConfirmBulk(false); },
        });
    }

    function handleLogout() {
        router.post(route('logout'));
    }

    return (
        <>
        
            <Head title="Contacts"/>
            <div className="contacts-wrap">
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '32px',
                    paddingBottom: '24px',
                    borderBottom: '1px solid var(--border)'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '32px',
                            fontWeight: '700',
                            color: 'var(--primary)',
                            marginBottom: '8px',
                            letterSpacing: '-0.01em'
                        }}>ContactMS</h1>
                        <p style={{
                            fontSize: '14px',
                            color: 'var(--text-muted)',
                            fontFamily: "'JetBrains Mono', monospace"
                        }}>Manage your contacts efficiently</p>
                    </div>
                    <div className="header-actions">
                        <button 
                            className="btn-icon" 
                            onClick={toggle} 
                            title="Toggle theme"
                            style={{ fontSize: '18px', fontWeight: 'bold' }}
                        >
                            {dark ? '☀️' : '🌙'}
                        </button>
                        <Link 
                            href={route('contacts.create')} 
                            className="btn btn-primary"
                            style={{ gap: '6px' }}
                        >
                            <span>+</span> New Contact
                        </Link>
                        <button 
                            className="btn btn-ghost" 
                            onClick={handleLogout}
                            style={{ 
                                borderColor: 'var(--border)',
                                border: '1px solid var(--border)'
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>

                <div className="page-header">
                    <div className="page-title">Contacts <span>{contacts.total} total</span></div>
                </div>
                <Flash message={flash.success} />
                
                {/* Search & Filters Controls Component */}
                <div className="controls">
                    <div className="search-wrap">
                        <span className="search-icon">🔍</span>
                        <input className="input" type="search" placeholder="Search..." defaultValue={filters.search ?? ''} onChange={handleSearch} />
                    </div>
                </div>

                {/* Bulk Delete Bar */}
                {selected.length > 0 && (
                    <div className="bulk-bar">
                        <span>{selected.length} selected</span>
                        <button className="btn btn-danger" onClick={() => setConfirmBulk(true)}>🗑 Delete Selected</button>
                        <button className="btn btn-ghost" style={{ marginLeft: 'auto' }} onClick={() => setSelected([])}>Deselect All</button>
                    </div>
                )}

                {/* Data Table */}
                <div className="table-card">
                    {contacts.data.length === 0 ? (
                        <div className="empty"><h3>No contacts found</h3></div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: 40 }}><input type="checkbox" className="cb" checked={allChecked} onChange={toggleAll} /></th>
                                    <th onClick={() => handleSort('last_name')}>Name <SortIcon field="last_name" currentSort={filters.sort} direction={filters.direction} /></th>
                                    <th className="hide-mobile" onClick={() => handleSort('email')}>Email<SortIcon field="email" currentSort={filters.sort} direction={filters.direction}/></th>
                                    <th className="hide-mobile">Phone</th>
                                    <th className="hide-mobile" onClick={() => handleSort('company')}>Company<SortIcon field="company" currentSort={filters.sort} direction={filters.direction}/></th>
                                    <th className="hide-mobile">Tags</th>
                                    <th className="hide-mobile">Notes</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contacts.data.map(contact => (
                                    <tr 
                                        key={contact.id} 
                                        className={selected.includes(contact.id) ? 'selected-row' : ''}
                                        onClick={() => setViewContact(contact)} 
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td onClick={e => e.stopPropagation()}>
                                            <input type="checkbox" className="cb" checked={selected.includes(contact.id)} onChange={() => toggleOne(contact.id)} />
                                        </td>
                                        
                                        <td>
                                            <div className="contact-info">
                                                <Avatar contact={contact} size={38} />
                                                <div><div className="contact-name">{contact.full_name}</div></div>
                                            </div>
                                        </td>
                                        <td className="hide-mobile">{contact.email ?? '—'}</td>
                                        <td className="hide-mobile">{contact.phone ?? '—'}</td>
                                        <td className="hide-mobile">{contact.company ?? '—'}</td>
                                        <td className="hide-mobile">
                                            {contact.tags_array?.slice(0, 3).map(tag => <Tag key={tag} label={tag} />)}
                                        </td>
                                        <td className="hide-mobile">{contact.notes ?? '—'}</td>

                                        <td onClick={e => e.stopPropagation()}>
                                            <div className="row-actions">
                                                <Link href={route('contacts.edit', contact.id)} className="action-btn">✏️</Link>
                                                <button className="action-btn danger" onClick={() => deleteSingle(contact.id)}>🗑</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Confirm Modal */}
            {confirmBulk && (
                <div className="overlay" onClick={() => setConfirmBulk(false)}>
                    {/* Removed style={theme} here because it is no longer defined */}
                    <div className="confirm-card" onClick={e => e.stopPropagation()}>
                        <h3>Delete {selected.length} contacts?</h3>
                        <div className="confirm-actions">
                            <button className="btn btn-ghost" onClick={() => setConfirmBulk(false)}>Cancel</button>
                            <button className="btn btn-danger" onClick={bulkDelete}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* The New Detail View Modal */}
            <ContactModal 
                contact={viewContact} 
                onClose={() => setViewContact(null)} 
            />
        </>
    );
}