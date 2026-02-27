"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { createProductAction } from "@/actions/product.actions";
import { getCategoriesAction } from "@/actions/product.actions";
import { CategoryType } from "@/types";
import { useEffect } from "react";

export default function CreateProductPage() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "",
    condition: "new" as "new" | "used" | "refurbished",
    productType: "buy_now" as "buy_now" | "auction",
    stock: "1",
    images: "" as string,
    tags: "",
    shippingCost: "0",
    freeShipping: false,
    shippingInfo: "",
    auctionStartPrice: "",
    auctionEndTime: "",
  });

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== "seller" && user?.role !== "admin")) {
      router.push("/login");
      return;
    }
    getCategoriesAction().then((res) => {
      if (res.success && res.data) setCategories(res.data);
    });
  }, [isAuthenticated, user, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const productData: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category,
        condition: form.condition,
        productType: form.productType,
        stock: parseInt(form.stock),
        images: form.images.split(",").map((s) => s.trim()).filter(Boolean),
        tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
        shippingCost: parseFloat(form.shippingCost) || 0,
        freeShipping: form.freeShipping,
        shippingInfo: form.shippingInfo,
      };

      if (form.originalPrice) productData.originalPrice = parseFloat(form.originalPrice);

      if (form.productType === "auction") {
        productData.auctionStartPrice = parseFloat(form.auctionStartPrice);
        productData.auctionEndTime = form.auctionEndTime;
      }

      const res = await createProductAction(productData);

      if (res.success) {
        router.push("/seller/products");
      } else {
        setError(res.message || "Failed to create product");
      }
    } catch {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">List a New Product</h1>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            maxLength={200}
            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter product title"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={5}
            maxLength={5000}
            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe your product..."
          />
        </div>

        {/* Category + Condition */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condition *</label>
            <select
              name="condition"
              value={form.condition}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="new">New</option>
              <option value="used">Used</option>
              <option value="refurbished">Refurbished</option>
            </select>
          </div>
        </div>

        {/* Product Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Listing Type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="productType"
                value="buy_now"
                checked={form.productType === "buy_now"}
                onChange={handleChange}
                className="radio radio-sm radio-primary"
              />
              <span className="text-sm">Buy It Now</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="productType"
                value="auction"
                checked={form.productType === "auction"}
                onChange={handleChange}
                className="radio radio-sm radio-primary"
              />
              <span className="text-sm">Auction</span>
            </label>
          </div>
        </div>

        {/* Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {form.productType === "auction" ? "Starting Price *" : "Price *"}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                name={form.productType === "auction" ? "auctionStartPrice" : "price"}
                type="number"
                step="0.01"
                min="0"
                value={form.productType === "auction" ? form.auctionStartPrice : form.price}
                onChange={handleChange}
                required
                className="w-full pl-7 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
          {form.productType === "buy_now" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original Price (optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  name="originalPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.originalPrice}
                  onChange={handleChange}
                  className="w-full pl-7 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
          )}
          {form.productType === "auction" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Auction End Time *</label>
              <input
                name="auctionEndTime"
                type="datetime-local"
                value={form.auctionEndTime}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* Stock */}
        {form.productType === "buy_now" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
            <input
              name="stock"
              type="number"
              min="1"
              value={form.stock}
              onChange={handleChange}
              className="w-32 px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URLs</label>
          <input
            name="images"
            value={form.images}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="URL1, URL2, URL3 (comma separated)"
          />
          <p className="text-xs text-gray-400 mt-1">Enter image URLs separated by commas</p>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <input
            name="tags"
            value={form.tags}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="electronics, phone, apple (comma separated)"
          />
        </div>

        {/* Shipping */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Cost</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                name="shippingCost"
                type="number"
                step="0.01"
                min="0"
                value={form.shippingCost}
                onChange={handleChange}
                disabled={form.freeShipping}
                className="w-full pl-7 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="freeShipping"
                checked={form.freeShipping}
                onChange={handleChange}
                className="checkbox checkbox-sm checkbox-primary"
              />
              <span className="text-sm text-gray-700">Free Shipping</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Info</label>
          <input
            name="shippingInfo"
            value={form.shippingInfo}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Estimated delivery time, shipping method, etc."
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "List Product"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
