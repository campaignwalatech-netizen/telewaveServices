import React from "react";

const TotalBalance = ({ darkMode }) => {
  const payments = [
    { id: "WDR-001", amount: "$500.00", date: "2024-07-20", time: "01:28 PM", status: "Approved", transaction: "#DSF485I" },
    { id: "WDR-002", amount: "$120.00", date: "2024-07-18", time: "06:27 PM", status: "Pending", transaction: "N/A" },
    { id: "WDR-003", amount: "$75.50", date: "2024-07-15", time: "08:00 AM", status: "Rejected", transaction: "N/A" },
    { id: "WDR-004", amount: "$300.00", date: "2024-07-12", time: "04:12 AM", status: "Approved", transaction: "#DSF485I" },
  ];

  return (
    <main
      className={`min-h-screen flex justify-center transition-all duration-300 ${
        darkMode ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
      style={{ paddingTop: "2.5rem", paddingBottom: "4rem" }} // 👈 Reduced top padding
    >
      <div className="w-full max-w-6xl">
        {/* Page Title */}
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
          Total Balance Overview
        </h2>

        {/* Total Earnings Card */}
        <section
          className={`rounded-lg border mb-8 p-6 text-center shadow-sm ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <h3 className="text-gray-500 text-sm mb-2">Total Earnings</h3>
          <div className="text-4xl font-bold text-blue-600">$5,550.75</div>
          <p className="text-gray-400 text-sm mt-1">Last updated: July 25, 2025</p>
        </section>

        {/* Important Note */}
        <section
          className={`rounded-lg border mb-8 p-5 text-sm shadow-sm ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">
            Important Note
          </h4>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            All withdrawal requests are subject to Admin review and approval and
            will be processed within 24–48 hours. Please ensure your bank details
            are updated in your Profile settings to avoid delays.
          </p>
        </section>

        {/* Payment History */}
        <section
          className={`rounded-lg border p-5 overflow-x-auto shadow-sm ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <h4 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Payment History
          </h4>
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr
                className={`text-left border-b ${
                  darkMode ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
                }`}
              >
                <th className="p-3">Request ID</th>
                <th className="p-3">Amount (USD)</th>
                <th className="p-3">Date</th>
                <th className="p-3">Time</th>
                <th className="p-3">Status</th>
                <th className="p-3">Transaction</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((row) => (
                <tr
                  key={row.id}
                  className={`border-b ${
                    darkMode ? "border-gray-700" : "border-gray-100"
                  } hover:bg-gray-100 dark:hover:bg-gray-700 transition-all`}
                >
                  <td className="p-3">{row.id}</td>
                  <td className="p-3">{row.amount}</td>
                  <td className="p-3">{row.date}</td>
                  <td className="p-3">{row.time}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        row.status === "Approved"
                          ? "bg-green-100 text-green-700 dark:bg-green-700 dark:text-white"
                          : row.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-white"
                          : "bg-red-100 text-red-700 dark:bg-red-700 dark:text-white"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="p-3">{row.transaction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Footer Section */}
        <footer className="mt-12 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400 border-t pt-6">
          <div className="mb-3 sm:mb-0">
            <span className="mr-4 cursor-pointer hover:underline">Contact Us</span>
            <span className="cursor-pointer hover:underline">Company</span>
          </div>
          <div className="flex gap-4 text-xl">
            <i className="fab fa-facebook"></i>
            <i className="fab fa-instagram"></i>
            <i className="fab fa-linkedin"></i>
          </div>
        </footer>
      </div>
    </main>
  );
};

export default TotalBalance;
