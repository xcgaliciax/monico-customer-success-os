# monico Customer Success OS
## Health Command Center — MVP v0.1

### Product purpose

Build an internal Customer Success operating system for monico.

This is not a marketing website and not a generic SaaS dashboard.

The product should help monico understand:

1. Which customers are healthy.
2. Why they are healthy or at risk.
3. What evidence supports each assessment.
4. What Customer Success should do next.
5. How customer health changes over time.
6. Which product and portfolio-level patterns emerge across accounts.

The system should eventually be automatable from:
- meeting transcripts
- monico product telemetry
- ClickUp
- Customer Success inputs
- customer evidence
- commercial data

For MVP v0.1 all data may be local/static, but the architecture must anticipate these future integrations.

---

# Core product principle

Customer Health is NOT the same thing as platform health.

The existing monico Command Center has an operational/platform Health Score based on failures, errors and processing behavior.

This new system measures CUSTOMER HEALTH:

"Is this customer progressing toward repeatable, sustainable value with monico?"

The system must be evidence-driven.

Signals != Evidence != Score != Decision.

AI may eventually detect signals and recommend scores.
Evidence must remain traceable.
The scoring methodology produces a recommendation.
Customer Success retains human approval.

---

# MVP architecture

The application should be data-driven.

DO NOT hardcode customer names, scores or evidence directly inside page components.

Use:

- structured customer data
- structured evidence
- reusable components
- a health calculation library

The UI should consume data.

Future replacement of local JSON with APIs should not require redesigning the frontend.

---

# Preferred technical stack

Use:

- Vite
- React
- TypeScript
- Tailwind CSS

No backend for v0.1.
No database.
No authentication.
No external APIs.
No AI integration yet.

Use local structured data.

---

# Data language policy

Persisted human-readable Customer Success content should be stored in Spanish.

This includes Evidence statements, Risk titles/descriptions/causes, Commercial
Status free-text fields, WeeklyAction action/result text, customer notes and
other stored narrative fields. Keep TypeScript identifiers, ids, enum values and
machine statuses unchanged. Established monico operating/product terms may
remain in English when natural, including Health, Customer Success, Operating
Stage, Commercial Standing, First Value, Happy Path, Review, Risk, Blocker,
Search, workflow, output and champion.

---

# Initial application structure

Suggested architecture:

src/
  components/
  pages/
  data/
    customers.ts
    evidence.ts
  types/
    customer.ts
    evidence.ts
  lib/
    healthEngine.ts
  styles/

Do not overengineer.

---

# HealthScore Framework v0.1

CANONICAL SOURCE: Customer Success OS Chapter 04 v0.1.
This is the only definition of the HealthScore dimensions. Any earlier
version of this section (Value Realization / Workflow Adoption /
Engagement & Stakeholders / Momentum & Execution / Risk & Friction) is
superseded and must not be used.

Customer HealthScore is calculated from five dimensions:

1. Value Progress — 30%
2. Workflow Adoption — 25%
3. Champion Engagement — 15%
4. Required Role Activation — 15%
5. Execution Risk — 15%

Execution Risk is positive-direction:
100 = healthy / no material execution risk.
0 = critical execution risk.

Formula:

HealthScore =
(Value Progress * 0.30)
+ (Workflow Adoption * 0.25)
+ (Champion Engagement * 0.15)
+ (Required Role Activation * 0.15)
+ (Execution Risk * 0.15)

All dimensions are normalized from 0 to 100.

Momentum is not its own scored dimension. It is represented through
Trend plus milestone/risk evidence, not folded into the weighted score.

The score should be calculated by healthEngine.ts.
Do not manually store the final HealthScore if it can be calculated.

---

# Health interpretation

Each account must also have:

- Health Status
- Trend
- Confidence
- Lifecycle
- Commercial Status
- Expansion Readiness

These are related but should NOT all be collapsed into the numeric HealthScore.

Suggested Health Status bands for the prototype:

Green: 80–100
Yellow: 60–79
Red: 0–59

Allow future override rules.

Trend:
- improving
- stable
- deteriorating

Confidence:
- high
- medium
- low

Lifecycle:
- implementation
- first_value
- adoption
- independent_adoption
- verified_outcome
- expansion_ready

---

# Evidence model

Every important assessment should eventually be traceable to evidence.

