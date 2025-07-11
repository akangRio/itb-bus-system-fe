export default function BookingDialog({ isOpen, onClose, ticket, onConfirm }) {
  if (!isOpen || !ticket) return null;
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex items-center justify-center">
      <div className="bg-white text-center rounded-2xl shadow-xl p-6 w-[90%] max-w-sm z-50">
        <h2 className="text-xl font-semibold text-blue-600 mb-4">
          Booking Confirmation
        </h2>

        <div className="text-sm text-gray-600 mb-2">
          <strong className="text-black">{ticket.route}</strong>
          <div className="mt-1">
            {new Date(ticket.date).toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div className="text-gray-500">
            {ticket.departure_time} - {ticket.arrival_time}
          </div>
          {ticket.available_seat !== undefined && (
            <div className="text-blue-600 mt-1 underline">
              {ticket.available_seat} seats left
            </div>
          )}
        </div>

        <div className="my-4 flex justify-center">
          <div className="bg-[#5A82FC] text-white rounded-full p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <button
            className="bg-[#5A82FC] text-white py-2 rounded-full shadow hover:bg-blue-300"
            onClick={onConfirm}
          >
            Book
          </button>
          <button
            className="border border-[#5A82FC] text-[#5A82FC] py-2 rounded-full hover:bg-blue-50"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
