/* Writing tones for the AI writer. Shared by the admin screen and the server prompts. */
export const TONES = [
  { id: 'friendly', label: 'Friendly expert', guide: 'Warm, plain and confident, like a skilled freelancer explaining things to a client over coffee. Short words, real examples, no hype.' },
  { id: 'professional', label: 'Professional', guide: 'Polished, precise and calm. Third-person friendly but never stiff. Clear structure, measured claims, no slang, no jokes, no exclamation marks.' },
  { id: 'techy', label: 'Techy (tech enthusiast)', guide: 'The voice of a tech enthusiast who tests tools for fun. Energetic but specific: name the tools, versions, features and trade-offs. Light humour is fine. Explain jargon in half a sentence the first time. Opinionated where the evidence supports it.' },
  { id: 'developer', label: 'Developer (technical)', guide: 'Written by a working developer for other developers. Precise terminology, concrete implementation detail, short code or command snippets in fenced blocks where useful, edge cases, performance and security notes. No marketing language, no filler explanations of basics.' },
  { id: 'beginner', label: 'Beginner friendly', guide: 'Patient and simple. Assume no background. Define each term once in plain words, use everyday comparisons, short sentences, step-by-step order, and reassure without talking down.' },
  { id: 'conversational', label: 'Conversational (general readers)', guide: 'Relaxed and direct, like talking to a smart friend. Contractions are fine. Short paragraphs, occasional one-line paragraph for emphasis. Everyday words only.' },
  { id: 'storytelling', label: 'Storytelling', guide: 'Open with a short real-feeling scene or situation, then weave the lesson through it. Sensory, human detail, but never invent named clients, quotes or statistics; keep scenarios generic ("a small clinic owner").' },
  { id: 'persuasive', label: 'Persuasive (sales)', guide: 'Benefit-led and confident. Problem, cost of ignoring it, solution, proof of how it works, clear next step. No exaggeration, no fake urgency, no invented numbers.' },
  { id: 'authority', label: 'Authoritative analysis', guide: 'Analytical and measured, like a trade-publication columnist. What happened, why it matters, who is affected, what to watch next. Separate facts from opinion and say which is which.' },
];
export const toneOf = (id) => TONES.find((t) => t.id === id || t.label === id) || { id: 'custom', label: id || 'Friendly expert', guide: id ? `Write in this tone: ${id}.` : TONES[0].guide };
export const LANGS = [{ id: 'English', label: 'English' }, { id: 'Bengali', label: 'Bengali (বাংলা)' }];
