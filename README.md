# OomniEye Approvals Assistant (MERN + AI)

> **Wave 2 Take-Home Assignment — Sr. Fullstack Developer (MERN + AI)**  
> Production-grade digital-twin Approvals Assistant copilot with strict Zod contracts, 8-second timeout fallbacks, SSE token streaming, and RAG SOP grounding.

---

## ⚡ Quick Start

```bash
# 1. Install all dependencies (root, server, and client)
npm run install:all   # or npm install && npm --prefix server install && npm --prefix client install

# 2. Run dev server (starts both backend :5000 and frontend :3000)
npm run dev

# 3. Run all automated tests (Jest + Supertest + Vitest)
npm test
```

- **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **OpenAPI 3.1 Contract:** [http://localhost:5000/api/openapi.json](http://localhost:5000/api/openapi.json)
- **Health Check:** [http://localhost:5000/health](http://localhost:5000/health)
- **AI Diagnostic Status:** [http://localhost:5000/api/ai-status](http://localhost:5000/api/ai-status)

---

## 🤖 The 5 AI Entry Points

| Action | Route | Type | Fallback Path |
| :--- | :--- | :--- | :--- |
| **Present me Summary** | `POST /api/summary` | Structured JSON + Audio Script | Urgency-weighted schema summary (`CRITICAL: 4`, `HIGH: 3`). |
| **Talk to me** | `POST /api/chat` | Multi-turn SSE Token Streaming | Streaming offline contextual reasoning without crashing. |
| **Help me** | `POST /api/help` | Grounded RAG (SOP-101 to SOP-105) | Extracted policy chunks with confidence & citations `[SOP-XXX]`. |
| **Teach me** | `POST /api/teach` | 4-step Adaptive Onboarding | Step-by-step checklist with contextual hints. |
| **Replay Greeting** | `POST /api/greeting` | Context-aware greeting | Dynamic greeting referencing live queue count & critical alerts. |

---

## 🛡️ Technical Evaluation & Resilience (150–250 Words)

### AI-Necessary vs. AI-Unnecessary
- **AI-Necessary:** Free-form operational dialogue (**"Talk to me"**), translating dense SOP policies into exact citations (**"Help me"**), and pedagogical adaptation to ambiguous operator questions (**"Teach me"**).
- **AI-Unnecessary:** Queue SLA prioritization (`CRITICAL > HIGH > MEDIUM > LOW`), boundary checks (altitude > 120m, calibration drift > 1.5%), and database audit logs are deterministic rules that must run via TypeScript assertions with 0% hallucination risk.

### Fallback Design & 8s AbortController
All LLM calls are bounded by an **8.0s timeout**. If the provider times out, rejects the key, or returns broken JSON, the server catches it, sets `degraded: true`, logs the `fallbackReason`, and serves schema-validated deterministic data. **Zero 500 errors, zero broken layouts.**

### What We'd Do Differently with More Time
Implement WebRTC peer-to-peer dual-operator co-presence for Zone 4 approvals (SOP-104) and embed client-side WebAssembly models (WebLLM / ONNX) for offline edge inference.

---

## 🔍 AI Connection & Quota (429) Handling

### What Happens When OpenAI Quota is Exhausted (`429 credit_balance_exhausted`)
If your OpenAI key runs out of credits, OpenAI returns `HTTP 429`. Instead of failing, the application **automatically activates graceful degradation**:
1. The server logs: `LLM call failed: OpenAI API error: 429 Too Many Requests`.
2. The UI displays an amber notice: `⚡ Fallback Mode Active`.
3. The dashboard header shows: `⚠️ OpenAI: Quota 429 (Fallback Active)`.
4. All 5 AI features remain **100% interactive** using verified local SOP logic.

### How to Check or Connect Live AI:
- **In Browser:** Click the status pill in the top header to view the live diagnostic modal.
- **Via URL:** Open [http://localhost:5000/api/ai-status](http://localhost:5000/api/ai-status).
- **To Connect Live OpenAI:** Put a funded key into `server/.env`:
  ```env
  OPENAI_API_KEY=sk-proj-...
  OPENAI_MODEL=gpt-4o-mini
  ```
  *(Anthropic Claude and Google Gemini are also supported via `ANTHROPIC_API_KEY` and `GEMINI_API_KEY`).*

---

## 🧪 Testing Suite (18/18 Passing)

```bash
npm test            # Runs all tests
npm run test:server # 5 Unit (Jest) + 8 Integration (Supertest)
npm run test:client # 5 Component (Vitest + Testing Library)
```

- **Unit tests:** Mock LLM, verify Zod validation, assert degraded fallback on corrupt AI responses.
- **Integration tests:** Verify 200 OK responses and test >8s timeout abort path.
- **Component tests:** Verify panel mounting, loading states, SSE streaming tokens, and error/degradation banners.


