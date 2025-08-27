import { configureStore } from '@reduxjs/toolkit';
import dronesReducer from './dronesSlice';

export const store = configureStore({
  reducer: { drones: dronesReducer },
});