import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTransit } from '../../api/horoscope-api';

interface TransitPlanet {
    name: string;
    longitudeDMS: string;
    sign: string;
    house: number;
}

interface TransitData {
    requestId: string;
    date: string;
    planets: TransitPlanet[];
}

export function TransitPanel({ requestId }: { requestId: string }) {
    const { data, isLoading, error } = useQuery({
        queryKey: ['transit', requestId],
        queryFn: () => fetchTransit(requestId),
        enabled: !!requestId
    });

    if (isLoading) return <div className="p-4 text-gray-500">Loading Transits...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {(error as Error).message}</div>;
    if (!data || !data.planets) return <div className="p-4 text-gray-500">No transit data</div>;

    const transitData = data as TransitData;

    return (
        <div className="p-4 space-y-4">
            <div className="pb-3 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                    Current Planetary Transits
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    {transitData.date}
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left font-semibold text-gray-700">
                                Planet
                            </th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-700">
                                Sign
                            </th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-700">
                                Longitude
                            </th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-700">
                                House
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {transitData.planets.map((planet, idx) => (
                            <tr
                                key={idx}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-4 py-3 font-medium text-gray-900">
                                    {planet.name}
                                </td>
                                <td className="px-4 py-3 text-gray-700">
                                    {planet.sign}
                                </td>
                                <td className="px-4 py-3 font-mono text-sm text-gray-600">
                                    {planet.longitudeDMS}
                                </td>
                                <td className="px-4 py-3 text-gray-700">
                                    {planet.house}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700">
                    <strong>Note:</strong> Transit positions show current planetary locations relative to your birth chart.
                </p>
            </div>
        </div>
    );
}
