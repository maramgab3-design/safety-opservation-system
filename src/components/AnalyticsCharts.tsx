import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend
} from 'recharts';
import { SafetyMetrics } from '../types';
import { AlertCircle, Layers, CheckCircle2 } from 'lucide-react';

interface AnalyticsChartsProps {
  iogpDistribution: Record<string, number>;
  facilityDistribution: Record<string, { total: number; critical: number; openActions: number }>;
  metrics: SafetyMetrics;
}

const COLORS = ['#ea580c', '#eab308', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  iogpDistribution,
  facilityDistribution,
  metrics,
}) => {
  // Format IOGP distribution data
  const iogpData = Object.entries(iogpDistribution || {})
    .map(([rule, count]) => ({
      name: rule.length > 20 ? rule.substring(0, 18) + '...' : rule,
      fullName: rule,
      count: Number(count) || 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Format Facility data
  const facilityData = Object.entries(facilityDistribution || {}).map(([facility, stats]) => {
    const s = stats as { total: number; critical: number; openActions: number };
    // shorten name for chart axis
    const shortName = facility
      .replace('Offshore Platform ', '')
      .replace('Deepwater Drillship ', '')
      .replace('Permian Wellpad ', 'Permian ')
      .replace('Gulf Coast Olefins Refinery ', 'Gulf Coast ')
      .replace('Eagle Ford Compressor ', 'Eagle Ford ');
    return {
      name: shortName,
      fullName: facility,
      Total: s?.total || 0,
      Critical: s?.critical || 0,
      OpenActions: s?.openActions || 0,
    };
  });

  // Observation types data for pie chart
  const typesData = [
    { name: 'Near Miss', value: metrics.nearMisses, color: '#f59e0b' },
    { name: 'Unsafe Condition', value: metrics.unsafeConditions, color: '#ef4444' },
    { name: 'Unsafe Act', value: metrics.unsafeActs, color: '#f97316' },
    { name: 'Positive Observation', value: metrics.positiveObservations, color: '#10b981' },
    { name: 'Stop Work (SWA)', value: metrics.stopWorkCount, color: '#8b5cf6' },
  ].filter(d => d.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
      {/* Chart 1: Hazards by IOGP Life-Saving Rules */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-600" />
              Hazards by IOGP Life-Saving Rule
            </h3>
            <p className="text-xs text-slate-500">Distribution of declared reports across global safety standards</p>
          </div>
        </div>

        <div className="h-64 w-full">
          {iogpData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={iogpData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11, fill: '#334155' }} />
                <Tooltip
                  formatter={(value: any) => [`${value} observations`, 'Reports']}
                  labelFormatter={(label, items) => items?.[0]?.payload?.fullName || label}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#fed7aa' }}
                />
                <Bar dataKey="count" fill="#ea580c" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No observations recorded yet
            </div>
          )}
        </div>
      </div>

      {/* Chart 2: Operating Facility Risk Comparison */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Site Hazard Load &amp; Open Actions
            </h3>
            <p className="text-xs text-slate-500">Total reported hazards vs critical tier vs open CAPA by asset</p>
          </div>
        </div>

        <div className="h-64 w-full">
          {facilityData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={facilityData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#334155' }} angle={-15} textAnchor="end" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} items`, name]}
                  labelFormatter={(label, items) => items?.[0]?.payload?.fullName || label}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="Total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Critical" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="OpenActions" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No facility data available
            </div>
          )}
        </div>
      </div>

      {/* Chart 3: Heinrich Safety Triangle & Observation Type Mix */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Observation Classification Mix
            </h3>
            <p className="text-xs text-slate-500">Leading indicator behavior and intervention types</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {typesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} reports`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 text-xs">
            {typesData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                  <span className="font-medium text-slate-700">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safety Protocol Impact Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Safety Culture &amp; Leading Indicator Health
            </h3>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              HEALTHY BENCHMARK
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            According to the <strong>Heinrich Safety Pyramid</strong> and <strong>IOGP Safety Performance Indicators</strong>, robust reporting of low-consequence observations directly preempts fatal incidents.
          </p>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">CAPA Resolution Velocity</span>
                <span className="font-mono font-bold text-slate-900">{metrics.observationClosureRate}% closed</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(metrics.observationClosureRate, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Reporting Rate Index</span>
                <span className="font-mono font-bold text-emerald-700">Optimal (4.2 reports / shift)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-600 h-2 rounded-full w-[84%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Worker Psychological Safety Index</span>
                <span className="font-mono font-bold text-amber-700">92% High (Active No-Blame SWA)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-500 h-2 rounded-full w-[92%]"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Target: Zero Harm / Goal Zero</span>
          <span className="font-mono text-slate-700 font-semibold">TRIFR: 0.00 / 200k hrs</span>
        </div>
      </div>
    </div>
  );
};
