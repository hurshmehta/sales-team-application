// Declarative form config.
// Edit the questions, options, branch rules, and end screens here.
// Components and API routes read this file, so no component code changes
// are needed to change a question or a branch.

export type QuestionType =
  | "single_choice"
  | "short_text"
  | "email"
  | "phone"
  | "long_text";

export interface ChoiceOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  placeholder?: string;
  options?: ChoiceOption[];
}

export type EndScreenId = "not_eligible" | "license_required" | "complete";

export interface BranchRule {
  // When the answer to `questionId` equals `value`, go to `goto`.
  questionId: string;
  value: string;
  goto: EndScreenId;
  // Status saved in the database when this branch fires.
  status: "disqualified_eligibility" | "disqualified_license";
}

export interface EndScreen {
  id: EndScreenId;
  title: string;
  text: string;
}

export const WELCOME = {
  title: "Welcome",
  text: "We're excited to help you explore an opportunity with our life insurance team! Whether you're already licensed or just getting started, please answer a few quick questions so we can learn more about you. Estimated completion time: 45-60 seconds.",
  button: "Start Application",
};

export const QUESTIONS: Question[] = [
  {
    id: "eligibility",
    type: "single_choice",
    title:
      "Are you a US citizen or legally authorized to work in the United States, and at least 18 years old?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: "full_name",
    type: "short_text",
    title: "What is your full name?",
    placeholder: "Your full name",
  },
  {
    id: "email",
    type: "email",
    title: "What's your email?",
    placeholder: "you@example.com",
  },
  {
    id: "phone",
    type: "phone",
    title: "What is your phone number?",
    placeholder: "(555) 123-4567",
  },
  {
    id: "licensing",
    type: "single_choice",
    title: "Are you currently licensed to sell life insurance?",
    options: [
      { value: "licensed", label: "Yes, I'm already licensed" },
      { value: "willing", label: "No, but I'm willing to get licensed" },
      {
        value: "not_interested",
        label: "No, and I'm not interested in getting licensed",
      },
    ],
  },
  {
    id: "motivation",
    type: "long_text",
    title:
      "Why do you want to pursue a career in life insurance, and what motivates you to succeed?",
    placeholder: "Tell us in your own words...",
  },
  {
    id: "commitment",
    type: "long_text",
    title:
      "What are you willing to commit to or sacrifice to achieve your financial goals? How serious are you about building a successful life insurance business?",
    placeholder: "Tell us in your own words...",
  },
  {
    id: "availability",
    type: "single_choice",
    title:
      "How many hours per day can you realistically commit to your life insurance business?",
    options: [
      { value: "3-5", label: "3-5 hours" },
      { value: "6-8", label: "6-8 hours" },
      { value: "10-12", label: "10-12 hours" },
    ],
  },
];

export const BRANCH_RULES: BranchRule[] = [
  {
    questionId: "eligibility",
    value: "no",
    goto: "not_eligible",
    status: "disqualified_eligibility",
  },
  {
    questionId: "licensing",
    value: "not_interested",
    goto: "license_required",
    status: "disqualified_license",
  },
];

export const END_SCREENS: Record<EndScreenId, EndScreen> = {
  not_eligible: {
    id: "not_eligible",
    title: "Thank you for your interest",
    text: "To join our team, applicants must be at least 18 and legally authorized to work in the United States. Based on your answer, we can't move forward with your application at this time.",
  },
  license_required: {
    id: "license_required",
    title: "Thank you for considering our team",
    text: "A life insurance license is required for this opportunity. Since you're not interested in obtaining one, we won't move forward at this time. You're welcome to apply again if your plans change.",
  },
  complete: {
    id: "complete",
    title: "Thank you for applying!",
    text: "We're excited to learn more about you and explore whether our life insurance team is a good fit.",
  },
};

export const BOOKING = {
  title: "Book Your 1-on-1 Call",
  text: "Thanks for completing your application! The next step is to schedule a 30-minute call with our team to discuss the opportunity, answer your questions, and see if we're a good fit.",
  finishButton: "Finish",
};

// Total steps shown in the progress bar: one per question plus the booking step.
export const TOTAL_STEPS = QUESTIONS.length + 1;

export function findBranchRule(
  questionId: string,
  value: string
): BranchRule | undefined {
  return BRANCH_RULES.find(
    (rule) => rule.questionId === questionId && rule.value === value
  );
}
