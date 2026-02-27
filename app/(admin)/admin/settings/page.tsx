"use client";

import { useState } from "react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General" },
    { id: "store", label: "Store" },
    { id: "email", label: "Email" },
    { id: "payment", label: "Payment" },
    { id: "seo", label: "SEO" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Configure platform settings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition whitespace-nowrap ${
              activeTab === tab.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
          <h2 className="font-semibold text-gray-900">General Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Site Name</label>
              <input defaultValue="eBay" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Site URL</label>
              <input defaultValue="https://ebay.com" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Email</label>
              <input defaultValue="admin@ebay.com" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Time Zone</label>
              <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg">
                <option>UTC</option>
                <option>America/New_York</option>
                <option>America/Los_Angeles</option>
                <option>Asia/Dhaka</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-gray-700">Enable maintenance mode</span>
            </label>
          </div>
          <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
            Save Changes
          </button>
        </div>
      )}

      {activeTab === "store" && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
          <h2 className="font-semibold text-gray-900">Store Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
              <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg">
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
                <option>BDT (৳)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tax Rate (%)</label>
              <input type="number" defaultValue="10" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Order Amount</label>
              <input type="number" defaultValue="10" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Items Per Order</label>
              <input type="number" defaultValue="50" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg" />
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-gray-700">Allow guest checkout</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-gray-700">Enable product reviews</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-gray-700">Require review approval</span>
            </label>
          </div>
          <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
            Save Changes
          </button>
        </div>
      )}

      {activeTab === "email" && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
          <h2 className="font-semibold text-gray-900">Email Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">SMTP Host</label>
              <input defaultValue="smtp.gmail.com" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">SMTP Port</label>
              <input defaultValue="587" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">SMTP Username</label>
              <input className="w-full px-4 py-2.5 border border-gray-200 rounded-lg" placeholder="your@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">SMTP Password</label>
              <input type="password" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg" placeholder="••••••••" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">From Email</label>
              <input className="w-full px-4 py-2.5 border border-gray-200 rounded-lg" placeholder="noreply@ebay.com" />
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
              Save Changes
            </button>
            <button className="px-6 py-2.5 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition">
              Send Test Email
            </button>
          </div>
        </div>
      )}

      {activeTab === "payment" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Stripe</h3>
                <p className="text-xs text-gray-500 mt-0.5">Accept credit card payments</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Publishable Key</label>
                <input className="w-full px-4 py-2.5 border border-gray-200 rounded-lg" placeholder="pk_..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Secret Key</label>
                <input type="password" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg" placeholder="sk_..." />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">PayPal</h3>
                <p className="text-xs text-gray-500 mt-0.5">Accept PayPal payments</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Client ID</label>
                <input className="w-full px-4 py-2.5 border border-gray-200 rounded-lg" placeholder="Client ID" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Secret</label>
                <input type="password" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg" placeholder="Secret" />
              </div>
            </div>
          </div>
          <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
            Save Payment Settings
          </button>
        </div>
      )}

      {activeTab === "seo" && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
          <h2 className="font-semibold text-gray-900">SEO Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Title</label>
              <input defaultValue="eBay - Online Shopping Marketplace" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Description</label>
              <textarea rows={3} defaultValue="Buy and sell electronics, cars, fashion, collectibles and more on eBay." className="w-full px-4 py-2.5 border border-gray-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Keywords</label>
              <input defaultValue="online shopping, buy, sell, auction, marketplace" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Google Analytics ID</label>
              <input className="w-full px-4 py-2.5 border border-gray-200 rounded-lg" placeholder="G-XXXXXXXXXX" />
            </div>
          </div>
          <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
            Save SEO Settings
          </button>
        </div>
      )}
    </div>
  );
}
