// Curated free learning resources (links checked October 20, 2026).
// The AI planner may only cite these by id, so plans never contain invented URLs.
export type Resource = {
  id: string;
  title: string;
  provider: string;
  url: string;
  kind: "Course" | "Tutorial" | "Practice" | "Book" | "Reference" | "Videos";
  note?: string;
  tags: string[];
};

export const resources: Resource[] = [
  // SQL
  {
    id: "sqlbolt",
    title: "SQLBolt interactive lessons",
    provider: "SQLBolt",
    url: "https://sqlbolt.com/",
    kind: "Tutorial",
    tags: ["sql", "snowflake", "bigquery", "query"],
  },
  {
    id: "mode-sql",
    title: "SQL Tutorial (basic → advanced)",
    provider: "Mode",
    url: "https://mode.com/sql-tutorial/",
    kind: "Tutorial",
    tags: ["sql", "snowflake", "bigquery", "cohort", "metric"],
  },
  {
    id: "kaggle-sql",
    title: "Intro to SQL",
    provider: "Kaggle Learn",
    url: "https://www.kaggle.com/learn/intro-to-sql",
    kind: "Course",
    tags: ["sql", "bigquery"],
  },
  {
    id: "kaggle-adv-sql",
    title: "Advanced SQL (joins, window functions)",
    provider: "Kaggle Learn",
    url: "https://www.kaggle.com/learn/advanced-sql",
    kind: "Course",
    tags: ["sql", "bigquery", "cohort"],
  },
  {
    id: "sqlzoo",
    title: "SQLZoo tutorial & exercises",
    provider: "SQLZoo",
    url: "https://sqlzoo.net/wiki/SQL_Tutorial",
    kind: "Practice",
    tags: ["sql"],
  },
  {
    id: "pgexercises",
    title: "PostgreSQL Exercises",
    provider: "pgexercises.com",
    url: "https://pgexercises.com/",
    kind: "Practice",
    tags: ["sql"],
  },
  {
    id: "datalemur",
    title: "SQL tutorial & interview questions",
    provider: "DataLemur",
    url: "https://datalemur.com/sql-tutorial",
    kind: "Practice",
    tags: ["sql", "interview"],
  },
  {
    id: "leetcode-sql50",
    title: "Top SQL 50 study plan",
    provider: "LeetCode",
    url: "https://leetcode.com/studyplan/top-sql-50/",
    kind: "Practice",
    tags: ["sql", "interview"],
  },
  {
    id: "stratascratch",
    title: "Data interview questions (free tier)",
    provider: "StrataScratch",
    url: "https://www.stratascratch.com/",
    kind: "Practice",
    tags: ["sql", "python", "pandas", "interview"],
  },
  {
    id: "bigquery-sandbox",
    title: "BigQuery sandbox (no credit card)",
    provider: "Google Cloud",
    url: "https://cloud.google.com/bigquery/docs/sandbox",
    kind: "Reference",
    tags: ["bigquery", "sql", "google analytics"],
  },
  {
    id: "snowflake-learn",
    title: "Snowflake free courses",
    provider: "Snowflake",
    url: "https://learn.snowflake.com/en/courses/",
    kind: "Course",
    tags: ["snowflake"],
  },
  {
    id: "dbt-fundamentals",
    title: "dbt Fundamentals",
    provider: "dbt Labs",
    url: "https://learn.getdbt.com/courses/dbt-fundamentals",
    kind: "Course",
    tags: ["data modeling", "data qa", "sql", "reproducibility"],
  },
  // Python & data science
  {
    id: "kaggle-python",
    title: "Python",
    provider: "Kaggle Learn",
    url: "https://www.kaggle.com/learn/python",
    kind: "Course",
    tags: ["python"],
  },
  {
    id: "python-tutorial",
    title: "The Python Tutorial",
    provider: "Python.org",
    url: "https://docs.python.org/3/tutorial/",
    kind: "Reference",
    tags: ["python"],
  },
  {
    id: "fcc-python",
    title: "Scientific Computing with Python",
    provider: "freeCodeCamp",
    url: "https://www.freecodecamp.org/learn/scientific-computing-with-python/",
    kind: "Course",
    tags: ["python"],
  },
  {
    id: "automate-boring",
    title: "Automate the Boring Stuff with Python",
    provider: "Al Sweigart (free online book)",
    url: "https://automatetheboringstuff.com/",
    kind: "Book",
    tags: ["python", "process improvement", "excel"],
  },
  {
    id: "kaggle-pandas",
    title: "Pandas",
    provider: "Kaggle Learn",
    url: "https://www.kaggle.com/learn/pandas",
    kind: "Course",
    tags: ["pandas", "python"],
  },
  {
    id: "pandas-10min",
    title: "10 minutes to pandas",
    provider: "pandas docs",
    url: "https://pandas.pydata.org/docs/user_guide/10min.html",
    kind: "Reference",
    tags: ["pandas", "python"],
  },
  {
    id: "kaggle-cleaning",
    title: "Data Cleaning",
    provider: "Kaggle Learn",
    url: "https://www.kaggle.com/learn/data-cleaning",
    kind: "Course",
    tags: [
      "pandas",
      "data qa",
      "python",
      "reconciliation",
      "attention to detail",
    ],
  },
  {
    id: "kaggle-viz",
    title: "Data Visualization",
    provider: "Kaggle Learn",
    url: "https://www.kaggle.com/learn/data-visualization",
    kind: "Course",
    tags: ["python", "pandas", "storytelling", "visualization"],
  },
  {
    id: "kaggle-ml",
    title: "Intro to Machine Learning",
    provider: "Kaggle Learn",
    url: "https://www.kaggle.com/learn/intro-to-machine-learning",
    kind: "Course",
    tags: ["scikit-learn", "machine learning", "error analysis", "forecast"],
  },
  {
    id: "kaggle-features",
    title: "Feature Engineering",
    provider: "Kaggle Learn",
    url: "https://www.kaggle.com/learn/feature-engineering",
    kind: "Course",
    tags: ["scikit-learn", "machine learning"],
  },
  {
    id: "kaggle-timeseries",
    title: "Time Series",
    provider: "Kaggle Learn",
    url: "https://www.kaggle.com/learn/time-series",
    kind: "Course",
    tags: ["forecast", "time-series", "scikit-learn"],
  },
  {
    id: "sklearn-start",
    title: "Getting started with scikit-learn",
    provider: "scikit-learn",
    url: "https://scikit-learn.org/stable/getting_started.html",
    kind: "Reference",
    tags: ["scikit-learn", "machine learning"],
  },
  {
    id: "google-mlcc",
    title: "Machine Learning Crash Course",
    provider: "Google",
    url: "https://developers.google.com/machine-learning/crash-course",
    kind: "Course",
    tags: ["machine learning", "scikit-learn", "error analysis"],
  },
  {
    id: "fpp3",
    title: "Forecasting: Principles and Practice",
    provider: "Hyndman & Athanasopoulos (free book)",
    url: "https://otexts.com/fpp3/",
    kind: "Book",
    tags: ["forecast", "time-series", "r", "scenario planning"],
  },
  {
    id: "jupyter-docs",
    title: "Jupyter documentation",
    provider: "Project Jupyter",
    url: "https://docs.jupyter.org/en/latest/",
    kind: "Reference",
    tags: ["jupyter", "reproducibility", "python"],
  },
  {
    id: "r4ds",
    title: "R for Data Science (2e)",
    provider: "Wickham et al. (free book)",
    url: "https://r4ds.hadley.nz/",
    kind: "Book",
    tags: ["r", "dplyr", "tidyr"],
  },
  // Excel & spreadsheets
  {
    id: "excel-shortcuts-ms",
    title: "Keyboard shortcuts in Excel",
    provider: "Microsoft Support",
    url: "https://support.microsoft.com/en-us/office/keyboard-shortcuts-in-excel-1798d9d5-842a-42b8-9c99-9b7213f0040f",
    kind: "Reference",
    tags: ["excel shortcuts", "excel", "shortcut"],
  },
  {
    id: "exceljet-shortcuts",
    title: "Excel shortcuts (Win & Mac)",
    provider: "Exceljet",
    url: "https://exceljet.net/shortcuts",
    kind: "Reference",
    tags: ["excel shortcuts", "excel", "shortcut"],
  },
  {
    id: "exceljet-functions",
    title: "Excel functions guide",
    provider: "Exceljet",
    url: "https://exceljet.net/functions",
    kind: "Reference",
    tags: ["excel", "financial modeling", "variance"],
  },
  {
    id: "excel-training-ms",
    title: "Excel video training",
    provider: "Microsoft Support",
    url: "https://support.microsoft.com/en-us/office/excel-video-training-9bc05390-e94c-46af-a5b3-d7c22f6990bb",
    kind: "Videos",
    tags: ["excel"],
  },
  {
    id: "gcf-excel",
    title: "Excel tutorials",
    provider: "GCFGlobal",
    url: "https://edu.gcfglobal.org/en/excel/",
    kind: "Course",
    tags: ["excel", "excel shortcuts"],
  },
  {
    id: "solver-ms",
    title: "Define and solve a problem with Solver",
    provider: "Microsoft Support",
    url: "https://support.microsoft.com/en-us/office/define-and-solve-a-problem-by-using-solver-5d1a388f-079d-43ac-a7eb-f63e45925040",
    kind: "Tutorial",
    tags: ["solver", "constraint modeling", "excel"],
  },
  {
    id: "cfi-modeling",
    title: "What is financial modeling?",
    provider: "Corporate Finance Institute",
    url: "https://corporatefinanceinstitute.com/resources/financial-modeling/what-is-financial-modeling/",
    kind: "Reference",
    tags: [
      "financial modeling",
      "variance",
      "excel",
      "scenario planning",
      "assumption",
    ],
  },
  // BI tools
  {
    id: "power-query-docs",
    title: "What is Power Query?",
    provider: "Microsoft Learn",
    url: "https://learn.microsoft.com/en-us/power-query/power-query-what-is-power-query",
    kind: "Tutorial",
    tags: ["power query", "power bi", "excel"],
  },
  {
    id: "pbi-get-started",
    title: "Get started with Power BI",
    provider: "Microsoft Learn",
    url: "https://learn.microsoft.com/en-us/training/paths/get-started-power-bi/",
    kind: "Course",
    tags: ["power bi"],
  },
  {
    id: "pbi-training",
    title: "Power BI training paths",
    provider: "Microsoft Learn",
    url: "https://learn.microsoft.com/en-us/training/powerplatform/power-bi",
    kind: "Course",
    tags: ["power bi", "dax", "power query"],
  },
  {
    id: "pbi-star-schema",
    title: "Star schema guidance for Power BI",
    provider: "Microsoft Learn",
    url: "https://learn.microsoft.com/en-us/power-bi/guidance/star-schema",
    kind: "Reference",
    tags: ["power bi", "data modeling", "dax"],
  },
  {
    id: "dax-overview",
    title: "DAX overview",
    provider: "Microsoft Learn",
    url: "https://learn.microsoft.com/en-us/dax/dax-overview",
    kind: "Reference",
    tags: ["dax", "power bi"],
  },
  {
    id: "sqlbi-dax",
    title: "DAX guide",
    provider: "SQLBI",
    url: "https://www.sqlbi.com/guides/dax/",
    kind: "Reference",
    tags: ["dax", "power bi"],
  },
  {
    id: "tableau-tutorial",
    title: "Get Started with Tableau tutorial",
    provider: "Tableau Help",
    url: "https://help.tableau.com/current/guides/get-started-tutorial/en-us/get-started-tutorial-home.htm",
    kind: "Tutorial",
    tags: ["tableau"],
  },
  {
    id: "tableau-videos",
    title: "Tableau Public how-to videos",
    provider: "Tableau Public",
    url: "https://public.tableau.com/app/learn/how-to-videos",
    kind: "Videos",
    tags: ["tableau", "storytelling"],
  },
  {
    id: "looker-docs",
    title: "Introduction to Looker",
    provider: "Google Cloud",
    url: "https://cloud.google.com/looker/docs/intro",
    kind: "Reference",
    tags: ["looker"],
  },
  {
    id: "skillshop",
    title: "Google Analytics courses",
    provider: "Google Skillshop",
    url: "https://skillshop.withgoogle.com/",
    kind: "Course",
    tags: ["google analytics", "attribution", "marketing", "measurement"],
  },
  {
    id: "amplitude-academy",
    title: "Amplitude Academy",
    provider: "Amplitude",
    url: "https://academy.amplitude.com/",
    kind: "Course",
    tags: ["amplitude", "product", "cohort", "metric"],
  },
  {
    id: "google-da-cert",
    title: "Google Data Analytics Certificate (free to audit)",
    provider: "Coursera",
    url: "https://www.coursera.org/professional-certificates/google-data-analytics",
    kind: "Course",
    tags: [
      "data qa",
      "metric",
      "storytelling",
      "sql",
      "r",
      "tableau",
      "process",
    ],
  },
  {
    id: "mit-analytics-edge",
    title: "The Analytics Edge",
    provider: "MIT OpenCourseWare",
    url: "https://ocw.mit.edu/courses/15-071-the-analytics-edge-spring-2017/",
    kind: "Course",
    tags: [
      "r",
      "machine learning",
      "forecast",
      "constraint modeling",
      "scenario planning",
    ],
  },
  // Statistics & experimentation
  {
    id: "khan-stats",
    title: "Statistics and probability",
    provider: "Khan Academy",
    url: "https://www.khanacademy.org/math/statistics-probability",
    kind: "Course",
    tags: [
      "statistics",
      "experiment",
      "uncertainty",
      "research",
      "measurement",
    ],
  },
  {
    id: "seeing-theory",
    title: "Seeing Theory (visual statistics)",
    provider: "Brown University",
    url: "https://seeing-theory.brown.edu/",
    kind: "Tutorial",
    tags: ["statistics", "uncertainty", "experiment"],
  },
  {
    id: "openintro-stats",
    title: "OpenIntro Statistics",
    provider: "OpenIntro (free book)",
    url: "https://www.openintro.org/book/os/",
    kind: "Book",
    tags: ["statistics", "research", "experiment", "uncertainty"],
  },
  {
    id: "udacity-ab",
    title: "A/B Testing by Google",
    provider: "Udacity (free)",
    url: "https://www.udacity.com/course/ab-testing--ud257",
    kind: "Course",
    tags: ["experiment", "a/b", "measurement", "metric", "attribution"],
  },
  {
    id: "exp-platform",
    title: "Online controlled experiments papers",
    provider: "ExP Platform",
    url: "https://www.exp-platform.com/",
    kind: "Reference",
    tags: ["experiment", "a/b", "metric"],
  },
  {
    id: "coursera-inference",
    title: "Inferential Statistics (free to audit)",
    provider: "Coursera · Duke",
    url: "https://www.coursera.org/learn/inferential-statistics-intro",
    kind: "Course",
    tags: ["statistics", "experiment", "research", "uncertainty"],
  },
  {
    id: "qualtrics-basics",
    title: "Survey platform overview",
    provider: "Qualtrics Support",
    url: "https://www.qualtrics.com/support/survey-platform/getting-started/survey-platform-overview/",
    kind: "Reference",
    tags: ["qualtrics", "research", "qualitative"],
  },
  // Git
  {
    id: "learn-git-branching",
    title: "Learn Git Branching (interactive)",
    provider: "learngitbranching.js.org",
    url: "https://learngitbranching.js.org/",
    kind: "Practice",
    tags: ["git", "reproducibility"],
  },
  {
    id: "pro-git",
    title: "Pro Git book",
    provider: "git-scm.com",
    url: "https://git-scm.com/book/en/v2",
    kind: "Book",
    tags: ["git"],
  },
  {
    id: "github-skills",
    title: "GitHub Skills courses",
    provider: "GitHub",
    url: "https://skills.github.com/",
    kind: "Course",
    tags: ["git", "team collaboration"],
  },
  // Communication, product & consulting
  {
    id: "swd-blog",
    title: "Storytelling with Data blog & exercises",
    provider: "Storytelling with Data",
    url: "https://www.storytellingwithdata.com/blog",
    kind: "Reference",
    tags: [
      "storytelling",
      "presentation",
      "communication",
      "visualization",
      "powerpoint",
    ],
  },
  {
    id: "wharton-comm",
    title: "Communication Skills for Engagement (free to audit)",
    provider: "Coursera · Wharton",
    url: "https://www.coursera.org/learn/wharton-communication-skills",
    kind: "Course",
    tags: [
      "communication",
      "stakeholder",
      "presentation",
      "alignment",
      "training",
    ],
  },
  {
    id: "business-writing",
    title: "Business Writing (free to audit)",
    provider: "Coursera · Univ. of Colorado",
    url: "https://www.coursera.org/learn/business-writing",
    kind: "Course",
    tags: [
      "writing",
      "requirements",
      "communication",
      "assumption",
      "follow-up",
    ],
  },
  {
    id: "mit-mgmt-comm",
    title: "Management Communication",
    provider: "MIT OpenCourseWare",
    url: "https://ocw.mit.edu/courses/15-279-management-communication-for-undergraduates-fall-2012/",
    kind: "Course",
    tags: ["communication", "presentation", "stakeholder", "alignment"],
  },
  {
    id: "ppt-training",
    title: "PowerPoint video training",
    provider: "Microsoft Support",
    url: "https://support.microsoft.com/en-us/office/powerpoint-video-training-40e8c930-cb0b-40d8-82c4-bd53d3398787",
    kind: "Videos",
    tags: ["powerpoint", "presentation"],
  },
  {
    id: "caseinterview",
    title: "Case interview prep (free videos)",
    provider: "CaseInterview.com",
    url: "https://www.caseinterview.com/",
    kind: "Videos",
    tags: [
      "case",
      "problem framing",
      "consulting",
      "interview",
      "prioritization",
    ],
  },
  {
    id: "atlassian-agile",
    title: "Agile project management guide",
    provider: "Atlassian",
    url: "https://www.atlassian.com/agile/project-management",
    kind: "Reference",
    tags: [
      "requirements",
      "scope",
      "acceptance criteria",
      "prioritization",
      "jira",
      "process",
    ],
  },
  {
    id: "jira-guides",
    title: "Jira guides",
    provider: "Atlassian",
    url: "https://www.atlassian.com/software/jira/guides",
    kind: "Reference",
    tags: ["jira", "requirements", "acceptance criteria"],
  },
  {
    id: "productplan-learn",
    title: "Product management glossary & guides",
    provider: "ProductPlan",
    url: "https://www.productplan.com/learn/",
    kind: "Reference",
    tags: ["product", "prioritization", "requirements", "roadmap"],
  },
  {
    id: "svpg-articles",
    title: "Product articles",
    provider: "Silicon Valley Product Group",
    url: "https://www.svpg.com/articles/",
    kind: "Reference",
    tags: ["product", "cross-functional", "alignment"],
  },
  {
    id: "nngroup",
    title: "UX research articles",
    provider: "Nielsen Norman Group",
    url: "https://www.nngroup.com/articles/",
    kind: "Reference",
    tags: ["research", "qualitative", "figma", "product"],
  },
  {
    id: "figma-beginners",
    title: "Figma Design for beginners",
    provider: "Figma Help Center",
    url: "https://help.figma.com/hc/en-us/sections/30880632542743-Figma-Design-for-beginners",
    kind: "Course",
    tags: ["figma"],
  },
  {
    id: "khan-finance",
    title: "Financial literacy",
    provider: "Khan Academy",
    url: "https://www.khanacademy.org/college-careers-more/financial-literacy",
    kind: "Course",
    tags: ["financial", "variance", "sustainability"],
  },
];

