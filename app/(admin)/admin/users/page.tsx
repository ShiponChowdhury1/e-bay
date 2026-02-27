"use client";

import { useState, useEffect } from "react";
import {
  adminGetUsersAction,
  adminBanUserAction,
  adminUnbanUserAction,
  adminChangeRoleAction,
} from "@/actions/admin.actions";
import { UserType } from "@/types";

interface UsersResponse {
  success: boolean;
  data?: UserType[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const res = (await adminGetUsersAction()) as UsersResponse;
      if (res.success) {
        setUsers(res.data || []);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleBan = async (userId: string, reason: string) => {
    const res = await adminBanUserAction(userId, reason);
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => ((u._id || u.id) === userId ? { ...u, isBanned: true, banReason: reason } : u))
      );
    }
  };

  const handleUnban = async (userId: string) => {
    const res = await adminUnbanUserAction(userId);
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => ((u._id || u.id) === userId ? { ...u, isBanned: false, banReason: undefined } : u))
      );
    }
  };

  const handleRoleChange = async (userId: string, role: "admin" | "seller" | "buyer") => {
    const res = await adminChangeRoleAction(userId, role);
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => ((u._id || u.id) === userId ? { ...u, role } : u))
      );
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">{users.length} total users</p>
        </div>
        <div className="relative">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
          />
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="sm:hidden space-y-3">
        {filtered.map((u) => {
          const uid = u._id || u.id;
          return (
            <div key={uid} className={`bg-white rounded-lg border border-gray-100 p-4 ${u.isBanned ? "bg-red-50/30" : ""}`}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {u.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{u.name}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(uid!, e.target.value as "admin" | "seller" | "buyer")}
                      className="px-2 py-1 border border-gray-200 rounded-lg text-[10px] font-medium bg-white"
                    >
                      <option value="buyer">Buyer</option>
                      <option value="seller">Seller</option>
                      <option value="admin">Admin</option>
                    </select>
                    {u.isBanned ? (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-medium">
                        Banned
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-medium">
                        Active
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                    </span>
                  </div>
                  {u.isBanned && u.banReason && (
                    <p className="text-xs text-red-500 mt-1 truncate">{u.banReason}</p>
                  )}
                </div>
                {u.isBanned ? (
                  <button
                    onClick={() => handleUnban(uid!)}
                    className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium shrink-0"
                  >
                    Unban
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const reason = prompt("Ban reason:");
                      if (reason) handleBan(uid!, reason);
                    }}
                    className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium shrink-0"
                  >
                    Ban
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No users found</div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Joined</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u) => {
                const uid = u._id || u.id;
                return (
                  <tr key={uid} className={`hover:bg-gray-50/50 transition ${u.isBanned ? "bg-red-50/30" : ""}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{u.name}</p>
                          <p className="text-xs text-gray-500 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(uid!, e.target.value as "admin" | "seller" | "buyer")}
                        className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-medium bg-white"
                      >
                        <option value="buyer">Buyer</option>
                        <option value="seller">Seller</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      {u.isBanned ? (
                        <div>
                          <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            Banned
                          </span>
                          {u.banReason && (
                            <p className="text-xs text-red-500 mt-1 max-w-[150px] truncate">{u.banReason}</p>
                          )}
                        </div>
                      ) : (
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4">
                      {u.isBanned ? (
                        <button
                          onClick={() => handleUnban(uid!)}
                          className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition"
                        >
                          Unban
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const reason = prompt("Ban reason:");
                            if (reason) handleBan(uid!, reason);
                          }}
                          className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition"
                        >
                          Ban
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
