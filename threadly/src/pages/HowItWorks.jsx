import { Link } from "react-router-dom";
import {
  FiUpload, FiSearch, FiShoppingBag,
  FiRefreshCw, FiShield, FiStar,
  FiArrowRight, FiCheck
} from "react-icons/fi";
import { useState } from "react";

const steps = [
  {
    number: "01",
    title: "Create your account",
    desc: "Sign up for free as a buyer, seller or both. No listing fees, no hidden charges.",
    icon: <FiShoppingBag size={28} />,
    color: "bg-terracotta-pale text-terracotta",
  },
  {
    number: "02",
    title: "List your clothes",
    desc: "Upload photos and let our AI assistant auto-fill the title, description, size, condition and suggest a fair price. Done in under 2 minutes.",
    icon: <FiUpload size={28} />,
    color: "bg-blue-50 text-blue-600",
  },
  {
    number: "03",
    title: "Browse & discover",
    desc: "Explore thousands of pre-loved pieces. Filter by size, brand, condition, category and price range to find exactly what you're looking for.",
    icon: <FiSearch size={28} />,
    color: "bg-green-50 text-green-600",
  },
  {
    number: "04",
    title: "Buy, sell or swap",
    desc: "Purchase securely via Stripe, or propose a direct item-for-item swap with any seller — no money needed. Both parties must agree before anything moves.",
    icon: <FiRefreshCw size={28} />,
    color: "bg-purple-50 text-purple-600",
  },
  {
    number: "05",
    title: "Ship & confirm",
    desc: "Seller ships the item. Buyer confirms delivery on the platform. Payment is held in escrow and only released to the seller once delivery is confirmed.",
    icon: <FiShield size={28} />,
    color: "bg-yellow-50 text-yellow-600",
  },
  {
    number: "06",
    title: "Review & build trust",
    desc: "After every completed order, buyers can leave a review. Sellers build a trust score that helps future buyers shop with confidence.",
    icon: <FiStar size={28} />,
    color: "bg-pink-50 text-pink-600",
  },
];

const faqs = [
  {
    q: "Is Threadly free to use?",
    a: "Yes! Creating an account and browsing is completely free. We charge a small platform fee only on completed sales to keep the platform running.",
  },
  {
    q: "How does the swap system work?",
    a: "Find an item you like, click 'Propose a Swap', and select one of your own active listings to offer in exchange. The other person can accept, reject, or counter with a different item. No money changes hands.",
  },
  {
    q: "Is my payment secure?",
    a: "Yes. All payments are processed by Stripe, one of the world's most trusted payment platforms. Your payment is held in escrow and only released to the seller after you confirm delivery.",
  },
  {
    q: "What if the item doesn't match the description?",
    a: "You have 3 days after delivery to raise a dispute. If the item is significantly not as described, you can request a return. Our team reviews all disputes fairly.",
  },
  {
    q: "How does AI listing work?",
    a: "When you upload a photo of your clothing item, our AI analyzes it and automatically fills in the title, description, brand, category, size, condition and suggests a fair resale price — saving you time.",
  },
  {
    q: "Can I be both a buyer and a seller?",
    a: "Absolutely! You can browse and buy listings as well as create your own listings to sell or swap. Most of our users do both.",
  },
];

export default function HowItWorks() {
  return (
    <div className="bg-cream min-h-screen">

      {/* ── HERO ── */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-terracotta-pale text-terracotta-dark text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-8">
          Simple & Transparent
        </div>
        <h1 className="font-serif text-5xl md:text-6xl text-stone-900 leading-tight mb-6">
          How Threadly works
        </h1>
        <p className="text-stone-500 text-lg font-light leading-relaxed max-w-2xl mx-auto">
          Buying, selling and swapping pre-loved fashion has never been easier.
          Here's everything you need to know.
        </p>
      </section>

      {/* ── STEPS ── */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 gap-6">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${step.color}`}>
                  {step.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-serif text-3xl text-stone-200 leading-none">
                      {step.number}
                    </span>
                    <h3 className="font-semibold text-stone-900 text-lg">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRUST SECTION ── */}
      <section className="bg-stone-900 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl text-white mb-4">
              Built on trust & transparency
            </h2>
            <p className="text-stone-400 font-light max-w-xl mx-auto">
              Every feature of Threadly is designed to make sure both buyers and sellers feel safe and confident.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "🔒",
                title: "Escrow Payments",
                points: [
                  "Payment held securely by Stripe",
                  "Released only after delivery confirmed",
                  "Dispute resolution available",
                ],
              },
              {
                icon: "🤖",
                title: "AI-Powered Listings",
                points: [
                  "Auto-fill from photo upload",
                  "Fair price suggestions",
                  "Condition verification hints",
                ],
              },
              {
                icon: "⭐",
                title: "Verified Reviews",
                points: [
                  "Reviews only from real buyers",
                  "Seller trust score system",
                  "Transparent rating history",
                ],
              },
            ].map((f) => (
              <div key={f.title} className="bg-stone-800 rounded-2xl p-6">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-white text-lg mb-4">{f.title}</h3>
                <ul className="space-y-2">
                  {f.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-stone-400">
                      <FiCheck size={14} className="text-terracotta mt-0.5 flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-3xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl text-stone-900 mb-3">
            Frequently asked questions
          </h2>
          <p className="text-stone-500 text-sm">
            Everything you need to know about Threadly.
          </p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="bg-terracotta rounded-3xl px-12 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="font-serif text-4xl text-white mb-3">
              Ready to get started?
            </h2>
            <p className="text-terracotta-pale font-light text-lg">
              Join thousands giving clothes a second life.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              to="/register"
              className="bg-white text-terracotta font-semibold px-8 py-4 rounded-full hover:bg-stone-50 transition-all flex items-center gap-2 justify-center"
            >
              Create Account <FiArrowRight size={16} />
            </Link>
            <Link
              to="/explore"
              className="bg-terracotta-dark text-white font-semibold px-8 py-4 rounded-full hover:bg-terracotta-dark/80 transition-all flex items-center gap-2 justify-center"
            >
              Browse Listings
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

// ── FAQ Accordion Item ──
function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left"
      >
        <span className="font-medium text-stone-900 pr-4">{question}</span>
        <span className={`text-terracotta transition-transform flex-shrink-0 ${open ? "rotate-45" : ""}`}>
          ✕
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5 text-sm text-stone-500 leading-relaxed border-t border-stone-100 pt-4">
          {answer}
        </div>
      )}
    </div>
  );
}