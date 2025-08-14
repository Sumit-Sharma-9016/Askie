import { z } from "zod";

export const explainSchema = z.object({
  topic: z.string().min(1).optional(),
  text: z.string().min(1).optional(),
}).refine(v => v.topic || v.text, { message: "Provide topic or text" });

export const quizSchema = z.object({
  baseText: z.string().min(20, "baseText too short"),
  questionType: z.number().int().refine(v => [1, 3, 5].includes(v), "questionType must be 1|3|5"),
  numQuestions: z.number().int().min(1).max(20),
});

// Flexible rubric schema that accepts string or array
const RubricSchema = z.object({
  criteria: z.union([
    z.array(z.string()),
    z.string()
  ])
    .transform(val => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') {
        return val
          .split(/[,;]+/) // split by comma or semicolon
          .map(s => s.trim())
          .filter(Boolean);
      }
      return ["Relevance", "Clarity", "Depth"];
    })
    .default(["Relevance", "Clarity", "Depth"]),
  maxScore: z.number().default(5),
});

const Question = z.object({
  id: z.string(),
  type: z.enum(["mcq", "brief", "detailed"]),
  prompt: z.string(),
  options: z.array(z.string()).optional(),
  answer: z.number().optional(),
  rubric: RubricSchema.optional(),
});

const Answer = z.object({
  questionId: z.string(),
  response: z.union([z.string(), z.number()]), // text or mcq index
});

export const gradeSchema = z.object({
  questions: z.array(Question).min(1),
  answers: z.array(Answer),
});
