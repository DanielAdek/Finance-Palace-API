import { default as express, Request, Response, NextFunction } from "express";
import cors from "cors";
import util from "util";
import moment from "moment";
import bodyParser from "body-parser";
import jsend from 'jsend';
import errorHandler from "errorhandler";
import Routes from "@routes/index";
import logger from "@modules/util/logger";
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
		
		APPLICATION.config();
		
		APPLICATION.starter();
		
		APPLICATION.routes();
		
		APPLICATION.all();

		APPLICATION.handleError();
	};

	private config = (): void => {
		const { app: APPLICATION } = this;

		// SAVE HOST
		APPLICATION.use(saveHost);

		APPLICATION.set("json spaces", 4);
		
		// TRUST REVERSE PROXY
		APPLICATION.set("trust proxy", true);
		
		// USE MIDDLEWARES
		APPLICATION.use(cors());
		APPLICATION.use(jsend.middleware);
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
		 
		  console.info("  **Press CTRL + C to stop**");
		});
		
	  };

	private routes = () => {
		const { app: APPLICATION } = this;

		APPLICATION.use('/api/v1', Routes.router);
	}

	private all = () => {
		const { app: APPLICATION } = this;

		APPLICATION.use('/*', (req: Request, res: Response) => {
			const result: ResponseFormat = errorResponse('Route', 404, `${req.originalUrl}`, `${req.method}`, 'Route not found', { operationStatus: 'Operation Terminated'});
			return res.status(404).jsend.fail(result)
		});
	}

	private handleError = () => {
		const { app: APPLICATION } = this;
		return APPLICATION.use((err: any, _: Request, res: Response, _2: NextFunction) => {
			const data: ResponseFormat = errorResponse('', 500, '', '', `${err.message}`, { operationStatus: 'Operation Terminated'});
			logger.error(util.inspect(err, true, 5));
			if (!res.headersSent) return res.status(500).jsend.fail(data);
		});
	};

	private starter = () => {
		const { app: APPLICATION } = this;
		const details = { operationStatus: 'Operation Successful!', app_start };
		APPLICATION.get('/', (_, res: Response) => {
			const result: ResponseFormat = successResponse('Success!', 200, 'Finance Palace is up and running', details)
			return res.status(200).jsend.success(result);
		});
	}
}

export default new ExpressServer(express());