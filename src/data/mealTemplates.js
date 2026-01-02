// Pre-built meal templates for quick addition
import { getFoodById } from './foods';

export const DEFAULT_MEAL_TEMPLATES = [
  {
    id: 'mt1',
    name: 'Evening Protein Shake (REQUIRED)',
    description: 'Required evening shake with CorVive Protein',
    mealType: 'evening',
    items: [
      { foodId: 'd2', quantity: 12 }, // 12oz chocolate milk
      { foodId: 'cv1', quantity: 1 },  // CorVive sachet
      { foodId: 'f1', quantity: 1 },   // 1 banana
      { foodId: 'fa2', quantity: 1.25 }, // 1.25 tbsp PB
    ]
  },
  {
    id: 'mt2',
    name: 'CorVive Morning Protocol',
    description: 'Hydrate + Creatine to start the day',
    mealType: 'breakfast',
    items: [
      { foodId: 'cv2', quantity: 1 }, // Hydrate
      { foodId: 'cv3', quantity: 1 }, // Creatine
    ]
  },
  {
    id: 'mt3',
    name: 'PB&J Sandwich + Banana + Milk',
    description: 'Classic snack combo',
    mealType: 'snack',
    items: [
      { foodId: 'fa2', quantity: 2 },  // 2 tbsp PB
      { foodId: 'c8', quantity: 2 },   // 2 slices bread
      { foodId: 'f1', quantity: 1 },   // 1 banana
      { foodId: 'd1', quantity: 8 },   // 8oz milk
    ]
  },
  {
    id: 'mt4',
    name: 'Apple + Almond Butter + Milk',
    description: 'Healthy mid-morning snack',
    mealType: 'snack',
    items: [
      { foodId: 'f3', quantity: 1 },   // 1 green apple
      { foodId: 'fa3', quantity: 1.5 }, // 1.5 tbsp almond butter
      { foodId: 'd1', quantity: 8 },   // 8oz milk
    ]
  },
  {
    id: 'mt5',
    name: 'Grapes + Milk Snack',
    description: 'Light and refreshing',
    mealType: 'snack',
    items: [
      { foodId: 'f5', quantity: 1.5 }, // 1.5 cups grapes
      { foodId: 'd1', quantity: 8 },   // 8oz milk
    ]
  },
  {
    id: 'mt6',
    name: 'Breakfast Burrito (3 eggs)',
    description: 'Hearty breakfast with eggs, sausage, cheese',
    mealType: 'breakfast',
    items: [
      { foodId: 'p13', quantity: 3 },  // 3 eggs
      { foodId: 'p15', quantity: 3 },  // 3oz sausage
      { foodId: 'd6', quantity: 0.75 }, // 0.75oz cheddar
      { foodId: 'c10', quantity: 2 },  // 2 tortillas (10")
      { foodId: 'fa1', quantity: 0.2 }, // 0.2 avocado
      { foodId: 'f8', quantity: 12 },  // 12oz OJ
    ]
  },
  {
    id: 'mt7',
    name: 'Steak + Rice + Veggies',
    description: 'Classic muscle-building lunch',
    mealType: 'lunch',
    items: [
      { foodId: 'p5', quantity: 5.5 }, // 5.5oz filet mignon
      { foodId: 'c1', quantity: 1.5 }, // 1.5 cups white rice
      { foodId: 'v1', quantity: 1 },   // 1 bell pepper
      { foodId: 'd10', quantity: 0.5 }, // 0.5 tbsp butter
      { foodId: 'd2', quantity: 8 },   // 8oz chocolate milk
    ]
  },
  {
    id: 'mt8',
    name: 'Grilled Chicken + Rice + Rolls',
    description: 'Lean protein dinner option',
    mealType: 'dinner',
    items: [
      { foodId: 'p1', quantity: 5.5 }, // 5.5oz chicken breast
      { foodId: 'c1', quantity: 1.5 }, // 1.5 cups rice
      { foodId: 'fa1', quantity: 0.3 }, // 0.3 avocado
      { foodId: 'c14', quantity: 2 },  // 2 dinner rolls
    ]
  },
  {
    id: 'mt9',
    name: 'French Toast Breakfast',
    description: 'Sweet breakfast option',
    mealType: 'breakfast',
    items: [
      { foodId: 'c16', quantity: 3 },  // 3 slices French toast
      { foodId: 'f6', quantity: 1 },   // 1 cup strawberries
      { foodId: 'e1', quantity: 3 },   // 3 tbsp maple syrup
      { foodId: 'd10', quantity: 0.75 }, // 0.75 tbsp butter
      { foodId: 'f8', quantity: 12 },  // 12oz OJ
    ]
  },
  {
    id: 'mt10',
    name: 'Chipotle Bowl (Beef)',
    description: 'Restaurant-style burrito bowl',
    mealType: 'lunch',
    items: [
      { foodId: 'r4', quantity: 5 },   // 5oz Chipotle steak
      { foodId: 'r1', quantity: 1.5 }, // 1.5 cups rice
      { foodId: 'r6', quantity: 1 },   // 1oz cheese
      { foodId: 'fa1', quantity: 0.3 }, // 0.3 avocado
      { foodId: 'c18', quantity: 1.5 }, // 1.5oz chips
    ]
  },
  {
    id: 'mt11',
    name: 'Sushi Bowl (Shrimp)',
    description: 'Light and protein-packed',
    mealType: 'lunch',
    items: [
      { foodId: 'p10', quantity: 7 },  // 7oz shrimp
      { foodId: 'r8', quantity: 1.75 }, // 1.75 cups sushi rice
      { foodId: 'fa1', quantity: 0.35 }, // 0.35 avocado
      { foodId: 'd2', quantity: 8 },   // 8oz chocolate milk
    ]
  },
  {
    id: 'mt12',
    name: 'Muffin + Banana + Milk (Pre-Workout)',
    description: 'Quick energy before training',
    mealType: 'snack',
    items: [
      { foodId: 'e4', quantity: 1 },  // 1 large muffin
      { foodId: 'f1', quantity: 1 },  // 1 banana
      { foodId: 'd1', quantity: 8 },  // 8oz milk
    ]
  },
  {
    id: 'mt13',
    name: 'Cookies + Banana + Milk',
    description: 'Treat snack option',
    mealType: 'snack',
    items: [
      { foodId: 'e3', quantity: 3 },  // 3 cookies
      { foodId: 'f1', quantity: 1 },  // 1 banana
      { foodId: 'd1', quantity: 8 },  // 8oz milk
    ]
  },
  {
    id: 'mt14',
    name: 'English Muffin Breakfast Sandwich',
    description: 'Quick breakfast sandwich',
    mealType: 'breakfast',
    items: [
      { foodId: 'p13', quantity: 3 },  // 3 eggs
      { foodId: 'd6', quantity: 0.75 }, // 0.75oz cheese
      { foodId: 'c12', quantity: 2 },  // 2 English muffins
      { foodId: 'd10', quantity: 1 },  // butter
      { foodId: 'f8', quantity: 12 },  // 12oz OJ
    ]
  },
  {
    id: 'mt15',
    name: 'Bagel Breakfast Sandwich',
    description: 'Hearty bagel sandwich with eggs and sausage',
    mealType: 'breakfast',
    items: [
      { foodId: 'c13', quantity: 1 },  // 1 bagel
      { foodId: 'p13', quantity: 3 },  // 3 eggs
      { foodId: 'p15', quantity: 3 },  // 3oz sausage
      { foodId: 'd6', quantity: 0.75 }, // 0.75oz cheese
      { foodId: 'd10', quantity: 0.5 }, // butter
      { foodId: 'f8', quantity: 12 },  // 12oz OJ
    ]
  },
];

// Helper to get meal template with food data populated
export const getMealTemplateWithFoods = (template) => {
  return {
    ...template,
    items: template.items.map(item => ({
      ...item,
      food: getFoodById(item.foodId)
    }))
  };
};

// Get all templates with food data populated
export const getAllMealTemplates = () => {
  return DEFAULT_MEAL_TEMPLATES.map(getMealTemplateWithFoods);
};
