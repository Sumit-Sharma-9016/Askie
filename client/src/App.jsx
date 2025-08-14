import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import TopicInput from './components/TopicInput';
import Explanation from './components/Explaination';
import QuizConfigurator from './components/QuizConfigurator';
import QuizRunner from './components/QuizRunner';
import Results from './components/Results';
import Notes from './components/Notes';

function HomePage() {
  const navigate = useNavigate();
  return (
    <>
      <TopicInput
        onExplained={(data, topic) => {
          const baseText = (data?.explanation || '') + '\n' + Object.values(data?.examples || {}).join('\n');
          navigate('/explain', { state: { data, topic: topic || '', baseText } });
        }}
      />
    </>
  );
}

function ExplainPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const data = state?.data;
  const topic = state?.topic || '';
  const baseText = state?.baseText || '';

  return (
    <>
      <Explanation data={data} />
      <QuizConfigurator
        baseText={baseText}
        onReady={(quiz, questionType) => {
          navigate('/quiz', { state: { quiz, topic, questionType } });
        }}
      />
      <Notes baseText={baseText} />
    </>
  );
}

function QuizPage() {
  const { state } = useLocation();
  const [graded, setGraded] = useState(null);
  const quiz = state?.quiz;
  const topic = state?.topic || '';
  const questionType = state?.questionType || 1;
  return (
    <>
      <QuizRunner quiz={quiz} topic={topic} questionType={questionType} onGraded={setGraded} />
      <Results data={graded} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explain" element={<ExplainPage />} />
          <Route path="/quiz" element={<QuizPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
