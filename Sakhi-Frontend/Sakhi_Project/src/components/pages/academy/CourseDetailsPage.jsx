import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    FiArrowLeft,
    FiClock,
    FiUsers,
    FiStar,
    FiAward,
    FiCheckCircle,
    FiBookOpen,
    FiGlobe,
    FiShare2,
    FiBookmark,
    FiChevronDown,
    FiChevronUp,
    FiFileText,
    FiPlayCircle,
    FiLock
} from 'react-icons/fi';
import { fetchCourseById } from '../../../services/courseApi';
import { EnrollCourseModal } from './EnrollCourseModal';
import './CourseDetailsPage.css';

export function CourseDetailsPage() {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [openModules, setOpenModules] = useState([0]); // First module expanded by default

    useEffect(() => {
        const loadCourse = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await fetchCourseById(courseId);
                if (data && data.success) {
                    setCourse(data.course);
                } else {
                    setError('Course details not found');
                }
            } catch (err) {
                console.error('Error loading course:', err);
                setError('Failed to load course details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            loadCourse();

            // Check localStorage for enrolled and bookmarked status
            const savedBookmarks = JSON.parse(localStorage.getItem('sakhi_bookmarked_courses') || '[]');
            if (savedBookmarks.includes(courseId)) {
                setIsBookmarked(true);
            }

            const savedEnrolled = JSON.parse(localStorage.getItem('sakhi_enrolled_courses') || '[]');
            if (savedEnrolled.includes(courseId)) {
                setIsEnrolled(true);
            }
        }
    }, [courseId]);

    const toggleModule = (idx) => {
        if (openModules.includes(idx)) {
            setOpenModules(openModules.filter((i) => i !== idx));
        } else {
            setOpenModules([...openModules, idx]);
        }
    };

    const toggleBookmark = () => {
        const saved = JSON.parse(localStorage.getItem('sakhi_bookmarked_courses') || '[]');
        let updated;
        if (saved.includes(courseId)) {
            updated = saved.filter((id) => id !== courseId);
            setIsBookmarked(false);
        } else {
            updated = [...saved, courseId];
            setIsBookmarked(true);
        }
        localStorage.setItem('sakhi_bookmarked_courses', JSON.stringify(updated));
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: course?.title,
                text: `Check out ${course?.title} on Sakhi Academy!`,
                url: window.location.href,
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Course link copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <div className="course-details-loading">
                <div className="details-spinner"></div>
                <p>Loading course content...</p>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="course-details-error">
                <div className="error-card">
                    <h2>Course Not Found</h2>
                    <p>{error || 'The requested course does not exist or has been unpublished.'}</p>
                    <button onClick={() => navigate('/academy')} className="btn-back-academy">
                        <FiArrowLeft /> Back to Sakhi Academy
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="course-details-wrapper">
            {/* Header Navigation */}
            <header className="course-details-nav">
                <div className="details-nav-container">
                    <button onClick={() => navigate('/academy')} className="btn-back-link">
                        <FiArrowLeft /> Back to Academy
                    </button>
                    <Link to="/home" className="brand-logo-text">🎓 Sakhi Academy</Link>
                </div>
            </header>

            {/* Hero Header Section */}
            <section className="course-details-hero">
                <div className="details-hero-container">
                    <div className="hero-text-content">
                        <div className="hero-tags">
                            <span className="tag-cat">{course.category}</span>
                            <span className="tag-diff">{course.difficulty}</span>
                            <span className="tag-lang"><FiGlobe /> {course.language}</span>
                        </div>

                        <h1 className="details-course-title">{course.title}</h1>
                        <p className="details-course-sub">{course.description}</p>

                        <div className="hero-instructor-row">
                            <span>Taught by <strong>{course.instructor}</strong></span>
                            <span className="dot">•</span>
                            <span>Organization: <strong>{course.organization || 'Sakhi Academy'}</strong></span>
                        </div>

                        <div className="hero-stats-bar">
                            <div className="stat-pill rating">
                                <FiStar className="star-icon" /> {course.rating || 4.9} Rating
                            </div>
                            <div className="stat-pill">
                                <FiClock /> {course.duration}
                            </div>
                            <div className="stat-pill">
                                <FiUsers /> {course.studentsEnrolled} Students Enrolled
                            </div>
                            {course.certificateAvailable && (
                                <div className="stat-pill cert">
                                    <FiAward /> Certificate Included
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="hero-media-box">
                        <img
                            src={course.banner || course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80'}
                            alt={course.title}
                            className="hero-thumbnail-img"
                        />
                        <div className="media-actions-row">
                            <button
                                className={`btn-icon-action ${isBookmarked ? 'saved' : ''}`}
                                onClick={toggleBookmark}
                            >
                                <FiBookmark /> {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                            </button>
                            <button className="btn-icon-action" onClick={handleShare}>
                                <FiShare2 /> Share
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Body Content */}
            <main className="course-details-main">
                <div className="details-body-grid">

                    {/* Left Main Column */}
                    <div className="details-main-col">

                        {/* Learning Outcomes */}
                        {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                            <section className="details-section-box">
                                <h3 className="section-title">What You'll Learn</h3>
                                <div className="outcomes-grid">
                                    {course.learningOutcomes.map((outcome, idx) => (
                                        <div key={idx} className="outcome-item">
                                            <FiCheckCircle className="check-icon" />
                                            <span>{outcome}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Full Curriculum Accordion */}
                        <section className="details-section-box">
                            <h3 className="section-title">Course Curriculum</h3>
                            <p className="curriculum-sub-text">
                                {course.curriculum ? course.curriculum.length : 0} Modules • Interactive Video Lessons & Exercises
                            </p>

                            <div className="curriculum-accordion">
                                {course.curriculum && course.curriculum.length > 0 ? (
                                    course.curriculum.map((module, idx) => {
                                        const isOpen = openModules.includes(idx);
                                        return (
                                            <div key={idx} className="accordion-module">
                                                <button className="module-header-btn" onClick={() => toggleModule(idx)}>
                                                    <span className="module-title-text">{module.moduleTitle}</span>
                                                    <span className="module-toggle-icon">
                                                        {isOpen ? <FiChevronUp /> : <FiChevronDown />}
                                                    </span>
                                                </button>

                                                {isOpen && (
                                                    <div className="module-lessons-list">
                                                        {module.lessons && module.lessons.map((lesson, lIdx) => (
                                                            <div key={lIdx} className="lesson-row">
                                                                <div className="lesson-info">
                                                                    <FiPlayCircle className="play-icon" />
                                                                    <span>{lesson}</span>
                                                                </div>
                                                                <span className="lesson-badge"><FiLock /> Included</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="accordion-module">
                                        <div className="module-header-btn">Module 1: Comprehensive Foundations</div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Prerequisites */}
                        {course.prerequisites && course.prerequisites.length > 0 && (
                            <section className="details-section-box">
                                <h3 className="section-title">Prerequisites & Requirements</h3>
                                <ul className="prereq-list">
                                    {course.prerequisites.map((pre, idx) => (
                                        <li key={idx}>• {pre}</li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* Course Resources */}
                        {course.resources && course.resources.length > 0 && (
                            <section className="details-section-box">
                                <h3 className="section-title">Downloadable Resources & Guides</h3>
                                <div className="resources-list">
                                    {course.resources.map((res, idx) => (
                                        <div key={idx} className="resource-item">
                                            <FiFileText className="res-icon" />
                                            <span>{res}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Certificate Section */}
                        <section className="details-section-box cert-highlight-box">
                            <div className="cert-content">
                                <FiAward className="cert-big-icon" />
                                <div>
                                    <h3>Earn an Official Sakhi Certificate</h3>
                                    <p>Share your verified course completion certificate on LinkedIn, resume, or portfolio.</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Sidebar Summary Column */}
                    <aside className="details-sidebar-col">
                        <div className="sidebar-course-card">
                            <div className="pricing-box">
                                <span className="price-big">
                                    {course.price === 0 ? 'FREE' : `₹${course.price}`}
                                </span>
                                <span className="guarantee">100% Free Access for Sakhi Community</span>
                            </div>

                            <button
                                className={`btn-sidebar-enroll ${isEnrolled ? 'enrolled' : ''}`}
                                onClick={() => !isEnrolled && setShowEnrollModal(true)}
                                disabled={isEnrolled}
                            >
                                {isEnrolled ? <><FiCheckCircle /> Enrolled</> : 'Enroll Now'}
                            </button>

                            <div className="sidebar-inclusions">
                                <h4>This course includes:</h4>
                                <div className="inclusion-item"><FiClock /> {course.duration} on-demand content</div>
                                <div className="inclusion-item"><FiGlobe /> Full lifetime access</div>
                                <div className="inclusion-item"><FiBookOpen /> Access on mobile & web</div>
                                <div className="inclusion-item"><FiAward /> Certificate of Completion</div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            {/* Bottom Sticky Floating Bar */}
            <div className="floating-enroll-bar">
                <div className="floating-bar-container">
                    <div className="floating-bar-info">
                        <h3>{course.title}</h3>
                        <p>{course.instructor} • {course.category}</p>
                    </div>

                    <button
                        className={`btn-floating-enroll ${isEnrolled ? 'enrolled' : ''}`}
                        onClick={() => !isEnrolled && setShowEnrollModal(true)}
                        disabled={isEnrolled}
                    >
                        {isEnrolled ? <><FiCheckCircle /> Enrolled</> : 'Enroll Now'}
                    </button>
                </div>
            </div>

            {/* Enrollment Modal (Phase 5 component) */}
            {showEnrollModal && (
                <EnrollCourseModal
                    course={course}
                    onClose={() => setShowEnrollModal(false)}
                    onSuccess={(cId) => setIsEnrolled(true)}
                />
            )}
        </div>
    );
}
