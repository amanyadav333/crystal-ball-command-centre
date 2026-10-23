import { getApprovalQueue, getApprovalItemById } from '../data/mockQueue';
import { TEACH_PROMPT_V1 } from '../prompts/teach.v1';
import { LLMService, LLMRequestOptions } from './llmService';
import { TeachResponse, TeachResponseSchema, TeachStep } from '../contracts/schemas';

const STATIC_STEPS: Record<number, TeachStep> = {
  1: {
    stepNumber: 1,
    totalSteps: 4,
    stepTitle: "1. Triage & Metadata Identification",
    instruction: "Check the item's Urgency tag (Critical/High), submitter identity, and submission date. Items marked 'Critical' (like drone flight runs) have a strict 24-hour turnaround SLA per SOP-101.",
    uiTargetElement: "Queue Table -> Urgency Column & Item Header",
    checklistVerification: [
      "Confirm submitter is an authorized HelpAdmin",
      "Verify item risk category matches operational tier",
      "Check pending duration against SLA threshold"
    ],
    nextActionPrompt: "Click on the row or 'Inspect Details' button to open the asset metadata."
  },
  2: {
    stepNumber: 2,
    totalSteps: 4,
    stepTitle: "2. Artifact & Telemetry Deep-Dive",
    instruction: "Inspect the raw asset payload. For Drone Videos, verify LiDAR point cloud altitude stays below 120m AGL. For Sensor PDFs, confirm calibration drift is under 1.5%. For Spatial Maps, inspect coverage cones for >10° blind spots.",
    uiTargetElement: "Asset Preview Modal -> Telemetry Stream & File Inspector",
    checklistVerification: [
      "Cross-examine video timestamps against telemetry logs",
      "Verify sensor calibration certificates (ISO 14001 / OSHA 1910)",
      "Confirm zone blindspot mitigations are active"
    ],
    nextActionPrompt: "Confirm all technical thresholds pass, then proceed to the policy compliance check."
  },
  3: {
    stepNumber: 3,
    totalSteps: 4,
    stepTitle: "3. SOP Policy Compliance Gate",
    instruction: "Cross-check the submission against the active Digital Twin Standard Operating Procedures (SOP-101 to SOP-105). Any non-compliance requires an immediate rejection note citing the exact SOP code.",
    uiTargetElement: "Assistant Help Card -> Policy Knowledge Lookup",
    checklistVerification: [
      "Verify dual-operator clearance if working in Zone 4",
      "Ensure all required supervisor signoffs are attached",
      "Determine whether approval can be granted unconditionally or with caveats"
    ],
    nextActionPrompt: "Once verified, select the final decision action button."
  },
  4: {
    stepNumber: 4,
    totalSteps: 4,
    stepTitle: "4. Decision Execution & Audit Ledger Sign-off",
    instruction: "Execute your decision. If approving, click 'Approve Asset' to commit to the digital twin live state. If rejecting, enter the remediation note with the SOP code so the submitter can revise within 48 hours.",
    uiTargetElement: "Action Bar -> 'Approve' / 'Reject' Buttons",
    checklistVerification: [
      "Enter clear rationale in the review notes box",
      "Verify your Operator Badge signature",
      "Confirm submission status transitions to Approved or Rejected in the queue"
    ],
    nextActionPrompt: "Congratulations! You have completed the operator walkthrough workflow."
  }
};

export class TeachService {
  public static async getStepGuidance(
    stepNumber: number = 1,
    userFollowUp?: string,
    targetItemId?: string,
    options: LLMRequestOptions = {}
  ): Promise<TeachResponse> {
    const clampedStep = Math.min(Math.max(stepNumber, 1), 4);
    const baseStep = STATIC_STEPS[clampedStep] || STATIC_STEPS[1];
    const queue = getApprovalQueue();
    const targetItem = (targetItemId && getApprovalItemById(targetItemId)) || queue[0];

    // If user provided a follow-up, ask LLM to adapt explanation
    if (userFollowUp && userFollowUp.trim().length > 0) {
      const userPrompt = TEACH_PROMPT_V1.buildUserPrompt(clampedStep, targetItem, userFollowUp);
      const llmResult = await LLMService.complete(
        TEACH_PROMPT_V1.systemPrompt,
        userPrompt,
        options
      );

      if (!llmResult.isDegraded && llmResult.rawText) {
        try {
          const cleanJsonStr = llmResult.rawText
            .trim()
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/\s*```$/i, '');

          const parsed = JSON.parse(cleanJsonStr);

          return TeachResponseSchema.parse({
            step: baseStep,
            followUpAnswer: parsed.followUpAnswer || `Regarding your question "${userFollowUp}": ${parsed.adaptedExplanation}`,
            adaptedExplanation: parsed.adaptedExplanation,
            isCompleted: clampedStep === 4,
            degraded: false
          });
        } catch (e) {
          // Fall through to deterministic adaptation
        }
      }

      // Deterministic fallback response to follow-up
      return TeachResponseSchema.parse({
        step: baseStep,
        followUpAnswer: `Operator Note on "${userFollowUp}": When handling "${targetItem.item}", ensure compliance with standard review criteria. If unexpected anomalies occur, flag for supervisor escalation per SOP-105 before proceeding.`,
        adaptedExplanation: `Continuing Step ${clampedStep}: ${baseStep.instruction}`,
        isCompleted: clampedStep === 4,
        degraded: true,
        fallbackReason: 'Rule-based follow-up adaptation'
      });
    }

    // Default step without follow-up
    return TeachResponseSchema.parse({
      step: baseStep,
      isCompleted: clampedStep === 4,
      degraded: false
    });
  }
}
