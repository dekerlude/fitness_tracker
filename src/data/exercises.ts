import { Exercise, WorkoutDay } from '../types';

export const MASTER_EXERCISES: Exercise[] = [
  // --- PUSH EXERCISES ---
  {
    id: 'flat_bench_press',
    name: 'Flat Bench Press',
    muscleGroup: 'chest',
    category: 'Push',
    defaultSets: 3,
    repsRange: { min: 8, max: 12 },
    instructions: 'Lie flat on a bench. Grip the barbell slightly wider than shoulder-width. Lower the bar slowly to your mid-chest, then press it back up while keeping your elbows at roughly a 45-degree angle.',
    alternativeName: 'Push-ups / DB Bench Press',
    alternativeInstruction: 'Perform push-ups with a slow, controlled negative, or use a pair of dumbbells on the floor or bench.',
    equipmentRequired: 'gym'
  },
  {
    id: 'overhead_press',
    name: 'Overhead Press (OHP)',
    muscleGroup: 'shoulders',
    category: 'Push',
    defaultSets: 3,
    repsRange: { min: 8, max: 12 },
    instructions: 'Stand with feet shoulder-width apart. Brace your core and press the barbell vertically overhead, tilting your head back slightly as the bar passes your face. Lock out at the top.',
    alternativeName: 'Dumbbell Shoulder Press',
    alternativeInstruction: 'Sit or stand and press dumbbells vertically overhead, keeping palms facing slightly inward to protect shoulders.',
    equipmentRequired: 'gym'
  },
  {
    id: 'incline_db_press',
    name: 'Incline Dumbbell Press',
    muscleGroup: 'chest',
    category: 'Push',
    defaultSets: 3,
    repsRange: { min: 10, max: 12 },
    instructions: 'Set an incline bench to 30-45 degrees. Press the dumbbells up over your upper chest, focusing on squeezing the upper pectoral muscles at the top of the movement.',
    alternativeName: 'Decline Push-ups',
    alternativeInstruction: 'Place your feet on a chair or elevated surface and hands on the floor to target the upper chest.',
    equipmentRequired: 'dumbbell'
  },
  {
    id: 'lateral_raises',
    name: 'Lateral Raises',
    muscleGroup: 'shoulders',
    category: 'Push',
    defaultSets: 4,
    repsRange: { min: 12, max: 15 },
    instructions: 'Stand tall with dumbbells in hands. Raise your arms out to the sides with a slight bend in the elbows. Lead with your elbows and raise to shoulder height to isolate the side deltoids.',
    alternativeName: 'Resistance Band Lateral Raises',
    alternativeInstruction: 'Step on a resistance band and raise arms sideways, or raise light household items slowly.',
    equipmentRequired: 'dumbbell'
  },
  {
    id: 'triceps_pushdown',
    name: 'Triceps Pushdown',
    muscleGroup: 'triceps',
    category: 'Push',
    defaultSets: 3,
    repsRange: { min: 10, max: 15 },
    instructions: 'Using a cable station with rope or bar, keep your elbows tucked at your sides. Extend your arms downwards, contracting your triceps hard at the bottom.',
    alternativeName: 'Diamond Push-ups',
    alternativeInstruction: 'Perform push-ups with your hands close together under your chest, forming a diamond shape with your index fingers and thumbs.',
    equipmentRequired: 'gym'
  },
  {
    id: 'incline_barbell_press',
    name: 'Incline Barbell Press',
    muscleGroup: 'chest',
    category: 'Push',
    defaultSets: 3,
    repsRange: { min: 8, max: 12 },
    instructions: 'Lie on an incline bench set to 30 degrees. Unrack the barbell and lower it to your upper chest, then push upward forcefully while keeping control.',
    alternativeName: 'Incline Dumbbell Press',
    alternativeInstruction: 'Use dumbbells on an incline bench or incline push-ups with hands on an elevated surface.',
    equipmentRequired: 'gym'
  },
  {
    id: 'arnold_press',
    name: 'Arnold Press',
    muscleGroup: 'shoulders',
    category: 'Push',
    defaultSets: 3,
    repsRange: { min: 10, max: 12 },
    instructions: 'Hold dumbbells in front of your shoulders with palms facing you. Press overhead while rotating your wrists so that your palms face away at the top.',
    alternativeName: 'Pike Push-ups',
    alternativeInstruction: 'Get into a downward dog position and lower your head towards the floor between your hands, pushing back up to target front shoulders.',
    equipmentRequired: 'dumbbell'
  },
  {
    id: 'dips',
    name: 'Dips',
    muscleGroup: 'chest',
    category: 'Push',
    defaultSets: 3,
    repsRange: { min: 8, max: 12 },
    instructions: 'Grab parallel bars, support yourself with locked arms, then lower your body by bending at the elbows with a slight forward lean to emphasize the chest.',
    alternativeName: 'Bench Dips',
    alternativeInstruction: 'Place hands on the edge of a chair or bench behind you, feet in front, and lower your hips towards the floor.',
    equipmentRequired: 'bodyweight'
  },
  {
    id: 'cable_fly',
    name: 'Cable Fly',
    muscleGroup: 'chest',
    category: 'Push',
    defaultSets: 3,
    repsRange: { min: 12, max: 15 },
    instructions: 'Set cables at shoulder height. Bring your hands together in front of your chest in a hugging motion, keeping a slight bend in your elbows and squeezing your chest.',
    alternativeName: 'Dumbbell Fly / Chest Squeeze Walk',
    alternativeInstruction: 'Lie flat on the floor with dumbbells and fly them together, or press palms together as hard as possible for an isometric chest burn.',
    equipmentRequired: 'gym'
  },
  {
    id: 'overhead_triceps_ext',
    name: 'Overhead Triceps Extension',
    muscleGroup: 'triceps',
    category: 'Push',
    defaultSets: 3,
    repsRange: { min: 10, max: 15 },
    instructions: 'Hold a dumbbell or cable rope overhead. Keep your elbows tucked in and close to your ears as you bend them to lower the weight behind your head, then extend back up.',
    alternativeName: 'Triceps Bench Dips',
    alternativeInstruction: 'Dip using a chair/bench, focusing on vertical forearm travel and deep triceps engagement.',
    equipmentRequired: 'dumbbell'
  },

  // --- PULL EXERCISES ---
  {
    id: 'deadlift',
    name: 'Deadlift',
    muscleGroup: 'back',
    category: 'Pull',
    defaultSets: 3,
    repsRange: { min: 5, max: 8 },
    instructions: 'Stand with feet mid-foot under the barbell. Bend over and grab the bar. Keep your back flat, engage your lats, push through your heels, and stand tall to pull the bar up your shins.',
    alternativeName: 'Dumbbell Romanian Deadlift',
    alternativeInstruction: 'Hold dumbbells in front of thighs, hinge at hips while keeping back flat, feel hamstrings and lower back, and return upright.',
    equipmentRequired: 'gym'
  },
  {
    id: 'pull_ups',
    name: 'Pull-ups',
    muscleGroup: 'back',
    category: 'Pull',
    defaultSets: 3,
    repsRange: { min: 8, max: 12 },
    instructions: 'Hang from a bar with a wide overhand grip. Pull your chest up to the bar by driving your elbows down towards your ribs, keeping your shoulders back.',
    alternativeName: 'Under-table Rows / Doorway Rows',
    alternativeInstruction: 'Hold the edge of a sturdy table from underneath, body straight, and pull your chest to the table, or use a doorway for standing pulls.',
    equipmentRequired: 'bodyweight'
  },
  {
    id: 'barbell_row',
    name: 'Barbell Row',
    muscleGroup: 'back',
    category: 'Pull',
    defaultSets: 3,
    repsRange: { min: 8, max: 12 },
    instructions: 'Hinge forward at the hips with a flat back. Grip the barbell and row it towards your lower ribcage, squeezing your shoulder blades together at the peak.',
    alternativeName: 'One-Arm Dumbbell Row',
    alternativeInstruction: 'Support one knee and hand on a bench, holding a dumbbell in the other hand, row it up towards your hip.',
    equipmentRequired: 'gym'
  },
  {
    id: 'face_pulls',
    name: 'Face Pulls',
    muscleGroup: 'rear-delts-traps',
    category: 'Pull',
    defaultSets: 3,
    repsRange: { min: 12, max: 15 },
    instructions: 'Using a rope attachment at upper chest level, pull the rope towards your forehead while flaring your elbows and rotating your wrists to squeeze rear deltoids and traps.',
    alternativeName: 'Dumbbell Rear Delt Fly',
    alternativeInstruction: 'Hinge forward at 45 degrees, raise dumbbells out to the sides like wings, leading with your pinkies to target the rear delts.',
    equipmentRequired: 'gym'
  },
  {
    id: 'bicep_curl',
    name: 'Barbell/Dumbbell Bicep Curl',
    muscleGroup: 'biceps',
    category: 'Pull',
    defaultSets: 3,
    repsRange: { min: 10, max: 12 },
    instructions: 'Stand tall with weights. Flex your elbows to curl the weight up, keeping elbows stationary at your sides. Squeeze biceps at the top and lower slowly.',
    alternativeName: 'Resistance Band / Household Item Curls',
    alternativeInstruction: 'Curl resistance bands or heavy grocery bags filled with water bottles or books under control.',
    equipmentRequired: 'dumbbell'
  },
  {
    id: 'lat_pulldown',
    name: 'Lat Pulldown',
    muscleGroup: 'back',
    category: 'Pull',
    defaultSets: 3,
    repsRange: { min: 10, max: 12 },
    instructions: 'Sit at pulldown station. Pull bar down to your upper collarbone, driving your elbows down and back. Keep your chest up and lats fully engaged.',
    alternativeName: 'Towel Door Pull-ups',
    alternativeInstruction: 'Place a knot in a towel, throw it over a door, close door securely, and pull yourself up holding the towel.',
    equipmentRequired: 'gym'
  },
  {
    id: 'seated_cable_row',
    name: 'Seated Cable Row',
    muscleGroup: 'back',
    category: 'Pull',
    defaultSets: 3,
    repsRange: { min: 10, max: 12 },
    instructions: 'Sit with knees slightly bent. Pull cable handle towards your abdomen, squeezing your shoulder blades and pulling your shoulders back and down.',
    alternativeName: 'Dumbbell Rows',
    alternativeInstruction: 'Perform bent-over rows with two dumbbells simultaneously, drawing elbows back to your hips.',
    equipmentRequired: 'gym'
  },
  {
    id: 'rear_delt_fly',
    name: 'Rear Delt Fly',
    muscleGroup: 'rear-delts-traps',
    category: 'Pull',
    defaultSets: 3,
    repsRange: { min: 12, max: 15 },
    instructions: 'Sit on a pec deck machine facing the pad, or bend forward. Pull handles back to isolate rear delts with minimal scapular squeeze.',
    alternativeName: 'Prone YWT Raises',
    alternativeInstruction: 'Lie face down on the floor, lift arms in Y, W, and T shapes to engage rear delts, traps, and upper back without weights.',
    equipmentRequired: 'dumbbell'
  },
  {
    id: 'hammer_curl',
    name: 'Hammer Curl',
    muscleGroup: 'biceps',
    category: 'Pull',
    defaultSets: 3,
    repsRange: { min: 10, max: 12 },
    instructions: 'Hold dumbbells with neutral grip (palms facing each other). Curl up without twisting, emphasizing the brachialis and brachioradialis.',
    alternativeName: 'Reverse Grip Towel Curls',
    alternativeInstruction: 'Loop a towel through heavy bags or jugs and curl it using a neutral hammer grip.',
    equipmentRequired: 'dumbbell'
  },
  {
    id: 'shrugs',
    name: 'Barbell/Dumbbell Shrugs',
    muscleGroup: 'rear-delts-traps',
    category: 'Pull',
    defaultSets: 3,
    repsRange: { min: 12, max: 15 },
    instructions: 'Stand tall with weight at sides or front. Elevate shoulders straight up towards your ears, squeezing upper traps, and lower under control.',
    alternativeName: 'No-Weight Shoulder Holds',
    alternativeInstruction: 'Hold a heavy household object in each hand and shrug upwards, holding for 3 seconds at the top.',
    equipmentRequired: 'dumbbell'
  },

  // --- LEGS EXERCISES ---
  {
    id: 'squats',
    name: 'Barbell Back Squat',
    muscleGroup: 'quads',
    category: 'Legs',
    defaultSets: 3,
    repsRange: { min: 8, max: 10 },
    instructions: 'Place barbell on upper traps. Lower your hips down and back like sitting on a chair, keeping knees in line with toes, chest up. Drive back up.',
    alternativeName: 'Bodyweight Goblet Squats',
    alternativeInstruction: 'Squat with bodyweight or hold a single dumbbell at chest level, going below parallel slowly.',
    equipmentRequired: 'gym'
  },
  {
    id: 'romanian_deadlift',
    name: 'Romanian Deadlift (RDL)',
    muscleGroup: 'hamstrings',
    category: 'Legs',
    defaultSets: 3,
    repsRange: { min: 10, max: 12 },
    instructions: 'Hold barbell in front of hips. Push your hips straight back with a flat spine, lowering the bar down your shins until you feel a deep hamstring stretch.',
    alternativeName: 'Dumbbell RDL',
    alternativeInstruction: 'Use two dumbbells sliding down your thighs to perform the hip hinge.',
    equipmentRequired: 'dumbbell'
  },
  {
    id: 'leg_press',
    name: 'Leg Press',
    muscleGroup: 'quads',
    category: 'Legs',
    defaultSets: 3,
    repsRange: { min: 10, max: 12 },
    instructions: 'Place feet shoulder-width on the sled. Lower the platform until your knees are at 90 degrees, then press upward without locking your knees fully.',
    alternativeName: 'Bulgarian Split Squats (BW)',
    alternativeInstruction: 'Step one foot backward onto a chair and perform split squats to target quads and glutes unilaterally.',
    equipmentRequired: 'gym'
  },
  {
    id: 'calf_raises',
    name: 'Standing Calf Raises',
    muscleGroup: 'calves',
    category: 'Legs',
    defaultSets: 4,
    repsRange: { min: 12, max: 15 },
    instructions: 'Stand on a step with heels hanging off. Lower heels below step level, then press all the way up onto your toes, squeezing calves.',
    alternativeName: 'Single-Leg Floor Calf Raise',
    alternativeInstruction: 'Balance on one leg on a flat floor or ledge, raise up slowly, and squeeze. Hold onto a wall for stability.',
    equipmentRequired: 'bodyweight'
  },
  {
    id: 'leg_curl',
    name: 'Seated/Lying Leg Curl',
    muscleGroup: 'hamstrings',
    category: 'Legs',
    defaultSets: 3,
    repsRange: { min: 10, max: 12 },
    instructions: 'Position yourself on leg curl machine. Squeeze hamstrings to draw heels towards glutes under full control.',
    alternativeName: 'Floor Hamstring Bridge / DB Leg Curl',
    alternativeInstruction: 'Lie on floor, place heels on furniture or sliders, and pull heels towards glutes, raising hips, or squeeze a dumbbell between your feet lying face down.',
    equipmentRequired: 'gym'
  },
  {
    id: 'front_squat',
    name: 'Front Squat / Bulgarian Split Squat',
    muscleGroup: 'quads',
    category: 'Legs',
    defaultSets: 3,
    repsRange: { min: 8, max: 12 },
    instructions: 'Rest the bar on front shoulders. Stand tall, descend vertically keeping chest high and back flat, and drive up.',
    alternativeName: 'Bulgarian Split Squats (Dumbbell)',
    alternativeInstruction: 'Elevate back foot on bench/chair, hold dumbbells, lower rear knee almost to floor, and push up with front heel.',
    equipmentRequired: 'dumbbell'
  },
  {
    id: 'hip_thrust',
    name: 'Barbell/Dumbbell Hip Thrust',
    muscleGroup: 'hamstrings',
    category: 'Legs',
    defaultSets: 3,
    repsRange: { min: 10, max: 15 },
    instructions: 'Place upper back on bench, rest weight on hips. Drive hips up towards the ceiling, squeezing glutes maximally at the top.',
    alternativeName: 'Single-Leg Glute Bridge',
    alternativeInstruction: 'Lie on your back, bend one knee, raise the other leg, and thrust your hips upward using your glutes and hamstrings.',
    equipmentRequired: 'bodyweight'
  },
  {
    id: 'leg_extension',
    name: 'Leg Extension',
    muscleGroup: 'quads',
    category: 'Legs',
    defaultSets: 3,
    repsRange: { min: 12, max: 15 },
    instructions: 'Sit on machine. Extend legs fully, squeeze quads at the top, and return slowly.',
    alternativeName: 'Sissy Squats (Bodyweight)',
    alternativeInstruction: 'Hold onto a door frame, lean body backward while bending knees and pushing them forward, then pull yourself back up using quads.',
    equipmentRequired: 'gym'
  },
  {
    id: 'walking_lunges',
    name: 'Walking Lunges',
    muscleGroup: 'quads',
    category: 'Legs',
    defaultSets: 3,
    repsRange: { min: 10, max: 12 },
    instructions: 'Step forward, lowering back knee near floor. Press forward off rear leg to step through into next lunge.',
    alternativeName: 'Reverse Lunges (Bodyweight)',
    alternativeInstruction: 'Step backwards instead of walking, lowering hips and keeping front knee stable.',
    equipmentRequired: 'bodyweight'
  },
  {
    id: 'standing_calf_raise',
    name: 'Standing Dumbbell Calf Raise',
    muscleGroup: 'calves',
    category: 'Legs',
    defaultSets: 4,
    repsRange: { min: 12, max: 15 },
    instructions: 'Hold dumbbells at sides and perform standing calf raises, stretching fully at bottom and pausing at top.',
    alternativeName: 'Bodyweight Single-Leg Calf Raise',
    alternativeInstruction: 'Perform on step or floor using bodyweight, aiming for a deep burn.',
    equipmentRequired: 'dumbbell'
  }
];

