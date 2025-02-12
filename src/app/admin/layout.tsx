
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </header>
        {children}
      </div>
    </div>
  );
}
