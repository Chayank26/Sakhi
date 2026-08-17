import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiBell, FiUser } from 'react-icons/fi'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/firebase'

function formatTodayLabel() {
    return new Intl.DateTimeFormat('en', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(new Date())
}

export function HomeHeader() {
    const [user, setUser] = useState(null)
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
        })

        return () => unsubscribe()
    }, [])

    const displayName = user?.displayName?.trim() || user?.email?.split('@')[0] || 'there'
    const todayLabel = formatTodayLabel()

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
                            <button type="button">Logout</button>
                        </div>
                    ) : null}
                </div>
            </div>
        </header>
    )
}
