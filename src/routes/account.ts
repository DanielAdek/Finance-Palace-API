import { Router } from "express";
import { Account } from "@controllers/account";
import { verifyToken } from '@modules/middleware/auth';

/**
 * @class AccountRoutes
 */
class AccountRoutes extends Account {
  public router: Router;

  constructor() {
    super()
    this.router = Router();
    this.routes();
  }
		
  private routes = () => {
    this.router.post('/create', verifyToken, this.create);
    this.router.get('/retrieve', verifyToken, this.retreive);
    this.router.put('/update', verifyToken, this.update);
    this.router.get('/bvn/reveal', verifyToken, this.revealBvn);
  }
}
export default new AccountRoutes();