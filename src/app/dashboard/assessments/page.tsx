import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import ScoreChart from '@/components/ScoreChart';

export default async function AssessmentsHistory() {
  const session = await getSession();
  if (!session) redirect('/auth/login');

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.userId)
    .single();

  if (!user) redirect('/auth/login');

  const { data: assessments } = await supabase
    .from('assessments')
    .select('*')
    .eq('userid', user.id)
    .order('created_at', { ascending: false });

  const safeAssessments = assessments || [];

  // Map the postgres keys back to what ScoreChart expects (totalscore -> totalScore)
  const mappedAssessments = safeAssessments.map((a: any) => ({
    ...a,
    totalScore: a.totalscore
  }));

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh', paddingBottom: '4rem' }}>
      <header style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'Outfit' }}>ZEALTH</div>
        <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <span style={{ fontWeight: 500 }}>{user.name}</span>
          <Link href="/dashboard" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Back to Dashboard</Link>
        </nav>
      </header>

      <main className="container" style={{ maxWidth: '800px', marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--secondary)' }}>My Assessments</h1>
          <Link href="/assessment" className="btn btn-primary">Retake Assessment</Link>
        </div>

        {safeAssessments.length === 0 ? (
          <div className="card text-center" style={{ padding: '4rem 2rem' }}>
            <p>You haven't taken any assessments yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {safeAssessments.map((a: any, idx: number) => (
              <div key={a.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>Assessment #{safeAssessments.length - idx}</div>
                  <div style={{ color: 'var(--text-light)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{new Date(a.created_at).toLocaleDateString()}</div>
                  <div style={{ fontWeight: 500, color: 'var(--primary-dark)' }}>Score: {a.totalscore} / 70</div>
                </div>
                <Link href={`/dashboard/report/${a.id}`} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                  View Report
                </Link>
              </div>
            ))}

            {mappedAssessments.length > 1 && (
              <ScoreChart assessments={mappedAssessments} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
