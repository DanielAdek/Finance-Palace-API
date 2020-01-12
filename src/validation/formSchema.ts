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
    e: { field: 'city', required: true },
    f: { field: 'state', required: true, isName: true },
    g: {
      field: 'password', required: true, min: 8, max: 15
    }
  },
};