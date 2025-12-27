import React from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createHoroscope, fetchHouseSystems, fetchLanguages, fetchTimezone, searchPlaces } from '../../api/horoscope-api';

export function HoroscopeForm({ onResult }:{ onResult:(d:any)=>void }) {
  const initialState = React.useMemo(()=> {
    const base = { birthDateTime:'2000-01-01T06:30:00', place:'Chennai,IN', tzOffset:5.5, lat:'', lon:'', sendToAgent:false, sendToAgentMode:'summary', ayanamsaMode:'TRUE_CITRA', houseSystem:'DEFAULT', calcType: 'drik', language:'en' };
    try {
      const saved = localStorage.getItem('horoForm');
      if(saved){
        const parsed = JSON.parse(saved);
        if(!parsed.birthDateTime || parsed.birthDateTime.length < 16) {
          parsed.birthDateTime = base.birthDateTime;
        }
        return { ...base, ...parsed };
      }
    } catch {}
    return base;
  },[]);
  const [state,setState] = React.useState(initialState);
  const [detectedTz,setDetectedTz] = React.useState<string>('');
  const [placeQuery,setPlaceQuery] = React.useState('');
  const [placeResults,setPlaceResults] = React.useState<any[]>([]);
  const [houseSystems,setHouseSystems] = React.useState<{key:string|number;label:string}[]|null>(null);
  const [showAllHouse,setShowAllHouse] = React.useState(false);
  const [tzGuess,setTzGuess] = React.useState<string>('');
  const [geoBusy,setGeoBusy] = React.useState(false);
  const { data: languagesData } = useQuery({ queryKey:['languages'], queryFn: fetchLanguages, staleTime: 86400000, initialData: [{ label:'English', code:'en' }] });
  const languageOptions = (languagesData && languagesData.length>0 ? languagesData : [{ label:'English', code:'en' }]);
  
  React.useEffect(()=>{ let active=true; const run= async()=>{ if(placeQuery.length<2){ setPlaceResults([]); return; } try{ const r= await searchPlaces(placeQuery); if(active) setPlaceResults(r);}catch{} }; run(); return ()=>{active=false}; },[placeQuery]);
  
  const applyPlace = (p:any)=> { setState((s:any)=> ({...s, place: p.label, lat: String(p.latitude), lon: String(p.longitude), tzOffset: p.tzOffsetHours })); setPlaceQuery(''); setPlaceResults([]); };
  const [errors,setErrors] = React.useState<string[]>([]);
  
  const validate = React.useCallback((s=state)=>{
    const e:string[] = [];
    if(!s.birthDateTime || s.birthDateTime.length < 16) e.push('Birth datetime required');
    if(isNaN(Number(s.tzOffset)) || s.tzOffset < -14 || s.tzOffset > 14) e.push('TZ offset must be between -14 and 14');
    if(s.lat){ const v = parseFloat(s.lat); if(isNaN(v) || v<-90 || v>90) e.push('Latitude must be -90..90'); }
    if(s.lon){ const v = parseFloat(s.lon); if(isNaN(v) || v<-180 || v>180) e.push('Longitude must be -180..180'); }
    setErrors(e); return e;
  },[state]);
  
  React.useEffect(()=>{ validate(); },[state,validate]);
  React.useEffect(()=> { try { localStorage.setItem('horoForm', JSON.stringify(state)); } catch {} },[state]);
  
  const mut = useMutation({ mutationFn: async ()=> {
    const e = validate(); if(e.length) throw new Error('Invalid form');
    if(!state.birthDateTime || state.birthDateTime.length < 19) {
      throw new Error('Invalid birth date/time format');
    }
    const loc:any = { place: state.place, tzOffset: state.tzOffset };
    if(state.lat) loc.latitude = parseFloat(state.lat);
    if(state.lon) loc.longitude = parseFloat(state.lon);
    return createHoroscope({ birthDateTime: state.birthDateTime, location: loc, sendToAgent: state.sendToAgent, sendToAgentMode: state.sendToAgentMode, language: state.language || 'en', ayanamsaMode: state.ayanamsaMode, houseSystem: state.houseSystem, calcType: state.calcType });
  }, onSuccess: async (result) => {
    onResult(result);
    
    // Auto-save for authenticated users (non-blocking)
    try {
      const storedUser = localStorage.getItem('astro_user');
      if (storedUser && result?.meta?.requestId) {
        const userData = JSON.parse(storedUser);
        if (userData.token) {
          // Run auto-save in background without waiting
          (async () => {
            try {
              const { api } = await import('../../api/horoscope-api');
              await api.post('/api/horoscope/store', {}, {
                params: { request_id: result.meta.requestId },
                timeout: 10000 // 10 second timeout for auto-save
              });
              console.log('✓ Horoscope auto-saved to database for user:', userData.email);
            } catch (saveErr: any) {
              // Silently log auto-save failures - don't interrupt user flow
              if (saveErr?.response?.status === 401) {
                console.info('Auto-save skipped: User not authenticated');
              } else if (saveErr?.response?.status === 404) {
                console.warn('Auto-save failed: Horoscope not found in cache (may have expired)');
              } else {
                console.warn('Auto-save failed (non-critical):', saveErr?.message || saveErr);
              }
            }
          })();
        }
      }
    } catch (err) {
      // Silently handle localStorage or parsing errors
      console.debug('Auto-save initialization skipped:', err);
    }
  } });
  
  const haveErrors = errors.length>0;
  
  return (
    <form onSubmit={e=> {e.preventDefault(); if(!haveErrors) mut.mutate();}} className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <label className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900 mb-2">Date of Birth</span>
          <div className="flex gap-2">
            <input 
              type="datetime-local" 
              value={state.birthDateTime?.slice(0,16) || ''} 
              onChange={e=> setState({...state,birthDateTime:e.target.value ? e.target.value+':00' : '2000-01-01T06:30:00'})} 
              className="neo-input flex-1 text-sm"
              placeholder="Select date and time"
            />
            <button 
              type="button" 
              onClick={()=> { 
                const d=new Date(); 
                const pad=(n:number)=> String(n).padStart(2,'0'); 
                const val = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`; 
                setState((s:any)=> ({...s,birthDateTime:val})); 
              }} 
              className="px-4 py-2 bg-black hover:bg-gray-800 text-white text-xs font-semibold rounded-xl transition-all"
            >
              Now
            </button>
          </div>
        </label>
        
        <label className="flex flex-col relative">
          <span className="text-sm font-semibold text-gray-900 mb-2">Place of Birth</span>
          <input 
            value={placeQuery || state.place} 
            onChange={e=> { setPlaceQuery(e.target.value); setState({...state,place:e.target.value}); }} 
            className="neo-input text-sm" 
            placeholder="Enter city name"
          />
          {placeResults.length>0 && (
            <div className="absolute top-full left-0 right-0 z-20 bg-white border border-gray-200 shadow-xl rounded-xl text-xs max-h-60 overflow-auto mt-2">
              {placeResults.map(p=> (
                <button 
                  type="button" 
                  key={p.label+String(p.latitude)} 
                  onClick={()=> applyPlace(p)} 
                  className="block w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b last:border-0"
                >
                  <div className="font-semibold text-gray-900">{p.label}</div>
                  <div className="text-gray-500">({p.latitude.toFixed(2)}, {p.longitude.toFixed(2)}) GMT{p.tzOffsetHours>=0?'+':''}{p.tzOffsetHours}</div>
                </button>
              ))}
            </div>
          )}
        </label>
        
        <label className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900 mb-2">Time Zone Offset</span>
          <input 
            type="number" 
            step="0.25" 
            value={state.tzOffset} 
            onChange={e=> setState({...state,tzOffset:parseFloat(e.target.value)})} 
            className="neo-input text-sm"
            placeholder="Hours from UTC"
          />
        </label>
        
        <label className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900 mb-2">Language</span>
          <select 
            value={state.language || 'en'} 
            onChange={e=> setState({...state, language: e.target.value})} 
            className="neo-input text-sm"
          >
            {languageOptions.map(opt=> <option key={opt.code} value={opt.code}>{opt.label}</option>)}
          </select>
        </label>
        
        <label className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900 mb-2">Latitude</span>
          <input 
            placeholder="Optional" 
            value={state.lat} 
            onChange={e=> setState({...state,lat:e.target.value})} 
            className="neo-input text-sm"
          />
        </label>
        
        <label className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900 mb-2">Longitude</span>
          <input 
            placeholder="Optional" 
            value={state.lon} 
            onChange={e=> setState({...state,lon:e.target.value})} 
            className="neo-input text-sm"
          />
        </label>
        
        <label className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900 mb-2">Ayanamsa</span>
          <select 
            value={state.ayanamsaMode} 
            onChange={e=> setState({...state, ayanamsaMode:e.target.value})} 
            className="neo-input text-sm"
          >
            <option value="TRUE_CITRA">Lahiri (Chitra)</option>
            <option value="LAHIRI">Lahiri (Legacy)</option>
            <option value="RAMAN">Raman</option>
            <option value="KP">KP</option>
            <option value="SURYASIDDHANTA">Surya Siddhanta</option>
          </select>
        </label>
        
        <label className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900 mb-2">Calculation Type</span>
          <select 
            value={state.calcType} 
            onChange={e=> setState({...state, calcType: e.target.value})} 
            className="neo-input text-sm"
          >
            <option value="drik">Drik (default)</option>
            <option value="ss">Surya Siddhanta</option>
          </select>
        </label>
        
        <label className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900 mb-2">House System</span>
          <select 
            value={state.houseSystem} 
            onChange={e=> setState({...state, houseSystem:e.target.value})} 
            onFocus={async()=> { if(!houseSystems){ try { const r = await fetchHouseSystems(); setHouseSystems(r.items); } catch{} } }} 
            className="neo-input text-sm"
          >
            <option value="DEFAULT">Default</option>
            <option value="equal">Equal</option>
            <option value="sripati">Sripati</option>
            <option value="placidus">Placidus</option>
            {showAllHouse && houseSystems && houseSystems.filter(h=> !['1','2','3','4'].includes(String(h.key))).map(h=> <option key={h.key} value={String(h.key)}>{h.label}</option>)}
          </select>
        </label>
      </div>
      
      {haveErrors && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <ul className="text-sm text-red-600 list-disc ml-4 space-y-1">
            {errors.map(er=> <li key={er}>{er}</li>)}
          </ul>
        </div>
      )}
      
      {mut.error && !haveErrors && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-600">{(mut.error as any).message || 'Error generating horoscope'}</p>
        </div>
      )}
      
      <div className="flex justify-center pt-4">
        <button 
          disabled={mut.isPending || haveErrors} 
          className="neo-button disabled:opacity-50 disabled:cursor-not-allowed text-base"
        >
          {mut.isPending ? 'Generating Your Chart...' : 'Generate Horoscope'}
        </button>
      </div>
    </form>
  );
}
