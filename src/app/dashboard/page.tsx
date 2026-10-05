import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default async function Dashboard() {
  const session = await getSession();
  if (!session) {
    redirect('/auth/login');
  }

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.userId)
    .single();
  
  if (!user) {
    redirect('/auth/login');
  }

  const { data: assessments } = await supabase
    .from('assessments')
    .select('*')
    .eq('userid', user.id)
    .order('created_at', { ascending: false })
    .limit(1);

  const latestAssessment = assessments && assessments.length > 0 ? assessments[0] : null;

  return (
    <div>
      <header style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'Outfit' }}>ZEALTH</div>
        <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <span style={{ fontWeight: 500 }}>{user.name}</span>
        </nav>
      </header>

      <div className="container" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', padding: '2rem 1.5rem', alignItems: 'start' }}>
        <aside style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link href="/dashboard" style={{ padding: '0.75rem 1rem', background: 'var(--primary-light)', color: 'var(--primary-dark)', borderRadius: 'var(--radius-sm)', fontWeight: 500 }}>Dashboard</Link>
            <Link href="/dashboard/assessments" style={{ padding: '0.75rem 1rem', color: 'var(--text-main)', borderRadius: 'var(--radius-sm)' }}>My Assessments</Link>
            <Link href="/dashboard/profile" style={{ padding: '0.75rem 1rem', color: 'var(--text-main)', borderRadius: 'var(--radius-sm)' }}>My Profile</Link>
            <form action="/api/auth/logout" method="POST" style={{ marginTop: '1rem' }}>
              <button type="submit" className="btn btn-outline btn-block" style={{ padding: '0.5rem' }}>Logout</button>
            </form>
          </nav>
        </aside>

        <main>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem' }}>Hello, {user.name} 👋</h1>
            <p style={{ color: 'var(--text-light)', fontSize: '1.125rem' }}>Here's your lifestyle snapshot.</p>
          </div>

          {!latestAssessment ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', background: 'linear-gradient(135deg, #f8fafc, #d1fae5)' }}>
              <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: 'var(--shadow-md)' }}>
                <span style={{ fontSize: '2rem' }}>📋</span>
              </div>
              <h2 style={{ marginBottom: '1rem' }}>Understand your lifestyle at a glance.</h2>
              <p style={{ color: 'var(--text-main)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
                Take our free lifestyle assessment to understand your current habits, identify areas that may need attention, and discover your first focus area.
              </p>
              <Link href="/assessment" className="btn btn-primary" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
                Start Free Assessment
              </Link>
            </div>
          ) : (
            <div>
              <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h2 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '0.5rem' }}>LATEST LIFESTYLE SNAPSHOT</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '3rem', fontWeight: 700 }}>{latestAssessment.totalscore} <span style={{ fontSize: '1.5rem', fontWeight: 400, opacity: 0.8 }}>/ 70</span></span>
                    </div>
                    <p style={{ fontSize: '1.125rem', background: 'rgba(255,255,255,0.2)', padding: '0.25rem 1rem', borderRadius: 'var(--radius-full)', display: 'inline-block', marginTop: '0.5rem' }}>
                      Status: {latestAssessment.overallstatus}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link href={`/dashboard/report/${latestAssessment.id}`} className="btn" style={{ background: 'white', color: 'var(--primary-dark)' }}>
                      View Full Report
                    </Link>
                    <Link href="/assessment" className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}>
                      Retake
                    </Link>
                  </div>
                </div>
              </div>

              <h3 style={{ marginBottom: '1.5rem' }}>Your 7 Lifestyle Areas</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                {Object.entries(latestAssessment.categoryscores).map(([key, score]: [string, any]) => {
                  const titles: any = { nutrition: 'Nutrition', movement: 'Movement', sleep: 'Sleep', stress: 'Stress', weightBody: 'Weight & Body', hydration: 'Hydration', dailyHabits: 'Daily Habits' };
                  const percent = (score / 10) * 100;
                  let status = 'Needs More Attention';
                  let statusColor = 'var(--danger)';
                  if (score >= 8) { status = 'Good Foundation'; statusColor = 'var(--success)'; }
                  else if (score >= 5) { status = 'Needs Some Attention'; statusColor = 'var(--warning)'; }

                  return (
                    <div key={key} className="card" style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 600 }}>{titles[key] || key}</span>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{score}/10</span>
                      </div>
                      <div className="progress-container" style={{ marginBottom: '0.5rem' }}>
                        <div className="progress-bar" style={{ width: `${percent}%`, background: statusColor }}></div>
                      </div>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>{status}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
