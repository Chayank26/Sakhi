import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    FiArrowLeft,
    FiBookOpen,
    FiUser,
    FiDollarSign,
    FiClock,
    FiPlusCircle,
    FiCheck,
    FiAlertCircle,
    FiAward,
    FiGlobe,
    FiPlus,
    FiTrash2
} from 'react-icons/fi';
import { createCourse } from '../../../services/courseApi';
import './CreateCoursePage.css';

export function CreateCoursePage() {
    const navigate = useNavigate();

    const [useRegisteredEmail, setUseRegisteredEmail] = useState(false);
    const [isFreeCourse, setIsFreeCourse] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        instructor: '',
        organization: 'Sakhi Academy',
        instructorEmail: '',
        category: 'Web Development',
        description: '',
        learningOutcomes: '',
        prerequisites: '',
        resources: '',
        duration: '4 Hours',
        difficulty: 'Beginner',
        language: 'English',
        price: 0,
        thumbnail: '',
        banner: '',
        certificateAvailable: true,
        visibility: 'Public',
    });

    const [curriculumModules, setCurriculumModules] = useState([
        { moduleTitle: 'Module 1: Introduction', lessons: ['Lesson 1: Overview', 'Lesson 2: Setup & Environment'] },
    ]);

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
            setFormData((prev) => ({ ...prev, instructorEmail: 'user@sakhi.org' }));
        } else {
            setFormData((prev) => ({ ...prev, instructorEmail: '' }));
        }
    };

    const handleFreeToggle = (e) => {
        const checked = e.target.checked;
        setIsFreeCourse(checked);
        if (checked) {
            setFormData((prev) => ({ ...prev, price: 0 }));
        }
    };

    const handleAddModule = () => {
        setCurriculumModules([
            ...curriculumModules,
            { moduleTitle: `Module ${curriculumModules.length + 1}: New Topic`, lessons: ['Lesson 1: Fundamentals'] },
        ]);
    };

    const handleRemoveModule = (idx) => {
        setCurriculumModules(curriculumModules.filter((_, i) => i !== idx));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (
            !formData.title ||
            !formData.instructor ||
            !formData.instructorEmail ||
            !formData.category ||
            !formData.description
        ) {
            setError('Please fill in all mandatory fields (Course Title, Instructor Name, Email, Category, Description).');
            return;
        }

        setSubmitting(true);

        try {
            const coursePayload = {
                title: formData.title,
                instructor: formData.instructor,
                organization: formData.organization || 'Sakhi Academy',
                instructorEmail: formData.instructorEmail,
                category: formData.category,
                description: formData.description,
                learningOutcomes: formData.learningOutcomes,
                prerequisites: formData.prerequisites,
                curriculum: curriculumModules,
                resources: formData.resources,
                duration: formData.duration || '4 Hours',
                difficulty: formData.difficulty,
                language: formData.language,
                price: isFreeCourse ? 0 : Number(formData.price),
                thumbnail: formData.thumbnail,
                banner: formData.banner,
                certificateAvailable: formData.certificateAvailable,
                visibility: formData.visibility,
            };

            const response = await createCourse(coursePayload);

            if (response && response.success) {
                setSuccessMessage('Course published successfully!');
                setTimeout(() => {
                    navigate('/academy');
                }, 1500);
            } else {
                setError(response.message || 'Failed to publish course.');
            }
        } catch (err) {
            console.error('Error creating course:', err);
            setError(err.response?.data?.message || 'Error publishing course. Please check your connection.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="create-course-wrapper">
            {/* Header */}
            <header className="create-course-nav">
                <div className="create-nav-container">
                    <button onClick={() => navigate('/academy')} className="btn-back-link">
                        <FiArrowLeft /> Back to Sakhi Academy
                    </button>
                    <Link to="/home" className="brand-logo-text">🎓 Sakhi Academy</Link>
                </div>
            </header>

            {/* Page Hero */}
            <div className="create-course-hero">
                <div className="create-hero-content">
                    <h1>Publish a New Course</h1>
                    <p>Share your knowledge, teach valuable skills, and empower learners across the community.</p>
                </div>
            </div>

            {/* Main Form Container */}
            <main className="create-course-main">
                <form onSubmit={handleSubmit} className="create-course-form">
                    {error && (
                        <div className="create-error-alert">
                            <FiAlertCircle /> {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="create-success-alert">
                            <FiCheck /> {successMessage} Redirecting to academy portal...
                        </div>
                    )}

                    {/* Section 1: Instructor Details */}
                    <div className="form-section">
                        <h3 className="section-heading"><FiUser className="sec-icon" /> Instructor & Organization Details</h3>

                        <div className="form-grid-2">
                            <div className="form-group">
                                <label>Instructor Name <span className="req">*</span></label>
                                <input
                                    type="text"
                                    name="instructor"
                                    placeholder="e.g. Priya Sharma"
                                    value={formData.instructor}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Organization Name</label>
                                <input
                                    type="text"
                                    name="organization"
                                    placeholder="e.g. Sakhi Tech Institute"
                                    value={formData.organization}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Instructor Email <span className="req">*</span></label>
                            <input
                                type="email"
                                name="instructorEmail"
                                placeholder="instructor@sakhi.org"
                                value={formData.instructorEmail}
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

                    {/* Section 2: Course Information */}
                    <div className="form-section">
                        <h3 className="section-heading"><FiBookOpen className="sec-icon" /> Course Information</h3>

                        <div className="form-group">
                            <label>Course Title <span className="req">*</span></label>
                            <input
                                type="text"
                                name="title"
                                placeholder="e.g. React Fundamentals & Modern Web Apps"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-grid-3">
                            <div className="form-group">
                                <label>Category <span className="req">*</span></label>
                                <select name="category" value={formData.category} onChange={handleChange}>
                                    <option value="Programming">Programming</option>
                                    <option value="Web Development">Web Development</option>
                                    <option value="AI & Machine Learning">AI & Machine Learning</option>
                                    <option value="Data Science">Data Science</option>
                                    <option value="Cybersecurity">Cybersecurity</option>
                                    <option value="UI/UX">UI/UX Design</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Entrepreneurship">Entrepreneurship</option>
                                    <option value="Communication">Communication</option>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="Government Exam Preparation">Government Exam Prep</option>
                                    <option value="Personal Development">Personal Development</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Difficulty Level <span className="req">*</span></label>
                                <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Language <span className="req">*</span></label>
                                <select name="language" value={formData.language} onChange={handleChange}>
                                    <option value="English">English</option>
                                    <option value="Hindi">Hindi</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-grid-2">
                            <div className="form-group">
                                <label>Estimated Duration <span className="req">*</span></label>
                                <input
                                    type="text"
                                    name="duration"
                                    placeholder="e.g. 6 Hours"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Pricing (₹) <span className="req">*</span></label>
                                <input
                                    type="number"
                                    name="price"
                                    placeholder="0 for Free"
                                    value={formData.price}
                                    onChange={handleChange}
                                    disabled={isFreeCourse}
                                />
                                <label className="checkbox-sub-label">
                                    <input
                                        type="checkbox"
                                        checked={isFreeCourse}
                                        onChange={handleFreeToggle}
                                    />
                                    <span>Make this course FREE (₹0)</span>
                                </label>
                            </div>
                        </div>

                        <div className="form-grid-2">
                            <div className="form-group">
                                <label>Thumbnail Image URL (Optional)</label>
                                <input
                                    type="url"
                                    name="thumbnail"
                                    placeholder="https://images.unsplash.com/photo-..."
                                    value={formData.thumbnail}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Header Banner URL (Optional)</label>
                                <input
                                    type="url"
                                    name="banner"
                                    placeholder="https://images.unsplash.com/photo-..."
                                    value={formData.banner}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Description & Outcomes */}
                    <div className="form-section">
                        <h3 className="section-heading"><FiClock className="sec-icon" /> Course Description & Outcomes</h3>

                        <div className="form-group">
                            <label>Course Description <span className="req">*</span></label>
                            <textarea
                                name="description"
                                rows="5"
                                placeholder="Describe what learners will gain from this course..."
                                value={formData.description}
                                onChange={handleChange}
                                required
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label>Learning Outcomes (Comma-separated)</label>
                            <textarea
                                name="learningOutcomes"
                                rows="3"
                                placeholder="Build real React apps, Master Hooks, Handle state management"
                                value={formData.learningOutcomes}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label>Prerequisites (Comma-separated)</label>
                            <input
                                type="text"
                                name="prerequisites"
                                placeholder="Basic HTML/CSS, ES6 JavaScript fundamentals"
                                value={formData.prerequisites}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Downloadable Resources (Comma-separated)</label>
                            <input
                                type="text"
                                name="resources"
                                placeholder="React Cheat Sheet PDF, Starter Code Repository"
                                value={formData.resources}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Section 4: Dynamic Curriculum Builder */}
                    <div className="form-section">
                        <div className="curriculum-builder-header">
                            <h3 className="section-heading"><FiAward className="sec-icon" /> Curriculum Modules</h3>
                            <button type="button" onClick={handleAddModule} className="btn-add-module">
                                <FiPlus /> Add Module
                            </button>
                        </div>

                        <div className="builder-modules-list">
                            {curriculumModules.map((mod, idx) => (
                                <div key={idx} className="builder-module-card">
                                    <div className="module-input-row">
                                        <input
                                            type="text"
                                            value={mod.moduleTitle}
                                            onChange={(e) => {
                                                const updated = [...curriculumModules];
                                                updated[idx].moduleTitle = e.target.value;
                                                setCurriculumModules(updated);
                                            }}
                                            placeholder="Module Title (e.g. Module 1: Basics)"
                                        />
                                        {curriculumModules.length > 1 && (
                                            <button
                                                type="button"
                                                className="btn-delete-module"
                                                onClick={() => handleRemoveModule(idx)}
                                            >
                                                <FiTrash2 />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="create-submit-bar">
                        <button type="button" onClick={() => navigate('/academy')} className="btn-cancel-post">
                            Cancel
                        </button>
                        <button type="submit" className="btn-publish-post" disabled={submitting}>
                            {submitting ? 'Publishing Course...' : 'Publish Course'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
