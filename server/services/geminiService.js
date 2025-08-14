import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY missing");
  return new GoogleGenerativeAI(apiKey);
}

function cleanJSON(text) {
  return (text || "")
    .replace(/```json\s*/gi, "")
    .replace(/```/g, "")
    .trim();
}

function safeParseJSON(str, fallbackKey = "data") {
  try {
    return JSON.parse(cleanJSON(str));
  } catch {
    // wrap as object so the UI doesn't crash
    return { [fallbackKey]: cleanJSON(str) };
  }
}

async function explainFromTopicOrText({ topic, text }) {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: MODEL });

  const prompt = `
  Return ONLY valid JSON with the following structure:
  {
  "explanation": [
    "Step 1 explanation in simple language...",
    "Step 2 explanation with analogy...",
    "... more steps ..."
  ],
  "examples": [
    {
      "description": "Clear description of the example",
      "code": "Code snippet or relevant text here (if applicable)",
      "explanation": "Detailed explanation of what the example does and why it matters"
    },
    ...
  ]
  }

  Rules:
  - Do not include markdown, code fences, or extra commentary outside the JSON.
  - Audience: high school & college students.
  - Write clear, stepwise explanations that build understanding gradually.
  - Use analogies from everyday life to make concepts memorable.
  - Provide 4–6 explanation steps that cover the topic deeply.
  - Each example must have:
      - A concise **description** (what the example is about)
      - A **code** field (if applicable; otherwise leave empty string)
      - An **explanation** that helps the student understand why it’s relevant.
  - Examples should cover both basic and slightly advanced aspects of the topic.
  - Keep sentences concise but information-rich.
  - Avoid generic filler text.

  Topic/Text: ${topic || text}
  `;

  const result = await model.generateContent(prompt);
  const rawText = result.response.text();
  return safeParseJSON(rawText, "explanation");
}


async function generateQuiz({ baseText, questionType, numQuestions }) {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: MODEL });
  
  const typeLabel =
    Number(questionType) === 1 ? "mcq" :
    Number(questionType) === 3 ? "brief" : "detailed";

  const prompt = `
  From the following study text, create EXACTLY ${numQuestions} questions of type "${typeLabel}" only.

  STRICT RULES:
  - DO NOT include any other question types.
  - Return JSON: { questions: [ { id, type, prompt, options?, answer?, rubric? } ] }
  - "type" must be "${typeLabel}" for ALL questions.
  - For mcq: include "options" (array of 4) and "answer" (index 0–3).
  - For brief/detailed: include "rubric" with "criteria" (array of strings) and "maxScore" (${typeLabel === "brief" ? 5 : 10}).
  - Use unique string "id" for each question.
  - Do not add explanations, markdown, or extra commentary — JSON only.

  TEXT:
  ${baseText}
  `;

  const result = await model.generateContent(prompt);
  const rawText = result.response.text();
  const parsed = safeParseJSON(rawText, "questions");

  // Post-process: ensure only correct type is kept
  parsed.questions = (parsed.questions || []).filter(
    q => q?.type?.toLowerCase() === typeLabel
  );

  // If Gemini gave fewer than required, fill with blanks or regenerate
  if (parsed.questions.length < numQuestions) {
    console.warn(`Gemini returned ${parsed.questions.length} ${typeLabel} questions, expected ${numQuestions}`);
  }

  return parsed;
}


async function gradeAnswers({ questions, answers }) {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: MODEL });

  const prompt = `Grade the following student answers.

  Return ONLY strict JSON:
  {
    "results": [
      { "questionId": "string", "correct": true/false, "score": number, "feedback": "string" }
    ],
    "totalScore": number,
    "maxScore": number
  }

  Rules:
  - For MCQ: correct = true if answer index equals question.answer, score = 1 else 0.
  - For Brief: maxScore = 3.  
    Award marks based on:
      1) Relevance to question
      2) Completeness (covers all main points)
      3) Clarity
  - For Detailed: maxScore = 5.  
    Award marks based on:
      1) Relevance to question
      2) Completeness (covers all required aspects)
      3) Clarity & organization
      4) Examples or explanations if needed
  - Never give a score higher than the maxScore for that question type.
  - If the student’s answer is blank, respond with:
      - score = 0
      - correct = false
      - feedback = "No answer provided"
  - Feedback should briefly explain why marks were awarded or deducted.

  QUESTIONS: ${JSON.stringify(questions)}
  ANSWERS: ${JSON.stringify(answers)}`;

  const result = await model.generateContent(prompt);
  const rawText = result.response.text();
  const parsed = safeParseJSON(rawText, "results");

  if (!Array.isArray(parsed.results)) parsed.results = [];

  // Map results to include every question
  const cappedResults = questions.map(q => {
    const aiResult = parsed.results.find(r => r.questionId === q.id);
    const maxForType =
      q.type === "mcq" ? 1 :
      q.type === "brief" ? 3 :
      q.type === "detailed" ? 5 : 0;

    const userAnswer = answers.find(a => a.questionId === q.id)?.response;

    // If blank, override
    if (userAnswer === null || userAnswer === undefined || userAnswer === "" || (typeof userAnswer === "string" && !userAnswer.trim())) {
      return {
        questionId: q.id,
        correct: false,
        score: 0,
        feedback: "No answer provided"
      };
    }

    // Use AI score but cap
    return {
      questionId: q.id,
      correct: aiResult?.correct || false,
      score: Math.min(Math.max(0, aiResult?.score || 0), maxForType),
      feedback: aiResult?.feedback || ""
    };
  });

  // Calculate totals from capped results
  const totalScore = cappedResults.reduce((sum, r) => sum + (r.score || 0), 0);
  const maxScore = questions.reduce((sum, q) => {
    if (q.type === "mcq") return sum + 1;
    if (q.type === "brief") return sum + 3;
    if (q.type === "detailed") return sum + 5;
    return sum;
  }, 0);

  return { results: cappedResults, totalScore, maxScore };
}


async function generateNotes({ baseText }) {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: MODEL });

  const prompt = `Create compact study notes in JSON with keys: title, bulletPoints (<=10), formulas (optional), keyTerms (<=10), summary (<=120 words).
Base text:
${baseText}`;

  const result = await model.generateContent(prompt);
  const rawText = result.response.text();
  const parsed = safeParseJSON(rawText, "notes");

  // Normalize arrays to prevent UI crashes
  parsed.bulletPoints = Array.isArray(parsed.bulletPoints) ? parsed.bulletPoints.slice(0, 10) : [];
  parsed.keyTerms = Array.isArray(parsed.keyTerms) ? parsed.keyTerms.slice(0, 10) : [];
  parsed.formulas = Array.isArray(parsed.formulas) ? parsed.formulas.slice(0, 10) : [];

  return parsed;
}

export {
  explainFromTopicOrText,
  generateQuiz,
  gradeAnswers,
  generateNotes,
};
