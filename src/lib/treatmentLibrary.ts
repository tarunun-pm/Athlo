export interface TreatmentItem {
  id: string;
  name: string;
  force?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  mechanic?: string;
  equipment?: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
}

export interface PrescribedTreatment {
  treatmentId: string;
  item: TreatmentItem;
  prescription: {
    type: 'sets_reps' | 'duration' | 'hold_duration' | 'cycles';
    sets?: number;
    reps?: number;
    durationMinutes?: number;
    holdSeconds?: number;
    cycles?: number;
    referenceLink?: string; // e.g., YouTube or PDF link
  };
}

let cachedLibrary: TreatmentItem[] | null = null;

export async function fetchTreatmentLibrary(): Promise<TreatmentItem[]> {
  if (cachedLibrary) {
    return cachedLibrary;
  }

  try {
    // Fetch both datasets concurrently
    const [exercisesRes, customRes] = await Promise.all([
      fetch('/data/exercises.json'),
      fetch('/data/customTreatments.json')
    ]);

    if (!exercisesRes.ok || !customRes.ok) {
      throw new Error('Failed to fetch treatment data');
    }

    const exercises: TreatmentItem[] = await exercisesRes.json();
    const custom: TreatmentItem[] = await customRes.json();

    // Map free-exercise-db images to the raw github content URL since we aren't bundling 800 folders of images
    const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
    
    const formattedExercises = exercises.map(ex => ({
      ...ex,
      images: ex.images.map(imgPath => `${GITHUB_RAW_BASE}${imgPath}`)
    }));

    cachedLibrary = [...formattedExercises, ...custom];
    return cachedLibrary;
  } catch (error) {
    console.error('Error loading library:', error);
    return [];
  }
}

export function searchTreatments(
  library: TreatmentItem[], 
  query: string, 
  categoryFilter?: string,
  muscleFilter?: string
): TreatmentItem[] {
  return library.filter(item => {
    // 1. Text Search
    if (query && !item.name.toLowerCase().includes(query.toLowerCase())) {
       return false;
    }
    // 2. Category Filter
    if (categoryFilter && item.category !== categoryFilter) {
       return false;
    }
    // 3. Muscle Filter
    if (muscleFilter) {
       const targets = [...item.primaryMuscles, ...item.secondaryMuscles];
       if (!targets.some(m => m.toLowerCase() === muscleFilter.toLowerCase())) {
          return false;
       }
    }
    return true;
  });
}

// Get unique lists for dropdown filters
export function getLibraryFilters(library: TreatmentItem[]) {
  const categories = new Set<string>();
  const muscles = new Set<string>();
  
  library.forEach(item => {
    if (item.category) categories.add(item.category);
    item.primaryMuscles.forEach(m => muscles.add(m));
  });

  return {
    categories: Array.from(categories).sort(),
    muscles: Array.from(muscles).sort()
  };
}
