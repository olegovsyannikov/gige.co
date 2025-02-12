import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { currentUser } from "@clerk/nextjs/server";

export default async function AdminDashboardPage() {
  const user = await currentUser();

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName || "Admin"}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Jobs</CardTitle>
              <CardDescription>All jobs in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">--</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Agents</CardTitle>
              <CardDescription>Currently available agents</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">--</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Jobs</CardTitle>
              <CardDescription>Jobs awaiting processing</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">--</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system events</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No recent activity</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current system metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">API Status</span>
                  <span className="text-green-600 font-medium">Operational</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Database</span>
                  <span className="text-green-600 font-medium">Connected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Job Queue</span>
                  <span className="text-green-600 font-medium">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
