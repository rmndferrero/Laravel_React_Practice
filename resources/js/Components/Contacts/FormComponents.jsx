export function Field({ label, error, required, children }) {
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

export function Section({ title }) {
    return (
        <div className="section-heading">
            <span>{title}</span>
        </div>
    );
}