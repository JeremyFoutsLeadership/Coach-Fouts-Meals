// PDF generation for meal plans using jsPDF
import { jsPDF } from 'jspdf';
import { calculateMealMacros, calculateDayMacros, formatMacros } from './calculations';

const MEAL_NAMES = {
  breakfast: 'Breakfast + CorVive AM',
  snack1: 'Snack 1',
  lunch: 'Lunch',
  snack2: 'Snack 2',
  dinner: 'Dinner',
  evening: 'Evening (REQUIRED)',
};

const DAY_NAMES = ['DAY 1', 'DAY 2', 'DAY 3', 'DAY 4', 'DAY 5', 'DAY 6', 'DAY 7'];

export const generateMealPlanPDF = (athlete, plan) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;
  
  // Helper to add new page if needed
  const checkPageBreak = (neededHeight = 30) => {
    if (yPos + neededHeight > 270) {
      doc.addPage();
      yPos = 20;
      return true;
    }
    return false;
  };
  
  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('ELITE NUTRITION PLAN', pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;
  
  doc.setFontSize(16);
  doc.text(`FOR ${athlete.name.toUpperCase()}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 7;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`7-Day ${athlete.sport} Performance Program`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;
  
  const goalText = plan.goal === 'gain' || plan.goal === 'bulkHard' || plan.goal === 'bulkModerate' 
    ? 'Weight Gain Protocol' 
    : plan.goal === 'lose' || plan.goal === 'loseAggressive'
    ? 'Weight Loss Protocol'
    : 'Maintenance Protocol';
  doc.text(`${goalText} - USDA VERIFIED`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 12;
  
  // Daily Targets Box
  doc.setFillColor(34, 197, 94);
  doc.rect(margin, yPos, pageWidth - (margin * 2), 18, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DAILY TARGETS', pageWidth / 2, yPos + 6, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(
    `${plan.targets.calories} Calories | ${plan.targets.protein}g Protein | ${plan.targets.carbs}g Carbs | ${plan.targets.fat}g Fat`,
    pageWidth / 2,
    yPos + 13,
    { align: 'center' }
  );
  yPos += 22;
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('DRINK 130+ OZ WATER DAILY', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;
  
  // CorVive Protocol
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPos, pageWidth - (margin * 2), 32, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CORVIVE DAILY PROTOCOL', margin + 4, yPos + 6);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Morning: 1 CorVive Hydrate + 5g Creatine in 8-10 oz water', margin + 4, yPos + 13);
  doc.text('During Workouts: 1 CorVive Hydrate in 8-10 oz water', margin + 4, yPos + 19);
  doc.text('Night (REQUIRED): 1 CorVive Protein+Collagen SACHET in shake before bed', margin + 4, yPos + 25);
  doc.text('Order: www.corvive.com | Code: Athlete30 (30% off)', margin + 4, yPos + 31);
  yPos += 38;
  
  // Important Notes
  if (athlete.preferences || athlete.restrictions) {
    checkPageBreak(25);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`IMPORTANT NOTES - ${athlete.name.toUpperCase()}`, margin, yPos);
    yPos += 5;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    const notes = [
      '• All meat/seafood weights are COOKED weights',
      '• All rice/pasta are COOKED measurements',
      '• Use a food scale for accuracy',
      '• Evening protein shake is REQUIRED for recovery',
    ];
    
    if (athlete.preferences) {
      notes.push(`• ${athlete.name} loves: ${athlete.preferences}`);
    }
    if (athlete.restrictions) {
      notes.push(`• NO ${athlete.restrictions}`);
    }
    
    notes.forEach(note => {
      doc.text(note, margin, yPos);
      yPos += 4;
    });
    yPos += 6;
  }
  
  // Days
  plan.days.forEach((day, dayIndex) => {
    checkPageBreak(50);
    
    const dayMacros = calculateDayMacros(day);
    
    // Day header
    doc.setFillColor(30, 41, 59);
    doc.rect(margin, yPos, pageWidth - (margin * 2), 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(DAY_NAMES[dayIndex], margin + 4, yPos + 6);
    doc.setTextColor(0, 0, 0);
    yPos += 12;
    
    // Meals
    Object.entries(day).forEach(([mealKey, items]) => {
      if (items && items.length > 0) {
        checkPageBreak(20);
        
        const mealMacros = calculateMealMacros(items);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(MEAL_NAMES[mealKey], margin, yPos);
        yPos += 5;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        
        items.forEach(item => {
          checkPageBreak(5);
          const text = `• ${item.quantity} ${item.food.unit} ${item.food.name}`;
          doc.text(text, margin + 4, yPos);
          yPos += 4;
        });
        
        // Meal macros
        doc.setFont('helvetica', 'italic');
        doc.text(
          `→ ${mealMacros.calories} cal | ${Math.round(mealMacros.protein)}P | ${Math.round(mealMacros.carbs)}C | ${Math.round(mealMacros.fat)}F`,
          margin + 4,
          yPos
        );
        yPos += 7;
      }
    });
    
    // Day total
    checkPageBreak(10);
    doc.setFillColor(34, 197, 94, 30);
    doc.rect(margin, yPos - 2, pageWidth - (margin * 2), 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(
      `${DAY_NAMES[dayIndex]} TOTAL: ${dayMacros.calories} cal | ${Math.round(dayMacros.protein)}P | ${Math.round(dayMacros.carbs)}C | ${Math.round(dayMacros.fat)}F`,
      margin + 4,
      yPos + 4
    );
    yPos += 14;
  });
  
  // Footer - The Two Rules
  checkPageBreak(40);
  yPos += 5;
  
  doc.setFillColor(30, 41, 59);
  doc.rect(margin, yPos, pageWidth - (margin * 2), 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('THE TWO RULES', pageWidth / 2, yPos + 8, { align: 'center' });
  doc.setFontSize(10);
  doc.text('RULE #1: NEVER MISS PROTEIN', pageWidth / 2, yPos + 15, { align: 'center' });
  doc.text('RULE #2: NEVER GO INTO PRACTICE EMPTY', pageWidth / 2, yPos + 21, { align: 'center' });
  yPos += 30;
  
  // Contact
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CONTACT', pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Coach Fouts - NCSF Certified Sports Nutrition Specialist', pageWidth / 2, yPos, { align: 'center' });
  yPos += 4;
  doc.text('Website: JeremyFouts.com', pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Fuel Clean. Play Elite. Win.', pageWidth / 2, yPos, { align: 'center' });
  
  return doc;
};

export const downloadMealPlanPDF = (athlete, plan) => {
  const doc = generateMealPlanPDF(athlete, plan);
  const fileName = `${athlete.name.replace(/\s+/g, '_')}_Meal_Plan.pdf`;
  doc.save(fileName);
};

// Generate text version for copy/paste or email
export const generateMealPlanText = (athlete, plan) => {
  let content = `ELITE NUTRITION PLAN\nFOR ${athlete.name.toUpperCase()}\n`;
  content += `7-Day ${athlete.sport} Performance Program\n`;
  
  const goalText = plan.goal === 'gain' || plan.goal === 'bulkHard' || plan.goal === 'bulkModerate' 
    ? 'Weight Gain Protocol' 
    : plan.goal === 'lose' || plan.goal === 'loseAggressive'
    ? 'Weight Loss Protocol'
    : 'Maintenance Protocol';
  content += `${goalText} - USDA VERIFIED\n\n`;
  
  content += `DAILY TARGETS\n`;
  content += `${plan.targets.calories} Calories | ${plan.targets.protein}g Protein | ${plan.targets.carbs}g Carbs | ${plan.targets.fat}g Fat\n`;
  content += `DRINK 130+ OZ WATER DAILY\n\n`;
  
  content += `CORVIVE DAILY PROTOCOL\n`;
  content += `Morning: 1 CorVive Hydrate + 5g Creatine in 8-10 oz water\n`;
  content += `During Workouts: 1 CorVive Hydrate in 8-10 oz water\n`;
  content += `Night (REQUIRED): 1 CorVive Protein+Collagen SACHET in shake before bed\n`;
  content += `Order: www.corvive.com | Code: Athlete30 (30% off)\n\n`;
  
  if (athlete.preferences || athlete.restrictions) {
    content += `IMPORTANT NOTES - ${athlete.name.toUpperCase()}\n`;
    content += `• All meat/seafood weights are COOKED weights\n`;
    content += `• All rice/pasta are COOKED measurements\n`;
    content += `• Use a food scale for accuracy\n`;
    content += `• Evening protein shake is REQUIRED for recovery\n`;
    if (athlete.preferences) {
      content += `• ${athlete.name} loves: ${athlete.preferences}\n`;
    }
    if (athlete.restrictions) {
      content += `• NO ${athlete.restrictions}\n`;
    }
    content += `\n`;
  }
  
  plan.days.forEach((day, dayIndex) => {
    const dayMacros = calculateDayMacros(day);
    content += `\n${'='.repeat(50)}\n`;
    content += `${DAY_NAMES[dayIndex]}\n`;
    content += `${'='.repeat(50)}\n`;
    
    Object.entries(day).forEach(([mealKey, items]) => {
      if (items && items.length > 0) {
        const mealMacros = calculateMealMacros(items);
        content += `\n${MEAL_NAMES[mealKey]}\n`;
        
        items.forEach(item => {
          content += `• ${item.quantity} ${item.food.unit} ${item.food.name}\n`;
        });
        
        content += `→ ${mealMacros.calories} cal | ${Math.round(mealMacros.protein)}P | ${Math.round(mealMacros.carbs)}C | ${Math.round(mealMacros.fat)}F\n`;
      }
    });
    
    content += `\n${DAY_NAMES[dayIndex]} TOTAL: ${dayMacros.calories} cal | ${Math.round(dayMacros.protein)}P | ${Math.round(dayMacros.carbs)}C | ${Math.round(dayMacros.fat)}F\n`;
  });
  
  content += `\n\n${'='.repeat(50)}\n`;
  content += `THE TWO RULES\n`;
  content += `RULE #1: NEVER MISS PROTEIN\n`;
  content += `RULE #2: NEVER GO INTO PRACTICE EMPTY\n`;
  content += `${'='.repeat(50)}\n\n`;
  
  content += `CONTACT\n`;
  content += `Coach Fouts - NCSF Certified Sports Nutrition Specialist\n`;
  content += `Website: JeremyFouts.com\n`;
  content += `Fuel Clean. Play Elite. Win.\n`;
  
  return content;
};
