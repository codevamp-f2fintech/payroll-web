import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const PayrollSummary = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage?.getItem("token") || '{}';
      const { company_id } = typeof window !== "undefined" ? JSON.parse(localStorage?.getItem("user")) : {};

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/payroll/yearly-comparison`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token} ${company_id}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch yearly comparison data');
        }

        const data = await response.json();
        // Transform the data to ensure numbers are properly formatted
        const transformedData = data.map(item => ({
          ...item,
          Loan: Number(item.Loan) || 0,
          Reimbursement: Number(item.Reimbursement) || 0,
          Payroll: Number(item.Payroll) || 0
        }));
        setChartData(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const generateSampleData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month) => ({
      month,
      Loan: Math.floor(Math.random() * 3000) + 2000,
      Reimbursement: Math.floor(Math.random() * 2000) + 2000,
      Payroll: Math.floor(Math.random() * 3000) + 4000
    }));
  };

  const displayData = (loading || error || chartData.length === 0) ? generateSampleData() : chartData;

  return (
    <div className="w-full h-[500px] bg-gray-900 rounded-lg overflow-hidden">
      <div className="p-4">
        <h2 className="text-xl font-semibold text-white">Amount of Payroll, Loan, Reimbursement (Full Year)</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[400px] text-white">Loading...</div>
      ) : error ? (
        <div className="p-4 text-red-400">{error}</div>
      ) : (
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={displayData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: 'white' }}
                axisLine={{ stroke: '#555' }}
                tickLine={false}
                interval={0}
                fontSize={12}
              />
              <YAxis
                tick={{ fill: 'white' }}
                axisLine={{ stroke: '#555' }}
                tickLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white'
                }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: '10px',
                  color: 'white'
                }}
              />
              <Bar dataKey="Loan" fill="#008080" />
              <Bar dataKey="Reimbursement" fill="#36B3F3" />
              <Bar dataKey="Payroll" fill="#FF3BA6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default PayrollSummary;
