import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function ResponsiveCalendar({ selected, onSelect }) {
  return (
    <div className="w-full max-w-sm mx-auto p-4 sm:p-6">
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        showOutsideDays
        className="text-sm"
        modifiersClassNames={{
          today: "text-blue-600 font-semibold",
          selected: "bg-blue-500 text-white rounded-full",
        }}
        styles={{
          caption: { textAlign: "center" },
          table: { width: "100%" },
        }}
      />
    </div>
  );
}
