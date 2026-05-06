import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, MapPin, Clock, Users, ArrowRight, X, Check, 
  Trophy, Music, Camera, ChevronRight, ExternalLink,
  Ticket, Star, Heart
} from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { cn } from "@/src/lib/utils";
import type { SiteEvent } from "@/src/data/events";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";

export function EventsPage() {
  const navigate = useNavigate();
  const events = useSiteContentStore((state) => state.events);
  const [selectedEvent, setSelectedEvent] = useState<SiteEvent | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    skillLevel: "beginner"
  });

  const upcomingEvents = events.filter(e => e.status === "upcoming");
  const pastEvents = events.filter(e => e.status === "past");
  const featuredEvent = events.find(e => e.featured);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrationComplete(true);
    setTimeout(() => {
      setIsRegisterOpen(false);
      setSelectedEvent(null);
      setRegistrationComplete(false);
      setFormData({ name: "", email: "", phone: "", skillLevel: "beginner" });
    }, 3000);
  };

  const getCategoryIcon = (category: SiteEvent["category"]) => {
    switch (category) {
      case "tournament": return Trophy;
      case "community": return Users;
      case "launch": return Star;
      case "workshop": return Camera;
      default: return Calendar;
    }
  };

  const getCategoryColor = (category: SiteEvent["category"]) => {
    switch (category) {
      case "tournament": return "text-offgrid-lime";
      case "community": return "text-blue-500";
      case "launch": return "text-offgrid-gold";
      case "workshop": return "text-purple-500";
      default: return "text-offgrid-green";
    }
  };

  const filteredEvents = filter === "all" 
    ? events 
    : events.filter(e => e.status === filter);

  return (
    <div className="min-h-screen bg-offgrid-cream">
      {/* Hero Section */}
      <section className="relative bg-offgrid-green text-offgrid-cream py-20 md:py-28 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-offgrid-lime rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-offgrid-gold rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-block text-[10px] font-semibold tracking-[0.2em] uppercase text-offgrid-lime mb-4">
              Community & Events
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black leading-[0.85] mb-6">
              More Than<br />
              <span className="italic font-normal text-offgrid-lime">A Brand.</span><br />
              A Movement.
            </h1>
            <p className="text-base md:text-lg text-offgrid-cream/70 leading-relaxed max-w-2xl">
              From pickleball tournaments to golf clinics, we bring the community together. 
              Every event is a chance to play, connect, and live Off Grid.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Event */}
      {featuredEvent && featuredEvent.status === "upcoming" && (
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-6 md:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-offgrid-green/50 mb-3 block">
                Featured Event
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-black text-offgrid-green">
                Don't Miss <span className="italic font-normal">This</span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-3xl overflow-hidden bg-offgrid-dark group cursor-pointer"
              onClick={() => setSelectedEvent(featuredEvent)}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Image */}
                <div className="relative aspect-[4/3] lg:aspect-auto">
                  <img
                    src={featuredEvent.image}
                    alt={featuredEvent.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-offgrid-dark/80 hidden lg:block" />
                  <div className="absolute inset-0 bg-gradient-to-t from-offgrid-dark/80 to-transparent lg:hidden" />
                  
                  {/* Badge */}
                  <div className="absolute top-6 left-6 flex items-center gap-2">
                    <span className="px-4 py-2 bg-offgrid-lime text-offgrid-dark text-xs font-bold tracking-[0.15em] uppercase rounded-full">
                      Featured
                    </span>
                    <span className="px-4 py-2 bg-offgrid-cream/90 backdrop-blur-sm text-offgrid-green text-xs font-bold tracking-[0.15em] uppercase rounded-full">
                      {featuredEvent.price}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    {React.createElement(getCategoryIcon(featuredEvent.category), {
                      className: cn("w-5 h-5", getCategoryColor(featuredEvent.category))
                    })}
                    <span className="text-xs font-semibold tracking-[0.2em] uppercase text-offgrid-cream/60">
                      {featuredEvent.category}
                    </span>
                  </div>

                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-offgrid-cream leading-tight mb-3">
                    {featuredEvent.title}
                  </h3>
                  <p className="text-lg text-offgrid-lime italic mb-6">
                    {featuredEvent.subtitle}
                  </p>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3 text-offgrid-cream/80">
                      <Calendar className="w-5 h-5 text-offgrid-lime flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-offgrid-cream">{featuredEvent.date}</p>
                        <p className="text-sm">{featuredEvent.time}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-offgrid-cream/80">
                      <MapPin className="w-5 h-5 text-offgrid-lime flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-offgrid-cream">{featuredEvent.location}</p>
                        <p className="text-sm">{featuredEvent.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Registration Progress */}
                  {featuredEvent.capacity && featuredEvent.registered && (
                    <div className="mb-8">
                      <div className="flex justify-between text-sm text-offgrid-cream/60 mb-2">
                        <span>Spots Filled</span>
                        <span>{featuredEvent.registered} / {featuredEvent.capacity}</span>
                      </div>
                      <div className="w-full h-3 bg-offgrid-cream/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(featuredEvent.registered / featuredEvent.capacity) * 100}%` }}
                          viewport={{ once: true }}
                          className="h-full bg-offgrid-lime rounded-full"
                        />
                      </div>
                      <p className="text-xs text-offgrid-cream/50 mt-2">
                        {featuredEvent.capacity - featuredEvent.registered} spots remaining
                      </p>
                    </div>
                  )}

                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto group"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEvent(featuredEvent);
                    }}
                  >
                    Register Now
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Upcoming Events Grid */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-offgrid-green/50 mb-3 block">
              What's Next
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-black text-offgrid-green">
              Upcoming <span className="italic font-normal">Events</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {upcomingEvents.filter(e => !e.featured).map((event, index) => {
              const Icon = getCategoryIcon(event.category);
              
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="relative rounded-2xl overflow-hidden bg-offgrid-cream mb-4 aspect-[4/3]">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-offgrid-dark/60 to-transparent" />
                    
                    {/* Top badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className={cn(
                        "px-3 py-1.5 bg-offgrid-cream/90 backdrop-blur-sm text-xs font-bold tracking-[0.15em] uppercase rounded-full"
                      )}>
                        {event.price}
                      </span>
                    </div>

                    {/* Date badge */}
                    <div className="absolute bottom-4 left-4 bg-offgrid-cream/95 backdrop-blur-sm rounded-xl p-3 text-center min-w-[70px]">
                      <p className="text-2xl font-display font-black text-offgrid-green leading-none">
                        {event.date.split(" ")[0]}
                      </p>
                      <p className="text-[10px] font-bold text-offgrid-green/60 uppercase mt-1">
                        {event.date.split(" ")[1]}
                      </p>
                    </div>
                  </div>

                  <div className="px-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={cn("w-4 h-4", getCategoryColor(event.category))} />
                      <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-offgrid-green/50">
                        {event.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-display font-bold text-offgrid-green mb-1 group-hover:text-offgrid-lime transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-sm text-offgrid-green/60 italic mb-3">
                      {event.subtitle}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-offgrid-green/50">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{event.time}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Past Events */}
      <section className="py-16 md:py-20 bg-offgrid-dark text-offgrid-cream">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-offgrid-lime mb-3 block">
              Highlights
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-black">
              Past <span className="italic font-normal text-offgrid-lime">Events</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {pastEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group rounded-2xl overflow-hidden bg-offgrid-cream/5 border border-offgrid-cream/10 hover:border-offgrid-lime/30 transition-colors"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  <div className="relative aspect-square sm:aspect-auto">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-offgrid-dark/20 group-hover:bg-transparent transition-colors" />
                  </div>
                  <div className="p-6 sm:p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                      {React.createElement(getCategoryIcon(event.category), {
                        className: cn("w-4 h-4", getCategoryColor(event.category))
                      })}
                      <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-offgrid-cream/50">
                        {event.category}
                      </span>
                      <span className="ml-auto text-[10px] font-semibold tracking-[0.2em] uppercase text-offgrid-lime">
                        {event.date}
                      </span>
                    </div>
                    <h3 className="text-xl font-display font-bold mb-2">
                      {event.title}
                    </h3>
                    <p className="text-sm text-offgrid-cream/60 italic mb-4">
                      {event.subtitle}
                    </p>
                    <p className="text-xs text-offgrid-cream/50 line-clamp-2 mb-4">
                      {event.description}
                    </p>
                    <button className="inline-flex items-center text-xs font-bold text-offgrid-lime hover:text-offgrid-cream transition-colors group/btn">
                      View Recap
                      <ExternalLink className="ml-1.5 w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-offgrid-lime text-offgrid-dark">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-6xl font-display font-black mb-6">
              Want to Host an<br />OffGrid Event?
            </h2>
            <p className="text-base md:text-lg text-offgrid-dark/70 mb-10 max-w-xl mx-auto">
              Partner with us to bring OffGrid to your city. We provide the gear, you bring the community.
            </p>
            <Button
              variant="outline"
              size="lg"
              className="border-offgrid-dark text-offgrid-dark hover:bg-offgrid-dark hover:text-offgrid-cream bg-transparent"
              onClick={() => navigate("/")}
            >
              Get in Touch
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && !isRegisterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-offgrid-dark/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-offgrid-cream rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-offgrid-cream/90 backdrop-blur-sm flex items-center justify-center hover:bg-offgrid-green hover:text-offgrid-cream transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="overflow-y-auto max-h-[90vh]">
                {/* Image */}
                <div className="relative aspect-[16/9]">
                  <img
                    src={selectedEvent.image}
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-offgrid-dark/60 to-transparent" />
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 md:p-10">
                  <div className="flex items-center gap-3 mb-4">
                    {React.createElement(getCategoryIcon(selectedEvent.category), {
                      className: cn("w-5 h-5", getCategoryColor(selectedEvent.category))
                    })}
                    <span className="text-xs font-semibold tracking-[0.2em] uppercase text-offgrid-green/50">
                      {selectedEvent.category}
                    </span>
                    <span className="ml-auto px-3 py-1 bg-offgrid-lime/10 text-offgrid-green text-xs font-bold rounded-full">
                      {selectedEvent.price}
                    </span>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-display font-black text-offgrid-green mb-2">
                    {selectedEvent.title}
                  </h2>
                  <p className="text-lg text-offgrid-lime italic mb-6">
                    {selectedEvent.subtitle}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-offgrid-lime flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-offgrid-green">{selectedEvent.date}</p>
                        <p className="text-sm text-offgrid-green/60">{selectedEvent.time}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-offgrid-lime flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-offgrid-green">{selectedEvent.location}</p>
                        <p className="text-sm text-offgrid-green/60">{selectedEvent.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-lg font-display font-bold text-offgrid-green mb-3">
                      About This Event
                    </h3>
                    <p className="text-sm text-offgrid-green/70 leading-relaxed">
                      {selectedEvent.description}
                    </p>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-lg font-display font-bold text-offgrid-green mb-4">
                      What to Expect
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedEvent.highlights.map((highlight, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-offgrid-lime flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-offgrid-green/70">{highlight}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedEvent.status === "upcoming" && (
                    <Button
                      variant="default"
                      size="lg"
                      className="w-full"
                      onClick={() => setIsRegisterOpen(true)}
                    >
                      Register Now
                      <Ticket className="ml-2 w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Registration Modal */}
      <AnimatePresence>
        {isRegisterOpen && selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-offgrid-dark/80 backdrop-blur-sm p-4"
            onClick={() => setIsRegisterOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-offgrid-cream rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-offgrid-green/5 flex items-center justify-center hover:bg-offgrid-green hover:text-offgrid-cream transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {!registrationComplete ? (
                <>
                  <h3 className="text-2xl font-display font-black text-offgrid-green mb-2">
                    Register for Event
                  </h3>
                  <p className="text-sm text-offgrid-green/60 mb-6">
                    {selectedEvent.title} — {selectedEvent.date}
                  </p>

                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold tracking-[0.15em] uppercase text-offgrid-green mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-offgrid-green/20 focus:border-offgrid-green focus:ring-2 focus:ring-offgrid-green/20 outline-none transition-all text-sm text-offgrid-green bg-white"
                        placeholder="Juan Dela Cruz"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold tracking-[0.15em] uppercase text-offgrid-green mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-offgrid-green/20 focus:border-offgrid-green focus:ring-2 focus:ring-offgrid-green/20 outline-none transition-all text-sm text-offgrid-green bg-white"
                        placeholder="juan@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold tracking-[0.15em] uppercase text-offgrid-green mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-offgrid-green/20 focus:border-offgrid-green focus:ring-2 focus:ring-offgrid-green/20 outline-none transition-all text-sm text-offgrid-green bg-white"
                        placeholder="+63 917 123 4567"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold tracking-[0.15em] uppercase text-offgrid-green mb-2">
                        Skill Level
                      </label>
                      <select
                        value={formData.skillLevel}
                        onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-offgrid-green/20 focus:border-offgrid-green focus:ring-2 focus:ring-offgrid-green/20 outline-none transition-all text-sm text-offgrid-green bg-white cursor-pointer"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>

                    <Button variant="default" size="lg" type="submit" className="w-full mt-6">
                      Complete Registration
                      <Check className="ml-2 w-5 h-5" />
                    </Button>
                  </form>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
                    className="w-20 h-20 mx-auto mb-6 rounded-full bg-offgrid-lime flex items-center justify-center"
                  >
                    <Heart className="w-10 h-10 text-offgrid-dark" />
                  </motion.div>
                  <h3 className="text-2xl font-display font-black text-offgrid-green mb-3">
                    You're In!
                  </h3>
                  <p className="text-sm text-offgrid-green/60">
                    Check your email for confirmation and event details.
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
