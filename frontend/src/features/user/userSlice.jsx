import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authService } from "./userService";
import { toast } from "react-toastify";


// Thunks (unchanged except for logout addition)
export const registerUser = createAsyncThunk(
    "auth/register",
    async (userData, thunkAPI) => {
      try {
        return await authService.register(userData);
      } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
      }
    }
  );

  export const loginUser = createAsyncThunk(
    "auth/login",
    async (userData, thunkAPI) => {
      try {
        return await authService.login(userData);
      } catch (error) {
        return thunkAPI.rejectWithValue(error);
      }
    }
  );
  export const logoutUser = createAsyncThunk(
    "auth/logout",
    async (_, thunkAPI) => {
      try {
        return await authService.logout();
      } catch (error) {
        return thunkAPI.rejectWithValue(error);
      }
    }
  );
  const getCustomerfromLocalStorage = localStorage.getItem("customer")
  ? JSON.parse(localStorage.getItem("customer"))
  : null;
  const initialState = {
    user: getCustomerfromLocalStorage,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: "",
  };

  const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(registerUser.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(registerUser.fulfilled, (state, action) => {
          state.isLoading = false;
          state.isError = false;
          state.isSuccess = true;
          state.createdUser = action.payload;
          if (state.isSuccess) {
            toast.info("User created successfully");
          }
        })
        .addCase(registerUser.rejected, (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.isSuccess = false;
          state.message = action.error;
          if (state.isError) {
            toast.error(action.payload);          }
        }).addCase(loginUser.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(loginUser.fulfilled, (state, action) => {
          state.isLoading = false;
          state.isError = false;
          state.isSuccess = true;
          state.user = action.payload;
          if (state.isSuccess) {
            localStorage.setItem("customer", JSON.stringify(action.payload));
            localStorage.setItem("token", action.payload.token);
            toast.info("User logged in successfully");
          }
        })
        .addCase(loginUser.rejected, (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.isSuccess = false;
          state.message = action.error;
          if (state.isError) {
            toast.error(action.error.message);
          }
        })
        .addCase(logoutUser.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(logoutUser.fulfilled, (state) => {
          state.isLoading = false;
          state.isError = false;
          state.isSuccess = true;
          state.user = null;
          state.wishlist = [];
          state.cartProducts = [];
          localStorage.removeItem("customer");
          localStorage.removeItem("token");
          toast.info("User logged out successfully");
        })
        .addCase(logoutUser.rejected, (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.isSuccess = false;
          state.message = action.error;
          toast.error("Logout failed");
        })
       
    },
})
export default authSlice.reducer;