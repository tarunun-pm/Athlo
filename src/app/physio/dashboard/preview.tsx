import PhysioDashboard from './page';

// Simplified mock wrapper for preview purposes
export default function PreviewPhysio() {
    const mockProfile = {
        id: 'mock-1',
        first_name: 'Ruben',
        last_name: 'George',
        sport_specializations: ['Basketball'],
        injury_specializations: ['Shoulder'],
        location_locality: 'Delhi',
        verification_status: 'approved',
        is_availability_set: true,
    };

    return (
        <div className="max-w-7xl mx-auto h-full space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                        Welcome back, Dr. Ruben
                    </h1>
                    <p className="text-text-secondary text-sm">
                        Overview of your practice and schedule
                    </p>
                </div>
            </div>

            {/* Dynamic import of approved dashboard to avoid server action errors in static preview */}
            <iframe src="/preview-content" className="w-full h-[800px] border-0" />
        </div>
    );
}
