import { useEffect, useState } from "react";
import BookingDialog from "../components/BookingDialog";
import CardTicket from "../components/CardTicket";
import ResponsiveCalendar from "../components/ResponsiveCalendar";
import { ChevronRight, ArrowDownUp, CalendarDays } from "lucide-react";
import { getSchedules, bookSchedule, getProfile } from "../services/schedules";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [origin, setOrigin] = useState("BDG");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const handleCardClick = (ticket) => {
    setSelectedTicket(ticket);
    setIsOpen(true);
  };

  const handleDateSelect = (newDate) => {
    if (!newDate) return;

    const normalizedDate = new Date(
      newDate.getFullYear(),
      newDate.getMonth(),
      newDate.getDate(),
    );

    setSelectedDate(normalizedDate);
    setCalendarVisible(false);
  };

  const handleSwapOrigin = () => {
    setOrigin((prev) => (prev === "BDG" ? "JTNG" : "BDG"));
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const date =
        selectedDate.getFullYear() +
        "-" +
        String(selectedDate.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(selectedDate.getDate()).padStart(2, "0");
      const result = await getSchedules(date, origin);
      result.forEach((ticket) => {
        ticket.date = selectedDate;
      });
      setTickets(result);
    } catch (err) {
      console.error("Failed to fetch schedules", err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookConfirm = async () => {
    if (!selectedTicket) return;
    try {
      await bookSchedule(selectedTicket.id);
      alert("Booking successful!");
      setIsOpen(false);
      setSelectedTicket(null);
      fetchSchedules(); // Refetch schedules after booking
    } catch (error) {
      alert("Failed to book ticket: " + error.message);
    }
  };

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      localStorage.setItem("name", data.name);
    } catch (err) {
      console.error("Failed to fetch profile", err.message);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchProfile();
  }, [selectedDate, origin]);

  return (
    <>
      {/* Header */}
      <div className="h-16 content-center bg-[#5A82FC]">
        <div className="text-xl text-center text-white">
          Hi, {localStorage.getItem("name")} !
        </div>
      </div>

      {/* Top Section */}
      <div className="content-center bg-white shadow-md">
        <div className="space-y-3 p-4 bg-white rounded-xl max-w-md mx-auto">
          {/* Route Selector */}
          <div className="relative bg-[#F2F3F8] flex justify-between items-center rounded-xl px-4 py-3 text-[#2c3e50] font-medium text-base">
            <div className="flex">
              <span>{origin === "BDG" ? "Bandung" : "Jatinangor"}</span>
              <span className="mx-2 text-gray-400">
                <ChevronRight />
              </span>
              <span>{origin === "BDG" ? "Jatinangor" : "Bandung"}</span>
            </div>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#5A82FC] hover:bg-blue-600 text-white rounded-full shadow-md flex items-center justify-center"
              onClick={handleSwapOrigin}
            >
              <ArrowDownUp />
            </button>
          </div>

          {/* Departure Date */}
          <div className="space-y-1">
            <p className="text-sm text-gray-400 font-medium">Departure Date</p>
            <button
              onClick={() => setCalendarVisible((prev) => !prev)}
              className="w-full flex justify-between items-center bg-[#F2F3F8] rounded-xl px-4 py-3 text-[#2c3e50] font-medium text-base "
            >
              <span>
                {selectedDate
                  ? selectedDate.toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Pilih tanggal..."}
              </span>
              <span className="text-gray-400">
                <CalendarDays />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      {calendarVisible && (
        <div className="px-4 pt-4">
          <div className="bg-white rounded-lg shadow-sm">
            <ResponsiveCalendar
              selected={selectedDate}
              onSelect={handleDateSelect}
            />
          </div>
        </div>
      )}

      {/* Ticket Cards */}
      <div className="overflow-y-auto px-4">
        {loading ? (
          <div className="text-center text-blue-500 mt-6">Loading...</div>
        ) : Array.isArray(tickets) && tickets.length > 0 ? (
          tickets.map((ticket) => (
            <CardTicket
              key={ticket.id}
              ticket={ticket}
              onClick={() => handleCardClick(ticket)}
            />
          ))
        ) : (
          <div className="text-center text-gray-400 mt-4">
            No schedules available.
          </div>
        )}
        <div className="h-20"></div>
      </div>

      {/* Dialog */}
      <BookingDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        ticket={selectedTicket}
        onConfirm={handleBookConfirm}
      />
    </>
  );
}
