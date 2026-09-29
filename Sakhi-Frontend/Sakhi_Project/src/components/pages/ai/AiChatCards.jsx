import { Link } from 'react-router-dom';
import { recommendationRoute, formatCoursePrice } from './chatUiUtils';
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
} from 'react-icons/fi';
import './AiChatCards.css';

/**
 * Job Mini-Card for in-chat display
 */
export function JobMiniCard({ job }) {
  if (!job) return null;

  const {
    title,
    company,
    location,
    employmentType,
    salary,
    experience
  } = job;


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

      {(job.recommendationReason) && <p className="ai-card-description"><strong>Why this fits:</strong> {job.recommendationReason}</p>}
      <Link className="ai-card-action-btn" to={recommendationRoute('job', job)}>
        <span>View Details</span>
        <FiArrowRight />
      </Link>
    </div>
  );
}

/**
 * Course Mini-Card for in-chat display
 */
export function CourseMiniCard({ course }) {
  if (!course) return null;

  const {
    title,
    instructor,
    difficulty,
    duration,
    price,
    rating
  } = course;


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
        {Number(rating) > 0 && (
          <div className="ai-card-meta-item">
            <FiStar className="meta-icon star" />
            <span>{rating} / 5</span>
          </div>
        )}
        {price != null && (
          <div className="ai-card-meta-item">
            <FiAward className="meta-icon" />
            <span>{formatCoursePrice(price)}</span>
          </div>
        )}
      </div>

      {course.recommendationReason && <p className="ai-card-description"><strong>Why this fits:</strong> {course.recommendationReason}</p>}
      <Link className="ai-card-action-btn" to={recommendationRoute('course', course)}>
        <span>Explore Course</span>
        <FiArrowRight />
      </Link>
    </div>
  );
}

/**
 * Government Scheme Mini-Card for in-chat display
 */
export function SchemeMiniCard({ scheme }) {
  if (!scheme) return null;

  const {
    name,
    category,
    governmentLevel,
    state,
    shortDescription
  } = scheme;


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

      {scheme.recommendationReason && <p className="ai-card-description"><strong>Why this fits:</strong> {scheme.recommendationReason}</p>}
      <Link className="ai-card-action-btn" to={recommendationRoute('scheme', scheme)}>
        <span>View Scheme</span>
        <FiArrowRight />
      </Link>
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
          <h3 className="ai-cards-section-header">
            <FiBriefcase className="section-icon" />
            <span>Matching Job Openings</span>
          </h3>
          <div className="ai-cards-horizontal-scroll">
            {jobs.map((job, idx) => (
              <JobMiniCard key={job.jobId || idx} job={job} />
            ))}
          </div>
        </div>
      )}

      {hasCourses && (
        <div className="ai-cards-section">
          <h3 className="ai-cards-section-header">
            <FiBookOpen className="section-icon" />
            <span>Recommended Academy Courses</span>
          </h3>
          <div className="ai-cards-horizontal-scroll">
            {courses.map((course, idx) => (
              <CourseMiniCard key={course.courseId || idx} course={course} />
            ))}
          </div>
        </div>
      )}

      {hasSchemes && (
        <div className="ai-cards-section">
          <h3 className="ai-cards-section-header">
            <FiFileText className="section-icon" />
            <span>Government Welfare Schemes</span>
          </h3>
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
