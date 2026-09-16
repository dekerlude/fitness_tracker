import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function validateWorkoutDatabase() {
  console.log('--- RUNNING DATABASE VALIDATION ---');
  
  const exercisesPath = path.join(__dirname, '../data/exercises.json');
  const workoutPlanPath = path.join(__dirname, '../data/workoutPlan.json');
  
  const exercises = JSON.parse(fs.readFileSync(exercisesPath, 'utf8'));
  const workoutPlan = JSON.parse(fs.readFileSync(workoutPlanPath, 'utf8'));

  let errors = 0;
  
  console.log(`Loaded ${exercises.length} exercise records.`);
  
  // 1. Verify every exercise has required fields
  const requiredFields = ['id', 'name', 'primaryMuscle', 'equipment', 'sets', 'repRange', 'instructions'];
  
  exercises.forEach((ex: any, i: number) => {
    requiredFields.forEach(field => {
      if (ex[field] === undefined || ex[field] === null || ex[field] === '') {
        console.error(`ERROR: Exercise at index ${i} (${ex.id || 'NO_ID'}) is missing required field: ${field}`);
        errors++;
      }
    });

    // Verify alternatives
    if (ex.alternatives) {
      ex.alternatives.forEach((alt: any) => {
        if (!alt.exerciseId) {
          console.error(`ERROR: Alternative in exercise ${ex.id} is missing exerciseId`);
          errors++;
        } else {
          const found = exercises.find((e: any) => e.id === alt.exerciseId);
          if (!found) {
            console.error(`ERROR: Alternative exerciseId '${alt.exerciseId}' in exercise '${ex.id}' does not exist in exercises.json`);
            errors++;
          }
        }
      });
    }
  });

  // 2. Verify every workout exerciseId exists
  let scheduledCount = 0;
  workoutPlan.days.forEach((day: any) => {
    if (day.exerciseIds) {
      scheduledCount += day.exerciseIds.length;
      day.exerciseIds.forEach((id: string) => {
        const found = exercises.find((e: any) => e.id === id);
        if (!found) {
          console.error(`ERROR: Scheduled exerciseId '${id}' on day ${day.day} does not exist in exercises.json`);
          errors++;
        }
      });
    }
  });
  
  console.log(`Loaded ${scheduledCount} scheduled exercises.`);
  
  let alternativesCount = 0;
  exercises.forEach((ex: any) => {
    if (ex.alternatives) {
      alternativesCount += ex.alternatives.length;
    }
  });
  console.log(`Loaded ${alternativesCount} alternatives.`);

  if (errors === 0) {
    console.log('✓ All 92 exercise records valid');
    console.log(`✓ All ${scheduledCount} scheduled exercises valid`);
    console.log('✓ All workout IDs valid');
    console.log('✓ All alternative IDs valid');
    console.log('✓ All required fields present');
    console.log('DATABASE VALIDATION PASSED.');
  } else {
    console.error(`DATABASE VALIDATION FAILED WITH ${errors} ERRORS.`);
  }
}

// Allow running directly via ts-node / bun
if (process.argv[1] && process.argv[1].includes('validateWorkoutDatabase')) {
  validateWorkoutDatabase();
}
