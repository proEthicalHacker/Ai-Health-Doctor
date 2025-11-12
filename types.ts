
// Base types returned by the AI service
export interface BaseDietPlan {
  breakfast: string[];
  lunch: string[];
  dinner: string[];
  snacks?: string[];
}

export interface BaseExercise {
  name: string;
  description: string;
  type: string;
  duration?: string;
  sets?: string;
}

export interface BaseHealthPlan {
  advice: string[];
  dietPlan: BaseDietPlan;
  exercisePlan: BaseExercise[];
}

// Trackable types used in the app state and for storage
export interface DietItem {
    text: string;
    completed: boolean;
}

export interface DietPlan {
  breakfast: DietItem[];
  lunch: DietItem[];
  dinner: DietItem[];
  snacks?: DietItem[];
}

export interface Exercise extends BaseExercise {
    completed: boolean;
}

export interface HealthPlan {
  advice: string[];
  dietPlan: DietPlan;
  exercisePlan: Exercise[];
}

export interface SavedPlan {
  id: string;
  query: string;
  plan: HealthPlan;
  savedAt: string;
}


export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}
