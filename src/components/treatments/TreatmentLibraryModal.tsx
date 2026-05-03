'use client';

import { useState, useEffect } from 'react';
import { X, Search, Filter, Plus, ArrowLeft, Link as LinkIcon, Clock, Activity, Dumbbell } from 'lucide-react';
import { fetchTreatmentLibrary, searchTreatments, getLibraryFilters, TreatmentItem, PrescribedTreatment } from '@/lib/treatmentLibrary';

interface TreatmentLibraryModalProps {
  onClose: () => void;
  onAdd: (prescription: PrescribedTreatment) => void;
}

export default function TreatmentLibraryModal({ onClose, onAdd }: TreatmentLibraryModalProps) {
  const [library, setLibrary] = useState<TreatmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('');
  
  // Available filter options
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableMuscles, setAvailableMuscles] = useState<string[]>([]);

  // Selection state
  const [selectedItem, setSelectedItem] = useState<TreatmentItem | null>(null);

  // Prescription Form State
  const [prescType, setPrescType] = useState<'sets_reps' | 'duration' | 'hold_duration' | 'cycles'>('sets_reps');
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [holdSeconds, setHoldSeconds] = useState(30);
  const [cycles, setCycles] = useState(3);
  const [referenceLink, setReferenceLink] = useState('');

  useEffect(() => {
    async function load() {
      const data = await fetchTreatmentLibrary();
      setLibrary(data);
      const filters = getLibraryFilters(data);
      setAvailableCategories(filters.categories);
      setAvailableMuscles(filters.muscles);
      setLoading(false);
    }
    load();
  }, []);

  const filteredLibrary = searchTreatments(library, searchQuery, categoryFilter, muscleFilter);

  // Default prescription type based on category
  const handleSelect = (item: TreatmentItem) => {
    setSelectedItem(item);
    if (item.category === 'thermotherapy' || item.category === 'cryotherapy' || item.category === 'electrotherapy') {
      setPrescType('duration');
    } else if (item.category === 'stretching') {
      setPrescType('hold_duration');
    } else {
      setPrescType('sets_reps');
    }
  };

  const handleAdd = () => {
    if (!selectedItem) return;

    onAdd({
      treatmentId: selectedItem.id,
      item: selectedItem,
      prescription: {
        type: prescType,
        sets: prescType === 'sets_reps' ? sets : undefined,
        reps: prescType === 'sets_reps' ? reps : undefined,
        durationMinutes: prescType === 'duration' ? durationMinutes : undefined,
        holdSeconds: prescType === 'hold_duration' ? holdSeconds : undefined,
        cycles: prescType === 'cycles' ? cycles : undefined,
        referenceLink: referenceLink.trim() || undefined
      }
    });
    
    // Close after adding so they can see it in their plan, or keep open if they want to add more?
    // Let's keep it open but reset selection so they can add multiple.
    setSelectedItem(null);
    setReferenceLink('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 md:p-6 lg:p-8">
      <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border/50 flex justify-between items-center bg-surface shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Dumbbell className="text-primary" size={24} /> Treatment Library
          </h2>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : selectedItem ? (
          // CONFIGURE PRESCRIPTION VIEW
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Left: Item Details */}
            <div className="md:w-1/2 p-6 border-r border-border/50 overflow-y-auto bg-background/30">
              <button 
                onClick={() => setSelectedItem(null)} 
                className="flex items-center gap-2 text-sm text-text-muted hover:text-white mb-6 transition-colors"
              >
                <ArrowLeft size={16} /> Back to Library
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2.5 py-1 rounded bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                  {selectedItem.category}
                </span>
                <span className="px-2.5 py-1 rounded bg-white/10 text-text-secondary text-xs uppercase tracking-wider">
                  {selectedItem.level}
                </span>
              </div>

              <h3 className="text-3xl font-syne font-bold text-white mb-6 leading-tight">{selectedItem.name}</h3>
              
              {selectedItem.images && selectedItem.images.length > 0 && (
                <div className="mb-6 grid grid-cols-2 gap-4">
                  {selectedItem.images.slice(0, 2).map((img, idx) => (
                    <div key={idx} className="bg-white rounded-xl overflow-hidden aspect-square border border-border">
                      <img src={img} alt={`${selectedItem.name} - view ${idx+1}`} className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Activity size={16} className="text-primary" /> Target Muscles
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.primaryMuscles.map(m => (
                      <span key={m} className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-sm font-medium capitalize">{m}</span>
                    ))}
                    {selectedItem.secondaryMuscles.map(m => (
                      <span key={m} className="px-3 py-1.5 rounded-lg bg-surface border border-border text-text-secondary text-sm capitalize">{m}</span>
                    ))}
                  </div>
                </div>

                {selectedItem.equipment && selectedItem.equipment !== 'body only' && (
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-3">Equipment</h4>
                    <p className="text-text-secondary capitalize">{selectedItem.equipment}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-3">Instructions</h4>
                  <ol className="list-decimal list-outside ml-4 space-y-2 text-text-secondary text-sm leading-relaxed">
                    {selectedItem.instructions.map((step, idx) => (
                      <li key={idx} className="pl-2">{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            {/* Right: Prescription Form */}
            <div className="md:w-1/2 p-6 overflow-y-auto bg-surface flex flex-col">
              <h3 className="text-xl font-bold text-white mb-6">Prescribe Treatment</h3>
              
              <div className="space-y-6 flex-1">
                {/* Prescription Type */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-text-secondary">Prescription Format</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setPrescType('sets_reps')}
                      className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${prescType === 'sets_reps' ? 'bg-primary/10 border-primary text-white' : 'bg-background border-border text-text-muted hover:border-text-secondary'}`}
                    >
                      Sets & Reps
                    </button>
                    <button 
                      onClick={() => setPrescType('duration')}
                      className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${prescType === 'duration' ? 'bg-primary/10 border-primary text-white' : 'bg-background border-border text-text-muted hover:border-text-secondary'}`}
                    >
                      Duration (Mins)
                    </button>
                    <button 
                      onClick={() => setPrescType('hold_duration')}
                      className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${prescType === 'hold_duration' ? 'bg-primary/10 border-primary text-white' : 'bg-background border-border text-text-muted hover:border-text-secondary'}`}
                    >
                      Hold (Secs) x Reps
                    </button>
                    <button 
                      onClick={() => setPrescType('cycles')}
                      className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${prescType === 'cycles' ? 'bg-primary/10 border-primary text-white' : 'bg-background border-border text-text-muted hover:border-text-secondary'}`}
                    >
                      Cycles (Contrast/Cryo)
                    </button>
                  </div>
                </div>

                {/* Dynamic Inputs based on format */}
                <div className="p-5 bg-background border border-border/50 rounded-xl space-y-4">
                  {prescType === 'sets_reps' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase mb-2 block">Sets</label>
                        <input type="number" value={sets} onChange={e => setSets(Number(e.target.value))} min={1} className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-white" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase mb-2 block">Reps</label>
                        <input type="number" value={reps} onChange={e => setReps(Number(e.target.value))} min={1} className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-white" />
                      </div>
                    </div>
                  )}

                  {prescType === 'duration' && (
                    <div>
                      <label className="text-xs font-bold text-text-muted uppercase mb-2 block">Duration in Minutes</label>
                      <input type="number" value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))} min={1} className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-white" />
                    </div>
                  )}

                  {prescType === 'hold_duration' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase mb-2 block">Hold Seconds</label>
                        <input type="number" value={holdSeconds} onChange={e => setHoldSeconds(Number(e.target.value))} min={1} className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-white" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase mb-2 block">Reps</label>
                        <input type="number" value={reps} onChange={e => setReps(Number(e.target.value))} min={1} className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-white" />
                      </div>
                    </div>
                  )}
                  
                  {prescType === 'cycles' && (
                    <div>
                      <label className="text-xs font-bold text-text-muted uppercase mb-2 block">Number of Cycles</label>
                      <input type="number" value={cycles} onChange={e => setCycles(Number(e.target.value))} min={1} className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-white" />
                    </div>
                  )}
                </div>

                {/* Reference Link Input */}
                <div>
                  <label className="text-sm font-medium text-text-secondary flex items-center gap-2 mb-2">
                    <LinkIcon size={16} /> Optional Reference Link
                  </label>
                  <p className="text-xs text-text-muted mb-3">Add a YouTube video or PDF guide for the patient to reference.</p>
                  <input 
                    type="url" 
                    value={referenceLink} 
                    onChange={e => setReferenceLink(e.target.value)} 
                    placeholder="https://youtube.com/watch?v=..." 
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:border-primary outline-none transition-colors" 
                  />
                </div>
              </div>

              {/* Action */}
              <div className="pt-6 mt-6 border-t border-border/50">
                <button 
                  onClick={handleAdd}
                  className="w-full btn-primary py-4 font-bold text-base flex items-center justify-center gap-2"
                >
                  <Plus size={20} /> Add to Treatment Plan
                </button>
              </div>

            </div>
          </div>
        ) : (
          // BROWSE LIBRARY VIEW
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 md:px-6 bg-surface border-b border-border/50 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input 
                  type="text" 
                  placeholder="Search treatments by name..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:border-primary outline-none"
                />
              </div>
              <div className="flex gap-4">
                <select 
                  className="bg-background border border-border rounded-xl px-4 py-2.5 text-white text-sm outline-none w-40 capitalize"
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select 
                  className="bg-background border border-border rounded-xl px-4 py-2.5 text-white text-sm outline-none w-40 capitalize"
                  value={muscleFilter}
                  onChange={e => setMuscleFilter(e.target.value)}
                >
                  <option value="">All Muscles</option>
                  {availableMuscles.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-background/20">
              {filteredLibrary.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-text-muted">No treatments found matching your criteria.</p>
                  <button onClick={() => { setSearchQuery(''); setCategoryFilter(''); setMuscleFilter(''); }} className="mt-4 text-primary hover:underline text-sm font-medium">Clear Filters</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredLibrary.map(item => (
                    <button 
                      key={item.id} 
                      onClick={() => handleSelect(item)}
                      className="card bg-surface hover:border-primary/50 hover:bg-surface-hover text-left transition-all p-4 flex flex-col group h-full"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                        {item.images?.length > 0 && <Clock size={14} className="text-text-muted" />}
                      </div>
                      <h4 className="text-white font-bold leading-tight mb-2 group-hover:text-primary transition-colors">{item.name}</h4>
                      <div className="mt-auto pt-3 flex flex-wrap gap-1">
                        {item.primaryMuscles.slice(0, 2).map(m => (
                          <span key={m} className="text-[10px] text-text-secondary bg-background px-1.5 py-0.5 rounded border border-border/50 capitalize">
                            {m}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
