import { Request } from 'express';
import { config } from 'dotenv';
import CryptoJS from 'crypto-js';
import JWT from 'jsonwebtoken';
import { errorResponse } from '@modules/util/mSender';
import { jwtPayload } from '@models/users';

config();
const secret: string = process.env['SECRET']!;

/**
 * @desc GENERATE TOKEN FOR AUTHORIZATION
 * @param {String} time THE EXPIRY TIME
 * @param {object} payload THE DATA TO BE CONTAINED IN THE TOKEN
 * @returns {String} JSON
 */
export const generateToken = (time: string, payload: jwtPayload) => (`Bearer ${JWT.sign(payload, secret, { expiresIn: time })}`);

/**
 * @desc CALCULATE THREE MONTH DATE
 * @returns {String} date-string
 */
export const threeMonthsAfter = (date: Date): string => {
  const today = new Date(date);
  today.setMonth(today.getMonth() + 3);
  return today.toLocaleDateString();
}


export const calculateDateDifference = function(date1: Date, date2: Date) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.floor((utc2 - utc1) / msPerDay);
};

export const decryptData = (ciphertext: string): string => {
  const bytes  = CryptoJS.AES.decrypt(ciphertext.toString(), process.env['SECRET']!);
  const plain_text = bytes.toString(CryptoJS.enc.Utf8);
  return plain_text;
}

interface PlatformResponse {
  isAllowed: boolean;
  error?: any;
}
export const allowOnlyBrowsers = (req: Request): PlatformResponse => {
  const platform: string[] = req.headers['user-agent']!.split('/');
  if (!platform.includes('Mozilla')) {
    const error = errorResponse('PlatformError', 400, '', 'platform', `This endpoint requires a browser`, { error: true, operationStatus: 'Process Terminated!', "plaform-detected": `${platform[0]}`, "platform-required": 'browser' });
    return { isAllowed: false, error }
  }
  return { isAllowed: true }
}