'use client';

import React, { useState } from 'react';

type MuscleGroup = {
    id: string;
    label: string;
    points: string;
    view: 'front' | 'back';
};

const muscles: MuscleGroup[] = [
    // --- FRONT VIEW ---
    // Upper Body
    { id: 'Trapezius (Upper)', label: 'Trapezius (Upper)', view: 'front', points: '120,45 150,55 120,70' },
    { id: 'Trapezius (Upper)', label: 'Trapezius (Upper)', view: 'front', points: '80,45 50,55 80,70' },
    
    { id: 'Deltoid (Anterior)', label: 'Anterior Deltoid', view: 'front', points: '145,55 165,70 155,95 140,80' },
    { id: 'Deltoid (Anterior)', label: 'Anterior Deltoid', view: 'front', points: '55,55 35,70 45,95 60,80' },

    { id: 'Pectoralis Major', label: 'Pectoralis Major', view: 'front', points: '100,65 135,65 140,85 130,105 100,100' },
    { id: 'Pectoralis Major', label: 'Pectoralis Major', view: 'front', points: '100,65 65,65 60,85 70,105 100,100' },

    // Core
    { id: 'Rectus Abdominis', label: 'Rectus Abdominis', view: 'front', points: '100,100 120,105 115,160 100,165 85,160 80,105' },
    { id: 'External Oblique', label: 'External Oblique', view: 'front', points: '120,105 135,110 130,150 115,160' },
    { id: 'External Oblique', label: 'External Oblique', view: 'front', points: '80,105 65,110 70,150 85,160' },

    // Arms
    { id: 'Biceps Brachii', label: 'Biceps Brachii', view: 'front', points: '140,80 155,95 150,135 135,125' },
    { id: 'Biceps Brachii', label: 'Biceps Brachii', view: 'front', points: '60,80 45,95 50,135 65,125' },
    
    { id: 'Brachioradialis', label: 'Brachioradialis', view: 'front', points: '150,135 165,160 155,185 145,165' },
    { id: 'Brachioradialis', label: 'Brachioradialis', view: 'front', points: '50,135 35,160 45,185 55,165' },

    // Lower Body
    { id: 'Rectus Femoris', label: 'Rectus Femoris (Quad)', view: 'front', points: '105,170 125,170 120,240 105,250' },
    { id: 'Rectus Femoris', label: 'Rectus Femoris (Quad)', view: 'front', points: '95,170 75,170 80,240 95,250' },

    { id: 'Vastus Lateralis', label: 'Vastus Lateralis (Quad)', view: 'front', points: '125,170 140,195 130,245 120,240' },
    { id: 'Vastus Lateralis', label: 'Vastus Lateralis (Quad)', view: 'front', points: '75,170 60,195 70,245 80,240' },
    
    { id: 'Vastus Medialis', label: 'Vastus Medialis (Quad)', view: 'front', points: '105,210 120,240 105,250' },
    { id: 'Vastus Medialis', label: 'Vastus Medialis (Quad)', view: 'front', points: '95,210 80,240 95,250' },

    { id: 'Tibialis Anterior', label: 'Tibialis Anterior', view: 'front', points: '105,265 120,265 115,330 105,340' },
    { id: 'Tibialis Anterior', label: 'Tibialis Anterior', view: 'front', points: '95,265 80,265 85,330 95,340' },

    { id: 'Gastrocnemius', label: 'Gastrocnemius (Calf)', view: 'front', points: '120,265 135,285 125,315 115,310' },
    { id: 'Gastrocnemius', label: 'Gastrocnemius (Calf)', view: 'front', points: '80,265 65,285 75,315 85,310' },


    // --- BACK VIEW ---
    // Upper Body
    { id: 'Trapezius (Mid/Lower)', label: 'Trapezius', view: 'back', points: '100,60 125,65 100,110 75,65' },
    
    { id: 'Deltoid (Posterior)', label: 'Posterior Deltoid', view: 'back', points: '145,55 165,70 155,95 140,80' },
    { id: 'Deltoid (Posterior)', label: 'Posterior Deltoid', view: 'back', points: '55,55 35,70 45,95 60,80' },

    { id: 'Latissimus Dorsi', label: 'Latissimus Dorsi', view: 'back', points: '100,110 125,65 140,105 115,150 100,150' },
    { id: 'Latissimus Dorsi', label: 'Latissimus Dorsi', view: 'back', points: '100,110 75,65 60,105 85,150 100,150' },

    { id: 'Erector Spinae', label: 'Lower Back', view: 'back', points: '100,110 115,150 100,165 85,150' },

    // Arms
    { id: 'Triceps Brachii', label: 'Triceps Brachii', view: 'back', points: '140,80 155,95 150,135 135,125' },
    { id: 'Triceps Brachii', label: 'Triceps Brachii', view: 'back', points: '60,80 45,95 50,135 65,125' },

    { id: 'Forearm Extensors', label: 'Forearm Extensors', view: 'back', points: '150,135 165,160 155,185 145,165' },
    { id: 'Forearm Extensors', label: 'Forearm Extensors', view: 'back', points: '50,135 35,160 45,185 55,165' },

    // Lower Body
    { id: 'Gluteus Maximus', label: 'Gluteus Maximus', view: 'back', points: '100,160 130,165 135,200 105,205' },
    { id: 'Gluteus Maximus', label: 'Gluteus Maximus', view: 'back', points: '100,160 70,165 65,200 95,205' },

    { id: 'Biceps Femoris', label: 'Hamstrings', view: 'back', points: '105,205 130,200 125,250 105,245' },
    { id: 'Biceps Femoris', label: 'Hamstrings', view: 'back', points: '95,205 70,200 75,250 95,245' },

    { id: 'Gastrocnemius', label: 'Calves', view: 'back', points: '105,255 130,265 125,310 110,335 105,330' },
    { id: 'Gastrocnemius', label: 'Calves', view: 'back', points: '95,255 70,265 75,310 90,335 95,330' },
];

