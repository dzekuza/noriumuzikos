import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search, Users, CalendarDays, DollarSign } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AdminUser = {
  id: number;
  username: string;
  email: string | null;
  isSubscribed: boolean;
  subscriptionStatus: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
};

type AdminEvent = {
  id: number;
  name: string;
  venue: string;
  djName: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  requestPrice: number;
  userId: number;
  username: string;
};

type PaymentStats = {
  totalPayments: number;
  totalAmount: number;
  activeSubscriptions: number;
  subscriptionRevenue: number;
  songRequestRevenue: number;
};

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    // Fetch admin data when component mounts
    const fetchAdminData = async () => {
      setIsDataLoading(true);

      try {
        const usersResponse = await apiRequest("GET", "/api/admin/users");
        const eventsResponse = await apiRequest("GET", "/api/admin/events");
        const statsResponse = await apiRequest("GET", "/api/admin/payment-stats");

        if (usersResponse.ok && eventsResponse.ok && statsResponse.ok) {
          const usersData = await usersResponse.json();
          const eventsData = await eventsResponse.json();
          const statsData = await statsResponse.json();

          setUsers(usersData);
          setEvents(eventsData);
          setPaymentStats(statsData);
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setIsDataLoading(false);
      }
    };

    if (user && user.id === 1) { // Assuming user ID 1 is the superadmin
      fetchAdminData();
    }
  }, [user]);

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filter events based on search term
  const filteredEvents = events.filter(event => 
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.djName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if the user is the superadmin
  if (!isLoading && (!user || user.id !== 1)) {
    return <Redirect to="/dashboard" />;
  }

  if (isLoading || isDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Super Admin Dashboard</h1>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users or events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {paymentStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{(paymentStats.totalAmount / 100).toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paymentStats.activeSubscriptions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Subscription Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{(paymentStats.subscriptionRevenue / 100).toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Song Requests Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{(paymentStats.songRequestRevenue / 100).toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="users" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center">
            <CalendarDays className="mr-2 h-4 w-4" />
            Events
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Registered Users</CardTitle>
              <CardDescription>Total Users: {users.length}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>List of all registered users</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stripe Customer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email || "—"}</TableCell>
                        <TableCell>
                          {user.isSubscribed ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                              Inactive
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{user.subscriptionStatus || "—"}</TableCell>
                        <TableCell>{user.stripeCustomerId ? "Yes" : "No"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>All Events</CardTitle>
              <CardDescription>Total Events: {events.length}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>List of all events</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price (€)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>{event.id}</TableCell>
                        <TableCell>{event.name}</TableCell>
                        <TableCell>{event.venue}</TableCell>
                        <TableCell>{event.username}</TableCell>
                        <TableCell>{new Date(event.startTime).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {event.isActive ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                              Inactive
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{(event.requestPrice / 100).toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        No events found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}