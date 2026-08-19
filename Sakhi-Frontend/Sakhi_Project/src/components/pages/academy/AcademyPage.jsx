import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    FiSearch,
    FiBookOpen,
    FiStar,
    FiClock,
    FiUsers,
    FiFilter,
    FiPlusCircle,
    FiBookmark,
    FiChevronLeft,
    FiChevronRight,
    FiSliders,
    FiArrowRight,
    FiCheckCircle,
    FiAward,
    FiPlayCircle
} from 'react-icons/fi';
import { fetchCourses } from '../../../services/courseApi';
import { HomeHeader } from '../home/HomeHeader';
import { CardSwap } from '../../reactbits/CardSwap';
import './AcademyPage.css';

export function AcademyPage() {
    const navigate = useNavigate();

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [appliedQuery, setAppliedQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState([]);
    const [selectedDifficulty, setSelectedDifficulty] = useState([]);
    const [selectedDuration, setSelectedDuration] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState([]);
    const [selectedType, setSelectedType] = useState('');
    const [isFreeOnly, setIsFreeOnly] = useState(false);
    const [sortBy, setSortBy] = useState('popular');

    // UI & Pagination
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [bookmarkedCourses, setBookmarkedCourses] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCourses, setTotalCourses] = useState(0);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [activeCarouselIdx, setActiveCarouselIdx] = useState(0);

    const featuredCourses = courses.filter((c) => c.rating >= 4.8 || c.featured).slice(0, 3);

    const loadCourses = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {
                q: appliedQuery,
                category: selectedCategory,
                difficulty: selectedDifficulty,
                duration: selectedDuration,
                isFree: isFreeOnly ? 'true' : '',
                sortBy,
                page,
                limit: 6,
            };

            const data = await fetchCourses(params);
            if (data && data.success) {
                setCourses(data.courses || []);
                setTotalPages(data.totalPages || 1);
                setTotalCourses(data.totalCourses || 0);
            }
        } catch (err) {
            console.error('Failed to load courses:', err);
            setError('Unable to connect to academy service. Please ensure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCourses();
        const storedEnrolled = JSON.parse(localStorage.getItem('sakhi_enrolled_courses') || '[]');
        setEnrolledCourses(storedEnrolled);
    }, [appliedQuery, selectedCategory, selectedDifficulty, selectedDuration, isFreeOnly, sortBy, page]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        setAppliedQuery(searchQuery);
    };

    const toggleFilter = (item, currentList, setList) => {
        setPage(1);
        if (currentList.includes(item)) {
            setList(currentList.filter((i) => i !== item));
        } else {
            setList([...currentList, item]);
        }
    };

    const toggleBookmark = (e, courseId) => {
        e.stopPropagation();
        if (bookmarkedCourses.includes(courseId)) {
            setBookmarkedCourses(bookmarkedCourses.filter((id) => id !== courseId));
        } else {
            setBookmarkedCourses([...bookmarkedCourses, courseId]);
        }
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setAppliedQuery('');
        setSelectedCategory([]);
        setSelectedDifficulty([]);
        setSelectedDuration([]);
        setSelectedLanguage([]);
        setSelectedType('');
        setIsFreeOnly(false);
        setSortBy('popular');
        setPage(1);
    };

    return (
        <div className="academy-wrapper">
            {/* Unified Navbar */}
            <HomeHeader pageTitle="Academy" />

            {/* Hero & Search Banner */}
            <section className="academy-hero">
                <div className="academy-hero-content">
                    <h1 className="academy-hero-title">Learn. Grow. Transform Your Career.</h1>
                    <p className="academy-hero-subtitle">
                        Free & accessible world-class courses designed for women in tech, business, design, finance, and leadership.
                    </p>

                    <form onSubmit={handleSearchSubmit} className="academy-search-bar">
                        <div className="search-input-group">
                            <span className="input-icon-pill"><FiSearch /></span>
                            <input
                                type="text"
                                placeholder="Search courses by title, skill, or topic (e.g. React, Data Analytics, Python)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn-search-courses">
                            Search Courses
                        </button>
                    </form>
                </div>
            </section>

            {/* Featured Courses Card Swap Stack */}
            {courses.length > 0 && (
                <section className="featured-depth-section">
                    <CardSwap
                        items={courses.slice(0, 6).map((c) => ({
                            id: c._id,
                            title: c.title,
                            badge: c.category || 'Featured Course',
                            category: c.category,
                            difficulty: c.difficulty,
                            instructor: c.instructor,
                            rating: c.rating || 4.9,
                            duration: c.duration || 'Self-Paced',
                            image: c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80',
                        }))}
                        onCardClick={(card) => navigate(`/academy/course/${card.id}`)}
                    />
                </section>
            )}

            {/* Main Portal Body Grid */}
            <main className="academy-main-content">
                <div className="academy-layout-grid">

                    {/* Mobile Filters Bar */}
                    <div className="mobile-filter-bar">
                        <button
                            className="btn-mobile-filter-toggle"
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                        >
                            <FiSliders /> Filters ({selectedCategory.length + selectedDifficulty.length + selectedLanguage.length})
                        </button>

                        <div className="mobile-sort-select">
                            <label>Sort:</label>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="popular">Most Popular</option>
                                <option value="rating">Highest Rated</option>
                                <option value="newest">Newest</option>
                            </select>
                        </div>
                    </div>

                    {/* Sidebar Filters */}
                    <aside className={`academy-sidebar-filters ${showMobileFilters ? 'open' : ''}`}>
                        <div className="filters-header">
                            <h3><FiFilter /> Categories & Filters</h3>
                            <button onClick={handleResetFilters} className="btn-reset-filters">Reset All</button>
                        </div>

                        {/* Category */}
                        <div className="filter-group">
                            <h4 className="filter-title">Category</h4>
                            <div className="filter-options scrollable">
                                {[
                                    'Programming',
                                    'Web Development',
                                    'AI & Machine Learning',
                                    'Data Science',
                                    'Cybersecurity',
                                    'UI/UX',
                                    'Finance',
                                    'Marketing',
                                    'Entrepreneurship',
                                    'Communication',
                                    'Healthcare',
                                    'Government Exam Preparation',
                                    'Personal Development',
                                ].map((cat) => (
                                    <label key={cat} className="filter-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={selectedCategory.includes(cat)}
                                            onChange={() => toggleFilter(cat, selectedCategory, setSelectedCategory)}
                                        />
                                        <span>{cat}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Difficulty */}
                        <div className="filter-group">
                            <h4 className="filter-title">Difficulty</h4>
                            <div className="filter-options">
                                {['Beginner', 'Intermediate', 'Advanced'].map((diff) => (
                                    <label key={diff} className="filter-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={selectedDifficulty.includes(diff)}
                                            onChange={() => toggleFilter(diff, selectedDifficulty, setSelectedDifficulty)}
                                        />
                                        <span>{diff}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Language */}
                        <div className="filter-group">
                            <h4 className="filter-title">Language</h4>
                            <div className="filter-options">
                                {['English', 'Hindi'].map((lang) => (
                                    <label key={lang} className="filter-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={selectedLanguage.includes(lang)}
                                            onChange={() => toggleFilter(lang, selectedLanguage, setSelectedLanguage)}
                                        />
                                        <span>{lang}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Type */}
                        <div className="filter-group">
                            <h4 className="filter-title">Course Pricing</h4>
                            <div className="filter-options">
                                {[
                                    { label: 'All Courses', value: '' },
                                    { label: 'Free Courses', value: 'free' },
                                    { label: 'Paid Courses', value: 'paid' },
                                ].map((t) => (
                                    <label key={t.value} className="filter-radio-label">
                                        <input
                                            type="radio"
                                            name="courseType"
                                            checked={selectedType === t.value}
                                            onChange={() => {
                                                setPage(1);
                                                setSelectedType(t.value);
                                            }}
                                        />
                                        <span>{t.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Main Course Grid Column */}
                    <div className="academy-listings-column">

                        {/* Header Stats & Desktop Sort */}
                        <div className="academy-stats-bar">
                            <div className="stats-text">
                                Showing <strong>{totalCourses}</strong> available courses
                                {appliedQuery && <span> for "<em>{appliedQuery}</em>"</span>}
                            </div>

                            <div className="stats-actions-right">
                                <div className="desktop-sort-box">
                                    <label>Sort by:</label>
                                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                        <option value="popular">Most Popular</option>
                                        <option value="rating">Highest Rated</option>
                                        <option value="newest">Newest First</option>
                                    </select>
                                </div>

                                <Link to="/academy/my-learning" className="btn-my-learning-right">
                                    <FiBookOpen className="btn-icon" /> My Learning
                                </Link>
                            </div>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <div className="academy-error-alert">
                                <p>{error}</p>
                                <button onClick={loadCourses} className="btn-retry">Retry</button>
                            </div>
                        )}

                        {/* Loading Skeleton */}
                        {loading ? (
                            <div className="courses-grid">
                                {[1, 2, 3, 4, 5, 6].map((n) => (
                                    <div key={n} className="course-card-skeleton">
                                        <div className="skeleton-thumb"></div>
                                        <div className="skeleton-body">
                                            <div className="skeleton-line title"></div>
                                            <div className="skeleton-line sub"></div>
                                            <div className="skeleton-line desc"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : courses.length === 0 ? (
                            /* Empty State */
                            <div className="courses-empty-state">
                                <div className="empty-icon"><FiBookOpen /></div>
                                <h3>No matching courses found</h3>
                                <p>Try searching for another topic or clear some of your selected filters.</p>
                                <button onClick={handleResetFilters} className="btn-reset-filters-large">
                                    Clear Filters & View All Courses
                                </button>
                            </div>
                        ) : (
                            /* Course Cards Grid */
                            <div className="courses-grid">
                                {courses.map((course) => {
                                    const isBookmarked = bookmarkedCourses.includes(course._id);
                                    return (
                                        <div
                                            key={course._id}
                                            className="course-card"
                                            onClick={() => navigate(`/academy/course/${course._id}`)}
                                        >
                                            <div className="course-thumb-box">
                                                <img
                                                    src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80'}
                                                    alt={course.title}
                                                    className="course-thumbnail"
                                                    onError={(e) => {
                                                        e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80';
                                                    }}
                                                />
                                                <span className="price-tag">
                                                    {course.price === 0 ? 'FREE' : `₹${course.price}`}
                                                </span>
                                                <button
                                                    className={`btn-bookmark-course ${isBookmarked ? 'saved' : ''}`}
                                                    onClick={(e) => toggleBookmark(e, course._id)}
                                                    title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Course'}
                                                >
                                                    <FiBookmark />
                                                </button>
                                            </div>

                                            <div className="course-card-body">
                                                <div className="course-tags-row">
                                                    <span className="tag-category">{course.category}</span>
                                                    <span className="tag-difficulty">{course.difficulty}</span>
                                                </div>

                                                <h3 className="course-card-title">{course.title}</h3>
                                                <p className="course-instructor">Instructor: <strong>{course.instructor}</strong></p>

                                                <div className="course-card-metrics">
                                                    <span className="rating-badge">
                                                        <FiStar className="star-icon" /> {course.rating || 4.8}
                                                    </span>
                                                    <span className="meta-info">
                                                        <FiClock /> {course.duration}
                                                    </span>
                                                    <span className="meta-info">
                                                        <FiUsers /> {course.studentsEnrolled} learners
                                                    </span>
                                                </div>

                                                <p className="course-card-desc">
                                                    {course.description?.length > 110
                                                        ? `${course.description.substring(0, 110)}...`
                                                        : course.description}
                                                </p>

                                                {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                                                    <div className="course-skills-list">
                                                        {course.learningOutcomes.slice(0, 3).map((outcome, idx) => (
                                                            <span key={idx} className="skill-pill">
                                                                ✓ {outcome.substring(0, 30)}...
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="course-card-footer">
                                                    <button
                                                        className="btn-enroll-card"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/academy/course/${course._id}`);
                                                        }}
                                                    >
                                                        Enroll Now <FiArrowRight />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination Bar */}
                        {totalPages > 1 && (
                            <div className="academy-pagination">
                                <button
                                    className="pagination-btn"
                                    disabled={page === 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                >
                                    <FiChevronLeft /> Prev
                                </button>

                                <div className="pagination-numbers">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                                        <button
                                            key={pNum}
                                            className={`page-num ${page === pNum ? 'active' : ''}`}
                                            onClick={() => setPage(pNum)}
                                        >
                                            {pNum}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    className="pagination-btn"
                                    disabled={page === totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                >
                                    Next <FiChevronRight />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
