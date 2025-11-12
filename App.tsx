
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { HealthPlan, SavedPlan, BaseHealthPlan, DietPlan as TrackableDietPlan, Exercise as TrackableExercise } from './types';
import { getHealthPlan, getQuickTip } from './services/geminiService';
import SearchInput from './components/SearchInput';
import ResultCard from './components/ResultCard';
import LoadingSpinner from './components/LoadingSpinner';

const exerciseIconMap: Record<string, React.ReactElement> = {
    cardio: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-red-400">
            <path className="animate-beat" strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
    ),
    strength: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-sky-400">
            <g className="animate-lift">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18.75V15.25" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.75V15.25" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 15.25H20.25" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 11.5H6.25" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.75 11.5H20.25" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 11.5H15" />
            </g>
        </svg>
    ),
    flexibility: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-yellow-400">
             <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a2.25 2.25 0 110-4.5 2.25 2.25 0 010 4.5z" />
             <g className="animate-stretch">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L12 21" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14.75L16 18.75" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L8 13.75" />
             </g>
        </svg>
    ),
    default: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-slate-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
    ),
};

const mealIconMap: Record<string, React.ReactElement> = {
    breakfast: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-yellow-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
    ),
    lunch: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-orange-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.362-3.797z" />
        </svg>
    ),
    dinner: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
    ),
    snacks: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-pink-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.543l.227 1.061.227-1.061a3.003 3.003 0 00-2.022-2.022l-1.06-.227 1.06-.227a3.003 3.003 0 002.022-2.022l.227-1.06-.227 1.06a3.003 3.003 0 002.022 2.022l1.06.227-1.06.227a3.003 3.003 0 00-2.022 2.022z" />
        </svg>
    ),
};

const getDetailedExerciseAnimation = (type: string) => {
    const key = type.toLowerCase();
    const commonProps = {
        stroke: "currentColor",
        strokeWidth: "4",
        strokeLinecap: "round" as const,
        fill: "none",
    };
    switch (key) {
        case 'cardio':
            return (
                <svg viewBox="0 0 100 100" className="w-24 h-24 text-red-400">
                    <g className="animate-run-body" style={{ transformOrigin: 'center' }}>
                        <g className="animate-run-arm-back" style={{ transformOrigin: '50px 38px' }}>
                            <line x1="50" y1="38" x2="35" y2="52" {...commonProps} />
                        </g>
                        <g className="animate-run-leg-back" style={{ transformOrigin: '50px 60px' }}>
                            <line x1="50" y1="60" x2="60" y2="80" {...commonProps} />
                        </g>
                        <circle cx="50" cy="25" r="8" {...commonProps}/>
                        <line x1="50" y1="33" x2="50" y2="60" {...commonProps}/>
                        <g className="animate-run-leg-front" style={{ transformOrigin: '50px 60px' }}>
                            <line x1="50" y1="60" x2="40" y2="85" {...commonProps}/>
                        </g>
                        <g className="animate-run-arm-front" style={{ transformOrigin: '50px 38px' }}>
                            <line x1="50" y1="38" x2="65" y2="52" {...commonProps}/>
                        </g>
                    </g>
                </svg>
            );
        case 'strength':
            return (
                <svg viewBox="0 0 100 100" className="w-24 h-24 text-sky-400">
                    <circle cx="50" cy="20" r="8" {...commonProps}/>
                    <line x1="50" y1="28" x2="50" y2="55" {...commonProps}/>
                    <line x1="50" y1="55" x2="40" y2="85" {...commonProps}/>
                    <line x1="50" y1="55" x2="60" y2="85" {...commonProps}/>
                    <line x1="50" y1="38" x2="35" y2="55" {...commonProps}/>
                    <g style={{ transformOrigin: '65px 38px' }} className="animate-curl-animation">
                        <line x1="65" y1="38" x2="65" y2="58" {...commonProps}/>
                        <rect x="58" y="58" width="14" height="8" fill="currentColor" rx="3"/>
                    </g>
                    <line x1="50" y1="38" x2="65" y2="38" {...commonProps}/>
                </svg>
            );
        case 'flexibility':
            return (
                 <svg viewBox="0 0 100 100" className="w-24 h-24 text-yellow-400">
                    <line x1="35" y1="90" x2="65" y2="90" {...commonProps} strokeWidth="2"/>
                    <line x1="50" y1="90" x2="50" y2="60" {...commonProps}/>
                    <line x1="50" y1="60" x2="70" y2="90" {...commonProps}/>
                    <g style={{ transformOrigin: '50px 60px' }} className="animate-stretch-animation">
                        <line x1="50" y1="60" x2="50" y2="33" {...commonProps}/>
                        <circle cx="50" cy="25" r="8" {...commonProps}/>
                        <line x1="50" y1="40" x2="75" y2="55" {...commonProps}/>
                    </g>
                </svg>
            );
        default:
            return null;
    }
}

