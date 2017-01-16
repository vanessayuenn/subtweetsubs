const R = require('ramda');
const fs = require('fs');
const Twit = require('twit');
const pickImage = require('./img-picker');
const subs = require('./subs');
const subtweets = require('./subtweets');
const config = require('./config');

const twit = new Twit(config);

function handleResponse(err, data) {
  if (err) {
    console.log(err);
  } else {
    console.log('💬', data.text);
  }
}

function getImage(text) {
  const img = pickImage(subs, text);
  return fs.readFileSync(img.filePath, { encoding: 'base64' });
}

function composeMessage(usernames) {
  const subtweet = subtweets[Math.floor(Math.random() * subtweets.length)];
  return `${ usernames } ${ subtweet }`;
};

function composeStatus(id, usernames, mediaIdStr) {
  return {
    in_reply_to_status_id: id,
    status: composeMessage(usernames),
    media_ids: [mediaIdStr],
  };
}

function postStatusWithMedia(metaParams, id, usernames, mediaIdStr) {
  twit.post('media/metadata/create', metaParams, (err, data) => {
    if (!err) {
      const statusObj = composeStatus(id, usernames, metaParams.media_id);
      twit.post('statuses/update', statusObj, handleResponse);
    }
  });
}

function postAReply(tweet) {
  const mediaObj = { media_data: getImage(tweet.text) };

  const others = tweet.entities.user_mentions
    .map(user => `@${user.screen_name}`).join(' ')
    .replace(`@${tweet.in_reply_to_screen_name}`, '')
    .replace(`@${tweet.user.screen_name}`, '');

  twit.post('media/upload', mediaObj, (err, data) => {
    const mediaIdStr = data.media_id_string
    const altText = 'a sub sandwich';
    const metaParams = { media_id: mediaIdStr, alt_text: { text: altText } };

    postStatusWithMedia(
      metaParams,
      tweet.id_str,
      `@${tweet.in_reply_to_screen_name} @${tweet.user.screen_name} ${others}`,
    );
  });
}

const respondToMentions = R.compose(
  R.when(
    R.compose(
      R.test(/#subtweetsubs/),
      R.tap(console.log),
      R.prop('text'),
    ),
    R.compose(
      postAReply,
      R.tap(() => console.log('🆗 respondToMentions')),
    ),
  ),
);

function initStream() {
  const stream = twit.stream('statuses/filter', { track: 'subtweetsubs' });
  stream.on('tweet', respondToMentions);
}

module.exports = initStream;
