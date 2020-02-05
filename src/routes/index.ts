import { default as express, Request, Response, Router } from "express";
import bearer from "express-bearer-token";
import UserRoute from '@routes/user';

class Routes {
	public router: Router;

	constructor() {
		this.router = Router();
		this.config();
		this.applicationRoute();
	}
		
	private config = () => {
		const { router: API } = this;
		API.use(bearer());
	}

	public applicationRoute = () => {
	  this.router.use('/user', UserRoute.router)
	}
};
const routes = new Routes();
export default routes;