const { LearningTopic, csSubjects } = require('../models/LearningTopic');
const CSQuiz = require('../models/CSQuiz');

exports.getTopics = async (req, res, next) => {
  try {
    const { subject } = req.query;
    const query = { user: req.user.id };
    if (subject) query.subject = subject;

    const topics = await LearningTopic.find(query).sort({ subject: 1, createdAt: 1 });
    res.status(200).json({
      success: true,
      subjects: csSubjects,
      count: topics.length,
      topics
    });
  } catch (err) {
    next(err);
  }
};

exports.updateTopicConfidence = async (req, res, next) => {
  try {
    const { confidenceRating, notes } = req.body;
    const topic = await LearningTopic.findOne({ _id: req.params.id, user: req.user.id });
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found.' });
    }

    if (confidenceRating !== undefined) topic.confidenceRating = confidenceRating;
    if (notes !== undefined) topic.notes = notes;
    await topic.save();

    res.status(200).json({ success: true, topic });
  } catch (err) {
    next(err);
  }
};

exports.toggleSubtopic = async (req, res, next) => {
  try {
    const { subtopicId } = req.params;
    const topic = await LearningTopic.findOne({ _id: req.params.id, user: req.user.id });
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found.' });
    }

    const sub = topic.subtopics.id(subtopicId);
    if (!sub) {
      return res.status(404).json({ success: false, message: 'Subtopic not found.' });
    }

    sub.isCompleted = !sub.isCompleted;
    await topic.save();

    res.status(200).json({ success: true, topic });
  } catch (err) {
    next(err);
  }
};

exports.toggleKeyQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const topic = await LearningTopic.findOne({ _id: req.params.id, user: req.user.id });
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found.' });
    }

    const q = topic.keyQuestions.id(questionId);
    if (!q) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    q.isMastered = !q.isMastered;
    await topic.save();

    res.status(200).json({ success: true, topic });
  } catch (err) {
    next(err);
  }
};

exports.getQuizzes = async (req, res, next) => {
  try {
    const { subject } = req.query;
    const query = {};
    if (subject) query.subject = subject;

    const quizzes = await CSQuiz.find(query);
    res.status(200).json({ success: true, count: quizzes.length, quizzes });
  } catch (err) {
    next(err);
  }
};

exports.submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body; // array of selected indices
    const quiz = await CSQuiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    let score = 0;
    const results = quiz.questions.map((q, idx) => {
      const selected = answers ? answers[idx] : undefined;
      const isCorrect = selected === q.correctOptionIndex;
      if (isCorrect) score++;
      return {
        questionId: q._id,
        question: q.question,
        selectedOptionIndex: selected,
        correctOptionIndex: q.correctOptionIndex,
        isCorrect,
        explanation: q.explanation
      };
    });

    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    quiz.submissions.push({
      user: req.user.id,
      score,
      totalQuestions,
      percentage,
      submittedAt: new Date()
    });
    await quiz.save();

    res.status(200).json({
      success: true,
      score,
      totalQuestions,
      percentage,
      results
    });
  } catch (err) {
    next(err);
  }
};
