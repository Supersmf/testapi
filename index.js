const request = require('request');
const cheerio = require('cheerio');

const houseParams = {
  CITY: 'Город',
  AREA: 'Район',
  SUBWAY: 'Метро',
  ADDRESS: 'Адрес'
};

const flatParams = {
  TOTAL_AREA: 'Общая площадь',
  LIVING_AREA: 'Жилая площадь',
  KITCHEN: 'Кухня',
  ROOMS: 'Комнат',
  FLOOR: 'Этаж'
};

const MAX_ITEM_FETCH = 10;

const OWNER = 'Собственник';
// request(
//   'https://domovita.by/minsk/1-room-flats/rent',
//   (error, response, html) => {
//     if (!error && response.statusCode === 200) {
//       const promises = parse(html);
//       console.log(promises);

//       // Promise.all(promises).then(data => console.log(data));
//     }
//   }
// );

const parse = (url = 'https://domovita.by/minsk/1-room-flats/rent') => {
  let globalPromise = Promise.resolve();
  const data = [];
  request(url, (error, response, html) => {
    if (!error && response.statusCode === 200) {
      const $ = cheerio.load(html, {
        xml: {
          normalizeWhitespace: true
        }
      });

      const contentList = $('.found_content.last-view-data > div')
        .filter((index, element) => !$(element).attr('class'))
        .each(async (index, elt) => {
          if (index > MAX_ITEM_FETCH) {
            return;
          }
          globalPromise = globalPromise.then(async () => {
            const images = $(elt)
              .find('li.slider-img-in-listing__item > div')
              .map((i, el) => $(el).attr('data-url-mini'))
              .get();

            const url = $(elt)
              .find('a')
              .attr('href');

            if (url) {
              // promises.push(itemParse(url, images));
              const parsedItem = await itemParse(url);
              data.push({ ...parsedItem, images });
              console.log(parsedItem.city);
            }
          });
        });
    }
  });
  return globalPromise.then(() => data);
};

const itemParse = (url, images) =>
  new Promise((resolve, reject) => {
    request(url, (error, response, html) => {
      if (!error && response.statusCode === 200) {
        const $ = cheerio.load(html, {
          xml: {
            normalizeWhitespace: true
          }
        });

        const price = parseInt(
          $('.object-head__price-main .calculator__price-main')
            .text()
            .split('/мес.')
            .find(item => ~item.indexOf('$'))
        );
        const publicationDate = $('.publication-info__publication-date')
          .text()
          .trim()
          .split(' ')[1];
        const updateDate = $('.publication-info__update-date')
          .text()
          .trim()
          .split(' ')[1];
        const ownerName = $('.owner-info__name').text();
        const ownerPhone = $('.owner-info__phone').text();
        const isOwner = $('.owner-info__status').text() === OWNER;
        const isRefrigerator = !!$('.icon-dom-refrigerator').length;
        const isElevator = !!$('.icon-dom-building_elevator').length;
        const isWiFi = !!$('.icon-dom-wifi').length;
        const isFurniture = !!$('.icon-dom-sofa').length;
        const isWashingMachine = !!$('.icon-dom-washing-machine').length;
        const description = $('#object-description').text();
        const params = $('div.object-info__params');
        const getParams = params =>
          $(params)
            .find('.object-info__parametr')
            .map(function() {
              return $(this)
                .text()
                .trim();
            })
            .get();

        const getCurrentParam = (str, params) => {
          const currentParam = params.find(param => ~param.indexOf(str));
          return currentParam
            ? currentParam
                .split(' ')
                .splice(1)
                .join(' ')
                .trim()
            : '';
        };
        const addressParams = getParams(params[0]);
        const apartmentParams = getParams(params[1]);
        const getAddressParams = param => getCurrentParam(param, addressParams);
        const getApartmentParams = param =>
          getCurrentParam(param, apartmentParams);

        const city = getAddressParams(houseParams.CITY);
        const area = getAddressParams(houseParams.AREA);
        const subway = getAddressParams(houseParams.SUBWAY);
        const address = getAddressParams(houseParams.ADDRESS);
        // console.log(address);

        const totalArea = getApartmentParams(flatParams.TOTAL_AREA).match(
          /[\d|.|e|E|\+]+/g
        )[0];
        const livingArea = getApartmentParams(flatParams.LIVING_AREA).match(
          /[\d|.|e|E|\+]+/g
        )[0];
        const kitchenArea = getApartmentParams(flatParams.KITCHEN).split(
          ' '
        )[0];
        const roomsCount = getApartmentParams(flatParams.ROOMS);
        const floor = getApartmentParams(flatParams.FLOOR);

        resolve({
          city,
          area,
          subway,
          address,
          isOwner,
          ownerName,
          ownerPhone,
          price,
          totalArea,
          livingArea,
          kitchenArea,
          roomsCount,
          floor,
          facilities: {
            isRefrigerator,
            isElevator,
            isWiFi,
            isFurniture,
            isWashingMachine
          },
          publicationDate,
          updateDate,
          description,
          images
        });
      }
    });
    //, 10000
    // );
  });

const test = async () => {
  console.log(await parse());
};

test();
