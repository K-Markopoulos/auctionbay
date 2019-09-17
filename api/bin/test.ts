import * as mongoose from 'mongoose';
import Recommender from '../common/recommender';
import User, { UserSchema } from '../models/user';

// Connect to the database.
const auth = process.env.MONGODB_USER || process.env.MONGODB_PASSWORD ?
  `${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@` : '';
const host = process.env.MONGODB_HOST;
const port = process.env.MONGODB_PORT;
const name = !module.parent
  ? process.env.MONGODB_NAME
  : process.env.MONGODB_NAME + 'test';
const uriwa = `mongodb://${host}:${port}/${name}`;
const uri = `mongodb://${auth}${host}:${port}/${name}`;

mongoose.connect(uri, {
  keepAlive: true,
  useNewUrlParser: true
}).then(() => {
  console.info(`System connected to the database @ ${uriwa}.`);
}).then(async () => {
  await Recommender.initialize();
  return User.find({},'_id username').then(users => {
    users.forEach(user => {
      console.log('\nRecommended items for ', user.username)
      const recommended = Recommender.recommend(user._id.toString(), 10);
      console.log(recommended);
    })
  })
}).then(() => {
  console.log('Done');
  process.exit();
}).catch((error) => {
  console.error(`System failed to connect to the database @ ${uriwa}.`, error);
  process.exit();
});
