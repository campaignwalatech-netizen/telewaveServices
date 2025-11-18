import { Save, X } from "lucide-react";

export const DistributeLeadsForm = () => (
  <div className="p-6 space-y-6">
    <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-6 shadow-lg">
      <h3 className="text-xl font-semibold text-foreground mb-6">Distribute Leads</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Select Team Member</label>
          <select className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground">
            <option>John Doe</option>
            <option>Jane Smith</option>
            <option>Mike Johnson</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Number of Leads</label>
          <input
            type="number"
            placeholder="Enter number"
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Priority</label>
          <select className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground">
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 font-medium shadow-md hover:shadow-lg">
          <Save className="w-4 h-4" />
          Distribute
        </button>
      </div>
    </div>
  </div>
);

export const UploadLeadsForm = () => (
  <div className="p-6 space-y-6">
    <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-6 shadow-lg">
      <h3 className="text-xl font-semibold text-foreground mb-6">Upload Fresh Leads</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Upload CSV File</label>
          <input
            type="file"
            accept=".csv"
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Campaign Name</label>
          <input
            type="text"
            placeholder="Enter campaign name"
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Description</label>
          <textarea
            placeholder="Enter description"
            rows="3"
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 font-medium shadow-md hover:shadow-lg">
          <Save className="w-4 h-4" />
          Upload Leads
        </button>
      </div>
    </div>
  </div>
);

export const ApproveAccountForm = () => (
  <div className="p-6 space-y-6">
    <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-6 shadow-lg">
      <h3 className="text-xl font-semibold text-foreground mb-6">Approve Account</h3>
      <div className="space-y-4">
        <div className="bg-background/50 border border-border/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-semibold text-foreground">John Doe</p>
              <p className="text-sm text-muted-foreground">john.doe@example.com</p>
            </div>
            <span className="px-3 py-1 text-xs font-semibold bg-yellow-500/20 text-yellow-500 rounded-md">
              Pending
            </span>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 font-medium">
              Approve
            </button>
            <button className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-medium">
              Reject
            </button>
          </div>
        </div>
        <div className="bg-background/50 border border-border/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-semibold text-foreground">Jane Smith</p>
              <p className="text-sm text-muted-foreground">jane.smith@example.com</p>
            </div>
            <span className="px-3 py-1 text-xs font-semibold bg-yellow-500/20 text-yellow-500 rounded-md">
              Pending
            </span>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 font-medium">
              Approve
            </button>
            <button className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-medium">
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const AddAccountForm = () => (
  <div className="p-6 space-y-6">
    <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-6 shadow-lg">
      <h3 className="text-xl font-semibold text-foreground mb-6">Add New Account</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
            <input
              type="text"
              placeholder="Enter full name"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <input
              type="email"
              placeholder="Enter email"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
            <input
              type="tel"
              placeholder="Enter phone number"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Role</label>
            <select className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground">
              <option>Admin</option>
              <option>Manager</option>
              <option>User</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Address</label>
          <textarea
            placeholder="Enter address"
            rows="3"
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 font-medium shadow-md hover:shadow-lg">
          <Save className="w-4 h-4" />
          Add Account
        </button>
      </div>
    </div>
  </div>
);

export const DefaultView = () => (
  <div className="p-6">
    <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-8 shadow-lg text-center">
      <h3 className="text-2xl font-bold text-foreground mb-4">Welcome to Campaignwala Admin Dashboard</h3>
      <p className="text-muted-foreground">
        Select a menu item from the sidebar to get started
      </p>
    </div>
  </div>
);
