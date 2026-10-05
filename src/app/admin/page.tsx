import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session) redirect('/auth/login');

  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: assessments } = await supabase
    .from('assessments')
    .select('*')
    .order('created_at', { ascending: false });

  const safeUsers = users || [];
  const safeAssessments = assessments || [];

  const averageScore = safeAssessments.length > 0 
    ? Math.round(safeAssessments.reduce((acc: number, val: any) => acc + val.totalscore, 0) / safeAssessments.length)
    : 0;

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh' }}>
      <header style={{ padding: '1.5rem', background: 'var(--secondary)', color: 'white' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Outfit' }}>ZEALTH Admin</div>
          <nav style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/dashboard" style={{ color: '#cbd5e1' }}>Back to User Dashboard</Link>
          </nav>
        </div>
      </header>

      <main className="container" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{safeUsers.length}</div>
            <div style={{ color: 'var(--text-light)' }}>Total Users</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{safeAssessments.length}</div>
            <div style={{ color: 'var(--text-light)' }}>Completed Assessments</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{averageScore} / 70</div>
            <div style={{ color: 'var(--text-light)' }}>Average Score</div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '1.5rem' }}>Recent Users</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem' }}>Name</th>
                  <th style={{ padding: '1rem' }}>Phone</th>
                  <th style={{ padding: '1rem' }}>Age/Gender</th>
                  <th style={{ padding: '1rem' }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {safeUsers.slice(0, 10).map((u: any) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '1rem' }}>{u.name}</td>
                    <td style={{ padding: '1rem' }}>{u.phone}</td>
                    <td style={{ padding: '1rem' }}>{u.age} / {u.gender}</td>
                    <td style={{ padding: '1rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
