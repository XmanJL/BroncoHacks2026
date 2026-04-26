export const weekDays = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;

export const exerciseOptions = [
  "chest",
  "shoulders",
  "back",
  "upper arms",
  "lower arms",
  "neck",
  "upper legs",
  "lower legs",
  "waist",
  "cardio",
] as const;

// Bodyweight / unweighted, Free weights / barbells / plates, Machines (strength), Functional / accessories, Cardio machines, Misc / other
export const equipmentOptions = [
  "body weight",
  "assisted",
  
  "barbell",
  "olympic barbell",
  "ez barbell",
  "trap bar",
  "dumbbell",
  "kettlebell",
  "weighted",

  "cable",
  "leverage machine",
  "smith machine",
  "sled machine",

  "band",
  "resistance band",
  "medicine ball",
  "stability ball",
  "bosu ball",
  "rope",
  "roller",
  "wheel roller",
  "hammer",

  "stationary bike",
  "elliptical machine",
  "stepmill machine",
  "skierg machine",
  "upper body ergometer",

  "tire",
] as const;

export type ExerciseOption = (typeof exerciseOptions)[number];
export type EquipmentOption = (typeof equipmentOptions)[number];

export type DayName = (typeof weekDays)[number];

export type DayPlan = {
  active: boolean;
  hours: string;
  minutes: string;
};

export const initialDayPlans: Record<DayName, DayPlan> = {
  Mon: { active: true, hours: "0", minutes: "30" },
  Tue: { active: true, hours: "0", minutes: "30" },
  Wed: { active: true, hours: "0", minutes: "30" },
  Thu: { active: true, hours: "0", minutes: "30" },
  Fri: { active: true, hours: "0", minutes: "30" },
  Sat: { active: false, hours: "0", minutes: "30" },
  Sun: { active: false, hours: "0", minutes: "30" },
};

export function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toSafeNumber(value: string) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

export function dayPlanMinutes(plan: DayPlan) {
  const hours = Math.max(0, toSafeNumber(plan.hours));
  const minutes = Math.min(59, Math.max(0, toSafeNumber(plan.minutes)));
  return hours * 60 + minutes;
}
