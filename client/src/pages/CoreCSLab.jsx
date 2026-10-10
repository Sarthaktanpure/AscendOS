import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Award,
  Sparkles,
  ChevronDown,
  Star,
  Play
} from 'lucide-react';
import api from '../api/client';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';

export const CoreCSLab = () => {
  const [topics, setTopics] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quiz Modal State
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  const fetchCSData = async () => {
    try {
      setLoading(true);
      const [topRes, quizRes] = await Promise.all([
        api.get('/topics'),
        api.get('/topics/quizzes/list')
      ]);

      if (topRes.data.success) {
        setTopics(topRes.data.topics);
        setSubjects(topRes.data.subjects || []);
        if (!selectedSubject && topRes.data.subjects?.length > 0) {
          setSelectedSubject(topRes.data.subjects[0]);
        }
      }
      if (quizRes.data.success) {
        setQuizzes(quizRes.data.quizzes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCSData();
  }, []);

  const handleToggleSubtopic = async (topicId, subtopicId) => {
    try {
      await api.patch(`/topics/${topicId}/subtopics/${subtopicId}/toggle`);
      setTopics(prev => prev.map(t => {
        if (t._id === topicId) {
          return {
            ...t,
            subtopics: t.subtopics.map(st => st._id === subtopicId ? { ...st, isCompleted: !st.isCompleted } : st)
          };
        }
        return t;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateConfidence = async (topicId, rating) => {
    try {
      await api.put(`/topics/${topicId}/confidence`, { confidenceRating: rating });
      setTopics(prev => prev.map(t => t._id === topicId ? { ...t, confidenceRating: rating } : t));
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setQuizAnswers({});
    setQuizResult(null);
    setQuizModalOpen(true);
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setSubmittingQuiz(true);
    try {
      const answersArray = activeQuiz.questions.map((_, idx) => quizAnswers[idx]);
      const res = await api.post(`/topics/quizzes/${activeQuiz._id}/submit`, { answers: answersArray });
      if (res.data.success) {
        setQuizResult(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const filteredTopics = selectedSubject
    ? topics.filter(t => t.subject === selectedSubject)
    : topics;

  const filteredQuizzes = selectedSubject
    ? quizzes.filter(q => q.subject === selectedSubject)
    : quizzes;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-indigo-500" />
          Core Computer Science Preparation Lab
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
          High-yield interview concepts, syllabus checklists, and verified practice quizzes across 7 core subjects.
        </p>
      </div>

      {/* Subject Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-[#233044]">
        {subjects.map(s => (
          <button
            key={s}
            onClick={() => setSelectedSubject(s)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedSubject === s
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#162030]'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Topics & Syllabus Checklist (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {filteredTopics.map((topic) => {
            const completedCount = (topic.subtopics || []).filter(st => st.isCompleted).length;
            const totalCount = (topic.subtopics || []).length;
            const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            return (
              <Card key={topic._id} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                      {topic.subject}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {topic.title}
                    </h3>
                  </div>

                  {/* Confidence Stars */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 mr-1">Confidence:</span>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => handleUpdateConfidence(topic._id, star)}
                        className="p-0.5 text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-4 h-4 ${star <= (topic.confidenceRating || 2) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Syllabus Coverage</span>
                    <span>{completedCount} / {totalCount} completed ({progress}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                {/* Subtopics Checklist */}
                <div className="pt-2 space-y-2">
                  {(topic.subtopics || []).map((sub) => (
                    <div
                      key={sub._id}
                      onClick={() => handleToggleSubtopic(topic._id, sub._id)}
                      className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-[#162032] transition-colors text-xs"
                    >
                      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${sub.isCompleted ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} />
                      <span className={sub.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-200 font-medium'}>
                        {sub.title}
                      </span>
                    </div>
                  ))}
                </div>

                {/* High-Yield Interview Notes */}
                {topic.notes && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#151D2A] border border-slate-200 dark:border-[#233044] text-xs leading-relaxed text-slate-300">
                    <strong className="text-indigo-400 font-semibold block mb-1">Interview High-Yield Takeaway:</strong>
                    {topic.notes}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Right Column: Practice Quizzes (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card
            title="Interactive Practice Quizzes"
            subtitle="Test retention on actual interview questions with explanations."
          >
            <div className="space-y-3">
              {filteredQuizzes.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No quizzes for this subject yet.</p>
              ) : (
                filteredQuizzes.map(quiz => (
                  <div
                    key={quiz._id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-[#233044] bg-slate-50/50 dark:bg-[#151D2A] space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {quiz.title}
                      </span>
                      <Badge variant="indigo" size="xs">{quiz.difficulty}</Badge>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {quiz.questions.length} questions • Concept verification
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Play}
                      className="w-full mt-2"
                      onClick={() => handleOpenQuiz(quiz)}
                    >
                      Start Quiz
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Practice Quiz Modal */}
      {activeQuiz && (
        <Modal
          isOpen={quizModalOpen}
          onClose={() => setQuizModalOpen(false)}
          title={activeQuiz.title}
          subtitle={`Subject: ${activeQuiz.subject} • Answer all questions then submit.`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6 text-xs">
            {!quizResult ? (
              <>
                {activeQuiz.questions.map((q, qIdx) => (
                  <div key={q._id} className="p-4 rounded-xl border border-slate-200 dark:border-[#233044] bg-slate-50/50 dark:bg-[#151D2A] space-y-3">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">
                      {qIdx + 1}. {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => (
                        <label
                          key={optIdx}
                          className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                            quizAnswers[qIdx] === optIdx
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                              : 'border-slate-200 dark:border-[#233044] hover:bg-slate-100 dark:hover:bg-[#1C2738]'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`quiz-q-${qIdx}`}
                            checked={quizAnswers[qIdx] === optIdx}
                            onChange={() => setQuizAnswers({ ...quizAnswers, [qIdx]: optIdx })}
                            className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-slate-700 dark:text-slate-300">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-[#1E293B]">
                  <Button
                    variant="primary"
                    size="md"
                    isLoading={submittingQuiz}
                    onClick={handleSubmitQuiz}
                  >
                    Submit Answers
                  </Button>
                </div>
              </>
            ) : (
              /* Quiz Results */
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center space-y-1">
                  <h3 className="text-lg font-bold text-white">
                    Score: {quizResult.score} / {quizResult.totalQuestions} ({quizResult.percentage}%)
                  </h3>
                  <p className="text-xs text-indigo-300">
                    {quizResult.percentage >= 80 ? 'Mastery demonstrated!' : 'Review the explanations below to solidify understanding.'}
                  </p>
                </div>

                <div className="space-y-4">
                  {quizResult.results.map((r, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-[#233044] space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {idx + 1}. {r.question}
                        </p>
                        <Badge variant={r.isCorrect ? 'emerald' : 'rose'} size="xs">
                          {r.isCorrect ? 'Correct' : 'Incorrect'}
                        </Badge>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-100 dark:bg-[#151D2A] text-slate-300 text-[11px] leading-relaxed">
                        <strong className="text-indigo-400 block mb-0.5">Explanation:</strong>
                        {r.explanation}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-[#1E293B]">
                  <Button variant="primary" size="md" onClick={() => setQuizModalOpen(false)}>
                    Close Results
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CoreCSLab;
