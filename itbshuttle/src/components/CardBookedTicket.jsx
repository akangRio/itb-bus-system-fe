import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import clsx from "clsx";
import { cancelTicket } from "../services/schedules";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(duration);
dayjs.extend(customParseFormat);

export default function CardBookedTicket({ ticket, onCancelSuccess }) {
  const navigate = useNavigate();
  /** ─────────────── Local state ─────────────── */
  const [timeLeft, setTimeLeft] = useState("—");
  const [confirmOpen, setConfirmOpen] = useState(false); // ✨ NEW

  /** ───────────── Countdown ───────────── */
  useEffect(() => {
    if (!ticket.booking_expiry) return;

    const expiry = dayjs(ticket.booking_expiry, "DD-MM-YYYY HH:mm");

    const tick = () => {
      const diff = expiry.diff(dayjs());
      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }
      const d = dayjs.duration(diff);
      setTimeLeft(
        `${String(d.hours()).padStart(2, "0")}:${String(d.minutes()).padStart(
          2,
          "0",
        )}:${String(d.seconds()).padStart(2, "0")}`,
      );
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [ticket.booking_expiry]);

  /** ───────────── Action handlers ───────────── */
  const handleScan = () => {
    if (
      ["finished", "cancelled", "missed", "checked in", "on trip"].includes(
        ticket.status,
      )
    )
      return;
    navigate("/qrscan", { state: { id: ticket.id } });
  };

  // — Called only AFTER user confirms. -------------
  const cancelNow = async () => {
    try {
      await cancelTicket(ticket.id);
      alert("Ticket cancelled");
      onCancelSuccess ? onCancelSuccess() : navigate(0); // refresh list
    } catch (err) {
      alert(err?.message || "Cancel failed");
    } finally {
      setConfirmOpen(false);
    }
  };

  /** ───────────── Helpers ───────────── */
  const statusClass = clsx(
    "mt-2 px-4 py-1.5 rounded-xl text-[13px] md:text-base font-medium select-none",
    {
      "bg-gray-300 text-white cursor-not-allowed": ticket.status === "finished",
      "bg-gray-500 text-white cursor-not-allowed":
        ticket.status === "checked in" || ticket.status === "on trip",
      "bg-red-100 text-red-500 border border-red-300":
        ticket.status === "missed" || ticket.status === "cancelled",
      "bg-[#5A82FC] text-white hover:bg-blue-600 cursor-pointer":
        ticket.status === "available" || ticket.status === "booked",
    },
  );

  const scheduleDate = ticket.booking_expiry
    ? dayjs(ticket.booking_expiry, "DD-MM-YYYY HH:mm").format("DD MMM YYYY")
    : "-";

  /** ───────────── JSX ───────────── */
  return (
    <>
      {/* ───── Ticket Card ───── */}
      <div className="relative bg-white inset-shadow-2xs shadow-md rounded-[20px] px-6 py-4 flex justify-between gap-4 items-start max-w-4xl mx-auto my-6 overflow-hidden text-[13px] md:text-base">
        {/* Notches */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-transparent shadow-[inset_8px_0_15px_rgba(0,0,0,0.1)]" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-transparent shadow-[inset_-8px_0_15px_rgba(0,0,0,0.1)]" />

        {/* Left column */}
        <div className="flex flex-col gap-1 grow">
          {/* <span className="text-[11px] text-gray-400 break-all">
            Booking ID:&nbsp;{ticket.id}
          </span> */}

          <h2 className="text-lg md:text-2xl font-semibold text-gray-600">
            {ticket.route}
          </h2>

          <div className="text-gray-400 font-medium space-y-0.5">
            <p>
              Departure&nbsp;Time&nbsp;:&nbsp;
              <span className="text-gray-700">{ticket.departure_time}</span>
            </p>
            <p>
              Arrival&nbsp;Time&nbsp;:&nbsp;
              <span className="text-gray-700">{ticket.arrival_time}</span>
            </p>
            <p>
              Plate Number:&nbsp;
              <span className="text-gray-700">{ticket.plate_number}</span>
            </p>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col items-end shrink-0">
          <span className="text-xs text-gray-500">{scheduleDate}</span>
          {ticket.checkin_status !== "checked in" && (
            <span className="text-[11px] text-gray-400">⏱ {timeLeft}</span>
          )}

          {ticket.status === "finished" ? (
            <div className={statusClass}>Finished</div>
          ) : (
            <>
              {ticket.checkin_status === "not checked in" &&
                !["cancelled", "missed"].includes(ticket.status) && (
                  <button
                    onClick={() => setConfirmOpen(true)} // 🔔 open modal
                    className="mt-2 mr-1 px-4 py-1.5 border border-blue-500 text-blue-500 rounded-xl text-[13px] md:text-base"
                  >
                    Cancel
                  </button>
                )}

              <button
                className={statusClass}
                onClick={handleScan}
                disabled={[
                  "cancelled",
                  "missed",
                  "finished",
                  "checked in",
                  "on trip",
                ].includes(ticket.status)}
              >
                {ticket.status === "checked in"
                  ? "Checked In"
                  : ticket.status === "on trip"
                    ? "On Trip"
                    : ["missed", "cancelled"].includes(ticket.status)
                      ? ticket.status.charAt(0).toUpperCase() +
                        ticket.status.slice(1)
                      : "Scan QR"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ───── Confirm-Cancel Modal ───── */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 text-center shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Are you sure?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Do you really want to cancel this ticket?
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-6 py-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
              >
                No
              </button>
              <button
                onClick={cancelNow}
                className="px-6 py-2 rounded-full bg-red-500 text-white hover:bg-red-600"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
