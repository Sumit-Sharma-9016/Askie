import { extractPdfText } from '../utils/pdf.js';
import { explainSchema, quizSchema, gradeSchema } from '../utils/validators.js';
import { explainFromTopicOrText, generateQuiz, gradeAnswers, generateNotes } from '../services/geminiService.js';
import QuizAttempt from '../models/QuizAttempt.js';

export async function explain(req, res, next) {
  try {
    let { topic = "", text = "" } = req.body || {};
    if (req.file) {
      const pdfText = await extractPdfText(req.file.buffer);
      text = (text ? text + '\n' : '') + pdfText;
    }
    if (!topic && !text) {
      return res.status(400).json({ error: 'Provide either topic or PDF/text' });
    }
    const parsed = explainSchema.parse({ topic: topic || undefined, text: text || undefined });
    const data = await explainFromTopicOrText(parsed);
    res.json(data);
  } catch (err) { next(err); }
}

export async function makeQuiz(req, res, next) {
  try {
    const parsed = quizSchema.parse({
      baseText: req.body.baseText,
      questionType: Number(req.body.questionType), 
      numQuestions: Number(req.body.numQuestions ?? 5),
    });
    const quiz = await generateQuiz(parsed);
    res.json(quiz);
  } catch (err) { next(err); }
}

export async function grade(req, res, next) {
  try {
    const parsed = gradeSchema.parse(req.body);
    const scoring = await gradeAnswers(parsed);

    const maxScore =
      typeof scoring.maxScore === 'number'
        ? scoring.maxScore
        : scoring.results.reduce((a, r) => {
            const q = parsed.questions.find(q => q.id === r.questionId);
            const per = q?.type === 'mcq' ? 1 : (q?.rubric?.maxScore || 0);
            return a + per;
          }, 0);

    const totalScore =
      typeof scoring.totalScore === 'number'
        ? scoring.totalScore
        : scoring.results.reduce((a, r) => a + (typeof r.score === 'number' ? Math.max(0, r.score) : 0), 0);

    const attempt = await QuizAttempt.create({
      topic: req.body.topic || '',
      questionType: Number(req.body.questionType) || 1,
      questions: parsed.questions,
      answers: parsed.answers,
      results: scoring.results,
      totalScore,
      maxScore,
    });

    res.json({ attemptId: attempt._id, ...scoring, totalScore, maxScore });
  } catch (err) { next(err); }
}

export async function notes(req, res, next) {
  try {
    const { baseText } = req.body || {};
    if (!baseText) return res.status(400).json({ error: 'baseText required' });
    const data = await generateNotes({ baseText });
    res.json(data);
  } catch (err) { next(err); }
}
