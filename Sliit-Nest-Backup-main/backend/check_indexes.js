require('dotenv').config({ path: 'g:\\Y3S2\\Clone ITPM\\SLIIT-Nest\\backend\\.env' });
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    if (!collections.find(c => c.name === 'connections')) {
        console.log("No connections collection found!");
        process.exit(0);
    }
    
    const indexes = await db.collection('connections').indexes();
    console.log("Indexes on connections collection:");
    console.log(JSON.stringify(indexes, null, 2));

    let modified = false;
    for (let index of indexes) {
      if (index.name !== '_id_' && index.name !== 'sender_1_receiver_1_post_1') {
        console.log(`Dropping index ${index.name}...`);
        try {
          await db.collection('connections').dropIndex(index.name);
          modified = true;
        } catch (e) {
          console.error(`Failed to drop ${index.name}:`, e.message);
        }
      }
    }
    
    if (modified) {
        console.log("Remaining indexes:");
        const newIndexes = await db.collection('connections').indexes();
        console.log(JSON.stringify(newIndexes, null, 2));
    }
    console.log("SUCCESS");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
