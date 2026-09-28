import { Link } from 'react-router-dom';
import { useAccount } from '../../account/accountContext';
import { HomeHeader } from '../home/HomeHeader';
export function MyLearningPage() {
    const { data, toggleSaved } = useAccount();
    return <><HomeHeader pageTitle="My learning" /><main className="activity-page"><Link to="/academy">Browse courses</Link><h1>My learning</h1>
        {!data.enrollments.length && <p>You haven’t enrolled in any courses yet.</p>}
        {data.enrollments.map(enrollment => <article key={enrollment._id}>
            <h2>{enrollment.courseId?.title || 'Course removed'}</h2>
            <p>{enrollment.progress}% complete · {enrollment.status}</p><progress value={enrollment.progress} max="100" aria-label="Course progress" />
            {enrollment.courseId && <p><Link to={`/academy/course/${enrollment.courseId._id}/learn`}>Continue learning{enrollment.progress === 100 ? ' / completion record' : ''}</Link></p>}
        </article>)}
        <h2>Bookmarked courses</h2>{!data.saved.courses.length && <p>No bookmarked courses yet.</p>}
        {data.saved.courses.map(course => <article key={course._id}><Link to={`/academy/course/${course._id}`}>{course.title}</Link><button onClick={() => toggleSaved('courses', course._id)}>Remove bookmark</button></article>)}
    </main></>;
}