const getExerciseIcon = (type: string) => {
    const key = type.toLowerCase();
    if (key in exerciseIconMap) return exerciseIconMap[key];
    return exerciseIconMap.default;
};

const convertToTrackablePlan = (basePlan: BaseHealthPlan): HealthPlan => {
    const trackableDietPlan: TrackableDietPlan = {
        breakfast: basePlan.dietPlan.breakfast.map(text => ({ text, completed: false })),
        lunch: basePlan.dietPlan.lunch.map(text => ({ text, completed: false })),
        dinner: basePlan.dietPlan.dinner.map(text => ({ text, completed: false })),
        snacks: basePlan.dietPlan.snacks?.map(text => ({ text, completed: false })),
    };
    const trackableExercisePlan: TrackableExercise[] = basePlan.exercisePlan.map(ex => ({ ...ex, completed: false }));
    return {
        ...basePlan,
        dietPlan: trackableDietPlan,
        exercisePlan: trackableExercisePlan,
    };
};

const App: React.FC = () => {
    const [query, setQuery] = useState<string>('');
    const [submittedQuery, setSubmittedQuery] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [healthPlan, setHealthPlan] = useState<HealthPlan | null>(null);
    const [quickTip, setQuickTip] = useState<string | null>(null);
    const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
    const [activePlanId, setActivePlanId] = useState<string | null>(null);
    const [hoveredExerciseIndex, setHoveredExerciseIndex] = useState<number | null>(null);


    useEffect(() => {
        try {
            const storedPlans = localStorage.getItem('healthPlans');
            if (storedPlans) {
                setSavedPlans(JSON.parse(storedPlans));
            }
        } catch (e) {
            console.error("Failed to parse saved plans from localStorage", e);
        }
    }, []);

    const updateSavedPlan = useCallback((updatedPlan: HealthPlan) => {
        if (activePlanId) {
            const updatedPlans = savedPlans.map(p => 
                p.id === activePlanId ? { ...p, plan: updatedPlan } : p
            );
            setSavedPlans(updatedPlans);
            localStorage.setItem('healthPlans', JSON.stringify(updatedPlans));
        }
    }, [activePlanId, savedPlans]);

    const handleToggleDietItem = (meal: keyof TrackableDietPlan, index: number) => {
        if (!healthPlan) return;
        const newPlan = { ...healthPlan };
        const mealItems = [...newPlan.dietPlan[meal]!];
        mealItems[index] = { ...mealItems[index], completed: !mealItems[index].completed };
        (newPlan.dietPlan[meal] as any) = mealItems;
        setHealthPlan(newPlan);
        updateSavedPlan(newPlan);
    };

    const handleToggleExercise = (index: number) => {
        if (!healthPlan) return;
        const newPlan = { ...healthPlan };
        const newExercises = [...newPlan.exercisePlan];
        newExercises[index] = { ...newExercises[index], completed: !newExercises[index].completed };
        newPlan.exercisePlan = newExercises;
        setHealthPlan(newPlan);
        updateSavedPlan(newPlan);
    };

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError(null);
        setHealthPlan(null);
        setQuickTip(null);
        setActivePlanId(null);
        setSubmittedQuery(query);

        try {
            const [planResponse, tipResponse] = await Promise.all([
                getHealthPlan(query),
                getQuickTip(query)
            ]);
            
            setHealthPlan(convertToTrackablePlan(planResponse.plan));
            setQuickTip(tipResponse);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [query]);

    const handleSavePlan = () => {
        if (!healthPlan) return;
        const newSavedPlan: SavedPlan = {
            id: crypto.randomUUID(),
            query: submittedQuery,
            plan: healthPlan,
            savedAt: new Date().toISOString(),
        };
        const updatedPlans = [...savedPlans, newSavedPlan];
        setSavedPlans(updatedPlans);
        localStorage.setItem('healthPlans', JSON.stringify(updatedPlans));
        setActivePlanId(newSavedPlan.id);
    };

    const handleLoadPlan = (id: string) => {
        const planToLoad = savedPlans.find(p => p.id === id);
        if (planToLoad) {
            setHealthPlan(planToLoad.plan);
            setSubmittedQuery(planToLoad.query);
            setActivePlanId(planToLoad.id);
            setQuickTip(null);
            setError(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    
    const handleDeletePlan = (id: string) => {
        const updatedPlans = savedPlans.filter(p => p.id !== id);
        setSavedPlans(updatedPlans);
        localStorage.setItem('healthPlans', JSON.stringify(updatedPlans));
        if (activePlanId === id) {
            setActivePlanId(null);
            setHealthPlan(null);
            setSubmittedQuery('');
        }
    };

    const progress = useMemo(() => {
        if (!healthPlan) return { diet: { completed: 0, total: 0 }, exercise: { completed: 0, total: 0 } };
        const dietItems = [
            ...healthPlan.dietPlan.breakfast,
            ...healthPlan.dietPlan.lunch,
            ...healthPlan.dietPlan.dinner,
            ...(healthPlan.dietPlan.snacks || []),
        ];
        const dietCompleted = dietItems.filter(item => item.completed).length;
        const dietTotal = dietItems.length;

        const exerciseCompleted = healthPlan.exercisePlan.filter(ex => ex.completed).length;
        const exerciseTotal = healthPlan.exercisePlan.length;

        return {
            diet: { completed: dietCompleted, total: dietTotal },
            exercise: { completed: exerciseCompleted, total: exerciseTotal },
        };
    }, [healthPlan]);

    const renderProgress = (completed: number, total: number, color: string) => (
        <div className="mb-4">
            <div className="flex justify-between items-center text-sm text-slate-400 mb-1">
                <span>Progress</span>
                <span>{completed} / {total}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
                <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: total > 0 ? `${(completed / total) * 100}%` : '0%' }}></div>
            </div>
        </div>
    );
    
    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">
                <header className="text-center mb-10">
                    <div className="flex justify-center items-center gap-4 mb-4">
                        <svg className="w-12 h-12 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 12.75h9" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v9" />
                        </svg>
                        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-green-400 to-sky-400 text-transparent bg-clip-text">
                            AI Health Doctor
                        </h1>
                    </div>
                    <p className="text-slate-400 text-lg">
                        Your personal AI companion for a healthier lifestyle.
                    </p>
                </header>

                <main>
                    <SearchInput
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onSubmit={handleSubmit}
                        isLoading={isLoading}
                    />

                    {isLoading && <LoadingSpinner />}
                    
                    {error && (
                        <div className="mt-8 bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center">
                            <p className="font-semibold">Oops! Something went wrong.</p>
                            <p>{error}</p>
                        </div>
                    )}
                    
                    {!isLoading && !error && (
                        <div className="mt-8 space-y-8">
                            {quickTip && (
                                <div className="bg-sky-900/50 border border-sky-700 p-5 rounded-xl shadow-lg animate-fade-in">
                                     <h2 className="text-xl font-semibold text-sky-300 mb-2 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311a15.045 15.045 0 01-7.5 0C4.508 19.64 2.25 15.184 2.25 10.5 2.25 5.86 6.31 2 11.25 2c4.94 0 9 3.86 9 8.5 0 4.684-2.258 9.14-5.25 11.462z" /></svg>
                                        Quick Tip
                                    </h2>
                                    <p className="text-slate-300">{quickTip}</p>
                                </div>
                            )}

                            {healthPlan && (
                                <>
                                    <div className="text-center animate-fade-in mb-4 flex justify-center items-center gap-4">
                                        <p className="text-slate-400">
                                            Showing plan for: <span className="font-semibold text-slate-200">"{submittedQuery}"</span>
                                        </p>
                                        <button 
                                            onClick={handleSavePlan}
                                            disabled={!!activePlanId}
                                            className="px-4 py-2 text-sm bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300"
                                        >
                                            {activePlanId ? 'Saved' : 'Save Plan'}
                                        </button>
                                    </div>
                                    <ResultCard title="General Advice" icon="info">
                                        <ul className="space-y-3 list-disc list-inside text-slate-300">
                                            {healthPlan.advice.map((item, index) => <li key={index}>{item}</li>)}
                                        </ul>
                                    </ResultCard>

                                    <ResultCard title="Diet Plan" icon="diet">
                                        {renderProgress(progress.diet.completed, progress.diet.total, 'bg-green-500')}
                                        <div className="space-y-4">
                                            {(Object.keys(healthPlan.dietPlan) as Array<keyof TrackableDietPlan>).map(mealKey => {
                                                const items = healthPlan.dietPlan[mealKey];
                                                if (!items || items.length === 0) return null;
                                                return (
                                                    <div key={mealKey}>
                                                        <h4 className="font-semibold text-green-400 mb-2 capitalize flex items-center">
                                                            {mealIconMap[mealKey]}
                                                            {mealKey}
                                                        </h4>
                                                        <ul className="space-y-2 list-none text-slate-300 pl-2">
                                                            {items.map((item, index) => (
                                                                <li key={index} className="flex items-center">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        id={`${mealKey}-${index}`}
                                                                        checked={item.completed} 
                                                                        onChange={() => handleToggleDietItem(mealKey, index)}
                                                                        className="h-4 w-4 mr-3 rounded bg-slate-700 border-slate-500 text-green-500 focus:ring-green-500"
                                                                    />
                                                                    <label htmlFor={`${mealKey}-${index}`} className={`cursor-pointer ${item.completed ? 'line-through text-slate-500' : ''}`}>{item.text}</label>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </ResultCard>

                                    <ResultCard title="Exercise Plan" icon="exercise">
                                        {renderProgress(progress.exercise.completed, progress.exercise.total, 'bg-orange-500')}
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="text-slate-400 border-b border-slate-700">
                                                    <tr>
                                                        <th className="p-3 w-8">Done</th>
                                                        <th className="p-3">Exercise</th>
                                                        <th className="p-3">Duration/Sets</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {healthPlan.exercisePlan.map((ex, index) => (
                                                        <React.Fragment key={index}>
                                                            <tr 
                                                                onMouseEnter={() => setHoveredExerciseIndex(index)}
                                                                onMouseLeave={() => setHoveredExerciseIndex(null)}
                                                                className={`border-b border-slate-800 transition-colors duration-300 cursor-pointer ${ex.completed ? 'bg-slate-800/30' : 'hover:bg-slate-800/50'}`}
                                                            >
                                                                <td className="p-3 text-center">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        checked={ex.completed}
                                                                        onChange={() => handleToggleExercise(index)}
                                                                        className="h-4 w-4 rounded bg-slate-700 border-slate-500 text-orange-500 focus:ring-orange-500"
                                                                    />
                                                                </td>
                                                                <td className={`p-3 font-medium ${ex.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                                                    <div className="flex items-center gap-3">
                                                                        {getExerciseIcon(ex.type)}
                                                                        <span>{ex.name}</span>
                                                                    </div>
                                                                </td>
                                                                <td className={`p-3 ${ex.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>{ex.duration || ex.sets || 'N/A'}</td>
                                                            </tr>
                                                            {hoveredExerciseIndex === index && (
                                                                <tr className="bg-slate-800/50">
                                                                    <td colSpan={3} className="p-4 transition-all duration-300 ease-in-out">
                                                                        <div className="flex items-center gap-6 animate-fade-in">
                                                                            <div className="w-24 h-24 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                                {getDetailedExerciseAnimation(ex.type)}
                                                                            </div>
                                                                            <p className="text-slate-300 flex-1">{ex.description}</p>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </ResultCard>
                                </>
                            )}
                        </div>
                    )}
                    
                    {savedPlans.length > 0 && (
                        <div className="mt-12">
                             <ResultCard title="Saved Plans" icon="info">
                                 <div className="space-y-3">
                                     {savedPlans.map(p => (
                                         <div key={p.id} className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg">
                                             <div>
                                                 <p className="font-semibold text-slate-200">{p.query}</p>
                                                 <p className="text-xs text-slate-400">Saved on {new Date(p.savedAt).toLocaleString()}</p>
                                             </div>
                                             <div className="flex gap-2">
                                                 <button onClick={() => handleLoadPlan(p.id)} className="px-3 py-1 text-sm bg-green-600 rounded hover:bg-green-700 transition">Load</button>
                                                 <button onClick={() => handleDeletePlan(p.id)} className="px-3 py-1 text-sm bg-red-600 rounded hover:bg-red-700 transition">Delete</button>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                            </ResultCard>
                        </div>
                    )}

                    {!isLoading && !healthPlan && savedPlans.length === 0 && (
                        <div className="text-center text-slate-500 pt-16">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" className="w-24 h-24 mx-auto mb-4 text-slate-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                            </svg>
                            <h3 className="text-2xl font-semibold text-slate-400 mb-2">Ready to start your health journey?</h3>
                            <p className="max-w-md mx-auto">Enter a health concern or goal above to get your personalized AI-generated plan.</p>
                            <p className="text-sm mt-4">e.g., "how to build muscle" or "diet for a healthy heart"</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default App;