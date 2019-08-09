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
      const $ = cheerio.load(html, {
        xml: {
          normalizeWhitespace: true
        }
      });

      // Looking at the inspector or source code we will select the following id value
      const siteHeading = $('.found_content.last-view-data')
        .find('div > a')
        .each((index, element) => {
          const images = $(element)
            .find('li')
            .map((i, imgElement) =>
              $(imgElement)
                .find('div')
                .attr('data-url-mini')
            )
            .get();

          const flatData = $(element).find('.found_full div');

          const address = $(flatData[0])
            .children('.col-md-8')
            .children('div')
            .contents()
            .map(function() {
              return $(this)
                .text()
                .trim();
            })
            .get();

          console.log('---------------------------------');
          console.log(address);
        });
    }
  }
);
