import { default as express, Request, Response, NextFunction } from "express";
import cors from "cors";
import util from "util";
import moment from "moment";
import mongoose from "mongoose";
import bluebird from "bluebird";
import bodyParser from "body-parser";
import errorHandler from "errorhandler";
import Routes from "@routes/index";
import logger from "./util/logger";
import { connectOpt } from '@helpers/index';
import { MONGODB_URI } from "./util/secrets";
import { saveHost } from "@modules/libraries/loaders";
import { ResponseFormat, errorResponse, successResponse } from '@modules/util/mSender';

require('express-async-errors');
const app_start = moment().unix();

/**
 * @desc Start Express server.
 * @class Server
 * @returns void
 */

class ExpressServer {
	constructor(private app: express.Application) {
		const APPLICATION = this;

		APPLICATION.app = app;

		APPLICATION.mongo();
		
		APPLICATION.config();
		
		APPLICATION.routes();
		
		APPLICATION.starter();

		APPLICATION.handleError();
	};

	private config = (): void => {
		const { app: APPLICATION } = this;
		// APP USE CORS
		APPLICATION.use(cors());

		// SAVE HOST
		APPLICATION.use(saveHost);

		APPLICATION.set("json spaces", 4);

		// TRUST REVERSE PROXY
		APPLICATION.set("trust proxy", true);

		// USE BODYPASER TO PARSE JSON
		APPLICATION.use(bodyParser.json());
		APPLICATION.use(bodyParser.urlencoded({ extended: true }));

		// SET APPLICATION PORT
		APPLICATION.set("port", parseInt(process.env.PORT!, 10));

		// ERROR HANDLER
		APPLICATION.use(errorHandler());
	};

	public initialize = (): void => {
		const { app: APPLICATION } = this;

		const message = "  App is running at http://localhost:%d in %s mode";
		  
		 APPLICATION.listen(APPLICATION.get('port'), () => {
		 
		  console.info(message, APPLICATION.get("port"), APPLICATION.get("env"));
		 
		  logger.info("  Press CTRL-C to stop\n");
		});
		
	  };

	private mongo = (): any => {
		const connection = mongoose.connection;
		(<any>mongoose).Promise = bluebird;

		mongoose.set('useCreateIndex', true);

		mongoose.set('useFindAndModify', false);

		mongoose.set('useNewUrlParser', true);

		connection.on("connected", () => {
			console.info('Connection Status: Successful');
		});

		connection.on('reconnected', () => {
			setTimeout(() => console.info('Connection Status: Reconnected'), 10000);
		});

		connection.on('disconnected', () => {
			console.error('Connection Status: Disconnected');

			setTimeout(() => console.info('Trying To Reconnect to DataStore'), 2000);
			
			setTimeout(() => mongoose.connect(MONGODB_URI!, connectOpt), 5000);
		});
		
		connection.on('close', () => {
			console.info('Connection Status: Closed');
		});

		connection.on('error', (error: Error) => {
			logger.error(`Connection Status: Error ${error}`);
		});

		const run = async (): Promise<void> => {
			await mongoose.connect(MONGODB_URI!, connectOpt);
		};
		run().catch((error: Error) => {
			logger.error(`Connection Status: Error ${error}`);
		});
	};

	private routes = () => {
		const { app: APPLICATION } = this;

		APPLICATION.use('/api/v1', Routes.router);
	}

	private handleError = () => {
		const { app: APPLICATION } = this;
		return APPLICATION.use((err: any, _: Request, res: Response, _2: NextFunction) => {
			const data: ResponseFormat = errorResponse('', 500, '', '', `${err.message}`, { operationStatus: 'Operation Terminated'});
			logger.error(util.inspect(err, true, 5));
			if (!res.headersSent) return res.status(500).json(data);
		});
	};

	private starter = () => {
		const { app: APPLICATION } = this;
		const details = { operationStatus: 'Operation Successful!', app_start };
		APPLICATION.get('/', (_, res: Response) => {
			const data: ResponseFormat = successResponse('', 200, 'Application is up and running', details)
			return res.status(200).json(data);
		});
	}
}

export default new ExpressServer(express());