"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../lib/api";
import { useRequireAuth } from "../../lib/use-require-auth";

type Job = {
  id: string;
  status: string;
};

export default function JobsPage() {
  const canLoad = useRequireAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!canLoad) {
      return;
    }

    let cancelled = false;

    async function loadJobs() {
      setLoading(true);
      setError("");
      try {
        const data = await apiGet("/jobs");
        if (!cancelled) {
          setJobs(data as Job[]);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadJobs();

    return () => {
      cancelled = true;
    };
  }, [canLoad]);

  return (
    <section className="card">
      <h2>Jobs</h2>
      <p className="muted">Estado atual dos delivery jobs.</p>

      {!canLoad || loading ? <p>Carregando...</p> : null}
      {error ? <p className="error">{error}</p> : null}

      {!loading && !error ? (
        <ul className="list">
          {jobs.map((job) => (
            <li key={job.id}>
              {job.id} - <strong>{job.status}</strong>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
