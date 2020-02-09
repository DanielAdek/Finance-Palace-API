import { Request, Response } from 'express';
import { Form } from 'form-my-simple-validation';
import CryptoJS from "crypto-js";
import { ResponseFormat, successResponse, errorResponse } from '@modules/util/mSender';
import { formSchema } from '@modules/validation/formSchema';
import * as Messanger from '@helpers/messanger';
import * as Utils from '@helpers/index';
import db from '@models/index';
import { jwtPayload } from '@models/users';

/**
 * @abstract IAccount
 */
abstract class IAccount {
  /**
   * @HTTPverb POST
   * @author DanielAdek
   * @method create
   * @param {object} req Request object
   * @param {object} res Response object
   * @desc Feature allows user to create data
   */
   protected abstract create(req: Request, res: Response): Promise<any> 
  
   /**
   * @HTTPverb GET
   * @author DanielAdek
   * @method retreive
   * @param {object} req Request object
   * @param {object} res Response object
   * @desc Feature allows retreive data
   */
   protected abstract retreive(req: Request, res: Response): Promise<any> 

  /**
   * @HTTPverb PUT
   * @method update
   * @author DanielAdek
   * @param {object} req Request object
   * @param {object} res Response object
   * @desc Feature allows update data
   */
   protected abstract update(req: Request, res: Response): Promise<any> 
}

/**
 * @class Loan
 */
export class Account extends IAccount {
  /**
   * @HTTPverb POST
   * @author DanielAdek
   * @method create
   * @param {object} req Request object
   * @param {object} res Response object
   * @desc Feature allows user to create account
   * @returns {object} Express returned object
   */

   protected async create(req: Request, res: Response): Promise<any> {
    try {
      // validate fields
      const validationResult: ResponseFormat = Form.validateFields('create_account', formSchema, req.body);
      if (validationResult.error) {
        return res.status(400).json(validationResult);
      }

      const { _id: customerId }: jwtPayload = res.locals.decoded;

      // confirm user exist
      const user = await Messanger.shouldFindOneObject(db.Users, { _id: customerId });

      if (!user) {
        const result: ResponseFormat = errorResponse('RecognitionError', 400, 'customerId', 'create account', 'user not found', { error: true, operationStatus: 'Proccess Terminated!' });
        return res.status(400).json(result);
      }

      // confirm password match
      const passwordMatch = await user.comparePassword(req.body.password);

      if (!passwordMatch) {
        const result: ResponseFormat = errorResponse('SecurityTraceError', 401, 'password', 'create account', 'Password Incorrect!', { error: true, operationStatus: 'Process Terminated', user: null });
        return res.status(401).json(result);
      }

      // confirm user account not existed
      const userAccount = await Messanger.shouldFindOneObject(db.Accounts, { customerId });
  
      if (userAccount) {
        const result: ResponseFormat = errorResponse('DuplicateError', 400, 'customerId', 'create account', 'You already have an account', { error: true, operationStatus: 'Proccess Terminated!' });
        return res.status(400).json(result);
      }

      
      // cipher bvn
      const bvn = CryptoJS.AES.encrypt(`BVN-${Math.floor(Math.random() * 1000000000000)}`, process.env['SECRET']!);

      // create account details
      const banks = [
        { bankCode: Math.floor(Math.random() * 1000000), bankName: 'Bank of America', balance: 7000000 },
        { bankCode: Math.floor(Math.random() * 1000000), bankName: 'Guarantee trust Bank', balance: 170000000 },
        { bankCode: Math.floor(Math.random() * 1000000), bankName: 'United Bank of Africa', balance: 8000000000 },
      ];
      
      // Insert to database
      const account = await Messanger.shouldInsertToDataBase(db.Accounts, { customerId, bvn, banks });

      const result: ResponseFormat = successResponse('Account Created!', 201, 'create account', { error: false, operationStatus: 'Proccess Completed!', account })
      return res.status(201).json(result);
    } catch(error) {
      const result: ResponseFormat = errorResponse(`${error.syscall || error.name || 'ServerError'}`, 500, `${error.path || 'No Field'}`, 'create account', `${error.message}`, { error: true, operationStatus: 'Proccess Terminated!', errorSpec: error });
      return res.status(500).json(result);
   }
  }
  /**
   * @HTTPverb PUT
   * @method update
   * @author DanielAdek
   * @param {object} req Request object
   * @param {object} res Response object
   * @desc Feature allows data update
   */
   protected async update(req: Request, res: Response): Promise<any> {
    try {
      const validationResult: ResponseFormat = Form.validateFields('update_account', formSchema, req.body);
      if (validationResult.error) {
        return res.status(400).json(validationResult);
      }

      const { _id: customerId }: jwtPayload = res.locals.decoded;

       // confirm user exist
      const user = await Messanger.shouldFindOneObject(db.Users, { _id: customerId });

      if (!user) {
        const result: ResponseFormat = errorResponse('RecognitionError', 400, 'customerId', 'update account', 'user not found', { error: true, operationStatus: 'Proccess Terminated!' });
        return res.status(400).json(result);
      }

      // confirm user has account
      const userAccount = await Messanger.shouldFindOneObject(db.Accounts, { customerId });
  
      if (!userAccount) {
        const result: ResponseFormat = errorResponse('RecognitionError', 400, 'customerId', 'update account', 'Account not found. Create account', { error: true, operationStatus: 'Proccess Terminated!' });
        return res.status(400).json(result);
      }

      // update balance
      let updated: boolean = false;
      for(const bank of userAccount.banks) {
        if (bank._id.equals(req.body.bankId)) {
          bank.balance += req.body.balance;
          updated = true;
        }
      }
      await userAccount.save();
 
      if (!updated) {
        const result: ResponseFormat = errorResponse('ParamsError', 400, 'invalid', 'update account', 'Bank not found', { error: true, operationStatus: 'Proccess Terminated!' });
        return res.status(400).json(result);
      }
      const result: ResponseFormat = successResponse('Account updated!', 200, 'update account', { error: false, operationStatus: 'Proccess Completed!' })
      return res.status(200).json(result);
 
    } catch(error) {
      const result: ResponseFormat = errorResponse(`${error.syscall || error.name || 'ServerError'}`, 500, `${error.path || 'No Field'}`, 'update account', `${error.message}`, { error: true, operationStatus: 'Proccess Terminated!', errorSpec: error });
      return res.status(500).json(result);
    }
  }

