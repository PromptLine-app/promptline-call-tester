import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { initializeDevice } from '../lib/twilio';
import { Device, Call } from '@twilio/voice-sdk';
import { PhoneOff, PhoneCall, Loader2, AlertCircle } from 'lucide-react';

interface Business {
  id: string;
  name: string;
  phone: string | null;
}

type CallStatus = 'idle' | 'connecting' | 'connected' | 'disconnecting';

export default function CallPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const deviceRef = useRef<Device | null>(null);
  const callRef = useRef<Call | null>(null);

  useEffect(() => {
    fetchBusinesses();
    return () => {
      if (callRef.current) callRef.current.disconnect();
      if (deviceRef.current) deviceRef.current.destroy();
    };
  }, []);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('list-businesses');

      if (error) throw error;

      const businessesData: Business[] = data?.businesses || [];
      setBusinesses(businessesData);

      const firstValid = businessesData.find(b => b.phone);
      if (firstValid) {
        setSelectedBusinessId(firstValid.id);
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
      setErrorMsg('Failed to load businesses. Check console.');
    } finally {
      setLoading(false);
    }
  };

  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);

  const handleStartCall = async () => {
    if (!selectedBusiness?.phone) {
      setErrorMsg('Selected business does not have a valid phone number.');
      return;
    }

    setErrorMsg('');
    setCallStatus('connecting');

    try {
      let device = deviceRef.current;
      if (!device) {
        device = await initializeDevice();
        deviceRef.current = device;
      }

      console.log('Connecting to:', selectedBusiness.phone);
      const call = await device.connect({
        params: {
          targetNumber: selectedBusiness.phone
        }
      });
      
      callRef.current = call;

      call.on('accept', () => {
        setCallStatus('connected');
      });

      call.on('disconnect', () => {
        setCallStatus('idle');
        callRef.current = null;
      });

      call.on('cancel', () => {
        setCallStatus('idle');
        callRef.current = null;
      });

      call.on('error', (error) => {
        console.error('Call error:', error);
        setCallStatus('idle');
        callRef.current = null;
        setErrorMsg(error.message || 'Call failed');
      });

    } catch (error: any) {
      console.error('Error starting call:', error);
      setCallStatus('idle');
      setErrorMsg(error.message || 'Failed to start call');
    }
  };

  const handleEndCall = () => {
    setCallStatus('disconnecting');
    if (callRef.current) {
      callRef.current.disconnect();
    }
  };

  return (
    <div className="page-content ca-call-page">
      <div className="container animate-fade-in" style={{ padding: 0 }}>
        <h1 className="title" style={{ fontSize: '1.75rem', fontWeight: 700 }}>PromptLine Call Tester</h1>
        <p className="subtitle" style={{ fontSize: '0.9rem' }}>Select a business and test their AI voice agent in your browser.</p>

        <div className="card tester-card" style={{ marginTop: '1rem' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 0' }}>
              <Loader2 className="spinner" style={{ color: 'hsl(var(--primary))', width: '2rem', height: '2rem', marginBottom: '1rem' }} />
              <p className="text-muted">Loading businesses...</p>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label className="label">Select Business to Test</label>
                <select 
                  className="select-input"
                  value={selectedBusinessId}
                  onChange={(e) => setSelectedBusinessId(e.target.value)}
                  disabled={callStatus !== 'idle'}
                >
                  <option value="" disabled>-- Select a Business --</option>
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} {b.phone ? `(${b.phone})` : '(No phone)'}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                <span className={`status-badge ${callStatus === 'idle' ? 'status-badge--canceled' : callStatus === 'connecting' ? 'status-badge--pending' : callStatus === 'connected' ? 'status-badge--active' : 'status-badge--suspended'}`}>
                  {callStatus === 'idle' ? 'Ready to Call' :
                   callStatus === 'connecting' ? 'Connecting...' :
                   callStatus === 'connected' ? 'Connected' : 'Disconnecting...'}
                </span>
              </div>

              {errorMsg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--destructive))', fontSize: '0.875rem' }}>
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {callStatus === 'connected' ? (
                <button 
                  className="btn btn--destructive" 
                  style={{ width: '100%', marginTop: '0.5rem' }}
                  onClick={handleEndCall}
                  disabled={callStatus === 'disconnecting'}
                >
                  {callStatus === 'disconnecting' ? <Loader2 className="spinner" size={18} /> : <PhoneOff size={18} />}
                  End Call
                </button>
              ) : (
                <button 
                  className="btn btn--primary" 
                  style={{ width: '100%', marginTop: '0.5rem' }}
                  onClick={handleStartCall}
                  disabled={!selectedBusinessId || callStatus !== 'idle' || !selectedBusiness?.phone}
                >
                  {callStatus === 'connecting' ? <Loader2 className="spinner" size={18} /> : <PhoneCall size={18} />}
                  {callStatus === 'connecting' ? 'Connecting...' : 'Start Test Call'}
                </button>
              )}
              
              {callStatus === 'idle' && (
                <p className="text-muted" style={{ fontSize: '0.75rem', textAlign: 'center', marginTop: '0.5rem' }}>
                  Uses your browser's microphone • No physical phone required
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
