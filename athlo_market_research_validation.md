# ATHLO — Market Research Claims Validation Report

**Prepared:** May 3, 2026  
**Methodology:** Evidence-based research with credible sources (peer-reviewed studies, government data, market research firms)  
**Scope:** Four foundational questions about market opportunity, user needs, competitive differentiation, and business model viability

---

## Executive Summary

The Athlo market research document makes **bold but largely defensible claims** about India's sports physiotherapy opportunity. However, several claims require **nuancing based on current evidence**, and some critical assumptions remain **unvalidated**. This report systematically evaluates each claim and identifies risks.

| Claim Category | Validated? | Confidence | Key Caveat |
|---|---|---|---|
| Sports injuries affect multiple age groups | ✅ Yes | High | Clear research, but India-specific data limited |
| India PT market growing 8.5% CAGR | ⚠️ Partially | Medium | General PT market validated; sports-specific segment unclear |
| Khelo India creating athlete cohort | ✅ Yes | High | 50,000+ athletes across 17 games editions (verified) |
| Practo lacks sports-specific matching | ✅ Yes | High | Confirmed via product inspection + telehealth research |
| Commission-based model viable | ✅ Yes | Medium | Model proven globally; India uptake needs validation |
| All-age demographic scope is TAM reality | ✅ Partially | Medium | Opportunity exists but product not designed for youth/parents yet |

---

## Question 1: Who Are We Building This Product For?

### Market Research Claim
> "We're building this for athletes of all ages (youth → adults → masters), parents/guardians, coaches, clubs, academies, and sports physiotherapists."

### Evidence & Analysis

#### 1.1 Global Sports Injury Prevalence (All Age Groups)

**Source:** Multiple peer-reviewed studies and government data (CDC, NSC, PMC, NCBI)

**Finding:** Sports injuries DO affect all age groups, with different prevalence rates:

| Age Group | Annual Injury Rate | Key Source |
|---|---|---|
| **Children 6-17** | 3.5 million/year (US) + 2.6M (CDC) | NCBI 2026, QC Kinetix 2026 |
| **High School Athletes** | 2 million/year (US) | Injury Facts (NSC) 2024 |
| **Adults 15-70** | 18.4% prevalence (past 12 months) | Danish Study 2024 (NCBI) |
| **Senior Athletes** | Growing segment, no precise US data | Market reports acknowledge as growth area |

**India-Specific Data:**

Sports-related injuries pose a critical concern, particularly among adolescents and young adults, and India lacks comprehensive injury surveillance systems and adequate sports medicine facilities.

**Analysis:** The market research's claim about "all age groups" is **globally validated**. However, **India-specific data on youth and senior athletes is sparse**. The PRD's narrow focus on 16-35 competitive athletes may be strategically prudent (easier to validate), but it misses the documented market.

**Confidence Level:** ✅ High — Global evidence supports multi-age opportunity; **India validation needed via primary research.**

---

#### 1.2 Khelo India: Validating the Youth Athlete Cohort

**Source:** Government of India Ministry of Youth Affairs & Sports (official data, June 2025)

**Finding:** India is systematically building a youth sports pipeline:

| Initiative | Scale | Validation |
|---|---|---|
| **Khelo India Youth Games** | 50,000+ athletes across 17 editions (2018-2025) | ✅ Verified |
| **Khelo India Centres (KICs)** | 1,045 across India (minimum 1 per district) | ✅ Verified |
| **KIRTI Program** | Identifies athletes aged 9-18 via 174 Talent Assessment Centres (TACs) | ✅ Verified |
| **Sports Coverage** | 27 sports in 2025 edition (was 18 in 2018) | ✅ Verified |
| **Para-Sports Pipeline** | 1,300+ para-athletes in Khelo India Para Games (2023, 2025) | ✅ Verified |

**Key Quote from Government:**
Khelo India aims to promote mass participation and sporting excellence in rural and urban areas, with 1,045 Khelo India Centres for grassroots training and support.

**Implication for Athlo:**
- **Youth cohort exists:** 50,000+ young athletes actively training
- **Infrastructure in place:** 1,000+ KICs nationwide = de-facto sports medicine demand points
- **Age inclusion:** KIRTI targets 9-18, younger than Athlo's current 16-35 scope
- **Unmet need:** India lacks adequate sports medicine facilities and injury surveillance systems → Athlo could fill this gap

