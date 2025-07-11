import { useEffect, useState } from "react";
import BookingDialog from "../components/BookingDialog";
import CardBookedTicket from "../components/CardBookedTicket";
import { getTickets } from "../services/schedules";

export default function Tickets() {
  const [isOpen, setIsOpen] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleCardClick = () => {
    setIsOpen(true);
  };

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const result = await getTickets();
        setTickets(result);
      } catch (err) {
        console.error("Failed to fetch tickets", err);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  return (
    <>
      <div className="h-16 content-center bg-[#5A82FC]">
        <div className="text-xl text-center text-white">Hi, John Doe!</div>
      </div>

      <div className="overflow-y-auto">
        <div className="flex-col px-4">
          {loading ? (
            <div className="text-center text-white mt-6">Loading...</div>
          ) : tickets.length > 0 ? (
            tickets.map((ticket) => {
              if (ticket.status != "cancelled") {
                return (
                  <div key={ticket.id} onClick={handleCardClick}>
                    <CardBookedTicket ticket={ticket} />
                  </div>
                );
              }
            })
          ) : (
            <div className="text-center text-gray-400 mt-4">
              No tickets found.
            </div>
          )}
          <div className="h-20"></div>
        </div>
      </div>

      <BookingDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
