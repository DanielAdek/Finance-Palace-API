import { model, Document, Types, Schema, Model } from "mongoose";

export interface AccountObject {
  _id?: string,
  bankCode: number,
  bankName: string,
  balance: number
}

export interface Account extends Model<Document> {
  customerId: string,
  bank: AccountObject[]
}

const AccountSchema = new Schema({
  customerId: { type: Types.ObjectId, ref: 'User'},
  banks: [{ bankCode: Number, bankName: String, balance: Number}]
},
{
  timestamps: true
});

const Account = model("Account", AccountSchema);

export default Account;