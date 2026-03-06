import { useState } from 'react';
import { updateCredentials } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function SecuritySettings({ onToast }) {
    const navigate = useNavigate();
    const [form, setForm] = useState({ currEmail: '', currPassword: '', newEmail: '', newPassword: '', confirmPassword: '' });

    const handleChange = (field, value) => setForm({ ...form, [field]: value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.newPassword !== form.confirmPassword) {
            onToast?.('Passwords do not match', 'danger');
            return;
        }
        try {
            const res = await updateCredentials({
                currentEmail: form.currEmail,
                currentPassword: form.currPassword,
                newEmail: form.newEmail,
                newPassword: form.newPassword
            });
            onToast?.('Credentials Updated — Redirecting to login...', 'success');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            onToast?.(err.response?.data?.message || 'Update failed', 'danger');
        }
    };

    return (
        <div className="section-container active">
            <h2 className="section-title"><i className="ri-key-2-line" /> Security Settings</h2>

            <div className="card interactive">
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label><i className="ri-mail-lock-line" /> Current Email</label>
                            <input type="email" value={form.currEmail} onChange={(e) => handleChange('currEmail', e.target.value)} required />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label><i className="ri-lock-password-line" /> Current Password</label>
                            <input type="password" value={form.currPassword} onChange={(e) => handleChange('currPassword', e.target.value)} required />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label><i className="ri-mail-send-line" /> New Email</label>
                            <input type="email" value={form.newEmail} onChange={(e) => handleChange('newEmail', e.target.value)} required />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label><i className="ri-shield-keyhole-line" /> New Password</label>
                            <input type="password" value={form.newPassword} onChange={(e) => handleChange('newPassword', e.target.value)} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label><i className="ri-shield-check-line" /> Confirm New Password</label>
                        <input type="password" value={form.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-warning w-100"><i className="ri-refresh-line" /> Update Credentials</button>
                </form>
            </div>
        </div>
    );
}
