import { useState, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AvatarPreview from '@/Components/Contacts/AvatarPreview.jsx';
import { Field, Section } from '@/Components/Contacts/FormComponents.jsx';
import { useTheme } from '@/context/ThemeContext.jsx';
import '@/styles/contacts.css';

export default function ContactsCreate({ contact }) {
    const isEditing = !!contact;
    const { dark, toggle } = useTheme();
    const [previewUrl, setPreviewUrl] = useState(null);
    const [removeAvatar, setRemoveAvatar] = useState(false);
    const fileRef = useRef();

    const { data, setData, post, processing, errors } = useForm({
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
        _method:      isEditing ? 'PUT' : 'POST', // Critical fix for updates
    });

    function handleFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        setData({ ...data, avatar: file, remove_avatar: false });
        setRemoveAvatar(false);
        const reader = new FileReader();
        reader.onload = ev => setPreviewUrl(ev.target.result);
        reader.readAsDataURL(file);
    }

    function handleRemoveAvatar() {
        setData({ ...data, avatar: null, remove_avatar: true });
        setRemoveAvatar(true);
        setPreviewUrl(null);
        if (fileRef.current) fileRef.current.value = '';
    }

    function handleSubmit(e) {
        e.preventDefault();
        const routeName = isEditing ? 'contacts.update' : 'contacts.store';
        post(route(routeName, isEditing ? contact.id : undefined), { forceFormData: true });
    }

    return (
        <>
            <Head title={isEditing ? `Edit — ${contact.full_name}` : 'New Contact Record'} />
                <div className="create-wrap">
                    
                    {/* Header */}
                    <div className="page-header">
                        <div>
                            <Link href={route('contacts.index')} className="btn-ghost" style={{ padding: 0, textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                                ← Return
                            </Link>
                            <div className="page-title" style={{ marginTop: 8, textTransform: 'uppercase' }}>
                                {isEditing ? `Edit Record` : 'Initialize Record'}
                                <span>{isEditing ? `ID:${contact.id}` :''}</span>
                            </div>
                        </div>
                        <div className="header-actions">
                            <button className="btn-icon" onClick={toggle} type="button" title="Toggle Theme">
                                {dark ? '☀️' : '🌙'}
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-card">
                            
                            {/* Avatar Section */}
                            <div className="avatar-section">
                                <AvatarPreview 
                                    contact={isEditing && !removeAvatar ? contact : data} 
                                    previewUrl={previewUrl} 
                                    size={80} 
                                />
                                <div className="avatar-actions">
                                    <input ref={fileRef} type="file" className="file-input" accept="image/*" onChange={handleFile} />
                                    <button type="button" className="btn btn-icon" onClick={() => fileRef.current?.click()}>
                                        {isEditing ? 'Change Photo' : 'Upload photo'}
                                    </button>
                                    {(previewUrl || (contact?.avatar_url && !removeAvatar)) && (
                                        <button type="button" className="btn btn-danger" onClick={handleRemoveAvatar}>
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Basic Info */}
                            <Section title="Information" />
                            <div className="form-body">
                                <div className="grid-2">
                                    <Field label="First Name" error={errors.first_name} required>
                                        <input className={`input${errors.first_name ? ' error' : ''}`} type="text" value={data.first_name} onChange={e => setData('first_name', e.target.value)} autoFocus placeholder="Juan" />
                                    </Field>
                                    <Field label="Last Name" error={errors.last_name} required>
                                        <input className={`input${errors.last_name ? ' error' : ''}`} type="text" value={data.last_name} onChange={e => setData('last_name', e.target.value)} placeholder="Dela Cruz" />
                                    </Field>
                                    <Field label="Email" error={errors.email}>
                                        <input className={`input${errors.email ? ' error' : ''}`} type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="user@email.com" />
                                    </Field>
                                    <Field label="Phone Number" error={errors.phone}>
                                        <input className={`input${errors.phone ? ' error' : ''}`} type="tel" value={data.phone} onChange={e => setData('phone', e.target.value)} placeholder="+63 000 000 0000" />
                                    </Field>
                                    <Field label="Organization" error={errors.company}>
                                        <input className={`input${errors.company ? ' error' : ''}`} type="text" value={data.company} onChange={e => setData('company', e.target.value)} placeholder="Organization Name" />
                                    </Field>
                                    <Field label="Tags" error={errors.tags}>
                                        <input className={`input${errors.tags ? ' error' : ''}`} type="text" value={data.tags} onChange={e => setData('tags', e.target.value)} placeholder="comma, separated, tags" />
                                    </Field>
                                </div>
                            </div>

                            {/* Address */}
                            <Section title="Location Coordinates" />
                            <div className="form-body">
                                <div className="grid-2">
                                    <Field label="Street / Sector" error={errors.street}>
                                        <input className={`input${errors.street ? ' error' : ''}`} type="text" value={data.street} onChange={e => setData('street', e.target.value)} />
                                    </Field>
                                    <Field label="City" error={errors.city}>
                                        <input className={`input${errors.city ? ' error' : ''}`} type="text" value={data.city} onChange={e => setData('city', e.target.value)} />
                                    </Field>
                                    <Field label="State / Province" error={errors.state}>
                                        <input className={`input${errors.state ? ' error' : ''}`} type="text" value={data.state} onChange={e => setData('state', e.target.value)} />
                                    </Field>
                                    <Field label="Zip / Node Code" error={errors.zip}>
                                        <input className={`input${errors.zip ? ' error' : ''}`} type="text" value={data.zip} onChange={e => setData('zip', e.target.value)} />
                                    </Field>
                                    <Field label="Country" error={errors.country}>
                                        <input className={`input${errors.country ? ' error' : ''}`} type="text" value={data.country} onChange={e => setData('country', e.target.value)} />
                                    </Field>
                                </div>
                            </div>

                            {/* Notes */}
                            <Section title="Notes" />
                            <div className="form-body">
                                <Field error={errors.notes}>
                                    <textarea className={`textarea${errors.notes ? ' error' : ''}`} value={data.notes} onChange={e => setData('notes', e.target.value)} placeholder="Input additional notes here..." rows={4} />
                                </Field>
                            </div>

                            {/* Footer Actions */}
                            <div className="form-footer">
                                <Link href={route('contacts.index')} className="btn btn-ghost">
                                    Cancel
                                </Link>
                                <button type="submit" className="btn btn-primary" disabled={processing}>
                                    {processing ? 'Uploading...' : (isEditing ? 'Save Changes' : 'Create')}
                                </button>
                            </div>

                        </div>
                    </form>
                </div>
        </>
    );
}