import enums = require('../models/enums');
import Auction from '../models/auction';
import Activity, { IActivity } from '../models/activity';

const randomProjections = [];
let matrix = {};
let users = [];
const userHashes = new Map();
const hashTable = {};

const createMatrix = async () => {
  const auctionsIds = await Auction.find({}, '_id').exec();
  const auctions = {};
  auctionsIds.forEach(x => auctions[x._id] = 0);

  return Activity.aggregate([
    { 
      $group: {
        _id: '$user',
        items: { $push: '$$CURRENT' },
      }
    },
  ]).then(res => {
    let data = [];
    res.forEach(user => {
      data[user._id] = {
        [enums.Activities.VISIT]: Object.assign({}, auctions),
        [enums.Activities.BID]: Object.assign({}, auctions)
      };
      user.items.forEach(item => {
        data[user._id][item.type][item._id] = item.count
      })
    });
    console.log(data);
    return data;
  })
};

const initialize = async (reset: boolean = true) => {
  if (reset) {
    matrix = await createMatrix();
    users = Object.keys(matrix);
    createRandomProjections(10, getFeatureSize(users, matrix));
  }

  users.forEach(user => {
    const hash = getLSHash(user);
    userHashes.set(user, hash);
    hashTable[hash] = hashTable[hash] || [];
    hashTable[hash].push(user);
    console.log('User ', user, ' - ', hash);
  })
  console.log('Hash table buckets: ', Object.keys(hashTable));
};

const insertActivity = (user:string, item:string, activity: number) => {
  const prevHash = userHashes[user];
  matrix[user][activity][item] += 1;
  const hash = getLSHash(user);

  if (hash !== prevHash) {
    // update hash tables
    userHashes.set(user, hash);
    hashTable[hash] = hashTable[hash] || [];
    hashTable[hash].push(user);
    hashTable[prevHash].filter(u => u !== user);
  }

  // Recalculate on every activity entry?
  // initialize(false);
};

const insertItem = (item: string) => {
  users.forEach(user => {
    matrix[user][enums.Activities.BID][item] = 0;
    matrix[user][enums.Activities.VISIT][item] = 0;
  });
}

const recommend = (user: string, N: number) => {
  if (!matrix[user]) {
    console.log('No activity found for user ', user);
    return [];
  }
  const hash = getLSHash(user);
  const similarUsers = hashTable[hash];
  let recommended = [];

  if (!similarUsers) {
    console.log('No similar users found for', user);
    return [];
  }
  console.log('Similar users: ', similarUsers);

  const rankedNeighbors = similarUsers.map(u => {
    return {
      user: u,
      rank: angularSimilarity(itemsOf(user), itemsOf(u))
    }
  }).sort((a, b) => b.rank - a.rank).map(u => u.user);

  for(let u of rankedNeighbors) {
    Object.keys(matrix[u][enums.Activities.BID])
      .filter(item => matrix[u][enums.Activities.BID][item] && !matrix[user][enums.Activities.BID][item])
      .map(item => { return { item: item, count: matrix[u][enums.Activities.BID][item] }})
      .sort((a,b) => b.count - a.count)
      .forEach(item => recommended.push(item.item))
    if (recommend.length > N) break;
  }
  return recommended.slice(0, N);
}

const itemsOf = (user: string, activity: number = -1) => {
  if (activity === -1) {
    let userStats = Object.values(matrix[user][enums.Activities.BID]) as number[];
    if (!userStats.filter(x => x).length) {
      userStats = Object.values(matrix[user][enums.Activities.VISIT]) as number[];
    }
    return userStats;
  }
  
  return Object.values(matrix[user][activity]) as number[];
};

const getFeatureSize = (users, matrix) => {
  return Object.keys(matrix[users[0]]['1']).length;
};

const createRandomProjections = (k: number, size: number) => {
  for(let i = 0; i < k; i++) {
    randomProjections.push(fillRandom(size));
  }
};

const getLSHash = (user: string) => {
  const userStats = itemsOf(user);
  const hashValues = [];
  
  randomProjections.forEach(projection => {
    const sim = angularSimilarity(userStats, projection);
    hashValues.push(sim);
  });
  console.log(hashValues);
  return hashValues.map(h => h > 0 ? '1' : '0').join('');
};

const angularSimilarity = (A: number[], B:number[]) => {
  return 1.0 - (2*Math.acos(cosineSimilarity(A,B))/Math.PI);
};

const cosineSimilarity = (A: number[], B:number[]) => {
  let dotproduct=0;
  let mA=0;
  let mB=0;
  for(let i = 0; i < A.length; i++){ 
      dotproduct += (A[i] * B[i]);
      mA += (A[i]*A[i]);
      mB += (B[i]*B[i]);
  }
  if (!mA || !mB) return -1;
  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);
  const similarity = (dotproduct)/((mA)*(mB))
  return similarity;
};

const normalize = (A: number[]) => {
  const max = Math.max(...A);
  const min = Math.min(...A);
  const diff = max - min;
  if (!diff) {
    return A;
  }
  return A.map(x => (x - min)/diff);
};

const fillRandom = (len: number) => {
  return Array(len).fill(0).map(x => 2*Math.random()-1);
};

const getSimilarUsers = (user, users, matrix) => {
  console.log('Similar users for ', user);
  console.log('\nVisits-visits:');
  users.forEach(u => {
    const sim = cosineSimilarity(Object.values(matrix[user]['0']), Object.values(matrix[u]['0']));
    console.log(u, ' : ', sim);
  });
  console.log('\nBids-Bids:');
  users.forEach(u => {
    const sim = cosineSimilarity(Object.values(matrix[user]['1']), Object.values(matrix[u]['1']));
    console.log(u, ' : ', sim);
  });
  console.log('\nBids-Visits:');
  users.forEach(u => {
    const sim = cosineSimilarity(Object.values(matrix[user]['1']), Object.values(matrix[u]['0']));
    console.log(u, ' : ', sim);
  });
  console.log('\nVisits-Bids:');
  users.forEach(u => {
    const sim = cosineSimilarity(Object.values(matrix[user]['0']), Object.values(matrix[u]['1']));
    console.log(u, ' : ', sim);
  });
};

export default {
  initialize,
  recommend,
  insertItem,
  insertActivity
}