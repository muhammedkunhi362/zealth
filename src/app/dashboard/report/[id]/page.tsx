import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default async function ReportPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect('/auth/login');

  const { data: assessment } = await supabase
    .from('assessments')
    .select('*')
    .eq('id', params.id)
    .eq('userid', session.userId)
    .single();
    
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.userId)
    .single();

  if (!assessment || !user) {
    return <div className="container mt-4 card">Assessment not found or you do not have permission to view it.</div>;
  }

  const { totalscore, overallstatus, categoryscores, strongerareas, attentionareas, firstfocus, recommendations, bmi, height, weight, waist } = assessment as any;
  const healthIssues = user.healthissues || [];

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh', paddingBottom: '4rem' }}>
      <header style={{ padding: '1rem 1.5rem', background: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/dashboard" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'Outfit' }}>ZEALTH</Link>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/dashboard" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Back to Dashboard</Link>
            <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }} onClick="window.print()">Download PDF</button>
          </div>
        </div>
      </header>

      <main className="container" style={{ maxWidth: '800px', marginTop: '2rem' }}>
        <div className="card" style={{ padding: '3rem', marginBottom: '2rem' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '2rem', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>ZEALTH</h1>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-light)', letterSpacing: '2px' }}>FREE LIFESTYLE ASSESSMENT</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '3rem', fontSize: '1.125rem' }}>
            <div><strong>Name:</strong> {user.name}</div>
            <div><strong>Age:</strong> {user.age}</div>
            <div><strong>Gender:</strong> {user.gender}</div>
            <div><strong>Assessment Date:</strong> {new Date((assessment as any).created_at).toLocaleDateString()}</div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #f8fafc, #d1fae5)', padding: '2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--secondary)' }}>YOUR LIFESTYLE SNAPSHOT</h3>
            <div style={{ fontSize: '4rem', fontWeight: 700, color: 'var(--primary)' }}>{totalscore} <span style={{ fontSize: '2rem', color: 'var(--text-light)' }}>/ 70</span></div>
            <div style={{ fontSize: '1.25rem', fontWeight: 500, marginTop: '0.5rem', color: 'var(--text-main)' }}>Status: {overallstatus}</div>
          </div>

          <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--secondary)', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>YOUR 7 LIFESTYLE AREAS</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
             {Object.entries(categoryscores).map(([key, score]: [string, any]) => {
                const titles: any = { nutrition: 'Nutrition', movement: 'Movement', sleep: 'Sleep', stress: 'Stress', weightBody: 'Weight & Body', hydration: 'Hydration', dailyHabits: 'Daily Habits' };
                const percent = (score / 10) * 100;
                let statusColor = 'var(--danger)';
                if (score >= 8) statusColor = 'var(--success)';
                else if (score >= 5) statusColor = 'var(--warning)';

                return (
                  <div key={key} style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600 }}>{titles[key] || key}</span>
                      <span style={{ fontWeight: 700 }}>{score}/10</span>
                    </div>
                    <div className="progress-container" style={{ height: '6px' }}>
                      <div className="progress-bar" style={{ width: `${percent}%`, background: statusColor }}></div>
                    </div>
                  </div>
                );
             })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
            <div style={{ background: '#f0fdf4', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ color: '#166534', marginBottom: '1rem' }}>MY STRONGER AREAS</h3>
              <ol style={{ paddingLeft: '1.5rem', color: '#15803d' }}>
                {strongerareas.map((area: string, i: number) => <li key={i} style={{ marginBottom: '0.5rem' }}>{area} - {categoryscores[area.toLowerCase().replace(' & ', '')] || categoryscores[area.toLowerCase().replace(' ', '')] || ''}/10</li>)}
              </ol>
            </div>
            <div style={{ background: '#fef2f2', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ color: '#991b1b', marginBottom: '1rem' }}>AREAS THAT NEED ATTENTION</h3>
              <ol style={{ paddingLeft: '1.5rem', color: '#b91c1c' }}>
                {attentionareas.map((area: string, i: number) => <li key={i} style={{ marginBottom: '0.5rem' }}>{area} - {categoryscores[area.toLowerCase().replace(' & ', '')] || categoryscores[area.toLowerCase().replace(' ', '')] || ''}/10</li>)}
              </ol>
            </div>
          </div>

          <div style={{ background: '#fffbeb', padding: '2rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #f59e0b', marginBottom: '3rem' }}>
            <h3 style={{ color: '#92400e', marginBottom: '1.5rem', fontSize: '1.5rem' }}>YOUR FIRST FOCUS</h3>
            <div style={{ marginBottom: '1rem' }}><strong>Focus:</strong> <span style={{ fontSize: '1.25rem', color: '#b45309', fontWeight: 600 }}>{firstfocus.focus}</span></div>
            <div style={{ marginBottom: '1rem' }}><strong>Why:</strong> {firstfocus.why}</div>
            <div><strong>Small Start:</strong> {firstfocus.smallStart}</div>
          </div>

          <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--secondary)', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>YOUR PERSONAL LIFESTYLE INSIGHTS</h3>
          <div style={{ marginBottom: '3rem' }}>
            {Object.keys(recommendations).length > 0 ? (
              Object.entries(recommendations).map(([category, recs]: [string, any]) => (
                <div key={category} style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>{category}</h4>
                  <ul style={{ paddingLeft: '1.5rem' }}>
                    {recs.map((rec: string, idx: number) => <li key={idx} style={{ marginBottom: '0.25rem' }}>{rec}</li>)}
                  </ul>
                </div>
              ))
            ) : (
              <p>Your lifestyle habits are generally supportive. Continue maintaining your balanced routine.</p>
            )}
          </div>

          <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--secondary)', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>YOUR CURRENT BODY MEASUREMENTS</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', textAlign: 'center' }}>
            <div><div style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>Height</div><div style={{ fontWeight: 600, fontSize: '1.25rem' }}>{height} cm</div></div>
            <div><div style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>Weight</div><div style={{ fontWeight: 600, fontSize: '1.25rem' }}>{weight} kg</div></div>
            <div><div style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>Waist</div><div style={{ fontWeight: 600, fontSize: '1.25rem' }}>{waist ? `${waist} cm` : '-'}</div></div>
            <div><div style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>BMI</div><div style={{ fontWeight: 600, fontSize: '1.25rem' }}>{bmi}</div></div>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', marginBottom: '3rem' }}>
            * Your BMI is a general screening measure and does not provide a medical diagnosis. Individual target weight should be determined after doctor assessment.
          </p>

          <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--secondary)', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>YOUR HEALTH INFORMATION</h3>
          <div style={{ background: '#f1f5f9', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '3rem' }}>
            <p style={{ marginBottom: '1rem' }}>You indicated:</p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem', fontWeight: 500 }}>
              {healthIssues.length > 0 ? healthIssues.map((issue: string, i: number) => <li key={i}>{issue}</li>) : <li>None specified</li>}
            </ul>
            {healthIssues.length > 0 && !healthIssues.includes('None') && (
              <p style={{ color: '#0f172a', fontWeight: 600, background: '#e2e8f0', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                Because you have indicated existing health concerns, consider discussing your lifestyle and health goals with a qualified healthcare professional.
              </p>
            )}
          </div>

          <div style={{ background: 'var(--primary-dark)', color: 'white', padding: '3rem 2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
            <h3 style={{ color: 'white', fontSize: '2rem', marginBottom: '1rem' }}>Want a more personalized understanding of what you need?</h3>
            <p style={{ fontSize: '1.125rem', marginBottom: '2rem', opacity: 0.9 }}>
              Discover your specific targets, whether your concerns need more attention, and your ideal next steps.
            </p>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '2rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>₹99 Doctor Lifestyle Assessment</h4>
              <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto', paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                <li>What should I focus on first?</li>
                <li>What should my weight target be?</li>
                <li>Do my lifestyle concerns need medical attention?</li>
                <li>What should my next step be?</li>
              </ul>
              <button className="btn" style={{ background: 'white', color: 'var(--primary-dark)', fontSize: '1.125rem' }}>
                Explore ₹99 Doctor Assessment
              </button>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '0.875rem', padding: '0 2rem' }}>
          <p><strong>Disclaimer:</strong> This assessment and report are intended for lifestyle awareness and education. They do not diagnose disease or replace professional medical consultation.</p>
          <p style={{ marginTop: '0.5rem' }}>Your weight reference range and lifestyle ratings are general guides. Individual health goals should be discussed with a qualified healthcare professional.</p>
        </div>
      </main>

      {/* Script to handle window.print behavior */}
      <script dangerouslySetInnerHTML={{
        __html: `
          function downloadPdf() {
            window.print();
          }
          document.querySelector('button[onClick="window.print()"]').onclick = downloadPdf;
        `
      }} />
    </div>
  );
}
