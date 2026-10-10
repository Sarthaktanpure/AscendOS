const Task = require('../models/Task');

exports.getTasks = async (req, res, next) => {
  try {
    const { status, category, isMIT, search } = req.query;
    const query = { user: req.user.id };

    if (status) query.status = status;
    if (category) query.category = category;
    if (isMIT !== undefined) query.isMIT = isMIT === 'true';
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const tasks = await Task.find(query).sort({ isMIT: -1, priority: 1, scheduledDate: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: tasks.length, tasks });
  } catch (err) {
    next(err);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const task = await Task.create({
      ...req.body,
      user: req.user.id
    });
    res.status(201).json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    if (req.body.status === 'completed' && task.status !== 'completed') {
      req.body.completedAt = new Date();
    } else if (req.body.status && req.body.status !== 'completed') {
      req.body.completedAt = null;
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, task: updatedTask });
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    res.status(200).json({ success: true, message: 'Task removed successfully.' });
  } catch (err) {
    next(err);
  }
};

exports.toggleMIT = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    task.isMIT = !task.isMIT;
    await task.save();
    res.status(200).json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

exports.bulkUpdate = async (req, res, next) => {
  try {
    const { taskIds, updates } = req.body;
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No tasks specified for bulk update.' });
    }

    await Task.updateMany(
      { _id: { $in: taskIds }, user: req.user.id },
      { $set: updates }
    );

    const updatedTasks = await Task.find({ _id: { $in: taskIds }, user: req.user.id });
    res.status(200).json({ success: true, tasks: updatedTasks });
  } catch (err) {
    next(err);
  }
};
