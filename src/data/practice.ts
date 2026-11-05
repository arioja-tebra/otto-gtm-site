export const features = [
  {
    slug: "personalized",
    number: "01",
    label: "Walk into each session prepared",
    short: "Session prep",
    title: "Be ready for the conversation.",
    description:
      "Pick up where you left off with a patient summary and last-session highlights before the next visit.",
    detail:
      "Your calendar connects to the patient record, so the context you need stays close as you prepare for the next conversation.",
    examples: [
      "See the day ahead in your calendar",
      "Review the patient summary before a session",
      "Keep context from previous visits close",
    ],
    visualTitle: "Ready for the next conversation",
    visualRows: ["Your schedule", "Patient summary", "Last-session highlights"],
    question: "Start the visit with context.",
  },
  {
    slug: "notes",
    number: "02",
    label: "Let Otto draft the note",
    short: "AI progress notes",
    title: "Stay with the conversation. Otto can start the note.",
    description:
      "Turn session audio into a SOAP or DAP draft. Review the details, edit, and sign a note that reflects the care you provided.",
    detail:
      "The work carries forward after your signature. Otto proposes structured chart updates from the final note, and you decide what belongs in the record.",
    examples: [
      "Capture session audio with patient consent",
      "Review, edit, and sign your SOAP or DAP draft",
      "Approve proposed chart updates before the next visit",
    ],
    visualTitle: "From conversation to signed note",
    visualRows: [
      "Session audio",
      "SOAP or DAP draft",
      "Your review and signature",
    ],
    question: "Finish the note. Carry the care forward.",
  },
  {
    slug: "front-desk",
    number: "03",
    label: "Keep payment moving",
    short: "Billing & payments",
    title: "The visit ends. The work keeps moving.",
    description:
      "Connect the completed visit to billing, fee review, and payment collection. See the workflow in the billing walkthrough.",
    detail:
      "Follow the payment step from the visit, with a prefilled procedure code and fee review. Watch the demonstration to see how the pieces connect.",
    examples: [
      "Carry the visit into the billing workflow",
      "Review the procedure code and fee",
      "Keep payment collection connected to the visit",
    ],
    visualTitle: "From completed visit to payment",
    visualRows: [
      "Completed visit",
      "Code and fee review",
      "Payment collection",
    ],
    question: "Follow the visit through to payment.",
  },
];
