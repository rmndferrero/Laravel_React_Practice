import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Modal from '@/Components/Modal';

export default function GroupsIndex({ groups }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
    });

    const createGroup = (e) => {
        e.preventDefault();
        post(route('groups.store'), {
            onSuccess: () => {
                reset();
                setIsModalOpen(false);
            }
        });
    };

    return (
        <AppLayout currentPage="groups">
            <Head title="Groups" />

            <div style={{ marginBottom: 32, borderBottom: '1px solid var(--border)', paddingBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                    </div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>
                        My Groups
                    </h1>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
                    + Create Group
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
                {groups.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', padding: '60px 24px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 8, color: 'var(--text-muted)' }}>
                        You are not part of any groups yet. Create one to start collaborating!
                    </div>
                ) : (
                    groups.map(group => (
                        <div key={group.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 24, display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 12px var(--primary-glow)'} onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: '0 0 8px 0' }}>{group.name}</h2>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>
                                {group.members_count} Member{group.members_count !== 1 ? 's' : ''}
                            </div>
                            <div style={{ marginTop: 'auto', display: 'flex', gap: 12 }}>
                                <Link href={route('groups.show', group.id)} className="btn btn-primary" style={{ flex: 1, textAlign: 'center' }}>
                                    ENTER WORKSPACE
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={createGroup} style={{ padding: 32, background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: '0 0 24px 0' }}>Enter Group Name</h2>
                    <input
                        type="text"
                        className="input"
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        style={{ width: '100%', marginBottom: errors.name ? 4 : 24 }}
                        placeholder="e.g. Frontend Team"
                        required
                    />
                    {errors.name && <div style={{ color: '#ef4444', fontSize: 11, marginBottom: 20 }}>{errors.name}</div>}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost">CANCEL</button>
                        <button type="submit" disabled={processing} className="btn btn-primary">{processing ? 'CREATING...' : 'CREATE'}</button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}