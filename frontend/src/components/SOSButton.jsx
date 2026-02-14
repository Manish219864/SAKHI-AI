import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle } from 'lucide-react';

const SOSButton = ({ userId }) => {
    const [isPressed, setIsPressed] = useState(false);
    const [progress, setProgress] = useState(0);
    const [alertSent, setAlertSent] = useState(false);

    useEffect(() => {
        let interval;
        if (isPressed && progress < 100) {
            interval = setInterval(() => {
                setProgress((prev) => prev + 2);
            }, 50);
        } else if (!isPressed && progress > 0) {
            setProgress(0);
        }

        if (progress >= 100 && !alertSent) {
            triggerSOS();
        }

        return () => clearInterval(interval);
    }, [isPressed, progress, alertSent]);

    const triggerSOS = async () => {
        setAlertSent(true);
        navigator.vibrate([200, 100, 200]); // Haptic feedback
        try {
            await axios.post('http://localhost:5000/api/alerts', {
                userId,
                location: { lat: 12.9716, lng: 77.5946, address: "Koramangala, Bangalore" }, // Mock location
                type: 'SOS',
                batteryLevel: 85
            });
            alert('SOS ALERT SENT! Help is on the way.');
        } catch (err) {
            console.error(err);
            alert('Failed to send SOS. Try again!');
        } finally {
            setIsPressed(false);
            setProgress(0);
            setTimeout(() => setAlertSent(false), 5000); // Reset state after 5s
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <button
                onMouseDown={() => setIsPressed(true)}
                onMouseUp={() => setIsPressed(false)}
                onMouseLeave={() => setIsPressed(false)}
                onTouchStart={() => setIsPressed(true)}
                onTouchEnd={() => setIsPressed(false)}
                className={`w-64 h-64 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 transform ${alertSent ? 'bg-green-600 scale-95' : 'bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-90'
                    } relative overflow-hidden`}
            >
                {/* Progress Overlay */}
                <div
                    className="absolute bottom-0 left-0 right-0 bg-red-800 transition-all duration-75 ease-linear opacity-50"
                    style={{ height: `${progress}%` }}
                />

                <div className="z-10 text-white flex flex-col items-center">
                    <AlertTriangle size={64} className="mb-2 animate-pulse" />
                    <span className="text-3xl font-black tracking-wider">
                        {alertSent ? 'SENT!' : 'SOS'}
                    </span>
                    <span className="text-xs uppercase mt-2 font-bold tracking-widest">
                        {alertSent ? 'Help notified' : 'Hold 3s'}
                    </span>
                </div>
            </button>
        </div>
    );
};

export default SOSButton;
