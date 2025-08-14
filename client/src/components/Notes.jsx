import { useState } from 'react';
import { Section } from '../lib/ui';
import { notes } from '../api';

export default function Notes({ baseText }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!baseText) return null;

  async function handleNotes() {
    try {
      setLoading(true); setError('');
      const n = await notes({ baseText });
      setData(n);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <Section title="Generate Notes">
      <div className="text-center">
        <button className="btn" onClick={handleNotes} disabled={loading}>
          {loading ? 'Summarizing…' : 'Make Study Notes'}
        </button>
      </div>
      {error && <div className="text-red-500 mt-2 text-center">{error}</div>}
      {data && (
        <div className="mt-4 space-y-3 max-w-3xl mx-auto">
          <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">{data.title}</div>
          {data.summary && <p className="text-gray-600">{data.summary}</p>}
          {data.bulletPoints && (
            <ul className="list-disc ml-6 text-gray-600 dark:text-gray-100">
              {data.bulletPoints.map((b,i)=>(<li key={i}>{b}</li>))}
            </ul>
          )}
          {data.formulas?.length > 0 && (
            <div>
              <div className="font-medium text-gray-800">Formulas</div>
              <ul className="list-disc ml-6 text-gray-700">
                {data.formulas.map((f,i)=>(<li key={i}><code>{f}</code></li>))}
              </ul>
            </div>
          )}
          {data.keyTerms?.length > 0 && (
            <div>
              <div className="font-medium text-gray-800">Key Terms</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {data.keyTerms.map((t,i)=>(
                  <span key={i} className="px-2 py-1 rounded-xl bg-gray-100 border border-gray-300 text-gray-700">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Section>
  );
}
