import AppLayout from '@/Layouts/AppLayout';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Head } from '@inertiajs/react';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AppLayout currentPage="profile">
            <Head title="Profile" />

            {/* Added a centering wrapper here */}
            <div style={{ maxWidth: 800, margin: '0 auto', width: '100%' }}>
                
                {/* Page header */}
                <div style={{
                    marginBottom: 32,
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: 24,
                }}>
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
                        Profile Settings
                    </h1>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 32 }}>
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </div>

                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 32 }}>
                        <UpdatePasswordForm />
                    </div>

                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 32 }}>
                        <DeleteUserForm />
                    </div>
                </div>
                
            </div>
        </AppLayout>
    );
}