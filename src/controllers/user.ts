import { RequestHandler } from 'express';
import { Form } from 'form-my-simple-validation';
import { ResponseFormat, successResponse, errorResponse } from '@modules/util/mSender';
import { isPhoneNumber } from '@modules/validation/lib/regex';
import { formSchema } from '@modules/validation/formSchema';
import * as Messanger from '@helpers/messanger';
import * as Utils from '@helpers/index';
import db from '@models/index';

/**
 * @class Users
 */
class User {
  /**
   * @method onboardUser
   * @desc Feature create user account
   * @author DanielAdek
   * @param {object} req Request object
   * @param {object} res Response object
   * @returns {object} Json data
   */
   static onboardUser: RequestHandler = async (req, res): Promise<any> => {
     try {
       const validationResult: ResponseFormat = Form.validateFields('onboard', formSchema, req.body);
       if (validationResult.error) {
         return res.status(400).json(validationResult);
       }
       const foundUser = await Messanger.shouldFindOneObject(db.Users, { email: req.body.email });
   
       if (foundUser) {
         const result: ResponseFormat = errorResponse('DuplicateKeyError', 400, 'email', 'Onboard', 'Email Already In Use', { error: true, operationStatus: 'Proccess Terminated!' });
         return res.status(400).json(result);
       }
   
       const user = await Messanger.shouldInsertToDataBase(db.Users, req.body);

       const token = Utils.generateToken('8760h', { _id: user._id });

       const result: ResponseFormat = successResponse('Registration Successfull', 201, 'Onboard User', { error: false, operationStatus: 'Proccess Completed!', user, token })
       return res.status(201).json(result);
    } catch (error) {
       const result: ResponseFormat = errorResponse(`${error.syscall || error.name || 'ServerError'}`, 500, `${error.path || 'No Field'}`, 'Onboard', `${error.message}`, { error: true, operationStatus: 'Proccess Terminated!', errorSpec: error });
       return res.status(500).json(result);
    }
  }

  /**
   * @method login
   * @desc Feature create user account
   * @author DanielAdek
   * @param {object} req Request object
   * @param {object} res Response object
   * @returns {object} Json data
   */
   static login: RequestHandler = async (req, res) => {
     try {
       const validationResult: ResponseFormat = Form.validateFields('authenticate', formSchema, req.body);
       if (validationResult.error) {
         return res.status(400).json(validationResult)
       }
       let user = null;
       const isPhone = isPhoneNumber(req.body.dataField);
   
       // QUERY DATABASE
       if (!isPhone) {
         user = await Messanger.shouldFindOneObject(db.Users, { email: req.body.dataField });
       } else {
         user = await Messanger.shouldFindOneObject(db.Users, { phoneNumber: req.body.dataField });
       }
   
       if (user) {
         const passwordMatch = await user.comparePassword(req.body.password);
   
         if (!passwordMatch) {
          const result: ResponseFormat = errorResponse('AuthenticationError', 401, 'password', 'Authenticate user', 'Password Incorrect!', { error: true, operationStatus: 'Process Terminated', user: null });
          return res.status(401).json(result);
         }
   
         const token = Utils.generateToken('8760h', { _id: user._id });
   
        const result: ResponseFormat = successResponse('Authenticaton Successfull', 200, 'Authenticate user', { error: false, operationStatus: 'Process Completed', user, token });
        return res.status(200).json(result);
       }
       
       const result: ResponseFormat = errorResponse('Authentication Error', 400, 'Email/Phone Number', 'Authenticate user', `${isPhone ? 'The phone number you provide is not found!' : 'The email you provide is not found!'}`, { error: true, operationStatus: 'Process Terminated', user: null });
       return res.status(400).json(result);
    } catch (error) {
       const result: ResponseFormat = errorResponse(`${error.syscall || error.name || 'ServerError'}`, 500, `${error.path || 'No Field'}`, 'Onboard', `${error.message}`, { error: true, operationStatus: 'Proccess Terminated!', errorSpec: error });
       return res.status(500).json(result);
    }
  }
}

export default User;