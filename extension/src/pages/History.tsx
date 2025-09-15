import React from "react";
import { Shield } from "lucide-react";

const History: React.FC = () => {
  // TODO: Add real AO transaction history here
  const historyItems = []; // Empty for now

  return (
    <div className="p-6 text-center">
      <Shield size={48} className="mx-auto text-gray-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-300 mb-2">
        Transaction History
      </h3>
      <p className="text-gray-500 text-sm">
        Protected AO transactions will appear here
      </p>
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-xs text-blue-400">
          <strong>Integration Ready:</strong> Add your AO transaction data here
          for real history display.
        </p>
      </div>
    </div>
  );
};

export default History;
