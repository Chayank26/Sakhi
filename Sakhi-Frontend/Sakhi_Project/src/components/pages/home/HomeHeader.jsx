import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiBell, FiUser } from 'react-icons/fi'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../firebase/firebase'

function formatTodayLabel() {
    return new Intl.DateTimeFormat('en', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(new Date())
}

export function HomeHeader() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
        })

        return () => unsubscribe()
    }, [])

    const localProfile = JSON.parse(localStorage.getItem('sakhi_user_profile') || '{}')
    const displayName = user?.displayName?.trim() || localProfile?.name || user?.email?.split('@')[0] || 'there'
    const todayLabel = formatTodayLabel()

    const handleLogout = async () => {
        try {
            await signOut(auth)
            localStorage.removeItem('sakhi_user_profile')
            navigate('/', { replace: true })
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }

    return (
        <header className="home-header">
            <div className="home-header-left">
                <Link className="home-brand" to="/home">
                    Sakhi
                </Link>
            </div>

            <div className="home-header-center">
                <p className="home-greeting">Welcome back, {displayName}</p>
                <p className="home-date">{todayLabel}</p>
            </div>

            <div className="home-header-actions">
                <button className="header-icon-btn" type="button" aria-label="Notifications">
                    <FiBell />
                </button>

                <div className="profile-menu-wrapper">
                    <button
                        className="header-icon-btn profile-trigger"
                        type="button"
                        aria-label="Open profile menu"
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        <FiUser />
                    </button>

                    {menuOpen ? (
                        <div className="profile-dropdown">
                            <button type="button">My Profile</button>
                            <button type="button">Settings</button>
                            <button type="button">Help & Support</button>
                            <button type="button" onClick={handleLogout} className="logout-btn">Logout</button>
                        </div>
                    ) : null}
                </div>
            </div>
        </header>
    )
}
