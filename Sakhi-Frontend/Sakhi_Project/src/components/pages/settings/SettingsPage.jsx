import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiSliders, FiBell, FiShield, FiGlobe, FiMoon, FiCheck } from 'react-icons/fi'
import { HomeHeader } from '../home/HomeHeader'
import './SettingsPage.css'

export function SettingsPage() {
    const [savedMsg, setSavedMsg] = useState('')

    const [settings, setSettings] = useState({
        emailNotifications: true,
        jobAlerts: true,
        communityUpdates: true,
        schemeAlerts: true,
        language: 'English',
        theme: 'Dark Amethyst',
        twoFactorAuth: false
    })

    const handleToggle = (key) => {
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
    }

    const handleSave = () => {
        setSavedMsg('Preferences saved successfully!')
        setTimeout(() => setSavedMsg(''), 3000)
    }

    return (
        <div className="settings-page-shell">
            <HomeHeader pageTitle="Settings" />

            <main className="settings-container">
                {savedMsg && <div className="settings-toast">{savedMsg}</div>}

                {/* Notifications Preferences */}
                <section className="settings-card">
                    <div className="settings-card-header">
                        <span className="card-icon"><FiBell /></span>
                        <div>
                            <h2>Notification Preferences</h2>
                            <p>Manage how and when Sakhi alerts you about opportunities.</p>
                        </div>
                    </div>

                    <div className="setting-toggle-list">
                        <div className="toggle-item">
                            <div>
                                <h3>Job & Career Recommendations</h3>
                                <p>Receive alerts when new verified jobs match your skills.</p>
                            </div>
                            <label className="switch">
                                <input type="checkbox" checked={settings.jobAlerts} onChange={() => handleToggle('jobAlerts')} />
                                <span className="slider round"></span>
                            </label>
                        </div>

                        <div className="toggle-item">
                            <div>
                                <h3>Government Scheme Updates</h3>
                                <p>Get notified when grants or maternity benefits update their deadlines.</p>
                            </div>
                            <label className="switch">
                                <input type="checkbox" checked={settings.schemeAlerts} onChange={() => handleToggle('schemeAlerts')} />
                                <span className="slider round"></span>
                            </label>
                        </div>

                        <div className="toggle-item">
                            <div>
                                <h3>Community & Peer Mentorship Activity</h3>
                                <p>Alerts for replies, upvotes, and emergency helpline updates.</p>
                            </div>
                            <label className="switch">
                                <input type="checkbox" checked={settings.communityUpdates} onChange={() => handleToggle('communityUpdates')} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Language & Regional Settings */}
                <section className="settings-card">
                    <div className="settings-card-header">
                        <span className="card-icon"><FiGlobe /></span>
                        <div>
                            <h2>Language & Region</h2>
                            <p>Choose your primary interaction language for Sakhi AI & platform UI.</p>
                        </div>
                    </div>

                    <div className="setting-select-group">
                        <label>Preferred Language</label>
                        <select 
                            value={settings.language} 
                            onChange={(e) => setSettings({...settings, language: e.target.value})}
                        >
                            <option value="English">English</option>
                            <option value="Hindi">हिंदी (Hindi)</option>
                            <option value="Tamil">தமிழ் (Tamil)</option>
                            <option value="Telugu">తెలుగు (Telugu)</option>
                            <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                        </select>
                    </div>
                </section>

                {/* Security & Account Protection */}
                <section className="settings-card">
                    <div className="settings-card-header">
                        <span className="card-icon"><FiShield /></span>
                        <div>
                            <h2>Security & Privacy</h2>
                            <p>Keep your account and personal data safe.</p>
                        </div>
                    </div>

                    <div className="toggle-item">
                        <div>
                            <h3>Two-Factor Authentication (2FA)</h3>
                            <p>Add an extra layer of security using SMS OTP authentication.</p>
                        </div>
                        <label className="switch">
                            <input type="checkbox" checked={settings.twoFactorAuth} onChange={() => handleToggle('twoFactorAuth')} />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </section>

                <div className="settings-actions">
                    <button className="btn-save-settings" onClick={handleSave}>
                        <FiCheck /> Save Settings
                    </button>
                </div>
            </main>
        </div>
    )
}
