import { Request, Response, NextFunction } from "express";
import Utils from "./utils"

/** Save host from request to use throughout app */
export function saveHost(req: Request, res: Response, next: NextFunction) {
  if(!(saveHost as any).host) {
	let host = Utils.host(req);
	(saveHost as any).host = host;
  }
  next();
}

export function getHost(): string {
  let host: string = (saveHost as any).host;
  return host;
}