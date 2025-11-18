import React from "react";

const Wallet = ({ darkMode }) => {
  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <div className="p-6">
        <div className="mb-6">
          <h2 className={`text-3xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>Wallet</h2>
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Manage your wallet and transactions</p>
        </div>

        <div className={`rounded-lg border ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} shadow-sm p-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>Wallet Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
              <h4 className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Total Balance</h4>
              <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>₹12,450</p>
            </div>
            <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
              <h4 className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>This Month</h4>
              <p className={`text-2xl font-bold text-green-600`}>+₹2,340</p>
            </div>
            <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
              <h4 className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Pending</h4>
              <p className={`text-2xl font-bold text-yellow-600`}>₹890</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;