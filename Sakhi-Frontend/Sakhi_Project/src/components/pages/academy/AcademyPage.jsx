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
import './AcademyPage.css';

export function AcademyPage() {
    const navigate = useNavigate();

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [appliedQuery, setAppliedQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState([]);
    const [selectedDifficulty, setSelectedDifficulty] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState([]);
    const [selectedType, setSelectedType] = useState('');
    const [sortBy, setSortBy] = useState('popular');

    // UI & Pagination
    const [courses, setCourses] = useState([]);
    const [featuredCourses, setFeaturedCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [bookmarkedCourses, setBookmarkedCourses] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCourses, setTotalCourses] = useState(0);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [activeCarouselIdx, setActiveCarouselIdx] = useState(0);

    // Sync bookmarked courses from localStorage
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('sakhi_bookmarked_courses') || '[]');
        setBookmarkedCourses(saved);
    }, []);

    const loadCourses = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {
                q: appliedQuery,
                category: selectedCategory,
                difficulty: selectedDifficulty,
                language: selectedLanguage,
                type: selectedType,
                sortBy,
                page,
                limit: 6,
            };

            const data = await fetchCourses(params);
            if (data && data.success) {
                setCourses(data.courses || []);
                setTotalPages(data.totalPages || 1);
                setTotalCourses(data.totalCourses || 0);

                // Set top featured courses for carousel on first load
                if (data.courses.length > 0 && featuredCourses.length === 0) {
                    setFeaturedCourses(data.courses.slice(0, 3));
                }
            }
        } catch (err) {
            console.error('Failed to load courses:', err);
            setError('Unable to load courses. Please ensure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCourses();
    }, [appliedQuery, selectedCategory, selectedDifficulty, selectedLanguage, selectedType, sortBy, page]);

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
        let updated;
        if (bookmarkedCourses.includes(courseId)) {
            updated = bookmarkedCourses.filter((id) => id !== courseId);
        } else {
            updated = [...bookmarkedCourses, courseId];
        }
        setBookmarkedCourses(updated);
        localStorage.setItem('sakhi_bookmarked_courses', JSON.stringify(updated));
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setAppliedQuery('');
        setSelectedCategory([]);
        setSelectedDifficulty([]);
        setSelectedLanguage([]);
        setSelectedType('');
        setSortBy('popular');
        setPage(1);
    };

    return (
        <div className="academy-wrapper">
            {/* Header */}
            <header className="academy-header">
                <div className="academy-header-container">
                    <div className="academy-brand">
                        <Link to="/home" className="academy-logo">
                            <span className="brand-badge">🎓 Sakhi</span>
                            <span className="brand-sub">Academy</span>
                        </Link>
                    </div>

                    <div className="academy-nav-actions">
                        <Link to="/academy/my-learning" className="btn-my-learning">
                            <FiBookOpen className="icon" /> My Learning
                        </Link>
                        <Link to="/academy/create" className="btn-list-a-course">
                            <FiPlusCircle className="icon" /> List a Course
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero & Search Banner */}
            <section className="academy-hero">
                <div className="academy-hero-content">
                    <h1 className="academy-hero-title">Learn. Grow. Transform Your Career.</h1>
                    <p className="academy-hero-subtitle">
                        Free & accessible world-class courses designed for women in tech, business, design, finance, and leadership.
                    </p>

                    <form onSubmit={handleSearchSubmit} className="academy-search-bar">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search courses... (e.g. React, AI, UI/UX Design, Financial Freedom)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="btn-search-courses">
                            Search Courses
                        </button>
                    </form>
                </div>
            </section>

            {/* Featured Courses Carousel */}
            {featuredCourses.length > 0 && (
                <section className="featured-carousel-section">
                    <div className="carousel-container">
                        <div className="carousel-header">
                            <h2>🌟 Featured Courses</h2>
                            <div className="carousel-controls">
                                <button
                                    onClick={() => setActiveCarouselIdx((prev) => (prev > 0 ? prev - 1 : featuredCourses.length - 1))}
                                    className="carousel-btn"
                                >
                                    <FiChevronLeft />
                                </button>
                                <button
                                    onClick={() => setActiveCarouselIdx((prev) => (prev < featuredCourses.length - 1 ? prev + 1 : 0))}
                                    className="carousel-btn"
                                >
                                    <FiChevronRight />
                                </button>
                            </div>
                        </div>

                        {featuredCourses[activeCarouselIdx] && (
                            <div
                                className="featured-course-banner"
                                onClick={() => navigate(`/academy/course/${featuredCourses[activeCarouselIdx]._id}`)}
                            >
                                <div className="banner-image-box">
                                    <img
                                        src={featuredCourses[activeCarouselIdx].thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80'}
                                        alt={featuredCourses[activeCarouselIdx].title}
                                    />
                                    <span className="featured-badge">Featured</span>
                                </div>

                                <div className="banner-details">
                                    <div className="banner-meta">
                                        <span className="banner-cat">{featuredCourses[activeCarouselIdx].category}</span>
                                        <span className="banner-diff">{featuredCourses[activeCarouselIdx].difficulty}</span>
                                    </div>

                                    <h3 className="banner-title">{featuredCourses[activeCarouselIdx].title}</h3>
                                    <p className="banner-instructor">Instructor: <strong>{featuredCourses[activeCarouselIdx].instructor}</strong></p>
                                    <p className="banner-desc">{featuredCourses[activeCarouselIdx].description}</p>

                                    <div className="banner-stats-row">
                                        <span className="stat"><FiStar className="star-icon" /> {featuredCourses[activeCarouselIdx].rating || 4.9}</span>
                                        <span className="stat"><FiClock /> {featuredCourses[activeCarouselIdx].duration}</span>
                                        <span className="stat"><FiUsers /> {featuredCourses[activeCarouselIdx].studentsEnrolled} Students</span>
                                    </div>

                                    <button className="btn-explore-featured">
                                        Explore Course <FiArrowRight />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
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

                            <div className="desktop-sort-box">
                                <label>Sort by:</label>
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                    <option value="popular">Most Popular</option>
                                    <option value="rating">Highest Rated</option>
                                    <option value="newest">Newest First</option>
                                </select>
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
                                <div className="empty-icon">📚</div>
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
