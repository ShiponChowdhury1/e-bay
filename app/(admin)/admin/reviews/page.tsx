"use client";

export default function AdminReviewsPage() {
  const sampleReviews = [
    { id: 1, user: "John Doe", product: "Wireless Headphones", rating: 5, comment: "Great quality and fast delivery!", date: "2026-02-20", status: "approved" },
    { id: 2, user: "Jane Smith", product: "Leather Wallet", rating: 4, comment: "Nice product but packaging could be better.", date: "2026-02-18", status: "approved" },
    { id: 3, user: "Mike Johnson", product: "Running Shoes", rating: 2, comment: "Not as described. Very disappointed.", date: "2026-02-15", status: "pending" },
    { id: 4, user: "Sarah Williams", product: "Smart Watch", rating: 1, comment: "Stopped working after 2 days. Terrible quality.", date: "2026-02-14", status: "flagged" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-500 text-sm mt-1">Moderate and manage product reviews</p>
        </div>
        <div className="flex gap-2">
          {["All", "Pending", "Approved", "Flagged"].map((f) => (
            <button key={f} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              f === "All" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {sampleReviews.map((r) => (
          <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {r.user.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{r.user}</p>
                    <p className="text-xs text-gray-500">on <span className="font-medium">{r.product}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < r.rating ? "text-yellow-400" : "text-gray-200"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-xs text-gray-400 ml-1">{r.date}</span>
                </div>
                <p className="text-sm text-gray-600">{r.comment}</p>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  r.status === "approved" ? "bg-green-100 text-green-700" :
                  r.status === "pending" ? "bg-amber-100 text-amber-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {r.status}
                </span>
                <div className="flex gap-1">
                  <button className="px-2.5 py-1 bg-green-50 text-green-600 rounded text-xs hover:bg-green-100 transition">Approve</button>
                  <button className="px-2.5 py-1 bg-red-50 text-red-600 rounded text-xs hover:bg-red-100 transition">Remove</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
