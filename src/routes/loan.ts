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
    this.router.put('/pay', verifyToken, Loan.prototype.payLoan);
    this.router.get('/retreive', verifyToken, Loan.prototype.retreiveLoan);
  }
}
export default new LoanRoutes();