import { Router } from "express";
import User from "@controllers/user";

class UserRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }
		
  private routes = () => {
    this.router.post('/register', User.onboardUser);

    this.router.post('/login', User.login);
  }
}
export default new UserRoutes();