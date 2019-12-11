const Markov = require('markov-strings').default;
const rp = require('request-promise');

export class TextGenerator {

  category = '';

  get findInWikipedia() {
    return rp({
      uri: 'https://ru.wikipedia.org/w/api.php',
      qs: {
        action: "query",
        list: "search",
        srsearch: this.category,
        format: "json",
        srprop: 'snippet',
        srlimit: 20
      },
      headers: {
        'User-Agent': 'Request-Promise'
      },
      json: true
    });
  }

  extendedText = (listOfIds) => rp({
    url: 'https://ru.wikipedia.org/w/api.php',
    qs: {
      action: 'query',
      pageids: listOfIds,
      format: 'json',
      prop: 'extracts',
      explaintext: true,
      exintro: true
    },
    json: true
  });


  constructor(category) {
    this.category = category;
  }

  /*
  returns:
  Object{
    generate - method which returns generated text
  }
  */
  async getResult() {

    const findAtWikipedia = await this.findInWikipedia;

    const listOfIds = findAtWikipedia.query.search.map(r => r.pageid).join('|');

    const text = this.extendedText(listOfIds);

    const pages = Object.values(text.query.pages);

    let wholeText = '';

    pages.map(p => {
      wholeText = wholeText.concat(p.extract);
    });

    const wholeTextWithDots = wholeText.split('.').map(s => s + '.');

    const textGenerator = new Markov(wholeTextWithDots, {
      minWords: 20,
      stateSize: 1,
      filter: result => result.string.endsWith('.')
    });

    return await textGenerator.buildCorpusAsync();
  }
}

export const titlesData = [{
  title: 'Мы крутые',
  attrs: ['about_us', 'guarantee']
}, {
  title: 'Доставка в срок',
  attrs: ['benefits', 'delivery']
}];


/**
 * examples
 *
 * titleGenerator('about_us');
 * titleGenerator('delivery');
 *
 * */
export function titleGenerator(blockAttribute, data = titlesData) {
  const filteredByAttr = data.filter(t => t.attrs.includes(blockAttribute));
  return [Math.floor(Math.random() * filteredByAttr.length)].title || 'Крутой заголовок';
}



