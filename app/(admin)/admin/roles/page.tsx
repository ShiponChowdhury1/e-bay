"use client";

import { useState } from "react";

const defaultRoles = [
  {
    name: "Admin",
    description: "Full access to all features",
    users: 1,
    color: "bg-red-100 text-red-700",
    permissions: [
      "manage_users", "manage_products", "manage_orders", "manage_categories",
      "manage_payments", "manage_coupons", "manage_shipping", "manage_reviews",
      "manage_reports", "manage_cms", "manage_settings", "manage_roles",
    ],
  },
  {
    name: "Seller",
    description: "Can list products and manage their own orders",
    users: 12,
    color: "bg-green-100 text-green-700",
    permissions: [
      "create_products", "edit_own_products", "view_own_orders", "manage_own_shipping",
    ],
  },
  {
    name: "Buyer",
    description: "Can browse, buy products, and place bids",
    users: 245,
    color: "bg-blue-100 text-blue-700",
    permissions: [
      "browse_products", "place_orders", "place_bids", "write_reviews",
    ],
  },
];

const allPermissions = [
  { group: "Users", perms: ["manage_users", "view_users", "ban_users"] },
  { group: "Products", perms: ["manage_products", "create_products", "edit_own_products", "delete_products"] },
  { group: "Orders", perms: ["manage_orders", "view_own_orders", "update_order_status"] },
  { group: "Categories", perms: ["manage_categories"] },
  { group: "Payments", perms: ["manage_payments", "process_refunds"] },
  { group: "Content", perms: ["manage_cms", "manage_reviews"] },
  { group: "System", perms: ["manage_settings", "manage_roles", "manage_reports"] },
  { group: "Shopping", perms: ["browse_products", "place_orders", "place_bids", "write_reviews"] },
  { group: "Shipping", perms: ["manage_shipping", "manage_own_shipping"] },
  { group: "Coupons", perms: ["manage_coupons"] },
];

export default function AdminRolesPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-gray-500 text-sm mt-1">Define roles and control access levels</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Role
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="space-y-3">
          {defaultRoles.map((role) => (
            <button
              key={role.name}
              onClick={() => setSelectedRole(selectedRole === role.name ? null : role.name)}
              className={`w-full text-left bg-white rounded-xl border p-5 transition-all ${
                selectedRole === role.name
                  ? "border-blue-300 ring-2 ring-blue-100"
                  : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${role.color}`}>
                  {role.name}
                </span>
                <span className="text-xs text-gray-400">{role.users} users</span>
              </div>
              <p className="text-sm text-gray-600">{role.description}</p>
              <p className="text-xs text-gray-400 mt-2">{role.permissions.length} permissions</p>
            </button>
          ))}
        </div>

        {/* Permissions Matrix */}
        <div className="lg:col-span-2">
          {selectedRole ? (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-semibold text-gray-900">
                    Permissions for{" "}
                    <span className="text-blue-600">{selectedRole}</span>
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">Toggle permissions for this role</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                  Save
                </button>
              </div>

              <div className="space-y-6">
                {allPermissions.map((group) => (
                  <div key={group.group}>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{group.group}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {group.perms.map((perm) => {
                        const role = defaultRoles.find((r) => r.name === selectedRole);
                        const hasPermission = role?.permissions.includes(perm);
                        return (
                          <label
                            key={perm}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition ${
                              hasPermission
                                ? "bg-blue-50 border-blue-200"
                                : "bg-gray-50 border-gray-100 hover:border-gray-200"
                            }`}
                          >
                            <input
                              type="checkbox"
                              defaultChecked={hasPermission}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 capitalize">
                              {perm.replace(/_/g, " ")}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a role</h3>
              <p className="text-gray-400 text-sm">Click on a role to view and manage its permissions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
