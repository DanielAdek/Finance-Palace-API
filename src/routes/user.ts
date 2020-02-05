import { Router } from "express";
import User from "@controllers/user";
import { verifyToken } from '@modules/middleware/auth';

class UserRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }
		
  private routes = () => {
    this.router.get('/', verifyToken, User.loggedInUser);
    this.router.post('/register', User.onboardUser);
    this.router.post('/login', User.login);
    this.router.put('/update', verifyToken, User.updateProfile);
  }
}
export default new UserRoutes();