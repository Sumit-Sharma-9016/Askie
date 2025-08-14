const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

async function handleResponse(res, actionName) {
  if (!res.ok) {
    let msg = actionName + ' failed';
    try {
      const errData = await res.json();
      if (errData?.error) msg = `${actionName} failed: ${errData.error}`;
    } catch {
      // Ignore JSON parse errors
    }
    throw new Error(msg);
  }
  return res.json();
}

export async function explain({ topic, file }) {
  const fd = new FormData();
  if (topic) fd.append('topic', topic);
  if (file) fd.append('pdf', file);
  const res = await fetch(`${BASE}/explain`, { method: 'POST', body: fd });
  return handleResponse(res, 'Explain');
}

export async function makeQuiz({ baseText, questionType, numQuestions }) {
  const res = await fetch(`${BASE}/quiz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ baseText, questionType, numQuestions })
  });
  return handleResponse(res, 'Quiz generation');
}

export async function grade({ questions, answers, topic, questionType }) {
  const res = await fetch(`${BASE}/grade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questions, answers, topic, questionType })
  });
  return handleResponse(res, 'Grading');
}

export async function notes({ baseText }) {
  const res = await fetch(`${BASE}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ baseText })
  });
  return handleResponse(res, 'Notes');
}
