import { useState } from 'react';
import { Section } from '../lib/ui';
import { grade } from '../api';

export default function QuizRunner({ quiz, topic, questionType, onGraded, onBack }) {
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!quiz?.questions?.length) return null;

  function setAnswer(id, val) {
    setAnswers((prev) => ({ ...prev, [id]: val }));
  }

  async function handleSubmit() {
    try {
      setLoading(true);
      setError('');
      const arr = Object.entries(answers).map(([questionId, response]) => ({
        questionId,
        response,
      }));
      const res = await grade({
        questions: quiz.questions,
        answers: arr,
        topic,
        questionType,
      });
      onGraded(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section
      title={
        <div className="flex justify-between items-center gap-4">
          <span>Take the Quiz</span>
          <button
            onClick={onBack || (() => window.history.back())}
            className="btn bg-gray-400 hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-500 text-sm px-3 py-1"
          >
            ← Back to Explanation
          </button>

        </div>
      }
    >
      <div className="space-y-4 max-w-4xl mx-auto">
        {quiz.questions.map((q, idx) => (
          <div key={q.id} className="card space-y-3">
            {/* Question text */}
            <div className="quiz-question">
              Q{idx + 1}. {q.prompt}
            </div>

            {/* Multiple choice */}
            {q.type === 'mcq' ? (
              <div className="grid md:grid-cols-2 gap-3">
                {q.options.map((opt, i) => {
                  const selected = answers[q.id] === i;
                  return (
                    <label
                      key={i}
                      className={`quiz-option ${
                        selected ? 'quiz-option-selected' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        className="mr-2"
                        checked={selected}
                        onChange={() => setAnswer(q.id, i)}
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            ) : (
              <textarea
                className="input min-h-[120px]"
                placeholder={
                  q.type === 'brief'
                    ? 'Write a brief answer (~3-5 lines)'
                    : 'Write a detailed answer (8-12 lines)'
                }
                value={answers[q.id] || ''}
                onChange={(e) => setAnswer(q.id, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Submit button */}
      <div className="pt-4 text-center">
        <button className="btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Grading…' : 'Submit for Grading'}
        </button>
        {error && <span className="ml-3 text-red-500">{error}</span>}
      </div>
    </Section>
  );
}
