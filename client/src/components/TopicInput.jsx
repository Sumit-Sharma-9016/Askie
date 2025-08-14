import { useState } from 'react';
import { Section } from '../lib/ui';
import { explain } from '../api';

export default function TopicInput({ onExplained }) {
  const [topic, setTopic] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleExplain() {
    try {
      if(!topic) {
        alert("Give a topic name");
        return;
      }
      setLoading(true); setError('');
      const data = await explain({ topic: topic || undefined, file });
      onExplained(data, topic);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <Section title="Topic or PDF">
      <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <div className="md:col-span-2 space-y-2">
          <label className="label">Enter a topic</label>
          <input
            className="input"
            placeholder="e.g., Photosynthesis / Linear Algebra / WWII"
            value={topic}
            onChange={e=>setTopic(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="label">Or upload a PDF</label>
          <input
            className="input file:btn"
            type="file"
            accept="application/pdf"
            onChange={e=>setFile(e.target.files?.[0] || null)}
          />
        </div>
      </div>
      <div className="flex justify-center gap-2 pt-4">
        <button className="btn" onClick={handleExplain} disabled={loading}>
          {loading ? 'Thinking…' : 'Get Explanation'}
        </button>
        {error && <span className="text-red-500">{error}</span>}
      </div>
    </Section>
  );
}
