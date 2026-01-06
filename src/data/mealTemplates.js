// Pre-built meal templates for quick addition
import { getFoodById } from './foods';

export const DEFAULT_MEAL_TEMPLATES = [
  // ============================================
  // CORVIVE REQUIRED MEALS
  // ============================================
  {
    id: 'mt1',
    name: 'Evening Protein Shake (REQUIRED)',
    description: 'Required evening shake with CorVive Protein',
    mealType: 'evening',
    items: [
      { foodId: 'd2', quantity: 12 },  // 12oz chocolate milk
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

  // ============================================
  // OVERNIGHT OATS (3:1 PRE-WORKOUT)
  // ============================================
  {
    id: 'mt24',
    name: 'Apple Pie Overnight Oats (3:1)',
    description: '35g protein - Perfect pre-morning workout',
    mealType: 'breakfast',
    items: [
      { foodId: 'c21', quantity: 0.75 },  // 3/4 cup rolled oats (dry)
      { foodId: 'cv1', quantity: 1 },     // 1 scoop CorVive Protein
      { foodId: 'd1', quantity: 4 },      // 1/2 cup whole milk
      { foodId: 'd15', quantity: 0.25 },  // 1/4 cup vanilla yogurt
      { foodId: 'f13', quantity: 1 },     // 1 medium apple, diced
      { foodId: 'fa10', quantity: 1 },    // 1 tbsp chia seeds
      { foodId: 'fa3', quantity: 1 },     // 1 tbsp almond butter
      { foodId: 'e1', quantity: 2 },      // 2 tbsp maple syrup
    ]
  },
  {
    id: 'mt25',
    name: 'PB Banana Overnight Oats (3:1)',
    description: '36g protein - Classic combo, ready to go',
    mealType: 'breakfast',
    items: [
      { foodId: 'c21', quantity: 0.75 },  // 3/4 cup rolled oats (dry)
      { foodId: 'cv1', quantity: 1 },     // 1 scoop CorVive Protein
      { foodId: 'd1', quantity: 4 },      // 1/2 cup whole milk
      { foodId: 'd15', quantity: 0.25 },  // 1/4 cup vanilla yogurt
      { foodId: 'f1', quantity: 1 },      // 1 medium banana
      { foodId: 'fa2', quantity: 2 },     // 2 tbsp peanut butter
      { foodId: 'e2', quantity: 1 },      // 1 tbsp honey
      { foodId: 'fa10', quantity: 1 },    // 1 tbsp chia seeds
    ]
  },
  {
    id: 'mt26',
    name: 'Blueberry Muffin Overnight Oats (3:1)',
    description: '35g protein - Tastes like dessert',
    mealType: 'breakfast',
    items: [
      { foodId: 'c21', quantity: 0.75 },  // 3/4 cup rolled oats (dry)
      { foodId: 'cv1', quantity: 1 },     // 1 scoop CorVive Protein
      { foodId: 'd1', quantity: 4 },      // 1/2 cup whole milk
      { foodId: 'd15', quantity: 0.33 },  // 1/3 cup vanilla yogurt
      { foodId: 'f7', quantity: 0.75 },   // 3/4 cup blueberries
      { foodId: 'fa3', quantity: 1 },     // 1 tbsp almond butter
      { foodId: 'e1', quantity: 2 },      // 2 tbsp maple syrup
      { foodId: 'fa10', quantity: 1 },    // 1 tbsp chia seeds
    ]
  },

  // ============================================
  // COACH FOUTS MEAL PREP - DINNERS
  // ============================================
  {
    id: 'mt16',
    name: 'Chicken Pesto Alfredo Lasagna',
    description: '67g protein - Freezer-friendly (serves 10)',
    mealType: 'dinner',
    items: [
      { foodId: 'p1', quantity: 4.8 },    // 4.8 oz chicken breast
      { foodId: 'c22', quantity: 1.6 },   // 1.6 oz lasagna noodles
      { foodId: 'd9', quantity: 0.4 },    // 0.4 cup cottage cheese (blended)
      { foodId: 'd11', quantity: 0.4 },   // 0.4 oz cream cheese
      { foodId: 'd12', quantity: 0.4 },   // 0.4 oz parmesan
      { foodId: 'd13', quantity: 1.6 },   // 1.6 oz mozzarella (reduced fat)
      { foodId: 'e13', quantity: 0.6 },   // 0.6 tbsp pesto
    ]
  },
  {
    id: 'mt19',
    name: 'Orange Chicken with Rice',
    description: '48g protein - Better than takeout (serves 4)',
    mealType: 'dinner',
    items: [
      { foodId: 'p1', quantity: 8 },      // 8 oz chicken breast
      { foodId: 'c2', quantity: 0.75 },   // 3/4 cup brown rice
      { foodId: 'c27', quantity: 0.5 },   // 1/2 tbsp cornstarch
      { foodId: 'fa11', quantity: 0.5 },  // 1/2 tbsp vegetable oil
      { foodId: 'v13', quantity: 1 },     // 1 clove garlic
      { foodId: 'f8', quantity: 1.5 },    // 1.5 oz orange juice
      { foodId: 'e10', quantity: 1 },     // 1 tbsp soy sauce
      { foodId: 'e2', quantity: 0.5 },    // 1/2 tbsp honey
      { foodId: 'v12', quantity: 1 },     // green onions
    ]
  },
  {
    id: 'mt21',
    name: 'Chicken Fettuccine Garlic Herb',
    description: '52g protein - Creamy pasta perfection (serves 4)',
    mealType: 'dinner',
    items: [
      { foodId: 'p1', quantity: 6 },      // 6 oz chicken breast
      { foodId: 'c23', quantity: 2 },     // 2 cups fettuccine (cooked)
      { foodId: 'd10', quantity: 1.5 },   // 1.5 tbsp butter
      { foodId: 'v13', quantity: 2 },     // 2 cloves garlic
      { foodId: 'd14', quantity: 2 },     // 2 tbsp heavy cream
      { foodId: 'd1', quantity: 1 },      // 1 oz whole milk
      { foodId: 'd12', quantity: 0.5 },   // 0.5 oz parmesan
      { foodId: 'fa4', quantity: 0.5 },   // 0.5 tbsp olive oil
    ]
  },
  {
    id: 'mt22',
    name: 'Cajun Beef with Pasta & Honey',
    description: '44g protein - Sweet heat flavor (serves 4)',
    mealType: 'dinner',
    items: [
      { foodId: 'p21', quantity: 7 },     // 7 oz beef sirloin
      { foodId: 'c24', quantity: 2 },     // 2 cups penne pasta (cooked)
      { foodId: 'v11', quantity: 0.4 },   // 0.4 cup diced onion
      { foodId: 'v16', quantity: 0.5 },   // 0.5 cup bell pepper (sliced)
      { foodId: 'v13', quantity: 1 },     // 1 clove garlic
      { foodId: 'e20', quantity: 0.5 },   // 0.5 tbsp cajun seasoning
      { foodId: 'v15', quantity: 0.5 },   // 0.5 cup diced tomatoes
      { foodId: 'e2', quantity: 0.75 },   // 0.75 tbsp honey
      { foodId: 'd10', quantity: 0.5 },   // 0.5 tbsp butter
      { foodId: 'fa11', quantity: 0.75 }, // 0.75 tbsp vegetable oil
    ]
  },
  {
    id: 'mt23',
    name: 'Honey BBQ Chicken Mac & Cheese',
    description: '59g protein - Ultimate comfort food (serves 4)',
    mealType: 'dinner',
    items: [
      { foodId: 'p1', quantity: 6 },      // 6 oz chicken breast
      { foodId: 'c25', quantity: 1 },     // 1 cup macaroni (cooked)
      { foodId: 'd18', quantity: 3 },     // 3 oz fat-free evaporated milk
      { foodId: 'd11', quantity: 0.7 },   // 0.7 oz light cream cheese
      { foodId: 'd19', quantity: 0.9 },   // 0.9 oz light cheddar
      { foodId: 'e14', quantity: 1.5 },   // 1.5 tbsp sugar-free BBQ sauce
      { foodId: 'e2', quantity: 0.4 },    // 0.4 tbsp honey
    ]
  },

  // ============================================
  // COACH FOUTS MEAL PREP - LUNCH
  // ============================================
  {
    id: 'mt20',
    name: 'Big Mac Burrito',
    description: '46g protein - Crispy, cheesy, satisfying (serves 4)',
    mealType: 'lunch',
    items: [
      { foodId: 'p22', quantity: 8 },     // 8 oz ground beef 90/10
      { foodId: 'c10', quantity: 1 },     // 1 flour tortilla (10")
      { foodId: 'd6', quantity: 1 },      // 1 oz cheddar cheese
      { foodId: 'd17', quantity: 1 },     // 1 oz american cheese
      { foodId: 'd16', quantity: 2 },     // 2 tbsp sour cream
      { foodId: 'v11', quantity: 0.25 },  // 1/4 cup diced onion
      { foodId: 'e8', quantity: 0.75 },   // 0.75 tbsp ketchup
      { foodId: 'e15', quantity: 0.5 },   // 0.5 tbsp mustard
      { foodId: 'fa11', quantity: 0.5 },  // 0.5 tbsp vegetable oil
    ]
  },

  // ============================================
  // COACH FOUTS MEAL PREP - BREAKFAST
  // ============================================
  {
    id: 'mt17',
    name: 'Breakfast Enchiladas',
    description: '32g protein - Eggs, sausage, cheese sauce (serves 10)',
    mealType: 'breakfast',
    items: [
      { foodId: 'p15', quantity: 1.6 },   // 1.6 oz breakfast sausage
      { foodId: 'p13', quantity: 1 },     // 1 egg
      { foodId: 'c10', quantity: 1 },     // 1 flour tortilla (10")
      { foodId: 'd6', quantity: 1.5 },    // 1.5 oz cheddar cheese
      { foodId: 'd10', quantity: 0.5 },   // 0.5 tbsp butter
      { foodId: 'd1', quantity: 2 },      // 2 oz whole milk
      { foodId: 'v12', quantity: 1 },     // green onions
    ]
  },
  {
    id: 'mt18',
    name: 'French Toast Casserole (w/ icing)',
    description: '19g protein - Brioche with cream cheese icing (serves 8)',
    mealType: 'breakfast',
    items: [
      { foodId: 'c26', quantity: 2 },     // 2 slices brioche bread
      { foodId: 'p13', quantity: 1.5 },   // 1.5 eggs
      { foodId: 'd14', quantity: 2 },     // 2 tbsp heavy cream
      { foodId: 'd1', quantity: 2 },      // 2 oz whole milk
      { foodId: 'e19', quantity: 1.5 },   // 1.5 tbsp brown sugar
      { foodId: 'd10', quantity: 0.5 },   // 0.5 tbsp butter
      { foodId: 'd11', quantity: 1 },     // 1 oz cream cheese (icing)
      { foodId: 'e18', quantity: 2 },     // 2 tbsp powdered sugar (icing)
    ]
  },

  // ============================================
  // QUICK SNACKS
  // ============================================
  {
    id: 'mt3',
    name: 'PB&J Sandwich + Banana + Milk',
    description: 'Classic snack combo',
    mealType: 'snack',
    items: [
      { foodId: 'fa2', quantity: 2 },  // 2 tbsp PB
      { foodId: 'e5', quantity: 2 },   // 2 tbsp jelly
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

  // ============================================
  // CLASSIC BREAKFAST OPTIONS
  // ============================================
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

  // ============================================
  // LUNCH & DINNER OPTIONS
  // ============================================
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
