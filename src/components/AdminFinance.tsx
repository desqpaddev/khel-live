import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, IndianRupee, Clock, CalendarCheck, TrendingUp, Filter } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area,
} from "recharts";
import type { Tables } from "@/integrations/supabase/types";

type Event = Tables<"events">;
type Registration = Tables<"registrations"> & { events?: Event | null };

interface AdminFinanceProps {
  events: Event[];
  registrations: Registration[];
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(28, 100%, 52%)",
  "hsl(150, 50%, 45%)",
  "hsl(220, 50%, 50%)",
  "hsl(45, 90%, 50%)",
  "hsl(280, 60%, 55%)",
];

const AdminFinance = ({ events, registrations }: AdminFinanceProps) => {
  const [eventFilter, setEventFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [sportFilter, setSportFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const cities = useMemo(() => [...new Set(events.map(e => e.city))], [events]);
  const sports = useMemo(() => [...new Set(events.map(e => e.sport))], [events]);

  const filtered = useMemo(() => {
    return registrations.filter(r => {
      if (eventFilter !== "all" && r.event_id !== eventFilter) return false;
      if (cityFilter !== "all" && r.events?.city !== cityFilter) return false;
      if (sportFilter !== "all" && r.events?.sport !== sportFilter) return false;
      if (statusFilter !== "all" && r.payment_status !== statusFilter) return false;
      if (dateFrom && r.created_at < dateFrom) return false;
      if (dateTo && r.created_at > dateTo + "T23:59:59") return false;
      return true;
    });
  }, [registrations, eventFilter, cityFilter, sportFilter, statusFilter, dateFrom, dateTo]);

  const totalRevenue = useMemo(() => {
    return filtered
      .filter(r => r.payment_status === "paid")
      .reduce((sum, r) => {
        const ev = events.find(e => e.id === r.event_id);
        return sum + (ev?.price || 0);
      }, 0);
  }, [filtered, events]);

  const pendingAmount = useMemo(() => {
    return filtered
      .filter(r => r.payment_status === "pending")
      .reduce((sum, r) => {
        const ev = events.find(e => e.id === r.event_id);
        return sum + (ev?.price || 0);
      }, 0);
  }, [filtered, events]);

  const totalRegistered = filtered.length;
  const paidCount = filtered.filter(r => r.payment_status === "paid").length;
  const pendingCount = filtered.filter(r => r.payment_status === "pending").length;
  const failedCount = filtered.filter(r => r.payment_status === "failed").length;

  // Revenue by event
  const revenueByEvent = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; count: number }> = {};
    filtered.filter(r => r.payment_status === "paid").forEach(r => {
      const ev = events.find(e => e.id === r.event_id);
      if (!ev) return;
      if (!map[ev.id]) map[ev.id] = { name: ev.title.slice(0, 20), revenue: 0, count: 0 };
      map[ev.id].revenue += ev.price;
      map[ev.id].count += 1;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [filtered, events]);

  // Revenue by month
  const revenueByMonth = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.filter(r => r.payment_status === "paid").forEach(r => {
      const month = r.created_at.slice(0, 7); // YYYY-MM
      const ev = events.find(e => e.id === r.event_id);
      map[month] = (map[month] || 0) + (ev?.price || 0);
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({ month, revenue }));
  }, [filtered, events]);

  // Payment status distribution
  const paymentDistribution = useMemo(() => [
    { name: "Paid", value: paidCount, color: "hsl(150, 50%, 45%)" },
    { name: "Pending", value: pendingCount, color: "hsl(45, 90%, 50%)" },
    { name: "Failed", value: failedCount, color: "hsl(0, 85%, 50%)" },
  ].filter(d => d.value > 0), [paidCount, pendingCount, failedCount]);

  // Revenue by city
  const revenueByCity = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.filter(r => r.payment_status === "paid").forEach(r => {
      const city = r.events?.city || "Unknown";
      const ev = events.find(e => e.id === r.event_id);
      map[city] = (map[city] || 0) + (ev?.price || 0);
    });
    return Object.entries(map).map(([name, revenue]) => ({ name, revenue }));
  }, [filtered, events]);

  // Revenue by sport
  const revenueBySport = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.filter(r => r.payment_status === "paid").forEach(r => {
      const sport = r.events?.sport || "Unknown";
      const ev = events.find(e => e.id === r.event_id);
      map[sport] = (map[sport] || 0) + (ev?.price || 0);
    });
    return Object.entries(map).map(([name, revenue]) => ({ name, revenue }));
  }, [filtered, events]);

  const clearFilters = () => {
    setEventFilter("all");
    setCityFilter("all");
    setSportFilter("all");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const exportCSV = () => {
    const headers = ["Reg#", "Name", "Event", "Amount", "Payment Status", "Date"];
    const rows = filtered.map(r => {
      const ev = events.find(e => e.id === r.event_id);
      return [
        r.registration_number || "",
        `${r.first_name || r.child_name || ""} ${r.last_name || ""}`.trim(),
        ev?.title || "",
        ev?.price || 0,
        r.payment_status,
        r.created_at.slice(0, 10),
      ];
    });
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "finance_report.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-display text-foreground uppercase">Finance Overview</h2>
        <Button onClick={exportCSV} variant="outline" className="gap-2 uppercase text-xs font-semibold tracking-wider">
          <Download size={14} /> Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-green-600 mb-2"><IndianRupee size={20} /><span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Total Revenue</span></div>
            <p className="text-2xl font-bold font-display text-foreground">₹{totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{paidCount} paid registrations</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-yellow-600 mb-2"><Clock size={20} /><span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Pending Amount</span></div>
            <p className="text-2xl font-bold font-display text-foreground">₹{pendingAmount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{pendingCount} pending registrations</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-primary mb-2"><CalendarCheck size={20} /><span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Total Registered</span></div>
            <p className="text-2xl font-bold font-display text-foreground">{totalRegistered}</p>
            <p className="text-xs text-muted-foreground mt-1">{failedCount} failed payments</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-purple-600 mb-2"><TrendingUp size={20} /><span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Avg per Event</span></div>
            <p className="text-2xl font-bold font-display text-foreground">₹{revenueByEvent.length ? Math.round(totalRevenue / revenueByEvent.length).toLocaleString() : 0}</p>
            <p className="text-xs text-muted-foreground mt-1">{revenueByEvent.length} events with revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={16} className="text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Filters</span>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto text-xs">Clear All</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="text-xs"><SelectValue placeholder="Event" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {events.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="text-xs"><SelectValue placeholder="City" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger className="text-xs"><SelectValue placeholder="Sport" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                {sports.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="text-xs"><SelectValue placeholder="Payment Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} placeholder="From" className="text-xs" />
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} placeholder="To" className="text-xs" />
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, "Revenue"]} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Status Pie */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider">Payment Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {paymentDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Event */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider">Revenue by Event</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByEvent.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, "Revenue"]} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue by City & Sport */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider">Revenue by City</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByCity} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} width={80} />
                  <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, "Revenue"]} />
                  <Bar dataKey="revenue" fill="hsl(28, 100%, 52%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider">Transaction Details ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto max-h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Reg #</TableHead>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Event</TableHead>
                  <TableHead className="text-xs">Amount</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 100).map(r => {
                  const ev = events.find(e => e.id === r.event_id);
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="text-xs font-mono">{r.registration_number || "—"}</TableCell>
                      <TableCell className="text-xs">{`${r.first_name || r.child_name || ""} ${r.last_name || ""}`.trim() || "—"}</TableCell>
                      <TableCell className="text-xs">{ev?.title || "—"}</TableCell>
                      <TableCell className="text-xs font-semibold">₹{(ev?.price || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={r.payment_status === "paid" ? "default" : r.payment_status === "pending" ? "secondary" : "destructive"} className="text-[10px]">
                          {r.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.created_at.slice(0, 10)}</TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No transactions found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFinance;
