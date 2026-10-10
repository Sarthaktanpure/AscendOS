const { DSAProblem } = require('../models/DSAProblem');
const { LearningTopic } = require('../models/LearningTopic');
const Project = require('../models/Project');
const Application = require('../models/Application');
const StudySession = require('../models/StudySession');
const Task = require('../models/Task');
const User = require('../models/User');

class MentorEngine {
  // Compute evidence-based readiness rubric
  static async evaluateReadiness(userId) {
    const user = await User.findById(userId);
    const dsaProblems = await DSAProblem.find({ user: userId });
    const csTopics = await LearningTopic.find({ user: userId });
    const projects = await Project.find({ user: userId });
    const applications = await Application.find({ user: userId });
    const sessions = await StudySession.find({ user: userId, status: 'completed' });

    // 1. DSA Score (0-100)
    const solvedCount = dsaProblems.filter(p => p.status === 'solved').length;
    const mediumCount = dsaProblems.filter(p => p.status === 'solved' && p.difficulty === 'Medium').length;
    const hardCount = dsaProblems.filter(p => p.status === 'solved' && p.difficulty === 'Hard').length;
    const revisionDueCount = dsaProblems.filter(p => p.status === 'needs_revision').length;

    let dsaScore = Math.min(100, Math.round((solvedCount / 75) * 60 + (mediumCount / 30) * 30 + (hardCount / 10) * 10));
    if (revisionDueCount > 5) dsaScore = Math.max(10, dsaScore - 10); // Penalty for revision debt

    // 2. Core CS Score (0-100)
    let totalConfidence = 0;
    csTopics.forEach(t => { totalConfidence += (t.confidenceRating || 1); });
    const avgConfidence = csTopics.length > 0 ? (totalConfidence / csTopics.length) : 1;
    const csScore = Math.min(100, Math.round((avgConfidence / 5) * 100));

    // 3. Projects Score (0-100)
    let auditScore = 0;
    let testedCount = 0;
    let deployedCount = 0;
    projects.forEach(p => {
      if (p.liveUrl) deployedCount++;
      if (p.testCoverageEvidence && p.testCoverageEvidence.length > 0) testedCount++;
      const audit = p.qualityAudit || {};
      const trueKeys = Object.values(audit).filter(Boolean).length;
      auditScore += (trueKeys / 9) * 100;
    });
    const avgAuditScore = projects.length > 0 ? Math.round(auditScore / projects.length) : 0;
    const projectScore = Math.min(100, Math.round(avgAuditScore * 0.6 + (deployedCount >= 2 ? 25 : 10) + (testedCount >= 2 ? 15 : 5)));

    // 4. Testing & Code Quality Score
    const qualityScore = Math.min(100, Math.round(
      (testedCount / (projects.length || 1)) * 50 + 
      (dsaProblems.filter(p => p.timeComplexity && p.spaceComplexity).length / (dsaProblems.length || 1)) * 50
    ));

    // 5. Application Pipeline Velocity
    const appliedCount = applications.filter(a => ['Applied', 'Assessment', 'Interview', 'Offer'].includes(a.status)).length;
    const applicationScore = Math.min(100, Math.round((appliedCount / 15) * 100));

    // 6. Overall weighted composite (not a guarantee of job, an internal readiness indicator)
    const overallReadinessIndex = Math.round(
      dsaScore * 0.30 +
      csScore * 0.20 +
      projectScore * 0.25 +
      qualityScore * 0.15 +
      applicationScore * 0.10
    );

    return {
      dsaScore,
      csScore,
      projectScore,
      qualityScore,
      applicationScore,
      overallReadinessIndex,
      metrics: {
        totalDsaSolved: solvedCount,
        dsaMediumSolved: mediumCount,
        dsaHardSolved: hardCount,
        revisionDebt: revisionDueCount,
        projectsCount: projects.length,
        deployedProjectsCount: deployedCount,
        projectsWithTestEvidence: testedCount,
        applicationsActive: appliedCount,
        totalCompletedSessions: sessions.length
      }
    };
  }

