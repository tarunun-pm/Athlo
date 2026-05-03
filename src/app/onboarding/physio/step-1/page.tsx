'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const SPORTS = ['Cricket', 'Football', 'Badminton', 'Tennis', 'Athletics', 'Swimming', 'Wrestling', 'Kabaddi', 'Other'];
const INJURIES = ['ACL/Knee', 'Shoulder/Rotator Cuff', 'Ankle/Foot', 'Back/Spine', 'Overuse/Stress', 'Post-surgical Rehab', 'Muscle Tears', 'Other'];
const LANGUAGES = ['Hindi', 'English', 'Punjabi', 'Bengali', 'Tamil', 'Other'];
const GENDERS = ['Male', 'Female', 'Prefer not to say'];

export default function PhysioStep1() {
    const router = useRouter();
    const supabase = createClient();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');

    const [sports, setSports] = useState<string[]>([]);
    const [injuries, setInjuries] = useState<string[]>([]);
    const [languages, setLanguages] = useState<string[]>([]);

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
        age !== '' && parseInt(age) >= 21 && parseInt(age) <= 70 &&
        sports.length > 0 &&
        injuries.length > 0 &&
        locationLocality.trim() !== '';

    const toggleArray = (setter: React.Dispatch<React.SetStateAction<string[]>>, array: string[], value: string) => {
        setter(array.includes(value) ? array.filter(i => i !== value) : [...array, value]);
    };

    const handleGetLocation = () => {
        setGettingLocation(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    setLocationLat(pos.coords.latitude);
                    setLocationLng(pos.coords.longitude);
                    // Reverse geocoding could be done here. For now, we mock the locality name based on success.
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

            const { error: dbError } = await supabase.from('physio_profiles').insert({
                id: user.id,
                first_name: firstName,
                last_name: lastName,
                gender,
                age: parseInt(age),
                sport_specializations: sports,
                injury_specializations: injuries,
                languages,
                location_locality: locationLocality,
                location_lat: locationLat,
                location_lng: locationLng,
            });

            if (dbError) throw dbError;

            router.push('/onboarding/physio/step-2');
        } catch (err: any) {
            // It's possible the row already exists if they left and came back, so we do an upsert
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { error: updateError } = await supabase.from('physio_profiles').update({
                        first_name: firstName,
                        last_name: lastName,
                        gender,
                        age: parseInt(age),
                        sport_specializations: sports,
                        injury_specializations: injuries,
                        languages,
                        location_locality: locationLocality,
                        location_lat: locationLat,
                        location_lng: locationLng,
                    }).eq('id', user.id);
                    if (updateError) throw updateError;
                    router.push('/onboarding/physio/step-2');
                    return;
                }
            } catch (fallbackErr: any) {
                setError(fallbackErr.message || 'Failed to save profile. Please try again.');
            }
            setError(err.message || 'Failed to save profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen pb-24 max-w-2xl mx-auto p-4 md:p-8">
            {/* Progress Bar */}
            <div className="mb-8">
                <p className="text-text-muted text-sm font-medium mb-2">Step 1 of 2</p>
                <div className="w-full bg-surface border border-border h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-1/2 rounded-full shadow-glow"></div>
                </div>
            </div>

            <h1 className="text-3xl font-syne font-bold text-text-primary mb-8">
                Personal Details
            </h1>

            {error && (
                <div className="bg-error/10 border border-error/50 text-error text-sm p-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-10">

                {/* Section 1: Basic */}
                <section className="space-y-4">
                    <h2 className="text-sm font-bold text-text-muted tracking-wider uppercase">1. Basic Info</h2>
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
                        <input type="number" min="21" max="70" placeholder="Age (21-70)" required value={age} onChange={e => setAge(e.target.value)} className="input-field max-w-[200px]" />
                    </div>
                </section>

                {/* Section 2: Sports */}
                <section className="space-y-4">
                    <h2 className="text-sm font-bold text-text-muted tracking-wider uppercase">2. Sport Specializations</h2>
                    <div className="flex flex-wrap gap-2">
                        {SPORTS.map(s => (
                            <button type="button" key={s} onClick={() => toggleArray(setSports, sports, s)} className={`pill ${sports.includes(s) ? 'pill-active' : ''}`}>{s}</button>
                        ))}
                    </div>
                </section>

                {/* Section 3: Injuries */}
                <section className="space-y-4">
                    <h2 className="text-sm font-bold text-text-muted tracking-wider uppercase">3. Injury Specializations</h2>
                    <div className="flex flex-wrap gap-2">
                        {INJURIES.map(i => (
                            <button type="button" key={i} onClick={() => toggleArray(setInjuries, injuries, i)} className={`pill ${injuries.includes(i) ? 'pill-active' : ''}`}>{i}</button>
                        ))}
                    </div>
                </section>

                {/* Section 4: Location */}
                <section className="space-y-4">
                    <h2 className="text-sm font-bold text-text-muted tracking-wider uppercase">4. Clinic / Base Location</h2>
                    <div className="flex items-center gap-4">
                        <button type="button" onClick={handleGetLocation} className="btn-primary w-fit text-sm px-4 py-2 flex gap-2">
                            {gettingLocation ? <Loader2 className="animate-spin w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                            Use my location
                        </button>
                        <span className="text-text-muted text-sm">or</span>
                    </div>
                    <input type="text" placeholder="Enter locality manually (e.g. Vasant Kunj, Delhi)" required value={locationLocality} onChange={e => setLocationLocality(e.target.value)} className="input-field" />
                </section>

                {/* Section 5: Languages */}
                <section className="space-y-4">
                    <h2 className="text-sm font-bold text-text-muted tracking-wider uppercase">5. Languages (Optional)</h2>
                    <div className="flex flex-wrap gap-2">
                        {LANGUAGES.map(l => (
                            <button type="button" key={l} onClick={() => toggleArray(setLanguages, languages, l)} className={`pill ${languages.includes(l) ? 'pill-active' : ''}`}>{l}</button>
                        ))}
                    </div>
                </section>

                {/* Sticky CTA */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border flex justify-center pb-8 z-10">
                    <button
                        type="submit"
                        disabled={!isFormValid || isLoading}
                        className="btn-primary w-full max-w-md disabled:opacity-50 disabled:cursor-not-allowed group shadow-glow"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                Continue
                                <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                            </>
                        )}
                    </button>
                </div>

            </form>
        </div>
    );
}
