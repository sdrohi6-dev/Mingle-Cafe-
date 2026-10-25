import React, { useState } from 'react';
import {
  Star,
  ShieldCheck,
  Plus,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Review, MenuItem } from '../types';
import { dataService } from '../services/dataService';
import { useSettings } from '../context/SettingsContext';

export const ReviewsPage: React.FC = () => {
  const { formatPrice } = useSettings();
  const [reviews, setReviews] = useState<Review[]>(() =>
    dataService.getReviews().filter((r) => r.status === 'published')
  );
  const menuItems = dataService.getMenuItems();

  const [showModal, setShowModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [comment, setComment] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Compute rating stats
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : '5.0';

  const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    counts[r.rating] = (counts[r.rating] || 0) + 1;
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !comment.trim()) return;

    const dish = menuItems.find((m) => m.id === selectedItemId);

    const newRev = dataService.addReview({
      customerName: customerName.trim(),
      rating,
      comment: comment.trim(),
      menuItemId: selectedItemId || undefined,
      dishName: dish ? dish.title : undefined,
      imageUrl: imageUrl.trim() || undefined,
      verifiedOrder: true,
    });

    setReviews([newRev, ...reviews]);
    setSubmittedSuccess(true);
    setTimeout(() => {
      setShowModal(false);
      setSubmittedSuccess(false);
      setCustomerName('');
      setComment('');
      setImageUrl('');
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#D9532F]">
            Guest Voices &amp; Ratings
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white mt-1">
            Bistro Diners &amp; Reviews
          </h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-3 rounded-xl bg-[#D9532F] text-white hover:bg-[#C24522] transition-colors text-xs font-semibold flex items-center gap-2 shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Aggregate Rating Scoreboard (60-30-10 discipline) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E1915] border border-[#EDE8E1] dark:border-[#2E2621] shadow-xs grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Score Left */}
        <div className="md:col-span-4 text-center md:text-left md:border-r border-stone-200 dark:border-stone-800 pr-0 md:pr-8 space-y-2">
          <div className="font-serif text-5xl sm:text-6xl font-bold text-stone-900 dark:text-white font-mono">
            {avgRating}
          </div>
          <div className="flex items-center justify-center md:justify-start gap-1 text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400" />
            ))}
          </div>
          <p className="text-xs text-stone-500">
            Based on {totalReviews} verified guest reviews
          </p>
        </div>

        {/* Distribution Bars Right */}
        <div className="md:col-span-8 space-y-2 text-xs">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = counts[stars] || 0;
            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            return (
              <div key={stars} className="flex items-center gap-3">
                <span className="w-12 text-stone-500 font-mono text-[11px] flex items-center gap-1">
                  {stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </span>
                <div className="flex-1 h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-right text-stone-400 font-mono text-[11px]">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1E1915] border border-[#EDE8E1] dark:border-[#2E2621] shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-sm text-stone-900 dark:text-white">
                    {rev.customerName}
                  </span>
                  {rev.verifiedOrder && (
                    <span className="text-[11px] text-[#5B8266] font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Diner
                    </span>
                  )}
                </div>
                {rev.dishName && (
                  <p className="text-xs font-semibold text-[#D9532F]">
                    Dish: {rev.dishName}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-0.5 text-amber-400">
                {Array.from({ length: rev.rating }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              "{rev.comment}"
            </p>

            <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-100 dark:border-stone-800">
              <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
            </div>

            {/* Manager Reply */}
            {rev.reply && (
              <div className="mt-2 p-3 bg-[#FAF7F2] dark:bg-[#25201C] rounded-xl border border-[#EDE8E1] dark:border-[#2E2621] space-y-1 text-xs">
                <span className="font-semibold text-stone-800 dark:text-stone-200">
                  {rev.reply.author}:
                </span>
                <p className="text-stone-600 dark:text-stone-400">{rev.reply.comment}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Review Submission Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setShowModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-md bg-[#FFFDF9] dark:bg-[#1A1613] text-[#2E1C12] dark:text-[#F3EDE6] rounded-2xl p-6 shadow-2xl border border-[#EDE8E1] dark:border-[#2E2621] space-y-4 z-10">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold">Write a Guest Review</h3>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {submittedSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
                <p className="font-serif font-bold text-base">Thank you for your feedback!</p>
                <p className="text-xs text-stone-500">Your review is published on our live guestbook.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-3 text-xs">
                <div>
                  <label className="text-stone-500 block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Neha Deshmukh"
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18]"
                  />
                </div>

                <div>
                  <label className="text-stone-500 block mb-1">Dish Enjoyed</label>
                  <select
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18]"
                  >
                    <option value="">General Bistro Experience</option>
                    {menuItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title} ({formatPrice(item.price)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-stone-500 block mb-1">Star Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 text-amber-400"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            rating >= star ? 'fill-amber-400' : 'text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-stone-500 block mb-1">Your Review</label>
                  <textarea
                    rows={3}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell other diners about the food, flavors, presentation and coffee aroma..."
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#D9532F] text-white hover:bg-[#C24522] transition-colors font-semibold text-xs mt-2"
                >
                  Publish Review
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
