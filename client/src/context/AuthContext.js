import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  isLoggingOut: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_LOGOUT_LOADING':
      return { ...state, isLoggingOut: action.payload };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        isLoggingOut: false,
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isLoggingOut: false,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const clearAuthData = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  }, []);

  const saveAuthData = useCallback((accessToken, refreshToken, user) => {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: {
        token: accessToken,
        user,
      },
    });
  }, []);

  const refreshAuthToken = useCallback(
    async (refreshToken) => {
      try {
        const response = await authAPI.refresh(refreshToken);

        if (response.data?.success) {
          const {
            accessToken,
            refreshToken: newRefreshToken,
            user,
          } = response.data.data;

          saveAuthData(accessToken, newRefreshToken, user);
          return accessToken;
        }

        throw new Error('Token refresh failed');
      } catch (error) {
        console.error('Token refresh error:', error);
        clearAuthData();
        return null;
      }
    },
    [saveAuthData, clearAuthData]
  );

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');
        const userData = localStorage.getItem('user');

        // Nëse s’ka user data ose s’ka refresh token -> logout
        if (!userData || !refreshToken) {
          clearAuthData();
          return;
        }

        const parsedUser = JSON.parse(userData);

        // Nëse mungon vetëm access token -> provo refresh, jo logout direkt
        if (!token) {
          await refreshAuthToken(refreshToken);
          return;
        }

        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp > currentTime) {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              token,
              user: parsedUser,
            },
          });
          return;
        }

        // Token expired -> provo refresh
        await refreshAuthToken(refreshToken);
      } catch (error) {
        console.error('Token validation error:', error);
        clearAuthData();
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initAuth();
  }, [refreshAuthToken, clearAuthData]);

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await authAPI.login(credentials);

      if (response.data?.success) {
        const { accessToken, refreshToken, user } = response.data.data;
        saveAuthData(accessToken, refreshToken, user);
        toast.success('Successfully logged in!');
        return { success: true };
      }

      throw new Error(response.data?.message || 'Login failed');
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await authAPI.register(userData);

      if (response.data?.success) {
        const { accessToken, refreshToken, user } = response.data.data;
        saveAuthData(accessToken, refreshToken, user);
        toast.success('Registration successful!');
        return { success: true };
      }

      throw new Error(response.data?.message || 'Registration failed');
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });

      const message = error.response?.data?.message || error.message || 'Registration failed';

      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors.map((err) => err.msg).join(', ');
        toast.error(validationErrors);
        return { success: false, message: validationErrors };
      }

      toast.error(message);
      return { success: false, message };
    }
  };

  const forceLogout = () => {
    clearAuthData();
    toast.info('You have been logged out');
  };

  const logout = async () => {
    try {
      dispatch({ type: 'SET_LOGOUT_LOADING', payload: true });
      await authAPI.logout();
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Logout error:', error);
      toast.info('Logged out locally');
    } finally {
      clearAuthData();
    }
  };

  const updateUser = (userData) => {
    const updatedUser = { ...state.user, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const isAdmin = () => {
    return state.user?.role === 'Admin' || state.user?.userType === 'Admin';
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    forceLogout,
    updateUser,
    isAdmin,
    refreshAuthToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};