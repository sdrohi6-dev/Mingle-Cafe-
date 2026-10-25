import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Send,
  MessageSquare,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { dataService } from '../services/dataService';

export const ContactPage: React.FC = () => {
  const { settings } = useSettings();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<'general' | 'catering' | 'event' | 'feedback'>('general');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    dataService.createInquiry({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      type,
      message: message.trim(),
    });

    setSubmitted(true);
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 pb-24">
      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#D9532F]">
          Get in Touch
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white">
          Contact &amp; Event Catering
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
          Planning an artisan coffee pop-up, corporate brunch, or private terrace celebration? Send our team an inquiry.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1E1915] p-6 sm:p-8 rounded-3xl border border-[#EDE8E1] dark:border-[#2E2621] shadow-xs space-y-5">
          <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-white">
            Send an Inquiry
          </h2>

          {submitted ? (
            <div className="p-6 bg-[#EBF5EE] text-[#2F663C] rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto" />
              <h3 className="font-serif font-bold text-base">Inquiry Received!</h3>
              <p className="text-xs">
                Our hospitality director will review your message and reply via email or WhatsApp within a few hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-500 block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vikram Joshi"
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18]"
                  />
                </div>
                <div>
                  <label className="text-stone-500 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-500 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vikram@example.com"
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18]"
                  />
                </div>
                <div>
                  <label className="text-stone-500 block mb-1">Inquiry Purpose</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18]"
                  >
                    <option value="general">General Question</option>
                    <option value="catering">Corporate Brunch Catering</option>
                    <option value="event">Private Terrace Buyout</option>
                    <option value="feedback">Food &amp; Service Feedback</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-stone-500 block mb-1">Message Details</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about the dates, estimated party size, dietary needs, or thoughts..."
                  className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#D9532F] text-white hover:bg-[#C24522] transition-colors font-semibold text-xs"
              >
                Submit Message to Manager
              </button>
            </form>
          )}
        </div>

        {/* Right Info & Map */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1915] border border-[#EDE8E1] dark:border-[#2E2621] space-y-4 shadow-xs text-xs">
            <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-white">
              Bistro Location &amp; Hours
            </h2>

            <div className="space-y-3 text-stone-600 dark:text-stone-300">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D9532F] shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#D9532F] shrink-0" />
                <span>{settings.openingHours}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D9532F] shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:underline font-mono">
                  {settings.phone}
                </a>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#D9532F] shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:underline">
                  {settings.email}
                </a>
              </p>
            </div>

            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex gap-2">
              <a
                href={`https://wa.me/${(settings.whatsappNumber || '919876543210').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-[#25D366] text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>WhatsApp Us</span>
              </a>
              <a
                href={`tel:${settings.phone}`}
                className="py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-medium text-xs flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Front Desk</span>
              </a>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden border border-[#EDE8E1] dark:border-[#2E2621] shadow-xs h-64 bg-stone-100">
            <iframe
              title="CafeFlow Interactive Map"
              src={settings.mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
