import { X } from "lucide-react";

export function DeleteModal({ isOpen, onClose, onConfirm, itemName, itemType = "item" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border border-border p-4 sm:p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base sm:text-lg font-bold text-foreground whitespace-nowrap">Confirm Delete</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-foreground mb-6 break-words">
          Are you sure you want to delete <strong>{itemName}</strong>?
        </p>
        <div className="flex gap-3">
          <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 whitespace-nowrap">
            Delete
          </button>
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground text-sm rounded-lg hover:bg-destructive/80 whitespace-nowrap">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function EditModal({ isOpen, onClose, onConfirm, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-card rounded-lg border border-border p-4 sm:p-6 max-w-md w-full my-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base sm:text-lg font-bold text-foreground whitespace-nowrap">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
        <div className="flex gap-3 mt-6">
          <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 whitespace-nowrap">
            Save Changes
          </button>
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground text-sm rounded-lg hover:bg-destructive/80 whitespace-nowrap">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText, confirmColor = "primary" }) {
  if (!isOpen) return null;

  const colorClasses = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    green: "bg-green-600 text-white hover:bg-green-700",
    red: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border border-border p-4 sm:p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base sm:text-lg font-bold text-foreground whitespace-nowrap">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-foreground mb-6 break-words">{message}</p>
        <div className="flex gap-3">
          <button onClick={onConfirm} className={`flex-1 px-4 py-2 text-sm rounded-lg whitespace-nowrap ${colorClasses[confirmColor]}`}>
            {confirmText}
          </button>
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground text-sm rounded-lg hover:bg-destructive/80 whitespace-nowrap">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
