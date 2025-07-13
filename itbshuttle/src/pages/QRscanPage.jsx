// src/pages/QRscanPage.jsx
import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { checkinQR, manualCheckIn } from "../services/schedules";

export default function QRscanPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const ticketId = state?.id;

  const qrRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const config = { fps: 10, qrbox: { width: 250, height: 250 } };

  useEffect(() => {
    if (!qrRef.current) {
      qrRef.current = new Html5Qrcode("reader");
      qrRef.current
        .start({ facingMode: "environment" }, config, handleQrSuccess)
        .catch((err) => console.error("QR start error:", err));
    }
    return () => {
      if (qrRef.current?.getState?.() === 2) {
        qrRef.current.stop().then(() => qrRef.current.clear());
      }
    };
  }, []);

  async function handleQrSuccess(decodedText /*, decodedResult */) {
    if (loading) return; // still processing previous result
    await processCheckIn(() => checkinQR(decodedText.split("id=")[1]));
  }

  /* ───── Manual-PIN modal ───── */
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [pinErr, setPinErr] = useState("");

  const openPinModal = () => setPinModalOpen(true);
  const closePinModal = () => {
    setPin("");
    setPinErr("");
    setPinModalOpen(false);
  };

  async function submitPin() {
    if (pin.trim().length !== 6) {
      setPinErr("PIN must be 6 digits");
      return;
    }
    await processCheckIn(() => manualCheckIn(ticketId, pin.trim()));
  }

  /* ───── shared helper ───── */
  async function processCheckIn(apiCallFn) {
    setLoading(true);
    qrRef.current?.stop(); // pause camera while hitting API
    try {
      await apiCallFn();
      alert("Check-in successful!");
      navigate("/ticket", { replace: true });
    } catch (err) {
      console.error(err);
      alert(err?.message || "Check-in failed");
      // resume scanner only if user hasn’t navigated away
      if (qrRef.current?.getState?.() !== 2) {
        qrRef.current
          .start({ facingMode: "environment" }, config, handleQrSuccess)
          .catch(console.error);
      }
    } finally {
      setLoading(false);
      closePinModal();
    }
  }

  return (
    <div className="flex flex-col items-center mt-4 gap-4">
      {/* QR camera feed */}
      <div
        id="reader"
        className="w-full max-w-[360px] aspect-square rounded-xl overflow-hidden shadow-md"
      />

      {/* Manual PIN button (disabled when scanner busy) */}
      <button
        className="mt-4 px-4 py-2 bg-[#5A82FC] text-white rounded-full disabled:opacity-50"
        disabled={loading || !ticketId}
        onClick={openPinModal}
      >
        Enter Code manually
      </button>

      {loading && <div className="text-blue-600 mt-2">Processing…</div>}

      {/* ---------- Mini modal ---------- */}
      {pinModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-80 rounded-2xl p-6 text-center shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Manual Check-in</h3>

            <input
              type="text"
              maxLength="6"
              placeholder="Enter 6-digit PIN"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-center mb-2"
              value={pin}
              onChange={(e) => {
                setPinErr("");
                setPin(e.target.value.replace(/\D/g, "")); // allow digits only
              }}
            />
            {pinErr && (
              <div className="text-red-500 text-sm mb-2">{pinErr}</div>
            )}

            <div className="flex justify-center gap-4 mt-2">
              <button
                onClick={submitPin}
                disabled={loading}
                className="bg-[#5A82FC] text-white rounded-full px-4 py-2 disabled:opacity-50"
              >
                Confirm
              </button>
              <button
                onClick={closePinModal}
                disabled={loading}
                className="border border-blue-500 text-blue-500 rounded-full px-4 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
