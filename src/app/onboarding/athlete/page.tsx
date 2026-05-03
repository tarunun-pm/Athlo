'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const SPORTS = ['Cricket', 'Football', 'Badminton', 'Tennis', 'Athletics', 'Swimming', 'Wrestling', 'Kabaddi', 'Other'];
const GENDERS = ['Male', 'Female', 'Prefer not to say'];

export default function AthleteOnboarding() {
    const router = useRouter();
    const supabase = createClient();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [gender, setGender] = useState('');
    const [primarySport, setPrimarySport] = useState('');
    const [dob, setDob] = useState('');

    const [locationLocality, setLocationLocality] = useState('');
    const [locationLat, setLocationLat] = useState<number | null>(null);
    const [locationLng, setLocationLng] = useState<number | null>(null);
    const [gettingLocation, setGettingLocation] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isFormValid =
        firstName.trim() !== '' &&
        lastName.trim() !== '' &&
        gender !== '' &&
        primarySport !== '' &&
        locationLocality.trim() !== '' &&
        dob !== '';

    const handleGetLocation = () => {
        setGettingLocation(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    setLocationLat(pos.coords.latitude);
                    setLocationLng(pos.coords.longitude);
                    setLocationLocality('Delhi NCR (GPS)');
                    setGettingLocation(false);
                },
                (err) => {
                    console.error(err);
                    setGettingLocation(false);
                }
            );
        } else {
            setGettingLocation(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        setIsLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error: dbError } = await supabase.from('athlete_profiles').insert({
                id: user.id,
                first_name: firstName,
                last_name: lastName,
                gender,
                primary_sport: primarySport,
                dob,
                location_locality: locationLocality,
                location_lat: locationLat,
                location_lng: locationLng,
            });

            if (dbError) throw dbError;

            router.push('/athlete/dashboard');
        } catch (err: any) {
            // Upsert fallback
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { error: updateError } = await supabase.from('athlete_profiles').update({
                        first_name: firstName,
                        last_name: lastName,
                        gender,
                        primary_sport: primarySport,
                        dob,
                        location_locality: locationLocality,
                        location_lat: locationLat,
                        location_lng: locationLng,
                    }).eq('id', user.id);
                    if (updateError) throw updateError;
                    router.push('/athlete/dashboard');
                    return;
                }
            } catch { }
            setError(err.message || 'Failed to save profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen pb-24 max-w-2xl mx-auto p-4 md:p-8">

            <h1 className="text-3xl font-syne font-bold text-text-primary mb-8 px-2 mt-8">
                Tell us about you
            </h1>

            {error && (
                <div className="bg-error/10 border border-error/50 text-error text-sm p-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-10 px-2">

                {/* Section 1: Basic */}
                <section className="space-y-4">
                    <h2 className="text-sm font-bold text-text-muted tracking-wider uppercase">Basic Info</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="First Name" required value={firstName} onChange={e => setFirstName(e.target.value)} className="input-field" />
                        <input type="text" placeholder="Last Name" required value={lastName} onChange={e => setLastName(e.target.value)} className="input-field" />
                    </div>
                    <div>
                        <p className="text-sm text-text-secondary mb-2">Gender</p>
                        <div className="flex flex-wrap gap-2">
                            {GENDERS.map(g => (
                                <button type="button" key={g} onClick={() => setGender(g)} className={`pill ${gender === g ? 'pill-active' : ''}`}>{g}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-text-secondary mb-2">Date of Birth</p>
                        <input type="date" required value={dob} onChange={e => setDob(e.target.value)} className="input-field max-w-[200px]" />
                    </div>
                </section>

                {/* Section 2: Sport */}
                <section className="space-y-4">
                    <h2 className="text-sm font-bold text-text-muted tracking-wider uppercase">Primary Sport</h2>
                    <div className="flex flex-wrap gap-2">
                        {SPORTS.map(s => (
                            <button type="button" key={s} onClick={() => setPrimarySport(s)} className={`pill ${primarySport === s ? 'pill-active' : ''}`}>{s}</button>
                        ))}
                    </div>
                </section>

                {/* Section 3: Location */}
                <section className="space-y-4">
                    <h2 className="text-sm font-bold text-text-muted tracking-wider uppercase">Location</h2>
                    <div className="flex items-center gap-4">
                        <button type="button" onClick={handleGetLocation} className="btn-primary w-fit text-sm px-4 py-2 flex gap-2">
                            {gettingLocation ? <Loader2 className="animate-spin w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                            Use my location
                        </button>
                        <span className="text-text-muted text-sm">or</span>
                    </div>
                    <input type="text" placeholder="Enter locality manually" required value={locationLocality} onChange={e => setLocationLocality(e.target.value)} className="input-field" />
                </section>

                {/* Sticky CTA */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border flex justify-center pb-8 z-10">
                    <button
                        type="submit"
                        disabled={!isFormValid || isLoading}
                        className="btn-primary w-full max-w-md disabled:opacity-50 disabled:cursor-not-allowed group shadow-glow text-lg py-4"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={24} /> : (
                            <>
                                Find Physios
                                <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                            </>
                        )}
                    </button>
                </div>

            </form>
        </div>
    );
}
