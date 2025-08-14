import { useState } from 'react';
import { Section } from '../lib/ui';
import { makeQuiz } from '../api';

export default function QuizConfigurator({ baseText, onReady }) {
  const [questionType, setQuestionType] = useState(1);
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!baseText) return null;

  async function handleGen() {
    try {
      setLoading(true); setError('');
      const quiz = await makeQuiz({ baseText, questionType, numQuestions });
      onReady(quiz, questionType);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <Section title="Generate Quiz">
      <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
        <div>
          <label className="label">Question style</label>
          <select
            className="input"
            value={questionType}
            onChange={e=>setQuestionType(Number(e.target.value))}
          >
            <option value={1}>1 — MCQ</option>
            <option value={3}>3 — Brief answers</option>
            <option value={5}>5 — Detailed answers</option>
          </select>
        </div>
        <div>
          <label className="label">Number of questions</label>
          <input
            type="number"
            min={1}
            max={15}
            className="input"
            value={numQuestions}
            onChange={e=>setNumQuestions(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="pt-4 text-center">
        <button className="btn" onClick={handleGen} disabled={loading}>
          {loading ? 'Generating…' : 'Generate Quiz'}
        </button>
        {error && <span className="ml-3 text-red-500">{error}</span>}
      </div>
    </Section>
  );
}
