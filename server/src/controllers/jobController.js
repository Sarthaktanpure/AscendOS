const JobListing = require('../models/JobListing');
const JobRadarService = require('../services/jobRadarService');

exports.getJobs = async (req, res, next) => {
  try {
    const { company, roleType, workMode, search } = req.query;
    const query = { isActive: true };

    if (company) query.company = { $regex: company, $options: 'i' };
    if (roleType) query.roleType = roleType;
    if (workMode) query.workMode = workMode;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { descriptionSummary: { $regex: search, $options: 'i' } }
      ];
    }

    let jobs = await JobListing.find(query).sort({ fetchedAt: -1 });

    // If database has 0 jobs, trigger an initial sync automatically
    if (jobs.length === 0) {
      jobs = await JobRadarService.syncOpportunities();
    }

    // Attach user-specific eligibility verdict
    const jobsWithEligibility = jobs.map(job => {
      const evaluation = JobRadarService.evaluateEligibility(job, req.user);
      return {
        ...job.toObject(),
        eligibility: evaluation
      };
    });

    res.status(200).json({
      success: true,
      count: jobsWithEligibility.length,
      lastSync: jobs.length > 0 ? jobs[0].fetchedAt : new Date(),
      jobs: jobsWithEligibility
    });
  } catch (err) {
    next(err);
  }
};

exports.syncJobs = async (req, res, next) => {
  try {
    const jobs = await JobRadarService.syncOpportunities();
    const jobsWithEligibility = jobs.map(job => {
      const evaluation = JobRadarService.evaluateEligibility(job, req.user);
      return {
        ...job.toObject(),
        eligibility: evaluation
      };
    });

    res.status(200).json({
      success: true,
      message: 'Successfully refreshed internship radar with verified public feeds.',
      count: jobsWithEligibility.length,
      jobs: jobsWithEligibility
    });
  } catch (err) {
    next(err);
  }
};
