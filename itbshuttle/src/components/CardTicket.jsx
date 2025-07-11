// import { useNavigate } from "react-router-dom";

export default function CardTicket({ ticket, onClick }) {
  // const navigate = useNavigate();

  const handleBook = () => {
    if (ticket.status === "available") {
      onClick(ticket);
      // navigate("/qrscan"); // optionally redirect
    }
  };

  return (
    <div
      className="relative bg-white inset-shadow-2xs shadow-md rounded-[20px] px-6 py-4 flex justify-between items-center max-w-4xl mx-auto my-6 overflow-hidden text-[14px] md:text-base"
      onClick={handleBook}
    >
      {/* Left notch */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-transparent shadow-[inset_8px_0_15px_rgba(0,0,0,0.1)] z-10" />

      {/* Right notch */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-transparent shadow-[inset_-8px_0_15px_rgba(0,0,0,0.1)] z-10" />

      {/* Content */}
      <div className="z-10 text-[13px] md:text-base">
        <h2 className="text-lg md:text-2xl font-semibold text-gray-500">
          {ticket.route}
        </h2>
        <div className="mt-3 space-y-1 text-gray-400 font-medium">
          <div className="flex gap-2">
            <span>Departure Time</span>
            <span>: {ticket.departure_time}</span>
          </div>
          <div className="flex gap-2">
            <span>Arrival Time</span>
            <span>: {ticket.arrival_time}</span>
          </div>
          <div className="flex gap-2">
            <span>Available Seats</span>
            <span>: {ticket.available_seat}</span>
          </div>
        </div>
      </div>

      {/* Booking Button */}
      <div className="text-center text-blue-500 z-10 text-xs md:text-base">
        {ticket.status === "available" ? (
          <div className="mt-2 px-4 py-1.5 border-2 border-blue-500 rounded-xl text-md md:text-2xl font-medium">
            Book
          </div>
        ) : (
          <div className="mt-2 px-4 py-1.5 border-2 border-gray-300 text-gray-400 rounded-xl text-md md:text-2xl font-medium cursor-not-allowed">
            {ticket.status}
          </div>
        )}
      </div>
    </div>
  );
}
