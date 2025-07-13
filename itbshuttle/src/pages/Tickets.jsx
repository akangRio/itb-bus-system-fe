import { useEffect, useState } from "react";
import BookingDialog from "../components/BookingDialog";
import CardBookedTicket from "../components/CardBookedTicket";
import { getTickets } from "../services/schedules";

export default function Tickets() {
  const [isOpen, setIsOpen] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllFinished, setShowAllFinished] = useState(false); // NEW

  const handleCardClick = () => setIsOpen(true);
  useEffect(() => {
    (async () => {
      try {
        const result = await getTickets();
        setTickets(result ?? []);
      } catch (err) {
        console.error("Failed to fetch tickets", err);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const finished = tickets.filter((t) => t.status === "finished");
  const recentFinished = finished.slice(0, 5);
  const other = tickets.filter((t) => t.status !== "finished");

  const visibleTickets = [
    ...other.filter((t) => t.status !== "cancelled"),
    ...(showAllFinished ? finished : recentFinished),
  ];

  /* ─────────── UI ─────────── */
  return (
    <>
      {/* Header */}
      <div className="h-16 content-center bg-[#5A82FC]">
        <p className="text-xl text-center text-white">
          Hi, {localStorage.getItem("name") || "Guest"}!
        </p>
      </div>

      <div className="overflow-y-auto">
        <div className="flex-col px-4">
          {loading ? (
            <p className="text-center mt-6">Loading…</p>
          ) : visibleTickets.length ? (
            visibleTickets.map((ticket) => (
              <div key={ticket.id} onClick={handleCardClick}>
                <CardBookedTicket ticket={ticket} />
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 mt-4">No tickets found.</p>
          )}

          {!loading && finished.length > 5 && (
            <button
              onClick={() => setShowAllFinished((prev) => !prev)}
              className="my-4 mx-auto block px-6 py-2 rounded-full bg-white border border-blue-500 text-blue-500 hover:bg-blue-50"
            >
              {showAllFinished
                ? "Hide older finished tickets"
                : "Show all finished tickets"}
            </button>
          )}

          <div className="h-20" />
        </div>
      </div>

      <BookingDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
