import api from '../../../services/api';
import { useAccount } from '../../account/accountContext';
import { getAiProfile, saveAiProfile } from '../../../services/aiApi';
import { readLocalProfile, saveLocalProfile } from '../../../services/profileStorage';
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiCalendar, FiBriefcase, FiBookOpen, FiFileText, FiEdit2, FiCheck } from 'react-icons/fi'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/firebase'
import { HomeHeader } from '../home/HomeHeader'
import './ProfilePage.css'

export function ProfilePage() {
    const { data: activity, refresh } = useAccount()
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [savedMsg, setSavedMsg] = useState('')

    const emptyProfile = { name: '', email: '', phone: '', age: '', bio: '', preferredDomain: '', location: '', skills: [], interests: [], jobType: '', level: '' };
    const [profile, setProfile] = useState(emptyProfile)
    const [preferencesReady, setPreferencesReady] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [reload, setReload] = useState(0)
    const accountVersion = useRef(0)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            const version = ++accountVersion.current
            setUser(currentUser)
            setPreferencesReady(false)
            setIsEditing(false)
            const local = readLocalProfile(currentUser)
            setProfile({ name: currentUser?.displayName || local.name || '', email: currentUser?.email || '',
                phone: local.phone || '', age: local.age || '', bio: local.bio || '', preferredDomain: '', location: '',
                skills: [], interests: [], jobType: '', level: '' })
            if (!currentUser) return
            try {
                const [{ profile: preferences }, { data: account }] = await Promise.all([getAiProfile(), api.get('/me')])
                if (version !== accountVersion.current) return
                setProfile((previous) => ({ ...previous, ...account.profile, preferredDomain: preferences.goal, location: preferences.city,
                    skills: preferences.skills, interests: preferences.interests, jobType: preferences.jobType, level: preferences.level }))
                setPreferencesReady(true)
                setSavedMsg('')
            } catch {
                if (version === accountVersion.current) setSavedMsg('Could not load your AI preferences. Please retry before editing.')
            }
        })
        return () => { accountVersion.current += 1; unsubscribe() }
    }, [reload])

    const handleSave = async (e) => {
        e.preventDefault()
        if (!user || !preferencesReady || isSaving) return
        const version = accountVersion.current
        setIsSaving(true)
        try {
            const { profile: savedPreferences } = await saveAiProfile({ city: profile.location, goal: profile.preferredDomain, skills: profile.skills,
                interests: profile.interests, jobType: profile.jobType, level: profile.level })
            if (version !== accountVersion.current) return
            const savedProfile = { ...profile, skills: savedPreferences.skills, interests: savedPreferences.interests }
            setProfile(savedProfile)
            await api.put('/me/profile', { name: profile.name, phone: profile.phone, age: String(profile.age), bio: profile.bio })
            if (version !== accountVersion.current) return
            saveLocalProfile(user, savedProfile)
            await refresh()
            setIsEditing(false)
            setSavedMsg('Profile saved. Sakhi AI will use these preferences in your next message.')
        } catch {
            if (version === accountVersion.current) setSavedMsg('Could not finish saving your profile. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="profile-page-shell">
            <HomeHeader pageTitle="My Profile" />

            {/* Top Navigation Bar (Aligned with Navbar Sakhi Logo) */}
            <div className="details-top-nav-bar">
                <button onClick={() => navigate('/home')} className="btn-back-link-sleek">
                    <FiArrowLeft /> Back to Dashboard
                </button>
            </div>

            <main className="profile-container">
                {savedMsg && <div className="profile-toast" role="status">{savedMsg}</div>}
                {user && !preferencesReady && <button className="sakhi-btn sakhi-btn-secondary" type="button" onClick={() => setReload((value) => value + 1)}>Reload preferences</button>}

                {/* Profile Card Header */}
                <section className="profile-card hero-card">
                    <div className="profile-avatar-wrapper">
                        <div className="profile-avatar">
                            {profile.name.charAt(0).toUpperCase() || 'S'}
                        </div>
                    </div>
                    <div className="profile-hero-info">
                        <h2>{profile.name}</h2>
                        <p className="profile-subtitle">{profile.preferredDomain} • {profile.location}</p>
                        <p className="profile-bio">{profile.bio}</p>
                    </div>
                    <button 
                        className="btn-edit-profile" 
                        disabled={!preferencesReady || isSaving}
                        onClick={() => { if (isEditing) setReload((value) => value + 1); setIsEditing(!isEditing) }}
                    >
                        {isEditing ? <><FiCheck /> Cancel</> : <><FiEdit2 /> Edit Profile</>}
                    </button>
                </section>

                {/* Statistics Summary Row */}
                <section className="profile-stats-grid">
                    <div className="stat-card">
                        <span className="stat-icon"><FiBookOpen /></span>
                        <div>
                            <h3>{activity.enrollments.length}</h3>
                            <p>Enrolled Courses</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon"><FiBriefcase /></span>
                        <div>
                            <h3>{activity.applications.length}</h3>
                            <p>Jobs Saved / Applied</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon"><FiFileText /></span>
                        <div>
                            <h3>{activity.saved.schemes.length}</h3>
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
                            <p>Your saved skills, interests, location and goal help personalize Sakhi AI recommendations.</p>
                            <div className="form-group"><label htmlFor="profile-location">Preferred city</label>
                                <input id="profile-location" value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} maxLength={160} /></div>
                            <div className="form-group"><label htmlFor="profile-goal">Career goal</label>
                                <input id="profile-goal" value={profile.preferredDomain} onChange={(e) => setProfile({ ...profile, preferredDomain: e.target.value })} maxLength={160} /></div>
                            <div className="form-group"><label htmlFor="profile-skills">Skills (comma-separated)</label>
                                <input id="profile-skills" value={profile.skills.join(',')} onChange={(e) => setProfile({ ...profile, skills: e.target.value.split(',') })} /></div>
                            <div className="form-group"><label htmlFor="profile-interests">Interests (comma-separated)</label>
                                <input id="profile-interests" value={profile.interests.join(',')} onChange={(e) => setProfile({ ...profile, interests: e.target.value.split(',') })} /></div>
                            <div className="form-group"><label htmlFor="profile-work">Work preference</label>
                                <select id="profile-work" value={profile.jobType} onChange={(e) => setProfile({ ...profile, jobType: e.target.value })}>
                                    {['', 'Full Time', 'Part Time', 'Internship', 'Contract', 'Remote', 'Hybrid'].map((value) => <option key={value} value={value}>{value || 'Any'}</option>)}
                                </select></div>
                            <div className="form-group"><label htmlFor="profile-level">Learning level</label>
                                <select id="profile-level" value={profile.level} onChange={(e) => setProfile({ ...profile, level: e.target.value })}>
                                    {['', 'Beginner', 'Intermediate', 'Advanced'].map((value) => <option key={value} value={value}>{value || 'Any'}</option>)}
                                </select></div>
                            <div className="form-actions">
                                <button type="submit" className="btn-save-profile" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save Changes'}</button>
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
