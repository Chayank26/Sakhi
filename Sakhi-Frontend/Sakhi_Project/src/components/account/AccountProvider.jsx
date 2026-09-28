import { useCallback, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../pages/firebase/firebase';
import api from '../../services/api';
import { AccountContext, useAccount } from './accountContext';
const empty = { saved: { jobs: [], courses: [], schemes: [] }, applications: [], enrollments: [], profile: {} };

export function AccountProvider({ children }) {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);
    const [data, setData] = useState(empty);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const version = useRef(0);
    const requestSequence = useRef(0);
    const pending = useRef(new Set());
    const navigate = useNavigate();
    const location = useLocation();
    const refresh = useCallback(async () => {
        const current = version.current;
        const sequence = ++requestSequence.current;
        if (!auth.currentUser) return;
        setLoading(true);
        try {
            const { data: result } = await api.get('/me');
            if (current === version.current && sequence === requestSequence.current) { setData(result); setError(''); }
        } catch (err) {
            if (current === version.current && sequence === requestSequence.current) setError(err.response?.data?.message || 'Could not load your account activity. Please retry.');
        } finally { if (current === version.current && sequence === requestSequence.current) setLoading(false); }
    }, []);
    useEffect(() => onAuthStateChanged(auth, current => {
        version.current += 1;
        pending.current.clear();
        setUser(current); setReady(true); setData(empty); setError(''); setLoading(false);
        if (current) void refresh();
    }), [refresh]);
    const requireLogin = () => {
        if (user) return true;
        navigate('/login', { state: { returnTo: location.pathname + location.search } });
        return false;
    };
    const toggleSaved = async (kind, id) => {
        if (!requireLogin() || loading || error) return;
        const key = `${kind}:${id}`;
        if (pending.current.has(key)) return;
        pending.current.add(key);
        const current = version.current;
        const saved = !data.saved[kind].some(item => item._id === id);
        try {
            await api.put(`/me/saved/${kind}/${id}`, { saved });
            if (current === version.current) await refresh();
        } catch (err) {
            if (current === version.current) setError(err.response?.data?.message || 'Could not save this change. Please retry.');
        } finally { pending.current.delete(key); }
    };
    return <AccountContext.Provider value={{ user, ready, data, loading, error, refresh, toggleSaved, requireLogin }}>{children}</AccountContext.Provider>;
}

export function RequireAccount() {
    const { user, ready } = useAccount();
    const location = useLocation();
    if (!ready) return <p role="status">Checking your account…</p>;
    return user ? <Outlet key={user.uid} /> : <Navigate to="/login" replace state={{ returnTo: location.pathname + location.search }} />;
}

export function AccountNotice() {
    const { error, loading, refresh } = useAccount();
    return error ? <div className="account-notice" role="alert">{error} <button onClick={refresh}>Retry</button></div> : loading ? <p className="account-notice" role="status">Updating account activity…</p> : null;
}
