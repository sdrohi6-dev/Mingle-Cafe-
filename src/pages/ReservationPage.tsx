import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  CheckCircle2,
  Download,
  AlertCircle,
  X,
  Search,
  Sparkles,
} from 'lucide-react';
import { Reservation, SeatingArea } from '../types';
import { dataService } from '../services/dataService';
import { useSettings } from '../context/SettingsContext';

const TIME_SLOTS = [
  '08:30 AM',
  '09:30 AM',
  '10:30 AM',
  '11:30 AM',
  '12:30 PM',
  '01:30 PM',
  '03:00 PM',
  '04:30 PM',
  '06:00 PM',
  '07:30 PM',
  '08:30 PM',
  '09:30 PM',
];

export const ReservationPage: React.FC = () => {
  const { settings } = useSettings();

  // Tomorrow as default date
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [date, setDate] = useState<string>(tomorrowStr);
  const [timeSlot, setTimeSlot] = useState<string>('12:30 PM');
  const [partySize, setPartySize] = useState<number>(2);
  const [seatingArea, setSeatingArea] = useState<SeatingArea>('terrace');
  const [customerName, setCustomerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [occasion, setOccasion] = useState<string>('Brunch Catchup');
  const [specialRequests, setSpecialRequests] = useState<string>('');

  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Lookup state
  const [lookupId, setLookupId] = useState('');
  const [lookupResult, setLookupResult] = useState<Reservation | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Check real slot capacity
  const slotAvailability = dataService.checkSlotAvailability(date, timeSlot);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (!customerName.trim() || !phone.trim() || !email.trim()) {
      setBookingError('Please fill in your name, phone number, and email.');
      return;
    }

    if (!slotAvailability.available) {
      setBookingError('This time slot is fully booked. Please select another slot.');
      return;
    }

    try {
      const res = dataService.createReservation({
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        date,
        timeSlot,
        partySize,
        seatingArea,
        occasion,
        specialRequests: specialRequests.trim(),
      });
      setConfirmedReservation(res);
    } catch (err: any) {
      setBookingError('Unable to reserve table at this moment.');
    }
  };

  const handleDownloadICS = (res: Reservation) => {
    // Generate .ics calendar file
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CafeFlow//Bistro Reservations//EN
BEGIN:VEVENT
UID:${res.id}@cafeflow.app
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:Table Reservation at ${settings.name}
DESCRIPTION:Reservation ID: ${res.id}\\nParty Size: ${res.partySize} Guests\\nArea: ${res.seatingArea}\\nOccasion: ${res.occasion || 'Dining'}
LOCATION:${settings.address}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `CafeFlow-Reservation-${res.id}.ics`;
    link.click();
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    if (!lookupId.trim()) return;

    const res = dataService.getReservation(lookupId.trim());
    if (res) {
      setLookupResult(res);
    } else {
      setLookupError('No reservation found matching this Reference ID.');
      setLookupResult(null);
    }
  };

  const handleCancelReservation = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      dataService.updateReservationStatus(id, 'cancelled');
      const updated = dataService.getReservation(id);
      if (updated) setLookupResult(updated);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 pb-24">
      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#D9532F]">
          Table Reservations
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white">
          Reserve Your Bistro Experience
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
          Book your table for weekend brunch, intimate date nights, or family gatherings with instant confirmation and live slot availability.
        </p>
      </div>

      {/* Confirmation State */}
      {confirmedReservation ? (
        <div className="max-w-lg mx-auto bg-white dark:bg-[#1E1915] rounded-3xl p-6 sm:p-8 border border-[#EDE8E1] dark:border-[#2E2621] shadow-xl text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-[#EBF5EE] text-[#2F663C] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
              Table Confirmed!
            </h2>
            <p className="text-xs text-stone-500">
              Booking Ref:{' '}
              <strong className="font-mono text-stone-800 dark:text-stone-200">
                {confirmedReservation.id}
              </strong>
            </p>
          </div>

          <div className="p-4 bg-[#FAF7F2] dark:bg-[#25201C] rounded-2xl border border-[#EDE8E1] dark:border-[#2E2621] text-xs text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-stone-500">Guest:</span>
              <span className="font-semibold">{confirmedReservation.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Date &amp; Time:</span>
              <span className="font-semibold">
                {confirmedReservation.date} at {confirmedReservation.timeSlot}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Party Size:</span>
              <span className="font-semibold">{confirmedReservation.partySize} Guests</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Seating Area:</span>
              <span className="font-semibold capitalize">{confirmedReservation.seatingArea}</span>
            </div>
            {confirmedReservation.occasion && (
              <div className="flex justify-between">
                <span className="text-stone-500">Occasion:</span>
                <span className="font-semibold">{confirmedReservation.occasion}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={() => handleDownloadICS(confirmedReservation)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#2E1C12] dark:bg-white text-white dark:text-[#2E1C12] hover:bg-[#D9532F] dark:hover:bg-[#D9532F] dark:hover:text-white transition-colors text-xs font-semibold flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Add to Calendar (.ics)</span>
            </button>
            <button
              onClick={() => setConfirmedReservation(null)}
              className="py-2.5 px-4 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-medium hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Book Another Table
            </button>
          </div>
        </div>
      ) : (
        /* Reservation Form */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-8 bg-white dark:bg-[#1E1915] rounded-3xl p-6 sm:p-8 border border-[#EDE8E1] dark:border-[#2E2621] shadow-xs space-y-6"
          >
            {bookingError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            {/* Row 1: Date & Party Size */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 mb-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#D9532F]" />
                  Select Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18] text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 mb-1.5">
                  <Users className="w-3.5 h-3.5 text-[#D9532F]" />
                  Party Size (Guests)
                </label>
                <select
                  value={partySize}
                  onChange={(e) => setPartySize(parseInt(e.target.value, 10))}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18] text-xs"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'Guest (Solo)' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Time Slots Grid */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#D9532F]" />
                  Choose Time Slot
                </label>
                <span className="text-[11px] text-stone-400">
                  {slotAvailability.maxCapacity - slotAvailability.bookedCount} tables open at {timeSlot}
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const check = dataService.checkSlotAvailability(date, slot);
                  const isSelected = timeSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={!check.available}
                      onClick={() => setTimeSlot(slot)}
                      className={`py-2 px-1 rounded-xl text-xs font-mono font-medium transition-colors ${
                        isSelected
                          ? 'bg-[#D9532F] text-white font-bold shadow-xs'
                          : check.available
                          ? 'bg-stone-50 dark:bg-stone-800/60 hover:bg-stone-100 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                          : 'bg-stone-100 dark:bg-stone-900 text-stone-400 line-through cursor-not-allowed opacity-50'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 3: Seating Preference */}
            <div>
              <label className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 mb-2">
                <MapPin className="w-3.5 h-3.5 text-[#D9532F]" />
                Seating Atmosphere
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { id: 'terrace', label: 'Sunlit Terrace', desc: 'Garden greenery' },
                  { id: 'indoor', label: 'Main Bistro', desc: 'Air-conditioned warmth' },
                  { id: 'window', label: 'Window Nook', desc: 'Street viewing & cozy' },
                  { id: 'bar', label: 'Brew Bar Counter', desc: 'Watch baristas pull shots' },
                ].map((area) => (
                  <button
                    key={area.id}
                    type="button"
                    onClick={() => setSeatingArea(area.id as SeatingArea)}
                    className={`p-3 rounded-xl border text-left transition-colors ${
                      seatingArea === area.id
                        ? 'border-[#D9532F] bg-[#FDF0EC] dark:bg-[#341F18] text-[#D9532F]'
                        : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <p className="font-bold">{area.label}</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">{area.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Row 4: Guest Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-stone-500 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Sameer Sen"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18]"
                />
              </div>
              <div>
                <label className="text-[11px] text-stone-500 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18]"
                />
              </div>
              <div>
                <label className="text-[11px] text-stone-500 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sameer@example.com"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18]"
                />
              </div>
            </div>

            {/* Row 5: Occasion & Special Requests */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-stone-500 block mb-1">Dining Occasion</label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18]"
                >
                  <option value="Brunch Catchup">Brunch Catchup</option>
                  <option value="Birthday Celebration">Birthday Celebration</option>
                  <option value="Anniversary">Romantic Anniversary</option>
                  <option value="Business Breakfast">Business Breakfast</option>
                  <option value="Casual Gathering">Casual Gathering</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-stone-500 block mb-1">
                  Special Requests (Optional)
                </label>
                <input
                  type="text"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. High chair for baby, quiet table..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18]"
                />
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-[#D9532F] text-white hover:bg-[#C24522] transition-colors font-semibold text-xs sm:text-sm shadow-sm"
            >
              Confirm Reservation &middot; {date} at {timeSlot}
            </button>
          </form>

          {/* Right Column: Reservation Status Lookup Box */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-[#1E1915] p-5 sm:p-6 rounded-3xl border border-[#EDE8E1] dark:border-[#2E2621] shadow-xs space-y-4">
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white">
                Check Existing Booking
              </h3>
              <p className="text-xs text-stone-500">
                Already have a reservation? Enter your booking ID to check status or cancel.
              </p>

              <form onSubmit={handleLookup} className="space-y-2">
                <input
                  type="text"
                  value={lookupId}
                  onChange={(e) => setLookupId(e.target.value)}
                  placeholder="e.g. res_1"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18] text-xs font-mono"
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 hover:bg-stone-900 text-xs font-semibold transition-colors"
                >
                  Lookup Booking
                </button>
              </form>

              {lookupError && <p className="text-xs text-red-500">{lookupError}</p>}

              {lookupResult && (
                <div className="p-3 bg-[#FAF7F2] dark:bg-[#25201C] rounded-xl border border-[#EDE8E1] dark:border-[#2E2621] space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{lookupResult.customerName}</span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase ${
                        lookupResult.status === 'confirmed'
                          ? 'bg-green-100 text-green-700'
                          : lookupResult.status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {lookupResult.status}
                    </span>
                  </div>
                  <p className="text-stone-500">
                    {lookupResult.date} at {lookupResult.timeSlot} ({lookupResult.partySize} guests)
                  </p>
                  {lookupResult.tableNumber && (
                    <p className="text-stone-700 dark:text-stone-300 font-semibold">
                      Assigned Table: #{lookupResult.tableNumber}
                    </p>
                  )}

                  {lookupResult.status !== 'cancelled' && (
                    <button
                      onClick={() => handleCancelReservation(lookupResult.id)}
                      className="text-xs text-red-600 hover:underline pt-1 block"
                    >
                      Cancel Reservation
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Bistro Policy Card */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#1E1915] border border-stone-200 dark:border-stone-800 text-xs text-stone-500 space-y-1.5">
              <p className="font-semibold text-stone-800 dark:text-stone-200">
                Reservation Policy:
              </p>
              <p>&bull; Tables are held for up to 15 minutes past reservation time.</p>
              <p>&bull; Large parties (8+ guests) are accommodated on the sunlit terrace.</p>
              <p>&bull; No cancellation fees for bookings cancelled up to 2 hours in advance.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
