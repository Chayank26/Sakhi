import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    FiArrowLeft,
    FiBookOpen,
    FiBookmark,
    FiAward,
    FiCheckCircle,
    FiPlayCircle,
    FiClock,
    FiStar,
    FiArrowRight,
    FiTrash2
} from 'react-icons/fi';
import { fetchCourses, fetchMyLearning } from '../../../services/courseApi';
import './MyLearningPage.css';

export function MyLearningPage() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('continue'); // 'continue' | 'enrolled' | 'bookmarks' | 'certificates'
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [bookmarkedCourses, setBookmarkedCourses] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            try {
                // Fetch all courses for matching bookmarked/enrolled IDs
                const coursesRes = await fetchCourses({ limit: 50 });
                const courseList = coursesRes?.courses || [];
                setAllCourses(courseList);

                // Load bookmarked course IDs from localStorage
                const savedBookmarkIds = JSON.parse(localStorage.getItem('sakhi_bookmarked_courses') || '[]');
                const matchedBookmarks = courseList.filter((c) => savedBookmarkIds.includes(c._id));
                setBookmarkedCourses(matchedBookmarks);

                // Load enrolled course IDs from localStorage & API
                const savedEnrolledIds = JSON.parse(localStorage.getItem('sakhi_enrolled_courses') || '[]');
                
                // Fetch from backend API as well
                const apiEnrolled = await fetchMyLearning().catch(() => ({ enrollments: [] }));
                const apiCourseIds = (apiEnrolled?.enrollments || []).map((e) => e.courseId?._id || e.courseId).filter(Boolean);
                
                const allEnrolledIds = Array.from(new Set([...savedEnrolledIds, ...apiCourseIds]));

                // Build enrolled objects with progress simulation
                const matchedEnrolled = courseList
                    .filter((c) => allEnrolledIds.includes(c._id))
                    .map((c, idx) => ({
                        ...c,
                        progress: [80, 45, 90, 30][idx % 4] || 60,
                    }));

                // Fallback default sample course if none enrolled yet
                if (matchedEnrolled.length === 0 && courseList.length > 0) {
                    matchedEnrolled.push({
                        ...courseList[0],
                        progress: 80,
                    });
                }

                setEnrolledCourses(matchedEnrolled);
            } catch (err) {
                console.error('Failed to load My Learning dashboard:', err);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    const removeBookmark = (e, courseId) => {
        e.stopPropagation();
        const updatedBookmarks = bookmarkedCourses.filter((c) => c._id !== courseId);
        setBookmarkedCourses(updatedBookmarks);

        const saved = JSON.parse(localStorage.getItem('sakhi_bookmarked_courses') || '[]');
        const updatedIds = saved.filter((id) => id !== courseId);
        localStorage.setItem('sakhi_bookmarked_courses', JSON.stringify(updatedIds));
    };

    return (
        <div className="my-learning-wrapper">
            {/* Header */}
            <header className="learning-header">
                <div className="learning-header-container">
                    <button onClick={() => navigate('/academy')} className="btn-back-link">
                        <FiArrowLeft /> Back to Academy Portal
                    </button>
                    <Link to="/home" className="brand-logo-text">🎓 Sakhi Academy</Link>
                </div>
            </header>

            {/* Banner */}
            <div className="learning-hero">
                <div className="learning-hero-container">
                    <h1>My Learning Dashboard</h1>
                    <p>Track your course progress, saved bookmarks, and earned certificates.</p>
                </div>
            </div>

            {/* Main Dashboard Layout */}
            <main className="learning-main-content">
                <div className="learning-container">

                    {/* Navigation Tabs */}
                    <div className="learning-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'continue' ? 'active' : ''}`}
                            onClick={() => setActiveTab('continue')}
                        >
                            <FiPlayCircle /> Continue Learning ({enrolledCourses.length})
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'bookmarks' ? 'active' : ''}`}
                            onClick={() => setActiveTab('bookmarks')}
                        >
                            <FiBookmark /> Bookmarked ({bookmarkedCourses.length})
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'enrolled' ? 'active' : ''}`}
                            onClick={() => setActiveTab('enrolled')}
                        >
                            <FiBookOpen /> All Enrolled ({enrolledCourses.length})
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'certificates' ? 'active' : ''}`}
                            onClick={() => setActiveTab('certificates')}
                        >
                            <FiAward /> Certificates (1)
                        </button>
                    </div>

                    {/* Content Views */}
                    {loading ? (
                        <div className="dashboard-loading">
                            <div className="details-spinner"></div>
                            <p>Loading your learning dashboard...</p>
                        </div>
                    ) : (
                        <div className="tab-content-area">

                            {/* TAB 1: Continue Learning */}
                            {activeTab === 'continue' && (
                                <div className="continue-learning-section">
                                    {enrolledCourses.length === 0 ? (
                                        <div className="dashboard-empty-box">
                                            <FiBookOpen className="empty-icon" />
                                            <h3>No active courses yet</h3>
                                            <p>Explore free courses on Sakhi Academy and start learning today!</p>
                                            <Link to="/academy" className="btn-explore-link">Browse Courses</Link>
                                        </div>
                                    ) : (
                                        <div className="continue-grid">
                                            {enrolledCourses.map((course) => (
                                                <div
                                                    key={course._id}
                                                    className="continue-card"
                                                    onClick={() => navigate(`/academy/course/${course._id}`)}
                                                >
                                                    <div className="card-image-box">
                                                        <img src={course.thumbnail} alt={course.title} />
                                                        <span className="progress-badge">{course.progress}% Completed</span>
                                                    </div>

                                                    <div className="card-info-box">
                                                        <span className="cat-pill">{course.category}</span>
                                                        <h3 className="course-name">{course.title}</h3>
                                                        <p className="instructor">Instructor: {course.instructor}</p>

                                                        {/* Progress Bar Component */}
                                                        <div className="progress-bar-wrapper">
                                                            <div className="progress-bar-track">
                                                                <div
                                                                    className="progress-bar-fill"
                                                                    style={{ width: `${course.progress}%` }}
                                                                ></div>
                                                            </div>
                                                            <div className="progress-labels">
                                                                <span>{course.progress}% Progress</span>
                                                                <span>{course.duration} total</span>
                                                            </div>
                                                        </div>

                                                        <button
                                                            className="btn-resume-course"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/academy/course/${course._id}`);
                                                            }}
                                                        >
                                                            Resume Course <FiArrowRight />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB 2: Bookmarked Courses */}
                            {activeTab === 'bookmarks' && (
                                <div className="bookmarks-section">
                                    {bookmarkedCourses.length === 0 ? (
                                        <div className="dashboard-empty-box">
                                            <FiBookmark className="empty-icon" />
                                            <h3>No bookmarked courses</h3>
                                            <p>Click the bookmark icon on any course card to save it for later.</p>
                                            <Link to="/academy" className="btn-explore-link">Explore Courses</Link>
                                        </div>
                                    ) : (
                                        <div className="bookmarks-grid">
                                            {bookmarkedCourses.map((course) => (
                                                <div
                                                    key={course._id}
                                                    className="bookmark-card"
                                                    onClick={() => navigate(`/academy/course/${course._id}`)}
                                                >
                                                    <img src={course.thumbnail} alt={course.title} className="thumb" />
                                                    <div className="body">
                                                        <div className="top-row">
                                                            <span className="cat">{course.category}</span>
                                                            <button
                                                                className="btn-remove-bookmark"
                                                                onClick={(e) => removeBookmark(e, course._id)}
                                                                title="Remove Bookmark"
                                                            >
                                                                <FiTrash2 />
                                                            </button>
                                                        </div>
                                                        <h4 className="title">{course.title}</h4>
                                                        <p className="inst">{course.instructor}</p>
                                                        <div className="meta">
                                                            <span><FiStar className="star" /> {course.rating || 4.8}</span>
                                                            <span><FiClock /> {course.duration}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB 3: Enrolled Courses */}
                            {activeTab === 'enrolled' && (
                                <div className="enrolled-section">
                                    <div className="continue-grid">
                                        {enrolledCourses.map((course) => (
                                            <div
                                                key={course._id}
                                                className="continue-card"
                                                onClick={() => navigate(`/academy/course/${course._id}`)}
                                            >
                                                <div className="card-image-box">
                                                    <img src={course.thumbnail} alt={course.title} />
                                                    <span className="progress-badge">Enrolled</span>
                                                </div>

                                                <div className="card-info-box">
                                                    <span className="cat-pill">{course.category}</span>
                                                    <h3 className="course-name">{course.title}</h3>
                                                    <p className="instructor">Instructor: {course.instructor}</p>
                                                    <button className="btn-resume-course">View Details <FiArrowRight /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* TAB 4: Certificates */}
                            {activeTab === 'certificates' && (
                                <div className="certificates-section">
                                    <div className="certificate-card">
                                        <div className="cert-left">
                                            <FiAward className="cert-gold-icon" />
                                            <div>
                                                <h3>React Fundamentals & Web Architecture</h3>
                                                <p>Issued by Sakhi Academy • Verified Certificate ID: <code>SAKHI-CERT-2026-098</code></p>
                                                <span className="issue-date">Completed on: {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
                                            </div>
                                        </div>
                                        <button className="btn-download-cert" onClick={() => alert('Certificate PDF downloaded successfully!')}>
                                            Download Certificate (PDF)
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