// Head and Joints (Visual only)
const staticShapes = [
    { view: 'front', points: '100,10 115,10 120,25 110,45 100,50 90,45 80,25 85,10' }, // Head Front
    { view: 'back', points: '100,10 115,10 120,25 110,45 100,50 90,45 80,25 85,10' }, // Head Back
    { view: 'front', points: '105,250 120,240 120,265 105,265' }, // Knee Left
    { view: 'front', points: '95,250 80,240 80,265 95,265' }, // Knee Right
    { view: 'back', points: '105,245 125,250 130,265 105,255' }, // Back Knee L
    { view: 'back', points: '95,245 75,250 70,265 95,255' }, // Back Knee R
];

interface DetailedMuscleMapProps {
    onSelectMuscle: (muscle: string) => void;
    selectedMuscle?: string;
}

export default function DetailedMuscleMap({ onSelectMuscle, selectedMuscle }: DetailedMuscleMapProps) {
    const [view, setView] = useState<'front' | 'back'>('front');
    const [hovered, setHovered] = useState<string | null>(null);

    const activeMuscles = muscles.filter((m) => m.view === view);
    const activeStatic = staticShapes.filter((s) => s.view === view);

    return (
        <div className="flex flex-col items-center">
            
            <div className="flex bg-surface rounded-full p-1 mb-4 shadow-sm border border-border">
                <button 
                    onClick={() => setView('front')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${view === 'front' ? 'bg-primary text-white shadow-glow' : 'text-text-muted hover:text-white'}`}
                >
                    Anterior (Front)
                </button>
                <button 
                    onClick={() => setView('back')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${view === 'back' ? 'bg-primary text-white shadow-glow' : 'text-text-muted hover:text-white'}`}
                >
                    Posterior (Back)
                </button>
            </div>

            <div className="relative w-64 h-96">
                <svg viewBox="0 0 200 360" className="w-full h-full drop-shadow-[0_0_15px_rgba(37,99,235,0.1)]">
                    
                    {/* Render static joints/head */}
                    {activeStatic.map((shape, idx) => (
                        <polygon 
                            key={`static-${idx}`} 
                            points={shape.points} 
                            fill="#1e222b" 
                            stroke="#2d3342" 
                            strokeWidth="1" 
                        />
                    ))}

                    {/* Render clickable muscles */}
                    {activeMuscles.map((muscle, idx) => {
                        const isSelected = selectedMuscle === muscle.label;
                        const isHovered = hovered === muscle.label;

                        return (
                            <polygon
                                key={`${muscle.id}-${idx}`}
                                points={muscle.points}
                                fill={isSelected ? '#2563eb' : isHovered ? '#3b82f6' : '#2A303C'}
                                stroke={isSelected ? '#60a5fa' : '#3d4451'}
                                strokeWidth={isSelected ? "1.5" : "1"}
                                className="transition-all duration-200 cursor-pointer"
                                onMouseEnter={() => setHovered(muscle.label)}
                                onMouseLeave={() => setHovered(null)}
                                onClick={() => onSelectMuscle(muscle.label)}
                            />
                        );
                    })}
                </svg>

                {/* Hover Tooltip Overlay */}
                {hovered && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#121417]/90 backdrop-blur-md border border-primary/30 text-white text-xs font-bold px-3 py-1.5 rounded-full pointer-events-none shadow-glow animate-in fade-in zoom-in duration-200">
                        {hovered}
                    </div>
                )}
            </div>
            
            <div className="mt-4 text-center">
                <span className="text-xs text-text-muted uppercase tracking-widest font-bold">Selected Region</span>
                <div className="text-primary font-syne font-bold text-lg mt-1">
                    {selectedMuscle || 'None Selected'}
                </div>
            </div>

        </div>
    );
}
