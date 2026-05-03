'use client';

import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import BodySilhouette from './BodySilhouette';

interface ReportProps {
    caseFile: any;
    treatmentPlans: any[];
    sessionNotes: any[];
    progressEntries: any[];
    milestones: any[];
}

export default function CaseReportGenerator({
    caseFile,
    treatmentPlans,
    sessionNotes,
    progressEntries,
    milestones,
}: ReportProps) {
    const reportRef = useRef<HTMLDivElement>(null);
    const [generating, setGenerating] = useState(false);

    const athlete = caseFile.athlete_profiles || {};
    const physio = caseFile.physio_profiles || {};
    const plan = treatmentPlans?.[0];
    const exercises: any[] = plan?.exercises || [];

    // Pain trend data for chart
    const painData = sessionNotes
        ?.filter((n: any) => n.pain_level != null)
        .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        || [];

    const romData = sessionNotes
        ?.filter((n: any) => n.rom_degrees != null)
        .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        || [];

    const completedMilestones = milestones?.filter((m: any) => m.status === 'completed').length || 0;
    const pendingMilestones = milestones?.filter((m: any) => m.status === 'pending').length || 0;

    const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    const rawName = String(caseFile.injury_type || 'Case').replace(/[^a-zA-Z0-9-]/g, '_');
    const filename = `CaseReport_${rawName}_${new Date().toISOString().slice(0, 10)}`;

    const handleDownload = useReactToPrint({
        contentRef: reportRef,
        documentTitle: filename,
        onBeforePrint: () => {
            return new Promise<void>((resolve) => {
                setGenerating(true);
                // Allow React to commit the state update so the user sees "Generating..." 
                setTimeout(resolve, 100);
            });
        },
        onAfterPrint: () => setGenerating(false),
        onPrintError: () => setGenerating(false),
        pageStyle: `
            @page { size: A4 portrait; margin: 10mm; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        `,
    });

    // Simple SVG sparkline for pain/ROM
    const Sparkline = ({ data, color, maxVal = 10, label }: { data: { value: number; date: string }[]; color: string; maxVal?: number; label: string }) => {
        if (data.length === 0) return <div style={{ color: '#94A3B8', fontSize: 11 }}>No {label.toLowerCase()} data recorded yet.</div>;
        const w = 340;
        const h = 60;
        const points = data.map((d, i) => ({
            x: data.length === 1 ? w / 2 : (i / (data.length - 1)) * w,
            y: h - (d.value / maxVal) * h,
        }));
        const line = points.map(p => `${p.x},${p.y}`).join(' ');

        return (
            <div>
                <svg width={w} height={h + 20} viewBox={`0 0 ${w} ${h + 20}`}>
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map(frac => (
                        <line key={frac} x1={0} y1={h - frac * h} x2={w} y2={h - frac * h} stroke="#E2E8F0" strokeWidth="0.5" />
                    ))}
                    <polyline fill="none" stroke={color} strokeWidth="2" points={line} strokeLinejoin="round" strokeLinecap="round" />
                    {points.map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
                    ))}
                    {/* X-axis labels */}
                    {data.length <= 8 && data.map((d, i) => (
                        <text key={i} x={points[i].x} y={h + 14} textAnchor="middle" fill="#94A3B8" fontSize="7" fontFamily="sans-serif">
                            {new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </text>
                    ))}
                </svg>
            </div>
        );
    };

    return (
        <>
            {/* Download Button */}
            <button
                onClick={() => handleDownload()}
                disabled={generating}
                className="btn-primary gap-2 text-sm py-2 px-4"
            >
                {generating ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Generating…
                    </>
                ) : (
                    <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download Report
                    </>
                )}
            </button>

            {/* Hidden report div — rendered off-screen for html2canvas */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <div
                    ref={reportRef}
                    style={{
                        width: 794,
                        fontFamily: "'Inter', 'Segoe UI', sans-serif",
                        backgroundColor: '#FFFFFF',
                        color: '#0F172A',
                        padding: 40,
                        lineHeight: 1.5,
                    }}
                >
                    {/* ========== PAGE HEADER ========== */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #2563EB', paddingBottom: 16, marginBottom: 24 }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 }}>*</div>
                                <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em' }}>Athlo</span>
                            </div>
                            <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 4 }}>Sports Physiotherapy Marketplace</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 10, color: '#94A3B8' }}>Report Generated</div>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                        </div>
                    </div>

                    {/* ========== TITLE ========== */}
                    <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px 0', color: '#0F172A' }}>
                        Case Report — {caseFile.injury_type || 'Injury'}
                    </h1>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24, fontSize: 12, color: '#64748B' }}>
                        <span style={{
                            display: 'inline-block',
                            padding: '2px 10px',
                            borderRadius: 999,
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: 'uppercase' as const,
                            letterSpacing: '0.05em',
                            backgroundColor: caseFile.status === 'active' ? '#DBEAFE' : '#D1FAE5',
                            color: caseFile.status === 'active' ? '#1D4ED8' : '#059669',
                        }}>
                            {caseFile.status}
                        </span>
                        <span>Opened: {fmtDate(caseFile.created_at)}</span>
                        {caseFile.closed_at && <span>Closed: {fmtDate(caseFile.closed_at)}</span>}
                    </div>

                    {/* ========== PATIENT & PHYSIO INFO + BODY ========== */}
                    <div style={{ display: 'flex', gap: 24, marginBottom: 28 }}>
                        {/* Left: Patient Info */}
                        <div style={{ flex: 1 }}>
                            <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 20, marginBottom: 16 }}>
                                <div style={{ fontSize: 9, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 12 }}>Patient Information</div>
                                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{athlete.first_name} {athlete.last_name}</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: 11 }}>
                                    <div><span style={{ color: '#94A3B8' }}>Gender:</span> <span style={{ fontWeight: 600 }}>{athlete.gender || '—'}</span></div>
                                    <div><span style={{ color: '#94A3B8' }}>Sport:</span> <span style={{ fontWeight: 600 }}>{athlete.primary_sport || caseFile.sport_context || '—'}</span></div>
                                    <div><span style={{ color: '#94A3B8' }}>Location:</span> <span style={{ fontWeight: 600 }}>{athlete.location_locality || '—'}</span></div>
                                    <div><span style={{ color: '#94A3B8' }}>DOB:</span> <span style={{ fontWeight: 600 }}>{athlete.dob ? fmtDate(athlete.dob) : '—'}</span></div>
                                </div>
                            </div>
                            <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 20 }}>
                                <div style={{ fontSize: 9, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 12 }}>Treating Physiotherapist</div>
                                <div style={{ fontSize: 14, fontWeight: 700 }}>Dr. {physio.first_name} {physio.last_name}</div>
                                <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
                                    {physio.location_locality || '—'} {physio.dcptot_reg_id && `• Reg: ${physio.dcptot_reg_id}`}
                                </div>
                            </div>
                        </div>

                        {/* Right: Body Figure */}
                        <div style={{ width: 180, border: '1px solid #E2E8F0', borderRadius: 12, padding: '16px 12px', textAlign: 'center' as const }}>
                            <div style={{ fontSize: 9, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 8 }}>Injury Location</div>
                            <BodySilhouette bodyPart={caseFile.body_part || ''} size={280} />
                        </div>
                    </div>

                    {/* ========== CLINICAL DETAILS ========== */}
                    <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 20, marginBottom: 28 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>Clinical Details</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: 16 }}>
                            <div>
                                <div style={{ fontSize: 9, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Injury Type</div>
                                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{caseFile.injury_type || '—'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 9, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Body Part</div>
                                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{caseFile.body_part || '—'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 9, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Severity</div>
                                <div style={{
                                    fontSize: 13, fontWeight: 700, marginTop: 2,
                                    color: caseFile.severity === 'Severe' ? '#DC2626' : caseFile.severity === 'Moderate' ? '#D97706' : '#059669',
                                }}>{caseFile.severity || '—'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 9, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Sport</div>
                                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{caseFile.sport_context || '—'}</div>
                            </div>
                        </div>
                        {caseFile.diagnosis_notes && (
                            <div>
                                <div style={{ fontSize: 9, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 4 }}>Diagnosis Notes</div>
                                <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-wrap' as const }}>{caseFile.diagnosis_notes}</div>
                            </div>
                        )}
                    </div>

                    {/* ========== RECOVERY ANALYTICS ========== */}
                    <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 20, marginBottom: 28 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>Recovery Analytics</div>

                        {/* Stats row */}
                        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                            <div style={{ flex: 1, border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 16px', textAlign: 'center' as const }}>
                                <div style={{ fontSize: 22, fontWeight: 800, color: '#2563EB' }}>{sessionNotes?.length || 0}</div>
                                <div style={{ fontSize: 9, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' as const }}>Notes</div>
                            </div>
                            <div style={{ flex: 1, border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 16px', textAlign: 'center' as const }}>
                                <div style={{ fontSize: 22, fontWeight: 800, color: '#059669' }}>{completedMilestones}</div>
                                <div style={{ fontSize: 9, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' as const }}>Done</div>
                            </div>
                            <div style={{ flex: 1, border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 16px', textAlign: 'center' as const }}>
                                <div style={{ fontSize: 22, fontWeight: 800, color: '#D97706' }}>{pendingMilestones}</div>
                                <div style={{ fontSize: 9, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' as const }}>Pending</div>
                            </div>
                        </div>

                        {/* Charts */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Pain Trend (0-10)</div>
                                <Sparkline
                                    data={painData.map((n: any) => ({ value: n.pain_level, date: n.created_at }))}
                                    color="#EF4444"
                                    maxVal={10}
                                    label="Pain"
                                />
                            </div>
                            <div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>ROM Progress (°)</div>
                                <Sparkline
                                    data={romData.map((n: any) => ({ value: n.rom_degrees, date: n.created_at }))}
                                    color="#2563EB"
                                    maxVal={180}
                                    label="ROM"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ========== TREATMENT PLAN ========== */}
                    {plan && (
                        <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 20, marginBottom: 28 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Treatment Plan — {plan.title || 'Active Protocol'}</div>
                            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 14 }}>{plan.description || ''}</div>

                            {exercises.length > 0 && (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                                            <th style={{ textAlign: 'left' as const, padding: '6px 8px', fontSize: 9, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const }}>#</th>
                                            <th style={{ textAlign: 'left' as const, padding: '6px 8px', fontSize: 9, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const }}>Exercise</th>
                                            <th style={{ textAlign: 'left' as const, padding: '6px 8px', fontSize: 9, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const }}>Category</th>
                                            <th style={{ textAlign: 'left' as const, padding: '6px 8px', fontSize: 9, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const }}>Prescription</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {exercises.map((ex: any, i: number) => {
                                            const isRich = ex.item && ex.prescription;
                                            const name = isRich ? ex.item.name : (ex.name || ex.title || `Exercise ${i + 1}`);
                                            const category = isRich ? ex.item.category : '—';
                                            let prescText = '—';
                                            if (isRich) {
                                                const p = ex.prescription;
                                                if (p.type === 'sets_reps') prescText = `${p.sets} sets × ${p.reps} reps`;
                                                else if (p.type === 'duration') prescText = `${p.durationMinutes} min`;
                                                else if (p.type === 'hold_duration') prescText = `${p.holdSeconds}s hold × ${p.reps} reps`;
                                                else if (p.type === 'cycles') prescText = `${p.cycles} cycles`;
                                            }
                                            return (
                                                <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                    <td style={{ padding: '8px', color: '#94A3B8', fontWeight: 600 }}>{i + 1}</td>
                                                    <td style={{ padding: '8px', fontWeight: 600 }}>{name}</td>
                                                    <td style={{ padding: '8px', color: '#64748B', textTransform: 'capitalize' as const }}>{category}</td>
                                                    <td style={{ padding: '8px', fontWeight: 600, color: '#2563EB' }}>{prescText}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* ========== SESSION TIMELINE ========== */}
                    {sessionNotes && sessionNotes.length > 0 && (
                        <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 20, marginBottom: 28 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>Session Notes Timeline</div>
                            {sessionNotes.map((note: any, i: number) => (
                                <div key={i} style={{
                                    borderLeft: '3px solid #2563EB',
                                    paddingLeft: 16,
                                    marginLeft: 8,
                                    marginBottom: 16,
                                    paddingBottom: 16,
                                    borderBottom: i < sessionNotes.length - 1 ? '1px solid #F8FAFC' : 'none',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                        <div style={{ fontSize: 11, fontWeight: 700 }}>Clinical Note</div>
                                        <div style={{ fontSize: 10, color: '#94A3B8' }}>{fmtDate(note.created_at)}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 16, marginBottom: 6, fontSize: 11 }}>
                                        {note.pain_level != null && (
                                            <span><span style={{ color: '#94A3B8' }}>Pain:</span> <span style={{ fontWeight: 700, color: '#EF4444' }}>{note.pain_level}/10</span></span>
                                        )}
                                        {note.rom_degrees != null && (
                                            <span><span style={{ color: '#94A3B8' }}>ROM:</span> <span style={{ fontWeight: 700, color: '#2563EB' }}>{note.rom_degrees}°</span></span>
                                        )}
                                    </div>
                                    {note.summary && <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>{note.summary}</div>}
                                    {note.next_steps && (
                                        <div style={{ fontSize: 10, color: '#64748B', marginTop: 4 }}>
                                            <span style={{ fontWeight: 700 }}>Next steps:</span> {note.next_steps}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ========== MILESTONES ========== */}
                    {milestones && milestones.length > 0 && (
                        <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 20, marginBottom: 28 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>Milestones</div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                                        <th style={{ textAlign: 'left' as const, padding: '6px 8px', fontSize: 9, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const }}>Milestone</th>
                                        <th style={{ textAlign: 'left' as const, padding: '6px 8px', fontSize: 9, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const }}>Target Date</th>
                                        <th style={{ textAlign: 'left' as const, padding: '6px 8px', fontSize: 9, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {milestones.map((m: any, i: number) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '8px', fontWeight: 600 }}>{m.title}</td>
                                            <td style={{ padding: '8px', color: '#64748B' }}>{fmtDate(m.target_date)}</td>
                                            <td style={{ padding: '8px' }}>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '2px 8px',
                                                    borderRadius: 999,
                                                    fontSize: 9,
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase' as const,
                                                    backgroundColor: m.status === 'completed' ? '#D1FAE5' : '#FEF3C7',
                                                    color: m.status === 'completed' ? '#059669' : '#D97706',
                                                }}>
                                                    {m.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ========== FOOTER ========== */}
                    <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 12, marginTop: 20, display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#94A3B8' }}>
                        <span>Generated by Athlo — Sports Physiotherapy Marketplace</span>
                        <span>Confidential Medical Document</span>
                    </div>
                </div>
            </div>
        </>
    );
}
