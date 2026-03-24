import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-khelium-navy">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-bold text-gradient mb-3">KHELIUM</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            India's pioneering school sports movement. Gateway to Greatness.
          </p>
          <p className="text-xs text-muted-foreground mt-3">By TDK Sports</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Explore</h4>
          <div className="flex flex-col gap-2">
            <Link to="/events" className="text-sm text-muted-foreground hover:text-primary transition-colors">Browse Events</Link>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About KHELIUM</Link>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Sports</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span>Track & Field</span>
            <span>Swimming</span>
            <span>Cycling</span>
            <span>Race Walking</span>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Cities (2026)</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span>Kochi</span>
            <span>Trivandrum</span>
            <span>Kozhikode</span>
          </div>
        </div>
      </div>
      <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">© 2026 KHELIUM by TDK Sports & Santos King Tours. All rights reserved.</p>
        <p className="text-xs text-muted-foreground italic">Every Sport, Every Spark 🔥</p>
      </div>
    </div>
  </footer>
);

export default Footer;
