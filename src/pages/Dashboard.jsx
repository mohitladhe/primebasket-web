import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API = import.meta.env.VITE_API_URL;

function Dashboard() {
  const [data, setData] = useState({
    stats: { totalRevenue: 0, totalOrders: 0, activeProducts: 0, activeUsers: 0 },
    recentTransactions: [],
    monthlySales: [],
    topCategories: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔥 FETCH REAL DASHBOARD DATA FROM API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`${API}/api/dashboard/summary`);
      if (!res.ok) throw new Error("Failed to load dashboard data");
      
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center space-y-4">
          <p className="text-red-500 font-bold text-lg">{error}</p>
          <button onClick={fetchDashboardData} className="px-4 py-2 bg-green-500 text-white rounded shadow">Try Again</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Navbar />

      <main className="flex-grow p-6 md:p-10">
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-500 mt-1">Real-time overview of your store's performance.</p>
            </div>
            <button 
              onClick={fetchDashboardData}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-all font-medium flex items-center gap-2"
            >
              <svg className={`w-4 h-4 ${loading ? "animate-spin text-green-600" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              {loading ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>

          {/* STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Revenue Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-16 h-16 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path></svg>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-green-100 p-3 rounded-xl text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className="text-gray-500 font-semibold">Total Revenue</h3>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                {loading ? "..." : `₹${data.stats?.totalRevenue?.toLocaleString("en-IN")}`}
              </h2>
            </div>

            {/* Orders Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-green-100 p-3 rounded-xl text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                </div>
                <h3 className="text-gray-500 font-semibold">Total Orders</h3>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                {loading ? "..." : data.stats?.totalOrders?.toLocaleString("en-IN")}
              </h2>
            </div>

            {/* Products Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-green-100 p-3 rounded-xl text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                </div>
                <h3 className="text-gray-500 font-semibold">Active Products</h3>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                {loading ? "..." : data.stats?.activeProducts}
              </h2>
            </div>

            {/* Users Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-green-100 p-3 rounded-xl text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
                <h3 className="text-gray-500 font-semibold">Total Users</h3>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                {loading ? "..." : data.stats?.activeUsers?.toLocaleString("en-IN")}
              </h2>
            </div>
          </div>

          {/* CHARTS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sales Bar Chart (CSS Based) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-bold text-gray-900">Revenue Overview (Last 7 Months)</h3>
              </div>
              
              <div className="flex-grow flex items-end gap-2 md:gap-6 pt-4 h-64">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">Loading chart data...</div>
                ) : data.monthlySales.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No sales data available yet.</div>
                ) : (
                  data.monthlySales.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end">
                      {/* Tooltip (Hover) */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs py-1 px-2 rounded absolute -mt-10 pointer-events-none whitespace-nowrap z-10">
                        ₹{item.rawRevenue.toLocaleString("en-IN")}
                      </div>
                      {/* Bar */}
                      <div 
                        className="w-full bg-green-50 rounded-t-lg relative overflow-hidden transition-all duration-500 group-hover:bg-green-100 flex items-end"
                        style={{ height: '100%' }}
                      >
                        <div 
                          className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg transition-all duration-1000 ease-out"
                          style={{ height: `${item.value > 0 ? Math.max(item.value, 5) : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500 font-medium">{item.month}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Top Categories (Progress Bars) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Sales by Category</h3>
              {loading ? (
                <div className="flex items-center justify-center h-40 text-gray-400">Loading categories...</div>
              ) : data.topCategories.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No category data found.</div>
              ) : (
                <div className="space-y-6">
                  {data.topCategories.map((cat, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-gray-700">{cat.name}</span>
                        <span className="text-gray-500 font-medium">{cat.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div 
                          className="bg-green-500 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${cat.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RECENT TRANSACTIONS TABLE */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                    <th className="p-4 font-semibold whitespace-nowrap">Order ID</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Customer</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Date</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Amount</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                     <tr>
                       <td colSpan="5" className="p-8 text-center text-gray-400">Loading recent orders...</td>
                     </tr>
                  ) : data.recentTransactions.length === 0 ? (
                    <tr>
                       <td colSpan="5" className="p-8 text-center text-gray-400">No orders placed yet.</td>
                     </tr>
                  ) : (
                    data.recentTransactions.map((tx, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-900 whitespace-nowrap">{tx.id}</td>
                        <td className="p-4 text-gray-600 whitespace-nowrap">{tx.user}</td>
                        <td className="p-4 text-gray-500 text-sm whitespace-nowrap">{tx.date}</td>
                        <td className="p-4 font-bold text-gray-900 whitespace-nowrap">₹{tx.amount.toLocaleString("en-IN")}</td>
                        <td className="p-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${
                            tx.status.toLowerCase() === 'completed' || tx.status.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-700' : 
                            tx.status.toLowerCase() === 'placed' || tx.status.toLowerCase() === 'pending' ? 'bg-orange-100 text-orange-700' : 
                            'bg-red-100 text-red-700'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Dashboard;