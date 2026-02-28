"use client";

import { Provider } from "react-redux";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { store } from "./store";
import { queryClient, localStoragePersister } from "@/lib/queryClient";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: localStoragePersister!,
        maxAge: 30 * 60 * 1000, // 30 minutes — এর পরে stale data মুছে যাবে
        buster: "v1", // version change করলে পুরনো cache clear হবে
      }}
    >
      <Provider store={store}>{children}</Provider>
    </PersistQueryClientProvider>
  );
}
