import { default as express, Request, Response, Router } from "express";
import bearer from "express-bearer-token";
import UserRoute from '@routes/user';
import LoanRoute from '@routes/loan';
import AccountRoute from '@routes/account';

class Routes {
	public router: Router;

	constructor() {
		this.router = Router();
		this.config();
		this.applicationRoutes();
	}
		
	private config = () => {
		const { router: API } = this;
		API.use(bearer());
	}

	public applicationRoutes = () => {
	  this.router.use('/user', UserRoute.router);
	  this.router.use('/loan', LoanRoute.router);
	  this.router.use('/account', AccountRoute.router);
	}
};
const routes = new Routes();
export default routes;