Each evidence object should support fields similar to:

- id
- customerId
- type
- category
- statement
- source
- sourceDate
- confidence
- verified
- impact
- relatedDimension

Evidence types may include:

- product_telemetry
- meeting_transcript
- customer_statement
- case_study
- customer_success_observation
- commercial_event
- expansion_signal
- blocker
- dependency
- product_feedback

---

# Initial customers

The MVP has four real customer accounts.

## Siemens

ARR:
USD 24,000 annual license.
Implementation is excluded from ARR.

Lifecycle:
Verified Outcome -> Expansion Ready

Current pilot score target:
Approximately 95 / 100.

Current dimensions for prototype (canonical, see HealthScore Framework v0.1):
- Value Progress: 98
- Workflow Adoption: 95
- Champion Engagement: 100
- Required Role Activation: 90
- Execution Risk: 92

Trend:
Improving

Confidence:
High

Expansion readiness:
High

Key context:
- Customer since January 2025.
- Renewed for a second year during 2026.
- Regional rollout being prepared for 10 countries in LAM/LATAM.
- Possible future global rollout.
- Champions: Ariadne and Alexis.
- CFO support.
- Head of LAM / Brazil involved.
- 25 users.
- Approximately 15 active users.
- 73 total projects loaded historically.
- Heavy usage of Workspace, Analysis, Technical Analysis, Clarification Meetings, Reports, Notes and Tasks.
- They operate independently.
- Real tender workflows.
- Estimated >90% coverage of relevant tenders, although not every tender uses every workflow.
- Up to 50% operational time reduction documented in a customer case study.
- 180–250 tenders per year handled by a six-person team according to the case study.
- Strong internal advocacy.
- Customer has presented monico internally and globally.
- Recent product requests are tied to actual operational decision-making.
- Regulatory Documentation module is pending Siemens IT approval.
- This should currently be treated as a low-severity external dependency, not a customer-health blocker.

Primary next milestone:
LAM regional rollout agreement.

Commercial:
2026 annual license USD 24k.
Payment expected Oct/Nov 2026, exact date pending confirmation.

---

## Grupo Balle

ARR:
USD 15,204 annualized.
Paid monthly.
Implementation excluded.

Lifecycle:
Adoption

Current pilot score target:
Approximately 77 / 100.

Trend:
Improving

Confidence:
High

Key context:
- Kickoff recorded April 2026.
- Effective implementation primarily occurred in May after delays.
- First effective license month July 2026.
- September 2026 begins month 3.
- Champion: Edy.
- María is currently a highly active user.
- Jair also relevant.
- 7 users.
- 6 active.
- 16 projects reported by CS context.
- Command Center showed 12 active projects at snapshot.
- Uses Workspace, Analysis, Reports and some Clarification Meetings.
- Output generation has increased significantly in recent weeks.
- Implementation experienced delays.
- Adoption trajectory is improving.
- Multivault capability is only now being activated.

Primary concern:
Sustain recent workflow adoption and reduce dependence on implementation/support momentum.

Primary next milestone:
Sustained repeat workflow usage.

Commercial:
Implementation paid.
License months 1 and 2 paid.
Monthly billing.

---

## Manprec

ARR:
USD 18,000 annualized.
Paid monthly.
Implementation excluded.

Lifecycle:
Implementation -> Adoption

Current pilot score target:
Approximately 82 / 100.

Trend:
Improving

Confidence:
High

Key context:
- Contract and kickoff July 2026.
- July/August treated as implementation.
- Formal licensing begins September 2026.
- Champion: Adriana.
- 10 users.
- 12 projects reported by CS context.
- Command Center showed 11 active projects at snapshot.
- Uses Workspace, Analysis, Technical Analysis, Clarification Meetings and Reports.
- Team is still learning.
- They are actively exploring many capabilities.
- Already generated outputs perceived as valuable.
- Strong interest and momentum.
- Regulatory Documentation implementation will begin next.

Primary next milestone:
Transition successfully from implementation into repeatable licensed usage.

Commercial:
Half implementation paid.
First license invoice goes out September 2026.

---

## Fibroptica

ARR:
USD 9,000 annualized.
Implementation excluded.

Lifecycle:
Adoption

Current pilot score target:
Approximately 76 / 100.

Trend:
Stable to Improving

Confidence:
Medium

