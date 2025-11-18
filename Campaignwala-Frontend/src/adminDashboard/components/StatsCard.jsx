export default function StatsCard({ stat }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 transition-transform hover:scale-105">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`p-2 sm:p-3 rounded-lg ${stat.color}`}>
          <stat.icon className="text-white" size={20} />
        </div>
        <span className="text-green-500 text-xs sm:text-sm font-semibold">
          {stat.change}
        </span>
      </div>
      <h3 className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-1">
        {stat.title}
      </h3>
      <p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
        {stat.value}
      </p>
    </div>
  );
}
