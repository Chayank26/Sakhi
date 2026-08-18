import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiHelpCircle, FiPhoneCall, FiMessageSquare, FiMail, FiSend, FiChevronDown, FiChevronUp, FiShield } from 'react-icons/fi'
import { HomeHeader } from '../home/HomeHeader'
import './SupportPage.css'

const HELPLINES = [
    { name: 'Women Helpline (National)', number: '181', desc: '24/7 Toll-Free Emergency Helpline for women in distress' },
    { name: 'Cyber Crime Helpline', number: '1930', desc: 'Online harassment, financial fraud, and cyber security support' },
    { name: 'National Commission for Women', number: '7827170170', desc: 'Legal aid, complaints, and crisis counseling' },
]

const FAQS = [
    {
        q: 'How does Sakhi AI generate personalized recommendations?',
        a: 'Sakhi AI analyzes your skill profile, career interests, and location preferences to match you with verified job postings, recommended skill courses, and eligible government welfare schemes.'
    },
    {
        q: 'Are all job postings and government schemes verified on Sakhi?',
        a: 'Yes! Every job opening, internship, and government welfare initiative listed on Sakhi is manually reviewed and cross-referenced with official portals.'
    },
    {
        q: 'Is my personal data safe on Sakhi?',
        a: 'We strictly protect your privacy. Your personal information, contact details, and career data are encrypted and never shared with unauthorized third parties.'
    },
    {
        q: 'How can I apply for financial grants or schemes?',
        a: 'Navigate to the Government Schemes page, select your state/category, click on any scheme to view step-by-step eligibility criteria, and click "Apply via Official Portal".'
    }
]

export function SupportPage() {
    const [openFaq, setOpenFaq] = useState(null)
    const [contactForm, setContactForm] = useState({ subject: '', message: '' })
    const [submitted, setSubmitted] = useState(false)

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (contactForm.message.trim()) {
            setSubmitted(true)
            setContactForm({ subject: '', message: '' })
            setTimeout(() => setSubmitted(false), 4000)
        }
    }

    return (
        <div className="support-page-shell">
            <HomeHeader pageTitle="Help & Support" />

            <main className="support-container">
                {/* Emergency Helplines Card */}
                <section className="support-card emergency-card">
                    <div className="card-header">
                        <span className="card-icon alert-icon"><FiShield /></span>
                        <div>
                            <h2>Emergency & Crisis Helplines</h2>
                            <p>Immediate 24/7 assistance for women safety, legal aid, and cyber protection.</p>
                        </div>
                    </div>

                    <div className="helpline-grid">
                        {HELPLINES.map((h) => (
                            <div key={h.name} className="helpline-item">
                                <div className="helpline-top">
                                    <span className="helpline-name">{h.name}</span>
                                    <a href={`tel:${h.number}`} className="helpline-call-btn">
                                        <FiPhoneCall /> Call {h.number}
                                    </a>
                                </div>
                                <p className="helpline-desc">{h.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Instant Sakhi AI Help Banner */}
                <section className="support-card ai-help-banner">
                    <div className="ai-banner-content">
                        <span className="ai-banner-icon"><FiMessageSquare /></span>
                        <div>
                            <h3>Need Instant Answers?</h3>
                            <p>Ask Sakhi AI for real-time guidance on scheme eligibility, course advice, or technical help.</p>
                        </div>
                    </div>
                    <Link to="/ai?prompt=I%20need%20help%20understanding%20how%20to%20use%20Sakhi" className="btn-ask-ai">
                        Ask Sakhi AI Now
                    </Link>
                </section>

                {/* Frequently Asked Questions */}
                <section className="support-card">
                    <div className="card-header">
                        <span className="card-icon"><FiHelpCircle /></span>
                        <div>
                            <h2>Frequently Asked Questions</h2>
                            <p>Quick answers to common questions about using Sakhi.</p>
                        </div>
                    </div>

                    <div className="faq-accordion">
                        {FAQS.map((faq, index) => (
                            <div key={faq.q} className={`faq-item ${openFaq === index ? 'active' : ''}`}>
                                <button className="faq-question" onClick={() => toggleFaq(index)}>
                                    <span>{faq.q}</span>
                                    {openFaq === index ? <FiChevronUp /> : <FiChevronDown />}
                                </button>
                                {openFaq === index && <p className="faq-answer">{faq.a}</p>}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Contact Support Form */}
                <section className="support-card">
                    <div className="card-header">
                        <span className="card-icon"><FiMail /></span>
                        <div>
                            <h2>Send Us a Message</h2>
                            <p>Our support team responds within 24 hours.</p>
                        </div>
                    </div>

                    {submitted && (
                        <div className="support-toast">
                            Thank you! Your message has been sent to our Sakhi support team.
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="contact-form">
                        <div className="form-group">
                            <label>Subject</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Question about course certification" 
                                value={contactForm.subject}
                                onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Message</label>
                            <textarea 
                                rows={4}
                                placeholder="Describe your issue or feedback in detail..."
                                value={contactForm.message}
                                onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-send-support">
                            <FiSend /> Send Message
                        </button>
                    </form>
                </section>
            </main>
        </div>
    )
}
