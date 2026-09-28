import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../../services/api';
import { HomeHeader } from '../home/HomeHeader';
export function JobApplicationsPage() {
    const { jobId } = useParams();
    return <RecordDetails key={jobId} />;
}

function RecordDetails() {
    const { jobId } = useParams();
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        let active = true;
        api.get(`/jobs/${jobId}/applications`).then(({ data }) => { if (active) { setResult(data); setError(''); } })
            .catch(err => { if (active) setError(err.response?.data?.message || 'Could not load applications.'); });
        return () => { active = false; };
    }, [jobId, retry]);
    const update = async (applicationId, status) => {
        setBusy(true); setError('');
        try {
            const { data } = await api.put(`/jobs/${jobId}/applications/${applicationId}`, { status });
            setResult(previous => ({ ...previous, applications: previous.applications.map(item => item._id === applicationId ? data.application : item) }));
        } catch (err) { setError(err.response?.data?.message || 'Status was not saved.'); }
        finally { setBusy(false); }
    };
    const downloadResume = async application => {
        setBusy(true); setError('');
        try {
            const { data } = await api.get(`/jobs/${jobId}/applications/${application._id}/resume`, { responseType: 'blob' });
            const extension = application.resumeUrl?.split('.').pop()?.toLowerCase();
            const url = URL.createObjectURL(data);
            const link = document.createElement('a'); link.href = url;
            link.download = `resume.${['pdf', 'doc', 'docx'].includes(extension) ? extension : 'pdf'}`;
            link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch { setError('Could not download this resume. Please retry.'); }
        finally { setBusy(false); }
    };
    return <><HomeHeader pageTitle="Review applications" /><main className="activity-page"><Link to="/jobs/my-activity">My job activity</Link><h1>{result?.job.title || 'Applications'}</h1>
        {error && <p role="alert">{error} <button onClick={() => setRetry(r => r + 1)}>Retry</button></p>}
        {!result && !error && <p role="status">Loading applications…</p>}
        {result?.applications.length === 0 && <p>No applications yet.</p>}
        {result?.applications.map(application => <article key={application._id}>
            <h2>{application.applicantName}</h2><p>{application.applicantEmail} · {application.applicantPhone}</p><p>{application.coverLetter}</p>
            <button disabled={busy} onClick={() => downloadResume(application)}>Download resume</button>
            <label>Application status<select disabled={busy} value={application.status} onChange={e => update(application._id, e.target.value)}>
                {['Applied', 'Reviewing', 'Shortlisted', 'Rejected', 'Hired'].map(status => <option key={status}>{status}</option>)}
            </select></label>
        </article>)}
    </main></>;
}
