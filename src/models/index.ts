import mongoose from 'mongoose';
import { config } from 'dotenv';
import Users from '@models/users';
import Loans from '@models/loan';
import Accounts from '@models/account';

config();

const options = {
  keepAlive: true,
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  socketTimeoutMS: 999999999,
  connectTimeoutMS: 3000,
};

mongoose
  .connect(
    (process.env.MONGODB_URI! || process.env['MONGODB_URI_LOCAL']!),
    options
  )
  .then(() => {
    console.log('Mongodb connected!');
  });

if (process.env.NODE_ENV === 'development') {
  mongoose.set('debug', true);
} else {
  mongoose.set('debug', false);
}
mongoose.connection.on('error', (err: any) => {
  console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});

export default {
  Users, Loans, Accounts
};
