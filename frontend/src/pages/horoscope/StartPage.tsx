import React from 'react';
import { HoroscopeForm } from '../../components/horoscope/HoroscopeForm';
import { ChartsView } from '../../components/horoscope/ChartsView';
import { DhasaPanel } from '../../components/horoscope/DhasaPanel';
import { AnalysisPanel } from '../../components/horoscope/AnalysisPanel';
import { TajakaPanel } from '../../components/horoscope/TajakaPanel';
import DivisionalChartsPage from '../../components/horoscope/DivisionalChartsPage';

export default function StartPage() {
  const [result, setResult] = React.useState<any>(null);
  const [activeTab, setActiveTab] = React.useState<'charts'|'divisions'|'dhasas'|'analysis'|'tajaka'>('charts');

  const requestId = result?.meta?.requestId;
  const birthYear = result?.rasiChart?.year || new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gray-100 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          <header className="neo-card p-8 bg-gradient-to-br from-gray-900 via-black to-gray-950 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Vedic Astrology</h1>
                <p className="text-gray-300">Generate your complete birth chart and astrological analysis</p>
              </div>
              {requestId && (
                <div className="text-sm text-gray-400 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  ID: {requestId.slice(0, 8)}...
                </div>
              )}
            </div>
          </header>

          <div className="neo-card p-8 bg-white border border-gray-200">
            <HoroscopeForm onResult={setResult} />
          </div>

          {result && (
            <div className="space-y-6">
              <div className="neo-card bg-white p-2 overflow-x-auto border border-gray-200">
                <div className="flex space-x-2">
                  {(['charts', 'divisions', 'dhasas', 'analysis', 'tajaka'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-3 rounded-xl text-sm font-semibold capitalize transition-all ${
                        activeTab === tab 
                          ? 'bg-black text-white shadow-lg' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-h-[500px]">
                {activeTab === 'charts' && <ChartsView result={result} />}
                {activeTab === 'divisions' && <DivisionalChartsPage result={result} />}
                {activeTab === 'dhasas' && requestId && <DhasaPanel requestId={requestId} />}
                {activeTab === 'analysis' && requestId && <AnalysisPanel requestId={requestId} />}
                {activeTab === 'tajaka' && requestId && <TajakaPanel requestId={requestId} birthYear={birthYear} />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
