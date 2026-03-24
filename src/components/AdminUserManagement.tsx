import { useState, useEffect } from "react";
import { Users, Plus, Shield, Search, ChevronDown, ChevronUp, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

const ALL_ROLES = ["admin", "user", "moderator", "event_manager", "finance", "volunteer", "checkin_team"] as const;
type AppRole = typeof ALL_ROLES[number];

const ROLE_LABELS: Record<string, string> = {
  admin: "🔑 Admin",
  user: "👤 User",
  moderator: "🛡️ Moderator",
  event_manager: "📋 Event Manager",
  finance: "💰 Finance",
  volunteer: "🤝 Volunteer",
  checkin_team: "📱 Check-in Team",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-destructive/10 text-destructive border-destructive/20",
  user: "bg-muted text-muted-foreground border-border",
  moderator: "bg-primary/10 text-primary border-primary/20",
  event_manager: "bg-accent text-accent-foreground border-accent",
  finance: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  volunteer: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  checkin_team: "bg-chart-3/10 text-chart-3 border-chart-3/20",
};

const RESOURCES = ["events", "registrations", "results", "tickets", "discounts", "users", "chat", "scanner", "settings", "analytics", "leaderboard"];
const ACTIONS = ["can_create", "can_read", "can_update", "can_delete"] as const;

type RolePermission = {
  id: string;
  role: string;
  resource: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
};

type UserWithRoles = Tables<"profiles"> & {
  roles: string[];
};

const AdminUserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [userRoles, setUserRoles] = useState<{ id: string; user_id: string; role: string }[]>([]);
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<string>("user");
  const [addingUser, setAddingUser] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [permEditRole, setPermEditRole] = useState<string>("moderator");
  const [editedPerms, setEditedPerms] = useState<RolePermission[]>([]);
  const [savingPerms, setSavingPerms] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [profilesRes, rolesRes, permsRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
      supabase.from("role_permissions").select("*"),
    ]);

    const roles = (rolesRes.data || []) as { id: string; user_id: string; role: string }[];
    setUserRoles(roles);

    const usersWithRoles: UserWithRoles[] = (profilesRes.data || []).map((p) => ({
      ...p,
      roles: roles.filter((r) => r.user_id === p.user_id).map((r) => r.role),
    }));
    setUsers(usersWithRoles);
    setPermissions((permsRes.data || []) as RolePermission[]);
    setLoading(false);
  };

  useEffect(() => {
    const rolePerms = permissions.filter((p) => p.role === permEditRole);
    const allResourcePerms = RESOURCES.map((resource) => {
      const existing = rolePerms.find((p) => p.resource === resource);
      return existing || { id: "", role: permEditRole, resource, can_create: false, can_read: false, can_update: false, can_delete: false };
    });
    setEditedPerms(allResourcePerms as RolePermission[]);
  }, [permEditRole, permissions]);

  const addUser = async () => {
    if (!newUserEmail || !newUserName || !newUserPassword) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    setAddingUser(true);

    // Sign up the user via edge function to avoid logging out admin
    const { data, error } = await supabase.functions.invoke("create-user", {
      body: { email: newUserEmail, password: newUserPassword, full_name: newUserName, role: newUserRole },
    });

    if (error || data?.error) {
      toast({ title: "Error creating user", description: error?.message || data?.error, variant: "destructive" });
      setAddingUser(false);
      return;
    }

    toast({ title: `User ${newUserName} created with role ${ROLE_LABELS[newUserRole]} ✅` });
    setAddUserOpen(false);
    setNewUserEmail("");
    setNewUserName("");
    setNewUserPassword("");
    setNewUserRole("user");
    setAddingUser(false);
    fetchData();
  };

  const toggleUserRole = async (userId: string, role: string, currentlyHas: boolean) => {
    if (currentlyHas) {
      const roleEntry = userRoles.find((r) => r.user_id === userId && r.role === role);
      if (roleEntry) {
        const { error } = await supabase.from("user_roles").delete().eq("id", roleEntry.id);
        if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      }
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: role as any });
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    }
    toast({ title: currentlyHas ? `Role ${role} removed` : `Role ${role} assigned ✅` });
    fetchData();
  };

  const togglePerm = (resource: string, action: typeof ACTIONS[number]) => {
    setEditedPerms((prev) =>
      prev.map((p) => (p.resource === resource ? { ...p, [action]: !p[action] } : p))
    );
  };

  const savePermissions = async () => {
    setSavingPerms(true);
    for (const perm of editedPerms) {
      const payload = {
        role: permEditRole as any,
        resource: perm.resource,
        can_create: perm.can_create,
        can_read: perm.can_read,
        can_update: perm.can_update,
        can_delete: perm.can_delete,
      };
      if (perm.id) {
        await supabase.from("role_permissions").update(payload).eq("id", perm.id);
      } else {
        await supabase.from("role_permissions").insert(payload);
      }
    }
    toast({ title: `Permissions for ${ROLE_LABELS[permEditRole]} saved ✅` });
    setSavingPerms(false);
    fetchData();
  };

  const filtered = users.filter(
    (u) =>
      !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.city?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search)
  );

  if (loading) return <p className="text-center text-muted-foreground py-10">Loading users...</p>;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="users">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground uppercase text-xs font-semibold tracking-wider">
            <Users size={14} className="mr-1" /> Users & Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground uppercase text-xs font-semibold tracking-wider">
            <Shield size={14} className="mr-1" /> Permissions
          </TabsTrigger>
        </TabsList>

        {/* USERS & ROLES TAB */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search size={16} className="text-muted-foreground" />
              <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
            </div>
            <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground gap-2 uppercase font-semibold tracking-wider">
                  <Plus size={16} /> Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display uppercase">Add New User</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider">Full Name</Label>
                    <Input value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="John Doe" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider">Email</Label>
                    <Input value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} type="email" placeholder="john@example.com" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider">Password</Label>
                    <Input value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} type="password" placeholder="Min 6 characters" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider">Role</Label>
                    <Select value={newUserRole} onValueChange={setNewUserRole}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ALL_ROLES.map((r) => (
                          <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={addUser} disabled={addingUser} className="w-full bg-primary text-primary-foreground uppercase font-bold tracking-wider">
                    {addingUser ? "Creating..." : "Create User"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="text-sm text-muted-foreground">{filtered.length} users found</div>

          <div className="space-y-2">
            {filtered.map((u) => (
              <div key={u.id} className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
                <div
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-secondary/50 transition-colors"
                  onClick={() => setExpandedUser(expandedUser === u.user_id ? null : u.user_id)}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold font-display text-foreground">{u.full_name || "—"}</h3>
                    <p className="text-sm text-muted-foreground truncate">{u.phone || "No phone"} · {u.city || "No city"}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {u.roles.length === 0 && <Badge variant="outline" className="text-xs">No role</Badge>}
                    {u.roles.map((r) => (
                      <Badge key={r} className={`text-xs border ${ROLE_COLORS[r] || ROLE_COLORS.user}`}>
                        {ROLE_LABELS[r] || r}
                      </Badge>
                    ))}
                    {expandedUser === u.user_id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {expandedUser === u.user_id && (
                  <div className="border-t border-border p-4 bg-secondary/30">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Manage Roles</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {ALL_ROLES.filter((r) => r !== "user").map((role) => {
                        const has = u.roles.includes(role);
                        return (
                          <div key={role} className="flex items-center gap-2">
                            <Switch checked={has} onCheckedChange={() => toggleUserRole(u.user_id, role, has)} />
                            <span className="text-sm font-medium">{ROLE_LABELS[role]}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">
                      Joined: {new Date(u.created_at).toLocaleDateString()} · School: {u.school || "—"} · Board: {u.board || "—"}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        {/* PERMISSIONS TAB */}
        <TabsContent value="permissions" className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider">Select Role</Label>
              <Select value={permEditRole} onValueChange={setPermEditRole}>
                <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ALL_ROLES.filter((r) => r !== "user").map((r) => (
                    <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={savePermissions} disabled={savingPerms} className="bg-primary text-primary-foreground gap-2 uppercase font-semibold tracking-wider">
              <Save size={16} /> {savingPerms ? "Saving..." : "Save Permissions"}
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-card">
            <table className="w-full text-sm">
              <thead className="bg-secondary">
                <tr>
                  <th className="text-left p-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">Resource</th>
                  <th className="text-center p-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">Create</th>
                  <th className="text-center p-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">Read</th>
                  <th className="text-center p-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">Update</th>
                  <th className="text-center p-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">Delete</th>
                </tr>
              </thead>
              <tbody>
                {editedPerms.map((perm) => (
                  <tr key={perm.resource} className="border-t border-border">
                    <td className="p-3 font-medium text-foreground capitalize">{perm.resource.replace("_", " ")}</td>
                    {ACTIONS.map((action) => (
                      <td key={action} className="p-3 text-center">
                        <Switch
                          checked={perm[action]}
                          onCheckedChange={() => togglePerm(perm.resource, action)}
                          disabled={permEditRole === "admin"}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {permEditRole === "admin" && (
            <p className="text-xs text-muted-foreground text-center">Admin permissions cannot be modified — full access is always granted.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminUserManagement;
