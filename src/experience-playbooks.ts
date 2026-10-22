// Original synthetic work samples. Public references support workflow concepts;
// they do not verify the fictional employers, routines, artifacts, or results.
type Reference = { title: string; url: string };
type Playbook = {
  technicalSkills: string[];
  title: string;
  filename: string;
  description: string;
  reviewCheck: string;
  content: string;
  references: Reference[];
};
const references = {
  joins: {
    title: "pandas: merge validation and join behavior",
    url: "https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.merge.html",
  },
  tests: {
    title: "dbt: uniqueness, null, and relationship tests",
    url: "https://docs.getdbt.com/reference/resource-properties/data-tests",
  },
  time: {
    title: "scikit-learn: chronological cross-validation",
    url: "https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html",
  },
  model: {
    title: "Microsoft: Power BI star schemas",
    url: "https://learn.microsoft.com/en-us/power-bi/guidance/star-schema",
  },
  attribution: {
    title: "Google: what attribution models measure",
    url: "https://support.google.com/google-ads/answer/6259715?hl=en",
  },
  survey: {
    title: "Qualtrics: reviewing response quality",
    url: "https://www.qualtrics.com/support/survey-platform/survey-module/survey-checker/response-quality/",
  },
  energy: {
    title: "EIA: open energy data and hourly demand series",
    url: "https://www.eia.gov/opendata/",
  },
};
export const publicInsiderAccounts = [
  {
    title: "A graduate student inside Uber’s experimentation team",
    attribution:
      "Sebastian Carmona Angel · UMBC Data Science · published Oct 12, 2023",
    summary:
      "UMBC’s account describes an internship assessing experimentation data pipelines and building insights for internal experiment users, including Python dashboard work. It offers a real graduate-student perspective; it does not publish a daily schedule or employer work files.",
    url: "https://professionalprograms.umbc.edu/blog/data-science-internship-experience/",
  },
  {
    title: "What data science managers actually give interns",
    attribution: "David and Javed · Uber Bangalore · manager interview",
    summary:
      "Uber’s managers describe interns analyzing merchant survey feedback and reviewing fraud rules for precision and customer friction. They highlight SQL readiness, detailed business context, and checking numbers. These are manager-reported examples, with no MSBA affiliation claimed.",
    url: "https://jobs.uber.com/en/people-stories/life-at-uber/an-exclusive-glimpse-into-uber-s-data-science-scientist-internship-program-in-bangalore/",
  },
];
export const experiencePlaybooks: Record<string, Playbook> = {
  "demo-1": {
    technicalSkills: [
      "SQL: CTEs, ROW_NUMBER deduplication, LEFT JOIN, conditional aggregation, date-window boundaries",
      "Data QA: unique event IDs, lookup cardinality, row-count controls, and mature-cohort denominators",
      "Python/pandas: groupby and merge(validate='many_to_one') for segment checks",
      "Tableau: COUNTD, filter scope, refresh timestamps, and warehouse-to-dashboard reconciliation",
      "Git: reviewed SQL changes and a reproducible metric definition",
    ],
    title: "Seven-day activation query",
    filename: "activation_qa.sql",
    description:
      "Run this self-contained PostgreSQL query in a scratch database. The fixture includes a duplicate event, a nonconverter, and an immature signup cohort.",
    reviewCheck:
      "Expected: 2 eligible users, 1 activated user, activation_rate = 0.5000. The duplicate must not inflate the numerator; the recent signup must stay out of the denominator.",
    references: [references.tests, references.joins],
    content: `-- EchoPath original teaching sample. All rows are synthetic.
-- PostgreSQL; read-only CTEs, no existing tables required.
-- Seven-day window is [signup_at, signup_at + 7 days).
WITH params AS (
  SELECT TIMESTAMP '2026-09-15 00:00:00' AS as_of
), signups(user_id, signup_at) AS (
  VALUES ('u1', TIMESTAMP '2026-09-01 09:00'),
         ('u2', TIMESTAMP '2026-09-02 09:00'),
         ('u3', TIMESTAMP '2026-09-14 09:00')
), events(event_id, user_id, event_at) AS (
  VALUES ('e1', 'u1', TIMESTAMP '2026-09-03 10:00'),
         ('e1', 'u1', TIMESTAMP '2026-09-03 10:00'),
         ('e2', 'u3', TIMESTAMP '2026-09-14 10:00')
), ranked AS (
  SELECT *, ROW_NUMBER() OVER (
    PARTITION BY event_id ORDER BY event_at, user_id
  ) AS rn FROM events
), eligible AS (
  SELECT s.* FROM signups s CROSS JOIN params p
  WHERE s.signup_at + INTERVAL '7 days' <= p.as_of
), user_outcomes AS (
  SELECT s.user_id, MAX(CASE WHEN e.event_id IS NOT NULL
    THEN 1 ELSE 0 END) AS activated
  FROM eligible s LEFT JOIN ranked e
    ON s.user_id = e.user_id AND e.rn = 1
    AND e.event_at >= s.signup_at
    AND e.event_at < s.signup_at + INTERVAL '7 days'
  GROUP BY s.user_id
)
SELECT COUNT(*) AS eligible_users, SUM(activated) AS activated_users,
  ROUND(SUM(activated)::numeric / NULLIF(COUNT(*), 0), 4)
    AS activation_rate
FROM user_outcomes;
-- Next QA cases: null IDs, staff accounts, and boundary timestamps.
`,
  },
  "demo-2": {
    technicalSkills: [
      "pandas: explicit ID dtypes, required-column checks, merge validation, and unmatched-key reporting",
      "Excel: SUMIFS, XLOOKUP, pivots, and source-to-output control totals",
      "Power Query: typed transformations, parameters, and repeatable refresh steps",
      "Power BI: one-to-many relationships and measure acceptance checks",
    ],
    title: "Client reporting acceptance checklist",
    filename: "reporting_acceptance.md",
    description:
      "A completed miniature handoff showing the requirements and rejection cases that sit behind a reporting prototype. Amounts and identifiers are invented.",
    reviewCheck:
      "A reviewer should be able to test the grain, control total, duplicate-key failure, unmatched-account path, and ownership without asking the author what ‘done’ means.",
    references: [references.joins, references.model],
    content: `# Weekly invoiced-revenue prototype — synthetic example
Decision owner: finance reporting lead (fictional role)
Input grain: one row per invoice. Output grain: month / business unit.
Revenue event: invoice issued; not opportunity booked.
Required columns: invoice_id, account_id, invoice_date, net_amount
Account IDs: strings; preserve leading zeros.

## Acceptance cases
1. Base: invoices I01=120 and I02=80 => total net revenue 200.
2. Duplicate invoice_id I01 => fail validation; do not drop silently.
3. Unknown account_id 009 => write row to exceptions.csv with reason.
4. Missing invoice_date column => stop with a required-column error.
5. Invalid date => quarantine row; report excluded amount separately.
6. Business-unit lookup must have one row per account_id.

## pandas join contract
Reject null join keys before merge (pandas can match nulls).
Use merge(..., on="account_id", how="left",
          validate="many_to_one", indicator=True).
Inspect _merge == "left_only"; compare source/output control totals.

## Refresh handoff
Owner: client reporting analyst (fictional role).
Before publishing: compare source total with included + rejected totals.
Attach: raw-file version, mapping version, exception count, refresh time.
Open dependency: reviewer to approve treatment of credit notes.
Time saving: unmeasured; no savings claim until both runs are timed.
`,
  },
  "demo-3": {
    technicalSkills: [
      "pandas: complete calendar grids, groupby().shift(), and origin-safe lag features",
      "scikit-learn: chronological validation and training-only preprocessing with Pipeline",
      "Forecasting: same-weekday baseline, horizon-aware features, MAE and signed-error analysis",
      "Reproducibility: fixed cutoffs, versioned features, saved predictions, and clean notebook execution",
    ],
    title: "Seven-day forecast backtest",
    filename: "forecast_backtest.py",
    description:
      "A runnable, standard-library-only Python baseline. It predicts a complete future week using only the previous week’s observations and prints its errors.",
    reviewCheck:
      "Run with Python 3. Expected: 7 forecast rows, MAE = 2.00, mean signed error = -2.00 (prediction minus actual). Changing holdout values must not change the forecasts.",
    references: [references.time],
    content: `"""EchoPath original synthetic forecast; no patient or employer data.
Run: python3 forecast_backtest.py
"""
from datetime import date, timedelta
from statistics import mean

start = date(2026, 8, 3)  # Monday
weekly_pattern = [20, 22, 24, 23, 21, 8, 6]
# Five synthetic weeks, with a +2 weekly trend.
observed = {
    start + timedelta(days=i): weekly_pattern[i % 7] + 2 * (i // 7)
    for i in range(35)
}
origin = start + timedelta(days=28)
train = {d: n for d, n in observed.items() if d < origin}
assert max(train) < origin

# Freeze predictions before looking at holdout outcomes.
predictions = {
    origin + timedelta(days=h): train[origin + timedelta(days=h - 7)]
    for h in range(7)
}
errors = []
print("date,prediction,actual,error")
for day, prediction in predictions.items():
    actual = observed[day]
    error = prediction - actual
    errors.append(error)
    print(f"{day},{prediction},{actual},{error}")
print(f"MAE={mean(abs(e) for e in errors):.2f}")
print(f"Mean signed error={mean(errors):.2f}")
# Candidate models must use the same origins and horizon for comparison.
# For multiple clinics, split by date globally, not by interleaved row index.
`,
  },
  "demo-4": {
    technicalSkills: [
      "SQL: assignment-to-outcome LEFT JOIN at the workspace randomization unit",
      "Amplitude: event contracts, funnel eligibility, and exposure QA",
      "Experiment analysis: allocation checks, fixed outcome windows, effect uncertainty, and guardrails",
      "Figma/Jira: annotated states and testable acceptance criteria",
    ],
    title: "Onboarding experiment brief",
    filename: "onboarding_experiment.md",
    description:
      "A filled synthetic product brief connecting the user problem to instrumentation, analysis, and the launch decision. Targets are planning assumptions, not measured results.",
    reviewCheck:
      "Verify that nonconverters remain in the denominator, workspace assignment stays stable, and seven-day outcomes mature before analysis. A sample size must be approved before launch.",
    references: [],
    content: `# Shorter workspace setup — synthetic experiment brief
Problem: setup may prevent new workspaces from inviting teammates.
Hypothesis: fewer required setup steps increase successful first invites.
Owner: product lead (fictional role); analyst prepares the readout.

Eligibility: new non-test workspaces, assigned once before first exposure.
Randomization: workspace_id, 50/50; all members keep the same variant.
Primary metric: assigned workspaces with >=1 invite_success in 7 days
                / all eligible assigned workspaces with mature windows.
Window: [assignment_at, assignment_at + 7 days).
Guardrails: invite failure rate and support contacts per workspace.

Events:
setup_view(workspace_id, variant, event_id, event_at)
invite_success(workspace_id, event_id, event_at)
invite_failure(workspace_id, reason_code, event_id, event_at)
Do not put email addresses in event properties.

Before launch: approve minimum detectable effect, baseline rate,
power, sample size, planned checkpoint, and guardrail stop thresholds.
Analysis: test assignment balance; inspect missing exposures; compare
workspace-level outcomes and uncertainty. Do not drop non-exposed
assigned workspaces to improve the primary metric.
Decision: pending — no experiment has been run in this teaching example.
`,
  },
  "demo-5": {
    technicalSkills: [
      "SQL/BigQuery: first-order CTEs, distinct order grain, 30-day windows, and safe division",
      "Marketing QA: campaign/day aggregation, UTM audits, spend controls, and refund treatment",
      "Looker/Excel: coherent CAC and ROAS definitions with refresh and attribution context",
      "Measurement: mature cohorts and the distinction between attributed conversion and incremental lift",
    ],
    title: "Mature-cohort repeat purchase query",
    filename: "repeat_30d.sql",
    description:
      "Self-contained PostgreSQL example of a customer-based repeat-purchase rate. The same cohort and grain checks apply when adapting it to BigQuery syntax.",
    reviewCheck:
      "Expected: 2 mature customers, 1 repeat customer, repeat_rate = 0.5000. The immature customer stays excluded even though it already has a repeat order.",
    references: [references.attribution],
    content: `-- EchoPath original synthetic orders. PostgreSQL scratch query.
-- Assumption: one row per completed order, not one row per item.
WITH orders(order_id, customer_id, ordered_at) AS (
  VALUES ('o1', 'c1', TIMESTAMP '2026-08-01 09:00'),
         ('o2', 'c1', TIMESTAMP '2026-08-10 09:00'),
         ('o3', 'c2', TIMESTAMP '2026-08-02 09:00'),
         ('o4', 'c3', TIMESTAMP '2026-09-10 09:00'),
         ('o5', 'c3', TIMESTAMP '2026-09-11 09:00')
), first_order AS (
  SELECT customer_id, MIN(ordered_at) AS first_at
  FROM orders GROUP BY customer_id
), mature AS (
  SELECT * FROM first_order
  WHERE first_at + INTERVAL '30 days'
    <= TIMESTAMP '2026-09-15 00:00'
), outcomes AS (
  SELECT m.customer_id,
    CASE WHEN COUNT(o.order_id) > 1 THEN 1 ELSE 0 END AS repeated
  FROM mature m LEFT JOIN orders o
    ON o.customer_id = m.customer_id
    AND o.ordered_at >= m.first_at
    AND o.ordered_at < m.first_at + INTERVAL '30 days'
  GROUP BY m.customer_id
)
SELECT COUNT(*) AS mature_customers, SUM(repeated) AS repeat_customers,
  ROUND(SUM(repeated)::numeric / NULLIF(COUNT(*), 0), 4) AS repeat_rate
FROM outcomes;
-- Production QA: tied first-order times, cancellations, refunds,
-- duplicate order IDs, timezone, and genuinely complete order history.
`,
  },
  "demo-6": {
    technicalSkills: [
      "Power Query: append/merge, category maps, explicit types, and exception handling",
      "Power BI: star schemas, unique dimension keys, one-to-many relationships, and date dimensions",
      "DAX: COUNTROWS, DISTINCTCOUNT, DIVIDE, and filter context for non-additive totals",
      "SQL/Excel: reconciliation of source pivots to model measures",
    ],
    title: "BI measure and acceptance sheet",
    filename: "program_measures.md",
    description:
      "A tiny synthetic visit model showing the common difference between service visits and people served, with DAX and expected totals.",
    reviewCheck:
      "Expected: 3 visits, 2 unique people overall. Program A has 2 people and Program B has 1; adding those program counts would overstate the organization-wide total.",
    references: [references.model],
    content: `# Program attendance — synthetic model and measures
FactVisit: visit_id, participant_id, program_id, visit_date
v1,p1,A,2026-09-01
v2,p1,B,2026-09-02
v3,p2,A,2026-09-03

Dimensions: DimParticipant, DimProgram, DimDate.
Each dimension key is unique and non-null; facts have valid foreign keys.
Relationships: dimension (one) -> fact (many), single-direction filters.
Reject or resolve missing participant keys before publishing.

DAX:
Visits = COUNTROWS(FactVisit)
People Served = DISTINCTCOUNT(FactVisit[participant_id])
Visits per Person = DIVIDE([Visits], [People Served])

Acceptance checks:
No filters: Visits=3, People Served=2, Visits per Person=1.5.
Program A: Visits=2, People Served=2.
Program B: Visits=1, People Served=1.
Grand total People Served=2; it is NOT 2+1.

Refresh: record workbook versions, category-map version, rejected rows,
and source/model visit totals. Test an unknown category and duplicate
participant dimension key before handing the report to a program owner.
`,
  },
  "demo-7": {
    technicalSkills: [
      "SQL: latest-event ROW_NUMBER, as-of status classification, and site timezone conversion",
      "pandas: groupby/quantile for shift-level median and p90 durations",
      "Excel/Solver: productive labor-hour calculations and constrained staffing scenarios",
      "Operations QA: open-versus-completed populations and missing-timestamp exception handling",
    ],
    title: "Shift exception queue",
    filename: "shift_exception_log.csv",
    description:
      "A synthetic dispatch handoff as of 2026-09-15 08:00 UTC. It distinguishes overdue shipments, not-yet-due work, completed delays, and missing promises.",
    reviewCheck:
      "Only S001 is open and overdue. S002 is open but not due; S003 is completed late; S004 needs a timestamp investigation. Confirm timezone before using a local shift label.",
    references: [references.tests],
    content: `shipment_id,promised_at_utc,completed_at_utc,status_as_of,classification,owner_role,next_action
S001,2026-09-15T07:00:00Z,,awaiting_carrier,open_overdue,dispatch,Confirm pickup and log revised estimate
S002,2026-09-15T10:00:00Z,,picking,open_not_due,shift_supervisor,Monitor against promised cutoff
S003,2026-09-15T06:00:00Z,2026-09-15T06:20:00Z,completed,completed_late,operations_analyst,Review cause in completed-shipment analysis
S004,,,packing,unknown_promise,data_owner,Resolve missing promised timestamp before SLA reporting
`,
  },
  "demo-8": {
    technicalSkills: [
      "R/dplyr: response-key validation, joins, grouped counts, and disposition logs",
      "tidyr: pivot_longer and respondent/option deduplication for multi-select questions",
      "Qualtrics: recodes, skip logic, and review of quality flags before exclusion",
      "Survey analysis: question-specific bases, weighted versus unweighted counts, and sampling limits",
    ],
    title: "Multi-select crosstab with explicit bases",
    filename: "survey_crosstab.csv",
    description:
      "An invented three-respondent onboarding question where people can choose several barriers. Counts are unweighted; the base is respondents, not selections.",
    reviewCheck:
      "Base = 3 for every option. Counts are 2, 2, and 1, so rounded percentages sum to 166.7%. That is valid for a multi-select question and is not a population estimate.",
    references: [references.survey],
    content: `question,segment,option,respondents_selecting,valid_respondent_base,percent_of_respondents,notes
onboarding_barriers,all,unclear_setup,2,3,66.7,Synthetic example; multi-select; unweighted
onboarding_barriers,all,invite_errors,2,3,66.7,Synthetic example; multi-select; unweighted
onboarding_barriers,all,time_required,1,3,33.3,Synthetic example; multi-select; unweighted
`,
  },
  "demo-9": {
    technicalSkills: [
      "SQL: aggregate-before-join, FULL OUTER JOIN, COALESCE, and zero-budget handling",
      "Excel: SUMIFS, XLOOKUP, pivots, and variance bridges",
      "Power Query/Power BI: account type preservation and controlled reporting refreshes",
      "Finance QA: ledger control totals, effective-dated mappings, and versioned snapshots",
    ],
    title: "Expense variance with reconciliation controls",
    filename: "expense_variance.sql",
    description:
      "A runnable PostgreSQL expense report with budget-only and actual-only accounts. All currency amounts are invented and expressed in one reporting currency.",
    reviewCheck:
      "Expected totals: actual = 150, budget = 140, variance = +10. Account 6300 has zero budget and a NULL percentage; positive expense variance is unfavorable under this convention.",
    references: [references.joins, references.model],
    content: `-- EchoPath original synthetic expense data. PostgreSQL.
-- Report grain: account, after fixing one month/cost center/currency.
WITH ledger(account, amount) AS (
  VALUES ('6100', 100::numeric), ('6100', 20::numeric), ('6300', 30::numeric)
), budget_input(account, amount) AS (
  VALUES ('6100', 100::numeric), ('6200', 40::numeric)
), actuals AS (
  SELECT account, SUM(amount) AS actual FROM ledger GROUP BY account
), budgets AS (
  SELECT account, SUM(amount) AS budget FROM budget_input GROUP BY account
), report AS (
  SELECT COALESCE(a.account, b.account) AS account,
    COALESCE(a.actual, 0) AS actual, COALESCE(b.budget, 0) AS budget
  FROM actuals a FULL OUTER JOIN budgets b ON a.account = b.account
)
SELECT account, actual, budget, actual - budget AS variance,
  ROUND((actual - budget) / NULLIF(ABS(budget), 0), 4) AS variance_pct,
  CASE WHEN budget = 0 THEN 'review_zero_budget' ELSE 'budgeted' END AS flag
FROM report ORDER BY account;
-- Control totals: actual 150; budget 140; variance +10.
-- Review mapping uniqueness and source controls BEFORE adding commentary.
`,
  },
  "demo-10": {
    technicalSkills: [
      "pandas: timezone-aware timestamps, interval-key checks, reindexing, and resampling",
      "Time-series QA: coverage, true zero versus missing, and daylight-saving transitions",
      "Scenario analysis: MW versus kWh units, baseline comparability, and imputation sensitivity",
      "Tableau/Excel: observed-versus-modeled series and documented tariff assumptions",
    ],
    title: "Interval-meter quality log",
    filename: "energy_quality_log.csv",
    description:
      "An original synthetic 15-minute meter extract with a missing interval. It demonstrates a QA handoff; it is not downloaded from EIA and is not a measured savings result.",
    reviewCheck:
      "Expected: 3 observed intervals out of 4 (75% coverage); observed energy = 27 kWh. Keep the missing interval blank. Observed subtotal is not a complete hour’s consumption.",
    references: [references.energy],
    content: `interval_start,energy_kwh,quality_flag,imputed,review_action
2026-09-15T09:00:00-07:00,8,observed,false,Keep original reading
2026-09-15T09:15:00-07:00,9,observed,false,Keep original reading
2026-09-15T09:30:00-07:00,,missing,false,Investigate source; do not convert to zero
2026-09-15T09:45:00-07:00,10,observed,false,Keep original reading
`,
  },
};
