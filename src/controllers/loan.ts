import { Request, Response } from 'express';
import { Form } from 'form-my-simple-validation';
import { ResponseFormat, successResponse, errorResponse } from '@modules/util/mSender';
import { formSchema } from '@modules/validation/formSchema';
import * as Messanger from '@helpers/messanger';
import * as Utils from '@helpers/index';
import db from '@models/index';
import { jwtPayload } from '@models/users';

/**
 * @abstract ILoan
 */
abstract class ILoan {
  /**
   * @HTTPverb POST
   * @author DanielAdek
   * @method requestLoan
   * @param {object} req Request object
   * @param {object} res Response object
   * @desc Feature allows user to request loan
   */
   public abstract requestLoan(req: Request, res: Response): Promise<any> 

  /**
   * @HTTPverb POST
   * @method payLoan
   * @author DanielAdek
   * @param {object} req Request object
   * @param {object} res Response object
   * @desc Feature allows loan pay back
   */
   public abstract payLoan(req: Request, res: Response): Promise<any> 
}

/**
 * @class Loan
 */
export class Loan extends ILoan {
  /**
   * @HTTPverb POST
   * @author DanielAdek
   * @method requestLoan
   * @param {object} req Request object
   * @param {object} res Response object
   * @desc Feature allows user to request loan
   * @returns {object} Express returned object
   */

   public async requestLoan(req: Request, res: Response): Promise<any> {
    try {
      // validate fields
      const validationResult: ResponseFormat = Form.validateFields('request_loan', formSchema, req.body);
      if (validationResult.error) {
        return res.status(400).jsend.fail(validationResult);
      }

      const { _id: customerId }: jwtPayload = res.locals.decoded;

      // confirm user exist
      const user = await Messanger.shouldFindOneObject(db.Users, { _id: customerId });
  
      if (!user) {
        const result: ResponseFormat = errorResponse('RecognitionError', 400, 'customerId', 'request loan', 'user not found', { error: true, operationStatus: 'Proccess Terminated!' });
        return res.status(400).jsend.fail(result);
      }

      // confirm password match
      const passwordMatch = await user.comparePassword(req.body.password);

      if (!passwordMatch) {
        const result: ResponseFormat = errorResponse('SecurityTraceError', 401, 'password', 'request loan', 'Password Incorrect!', { error: true, operationStatus: 'Process Terminated', user: null });
        return res.status(401).jsend.fail(result);
      }

      // confirm user account
      const userAccount = await Messanger.shouldFindOneObject(db.Accounts, { customerId });
  
      if (!userAccount) {
        const result: ResponseFormat = errorResponse('RecognitionError', 400, 'customerId', 'request loan', 'user account not found. create an account!', { error: true, operationStatus: 'Proccess Terminated!' });
        return res.status(400).jsend.fail(result);
      }

      // confirm bvn is correct
      const bvn = Utils.decryptData(userAccount.bvn);
      const bvnMatch: boolean = bvn === req.body.bvn;
   
      if (!bvnMatch) {
        const result: ResponseFormat = errorResponse('SecurityTraceError', 401, 'bvn', 'request loan', 'BVN is not correct!', { error: true, operationStatus: 'Process Terminated', user: null });
        return res.status(401).jsend.fail(result);
      }

      // confirm loan not too much
      const userLoans = await Messanger.shouldFindObjects(db.Loans, { customerId, loanPaid: false }, {});
  
      if (userLoans.length > 3) {
        const result: ResponseFormat = errorResponse('UserRequestError', 400, '', 'request loan', 'Sorry! you have too many outstanding loan.', { error: true, operationStatus: 'Proccess Terminated!' });
        return res.status(400).jsend.fail(result);
      }
      
      // request the loan
      const today = new Date();
      const deadline = Utils.threeMonthsAfter(today);
      const loan = await Messanger.shouldInsertToDataBase(db.Loans, { customerId, amount: req.body.amount, deadline, totalAmountPayable: req.body.amount });

      const result: ResponseFormat = successResponse('Request Successful', 201, 'request loan', { error: false, operationStatus: 'Proccess Completed!', loan })
      return res.status(201).jsend.success(result);
    } catch(error) {
      const result: ResponseFormat = errorResponse(`${error.syscall || error.name || 'ServerError'}`, 500, `${error.path || 'No Field'}`, 'request loan', `${error.message}`, { error: true, operationStatus: 'Proccess Terminated!', errorSpec: error });
      return res.status(500).jsend.fail(result);
   }
  }
  /**
   * @HTTPverb PUT
   * @method payLoan
   * @author DanielAdek
   * @param {object} req Request object
   * @param {object} res Response object
   * @desc Feature allows loan pay back
   */
   public async payLoan(req: Request, res: Response): Promise<any> {
    try {
      const platform = Utils.allowOnlyBrowsers(req);
      if (!platform.isAllowed) {
        return res.status(400).jsend.fail(platform.error);
      }
      const validationResult: ResponseFormat = Form.validateFields('pay_loan', formSchema, req.body);
      if (validationResult.error) {
        return res.status(400).jsend.fail(validationResult);
      }

      const { _id: customerId }: jwtPayload = res.locals.decoded;

       // confirm user exist
      const user = await Messanger.shouldFindOneObject(db.Users, { _id: customerId });

      if (!user) {
        const result: ResponseFormat = errorResponse('RecognitionError', 400, 'customerId', 'pay loan', 'user not found', { error: true, operationStatus: 'Proccess Terminated!' });
        return res.status(400).jsend.fail(result);
      }

      // confirm user has account
      const userAccount = await Messanger.shouldFindOneObject(db.Accounts, { customerId });
  
      if (!userAccount) {
        const result: ResponseFormat = errorResponse('RecognitionError', 400, 'customerId', 'pay loan', 'Account not found. Create account', { error: true, operationStatus: 'Proccess Terminated!' });
        return res.status(400).jsend.fail(result);
      }

      // confirm is not paid
      const loan = await Messanger.shouldFindOneObject(db.Loans, { _id: req.body.loanId });
  
      if (loan.loanPaid) {
        const result: ResponseFormat = errorResponse('PaymentError', 400, 'loanId', 'pay loan', 'Loan has already been paid', { error: true, operationStatus: 'Proccess Terminated!' });
        return res.status(400).jsend.fail(result);
      }

      let bankName: string | null = null;
      let insufficientFund: boolean = false;
      let bankId: string | null = null;

      for(const bank of userAccount.banks) {
        if (bank._id.equals(req.body.bankId)) {
          bankId = bank._id;
          // confirm balance is sufficient
          if (bank.balance < req.body.totalAmountPayable) {
            insufficientFund = true;
          }
          if (bank.balance > req.body.totalAmountPayable) {
            // debit user account
            bankName = bank.bankName
            bank.balance -= req.body.totalAmountPayable;
          }
        }
      }

      if (!bankId) {
        const result: ResponseFormat = errorResponse('IdentityError', 422, 'bankId', 'pay loan', 'Select A Marchant', { error: true, operationStatus: 'Proccess Terminated!' });
        return res.status(400).jsend.fail(result);
      }

      if (insufficientFund) {
        const result: ResponseFormat = errorResponse('DebitError', 400, 'totalAmountPayable', 'pay loan', 'Insufficient Funds', { error: true, operationStatus: 'Proccess Terminated!' });
        return res.status(400).jsend.fail(result);
      }

      await userAccount.save();

      // confirm payment
      await Messanger.shouldEditOneObject(db.Loans, { id: req.body.loanId, data: { loanPaid: true, bank: bankName }});

      const result: ResponseFormat = successResponse('Payment is confirmed!', 200, 'pay loan', { error: false, operationStatus: 'Proccess Completed!' })
      return res.status(201).jsend.success(result);
    } catch(error) {
      const result: ResponseFormat = errorResponse(`${error.syscall || error.name || 'ServerError'}`, 500, `${error.path || 'No Field'}`, 'pay loan', `${error.message}`, { error: true, operationStatus: 'Proccess Terminated!', errorSpec: error });
      return res.status(500).jsend.fail(result);
    }
  }

