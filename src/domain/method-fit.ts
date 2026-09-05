export type Context = {
  uncertainty: number;
  volatility: number;
  feedback: number;
  frequency: number;
  compliance: number;
  dependencies: number;
  autonomy: number;
  scopeRigidity: number;
  deadlineRigidity: number;
  stakeholders: number;
};
export type Approach = "Predictive" | "Adaptive" | "Flow" | "Hybrid";
const profiles: Record<Approach, Context> = {
  Predictive: {
    uncertainty: 1,
    volatility: 1,
    feedback: 2,
    frequency: 1,
    compliance: 5,
    dependencies: 4,
    autonomy: 2,
    scopeRigidity: 5,
    deadlineRigidity: 4,
    stakeholders: 4,
  },
  Adaptive: {
    uncertainty: 5,
    volatility: 5,
    feedback: 5,
    frequency: 5,
    compliance: 2,
    dependencies: 2,
    autonomy: 5,
    scopeRigidity: 1,
    deadlineRigidity: 3,
    stakeholders: 3,
  },
  Flow: {
    uncertainty: 3,
    volatility: 4,
    feedback: 4,
    frequency: 5,
    compliance: 2,
    dependencies: 2,
    autonomy: 4,
    scopeRigidity: 2,
    deadlineRigidity: 2,
    stakeholders: 2,
  },
  Hybrid: {
    uncertainty: 4,
    volatility: 4,
    feedback: 4,
    frequency: 3,
    compliance: 4,
    dependencies: 4,
    autonomy: 3,
    scopeRigidity: 4,
    deadlineRigidity: 5,
    stakeholders: 5,
  },
};
export function scoreApproaches(context: Context) {
  const keys = Object.keys(context) as (keyof Context)[];
  return (Object.keys(profiles) as Approach[])
    .map((approach) => {
      const distance = keys.reduce(
        (s, k) => s + Math.abs(context[k] - profiles[approach][k]),
        0,
      );
      return {
        approach,
        score: Math.round((1 - distance / (keys.length * 4)) * 100),
        reasons: keys
          .filter((k) => Math.abs(context[k] - profiles[approach][k]) <= 1)
          .slice(0, 4),
      };
    })
    .sort((a, b) => b.score - a.score);
}
export function governanceLevel(c: Context) {
  if (c.compliance >= 4 || c.stakeholders >= 5 || c.dependencies >= 5)
    return "Controlled";
  if (c.compliance >= 3 || c.deadlineRigidity >= 4) return "Standard";
  return "Lightweight";
}
