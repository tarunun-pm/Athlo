'use client';

/**
 * SVG human body silhouette with highlighted injury region.
 * Used in the PDF case report. Inspired by clinical assessment tools.
 */

interface BodySilhouetteProps {
    bodyPart: string;
    size?: number;
}

// Map body_part text → highlighted region key
function getRegion(bodyPart: string): string {
    const bp = (bodyPart || '').toLowerCase();
    if (bp.includes('knee') || bp.includes('acl') || bp.includes('mcl') || bp.includes('meniscus') || bp.includes('patella')) return 'knee';
    if (bp.includes('shoulder') || bp.includes('rotator')) return 'shoulder';
    if (bp.includes('ankle') || bp.includes('achilles') || bp.includes('foot')) return 'ankle';
    if (bp.includes('hamstring') || bp.includes('quadricep') || bp.includes('thigh')) return 'upper-leg';
    if (bp.includes('tibia') || bp.includes('shin') || bp.includes('calf') || bp.includes('fibula')) return 'lower-leg';
    if (bp.includes('back') || bp.includes('lumbar') || bp.includes('spine') || bp.includes('spinal')) return 'back';
    if (bp.includes('wrist') || bp.includes('hand') || bp.includes('finger')) return 'wrist';
    if (bp.includes('elbow') || bp.includes('forearm') || bp.includes('bicep') || bp.includes('tricep')) return 'elbow';
    if (bp.includes('hip') || bp.includes('groin') || bp.includes('pelvis')) return 'hip';
    if (bp.includes('neck') || bp.includes('cervical')) return 'neck';
    if (bp.includes('chest') || bp.includes('rib') || bp.includes('pectoral')) return 'chest';
    return 'none';
}

// Region highlight positions (cx, cy, rx, ry for ellipses on a 200x500 viewBox)
const REGION_POSITIONS: Record<string, { cx: number; cy: number; rx: number; ry: number }> = {
    'neck':      { cx: 100, cy: 82, rx: 18, ry: 14 },
    'shoulder':  { cx: 60, cy: 115, rx: 22, ry: 18 },
    'chest':     { cx: 100, cy: 140, rx: 30, ry: 22 },
    'elbow':     { cx: 38, cy: 195, rx: 14, ry: 16 },
    'wrist':     { cx: 30, cy: 250, rx: 12, ry: 14 },
    'back':      { cx: 100, cy: 185, rx: 28, ry: 25 },
    'hip':       { cx: 100, cy: 235, rx: 26, ry: 20 },
    'upper-leg': { cx: 82, cy: 300, rx: 18, ry: 35 },
    'knee':      { cx: 82, cy: 350, rx: 16, ry: 16 },
    'lower-leg': { cx: 82, cy: 400, rx: 14, ry: 28 },
    'ankle':     { cx: 82, cy: 445, rx: 12, ry: 12 },
};

export default function BodySilhouette({ bodyPart, size = 300 }: BodySilhouetteProps) {
    const region = getRegion(bodyPart);
    const highlight = REGION_POSITIONS[region];
    const scale = size / 500;

    return (
        <div style={{ width: size * 0.4, height: size }} className="relative mx-auto">
            <svg viewBox="0 0 200 500" width={size * 0.4} height={size} xmlns="http://www.w3.org/2000/svg">
                {/* Body outline */}
                <g fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinejoin="round">
                    {/* Head */}
                    <ellipse cx="100" cy="45" rx="28" ry="32" fill="#F1F5F9" stroke="#CBD5E1" />
                    {/* Neck */}
                    <rect x="90" y="75" width="20" height="20" rx="4" fill="#F1F5F9" stroke="#CBD5E1" />
                    {/* Torso */}
                    <path d="M60 95 Q55 100 52 130 Q50 170 55 210 Q58 230 75 240 L75 250 L125 250 L125 240 Q142 230 145 210 Q150 170 148 130 Q145 100 140 95 Z" fill="#F1F5F9" stroke="#CBD5E1" />
                    {/* Left arm */}
                    <path d="M60 95 Q40 110 35 150 Q30 185 28 210 Q25 240 22 260 L30 260 Q34 240 38 210 Q40 185 45 160 Q48 140 55 120" fill="none" stroke="#CBD5E1" strokeWidth="1.5" />
                    {/* Right arm */}
                    <path d="M140 95 Q160 110 165 150 Q170 185 172 210 Q175 240 178 260 L170 260 Q166 240 162 210 Q160 185 155 160 Q152 140 145 120" fill="none" stroke="#CBD5E1" strokeWidth="1.5" />
                    {/* Left leg */}
                    <path d="M75 250 Q72 280 70 320 Q68 350 66 380 Q64 410 62 440 Q60 460 58 475 L74 475 Q76 460 78 440 Q80 410 82 380 Q84 350 86 320 Q88 290 90 260" fill="none" stroke="#CBD5E1" strokeWidth="1.5" />
                    {/* Right leg */}
                    <path d="M125 250 Q128 280 130 320 Q132 350 134 380 Q136 410 138 440 Q140 460 142 475 L126 475 Q124 460 122 440 Q120 410 118 380 Q116 350 114 320 Q112 290 110 260" fill="none" stroke="#CBD5E1" strokeWidth="1.5" />
                </g>

                {/* Injury highlight */}
                {highlight && (
                    <g>
                        <ellipse
                            cx={highlight.cx}
                            cy={highlight.cy}
                            rx={highlight.rx + 6}
                            ry={highlight.ry + 6}
                            fill="rgba(239, 68, 68, 0.15)"
                            stroke="none"
                        />
                        <ellipse
                            cx={highlight.cx}
                            cy={highlight.cy}
                            rx={highlight.rx}
                            ry={highlight.ry}
                            fill="rgba(239, 68, 68, 0.3)"
                            stroke="#EF4444"
                            strokeWidth="2"
                            strokeDasharray="4 2"
                        />
                        {/* Cross marker */}
                        <line x1={highlight.cx - 8} y1={highlight.cy - 8} x2={highlight.cx + 8} y2={highlight.cy + 8} stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1={highlight.cx + 8} y1={highlight.cy - 8} x2={highlight.cx - 8} y2={highlight.cy + 8} stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
                        {/* Label */}
                        <text x={highlight.cx} y={highlight.cy + highlight.ry + 16} textAnchor="middle" fill="#EF4444" fontSize="10" fontWeight="700" fontFamily="sans-serif">
                            {bodyPart}
                        </text>
                    </g>
                )}
            </svg>
        </div>
    );
}
