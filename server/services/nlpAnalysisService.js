import Sentiment from 'sentiment';
const sentiment = new Sentiment();

const FILLER_WORDS = ['um','uh','like','you know','basically','actually','literally','so','well'];

export const detectFillerWords = (text) => {
  const words = text.toLowerCase().split(/\s+/);
  const counts = {};
  let total = 0;
  FILLER_WORDS.forEach(f => {
    const matches = text.match(new RegExp(`\\b${f}\\b`, 'gi')) || [];
    if (matches.length) { counts[f] = matches.length; total += matches.length; }
  });
  return { counts, total, fillerRate: ((total / words.length) * 100).toFixed(2), wordCount: words.length };
};

export const analyzeSTAR = (text) => {
  const lower = text.toLowerCase();
  const components = {
    situation: /\b(when|while|during|at my|the situation)\b/.test(lower),
    task: /\b(needed to|had to|was responsible|my task|my goal)\b/.test(lower),
    action: /\b(i did|i implemented|i created|i developed|i led|i decided)\b/.test(lower),
    result: /\b(resulted in|achieved|improved|increased|outcome|impact)\b/.test(lower),
  };
  return { components, score: Object.values(components).filter(Boolean).length * 25 };
};

export const analyzeSentiment = (text) => {
  const r = sentiment.analyze(text);
  return { score: r.score, tone: r.score > 2 ? 'positive' : r.score < -2 ? 'negative' : 'neutral' };
};

export const calculateSpeakingPace = (text, sec) => {
  const wpm = (text.split(/\s+/).length / sec) * 60;
  return { wpm: Math.round(wpm), assessment: wpm < 110 ? 'too_slow' : wpm > 160 ? 'too_fast' : 'optimal' };
};
