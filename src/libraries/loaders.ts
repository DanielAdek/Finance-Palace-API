import { RequestHandler} from "express";
import Utils from "./utils"

/** Save host from request to use throughout app */
export const saveHost: RequestHandler = (req, res, next) => {
  if(!(saveHost as any).host) {
	let host = Utils.host(req);
	(saveHost as any).host = host;
  }
  next();
}

export const getHost = (): string => {
  let host: string = (saveHost as any).host;
  return host;
}