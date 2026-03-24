import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "admin" | "user" | "moderator" | "event_manager" | "finance" | "volunteer" | "checkin_team";

type Permission = {
  resource: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
};

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  roles: AppRole[];
  permissions: Permission[];
  hasRole: (role: AppRole) => boolean;
  hasPermission: (resource: string, action: "read" | "create" | "update" | "delete") => boolean;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRolesAndPermissions = async (userId: string) => {
    // Fetch roles
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const userRoles = (roleData?.map((r: any) => r.role) || []) as AppRole[];
    setRoles(userRoles);
    setIsAdmin(userRoles.includes("admin"));

    // Fetch permissions for all user roles
    if (userRoles.length > 0) {
      const { data: permData } = await supabase
        .from("role_permissions")
        .select("resource, can_create, can_read, can_update, can_delete, role")
        .in("role", userRoles);

      if (permData) {
        // Merge permissions across roles (OR logic - if any role grants access, allow it)
        const permMap: Record<string, Permission> = {};
        permData.forEach((p: any) => {
          if (!permMap[p.resource]) {
            permMap[p.resource] = { resource: p.resource, can_create: false, can_read: false, can_update: false, can_delete: false };
          }
          permMap[p.resource].can_create = permMap[p.resource].can_create || p.can_create;
          permMap[p.resource].can_read = permMap[p.resource].can_read || p.can_read;
          permMap[p.resource].can_update = permMap[p.resource].can_update || p.can_update;
          permMap[p.resource].can_delete = permMap[p.resource].can_delete || p.can_delete;
        });
        setPermissions(Object.values(permMap));
      }
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => fetchRolesAndPermissions(session.user.id), 0);
      } else {
        setIsAdmin(false);
        setRoles([]);
        setPermissions([]);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRolesAndPermissions(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const hasRole = (role: AppRole) => roles.includes(role);

  const hasPermission = (resource: string, action: "read" | "create" | "update" | "delete") => {
    if (isAdmin) return true; // Admin has full access
    const perm = permissions.find((p) => p.resource === resource);
    if (!perm) return false;
    switch (action) {
      case "read": return perm.can_read;
      case "create": return perm.can_create;
      case "update": return perm.can_update;
      case "delete": return perm.can_delete;
      default: return false;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, isAdmin, roles, permissions, hasRole, hasPermission, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
