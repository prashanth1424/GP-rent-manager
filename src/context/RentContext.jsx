import React, { createContext, useReducer, useEffect } from 'react';
import { loadData, saveData } from '../utils/storage';

export const RentContext = createContext();

const initialState = {
  rooms: [],
  tenants: [],
  tenancies: [],
  bills: [],
  settings: {
    propertyName: "Dominion Residency",
    landlordName: "",
    landlordPhone: "",
    address: "",
    vacantRoomUtilityPolicy: "absorb",
    electricityRatePerUnit: 10
  }
};

const rentReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ROOM':
      return { ...state, rooms: [...state.rooms, action.payload] };
    case 'UPDATE_ROOM':
      return {
        ...state,
        rooms: state.rooms.map(r => r.id === action.payload.id ? action.payload : r)
      };
    
    case 'ADD_TENANT':
      return { ...state, tenants: [...state.tenants, action.payload] };
    case 'UPDATE_TENANT':
      return {
        ...state,
        tenants: state.tenants.map(t => t.id === action.payload.id ? action.payload : t)
      };
    case 'DELETE_TENANT':
      return {
        ...state,
        tenants: state.tenants.filter(t => t.id !== action.payload)
      };
    
    case 'CREATE_TENANCY':
      return { ...state, tenancies: [...state.tenancies, action.payload] };
    case 'CLOSE_TENANCY':
      return {
        ...state,
        tenancies: state.tenancies.map(t => t.id === action.payload.id ? { ...t, endDate: action.payload.endDate, status: 'vacated', depositRefunded: action.payload.depositRefunded, depositDeductions: action.payload.depositDeductions } : t)
      };
    case 'UPDATE_TENANCY':
      return {
        ...state,
        tenancies: state.tenancies.map(t => t.id === action.payload.id ? action.payload : t)
      };

    case 'UPSERT_BILL':
      const exists = state.bills.find(b => b.id === action.payload.id);
      if (exists) {
        return {
          ...state,
          bills: state.bills.map(b => b.id === action.payload.id ? action.payload : b)
        };
      }
      return { ...state, bills: [...state.bills, action.payload] };
      
    case 'ADD_PAYMENT':
      return {
        ...state,
        bills: state.bills.map(b => {
          if (b.id === action.payload.billId) {
            return {
              ...b,
              payments: [...b.payments, action.payload.payment]
            };
          }
          return b;
        })
      };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case 'IMPORT_DATA':
      return action.payload;

    case 'CLEAR_DATA':
      return initialState;

    default:
      return state;
  }
};

export const RentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(rentReducer, initialState, () => {
    const localData = loadData();
    return localData || initialState;
  });

  useEffect(() => {
    saveData(state);
  }, [state]);

  return (
    <RentContext.Provider value={{ state, dispatch }}>
      {children}
    </RentContext.Provider>
  );
};
