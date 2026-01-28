import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import './Analytics.css'

export default function Analytics({ transactions, currencySymbol }) {

    // --- DATA PROCESSING LOGIC ---
    const prepareChartData = (allTransactions) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const last6Months = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            last6Months.push({
                name: months[d.getMonth()],
                monthIdx: d.getMonth(),
                year: d.getFullYear(),
                income: 0,
                expense: 0
            });
        }

        allTransactions.forEach(tx => {
            let txDate;

            // Smart Date Detection
            if (tx.date) {
                txDate = new Date(tx.date); // For new ones (string)
            } else if (tx.createdAt) {
                // For old ones (Firebase Timestamp or ISO string)
                txDate = tx.createdAt.seconds
                    ? new Date(tx.createdAt.seconds * 1000)
                    : new Date(tx.createdAt);
            }

            if (txDate && !isNaN(txDate)) {
                const monthData = last6Months.find(m =>
                    m.monthIdx === txDate.getMonth() && m.year === txDate.getFullYear()
                );

                if (monthData) {
                    const amount = Number(tx.amount) || 0;
                    const type = tx.type?.toLowerCase();
                    if (type === 'income') monthData.income += amount;
                    if (type === 'expense') monthData.expense += amount;
                }
            }
        });

        return last6Months;
    };

    const preparePieData = (allTransactions) => {
        const categoryTotals = {};

        allTransactions.forEach(tx => {
            if (tx.type === 'expense') {
                const cat = tx.category || 'General';
                const amt = Number(tx.amount) || 0;
                categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
            }
        });

        return Object.entries(categoryTotals).map(([name, value]) => ({
            name,
            value
        })).sort((a, b) => b.value - a.value); // Biggest spending first
    };

    const pieData = preparePieData(transactions);
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#ec4899'];
    // Use the real data!
    const chartData = prepareChartData(transactions);

    return (
        <div className="p-6 lg:p-10 space-y-8">
            <header>
                <h1 className="text-3xl font-black text-white">Financial Analytics</h1>
                <p className="text-slate-500 uppercase tracking-widest text-[10px] mt-1">Deep dive into your spending habits</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* BIG CHART: Income vs Expenses */}
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
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    tickFormatter={(value) => `${currencySymbol}${value}`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                    formatter={(value) => [`${currencySymbol}${value.toLocaleString()}`, '']}
                                />
                                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                                <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* SMALL CHART: Category Distribution */}
                {/* SMALL CHART: Category Distribution */}
                <div className="analytics-card">
                    <h3 className="chart-title">Spending Breakdown</h3>

                    <div className="pie-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '10px', fontSize: '12px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div className="legend-list custom-scrollbar">
                        {pieData.map((entry, index) => (
                            <div key={entry.name} className="legend-item">
                                <div className="legend-label">
                                    <div className="color-dot" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="category-name">{entry.name}</span>
                                </div>
                                <span className="category-value">
                                    {currencySymbol}{entry.value.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}