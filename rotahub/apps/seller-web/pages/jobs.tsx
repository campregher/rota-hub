import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

type Job = {
  id: string;
  status: string;
  orderId: string;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/jobs`)
      .then((res) => res.json())
      .then(setJobs)
      .catch(() => setJobs([]));
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Entregas</h1>
      <ul>
        {jobs.map((job) => (
          <li key={job.id}>
            Job {job.id} - {job.status} (Order {job.orderId})
          </li>
        ))}
      </ul>
    </main>
  );
}
