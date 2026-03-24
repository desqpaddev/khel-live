import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SportEvent } from "@/lib/data";

interface EventCardProps {
  event: SportEvent;
}

const EventCard = ({ event }: EventCardProps) => {
  const spotsPercent = ((event.totalSpots - event.spotsLeft) / event.totalSpots) * 100;

  return (
    <Link to={`/events/${event.id}`} className="block">
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="group rounded-lg border border-border bg-card overflow-hidden shadow-card hover:shadow-glow transition-all h-full"
      >
        {/* Event image or accent bar */}
        {event.image ? (
          <div className="relative h-40 overflow-hidden">
            <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
          </div>
        ) : (
          <div className="h-1 w-full bg-primary" />
        )}

        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-3">
            <Badge className="text-xs bg-primary/10 text-primary border-primary/20 font-semibold uppercase tracking-wider">
              {event.sport}
            </Badge>
            {event.spotsLeft < 25 && (
              <Badge className="text-xs bg-destructive/10 text-destructive border-destructive/20">
                {event.spotsLeft} spots left
              </Badge>
            )}
          </div>

          <h3 className="text-lg font-bold font-display text-foreground mb-3 group-hover:text-primary transition-colors uppercase">
            {event.title}
          </h3>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar size={14} className="text-primary shrink-0" />
              <span>{event.date} · {event.time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin size={14} className="text-primary shrink-0" />
              <span>{event.venue}, {event.city}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users size={14} className="text-primary shrink-0" />
              <span>{event.ageGroups.join(", ")}</span>
            </div>
          </div>

          {/* Capacity bar */}
          <div className="mb-4">
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${spotsPercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {event.totalSpots - event.spotsLeft}/{event.totalSpots} registered
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-foreground">₹{event.price}</span>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-wider text-xs font-semibold">
              View Details
            </Button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default EventCard;
