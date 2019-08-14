// Requiring two of our dependencies
const request = require('request');
const cheerio = require('cheerio');
let data = [];
// Requesting to the website
request(
  'https://domovita.by/minsk/1-room-flats/rent',
  (error, response, html) => {
    if (!error && response.statusCode === 200) {
      const $ = cheerio.load(html, {
        xml: {
          normalizeWhitespace: true
        }
      });

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

          const flatData = Array.from($(element).find('.found_full > div.row'));

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

          const price = $(flatData[0])
            .find('div.price.mb-2.mt-10 ')
            .first()
            .text();

          if (address.length) {
            data.push({
              images,
              city: address[0].split(',')[1].trim(),
              street: address[0].split(',')[2].trim(),
              apartment: address[0].split(',')[3].trim(),
              place: address[1],
              subway: address[2],
              price: price.split('&')[0]
            });
          }
        });
    }
    console.log(data);
  }
);
