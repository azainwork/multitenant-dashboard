"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/metrics")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data)
    return <div className="text-slate-400 text-sm">Memuat data...</div>;

  const totalRevenue = data.monthly.reduce(
    (s: number, m: any) => s + m.revenue,
    0,
  );
  const totalProfit = data.monthly.reduce(
    (s: number, m: any) => s + m.profit,
    0,
  );
  const totalCustomers = data.businessSummary.reduce(
    (s: number, b: any) => s + b.totalCustomers,
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Overview</h1>
        <p className="text-sm text-slate-500">Performa seluruh lini bisnis</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Revenue",
            value: formatRupiah(totalRevenue),
            color: "text-slate-800",
          },
          {
            label: "Total Profit",
            value: formatRupiah(totalProfit),
            color: "text-emerald-600",
          },
          {
            label: "Total Customers",
            value: totalCustomers.toLocaleString("id-ID"),
            color: "text-slate-800",
          },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border p-5">
            <p className="text-xs text-slate-500 mb-1">{card.label}</p>
            <p className={`text-2xl font-semibold ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Revenue trend chart */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="text-sm font-medium text-slate-700 mb-4">
          Tren Revenue & Profit
        </h2>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data.monthly}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis
              tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
              tick={{ fontSize: 11 }}
            />
            <Tooltip formatter={(v: number) => formatRupiah(v)} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#6366f1"
              fill="url(#rev)"
              name="Revenue"
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#10b981"
              fill="none"
              name="Profit"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue per business */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="text-sm font-medium text-slate-700 mb-4">
          Revenue per Lini Bisnis
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.businessSummary}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis
              tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
              tick={{ fontSize: 11 }}
            />
            <Tooltip formatter={(v: number) => formatRupiah(v)} />
            <Bar
              dataKey="totalRevenue"
              fill="#6366f1"
              radius={[4, 4, 0, 0]}
              name="Total Revenue"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}