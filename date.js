const now = new Date();

const locale = 'en-US';


exports.getDate = function () {

  const options = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };

  return now.toLocaleDateString(locale, options);

};


exports.getDay = function () {

  const options = {
    weekday: 'long'
  };

  return now.toLocaleDateString(locale, options);

};
