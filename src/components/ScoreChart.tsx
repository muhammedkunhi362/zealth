'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ScoreChart({ assessments }: { assessments: any[] }) {
  const sorted = [...assessments].reverse();
  const labels = sorted.map((a, i) => `Assessment ${i + 1}`);
  
  const data = {
    labels,
    datasets: [
      {
        label: 'Overall Score (/70)',
        data: sorted.map(a => a.totalScore),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
    },
    scales: {
      y: { min: 0, max: 70 }
    }
  };

  return (
    <div style={{ background: 'white', padding: '1rem', borderRadius: '1rem', border: '1px solid #e2e8f0', marginTop: '2rem' }}>
      <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Lifestyle Score Progress</h3>
      <Line options={options} data={data} />
    </div>
  );
}
