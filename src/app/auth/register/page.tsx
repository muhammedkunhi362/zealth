'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '', phone: '', whatsapp: '', age: '', gender: '', height: '', weight: '', place: '', password: ''
  });
  const [healthIssues, setHealthIssues] = useState<string[]>([]);
  const [otherIssue, setOtherIssue] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const predefinedIssues = [
    'Diabetes', 'BP / Blood Pressure', 'Cholesterol', 'Fatty Liver', 'Thyroid', 
    'PCOS / PCOD', 'Uric Acid', 'Overweight', 'None', 'Don\'t know'
  ];

  const handleIssueChange = (issue: string) => {
    if (issue === 'None' || issue === 'Don\'t know') {
      setHealthIssues([issue]);
      return;
    }
    
    let updated = [...healthIssues];
    if (updated.includes('None') || updated.includes('Don\'t know')) {
      updated = [];
    }

    if (updated.includes(issue)) {
      updated = updated.filter(i => i !== issue);
    } else {
      updated.push(issue);
    }
    setHealthIssues(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setError('You must agree to the terms and consent to the health disclaimer.');
      return;
    }

    const finalIssues = [...healthIssues];
    if (otherIssue) finalIssues.push(`Other: ${otherIssue}`);

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, healthIssues: finalIssues }),
      });

      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', padding: '2rem 1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '600px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'Outfit' }}>ZEALTH</Link>
          <h2 style={{ marginTop: '1rem' }}>Create Your Account</h2>
          <p style={{ color: 'var(--text-light)' }}>Start your journey to better health</p>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Age</label>
              <input type="number" name="age" className="form-control" value={formData.age} onChange={handleChange} required />
            </div>
            
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input type="tel" name="phone" className="form-control" value={formData.phone} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">WhatsApp Number</label>
              <input type="tel" name="whatsapp" className="form-control" value={formData.whatsapp} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select name="gender" className="form-control" value={formData.gender} onChange={handleChange} required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Place (City/Town)</label>
              <input type="text" name="place" className="form-control" value={formData.place} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Height (cm)</label>
              <input type="number" name="height" className="form-control" value={formData.height} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Weight (kg)</label>
              <input type="number" name="weight" className="form-control" value={formData.weight} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Existing Health Issues</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {predefinedIssues.map(issue => (
                <label key={issue} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', cursor: 'pointer', border: healthIssues.includes(issue) ? '1px solid var(--primary)' : '1px solid transparent' }}>
                  <input type="checkbox" checked={healthIssues.includes(issue)} onChange={() => handleIssueChange(issue)} style={{ display: 'none' }} />
                  <span style={{ color: healthIssues.includes(issue) ? 'var(--primary)' : 'var(--text-main)', fontSize: '0.875rem' }}>{issue}</span>
                </label>
              ))}
            </div>
            <input type="text" className="form-control mt-2" placeholder="Other (please specify)" value={otherIssue} onChange={(e) => setOtherIssue(e.target.value)} />
          </div>

          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} required />
          </div>

          <div className="form-group" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginTop: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <input type="checkbox" id="consent" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: '0.25rem' }} />
            <label htmlFor="consent" style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>
              I agree to the Terms & Conditions and Privacy Policy. I understand that this free assessment is for lifestyle awareness and does not provide medical diagnosis.
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-block mt-4" disabled={loading}>
            {loading ? <span className="loader" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></span> : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-light)' }}>
          Already have an account? <Link href="/auth/login" style={{ fontWeight: 600 }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
