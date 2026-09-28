import { useAccount } from '../../account/accountContext';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import { HomeHeader } from '../home/HomeHeader';
export function SupportPage() {
    const { user } = useAccount();
    return <SupportForm key={user?.uid || 'guest'} />;
}

function SupportForm() {
    const { user, requireLogin } = useAccount();
    const [tickets, setTickets] = useState([]);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [receipt, setReceipt] = useState('');
    const [busy, setBusy] = useState(false);
    const [loading, setLoading] = useState(true);
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        if (!user) return;
        let active = true;
        api.get('/me/support').then(({ data }) => { if (active) { setTickets(data.tickets); setError(''); } })
            .catch(() => { if (active) setError('Could not load your support requests.'); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [retry, user]);
    const submit = async event => {
        event.preventDefault();
        if (!requireLogin()) return;
        setBusy(true); setError(''); setReceipt('');
        try {
            const { data: { ticket } } = await api.post('/me/support', { subject, message });
            setTickets(previous => [ticket, ...previous]); setSubject(''); setMessage(''); setReceipt(`Request saved. Reference: ${ticket._id}`);
        } catch (err) { setError(err.response?.data?.message || 'Your request could not be saved. Please retry.'); }
        finally { setBusy(false); }
    };
    return <><HomeHeader pageTitle="Help & support" /><main className="activity-page"><Link to="/home">Dashboard</Link><h1>Help & support</h1>
        <section><h2>Urgent help in India</h2><p>Sakhi support is not an emergency service.</p>
            <p>Emergency assistance: <a href="tel:112">112</a> · <a href="https://112.gov.in/" target="_blank" rel="noopener noreferrer">Official emergency response portal</a></p>
            <p>Financial cyber fraud: <a href="tel:1930">1930</a> · <a href="https://cybercrime.gov.in/" target="_blank" rel="noopener noreferrer">National Cyber Crime Reporting Portal</a></p>
        </section>
        <section><h2>Using Sakhi</h2><p>Save opportunities to your account and track job applications in <Link to="/jobs/my-activity">My job activity</Link>. Course progress is in <Link to="/academy/my-learning">My learning</Link>.</p>
            <p>Scheme listings provide source links and criteria. The issuing authority determines eligibility; verify current requirements on its portal.</p>
        </section>
        <section><h2>Contact support</h2><p>Requests are stored for review. Response times are not guaranteed. Do not include passwords or sensitive documents.</p>
            {error && <p role="alert">{error} <button onClick={() => setRetry(r => r + 1)}>Reload requests</button></p>}
            {receipt && <p role="status">{receipt}</p>}
            <form onSubmit={submit}><label>Subject<input value={subject} onChange={e => setSubject(e.target.value)} required maxLength={160} /></label>
                <label>Message<textarea value={message} onChange={e => setMessage(e.target.value)} required maxLength={5000} rows={6} /></label>
                <button disabled={busy || !subject.trim() || !message.trim()}>{busy ? 'Submitting…' : 'Submit request'}</button>
            </form>
        </section>
        <h2>Your latest requests</h2>{!user ? <p>Sign in to view your requests.</p> : loading ? <p role="status">Loading requests…</p> : !tickets.length && <p>No requests yet.</p>}
        {user && tickets.map(ticket => <article key={ticket._id}><h3>{ticket.subject}</h3><p>{ticket.message}</p><p>{ticket.status} · {new Date(ticket.createdAt).toLocaleDateString()}</p><small>Reference: {ticket._id}</small></article>)}
    </main></>;
}
