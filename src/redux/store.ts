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
import companiesReducer from '@/redux/features/company/companyslice'
import attendancesReducer from '@/redux/features/attendance/attendanceslice'
import designationReducer from '@/redux/features/designation/desingationSlice'
import configrationReducer from '@/redux/features/configuration/configurationSlice'
import componentTypeReducer from '@/redux/features/componentType/componentTypeSlice';

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
    loans: loanReducer,
    companies: companiesReducer,
    attendances: attendancesReducer,
    designations: designationReducer,
    configration: configrationReducer,
    componentTypes: componentTypeReducer,
  }
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
