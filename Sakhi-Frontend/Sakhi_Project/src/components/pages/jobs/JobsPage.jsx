import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    FiSearch,
    FiMapPin,
    FiBriefcase,
    FiDollarSign,
    FiClock,
    FiFilter,
    FiPlusCircle,
    FiBookmark,
    FiChevronLeft,
    FiChevronRight,
    FiSliders,
    FiCheckCircle,
    FiArrowRight
} from 'react-icons/fi';
import { fetchJobs } from '../../../services/api';
import './JobsPage.css';

export function JobsPage() {
    const navigate = useNavigate();

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [locationQuery, setLocationQuery] = useState('');

    // Applied Search State
    const [appliedQuery, setAppliedQuery] = useState('');
    const [appliedLocation, setAppliedLocation] = useState('');

    // Filters state
    const [selectedSalary, setSelectedSalary] = useState([]);
    const [selectedExp, setSelectedExp] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedEdu, setSelectedEdu] = useState([]);
    const [selectedIndustry, setSelectedIndustry] = useState([]);
    const [selectedPosted, setSelectedPosted] = useState('');
    const [sortBy, setSortBy] = useState('latest');

    // UI & Pagination
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [savedJobs, setSavedJobs] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalJobs, setTotalJobs] = useState(0);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const loadJobs = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {
                q: appliedQuery,
                location: appliedLocation,
                salaryRange: selectedSalary,
                experience: selectedExp,
                jobType: selectedTypes,
                education: selectedEdu,
                industry: selectedIndustry,
                posted: selectedPosted,
                sortBy,
                page,
                limit: 6,
            };

            const data = await fetchJobs(params);
            if (data && data.success) {
                setJobs(data.jobs || []);
                setTotalPages(data.totalPages || 1);
                setTotalJobs(data.totalJobs || 0);
            }
        } catch (err) {
            console.error('Failed to load jobs:', err);
            setError('Unable to connect to jobs service. Please ensure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadJobs();
    }, [appliedQuery, appliedLocation, selectedSalary, selectedExp, selectedTypes, selectedEdu, selectedIndustry, selectedPosted, sortBy, page]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        setAppliedQuery(searchQuery);
        setAppliedLocation(locationQuery);
    };

    const toggleFilter = (item, currentList, setList) => {
        setPage(1);
        if (currentList.includes(item)) {
            setList(currentList.filter((i) => i !== item));
        } else {
            setList([...currentList, item]);
        }
    };

    const toggleSaveJob = (e, jobId) => {
        e.stopPropagation();
        if (savedJobs.includes(jobId)) {
            setSavedJobs(savedJobs.filter((id) => id !== jobId));
        } else {
            setSavedJobs([...savedJobs, jobId]);
        }
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setLocationQuery('');
        setAppliedQuery('');
        setAppliedLocation('');
        setSelectedSalary([]);
        setSelectedExp([]);
        setSelectedTypes([]);
        setSelectedEdu([]);
        setSelectedIndustry([]);
        setSelectedPosted('');
        setSortBy('latest');
        setPage(1);
    };

    return (
        <div className="jobs-portal-wrapper">
            {/* Header */}
            <header className="jobs-portal-header">
                <div className="jobs-header-container">
                    <div className="jobs-brand-section">
                        <Link to="/home" className="jobs-brand-logo">
                            <span className="brand-badge">💼 Sakhi</span>
                            <span className="brand-sub">Careers</span>
                        </Link>
                    </div>

                    <div className="jobs-header-actions">
                        <Link to="/jobs/create" className="btn-list-a-job">
                            <FiPlusCircle className="icon" /> List a Job?
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Search Section */}
            <section className="jobs-search-hero">
                <div className="jobs-hero-content">
                    <h1 className="jobs-hero-title">Find Meaningful Career Opportunities</h1>
                    <p className="jobs-hero-subtitle">
                        Discover jobs, internships, and remote roles tailored to empower women professionals.
                    </p>

                    <form onSubmit={handleSearchSubmit} className="jobs-search-bar">
                        <div className="search-input-group">
                            <FiSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search jobs... (e.g. Frontend Developer, Data Analyst)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="search-divider"></div>

                        <div className="search-input-group">
                            <FiMapPin className="search-icon" />
                            <input
                                type="text"
                                placeholder="Location (e.g. Chennai, Bengaluru, Remote)"
                                value={locationQuery}
                                onChange={(e) => setLocationQuery(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="btn-search-submit">
                            Search Jobs
                        </button>
                    </form>
                </div>
            </section>

            {/* Main Portal Body */}
            <main className="jobs-main-content">
                <div className="jobs-layout-grid">

                    {/* Mobile Filter Toggle */}
                    <div className="mobile-filter-bar">
                        <button
                            className="btn-mobile-filter-toggle"
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                        >
                            <FiSliders /> Filters ({selectedSalary.length + selectedExp.length + selectedTypes.length + selectedEdu.length + selectedIndustry.length})
                        </button>

                        <div className="mobile-sort-select">
                            <label>Sort:</label>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="latest">Latest</option>
                                <option value="highest_salary">Highest Salary</option>
                                <option value="oldest">Oldest</option>
                            </select>
                        </div>
                    </div>

                    {/* Sidebar Filters */}
                    <aside className={`jobs-sidebar-filters ${showMobileFilters ? 'open' : ''}`}>
                        <div className="filters-header">
                            <h3><FiFilter /> Filter Jobs</h3>
                            <button onClick={handleResetFilters} className="btn-reset-filters">Reset All</button>
                        </div>

                        {/* Salary Range */}
                        <div className="filter-group">
                            <h4 className="filter-title">Salary Range</h4>
                            <div className="filter-options">
                                {[
                                    { label: 'Under ₹3 LPA', value: 'under_3' },
                                    { label: '₹3–6 LPA', value: '3_6' },
                                    { label: '₹6–10 LPA', value: '6_10' },
                                    { label: '₹10–15 LPA', value: '10_15' },
                                    { label: '₹15+ LPA', value: '15_plus' },
                                ].map((item) => (
                                    <label key={item.value} className="filter-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={selectedSalary.includes(item.value)}
                                            onChange={() => toggleFilter(item.value, selectedSalary, setSelectedSalary)}
                                        />
                                        <span>{item.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Experience */}
                        <div className="filter-group">
                            <h4 className="filter-title">Experience Required</h4>
                            <div className="filter-options">
                                {['Fresher', '1+', '2+', '3+', '5+', '8+'].map((exp) => (
                                    <label key={exp} className="filter-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={selectedExp.includes(exp)}
                                            onChange={() => toggleFilter(exp, selectedExp, setSelectedExp)}
                                        />
                                        <span>{exp === 'Fresher' ? 'Fresher' : `${exp} Years`}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Job Type */}
                        <div className="filter-group">
                            <h4 className="filter-title">Job Type</h4>
                            <div className="filter-options">
                                {['Full Time', 'Part Time', 'Internship', 'Contract', 'Remote', 'Hybrid'].map((type) => (
                                    <label key={type} className="filter-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={selectedTypes.includes(type)}
                                            onChange={() => toggleFilter(type, selectedTypes, setSelectedTypes)}
                                        />
                                        <span>{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Education */}
                        <div className="filter-group">
                            <h4 className="filter-title">Education</h4>
                            <div className="filter-options">
                                {["High School", "Diploma", "Bachelor's", "Master's", "PhD"].map((edu) => (
                                    <label key={edu} className="filter-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={selectedEdu.includes(edu)}
                                            onChange={() => toggleFilter(edu, selectedEdu, setSelectedEdu)}
                                        />
                                        <span>{edu}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Industry */}
                        <div className="filter-group">
                            <h4 className="filter-title">Industry</h4>
                            <div className="filter-options">
                                {['Software', 'Healthcare', 'Education', 'Finance', 'Marketing'].map((ind) => (
                                    <label key={ind} className="filter-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={selectedIndustry.includes(ind)}
                                            onChange={() => toggleFilter(ind, selectedIndustry, setSelectedIndustry)}
                                        />
                                        <span>{ind}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Posted Time */}
                        <div className="filter-group">
                            <h4 className="filter-title">Date Posted</h4>
                            <div className="filter-options">
                                {[
                                    { label: 'All Time', value: '' },
                                    { label: 'Last 24 Hours', value: '24h' },
                                    { label: 'Last Week', value: 'week' },
                                    { label: 'Last Month', value: 'month' },
                                ].map((time) => (
                                    <label key={time.value} className="filter-radio-label">
                                        <input
                                            type="radio"
                                            name="postedTime"
                                            checked={selectedPosted === time.value}
                                            onChange={() => {
                                                setPage(1);
                                                setSelectedPosted(time.value);
                                            }}
                                        />
                                        <span>{time.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Listings Main Column */}
                    <div className="jobs-listings-column">

                        {/* Sorting & Stats Bar */}
                        <div className="jobs-stats-bar">
                            <div className="stats-text">
                                Showing <strong>{totalJobs}</strong> career opportunities
                                {appliedQuery && <span> for "<em>{appliedQuery}</em>"</span>}
                                {appliedLocation && <span> in "<em>{appliedLocation}</em>"</span>}
                            </div>

                            <div className="desktop-sort-box">
                                <label>Sort by:</label>
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                    <option value="latest">Latest First</option>
                                    <option value="highest_salary">Highest Salary</option>
                                    <option value="oldest">Oldest First</option>
                                </select>
                            </div>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <div className="jobs-error-alert">
                                <p>{error}</p>
                                <button onClick={loadJobs} className="btn-retry">Retry</button>
                            </div>
                        )}

                        {/* Skeleton Loading State */}
                        {loading ? (
                            <div className="jobs-cards-grid">
                                {[1, 2, 3, 4].map((n) => (
                                    <div key={n} className="job-card-skeleton">
                                        <div className="skeleton-header">
                                            <div className="skeleton-logo"></div>
                                            <div className="skeleton-text-group">
                                                <div className="skeleton-line title"></div>
                                                <div className="skeleton-line sub"></div>
                                            </div>
                                        </div>
                                        <div className="skeleton-line desc"></div>
                                        <div className="skeleton-pills">
                                            <div className="skeleton-pill"></div>
                                            <div className="skeleton-pill"></div>
                                            <div className="skeleton-pill"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : jobs.length === 0 ? (
                            /* Empty State */
                            <div className="jobs-empty-state">
                                <div className="empty-icon">🔍</div>
                                <h3>No matching jobs found</h3>
                                <p>Try adjusting your search keywords or clearing some filter options.</p>
                                <button onClick={handleResetFilters} className="btn-reset-filters-large">
                                    Clear Filters & View All Jobs
                                </button>
                            </div>
                        ) : (
                            /* Jobs Cards Grid */
                            <div className="jobs-cards-grid">
                                {jobs.map((job) => {
                                    const isSaved = savedJobs.includes(job._id);
                                    return (
                                        <div
                                            key={job._id}
                                            className="job-card"
                                            onClick={() => navigate(`/jobs/${job._id}`)}
                                        >
                                            <div className="job-card-header">
                                                <img
                                                    src={job.companyLogo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=120&auto=format&fit=crop&q=80'}
                                                    alt={job.company}
                                                    className="company-logo"
                                                    onError={(e) => {
                                                        e.target.src = 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=120&auto=format&fit=crop&q=80';
                                                    }}
                                                />
                                                <div className="job-title-wrapper">
                                                    <h3 className="job-title">{job.title}</h3>
                                                    <p className="company-name">{job.company}</p>
                                                </div>

                                                <button
                                                    className={`btn-bookmark ${isSaved ? 'saved' : ''}`}
                                                    onClick={(e) => toggleSaveJob(e, job._id)}
                                                    title={isSaved ? 'Unsave Job' : 'Save Job'}
                                                >
                                                    <FiBookmark />
                                                </button>
                                            </div>

                                            <div className="job-card-meta">
                                                <span className="meta-badge location">
                                                    <FiMapPin /> {job.location}
                                                    {job.remote && <span className="tag-remote">Remote</span>}
                                                </span>
                                                <span className="meta-badge salary">
                                                    <FiDollarSign /> {job.salary}
                                                </span>
                                                <span className="meta-badge exp">
                                                    <FiBriefcase /> {job.experience}
                                                </span>
                                                <span className="meta-badge type">
                                                    {job.employmentType}
                                                </span>
                                            </div>

                                            <p className="job-card-description">
                                                {job.description?.length > 130
                                                    ? `${job.description.substring(0, 130)}...`
                                                    : job.description}
                                            </p>

                                            {job.skills && job.skills.length > 0 && (
                                                <div className="job-skills-list">
                                                    {job.skills.slice(0, 4).map((skill, idx) => (
                                                        <span key={idx} className="skill-pill">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {job.skills.length > 4 && (
                                                        <span className="skill-pill more">
                                                            +{job.skills.length - 4}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            <div className="job-card-footer">
                                                <span className="posted-date">
                                                    <FiClock /> {new Date(job.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                                </span>

                                                <button
                                                    className="btn-apply-card"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/jobs/${job._id}`);
                                                    }}
                                                >
                                                    View & Apply <FiArrowRight />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination Bar */}
                        {totalPages > 1 && (
                            <div className="jobs-pagination">
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
