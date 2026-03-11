import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import axios from 'axios';

const AuthContext = createContext();

// Define the reducer function first
const authReducer = (state, action) => {
  switch (action.type) {
    case 'USER_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      // In Supabase auth, we don't use JWT tokens in the same way
      // Instead we store session info
      if (action.payload.token) {
        localStorage.setItem('token', action.payload.token);
      }
      return {
        ...state,
        ...action.payload,
        isAuthenticated: true,
        loading: false
      };
    case 'GOOGLE_LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false
      };
    case 'AUTH_ERROR':
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false
      };
    case 'NO_TOKEN':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    loading: true
  });

  // Handle Supabase auth state changes
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Get user data from our backend
        try {
          const token = `Bearer ${session.access_token}`;
          const res = await axios.get('/api/auth', {
            headers: {
              'x-auth-token': token
            }
          });
          dispatch({ type: 'USER_LOADED', payload: res.data });
        } catch (err) {
          dispatch({ type: 'AUTH_ERROR' });
        }
      } else {
        dispatch({ type: 'NO_TOKEN' });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          // User is signed in
          const token = `Bearer ${session.access_token}`;
          axios.get('/api/auth', {
            headers: {
              'x-auth-token': token
            }
          })
          .then(res => {
            dispatch({ type: 'USER_LOADED', payload: res.data });
          })
          .catch(err => {
            dispatch({ type: 'AUTH_ERROR' });
          });
        } else {
          // User is signed out
          dispatch({ type: 'LOGOUT' });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Get user data from our backend
      const token = `Bearer ${data.session.access_token}`;
      const res = await axios.get('/api/auth', {
        headers: {
          'x-auth-token': token
        }
      });
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
      return true;
    } catch (err) {
      console.error('Login error:', err);
      dispatch({ type: 'LOGIN_FAIL' });
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        // User created, now create profile in our backend
        const res = await axios.post('/api/users', { 
          name, 
          email, 
          password  // This will be hashed on the backend
        });
        
        dispatch({ type: 'REGISTER_SUCCESS', payload: res.data });
        return true;
      }
    } catch (err) {
      console.error('Registration error:', err);
      dispatch({ type: 'REGISTER_FAIL' });
      return false;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      
      // The auth state change listener will handle the rest
      return true;
    } catch (err) {
      console.error('Google sign in error:', err);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    dispatch({ type: 'LOGOUT' });
  };

  const loadUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      try {
        const token = `Bearer ${session.access_token}`;
        const res = await axios.get('/api/auth', {
          headers: {
            'x-auth-token': token
          }
        });
        dispatch({ type: 'USER_LOADED', payload: res.data });
      } catch (err) {
        dispatch({ type: 'AUTH_ERROR' });
      }
    } else {
      dispatch({ type: 'NO_TOKEN' });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        loadUser,
        login,
        register,
        logout,
        signInWithGoogle
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;