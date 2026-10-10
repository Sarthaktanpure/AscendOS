const MentorEngine = require('../services/mentorEngine');
const MentorConversation = require('../models/MentorConversation');

exports.getDailyAdvice = async (req, res, next) => {
  try {
    const advice = await MentorEngine.getDailyAdvice(req.user.id);
    res.status(200).json({ success: true, advice });
  } catch (err) {
    next(err);
  }
};

exports.getReadiness = async (req, res, next) => {
  try {
    const readiness = await MentorEngine.evaluateReadiness(req.user.id);
    res.status(200).json({ success: true, readiness });
  } catch (err) {
    next(err);
  }
};

exports.getConversation = async (req, res, next) => {
  try {
    let conv = await MentorConversation.findOne({ user: req.user.id });
    if (!conv) {
      // Seed initial welcome message
      conv = await MentorConversation.create({
        user: req.user.id,
        messages: [
          {
            role: 'assistant',
            content: `Hello Sarthak. I am your AscendOS Engineering Mentor. I track your actual metrics across Java DSA, Core CS, Project audits, and internship applications. My goal is to keep you disciplined, honest about your bottlenecks, and systematically ready for top product companies. How can we optimize your plan today?`,
            contextTag: 'general_strategy'
          }
        ]
      });
    }

    res.status(200).json({ success: true, messages: conv.messages });
  } catch (err) {
    next(err);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    let conv = await MentorConversation.findOne({ user: req.user.id });
    if (!conv) {
      conv = await MentorConversation.create({ user: req.user.id, messages: [] });
    }

    // 1. Append user message
    conv.messages.push({
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    });

    // 2. Generate Mentor answer
    const mentorReply = await MentorEngine.answerQuery(req.user.id, message);

    // 3. Append assistant message
    conv.messages.push({
      role: 'assistant',
      content: mentorReply,
      timestamp: new Date()
    });

    await conv.save();

    res.status(200).json({
      success: true,
      reply: mentorReply,
      messages: conv.messages
    });
  } catch (err) {
    next(err);
  }
};