**Confidence Level:** ✅ Very High — Government program data is reliable.

---

#### 1.3 Market Segment Definition: India PT Services Market Size

**Source:** Grand View Research, Credence Research, Coherent Market Insights (2024-2026)

**Findings:**

| Market Segment | 2024 Value (USD) | 2030 Projection | CAGR |
|---|---|---|---|
| **India Medical Rehab Services** | $8.01 billion | $11.97 billion | 7% (2025-2030) |
| **India PT Equipment** | $913.7 million (2023) | $1.67 billion | 9% (2024-2030) |
| **India Physiotherapy Market** | ~$1 billion (est. 2022) | $1.9 billion | 8.85% (to 2030) |
| **Digital MSK Segment** | — | $750 million (by 2032) | 23.5% (fastest growing) |

**Sports-Specific Subset:**
The research does NOT isolate a "sports physiotherapy" market. India's physiotherapy market, valued at $1 billion in 2022, is projected to more than double to $1.9 billion by 2030, growing at CAGR of 8.85%, with the digital MSK segment expanding at 23.5% CAGR from 2025 to 2032.

**Critical Gap:** Sports physio is likely 15-25% of the total PT market (estimated from global splits), but India-specific sports PT TAM is **not publicly quantified**. This is a **research assumption needing validation**.

**Confidence Level:** ⚠️ Medium — Overall PT market validated; sports-specific segment unquantified.

---

### Synthesis: Who Are We Building For?

| User Type | Evidence | Readiness Gap |
|---|---|---|
| **Adult Athletes (16-35)** | ✅ Clear market (Khelo India alumni, IPL interest) | MVP designed for this; launch-ready |
| **Youth Athletes (8-17)** | ✅ Large cohort exists (50K+ in Khelo India) | ❌ Product has no parent consent flow, no age-gated UI |
| **Parent/Guardians** | ✅ Market research emphasizes them | ❌ No parent account type in PRD; not in MVP |
| **Coaches/Academies (B2B)** | ⚠️ Mentioned but not designed | ❌ No team admin dashboard, no bulk booking |
| **Physiotherapists** | ✅ Supply exists but fragmented | MVP well-designed for this segment |

**Verdict:** Athlo is **currently built for adults only** but the market research claims a **broader scope (all ages + B2B)** that the MVP does not support. **Strategic decision needed: stay narrow (16-35) or redesign for expansion.**

---

## Question 2: Why Are We Building This and For Whom?

### Market Research Claim
> "Sports injuries and movement problems are not limited to age/location. Global research shows physiotherapy helps all age groups. Khelo India/IPL growth increases sports participation."

### Evidence & Analysis

#### 2.1 Global Sports Injury Data (Multi-Age Validation)

**Source:** CDC, NSC, multiple peer-reviewed journals

**Finding:** Sports injuries are genuinely pervasive across ages:

**Children/Adolescents:**
- Approximately 3.5 million children and adolescents receive medical treatment for sports injuries each year, with overuse injuries responsible for nearly half of all middle and high school sports injuries.
- Approximately 8.6 million injuries occur each year affecting athletes of all ages, with young athletes aged 6-17 at higher risk.

**Adults:**
- Among adults over 15 years, 18.4% reported sports injury within past 12 months, with males reporting significantly more injuries than females.
- Common injuries include knee injuries (20% of all sports injuries), ankle sprains (10-15%), and hamstring strains (12-16%).

**Senior Athletes:**
Physical therapy market shows growing need for treatment of age-related musculoskeletal issues, with the geriatric population being the largest market segment.

**Clinical Outcome Validation:**
Physiotherapy effectiveness is validated across all ages:
- Telehealth physiotherapy assessments for ROM, muscle strength, endurance, and pain are valid and reliable across limited populations, with participants embracing technology but preferring in-person assessments when feasible.

**Confidence Level:** ✅ Very High — Peer-reviewed research confirms multi-age need.

---

#### 2.2 India-Specific Drivers (Khelo India + IPL Effect)

**Claim:** Khelo India and IPL-driven sports boom increases physiotherapy demand

**Evidence:**

