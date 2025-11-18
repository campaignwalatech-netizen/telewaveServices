import React from 'react';

const OverviewCards = () => {
  const data = [
    { title: 'Current Balance', value: '₹ 5,200.75', note: '+₹250.00 from last week' },
    { title: 'Total Earnings', value: '₹ 18,500.00', note: '+₹1,200.00 this month' },
    { title: 'Total Bonus', value: '₹ 1,500.00', note: 'Referral bonuses received' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 px-6 mt-6">
      {data.map((item, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition border border-gray-100"
        >
          <h2 className="text-gray-600 text-sm">{item.title}</h2>
          <p className="text-2xl font-semibold mt-2">{item.value}</p>
          <p className="text-sm text-green-600 mt-1">{item.note}</p>
        </div>
      ))}
    </div>
  );
};

export default OverviewCards;