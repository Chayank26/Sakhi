import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchSchemeById } from '../../../services/schemeApi';
import { SchemeHeader } from '../../schemes/SchemeHeader';
import {
  FiArrowLeft,
  FiExternalLink,
  FiBookmark,
  FiCheckCircle,
  FiFileText,
  FiUserCheck,
  FiList,
  FiCalendar,
  FiFlag,
  FiMapPin,
  FiBriefcase,
  FiShield,
  FiLoader,
  FiAlertCircle
} from 'react-icons/fi';
import './SchemeDetailsPage.css';

export function SchemeDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const loadSchemeDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchSchemeById(id);
        if (data && data.success && data.scheme) {
          setScheme(data.scheme);
        } else {
          setError('Scheme details could not be loaded.');
        }
      } catch (err) {
        console.error('Error fetching scheme details:', err);
        setError(err.response?.data?.message || 'Scheme not found or backend service unavailable.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadSchemeDetails();
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently verified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="scheme-details-shell">
      <SchemeHeader onSavedClick={() => navigate('/saved-schemes')} />

      <div className="scheme-details-container">
        {/* Back Navigation Button */}
        <button
          type="button"
          className="btn-back-schemes"
          onClick={() => navigate('/schemes')}
        >
          <FiArrowLeft className="btn-icon" /> Back to All Schemes
        </button>

        {loading ? (
          <div className="details-loading-card">
            <FiLoader className="spin-icon" />
            <p>Loading government scheme details...</p>
          </div>
        ) : error || !scheme ? (
          <div className="details-error-card">
            <FiAlertCircle className="error-icon" />
            <h2>Scheme Not Found</h2>
            <p>{error || 'The government scheme you are looking for does not exist or has been updated.'}</p>
            <button
              type="button"
              className="btn-return-schemes"
              onClick={() => navigate('/schemes')}
            >
              Return to Schemes Directory
            </button>
          </div>
        ) : (
          <div className="scheme-details-layout">
            {/* Left Main Details Box */}
            <main className="scheme-details-main">
              {/* Header Meta Card */}
              <div className="scheme-title-card">
                <div className="title-top-badges">
                  <span className="details-category-badge">{scheme.category}</span>
                  <span className="details-level-badge">
                    <FiFlag className="badge-icon" /> {scheme.governmentLevel} Govt
                  </span>
                  {scheme.state && (
                    <span className="details-state-badge">
                      <FiMapPin className="badge-icon" /> {scheme.state}
                    </span>
                  )}
                </div>

                <h1 className="details-title">{scheme.name}</h1>

                {scheme.ministry && (
                  <p className="details-ministry">
                    <FiBriefcase className="meta-icon" /> Issued by <strong>{scheme.ministry}</strong>
                  </p>
                )}

                <div className="details-meta-row">
                  <span className="verification-status">
                    <FiShield className="check-icon" /> Official Verified Information
                  </span>
                  {scheme.lastVerifiedAt && (
                    <span className="verification-date">
                      <FiCalendar className="calendar-icon" /> Last verified: {formatDate(scheme.lastVerifiedAt)}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Banner: Prominent Official Application CTA */}
              <div className="apply-official-banner">
                <div className="apply-banner-text">
                  <h3>Ready to apply for this scheme?</h3>
                  <p>Applications are submitted directly on the official government portal.</p>
                </div>
                <div className="apply-banner-actions">
                  {scheme.applicationUrl ? (
                    <a
                      href={scheme.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-apply-official"
                    >
                      <span>Apply on Official Website</span>
                      <FiExternalLink className="btn-icon" />
                    </a>
                  ) : scheme.officialWebsite ? (
                    <a
                      href={scheme.officialWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-apply-official"
                    >
                      <span>Visit Official Portal</span>
                      <FiExternalLink className="btn-icon" />
                    </a>
                  ) : null}

                  <button
                    type="button"
                    className={`btn-save-details ${isBookmarked ? 'saved' : ''}`}
                    onClick={() => setIsBookmarked((prev) => !prev)}
                  >
                    <FiBookmark className="btn-icon" />
                    <span>{isBookmarked ? 'Saved' : 'Save Scheme'}</span>
                  </button>
                </div>
              </div>

              {/* Full Description */}
              <section className="details-section">
                <h2 className="section-heading">Overview & Description</h2>
                <p className="description-text">{scheme.fullDescription}</p>
              </section>

              {/* Key Benefits List */}
              {scheme.benefits && scheme.benefits.length > 0 && (
                <section className="details-section">
                  <h2 className="section-heading">
                    <FiCheckCircle className="section-icon text-success" /> Scheme Benefits & Incentives
                  </h2>
                  <ul className="benefits-list">
                    {scheme.benefits.map((benefit, idx) => (
                      <li key={idx} className="benefit-item">
                        <span className="benefit-bullet">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Eligibility Criteria */}
              {scheme.eligibility && scheme.eligibility.length > 0 && (
                <section className="details-section">
                  <h2 className="section-heading">
                    <FiUserCheck className="section-icon text-primary" /> Eligibility Criteria
                  </h2>
                  <ul className="eligibility-list">
                    {scheme.eligibility.map((item, idx) => (
                      <li key={idx} className="eligibility-item">
                        <span className="eligibility-bullet">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Required Documents */}
              {scheme.documentsRequired && scheme.documentsRequired.length > 0 && (
                <section className="details-section">
                  <h2 className="section-heading">
                    <FiFileText className="section-icon text-warning" /> Required Documents
                  </h2>
                  <div className="documents-grid">
                    {scheme.documentsRequired.map((doc, idx) => (
                      <div key={idx} className="document-card">
                        <FiFileText className="doc-icon" />
                        <span>{doc}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Application Process Steps */}
              {scheme.applicationProcess && scheme.applicationProcess.length > 0 && (
                <section className="details-section">
                  <h2 className="section-heading">
                    <FiList className="section-icon text-accent" /> Step-by-Step Application Process
                  </h2>
                  <ol className="process-steps-list">
                    {scheme.applicationProcess.map((step, idx) => (
                      <li key={idx} className="process-step-item">
                        <div className="step-number">{idx + 1}</div>
                        <div className="step-text">{step}</div>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </main>

            {/* Right Sidebar Info Card */}
            <aside className="scheme-details-sidebar">
              <div className="sidebar-summary-card">
                <h3>Official Links</h3>
                <p className="sidebar-note">
                  Sakhi provides authentic scheme details. All registrations occur on official portal links below.
                </p>

                {scheme.applicationUrl && (
                  <a
                    href={scheme.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sidebar-link-btn primary"
                  >
                    <span>Official Online Application</span>
                    <FiExternalLink />
                  </a>
                )}

                {scheme.officialWebsite && (
                  <a
                    href={scheme.officialWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sidebar-link-btn secondary"
                  >
                    <span>Ministry / Govt Portal</span>
                    <FiExternalLink />
                  </a>
                )}

                <div className="sidebar-divider" />

                {scheme.targetAudience && scheme.targetAudience.length > 0 && (
                  <div className="sidebar-meta-block">
                    <h4>Target Beneficiaries</h4>
                    <div className="sidebar-tags">
                      {scheme.targetAudience.map((aud) => (
                        <span key={aud} className="sidebar-tag">
                          {aud}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {scheme.tags && scheme.tags.length > 0 && (
                  <div className="sidebar-meta-block">
                    <h4>Tags & Keywords</h4>
                    <div className="sidebar-tags">
                      {scheme.tags.map((tag) => (
                        <span key={tag} className="sidebar-tag muted">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