**Khelo India Impact:**
- Government allocated ₹3794 crores to Sports Ministry for FY 2025-26, with ₹1000 crore to Khelo India Program, marking 130.9% increase since 2014-15.
- 17 editions of Khelo India Games have been conducted with participation from over 50,000 athletes, with 27 sports featured in 2025 edition.

**Inferred Physio Demand:**
- 50,000 competitive athletes → if even 30% suffer injury annually → 15,000 athletes needing physiotherapy
- Plus 306 accredited academies with 2,845 Khelo India athletes being trained with "coaching, equipment, medical care"
- Sports infrastructure expansion (679 districts with KICs) = demand hubs for local physio services

**IPL Effect (Unverified but Logical):**
- IPL (cricket), ISL (football), PKL (kabaddi) create grassroots interest in sports participation
- Market research cites this as driver but provides no quantitative link
- **This is an assumption needing primary validation**

**Confidence Level:** ✅ High (Khelo India data) + ⚠️ Medium (IPL causality) — Government investment validates need; IPL link is logical but not empirically proven.

---

#### 2.3 Market Fragmentation: Why Not Generic Platforms?

**Source:** Product analysis (Practo), telehealth research (Physiopedia, PMC)

**Finding:** Generic platforms like Practo do NOT solve sports-specific physiotherapy matching

**Practo Limitations:**
- Practo offers physiotherapy as one of 25+ specialities (Dermatology, Gynecology, Orthopaedics, Ayurveda, etc.) with general "pulled muscle" recovery messaging, not sport-specific matching.
- User reviews highlight: "Doctor allocation is random, you have no way to ensure you get a great doctor" — suggesting no specialization filtering
- No sport-specific protocol libraries (e.g., "ACL recovery for cricket bowlers")

**Telehealth Research Insight:**
Patients using telehealth PT were more likely to prefer in-person visits, and patients geographically distant or low-income found telemedicine more valuable; hybrid models supporting both in-person and telehealth are increasingly recommended.

**Implication for Athlo:**
- Practical gap exists: Generic platforms don't segment by sport/injury profile
- Opportunity: Specialized platform focusing on sports injuries + structured recovery programs
- Risk: Practo could add sports features in response (low-cost for them)

**Confidence Level:** ✅ High — Market gap is real and defensible short-term.

---

#### 2.4 Supply-Side Opportunity: Fragmented Physio Market

**Claim:** Physiotherapists lack digital practice management tools

**Evidence:**

**India Physio Supply Shortage:**
India faces a critical shortage of qualified physiotherapists—just 0.6 per 10,000 people compared to WHO's recommended minimum of 1.0, creating a supply constraint.

**Fragmented Practice Model:**
Market research mentions physiotherapists rely on "WhatsApp messages and paper notes" for case management. This is **anecdotally true but not quantified**.

**Validation via Practice Management Software Research:**
Online physiotherapy practice management software reviews highlight that physios struggle with booking system limitations (no automated refunds, no patient self-cancellation), integrating clinical notes with exercise libraries, and managing multiple patients' progress tracking asynchronously.

**Implication for Athlo:**
- Physios ARE underserved on digital tooling
- Athlo's case files + treatment plans + session notes = genuine value-add
- Risk: Physios may continue using multiple tools (Practo + WhatsApp + paper) if Athlo doesn't become essential

**Confidence Level:** ✅ High — Fragmentation is documented; Athlo's positioning as "all-in-one practice" is sound.

---

### Synthesis: Why Build This

| Driver | Validated | Strength |
|---|---|---|
| Sports injuries are multi-age, global phenomenon | ✅ Yes | High; peer-reviewed |
| India has government-backed sports initiative (Khelo India) | ✅ Yes | High; official data |
| Khelo India creates athlete population needing physio | ✅ Logical | Medium; inference from athlete counts |
| IPL/ISL/PKL drives grassroots sports interest | ⚠️ Assumed | Medium; not quantified |
| Practo/generic platforms don't specialize in sports | ✅ Yes | High; product analysis confirms |
| Physios need better case management tools | ✅ Yes | High; practice software research confirms |

**Verdict:** The "why" is **well-supported** except for the IPL causality link, which remains an **assumption needing market research validation**. The core market gap (sports physio matching + case management) is real.

---

## Question 3: Why Would They Use Athlo vs. Practo?

