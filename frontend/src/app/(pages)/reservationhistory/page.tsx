"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "@/services/api"; // adjust path if needed

// ── Types ──────────────────────────────────────────────────────────────────────

interface Ticket {
  id: string;
  passengerName: string;
  passengerType: "ADULT" | "CHILD" | "INFANT";
  seatNumber: string;
  seatClass: string;
  seatPosition: string;
  price: number;
  passportNumber: string | null;
  dateOfBirth: string;
}

interface Reservation {
  id: string;
  flightNumber: string;
  originAirport: string;
  originCity: string;
  destinationAirport: string;
  destinationCity: string;
  departureTime: string;
  arrivalTime: string;
  fareName: string;
  cabinClass: string;
  numSeats: number;
  totalPrice: number;
  status: "CONFIRMED" | "CANCELLED" | "PENDING";
  tickets: Ticket[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function isFuture(departureTime: string) {
  return new Date(departureTime) > new Date();
}

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(dt: string) {
  return new Date(dt).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDuration(dep: string, arr: string) {
  const mins = Math.round(
    (new Date(arr).getTime() - new Date(dep).getTime()) / 60000
  );
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

function airportCode(city: string) {
  const map: Record<string, string> = {
    Cairo: "CAI",
    London: "LHR",
    Dubai: "DXB",
    "New York": "JFK",
    Paris: "CDG",
  };
  return map[city] ?? city.slice(0, 3).toUpperCase();
}

// ── Status Badge ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Reservation["status"] }) {
  const styles: Record<string, string> = {
    CONFIRMED:
      "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
    CANCELLED:
      "bg-red-50 text-red-600 border border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800",
    PENDING:
      "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? styles.PENDING}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

// ── Ticket Card ────────────────────────────────────────────────────────────────

function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            {ticket.passengerName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {ticket.passengerName}
            </p>
            <p className="text-xs text-neutral-500">
              {ticket.passengerType.charAt(0) +
                ticket.passengerType.slice(1).toLowerCase()}
            </p>
          </div>
        </div>
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          ${ticket.price.toFixed(2)}
        </p>
      </div>

      <div className="my-3 border-t border-dashed border-neutral-200 dark:border-neutral-700" />

      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-neutral-400">Seat</p>
          <p className="mt-0.5 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            {ticket.seatNumber}
          </p>
          <p className="text-xs text-neutral-500">{ticket.seatPosition}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-neutral-400">Class</p>
          <p className="mt-0.5 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            {ticket.seatClass.charAt(0) + ticket.seatClass.slice(1).toLowerCase()}
          </p>
        </div>
        {ticket.passportNumber && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-neutral-400">Passport</p>
            <p className="mt-0.5 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              {ticket.passportNumber}
            </p>
          </div>
        )}
        {ticket.dateOfBirth && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-neutral-400">Date of birth</p>
            <p className="mt-0.5 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              {new Date(ticket.dateOfBirth).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Reservation Card (list item) ───────────────────────────────────────────────

function ReservationCard({
  reservation,
  onClick,
}: {
  reservation: Reservation;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group w-full rounded-2xl border border-neutral-200 bg-white p-5 text-left transition-all hover:border-neutral-300 hover:shadow-sm active:scale-[0.995] dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              {airportCode(reservation.originCity)}
            </p>
            <p className="text-xs text-neutral-500">{reservation.originCity}</p>
          </div>

          <div className="flex flex-col items-center gap-1">
            <p className="text-[10px] text-neutral-400">
              {getDuration(reservation.departureTime, reservation.arrivalTime)}
            </p>
            <div className="flex items-center gap-1">
              <div className="h-px w-6 bg-neutral-300 dark:bg-neutral-600" />
              <span className="text-base text-neutral-400">✈</span>
              <div className="h-px w-6 bg-neutral-300 dark:bg-neutral-600" />
            </div>
            <p className="text-[10px] text-neutral-400">{reservation.cabinClass}</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              {airportCode(reservation.destinationCity)}
            </p>
            <p className="text-xs text-neutral-500">{reservation.destinationCity}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={reservation.status} />
          <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            ${reservation.totalPrice.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-dashed border-neutral-100 pt-3 dark:border-neutral-800">
        <div className="flex items-center gap-4 text-xs text-neutral-500">
          <span className="font-medium text-neutral-700 dark:text-neutral-300">
            {reservation.flightNumber}
          </span>
          <span>{formatDate(reservation.departureTime)}</span>
          <span>
            {formatTime(reservation.departureTime)} → {formatTime(reservation.arrivalTime)}
          </span>
          <span>
            {reservation.numSeats} seat{reservation.numSeats > 1 ? "s" : ""}
          </span>
        </div>
        <span className="text-xs text-neutral-400 transition-colors group-hover:text-neutral-600 dark:group-hover:text-neutral-300">
          View details →
        </span>
      </div>
    </button>
  );
}

// ── Detail View ────────────────────────────────────────────────────────────────

function ReservationDetail({
  reservation,
  onBack,
  onCancel,
  cancelling,
}: {
  reservation: Reservation;
  onBack: () => void;
  onCancel: (id: string) => Promise<void>;
  cancelling: boolean;
}) {
  const [showTickets, setShowTickets] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const canCancel =
    isFuture(reservation.departureTime) && reservation.status !== "CANCELLED";

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
      >
        ← Back to reservations
      </button>

      {/* Header card */}
      <div className="mb-4 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-neutral-500">
                {reservation.flightNumber}
              </p>
              <StatusBadge status={reservation.status} />
            </div>
            <div className="mt-3 flex items-center gap-5">
              <div>
                <p className="text-4xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                  {airportCode(reservation.originCity)}
                </p>
                <p className="mt-1 text-sm text-neutral-500">{reservation.originCity}</p>
                <p className="text-xs text-neutral-400">{reservation.originAirport}</p>
              </div>
              <div className="flex flex-col items-center gap-1 px-2">
                <p className="text-xs text-neutral-400">
                  {getDuration(reservation.departureTime, reservation.arrivalTime)}
                </p>
                <div className="flex items-center gap-1">
                  <div className="h-px w-10 bg-neutral-300 dark:bg-neutral-600" />
                  <span className="text-xl text-neutral-400">✈</span>
                  <div className="h-px w-10 bg-neutral-300 dark:bg-neutral-600" />
                </div>
                <p className="text-xs text-neutral-400">{reservation.fareName}</p>
              </div>
              <div>
                <p className="text-4xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                  {airportCode(reservation.destinationCity)}
                </p>
                <p className="mt-1 text-sm text-neutral-500">{reservation.destinationCity}</p>
                <p className="text-xs text-neutral-400">{reservation.destinationAirport}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
              ${reservation.totalPrice.toFixed(2)}
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              {reservation.numSeats} passenger{reservation.numSeats > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Times strip */}
        <div className="mt-5 grid grid-cols-3 gap-4 rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-neutral-400">Departure</p>
            <p className="mt-0.5 text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {formatTime(reservation.departureTime)}
            </p>
            <p className="text-xs text-neutral-500">{formatDate(reservation.departureTime)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-neutral-400">Arrival</p>
            <p className="mt-0.5 text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {formatTime(reservation.arrivalTime)}
            </p>
            <p className="text-xs text-neutral-500">{formatDate(reservation.arrivalTime)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-neutral-400">Cabin</p>
            <p className="mt-0.5 text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {reservation.cabinClass.charAt(0) +
                reservation.cabinClass.slice(1).toLowerCase()}
            </p>
            <p className="text-xs text-neutral-500">{reservation.fareName}</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mb-4 flex gap-3">
        <button
          onClick={() => setShowTickets((v) => !v)}
          className={`flex-1 rounded-xl border py-3 text-sm font-medium transition-all ${
            showTickets
              ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
              : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
          }`}
        >
          🎫 {showTickets ? "Hide tickets" : "View tickets"}
        </button>

        {canCancel ? (
          <button
            onClick={() => setShowConfirm(true)}
            disabled={cancelling}
            className="flex-1 rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-medium text-red-600 transition-all hover:bg-red-100 disabled:opacity-50 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
          >
            {cancelling ? "Cancelling…" : "✕ Cancel reservation"}
          </button>
        ) : (
          <div className="flex-1 rounded-xl border border-neutral-100 bg-neutral-50 py-3 text-center text-sm text-neutral-400 dark:border-neutral-800 dark:bg-neutral-800">
            {reservation.status === "CANCELLED" ? "Already cancelled" : "Flight already departed"}
          </div>
        )}
      </div>

      {/* Tickets panel */}
      {showTickets && (
        <div className="flex flex-col gap-3">
          {reservation.tickets.map((t) => (
            <TicketCard key={t.id} ticket={t} />
          ))}
        </div>
      )}

      {/* Cancel confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Cancel this reservation?
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              Flight{" "}
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                {reservation.flightNumber}
              </span>{" "}
              from {reservation.originCity} to {reservation.destinationCity} on{" "}
              {formatDate(reservation.departureTime)} will be cancelled for all passengers. This
              cannot be undone.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
              >
                Keep booking
              </button>
              <button
                onClick={async () => {
                  setShowConfirm(false);
                  await onCancel(reservation.id);
                }}
                disabled={cancelling}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                Yes, cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function ReservationHistoryPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    apiService
      .getReservations()
      .then((data: Reservation[]) => setReservations(data))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Keep selected in sync after cancel
  useEffect(() => {
    if (selected) {
      const updated = reservations.find((r) => r.id === selected.id);
      if (updated) setSelected(updated);
    }
  }, [reservations]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCancel = async (id: string) => {
    setCancelling(true);
    try {
      const updated: Reservation = await apiService.cancelReservation(id);
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: updated.status } : r))
      );
      showToast("Reservation cancelled successfully");
    } catch {
      showToast("Something went wrong. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  const upcoming = reservations.filter(
    (r) => r.status !== "CANCELLED" && isFuture(r.departureTime)
  );
  const past = reservations.filter(
    (r) => r.status !== "CANCELLED" && !isFuture(r.departureTime)
  );
  const cancelled = reservations.filter((r) => r.status === "CANCELLED");

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-2xl px-4 py-10">

        {/* Page header — hidden when in detail view */}
        {!selected && (
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              Reservation history
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              View and manage your flight bookings
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-3 py-16 text-neutral-400">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" />
            <p className="text-sm">Loading your reservations…</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Detail view */}
        {selected && !loading && (
          <ReservationDetail
            reservation={selected}
            onBack={() => setSelected(null)}
            onCancel={handleCancel}
            cancelling={cancelling}
          />
        )}

        {/* List view */}
        {!selected && !loading && !error && (
          <div className="space-y-8">
            {upcoming.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Upcoming · {upcoming.length}
                </h2>
                <div className="space-y-3">
                  {upcoming.map((r) => (
                    <ReservationCard key={r.id} reservation={r} onClick={() => setSelected(r)} />
                  ))}
                </div>
              </section>
            )}

            {past.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Past flights · {past.length}
                </h2>
                <div className="space-y-3 opacity-70">
                  {past.map((r) => (
                    <ReservationCard key={r.id} reservation={r} onClick={() => setSelected(r)} />
                  ))}
                </div>
              </section>
            )}

            {cancelled.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Cancelled · {cancelled.length}
                </h2>
                <div className="space-y-3 opacity-60">
                  {cancelled.map((r) => (
                    <ReservationCard key={r.id} reservation={r} onClick={() => setSelected(r)} />
                  ))}
                </div>
              </section>
            )}

            {reservations.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-16 text-neutral-400">
                <span className="text-4xl">✈️</span>
                <p className="text-sm">No reservations found</p>
              </div>
            )}
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm shadow-lg dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
