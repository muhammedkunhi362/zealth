import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

function calculateScore(answers: any, keys: string[], maxPossible: number) {
  let obtained = 0;
  keys.forEach(k => {
    if (answers[k]) obtained += parseInt(answers[k]);
  });
  return Math.round((obtained / maxPossible) * 10);
}

function getBMIStatus(bmi: number) {
  if (bmi >= 18.5 && bmi <= 24.9) return { score: 9, status: 'General healthy reference range' };
  if ((bmi >= 25 && bmi <= 29.9) || (bmi >= 17 && bmi < 18.5)) return { score: 6, status: 'Moderately outside reference range' };
  return { score: 3, status: 'Significantly outside reference range' };
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { answers, height, weight, waist } = await req.json();
    if (!height || !weight) return NextResponse.json({ error: 'Height and weight required' }, { status: 400 });

    const h = parseFloat(height);
    const w = parseFloat(weight);
    const bmi = parseFloat((w / ((h / 100) * (h / 100))).toFixed(1));
    const bmiResult = getBMIStatus(bmi);

    const nutrScore = calculateScore(answers, ['nutr_q1', 'nutr_q2', 'nutr_q3', 'nutr_q4', 'nutr_q5', 'nutr_q6', 'nutr_q7', 'nutr_q8', 'nutr_q9', 'nutr_q10'], 30);
    const moveScore = calculateScore(answers, ['move_q1', 'move_q2', 'move_q3', 'move_q4', 'move_q5'], 15);
    const sleepScore = calculateScore(answers, ['sleep_q1', 'sleep_q2', 'sleep_q3', 'sleep_q4'], 12);
    const stressScore = calculateScore(answers, ['stress_q1', 'stress_q2', 'stress_q3', 'stress_q4'], 12);
    const hydroScore = calculateScore(answers, ['hydro_q1', 'hydro_q2'], 6);
    const habitsScore = calculateScore(answers, ['habits_q1', 'habits_q2', 'habits_q3', 'habits_q4'], 12);
    const weightBodyScore = bmiResult.score;

    const totalScore = nutrScore + moveScore + sleepScore + stressScore + hydroScore + habitsScore + weightBodyScore;

    let overallStatus = 'More Attention Recommended';
    if (totalScore >= 56) overallStatus = 'Good Lifestyle Foundation';
    else if (totalScore >= 42) overallStatus = 'Some Areas Need Attention';

    const categories = [
      { name: 'Nutrition', score: nutrScore },
      { name: 'Movement', score: moveScore },
      { name: 'Sleep', score: sleepScore },
      { name: 'Stress', score: stressScore },
      { name: 'Hydration', score: hydroScore },
      { name: 'Daily Habits', score: habitsScore },
      { name: 'Weight & Body', score: weightBodyScore },
    ];

    categories.sort((a, b) => b.score - a.score);
    const strongerAreas = categories.slice(0, 3).map(c => c.name);
    
    const bottomCategories = [...categories].reverse();
    const attentionAreas = bottomCategories.slice(0, 3).map(c => c.name);

    const firstFocusCat = bottomCategories[0];
    let firstFocus = { focus: firstFocusCat.name, why: 'Based on your responses, this area currently has the lowest score and may benefit from your attention.', smallStart: 'Review the personalized recommendations below and pick one small habit to start improving today.' };

    if (firstFocusCat.name === 'Sleep') {
      firstFocus.why = 'Your responses indicate that sleep duration or consistency might need improvement.';
      firstFocus.smallStart = 'Try maintaining a more consistent sleep and wake time and reduce screen exposure before bed.';
    } else if (firstFocusCat.name === 'Nutrition') {
      firstFocus.why = 'Your responses suggest less supportive patterns in daily nutrition, portioning, or food choices.';
      firstFocus.smallStart = 'Start by adding a portion of vegetables to your main meals and observe the difference.';
    } else if (firstFocusCat.name === 'Movement') {
      firstFocus.why = 'Your physical activity levels and sitting times indicate a need for more regular movement.';
      firstFocus.smallStart = 'Try adding a 10-minute walk after lunch or dinner daily.';
    } else if (firstFocusCat.name === 'Stress') {
      firstFocus.why = 'You reported high stress levels or difficulty relaxing.';
      firstFocus.smallStart = 'Incorporate 5 minutes of deep breathing or silence into your daily routine.';
    }

    const recommendations: Record<string, string[]> = {};
    if (nutrScore <= 7) recommendations['Nutrition'] = ['Improve balanced meals with appropriate protein', 'Include vegetables/fruits regularly', 'Reduce frequent fried/packaged foods'];
    if (moveScore <= 7) recommendations['Movement'] = ['Break up long sitting periods', 'Increase regular walking', 'Consider movement after meals'];
    if (sleepScore <= 7) recommendations['Sleep'] = ['Maintain consistent sleep/wake timing', 'Improve bedtime routine', 'Reduce phone/screen use before sleeping'];
    if (stressScore <= 7) recommendations['Stress'] = ['Create regular relaxation periods', 'Consider professional support if distress is persistent'];

    // Update user height and weight in Supabase
    await supabase.from('users').update({ height: h, weight: w }).eq('id', session.userId);

    const { data: assessment, error } = await supabase.from('assessments').insert({
      userid: session.userId,
      answers,
      height: h,
      weight: w,
      waist: waist ? parseFloat(waist) : null,
      bmi,
      categoryscores: {
        nutrition: nutrScore,
        movement: moveScore,
        sleep: sleepScore,
        stress: stressScore,
        weightBody: weightBodyScore,
        hydration: hydroScore,
        dailyHabits: habitsScore
      },
      totalscore: totalScore,
      overallstatus: overallStatus,
      strongerareas: strongerAreas,
      attentionareas: attentionAreas,
      firstfocus: firstFocus,
      recommendations
    }).select().single();

    if (error || !assessment) {
      console.error('Insert assessment error:', error);
      return NextResponse.json({ error: 'Failed to save assessment' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Assessment submitted', assessmentId: assessment.id });
  } catch (error) {
    console.error('Submit error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
