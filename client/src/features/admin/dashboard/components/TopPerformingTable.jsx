import React from "react";
import { Trophy } from "lucide-react";

const TopPerformingTable = ({ title, data, type = "product" }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full">
      <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Trophy size={18} className="text-yellow-500" />
        {title}
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50">
            <tr>
              <th className="px-4 py-3 rounded-l-lg">Name</th>
              <th className="px-4 py-3">Sold</th>
              <th className="px-4 py-3 rounded-r-lg text-right">
                {type === "product" ? "Revenue" : "Growth"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item, index) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[150px]">
                  {index + 1}. {item.title || item.name}
                </td>
                <td className="px-4 py-3 text-gray-600">{item.totalSold}</td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {/* If product, show revenue. If category, show something else or just count */}
                  {
                    type === "product"
                      ? `₹${item.totalRevenue?.toLocaleString()}`
                      : `${Math.round((item.totalSold / 10) * 100) / 10}%` // Fake growth/share calc
                  }
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-500">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopPerformingTable;
