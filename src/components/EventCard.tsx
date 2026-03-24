import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SportEvent } from "@/lib/data";

interface EventCardProps {
  event: SportEvent;
}

const EventCard = ({ event }: EventCardProps) => {
  const spotsPercent = ((event.totalSpots - event.spotsLeft) / event.totalSpots) * 100;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="group rounded-xl border border-border bg-card overflow-hidden shadow-card hover:shadow-glow transition-shadow"
    >
      {/* Color bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary to-accent" />
      
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
            {event.sport}
          </Badge>
          {event.spotsLeft < 25 && (
            <Badge className="text-xs bg-destructive/10 text-destructive border-destructive/20">
              {event.spotsLeft} spots left
            </Badge>
          )}
        </div>

        <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
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
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
              style={{ width: `${spotsPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {event.totalSpots - event.spotsLeft}/{event.totalSpots} registered
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-foreground">₹{event.price}</span>
          <Link to={`/events/${event.id}`}>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Book Now
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;
