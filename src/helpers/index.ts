import { config } from 'dotenv';
import JWT from 'jsonwebtoken';
import { jwtPayload } from '../modals/users';

config();
const secret: string = process.env['SECRET'];

export const connectOpt = {
  autoReconnect: true,
  connectTimeoutMS: 3000,
  useUnifiedTopology: true,
  socketTimeoutMS: 999999999,
};


/**
 * @desc GENERATE TOKEN FOR AUTHORIZATION
 * @param {String} time THE EXPIRY TIME
 * @param {object} payload THE DATA TO BE CONTAINED IN THE TOKEN
 * @returns {String} JSON
 */
export const generateToken = (time: string, payload: jwtPayload) => (`Bearer ${JWT.sign(payload, secret, { expiresIn: time })}`);