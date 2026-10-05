import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect('/auth/login');

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.userId)
    .single();

  if (!user) redirect('/auth/login');

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
        <h1 style={{ fontSize: '2rem', color: 'var(--secondary)', marginBottom: '2rem' }}>My Profile</h1>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <div style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>Full Name</div>
              <div style={{ fontWeight: 500, fontSize: '1.125rem' }}>{user.name}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>Mobile Number</div>
              <div style={{ fontWeight: 500, fontSize: '1.125rem' }}>{user.phone}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>WhatsApp Number</div>
              <div style={{ fontWeight: 500, fontSize: '1.125rem' }}>{user.whatsapp || '-'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>Age / Gender</div>
              <div style={{ fontWeight: 500, fontSize: '1.125rem' }}>{user.age} / {user.gender}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>Place</div>
              <div style={{ fontWeight: 500, fontSize: '1.125rem' }}>{user.place}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>Height / Weight</div>
              <div style={{ fontWeight: 500, fontSize: '1.125rem' }}>{user.height} cm / {user.weight} kg</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Health Information</h2>
          {user.healthissues && user.healthissues.length > 0 ? (
            <ul style={{ paddingLeft: '1.5rem' }}>
              {user.healthissues.map((issue: string, idx: number) => (
                <li key={idx} style={{ marginBottom: '0.5rem' }}>{issue}</li>
              ))}
            </ul>
          ) : (
            <p>None specified</p>
          )}
        </div>
      </main>
    </div>
  );
}
