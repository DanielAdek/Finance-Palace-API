import { Router } from "express";
import { User } from "@controllers/user";
import { verifyToken } from '@modules/middleware/auth';

class UserRoutes extends User {
  public router: Router;

  constructor() {
    super();
    this.router = Router();
    this.routes();
  }
		
  private routes = () => {
    this.router.get('/', verifyToken, this.loggedInUser);
    this.router.post('/register', this.onboardUser);
    this.router.post('/login', this.login);
    this.router.put('/update', verifyToken, this.updateProfile);
  }
}
export default new UserRoutes();