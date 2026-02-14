import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, User, LogOut, Map, Bell } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center">
                            <Shield className="h-8 w-8 text-primary" />
                            <span className="ml-2 text-2xl font-bold text-gray-800">SAKHI</span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link to="/map" className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
                                    <Map className="h-6 w-6" />
                                </Link>
                                <Link to="/profile" className="flex flex-col items-end text-gray-700 hover:text-primary">
                                    <span className="font-medium">{user.name}</span>
                                    <span className="text-xs text-gray-500 font-mono">{user.sakhiId}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-full hover:bg-gray-100 text-red-500"
                                >
                                    <LogOut className="h-6 w-6" />
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="text-primary font-semibold hover:text-secondary">Login</Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
