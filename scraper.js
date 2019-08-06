// Requiring two of our dependencies
const request = require('request');
const cheerio = require('cheerio');
let href = [];
// Requesting to the website
request(
  'https://domovita.by/minsk/1-room-flats/rent',
  (error, response, html) => {
    // Checking that there is no errors and the response code is correct
    if (!error && response.statusCode === 200) {
      // Declaring cheerio for future usage
      const $ = cheerio.load(html);

      // Looking at the inspector or source code we will select the following id value
      const siteHeading = $('.found_content.last-view-data')
        .find('div > a')
        .each((index, element) => href.push($(element).attr('href')));

      // Showing our result on the console
      // console.log(siteHeading.html());
      console.log(href);
    }
  }
);
