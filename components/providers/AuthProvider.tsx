"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { checkAuth } from "@/store/slices/authSlice";
import { initializeCart } from "@/store/slices/cartSlice";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkAuth());
    dispatch(initializeCart());
  }, [dispatch]);

  return <>{children}</>;
}
