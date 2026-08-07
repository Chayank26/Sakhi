import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    FiArrowLeft,
    FiMapPin,
    FiBriefcase,
    FiDollarSign,
    FiClock,
    FiGlobe,
    FiUsers,
    FiCalendar,
    FiMail,
    FiUserCheck,
    FiCheckCircle,
    FiShare2,
    FiBookmark,
    FiAward
} from 'react-icons/fi';
import { fetchJobById } from '../../../services/api';
import { ApplyJobModal } from './ApplyJobModal';
import './JobDetailsPage.css';

export function JobDetailsPage() {
    const { jobId } = useParams();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [applied, setApplied] = useState(false);

    useEffect(() => {
        const loadJob = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await fetchJobById(jobId);
                if (data && data.success) {
                    setJob(data.job);
                } else {
                    setError('Job listing not found');
                }
            } catch (err) {
                console.error('Error fetching job details:', err);
                setError('Failed to load job details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (jobId) {
            loadJob();
            const appliedList = JSON.parse(localStorage.getItem('sakhi_applied_jobs') || '[]');
            if (appliedList.includes(jobId)) {
                setApplied(true);
            }
        }
    }, [jobId]);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: job?.title,
                text: `Check out this job opportunity for ${job?.title} at ${job?.company} on Sakhi Careers!`,
                url: window.location.href,
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Job link copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <div className="job-details-loading">
                <div className="details-spinner"></div>
                <p>Loading job details...</p>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="job-details-error">
                <div className="error-card">
                    <h2>Job Not Found</h2>
                    <p>{error || 'The job you are looking for might have expired or been removed.'}</p>
                    <button onClick={() => navigate('/jobs')} className="btn-back-jobs">
                        <FiArrowLeft /> Back to All Jobs
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="job-details-wrapper">
            {/* Header Navigation */}
            <header className="job-details-nav">
                <div className="details-nav-container">
                    <button onClick={() => navigate('/jobs')} className="btn-back-link">
                        <FiArrowLeft /> Back to Jobs
                    </button>
                    <Link to="/home" className="brand-logo-text">💼 Sakhi Careers</Link>
                </div>
            </header>

            {/* Hero Header Section */}
            <section className="job-details-hero">
                <div className="details-hero-container">
                    <div className="hero-main-info">
                        <img
                            src={job.companyLogo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=120&auto=format&fit=crop&q=80'}
                            alt={job.company}
                            className="details-company-logo"
                            onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=120&auto=format&fit=crop&q=80';
                            }}
                        />

                        <div className="hero-header-text">
                            <div className="hero-tags">
                                <span className="tag-industry">{job.industry || 'Technology'}</span>
                                {job.remote && <span className="tag-remote">100% Remote</span>}
                                {job.hybrid && <span className="tag-hybrid">Hybrid Option</span>}
                            </div>
                            <h1 className="details-job-title">{job.title}</h1>
                            <p className="details-company-name">{job.company}</p>
                        </div>
                    </div>

                    <div className="hero-action-buttons">
                        <button
                            className={`btn-action-icon ${isSaved ? 'saved' : ''}`}
                            onClick={() => setIsSaved(!isSaved)}
                            title={isSaved ? 'Saved' : 'Save Job'}
                        >
                            <FiBookmark /> {isSaved ? 'Saved' : 'Save'}
                        </button>
                        <button className="btn-action-icon" onClick={handleShare} title="Share Job">
                            <FiShare2 /> Share
                        </button>
                    </div>
                </div>
            </section>

            {/* Quick Metrics Bar */}
            <div className="job-quick-metrics">
                <div className="metrics-container">
                    <div className="metric-box">
                        <FiDollarSign className="metric-icon" />
                        <div>
                            <span className="metric-label">Offered Salary</span>
                            <strong className="metric-value">{job.salary}</strong>
                        </div>
                    </div>

                    <div className="metric-box">
                        <FiMapPin className="metric-icon" />
                        <div>
                            <span className="metric-label">Location</span>
                            <strong className="metric-value">{job.location}</strong>
                        </div>
                    </div>

                    <div className="metric-box">
                        <FiBriefcase className="metric-icon" />
                        <div>
                            <span className="metric-label">Experience</span>
                            <strong className="metric-value">{job.experience} Required</strong>
                        </div>
                    </div>

                    <div className="metric-box">
                        <FiClock className="metric-icon" />
                        <div>
                            <span className="metric-label">Job Type</span>
                            <strong className="metric-value">{job.employmentType}</strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Body Content Grid */}
            <main className="job-details-content">
                <div className="details-grid">

                    {/* Left Details Column */}
                    <div className="details-left-col">

                        {/* Overview / Description */}
                        <section className="details-card-box">
                            <h3 className="section-title">About the Role</h3>
                            <p className="section-text-body">{job.description}</p>
                        </section>

                        {/* Responsibilities */}
                        {job.responsibilities && job.responsibilities.length > 0 && (
                            <section className="details-card-box">
                                <h3 className="section-title">Key Responsibilities</h3>
                                <ul className="details-bullet-list">
                                    {job.responsibilities.map((resp, idx) => (
                                        <li key={idx}><FiCheckCircle className="bullet-icon" /> <span>{resp}</span></li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* Requirements */}
                        {job.requirements && job.requirements.length > 0 && (
                            <section className="details-card-box">
                                <h3 className="section-title">Requirements & Qualifications</h3>
                                <ul className="details-bullet-list">
                                    {job.requirements.map((req, idx) => (
                                        <li key={idx}><FiCheckCircle className="bullet-icon" /> <span>{req}</span></li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* Required Skills */}
                        {job.skills && job.skills.length > 0 && (
                            <section className="details-card-box">
                                <h3 className="section-title">Required Skills</h3>
                                <div className="skills-badge-wrap">
                                    {job.skills.map((skill, idx) => (
                                        <span key={idx} className="skill-chip">{skill}</span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Benefits & Perks */}
                        {job.benefits && job.benefits.length > 0 && (
                            <section className="details-card-box">
                                <h3 className="section-title">Benefits & Perks</h3>
                                <div className="benefits-grid">
                                    {job.benefits.map((benefit, idx) => (
                                        <div key={idx} className="benefit-card">
                                            <FiAward className="benefit-icon" />
                                            <span>{benefit}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Summary Sidebar */}
                    <aside className="details-sidebar-col">
                        <div className="sidebar-card">
                            <h4 className="sidebar-title">Job Overview</h4>

                            <div className="overview-item">
                                <FiUserCheck className="item-icon" />
                                <div>
                                    <span className="item-label">Education Required</span>
                                    <strong className="item-val">{job.education || "Bachelor's"}</strong>
                                </div>
                            </div>

                            <div className="overview-item">
                                <FiClock className="item-icon" />
                                <div>
                                    <span className="item-label">Working Hours</span>
                                    <strong className="item-val">{job.workingHours || "9:00 AM - 6:00 PM"}</strong>
                                </div>
                            </div>

                            <div className="overview-item">
                                <FiUsers className="item-icon" />
                                <div>
                                    <span className="item-label">Openings</span>
                                    <strong className="item-val">{job.vacancies || 1} Open Vacancies</strong>
                                </div>
                            </div>

                            {job.applicationDeadline && (
                                <div className="overview-item">
                                    <FiCalendar className="item-icon" />
                                    <div>
                                        <span className="item-label">Application Deadline</span>
                                        <strong className="item-val">
                                            {new Date(job.applicationDeadline).toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </strong>
                                    </div>
                                </div>
                            )}

                            <hr className="sidebar-divider" />

                            <h4 className="sidebar-title">Company & Recruiter</h4>

                            <div className="recruiter-box">
                                <p className="recruiter-name"><strong>Hiring Contact:</strong> {job.recruiterName}</p>
                                {job.recruiterEmail && (
                                    <p className="recruiter-email"><FiMail /> {job.recruiterEmail}</p>
                                )}
                                {job.website && (
                                    <a href={job.website} target="_blank" rel="noreferrer" className="company-site-link">
                                        <FiGlobe /> Visit Official Website
                                    </a>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            {/* Bottom Floating Apply Bar */}
            <div className="floating-apply-bar">
                <div className="apply-bar-container">
                    <div className="apply-bar-text">
                        <h3>{job.title}</h3>
                        <p>{job.company} • {job.location}</p>
                    </div>

                    <button
                        className={`btn-primary-apply ${applied ? 'applied' : ''}`}
                        onClick={() => !applied && setShowApplyModal(true)}
                        disabled={applied}
                    >
                        {applied ? <><FiCheckCircle /> Applied</> : 'Apply Now'}
                    </button>
                </div>
            </div>

            {/* Apply Job Modal */}
            {showApplyModal && (
                <ApplyJobModal
                    job={job}
                    onClose={() => setShowApplyModal(false)}
                    onSuccess={() => setApplied(true)}
                />
            )}
        </div>
    );
}
