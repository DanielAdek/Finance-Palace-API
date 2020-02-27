import { Request } from "express";
import m_ from "minified-headless";
// import randomstring from "randomstring"
// import validate from "validate.js";
import * as secrets from "@modules/util/secrets";

const Utils = {

	/**
	 * Check if a value is empty
	 */
	// empty(value: any): boolean {
	// 	return validate.isEmpty(value);
	// },

	/**
	 * Return an object or null if no fields exists
	 */
	// objOrNull(obj: any): any|null {
	// 	if(this.empty(obj)) return null;
	// 	else return obj;
	// },

	/** 
	 * Exclude certain fields from object, returns new object without exclude fields
	 */
	blackFields(obj: any, fields: Array<string>): any {
		return m_.filterObj(obj, (key: string, value: any) => {
			return !m_.contains(fields, key);
		}, null);
	},

	/** 
	 * Return new object with keys that are in fields 
	 */
	whiteFields(obj: any, fields: Array<string>): any {
		return m_.filterObj(obj, (key: string, value: any) => {
			return m_.contains(fields, key);
		}, null);
	},

	/**
	 * Check if object has certain keys
	 */
	hasKeys(obj: any, keys: Array<string>): boolean {
		const l = keys.length;
		for(let i = 0; i < l; ++i) {
			if(!(keys[i] in obj)) return false;
		}
		return true;
	},

	/**
	 * Check if a value is numeric
	 */
	isNumeric(value: any): boolean {
		return !isNaN(parseFloat(value)) && isFinite(value);
	},

	/** 
	 * Check if application is live
	 */
	isLive(): boolean {
		return secrets.ENVIRONMENT !== "development";
	},

	/**
	 * Remove non printable characters from string and trim
	 */
	removeNonPrint(str: string, trim: boolean = true): string {
		str = str.toString().replace(/[^\x20-\x7E]+/g, "");
		return trim? str.trim() : str;
	},

	/**
	 * Get random number between two numbers
	 */
	rand(a: number, b: number): number {
		return parseInt((Math.abs(a-b) * Math.random()).toString())+Math.min(a,b);
	},

	/** Check if a string is an email */
	// isEmail(str: string): boolean {
	// 	if(validate.single(str, {presence: true, email: true})) return false;
	// 	else return true;
	// },

	/** Generate uuid */
	// uuid(): string {
	// 	let raw = randomstring.generate({
	// 		length: 32,
	// 		charset: "hex"
	// 	});
	// 	let uuid = raw.substring(0, 8) + '-' + raw.substring(8, 12) + '-'
	// 		+ raw.substring(12, 16) + '-' + raw.substring(16, 20) + '-' + raw.substring(20);
	// 	return uuid;
	// },

	/** Get full host for current request */
	host(req: Request): string {
		// var scheme = (this.isLive()? 'https' : req.protocol)+"://";
		// var hostname = req.get("X-Forwarded-Host") || req.get("Host");
		let hostname = req.get("Host");
		let scheme = req.protocol;
		return scheme+"://"+hostname;
	},
};


export default Utils;