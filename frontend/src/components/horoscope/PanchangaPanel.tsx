import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPanchanga, fetchTransitPanchanga } from '../../api/horoscope-api';

export function PanchangaPanel({ requestId }: { requestId: string }) {
    const [showTransitDate, setShowTransitDate] = React.useState(false);
    const [transitDate, setTransitDate] = React.useState('');

    const { data, isLoading, error } = useQuery({
        queryKey: ['panchanga', requestId, showTransitDate, transitDate],
        queryFn: async () => {
            if (showTransitDate && transitDate) {
                return fetchTransitPanchanga(requestId, { dateTime: transitDate });
            }
            return fetchPanchanga(requestId);
        },
        enabled: !!requestId
    });

    if (isLoading) return <div className="p-4 text-gray-500">Loading Panchanga...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {(error as Error).message}</div>;
    if (!data) return <div className="p-4 text-gray-500">No data</div>;

    const calendar = data.calendar || data || {};

    // Group keys by category for better display
    const timeKeys = Object.keys(calendar).filter(k =>
        k.includes('Rise') || k.includes('Set') || k.includes('Muhurtham') || k.includes('Time')
    );

    const panchangaKeys = Object.keys(calendar).filter(k =>
        k.includes('Tithi') || k.includes('Nakshatra') || k.includes('Yoga') ||
        k.includes('Karana') || k.includes('Vaara') || k.includes('Paksha') ||
        k.includes('Maasa') || k.includes('Month')
    );

    const otherKeys = Object.keys(calendar).filter(k =>
        !timeKeys.includes(k) && !panchangaKeys.includes(k)
    );

    return (
        <div className="p-4 space-y-4">
            {/* Date Type Selector */}
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            checked={!showTransitDate}
                            onChange={() => setShowTransitDate(false)}
                            className="form-radio"
                        />
                        <span className="text-sm font-medium text-gray-900">Birth Chart Panchanga</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            checked={showTransitDate}
                            onChange={() => setShowTransitDate(true)}
                            className="form-radio"
                        />
                        <span className="text-sm font-medium text-gray-900">Transit Date Panchanga</span>
                    </label>
                </div>

                {showTransitDate && (
                    <input
                        type="datetime-local"
                        value={transitDate}
                        onChange={(e) => setTransitDate(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white text-gray-900"
                    />
                )}
            </div>

            {/* Panchanga Elements */}
            {panchangaKeys.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
                        Panchanga Elements
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {panchangaKeys.map((key, idx) => {
                            const colors = [
                                'from-purple-50 to-purple-100 border-purple-200',
                                'from-blue-50 to-blue-100 border-blue-200',
                                'from-green-50 to-green-100 border-green-200',
                                'from-yellow-50 to-yellow-100 border-yellow-200',
                                'from-indigo-50 to-indigo-100 border-indigo-200',
                                'from-pink-50 to-pink-100 border-pink-200'
                            ];
                            const colorClass = colors[idx % colors.length];

                            return (
                                <div key={key} className={`p-3 bg-gradient-to-br ${colorClass} rounded-lg shadow-sm border`}>
                                    <h3 className="text-xs font-semibold text-gray-700 mb-1">{key}</h3>
                                    <p className="text-sm font-medium text-gray-900">{calendar[key]}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Sun & Moon Timings */}
            {timeKeys.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
                        Timings
                    </h4>
                    <div className="p-4 bg-gradient-to-r from-orange-50 via-yellow-50 to-blue-50 rounded-lg shadow border border-orange-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {timeKeys.map(key => (
                                <div key={key}>
                                    <span className="text-xs text-gray-600">{key}:</span>
                                    <p className="text-sm font-semibold text-gray-900">{calendar[key]}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Other Info */}
            {otherKeys.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
                        Additional Info
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {otherKeys.map(key => (
                            <div key={key} className="p-3 bg-gray-50 rounded border border-gray-200">
                                <span className="text-xs text-gray-600">{key}:</span>
                                <p className="text-sm font-medium text-gray-900">{calendar[key]}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
