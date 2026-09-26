import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';

export const AnomalyChart = React.memo(({ chartData = [], unit = 'Units', normalMin = 0, normalMax = 100 }) => {
  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded-xl">
        No comparative trend data available
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
        <span className="font-semibold text-slate-700">Transaction Quantity vs Normal Baseline</span>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm" /> Normal Pattern
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-sm" /> Flagged Outlier
          </span>
        </div>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} />
            <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
            <Tooltip
              formatter={(val) => [`${val} ${unit}`, 'Quantity']}
              contentStyle={{
                backgroundColor: '#0F172A',
                borderRadius: '8px',
                border: 'none',
                color: '#FFF',
                fontSize: '11px'
              }}
            />
            {normalMax > 0 && (
              <ReferenceLine
                y={normalMax}
                stroke="#F59E0B"
                strokeDasharray="3 3"
                label={{
                  value: `Max Threshold (${normalMax})`,
                  fill: '#D97706',
                  fontSize: 9,
                  position: 'insideTopRight'
                }}
              />
            )}
            <Bar dataKey="quantity" radius={[4, 4, 0, 0]} maxBarSize={32}>
              {chartData.map((entry, index) => {
                const isAnomaly = entry.quantity > normalMax || index === chartData.length - 1;
                return (
                  <Cell
                    key={`bar-${index}`}
                    fill={isAnomaly ? '#F43F5E' : '#3B82F6'}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

AnomalyChart.displayName = 'AnomalyChart';
