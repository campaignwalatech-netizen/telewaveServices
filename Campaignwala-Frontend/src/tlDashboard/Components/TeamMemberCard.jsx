import { Mail, Phone, TrendingUp, Award, Clock, MoreVertical } from "lucide-react";

export default function TeamMemberCard({ member, onViewDetails, onRemove }) {
  const conversionRate = member.statistics?.totalLeads > 0 
    ? ((member.statistics?.completedLeads || 0) / member.statistics?.totalLeads * 100).toFixed(1)
    : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="font-bold text-white text-lg">
              {member.name.charAt(0)}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">{member.name}</h4>
            <div className="flex items-center space-x-2 mt-1">
              <Mail className="w-3 h-3 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{member.email}</span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <Phone className="w-3 h-3 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{member.phoneNumber}</span>
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <MoreVertical className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Leads</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            {member.statistics?.totalLeads || 0}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Conversion</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            {conversionRate}%
          </p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Award className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Rating: {member.performance?.rating || 0}/5
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Joined: {new Date(member.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center space-x-3">
        <button
          onClick={onViewDetails}
          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          View Details
        </button>
        <button
          onClick={onRemove}
          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  );
}