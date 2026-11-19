// ─── Metric card components ───
import React from 'react';
import {
  Activity,
  Eye,
  Ruler,
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  status: 'good' | 'warn' | 'bad';
  icon: 'posture' | 'eye' | 'distance' | 'fatigue';
  subtitle?: string;
}

const iconMap = {
  posture: Activity,
  eye: Eye,
  distance: Ruler,
  fatigue: Brain,
};

const statusColors = {
  good: {
    bg: 'bg-sage-500/10',
    border: 'border-sage-500/25',
    text: 'text-sage-400',
    glow: 'shadow-sage-500/5',
    icon: 'text-sage-400',
    indicator: 'bg-sage-400',
  },
  warn: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/25',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/5',
    icon: 'text-amber-400',
    indicator: 'bg-amber-400',
  },
  bad: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/25',
    text: 'text-red-400',
    glow: 'shadow-red-500/5',
    icon: 'text-red-400',
    indicator: 'bg-red-400',
  },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  status,
  icon,
  subtitle,
}) => {
  const Icon = iconMap[icon];
  const colors = statusColors[status];

  return (
    <div
      className={`glass-card-sm p-4 ${colors.bg} ${colors.border} transition-all duration-500 shadow-lg ${colors.glow}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${colors.icon}`} />
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            {label}
          </span>
        </div>
        <div className={`w-2 h-2 rounded-full ${colors.indicator} animate-pulse-slow`} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${colors.text} tabular-nums`}>
          {value}
        </span>
        {unit && <span className="text-xs text-slate-500">{unit}</span>}
      </div>
      {subtitle && (
        <p className="text-[11px] text-slate-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
};
