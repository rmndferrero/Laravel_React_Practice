import { Link, useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                    Profile Information
                </h2>
                <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                    Update your account's profile information and email address.
                </p>
            </header>

            <form onSubmit={submit} style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                    <label htmlFor="name" style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>NAME</label>
                    <input
                        id="name"
                        type="text"
                        className="input"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoComplete="name"
                        style={{ width: '100%', maxWidth: 400 }}
                    />
                    {errors.name && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.name}</div>}
                </div>

                <div>
                    <label htmlFor="email" style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>EMAIL_ADDRESS</label>
                    <input
                        id="email"
                        type="email"
                        className="input"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                        style={{ width: '100%', maxWidth: 400 }}
                    />
                    {errors.email && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.email}</div>}
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                style={{ color: 'var(--primary)', textDecoration: 'underline', marginLeft: 6, background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <div style={{ color: '#34D399', fontSize: 13, marginTop: 8, fontFamily: "'JetBrains Mono', monospace" }}>
                                ✓ A new verification link has been sent to your email address.
                            </div>
                        )}
                    </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button disabled={processing} className="btn btn-primary" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {processing ? 'SAVING...' : 'SAVE CHANGES'}
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