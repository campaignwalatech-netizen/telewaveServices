import { useState, useEffect } from "react";
import { Bell, CheckCircle, XCircle } from "lucide-react";
import tlService from "../../services/tlService";

export default function TLNotifications() {
  const [notifications, setNotifications] = useState([]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Notifications</h1>
      {/* Implementation */}
    </div>
  );
}