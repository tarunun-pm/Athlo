# Athlo MVP Product Plan (2-Month Launch Window)

> [!IMPORTANT]
> **Business Goal & Strategy:** Launch a viable product in 2 months that successfully connects Athletes with Physiotherapists. Based on current market research, the MVP must **strictly target adult competitive athletes (16-35)** to prove core value quickly and avoid the complexities of parent/guardian flows required for youth athletes. 

## 1. Onboarding Phase (The Foundation)

### Physiotherapist Onboarding
- **Authentication:** Standard Email/Password & Social Auth (e.g., Google).
- **Professional Profile Setup:** Name, Clinic Name, Location/Address, and a brief Professional Bio.
- **Mandatory DCPTOT Verification:** Upload capability for licenses/certifications with a 48-hour manual review. *Market research identifies this as a critical trust differentiator and a primary moat against generic platforms.*
- **Availability & Services:** Define weekly working hours and primary services offered (with basic out-of-pocket pricing).

### Athlete Onboarding (Ages 16-35 Only)
- **Authentication:** Standard Email/Password & Social Auth.
- **Personal Profile:** Name, Age, and Primary Sport/Activity.
- **Intake Questionnaire:** A brief form capturing current injuries, pain points, or fitness goals. This data feeds directly into the sports-matching algorithm.

---

## 2. Bifurcated Core Features

### Physiotherapist Features (Focus: CRM & Practice Management)
> [!NOTE]
> The primary value proposition for the physio is replacing fragmented "WhatsApp + paper" workflows with specialized digital tools.

- **Dashboard:** A high-level view of today's schedule, new appointment requests, and pending actions.
- **Scheduling Engine:** A calendar view to manage availability, approve/deny incoming requests, and reschedule. 
- **Patient CRM (Case Files):** A centralized database of athletes for quick access to patient histories and structured recovery journeys.
- **Session Logs & Muscle Map:** The ability to add clinical notes per session and use the `DetailedMuscleMap` to visually tag injury points. *This is a core retention feature for physios.*

### Athlete Features (Focus: Specialized Matching & Access)
> [!NOTE]
> The athlete needs a frictionless way to find *specialized* help, which generic platforms like Practo fail to provide.

- **Sport-Specific Physio Directory:** A search/filter tool powered by a matching algorithm that prioritizes physios based on the athlete's specific sport and injury profile (not just generic location). *This is our primary differentiator.*
- **Booking Flow:** Select an available time slot, confirm the booking, and receive immediate confirmation.
- **My Care Hub:** A central hub to view upcoming appointments, access past session notes, and view the visual muscle map updated by their physio.

---

## 3. Crucial MVP Infrastructure & Validation Goals

To ensure the MVP effectively tests our business model assumptions, these elements are required:

> [!WARNING]
> **Notifications & Reminders (SMS/Email)**
> **Why:** No-shows are a massive revenue leak. Automated reminders are non-negotiable to prove immediate value to physios.

> [!TIP]
> **Basic Payment Gateway (Stripe - Private Pay Focus)**
> **Why:** Market research highlights insurance/reimbursement as a major unvalidated blind spot. The MVP must focus on processing private, out-of-pocket payments to validate willingness-to-pay and secure our 15-25% commission.

> [!CAUTION]
> **Digital Consent/Waiver Forms**
> **Why:** Healthcare compliance. Athletes must accept basic liability/consent terms digitally before a session begins.

### Key Metrics to Validate During MVP Phase:
1. **Physio Utilization Rate:** Target is 2-3 sessions per day per physio to prove unit economics.
2. **Athlete Willingness-to-Pay:** Validate that athletes will pay a premium for sports-specialized matching over generic platforms.
3. **Commission Acceptance:** Validate that physios accept the 15-25% platform take-rate in exchange for the specialized case management tools.
