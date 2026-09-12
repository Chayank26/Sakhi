import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiBriefcase,
  FiMapPin,
  FiDollarSign,
  FiClock,
  FiBookOpen,
  FiAward,
  FiStar,
  FiFileText,
  FiArrowRight,
  FiShield,
  FiExternalLink
} from 'react-icons/fi';
import './AiChatCards.css';

/**
 * Job Mini-Card for in-chat display
 */
export function JobMiniCard({ job }) {
  const navigate = useNavigate();
  if (!job) return null;

  const {
    jobId,
    title,
    company,
    location,
    employmentType,
    salary,
    experience
  } = job;

  const handleNavigate = () => {
    if (jobId) {
      navigate(`/jobs?q=${encodeURIComponent(title || '')}`);
    } else {
      navigate('/jobs');
    }
  };

  return (
    <div className="ai-mini-card ai-job-card">
      <div className="ai-card-top-row">
        <div className="ai-card-badge job-badge">
          <FiBriefcase className="badge-icon" /> Job Opening
        </div>
        {employmentType && <span className="ai-card-subtag">{employmentType}</span>}
      </div>

      <h4 className="ai-card-title">{title}</h4>
      <p className="ai-card-subtitle">{company}</p>

      <div className="ai-card-meta-list">
        {location && (
          <div className="ai-card-meta-item">
            <FiMapPin className="meta-icon" />
            <span>{location}</span>
          </div>
        )}
        {salary && (
          <div className="ai-card-meta-item">
            <FiDollarSign className="meta-icon" />
            <span>{salary}</span>
          </div>
        )}
        {experience && (
          <div className="ai-card-meta-item">
            <FiClock className="meta-icon" />
            <span>{experience}</span>
          </div>
        )}
      </div>

      <button type="button" className="ai-card-action-btn" onClick={handleNavigate}>
        <span>View Details</span>
        <FiArrowRight />
      </button>
    </div>
  );
}

/**
 * Course Mini-Card for in-chat display
 */
export function CourseMiniCard({ course }) {
  const navigate = useNavigate();
  if (!course) return null;

  const {
    courseId,
    title,
    instructor,
    category,
    difficulty,
    duration,
    price,
    rating
  } = course;

  const handleNavigate = () => {
    if (courseId) {
      navigate(`/academy?search=${encodeURIComponent(title || '')}`);
    } else {
      navigate('/academy');
    }
  };

  return (
    <div className="ai-mini-card ai-course-card">
      <div className="ai-card-top-row">
        <div className="ai-card-badge course-badge">
          <FiBookOpen className="badge-icon" /> Sakhi Academy
        </div>
        {difficulty && <span className="ai-card-subtag">{difficulty}</span>}
      </div>

      <h4 className="ai-card-title">{title}</h4>
      {instructor && <p className="ai-card-subtitle">By {instructor}</p>}

      <div className="ai-card-meta-list">
        {duration && (
          <div className="ai-card-meta-item">
            <FiClock className="meta-icon" />
            <span>{duration}</span>
          </div>
        )}
        {rating && (
          <div className="ai-card-meta-item">
            <FiStar className="meta-icon star" />
            <span>{rating} / 5</span>
          </div>
        )}
        {price && (
          <div className="ai-card-meta-item">
            <FiAward className="meta-icon" />
            <span>{price}</span>
          </div>
        )}
      </div>

      <button type="button" className="ai-card-action-btn" onClick={handleNavigate}>
        <span>Explore Course</span>
        <FiArrowRight />
      </button>
    </div>
  );
}

/**
 * Government Scheme Mini-Card for in-chat display
 */
export function SchemeMiniCard({ scheme }) {
  const navigate = useNavigate();
  if (!scheme) return null;

  const {
    schemeId,
    name,
    category,
    governmentLevel,
    state,
    shortDescription
  } = scheme;

  const handleNavigate = () => {
    if (schemeId) {
      navigate(`/schemes?q=${encodeURIComponent(name || '')}`);
    } else {
      navigate('/schemes');
    }
  };

  return (
    <div className="ai-mini-card ai-scheme-card">
      <div className="ai-card-top-row">
        <div className="ai-card-badge scheme-badge">
          <FiFileText className="badge-icon" /> Govt Scheme
        </div>
        {governmentLevel && <span className="ai-card-subtag">{governmentLevel}</span>}
      </div>

      <h4 className="ai-card-title">{name}</h4>
      {category && <p className="ai-card-subtitle">{category} {state && state !== 'All India' ? `• ${state}` : ''}</p>}

      {shortDescription && (
        <p className="ai-card-description">
          {shortDescription.length > 90 ? `${shortDescription.slice(0, 90)}...` : shortDescription}
        </p>
      )}

      <button type="button" className="ai-card-action-btn" onClick={handleNavigate}>
        <span>View Scheme</span>
        <FiArrowRight />
      </button>
    </div>
  );
}

/**
 * Container component that conditionally renders all available card groups
 */
export function AiCardsContainer({ cards }) {
  if (!cards) return null;

  const { jobs = [], courses = [], schemes = [] } = cards;
  const hasJobs = Array.isArray(jobs) && jobs.length > 0;
  const hasCourses = Array.isArray(courses) && courses.length > 0;
  const hasSchemes = Array.isArray(schemes) && schemes.length > 0;

  if (!hasJobs && !hasCourses && !hasSchemes) return null;

  return (
    <div className="ai-cards-container">
      {hasJobs && (
        <div className="ai-cards-section">
          <div className="ai-cards-section-header">
            <FiBriefcase className="section-icon" />
            <span>Matching Job Openings</span>
          </div>
          <div className="ai-cards-horizontal-scroll">
            {jobs.map((job, idx) => (
              <JobMiniCard key={job.jobId || idx} job={job} />
            ))}
          </div>
        </div>
      )}

      {hasCourses && (
        <div className="ai-cards-section">
          <div className="ai-cards-section-header">
            <FiBookOpen className="section-icon" />
            <span>Recommended Academy Courses</span>
          </div>
          <div className="ai-cards-horizontal-scroll">
            {courses.map((course, idx) => (
              <CourseMiniCard key={course.courseId || idx} course={course} />
            ))}
          </div>
        </div>
      )}

      {hasSchemes && (
        <div className="ai-cards-section">
          <div className="ai-cards-section-header">
            <FiFileText className="section-icon" />
            <span>Government Welfare Schemes</span>
          </div>
          <div className="ai-cards-horizontal-scroll">
            {schemes.map((scheme, idx) => (
              <SchemeMiniCard key={scheme.schemeId || idx} scheme={scheme} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
