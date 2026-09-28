import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../../services/api';
import { safeHttpUrl } from '../../../utils/safeUrl';
import { useAccount } from '../../account/accountContext';
import { HomeHeader } from '../home/HomeHeader';
export function LearnCoursePage() {
    const { courseId } = useParams();
    return <RecordDetails key={courseId} />;
}

function RecordDetails() {
    const { courseId } = useParams();
    const { refresh } = useAccount();
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        let active = true;
        api.get(`/courses/${courseId}/learn`).then(({ data }) => { if (active) { setResult(data); setError(''); } })
            .catch(err => { if (active) setError(err.response?.data?.message || 'Could not load this course.'); });
        return () => { active = false; };
    }, [courseId, retry]);
    const complete = async (lessonKey, completed) => {
        setBusy(true); setError('');
        try {
            const { data } = await api.put(`/courses/${courseId}/progress`, { lessonKey, completed });
            setResult(previous => ({ ...previous, enrollment: data.enrollment }));
            await refresh();
        } catch (err) { setError(err.response?.data?.message || 'Progress was not saved. Please retry.'); }
        finally { setBusy(false); }
    };
    const download = async () => {
        setBusy(true); setError('');
        try {
            const { data: { certificate } } = await api.get(`/courses/${courseId}/certificate`);
            const text = `Sakhi Academy — Completion Record\n\nLearner: ${certificate.student}\nCourse: ${certificate.course}\nReference: ${certificate.reference}\n\n${certificate.statement}\n`;
            const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
            const link = document.createElement('a'); link.href = url; link.download = `sakhi-completion-${courseId}.txt`; link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (err) { setError(err.response?.data?.message || 'Could not download completion record.'); }
        finally { setBusy(false); }
    };
    const lessons = (result?.course.curriculum || []).flatMap((module, m) => (module.lessons || []).map((title, l) => ({ title, key: `${m}:${l}`, moduleTitle: module.moduleTitle })));
    return <><HomeHeader pageTitle="Learning" /><main className="activity-page"><Link to="/academy/my-learning">My learning</Link>
        {error && <p role="alert">{error} <button onClick={() => setRetry(r => r + 1)}>Reload</button></p>}
        {!result && !error && <p role="status">Loading course…</p>}
        {result && <><h1>{result.course.title}</h1><p>{result.enrollment.progress}% complete</p>
            <p>Track the lessons you have reviewed. Completion is self-reported.</p>
            {!lessons.length && <p>The instructor has not published any lessons yet.</p>}
            {lessons.map(lesson => {
                const material = result.course.lessonMaterials?.find(item => item.lessonKey === lesson.key);
                const resourceUrl = safeHttpUrl(material?.resourceUrl);
                const completed = result.enrollment.completedLessons.includes(lesson.key);
                return <article key={lesson.key}><p>{lesson.moduleTitle}</p><h2>{lesson.title}</h2>
                    {material?.content ? <pre>{material.content}</pre> : <p>No lesson text has been provided.</p>}
                    {resourceUrl && <p><a href={resourceUrl} target="_blank" rel="noopener noreferrer">Open lesson resource</a></p>}
                    <button disabled={busy} onClick={() => complete(lesson.key, !completed)}>{completed ? 'Completed — mark incomplete' : 'Mark lesson complete'}</button>
                </article>;
            })}
            {!!result.course.resources?.length && <section><h2>Course resources</h2>{result.course.resources.map((resource, i) => <p key={i}>{safeHttpUrl(resource) ? <a href={safeHttpUrl(resource)} target="_blank" rel="noopener noreferrer">{resource}</a> : resource}</p>)}</section>}
            {result.course.certificateAvailable && result.enrollment.progress === 100 && <button disabled={busy} onClick={download}>Download completion record (.txt)</button>}
        </>}
    </main></>;
}
