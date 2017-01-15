import Twit from 'twit';
import R from 'ramda';

const twit = new Twit({
  consumer_key:         '66L1RPtLQKyGHED7sJDmDtrXE',
  consumer_secret:      'FpUpO3DAI1iS6h0y3bUNnfzxqpIMZsT9kNP6E5SZjGnv7tlF9J',
  access_token:         '820443039151886336-CEL5b1NQdfwbkwjdXIF2PEUbIydux27',
  access_token_secret:  'pELot1gEmuXdySc4Wr5a7rJm26Gqz1R6N9PquxuO5gn0h',
});

const respondToMentions = R.compose(
  R.when(
    R.test(/^@subtweetsubs.+/),
    R.tap(console.log),
  ),
  R.prop('text'),
);

const stream = twit.stream('user');
stream.on('tweet', respondToMentions);
