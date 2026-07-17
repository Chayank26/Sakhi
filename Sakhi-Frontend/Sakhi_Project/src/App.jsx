import './App.css'

const stats = [
  { value: '500+', label: 'women supported' },
  { value: '20+', label: 'career resources' },
  { value: '24/7', label: 'safety support' },
]

const features = [
  {
    title: 'Career Opportunities',
    text: 'Discover jobs, apprenticeships, and growth paths tailored to your goals.',
  },
  {
    title: 'Skill Building',
    text: 'Learn through curated courses and practical lessons that build confidence.',
  },
  {
    title: 'Community & Safety',
    text: 'Connect with trusted peers and reach for help whenever you need it.',
  },
]

function App() {
  return (
    <div className="page-shell">
      <header className="topbar">
        <a className="brand" href="#home">
          Sakhi
        </a>
        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="nav-cta" href="#join">
          Join Now
        </a>
      </header>

      <main id="home">
        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow">Empowering women with opportunity</p>
            <h1>Build a brighter future through learning, careers, and support.</h1>
            <p className="hero-text">
              Sakhi brings together jobs, training, community, and safety resources in
              one welcoming place.
            </p>
            <div className="hero-actions">
              <a className="btn primary" href="#join">
                Get Started
              </a>
              <a className="btn secondary" href="#features">
                Explore Features
              </a>
            </div>

            <div className="stats-row" aria-label="Platform highlights">
              {stats.map((item) => (
                <div className="stat-card" key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-card" id="join">
            <h2>What you can do on Sakhi</h2>
            <ul>
              <li>Apply for jobs that match your goals</li>
              <li>Enroll in learning programs and track progress</li>
              <li>Join a supportive community and find guidance</li>
              <li>Access safety tools when you need them most</li>
            </ul>
          </div>
        </section>

        <section className="section" id="features">
          <div className="section-heading">
            <p className="eyebrow">Why Sakhi</p>
            <h2>A platform built for growth and confidence.</h2>
          </div>

          <div className="feature-grid">
            {features.map((feature) => (
              <article className="feature-card" key={feature.title}>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section about-section" id="about">
          <div>
            <p className="eyebrow">About Sakhi</p>
            <h2>Support that grows with you.</h2>
            <p>
              Whether you are exploring a new career, building practical skills, or
              looking for a safe and encouraging space, Sakhi is designed to help you move
              forward with clarity and support.
            </p>
          </div>
          <div className="info-card" id="contact">
            <h3>Ready to get involved?</h3>
            <p>Start your journey today and discover what Sakhi can help you build.</p>
            <a className="btn primary" href="#home">
              Start Exploring
            </a>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
