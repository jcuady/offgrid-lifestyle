import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import { Calendar, MapPin, Trophy } from "lucide-react";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";

export function EventSection() {
  const navigate = useNavigate();
  const events = useSiteContentStore((state) => state.events);
  const featuredEvent = events.find((entry) => entry.featured) ?? events[0];
  const countdownDateLabel = featuredEvent ? `${featuredEvent.date} 2026 09:00:00` : "15 Jun 2026 09:00:00";
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date(countdownDateLabel).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [countdownDateLabel]);

  if (!featuredEvent) return null;

  return (
    <section id="events" className="relative py-28 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/event_barako.png"
          alt="Figaro Barako Cup Pickleball Tournament"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-offgrid-green/85 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-offgrid-dark/60 via-transparent to-offgrid-dark/40" />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-offgrid-cream/20 bg-offgrid-cream/10 text-offgrid-cream/80 text-[10px] font-semibold tracking-[0.2em] uppercase mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-offgrid-lime mr-2 animate-pulse" />
            Featured Community Event
          </div>
          
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-display font-black text-offgrid-cream leading-[0.95] mb-6">
            {featuredEvent.title.split(" ").slice(0, 2).join(" ")} <br />
            <span className="italic font-normal text-offgrid-lime">
              {featuredEvent.title.split(" ").slice(2).join(" ")}
            </span>
          </h2>
          
          <p className="text-base md:text-lg text-offgrid-cream/70 mb-12 max-w-2xl mx-auto leading-relaxed">
            {featuredEvent.description}
          </p>

          {/* Countdown Timer */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-12">
            {[
              { label: "Days", value: timeLeft.days },
              { label: "Hours", value: timeLeft.hours },
              { label: "Mins", value: timeLeft.minutes },
              { label: "Secs", value: timeLeft.seconds },
            ].map((item, index) => (
              <div key={item.label} className="flex items-center gap-4 md:gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-offgrid-cream/10 backdrop-blur-md rounded-2xl border border-offgrid-cream/15 flex items-center justify-center mb-3 shadow-2xl">
                    <span className="text-3xl md:text-5xl font-display font-black text-offgrid-cream">
                      {item.value.toString().padStart(2, "0")}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-offgrid-cream/50">
                    {item.label}
                  </span>
                </div>
                {index < 3 && (
                  <span className="text-3xl font-display text-offgrid-cream/25 -mt-8 hidden sm:block">:</span>
                )}
              </div>
            ))}
          </div>

          {/* Event Details */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 text-offgrid-cream/80 mb-12 text-sm font-medium">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-offgrid-lime" />
              {featuredEvent.date}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-offgrid-lime" />
              {featuredEvent.location}
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-offgrid-lime" />
              {featuredEvent.category}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto" onClick={() => navigate("/events")}>
              Join the Movement →
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-offgrid-cream/60 text-offgrid-cream hover:bg-offgrid-cream hover:text-offgrid-green bg-offgrid-cream/10 backdrop-blur-sm"
              onClick={() => navigate("/events")}
            >
              Event Details
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