  // Generate Daily Mentor Directive
  static async getDailyAdvice(userId) {
    const readiness = await this.evaluateReadiness(userId);
    const m = readiness.metrics;

    if (m.revisionDebt >= 4) {
      return {
        priority: 'HIGH_PRIORITY_REVISION',
        headline: 'Clear Revision Backlog Before New Problems',
        recommendation: `You currently have ${m.revisionDebt} DSA problems due for revision. Spaced repetition is non-negotiable for long-term retention in technical interviews. Allocate your first 45 minutes today to resolve overdue problems.`,
        rationale: 'Solving 100 problems once is far inferior to having 50 patterns permanently locked in memory with zero hesitation under interview pressure.'
      };
    }

    if (m.projectsWithTestEvidence === 0 && m.projectsCount > 0) {
      return {
        priority: 'PROJECT_QUALITY_WARNING',
        headline: 'Strengthen Engineering Rigor in Projects',
        recommendation: 'None of your listed projects have verified automated test coverage or quality audit benchmarks. For top product companies, a candidate who writes unit/integration tests stands out immediately from 95% of applicants.',
        rationale: 'Top tech companies build mission-critical distributed systems. Showing CI/CD and tests in HospitalOS or MedGuard AI is proof you write production code, not just tutorials.'
      };
    }

    if (m.totalDsaSolved < 20) {
      return {
        priority: 'FOUNDATION_BUILDING',
        headline: 'Lock In Core Patterns in Java',
        recommendation: `You have solved ${m.totalDsaSolved} DSA problems so far. Target finishing the core patterns: Two Pointers, Sliding Window, and Binary Search this week. Solve at least 2 Mediums today.`,
        rationale: 'Consistent daily problem solving compounds exponential pattern-recognition ability over a semester.'
      };
    }

    if (m.applicationsActive < 3) {
      return {
        priority: 'PIPELINE_VELOCITY',
        headline: 'Expand Your Internship Application Pipeline',
        recommendation: 'You have only tracked a few internship applications. Third year is the primary hiring window for next summer. Identify 3 verified opportunities on the Radar and submit tailored applications.',
        rationale: 'Even the strongest technical candidates need pipeline volume to account for recruiter screening randomness.'
      };
    }

    return {
      priority: 'CONSISTENCY_PACE',
      headline: 'Maintain Steady Execution',
      recommendation: 'Your study consistency and balance across DSA and project engineering are tracking well. Protect your planned deep-work blocks today and complete your top MITs.',
      rationale: 'Excellence in software engineering is the compounding outcome of boring, deliberate daily execution.'
    };
  }

  // Rule-based Mentor Chat Handler
  static async answerQuery(userId, query) {
    const q = query.toLowerCase();
    const readiness = await this.evaluateReadiness(userId);
    const user = await User.findById(userId);

    if (q.includes('resume') || q.includes('cv')) {
      return `For your resume targeting SDE internships as a third-year student:
1. Put Education at the top with CGPA ${user.reportedCGPA}/10 (${user.college}).
2. List your strongest 2 projects: HospitalOS and MedGuard AI. Include measurable achievements (e.g. architecture patterns, test coverage, DB indexing, API response times).
3. Technical Skills: Java (DSA), React, Node.js, Express, MongoDB, Python, Docker/Git.
4. Keep it strictly to one page, ATS-friendly single-column format without graphics or progress bars.`;
    }

    if (q.includes('dsa') || q.includes('leetcode') || q.includes('java')) {
      return `Here is your strict DSA roadmap using Java:
- Current progress: ${readiness.metrics.totalDsaSolved} solved (${readiness.metrics.dsaMediumSolved} Mediums).
- Primary Rule: Never spend more than 40 minutes stuck without writing pseudo-code. If stuck after 45 minutes, review the optimal approach, understand the pattern, implement it from scratch in Java, and mark it for spaced revision.
- Priority Topics: Two Pointers, Sliding Window, Trees/BST, Graphs (BFS/DFS), Dynamic Programming (Memoization & Tabulation).`;
    }

    if (q.includes('interview') || q.includes('google') || q.includes('microsoft') || q.includes('amazon')) {
      return `Preparation for top product companies requires four distinct pillars:
1. DSA: Flawless implementation in Java within 25-30 minutes for Medium-level problems.
2. Core CS: Crisp answers on ACID properties, indexing (B+ trees), process vs thread, paging, and TCP handshakes.
3. Project Defense: Be prepared to walk through any architectural decision in your projects (e.g., HospitalOS authentication, database schema, failure modes).
4. Behavioral: Structure your answers using the STAR format (Situation, Task, Action, Result).`;
    }

    if (q.includes('schedule') || q.includes('time') || q.includes('tired') || q.includes('busy')) {
      return `When feeling overwhelmed or constrained:
- Switch to the "I have only 2 hours today" or "Low-energy day" mode in your study scheduler.
- Never abandon the day completely. Completing even 1 focused 45-minute revision block preserves momentum and prevents self-doubt.
- Rest is a scheduled requirement, not a guilty failure. Protect your sleep.`;
    }

    return `Mentor Observation:
Your current readiness score is ${readiness.overallReadinessIndex}/100.
Focus for this week:
- Daily: 2 Java DSA Medium problems + clear overdue revisions.
- Project Lab: Add test coverage and quality audit checks to HospitalOS or AgriConnect.
- Academic: Maintain your strong ${user.reportedCGPA} CGPA in Information Technology.
What specific roadblock or concept would you like to address right now?`;
  }
}

module.exports = MentorEngine;
