require('module-alias/register');
import cron from 'node-cron';
import db from '@models/index';
import { calculateDateDifference } from '@helpers/index';
import { ResponseFormat, errorResponse } from '@modules/util/mSender';
import Application from '@modules/server';

const updateLoanCollection = async (): Promise<void> => {
  try {
    const loans = await db.Loans.find({ loanPaid: false });
    if (loans.length) {
      const today = new Date();
      let totalAmountPayable: number = 0;
      for(const loan of loans) {
        if (loan.deadline < today) {
          const outstandingDays = calculateDateDifference(today, loan.deadline);
          totalAmountPayable = (outstandingDays * 1000) + loan.amount;
        }
        loan.totalAmountPayable = totalAmountPayable;
        await loan.save();
      }
    }
  } catch(error) {
    const result: ResponseFormat = errorResponse(`${error.syscall || error.name || 'ServerError'}`, 500, `${error.path || 'No Field'}`, 'update loan. Cron-Job function', `${error.message}`, { error: true, operationStatus: 'Proccess Terminated!', errorSpec: error });
    console.log(result);
  }
}

cron.schedule("59 59 23 * * *", async () => {
  console.log("********************");
  console.log("* Running Cron Job *");
  console.log("********************");
  await updateLoanCollection() 
});

Application.initialize();

export default Application;