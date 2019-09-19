const {Pool, Client} = require('pg');

const logError = (err) => { console.log('error:', err ); }

const setupDb = async () => {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'delta',
    password: 'delta',
    database: 'delta' // can I help ya help ya help ya?
  });

  await client.connect();
  return client;
}

const produceMessage = async (client) => {
  await client.query("BEGIN TRANSACTION")
    .then(() => client.query("INSERT INTO messages (topic_id, payload) VALUES (1,'hello')"))
    .then(() => client.query("NOTIFY message, '" + JSON.stringify({topic:1}) + "'"))
    .then(() => client.query("COMMIT"))
    .then(() => console.log("produced a message"))
    .catch(err => {
      console.log('ERROR:', err);
      client.query("ROLLBACK");
    });
}

const main = async()  => {
  const client = await setupDb();

  setInterval(produceMessage, 1000, client);
}

main();
