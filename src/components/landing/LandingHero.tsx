'use client';

import { useEffect, useRef } from 'react';
import type { BufferGeometry } from 'three';
import Link from 'next/link';
import { useTheme, THEMES } from '@/components/ThemeProvider';

/* Sport pills shown under the CTA */
const SPORTS = ['Cricket', 'Football', 'Badminton', 'Tennis', 'Athletics', 'Swimming'];

export default function LandingHero() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const anatRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number }[]>([]);
    const mouseRef = useRef({ x: 0, y: 0 });
    const rafParticle = useRef<number>(0);
    const rafAnat = useRef<number>(0);

    const { theme } = useTheme();
    const isDark = THEMES.find(t => t.id === theme)?.type !== 'light';

    // Store strong references to materials so we can swap their colors
    const matsRef = useRef<{ solidMat: any; wireMat: any } | null>(null);

    /* ── Particle canvas ── */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const count = 90;
        particlesRef.current = Array.from({ length: count }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
        }));

        const draw = () => {
            if (document.hidden) { rafParticle.current = requestAnimationFrame(draw); return; }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const ps = particlesRef.current;
            for (let i = 0; i < ps.length; i++) {
                const p = ps[i];
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                const dx = p.x - mouseRef.current.x, dy = p.y - mouseRef.current.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < 110 && d > 0) { p.x += (dx / d) * 2.5; p.y += (dy / d) * 2.5; }

                ctx.beginPath();
                ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = isDark ? 'rgba(37,99,235,0.45)' : 'rgba(37,99,235,0.25)';
                ctx.fill();

                for (let j = i + 1; j < ps.length; j++) {
                    const dx2 = p.x - ps[j].x, dy2 = p.y - ps[j].y;
                    const d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                    if (d2 < 130) {
                        ctx.beginPath();
                        ctx.strokeStyle = isDark 
                            ? `rgba(37,99,235,${0.15 * (1 - d2 / 130)})`
                            : `rgba(37,99,235,${0.25 * (1 - d2 / 130)})`;
                        ctx.lineWidth = 0.8;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(ps[j].x, ps[j].y);
                        ctx.stroke();
                    }
                }
            }
            rafParticle.current = requestAnimationFrame(draw);
        };
        draw();

        const onMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
        window.addEventListener('mousemove', onMove);

        return () => {
            cancelAnimationFrame(rafParticle.current);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMove);
        };
    }, []);

    /* ── Three.js anatomy model ── */
    useEffect(() => {
        let active = true;
        let cleanupRef = { dispose: () => {} };

        if (typeof window === 'undefined') return;
        if (window.innerWidth < 768) return;

        // Dynamically import THREE to avoid SSR issues
        import('three').then((THREE) => {
            if (!active) return;
            const canvas = anatRef.current;
            if (!canvas) return;

            let renderer: any;
            try {
                renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, failIfMajorPerformanceCaveat: false });
                renderer.setSize(520, 640);
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            } catch (e) {
                console.warn('WebGL not supported or context lost. 3D hero model will not be rendered.', e);
                return;
            }

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(42, 520 / 640, 0.1, 100);
            camera.position.set(0, 1, 10);

            const bodyGroup = new THREE.Group();

            const solidMat = new THREE.MeshPhongMaterial({ color: 0x0B1628, shininess: 60, specular: new THREE.Color(0x1E40AF) });
            const wireMat = new THREE.MeshBasicMaterial({ color: 0x1E3A5F, wireframe: true, transparent: true, opacity: 0.28 });
            matsRef.current = { solidMat, wireMat };

            const makeMesh = (geo: BufferGeometry) => {
                const g = new THREE.Group();
                g.add(new THREE.Mesh(geo, solidMat.clone()));
                g.add(new THREE.Mesh(geo, wireMat.clone()));
                return g;
            };

            // Muscular Torso (V-taper)
            const torsoGeo = new THREE.CylinderGeometry(1.4, 0.85, 3.8, 32, 16);
            // taper the torso manually for a V-shape
            const posAttr = torsoGeo.attributes.position;
            const vec = new THREE.Vector3();
            for (let i = 0; i < posAttr.count; i++) {
                vec.fromBufferAttribute(posAttr, i);
                // V-taper: wider at top (y > 0), narrower at waist (y < 0)
                const scale = 1 + (vec.y / 1.9) * 0.2; 
                vec.x *= scale;
                vec.z *= scale * 0.8; // flatter chest
                posAttr.setXYZ(i, vec.x, vec.y, vec.z);
            }
            torsoGeo.computeVertexNormals();
            bodyGroup.add(makeMesh(torsoGeo));
            
            // Pectorals (Chest muscles)
            [-0.5, 0.5].forEach(x => {
                const geo = new THREE.BoxGeometry(1.2, 1.0, 0.4, 8, 8, 4);
                const pec = makeMesh(geo);
                pec.position.set(x, 1.2, 1.1);
                pec.rotation.z = x > 0 ? 0.1 : -0.1;
                pec.rotation.y = x > 0 ? -0.2 : 0.2;
                const pAttr = geo.attributes.position;
                for(let i=0; i<pAttr.count; i++) {
                     let py = pAttr.getY(i);
                     let px = pAttr.getX(i);
                     pAttr.setZ(i, pAttr.getZ(i) - (px*px)*0.2 - (py*py)*0.2);
                }
                geo.computeVertexNormals();
                bodyGroup.add(pec);
            });

            // Deltoids (Shoulders)
            [-1.5, 1.5].forEach(x => {
                const delt = makeMesh(new THREE.SphereGeometry(0.65, 16, 16));
                delt.position.set(x, 1.4, 0); 
                delt.scale.set(1, 1.2, 1);
                bodyGroup.add(delt);
            });

            // Neck & Traps
            const neck = makeMesh(new THREE.CylinderGeometry(0.35, 0.5, 0.8, 16, 4));
            neck.position.y = 2.4; 
            bodyGroup.add(neck);

            // Head
            const head = makeMesh(new THREE.SphereGeometry(0.65, 24, 24));
            head.position.y = 3.4; 
            head.scale.set(1, 1.2, 1.1);
            bodyGroup.add(head);

            // Biceps & Triceps (Upper Arms)
            [-1.9, 1.9].forEach((x, i) => {
                const armGeo = new THREE.CylinderGeometry(0.3, 0.25, 1.6, 16, 8);
                // bulge for bicep
                const aAttr = armGeo.attributes.position;
                for(let j=0; j<aAttr.count; j++) {
                    let ay = aAttr.getY(j);
                    if (ay > -0.5 && ay < 0.5) {
                        let az = aAttr.getZ(j);
                        if (az > 0) aAttr.setZ(j, az * 1.3); // bicep bulge
                        if (az < 0) aAttr.setZ(j, az * 1.1); // tricep
                    }
                }
                armGeo.computeVertexNormals();
                const arm = makeMesh(armGeo);
                arm.position.set(x, 0.3, 0); 
                arm.rotation.z = i === 0 ? 0.2 : -0.2; 
                bodyGroup.add(arm);
            });

            // Forearms
            [-2.1, 2.1].forEach((x, i) => {
                const forearm = makeMesh(new THREE.CylinderGeometry(0.24, 0.15, 1.4, 16, 8));
                forearm.position.set(x, -1.2, 0.2); 
                forearm.rotation.z = i === 0 ? 0.1 : -0.1; 
                forearm.rotation.x = -0.2;
                bodyGroup.add(forearm);
            });

            // Abdominals (Six pack hints)
            for(let i=0; i<3; i++) {
                [-0.3, 0.3].forEach(x => {
                    const geo = new THREE.BoxGeometry(0.5, 0.4, 0.2, 4, 4);
                    const abs = makeMesh(geo);
                    abs.position.set(x, 0.2 - i*0.45, 1.05 + (i*0.05));
                    const abAttr = geo.attributes.position;
                    for(let k=0; k<abAttr.count; k++) {
                        abAttr.setZ(k, abAttr.getZ(k) - Math.abs(abAttr.getX(k))*0.2);
                    }
                    geo.computeVertexNormals();
                    bodyGroup.add(abs);
                });
            }

            // Pelvis/Hips
            const pel = makeMesh(new THREE.CylinderGeometry(0.9, 0.8, 0.8, 24, 6));
            pel.position.y = -1.8; 
            pel.scale.set(1, 1, 0.8);
            bodyGroup.add(pel);
            
            // Upper Legs (Quads)
            [-0.45, 0.45].forEach((x) => {
                const legGeo = new THREE.CylinderGeometry(0.4, 0.3, 2.0, 16, 8);
                // quad bulge
                const lAttr = legGeo.attributes.position;
                for(let j=0; j<lAttr.count; j++) {
                    let ly = lAttr.getY(j);
                    if (ly > -0.5 && ly < 0.5 && lAttr.getZ(j) > 0) {
                        lAttr.setZ(j, lAttr.getZ(j) * 1.2);
                    }
                }
                legGeo.computeVertexNormals();
                const leg = makeMesh(legGeo);
                leg.position.set(x, -3.1, 0); 
                bodyGroup.add(leg);
            });

            bodyGroup.position.y = -0.5;
            scene.add(bodyGroup);

            // Lights
            scene.add(new THREE.AmbientLight(0x111827, 0.5));
            const bl = new THREE.PointLight(0x2563EB, 2.0); bl.position.set(-3, 2, 4); scene.add(bl);
            const ol = new THREE.PointLight(0xF97316, 1.0); ol.position.set(3, -1, 3); scene.add(ol);
            const sp = new THREE.SpotLight(0x93C5FD, 1.5); sp.position.set(0, 6, 3); sp.angle = 0.35; scene.add(sp);

            let targetX = 0, targetZ = 0;
            const onMove = (e: MouseEvent) => {
                targetX = (e.clientY / window.innerHeight - 0.5) * 0.1;
                targetZ = (e.clientX / window.innerWidth - 0.5) * 0.06;
            };
            window.addEventListener('mousemove', onMove);

            const animate = () => {
                rafAnat.current = requestAnimationFrame(animate);
                if (document.hidden) return;
                bodyGroup.rotation.y += 0.002;
                bodyGroup.rotation.x += (targetX - bodyGroup.rotation.x) * 0.03;
                bodyGroup.rotation.z += (targetZ - bodyGroup.rotation.z) * 0.03;
                renderer.render(scene, camera);
            };
            animate();

            cleanupRef.dispose = () => {
                cancelAnimationFrame(rafAnat.current);
                window.removeEventListener('mousemove', onMove);
                renderer.dispose();
            };
        }).catch(err => {
            console.error('Failed to initialize Three.js hero model:', err);
        });

        return () => {
            active = false;
            cleanupRef.dispose();
            matsRef.current = null;
        };
    }, []);

    /* ── Respond to theme changes by patching materials ── */
    useEffect(() => {
        if (!matsRef.current) return;
        const { solidMat, wireMat } = matsRef.current;
        solidMat.color.setHex(isDark ? 0x0B1628 : 0xC7D2E0);
        wireMat.color.setHex(isDark ? 0x1E3A5F : 0x93A8C4);
    }, [isDark]);

    /* ── GSAP entrance ── */
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (mq.matches) {
            // No animations — show everything
            document.querySelectorAll<HTMLElement>('.hero-anim').forEach(el => {
                el.style.opacity = '1'; el.style.transform = 'none';
            });
            return;
        }
        import('gsap').then(({ gsap }) => {
            import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
                gsap.registerPlugin(ScrollTrigger);

                const tl = gsap.timeline({ delay: 0.3 });
                tl.to('.hero-eyebrow', { y: 0, opacity: 1, duration: 0.7, ease: 'power4.out' }, 0);
                tl.to('.hero-line-inner', { y: 0, opacity: 1, stagger: 0.13, duration: 0.75, ease: 'power4.out' }, 0.2);
                tl.to('.hero-faster', { y: 0, opacity: 1, duration: 0.7, ease: 'power4.out' }, 0.5);
                tl.to('.hero-sub', { y: 0, opacity: 1, duration: 0.6, ease: 'power4.out' }, 0.7);
                tl.to('.hero-ctas', { y: 0, opacity: 1, duration: 0.6, ease: 'power4.out' }, 0.8);
                tl.to('.hero-pill', { y: 0, opacity: 1, stagger: 0.06, duration: 0.5, ease: 'power3.out' }, 0.9);
                tl.to('.hero-trust', { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, 1.0);
                tl.to('#anatomy-wrapper', { scale: 1, opacity: 1, duration: 1.2, ease: 'power3.out' }, 0.5);
                tl.to('.injury-marker', { scale: 1, opacity: 1, stagger: 0.25, duration: 0.6, ease: 'back.out(2)' }, 1.3);
            });
        });
    }, []);

    const markerStyle = (delay: string): React.CSSProperties => ({
        width: 12, height: 12, borderRadius: '50%',
        background: '#F97316',
        animation: 'markerPulse 2s ease-in-out infinite',
        animationDelay: delay,
        position: 'relative',
        zIndex: 10,
    });

    return (
        <section
            id="hero"
            className="relative min-h-screen flex items-center overflow-hidden"
            style={{ background: 'var(--bg-primary)', paddingTop: 64 }}
        >
            {/* Particle canvas */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none"
                style={{ zIndex: 0 }}
            />

            {/* Background radial glows */}
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '100%', background: 'radial-gradient(ellipse 500px 600px at 15% 65%, rgba(37,99,235,0.10) 0%, transparent 70%)' }} />
                <div style={{ position: 'absolute', top: 0, right: 0, width: '60%', height: '100%', background: 'radial-gradient(ellipse 600px 500px at 85% 35%, rgba(249,115,22,0.06) 0%, transparent 70%)' }} />
            </div>

            {/* SVG Sport Silhouettes */}
            <svg className="absolute pointer-events-none" style={{ bottom: '10%', left: '2%', height: 260, opacity: 0.05, fill: 'currentColor', color: 'white', zIndex: 1, animation: 'silhouetteBreath 4s ease-in-out infinite' }} viewBox="0 0 80 160">
                <ellipse cx="40" cy="14" rx="10" ry="12" />
                <rect x="34" y="26" width="12" height="50" rx="5" />
                <path d="M34 60 L10 90 L16 95 L38 70" />
                <rect x="18" y="85" width="6" height="30" rx="3" />
                <rect x="46" y="76" width="8" height="45" rx="4" />
                <rect x="32" y="110" width="8" height="35" rx="4" />
                <rect x="42" y="110" width="8" height="35" rx="4" />
            </svg>
            <svg className="absolute pointer-events-none" style={{ top: '8%', left: '42%', height: 180, opacity: 0.05, fill: 'currentColor', color: 'white', zIndex: 1, animation: 'silhouetteBreath 3s ease-in-out infinite' }} viewBox="0 0 60 120">
                <circle cx="30" cy="12" r="10" />
                <rect x="24" y="24" width="12" height="36" rx="5" />
                <path d="M24 44 L8 36 L10 30 L26 38" />
                <path d="M36 44 L52 50 L50 56 L34 50" />
                <path d="M24 60 L16 90" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                <path d="M36 60 L44 90" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                <path d="M16 90 L8 110" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
                <path d="M44 90 L52 110" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
            </svg>

            {/* Main grid */}
            <div className="relative z-10 w-full max-w-[1280px] mx-auto px-12 grid md:grid-cols-[46fr_54fr] gap-10 items-center">

                {/* ── Left Column ── */}
                <div>
                    <div
                        className="hero-eyebrow hero-anim inline-flex items-center mb-8"
                        style={{
                            fontFamily: 'var(--font-dm-sans)',
                            fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em',
                            color: '#2563EB', background: 'rgba(37,99,235,0.1)',
                            border: '1px solid rgba(37,99,235,0.25)', borderRadius: 999, padding: '5px 14px',
                            opacity: 0, transform: 'translateY(20px)',
                        }}
                    >
                        Sports Physiotherapy · India
                    </div>

                    <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 'clamp(52px,6vw,88px)', lineHeight: 0.95, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>
                        <span className="block overflow-hidden">
                            <span className="hero-line-inner block" style={{ opacity: 0, transform: 'translateY(100%)' }}>Get Back</span>
                        </span>
                        <span className="block overflow-hidden">
                            <span className="hero-line-inner block" style={{ opacity: 0, transform: 'translateY(100%)' }}>To Your Sport.</span>
                        </span>
                    </h1>
                    <div
                        className="hero-faster"
                        style={{
                            fontFamily: 'var(--font-dm-sans)', fontStyle: 'italic', fontWeight: 400,
                            fontSize: 'clamp(52px,6vw,88px)', lineHeight: 0.95, letterSpacing: '-0.04em',
                            color: '#2563EB', textShadow: '0 0 40px rgba(37,99,235,0.5)',
                            opacity: 0, transform: 'translateY(20px)',
                        }}
                    >
                        Faster.
                    </div>

                    <p
                        className="hero-sub"
                        style={{
                            fontFamily: 'var(--font-dm-sans)', fontWeight: 400, fontSize: 18,
                            color: 'var(--text-secondary)', maxWidth: 420, lineHeight: 1.6,
                            marginTop: 24, opacity: 0, transform: 'translateY(16px)',
                        }}
                    >
                        Verified sports physiotherapists matched to your sport, your injury, and your recovery timeline.
                    </p>

                    <div className="hero-ctas flex gap-3 flex-wrap" style={{ marginTop: 36, opacity: 0, transform: 'translateY(12px)' }}>
                        <Link
                            href="/auth/signup"
                            className="inline-flex items-center h-[54px] px-7 rounded-full font-bold text-white transition-all hover:scale-[1.03]"
                            style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 16, background: '#2563EB', boxShadow: '0 0 32px rgba(37,99,235,0.35)' }}
                        >
                            Find My Physio →
                        </Link>
                        <Link
                            href="/auth/signup?role=physio"
                            className="inline-flex items-center h-[54px] px-7 rounded-full font-bold transition-all hover:bg-[#10B981] hover:text-white"
                            style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: '#10B981', border: '1px solid #10B981', background: 'transparent' }}
                        >
                            Join as Physio
                        </Link>
                    </div>

                    {/* Sport Pills */}
                    <div className="flex flex-wrap gap-2" style={{ marginTop: 28 }}>
                        {SPORTS.map((s) => (
                            <span
                                key={s}
                                className="hero-pill"
                                style={{
                                    fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: 13,
                                    color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.10)', borderRadius: 999, padding: '7px 16px',
                                    opacity: 0, transform: 'translateY(10px)', cursor: 'default',
                                    transition: 'border-color 0.15s, color 0.15s, background 0.15s',
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLElement).style.borderColor = '#2563EB';
                                    (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                                    (e.currentTarget as HTMLElement).style.background = 'rgba(37,99,235,0.08)';
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.10)';
                                    (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                                }}
                            >
                                {s}
                            </span>
                        ))}
                    </div>

                    {/* Trust line */}
                    <div
                        className="hero-trust flex gap-3 flex-wrap items-center"
                        style={{ marginTop: 20, fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: 'var(--text-muted)', opacity: 0, transform: 'translateY(8px)' }}
                    >
                        <span>48hr Verification</span>
                        <span style={{ opacity: 0.3 }}>|</span>
                        <span>Zero upfront cost</span>
                        <span style={{ opacity: 0.3 }}>|</span>
                        <span>Manual credential check</span>
                    </div>
                </div>

                {/* ── Right Column — anatomy ── */}
                <div className="relative hidden md:flex items-center justify-center" style={{ height: 640 }}>
                    <div
                        id="anatomy-wrapper"
                        className="relative"
                        style={{ width: 520, height: 640, opacity: 0, transform: 'scale(0.85)' }}
                    >
                        <canvas ref={anatRef} style={{ width: '100%', height: '100%' }} />

                        {/* HUD SVG lines */}
                        <svg viewBox="0 0 520 640" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                            <line x1="166" y1="179" x2="60" y2="140" stroke="#2563EB" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="4 4" />
                            <text x="10" y="138" fontFamily="DM Sans,sans-serif" fontSize="10" fill="#2563EB" fillOpacity="0.5">Rotator Cuff</text>
                            <line x1="250" y1="371" x2="460" y2="340" stroke="#2563EB" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="4 4" />
                            <text x="380" y="338" fontFamily="DM Sans,sans-serif" fontSize="10" fill="#2563EB" fillOpacity="0.5">Lumbar Spine</text>
                            <line x1="302" y1="474" x2="450" y2="500" stroke="#2563EB" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="4 4" />
                            <text x="368" y="514" fontFamily="DM Sans,sans-serif" fontSize="10" fill="#2563EB" fillOpacity="0.5">ACL / Knee</text>
                        </svg>

                        {/* Injury markers */}
                        {[
                            { top: '28%', left: '32%', delay: '0s', label: 'Rotator Cuff' },
                            { top: '58%', left: '48%', delay: '0.6s', label: 'Lumbar Spine' },
                            { top: '74%', left: '58%', delay: '1.2s', label: 'ACL / Knee' },
                        ].map((m) => (
                            <div
                                key={m.label}
                                className="injury-marker absolute group"
                                style={{ top: m.top, left: m.left, opacity: 0, transform: 'scale(0)', transformOrigin: 'center' }}
                            >
                                <div style={markerStyle(m.delay)} />
                                <div
                                    className="absolute left-5 top-[-4px] hidden group-hover:block whitespace-nowrap text-[11px] px-[10px] py-[5px] rounded-lg z-20"
                                    style={{
                                        fontFamily: 'var(--font-dm-sans)', fontWeight: 500,
                                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                                        color: 'var(--text-primary)', boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                                    }}
                                >
                                    {m.label}
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}
