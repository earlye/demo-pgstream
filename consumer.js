const {Pool, Client} = require('pg');

const logError = (err) => { console.log('error:', err ); }

const subscriptionId = 1;

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

const consumeMessages = async (client, subscription) => {
  const transaction = await client.query("BEGIN TRANSACTION");

  const subscriptionState
        = await client.query(`SELECT topic_id, last_processed_message_id FROM subscriptions WHERE id=${subscription} FOR UPDATE`)
        .catch(logError);

  const topicId = subscriptionState.rows[0].topic_id;
  const messageId = subscriptionState.rows[0].last_processed_message_id;
  console.log('topicId:', topicId, 'messageId:', messageId);

  const newerMessages
        = await client.query(`SELECT * FROM messages WHERE topic_id = ${topicId} and (id > ${messageId} OR ${messageId} IS NULL)`)
        .catch(logError);
  console.log('newerMessages:', newerMessages.rows);

  if (newerMessages.rows.length) {
    const lastMessageId = newerMessages.rows[newerMessages.rows.length -1].id;
    const update
          = await client.query(`UPDATE subscriptions SET last_processed_message_id=${lastMessageId} WHERE id=${subscription}`)
          .catch(logError);

    const commit
          = await client.query("COMMIT")
          .catch(logError);
  } else {
    await client.query("ROLLBACK")
      .catch(logError);
  }
}

const listenForMessages = async (client, eventName, callback) => {
  client.on('notification', msg => {
    console.log('notification:', msg);
    consumeMessages(client, subscriptionId);
  });
  client.on('error', err => {
    console.log('error:', err);
    client.connect();
    client.query('LISTEN message');
  });
  client.query('LISTEN message');
}

const main = async()  => {
  const client = await setupDb();

  if (true) {
    await consumeMessages(client, subscriptionId);
    await listenForMessages(client, 'message', consumeMessages);
  } else {
    consumeMessages(client, )
      .then(() => setInterval(consumeMessages, 5000, client, subscriptionId))
  }
}

main();
