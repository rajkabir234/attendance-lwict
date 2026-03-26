'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface GeofencedCheckInButtonProps {
  officeLat: number;
  officeLng: number;
  radiusMeters: number;
  shiftStart: string;
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default function GeofencedCheckInButton({
  officeLat,
  officeLng,
  radiusMeters,
  shiftStart,
}: GeofencedCheckInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [isWithinGeofence, setIsWithinGeofence] = useState(false);

  useEffect(() => {
    // Check geofence on component mount
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const distance = calculateDistance(
            position.coords.latitude,
            position.coords.longitude,
            officeLat,
            officeLng
          );
          setIsWithinGeofence(distance <= radiusMeters);
        },
        () => {
          setMessage('Unable to access location. Please enable geolocation.');
          setIsWithinGeofence(false);
        }
      );
    } else {
      setMessage('Geolocation is not supported by your browser.');
      setIsWithinGeofence(false);
    }
  }, [officeLat, officeLng, radiusMeters]);

  const handleCheckIn = async () => {
    setIsLoading(true);
    setStatus('checking');

    try {
      if (!('geolocation' in navigator)) {
        throw new Error('Geolocation not supported');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const distance = calculateDistance(
        position.coords.latitude,
        position.coords.longitude,
        officeLat,
        officeLng
      );

      if (distance > radiusMeters) {
        setStatus('error');
        setMessage(
          `You are ${Math.round(distance - radiusMeters)}m outside the geofence. Cannot check in.`
        );
        setIsLoading(false);
        return;
      }

      // TODO: Send check-in request to backend
      // const response = await fetch('/api/attendance/check-in', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     latitude: position.coords.latitude,
      //     longitude: position.coords.longitude,
      //     timestamp: new Date().toISOString(),
      //   }),
      // });

      setStatus('success');
      setMessage('You have successfully checked in!');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Check-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleCheckIn}
        disabled={!isWithinGeofence || isLoading}
        className="w-full"
      >
        {isLoading ? 'Checking In...' : 'Check In'}
      </Button>

      {!isWithinGeofence && (
        <p className="text-sm text-red-600">
          You must be within the office geofence to check in.
        </p>
      )}

      {message && (
        <p className={`text-sm ${
          status === 'success' ? 'text-green-600' : 'text-red-600'
        }`}>
          {message}
        </p>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        <p>Shift Start: {shiftStart ? new Date(shiftStart).toLocaleTimeString() : 'Not set'}</p>
        <p>Geofence Radius: {radiusMeters}m</p>
      </div>
    </div>
  );
}