### Market Research Claim
> "Use Practo for generic physio; use Athlo for sports-specialized, age-aware rehab and structured recovery."

### Evidence & Analysis

#### 3.1 Competitive Differentiation: Specificity Claim

**Source:** Practo product review, telehealth literature, Athlo PRD (features)

**Athlo's Proposed Differentiation:**

| Feature | Athlo | Practo | Source |
|---|---|---|---|
| **Sport-specific matching** | ✅ Yes (40% weight in algorithm) | ❌ Generic "sports injury" tag | PRD 2.4, Practo review |
| **DCPTOT verification** | ✅ Mandatory (48hr review) | ❌ Not highlighted | PRD 1.4 |
| **Case file + treatment plans** | ✅ Full integration | ❌ Not emphasized | PRD 3.4 |
| **Structured recovery journey** | ✅ Case files + milestones + progress charts | ❌ One-off consultations | PRD 3.4 |
| **Injury-specific protocols** | ⚠️ Treatment library exists | ❌ Not available | PRD 4.2 |
| **Sport taxonomy** | ✅ Cricket, Football, Badminton, Kabaddi, etc. | ❌ General categories | PRD 3.2, Athlo docs |

**Confidence Level:** ✅ High — Differentiation is clear and measurable.

---

#### 3.2 Defensibility of Differentiation

**Risk 1: Easy to Copy**
- Sport taxonomy: Low effort for Practo to add
- DCPTOT verification: Possible but requires operational overhead
- Case files: Practo could integrate quickly

**Risk 2: User Adoption Depends on Credibility**
Telehealth assessments are valid and reliable for specific types (ROM, strength, pain), but participants preferred in-person assessments when given a choice.

**Implication:** Athletes may prefer one comprehensive platform (Practo) even if imperfect over switching to Athlo. Network effects matter.

