export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          Posts
        </div>

        <div className="bg-white p-4 rounded shadow">
          Users
        </div>

        <div className="bg-white p-4 rounded shadow">
          Comments
        </div>
      </div>
    </div>
  );
}