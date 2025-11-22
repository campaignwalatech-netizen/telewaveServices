import { MoreVertical, Download, Filter, SortAsc, SortDesc, MoreHorizontal, Upload } from "lucide-react";
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

  const handleExport = () => {
    // Dummy export functionality
    alert("Exporting campaigns data...");
  };

  return (
    <div className="p-6 h-full flex flex-col bg-background">

      {/* Table */}
      <div className="bg-card/30 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden shadow-lg flex-1 flex flex-col min-h-0">
        {/* Top bar inside card */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-card/40">
          <h4 className="text-sm font-semibold text-foreground/90">ALL Offers 18</h4>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 bg-background/30 border border-border/40 rounded-full px-2 py-1 shadow-inner">
              <button className="p-2 rounded-full hover:bg-muted/40" title="Filter">
                <Filter className="w-4 h-4 text-muted-foreground" />
              </button>
              <button className="p-2 rounded-full hover:bg-muted/40" title="Sort Asc">
                <SortAsc className="w-4 h-4 text-muted-foreground" />
              </button>
              <button className="p-2 rounded-full hover:bg-muted/40" title="Sort Desc">
                <SortDesc className="w-4 h-4 text-muted-foreground" />
              </button>
              <button className="p-2 rounded-full hover:bg-muted/40" title="More">
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 text-sm font-medium">
              <Upload className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto overflow-y-auto scrollbar-hide flex-1">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-border/50 bg-card sticky top-0">
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground/90 uppercase tracking-wider">
                  IMAGE
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground/90 uppercase tracking-wider">
                  DATE
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground/90 uppercase tracking-wider">
                  LATEST STAGE
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground/90 uppercase tracking-wider">
                  COMMISSION
                </th>
                <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-bold text-foreground/90 uppercase tracking-wider">
                  INTEGRATIONAL BONUS
                </th>
                <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-bold text-foreground/90 uppercase tracking-wider">
                  WITHDR
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground/90 uppercase tracking-wider">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {Offers.map((product, index) => (
                <tr
                  key={product.id}
                  className="border-b border-border/30 hover:bg-muted/20 transition-all duration-200 group"
                >
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 rounded-lg bg-background/50 border border-border/30 p-2 flex items-center justify-center">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.company}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground/90 font-medium">
                    {product.date}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-md text-xs font-bold whitespace-nowrap bg-[#4406CB] text-white shadow-md">
                      {product.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground font-semibold">
                    {product.commission}
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 text-sm text-foreground font-semibold">
                    {product.bonus}
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4 text-sm text-foreground/80">
                    {product.withdrawal}
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 hover:bg-muted/50 rounded-lg transition-all duration-200 border border-transparent hover:border-border/50">
                      <MoreVertical className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
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
