import { configureStore } from '@reduxjs/toolkit';

import employeesReducer from '@/redux/features/employees/employeesSlice';
import salaryTemplateReducer from '@/redux/features/salaryTemplate/salaryTemplateSlice';
import salaryComponentReducer from '@/redux/features/salaryComponent/salaryComponentSlice';
import payrollReducer from '@/redux/features/payroll/payrollSlice';
import declarationReducer from "@/redux/features/declaration/declarationSlice";
import statutoryComponentReducer from '@/redux/features/statutory-component/statutoryComponentSlice'; // Correct the import name
import reimbursementReducer from '@/redux/features/reimbursement/reimbursementsSlice'
import organizationReducer from '@/redux/features/organization/organizationSlice'
import loanReducer from '@/redux/features/loan/loanSlice'

const store = configureStore({
  reducer: {
    employees: employeesReducer,
    salaryTemplates: salaryTemplateReducer,
    salaryComponents: salaryComponentReducer,
    payrolls: payrollReducer,
    declaration: declarationReducer,
    statutoryComponent: statutoryComponentReducer,
    reimbursements: reimbursementReducer,
    organization: organizationReducer,
    loans: loanReducer



  }
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
