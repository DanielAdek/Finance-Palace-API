import logger from "@modules/util/logger";
import dotenv from "dotenv";
import fs from "fs";

if (fs.existsSync(__dirname+"/../../.env")) {
	// logger.debug("Using .env file to supply config environment variables");
	dotenv.config({ path: __dirname+"/../../.env" });
} else {
	// logger.debug("Using .env.example file to supply config environment variables");
	dotenv.config({ path: __dirname+"/../../.env.example" });  // you can delete this after you create your own .env file!
}

export const ENVIRONMENT = process.env["NODE_ENV"];

const prod = ENVIRONMENT === "production"; // Anything else is treated as 'dev'

export const MONGODB_URI = prod ? process.env["MONGODB_URI"] : process.env["MONGODB_URI_LOCAL"];

if (!MONGODB_URI) {
	logger.error("No mongo connection string. Set MONGODB_URI environment variable.");
	process.exit(1);
}