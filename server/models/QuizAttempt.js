import mongoose from 'mongoose';

const AnswerSchema = new mongoose.Schema({
  questionId: String,
  response: mongoose.Schema.Types.Mixed,
});

const ResultSchema = new mongoose.Schema({
  questionId: String,
  correct: Boolean,
  score: Number,
  feedback: String
});

const QuizAttemptSchema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
  topic: String,
  questionType: { type: Number, enum: [1,3,5] },
  questions: [mongoose.Schema.Types.Mixed],
  answers: [AnswerSchema],
  results: [ResultSchema],
  totalScore: Number,
  maxScore: Number
});

export default mongoose.model('QuizAttempt', QuizAttemptSchema);