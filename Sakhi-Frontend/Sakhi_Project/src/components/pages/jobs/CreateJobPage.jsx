import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiBriefcase, FiDollarSign, FiMapPin, FiClock, FiPlusCircle, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { createJob } from '../../../services/api';
import './CreateJobPage.css';

export function CreateJobPage() {
    const navigate = useNavigate();

    const [useRegisteredEmail, setUseRegisteredEmail] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [formData, setFormData] = useState({
        company: '',
        recruiterName: '',
        recruiterEmail: '',
        jobTitle: '',
        description: '',
        responsibilities: '',
        requirements: '',
        skills: '',
        salary: '',
        salaryMinLpa: 3,
        salaryMaxLpa: 10,
        location: '',
        experience: 'Fresher',
        education: "Bachelor's",
        employmentType: 'Full Time',
        workingHours: '9:00 AM - 6:00 PM IST',
        vacancies: 1,
        applicationDeadline: '',
        companyLogo: '',
        website: '',
        industry: 'Software',
        benefits: '',
        remote: false,
        hybrid: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleEmailToggle = (e) => {
        const checked = e.target.checked;
        setUseRegisteredEmail(checked);
        if (checked) {
            setFormData((prev) => ({
                ...prev,
                recruiterEmail: 'user@sakhi.org',
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                recruiterEmail: '',
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (
            !formData.company ||
            !formData.recruiterName ||
            !formData.recruiterEmail ||
            !formData.jobTitle ||
            !formData.description ||
            !formData.location ||
            !formData.salary
        ) {
            setError('Please fill in all mandatory fields (Company, Recruiter Name & Email, Job Title, Description, Location, Salary).');
            return;
        }

        setSubmitting(true);

        try {
            const jobDataPayload = {
                title: formData.jobTitle,
                company: formData.company,
                recruiterName: formData.recruiterName,
                recruiterEmail: formData.recruiterEmail,
                description: formData.description,
                responsibilities: formData.responsibilities,
                requirements: formData.requirements,
                skills: formData.skills,
                salary: formData.salary,
                salaryMinLpa: Number(formData.salaryMinLpa) || 3,
                salaryMaxLpa: Number(formData.salaryMaxLpa) || 10,
                location: formData.location,
                experience: formData.experience,
                education: formData.education,
                employmentType: formData.employmentType,
                workingHours: formData.workingHours,
                vacancies: Number(formData.vacancies) || 1,
                applicationDeadline: formData.applicationDeadline || undefined,
                companyLogo: formData.companyLogo,
                website: formData.website,
                industry: formData.industry,
                benefits: formData.benefits,
                remote: formData.remote,
                hybrid: formData.hybrid,
            };

            const response = await createJob(jobDataPayload);

            if (response && response.success) {
                setSuccessMessage('Job listing posted successfully!');
                setTimeout(() => {
                    navigate('/jobs');
                }, 1500);
            } else {
                setError(response.message || 'Failed to post job.');
            }
        } catch (err) {
            console.error('Error posting job:', err);
            setError(err.response?.data?.message || 'Error submitting job posting. Please check your connection.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="create-job-wrapper">
            {/* Header */}
            <header className="create-job-nav">
                <div className="create-nav-container">
                    <button onClick={() => navigate('/jobs')} className="btn-back-link">
                        <FiArrowLeft /> Back to Jobs Portal
                    </button>
                    <Link to="/home" className="brand-logo-text">💼 Sakhi Careers</Link>
                </div>
            </header>

            {/* Page Header */}
            <div className="create-job-hero">
                <div className="create-hero-content">
                    <h1>Post a New Career Opportunity</h1>
                    <p>Reach talented, ambitious women professionals across India by publishing your job listing.</p>
                </div>
            </div>

            {/* Main Form Container */}
            <main className="create-job-main">
                <form onSubmit={handleSubmit} className="create-job-form">
                    {error && (
                        <div className="create-error-alert">
                            <FiAlertCircle /> {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="create-success-alert">
                            <FiCheck /> {successMessage} Redirecting to jobs portal...
                        </div>
                    )}

                    {/* Section 1: Recruiter & Company Info */}
                    <div className="form-section">
                        <h3 className="section-heading"><FiBriefcase className="sec-icon" /> Company & Recruiter Details</h3>

                        <div className="form-grid-2">
                            <div className="form-group">
                                <label>Company Name <span className="req">*</span></label>
                                <input
                                    type="text"
                                    name="company"
                                    placeholder="e.g. InnovateHer Tech"
                                    value={formData.company}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Company Website</label>
                                <input
                                    type="url"
                                    name="website"
                                    placeholder="https://example.com"
                                    value={formData.website}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-grid-2">
                            <div className="form-group">
                                <label>Recruiter Name <span className="req">*</span></label>
                                <input
                                    type="text"
                                    name="recruiterName"
                                    placeholder="e.g. Ananya Sharma"
                                    value={formData.recruiterName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Recruiter Email <span className="req">*</span></label>
                                <input
                                    type="email"
                                    name="recruiterEmail"
                                    placeholder="recruiter@company.com"
                                    value={formData.recruiterEmail}
                                    onChange={handleChange}
                                    disabled={useRegisteredEmail}
                                    required
                                />
                                <label className="checkbox-sub-label">
                                    <input
                                        type="checkbox"
                                        checked={useRegisteredEmail}
                                        onChange={handleEmailToggle}
                                    />
                                    <span>Use my registered email (user@sakhi.org)</span>
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Company Logo URL (Optional)</label>
                            <input
                                type="url"
                                name="companyLogo"
                                placeholder="https://example.com/logo.png"
                                value={formData.companyLogo}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Section 2: Role Specifications */}
                    <div className="form-section">
                        <h3 className="section-heading"><FiBriefcase className="sec-icon" /> Job Specifications</h3>

                        <div className="form-grid-2">
                            <div className="form-group">
                                <label>Job Title <span className="req">*</span></label>
                                <input
                                    type="text"
                                    name="jobTitle"
                                    placeholder="e.g. Senior Frontend Developer"
                                    value={formData.jobTitle}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Industry <span className="req">*</span></label>
                                <select name="industry" value={formData.industry} onChange={handleChange}>
                                    <option value="Software">Software & Tech</option>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="Education">Education & EdTech</option>
                                    <option value="Finance">Finance & Banking</option>
                                    <option value="Marketing">Marketing & Media</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-grid-3">
                            <div className="form-group">
                                <label>Location <span className="req">*</span></label>
                                <input
                                    type="text"
                                    name="location"
                                    placeholder="e.g. Bengaluru, Chennai, Remote"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Employment Type <span className="req">*</span></label>
                                <select name="employmentType" value={formData.employmentType} onChange={handleChange}>
                                    <option value="Full Time">Full Time</option>
                                    <option value="Part Time">Part Time</option>
                                    <option value="Internship">Internship</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Remote">Remote</option>
                                    <option value="Hybrid">Hybrid</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Experience Required <span className="req">*</span></label>
                                <select name="experience" value={formData.experience} onChange={handleChange}>
                                    <option value="Fresher">Fresher (0 Years)</option>
                                    <option value="1+">1+ Years</option>
                                    <option value="2+">2+ Years</option>
                                    <option value="3+">3+ Years</option>
                                    <option value="5+">5+ Years</option>
                                    <option value="8+">8+ Years</option>
                                </select>
                            </div>
                        </div>

                        <div className="checkbox-row-group">
                            <label className="checkbox-pill">
                                <input
                                    type="checkbox"
                                    name="remote"
                                    checked={formData.remote}
                                    onChange={handleChange}
                                />
                                <span>100% Remote Available</span>
                            </label>

                            <label className="checkbox-pill">
                                <input
                                    type="checkbox"
                                    name="hybrid"
                                    checked={formData.hybrid}
                                    onChange={handleChange}
                                />
                                <span>Hybrid Working Option</span>
                            </label>
                        </div>
                    </div>

                    {/* Section 3: Compensation & Schedule */}
                    <div className="form-section">
                        <h3 className="section-heading"><FiDollarSign className="sec-icon" /> Compensation & Schedule</h3>

                        <div className="form-grid-3">
                            <div className="form-group">
                                <label>Salary Display Text <span className="req">*</span></label>
                                <input
                                    type="text"
                                    name="salary"
                                    placeholder="e.g. ₹6 - ₹10 LPA"
                                    value={formData.salary}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Min Salary (LPA)</label>
                                <input
                                    type="number"
                                    name="salaryMinLpa"
                                    value={formData.salaryMinLpa}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Max Salary (LPA)</label>
                                <input
                                    type="number"
                                    name="salaryMaxLpa"
                                    value={formData.salaryMaxLpa}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-grid-3">
                            <div className="form-group">
                                <label>Education Requirement</label>
                                <select name="education" value={formData.education} onChange={handleChange}>
                                    <option value="High School">High School</option>
                                    <option value="Diploma">Diploma</option>
                                    <option value="Bachelor's">Bachelor's Degree</option>
                                    <option value="Master's">Master's Degree</option>
                                    <option value="PhD">PhD</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Working Hours</label>
                                <input
                                    type="text"
                                    name="workingHours"
                                    placeholder="e.g. 9:00 AM - 6:00 PM IST"
                                    value={formData.workingHours}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Number of Vacancies</label>
                                <input
                                    type="number"
                                    name="vacancies"
                                    min="1"
                                    value={formData.vacancies}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Application Deadline</label>
                            <input
                                type="date"
                                name="applicationDeadline"
                                value={formData.applicationDeadline}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Section 4: Detailed Descriptions & Skills */}
                    <div className="form-section">
                        <h3 className="section-heading"><FiClock className="sec-icon" /> Job Details & Requirements</h3>

                        <div className="form-group">
                            <label>Job Description <span className="req">*</span></label>
                            <textarea
                                name="description"
                                rows="5"
                                placeholder="Describe the role, team environment, and core mission..."
                                value={formData.description}
                                onChange={handleChange}
                                required
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label>Key Responsibilities (Comma-separated or bullet points)</label>
                            <textarea
                                name="responsibilities"
                                rows="3"
                                placeholder="Architect scalable UIs, Collaborate with design team, Optimize performance"
                                value={formData.responsibilities}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label>Requirements & Qualifications (Comma-separated)</label>
                            <textarea
                                name="requirements"
                                rows="3"
                                placeholder="3+ years React experience, TypeScript proficiency, Strong CSS skills"
                                value={formData.requirements}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label>Required Skills (Comma-separated)</label>
                            <input
                                type="text"
                                name="skills"
                                placeholder="React, TypeScript, CSS, Vite, REST API"
                                value={formData.skills}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Benefits & Perks (Comma-separated)</label>
                            <input
                                type="text"
                                name="benefits"
                                placeholder="Health Insurance, Flexible Hours, Learning Stipend, Maternity Leave"
                                value={formData.benefits}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="create-submit-bar">
                        <button type="button" onClick={() => navigate('/jobs')} className="btn-cancel-post">
                            Cancel
                        </button>
                        <button type="submit" className="btn-publish-post" disabled={submitting}>
                            {submitting ? 'Publishing Job Posting...' : 'Publish Job Listing'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
