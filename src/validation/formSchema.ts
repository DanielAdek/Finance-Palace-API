/**
 * @desc SAMPLE REQUEST SCHEMA
 */
export const formSchema = {
  login: {
    formType: 'authenticate',
    a: { field: 'dataField', required: true },
    b: { field: 'password', required: true }
  },
  onboard: {
    formType: 'onboard',
    a: { field: 'firstName', required: true, isName: true },
    b: { field: 'lastName', required: true, isName: true },
    c: { field: 'email', required: true, isEmail: true },
    d: { field: 'dob', required: true },
    h: { field: 'username', required: true, isName: true },
    k: {
      field: 'password', required: true, min: 8, max: 15
    }
  },
  account: {
    formType: 'create_account',
    a: { field: 'password', required: true }
  },
  updateAccount: {
    formType: 'update_account',
    a: { field: 'balance', isInteger: true },
    b: { field: 'bankId', required: true }
  },
  loan: {
    formType: 'request_loan',
    a: { field: 'password', required: true },
    b: { field: 'bvn', required: true},
    c: { field: 'amount', isInteger: true }
  },
  payloan: {
    formType: 'pay_loan',
    a: { field: 'bankId'},
    b: { field: 'totalAmountPayable', isInteger: true },
    c: { field: 'loanId', required: true }
  },
};