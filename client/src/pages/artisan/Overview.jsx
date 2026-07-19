import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import useFetch from '../../hooks/useFetch';
import { formatINR } from '../../lib/format';
import StatTile from '../../components/StatTile';
import { Loader, ErrorState } from '../../components/StateViews';

const STATUSES = ['pending', 'paid', 'shipped', 'delivered'];

export default function Overview() {
  const { data, loading, error } = useFetch('/artisan/summary', []);

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} />;

  const chartData = STATUSES.map((s) => ({
    status: s,
    orders: data?.ordersByStatus?.[s] || 0,
  }));

  return (
    <div>
      <h1 className="font-display text-3xl text-navy">Overview</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatTile label="Total revenue" value={formatINR(data?.totalRevenue)} accent />
        <StatTile label="Units delivered" value={data?.deliveredUnits ?? 0} />
        <StatTile
          label="Active orders"
          value={(data?.ordersByStatus?.paid || 0) + (data?.ordersByStatus?.shipped || 0)}
        />
      </div>

      {/* Single-series bar chart — one brand hue, no legend (title names it). */}
      <div className="mt-8 rounded-xl bg-white p-6 ring-1 ring-navy/5">
        <h2 className="font-display text-xl text-navy">Orders by status</h2>
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid stroke="#1B2A4A14" vertical={false} />
              <XAxis
                dataKey="status"
                tick={{ fill: '#1B2A4A99', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: '#1B2A4A99', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: '#1B2A4A0A' }}
                contentStyle={{ borderRadius: 8, border: '1px solid #1B2A4A22' }}
              />
              <Bar dataKey="orders" fill="#1B2A4A" radius={[4, 4, 0, 0]} maxBarSize={56} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
