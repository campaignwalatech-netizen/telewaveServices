import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, Download } from "lucide-react";
import tlService from "../../services/tlService";

export default function TLWallet() {
  const [wallet, setWallet] = useState(null);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Wallet</h1>
      {/* Implementation */}
    </div>
  );
}