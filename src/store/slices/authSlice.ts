import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { UserRole } from "@/types";
import { apiPost } from "@/lib/axios";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isResident: boolean;
  onboardingCompleted: boolean;
  hallId?: string | null;
  roomNumber?: string | null;
  image?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: false, 
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await apiPost<any>("/api/auth/register", data);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Registration failed");
    }
  }
);

export const completeOnboarding = createAsyncThunk(
  "auth/completeOnboarding",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await apiPost<any>("/api/auth/onboarding", data);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to complete onboarding");
    }
  }
);

const authSlice = createSlice({
  name: "auth", 
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
      state.role = action.payload?.role ?? null;
      state.isAuthenticated = action.payload !== null;
      state.isLoading = false;
    },
    setRole: (state, action: PayloadAction<UserRole>) => {
      state.role = action.payload;
    },
    setOnboardingCompleted: (state, action: PayloadAction<boolean>) => {
      if (state.user) {
        state.user.onboardingCompleted = action.payload;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(registerUser.rejected, (state) => {
        state.isLoading = false;
      })
      // Onboarding
      .addCase(completeOnboarding.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(completeOnboarding.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user) {
          state.user.onboardingCompleted = true;
        }
      })
      .addCase(completeOnboarding.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { setUser, setRole, setLoading, clearAuth } = authSlice.actions;
export default authSlice.reducer;
