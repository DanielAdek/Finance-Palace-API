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
      for(let loan of loans) {
        if (loan.deadline > today) {
          const outstandingDays = calculateDateDifference(today, loan.deadline);
          let newAmout = outstandingDays * 1000;
          loan.totalAmountPayable! += newAmout;
        }
        await loan.save();
      }
    }
  } catch(error) {
    const result: ResponseFormat = errorResponse(`${error.syscall || error.name || 'ServerError'}`, 500, `${error.path || 'No Field'}`, 'update loan. Cron-Job function', `${error.message}`, { error: true, operationStatus: 'Proccess Terminated!', errorSpec: error });
    console.log(result);
  }
}

cron.schedule("0 0 0 * * *", () => {
  console.log("********************");
  console.log("* Running Cron Job *");
  console.log("********************");
  updateLoanCollection() 
}).start();

Application.initialize();

export default Application;