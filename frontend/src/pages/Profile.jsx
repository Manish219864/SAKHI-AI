import React from 'react';
import Navbar from '../components/Navbar';
import { User, Phone, MapPin, Shield } from 'lucide-react';

const Profile = () => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) return <div className="text-center mt-20">Please log in.</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-4xl mx-auto py-10 px-4">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="bg-primary px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-white">Unified Safety Profile</h3>
                        <p className="mt-1 max-w-2xl text-sm text-pink-100">Your national identity across all safety apps.</p>
                    </div>
                    <div className="border-t border-gray-200">
                        <dl>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                    <Shield className="mr-2 h-4 w-4" /> Sakhi Unified ID
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono font-bold text-lg">
                                    {user.sakhiId || 'SAKHI-PENDING'}
                                </dd>
                            </div>
                            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                    <User className="mr-2 h-4 w-4" /> Full Name
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.name}</dd>
                            </div>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                    <Phone className="mr-2 h-4 w-4" /> Phone Number
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.phoneNumber}</dd>
                            </div>
                            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                    <MapPin className="mr-2 h-4 w-4" /> Home Address
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {user.homeAddress?.address || 'Not Provided'}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>

                <div className="mt-8">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Emergency Contacts</h4>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {user.emergencyContacts && user.emergencyContacts.length > 0 ? (
                            user.emergencyContacts.map((contact, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-900">{contact.name}</p>
                                        <p className="text-sm text-gray-500">{contact.phone}</p>
                                    </div>
                                    <button className="text-primary hover:text-pink-700 font-medium text-sm">Edit</button>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">No contacts added yet.</p>
                        )}
                        <button className="border-2 border-dashed border-gray-300 p-4 rounded-lg text-gray-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center">
                            + Add New Contact
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
