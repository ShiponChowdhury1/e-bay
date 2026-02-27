"use client";

export default function AdminShippingPage() {
  const zones = [
    { name: "Domestic Standard", method: "Standard Shipping", rate: "$5.99", estimated: "5-7 days", status: "active" },
    { name: "Domestic Express", method: "Express Shipping", rate: "$12.99", estimated: "2-3 days", status: "active" },
    { name: "International", method: "International Standard", rate: "$19.99", estimated: "10-15 days", status: "active" },
    { name: "Free Shipping", method: "Orders over $100", rate: "Free", estimated: "5-7 days", status: "active" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipping</h1>
          <p className="text-gray-500 text-sm mt-1">Configure shipping zones, rates, and carriers</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Shipping Zone
        </button>
      </div>

      {/* Shipping Zones */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Shipping Zones & Rates</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Zone</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Method</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Rate</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Estimated Delivery</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {zones.map((z) => (
                <tr key={z.name} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">{z.name}</td>
                  <td className="px-6 py-4 text-gray-600">{z.method}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{z.rate}</td>
                  <td className="px-6 py-4 text-gray-500">{z.estimated}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      {z.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition">Edit</button>
                      <button className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Carrier Settings */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Carrier Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["UPS", "FedEx", "USPS"].map((carrier) => (
            <div key={carrier} className="border border-gray-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{carrier}</p>
                <p className="text-xs text-gray-400 mt-0.5">Not configured</p>
              </div>
              <button className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition">
                Configure
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
