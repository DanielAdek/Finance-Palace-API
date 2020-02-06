import { config } from 'dotenv';
import JWT from 'jsonwebtoken';
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