const byId = new Map(resources.map((r) => [r.id, r]));
export const getResource = (id: string) => byId.get(id);

const scenarioTags: [RegExp, string[]][] = [
  [/interview/i, ["interview", "case"]],
  [/case competition/i, ["case", "storytelling", "presentation"]],
  [/take-home/i, ["reproducibility", "storytelling", "data qa"]],
  [/team|class|project/i, ["team collaboration", "git", "communication"]],
  [/speed|shortcut/i, ["shortcut", "excel shortcuts"]],
  [
    /internship|intern|analyst|associate|fellow/i,
    ["data qa", "communication", "stakeholder"],
  ],
];

// Ranks resources for a skill (and scenario); skill matches come first.
export function resourcesFor(skill: string, scenario = "", limit = 14) {
  const s = skill.toLowerCase();
  const words = s.split(/[^a-z0-9/]+/).filter((w) => w.length > 2);
  const score = (r: Resource) =>
    r.tags.reduce(
      (n, t) =>
        n +
        (s === t ? 10 : s.includes(t) || t.includes(s) ? 6 : 0) +
        (words.some((w) => t.includes(w)) ? 2 : 0),
      0,
    );
  const extra = scenarioTags
    .filter(([re]) => re.test(scenario))
    .flatMap(([, tags]) => tags);
  const ranked = resources
    .map((r) => ({
      r,
      n: score(r) * 3 + (r.tags.some((t) => extra.includes(t)) ? 2 : 0),
    }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n);
  const picked = ranked.slice(0, limit).map((x) => x.r);
  // Always offer at least a few general analytics resources.
  for (const id of ["google-da-cert", "khan-stats", "swd-blog"])
    if (picked.length < 6 && !picked.some((r) => r.id === id))
      picked.push(byId.get(id)!);
  return picked;
}

type Module = { title: string; tasks: string[]; res: [string, string][] };
const m = (
  title: string,
  tasks: string[],
  ...res: [string, string][]
): Module => ({ title, tasks, res });

// Week-by-week modules used for the template plan, per skill family.
const tracks: [RegExp, Module[]][] = [
  [
    /excel shortcut|shortcut/i,
    [
      m(
        "Navigate without the mouse",
        [
          "Practice Ctrl+Arrow, Ctrl+Shift+Arrow and Ctrl+Home/End on a 500-row sheet",
          "Jump between sheets with Ctrl+PgUp/PgDn ten times",
          "Write your five most-used navigation shortcuts on a sticky note",
        ],
        ["excel-shortcuts-ms", "Navigate in cells section"],
        ["exceljet-shortcuts", "Navigation shortcuts"],
      ),
      m(
        "Select, edit and fill fast",
        [
          "Fill a formula down 1,000 rows with Ctrl+D",
          "Use Ctrl+Enter to fill one value into a selected range",
          "Insert and delete rows/columns with Ctrl+Shift+= and Ctrl+-",
        ],
        ["exceljet-shortcuts", "Selection and editing"],
      ),
      m(
        "Formulas from the keyboard",
        [
          "AutoSum five columns with Alt+=",
          "Toggle absolute references with F4 (Cmd+T on Mac) in ten formulas",
          "Show formulas with Ctrl+` and audit one sheet",
        ],
        ["excel-shortcuts-ms", "Formulas section"],
      ),
      m(
        "Format in seconds",
        [
          "Apply number, percent and date formats with Ctrl+Shift+1/5/3",
          "Open Format Cells with Ctrl+1 and set a custom format",
          "Convert a range to a table with Ctrl+T",
        ],
        ["exceljet-shortcuts", "Formatting"],
      ),
      m(
        "Filter, sort and pivot",
        [
          "Toggle filters with Ctrl+Shift+L and filter three columns",
          "Build a PivotTable using only the keyboard (Alt, N, V)",
          "Refresh it with Alt+F5",
        ],
        ["gcf-excel", "PivotTables lesson"],
        ["excel-shortcuts-ms", "Work with data"],
      ),
      m(
        "Ribbon & Quick Access tricks",
        [
          "Press Alt and follow KeyTips for five ribbon commands",
          "Add three commands to the Quick Access Toolbar and trigger them with Alt+1..3",
          "Time yourself cleaning a messy export",
        ],
        ["excel-training-ms", "Customize the ribbon"],
      ),
      m(
        "Speed drill on real data",
        [
          "Clean a 1,000-row sales export mouse-free",
          "Summarize revenue by region with a PivotTable",
          "Record your time and compare with week 1",
        ],
        ["exceljet-shortcuts", "Keep the list open as a cheat sheet"],
      ),
      m(
        "Personal shortcut playbook",
        [
          "Write your top 15 shortcuts with when to use each",
          "Teach three of them to a classmate",
          "Repeat the speed drill and log the improvement",
        ],
        ["exceljet-shortcuts", "Print or bookmark your favorites"],
      ),
    ],
  ],
  [
    /excel|spreadsheet|financial model|solver|variance|reconcil/i,
    [
      m(
        "Core formulas",
        [
          "Practice SUMIFS, COUNTIFS and AVERAGEIFS on a sales table",
          "Use IF and IFERROR to handle edge cases",
        ],
        ["exceljet-functions", "SUMIFS, COUNTIFS, IFERROR pages"],
        ["gcf-excel", "Intro to formulas & functions"],
      ),
      m(
        "Lookups",
        [
          "Replace three VLOOKUPs with XLOOKUP",
          "Match two lists and flag missing records",
        ],
        ["exceljet-functions", "XLOOKUP & INDEX/MATCH"],
      ),
      m(
        "Clean text & dates",
        [
          "Split names with TEXTSPLIT or Text to Columns",
          "Standardize dates and trim spaces with TRIM/CLEAN",
        ],
        ["exceljet-functions", "Text and date functions"],
      ),
      m(
        "PivotTables",
        [
          "Build a PivotTable of revenue by region and month",
          "Add a calculated field and slicer",
        ],
        ["gcf-excel", "Intro to PivotTables"],
        ["excel-training-ms", "PivotTables videos"],
      ),
      m(
        "Power Query",
        [
          "Import a CSV and remove/rename columns in Power Query",
          "Append two monthly files",
        ],
        ["power-query-docs", "Overview & getting data"],
      ),
      m(
        "Charts that explain",
        [
          "Build a line and bar chart with clear titles",
          "Remove clutter using SWD tips",
        ],
        ["excel-training-ms", "Charts videos"],
        ["swd-blog", "Chart makeovers"],
      ),
      m(
        "What-if & Solver",
        [
          "Build a small scenario table with Data Tables",
          "Solve one constrained problem with Solver",
        ],
        ["solver-ms", "Full tutorial"],
        ["cfi-modeling", "Model structure basics"],
      ),
      m(
        "Mini model & checks",
        [
          "Build a one-tab model with inputs, calculations and outputs",
          "Reconcile totals and document assumptions",
        ],
        ["cfi-modeling", "Best practices"],
        ["exceljet-shortcuts", "Speed up the build"],
      ),
    ],
  ],
  [
    /sql|snowflake|bigquery|cohort|metric|data qa/i,
    [
      m(
        "SELECT, WHERE and ORDER BY",
        [
          "Complete SQLBolt lessons 1–4",
          "Write five filtered queries on a sample orders table",
          "Explain what each clause does in one sentence",
        ],
        ["sqlbolt", "Lessons 1–4"],
        ["kaggle-sql", "Lesson 1: Getting started"],
      ),
      m(
        "Aggregates & GROUP BY",
        [
          "Complete SQLBolt lessons 10–11",
          "Count orders and revenue per customer, then filter with HAVING",
          "Solve three Mode tutorial aggregate exercises",
        ],
        ["sqlbolt", "Lessons 10–11"],
        ["mode-sql", "SQL Aggregate Functions → GROUP BY → HAVING"],
      ),
      m(
        "JOINs",
        [
          "Complete SQLBolt lessons 6–8",
          "Join customers to orders and find customers with no orders (LEFT JOIN + IS NULL)",
          "Draw a diagram of each join type",
        ],
        ["sqlbolt", "Lessons 6–8"],
        ["sqlzoo", "Section 6: JOIN"],
      ),
      m(
        "Subqueries & CTEs",
        [
          "Rewrite one subquery as a CTE",
          "Find each customer's first order date with a CTE",
          "Read Mode's subquery lesson",
        ],
        ["mode-sql", "Advanced: Writing Subqueries"],
        ["pgexercises", "Subqueries section"],
      ),
      m(
        "Window functions",
        [
          "Complete Kaggle Advanced SQL lesson on analytic functions",
          "Rank products by revenue within category with RANK()",
          "Compute a 7-day running total",
        ],
        ["kaggle-adv-sql", "Analytic Functions"],
        ["mode-sql", "Window Functions"],
      ),
      m(
        "Dates, CASE and data quality",
        [
          "Bucket orders by month with DATE_TRUNC",
          "Use CASE to label customers new vs. returning",
          "Deduplicate events with ROW_NUMBER()",
        ],
        ["mode-sql", "Data Cleaning lesson"],
        ["pgexercises", "Date section"],
      ),
      m(
        "Interview-style practice",
        [
          "Solve five easy and two medium questions",
          "Say your approach out loud before writing SQL",
          "Review one solution you got wrong",
        ],
        ["datalemur", "SQL interview questions"],
        ["leetcode-sql50", "Select & Basic Joins"],
      ),
      m(
        "Timed mixed set",
        [
          "Solve three medium questions in 30 minutes",
          "Write a one-paragraph explanation for each result",
          "List the patterns you still need to review",
        ],
        ["stratascratch", "Free SQL questions"],
        ["leetcode-sql50", "Advanced Select & Joins"],
      ),
    ],
  ],
  [
    /pandas/i,
    [
      m(
        "DataFrames & Series",
        [
          "Complete Kaggle Pandas lessons 1–2",
          "Load a CSV and inspect it with .info(), .head() and .describe()",
        ],
        ["kaggle-pandas", "Lessons 1–2"],
        ["pandas-10min", "Object creation & viewing data"],
      ),
      m(
        "Selecting & filtering",
        [
          "Practice .loc, .iloc and boolean masks on 10 questions",
          "Filter rows by two conditions",
        ],
        ["pandas-10min", "Selection"],
        ["kaggle-pandas", "Indexing, selecting & assigning"],
      ),
      m(
        "Groupby & aggregation",
        [
          "Compute revenue by region and month with groupby",
          "Use .agg with three functions",
        ],
        ["kaggle-pandas", "Grouping and sorting"],
      ),
      m(
        "Merging safely",
        [
          "Merge orders and customers with validate='many_to_one'",
          "Check row counts before and after every merge",
        ],
        ["pandas-10min", "Merge"],
        ["kaggle-pandas", "Renaming and combining"],
      ),
      m(
        "Cleaning messy data",
        [
          "Handle missing values and fix dtypes",
          "Parse dates and deduplicate records",
        ],
        ["kaggle-cleaning", "Lessons 1–3"],
      ),
      m(
        "Reshaping & time series",
        ["Pivot and melt a table", "Resample daily data to weekly totals"],
        ["pandas-10min", "Reshaping & time series"],
      ),
      m(
        "Visualize findings",
        [
          "Plot two charts that answer one business question",
          "Write a three-sentence takeaway",
        ],
        ["kaggle-viz", "Line & bar charts"],
      ),
      m(
        "Mini analysis",
        [
          "Answer three questions about a Kaggle dataset end to end",
          "Practice two pandas interview questions",
        ],
        ["stratascratch", "Python / pandas questions"],
      ),
    ],
  ],
  [
    /python|jupyter/i,
    [
      m(
        "Python basics",
        [
          "Complete Kaggle Python lessons 1–2",
          "Write five small functions with type hints",
        ],
        ["kaggle-python", "Lessons 1–2"],
        ["python-tutorial", "Sections 3–4"],
      ),
      m(
        "Data structures",
        [
          "Practice lists, dicts and comprehensions with ten exercises",
          "Count word frequencies in a text",
        ],
        ["kaggle-python", "Lists & dictionaries"],
        ["python-tutorial", "Section 5"],
      ),
      m(
        "Loops, files & errors",
        [
          "Read and write a CSV with the csv module",
          "Handle a bad row with try/except",
        ],
        ["automate-boring", "Chapters 3, 5 and 9"],
      ),
      m(
        "Notebooks & environment",
        [
          "Set up a Jupyter notebook with markdown notes",
          "Restart & run all to confirm reproducibility",
        ],
        ["jupyter-docs", "Notebook basics"],
      ),
      m(
        "pandas for analysis",
        [
          "Complete Kaggle Pandas lessons 1–3",
          "Summarize a dataset with groupby",
        ],
        ["kaggle-pandas", "Lessons 1–3"],
      ),
      m(
        "Cleaning & visualizing",
        [
          "Clean one messy dataset",
          "Make two charts that answer a business question",
        ],
        ["kaggle-cleaning", "Missing values & scaling"],
        ["kaggle-viz", "Line charts & bar charts"],
      ),
      m(
        "Automate a task",
        [
          "Script a weekly report that reads, summarizes and saves a file",
          "Add comments a teammate could follow",
        ],
        ["automate-boring", "Pick one chapter matching your task"],
      ),
      m(
        "Practice problems",
        [
          "Solve four Python/pandas interview questions",
          "Refactor one solution for readability",
        ],
        ["stratascratch", "Python questions"],
        ["fcc-python", "Practice projects"],
      ),
    ],
  ],
  [
    /tableau|looker/i,
    [
      m(
        "Connect & explore",
        [
          "Complete the Tableau Get Started tutorial steps 1–2",
          "Connect to a sample superstore dataset",
        ],
        ["tableau-tutorial", "Steps 1–2"],
      ),
      m(
        "Core charts",
        ["Build bar, line and map views", "Sort and filter each"],
        ["tableau-tutorial", "Steps 3–4"],
        ["tableau-videos", "Chart how-to videos"],
      ),
      m(
        "Calculated fields",
        [
          "Create profit ratio and YoY growth fields",
          "Use COUNTD for distinct customers",
        ],
        ["tableau-videos", "Calculations videos"],
      ),
      m(
        "Filters & parameters",
        [
          "Add context and global filters",
          "Build a parameter-driven top-N chart",
        ],
        ["tableau-videos", "Filters & parameters"],
      ),
      m(
        "Dashboards",
        ["Combine three sheets into a dashboard", "Add a filter action"],
        ["tableau-tutorial", "Step 5: dashboards"],
      ),
      m(
        "Design for decisions",
        [
          "Remove chart clutter using SWD guidelines",
          "Write a title that states the insight",
        ],
        ["swd-blog", "Decluttering posts"],
      ),
      m(
        "Data checks",
        [
          "Reconcile one dashboard total to the source with SQL or Excel",
          "Document refresh timing",
        ],
        ["google-da-cert", "Course 6: Share data through visualization"],
      ),
      m(
        "Publish & present",
        ["Publish to Tableau Public", "Present the dashboard in two minutes"],
        ["tableau-videos", "Publishing"],
      ),
    ],
  ],
  [
    /power bi|dax|power query/i,
    [
      m(
        "Power BI basics",
        [
          "Complete the first Get started with Power BI module",
          "Load a sample workbook",
        ],
        ["pbi-get-started", "Module 1"],
      ),
      m(
        "Shape data with Power Query",
        [
          "Remove columns, change types and unpivot a table",
          "Merge two queries",
        ],
        ["power-query-docs", "Overview & getting data"],
      ),
      m(
        "Model with a star schema",
        [
          "Separate facts and dimensions",
          "Create relationships and a date table",
        ],
        ["pbi-star-schema", "Full guide"],
      ),
      m(
        "DAX measures",
        [
          "Write SUM, CALCULATE and DIVIDE measures",
          "Compare measures vs calculated columns",
        ],
        ["dax-overview", "Overview"],
        ["sqlbi-dax", "CALCULATE"],
      ),
      m(
        "Time intelligence",
        [
          "Build YTD and month-over-month measures",
          "Test them against Excel totals",
        ],
        ["sqlbi-dax", "Time intelligence functions"],
      ),
      m(
        "Report design",
        ["Build a one-page report with slicers", "Apply consistent formatting"],
        ["pbi-training", "Design reports module"],
      ),
      m(
        "Validate numbers",
        ["Reconcile three report totals to source", "Document assumptions"],
        ["pbi-training", "Model data module"],
      ),
      m(
        "Share & explain",
        ["Publish or export the report", "Record a 3-minute walkthrough"],
        ["swd-blog", "Presenting data"],
      ),
    ],
  ],
  [
    /git|reproducib/i,
    [
      m(
        "Commits & history",
        [
          "Complete Learn Git Branching intro levels 1–4",
          "Initialize a repo and make five commits",
        ],
        ["learn-git-branching", "Introduction sequence"],
        ["pro-git", "Chapter 2"],
      ),
      m(
        "Branches & merging",
        [
          "Create a feature branch and merge it",
          "Resolve one deliberate merge conflict",
        ],
        ["learn-git-branching", "Ramping up"],
        ["pro-git", "Chapter 3"],
      ),
      m(
        "GitHub workflow",
        [
          "Complete the GitHub Skills intro course",
          "Open a pull request on your own repo",
        ],
        ["github-skills", "Introduction to GitHub"],
      ),
      m(
        "Rebase & undo",
        ["Practice reset, revert and rebase levels", "Write when to use each"],
        ["learn-git-branching", "Moving work around"],
      ),
      m(
        "Analytics repo hygiene",
        [
          "Add a README, .gitignore and requirements file",
          "Version a SQL query with clear commit messages",
        ],
        ["pro-git", "Chapter 5"],
      ),
      m(
        "Code review",
        [
          "Review a classmate's PR with three comments",
          "Address review feedback",
        ],
        ["github-skills", "Review pull requests"],
      ),
      m(
        "Reproducible notebooks",
        [
          "Restart & run all, then commit outputs-cleared notebooks",
          "Tag a release",
        ],
        ["jupyter-docs", "Running notebooks"],
      ),
      m(
        "Team simulation",
        [
          "Collaborate with a partner on one repo",
          "Practice a pull–merge–push cycle",
        ],
        ["github-skills", "Collaboration courses"],
      ),
    ],
  ],
  [
    /experiment|a\/b|statistic|measurement|attribution|uncertainty|research/i,
    [
      m(
        "Distributions & sampling",
        [
          "Explore Seeing Theory chapters 1–3",
          "Explain sampling variation to a friend",
        ],
        ["seeing-theory", "Chapters 1–3"],
      ),
      m(
        "Confidence intervals",
        [
          "Complete Khan Academy confidence interval lessons",
          "Compute a CI by hand for one metric",
        ],
        ["khan-stats", "Confidence intervals unit"],
      ),
      m(
        "Hypothesis tests",
        [
          "Run a two-sample test on sample data",
          "Interpret p-values in plain language",
        ],
        ["openintro-stats", "Chapter 5"],
        ["khan-stats", "Significance tests unit"],
      ),
      m(
        "Experiment design",
        [
          "Watch Udacity A/B Testing lesson 1",
          "Define a primary metric and guardrails for one test",
        ],
        ["udacity-ab", "Lesson 1: Overview"],
      ),
      m(
        "Power & sample size",
        [
          "Estimate sample size for a 2% lift",
          "Discuss what happens when tests stop early",
        ],
        ["udacity-ab", "Lesson 4: Designing an experiment"],
      ),
      m(
        "Pitfalls",
        [
          "Read one ExP paper on trustworthy experiments",
          "List three common pitfalls",
        ],
        ["exp-platform", "Pick one paper"],
      ),
      m(
        "Analyze a test",
        [
          "Analyze a sample A/B dataset end to end",
          "Check sample ratio mismatch",
        ],
        ["udacity-ab", "Lesson 5: Analyzing results"],
      ),
      m(
        "Communicate results",
        [
          "Write a one-page readout with uncertainty",
          "Present it in 3 minutes",
        ],
        ["swd-blog", "Communicating uncertainty"],
      ),
    ],
  ],
  [
    /scikit|machine learning|forecast|error analysis|time-series/i,
    [
      m(
        "ML workflow",
        [
          "Complete Kaggle Intro to ML lessons 1–3",
          "Fit your first decision tree",
        ],
        ["kaggle-ml", "Lessons 1–3"],
      ),
      m(
        "Validation",
        ["Use train/validation splits", "Compare MAE across two models"],
        ["kaggle-ml", "Lessons 4–5"],
      ),
      m(
        "Better models",
        ["Train a random forest", "Tune one hyperparameter"],
        ["kaggle-ml", "Lessons 6–7"],
        ["sklearn-start", "Getting started"],
      ),
      m(
        "Feature engineering",
        [
          "Create three features and test their impact",
          "Avoid leakage in one example",
        ],
        ["kaggle-features", "Lessons 1–3"],
      ),
      m(
        "Time-based validation",
        [
          "Use a time-ordered split for forecasting",
          "Compare with a naive baseline",
        ],
        ["kaggle-timeseries", "Lessons 1–2"],
        ["fpp3", "Chapter 5"],
      ),
      m(
        "Error analysis",
        ["Slice errors by segment", "Write which segment fails and why"],
        ["google-mlcc", "Classification & metrics modules"],
      ),
      m(
        "Communicate a model",
        [
          "Explain the model to a non-technical stakeholder",
          "List limitations",
        ],
        ["swd-blog", "Explaining analysis"],
      ),
      m(
        "Mini project",
        [
          "Build an end-to-end notebook on a public dataset",
          "Document decisions",
        ],
        ["kaggle-ml", "Competition: Housing prices"],
      ),
    ],
  ],
  [
    /^r$|dplyr|tidyr/i,
    [
      m(
        "R & RStudio basics",
        ["Read R4DS whole-game chapters", "Run your first script"],
        ["r4ds", "Whole game: chapters 1–2"],
      ),
      m(
        "dplyr verbs",
        [
          "Practice filter, select, mutate, summarize",
          "Group by two variables",
        ],
        ["r4ds", "Data transformation"],
      ),
      m(
        "Tidy data",
        ["Pivot longer/wider with tidyr", "Clean one messy table"],
        ["r4ds", "Data tidying"],
      ),
      m(
        "Visualize",
        ["Make three ggplot2 charts", "Facet one by segment"],
        ["r4ds", "Data visualization"],
      ),
      m(
        "Import & join",
        ["Read CSVs and join two tables", "Check row counts"],
        ["r4ds", "Joins"],
      ),
      m(
        "Functions",
        ["Write two reusable functions", "Iterate over groups"],
        ["r4ds", "Functions"],
      ),
      m(
        "Communicate",
        ["Create a Quarto report", "Add a summary paragraph"],
        ["r4ds", "Quarto"],
      ),
      m(
        "Mini analysis",
        ["Analyze a public dataset end to end", "Share the report"],
        ["mit-analytics-edge", "Pick one unit"],
      ),
    ],
  ],
  [
    /stor|present|communicat|powerpoint|stakeholder|alignment|training|follow-up/i,
    [
      m(
        "Know your audience",
        [
          "Read three SWD posts on context",
          "Write the 'big idea' for a current analysis",
        ],
        ["swd-blog", "Context & big idea posts"],
      ),
      m(
        "Choose the right visual",
        ["Redraw two charts in a better format", "Explain your choice"],
        ["swd-blog", "Chart makeovers"],
      ),
      m(
        "Declutter & focus",
        ["Remove clutter from one slide", "Use color to highlight one point"],
        ["swd-blog", "Decluttering"],
        ["ppt-training", "Design basics"],
      ),
      m(
        "Structure the story",
        [
          "Outline a deck with situation–complication–resolution",
          "Write action titles for each slide",
        ],
        ["mit-mgmt-comm", "Lecture notes on structure"],
      ),
      m(
        "Engage stakeholders",
        ["Watch the Wharton course week 1", "Plan a stakeholder update"],
        ["wharton-comm", "Week 1"],
      ),
      m(
        "Write clearly",
        ["Rewrite one email in half the words", "Draft a project summary"],
        ["business-writing", "Week 1"],
      ),
      m(
        "Practice delivery",
        ["Record a 3-minute presentation", "Note filler words and pacing"],
        ["wharton-comm", "Delivery module"],
      ),
      m(
        "Feedback loop",
        ["Present to a peer and collect feedback", "Revise one slide"],
        ["mit-mgmt-comm", "Presentation guidelines"],
      ),
    ],
  ],
  [
    /case|problem framing|prioriti|scope|requirement|acceptance|process|product|jira/i,
    [
      m(
        "Problem framing",
        [
          "Watch a case framework video",
          "Frame one business problem as a hypothesis tree",
        ],
        ["caseinterview", "Case interview videos"],
      ),
      m(
        "Requirements",
        [
          "Read Atlassian on user stories",
          "Write five user stories for an analytics request",
        ],
        ["atlassian-agile", "User stories"],
      ),
      m(
        "Acceptance criteria",
        ["Add acceptance criteria to each story", "Review with a peer"],
        ["jira-guides", "Issues & workflows"],
      ),
      m(
        "Prioritization",
        ["Apply RICE or MoSCoW to a backlog", "Justify the top three"],
        ["productplan-learn", "Prioritization frameworks"],
      ),
      m(
        "Process mapping",
        ["Map one workflow end to end", "Mark three bottlenecks"],
        ["atlassian-agile", "Workflow & kanban"],
      ),
      m(
        "Product thinking",
        ["Read two SVPG articles", "Define success metrics for a feature"],
        ["svpg-articles", "Product discovery"],
      ),
      m(
        "Case practice",
        ["Solve one market-sizing and one profitability case", "Time yourself"],
        ["caseinterview", "Practice cases"],
      ),
      m(
        "Communicate a recommendation",
        ["Write a one-page recommendation", "Present it in 3 minutes"],
        ["swd-blog", "Presenting recommendations"],
      ),
    ],
  ],
];

const generic: Module[] = [
  m(
    "Map the skill",
    [
      "List the sub-skills and tools involved",
      "Pick one free course from your resource kit",
    ],
    ["google-da-cert", "Course 1 overview"],
  ),
  m(
    "Learn the fundamentals",
    [
      "Complete the first module of your chosen course",
      "Write five key terms with definitions",
    ],
    ["google-da-cert", "Course 1"],
  ),
  m(
    "Guided practice",
    ["Do three exercises from the course", "Note where you got stuck"],
    ["khan-stats", "Pick a relevant unit"],
  ),
  m(
    "Apply to data",
    ["Apply the skill to a small public dataset", "Document steps"],
    ["kaggle-cleaning", "Use as a data-prep warm-up"],
  ),
  m(
    "Quality checks",
    ["Check your work against a second method", "List assumptions"],
    ["google-da-cert", "Process data course"],
  ),
  m(
    "Communicate",
    ["Summarize what you did in five sentences", "Make one chart or diagram"],
    ["swd-blog", "Any recent post"],
  ),
  m(
    "Feedback",
    ["Share with a peer and ask for two improvements", "Revise"],
    ["wharton-comm", "Feedback module"],
  ),
  m(
    "Capstone",
    ["Complete a small end-to-end task", "Reflect on next steps"],
    ["google-da-cert", "Capstone ideas"],
  ),
];

export function trackFor(skill: string) {
  return tracks.find(([re]) => re.test(skill))?.[1] ?? generic;
}

const checkpoints: [RegExp, string[]][] = [
  [
    /interview/i,
    [
      "Do a 45-minute mock interview with a friend using unseen questions",
      "Explain your reasoning out loud for every answer",
      "List three topics to review before the real interview",
    ],
  ],
  [
    /take-home/i,
    [
      "Complete a 3-hour mock take-home on a public dataset",
      "Write a README with assumptions and checks",
      "Have a peer review it like an interviewer",
    ],
  ],
  [
    /case competition/i,
    [
      "Solve a past case in 2 hours with a teammate",
      "Build a 5-slide recommendation",
      "Rehearse a 5-minute pitch and Q&A",
    ],
  ],
  [
    /team|class/i,
    [
      "Deliver your part of a group deliverable using the skill",
      "Write a handoff note for teammates",
      "Ask one teammate for feedback",
    ],
  ],
  [
    /speed/i,
    [
      "Redo your week-1 task and compare the time",
      "Write your personal cheat sheet",
      "Pick two habits to keep",
    ],
  ],
];
export function checkpointTasks(scenario: string, skill: string) {
  return (
    checkpoints.find(([re]) => re.test(scenario))?.[1] ?? [
      `Simulate a first-week task that needs ${skill}, end to end`,
      "Write a short handoff note as you would for a manager",
      "List what you would ask on day one",
    ]
  );
}
