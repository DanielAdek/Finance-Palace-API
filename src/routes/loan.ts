import { Router } from "express";
import { Loan } from "@controllers/loan";
import { verifyToken } from '@modules/middleware/auth';

class LoanRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }
		
  private routes = () => {
    this.router.post('/request', verifyToken, Loan.prototype.requestLoan);
    this.router.post('/pay', verifyToken, Loan.prototype.payLoan);
    this.router.post('/retreive', verifyToken, new Loan().retreiveLoan);
  }
}
export default new LoanRoutes();