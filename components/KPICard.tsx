import React from 'react';

interface KPICardProps {
  label: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
}

export default function KPICard({ label, value, trend, icon }: KPICardProps) {
  const isPositive = trend.startsWith('+');

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500 font-medium">{label}</span>
        <span className="text-slate-400 w-5 h-5">{icon}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-slate-900">{value}</span>
        <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
          {trend}
        </span>
      </div>
    </div>
  );
}
