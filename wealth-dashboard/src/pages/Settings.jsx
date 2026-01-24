import React, { useState } from 'react';
import { User, Palette, Globe, LogOut, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Settings.css';
import { updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function Settings({ currentCurrency, setCurrency, currentTheme, setTheme, handleSaveBudget, monthlyBudget }) {
    const { user, logout } = useAuth();
    const [name, setName] = useState(user?.displayName || '');
    const [showToast, setShowToast] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [toastMsg, setToastMsg] = useState('');

    // NEW: State to track which sub-tab is active
    const [activeSubTab, setActiveSubTab] = useState('profile');


    const [budgetValue, setBudgetValue] = useState(monthlyBudget);

    const onBudgetSubmit = () => {
        handleSaveBudget(budgetValue);
        setToastMsg(`Budget set to ${currentCurrency.symbol}${budgetValue}`);
        triggerToast();
    };

    const handleCurrencyChange = (curr) => {
        setCurrency({ symbol: curr.symbol, label: curr.label });
        setToastMsg(`Currency updated to ${curr.label}`);
        triggerToast();
    };

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        setToastMsg(`Theme set to ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)}`);
        triggerToast();
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setIsUpdating(true);
        try {
            await updateProfile(auth.currentUser, { displayName: name });
            setToastMsg('Profile updated successfully!');
            triggerToast();
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const triggerToast = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    return (
        <div className="settings-container">
            <header className="settings-header">
                <h1 className="settings-title">Settings</h1>
                <p className="settings-subtitle">Personalize your Wealthify experience.</p>
            </header>

            <div className={`currency-toast ${showToast ? 'show' : ''}`}>
                <CheckCircle size={18} />
                <span>{toastMsg}</span>
            </div>

            <div className="settings-grid">
                {/* SIDE TABS - Now with onClick handlers */}
                <div className="settings-tabs">
                    <button
                        className={`tab-btn ${activeSubTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveSubTab('profile')}
                    >
                        <User size={20} /> Profile
                    </button>
                    <button
                        className={`tab-btn ${activeSubTab === 'appearance' ? 'active' : ''}`}
                        onClick={() => setActiveSubTab('appearance')}
                    >
                        <Palette size={20} /> Appearance
                    </button>
                    <button
                        className={`tab-btn ${activeSubTab === 'preferences' ? 'active' : ''}`}
                        onClick={() => setActiveSubTab('preferences')}
                    >
                        <Globe size={20} /> Preferences
                    </button>
                </div>

                {/* CONTENT AREA - Conditional Rendering based on activeSubTab */}
                <div className="settings-content">

                    {activeSubTab === 'profile' && (
                        <section className="settings-card animate-fade-in">
                            <div className="card-header">
                                <User size={20} className="text-blue-500" />
                                <h3 className="card-title">User Profile</h3>
                            </div>
                            <form onSubmit={handleUpdateProfile} className="profile-form">
                                <div className="input-group">
                                    <label className="input-label">Display Name</label>
                                    <input
                                        type="text"
                                        className="settings-input"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="save-btn"
                                    disabled={isUpdating || name === user?.displayName}
                                >
                                    {isUpdating ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>
                        </section>
                    )}

                    {activeSubTab === 'appearance' && (
                        <section className="settings-card animate-fade-in">
                            <div className="card-header">
                                <Palette size={20} className="text-blue-500" />
                                <h3 className="card-title">Appearance</h3>
                            </div>
                            <div className="theme-grid">
                                <button
                                    className={`theme-btn midnight ${currentTheme === 'midnight' ? 'active' : ''}`}
                                    onClick={() => handleThemeChange('midnight')}
                                >
                                    <div className="theme-preview midnight-preview"></div>
                                    <span>Midnight Blue</span>
                                </button>
                                <button
                                    className={`theme-btn stealth ${currentTheme === 'stealth' ? 'active' : ''}`}
                                    onClick={() => handleThemeChange('stealth')}
                                >
                                    <div className="theme-preview stealth-preview"></div>
                                    <span>Pure Stealth</span>
                                </button>

                                <button
                                    className={`theme-btn rose ${currentTheme === 'rose' ? 'active' : ''}`}
                                    onClick={() => handleThemeChange('rose')}
                                >
                                    <div className="theme-preview rose-preview"></div>
                                    <span>Rose Gold</span>
                                </button>

                                <button
                                    className={`theme-btn emerald ${currentTheme === 'emerald' ? 'active' : ''}`}
                                    onClick={() => handleThemeChange('emerald')}
                                >
                                    <div className="theme-preview emerald-preview"></div>
                                    <span>Deep Emerald</span>
                                </button>
                            </div>
                        </section>
                    )}

                    {activeSubTab === 'preferences' && (
                        <section className="settings-card animate-fade-in">
                            <div className="card-header">
                                <Globe size={20} className="text-blue-500" />
                                <h3 className="card-title">Regional Preferences</h3>
                            </div>
                            <div className="preferences-group">
                                <label className="input-label">Primary Currency</label>
                                <div className="currency-grid">
                                    {[
                                        { symbol: '$', label: 'USD' },
                                        { symbol: '₦', label: 'NGN' },
                                        { symbol: '£', label: 'GBP' },
                                        { symbol: '€', label: 'EUR' },
                                        { symbol: '¥', label: 'JPY' },
                                        { symbol: '₵', label: 'GHS' }
                                    ].map((curr) => (
                                        <button
                                            key={curr.label}
                                            className={`currency-btn ${currentCurrency?.label === curr.label ? 'active' : ''}`}
                                            onClick={() => handleCurrencyChange(curr)}
                                        >
                                            <span className="currency-symbol">{curr.symbol}</span>
                                            <span className="currency-label">{curr.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="preferences-group" style={{ marginTop: '2rem' }}>
                                <label className="input-label">Monthly Spending Limit ({currentCurrency.symbol})</label>
                                <div className="budget-input-wrapper" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <input
                                        type="number"
                                        className="settings-input"
                                        value={budgetValue}
                                        onChange={(e) => setBudgetValue(e.target.value)}
                                        placeholder="e.g. 2000"
                                    />
                                    <button
                                        className="save-btn"
                                        onClick={onBudgetSubmit}
                                        style={{ margin: 0, width: 'auto', whiteSpace: 'nowrap' }}
                                    >
                                        Set Budget
                                    </button>
                                </div>
                            </div>
                        </section>
                    )}

                    <button onClick={logout} className="signout-btn">
                        <LogOut size={18} /> Sign Out of Wealthify
                    </button>
                </div>
            </div>
        </div>
    );
}