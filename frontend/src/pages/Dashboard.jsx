import React, { useState } from 'react';
import SOSButton from '../components/SOSButton'; // We will create this next
import Navbar from '../components/Navbar';
import { AlertTriangle, MapPin, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();

    // Redirect if not logged in
    if (!user) {
        // Simple redirect mock, better to use useEffect in real app
        setTimeout(() => navigate('/login'), 100);
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* SOS Section - Premium Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center text-center border-l-4 border-red-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <AlertTriangle size={150} />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2 z-10">SOS Emergency</h2>
                        <p className="text-gray-500 mb-8 z-10">Press and hold for 3 seconds to broadcast distress signal.</p>
                        <div className="z-10">
                            <SOSButton userId={user._id} />
                        </div>
                    </div>

                    {/* Safety Status & Quick Actions */}
                    <div className="space-y-6">
                        {/* Status Card */}
                        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6 shadow-md border border-green-200 flex items-center">
                            <div className="p-4 rounded-full bg-green-500 text-white shadow-lg">
                                <Activity className="h-8 w-8" />
                            </div>
                            <div className="ml-5">
                                <p className="text-sm font-bold text-green-700 uppercase tracking-wide">Status</p>
                                <p className="text-2xl font-bold text-gray-900">Safe Zone</p>
                            </div>
                        </div>

                        {/* Location Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex items-center">
                            <div className="p-4 rounded-full bg-blue-500 text-white shadow-lg">
                                <MapPin className="h-8 w-8" />
                            </div>
                            <div className="ml-5">
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Location</p>
                                <p className="text-xl font-semibold text-gray-900">Koramangala, Bangalore</p>
                            </div>
                        </div>

                        {/* Predictive AI Card */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute -right-10 -top-10 bg-white opacity-10 rounded-full h-40 w-40 transform group-hover:scale-110 transition-transform"></div>
                            <h3 className="text-2xl font-bold mb-2">Predictive Risk AI</h3>
                            <p className="text-indigo-100 mb-6">Current Area Safety Score: <span className="font-bold text-white text-xl">87%</span></p>
                            <button onClick={() => navigate('/map')} className="w-full bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-50 transition-colors flex items-center justify-center">
                                View Safety Heatmap <Activity className="ml-2 h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
