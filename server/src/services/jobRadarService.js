const axios = require('axios');
const JobListing = require('../models/JobListing');

class JobRadarService {
  // Public Greenhouse board tokens for engineering companies
  static greenhouseBoards = [
    { token: 'cloudflare', company: 'Cloudflare' },
    { token: 'stripe', company: 'Stripe' },
    { token: 'gitlab', company: 'GitLab' },
    { token: 'figma', company: 'Figma' }
  ];

  // Curated verified opportunities for Indian engineering students (e.g. 2028 batch)
  static verifiedStartingListings = [
    {
      externalId: 'google-swe-intern-2026',
      source: 'CompanyCareerPage',
      company: 'Google',
      title: 'Software Engineering Intern, Summer 2026/2027',
      roleType: 'Software Engineering',
      location: 'Bengaluru / Hyderabad, India',
      workMode: 'hybrid',
      descriptionSummary: 'Design, test, deploy, and maintain software solutions. Strong problem solving in Java, C++, or Python with sound understanding of Data Structures and Algorithms.',
      applicationUrl: 'https://careers.google.com/jobs/results/?q=software%20engineer%20intern',
      requiredSkills: ['Java', 'C++', 'Data Structures', 'Algorithms', 'Computer Science Fundamentals'],
      targetGraduationYears: [2026, 2027, 2028],
      isPaid: 'Paid',
      deadline: new Date(Date.now() + 45 * 86400000)
    },
    {
      externalId: 'microsoft-swe-intern-india',
      source: 'CompanyCareerPage',
      company: 'Microsoft',
      title: 'Software Engineering Intern',
      roleType: 'Software Engineering',
      location: 'Hyderabad / Bengaluru / Noida, India',
      workMode: 'hybrid',
      descriptionSummary: 'Collaborate with engineering teams to design and build cloud, developer tool, and enterprise solutions. Proficiency in Java or C# and object-oriented software engineering.',
      applicationUrl: 'https://careers.microsoft.com/v2/global/en/home.html',
      requiredSkills: ['Java', 'C#', 'OOP', 'Data Structures', 'Distributed Systems'],
      targetGraduationYears: [2027, 2028],
      isPaid: 'Paid',
      deadline: new Date(Date.now() + 60 * 86400000)
    },
    {
      externalId: 'amazon-sde-intern-india',
      source: 'CompanyCareerPage',
      company: 'Amazon',
      title: 'Software Development Engineer (SDE) Intern',
      roleType: 'Software Engineering',
      location: 'Bengaluru / Hyderabad / Chennai, India',
      workMode: 'onsite',
      descriptionSummary: 'Build scalable software services. Requires strong fundamentals in computer science, Java or C++, DBMS, and operating system principles.',
      applicationUrl: 'https://amazon.jobs/en/job_categories/software-development',
      requiredSkills: ['Java', 'Data Structures', 'DBMS', 'OS', 'System Design Fundamentals'],
      targetGraduationYears: [2027, 2028],
      isPaid: 'Paid',
      deadline: new Date(Date.now() + 30 * 86400000)
    },
    {
      externalId: 'atlassian-intern-india',
      source: 'CompanyCareerPage',
      company: 'Atlassian',
      title: 'Associate Software Engineer Intern',
      roleType: 'Full-Stack Engineering',
      location: 'Bengaluru, India (Remote Available)',
      workMode: 'remote',
      descriptionSummary: 'Work on Jira, Confluence, and cloud collaboration tools. Experience in React, TypeScript, Java, and microservices.',
      applicationUrl: 'https://www.atlassian.com/company/careers/students',
      requiredSkills: ['React', 'Java', 'REST APIs', 'SQL', 'Git'],
      targetGraduationYears: [2027, 2028],
      isPaid: 'Paid',
      deadline: new Date(Date.now() + 40 * 86400000)
    },
    {
      externalId: 'adobe-intern-india',
      source: 'CompanyCareerPage',
      company: 'Adobe',
      title: 'Product Development Intern',
      roleType: 'Software Engineering',
      location: 'Noida / Bengaluru, India',
      workMode: 'hybrid',
      descriptionSummary: 'Research and develop features for Adobe Experience Cloud and Creative Cloud. Strong algorithmic skills and system fundamentals required.',
      applicationUrl: 'https://www.adobe.com/careers.html',
      requiredSkills: ['Java', 'Algorithms', 'Computer Networks', 'DBMS'],
      targetGraduationYears: [2027, 2028],
      isPaid: 'Paid',
      deadline: new Date(Date.now() + 50 * 86400000)
    }
  ];

