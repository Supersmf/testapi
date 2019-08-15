const request = require('request');
const cheerio = require('cheerio');
let data = [];

request(
  'https://domovita.by/minsk/1-room-flats/rent',
  (error, response, html) => {
    if (!error && response.statusCode === 200) {
      const $ = cheerio.load(html, {
        xml: {
          normalizeWhitespace: true
        }
      });

      const contentList = $('.found_content.last-view-data > div')
        .filter((index, element) => !$(element).attr('class'))
        .each((indx, elt) => {
          const images = $(elt)
            .find('li.slider-img-in-listing__item > div')
            .map((i, el) => $(el).attr('data-url-mini'))
            .get();

          const flatData = Array.from($(elt).find('.found_full > div'));

          const address = $(flatData[0])
            .children('.col-md-8')
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
              place: address[1].split(';')[0].trim(),
              subway: address[1].split(';')[1],
              price: price.split('&')[0]
            });
          }
        });
    }
    console.log(data);
  }
);
