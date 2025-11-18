import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

export default function CommonSelect({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className={`w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        {/* 👇 Always open downward */}
        <SelectContent side="bottom">
          {options.map((opt, index) => (
            <SelectItem
              key={index}
              value={typeof opt === "string" ? opt : opt.value}
            >
              {typeof opt === "string" ? opt : opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}