import  mongoose from "mongoose";
import bcrypt from "bcrypt-nodejs";

type comparePasswordType = ( this: UserModel, password: string ) => Promise<boolean>;

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

export interface UserModel extends User, Login, mongoose.Document {
  comparePassword: comparePasswordType
}

export interface IUserModel extends mongoose.Model<UserModel> {}

const UserSchema = new mongoose.Schema({
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

const comparePassword: comparePasswordType = async function(this: UserModel, password: string){
  const user = this;
  const compare = await bcrypt.compareSync(password, user.password);
  return compare;
}

UserSchema.methods.comparePassword = comparePassword;

UserSchema.methods.toJSON = function () {
  const _user = this.toObject();
  delete _user.password;
  return _user;
};

const User = <IUserModel> mongoose.model("User", UserSchema);

export default User;