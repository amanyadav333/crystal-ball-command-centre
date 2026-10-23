# Crystal Ball Command Centre — OomniEye Approvals Assistant (MERN + AI)

> **Wave 2 Take-Home Technical Assignment — Sr. Fullstack Developer (MERN + AI)**  
> Production-grade digital-twin Approvals Assistant copilot built with **Node.js, Express, TypeScript, Zod, React, Zustand, SSE Streaming, RAG Grounding, and comprehensive Jest/Supertest/Vitest suites**.

---

## 1. Architectural Overview & Stack

The application implements the **OomniEye Approvals Assistant widget** living inside an industrial digital-twin dashboard. Every action is wired to a genuine AI decision layer with strict schema enforcement, 8-second timeout fallbacks, and real-time Server-Sent Events (SSE) streaming.

```
                    ┌────────────────────────────────────────────────────────┐
                    │               React 19 + Zustand Client                │
                    │   (OomniEye Digital Twin UI + Assistant Floating Panel)│
                    └───────────────────────────┬────────────────────────────┘
                                                │ REST / SSE Streaming (/api)
                                                ▼
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│                               Express + TypeScript Server                                  │
│                                                                                            │
│  ┌────────────────────────┐   ┌───────────────────────────┐   ┌─────────────────────────┐  │
│  │   Zod API Contracts    │   │     Versioned Prompts     │   │      RAG Engine         │  │
│  │   (schemas.ts, openapi)│   │     (/prompts/*.v1.ts)    │   │  (In-Memory Similarity) │  │
│  └───────────┬────────────┘   └─────────────┬─────────────┘   └────────────┬────────────┘  │
│              │                              │                              │               │
│              ▼                              ▼                              ▼               │
│  ┌──────────────────────────────────────────────────────────────────────────────────────┐  │
│  │               LLM Integration & Graceful Degradation Engine (llmService.ts)          │  │
│  │    • 8s strict timeout (AbortController)    • Strict Zod Schema Parse               │  │
│  │    • OpenAI (GPT-4o) / Claude (Anthropic)    • Heuristic Fallback (Offline Telemetry)│  │
│  └──────────────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

- **Frontend**: React 19 + TypeScript, Zustand store for state management (zero prop-drilling), Lucide icons, responsive glassmorphic dark-slate digital-twin aesthetic, Web Speech API audio synthesis.
- **Backend**: Node.js + Express, TypeScript strict mode, Zod validation, `express-rate-limit` per-session throttling, SSE streaming (`text/event-stream`).
- **Prompt Versioning**: Versioned exports in `/src/prompts/*.v1.ts`.
- **RAG Surface**: Grounded similarity retrieval over 5 standard operating procedures (SOP-101 through SOP-105).
- **Test Suite**:
  - **Unit Tests (Jest)**: Prompt and response handlers with mocked LLMs, verifying that corrupted AI outputs are caught and safely degraded.
  - **Integration Tests (Supertest)**: AI endpoints covering both 200 OK success and 8s timeout fallback paths.
  - **Component Tests (Vitest + Testing Library)**: Panel loading, SSE streaming buffer, error/degradation banners, and tab switching.

---

## 2. Technical Evaluation Commentary (150–250 Words)

### AI-Necessary vs. AI-Unnecessary
The distinction between deterministic logic and LLM judgment is critical in mission-critical digital twins:
- **AI-Necessary:** Free-form multi-turn reasoning (**"Talk to me"**) requires semantic synthesis across disparate telemetry logs, radar waypoints, and user intent. Grounded policy Q&A (**"Help me"**) requires natural-language comprehension to translate dense SOP legalisms into direct operational answers. Dynamic onboarding (**"Teach me"**) requires an adaptive pedagogical model that interprets ambiguous follow-up questions and tailors explanations without hardcoded decision trees.
- **AI-Unnecessary:** Queue sorting and SLA prioritization (`CRITICAL > HIGH > MEDIUM > LOW`) must remain 100% deterministic; an LLM should never be trusted with numerical timers or sorting priority. Telemetry boundary gates (e.g. altitude ceiling > 120m, calibration drift > 1.5%) are mathematical assertions that execute faster, cheaper, and with zero hallucination risk via pure TypeScript logic. State updates (Approve/Reject) and audit ledger commits are standard ACID database operations.

### Fallback Design
Every AI invocation is bounded by an `AbortController` timeout capped at **8.0 seconds**. If the LLM provider fails, times out, or returns an unparseable schema, the system executes an automated graceful degradation path. Structured output is verified against Zod schemas; malformed responses degrade to deterministic, rules-based JSON marked with `degraded: true` and a detailed `fallbackReason`. A simulated timeout/error toggle is built directly into the UI header to verify this live.

### What We'd Do Differently with More Time
With additional time, we would implement **WebRTC peer-to-peer dual-operator co-presence** for Zone 4 commits (mandated under SOP-104), and embed a lightweight quantized **WebLLM / ONNX model in WebAssembly** to deliver zero-latency local edge inference directly in the browser when remote network connectivity is severed.

---

## 3. The Five AI Entry Points

| Entry Point | Route | Model Behavior & Data Flow | Fallback Degradation Path |
| :--- | :--- | :--- | :--- |
| **Present me Summary** | `POST /api/summary` | Analyzes live queue, ranks items by urgency, generates structured JSON with headline, spoken TTS script, and item breakdown. Validated with Zod. | Generates schema-compliant structured summary via deterministic urgency weights (`CRITICAL: 4`, `HIGH: 3`). |
| **Talk to me** | `POST /api/chat` | Server-Sent Events (SSE) streaming token-by-token multi-turn conversation about approvals, telemetry anomalies, and operational priorities. | Streams token-by-token contextual telemetry reasoning without freezing or crashing. |
| **Help me** | `POST /api/help` | In-memory similarity retrieval over SOP-101 to SOP-105. Answers question strictly grounded in retrieved chunks with citations `[SOP-XXX]`. | Fallback policy chunk extraction with confidence scoring and citation attribution. |
| **Teach me** | `POST /api/teach` | 4-step interactive onboarding tutorial. Dynamically adapts explanations and next action prompts when operator asks follow-up questions. | Rule-based checklist progression with contextual item hints. |
| **Replay Greeting** | `POST /api/greeting` | Dynamically generates a context-aware greeting referencing the live count of pending items and critical risks. | Contextual template referencing live queue items and operator name. |

---

## 4. Setup & Running Instructions

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)

### Installation
Clone the repository and install all dependencies:
```bash
# Install root, server, and client dependencies
npm install
npm --prefix server install
npm --prefix client install
```

### Running the Application Locally
Run both the backend API and frontend client concurrently:
```bash
npm run dev
```
- **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000) (or `http://localhost:3001` if 3000 is occupied)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **OpenAPI 3.1 Contract:** [http://localhost:5000/api/openapi.json](http://localhost:5000/api/openapi.json)
- **Health Check:** [http://localhost:5000/health](http://localhost:5000/health)

*(Optional: Set `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` in `server/.env`. If omitted, the high-fidelity heuristic fallback engine runs automatically out-of-the-box).*

---

## 5. Running the Test Suites

The project includes unit, integration, and component tests:

```bash
# Run all server and client test suites
npm test

# Run only server tests (Jest + Supertest)
npm run test:server

# Run only client tests (Vitest + Testing Library)
npm run test:client
```

### Test Coverage Highlights
- **Unit Tests (`server/src/tests/unit/promptHandlers.test.ts`)**:
  - LLM mocked: tests valid schema pass.
  - **Catches corrupted AI response shapes (silent LLM failures)** and asserts graceful fallback degradation.
  - Tests RAG grounding: verifies answers cite `[SOP-102]` and flags ungrounded questions.
- **Integration Tests (`server/src/tests/integration/apiEndpoints.test.ts`)**:
  - Supertest tests `/api/summary` on the success path.
  - Supertest tests `/api/summary` on the **fallback/timeout path** (simulating >8s timeout).
  - Tests `/api/help`, `/api/greeting`, `/api/teach`, and `/api/queue` status transitions.
- **Component Tests (`client/src/components/__tests__/ApprovalsAssistantPanel.test.tsx`)**:
  - Vitest + Testing Library tests the panel's **loading state**, **token-by-token streaming state**, **error/fallback degradation banner**, and minimize/close affordance.

---

## 6. Live Evaluator Failure Simulation Controls

In the dashboard top navbar, reviewers can test failure resilience with one click:
- **`Simulate Timeout`**: Forces server AI handlers to hit the 8-second threshold and verify graceful degradation.
- **`Simulate LLM Down`**: Simulates provider 503 failure / missing API key.
- **`Reset Queue`**: Restores the mock queue to initial seed state.

---

## 7. AI Provider Health, Quota (429) & Graceful Degradation Handling

### The OpenAI Quota Error (`HTTP 429 credit_balance_exhausted`)
When connecting an OpenAI API key that has consumed all prepaid billing credits or hit organization rate limits, OpenAI returns:
```json
{
  "error": {
    "message": "You have no credits remaining. Add credits to continue using the API at https://platform.openai.com/settings/organization/billing/.",
    "type": "insufficient_quota",
    "param": null,
    "code": "credit_balance_exhausted"
  }
}
```

### How the Engine Handles Quota 429 (Zero Downtime Guarantee)
Per **Section 3 & Section 6 of the assignment requirements**, external API failures must **never** result in raw 500 errors, broken JSON, or frozen client UIs:

1. **Error Interception:** `llmService.ts` catches the `429 Too Many Requests` response from OpenAI.
2. **Schema-Compliant Fallback:** Instead of throwing an unhandled exception, the engine activates deterministic heuristic reasoning. All responses strictly adhere to the Zod contracts defined in `server/src/contracts/schemas.ts`.
3. **Transparency Flags:** Every response payload includes:
   ```json
   {
     "degraded": true,
     "fallbackReason": "LLM call failed: OpenAI API error: 429 Too Many Requests"
   }
   ```
4. **Visual UI Indicator:** 
   - An amber alert banner (`⚡ Fallback Mode Active — LLM call failed: OpenAI API error: 429 Too Many Requests`) appears inside the Assistant panel.
   - The top navigation bar displays `⚠️ OpenAI: Quota 429 (Fallback Active)`.

### How to Check AI Connection Status

| Method | Where | What You See |
| :--- | :--- | :--- |
| **1. Header Badge** | Top navigation bar (next to notifications) | Clickable pill showing `🟢 OpenAI: Connected` or `⚠️ OpenAI: Quota 429 (Fallback Active)`. Clicking it opens the **Live AI Diagnostic Modal**. |
| **2. Diagnostic API** | `GET http://localhost:5000/api/ai-status` | Real-time JSON probe querying OpenAI directly: returns status code, error code, and active fallback status. |
| **3. Assistant Panel** | Inside "Present me Summary", "Talk to me", etc. | Real-time amber banner showing active degradation reason if quota is exhausted. |

### How to Resolve the Quota Error
1. **Fund the OpenAI Account:** Add credits ($1–$5) at [OpenAI Billing Settings](https://platform.openai.com/settings/organization/billing/).
2. **Update `.env`:** Place your funded API key into `server/.env`:
   ```env
   OPENAI_API_KEY=sk-proj-your-active-key
   OPENAI_MODEL=gpt-4o-mini
   ```
3. **Verify:** Open the dashboard and click **"Re-check Connection"** in the diagnostic modal. The pill will immediately switch to `🟢 OpenAI: Connected`.
4. **Alternative Providers Supported:** You can also configure `ANTHROPIC_API_KEY` (Claude 3.5 Sonnet) or `GEMINI_API_KEY` (Gemini 1.5 Flash) in `server/.env`.