Key context:
- Kickoff and implementation June 2026.
- First month July.
- Second August.
- Third September.
- Champion: Jose Manuel.
- 13 users.
- Approximately 3 active users.
- 9 active projects.
- Uses Workspace, Analysis, Clarification Meetings and Reports.
- Has generated valuable outputs.
- Customer has validated monico's analysis capabilities.
- Adoption breadth remains limited.
- Need to understand whether 3 active users are the correct required operating roles or whether this represents broader adoption risk.

Primary concern:
Required-role activation / adoption breadth.

Primary next milestone:
Confirm and expand sustainable operational adoption.

Commercial:
Implementation + month 1 paid.
Customer is considering paying remaining annual balance in full.

---

# Portfolio baseline

Annual recurring license value:

Siemens: USD 24,000
Grupo Balle: USD 15,204
Manprec: USD 18,000
Fibroptica: USD 9,000

Portfolio ARR:
USD 66,204

Implementation revenue must NOT be included in ARR.

---

# Product insight already observed

Search / Buscador appears to have very low usage across all four customers.

DO NOT automatically penalize Customer Health for this.

Treat it as a Portfolio Product Insight until we determine whether Search is a required value event.

Similarly, low usage of one module should not automatically mean poor adoption if customers are achieving meaningful outcomes through other workflows.

---

# MVP Screens

## 1. Portfolio Health

Executive overview.

Show:
- portfolio ARR
- number of accounts
- Green / Yellow / Red counts
- improving accounts
- customer table
- lifecycle
- health
- trend
- confidence
- ARR
- primary risk
- next milestone

The customer rows should be clickable.

---

## 2. Customer Health Report

Customer-specific page.

Show prominently:
- customer
- HealthScore
- status
- trend
- confidence
- lifecycle

Then:
- five health dimensions
- why this score
- value evidence
- adoption evidence
- positive signals
- risks and dependencies
- blockers
- commercial status
- expansion readiness
- next milestone
- recommended CS intervention
- what would improve the score

---

## 3. Evidence

Health must be explainable.

Users should be able to understand:

"Why does this customer have this score?"

Evidence should show:
- evidence statement
- source type
- date
- confidence
- relevant dimension

Avoid fake AI precision.

---

## 4. Portfolio Insights

Create a simple section for cross-account intelligence.

Initial insight examples:
- Search: low observed adoption across 4/4 accounts
- Reports: strong observed adoption
- Workspace: strong observed adoption
- Analysis: core workflow across portfolio
- Clarification Meetings: selective / lower-frequency usage

These are Product Insights, not necessarily Health penalties.

---

# Visual direction

This should look like a serious internal enterprise product.

Design language:
- monico
- clean
- premium
- highly legible
- executive
- restrained
- modern
- strong information hierarchy
- generous whitespace
- subtle borders
- sophisticated dashboard aesthetic

Avoid:
- generic startup dashboard
- excessive gradients
- neon colors
- cartoonish illustrations
- excessive rounded cards
- huge empty hero areas
- marketing landing-page patterns
- visual noise

Use mostly:
- white / off-white
- near-black / dark navy text
- monico blue as primary accent
- green, yellow and red only for semantic health states

Health information must remain accessible without relying on color alone.

---

# Interaction principles

Portfolio -> Customer -> Evidence.

The application should feel navigable, not like slides.

Use thoughtful hover states and subtle transitions.

Do not overanimate.

---

# PDF / Print requirement

Customer Health Report pages must have high-quality print styles.

Eventually users should be able to use browser Print -> Save as PDF.

The printed report should:
- remove navigation
- avoid broken sections
- avoid clipped cards
- use sensible page breaks
- preserve the core hierarchy
- look like an executive report rather than a screenshot of a website

Add print CSS as part of the MVP.

---

# Non-goals for v0.1

Do NOT build:
- authentication
- production backend
- database
- user management
- AI integrations
- Google Meet integration
- Teams integration
- ClickUp integration
- real-time product telemetry connections
- billing
- editable admin settings

Focus on making the data model, Health Engine and core product experience excellent.

---

# Development philosophy

First make the architecture correct.
Then make the information hierarchy correct.
Then make it beautiful.

Do not sacrifice maintainability for visual tricks.

This prototype should be credible enough to demonstrate internally as the first functioning layer of the monico Customer Success OS.
