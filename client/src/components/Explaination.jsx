import { Section } from '../lib/ui';

export default function Explanation({ data }) {
  if (!data) return null;

  return (
    <Section title="Explanation & Examples">
      <div className="flex flex-col items-center w-full px-2 md:px-4">
        {/* Explanation */}
        {Array.isArray(data.explanation) && (
          <div className="space-y-4 w-full max-w-3xl">
            {data.explanation.map((line, idx) => (
              <div key={idx} className="card text-center">
                <p className="leading-relaxed text-gray-700">{line}</p>
              </div>
            ))}
          </div>
        )}

        {typeof data.explanation === 'string' && (
          <div className="card max-w-3xl text-center mt-4">
            <p className="leading-relaxed text-gray-700">{data.explanation}</p>
          </div>
        )}

        {/* Examples */}
        {Array.isArray(data.examples) && (
          <div className="mt-10 w-full max-w-4xl">
            <h3 className="section-title border-b border-gray-300 pb-2">
              Examples
            </h3>
            <div className="space-y-8">
              {data.examples.map((ex, i) => (
                <div key={i} className="card">
                  {ex.description && (
                    <p className="font-semibold text-lg mb-3 text-teal-600 text-center">
                      {ex.description}
                    </p>
                  )}
                  {ex.code && (
                    <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm text-green-700 border border-gray-200 shadow-inner">
                      <code>{ex.code}</code>
                    </pre>
                  )}
                  {ex.explanation && (
                    <p className="mt-4 text-gray-600 leading-relaxed text-center">
                      {ex.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
