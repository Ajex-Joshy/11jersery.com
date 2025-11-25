import PropTypes from "prop-types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export const CustomerLineChart = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 text-white p-3 rounded-md shadow-lg">
          <p className="text-sm font-bold">{`${payload[0].value.toLocaleString()} new users`}</p>
          <p className="text-xs">{label}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: "100%", height: 250, minWidth: 0 }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, left: -20, bottom: 2 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e5e7eb"
          />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "#6b7280" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickFormatter={(value) => `${value / 1000}k`}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "#22c55e", strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="newCustomers"
            stroke="#22c55e"
            strokeWidth={3}
            dot={false}
            activeDot={{
              r: 8,
              stroke: "#fff",
              strokeWidth: 2,
              fill: "#22c55e",
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

CustomerLineChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      newCustomers: PropTypes.number.isRequired,
    })
  ).isRequired,
};
