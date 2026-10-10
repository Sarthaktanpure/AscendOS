const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const UserPreference = require('../models/UserPreference');
const Task = require('../models/Task');
const StudySession = require('../models/StudySession');
const { DSAProblem } = require('../models/DSAProblem');
const { LearningTopic } = require('../models/LearningTopic');
const CSQuiz = require('../models/CSQuiz');
const Project = require('../models/Project');
const Application = require('../models/Application');
const Resource = require('../models/Resource');
const JobRadarService = require('../services/jobRadarService');

async function seedDatabase() {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Seed] Connected to database:', mongoose.connection.name);

    // 1. Create or update Sarthak Tanpure's profile
    const userEmail = 'sarthak.tanpure@pravara.edu';
    let user = await User.findOne({ email: userEmail });

    if (!user) {
      console.log('[Seed] Creating preconfigured user profile for Sarthak Tanpure...');
      user = await User.create({
        name: 'Sarthak Tanpure',
        email: userEmail,
        password: 'password123', // Will be hashed automatically by pre-save hook
        degree: 'B.E. Information Technology',
        college: 'Pravara Rural Engineering College, Loni',
        expectedGraduation: 2028,
        academicStage: 'Third year',
        reportedCGPA: 9.0,
        careerTarget: 'Software Development Engineer internships, full-stack engineering, and eventually top product companies',
        primaryLanguageDSA: 'Java',
        technicalInterests: [
          'Java', 'DSA', 'React', 'Node.js', 'Express', 'MongoDB',
          'Python', 'FastAPI', 'PyTorch', 'AI-assisted applications',
          'backend engineering', 'testing', 'deployment'
        ],
        currentLimitation: 'No conventional software engineering internship experience yet',
        mainObjective: 'Build real skills, demonstrate engineering ability, secure interviews, and obtain an internship',
        isOnboarded: true,
        timezone: 'Asia/Kolkata',
        themePreference: 'dark'
      });
    } else {
      console.log('[Seed] Updating user profile with preconfigured data...');
      user.name = 'Sarthak Tanpure';
      user.degree = 'B.E. Information Technology';
      user.college = 'Pravara Rural Engineering College, Loni';
      user.expectedGraduation = 2028;
      user.academicStage = 'Third year';
      user.reportedCGPA = 9.0;
      user.primaryLanguageDSA = 'Java';
      user.save();
    }

    const userId = user._id;

    // 2. User Preferences (Mon-Thu 6h, Fri-Sun 10h)
    await UserPreference.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        weeklyAvailabilityHours: {
          monday: 6,
          tuesday: 6,
          wednesday: 6,
          thursday: 6,
          friday: 10,
          saturday: 10,
          sunday: 10
        },
        quietHours: { enabled: true, start: '23:00', end: '07:00' },
        notifications: {
          browserPush: true,
          inApp: true,
          dsaReminders: true,
          deadlineAlerts: true,
          dailyBriefing: true
        },
        deepWorkSessionDurationMinutes: 60,
        breakDurationMinutes: 10
      },
      { upsert: true }
    );

    // 3. Clear and seed Projects (HospitalOS, AgriConnect, MedVision AI, MedGuard AI)
    await Project.deleteMany({ user: userId });
    console.log('[Seed] Seeding 4 authentic engineering projects...');

    const projectsData = [
      {
        user: userId,
        name: 'HospitalOS',
        tagline: 'Production-ready clinical workflow and hospital management operating system',
        description: 'End-to-end hospital administrative platform featuring role-based access control (Doctor, Patient, Administrator), appointment scheduling, digital prescription handling, and MongoDB indexing for rapid electronic medical records lookup.',
        repoUrl: 'https://github.com/sarthak-tanpure/HospitalOS',
        liveUrl: 'https://hospitalos-demo.vercel.app',
        techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'JWT', 'Tailwind CSS'],
        category: 'Full-Stack Web',
        status: 'mvp_complete',
        features: [
          { title: 'Role-based access control with HTTP-only JWT cookies', status: 'completed' },
          { title: 'Real-time appointment slot booking & doctor scheduling', status: 'completed' },
          { title: 'Prescription PDF generation and medical history log', status: 'completed' },
          { title: 'Automated appointment reminder notifications', status: 'in_progress' }
        ],
        qualityAudit: {
          authenticationAndAuth: true,
          inputValidation: true,
          centralizedErrorHandling: true,
          apiDocumentation: true,
          databaseIndexes: true,
          loggingAndMonitoring: false,
          accessibilityAndResponsive: true,
          automatedTesting: false,
          deploymentReliability: true
        },
        engineeringDecisions: [
          {
            decision: 'Chose MongoDB Compound Indexes on { doctorId: 1, date: 1 }',
            rationale: 'Avoided full collection scans when doctors query their daily appointment schedules under peak morning check-in loads.',
            date: new Date()
          }
        ]
      },
      {
        user: userId,
        name: 'AgriConnect',
        tagline: 'Direct farmer-to-buyer agricultural marketplace and price discovery portal',
        description: 'Empowers rural agricultural producers to sell directly to wholesale buyers without intermediaries. Features localized commodity price tracking, real-time demand alerts, and simplified mobile-friendly order workflows.',
        repoUrl: 'https://github.com/sarthak-tanpure/AgriConnect',
        liveUrl: 'https://agriconnect-rural.vercel.app',
        techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'Socket.IO', 'Tailwind CSS'],
        category: 'Full-Stack Web',
        status: 'mvp_complete',
        features: [
          { title: 'Direct crop listing with photo uploads and price quotes', status: 'completed' },
          { title: 'Live mandi commodity market rate aggregator', status: 'completed' },
          { title: 'Order negotiation and buyer fulfillment pipeline', status: 'completed' },
          { title: 'Multilingual vernacular UI support for rural farmers', status: 'in_progress' }
        ],
        qualityAudit: {
          authenticationAndAuth: true,
          inputValidation: true,
          centralizedErrorHandling: true,
          apiDocumentation: false,
          databaseIndexes: true,
          loggingAndMonitoring: false,
          accessibilityAndResponsive: true,
          automatedTesting: false,
          deploymentReliability: true
        }
      },
      {
        user: userId,
        name: 'MedVision AI',
        tagline: 'Deep learning diagnostic imaging inference platform for clinical radiology',
        description: 'Cloud-assisted medical image analysis portal using convolutional neural networks and PyTorch inference pipelines. Enables radiologists to upload X-ray scans and receive automated preliminary heatmaps and anomaly flags.',
        repoUrl: 'https://github.com/sarthak-tanpure/MedVisionAI',
        liveUrl: 'https://medvision-ai.vercel.app',
        techStack: ['Python', 'FastAPI', 'PyTorch', 'React', 'Docker', 'OpenCV'],
        category: 'AI / ML Engineering',
        status: 'in_development',
        features: [
          { title: 'FastAPI microservice for asynchronous PyTorch model inference', status: 'completed' },
          { title: 'DICOM/PNG medical image upload and preprocessing pipeline', status: 'completed' },
          { title: 'Grad-CAM visual heatmap generation for abnormality localization', status: 'in_progress' },
          { title: 'Clinical verification review queue for licensed physicians', status: 'planned' }
        ],
        qualityAudit: {
          authenticationAndAuth: false,
          inputValidation: true,
          centralizedErrorHandling: true,
          apiDocumentation: true,
          databaseIndexes: false,
          loggingAndMonitoring: false,
          accessibilityAndResponsive: true,
          automatedTesting: false,
          deploymentReliability: false
        }
      },
      {
        user: userId,
        name: 'MedGuard AI',
        tagline: 'Cryptographic data integrity and immutable healthcare audit verification system',
        description: 'Enterprise healthcare audit trail architecture protecting patient electronic health records from unauthorized tampering. Combines cryptographic hash chaining with decentralized access verification.',
        repoUrl: 'https://github.com/sarthak-tanpure/MedGuardAI',
        liveUrl: 'https://medguard-ai.vercel.app',
        techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'Solidity', 'Web3.js', 'Tailwind CSS'],
        category: 'Systems / Security',
        status: 'mvp_complete',
        features: [
          { title: 'SHA-256 cryptographic document fingerprinting on patient record edits', status: 'completed' },
          { title: 'Smart contract audit trail anchoring for immutable tamper-evidence', status: 'completed' },
          { title: 'Role-based compliance reporting dashboard for hospital auditors', status: 'completed' },
          { title: 'Zero-knowledge verification proofs for patient identity sharing', status: 'planned' }
        ],
        qualityAudit: {
          authenticationAndAuth: true,
          inputValidation: true,
          centralizedErrorHandling: true,
          apiDocumentation: true,
          databaseIndexes: true,
          loggingAndMonitoring: true,
          accessibilityAndResponsive: true,
          automatedTesting: false,
          deploymentReliability: true
        }
      }
    ];

    await Project.insertMany(projectsData);

    // 4. Seed Canonical Curated DSA Problems
    await DSAProblem.deleteMany({ user: userId });
    console.log('[Seed] Seeding canonical DSA curriculum in Java...');

    const now = new Date();
    const dsaProblemsData = [
      // Arrays & Strings
      {
        user: userId,
        title: 'Two Sum',
        platform: 'LeetCode',
        sourceUrl: 'https://leetcode.com/problems/two-sum/',
        difficulty: 'Easy',
        topic: 'Arrays and strings',
        tags: ['Array', 'Hash Table'],
        status: 'solved',
        confidence: 5,
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(N)',
        codeLanguage: 'Java',
        lastSolvedAt: new Date(now.getTime() - 4 * 86400000),
        nextRevisionDate: new Date(now.getTime() + 10 * 86400000),
        revisionIntervalDays: 14,
        approachNotes: 'Use HashMap to store complements (target - num). Check map in single pass.'
      },
      {
        user: userId,
        title: 'Best Time to Buy and Sell Stock',
        platform: 'LeetCode',
        sourceUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
        difficulty: 'Easy',
        topic: 'Arrays and strings',
        tags: ['Array', 'Dynamic Programming'],
        status: 'solved',
        confidence: 4,
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        codeLanguage: 'Java',
        lastSolvedAt: new Date(now.getTime() - 2 * 86400000),
        nextRevisionDate: new Date(now.getTime() + 5 * 86400000),
        revisionIntervalDays: 7,
        approachNotes: 'Maintain minimum price seen so far and track maximum profit greedily.'
      },
      // Two Pointers
      {
        user: userId,
        title: '3Sum',
        platform: 'LeetCode',
        sourceUrl: 'https://leetcode.com/problems/3sum/',
        difficulty: 'Medium',
        topic: 'Two pointers',
        tags: ['Two Pointers', 'Sorting'],
        status: 'needs_revision',
        confidence: 3,
        timeComplexity: 'O(N^2)',
        spaceComplexity: 'O(1)',
        codeLanguage: 'Java',
        lastSolvedAt: new Date(now.getTime() - 1 * 86400000),
        nextRevisionDate: new Date(now.getTime() - 3600000), // Due now!
        revisionIntervalDays: 1,
        approachNotes: 'Sort array first. Fix one element and run two pointers (left and right) on remainder. Skip duplicates carefully.'
      },
      {
        user: userId,
        title: 'Container With Most Water',
        platform: 'LeetCode',
        sourceUrl: 'https://leetcode.com/problems/container-with-most-water/',
        difficulty: 'Medium',
        topic: 'Two pointers',
        tags: ['Two Pointers', 'Greedy'],
        status: 'solved',
        confidence: 4,
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        codeLanguage: 'Java',
        lastSolvedAt: new Date(now.getTime() - 3 * 86400000),
        nextRevisionDate: new Date(now.getTime() + 4 * 86400000),
        revisionIntervalDays: 7,
        approachNotes: 'Left pointer at 0, right at end. Calculate area = min(height[l], height[r]) * (r - l). Move the pointer with the smaller height.'
      },
      // Sliding Window
      {
        user: userId,
        title: 'Longest Substring Without Repeating Characters',
        platform: 'LeetCode',
        sourceUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
        difficulty: 'Medium',
        topic: 'Sliding window',
        tags: ['Sliding Window', 'Hash Table'],
        status: 'solved',
        confidence: 4,
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(min(M, N))',
        codeLanguage: 'Java',
        lastSolvedAt: new Date(now.getTime() - 5 * 86400000),
        nextRevisionDate: new Date(now.getTime() + 2 * 86400000),
        revisionIntervalDays: 7,
        approachNotes: 'Maintain window with HashMap of character to latest index. Advance left pointer when duplicate encountered.'
      },
      // Binary Search
      {
        user: userId,
        title: 'Search in Rotated Sorted Array',
        platform: 'LeetCode',
        sourceUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
        difficulty: 'Medium',
        topic: 'Binary search',
        tags: ['Binary Search'],
        status: 'needs_revision',
        confidence: 2,
        timeComplexity: 'O(log N)',
        spaceComplexity: 'O(1)',
        codeLanguage: 'Java',
        lastSolvedAt: new Date(now.getTime() - 2 * 86400000),
        nextRevisionDate: new Date(now.getTime() - 7200000), // Due now!
        revisionIntervalDays: 1,
        approachNotes: 'Identify which half is sorted (left or right). Check if target lies within the sorted half boundaries to shrink search window.'
      },
      // Linked Lists
      {
        user: userId,
        title: 'Reverse Linked List',
        platform: 'LeetCode',
        sourceUrl: 'https://leetcode.com/problems/reverse-linked-list/',
        difficulty: 'Easy',
        topic: 'Linked lists',
        tags: ['Linked List', 'Recursion'],
        status: 'solved',
        confidence: 5,
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        codeLanguage: 'Java',
        lastSolvedAt: new Date(now.getTime() - 6 * 86400000),
        nextRevisionDate: new Date(now.getTime() + 8 * 86400000),
        revisionIntervalDays: 14,
        approachNotes: 'Iterative 3 pointers: prev = null, curr = head, nextTemp. Reconnect curr.next = prev.'
      },
      // Trees & BST
      {
        user: userId,
        title: 'Lowest Common Ancestor of a Binary Search Tree',
        platform: 'LeetCode',
        sourceUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/',
        difficulty: 'Medium',
        topic: 'Trees and binary search trees',
        tags: ['Tree', 'BST', 'DFS'],
        status: 'solved',
        confidence: 4,
        timeComplexity: 'O(H)',
        spaceComplexity: 'O(1)',
        codeLanguage: 'Java',
        lastSolvedAt: new Date(now.getTime() - 1 * 86400000),
        nextRevisionDate: new Date(now.getTime() + 3 * 86400000),
        revisionIntervalDays: 3,
        approachNotes: 'If both p and q are greater than root.val, search right subtree. If both smaller, search left. Otherwise split point is LCA.'
      },
      // Graphs
      {
        user: userId,
        title: 'Number of Islands',
        platform: 'LeetCode',
        sourceUrl: 'https://leetcode.com/problems/number-of-islands/',
        difficulty: 'Medium',
        topic: 'Graphs',
        tags: ['Graph', 'BFS', 'DFS', 'Matrix'],
        status: 'solved',
        confidence: 4,
        timeComplexity: 'O(M * N)',
        spaceComplexity: 'O(M * N)',
        codeLanguage: 'Java',
        lastSolvedAt: new Date(now.getTime() - 3 * 86400000),
        nextRevisionDate: new Date(now.getTime() + 4 * 86400000),
        revisionIntervalDays: 7,
        approachNotes: 'Iterate grid. When encountering "1", increment island counter and trigger DFS/BFS sink to mark connected land as "0".'
      },
      {
        user: userId,
        title: 'Course Schedule (Cycle Detection / Topo Sort)',
        platform: 'LeetCode',
        sourceUrl: 'https://leetcode.com/problems/course-schedule/',
        difficulty: 'Medium',
        topic: 'Graphs',
        tags: ['Graph', 'Topological Sort', 'BFS'],
        status: 'needs_revision',
        confidence: 2,
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V + E)',
        codeLanguage: 'Java',
        lastSolvedAt: new Date(now.getTime() - 1 * 86400000),
        nextRevisionDate: new Date(now.getTime() - 1800000), // Due now!
        revisionIntervalDays: 1,
        approachNotes: 'Kahn’s Algorithm using indegree array and Queue. If processed node count equals numCourses, DAG has no directed cycle.'
      },
      // Dynamic Programming
      {
        user: userId,
        title: 'Coin Change',
        platform: 'LeetCode',
        sourceUrl: 'https://leetcode.com/problems/coin-change/',
        difficulty: 'Medium',
        topic: 'Dynamic programming',
        tags: ['Dynamic Programming', 'Knapsack'],
        status: 'needs_revision',
        confidence: 3,
        timeComplexity: 'O(amount * coins.length)',
        spaceComplexity: 'O(amount)',
        codeLanguage: 'Java',
        lastSolvedAt: new Date(now.getTime() - 2 * 86400000),
        nextRevisionDate: new Date(now.getTime() - 5400000), // Due now!
        revisionIntervalDays: 1,
        approachNotes: 'Bottom-up DP array initialized to amount + 1. dp[i] = min(dp[i], dp[i - coin] + 1).'
      },
      {
        user: userId,
        title: 'Longest Increasing Subsequence',
        platform: 'LeetCode',
        sourceUrl: 'https://leetcode.com/problems/longest-increasing-subsequence/',
        difficulty: 'Medium',
        topic: 'Dynamic programming',
        tags: ['Dynamic Programming', 'Binary Search'],
        status: 'attempted',
        confidence: 2,
        timeComplexity: 'O(N log N)',
        spaceComplexity: 'O(N)',
        codeLanguage: 'Java',
        approachNotes: 'Tails array with Binary Search (Arrays.binarySearch) to replace or append.'
      }
    ];

    await DSAProblem.insertMany(dsaProblemsData);

    // 5. Seed Core Computer Science Topics & Syllabi
    await LearningTopic.deleteMany({ user: userId });
    console.log('[Seed] Seeding Core CS modules...');

    const csTopicsData = [
      {
        user: userId,
        subject: 'Object-Oriented Programming',
        title: 'Core OOP Paradigms & SOLID Principles in Java',
        confidenceRating: 4,
        subtopics: [
          { title: 'Encapsulation & Data Hiding (Access Modifiers)', isCompleted: true },
          { title: 'Inheritance vs Composition (Diamond Problem & Interfaces)', isCompleted: true },
          { title: 'Polymorphism (Method Overloading vs Overriding)', isCompleted: true },
          { title: 'Abstraction (Abstract Classes vs Default Interface Methods)', isCompleted: true },
          { title: 'SOLID Design Principles with real software examples', isCompleted: false },
          { title: 'Creational Patterns (Singleton & Factory in production)', isCompleted: false }
        ],
        notes: 'Java supports multiple inheritance through default interface implementations. Remember thread-safe Singleton using Bill Pugh idiom or double-checked locking.'
      },
      {
        user: userId,
        subject: 'Database Management Systems',
        title: 'Relational & NoSQL Database Internals',
        confidenceRating: 4,
        subtopics: [
          { title: 'ACID Transactions & WAL (Write-Ahead Logging)', isCompleted: true },
          { title: 'B+ Tree Indexing vs Hash Indexing (Range Query mechanics)', isCompleted: true },
          { title: 'Database Normalization (1NF through BCNF & when to denormalize)', isCompleted: true },
          { title: 'Transaction Isolation Levels (Read Committed, Repeatable Read, Serializable)', isCompleted: false },
          { title: 'Query Execution Plans & Index Cardinality Analysis', isCompleted: false }
        ],
        notes: 'B+ Tree leaf nodes are linked sequentially for O(log N) point lookups and efficient sequential range scans.'
      },
      {
        user: userId,
        subject: 'Operating Systems',
        title: 'Concurrency, Memory Management, and OS Architecture',
        confidenceRating: 3,
        subtopics: [
          { title: 'Process vs Thread (Context Switching & PCB/TCB overhead)', isCompleted: true },
          { title: 'Inter-Process Communication (Pipes, Sockets, Shared Memory)', isCompleted: true },
          { title: 'CPU Scheduling Algorithms (Round Robin, Multilevel Feedback Queue)', isCompleted: false },
          { title: 'Deadlock Conditions (Coffman Conditions) & Banker’s Algorithm', isCompleted: false },
          { title: 'Virtual Memory, Paging, Page Faults, and TLB cache', isCompleted: false }
        ],
        notes: 'Context switching threads sharing the same memory address space does not invalidate the CPU TLB cache, making thread switching significantly faster than process switching.'
      },
      {
        user: userId,
        subject: 'Computer Networks',
        title: 'Transport Layer, Protocols, and Web Infrastructure',
        confidenceRating: 3,
        subtopics: [
          { title: 'OSI 7-Layer vs TCP/IP 4-Layer models', isCompleted: true },
          { title: 'TCP 3-Way Handshake (SYN, SYN-ACK, ACK) and 4-Way Teardown', isCompleted: true },
          { title: 'TCP Flow Control (Sliding Window) vs Congestion Control', isCompleted: false },
          { title: 'DNS Resolution Lifecycle and Caching Hierarchy', isCompleted: false },
          { title: 'TLS 1.3 Handshake & Certificate Authorities (HTTPS)', isCompleted: false }
        ],
        notes: 'TCP provides reliable, ordered byte streams via sequence numbers and ACK retransmission timers; UDP prioritizes low latency with zero connection state.'
      },
      {
        user: userId,
        subject: 'SQL',
        title: 'Complex Relational Queries & Window Functions',
        confidenceRating: 4,
        subtopics: [
          { title: 'Inner, Left, Right, and Full Outer Joins', isCompleted: true },
          { title: 'Aggregation with GROUP BY and HAVING clauses', isCompleted: true },
          { title: 'Window Functions (ROW_NUMBER(), RANK(), DENSE_RANK())', isCompleted: true },
          { title: 'Common Table Expressions (CTEs) & Recursive queries', isCompleted: false },
          { title: 'Subqueries vs Correlated Subqueries performance', isCompleted: false }
        ],
        notes: 'DENSE_RANK() does not skip rank numbers on ties, whereas RANK() leaves gaps.'
      },
      {
        user: userId,
        subject: 'Software Engineering & Testing',
        title: 'Production Testing Strategy & CI/CD Pipelines',
        confidenceRating: 3,
        subtopics: [
          { title: 'Unit Testing vs Integration Testing (Mocking boundaries)', isCompleted: true },
          { title: 'Test Pyramid and Coverage Analysis (Line vs Branch coverage)', isCompleted: true },
          { title: 'CI/CD pipeline configuration with GitHub Actions', isCompleted: false },
          { title: 'Semantic Versioning and Trunk-Based Development', isCompleted: false }
        ],
        notes: 'Always mock external network I/O and databases during unit tests to guarantee deterministic, sub-second execution.'
      },
      {
        user: userId,
        subject: 'System Design',
        title: 'High-Level Distributed Systems Fundamentals',
        confidenceRating: 3,
        subtopics: [
          { title: 'Horizontal vs Vertical Scaling and Stateless Application Servers', isCompleted: true },
          { title: 'Load Balancing Algorithms (Round Robin, Least Connections, Consistent Hashing)', isCompleted: true },
          { title: 'Caching Strategies (Cache-Aside, Write-Through, Write-Behind)', isCompleted: false },
          { title: 'Database Sharding & Replication (Primary-Replica lag)', isCompleted: false },
          { title: 'Rate Limiting Algorithms (Token Bucket, Leaky Bucket)', isCompleted: false }
        ],
        notes: 'Consistent Hashing minimizes key reassignment during cache server scaling from O(K) down to O(K/N).'
      }
    ];

    await LearningTopic.insertMany(csTopicsData);

    // 6. Seed CS Practice Quizzes with explanations
    await CSQuiz.deleteMany({});
    console.log('[Seed] Seeding CS Practice Quizzes...');

    const quizzesData = [
      {
        subject: 'Database Management Systems',
        title: 'DBMS Concurrency & Indexing Master Quiz',
        difficulty: 'Intermediate',
        questions: [
          {
            question: 'Why are B+ Trees preferred over Binary Search Trees for relational database indexing on disk?',
            options: [
              'B+ Trees are simpler to implement in memory.',
              'B+ Trees have a high branching factor, reducing the number of disk I/O operations required for lookups.',
              'Binary Search Trees cannot store string data types.',
              'B+ Trees do not require balanced tree rotations.'
            ],
            correctOptionIndex: 1,
            explanation: 'Disk I/O is several orders of magnitude slower than CPU memory. B+ Trees have a very wide branching factor (fan-out of hundreds), meaning trees remain shallow (3-4 levels) and locate records in minimal disk block reads.'
          },
          {
            question: 'Which transaction isolation level prevents Dirty Reads and Non-Repeatable Reads, but may still permit Phantom Reads in standard ANSI SQL?',
            options: [
              'Read Uncommitted',
              'Read Committed',
              'Repeatable Read',
              'Serializable'
            ],
            correctOptionIndex: 2,
            explanation: 'Repeatable Read locks all rows that are read throughout the transaction, preventing dirty reads and non-repeatable reads. However, range queries can still observe newly inserted rows (phantom reads) unless serializable range locking is active.'
          }
        ]
      },
      {
        subject: 'Operating Systems',
        title: 'OS Process & Concurrency Fundamentals',
        difficulty: 'Intermediate',
        questions: [
          {
            question: 'Which of the following conditions is NOT one of the four necessary Coffman conditions for a deadlock?',
            options: [
              'Mutual Exclusion',
              'Hold and Wait',
              'Preemptive Resource Allocation',
              'Circular Wait'
            ],
            correctOptionIndex: 2,
            explanation: 'The four Coffman conditions are: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. If preemption is allowed, deadlocks cannot persist.'
          }
        ]
      }
    ];

    await CSQuiz.insertMany(quizzesData);

    // 7. Seed Tasks and Today's MIT Priorities
    await Task.deleteMany({ user: userId });
    console.log('[Seed] Seeding daily task priorities and MITs...');

    const todayDate = new Date();
    todayDate.setHours(12, 0, 0, 0);

    const tasksData = [
      {
        user: userId,
        title: 'Master Kahn’s Algorithm for Cycle Detection in Graphs (Java)',
        description: 'Implement Topological Sort using indegree array and Queue. Solve Course Schedule I and II on LeetCode.',
        category: 'dsa',
        priority: 'P1_CRITICAL',
        status: 'today',
        isMIT: true,
        estimatedMinutes: 60,
        scheduledDate: todayDate
      },
      {
        user: userId,
        title: 'Add Vitest & Supertest Integration Tests to HospitalOS API',
        description: 'Write automated test suites for patient registration and doctor appointment scheduling endpoints to satisfy Quality Audit checklist.',
        category: 'project',
        priority: 'P1_CRITICAL',
        status: 'today',
        isMIT: true,
        estimatedMinutes: 75,
        scheduledDate: todayDate
      },
      {
        user: userId,
        title: 'Review DBMS Indexing Internals (B+ Trees vs Hash Indexes)',
        description: 'Document difference between clustered and secondary indexes for technical interview prep notes.',
        category: 'cs_fundamentals',
        priority: 'P2_HIGH',
        status: 'today',
        isMIT: true,
        estimatedMinutes: 45,
        scheduledDate: todayDate
      },
      {
        user: userId,
        title: 'Tailor Resume for Google & Microsoft 2026/2027 Summer Internships',
        description: 'Highlight HospitalOS architecture metrics and MedGuard AI cryptographic audit logging in 1-page format.',
        category: 'application',
        priority: 'P2_HIGH',
        status: 'inbox',
        isMIT: false,
        estimatedMinutes: 45,
        scheduledDate: new Date(todayDate.getTime() + 86400000)
      }
    ];

    await Task.insertMany(tasksData);

    // 8. Seed Study Sessions for Today
    await StudySession.deleteMany({ user: userId });
    console.log('[Seed] Scheduling today’s study sessions...');

    const s1Start = new Date(todayDate); s1Start.setHours(9, 30, 0, 0);
    const s1End = new Date(todayDate); s1End.setHours(10, 30, 0, 0);

    const s2Start = new Date(todayDate); s2Start.setHours(11, 0, 0, 0);
    const s2End = new Date(todayDate); s2End.setHours(12, 15, 0, 0);

    const s3Start = new Date(todayDate); s3Start.setHours(14, 30, 0, 0);
    const s3End = new Date(todayDate); s3End.setHours(15, 30, 0, 0);

    await StudySession.insertMany([
      {
        user: userId,
        title: 'DSA Spaced Revision: 3Sum & Rotated Binary Search',
        sessionType: 'revision',
        scheduledStartTime: s1Start,
        scheduledEndTime: s1End,
        plannedMinutes: 60,
        actualMinutes: 60,
        status: 'completed',
        notes: 'Cleared 2 overdue problems. Two pointers and binary search boundary logic solid.'
      },
      {
        user: userId,
        title: 'Deep Work: Graph Topological Sort (Course Schedule) in Java',
        sessionType: 'deep_work',
        scheduledStartTime: s2Start,
        scheduledEndTime: s2End,
        plannedMinutes: 75,
        status: 'scheduled',
        notes: 'Implement BFS Kahn algorithm and DFS cycle detection.'
      },
      {
        user: userId,
        title: 'Engineering Lab: HospitalOS Automated Test Suite',
        sessionType: 'project_building',
        scheduledStartTime: s3Start,
        scheduledEndTime: s3End,
        plannedMinutes: 60,
        status: 'scheduled',
        notes: 'Setup Supertest and test appointment creation validation.'
      }
    ]);

    // 9. Seed Curated Learning Resources
    await Resource.deleteMany({});
    console.log('[Seed] Seeding verified learning resources...');

    await Resource.insertMany([
      {
        title: 'Official Java Language & Collections Documentation',
        url: 'https://docs.oracle.com/en/java/javase/21/docs/api/',
        category: 'DSA Practice',
        authorOrSource: 'Oracle',
        isFree: true,
        costDescription: 'Free & Official',
        description: 'Authoritative documentation for Java Collections Framework (HashMap, PriorityQueue, ArrayDeque, ArrayList, TreeMap).',
        tags: ['Java', 'Collections', 'Official Documentation']
      },
      {
        title: 'NeetCode / Blind 75 Roadmap & Canonical Patterns',
        url: 'https://neetcode.io/roadmap',
        category: 'DSA Practice',
        authorOrSource: 'NeetCode',
        isFree: true,
        costDescription: 'Free Public Practice',
        description: 'Structured visual pattern roadmap covering Two Pointers, Sliding Window, Trees, Graphs, and DP.',
        tags: ['DSA', 'LeetCode', 'Patterns']
      },
      {
        title: 'Designing Data-Intensive Applications (Overview & Notes)',
        url: 'https://dataintensive.net/',
        category: 'CS Fundamentals',
        authorOrSource: 'Martin Kleppmann',
        isFree: true,
        costDescription: 'Free Summaries & Official Site',
        description: 'Industry benchmark for distributed data stores, replication, partitioning, and ACID transactions.',
        tags: ['Distributed Systems', 'DBMS', 'Architecture']
      },
      {
        title: 'PostgreSQL & Relational Indexing Deep Dive',
        url: 'https://use-the-index-luke.com/',
        category: 'CS Fundamentals',
        authorOrSource: 'Markus Winand',
        isFree: true,
        costDescription: 'Free Guide',
        description: 'Comprehensive guide to B+ Tree indexing, join algorithms, and execution plan optimization.',
        tags: ['SQL', 'Indexing', 'Performance']
      },
      {
        title: 'MDN Web Docs — Modern Web Standards & APIs',
        url: 'https://developer.mozilla.org/',
        category: 'Full-Stack Development',
        authorOrSource: 'Mozilla',
        isFree: true,
        costDescription: 'Free & Open Source',
        description: 'Gold standard documentation for HTTP, Web Push notifications, Service Workers, and JavaScript fundamentals.',
        tags: ['JavaScript', 'HTTP', 'Web Push']
      },
      {
        title: 'Google Students & Early Career Portal',
        url: 'https://buildyourfuture.withgoogle.com/',
        category: 'Official Internship Portals',
        authorOrSource: 'Google',
        isFree: true,
        costDescription: 'Official Portal',
        description: 'Official portal for Google Summer Internships, STEP internships, and university student hiring programs in India.',
        tags: ['Internships', 'Google', 'Student Programs']
      }
    ]);

    // 10. Seed Internship Radar Baseline Data
    console.log('[Seed] Syncing internship opportunities radar...');
    await JobRadarService.syncOpportunities();

    console.log('[Seed] SUCCESS: Database seeding complete!');
    console.log(`[Seed] User Account Ready: ${userEmail} (Password: password123)`);
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Database seeding failed:', err);
    process.exit(1);
  }
}

seedDatabase();