export const DEFAULT_WORKOUT_SPLITS: Record<string, { name: string; category: 'Push' | 'Pull' | 'Legs'; exerciseIds: string[] }> = {
  push_a: {
    name: 'Push A',
    category: 'Push',
    exerciseIds: ['flat_bench_press', 'overhead_press', 'incline_db_press', 'lateral_raises', 'triceps_pushdown']
  },
  push_b: {
    name: 'Push B',
    category: 'Push',
    exerciseIds: ['incline_barbell_press', 'arnold_press', 'dips', 'cable_fly', 'overhead_triceps_ext']
  },
  pull_a: {
    name: 'Pull A',
    category: 'Pull',
    exerciseIds: ['deadlift', 'pull_ups', 'barbell_row', 'face_pulls', 'bicep_curl']
  },
  pull_b: {
    name: 'Pull B',
    category: 'Pull',
    exerciseIds: ['lat_pulldown', 'seated_cable_row', 'rear_delt_fly', 'hammer_curl', 'shrugs']
  },
  legs_a: {
    name: 'Legs A',
    category: 'Legs',
    exerciseIds: ['squats', 'romanian_deadlift', 'leg_press', 'calf_raises', 'leg_curl']
  },
  legs_b: {
    name: 'Legs B',
    category: 'Legs',
    exerciseIds: ['front_squat', 'hip_thrust', 'leg_extension', 'walking_lunges', 'standing_calf_raise']
  }
};

export function getInitialWorkoutSplit(): WorkoutDay[] {
  return Object.entries(DEFAULT_WORKOUT_SPLITS).map(([id, split]) => {
    const exercises = split.exerciseIds
      .map(id => MASTER_EXERCISES.find(e => e.id === id))
      .filter((e): e is Exercise => e !== undefined);

    return {
      id,
      name: split.name,
      category: split.category,
      exercises
    };
  });
}
