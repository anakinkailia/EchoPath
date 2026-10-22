import type { Experience, Interview } from "./domain";

// Editorial preparation material only. Keep it outside contributor interview logs
// and submission payloads: these reports describe other employers and candidates.
export type InterviewResearch = {
  company: string;
  role: string;
  title: string;
  url: string;
  date: string;
  summary: string;
  relevance: string;
  sections: Interview["rounds"];
};

const bytedance = {
  company: "ByteDance",
  role: "Data Analyst · Product",
  title: "Product data analysis interview experience",
  url: "https://www.nowcoder.com/discuss/353157729369923584",
  date: "2021-04-12",
};

const xiaohongshu = {
  company: "Xiaohongshu (RED)",
  role: "Data Development & Data Analysis",
  title: "Data development and analytics interview collection",
  url: "https://www.nowcoder.com/discuss/939317865046343680",
  date: "2026-10-12",
};

// Concise English paraphrases of selected publicly visible questions. Source
// section labels are retained where available; unknown rounds are not invented.
export const interviewResearch: Record<string, InterviewResearch> = {
  "demo-1": {
    ...bytedance,
    summary:
      "The candidate described business scenarios followed by SQL tasks, with follow-up questions about metrics and conclusions.",
    relevance:
      "Practise the metric definitions and retention queries used in this analytics role.",
    sections: [
      {
        label: "Project and metric questions",
        questions: [
          {
            q: "Describe a recent analytics project. Which metrics did you use, and what supported your conclusion?",
            type: "resume_deep_dive",
            note: "",
          },
          {
            q: "Which three metrics would you track for a newly launched short-video app, and why?",
            type: "product",
            note: "",
          },
        ],
      },
      {
        label: "SQL tasks",
        questions: [
          {
            q: "Calculate next-day user retention in SQL.",
            type: "sql",
            note: "",
          },
          {
            q: "Find the five highest Chinese-language exam scores in each of five classes using SQL.",
            type: "sql",
            note: "",
          },
        ],
      },
    ],
  },
  "demo-2": {
    company: "Deloitte",
    role: "Consulting",
    title: "Consulting interviews: group discussion, manager and partner",
    url: "https://www.nowcoder.com/discuss/353156007322918912",
    date: "2020-01-09",
    summary:
      "A candidate reported a hotel case with a 20-minute group discussion and English summaries, followed by manager and partner interviews.",
    relevance:
      "Practise clear case communication, teamwork reflection and consulting motivation alongside the reporting prototype.",
    sections: [
      {
        label: "Group case",
        questions: [
          {
            q: "Summarize the hotel case discussion in English in one minute.",
            type: "case",
            note: "The post describes the exercise but does not publish the full case materials.",
          },
        ],
      },
      {
        label: "Manager interview",
        questions: [
          {
            q: "Who performed best in the group discussion, and how would you assess your own contribution?",
            type: "behavioral",
            note: "",
          },
          {
            q: "What qualities do you think the Big Four look for in candidates?",
            type: "behavioral",
            note: "",
          },
        ],
      },
      {
        label: "Partner interview",
        questions: [
          {
            q: "Why Deloitte, and have you applied to other Big Four firms?",
            type: "behavioral",
            note: "",
          },
        ],
      },
    ],
  },
  "demo-3": {
    company: "NetEase",
    role: "Data Analyst · Hangzhou Research",
    title: "Data analysis interview: two technical rounds and HR",
    url: "https://www.nowcoder.com/discuss/353154088005214208",
    date: "2017-08-30",
    summary:
      "The candidate reported two technical interviews and HR. The first technical round explored model choices, preprocessing and statistics.",
    relevance:
      "These transferable modeling questions support the healthcare forecasting example; the source interview was not a healthcare role.",
    sections: [
      {
        label: "First technical interview · selected questions",
        questions: [
          {
            q: "Why did you choose the model in your project, and what are its strengths and weaknesses?",
            type: "technical",
            note: "",
          },
          {
            q: "How did you preprocess the project data?",
            type: "technical",
            note: "",
          },
          {
            q: "How do logistic regression and linear regression differ?",
            type: "stats",
            note: "",
          },
          {
            q: "Explain p-values and hypothesis testing.",
            type: "stats",
            note: "",
          },
        ],
      },
    ],
  },
  "demo-4": {
    ...bytedance,
    summary:
      "The business case examined advertising revenue against next-day retention, including experiment design and rollout decisions.",
    relevance:
      "Practise product tradeoffs and experiments before recommending a feature or monetization change.",
    sections: [
      {
        label: "Product and experimentation case",
        questions: [
          {
            q: "How would you assess whether adding advertising slots to a short-video feed generates value?",
            type: "product",
            note: "",
          },
          { q: "How would you run an A/B test?", type: "stats", note: "" },
          {
            q: "Which metrics would you use to evaluate the advertising change?",
            type: "product",
            note: "",
          },
          {
            q: "Advertising increases daily revenue but reduces next-day retention. How would you decide whether to launch?",
            type: "case",
            note: "",
          },
        ],
      },
    ],
  },
  "demo-5": {
    ...xiaohongshu,
    summary:
      "The public collection includes a brand-marketing analytics case dated October 29, 2025. Only visible, complete questions are selected here.",
    relevance:
      "Connect campaign funnels, attribution boundaries and experiments to the marketing scorecard.",
    sections: [
      {
        label: "Brand analytics case · October 29, 2025",
        questions: [
          {
            q: "How would you build an exposure-to-purchase funnel while separating organic and paid traffic?",
            type: "case",
            note: "",
          },
          {
            q: "Click-through rate rises while reading completion and dwell time fall. How would you investigate?",
            type: "case",
            note: "",
          },
          {
            q: "How would you prevent interference between concurrent feed and search experiments?",
            type: "stats",
            note: "",
          },
        ],
      },
    ],
  },
  "demo-6": {
    ...xiaohongshu,
    summary:
      "The collection discusses event timing, warehouse quality, business modeling and a weekly reporting pipeline across separate interview reports.",
    relevance:
      "Apply these data-modeling and reporting questions to the nonprofit dashboard; the source employer was a technology platform.",
    sections: [
      {
        label: "Selected data modeling and reporting questions",
        questions: [
          {
            q: "Explain a project's business context, modeling approach and implementation challenges.",
            type: "resume_deep_dive",
            note: "",
          },
          {
            q: "How would you judge whether a data warehouse is well built?",
            type: "technical",
            note: "",
          },
          {
            q: "How would you model event logs to support different time dimensions for real-time metrics?",
            type: "technical",
            note: "",
          },
          {
            q: "Describe a weekly Python/SQL reporting pipeline with incremental extraction and backfill repair.",
            type: "technical",
            note: "",
          },
        ],
      },
    ],
  },
  "demo-7": {
    company: "Meituan",
    role: "Data / Business Analysis",
    title: "JD, Meituan and Toutiao analytics interview experiences",
    url: "https://www.nowcoder.com/discuss/353154491329486848",
    date: "2018-11-30",
    summary:
      "The Meituan section reports three technical rounds and HR, with demand estimation, recommendation features and a store-opening strategy case.",
    relevance:
      "Practise demand sizing and operational decisions. These are transferable business cases, not a warehouse interview account.",
    sections: [
      {
        label: "Meituan · first technical interview",
        questions: [
          {
            q: "Estimate Meituan's daily order volume in Shanghai.",
            type: "case",
            note: "",
          },
        ],
      },
      {
        label: "Meituan · second technical interview",
        questions: [
          {
            q: "Which features would you use for personalized electronic-menu recommendations?",
            type: "technical",
            note: "",
          },
          {
            q: "What problems arise when popular dishes are recommended solely by sales volume?",
            type: "case",
            note: "",
          },
        ],
      },
      {
        label: "Meituan · third technical interview",
        questions: [
          {
            q: "How would you use Meituan-Dianping data to advise someone opening a store?",
            type: "case",
            note: "",
          },
        ],
      },
    ],
  },
  "demo-8": {
    company: "Multiple employers · not named",
    role: "User Researcher · Experienced Hire",
    title: "User research interview experience",
    url: "https://www.nowcoder.com/discuss/353155602845212672",
    date: "2019-10-14",
    summary:
      "A researcher described project deep dives, research-method questions and a live case about falling payment and retention rates.",
    relevance:
      "Practise sample selection and research design for the customer-insights role.",
    sections: [
      {
        label: "Research methods and live case",
        questions: [
          {
            q: "Which research methods are you strongest in?",
            type: "technical",
            note: "",
          },
          {
            q: "Which data analysis methods would you use in quantitative research?",
            type: "stats",
            note: "",
          },
          {
            q: "How would you select participants and determine sample size?",
            type: "stats",
            note: "",
          },
          {
            q: "Payment and retention rates are falling. How would you investigate the causes through user research?",
            type: "case",
            note: "",
          },
        ],
      },
    ],
  },
  "demo-9": {
    company: "Tencent",
    role: "Financial Management & Analysis",
    title: "Finance recruitment: interviews and a presentation case",
    url: "https://www.nowcoder.com/discuss/389925775372283904",
    date: "2022-08-18",
    summary:
      "The candidate described group, individual and HR interviews, then a 48-hour presentation case with questions about data accuracy and calculations.",
    relevance:
      "Prepare to defend the numbers in the finance report and explain collaboration with business teams.",
    sections: [
      {
        label: "Individual interviews · selected topics",
        questions: [
          {
            q: "What did you learn from your internship, and what would you reflect on or improve?",
            type: "resume_deep_dive",
            note: "",
          },
          {
            q: "Which data-processing tools do you know, and how proficient are you?",
            type: "technical",
            note: "",
          },
          {
            q: "Describe a team conflict and how you handled it.",
            type: "behavioral",
            note: "",
          },
        ],
      },
      {
        label: "Take-home presentation case · 48 hours",
        questions: [
          {
            q: "Present your case analysis and explain the calculation logic behind your figures.",
            type: "case",
            note: "The candidate reported being challenged on data accuracy; the full case is not provided.",
          },
        ],
      },
    ],
  },
  "demo-10": {
    company: "Yuanfudao",
    role: "Data Analysis",
    title: "2020 graduate recruitment: analytics interview experiences",
    url: "https://www.nowcoder.com/discuss/353155459471319040",
    date: "2019-09-17",
    summary:
      "The Yuanfudao section covers time-series methods, classification versus clustering and analyzing an unfamiliar industry.",
    relevance:
      "Use these forecasting and problem-framing questions for the energy project. The source is an education-sector interview, not a sustainability placement.",
    sections: [
      {
        label: "Selected forecasting and analysis questions",
        questions: [
          {
            q: "Explain exponential smoothing and how ARMA differs from ARIMA.",
            type: "stats",
            note: "",
          },
          {
            q: "How do classification and clustering differ, and when would you use each?",
            type: "technical",
            note: "",
          },
          {
            q: "How would you approach analyzing an unfamiliar industry?",
            type: "case",
            note: "",
          },
        ],
      },
    ],
  },
};

export function researchForExperience(
  experience: Pick<Experience, "id" | "provenance">,
): InterviewResearch | undefined {
  return experience.provenance === "fictional"
    ? interviewResearch[experience.id]
    : undefined;
}
