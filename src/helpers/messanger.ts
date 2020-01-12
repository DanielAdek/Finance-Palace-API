import { Model } from 'mongoose';

interface body { id?: any, data: object }

/**
 * @desc CREATE FEATURE
 * @param {Document} database DATA-BASE TO RECEIVE DATA
 * @param {object} requestBody THE REQUEST BODY TO BE INSERTED
 * @param {object} data DATA FOR USER
 * @returns {object} JSON
 */
export const shouldInsertToDataBase = (database: Model<any>, requestBody: object) => database.create(requestBody);

/**
 * @desc FIND FROM DB
 * @param {Document} database DATA-BASE TO RECEIVE DATA
 * @param {object} requestBody THE REQUEST BODY TO BE USED
 * @returns {object} JSON
 */
export const shouldFindOneObject = (database: Model<any>, requestBody: object) => database.findOne(requestBody);

/**
 * @desc FIND FROM DB
 * @param {Document} database DATA-BASE TO RECEIVE DATA
 * @param {object} requestBody THE REQUEST BODY TO BE USED
 * @returns {object} JSON
 */
export const shouldFindObjects = (database: Model<any>, requestBody: object, projection: any) => database.find(requestBody, projection);

/**
 * @desc FIND AND UPDATE
 * @param {Document} database DATA-BASE TO RECEIVE DATA
 * @param {object} requestBody THE REQUEST BODY TO BE USED
 * @returns {object} JSON
 */
export const shouldEditOneObject = (database: Model<any>, requestBody: body) => database.findByIdAndUpdate(requestBody.id, requestBody.data);

/**
 * @desc FIND AND UPDATE
 * @param {Document} database DATA-BASE TO RECEIVE DATA
 * @param {object} requestBody THE REQUEST BODY TO BE USED
 * @returns {object} JSON
 */
export const shouldDeleteOneObject = (database: Model<any>, requestBody: body) => database.findByIdAndRemove(requestBody.id);

/**
 * @desc INSERT MANY OBJECTS TO DATA-BASE
 * @param {Document} database DATA-BASE TO RECEIVE DATA
 * @param {object} requestBody THE REQUEST BODY TO BE USED
 * @returns {object} JSON
 */
export const shouldInsertOneOrMoreObjects = (database: Model<any>, requestBody: object) => {
  if (Array.isArray(requestBody)) {
    // eslint-disable-next-line no-restricted-syntax
    for (const object of requestBody) {
      database.create(object);
    }
  } else {
    database.create(requestBody);
  }
};

/**
 * @desc INSERT OR UPDATE DATA
 * @param {Document} database DATA-BASE TO RECEIVE DATA
 * @param {object} requestBody THE REQUEST BODY TO BE USED
 * @returns {object} JSON
 */
export const shouldInsertOrUpdateObject = async (database: Model<any>, requestBody: body) => {
  const foundObject = await database.findById(requestBody.id);
  if (foundObject) {
    return database.findByIdAndUpdate(requestBody.id, requestBody.data);
  }
  return database.create(requestBody.data);
};
