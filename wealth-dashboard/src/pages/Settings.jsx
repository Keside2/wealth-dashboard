import React, { useState, useEffect } from 'react';
import { User, Palette, Globe, LogOut, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Settings.css';

export default function Settings({ currentCurrency, setCurrency }) {
    const { user, logout } = useAuth();
    const [name, setName] = useState(user?.displayName || '');
    const [showToast, setShowToast] = useState(false);

    const handleCurrencyChange = (curr) => {
        setCurrency({ symbol: curr.symbol, label: curr.label });

        // Trigger the popup
        setShowToast(true);

        // Hide it after 3 seconds
        setTimeout(() => setShowToast(false), 3000);
    };

    const currencies = [
        { symbol: '$', label: 'USD' },
        { symbol: '₦', label: 'NGN' },
        { symbol: '€', label: 'EUR' }
    ];
    return (
        <div className="settings-container">
            <header className="settings-header">
                <h1 className="settings-title">Settings</h1>
                <p className="settings-subtitle">Personalize your Wealthify experience.</p>
            </header>

            {/* THE POPUP (TOAST) */}
            <div className={`currency-toast ${showToast ? 'show' : ''}`}>
                <CheckCircle size={18} />
                <span>Currency updated to {currentCurrency?.label}</span>
            </div>



            <div className="settings-grid">
                {/* SIDE TABS */}
                <div className="settings-tabs">
                    <button className="tab-btn active">
                        <User size={20} /> Profile
                    </button>
                    <button className="tab-btn">
                        <Palette size={20} /> Appearance
                    </button>
                    <button className="tab-btn">
                        <Globe size={20} /> Preferences
                    </button>
                </div>

                {/* CONTENT AREA */}
                <div className="settings-content">
                    <section className="settings-card">
                        <h3 className="card-title">User Profile</h3>

                        <div className="form-group">
                            <div className="input-wrapper">
                                <label className="input-label">Display Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="settings-input"
                                    placeholder="Enter your name"
                                />
                            </div>

                            <div className="input-wrapper">
                                <label className="input-label">Email Address</label>
                                <input
                                    type="email"
                                    value={user?.email}
                                    disabled
                                    className="settings-input disabled"
                                />
                            </div>

                            <button className="save-btn">
                                <Save size={18} /> Save Changes
                            </button>
                        </div>
                    </section>

                    <section className="settings-card">
                        <h3 className="card-title">Regional Preferences</h3>
                        <div className="preferences-group">
                            <label className="input-label">Primary Currency</label>
                            <div className="currency-grid">
                                {[
                                    { symbol: '$', label: 'USD' },
                                    { symbol: '₦', label: 'NGN' },
                                    { symbol: '€', label: 'EUR' }
                                ].map((curr) => (
                                    <button
                                        key={curr.label}
                                        className={`currency-btn ${currentCurrency?.label === curr.label ? 'active' : ''}`}
                                        onClick={() => handleCurrencyChange(curr)} // NEW HANDLER
                                    >
                                        <span className="currency-symbol">{curr.symbol}</span>
                                        <span className="currency-label">{curr.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    <button onClick={logout} className="signout-btn">
                        <LogOut size={18} /> Sign Out of Wealthify
                    </button>
                </div>
            </div>
        </div>
    );
}