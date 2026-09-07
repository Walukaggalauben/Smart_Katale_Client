import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {  UserLogin, UserRegister } from "../api/auth";

const normalizeFrontendRole = (role: string | null | undefined) =>
  role === 'superuser' ? 'manager' : (role ?? null);

interface UserState {
  id: string | number | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  role: string | null;
  phone_number: string | null;
  message: string | null;
  error: string | null;
  is_authenticated: boolean;
  access_token?: string | null;
  refresh_token?: string | null;
  loading: boolean;
}

const loadUserFromStorage = (): Partial<UserState> => {
  try {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      return {
        ...userData,
        role: normalizeFrontendRole(userData.role),
        is_authenticated: true,
      };
    }
  } catch (error) {
    console.error('Failed to load user from storage:', error);
  }
  return {};
};

const initialState: UserState = {
  id: null,
  first_name: null,
  last_name: null,
  email: null,
  role: null,
  phone_number: null,
  message: null,
  error: null,
  is_authenticated: false,
  access_token: null,
  refresh_token: null,
  loading: false,
  ...loadUserFromStorage(),
};

export const LoginThunk = createAsyncThunk(
  'user/login',
  async (credentials: { [key: string]: string }, { rejectWithValue }) => {
    try {
      const response = await UserLogin(credentials);
      
      // Check if login was successful
      if (!response.success) {
        return rejectWithValue(response.error || 'Login failed');
      }
      
      return response;
    } catch (error) {
      return rejectWithValue('Something went wrong');
    }
  }
);

export const RegisterThunk = createAsyncThunk(
  'user/register',
  async (userData: { [key: string]: string }, { rejectWithValue }) => {
    try {
      const response = await UserRegister(userData);
      
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.error || 'Registration failed');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Something went wrong');
    }
  }
);



export const LogoutThunk = createAsyncThunk(
  'user/logout',
  async (_) => {
    // Clear session storage
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    
    // You could also call a logout API endpoint here if needed
    // await UserLogout();
    
    return true;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<any>) => {
      state.id = action.payload?.id;
      state.first_name = action.payload?.first_name;
      state.last_name = action.payload?.last_name;
      state.email = action.payload?.email;
      state.phone_number = action.payload?.phone_number;
      state.role = normalizeFrontendRole(action.payload?.role);
      state.message = action.payload?.message;
      state.error = null;
      state.is_authenticated = true;
      state.access_token = action.payload?.access_token;
      state.refresh_token = action.payload?.refresh_token;
      
      // Store in sessionStorage (cleared when browser tab is closed)
      sessionStorage.setItem('user', JSON.stringify({
        id: action.payload?.id,
        first_name: action.payload?.first_name,
        last_name: action.payload?.last_name,
        email: action.payload?.email,
        role: normalizeFrontendRole(action.payload?.role),
        phone_number: action.payload?.phone_number,
      }));
      
      if (action.payload?.access_token) {
        sessionStorage.setItem('access_token', action.payload.access_token);
      }
      if (action.payload?.refresh_token) {
        sessionStorage.setItem('refresh_token', action.payload.refresh_token);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(LoginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(LoginThunk.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.id = action.payload?.id;
        state.first_name = action.payload?.first_name;
        state.last_name = action.payload?.last_name;
        state.email = action.payload?.email;
        state.phone_number = action.payload?.phone_number;
        state.role = normalizeFrontendRole(action.payload?.role);
        state.message = action.payload?.message;
        state.error = null;
        state.is_authenticated = true;
        state.access_token = action.payload?.access_token;
        state.refresh_token = action.payload?.refresh_token;
       
        sessionStorage.setItem('user', JSON.stringify({
          id: action.payload?.id,
          first_name: action.payload?.first_name,
          last_name: action.payload?.last_name,
          email: action.payload?.email,
          role: normalizeFrontendRole(action.payload?.role),
          phone_number: action.payload?.phone_number,
        }));
        
        if (action.payload?.access_token) {
          sessionStorage.setItem('access_token', action.payload.access_token);
        }
        if (action.payload?.refresh_token) {
          sessionStorage.setItem('refresh_token', action.payload.refresh_token);
        }
      })
      .addCase(LoginThunk.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.id = null;
        state.first_name = null;
        state.last_name = null;
        state.email = null;
        state.phone_number = null;
        state.role = null;
        state.message = null;
        state.error = action.payload || 'Login failed';
        state.is_authenticated = false;
        state.access_token = null;
        state.refresh_token = null;
        
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
      })
      
      // Register cases
      .addCase(RegisterThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(RegisterThunk.fulfilled, (state) => {
        state.loading = false;
        state.message = 'Registration successful';
        state.error = null;
      })
      .addCase(RegisterThunk.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || 'Registration failed';
      })
      
      // Logout case
      .addCase(LogoutThunk.fulfilled, (state) => {
        state.id = null;
        state.first_name = null;
        state.last_name = null;
        state.email = null;
        state.phone_number = null;
        state.role = null;
        state.message = null;
        state.error = null;
        state.is_authenticated = false;
        state.access_token = null;
        state.refresh_token = null;
        state.loading = false;
      });
  }
});

export const { clearError, setUser } = userSlice.actions;
export default userSlice.reducer;