import { model, Document, Types, Schema, Model } from "mongoose";

export interface AccountObject {
  _id?: string;
  bankCode: number;
  bankName: string;
  balance: number;
}

export interface Account extends Document {
  customerId: string;
}

export interface IAccount extends Model<Account> {
  banks: AccountObject[];
  bvn: string | any;
}

const AccountSchema = new Schema({
  customerId: { type: Types.ObjectId, ref: 'User'},
  bvn: String,
  banks: [{ bankCode: Number, bankName: String, balance: Number}]
},
{
  timestamps: true
});

AccountSchema.index({ customerId: 1 }, { unique: true });

const Account = <IAccount>model("Account", AccountSchema);

export default Account;