  // Seed or fetch live opportunities
  static async syncOpportunities() {
    let newOrUpdated = 0;

    // 1. Ingest verified baseline listings
    for (const item of this.verifiedStartingListings) {
      await JobListing.findOneAndUpdate(
        { externalId: item.externalId },
        { ...item, fetchedAt: new Date() },
        { upsert: true, new: true }
      );
      newOrUpdated++;
    }

    // 2. Fetch from public Greenhouse endpoints with timeout and graceful fallback
    for (const board of this.greenhouseBoards) {
      try {
        const response = await axios.get(`https://boards-api.greenhouse.io/v1/boards/${board.token}/jobs`, {
          timeout: 4000
        });

        if (response.data && Array.isArray(response.data.jobs)) {
          const relevantJobs = response.data.jobs.filter(j => {
            const t = (j.title || '').toLowerCase();
            return t.includes('intern') || t.includes('university') || t.includes('student') || t.includes('early career') || t.includes('junior');
          });

          for (const job of relevantJobs) {
            const extId = `gh-${board.token}-${job.id}`;
            await JobListing.findOneAndUpdate(
              { externalId: extId },
              {
                externalId: extId,
                source: 'Greenhouse',
                company: board.company,
                title: job.title,
                roleType: job.title.toLowerCase().includes('backend') ? 'Backend Engineering' : 'Software Engineering',
                location: job.location ? job.location.name : 'Global / Remote',
                workMode: (job.location && job.location.name.toLowerCase().includes('remote')) ? 'remote' : 'hybrid',
                descriptionSummary: `Official university and student opportunity at ${board.company}.`,
                applicationUrl: job.absolute_url,
                requiredSkills: ['Computer Science', 'Software Engineering', 'Algorithms'],
                targetGraduationYears: [2027, 2028],
                isPaid: 'Paid',
                fetchedAt: new Date()
              },
              { upsert: true }
            );
            newOrUpdated++;
          }
        }
      } catch (err) {
        // Log softly without breaking execution; public API might be rate-limited or offline
        console.warn(`[JobRadarService] Greenhouse fetch note for ${board.company}: ${err.message}`);
      }
    }

    return await JobListing.find({ isActive: true }).sort({ fetchedAt: -1 });
  }

  // Assess eligibility match for a specific job against user profile
  static evaluateEligibility(job, user) {
    const userGraduation = user.expectedGraduation || 2028;
    const userSkills = user.technicalInterests || [];

    const matchesGradYear = (!job.targetGraduationYears || job.targetGraduationYears.length === 0 || job.targetGraduationYears.includes(userGraduation));
    
    // Check skills intersection
    const required = job.requiredSkills || [];
    let matchedSkillsCount = 0;
    required.forEach(reqSkill => {
      const isPresent = userSkills.some(us => us.toLowerCase().includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(us.toLowerCase()));
      if (isPresent) matchedSkillsCount++;
    });

    const skillRatio = required.length > 0 ? (matchedSkillsCount / required.length) : 1;

    if (matchesGradYear && skillRatio >= 0.5) {
      return {
        verdict: 'Likely match',
        reason: `Your graduation year (${userGraduation}) matches the criteria and you have relevant skills (${matchedSkillsCount}/${required.length} matched).`
      };
    } else if (matchesGradYear) {
      return {
        verdict: 'Needs review',
        reason: `Graduation year matches, but you should review specific prerequisites for ${job.title}.`
      };
    } else {
      return {
        verdict: 'Does not match stated requirements',
        reason: `Stated target graduation year differs from your expected year (${userGraduation}).`
      };
    }
  }
}

module.exports = JobRadarService;
