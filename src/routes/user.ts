import { Router } from "express";
import User from "@controllers/user";

class UserRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }
		
  private routes = () => {
    this.router.post('/', User.loggedInUser);
    this.router.post('/register', User.onboardUser);
    this.router.post('/login', User.login);
    this.router.put('/update', User.updateProfile);
  }
}
export default new UserRoutes();