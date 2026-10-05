'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const steps = [
  { id: 1, title: 'About You' },
  { id: 2, title: 'My Health' },
  { id: 3, title: 'Nutrition' },
  { id: 4, title: 'Movement' },
  { id: 5, title: 'Sleep' },
  { id: 6, title: 'Stress' },
  { id: 7, title: 'Weight & Body' },
  { id: 8, title: 'Hydration' },
  { id: 9, title: 'Daily Habits' },
];

export default function Assessment() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Assessment Data State
  const [answers, setAnswers] = useState<Record<string, any>>({
    name: '', age: '', gender: '', date: new Date().toISOString().split('T')[0],
    height: '', weight: '', waist: ''
  });

  useEffect(() => {
    // Attempt to load saved progress or pre-fill from user profile
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const user = await res.json();
          setAnswers(prev => ({
            ...prev,
            name: user.name || prev.name,
            age: user.age || prev.age,
            gender: user.gender || prev.gender,
            height: user.height || prev.height,
            weight: user.weight || prev.weight,
          }));
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchProfile();
    
    const saved = localStorage.getItem('zealth_assessment_progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.step) setCurrentStep(parsed.step);
      } catch(e) {}
    }
  }, []);

  const saveProgress = (newAnswers: any, step: number) => {
    localStorage.setItem('zealth_assessment_progress', JSON.stringify({ answers: newAnswers, step }));
  };

  const handleAnswerChange = (key: string, value: any) => {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);
    saveProgress(newAnswers, currentStep);
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      saveProgress(answers, currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      saveProgress(answers, currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const submitAssessment = async () => {
    setSubmitting(true);
    setError('');
    
    try {
      const res = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, height: answers.height, weight: answers.weight, waist: answers.waist })
      });
      
      if (res.ok) {
        const data = await res.json();
        localStorage.removeItem('zealth_assessment_progress');
        router.push(`/dashboard/report/${data.assessmentId}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit assessment');
        setSubmitting(false);
      }
    } catch (e) {
      setError('An error occurred during submission.');
      setSubmitting(false);
    }
  };

  const renderQuestion = (id: string, text: string, options: {label: string, value: string}[]) => (
    <div className="card" style={{ marginBottom: '1.5rem', background: 'white' }}>
      <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: 'var(--secondary)' }}>{text}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {options.map((opt) => (
          <label 
            key={opt.value} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', 
              border: answers[id] === opt.value ? '2px solid var(--primary)' : '1px solid #e2e8f0', 
              borderRadius: 'var(--radius-md)', cursor: 'pointer',
              background: answers[id] === opt.value ? 'var(--primary-light)' : 'white',
              transition: 'all 0.2s'
            }}
          >
            <input 
              type="radio" 
              name={id} 
              value={opt.value} 
              checked={answers[id] === opt.value}
              onChange={() => handleAnswerChange(id, opt.value)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
            />
            <span style={{ fontSize: '1rem', fontWeight: answers[id] === opt.value ? 600 : 400 }}>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', paddingBottom: '4rem' }}>
      <header style={{ padding: '1rem 1.5rem', background: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/dashboard" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'Outfit' }}>ZEALTH</Link>
          <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-light)' }}>
            Step {currentStep} of {steps.length}
          </div>
        </div>
        <div className="progress-container" style={{ position: 'absolute', bottom: '-1px', left: 0, height: '4px', background: 'transparent' }}>
          <div className="progress-bar" style={{ width: `${(currentStep / steps.length) * 100}%` }}></div>
        </div>
      </header>

      <main className="container" style={{ maxWidth: '800px', marginTop: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--secondary)' }}>{steps[currentStep - 1].title}</h1>
          <p style={{ color: 'var(--text-light)' }}>Please select the answer that best describes your current habits.</p>
        </div>

        {error && <div className="card" style={{ background: '#fee2e2', color: '#991b1b', marginBottom: '1.5rem' }}>{error}</div>}

        {currentStep === 1 && (
          <div className="card">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" className="form-control" value={answers.name} onChange={e => handleAnswerChange('name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input type="number" className="form-control" value={answers.age} onChange={e => handleAnswerChange('age', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-control" value={answers.gender} onChange={e => handleAnswerChange('gender', e.target.value)}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" className="form-control" value={answers.date} onChange={e => handleAnswerChange('date', e.target.value)} />
              </div>
            </div>
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#fef3c7', color: '#92400e', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
              <strong>Disclaimer:</strong> This assessment is for lifestyle awareness and education only. It must NOT diagnose diseases, prescribe medicines, or claim to replace a doctor or medical consultation.
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
               <p style={{ fontWeight: 500 }}>These questions are for lifestyle awareness and are NOT diagnostic tests.</p>
            </div>
            {renderQuestion('health_q1', '1. Do you experience fatigue or low energy frequently?', [
              { label: 'Rarely / Never', value: '3' }, { label: 'Sometimes', value: '2' }, { label: 'Often', value: '1' }
            ])}
            {renderQuestion('health_q2', '2. Do you feel tired after waking up despite adequate sleep?', [
              { label: 'Rarely', value: '3' }, { label: 'Sometimes', value: '2' }, { label: 'Often', value: '1' }
            ])}
            {renderQuestion('health_q3', '3. Do you experience excessive fatigue during small activities like climbing stairs?', [
              { label: 'Rarely', value: '3' }, { label: 'Sometimes', value: '2' }, { label: 'Often', value: '1' }
            ])}
            {renderQuestion('health_q4', '4. Do you experience sleepiness or fatigue immediately after meals?', [
              { label: 'Rarely', value: '3' }, { label: 'Sometimes', value: '2' }, { label: 'Often', value: '1' }
            ])}
            {renderQuestion('health_q5', '5. Do you frequently experience gas, bloating, acidity, or constipation?', [
              { label: 'Rarely', value: '3' }, { label: 'Sometimes', value: '2' }, { label: 'Often', value: '1' }
            ])}
            {renderQuestion('health_q6', '6. Have you had unintentional weight gain or loss recently?', [
              { label: 'No', value: '3' }, { label: 'Slightly', value: '2' }, { label: 'Yes, significantly', value: '1' }
            ])}
            {renderQuestion('health_q7', '7. Do you experience excessive hunger or frequent eating?', [
              { label: 'Rarely', value: '3' }, { label: 'Sometimes', value: '2' }, { label: 'Often', value: '1' }
            ])}
            {renderQuestion('health_q8', '8. Do you have frequent sweet or sugary food cravings?', [
              { label: 'Rarely', value: '3' }, { label: 'Sometimes', value: '2' }, { label: 'Often', value: '1' }
            ])}
            {renderQuestion('health_q9', '9. Do you experience daytime sleepiness or concentration problems?', [
              { label: 'Rarely', value: '3' }, { label: 'Sometimes', value: '2' }, { label: 'Often', value: '1' }
            ])}
            {renderQuestion('health_q10', '10. Does stress negatively affect your food intake, sleep, or physical condition?', [
              { label: 'Rarely', value: '3' }, { label: 'Sometimes', value: '2' }, { label: 'Often', value: '1' }
            ])}
          </div>
        )}

        {currentStep === 3 && (
          <div>
            {renderQuestion('nutr_q1', '1. How well do you practice eating a balanced plate?', [
              { label: 'Regularly', value: '3' }, { label: 'Sometimes', value: '2' }, { label: 'Rarely', value: '1' }
            ])}
            {renderQuestion('nutr_q2', '2. Do you monitor carbohydrate portions in your meals?', [
              { label: 'Yes, regularly', value: '3' }, { label: 'Sometimes', value: '2' }, { label: 'No', value: '1' }
            ])}
            {renderQuestion('nutr_q3', '3. How often do you include vegetables and fruits daily?', [
              { label: 'Sufficient amounts daily', value: '3' }, { label: 'Occasionally', value: '2' }, { label: 'Rarely', value: '1' }
            ])}
            {renderQuestion('nutr_q4', '4. Do you include adequate protein foods in your daily meals?', [
              { label: 'Regularly', value: '3' }, { label: 'Sometimes', value: '2' }, { label: 'Rarely', value: '1' }
            ])}
            {renderQuestion('nutr_q5', '5. How frequently do you consume fried food?', [
              { label: 'Rarely', value: '3' }, { label: 'Sometimes', value: '2' }, { label: 'Often', value: '1' }
            ])}
            {renderQuestion('nutr_q6', '6. How frequently do you eat fast food or packaged food?', [
              { label: 'Rarely', value: '3' }, { label: 'Sometimes', value: '2' }, { label: 'Often', value: '1' }
            ])}
            {renderQuestion('nutr_q7', '7. How much added sugar do you consume (tea/coffee, sweets, bakery, soft drinks)?', [
              { label: 'Very little / None', value: '3' }, { label: 'Moderate', value: '2' }, { label: 'High amount', value: '1' }
            ])}
            {renderQuestion('nutr_q8', '8. How well do you control your overall meal portions?', [
              { label: 'Well controlled', value: '3' }, { label: 'Sometimes overeat', value: '2' }, { label: 'Often overeat', value: '1' }
            ])}
            {renderQuestion('nutr_q9', '9. Are your meal timings regular?', [
              { label: 'Very regular', value: '3' }, { label: 'Somewhat regular', value: '2' }, { label: 'Highly irregular', value: '1' }
            ])}
            {renderQuestion('nutr_q10', '10. How often do you engage in late-night eating?', [
              { label: 'Rarely / Never', value: '3' }, { label: 'Sometimes', value: '2' }, { label: 'Often', value: '1' }
            ])}
          </div>
        )}

        {currentStep === 4 && (
          <div>
            {renderQuestion('move_q1', '1. How much time do you spend sitting daily?', [
              { label: 'Less than 4 hours', value: '3' }, { label: '4-8 hours', value: '2' }, { label: 'More than 8 hours', value: '1' }
            ])}
            {renderQuestion('move_q2', '2. Do you get up and move around during prolonged sitting periods?', [
              { label: 'Regularly', value: '3' }, { label: 'Sometimes', value: '2' }, { label: 'Rarely', value: '1' }
            ])}
            {renderQuestion('move_q3', '3. Do you incorporate movement or a short walk after meals?', [
              { label: 'Regularly', value: '3' }, { label: 'Sometimes', value: '2' }, { label: 'Rarely', value: '1' }
            ])}
            {renderQuestion('move_q4', '4. Do you get 20–30 minutes of dedicated walking or exercise daily?', [
              { label: 'Regularly (5+ days/week)', value: '3' }, { label: 'Sometimes (2-4 days/week)', value: '2' }, { label: 'Rarely (0-1 day/week)', value: '1' }
            ])}
            {renderQuestion('move_q5', '5. How would you rate your overall daily physical activity level?', [
              { label: 'Active', value: '3' }, { label: 'Moderately active', value: '2' }, { label: 'Sedentary', value: '1' }
            ])}
          </div>
        )}

        {currentStep === 5 && (
          <div>
            {renderQuestion('sleep_q1', '1. How many hours of sleep do you get on average?', [
              { label: '7-9 hours', value: '3' }, { label: '5-6 hours', value: '2' }, { label: 'Less than 5 hours', value: '1' }
            ])}
            {renderQuestion('sleep_q2', '2. How consistent are your sleeping and waking times?', [
              { label: 'Very consistent', value: '3' }, { label: 'Somewhat consistent', value: '2' }, { label: 'Highly irregular', value: '1' }
            ])}
            {renderQuestion('sleep_q3', '3. Do you feel fresh after waking up?', [
              { label: 'Most days', value: '3' }, { label: 'Some days', value: '2' }, { label: 'Rarely', value: '1' }
            ])}
            {renderQuestion('sleep_q4', '4. Do you use your phone or screens right before sleep?', [
              { label: 'Rarely', value: '3' }, { label: 'Sometimes', value: '2' }, { label: 'Often', value: '1' }
            ])}
          </div>
        )}

        {currentStep === 6 && (
          <div>
            {renderQuestion('stress_q1', '1. How would you rate the frequency and intensity of stress in your life?', [
              { label: 'Low', value: '3' }, { label: 'Moderate', value: '2' }, { label: 'High', value: '1' }
            ])}
            {renderQuestion('stress_q2', '2. Do you experience frequent overthinking?', [
              { label: 'Rarely', value: '3' }, { label: 'Sometimes', value: '2' }, { label: 'Often', value: '1' }
            ])}
            {renderQuestion('stress_q3', '3. Do you have difficulty relaxing your mind and body?', [
              { label: 'Rarely', value: '3' }, { label: 'Sometimes', value: '2' }, { label: 'Often', value: '1' }
            ])}
            {renderQuestion('stress_q4', '4. Does stress strongly affect your sleep or eating habits?', [
              { label: 'Rarely', value: '3' }, { label: 'Sometimes', value: '2' }, { label: 'Often', value: '1' }
            ])}
          </div>
        )}

        {currentStep === 7 && (
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--secondary)' }}>Your Body Measurements</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input type="number" className="form-control" value={answers.height} onChange={e => handleAnswerChange('height', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input type="number" className="form-control" value={answers.weight} onChange={e => handleAnswerChange('weight', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Waist Circumference (cm) - Optional</label>
                <input type="number" className="form-control" value={answers.waist || ''} onChange={e => handleAnswerChange('waist', e.target.value)} />
              </div>
            </div>
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--text-main)' }}>
              <strong>Note:</strong> We calculate BMI using your height and weight. BMI is an informational measurement only and not a diagnosis.
            </div>
          </div>
        )}

        {currentStep === 8 && (
          <div>
            {renderQuestion('hydro_q1', '1. What is your approximate daily water intake?', [
              { label: 'More than 8 glasses (2+ Liters)', value: '3' }, { label: '4-7 glasses', value: '2' }, { label: 'Less than 4 glasses', value: '1' }
            ])}
            {renderQuestion('hydro_q2', '2. How often do you consume soft drinks or sugary beverages?', [
              { label: 'Rarely', value: '3' }, { label: 'Sometimes', value: '2' }, { label: 'Often', value: '1' }
            ])}
          </div>
        )}

        {currentStep === 9 && (
          <div>
            {renderQuestion('habits_q1', '1. How much is your daily phone/screen time for non-work activities?', [
              { label: 'Less than 2 hours', value: '3' }, { label: '2-4 hours', value: '2' }, { label: 'More than 4 hours', value: '1' }
            ])}
            {renderQuestion('habits_q2', '2. Do you spend excessive continuous time sitting?', [
              { label: 'No, I take breaks', value: '3' }, { label: 'Sometimes', value: '2' }, { label: 'Yes, frequently', value: '1' }
            ])}
            {renderQuestion('habits_q3', '3. Do you usually stick to regular meal timings?', [
              { label: 'Yes, usually', value: '3' }, { label: 'Sometimes', value: '2' }, { label: 'No, very irregular', value: '1' }
            ])}
            {renderQuestion('habits_q4', '4. Do you frequently eat late at night close to bedtime?', [
              { label: 'Rarely', value: '3' }, { label: 'Sometimes', value: '2' }, { label: 'Often', value: '1' }
            ])}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
          <button onClick={prevStep} className="btn btn-outline" disabled={currentStep === 1 || submitting}>
            Back
          </button>
          
          {currentStep < steps.length ? (
            <button onClick={nextStep} className="btn btn-primary">
              Next Step
            </button>
          ) : (
            <button onClick={submitAssessment} className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="loader" style={{ width: '20px', height: '20px', borderWidth: '2px', marginRight: '0.5rem' }}></span>
                  Analyzing...
                </>
              ) : 'Submit Assessment'}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
