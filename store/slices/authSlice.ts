import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { UserType } from "@/types";
import {
  loginAction,
  registerAction,
  logoutAction,
  getCurrentUserAction,
  googleAuthAction,
} from "@/actions/auth.actions";

interface AuthState {
  user: UserType | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

// ─── Thunks ───

export const login = createAsyncThunk(
  "auth/login",
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    const result = await loginAction(data);
    if (!result.success) {
      return rejectWithValue(result.message);
    }
    return result.data;
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (
    data: { name: string; email: string; password: string; role?: "buyer" | "seller" },
    { rejectWithValue }
  ) => {
    const result = await registerAction(data);
    if (!result.success) {
      return rejectWithValue(result.message);
    }
    return result.data;
  }
);

export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (
    data: { googleId: string; email: string; name: string; avatar?: string },
    { rejectWithValue }
  ) => {
    const result = await googleAuthAction(data);
    if (!result.success) {
      return rejectWithValue(result.message);
    }
    return result.data;
  }
);

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    const result = await getCurrentUserAction();
    if (!result.success) {
      return rejectWithValue(result.message);
    }
    return result.data;
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await logoutAction();
});

// ─── Slice ───

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload?.user as UserType;
        state.accessToken = action.payload?.accessToken || null;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload?.user as UserType;
        state.accessToken = action.payload?.accessToken || null;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Google Login
    builder
      .addCase(googleLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload?.user as UserType;
        state.accessToken = action.payload?.accessToken || null;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Check Auth
    builder
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload?.user as UserType;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
      });

    // Logout
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, setAccessToken } = authSlice.actions;
export default authSlice.reducer;
