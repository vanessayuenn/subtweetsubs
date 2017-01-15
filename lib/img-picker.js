const fuzz = require('fuzzball');

const opt = {
  scorer: fuzz.token_set_ratio,
  processor: (choice) => choice.keyword,
  limit: 3,
  cutoff: 40,
  unsorted: false
}

function pickImage(images, _keywords, fallBackToRandom = true) {
  const keywords = _keywords.replace(/@\w+/g, '').trim();
  let result;
  const extract = fuzz.extract(keywords, images, opt);
  console.log('extract', extract);
  if (extract.length === 0) {
    const rand = Math.floor(Math.random() * images.length);
    result = fallBackToRandom ? images[rand] : null;
  } else {
    result = extract[0][0];
  }
  return result;
}

module.exports = pickImage;
