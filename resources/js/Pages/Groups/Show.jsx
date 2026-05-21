import { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import CreatetaskModal from '@/Pages/Tasks/CreatetaskModal.jsx';

export default function GroupShow({ group, availableConnections, tasks, isAdmin, statuses, priorities }) {
    
    const [showTaskModal, setShowTaskModal] = useState(false);
    // Form for adding new members
    const { data, setData, post, processing, reset, errors } = useForm({
        user_id: '',
    });

    const addMember = (e) => {
        e.preventDefault();
        post(route('groups.members.add', group.id), {
            preserveScroll: true,
            onSuccess: () => reset('user_id'),
        });
    };

    const removeMember = (user) => {
        const isSelf = user.id === group.admin_id; // Using this as a check just in case, but admin shouldn't leave
        const confirmMsg = isAdmin && !isSelf 
            ? `Remove ${user.name} from the group?` 
            : `Are you sure you want to leave ${group.name}?`;
            
        if (confirm(confirmMsg)) {
            router.delete(route('groups.members.remove', [group.id, user.id]), { preserveScroll: true });
        }
    };

    const deleteGroup = () => {
        if (confirm('Are you absolutely sure you want to delete this entire group and its data?')) {
            router.delete(route('groups.destroy', group.id));
        }
    };

    return (
        <AppLayout currentPage="groups">
            <Head title={group.name} />

            <div style={{ paddingBottom: 60, maxWidth: 1200, margin: '0 auto' }}>
                
                {/* Header Section */}
                <div style={{ marginBottom: 32, borderBottom: '1px solid var(--border)', paddingBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                            <Link href={route('groups.index')} style={{ color: 'var(--primary)', textDecoration: 'none' }}>← BACK TO GROUPS</Link>  
                        </div>
                        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                            {group.name}
                            {isAdmin && (
                                <span style={{ background: 'var(--primary-faint)', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>ADMIN</span>
                            )}
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>
                            Created by {group.admin.name} on {new Date(group.created_at).toLocaleDateString()}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        {isAdmin ? (
                            <button onClick={deleteGroup} className="btn btn-danger">Delete Group</button>
                        ) : (
                            <button onClick={() => removeMember({id: group.members.find(m => m.pivot).id})} className="btn btn-danger">Leave Group</button>
                        )}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }} className="group-grid">
                    
                    {/* LEFT COLUMN: Collaborative Tasks */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Group Tasks</h2>
                            <button onClick={() => setShowTaskModal(true)} className="btn btn-primary" style={{ fontSize: 12 }}>+ New Group Task</button>
                        </div>
                        
                        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                            {tasks.length === 0 ? (
                                <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                                    No active tasks 
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {tasks.map((task, i) => (
                                        <div key={task.id} style={{ padding: '16px 20px', borderBottom: i !== tasks.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>
                                                    {task.name}
                                                </div>
                                                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                                                    <span style={{ color: task.priority_color }}>{task.priority_label}</span> • 
                                                    <span>{task.status_label}</span> •
                                                    <span>Assigned to: {task.assignee_name}</span>
                                                </div>
                                            </div>
                                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-muted)' }}>
                                                {task.due_at_human || 'NO_DEADLINE'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Member Management */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Members ({group.members.length})</h2>

                        {/* Admin Invite Form */}
                        {isAdmin && (
                            <form onSubmit={addMember} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
                                <label style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>INVITE_CONNECTION</label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <select
                                        className="input"
                                        style={{ flex: 1 }}
                                        value={data.user_id}
                                        onChange={e => setData('user_id', e.target.value)}
                                        required
                                    >
                                        <option value="" disabled>Select a connection...</option>
                                        {availableConnections.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <button type="submit" disabled={processing || availableConnections.length === 0} className="btn btn-primary" style={{ padding: '8px 16px' }}>
                                        ADD
                                    </button>
                                </div>
                                {availableConnections.length === 0 && (
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>All your connections are already in this group.</div>
                                )}
                                {errors.user_id && <div style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{errors.user_id}</div>}
                            </form>
                        )}

                        {/* Members List */}
                        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
                            {group.members.map((member, i) => (
                                <div key={member.id} style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: i !== group.members.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
                                            {member.name} {member.id === group.admin_id && <span style={{ fontSize: 12, color: 'var(--primary)' }}> (Admin)</span>}
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{member.email}</div>
                                    </div>
                                    
                                    {isAdmin && member.id !== group.admin_id && (
                                        <button onClick={() => removeMember(member)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer' }}>
                                            REMOVE
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
                
            </div>

            {showTaskModal && (
                <CreatetaskModal 
                    isOpen={showTaskModal} 
                    onClose={() => setShowTaskModal(false)} 
                    statuses={statuses} 
                    priorities={priorities}
                    groupId={group.id}
                />            
            )}

            <style>{`
                @media (max-width: 900px) {
                    .group-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </AppLayout>
    );
}