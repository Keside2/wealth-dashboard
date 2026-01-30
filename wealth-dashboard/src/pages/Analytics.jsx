import React, { useState, useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp } from 'lucide-react'; // Added for the empty state icon
import './Analytics.css';

export default function Analytics({ transactions, currencySymbol, totalIncome }) {
    const [timeframe, setTimeframe] = useState('6months');

    // 1. Filter transactions based on selection
    const filteredTransactions = useMemo(() => {
        const now = new Date();
        return transactions.filter(tx => {
            const txDate = tx.date ? new Date(tx.date) : (tx.createdAt?.seconds ? new Date(tx.createdAt.seconds * 1000) : new Date(tx.createdAt));
            if (isNaN(txDate)) return false;

            if (timeframe === 'month') {
                return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
            }
            if (timeframe === '6months') {
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(now.getMonth() - 5);
                sixMonthsAgo.setDate(1);
                return txDate >= sixMonthsAgo;
            }
            return true; // 'all'
        });
    }, [transactions, timeframe]);

    // 2. Calculate Filtered Income & Expenses
    const { periodIncome, periodExpense } = useMemo(() => {
        const income = filteredTransactions
            .filter(tx => tx.type?.toLowerCase() === 'income')
            .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

        const expense = filteredTransactions
            .filter(tx => tx.type?.toLowerCase() === 'expense')
            .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

        return {
            periodIncome: income || Number(totalIncome) || 0,
            periodExpense: expense
        };
    }, [filteredTransactions, totalIncome]);

    // 3. Savings Health Logic
    const savingsRate = periodIncome > 0 ? ((periodIncome - periodExpense) / periodIncome) * 100 : 0;
    const savingsPercent = Math.max(0, Math.min(100, Math.round(savingsRate)));
    const savingsColor = savingsPercent >= 20 ? '#10b981' : '#f59e0b';

    let healthMessage = "Keep grinding!";
    if (savingsPercent >= 50) healthMessage = "Financial Legend! 🏆";
    else if (savingsPercent >= 20) healthMessage = "Healthy Saving! 💰";
    else if (savingsPercent > 0) healthMessage = "Room to grow 📈";

    // 4. Daily Burn Logic
    const dailyAverage = useMemo(() => {
        let days = timeframe === 'month' ? 30 : (timeframe === '6months' ? 180 : 365);
        return periodExpense / days;
    }, [periodExpense, timeframe]);

    // 5. Insights Logic
    const insights = useMemo(() => {
        const expenses = filteredTransactions.filter(tx => tx.type?.toLowerCase() === 'expense');
        if (expenses.length === 0) return null;

        const highestTx = expenses.reduce((prev, current) => (prev.amount > current.amount) ? prev : current);
        const cats = {};
        expenses.forEach(tx => cats[tx.category] = (cats[tx.category] || 0) + Number(tx.amount));
        const topCat = Object.entries(cats).reduce((a, b) => a[1] > b[1] ? a : b);

        return {
            highestAmount: highestTx.amount,
            highestCat: topCat[0],
            totalCount: filteredTransactions.length
        };
    }, [filteredTransactions]);

    // --- CHART PREPARATION ---
    const chartData = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const chartBuckets = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            chartBuckets.push({ name: months[d.getMonth()], monthIdx: d.getMonth(), year: d.getFullYear(), income: 0, expense: 0 });
        }
        filteredTransactions.forEach(tx => {
            const txDate = tx.date ? new Date(tx.date) : (tx.createdAt?.seconds ? new Date(tx.createdAt.seconds * 1000) : new Date(tx.createdAt));
            const bucket = chartBuckets.find(m => m.monthIdx === txDate?.getMonth() && m.year === txDate?.getFullYear());
            if (bucket) {
                const amt = Number(tx.amount) || 0;
                tx.type?.toLowerCase() === 'income' ? bucket.income += amt : bucket.expense += amt;
            }
        });
        return chartBuckets;
    }, [filteredTransactions]);

    const pieData = useMemo(() => {
        const categoryTotals = {};
        filteredTransactions.forEach(tx => {
            if (tx.type?.toLowerCase() === 'expense') {
                const cat = tx.category || 'General';
                categoryTotals[cat] = (categoryTotals[cat] || 0) + (Number(tx.amount) || 0);
            }
        });
        return Object.entries(categoryTotals).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [filteredTransactions]);

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#ec4899'];

    return (
        <div className="p-6 lg:p-10 space-y-8">
            <header className="analytics-header-flex">
                <div>
                    <h1 className="text-3xl font-black text-white">Financial Analytics</h1>
                    <p className="text-slate-500 uppercase tracking-widest text-[10px] mt-1">Deep dive into your spending habits</p>
                </div>
                <select className="timeframe-dropdown" value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                    <option value="6months">Last 6 Months</option>
                    <option value="month">This Month</option>
                    <option value="all">All Time</option>
                </select>
            </header>

            {transactions.length === 0 ? (
                /* EMPTY STATE */
                <div className="empty-state-container">
                    <div className="empty-icon-circle">
                        <TrendingUp size={40} className="text-blue-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white mt-4">No Data to Analyze Yet</h2>
                    <p className="text-slate-400 text-sm max-w-xs text-center mt-2">
                        Start logging your income and expenses on the dashboard to see your financial health insights.
                    </p>
                </div>
            ) : (
                /* FULL DASHBOARD */
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="insight-mini-card">
                            <span className="text-slate-500 text-[10px] uppercase">Top Category</span>
                            <p className="text-white font-bold">{insights?.highestCat || 'N/A'}</p>
                        </div>
                        <div className="insight-mini-card">
                            <span className="text-slate-500 text-[10px] uppercase">Largest Hit</span>
                            <p className="text-rose-500 font-bold">{currencySymbol}{insights?.highestAmount?.toLocaleString() || 0}</p>
                        </div>
                        <div className="insight-mini-card">
                            <span className="text-slate-500 text-[10px] uppercase">Transactions</span>
                            <p className="text-blue-400 font-bold">{insights?.totalCount || 0} items</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cash Flow */}
                        <div className="main-chart-span chart-card">
                            <h3 className="bold-white-text">Cash Flow Trend</h3>
                            <div className="chart-wrapper">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `${currencySymbol}${value}`} />
                                        <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px' }} />
                                        <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fill="url(#colorIncome)" />
                                        <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} fill="url(#colorExpense)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Spending Breakdown */}
                        <div className="analytics-card">
                            <h3 className="chart-title">Spending Breakdown</h3>
                            <div className="pie-container">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {pieData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="none" />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '10px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="legend-list custom-scrollbar">
                                {pieData.map((entry, index) => (
                                    <div key={entry.name} className="legend-item">
                                        <div className="legend-label">
                                            <div className="color-dot" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                            <span className="category-name">{entry.name}</span>
                                        </div>
                                        <span className="category-value">{currencySymbol}{entry.value.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Savings Health */}
                        <div className="analytics-card health-card">
                            <h3 className="chart-title">Savings Health</h3>
                            <div className="progress-circle" style={{ background: `conic-gradient(${savingsColor} ${savingsPercent * 3.6}deg, rgba(255,255,255,0.1) 0deg)` }}>
                                <div className="progress-value">{savingsPercent}%</div>
                            </div>
                            <div className="health-info">
                                <p className="health-status" style={{ color: savingsColor }}>{healthMessage}</p>
                                <p className="category-name">of income saved</p>
                                <div className="daily-avg-box">
                                    <span className="avg-label">Daily Burn:</span>
                                    <span className="avg-value">{currencySymbol}{Math.round(dailyAverage)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}