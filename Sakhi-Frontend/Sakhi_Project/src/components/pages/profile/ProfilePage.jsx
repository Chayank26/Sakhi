import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiCalendar, FiBriefcase, FiBookOpen, FiFileText, FiEdit2, FiCheck } from 'react-icons/fi'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/firebase'
import { HomeHeader } from '../home/HomeHeader'
import './ProfilePage.css'

export function ProfilePage() {
    const [user, setUser] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [savedMsg, setSavedMsg] = useState('')

    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        age: '',
        bio: 'Passionate learner exploring new tech skills, career opportunities, and government welfare programs through Sakhi.',
        preferredDomain: 'Software Development & Data Analytics',
        location: 'Chennai, Tamil Nadu',
        skills: ['React', 'Python', 'Data Analytics', 'Communication', 'Problem Solving']
    })

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
            const local = JSON.parse(localStorage.getItem('sakhi_user_profile') || '{}')
            setProfile((prev) => ({
                ...prev,
                name: currentUser?.displayName || local.name || 'Sakhi User',
                email: currentUser?.email || local.email || 'user@sakhi.org',
                phone: local.phone || '+91 98765 43210',
                age: local.age || '24'
            }))
        })
        return () => unsubscribe()
    }, [])

    const handleSave = (e) => {
        e.preventDefault()
        localStorage.setItem('sakhi_user_profile', JSON.stringify(profile))
        setIsEditing(false)
        setSavedMsg('Profile updated successfully!')
        setTimeout(() => setSavedMsg(''), 3000)
    }

    return (
        <div className="profile-page-shell">
            <HomeHeader pageTitle="My Profile" />

            <main className="profile-container">
                {savedMsg && <div className="profile-toast">{savedMsg}</div>}

                {/* Profile Card Header */}
                <section className="profile-card hero-card">
                    <div className="profile-avatar-wrapper">
                        <div className="profile-avatar">
                            {profile.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div className="profile-hero-info">
                        <h2>{profile.name}</h2>
                        <p className="profile-subtitle">{profile.preferredDomain} • {profile.location}</p>
                        <p className="profile-bio">{profile.bio}</p>
                    </div>
                    <button 
                        className="btn-edit-profile" 
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? <><FiCheck /> Cancel</> : <><FiEdit2 /> Edit Profile</>}
                    </button>
                </section>

                {/* Statistics Summary Row */}
                <section className="profile-stats-grid">
                    <div className="stat-card">
                        <span className="stat-icon"><FiBookOpen /></span>
                        <div>
                            <h3>3</h3>
                            <p>Enrolled Courses</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon"><FiBriefcase /></span>
                        <div>
                            <h3>12</h3>
                            <p>Jobs Saved / Applied</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon"><FiFileText /></span>
                        <div>
                            <h3>4</h3>
                            <p>Schemes Bookmarked</p>
                        </div>
                    </div>
                </section>

                {/* Details & Edit Form */}
                <section className="profile-card details-card">
                    <h3>Personal & Contact Details</h3>

                    {isEditing ? (
                        <form onSubmit={handleSave} className="profile-edit-form">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input 
                                    type="text" 
                                    value={profile.name} 
                                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input 
                                    type="email" 
                                    value={profile.email} 
                                    disabled
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input 
                                    type="text" 
                                    value={profile.phone} 
                                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Age</label>
                                <input 
                                    type="number" 
                                    value={profile.age} 
                                    onChange={(e) => setProfile({...profile, age: e.target.value})}
                                />
                            </div>
                            <div className="form-group full-width">
                                <label>Bio</label>
                                <textarea 
                                    value={profile.bio} 
                                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                                    rows={3}
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn-save-profile">Save Changes</button>
                            </div>
                        </form>
                    ) : (
                        <div className="details-grid">
                            <div className="detail-item">
                                <span className="detail-icon"><FiUser /></span>
                                <div>
                                    <label>Full Name</label>
                                    <p>{profile.name}</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <span className="detail-icon"><FiMail /></span>
                                <div>
                                    <label>Email Address</label>
                                    <p>{profile.email}</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <span className="detail-icon"><FiPhone /></span>
                                <div>
                                    <label>Phone Number</label>
                                    <p>{profile.phone}</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <span className="detail-icon"><FiCalendar /></span>
                                <div>
                                    <label>Age</label>
                                    <p>{profile.age} years old</p>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* Skills Tag Section */}
                <section className="profile-card skills-card">
                    <h3>Key Skills & Interests</h3>
                    <div className="skills-tags">
                        {profile.skills.map((skill) => (
                            <span key={skill} className="skill-pill">{skill}</span>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    )
}
