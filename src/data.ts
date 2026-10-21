import { type Experience, type Submission, extractTemplate } from "./domain";
import { experiencePlaybooks } from "./experience-playbooks";

// Original teaching scenarios, not student testimony. Real public accounts are
// linked separately in Explore; names, schedules, and outputs here are invented.
type Scenario = Pick<
  Submission,
  | "role_title"
  | "company"
  | "industry"
  | "role_category"
  | "experience_type"
  | "tools"
  | "responsibilities"
  | "projects"
  | "typical_day"
  | "challenges"
  | "solutions"
  | "valuable_skills"
  | "lessons_learned"
  | "advice"
>;
const records: Scenario[] = [
  {
    role_title: "Business Analytics Intern",
    company: "Northstar Labs",
    industry: "Technology",
    role_category: "Analytics",
    experience_type: "Internship",
    tools: "SQL, Python, Tableau, Snowflake, pandas, Git",
    responsibilities:
      "Own the signup-to-activation readout for a product manager: validate yesterday’s events, investigate funnel changes by platform and acquisition channel, and turn the findings into a decision for the onboarding team.",
    projects: `Daily output: activation_qa.sql, a small exception table, and a three-line update: what moved / likely explanation / next check. The dashboard includes the extraction timestamp and the metric definition, not just a conversion percentage.

Internship project: a seven-day activation funnel. Grain: one row per eligible new user; denominator: signups whose full seven-day window has elapsed; numerator: users with a qualifying workspace_created event inside that window. Exclude staff and test accounts. Keep signup cohort date separate from event date.

Handoff: reviewed query in Git, Tableau workbook, event dictionary, and a README covering refresh ownership and known tracking gaps. A PM should be able to reproduce the number without asking the intern.`,
    typical_day: `09:00 — Check the warehouse load timestamp, event volume, null user IDs, and duplicate event IDs. If yesterday’s partition is incomplete, mark the report provisional before anyone interprets the drop.
09:30 — Stand-up: yesterday’s finding, today’s question, blocker, and the person needed to unblock it.
10:00 — SQL: use ROW_NUMBER to keep one event per event_id; LEFT JOIN eligible signups to first qualifying events; compare row counts before and after each join. Inspect five synthetic user journeys manually.
13:00 — Python/pandas: compare signup cohorts by platform and channel, then check whether a mix shift explains the overall change. Use merge(validate="many_to_one") for lookup tables.
14:30 — Update Tableau only after QA. Check COUNTD(user_id), filters, and the default date window against the warehouse result.
16:00 — Send the PM one annotated chart, the query link, caveat, and proposed next action. Batch nonurgent questions for the mentor.`,
    challenges:
      "An events-to-campaigns join can multiply users when a campaign lookup has duplicate keys. Separately, today’s signups have had less time to activate than last week’s, so a fresh cohort can look worse even when the experience is unchanged.",
    solutions:
      "Check lookup uniqueness before joining; deduplicate with an explicit tie-breaker and log unmatched keys. Freeze an as-of timestamp, compare only mature seven-day cohorts, and show distinct-user control totals at every stage. Keep tracking changes in a dated changelog.",
    valuable_skills:
      "Metric definition, Stakeholder communication, Problem framing, Data QA, Cohort analysis",
    lessons_learned:
      "The first useful question is ‘which dashboard and definition does the PM already trust?’ Write down timezone, eligibility, observation window, and the event owner before building a competing number. A good anomaly update separates an observed fact from an untested explanation.",
    advice:
      "Practice SQL joins, CTEs, ROW_NUMBER, conditional aggregation, and date arithmetic on synthetic signup/event tables. Deliver a mature-cohort activation query with duplicate and boundary-event test cases, then explain a dashboard discrepancy in five sentences. Learn Tableau distinct counts and pandas merge validation before polishing chart colors.",
  },
  {
    role_title: "Technology Consulting Analyst",
    company: "Meridian Advisory",
    industry: "Consulting",
    role_category: "Consulting",
    experience_type: "Internship",
    tools: "Python, Excel, Power BI, pandas, Power Query, PowerPoint",
    responsibilities:
      "Rebuild a client’s weekly sales reporting process from messy exports into a repeatable refresh. Document the existing workflow, resolve conflicting definitions with the process owner, and demonstrate a small automation that another analyst can operate.",
    projects: `Daily output: a requirements log with an owner and acceptance criterion for each request; a source-to-target mapping; an exceptions.csv listing rejected rows and reasons.

Prototype: read synthetic CRM and invoice exports with Python, standardize account keys and dates, validate many-to-one joins, and write a clean reporting table. Use Excel pivots for an independent total check before connecting Power BI.

Weekly handoff: a five-slide pack: decision needed, current process, prototype, quantified assumptions, and unresolved dependencies. Log estimated time savings as an assumption until someone times the old and new workflows.`,
    typical_day: `08:45 — Read the project issue log; confirm the version and extraction date of each source file.
09:15 — Team check-in: agree what must be ready for the next client demo. An intern prepares the analysis; the engagement lead approves client commitments.
10:00 — Walk a process owner through one real reporting cycle: input, transformation, reviewer, exception, final recipient. Ask them to demonstrate the spreadsheet rather than describe an ideal process.
11:30 — Python: read IDs as strings to preserve leading zeros; coerce dates; check duplicate invoice keys; use pandas merge with validate and indicator; quarantine unmatched accounts.
14:00 — Power Query: set explicit data types and refresh parameters. Compare Excel SUMIFS/pivot totals against the prototype by month and business unit.
16:00 — Demo one completed slice; capture acceptance or a precise change request. Send a short action log with owner and due date.`,
    challenges:
      "The sales lead wants booked revenue while finance wants invoiced revenue. A visually identical column called ‘sales’ would conceal two different business events. New exports can also change a column name without warning.",
    solutions:
      "Define separate booked and invoiced measures, name their source dates, and get the owner to approve the mapping. Validate required columns before transforming files; fail with a useful error instead of silently producing an empty dashboard. Preserve the raw export and row-level exception reasons.",
    valuable_skills:
      "Requirements gathering, Process mapping, Acceptance criteria, Presentation, Scope management",
    lessons_learned:
      "A client saying ‘looks good’ is not a test case. Ask what row count, total, filter, and exception behavior would make them accept the result. Never promise a production automation while access approvals and refresh ownership are unresolved.",
    advice:
      "Build a miniature reporting pipeline from two deliberately inconsistent CSV exports. Practice pandas merge validation, Excel XLOOKUP/SUMIFS, Power Query types and parameters, and Power BI relationships. Submit an exceptions file, a mapping document, and three acceptance tests alongside the dashboard.",
  },
  {
    role_title: "Data Science Intern",
    company: "Cedar Health Analytics",
    industry: "Healthcare",
    role_category: "Data Science",
    experience_type: "Internship",
    tools: "Python, pandas, scikit-learn, SQL, Git, Jupyter",
    responsibilities:
      "Forecast next-week appointment demand at clinic-day level for a scheduling lead. Maintain a reproducible evaluation notebook, compare simple baselines with a candidate model, and explain where the forecast would cause under- or over-staffing.",
    projects: `Daily output: a run log with cutoff date, feature version, validation window, baseline error, candidate error, and the worst clinic-day misses. Save predictions with observed values so a mentor can inspect failures.

Internship project: use synthetic aggregated appointment counts to compare a same-weekday-last-week forecast with a tree-based regressor. Features include known calendar information and lagged demand; aggregate each clinic to a regular daily calendar before splitting.

Final deliverable: forecast_backtest.py, an error-by-clinic CSV, a model card describing intended use and limits, and a handoff notebook that runs from a clean environment. No patient-level records are needed for the teaching example.`,
    typical_day: `09:00 — Inspect yesterday’s data coverage and changed clinic schedules. Check whether a zero is a closed clinic, a genuine zero, or a missing load.
09:45 — Mentor sync: agree the operational decision, forecast horizon, and latest information available at prediction time.
10:30 — pandas: build a complete clinic/date grid, sort it, and create lags with groupby().shift(). Every rolling feature uses only dates before the prediction origin.
13:00 — scikit-learn: evaluate chronological folds; fit preprocessing inside each training fold. Keep all clinics on the same date on the same side of a cutoff. For a next-seven-day forecast, do not use actual demand from inside that future week.
15:00 — Compare MAE and signed error by clinic and weekday with the naive baseline. Examine the largest misses rather than celebrating one overall score.
16:00 — Record parameters and commit the notebook/script. Explain one failure to the scheduling lead and confirm what action, if any, it supports.`,
    challenges:
      "Random train/test splits let future patterns influence evaluation. A ‘last seven days’ feature can also accidentally include the day being predicted, or unavailable actuals from inside a multi-day forecast horizon.",
    solutions:
      "Use explicit chronological cutoffs, origin-safe features, and a training-only preprocessing pipeline. Evaluate the full seven-day horizon from each origin; either forecast recursively or use horizon-specific features known at the origin. Compare with a transparent same-weekday baseline and keep closed-clinic days identifiable.",
    valuable_skills:
      "Experiment design, Error analysis, Reproducibility, Operational communication, Forecast evaluation",
    lessons_learned:
      "A lower average error is not enough if the model repeatedly understaffs one clinic. Ask the lead how under-forecasting and over-forecasting differ in cost. A baseline that is understandable and reproducible is a real deliverable.",
    advice:
      "Practice pandas groupby/shift, calendar reindexing, chronological backtests, scikit-learn Pipelines, and MAE. Build a seven-day forecast using only origin-available information; include a naive baseline, fold dates, and an error table. Explain why shuffled validation would be misleading.",
  },
  {
    role_title: "Product Strategy Associate",
    company: "Orbit Workspace",
    industry: "Technology",
    role_category: "Product",
    experience_type: "Full-Time",
    tools: "SQL, Figma, Amplitude, Excel, Jira",
    responsibilities:
      "Translate onboarding problems into a scoped product change. Combine user interviews and event analysis, specify the tracking contract, and prepare an experiment readout that makes the launch decision and uncertainty clear.",
    projects: `Daily output: a decision log, an instrumented funnel cut, and a ticket with acceptance criteria. The ticket names the actor, event, properties, and expected behavior for success, failure, retry, and cancellation.

Project: test a shorter workspace setup flow. Randomization unit: workspace; outcome: first successful invite within seven days. Keep assignment stable across members and sessions. Guardrails include invite failures and support contacts.

Review output: a one-page experiment brief with hypothesis, eligibility, randomization, primary metric, guardrails, planned analysis date, and rollout owner. The synthetic experiment brief below shows the format; it is not a reported business result.`,
    typical_day: `09:00 — Review experiment exposure and event health in Amplitude. Confirm the denominator is eligible assigned workspaces, not only users who clicked the new flow.
10:00 — Talk with design and engineering about one concrete user obstacle; check support feedback against usage evidence.
11:00 — SQL: join assignment to outcomes at workspace grain; retain nonconverters with a LEFT JOIN; check assignment balance and missing exposures.
13:00 — Figma review: annotate empty states, failed invites, and tracking events. Write testable acceptance criteria in Jira.
15:00 — Analyze an experiment only at the planned checkpoint unless a guardrail triggers an agreed stop rule. Review effect size and uncertainty with the analyst.
16:30 — Publish the decision, owner, next date, and open question. A shipping decision belongs to the accountable product lead.`,
    challenges:
      "A loud feature request can dominate the roadmap, while a workspace-level test is mistakenly analyzed as independent user rows. Repeatedly checking for significance can also tempt a team to stop on a lucky fluctuation.",
    solutions:
      "Link requests to a defined problem and affected segment. Match analysis to the randomization unit, predefine the primary metric and analysis window, and review exposure issues before interpreting lift. Record ‘insufficient evidence’ as a valid outcome.",
    valuable_skills:
      "Prioritization, Product thinking, Experiment design, Requirements writing, Cross-functional alignment",
    lessons_learned:
      "You often spend more time deciding what a metric means and how to instrument it than making the chart. A useful product brief tells engineering what to build and tells analytics how to know whether it helped.",
    advice:
      "Practice SQL left joins and conditional aggregation, Amplitude funnels/cohorts, and Figma annotations. Write an experiment brief with unit of randomization, a seven-day outcome window, sample-size assumptions, and a guardrail response. Rehearse explaining a neutral or inconclusive result.",
  },
  {
    role_title: "Marketing Analytics Intern",
    company: "Juniper Market",
    industry: "Retail",
    role_category: "Marketing",
    experience_type: "Internship",
    tools: "SQL, Excel, Looker, Google Analytics 4, BigQuery",
    responsibilities:
      "Maintain a channel performance scorecard and a 30-day repeat-purchase cohort report. Reconcile advertising spend and order totals, explain attribution differences, and prepare a budget discussion without presenting attributed revenue as causal impact.",
    projects: `Daily output: a channel/day scorecard with spend, attributed orders, net revenue, CAC definition, and source refresh time; a separate exceptions list for missing campaign tags and unmapped IDs.

Project: repeat_30d.sql groups customers by first completed purchase date and checks for a second distinct completed order within 30 days. Only customers with a fully observed window enter the repeat-rate denominator.

Weekly output: a one-page channel note stating the attribution model, timezone, refund handling, observed mix changes, and one testable recommendation. A proposed holdout is a measurement plan, not proof that a channel caused every attributed order.`,
    typical_day: `09:00 — Check yesterday’s spend load and e-commerce order close. Flag late refunds and incomplete channel exports.
10:00 — SQL: normalize campaign IDs, aggregate spend and orders separately to the same grain, then join. Check that total spend stays unchanged after the join.
11:00 — Audit utm_source / utm_medium / utm_campaign coverage and compare warehouse order counts with the commerce source of record.
13:00 — Build first-order cohorts with MIN(order_date), count a second distinct order within the window, and exclude immature cohorts from 30-day repeat rates.
14:30 — Update Looker; compare channel metrics with the previous same weekday and inspect new-versus-returning customer mix.
16:00 — Send the growth manager a short note: observation, measurement caveat, proposed budget test, and decision needed.`,
    challenges:
      "Joining campaign-day spend directly to order-line rows repeats spend. Separately, ad platforms may claim overlapping conversions, while a new campaign’s customers have not yet had 30 days to repurchase.",
    solutions:
      "Aggregate sources to campaign/day before joining and reconcile totals afterward. State the model and conversion window for each source instead of summing overlapping credited conversions. Use mature customer cohorts and distinguish an order from its line items.",
    valuable_skills:
      "Marketing strategy, Cohort analysis, Attribution literacy, Storytelling, Measurement design",
    lessons_learned:
      "Ask whether ‘revenue’ is gross, net of refunds, or contribution margin before calculating ROAS. A channel dashboard describes performance under a chosen attribution rule; incremental lift needs an appropriate experiment or a separately justified causal design.",
    advice:
      "Practice BigQuery/SQL date windows, first-purchase cohorts, safe division, and grain checks. Build a scorecard with an explicit CAC/ROAS definition and a mature-cohort repeat-rate query. Explain why two platforms’ attributed orders should not be added together.",
  },
  {
    role_title: "Business Intelligence Consultant",
    company: "Harbor Community Partners",
    industry: "Nonprofit",
    role_category: "Business Intelligence",
    experience_type: "Consulting Project",
    tools: "Power BI, SQL, Excel, Power Query, DAX",
    responsibilities:
      "Replace a nonprofit’s manually assembled program report with a refreshable Power BI model. Standardize intake files, distinguish service visits from people served, and teach a program manager to check and use the dashboard.",
    projects: `Weekly output: a refresh log, a category mapping sheet, and a program/month attendance table with unmapped values called out. Preserve one row per visit in the fact table and one row per participant in the dimension.

Project: a star schema connecting visits to participant, program, and date dimensions. Define Visits = COUNTROWS(FactVisit) and People Served = DISTINCTCOUNT(FactVisit[participant_id]); exclude blank participant keys during QA rather than counting an unknown person.

Handoff: a data dictionary, DAX measure sheet, refresh instructions, and a test script asking the manager to filter one program, explain a total, and recover from an invalid source file.`,
    typical_day: `Monday — Collect approved reporting questions and compare source-file versions. Write down whether the board wants visits, unique people, or completed programs.
Tuesday — Power Query: append standardized workbooks, trim category labels, enforce types, and merge to a controlled mapping table. Route unknown categories to an exception sheet.
Wednesday — SQL/Power BI: confirm unique dimension keys and one-to-many relationships; use a date table. Verify DAX totals against a source pivot, including a participant visiting multiple programs.
Thursday — Test slicers and refresh failures with the program manager. Explain why unique people across programs cannot be computed by adding program-level distinct counts.
Friday — Deliver the revised report and a short training session. Record who owns next month’s source files and refresh.`,
    challenges:
      "‘People served’ was calculated by summing visits, and a participant attending two programs appeared twice in a grand total. Source files also used several spellings for the same program.",
    solutions:
      "Keep visits and unique participants as separate measures; compute distinct people at the current filter context rather than summing subtotals. Use a reviewed category map and an unmapped-values report. Check totals before and after relationships are introduced.",
    valuable_skills:
      "Data storytelling, Training, Metric definition, Data modeling, Requirements gathering",
    lessons_learned:
      "A dashboard is unfinished if its owner cannot refresh it or explain a total. The non-additive distinct-count example belongs in the training guide because it will come up at the next board meeting.",
    advice:
      "Practice Power Query append/merge, explicit types, star schemas, DAX COUNTROWS/DISTINCTCOUNT/DIVIDE, and filter context. Build synthetic visit data where one person attends two programs; explain why the grand total differs from the sum of the visible program counts.",
  },
  {
    role_title: "Operations Analytics Intern",
    company: "Summit Logistics",
    industry: "Logistics",
    role_category: "Operations",
    experience_type: "Internship",
    tools: "Python, SQL, Excel, pandas, Solver",
    responsibilities:
      "Prepare a warehouse exception report and capacity scenarios for a shift supervisor. Separate overdue shipments from open shipments that still have time, identify congestion by hour and shift, and turn the analysis into a feasible staffing discussion.",
    projects: `Daily output: an overdue-shipment queue with shipment ID, promised time, latest status, age, responsible team, and next action. Also report missing scan timestamps separately so they are investigated rather than silently counted as on time.

Project: a capacity workbook with demand by hour, units per labor-hour, staffing, break assumptions, and backlog. Required labor-hours = forecast units / observed units per labor-hour; convert to headcount using productive hours, not paid shift length.

Handoff: shift_exception_log.csv, a workbook with input cells separated from formulas, and a one-page scenario comparison for base demand, a demand spike, and reduced staffing. All example volumes and staffing assumptions are synthetic.`,
    typical_day: `06:45 — Review the prior shift’s handoff and the completeness of scan data before the morning operations meeting.
07:15 — SQL: deduplicate scans by shipment/event key, convert to the site timezone, and retain one latest status per shipment. Classify overdue open shipments against the current as-of time.
08:00 — Discuss the top exceptions with the supervisor. Confirm whether a bottleneck is labor, equipment, a carrier cutoff, or missing information.
10:00 — Python: calculate median and p90 processing time by shift and service type. Exclude incomplete durations from completed-shipment percentiles and report their count separately.
13:00 — Excel/Solver: test staffing scenarios with supervisor-approved constraints, breaks, skill coverage, and carrier cutoffs. Check that units and time periods match.
15:00 — Publish the exception queue with owners and next checks. Track recommendation acceptance separately from whether the proposed change actually ran.`,
    challenges:
      "A daily average hid a short peak before a carrier cutoff. Another report marked every open shipment as late, including shipments whose promised time had not passed. UTC timestamps also split a local shift across two dates.",
    solutions:
      "Analyze by local hour and shift; classify lateness using promised time and status as of a fixed timestamp. Show open-overdue, open-not-due, completed-late, and unknown timestamps separately. Validate scenario constraints with the floor supervisor before recommending extra staff.",
    valuable_skills:
      "Process improvement, Scenario planning, Constraint modeling, Operational communication, Exception triage",
    lessons_learned:
      "A mathematically attractive schedule can fail if the workers lack the right certification or a carrier has already departed. Ask the floor team to walk through the proposed change hour by hour.",
    advice:
      "Practice SQL latest-event windows and timezone conversion, pandas groupby/quantile, Excel SUMIFS and Solver. Build an overdue queue and a capacity model that distinguishes productive hours from paid hours. Test a missing scan, a not-yet-due shipment, and a demand spike.",
  },
  {
    role_title: "Customer Insights Analyst",
    company: "Lumen Research Studio",
    industry: "Research",
    role_category: "Analytics",
    experience_type: "Consulting Project",
    tools: "R, Tableau, Qualtrics, dplyr, tidyr, Excel",
    responsibilities:
      "Turn a customer survey into a defensible segment readout. Maintain the questionnaire/codebook, document response-quality decisions, create crosstabs with correct bases, and connect open-ended themes to a concrete research question.",
    projects: `Daily output: a response disposition log, labeled crosstabs showing the base for each question, and an open-text codebook with inclusion/exclusion rules and synthetic examples.

Project: compare onboarding barriers by customer tenure. For a multi-select question, count each respondent once per selected option and divide by eligible respondents answering that question, not the total number of selections.

Final output: survey_crosstab.csv, a segment profile, and a short presentation. Each slide states the population reached, valid base, exclusions, and why the sample does or does not support broader claims.`,
    typical_day: `09:00 — Review fieldwork counts and the export’s question labels, recodes, and skip logic. Check whether survey revisions changed answer meanings.
10:00 — R/dplyr: retain a response_id key, flag duplicates, inspect duration and attention checks, and keep a disposition table instead of overwriting the raw file.
11:30 — Review quality flags with the research lead. A fast completion is a review flag, not automatic proof of a bad respondent.
13:00 — tidyr: pivot multi-select columns long, deduplicate response_id/option pairs, and calculate crosstabs with a documented eligible base.
14:30 — Code open text against a shared rubric; double-code a small subset and resolve disagreements before counting themes.
16:00 — Update Tableau and the research memo. Show unweighted bases next to any weighted estimates and call out thin segments.`,
    challenges:
      "A multi-select chart used total selections as its denominator, which changed the question being answered. Skip logic made ‘missing’ mean both not asked and declined, and a small convenience sample was being described as all customers.",
    solutions:
      "Define eligibility and valid-response rules per question, preserve not-asked versus missing codes, and compute respondent-based percentages. Document recruitment and exclusions. Withhold or clearly qualify unstable subgroup estimates rather than implying population representativeness.",
    valuable_skills:
      "Research design, Qualitative coding, Uncertainty communication, Presentation, Data QA",
    lessons_learned:
      "Always ask ‘base of what?’ A 60% result means little without knowing who received the question, who answered it, and how the sample was recruited. Weighting does not automatically repair selection bias.",
    advice:
      "Practice R/dplyr joins and group_by, tidyr pivot_longer, Qualtrics recodes/skip logic, and multi-select crosstabs. Build a codebook and a response disposition log. Explain why option percentages may sum above 100% when respondents can choose multiple answers.",
  },
  {
    role_title: "Financial Analytics Intern",
    company: "Aster Financial",
    industry: "Finance",
    role_category: "Analytics",
    experience_type: "Internship",
    tools: "Python, SQL, Power BI, Excel, Power Query",
    responsibilities:
      "Support an FP&A manager during month-end reporting. Reconcile actuals to a frozen ledger export, map accounts and cost centers, investigate budget variances, and draft driver commentary for the manager’s review.",
    projects: `Daily close output: a control-total sheet, an unmapped-account queue, and a variance bridge by department. Include ledger version, budget version, reporting currency, and refresh timestamp on the cover tab.

Project: a synthetic expense report where variance = actual minus budget. Positive expense variance is unfavorable in this example. Calculate percent variance against ABS(budget), and return blank when budget is zero; show the dollar variance and investigate new spend instead.

Handoff: expense_variance.sql, a mapping-change log with effective dates, an Excel reconciliation tab, and manager-reviewed commentary that separates accounting timing from operating drivers.`,
    typical_day: `08:30 — Confirm which ledger export and budget version are approved. Check whether the close is provisional before sending totals.
09:00 — SQL/Power Query: preserve account codes as text, validate account/cost-center mappings, and aggregate actuals and budget independently before joining at month/cost-center/account grain.
11:00 — Reconciliation: compare row counts and control totals with the frozen source. Trace any difference to unmapped accounts, duplicate mappings, currency, or late journals.
13:00 — Excel: use SUMIFS and pivots to review the largest dollar variances, then ask owners for supporting explanations.
15:00 — Write commentary with driver, evidence, recurring versus one-off status, and owner. Do not invent a savings claim from one favorable month.
16:30 — Refresh Power BI after the finance reviewer signs off; archive the exact source versions and note any restatement.`,
    challenges:
      "A renamed cost center produced unmatched rows, duplicate account mappings inflated expenses, and percentages exploded where budget was zero. A late journal also changed a number that had already appeared in a draft deck.",
    solutions:
      "Version mappings with effective dates, require unique mapping keys for the reporting date, and keep unmapped rows visible. Reconcile to control totals before explaining variances; use a zero-budget flag and blank percent. Freeze and label published snapshots, then log restatements explicitly.",
    valuable_skills:
      "Financial modeling, Attention to detail, Reconciliation, Variance analysis, Stakeholder follow-up",
    lessons_learned:
      "Reconciliation is part of analysis. ‘Actual is above budget’ is an observation, not a driver. Ask whether the difference is price, volume, mix, timing, classification, or a genuine operating change before writing commentary.",
    advice:
      "Practice SQL FULL OUTER JOIN and aggregation at a common grain, Excel SUMIFS/XLOOKUP/pivots, and Power Query type checks. Build a variance analysis with a reconciliation sheet and assumptions log. Include a budget-only row, an actual-only row, a zero-budget case, and an unmatched account.",
  },
  {
    role_title: "Analytics Project Fellow",
    company: "Willow Sustainability",
    industry: "Energy",
    role_category: "Operations",
    experience_type: "Other",
    tools: "Python, Excel, Tableau, pandas, Jupyter",
    responsibilities:
      "Analyze hourly electricity demand for a student consulting challenge. Build a transparent data-quality report, compare peak-demand scenarios, and present what the analysis supports without claiming that a simulated intervention caused measured savings.",
    projects: `Working output: energy_quality_log.csv showing missing intervals, duplicate timestamps, timezone assumptions, and unit checks; a daily peak chart; and an assumptions table for each scenario.

Project: explore an EIA hourly demand series, recording the series identifier, retrieval date, units, and revisions. For a classroom building simulation, use clearly separate synthetic interval-meter data. MW demand and kWh consumption are different quantities; never combine them without a time conversion.

Final output: a reproducible notebook, a Tableau peak/off-peak view, and a two-scenario memo reporting assumptions, data coverage, and sensitivity. The downloadable quality log below uses invented readings, not an EIA extract.`,
    typical_day: `09:00 — Record the source series, retrieval date, timezone, and unit. Preserve the original downloaded file.
10:00 — pandas: parse timezone-aware timestamps, check duplicate interval keys, and reindex to the expected cadence. Handle daylight-saving changes explicitly rather than assuming every local day has 24 hours.
11:30 — Profile missingness by hour and day. Distinguish missing readings from true zeros and keep imputed values flagged.
13:00 — Build a baseline by comparable weekday and temperature where those inputs are available. Compare peak intervals, not only daily averages.
14:30 — Excel/Python: calculate scenario changes with stated constraints; test whether conclusions change when missing intervals are excluded instead of imputed.
16:00 — Share the chart and limitations with teammates. Keep observed demand, modeled scenarios, and any hypothetical cost estimate in separate columns.`,
    challenges:
      "A naive timestamp join duplicated the repeated daylight-saving hour, missing intervals were filled with zero, and a scenario was being presented as verified energy savings without an observed intervention.",
    solutions:
      "Retain timezone offsets and unique interval keys; flag missing values instead of treating them as zero. Report coverage, compare exclusion and imputation choices, and label modeled changes as scenarios. Record tariff assumptions separately from physical energy quantities.",
    valuable_skills:
      "Team collaboration, Sustainability strategy, Time-series QA, Scenario planning, Assumption documentation",
    lessons_learned:
      "An attractive savings number is only as reliable as its baseline, time coverage, and tariff assumptions. A reproducible finding that the data cannot support a claimed saving is more useful than a confident but unsupported recommendation.",
    advice:
      "Practice pandas timezone localization/conversion, reindexing, resampling, missingness flags, and unit conversions. Analyze an open energy series with its metadata; separately build a synthetic interval-meter scenario. Present two scenarios with an assumptions log and show how missing-data treatment changes the conclusion.",
  },
];
export const demoExperiences: Experience[] = records.map((r, i) => {
  const e: Experience = {
    ...r,
    id: `demo-${i + 1}`,
    year: i % 3 === 0 ? 2026 : 2025,
    duration: i === 3 ? "Ongoing" : "12 weeks",
    work_arrangement: i % 2 ? "Hybrid" : "Remote",
    contributor_display_name: ["Alex", "Morgan", "Taylor", "Jamie"][i % 4],
    anonymity_preference: i % 3 === 0 ? "Anonymous" : "First name only",
    consent_to_publish: true,
    status: "published",
    created_at: `2026-09-${String(20 - i).padStart(2, "0")}T12:00:00Z`,
    provenance: "fictional",
    model_version: "demo-template",
  };
  return {
    ...e,
    insights: {
      ...extractTemplate(e),
      technical_skills: experiencePlaybooks[e.id].technicalSkills,
    },
  };
});
