import { RequestHandler } from 'express';
import { config } from 'dotenv';
import * as JWT from 'jsonwebtoken';
import { ResponseFormat, errorResponse } from '@modules/util/mSender';

config();

const secret: string = process.env['SECRET']!;

export const verifyToken: RequestHandler = (req, res, next) => {
  try {
    let tokenBearer: string = req.headers.authorization!;

    if (!tokenBearer) return res.status(403).json(errorResponse('EACCES', 403, 'headers:{Authorization}', 'Authorize user', 'Client key is required. Access Denied!', { error: true, operationStatus: 'Processs Terminated!' }));

    const token: string = tokenBearer.split(' ')[1];

    JWT.verify(token, secret, (err, decoded) => {
      if (err) {
        const result: ResponseFormat = errorResponse('EACCES', 403, 'headers:{Authorization}', 'Authorize user', 'Client key is invalid. Access Denied!', { error: true, operationStatus: 'Processs Terminated!' });
        return res.status(403).json(result);
      }
      res.locals.decoded = decoded;  
      next();
    });
  } catch (error) {
    const result: ResponseFormat = errorResponse(`${error.syscall || error.name || 'ServerError'}`, 500, `${error.path || 'No Field'}`, 'Authorization', `${error.message}`, { error: true, operationStatus: 'Processs Terminated!', errorSpec: error });
    return res.status(500).json(result);
  }
}