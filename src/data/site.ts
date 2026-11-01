// Public copy and the optional future contact destination live here.
// Leave contactEmail empty to keep all inquiry links hidden.
export const site = {
  name: 'GINHAWA',
  description: 'A little more space to breathe. Explore GINHAWA, a student wellbeing app for understanding stress, checking in, and finding support.',
  contactEmail: '',
};

export const demoScreens = [
  { id: 'home', label: 'Your space', title: 'A gentler place to start.', text: 'Check in with your feelings, explore an assessment, or find a small next step. GINHAWA brings it together in one familiar space.', image: 'home.webp', alt: 'Actual GINHAWA home screen with a mood check-in and stress assessment choices. Alice is a fictional test user.' },
  { id: 'assessment', label: 'Check in', title: 'Make sense of what you feel.', text: 'Reflect with established stress and psychological distress questionnaires, presented one question at a time with student-friendly explanations.', image: 'assessment.webp', alt: 'GINHAWA stress questionnaire showing a question, answer options, and progress.' },
  { id: 'score', label: 'Understand', title: 'A score is a starting point.', text: 'See an explanation of your self-reported result, then explore relevant general guidance. A result supports self-awareness; it is not a diagnosis.', image: 'score.webp', alt: 'GINHAWA assessment result screen using a fictional, locally generated test result.' },
  { id: 'guidance', label: 'Explore', title: 'Find your next small step.', text: 'Browse curated recommendations and open See More for a closer look. Take what feels useful and move at your own pace.', image: 'recommendations.webp', alt: 'Actual GINHAWA general recommendation screen populated with synthetic test results.' },
];

export const activities = [
  { id: 'mindfulness', title: 'A moment to notice.', subtitle: 'Mindfulness', text: 'Pause and notice what is around you. There is no need to get it perfect.', video: 'mindfulness.mp4', poster: 'mindfulness-poster.webp', transcript: 'The looping visual demonstrates a quiet, seated mindfulness pause. Settle into a comfortable position, notice your breathing and surroundings, and return your attention gently when it wanders. You can stop at any time.' },
  { id: 'breathing', title: 'Room for a slower breath.', subtitle: 'Cyclic sighing', text: 'Explore a gentle breathing activity. Choose a pace that feels comfortable.', video: 'breathing.mp4', poster: 'breathing-poster.webp', transcript: 'The looping visual demonstrates a seated breathing exercise. Breathe in gently, take a second smaller inhale, then breathe out slowly through your mouth. Keep the breathing comfortable and unforced. Stop if you feel dizzy or uncomfortable.' },
];

export const questions = [
  { question: 'Can I download GINHAWA now?', answer: 'This website introduces the capstone project. A public download is not currently offered here. Explore the Demo shows real app screens with fictional example data, without creating an account.' },
  { question: 'Does GINHAWA diagnose mental health conditions?', answer: 'No. Assessments and guidance support wellbeing, reflection, and self-awareness. They do not provide a medical or psychological diagnosis, treatment, or a replacement for professional care.' },
  { question: 'How are general and AI recommendations different?', answer: 'General recommendations are curated suggestions matched to an assessment’s stress or distress level. AI guidance uses assessment results, chosen stress factors, and relevant mood context to suggest more personalized next steps. AI can be unavailable or mistaken; it does not make diagnoses.' },
  { question: 'Are these real student records?', answer: 'No. App previews use local test fixtures and fictional example results. The associate dashboard illustration uses synthetic data. This website has no connection to student accounts or the administration system.' },
];
