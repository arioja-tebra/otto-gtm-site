export const features = [
  {
    slug: "personalized",
    number: "01",
    label: "Walk into each session prepared",
    short: "Session prep",
    title: "Pick up the conversation where you left off.",
    description:
      "Open the next visit with a patient summary and last-session highlights ready to review. Bring the context back into focus before your patient arrives.",
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
    label: "Leave the session with a draft to review",
    short: "AI progress notes",
    title: "Be present for the conversation. Let Otto start the note.",
    description:
      "With patient consent, Otto turns session audio into a SOAP or DAP draft. Start your review with the conversation already on the page, then edit and sign.",
    detail:
      "Your signed note becomes the starting point for the next step. Otto proposes structured chart updates from it, and you confirm what belongs in the record. The visit’s information keeps working for you.",
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
    label: "Carry the visit through to payment",
    short: "Billing & payments",
    title: "Finish the visit with the payment step connected.",
    description:
      "Carry the completed visit into cash billing with a procedure code prefilled for review. Check the code and fee, then continue to payment collection.",
    detail:
      "The completed visit gives the payment step its starting point. Review the proposed procedure code and fee before collecting payment. The walkthrough shows cash billing; confirm support for your payment model before switching.",
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
