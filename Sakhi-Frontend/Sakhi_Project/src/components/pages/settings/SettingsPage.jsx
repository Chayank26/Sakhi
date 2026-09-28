import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { useAccount } from '../../account/accountContext';
import { HomeHeader } from '../home/HomeHeader';
export function SettingsPage() {
    const { user } = useAccount();
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    const resetPassword = async () => {
        setBusy(true); setMessage('');
        try { await sendPasswordResetEmail(auth, user.email); setMessage('Password reset requested. Check your email for the next steps.'); }
        catch { setMessage('Could not request a password reset. Please try again.'); }
        finally { setBusy(false); }
    };
    return <><HomeHeader pageTitle="Settings" /><main className="activity-page"><Link to="/home">Dashboard</Link><h1>Account settings</h1>
        <section><h2>Profile and AI preferences</h2><p>Edit your contact details, skills, interests, and location.</p><Link to="/profile">Edit profile</Link></section>
        <section><h2>Sign-in</h2><p>{user.email}</p>
            {user.providerData.some(provider => provider.providerId === 'password') ? <button onClick={resetPassword} disabled={busy}>{busy ? 'Requesting…' : 'Send password reset email'}</button> : <p>Manage your sign-in through your account provider.</p>}
            {message && <p role="status">{message}</p>}
        </section>
        <section><h2>Availability</h2><p>Notification subscriptions, language selection, themes, and two-factor setup are not available in Sakhi settings yet.</p><Link to="/support">Contact support</Link></section>
    </main></>;
}
