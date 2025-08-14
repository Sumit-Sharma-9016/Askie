import { Section } from '../lib/ui';

export default function Results({ data }) {
  if (!data?.results) return null;
  return (
    <Section title="5) Results">
      <div className="text-lg font-semibold text-gray-800 text-center">
        Score: {data.totalScore} / {data.maxScore}
      </div>
      <div className="grid gap-3 mt-3 max-w-3xl mx-auto">
        {data.results.map((r, i) => (
          <div key={i} className="card">
            <div className="flex items-center justify-between">
              <div className="font-medium text-gray-800">Question {i+1}</div>
              <div
                className={`px-2 py-1 rounded text-sm font-medium ${
                  r.correct
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {r.correct ? 'Correct' : 'Review'}
              </div>
            </div>
            <div className="text-gray-700 mt-2 whitespace-pre-wrap">{r.feedback}</div>
            <div className="text-gray-500 mt-1">+{r.score} pts</div>
          </div>
        ))}
      </div>
    </Section>
  );
}
