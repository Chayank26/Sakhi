import { useEffect, useState } from 'react';
import api from '../../../services/api';
import { Link } from 'react-router-dom';
import { useAccount } from '../../account/accountContext';
import { HomeHeader } from '../home/HomeHeader';
export function JobActivityPage() {
    const { data, toggleSaved } = useAccount();
    const [posted, setPosted] = useState([]);
    const [error, setError] = useState('');
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        let active = true;
        api.get('/jobs/mine').then(({ data }) => { if (active) { setPosted(data.jobs); setError(''); } })
            .catch(() => { if (active) setError('Could not load jobs you posted.'); });
        return () => { active = false; };
    }, [retry]);
    return <><HomeHeader pageTitle="My job activity" /><main className="activity-page"><Link to="/jobs">Browse jobs</Link>
        <h1>My job activity</h1><h2>Applications</h2>
        {!data.applications.length && <p>No applications yet.</p>}
        {data.applications.map(application => <article key={application._id}>
            {application.jobId ? <Link to={`/jobs/${application.jobId._id}`}>{application.jobId.title}</Link> : <strong>Listing removed</strong>}
            <p>{application.status} · Applied {new Date(application.createdAt).toLocaleDateString()}</p>
        </article>)}
        <h2>Saved jobs</h2>{!data.saved.jobs.length && <p>No saved jobs yet.</p>}
        {data.saved.jobs.map(job => <article key={job._id}><Link to={`/jobs/${job._id}`}>{job.title}</Link><p>{job.company} · {job.location}</p><button onClick={() => toggleSaved('jobs', job._id)}>Remove bookmark</button></article>)}
        <h2>Jobs you posted</h2>
        {error && <p role="alert">{error} <button onClick={() => setRetry(r => r + 1)}>Retry</button></p>}
        {!posted.length && !error && <p>No posted jobs yet.</p>}
        {posted.map(job => <article key={job._id}><Link to={`/jobs/${job._id}/applications`}>{job.title} — review applications</Link></article>)}
    </main></>;
}
