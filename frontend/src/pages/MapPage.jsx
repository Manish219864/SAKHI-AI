import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

const MapPage = () => {
    const [heatPoints, setHeatPoints] = useState([]);

    useEffect(() => {
        // Fetch heatmap data
        const fetchData = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/risk/heatmap`);
                setHeatPoints(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="relative w-full" style={{ height: 'calc(100vh - 64px)' }}>
                {/* Fallback/Dummy Map Background if Leaflet fails to load tiles or for presentation */}
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center pointer-events-none z-0">
                    <span className="text-gray-400">Loading Map...</span>
                </div>

                <MapContainer center={[12.9716, 77.5946]} zoom={13} scrollWheelZoom={true} className="h-full w-full relative z-10">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {heatPoints.map((point, idx) => (
                        <CircleMarker
                            key={idx}
                            center={[point.lat, point.lng]}
                            pathOptions={{
                                color: point.intensity > 0.7 ? 'red' : point.intensity > 0.4 ? 'orange' : 'green',
                                fillColor: point.intensity > 0.7 ? 'red' : point.intensity > 0.4 ? 'orange' : 'green',
                                fillOpacity: 0.5
                            }}
                            radius={20}
                        >
                            <Popup>
                                Safety Score: {Math.round((1 - point.intensity) * 100)}%
                                <br />
                                Risk Level: {point.intensity > 0.7 ? 'High' : 'Moderate'}
                            </Popup>
                        </CircleMarker>
                    ))}
                </MapContainer>

                <div className="absolute bottom-10 left-10 bg-white p-4 rounded-lg shadow-lg z-[1000]">
                    <h3 className="font-bold mb-2">Safety Legend</h3>
                    <div className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span> Safe Zone</div>
                    <div className="flex items-center"><span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span> Moderate Risk</div>
                    <div className="flex items-center"><span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span> High Risk Area</div>
                </div>
            </div>
        </div>
    );
};

export default MapPage;
