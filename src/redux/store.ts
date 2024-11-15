// store.ts (for TypeScript)

import { configureStore } from '@reduxjs/toolkit';

import employeesReducer from '@/redux/features/employees/employeesSlice';
import salaryTemplateReducer from '@/redux/features/salaryTemplate/salaryTemplateSlice';
import salaryComponentReducer from '@/redux/features/salaryComponent/salaryComponentSlice';
import payrollReducer from '@/redux/features/payroll/payrollSlice'

const store = configureStore({
  reducer: {
    // Add your reducers here
    employees: employeesReducer,
    salaryTemplates: salaryTemplateReducer,
    salaryComponents: salaryComponentReducer,
    payrolls: payrollReducer
  }
})


export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
