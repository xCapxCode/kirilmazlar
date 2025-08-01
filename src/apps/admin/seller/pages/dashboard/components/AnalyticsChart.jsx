import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const AnalyticsChart = ({ data = [] }) => {
  // Format data for charts
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
    revenue: parseFloat(item.revenue || 0),
    orders: parseInt(item.orders_received || 0),
    credits: parseInt(item.credits_used || 0),
    views: parseInt(item.views_generated || 0)
  }));

  // Calculate totals
  const totals = data.reduce(
    (acc, item) => ({
      revenue: acc.revenue + parseFloat(item.revenue || 0),
      orders: acc.orders + parseInt(item.orders_received || 0),
      credits: acc.credits + parseInt(item.credits_used || 0),
      views: acc.views + parseInt(item.views_generated || 0)
    }),
    { revenue: 0, orders: 0, credits: 0, views: 0 }
  );

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-text-secondary">No analytics data available for the selected period.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
          <p className="text-sm text-primary font-medium">Total Revenue</p>
          <p className="text-2xl font-bold text-primary">₺{totals.revenue.toFixed(2)}</p>
        </div>
        <div className="bg-success/5 rounded-lg p-4 border border-success/20">
          <p className="text-sm text-success font-medium">Orders</p>
          <p className="text-2xl font-bold text-success">{totals.orders}</p>
        </div>
        <div className="bg-accent/5 rounded-lg p-4 border border-accent/20">
          <p className="text-sm text-accent font-medium">Credits Used</p>
          <p className="text-2xl font-bold text-accent">{totals.credits}</p>
        </div>
        <div className="bg-warning/5 rounded-lg p-4 border border-warning/20">
          <p className="text-sm text-warning font-medium">Total Views</p>
          <p className="text-2xl font-bold text-warning">{totals.views.toLocaleString()}</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div>
        <h4 className="font-medium text-text-primary mb-4">Revenue Trend</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => `₺${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [`₺${value.toFixed(2)}`, 'Revenue']}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders and Credits Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-text-primary mb-4">Orders Received</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [value, 'Orders']}
                />
                <Bar 
                  dataKey="orders" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-text-primary mb-4">Credits Usage</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [value, 'Credits']}
                />
                <Bar 
                  dataKey="credits" 
                  fill="#f59e0b" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsChart;
