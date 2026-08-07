import { useState } from 'react';
import { FiX, FiUploadCloud, FiCheckCircle, FiAlertCircle, FiFileText } from 'react-icons/fi';
import { applyForJob } from '../../../services/api';

export function ApplyJobModal({ job, onClose, onSuccess }) {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [coverLetter, setCoverLetter] = useState('');
    const [resumeFile, setResumeFile] = useState(null);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedExtensions = ['pdf', 'doc', 'docx'];
        const ext = file.name.split('.').pop().toLowerCase();

        if (!allowedExtensions.includes(ext)) {
            setError('Please upload a valid PDF, DOC, or DOCX document.');
            setResumeFile(null);
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('File size exceeds 5MB limit. Please upload a smaller resume.');
            setResumeFile(null);
            return;
        }

        setError('');
        setResumeFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!fullName.trim() || !email.trim() || !phone.trim()) {
            setError('Please fill in all mandatory contact details (Name, Email, Phone).');
            return;
        }

        if (!resumeFile) {
            setError('Resume upload (PDF/DOC/DOCX) is required to apply!');
            return;
        }

        setSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('applicantName', fullName);
            formData.append('applicantEmail', email);
            formData.append('applicantPhone', phone);
            formData.append('coverLetter', coverLetter);
            formData.append('resume', resumeFile);

            const result = await applyForJob(job._id, formData);

            if (result && result.success) {
                // Persist applied status in localStorage
                const appliedList = JSON.parse(localStorage.getItem('sakhi_applied_jobs') || '[]');
                if (!appliedList.includes(job._id)) {
                    appliedList.push(job._id);
                    localStorage.setItem('sakhi_applied_jobs', JSON.stringify(appliedList));
                }

                setSuccessMessage('Application submitted successfully! The hiring manager has been notified.');
                if (onSuccess) onSuccess(job._id);
                setTimeout(() => {
                    onClose();
                }, 2200);
            } else {
                setError(result.message || 'Application failed to submit. Please try again.');
            }
        } catch (err) {
            console.error('Submission error:', err);
            setError(err.response?.data?.message || 'Failed to submit application. Please check your connection.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div>
                        <h3 className="modal-title">Apply for Position</h3>
                        <p className="modal-subtitle">{job.title} at <strong>{job.company}</strong></p>
                    </div>
                    <button className="btn-close-modal" onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                {/* Body */}
                <div className="modal-body">
                    {successMessage ? (
                        <div className="apply-success-state">
                            <FiCheckCircle className="success-icon" />
                            <h4>Application Sent!</h4>
                            <p>{successMessage}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="apply-form">
                            {error && (
                                <div className="modal-error-alert">
                                    <FiAlertCircle /> {error}
                                </div>
                            )}

                            <div className="form-group">
                                <label>Full Name <span className="req">*</span></label>
                                <input
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email Address <span className="req">*</span></label>
                                    <input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Phone Number <span className="req">*</span></label>
                                    <input
                                        type="tel"
                                        placeholder="+91 98765 43210"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* File Upload Box */}
                            <div className="form-group">
                                <label>Upload Resume (PDF, DOC, DOCX - Max 5MB) <span className="req">*</span></label>
                                <div className={`file-upload-dropzone ${resumeFile ? 'has-file' : ''}`}>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                        onChange={handleFileChange}
                                        id="resume-file-input"
                                    />
                                    <label htmlFor="resume-file-input" className="file-dropzone-content">
                                        {resumeFile ? (
                                            <div className="selected-file-info">
                                                <FiFileText className="file-icon" />
                                                <div>
                                                    <p className="file-name">{resumeFile.name}</p>
                                                    <p className="file-size">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                                <span className="btn-change-file">Change File</span>
                                            </div>
                                        ) : (
                                            <>
                                                <FiUploadCloud className="upload-icon" />
                                                <p className="upload-prompt">Click to browse or drop your resume here</p>
                                                <p className="upload-formats">Supported formats: PDF, DOC, DOCX (Max 5MB)</p>
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {/* Cover Letter */}
                            <div className="form-group">
                                <label>Cover Letter / Additional Notes (Optional)</label>
                                <textarea
                                    rows="4"
                                    placeholder="Introduce yourself and explain why you're a great fit for this role..."
                                    value={coverLetter}
                                    onChange={(e) => setCoverLetter(e.target.value)}
                                ></textarea>
                            </div>

                            {/* Submit */}
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={onClose} disabled={submitting}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit-app" disabled={submitting}>
                                    {submitting ? 'Submitting Application...' : 'Submit Application'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
