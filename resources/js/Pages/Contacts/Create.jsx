import { useState, useRef } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

// ─── Avatar Preview ───────────────────────────────────────────────────────────

function AvatarPreview({ contact, previewUrl, size = 80 }) {
    const initials = contact
        ? `${contact.first_name?.[0] ?? ''}${contact.last_name?.[0] ?? ''}`.toUpperCase()
        : '?';
    const color = '#4f72e4';

    if (previewUrl) {
        return (
            <img
                src={previewUrl}
                alt="Avatar preview"
                style={{
                    width: size, height: size,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid var(--border)',
                }}
            />
        );
    }
    if (contact?.avatar_url) {
        return (
            <img
                src={contact.avatar_url}
                alt="Current avatar"
                style={{
                    width: size, height: size,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid var(--border)',
                }}
            />
        );
    }
    return (
        <div style={{
            width: size, height: size,
            borderRadius: '50%',
            background: color + '18',
            border: `3px solid ${color}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.35,
            fontWeight: 700,
            color,
        }}>
            {initials || '?'}
        </div>
    );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({ label, error, required, children }) {
    return (
        <div className="field">
            {label && (
                <label className="label">
                    {label}
                    {required && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}
                </label>
            )}
            {children}
            {error && <span className="field-error">{error}</span>}
        </div>
    );
}

// ─── Section heading ──────────────────────────────────────────────────────────

function Section({ title }) {
    return (
        <div className="section-heading">
            <span>{title}</span>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ContactsCreate({ contact }) {
    const isEditing = !!contact;

    const [dark, setDark] = useState(() =>
        window.matchMedia('(prefers-color-scheme: dark)').matches
    );
    const [previewUrl, setPreviewUrl] = useState(null);
    const [removeAvatar, setRemoveAvatar] = useState(false);
    const fileRef = useRef();

    const { data, setData, post, put, processing, errors } = useForm({
        first_name:   contact?.first_name   ?? '',
        last_name:    contact?.last_name    ?? '',
        email:        contact?.email        ?? '',
        phone:        contact?.phone        ?? '',
        company:      contact?.company      ?? '',
        street:       contact?.street       ?? '',
        city:         contact?.city         ?? '',
        state:        contact?.state        ?? '',
        zip:          contact?.zip          ?? '',
        country:      contact?.country      ?? '',
        notes:        contact?.notes        ?? '',
        tags:         contact?.tags         ?? '',
        avatar:       null,
        remove_avatar: false,
    });

    function handleFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        setData('avatar', file);
        setRemoveAvatar(false);
        setData('remove_avatar', false);
        const reader = new FileReader();
        reader.onload = ev => setPreviewUrl(ev.target.result);
        reader.readAsDataURL(file);
    }

    function handleRemoveAvatar() {
        setData('avatar', null);
        setData('remove_avatar', true);
        setRemoveAvatar(true);
        setPreviewUrl(null);
        if (fileRef.current) fileRef.current.value = '';
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (isEditing) {
            post(route('contacts.update', contact.id), {
                _method: 'PUT',
                forceFormData: true,
            });
        } else {
            post(route('contacts.store'), { forceFormData: true });
        }
    }

    // ── Theme ─────────────────────────────────────────────────────────────────

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
        '--hover': '#00000006',
        '--shadow': '0 4px 24px #0000000f',
    };

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <>
            <Head title={isEditing ? `Edit — ${contact.full_name}` : 'New Contact'} />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                body {
                    font-family: 'DM Sans', sans-serif;
                    background: var(--bg);
                    color: var(--text);
                    transition: background 0.25s, color 0.25s;
                }

                .create-wrap {
                    min-height: 100vh;
                    padding: 32px 24px;
                    max-width: 760px;
                    margin: 0 auto;
                }

                /* Header */
                .page-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 28px;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    color: var(--text-muted);
                    font-size: 14px;
                    text-decoration: none;
                    font-weight: 500;
                    transition: color 0.15s;
                }
                .back-link:hover { color: var(--text); }

                .page-title {
                    font-size: 24px;
                    font-weight: 700;
                    letter-spacing: -0.4px;
                    color: var(--text);
                }

                .header-right { display: flex; gap: 10px; align-items: center; }

                /* Card */
                .form-card {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    box-shadow: var(--shadow);
                    overflow: hidden;
                }

                /* Avatar section */
                .avatar-section {
                    padding: 28px;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    flex-wrap: wrap;
                }

                .avatar-actions { display: flex; flex-direction: column; gap: 8px; }
                .avatar-hint { font-size: 12px; color: var(--text-muted); }

                /* Section heading */
                .section-heading {
                    padding: 18px 28px 0;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: var(--text-muted);
                }
                .section-heading::after {
                    content: '';
                    display: block;
                    height: 1px;
                    background: var(--border);
                    margin-top: 10px;
                }

                /* Form grid */
                .form-body { padding: 24px 28px 28px; }

                .grid-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                .grid-3 {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 16px;
                }
                .col-span-2 { grid-column: span 2; }
                .col-span-3 { grid-column: span 3; }
                .mt { margin-top: 16px; }

                /* Field */
                .field { display: flex; flex-direction: column; gap: 5px; }

                .label {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-muted);
                }

                .input, .textarea {
                    width: 100%;
                    padding: 10px 13px;
                    background: var(--surface2);
                    border: 1px solid var(--border);
                    border-radius: 9px;
                    font-size: 14px;
                    font-family: 'DM Sans', sans-serif;
                    color: var(--text);
                    outline: none;
                    transition: border 0.15s, box-shadow 0.15s;
                }
                .input:focus, .textarea:focus {
                    border-color: var(--accent);
                    box-shadow: 0 0 0 3px var(--accent-muted);
                    background: var(--surface);
                }
                .input::placeholder, .textarea::placeholder { color: var(--text-muted); }
                .input.error, .textarea.error { border-color: var(--danger); }
                .input.error:focus, .textarea.error:focus { box-shadow: 0 0 0 3px var(--danger-bg); }

                .textarea { resize: vertical; min-height: 90px; }

                .field-error {
                    font-size: 12px;
                    color: var(--danger);
                    font-weight: 500;
                }

                /* Form footer */
                .form-footer {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 10px;
                    padding: 20px 28px;
                    border-top: 1px solid var(--border);
                    background: var(--surface2);
                    flex-wrap: wrap;
                }

                /* Buttons */
                .btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 10px 20px;
                    border-radius: 9px;
                    font-size: 14px;
                    font-weight: 600;
                    font-family: 'DM Sans', sans-serif;
                    cursor: pointer;
                    border: none;
                    transition: all 0.15s;
                    text-decoration: none;
                }
                .btn-primary { background: var(--accent); color: #fff; }
                .btn-primary:hover:not(:disabled) { filter: brightness(1.1); }
                .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
                .btn-ghost {
                    background: transparent;
                    color: var(--text-muted);
                    border: 1px solid var(--border);
                }
                .btn-ghost:hover { background: var(--hover); color: var(--text); }
                .btn-sm {
                    padding: 7px 13px;
                    font-size: 13px;
                    border-radius: 7px;
                }
                .btn-danger-sm {
                    background: var(--danger-bg);
                    color: var(--danger);
                    border: 1px solid var(--danger-border);
                }
                .btn-danger-sm:hover { filter: brightness(0.92); }

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

                .file-input { display: none; }

                /* Tags hint */
                .tags-hint {
                    font-size: 12px;
                    color: var(--text-muted);
                    margin-top: 4px;
                }

                /* Responsive */
                @media (max-width: 600px) {
                    .create-wrap { padding: 16px 12px; }
                    .grid-2, .grid-3 {
                        grid-template-columns: 1fr;
                    }
                    .col-span-2, .col-span-3 { grid-column: span 1; }
                    .form-body { padding: 18px 16px 22px; }
                    .avatar-section { padding: 20px 16px; }
                    .section-heading { padding: 14px 16px 0; }
                    .form-footer { padding: 16px; }
                    .page-title { font-size: 20px; }
                }
            `}</style>

            <div style={theme} className="create-wrap">

                {/* Header */}
                <div className="page-header">
                    <div>
                        <Link href={route('contacts.index')} className="back-link">
                            ← Back to Contacts
                        </Link>
                        <div className="page-title" style={{ marginTop: 6 }}>
                            {isEditing ? `Edit Contact` : 'New Contact'}
                        </div>
                    </div>
                    <div className="header-right">
                        <button
                            className="btn-icon"
                            onClick={() => setDark(d => !d)}
                            title="Toggle theme"
                            type="button"
                        >
                            {dark ? '☀️' : '🌙'}
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="form-card">

                        {/* ── Avatar ── */}
                        <div className="avatar-section">
                            <AvatarPreview
                                contact={isEditing && !removeAvatar ? contact : data}
                                previewUrl={previewUrl}
                                size={80}
                            />
                            <div className="avatar-actions">
                                <input
                                    ref={fileRef}
                                    type="file"
                                    className="file-input"
                                    accept="image/*"
                                    onChange={handleFile}
                                />
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => fileRef.current?.click()}
                                >
                                    📷 {isEditing ? 'Change Photo' : 'Upload Photo'}
                                </button>
                                {(previewUrl || (contact?.avatar_url && !removeAvatar)) && (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-danger-sm"
                                        onClick={handleRemoveAvatar}
                                    >
                                        Remove
                                    </button>
                                )}
                                <span className="avatar-hint">JPG, PNG, GIF — max 2 MB</span>
                            </div>
                        </div>

                        {/* ── Basic Info ── */}
                        <Section title="Basic Information" />
                        <div className="form-body">
                            <div className="grid-2">
                                <Field label="First Name" error={errors.first_name} required>
                                    <input
                                        className={`input${errors.first_name ? ' error' : ''}`}
                                        type="text"
                                        placeholder="Jane"
                                        value={data.first_name}
                                        onChange={e => setData('first_name', e.target.value)}
                                        autoFocus
                                    />
                                </Field>
                                <Field label="Last Name" error={errors.last_name} required>
                                    <input
                                        className={`input${errors.last_name ? ' error' : ''}`}
                                        type="text"
                                        placeholder="Doe"
                                        value={data.last_name}
                                        onChange={e => setData('last_name', e.target.value)}
                                    />
                                </Field>
                                <Field label="Email" error={errors.email}>
                                    <input
                                        className={`input${errors.email ? ' error' : ''}`}
                                        type="email"
                                        placeholder="jane@example.com"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                    />
                                </Field>
                                <Field label="Phone" error={errors.phone}>
                                    <input
                                        className={`input${errors.phone ? ' error' : ''}`}
                                        type="tel"
                                        placeholder="+1 555 000 0000"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                    />
                                </Field>
                                <Field label="Company / Organization" error={errors.company}>
                                    <input
                                        className={`input${errors.company ? ' error' : ''}`}
                                        type="text"
                                        placeholder="Acme Inc."
                                        value={data.company}
                                        onChange={e => setData('company', e.target.value)}
                                    />
                                </Field>
                                <Field label="Tags" error={errors.tags}>
                                    <input
                                        className={`input${errors.tags ? ' error' : ''}`}
                                        type="text"
                                        placeholder="friend, client, vip"
                                        value={data.tags}
                                        onChange={e => setData('tags', e.target.value)}
                                    />
                                    <span className="tags-hint">Comma-separated tags</span>
                                </Field>
                            </div>
                        </div>

                        {/* ── Address ── */}
                        <Section title="Address" />
                        <div className="form-body">
                            <div className="grid-2">
                                <Field label="Street" error={errors.street} >
                                    <input
                                        className={`input${errors.street ? ' error' : ''}`}
                                        type="text"
                                        placeholder="123 Main St"
                                        value={data.street}
                                        onChange={e => setData('street', e.target.value)}
                                    />
                                </Field>
                                <Field label="City" error={errors.city}>
                                    <input
                                        className={`input${errors.city ? ' error' : ''}`}
                                        type="text"
                                        placeholder="Manila"
                                        value={data.city}
                                        onChange={e => setData('city', e.target.value)}
                                    />
                                </Field>
                                <Field label="Province / State" error={errors.state}>
                                    <input
                                        className={`input${errors.state ? ' error' : ''}`}
                                        type="text"
                                        placeholder="Metro Manila"
                                        value={data.state}
                                        onChange={e => setData('state', e.target.value)}
                                    />
                                </Field>
                                <Field label="ZIP / Postal Code" error={errors.zip}>
                                    <input
                                        className={`input${errors.zip ? ' error' : ''}`}
                                        type="text"
                                        placeholder="1000"
                                        value={data.zip}
                                        onChange={e => setData('zip', e.target.value)}
                                    />
                                </Field>
                                <Field label="Country" error={errors.country}>
                                    <input
                                        className={`input${errors.country ? ' error' : ''}`}
                                        type="text"
                                        placeholder="Philippines"
                                        value={data.country}
                                        onChange={e => setData('country', e.target.value)}
                                    />
                                </Field>
                            </div>
                        </div>

                        {/* ── Notes ── */}
                        <Section title="Notes" />
                        <div className="form-body">
                            <Field error={errors.notes}>
                                <textarea
                                    className={`textarea${errors.notes ? ' error' : ''}`}
                                    placeholder="Any additional notes about this contact…"
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    rows={4}
                                />
                            </Field>
                        </div>

                        {/* ── Footer ── */}
                        <div className="form-footer">
                            <Link href={route('contacts.index')} className="btn btn-ghost">
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={processing}
                            >
                                {processing
                                    ? '⏳ Saving…'
                                    : isEditing ? '✓ Save Changes' : '+ Create Contact'}
                            </button>
                        </div>

                    </div>
                </form>
            </div>
        </>
    );
}