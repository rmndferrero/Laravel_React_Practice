import { Link } from '@inertiajs/react';
import Avatar from './Avatar';
import { Tag } from './TableComponents';

export default function ContactModal({ contact, onClose }) {
    if (!contact) return null;

    // Build the location string safely
    const locationParts = [contact.street, contact.city, contact.state, contact.country].filter(Boolean);
    const locationString = locationParts.length > 0 ? locationParts.join(', ') : '—';

    return (
        <div className="modal-overlay" onClick={onClose}>
            {/* Stop propagation so clicking inside the modal doesn't close it */}
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                
                <div className="modal-header">
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <Avatar contact={contact} size={56} />
                        <div>
                            <h2 className="contact-name" style={{ fontSize: 20 }}>{contact.full_name}</h2>
                            <div className="detail-label" style={{ marginTop: 4 }}>NODE_ID: {contact.id}</div>
                        </div>
                    </div>
                    <button className="btn-icon" onClick={onClose} title="Close Panel">✕</button>
                </div>

                <div className="modal-body">
                    <div className="detail-grid">
                        <div className="detail-group">
                            <span className="detail-label">Email</span>
                            <span className="detail-value">{contact.email || '—'}</span>
                        </div>
                        <div className="detail-group">
                            <span className="detail-label">Phone number</span>
                            <span className="detail-value">{contact.phone || '—'}</span>
                        </div>
                        <div className="detail-group">
                            <span className="detail-label">Organization</span>
                            <span className="detail-value">{contact.company || '—'}</span>
                        </div>
                        <div className="detail-group">
                            <span className="detail-label">Location</span>
                            <span className="detail-value">{locationString}</span>
                        </div>
                    </div>

                    {contact.tags_array?.length > 0 && (
                        <div className="detail-group" style={{ marginBottom: 24 }}>
                            <span className="detail-label">Tags</span>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                                {contact.tags_array.map(tag => (
                                    <Tag key={tag} label={tag} active={true} />
                                ))}
                            </div>
                        </div>
                    )}

                    {contact.notes && (
                        <div className="detail-group">
                            <span className="detail-label">Notes</span>
                            <div className="detail-value" style={{ 
                                padding: 12, 
                                background: '#141414', 
                                borderRadius: 4, 
                                marginTop: 4, 
                                whiteSpace: 'pre-wrap', 
                                border: '1px solid var(--border)' 
                            }}>
                                {contact.notes}
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        CLOSE
                    </button>
                    <Link href={route('contacts.edit', contact.id)} className="btn btn-primary" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        EDIT RECORD
                    </Link>
                </div>
            </div>
        </div>
    );
}