import Link from 'next/link';

export default function LandingPage() {
  return (
    <div>
      <header style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'Outfit' }}>ZEALTH</div>
        <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/auth/login" style={{ color: 'var(--text-main)', fontWeight: 500 }}>Login</Link>
          <Link href="/auth/register" className="btn btn-primary">Take Free Assessment</Link>
        </nav>
      </header>

      <main>
        <section style={{ padding: '6rem 1.5rem', textAlign: 'center', background: 'linear-gradient(to bottom, #f8fafc, #d1fae5)' }}>
          <div className="container" style={{ maxWidth: '800px' }}>
            <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', color: 'var(--secondary)' }}>
              Understand Your Lifestyle.<br/>
              <span style={{ color: 'var(--primary)' }}>Build Better Habits.</span>
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '2.5rem' }}>
              Take a free lifestyle assessment and get a personalized snapshot of your nutrition, movement, sleep, stress, hydration and daily habits.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link href="/auth/register" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
                Take Free Assessment
              </Link>
              <Link href="#how-it-works" className="btn btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
                How It Works
              </Link>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="container" style={{ padding: '5rem 1.5rem' }}>
          <h2 className="text-center" style={{ fontSize: '2.5rem', marginBottom: '3rem' }}>The ZEALTH Journey</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="card text-center" style={{ padding: '2.5rem 1.5rem' }}>
              <div style={{ width: '48px', height: '48px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>01</div>
              <h3 style={{ marginBottom: '1rem' }}>Free Lifestyle Assessment</h3>
              <p style={{ color: 'var(--text-light)' }}>Understand where you are. Get a personalized snapshot of your 7 lifestyle areas.</p>
            </div>
            
            <div className="card text-center" style={{ padding: '2.5rem 1.5rem' }}>
              <div style={{ width: '48px', height: '48px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>02</div>
              <h3 style={{ marginBottom: '1rem' }}>₹99 Doctor Assessment</h3>
              <p style={{ color: 'var(--text-light)' }}>Understand what you need with personalized medical insights.</p>
            </div>

            <div className="card text-center" style={{ padding: '2.5rem 1.5rem' }}>
              <div style={{ width: '48px', height: '48px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>03</div>
              <h3 style={{ marginBottom: '1rem' }}>ZEALTH Care</h3>
              <p style={{ color: 'var(--text-light)' }}>Get continuous support from dietitians or doctors to build healthier habits.</p>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ background: 'var(--secondary)', color: 'white', padding: '3rem 1.5rem', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'white', marginBottom: '1rem' }}>ZEALTH</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Doctor Guided Living • Lifelong Health</p>
          <div style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '800px', margin: '0 auto', borderTop: '1px solid #334155', paddingTop: '2rem' }}>
            <p style={{ marginBottom: '1rem' }}><strong>Disclaimer:</strong> This assessment and report are intended for lifestyle awareness and education. They do not diagnose disease or replace professional medical consultation.</p>
            <p>&copy; {new Date().getFullYear()} ZEALTH. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
