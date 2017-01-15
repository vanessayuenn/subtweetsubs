import R from 'ramda';
import fs from 'fs';
import Twit from 'twit';
import pickImage from './img-picker';
import SUBS from './subs';

const twit = new Twit({
  consumer_key:         '66L1RPtLQKyGHED7sJDmDtrXE',
  consumer_secret:      'FpUpO3DAI1iS6h0y3bUNnfzxqpIMZsT9kNP6E5SZjGnv7tlF9J',
  access_token:         '820443039151886336-CEL5b1NQdfwbkwjdXIF2PEUbIydux27',
  access_token_secret:  'pELot1gEmuXdySc4Wr5a7rJm26Gqz1R6N9PquxuO5gn0h',
});

const emojis = ['👊', '🔥', '👍', '🎉', '💁', '🙃', '🍕', '😎', '😘', '👏',
  '✌️', '👌', '👈', '👙', '🐷', '🍟'];

function handleResponse(err, data) {
  if (err) {
    console.log(err);
  } else {
    console.log(data);
  }
}

function getImage(text) {
  const img = pickImage(SUBS, text);
  return fs.readFileSync(img.filePath, { encoding: 'base64' });
}

function composeMessage(usernames) {
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  return `${ usernames } ${ emoji }`;
};

function composeStatus(id, usernames, mediaIdStr) {
  return {
    in_reply_to_status_id: id,
    status: composeMessage(usernames),
    media_ids: [mediaIdStr],
  };
}

function postStatusWithMedia(metaParams, id, usernames, mediaIdStr) {
  if (!usernames.includes('subtweetsubs')) {
    twit.post('media/metadata/create', metaParams, (err, data) => {
      if (!err) {
        const statusObj = composeStatus(id, usernames, metaParams.media_id);
        twit.post('statuses/update', statusObj, handleResponse);
      }
    });
  }
}

function postAReply(tweet) {
  const mediaObj = { media_data: getImage(tweet.text) };

  twit.post('media/upload', mediaObj, (err, data) => {
    const mediaIdStr = data.media_id_string
    const altText = 'a sub sandwich';
    const metaParams = { media_id: mediaIdStr, alt_text: { text: altText } };
    postStatusWithMedia(
      metaParams,
      tweet.id_str,
      `@${tweet.in_reply_to_screen_name} @${tweet.user.screen_name}`,
    );
  });
}

const respondToMentions = R.compose(
  R.when(
    R.compose(
      R.test(/@subtweetsubs/),
      R.tap(console.log),
      R.prop('text'),
    ),
    R.compose(
      postAReply,
      R.tap(() => console.log('respondToMentions')),
    ),
  ),
);

export function initStream() {
  const stream = twit.stream('user');
  stream.on('tweet', respondToMentions);
}