  /**
   * @HTTPverb GET
   * @method retreive
   * @author DanielAdek
   * @param {object} req Request object
   * @param {object} res Response object
   * @desc Feature allows retreive data from account
   */
   protected async retreive(_: Request, res: Response): Promise<any> {
    try {
      const { _id: customerId }: jwtPayload = res.locals.decoded;

      // confirm user exist
      const user = await Messanger.shouldFindOneObject(db.Users, { _id: customerId });

      if (!user) {
        const result: ResponseFormat = errorResponse('RecognitionError', 400, 'customerId', 'pay loan', 'user not found', { error: true, operationStatus: 'Proccess Terminated!' });
        return res.status(400).json(result);
      }

      // retreive user account
      const userAccount = await Messanger.shouldFindOneObject(db.Accounts, { customerId });
  
      if (!userAccount) {
        const result: ResponseFormat = successResponse('No account yet', 204, 'retreive account', { error: false, operationStatus: 'Proccess Completed!', userAccount: null })
        return res.status(200).json(result);
      }

      const result: ResponseFormat = successResponse('Account Retreived!', 200, 'retreive account', { error: false, operationStatus: 'Proccess Completed!', userAccount })
      return res.status(200).json(result);
 
    } catch(error) {
      const result: ResponseFormat = errorResponse(`${error.syscall || error.name || 'ServerError'}`, 500, `${error.path || 'No Field'}`, 'retreive account', `${error.message}`, { error: true, operationStatus: 'Proccess Terminated!', errorSpec: error });
      return res.status(500).json(result);
    }
  }

  /**
   * @HTTPverb GET
   * @method revealBvn
   * @author DanielAdek
   * @param {object} req Request object
   * @param {object} res Response object
   * @desc Feature allows reveal Bvn
   */
   protected async revealBvn(_: Request, res: Response): Promise<any> {
    try {
      const { _id: customerId }: jwtPayload = res.locals.decoded;

      // confirm user exist
      const user = await Messanger.shouldFindOneObject(db.Users, { _id: customerId });

      if (!user) {
        const result: ResponseFormat = errorResponse('RecognitionError', 400, 'customerId', 'pay loan', 'user not found', { error: true, operationStatus: 'Proccess Terminated!' });
        return res.status(400).json(result);
      }

      // retreive loan
      const userAccount = await Messanger.shouldFindOneObject(db.Accounts, { customerId });
  
      if (!userAccount) {
        const result: ResponseFormat = successResponse('No account yet', 204, 'retreive account', { error: false, operationStatus: 'Proccess Completed!', userAccount: null })
        return res.status(200).json(result);
      }

      const bvn = Utils.decryptData(userAccount.bvn);

      const result: ResponseFormat = successResponse('Account Retreived!', 200, 'retreive account', { error: false, operationStatus: 'Proccess Completed!', bvn })
      return res.status(200).json(result);
 
    } catch(error) {
      const result: ResponseFormat = errorResponse(`${error.syscall || error.name || 'ServerError'}`, 500, `${error.path || 'No Field'}`, 'retreive account', `${error.message}`, { error: true, operationStatus: 'Proccess Terminated!', errorSpec: error });
      return res.status(500).json(result);
    }
  }
};