const {Pool, Client} = require('pg');

const logError = (err) => { console.log('error:', err ); }

const main = async () => {
  const client = new Client({
    host: 'localhost',
    port: 32768,
    user: 'delta',
    password: 'delta',
    database: 'delta' // can I help ya help ya help ya?
  });

  await client.connect();

  await client.query("CREATE TABLE IF NOT EXISTS topics (id BIGSERIAL PRIMARY KEY, name TEXT UNIQUE)")
    .catch(logError);

  await client.query("CREATE TABLE IF NOT EXISTS messages (id BIGSERIAL PRIMARY KEY, topic_id BIGINT, message TEXT, FOREIGN KEY (topic_id) REFERENCES topics (id))")
    .catch(logError);

  await client.query("CREATE TABLE IF NOT EXISTS subscriptions (id BIGSERIAL PRIMARY KEY, name TEXT UNIQUE, topic_id BIGINT, message_id BIGINT, FOREIGN KEY (topic_id) REFERENCES topics(id), FOREIGN KEY (message_id) REFERENCES messages(id))")
    .catch(logError);

  await client.query("INSERT INTO topics (name) VALUES ('demo') ON CONFLICT (name) DO NOTHING");
  await client.query("INSERT INTO subscriptions (name, topic_id, message_id) VALUES ('demo',1,NULL) ON CONFLICT (name) DO NOTHING");

  return client;
}


return main();
