// ─── Wellbeing timeline chart ───
import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import type { WellbeingSnapshot } from '../types';

interface TimelineChartProps {
  data: WellbeingSnapshot[];
}

export const TimelineChart: React.FC<TimelineChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    if (data.length === 0) return [];
    const start = data[0].timestamp;
    return data.map((s) => ({
      time: Math.round((s.timestamp - start) / 1000),
      timeLabel: formatTimeLabel((s.timestamp - start) / 1000),
      posture: Math.round(s.postureScore),
      blinks: Math.round(s.blinkRate),
      fatigue: Math.round(s.fatigueScore),
    }));
  }, [data]);

  if (chartData.length < 2) {
    return (
      <div className="glass-card-sm p-4 h-[200px] flex items-center justify-center">
        <p className="text-xs text-slate-500">
          Collecting data… chart appears after a few seconds
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card-sm p-4">
      <h3 className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-3">
        15-Min Wellbeing Timeline
      </h3>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="postureGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7d9b7d" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#7d9b7d" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fatigueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="timeLabel"
            tick={{ fontSize: 10, fill: '#64748b' }}
            tickLine={false}
            axisLine={{ stroke: '#1e293b' }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: '#64748b' }}
            tickLine={false}
            axisLine={false}
            width={30}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: 11,
            }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Area
            type="monotone"
            dataKey="posture"
            stroke="#7d9b7d"
            fill="url(#postureGrad)"
            strokeWidth={2}
            name="Posture"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="fatigue"
            stroke="#f59e0b"
            fill="url(#fatigueGrad)"
            strokeWidth={1.5}
            name="Fatigue"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="blinks"
            stroke="#60a5fa"
            strokeWidth={1.5}
            name="Blink Rate"
            dot={false}
            strokeDasharray="4 2"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-2 justify-center">
        <Legend color="#7d9b7d" label="Posture" />
        <Legend color="#f59e0b" label="Fatigue" />
        <Legend color="#60a5fa" label="Blinks/min" dashed />
      </div>
    </div>
  );
};

function Legend({
  color,
  label,
  dashed,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-4 h-0.5"
        style={{
          backgroundColor: color,
          borderBottom: dashed ? `2px dashed ${color}` : undefined,
        }}
      />
      <span className="text-[10px] text-slate-500">{label}</span>
    </div>
  );
}

function formatTimeLabel(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m === 0) return `${s}s`;
  return `${m}m`;
}
