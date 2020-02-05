import { model, Document, Model, Schema } from "mongoose";
import bcrypt from "bcrypt-nodejs";

type ComparePasswordType = ( this: UserModel, password: string ) => Promise<boolean>;

export interface User {
  firstName?: string,
  lastName?: string,
  avatar?: string,
  city?: string,
  state?: string,
  dob?: string,
  email?: string,
  phoneNumber?: any
}

export interface Login {
  dataField?: string,
  password: string
}

export interface jwtPayload {
  _id: string
}

export interface UserModel extends User, Login, Document {
  comparePassword: ComparePasswordType
}

export interface IUserModel extends Model<UserModel> {}

const UserSchema = new Schema({
  firstName: String,
  lastName: String,
  avatar: String,
  city: String,
  state: String,
  dob: String,
  email: String,
  password: String,
  phoneNumber: String
},
{
  timestamps: true
})

UserSchema.index({ email: 1 }, { unique: true });

UserSchema.pre("save", function save(this: UserModel){
  this.password = bcrypt.hashSync(this.password);
  return;
})

const comparePassword: ComparePasswordType = async function(this: UserModel, password: string){
  const user = this;
  const compare = await bcrypt.compareSync(password, user.password);
  return compare;
}

UserSchema.methods.comparePassword = comparePassword;

UserSchema.statics.loggedInUser = async function(id: string): Promise<UserModel> {
  return await this.findById(id)
}
UserSchema.methods.toJSON = function () {
  const _user = this.toObject();
  delete _user.password;
  return _user;
};

const User = <IUserModel>model("User", UserSchema);

export default User;