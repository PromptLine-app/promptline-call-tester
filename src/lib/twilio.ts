import { supabase } from './supabase';
import { Device, Call } from '@twilio/voice-sdk';

export const initializeDevice = async (): Promise<Device> => {
  try {
    console.log('Fetching Twilio token...');
    
    // Calls the twilio-token edge function
    const { data, error } = await supabase.functions.invoke('twilio-token');
    
    if (error) {
      console.error('Error fetching token:', error);
      throw new Error('Failed to get call token');
    }

    if (!data?.token) {
      console.error('No token in response:', data);
      throw new Error('Invalid token response');
    }

    console.log('Token received, initializing device...');

    const device = new Device(data.token, {
      codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
      logLevel: 1,
    });

    device.on('registered', () => {
      console.log('Device registered successfully');
    });

    device.on('error', (error) => {
      console.error('Device error:', error);
    });

    await device.register();
    
    return device;
  } catch (error) {
    console.error('Failed to initialize device:', error);
    throw error;
  }
};