  /**
   * @HTTPverb GET
   * @method payLoan
   * @author DanielAdek
   * @param {object} req Request object
   * @param {object} res Response object
   * @desc Feature allows loan pay back
   */
   public async retreiveLoan(_: Request, res: Response): Promise<any> {
    try {
      const { _id: customerId }: jwtPayload = res.locals.decoded;

       // confirm user exist
      const user = await Messanger.shouldFindOneObject(db.Users, { _id: customerId });

      if (!user) {
        const result: ResponseFormat = errorResponse('RecognitionError', 400, 'customerId', 'pay loan', 'user not found', { error: true, operationStatus: 'Proccess Terminated!' });
        return res.status(400).jsend.fail(result);
      }

      // retreive loan
      const userLoans = await Messanger.shouldFindObjects(db.Loans, { customerId }, {});
  
      if (!userLoans.length) {
        const result: ResponseFormat = successResponse('No loans yet', 204, 'retreive loan', { error: false, operationStatus: 'Proccess Completed!', userLoans })
        return res.status(200).jsend.success(result);
      }

      const result: ResponseFormat = successResponse('Loan Retreived', 200, 'retreive loan', { error: false, operationStatus: 'Proccess Completed!', userLoans })
      return res.status(200).jsend.success(result);
 
    } catch(error) {
      const result: ResponseFormat = errorResponse(`${error.syscall || error.name || 'ServerError'}`, 500, `${error.path || 'No Field'}`, 'retreive loan', `${error.message}`, { error: true, operationStatus: 'Proccess Terminated!', errorSpec: error });
      return res.status(500).jsend.fail(result);
    }
  }
};