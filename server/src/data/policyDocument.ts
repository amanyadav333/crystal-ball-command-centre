export interface PolicyChunk {
  id: string;
  code: string;
  title: string;
  category: 'Drone Operations' | 'Sensor Hardware' | 'Safety Protocols' | 'Governance & SLAs' | 'Escalations';
  content: string;
  keywords: string[];
}

export const OOMNIEYE_POLICY_CHUNKS: PolicyChunk[] = [
  {
    id: "chunk-sop-101",
    code: "SOP-101",
    title: "Mandatory Approval Turnaround Times (TAT) and Risk Tiers",
    category: "Governance & SLAs",
    content: "All pending digital twin items must be processed within strict Service Level Agreements based on assigned risk tier. Critical tier submissions (such as autonomous drone flight routes and hazardous zone sensor specs) mandate operator review within 24 hours of submission. High-risk assets must be actioned within 48 hours. Items pending longer than 72 hours automatically trigger high-priority alerts to the Operations Lead. Operators must not bypass queue ordering without logging operational justification.",
    keywords: ["turnaround", "tat", "sla", "hours", "urgent", "critical", "priority", "escalation", "deadline", "delay", "pending"]
  },
  {
    id: "chunk-sop-102",
    code: "SOP-102",
    title: "Level 2 Drone Patrol Video & Autonomous Mission Verification",
    category: "Drone Operations",
    content: "When evaluating Level 2 Drone Patrol video demos, operators are strictly required to verify three safety gates before approval: (1) Altitude compliance — flight altitude must remain strictly below 120 meters Above Ground Level (AGL) at all mission waypoints; (2) Geo-fencing integrity — no breach of restricted industrial perimeter buffers, specifically near radar sub-stations and high-voltage transmission towers; and (3) Telemetry sync — video timestamps must align with collision-avoidance LiDAR telemetry logs without telemetry dropouts.",
    keywords: ["drone", "patrol", "video", "altitude", "120m", "geofence", "radar", "lidar", "telemetry", "alex", "flight", "waypoints", "collision"]
  },
  {
    id: "chunk-sop-103",
    code: "SOP-103",
    title: "Safety Equipment & Sensor Hardware Specifications",
    category: "Sensor Hardware",
    content: "Approval of PDF documentation for sensor specs (infrared thermal cameras, methane sniffer units, optical perimeter tripwires) requires verified calibration adherence to OSHA Standard 1910.1200 and ISO 14001. Thermal drift must not exceed +/- 1.5% under stress conditions. If documentation lacks certified lab calibration stamps or drift tolerance exceeds 1.5%, the operator must reject the submission and request revised calibration logs from submitter Sam HelpAdmin.",
    keywords: ["sensor", "specs", "pdf", "equipment", "safety", "calibration", "osha", "methane", "thermal", "drift", "sam", "hardware"]
  },
  {
    id: "chunk-sop-104",
    code: "SOP-104",
    title: "360° Spatial Zone Layouts & Camera Coverage Maps",
    category: "Safety Protocols",
    content: "Before approving spatial layout blueprints and camera mapping imagery, operators must inspect coverage cones for blind spots exceeding 10 degrees in active transit zones. Zone 4 blueprints require dual-operator verification before commit. If an unmitigated blind spot is identified (e.g. behind warehouse container stacks), the operator must place the review on hold or approve with conditional requirement for a secondary PTZ dome camera link.",
    keywords: ["spatial", "360", "zone 4", "camera", "map", "layout", "blindspot", "elena", "blueprint", "coverage", "ptz"]
  },
  {
    id: "chunk-sop-105",
    code: "SOP-105",
    title: "Rejection Protocols, Remediation Notes, and Audit Logging",
    category: "Escalations",
    content: "Operators rejecting any item in the approvals queue must provide explicit, constructive feedback referencing the governing SOP code (e.g., 'Rejected per SOP-102: Geofence altitude breach at waypoint 4'). The system automatically logs the operator badge ID, rejection timestamp, and reason into the immutable compliance ledger. Submitters receive instant notifications and must submit a revised delta package within 48 hours.",
    keywords: ["reject", "rejection", "notes", "feedback", "sop", "audit", "compliance", "ledger", "resubmit", "remediation", "action"]
  }
];

export const POLICY_FULL_TEXT = OOMNIEYE_POLICY_CHUNKS.map(
  c => `[${c.code}] ${c.title}\nCategory: ${c.category}\n${c.content}`
).join("\n\n");
