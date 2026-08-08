import { useState } from 'react';
import { FiX, FiCheckCircle, FiAlertCircle, FiBookOpen, FiUser, FiMail, FiPhone } from 'react-icons/fi';
import { enrollInCourse } from '../../../services/courseApi';

export function EnrollCourseModal({ course, onClose, onSuccess }) {
    const [studentName, setStudentName] = useState('');
    const [studentEmail, setStudentEmail] = useState('');
    const [phone, setPhone] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!studentName.trim() || !studentEmail.trim() || !phone.trim()) {
            setError('Please fill in all mandatory details (Name, Email, Phone).');
            return;
        }

        setSubmitting(true);

        try {
            const payload = {
                studentName: studentName.trim(),
                studentEmail: studentEmail.trim(),
                phone: phone.trim(),
            };

            const result = await enrollInCourse(course._id, payload);

            if (result && result.success) {
                // Save enrolled course ID in localStorage
                const enrolledList = JSON.parse(localStorage.getItem('sakhi_enrolled_courses') || '[]');
                if (!enrolledList.includes(course._id)) {
                    enrolledList.push(course._id);
                    localStorage.setItem('sakhi_enrolled_courses', JSON.stringify(enrolledList));
                }

                setSuccessMessage(`Welcome aboard! You are enrolled in "${course.title}". Check your inbox for confirmation.`);
                if (onSuccess) onSuccess(course._id);
                setTimeout(() => {
                    onClose();
                }, 2200);
            } else {
                setError(result.message || 'Enrollment failed. Please try again.');
            }
        } catch (err) {
            console.error('Enrollment error:', err);
            setError(err.response?.data?.message || 'Failed to complete enrollment. Please check your connection.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="modal-header">
                    <div>
                        <h3 className="modal-title">Enroll in Course</h3>
                        <p className="modal-subtitle">{course.title} by <strong>{course.instructor}</strong></p>
                    </div>
                    <button className="btn-close-modal" onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="modal-body">
                    {successMessage ? (
                        <div className="apply-success-state">
                            <FiCheckCircle className="success-icon" />
                            <h4>Enrollment Successful! 🎉</h4>
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
                                    value={studentName}
                                    onChange={(e) => setStudentName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email Address <span className="req">*</span></label>
                                    <input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={studentEmail}
                                        onChange={(e) => setStudentEmail(e.target.value)}
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

                            <div className="form-section-summary">
                                <p><strong>Price:</strong> {course.price === 0 ? 'FREE' : `₹${course.price}`}</p>
                                <p><strong>Duration:</strong> {course.duration}</p>
                                <p><strong>Access:</strong> Full Lifetime Access + Certificate</p>
                            </div>

                            {/* Submit Footer */}
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={onClose} disabled={submitting}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit-app" disabled={submitting}>
                                    {submitting ? 'Enrolling...' : 'Confirm Enrollment'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
