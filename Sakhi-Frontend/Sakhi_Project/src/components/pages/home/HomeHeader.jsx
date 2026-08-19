import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FiBell, FiUser, FiBriefcase, FiBookOpen, FiFileText, FiMessageSquare, FiCheck } from 'react-icons/fi'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../firebase/firebase'

function formatTodayLabel() {
    return new Intl.DateTimeFormat('en', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(new Date())
}

const INITIAL_NOTIFS = [
    {
        id: '1',
        icon: <FiBriefcase />,
        title: 'New Job Match',
        desc: 'Senior Frontend Developer opening posted in Chennai matching your skills.',
        time: '10m ago',
        unread: true,
        to: '/jobs'
    },
    {
        id: '2',
        icon: <FiBookOpen />,
        title: 'Course Milestone',
        desc: 'You completed 60% of Data Analytics & Python Essentials.',
        time: '1h ago',
        unread: true,
        to: '/academy/my-learning'
    },
    {
        id: '3',
        icon: <FiFileText />,
        title: 'Scheme Benefit Update',
        desc: 'Pradhan Mantri Matru Vandana Yojana updated application guidelines.',
        time: '3h ago',
        unread: true,
        to: '/schemes'
    },
    {
        id: '4',
        icon: <FiMessageSquare />,
        title: 'Community Reply',
        desc: 'Priya replied to your discussion thread in Web Developers Hub.',
        time: '1d ago',
        unread: false,
        to: '/home/community'
    }
]

export function HomeHeader({ pageTitle = null }) {
    const navigate = useNavigate()
    const location = useLocation()
    const headerRef = useRef(null)
    const [user, setUser] = useState(null)
    const [menuOpen, setMenuOpen] = useState(false)
    const [notifOpen, setNotifOpen] = useState(false)
    const [notifications, setNotifications] = useState(INITIAL_NOTIFS)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (headerRef.current && !headerRef.current.contains(event.target)) {
                setMenuOpen(false)
                setNotifOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
        })

        return () => unsubscribe()
    }, [])

    const unreadCount = notifications.filter((n) => n.unread).length

    const handleMarkAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
    }

    const localProfile = JSON.parse(localStorage.getItem('sakhi_user_profile') || '{}')
    const displayName = user?.displayName?.trim() || localProfile?.name || user?.email?.split('@')[0] || 'there'
    const todayLabel = formatTodayLabel()

    const isHomePage = location.pathname === '/home'

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
        <header ref={headerRef} className="home-header">
            <div className="home-header-left">
                <Link className="home-brand" to="/home">
                    Sakhi {pageTitle && <span className="header-page-title">• {pageTitle}</span>}
                </Link>
            </div>

            <div className="home-header-center">
                {isHomePage ? (
                    <>
                        <p className="home-greeting">Welcome back, {displayName}</p>
                        <p className="home-date">{todayLabel}</p>
                    </>
                ) : (
                    <nav className="header-nav-pills">
                        <Link 
                            to="/jobs" 
                            className={`nav-pill ${location.pathname.startsWith('/jobs') ? 'active' : ''}`}
                        >
                            Careers
                        </Link>
                        <Link 
                            to="/academy" 
                            className={`nav-pill ${location.pathname.startsWith('/academy') ? 'active' : ''}`}
                        >
                            Academy
                        </Link>
                        <Link 
                            to="/schemes" 
                            className={`nav-pill ${location.pathname.startsWith('/schemes') || location.pathname.startsWith('/saved-schemes') ? 'active' : ''}`}
                        >
                            Schemes
                        </Link>
                        <Link 
                            to="/community" 
                            className={`nav-pill ${location.pathname.startsWith('/community') ? 'active' : ''}`}
                        >
                            Community
                        </Link>
                        <Link 
                            to="/ai" 
                            className={`nav-pill ${location.pathname.startsWith('/ai') ? 'active' : ''}`}
                        >
                            Sakhi AI
                        </Link>
                    </nav>
                )}
            </div>

            <div className="home-header-actions">
                {/* Notifications Bell Dropdown */}
                <div className="profile-menu-wrapper">
                    <button 
                        className={`header-icon-btn ${notifOpen ? 'active' : ''}`} 
                        type="button" 
                        aria-label="Notifications"
                        onClick={() => {
                            setNotifOpen((open) => !open)
                            setMenuOpen(false)
                        }}
                    >
                        <FiBell />
                        {unreadCount > 0 && <span className="notif-badge-dot">{unreadCount}</span>}
                    </button>

                    {notifOpen && (
                        <div className="notif-dropdown">
                            <div className="notif-dropdown-header">
                                <h3>Notifications</h3>
                                {unreadCount > 0 && (
                                    <button type="button" className="btn-mark-read" onClick={handleMarkAllRead}>
                                        <FiCheck /> Mark all as read
                                    </button>
                                )}
                            </div>
                            <div className="notif-list">
                                {notifications.map((n) => (
                                    <Link 
                                        key={n.id} 
                                        to={n.to} 
                                        className={`notif-item ${n.unread ? 'unread' : ''}`}
                                        onClick={() => setNotifOpen(false)}
                                    >
                                        <span className="notif-icon">{n.icon}</span>
                                        <div className="notif-content">
                                            <h4>{n.title}</h4>
                                            <p>{n.desc}</p>
                                            <span className="notif-time">{n.time}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Account Menu Dropdown */}
                <div className="profile-menu-wrapper">
                    <button
                        className={`header-icon-btn profile-trigger ${menuOpen ? 'active' : ''}`}
                        type="button"
                        aria-label="Open profile menu"
                        onClick={() => {
                            setMenuOpen((open) => !open)
                            setNotifOpen(false)
                        }}
                    >
                        <FiUser />
                    </button>

                    {menuOpen ? (
                        <div className="profile-dropdown">
                            <button type="button" onClick={() => { setMenuOpen(false); navigate('/profile'); }}>
                                My Profile
                            </button>
                            <button type="button" onClick={() => { setMenuOpen(false); navigate('/settings'); }}>
                                Settings
                            </button>
                            <button type="button" onClick={() => { setMenuOpen(false); navigate('/support'); }}>
                                Help & Support
                            </button>
                            <button type="button" onClick={handleLogout} className="logout-btn">
                                Logout
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>
        </header>
    )
}
