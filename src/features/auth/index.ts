export * from './components/withAuth.component'
export * from './components/UserLogin.component'
export { default as CustomerAccount } from './components/CustomerAccount.component'
export { checkCustomerSession, fetchCustomerAccount } from './api/fetchCustomerAccount'
export type {
  CustomerAccountData,
  CustomerAddress,
  CustomerOrder,
  CustomerDownloadableItem,
  GetCustomerAccountResponse,
} from './types/customer'
