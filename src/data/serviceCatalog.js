export const serviceCatalog = [
  {
    id: "erp",
    name: "ERP",
    cardTitle: "ERP Advisory and Consultation",
    cardSummary: "Align operating processes, business applications, and reporting with an implementation path that can scale.",
    anticipate: [
      "A current-state review across finance, supply chain, and operational workflows",
      "A platform fit discussion around Dynamics 365, SAP, or Oracle options",
      "A roadmap that prioritizes business continuity while modernizing the core"
    ],
    deliverables: [
      "Target operating model and platform recommendation",
      "Phased implementation or rescue roadmap",
      "Executive decision pack with cost, timing, and dependency view"
    ],
    timeline: "4-8 weeks for advisory and planning",
    differentiators: [
      "Hands-on architecture guidance without big-agency overhead",
      "Vendor-neutral planning across Microsoft, SAP, Oracle, and adjacent ecosystems",
      "Practical sequencing that keeps business continuity front and center"
    ]
  },
  {
    id: "cloud",
    name: "Cloud",
    cardTitle: "Cloud Platform and Migration",
    cardSummary: "Build a resilient Azure or AWS foundation with clearer governance, cost control, and deployment velocity.",
    anticipate: [
      "An infrastructure, app, and dependency discovery sprint",
      "Target-state architecture and migration sequencing",
      "Security, backup, and cost governance planning from the start"
    ],
    deliverables: [
      "Cloud readiness assessment",
      "Migration wave plan and landing zone design",
      "Managed services and optimization recommendations"
    ],
    timeline: "3-6 weeks for assessment and migration planning",
    differentiators: [
      "Clear cloud architecture thinking grounded in delivery reality",
      "Practical DevOps, platform, and cost-governance recommendations",
      "A direct working model for faster decisions and fewer handoffs"
    ]
  },
  {
    id: "ai-data",
    name: "AI & Data",
    cardTitle: "Data Assessment and AI Acceleration",
    cardSummary: "Turn fragmented data into operational visibility, predictive insight, and practical AI use cases.",
    anticipate: [
      "A data estate review across sources, quality, access, and reporting gaps",
      "High-value use case identification for analytics, forecasting, or copilots",
      "Prioritized recommendations that balance readiness with measurable outcomes"
    ],
    deliverables: [
      "Data maturity snapshot and reference architecture",
      "Power BI, Fabric, or Azure AI use case roadmap",
      "Prototype opportunities and KPI tracking plan"
    ],
    timeline: "2-5 weeks for assessment and prioritization",
    differentiators: [
      "Strong focus on AI use cases that can move from idea to prototype quickly",
      "Modern data platform thinking across analytics, automation, and reporting",
      "Business-outcome-first recommendations instead of dashboard theatre"
    ]
  },
  {
    id: "app-modernization",
    name: "App Modernization",
    cardTitle: "Application Modernization",
    cardSummary: "Refactor legacy systems into maintainable cloud-native services without breaking critical operations.",
    anticipate: [
      "A review of legacy dependencies, release bottlenecks, and performance risks",
      "A modernization path spanning rehost, replatform, refactor, or rebuild decisions",
      "Architecture guidance around APIs, containers, and microservices"
    ],
    deliverables: [
      "Modernization strategy and application portfolio heat map",
      "Reference architecture and delivery backlog",
      "Migration approach with risk, effort, and sequencing"
    ],
    timeline: "4-7 weeks for discovery and target-state planning",
    differentiators: [
      "A practical lens on when to rehost, refactor, or rebuild",
      "Application, platform, and delivery guidance in one place",
      "Modernization plans designed to reduce risk, not just chase trends"
    ]
  },
  {
    id: "security",
    name: "Security",
    cardTitle: "Security and Compliance Readiness",
    cardSummary: "Strengthen security posture and compliance controls while supporting growth and modernization goals.",
    anticipate: [
      "A review of identity, endpoint, infrastructure, and application security posture",
      "Control mapping for compliance priorities such as ISO, HIPAA, or PCI",
      "A practical remediation plan tied to business and operational risk"
    ],
    deliverables: [
      "Security gap assessment",
      "Prioritized remediation roadmap",
      "Compliance control recommendations and governance guidance"
    ],
    timeline: "2-4 weeks for assessment and action planning",
    differentiators: [
      "Security guidance aligned to cloud, data, and modernization changes",
      "Practical remediation priorities tied to technical and business risk",
      "Independent recommendations that fit lean teams and modern stacks"
    ]
  },
  {
    id: "digital-experience",
    name: "Digital Experience",
    cardTitle: "Digital Experience and Commerce",
    cardSummary: "Improve digital journeys, customer experience, and conversion through smarter UX, content, and platforms.",
    anticipate: [
      "A review of current digital journeys, UX friction, and platform limitations",
      "Prioritization of customer-facing improvements tied to revenue or retention",
      "A roadmap covering CMS, commerce, mobile, and CRM-connected experiences"
    ],
    deliverables: [
      "Experience audit and opportunity map",
      "UX recommendations and platform fit guidance",
      "Phased rollout plan for web, commerce, or mobile enhancements"
    ],
    timeline: "3-6 weeks for assessment and roadmap",
    differentiators: [
      "Sharper UX and messaging tied to measurable business goals",
      "Ability to connect front-end experience work to product, data, and CRM foundations",
      "A blend of technical delivery and design sensibility without unnecessary process drag"
    ]
  }
];

export function getServicesByIds(serviceIds = []) {
  const selected = new Set(serviceIds);
  return serviceCatalog.filter((service) => selected.has(service.id));
}
