import { AgentsList } from "@/components/agents-list";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDashboardData, type DashboardData } from "@/services/dashboard";
import { currentUser } from "@clerk/nextjs/server";

export const dynamic = 'force-dynamic';

const emptyStats: DashboardData = {
  userStats: {
    total: 0,
    completed: 0,
    pending: 0,
  },
  globalStats: {
    total: 0,
    completed: 0,
    pending: 0,
  },
  agentStats: {
    total: 0,
    active: 0,
  },
  agents: [],
};

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) {
    throw new Error('User not found');
  }

  let dashboardData = emptyStats;
  let error = null;

  try {
    dashboardData = await getDashboardData();
  } catch (e) {
    console.error('Error fetching dashboard data:', e);
    error = e instanceof Error ? e.message : 'Failed to load dashboard data';
  }

  const { userStats, globalStats, agentStats, agents } = dashboardData;

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName || "User"}
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Your Jobs</CardTitle>
              <CardDescription>Your job statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Jobs</span>
                  <span className="font-medium">{userStats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="text-green-600 font-medium">
                    {userStats.completed}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="text-yellow-600 font-medium">
                    {userStats.pending}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Global Jobs</CardTitle>
              <CardDescription>Platform-wide statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Jobs</span>
                  <span className="font-medium">{globalStats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="text-green-600 font-medium">
                    {globalStats.completed}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="text-yellow-600 font-medium">
                    {globalStats.pending}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agents</CardTitle>
              <CardDescription>Available AI agents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Agents</span>
                  <span className="font-medium">{agentStats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active</span>
                  <span className="text-green-600 font-medium">
                    {agentStats.active}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Our top performing agents</CardTitle>
              <CardDescription>Most successful AI agents by completed jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <AgentsList agents={agents} showAllLink />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
