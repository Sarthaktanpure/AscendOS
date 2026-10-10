const Resource = require('../models/Resource');

exports.getResources = async (req, res, next) => {
  try {
    const { category, isFree, search } = req.query;
    const query = {};

    if (category) query.category = category;
    if (isFree !== undefined) query.isFree = isFree === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { authorOrSource: { $regex: search, $options: 'i' } }
      ];
    }

    const resources = await Resource.find(query).sort({ category: 1, createdAt: 1 });
    const resourcesWithStatus = resources.map(r => ({
      ...r.toObject(),
      isCompletedByUser: (r.usersCompleted || []).some(u => u.toString() === req.user.id)
    }));

    res.status(200).json({ success: true, count: resourcesWithStatus.length, resources: resourcesWithStatus });
  } catch (err) {
    next(err);
  }
};

exports.toggleCompleted = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    const index = resource.usersCompleted.findIndex(u => u.toString() === req.user.id);
    if (index > -1) {
      resource.usersCompleted.splice(index, 1);
    } else {
      resource.usersCompleted.push(req.user.id);
    }

    await resource.save();

    res.status(200).json({
      success: true,
      isCompletedByUser: index === -1,
      resource
    });
  } catch (err) {
    next(err);
  }
};

exports.createResource = async (req, res, next) => {
  try {
    const resource = await Resource.create(req.body);
    res.status(201).json({ success: true, resource });
  } catch (err) {
    next(err);
  }
};
