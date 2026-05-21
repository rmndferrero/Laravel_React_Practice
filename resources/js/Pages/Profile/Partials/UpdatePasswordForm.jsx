import { useForm } from '@inertiajs/react';
import { useRef } from 'react';
import { Transition } from '@headlessui/react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                    Update Password
                </h2>
                <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                    Ensure your account is using a long, random password to stay secure.
                </p>
            </header>

            <form onSubmit={updatePassword} style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                    <label htmlFor="current_password" style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>CURRENT_PASSWORD</label>
                    <input
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        type="password"
                        className="input"
                        autoComplete="current-password"
                        style={{ width: '100%', maxWidth: 400 }}
                    />
                    {errors.current_password && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.current_password}</div>}
                </div>

                <div>
                    <label htmlFor="password" style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>NEW_PASSWORD</label>
                    <input
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type="password"
                        className="input"
                        autoComplete="new-password"
                        style={{ width: '100%', maxWidth: 400 }}
                    />
                    {errors.password && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.password}</div>}
                </div>

                <div>
                    <label htmlFor="password_confirmation" style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>CONFIRM_PASSWORD</label>
                    <input
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        type="password"
                        className="input"
                        autoComplete="new-password"
                        style={{ width: '100%', maxWidth: 400 }}
                    />
                    {errors.password_confirmation && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.password_confirmation}</div>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button disabled={processing} className="btn btn-primary" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {processing ? 'SAVING...' : 'UPDATE PASSWORD'}
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out duration-300"
                        leaveTo="opacity-0"
                    >
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}