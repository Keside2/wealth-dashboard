import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function FinancialChart({ data, color = "#10b981", currencySymbol }) {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="dynamicColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis
                        dataKey="x"
                        stroke="#64748b"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                        tickFormatter={(_, index) => data[index]?.dateLabel || ''}
                    />


                    <YAxis hide />
                    <Tooltip
                        shared={false} // This ensures only one point is highlighted at a time
                        trigger="hover"
                        cursor={{ stroke: '#ffffff20', strokeWidth: 1 }}
                        contentStyle={{
                            backgroundColor: '#0a0a0a',
                            border: '1px solid #ffffff10',
                            borderRadius: '12px',
                            padding: '12px'
                        }}

                        labelFormatter={(label, payload) => {
                            if (!payload || !payload.length) return '';
                            return payload[0].payload.dateLabel;
                        }}

                        // This will now correctly pull the title and amount for the SPECIFIC point
                        formatter={(value, name, { payload }) => {
                            return [
                                `${currencySymbol}${payload.rawAmount.toLocaleString()} `,
                                payload.title
                            ];
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="amount"
                        stroke={color}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#dynamicColor)"
                        animationDuration={1000}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}