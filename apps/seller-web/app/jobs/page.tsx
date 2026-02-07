import { apiGet } from "../../lib/api";

export default async function JobsPage() {
  const jobs = await apiGet("/jobs");

  return (
    <section className="card">
      <h2>Jobs</h2>
      <p>Estado atual dos delivery jobs.</p>
      <ul>
        {jobs.map((job: any) => (
          <li key={job.id}>
            {job.id} - <strong>{job.status}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
