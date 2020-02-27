import { model, Document, Types, Schema, Model } from "mongoose";

export interface Loan extends Document {
  customerId?: string,
  amount: number,
  deadline: Date,
  outstandingDays?: number,
  totalAmountPayable?: number,
  loanPaid?: boolean,
  bank?: string
}

export interface ILoan extends Model<Loan> {}

const LoanSchema = new Schema({
  customerId: { 
    type: Types.ObjectId,
    ref: 'User'
  },
  amount: { type: Number, default: 0 },
  deadline: Date,
  outstandingDays: { type: Number, default: 0 },
  totalAmountPayable: { type: Number, default: 0 },
  loanPaid: { type: Boolean, default: false },
  bank: String
},
{
  timestamps: true
});

const Loan = <ILoan>model("Loan", LoanSchema);

export default Loan;