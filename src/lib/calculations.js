// Utility functions for macro and calorie calculations

// Calculate BMR using Mifflin-St Jeor equation
export const calculateBMR = (weightLbs, heightInches, age, gender) => {
  const weightKg = weightLbs * 0.453592;
  const heightCm = heightInches * 2.54;
  
  if (gender === 'male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  } else {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  }
};

// Activity level multipliers
export const ACTIVITY_MULTIPLIERS = {
  sedentary: { value: 1.2, label: 'Sedentary (little/no exercise)' },
  light: { value: 1.375, label: 'Light (1-2x/week)' },
  moderate: { value: 1.55, label: 'Moderate (3-4x/week)' },
  active: { value: 1.725, label: 'Active (5-6x/week)' },
  veryActive: { value: 1.9, label: 'Very Active (2x/day)' },
};

// Goal calorie adjustments
export const GOAL_ADJUSTMENTS = {
  loseAggressive: { value: -500, label: 'Lose Weight (-500 cal)' },
  lose: { value: -300, label: 'Lean Cut (-300 cal)' },
  maintain: { value: 0, label: 'Maintain Weight' },
  gain: { value: 400, label: 'Lean Gain (+400 cal)' },
  bulkModerate: { value: 500, label: 'Moderate Bulk (+500 cal)' },
  bulkHard: { value: 700, label: 'Hard Bulk (+700 cal)' },
};

// Calculate daily calorie targets
export const calculateTargets = (weightLbs, heightInches, age, gender, activityLevel, goal) => {
  const bmr = calculateBMR(weightLbs, heightInches, age, gender);
  const tdee = Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel].value);
  const calories = tdee + GOAL_ADJUSTMENTS[goal].value;
  
  // Protein: 1.0-1.25g per pound of body weight for athletes
  const protein = Math.round(weightLbs * 1.25);
  
  // Fat: ~28% of calories
  const fat = Math.round((calories * 0.28) / 9);
  
  // Carbs: remaining calories
  const carbs = Math.round((calories - (protein * 4) - (fat * 9)) / 4);
  
  return {
    bmr,
    tdee,
    calories,
    protein,
    carbs,
    fat,
  };
};

// Calculate macros for a single food item
export const calculateItemMacros = (item) => {
  const { food, quantity } = item;
  if (!food) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  
  return {
    calories: Math.round(food.calories * quantity),
    protein: Math.round(food.protein * quantity * 10) / 10,
    carbs: Math.round(food.carbs * quantity * 10) / 10,
    fat: Math.round(food.fat * quantity * 10) / 10,
  };
};

// Calculate macros for an entire meal (array of items)
export const calculateMealMacros = (items) => {
  return items.reduce((total, item) => {
    const macros = calculateItemMacros(item);
    return {
      calories: total.calories + macros.calories,
      protein: total.protein + macros.protein,
      carbs: total.carbs + macros.carbs,
      fat: total.fat + macros.fat,
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
};

// Calculate macros for an entire day
export const calculateDayMacros = (day) => {
  let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  
  Object.values(day).forEach(mealItems => {
    if (Array.isArray(mealItems)) {
      const mealMacros = calculateMealMacros(mealItems);
      totals.calories += mealMacros.calories;
      totals.protein += mealMacros.protein;
      totals.carbs += mealMacros.carbs;
      totals.fat += mealMacros.fat;
    }
  });
  
  return totals;
};

// Calculate average macros across all days
export const calculateWeeklyAverage = (days) => {
  const daysWithContent = days.filter(day => {
    const macros = calculateDayMacros(day);
    return macros.calories > 0;
  });
  
  if (daysWithContent.length === 0) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }
  
  const totals = daysWithContent.reduce((acc, day) => {
    const dayMacros = calculateDayMacros(day);
    return {
      calories: acc.calories + dayMacros.calories,
      protein: acc.protein + dayMacros.protein,
      carbs: acc.carbs + dayMacros.carbs,
      fat: acc.fat + dayMacros.fat,
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  
  return {
    calories: Math.round(totals.calories / daysWithContent.length),
    protein: Math.round(totals.protein / daysWithContent.length),
    carbs: Math.round(totals.carbs / daysWithContent.length),
    fat: Math.round(totals.fat / daysWithContent.length),
  };
};

// Calculate percentage of target hit
export const calculateTargetPercentage = (actual, target) => {
  if (target === 0) return 0;
  return Math.round((actual / target) * 100);
};

// Check if macros are within acceptable range
export const getMacroStatus = (actual, target) => {
  const pct = calculateTargetPercentage(actual, target);
  if (pct >= 95 && pct <= 105) return 'good';
  if (pct >= 90 && pct <= 110) return 'close';
  if (pct < 90) return 'under';
  return 'over';
};

// Format height for display
export const formatHeight = (totalInches) => {
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}'${inches}"`;
};

// Parse height string to inches
export const parseHeightToInches = (feet, inches) => {
  return (parseInt(feet) || 0) * 12 + (parseInt(inches) || 0);
};

// Format macros for display
export const formatMacros = (macros) => {
  return `${macros.calories} cal | ${Math.round(macros.protein)}P | ${Math.round(macros.carbs)}C | ${Math.round(macros.fat)}F`;
};
