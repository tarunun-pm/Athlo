'use client';

import { useState } from 'react';
import { Loader2, Plus, Calendar } from 'lucide-react';
import TemplateEditor from './TemplateEditor';
import ScheduleSessionModal from './ScheduleSessionModal';
import BlockTimeModal from './BlockTimeModal';

export default function CalendarHeader({ physioId }: { physioId: string }) {
    const [showTemplateEditor, setShowTemplateEditor] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showBlockModal, setShowBlockModal] = useState(false);

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">My Calendar</h1>
                    <p className="text-text-secondary">Manage your schedule, private clients, and availability templates.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowTemplateEditor(true)}
                        className="btn-outline hover:bg-background/80 hover:text-white transition-colors flex items-center gap-2"
                    >
                        <Calendar size={16}/> Manage Weekly Template
                    </button>
                    <button 
                        onClick={() => setShowBlockModal(true)}
                        className="btn-outline border-error text-error hover:bg-error/10 hover:text-error transition-colors flex items-center gap-2"
                    >
                        Block Time
                    </button>
                    <button 
                        onClick={() => setShowScheduleModal(true)}
                        className="btn-primary shadow-glow flex items-center gap-2"
                    >
                        <Plus size={16}/> Add Session
                    </button>
                </div>
            </div>

            {showTemplateEditor && (
                <TemplateEditor physioId={physioId} onClose={() => setShowTemplateEditor(false)} />
            )}

            {showScheduleModal && (
                <ScheduleSessionModal 
                    physioId={physioId} 
                    onClose={() => {
                        setShowScheduleModal(false);
                        window.location.reload(); // Quick refresh for MVP
                    }} 
                />
            )}

            {showBlockModal && (
                <BlockTimeModal 
                    physioId={physioId} 
                    onClose={() => setShowBlockModal(false)} 
                />
            )}
        </>
    );
}
