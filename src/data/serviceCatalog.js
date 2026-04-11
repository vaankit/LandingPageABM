export const serviceCatalog = [
  {
    id: "marketing-materials",
    name: "Marketing Materials",
    cardTitle: "Marketing Material Generation in Realtime",
    cardSummary: "Generate one-pagers, brochures, social copy, landing-page blocks, and campaign assets instantly with sharper brand alignment.",
    anticipate: [
      "A quick brief around audience, offer, channel, and campaign goal",
      "Realtime draft generation for content blocks across multiple marketing formats",
      "Fast iteration on tone, hooks, structure, and calls to action"
    ],
    deliverables: [
      "Brand-aligned draft assets for key marketing formats",
      "Multiple content angles and reusable copy variations",
      "Editable output ready for design, review, or publishing"
    ],
    timeline: "Realtime generation with same-session iteration",
    differentiators: [
      "Built for fast output without losing brand consistency",
      "Useful for lean teams that need more volume with less friction",
      "Designed to create usable marketing drafts, not generic filler"
    ]
  },
  {
    id: "marketing-emails",
    name: "Marketing Emails",
    cardTitle: "Marketing Email Generation in Realtime",
    cardSummary: "Create campaign emails, nurture sequences, promos, and follow-ups in realtime with stronger subject lines and clearer CTAs.",
    anticipate: [
      "A fast intake on segment, objective, offer, and desired tone",
      "Realtime drafting of subject lines, preview text, body copy, and CTA variants",
      "Quick refinement for urgency, personalization, clarity, and conversion intent"
    ],
    deliverables: [
      "Single emails or multi-step campaign sequences",
      "Subject line, preview text, and CTA variations for testing",
      "Channel-ready copy structured for common email workflows"
    ],
    timeline: "Realtime drafting with rapid revision cycles",
    differentiators: [
      "Balances speed, persuasion, and readability",
      "Easy to adapt for launches, promotions, nurture, and re-engagement",
      "Helps teams move from blank page to send-ready copy faster"
    ]
  },
  {
    id: "holiday-planner",
    name: "Holiday Planner",
    cardTitle: "Public Holiday and Long Weekend Planner",
    cardSummary: "Turn public holidays and long weekends into practical campaign timing, promotion windows, and better content planning.",
    anticipate: [
      "Calendar-aware planning around public holidays, long weekends, and seasonal moments",
      "Identification of timing opportunities for campaigns, reminders, and promotions",
      "Suggestions that account for audience behaviour and internal scheduling realities"
    ],
    deliverables: [
      "Holiday-aware campaign planning recommendations",
      "Opportunity lists for seasonal or date-linked marketing pushes",
      "Suggested send, launch, and follow-up windows"
    ],
    timeline: "Realtime planning output with date-aware updates",
    differentiators: [
      "Turns calendar events into practical marketing timing",
      "Helps teams avoid missed opportunities and low-attention dead zones",
      "Useful for both external campaigns and internal planning cadence"
    ]
  },
  {
    id: "marketing-assist",
    name: "Marketing Assist",
    cardTitle: "Marketing Assist",
    cardSummary: "Use an on-demand marketing copilot for brainstorming, rewriting, positioning, campaign ideas, and day-to-day execution support.",
    anticipate: [
      "Flexible support for briefs, hooks, headlines, messaging, and campaign ideas",
      "Realtime help improving positioning, copy, and next-step recommendations",
      "Open-ended use across planning, drafting, editing, and iteration"
    ],
    deliverables: [
      "Campaign ideas and messaging options on demand",
      "Rewritten copy and sharper positioning suggestions",
      "Practical next steps for execution across content and campaigns"
    ],
    timeline: "On-demand realtime assistance",
    differentiators: [
      "Acts like a versatile day-to-day marketing copilot",
      "Useful when teams need momentum without adding process overhead",
      "Combines ideation, editing, and execution support in one workflow"
    ]
  }
];

export function getServicesByIds(serviceIds = []) {
  const selected = new Set(serviceIds);
  return serviceCatalog.filter((service) => selected.has(service.id));
}
