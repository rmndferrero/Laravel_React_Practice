import { useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const { data, setData, delete: destroy, processing, reset, errors } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        reset();
    };

    return (
        <section className={className}>
            <header>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                    Delete Account
                </h2>
                <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)', maxWidth: 600 }}>
                    Once your account is deleted, all of its resources and data will be permanently deleted. Before
                    deleting your account, please download any data or information that you wish to retain.
                </p>
            </header>

            <button 
                onClick={confirmUserDeletion} 
                className="btn btn-danger" 
                style={{ marginTop: 24, fontFamily: "'JetBrains Mono', monospace" }}
            >
                DELETE ACCOUNT
            </button>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} style={{ 
                    padding: 32, 
                    background: 'var(--surface)', 
                    color: 'var(--text)',
                    border: '1px solid var(--border)' 
                }}>
                    <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                        Are you sure you want to delete your account?
                    </h2>

                    <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                        Once your account is deleted, all of its resources and data will be permanently deleted. Please
                        enter your password to confirm you would like to permanently delete your account.
                    </p>

                    <div style={{ marginTop: 24 }}>
                        <label htmlFor="password" style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>PASSWORD</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="input"
                            placeholder="Enter your password"
                            style={{ width: '100%' }}
                        />
                        {errors.password && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.password}</div>}
                    </div>

                    <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <button type="button" onClick={closeModal} className="btn btn-ghost" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            CANCEL
                        </button>
                        <button type="submit" disabled={processing} className="btn btn-danger" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            {processing ? 'DELETING...' : 'CONFIRM DELETION'}
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}