**Risk 3: Physio Adoption Uncertainty**
The claim that physios prefer Athlo's case management tools is **unvalidated**. They may:
- Stick with existing paper/WhatsApp workflows (low switching cost)
- Prefer simple booking tools (Practo's simplicity)
- Resist new platform if commission % is higher

**Confidence Level:** ⚠️ Medium — Differentiation is clear but defensibility depends on **network effects and physio behavior**, which are unvalidated.

---

#### 3.3 Why Athletes Choose One Platform Over Another

**Research Gap:** No primary data on athlete platform preferences

**Inferred from Global Telehealth Research:**
Patients who used telehealth were more likely to be low-income, female, geographically distant, or mobility-limited; satisfaction with telehealth declined when in-person alternatives became available again.

**Implication for Athlo:**
- Athletes seeking **convenience** (cheap, local) may prefer Practo
- Athletes seeking **specialization** (sport-matched, structured recovery) may prefer Athlo
- **Price is a differentiator:** If Athlo's commission is lower/physio rates are cheaper, network effects favor Athlo

**Confidence Level:** ⚠️ Medium — Market behavior is inferred from global telehealth studies; India-specific athlete preference data **needed.**

---

#### 3.4 Trust Factor: DCPTOT Verification as Lock-in

**Claim:** Manual DCPTOT verification differentiates Athlo and builds trust

**Evidence:**
India faces a 0.6 physios per 10,000 people vs. WHO-recommended 1.0, creating supply constraints and making quality verification critical for athlete trust.

**Validation:** The trust need is **real**. Unregulated physios are a problem in India.

**Defensibility:** This is Athlo's strongest moat if:
1. Verification process is genuinely rigorous (48 hours)
2. Marketing emphasizes verification badge prominently
3. Competitors don't copy (Practo could but would require operational build)

**Confidence Level:** ✅ High — Trust differentiator is defensible short-term; medium-term depends on execution quality.

---

### Synthesis: Why Use Athlo vs. Practo

| Reason | Validated | Risk |
|---|---|---|
| Sport-specific matching | ✅ Clear need | Easy to copy; network effects favor incumbent |
| Case management | ✅ Physios need it | Adoption depends on behavior change |
| DCPTOT verification | ✅ Trust need is real | Operationally complex to scale; competitors could copy |
| Structured recovery | ✅ Value clear | Requires athlete commitment; may choose cheaper one-off sessions |

**Verdict:** Athlo's value proposition is **defensible** but **depends on network effects and behavior change**. Unvalidated assumption: **that athletes and physios will actively switch from existing workflows.**

---

## Question 4: How Does the Business Model Work?

### Market Research Claim
> "Commission-based marketplace connecting sports physios and athletes. Every session booked pays us 15-25% commission while physio keeps the rest. Optional monetization via physio subscriptions, team/academy subscriptions, and age-specific product lines."

### Evidence & Analysis

#### 4.1 Global Commission-Based Healthcare Marketplace Precedent

**Source:** Marketplace research, healthcare platforms

**Comparable Models:**
1. **Practo (India):** Commission model + subscriptions; valued at $3B+ (2023)
2. **Uber Health:** Commission model for healthcare transportation
3. **Teladoc:** Subscription + commission hybrid
4. **BetterHelp/Therapy platforms:** Subscription-based (not pure commission)

**Finding:** Commission-based healthcare marketplaces **exist and are viable** globally.

**India Context:**
Chiratae Ventures analysis shows India's physiotherapy market ($1B in 2022) is projected to reach $1.9B by 2030, with digital MSK segment growing at 23.5% CAGR—supporting a high-growth marketplace opportunity.

**Confidence Level:** ✅ High — Global precedent + India market growth validate model feasibility.

---

#### 4.2 Commission Economics: Is 15-25% Viable?

**Scenario Analysis:**

**Assumption:** Average session rate in India = ₹500-1000 (based on market)

| Scenario | Session Rate | Athlo Commission (20%) | Physio Earnings | Athlete Cost |
|---|---|---|---|---|
| **Budget Physio** | ₹500 | ₹100 | ₹400 | ₹500 |
| **Mid-tier Physio** | ₹800 | ₹160 | ₹640 | ₹800 |
| **Premium Physio** | ₹1200 | ₹240 | ₹960 | ₹1200 |

**Validation:**
- Physios earn ₹400-960/session = **₹800-2000/day** (2-3 sessions) = **₹16,000-60,000/month** ✅ Viable for India
- Athlete cost (₹500-1200/session) = **₹2000-6000/month** for 2-3 sessions = **affordable for middle-class** ✅
- Athlo revenue/session = ₹100-240 = **₹2000-7200/month per physio** (2-3 sessions) = needs scale

**Critical Assumption:** Average physio conducts 2-3 sessions/day

**Risk:** If physios conduct <2 sessions/day on Athlo, economics break down for both parties.

**Confidence Level:** ⚠️ Medium — Economics work in theory; **execution depends on utilization rates (unvalidated).**

---

#### 4.3 Revenue Model Scaling: Path to Profitability

**Claim:** Optional monetization via subscriptions and team plans creates additional revenue

**Analysis:**

**Physio Subscriptions (B2B2C):**
- Example: ₹500/month for premium profile, advanced analytics, marketing tools
- Potential: 20% of 1,000 physios = 200 × ₹500 = ₹1,00,000/month = ₹12 lakhs/year
- **This is nice-to-have, not core revenue**

**Team/Academy Subscriptions (B2B):**
- Example: ₹10,000/month for 20-athlete squad with injury tracking dashboard
- Potential: 100 academies × ₹10,000 = ₹10 lakhs/month = ₹1.2 crore/year
- **This requires product redesign** (team admin dashboard, bulk booking, not in MVP)

**Age-Specific Product Lines:**
- Packaged programs: "4-week ACL recovery," "6-week runner's knee protocol"
- Pricing: ₹2,000-5,000/package
- Revenue model: Takes it outside pure commission model → requires inventory management
- **Viability unclear without data**

**Finding:** Additional monetization is **theoretically possible** but:
1. Requires significant product development (especially team/academy features)
2. Depends on market adoption (unvalidated)
3. Physio subscriptions alone won't move revenue needle

**Confidence Level:** ⚠️ Low — Secondary revenue streams are hypothetical without market validation.

---

#### 4.4 Unit Economics: Path to Profitability

**Scenario: Break-Even Analysis**

**Assumptions:**
- Average physio earnings target: ₹2,000/session (20% margin means ₹400 to Athlo, ₹1,600 to physio)
- Initial supply: 500 physios
- Initial demand: 2,000 monthly active athletes
- Average sessions/month/athlete: 4 (weekly phys io)

**Monthly Revenue Calculation:**
- 2,000 athletes × 4 sessions × ₹400 commission = **₹32 lakhs/month** = **₹3.84 crore/year**

**Monthly Cost (rough estimate):**
- Engineering (4 people): ₹24 lakhs/month
- Operations (2 people): ₹8 lakhs/month
- Payment processing (2% of bookings): ₹6.4 lakhs/month
- Other (AWS, legal, marketing): ₹10 lakhs/month
- **Total: ₹48.4 lakhs/month** = **₹5.8 crore/year**

**Gap:** -₹16.4 lakhs/month (unprofitable)

**Path to Profitability:**
- Need 5,000+ monthly active athletes OR higher session frequency OR higher commission %
- Or reduce costs by 50% (not feasible for quality platform)

**Finding:** India's physiotherapy market is growing at 8.85% CAGR, and digital MSK segment at 23.5%, supporting venture-scale returns if Athlo captures even 5% of addressable market.

**Confidence Level:** ⚠️ Medium — Unit economics require scale; **runway needed to reach profitability (not quantified in PRD).**

---

#### 4.5 Reimbursement & Insurance (Missing from Market Research)

**Critical Gap:** Market research does NOT address insurance/reimbursement

**Research Finding:**
Inconsistent insurance coverage and low reimbursement rates for physical therapy in some regions reduce financial viability of services for both patients and providers.

**Implication for Athlo:**
- If athletes rely on insurance reimbursement, Athlo may not work (insurance pays clinic, not marketplace)
- Private pay athletes (out-of-pocket) are easier, but this limits market to higher-income segments
- **This is a critical business model assumption that is unvalidated**

**Confidence Level:** 🔴 Low — Reimbursement landscape is a major unknown; market research doesn't address.

---

### Synthesis: Business Model Viability

| Component | Validated | Risk |
|---|---|---|
| Commission model precedent | ✅ Global examples exist | Incumbents (Practo) already established |
| India market growth | ✅ 8.85% CAGR confirmed | Not sports-specific; general PT growth |
| Unit economics (commission %) | ✅ Works at scale | Requires 5,000+ MAA to break even |
| Physio earnings potential | ✅ ₹400-960/session viable | Depends on 2-3 sessions/day utilization |
| Secondary revenue streams | ⚠️ Theoretically viable | Requires product redesign; unvalidated demand |
| Insurance/reimbursement | ❌ Not addressed | Critical gap; may limit addressable market |

**Verdict:** The commission-based business model is **viable at scale** but **requires significant user acquisition (5,000+ athletes) to break even**. Secondary revenue streams are hypothetical. **Insurance/reimbursement is a critical unknown that could either unlock or constrain the model.**

---

## Key Validation Gaps & Unvalidated Assumptions

### Critical Assumptions (Unvalidated)

| Assumption | Why It Matters | Evidence Status |
|---|---|---|
| **IPL/ISL/PKL drive sports participation growth** | Justifies market opportunity | Assumed; no quantified causality |
| **Athletes prefer sport-matched physios over generic platforms** | Core differentiation claim | No primary athlete survey data |
| **Physios will actively use case management tools (adoption)** | Unit economics depend on utilization | No physio behavior study |
| **Commission economics work at 20% (not 30%+)** | Determines physio attraction | Not validated via physio survey |
| **Insurance/reimbursement NOT critical to model** | Business model sustainability | Not addressed in market research |
| **Youth athletes (via parents) are addressable in MVP timeline** | TAM expansion opportunity | Product not designed for parents yet |
| **B2B (team/academy) revenue is meaningful** | Diversification opportunity | No academy survey conducted |
| **Practitioners will NOT copy Athlo features (moat duration)** | Defensibility of competitive position | Assumes Practo inaction (high risk) |

---

## Market Research Scoring

| Claim | Strength of Evidence | Risk Level | Recommendation |
|---|---|---|---|
| **Multi-age injury prevalence is real** | ✅ Very High (peer-reviewed) | Low | Proceed with confidence; pivot to age-inclusive marketing post-MVP |
| **Khelo India creates athlete cohort** | ✅ Very High (government data) | Low | Actively recruit Khelo alumni; partner with KICs |
| **Practo lacks sports specialization** | ✅ High (product analysis) | Medium | Market while advantage lasts; not defensible long-term |
| **Commission model is viable** | ✅ High (global precedent) | Medium | Validate unit economics with physio cohort |
| **5,000+ MAU breaks even** | ⚠️ Medium (calculated) | High | Need runway planning; contingency on scaling timeline |
| **Insurance is not a blocker** | 🔴 Low (not addressed) | **CRITICAL** | Conduct immediate policy research; validate reimbursement landscape |
| **All-age TAM exists** | ✅ High (research data) | High | Plan Phase 2 product build (parent accounts, youth UX); MVP can stay narrow (16-35) |

---

## Recommendations for Leadership

### Immediate Actions (Next 4 Weeks)

1. **Validate Physio Adoption Risk:**
   - Survey 50 physios: "Would you use Athlo? At 20% commission? What else do you need?"
   - Identify willingness-to-pay on secondary features (case management, analytics)

2. **Validate Insurance/Reimbursement Landscape:**
   - Research current PT reimbursement policies in India (NHIS, private insurers)
   - Interview 10 insurance companies: "Would you reimburse Athlo sessions?"
   - This may require policy restructuring if insurance is critical to TAM

3. **Athlete Preference Validation:**
   - Survey 100 athletes: "Why do you choose a physio? Would you pay for sport-matched matching?"
   - Measure willingness to switch from current provider

4. **Clarify Market Scope (Board Decision):**
   - **Decision:** Stay narrow (16-35 competitive) or plan for expansion?
   - If expansion: Allocate product resources for parent accounts, team dashboards
   - If narrow: Update marketing narrative to remove "all ages" claims

### Medium-Term Actions (Weeks 5-12)

5. **Validate Unit Economics with Real Data:**
   - Launch with 100 physios; measure actual utilization rate (sessions/day)
   - If <2 sessions/day average, model breaks; may need higher commission or different pricing

6. **Insurance Partnership Exploration:**
   - If reimbursement is viable: Negotiate insurance partnerships (AYUSH, Arogya Mandir, etc.)
   - If reimbursement is blocked: Shift to pure private-pay and adjust TAM expectations

7. **Competitive Moat Testing:**
   - Monitor Practo for sports features (monthly review)
   - If Practo adds sport-matching: Accelerate to secondary revenue streams (subscriptions, team plans)

---

## Conclusion

**Athlo's market research is mostly well-founded** with strong evidence for:
- ✅ Multi-age sports injury prevalence
- ✅ India's sports infrastructure expansion (Khelo India)
- ✅ Market gap in sports-specific physio matching
- ✅ Viability of commission-based marketplace models

**However, critical gaps remain:**
- ⚠️ IPL causality is assumed, not quantified
- ⚠️ Athlete preference for sport-matching is inferred, not validated
- ⚠️ Physio adoption behavior is unvalidated
- 🔴 **Insurance/reimbursement landscape is a major blind spot**
- 🔴 All-age demographic scope conflicts with MVP design (16-35 only)

**Verdict:** The market opportunity is **real and defensible** for the next 12-18 months. However, **Athlo must immediately validate physio behavior, reimbursement policies, and insurance partnerships** before scaling. Without these validations, unit economics could break down or revenue potential could be artificially capped.

**Recommended approach:** Launch MVP narrow (16-35), acquire physios and athletes via early-adopter channels (Khelo India networks, sports academies), and simultaneously de-risk the critical assumptions listed above. Plan Phase 2 expansion only after primary market validation is complete.

---

## Appendix: Source Index

| # | Source | Type | Year | Relevance |
|---|---|---|---|---|
| 1 | CDC/NSC Injury Facts | Government | 2024-2025 | Sports injury prevalence (US) |
| 2 | NCBI/PMC Studies | Peer-reviewed | 2021-2026 | Injury prevalence, telehealth efficacy |
| 3 | Government of India PIB | Official | June 2025 | Khelo India data, athlete counts |
| 4 | Grand View Research | Market Analysis | 2024-2026 | India PT market size, CAGR |
| 5 | Chiratae Ventures | VC Research | June 2025 | India physio market opportunity |
| 6 | Practo Product | Product Analysis | May 2026 | Competitive gaps |
| 7 | Physiopedia / Telehealth Research | Academic | 2020-2024 | Telehealth effectiveness, patient preferences |

