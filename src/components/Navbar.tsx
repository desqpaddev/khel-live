import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LayoutDashboard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/khelium-logo.png";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Events", path: "/events" },
  { label: "About", path: "/about" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Khelium" className="h-9 w-9" />
          <span className="text-xl font-bold tracking-tight text-gradient">KHELIUM</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link key={l.path} to={l.path} className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === l.path ? "text-primary" : "text-muted-foreground"}`}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {!loading && (
            <>
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin">
                      <Button variant="ghost" size="sm" className="text-primary gap-1"><ShieldCheck size={16} /> Admin</Button>
                    </Link>
                  )}
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1"><LayoutDashboard size={16} /> Dashboard</Button>
                  </Link>
                  <Button size="sm" variant="outline" onClick={handleSignOut} className="border-border text-foreground">Sign Out</Button>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Log In</Button>
                  </Link>
                  <Link to="/auth">
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow">Register Now</Button>
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl px-4 pb-4">
          {navLinks.map((l) => (
            <Link key={l.path} to={l.path} onClick={() => setOpen(false)} className={`block py-3 text-sm font-medium ${location.pathname === l.path ? "text-primary" : "text-muted-foreground"}`}>
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="block py-3 text-sm font-medium text-muted-foreground">Dashboard</Link>
              {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="block py-3 text-sm font-medium text-primary">Admin</Link>}
              <Button variant="ghost" size="sm" onClick={() => { handleSignOut(); setOpen(false); }} className="text-muted-foreground mt-2">Sign Out</Button>
            </>
          ) : (
            <div className="flex gap-3 pt-3">
              <Link to="/auth" onClick={() => setOpen(false)}>
                <Button variant="ghost" size="sm" className="text-muted-foreground">Log In</Button>
              </Link>
              <Link to="/auth" onClick={() => setOpen(false)}>
                <Button size="sm" className="bg-primary text-primary-foreground">Register Now</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
