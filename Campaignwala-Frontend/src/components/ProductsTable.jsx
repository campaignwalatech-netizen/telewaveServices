import { MoreVertical, Download, Upload } from "lucide-react";
import { useState } from "react";

const Offers = [
  {
    id: 1,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png",
    company: "Google",
    date: "08/06/2025",
    stage: "UPLOAD",
    commission: "₹50",
    bonus: "₹0",
    withdrawal: "No",
  },
  {
    id: 2,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1200px-Amazon_logo.svg.png",
    company: "Amazon",
    date: "04/08/2025",
    stage: "UPLOAD",
    commission: "₹50",
    bonus: "₹50",
    withdrawal: "Unk",
  },
  {
    id: 3,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_logo_%282019%29.png/1200px-Facebook_logo_%282019%29.png",
    company: "Facebook",
    date: "10/06/2025",
    stage: "UPLOAD",
    commission: "₹50",
    bonus: "₹50",
    withdrawal: "No",
  },
  {
    id: 4,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Microsoft_logo.svg/1200px-Microsoft_logo.svg.png",
    company: "Microsoft",
    date: "12/05/2025",
    stage: "UPLOAD",
    commission: "₹50",
    bonus: "₹50",
    withdrawal: "Yes",
  },
  {
    id: 5,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Logo_of_YouTube_%282015-2017%29.svg/1200px-Logo_of_YouTube_%282015-2017%29.svg.png",
    company: "YouTube",
    date: "15/07/2025",
    stage: "UPLOAD",
    commission: "₹50",
    bonus: "₹50",
    withdrawal: "No",
  },
];

export default function OffersTable() {
  const [expandedRow, setExpandedRow] = useState(null);

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col">
      {/* Header Card */}
      <div className="bg-card rounded-lg border border-border p-4 sm:p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-foreground text-balance">
              ALL CAMPAIGNS
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground text-balance">
              18 active campaigns
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm whitespace-nowrap flex-shrink-0">
            <Upload className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm flex-1 flex flex-col min-h-0">
        <div className="overflow-x-auto scrollbar-hide flex-1">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-border bg-muted/50 sticky top-0">
                <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-foreground text-balance">
                  IMAGE
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-foreground text-balance">
                  DATE
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-foreground text-balance">
                  LATEST STAGE
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-foreground text-balance">
                  COMMISSION
                </th>
                <th className="hidden md:table-cell px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-foreground text-balance">
                  INTEGRATIONAL BONUS
                </th>
                <th className="hidden lg:table-cell px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-foreground text-balance">
                  WITHDR
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-foreground text-balance">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {Offers.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 sm:px-6 py-4">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.company}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover bg-muted p-1"
                    />
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-foreground text-balance">
                    {product.date}
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-[#4406CB] text-white">
                      {product.stage}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-foreground font-medium text-balance">
                    {product.commission}
                  </td>
                  <td className="hidden md:table-cell px-4 sm:px-6 py-4 text-xs sm:text-sm text-foreground font-medium text-balance">
                    {product.bonus}
                  </td>
                  <td className="hidden lg:table-cell px-4 sm:px-6 py-4 text-xs sm:text-sm text-foreground text-balance">
                    {product.withdrawal}
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
