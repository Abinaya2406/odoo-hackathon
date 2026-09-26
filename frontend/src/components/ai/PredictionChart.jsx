import React from 'react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';

export const PredictionChart = React.memo(({ data = [], unit = 'Units', safetyStock = 0 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
        No trajectory timeline available
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-slate-500 mb-3 px-1">
        <span className="font-semibold text-slate-700">Stock Depletion Trajectory & Zero-Point Forecast</span>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> Historical
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block border-2 border-dashed border-rose-300" /> AI Depletion
          </span>
          {safetyStock > 0 && (
            <span className="inline-flex items-center gap-1.5 text-amber-600">
              <span className="w-3 h-0.5 bg-amber-500 inline-block" /> Safety Level
            </span>
          )}
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="historicalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="predictedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis
              dataKey="day"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              tickMargin={6}
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              unit={` ${unit}`}
            />
            <Tooltip
              formatter={(val, name) => [
                val !== null ? `${val} ${unit}` : '—',
                name === 'historical' ? 'Historical Stock' : name === 'predicted' ? 'Predicted Stock' : name
              ]}
              contentStyle={{
                backgroundColor: '#0F172A',
                borderRadius: '12px',
                border: 'none',
                color: '#FFF',
                fontSize: '12px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
              }}
            />

            {safetyStock > 0 && (
              <ReferenceLine
                y={safetyStock}
                stroke="#F59E0B"
                strokeDasharray="4 4"
                label={{
                  value: `Safety Stock (${safetyStock} ${unit})`,
                  fill: '#D97706',
                  fontSize: 10,
                  position: 'insideTopLeft'
                }}
              />
            )}

            <Area
              type="monotone"
              dataKey="historical"
              name="Historical Stock"
              stroke="#2563EB"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#historicalGrad)"
              connectNulls={false}
            />

            <Line
              type="monotone"
              dataKey="predicted"
              name="Predicted Stock"
              stroke="#E11D48"
              strokeWidth={2.5}
              strokeDasharray="5 5"
              dot={{ stroke: '#E11D48', strokeWidth: 2, r: 4, fill: '#FFF' }}
              activeDot={{ r: 6, fill: '#E11D48' }}
              connectNulls={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

PredictionChart.displayName = 'PredictionChart';
