/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContentItem } from '@/types';

export class RedditCollector {
  private readonly headers: HeadersInit;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  constructor() {
    this.headers = {
      'User-Agent': 'MoodMap/1.0.0',
      'Accept': 'application/json'
    };
  }

  async collectData(query: string, location: string): Promise<ContentItem[]> {
    const subreddits = this.getLocationSubreddits(location);
    const posts: ContentItem[] = [];

    const batchSize = 3;
    for (let i = 0; i < subreddits.length; i += batchSize) {
      const batch = subreddits.slice(i, i + batchSize);
      const batchPromises = batch.map(subreddit => this.fetchSubredditData(subreddit, query));
      const results = await Promise.allSettled(batchPromises);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          posts.push(...result.value);
        } else {
          console.warn(`Failed to fetch from r/${batch[index]}:`, 
            result.status === 'rejected' ? result.reason : 'No data');
        }
      });
    }

    return posts;
  }

  private async fetchSubredditData(
    subreddit: string, 
    query: string
  ): Promise<ContentItem[]> {
    const posts: ContentItem[] = [];
    let retryCount = 0;

    while (retryCount < this.maxRetries) {
      try {
        const response = await fetch(
          `https://www.reddit.com/r/${subreddit}/hot.json?limit=10`,
          { headers: this.headers }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.warn(`Invalid JSON from r/${subreddit}:`, text.slice(0, 100));
          throw new Error('Invalid JSON response');
        }

        if (!data?.data?.children) {
          throw new Error('Invalid response structure');
        }

        for (const post of data.data.children) {
          if (!this.isValidPost(post)) continue;

          if (query && !this.matchesQuery(post.data, query)) {
            continue;
          }

          posts.push({
            text: `${post.data.title} ${post.data.selftext || ''}`,
            source: 'reddit',
            timestamp: new Date(post.data.created_utc * 1000),
            url: `https://reddit.com${post.data.permalink}`,
            author: post.data.author,
            location: subreddit
          });
        }

        break;
      } catch (error) {
        retryCount++;
        if (retryCount === this.maxRetries) {
          console.error(`Final failure for r/${subreddit}:`, error);
          break;
        }
        console.warn(`Retry ${retryCount} for r/${subreddit}`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * retryCount));
      }
    }

    return posts;
  }

  private isValidPost(post: any): boolean {
    return post?.data?.title &&
           typeof post.data.title === 'string' &&
           post.data?.created_utc &&
           post.data?.permalink &&
           post.data?.author;
  }

  private matchesQuery(postData: any, query: string): boolean {
    if (!query) return true;
    const searchText = `${postData.title} ${postData.selftext || ''}`.toLowerCase();
    return query.toLowerCase().split(' ').some(term => searchText.includes(term));
  }

  private getLocationSubreddits(location: string): string[] {
    const subredditMap: { [key: string]: string[] } = {
      'United States': ['news', 'politics', 'USNews', 'AmericanPolitics', 'uspolitics', 'MURICA', 'AskAnAmerican', 'usanews', 'StateOfTheUnion', 'americana', 'worldnews'],
      'Canada': ['canada', 'CanadaPolitics', 'onguardforthee', 'CanadianNews', 'canadanews', 'CanadianPolitics', 'metacanada', 'toronto', 'vancouver', 'ottawa'],
      'Mexico': ['mexico', 'MexicoCity', 'mexicanpolitics', 'Monterrey', 'guadalajara', 'mexiconews', 'Mexicali'],

      'United Kingdom': ['ukpolitics', 'unitedkingdom', 'UKNews', 'london', 'brexit', 'britishproblems', 'casualuk', 'manchester', 'glasgow', 'bristol', 'leeds'],
      'France': ['france', 'french', 'FrenchPolitics', 'paris', 'lyon', 'marseille', 'bordeaux', 'rance', 'toulouse', 'nantes'],
      'Germany': ['germany', 'de', 'GermanPolitics', 'Berlin', 'munich', 'hamburg', 'cologne', 'frankfurt', 'ich_iel', 'germanyNews'],
      'Italy': ['italy', 'Italia', 'rome', 'milano', 'napoli', 'torino', 'florence', 'italyNews'],
      'Spain': ['spain', 'es', 'madrid', 'barcelona', 'valencia', 'sevilla', 'SpainPolitics', 'castellano'],
      'Netherlands': ['netherlands', 'thenetherlands', 'amsterdam', 'rotterdam', 'dutch', 'utrecht', 'dutchnews'],
      'Belgium': ['belgium', 'brussels', 'antwerp', 'ghent', 'belgica', 'BelgiumPolitics'],
      'Switzerland': ['switzerland', 'zurich', 'geneva', 'bern', 'basel', 'SwitzerlandPolitics'],
      'Austria': ['Austria', 'vienna', 'graz', 'salzburg', 'innsbruck', 'AustrianPolitics'],
      'Ireland': ['ireland', 'dublin', 'irishpolitics', 'cork', 'galway', 'northernireland', 'IrishNews'],
      'Portugal': ['portugal', 'lisboa', 'porto', 'portuguese', 'PORTUGALCARALHO', 'portugalNews'],
      'Greece': ['greece', 'athens', 'thessaloniki', 'GreekPolitics', 'greeklife'],
      'Luxembourg': ['luxembourg', 'luxembourgcity', 'letzebuerg'],
      'Iceland': ['iceland', 'reykjavik', 'VisitingIceland'],
      
      'Sweden': ['sweden', 'stockholm', 'svenskpolitik', 'gothenburg', 'malmo', 'swedishproblems'],
      'Norway': ['norway', 'oslo', 'norsk', 'bergen', 'trondheim', 'norwegianlife'],
      'Finland': ['finland', 'helsinki', 'suomi', 'tampere', 'turku', 'Suomipolitiikka'],
      'Denmark': ['denmark', 'copenhagen', 'aarhus', 'odense', 'danishpolitics'],

      'Poland': ['poland', 'polska', 'warsaw', 'krakow', 'wroclaw', 'poznan', 'polishNews'],
      'Ukraine': ['ukraine', 'kyiv', 'ukraina', 'lviv', 'odessa', 'UkrainianConflict', 'ukrainenews'],
      'Russia': ['russia', 'moscow', 'spb', 'russian', 'russiapolitics', 'RussiaDailyNews', 'AskaRussian', 'russianews'],
      'Romania': ['Romania', 'bucharest', 'cluj', 'timisoara', 'iasi', 'romanianews'],
      'Czech Republic': ['czech', 'prague', 'brno', 'ostrava', 'CzechPolitics'],
      'Hungary': ['hungary', 'budapest', 'debrecen', 'szeged', 'HungaryPolitics'],
      'Bulgaria': ['bulgaria', 'sofia', 'plovdiv', 'varna', 'bulgarianews'],
      'Slovakia': ['slovakia', 'bratislava', 'kosice', 'SlovakPolitics'],
      'Croatia': ['croatia', 'zagreb', 'split', 'rijeka', 'CroatianPolitics'],
      'Serbia': ['serbia', 'belgrade', 'novisad', 'nis', 'serbianews'],
      'Belarus': ['belarus', 'minsk', 'brest', 'grodno', 'belarusnews'],
      'Lithuania': ['lithuania', 'vilnius', 'kaunas', 'klaipeda', 'LithuanianNews'],
      'Latvia': ['latvia', 'riga', 'daugavpils', 'LatvianPolitics'],
      'Estonia': ['estonia', 'tallinn', 'tartu', 'EstonianPolitics'],
      'Slovenia': ['slovenia', 'ljubljana', 'maribor', 'SloveniaNews'],
      'Moldova': ['moldova', 'chisinau', 'balti', 'MoldovanNews'],
      'Albania': ['albania', 'tirana', 'durres', 'AlbanianPolitics'],
      'North Macedonia': ['macedonia', 'skopje', 'bitola', 'MacedonianNews'],
      'Montenegro': ['montenegro', 'podgorica', 'budva', 'MontenegrinNews'],
      'Bosnia and Herzegovina': ['bih', 'bosnia', 'sarajevo', 'mostar', 'banja_luka'],

      'China': ['China', 'shanghai', 'beijing', 'Sino', 'ChineseLanguage', 'ChineseHistory', 'ChineseCulture', 'shenzhen', 'guangzhou'],
      'Japan': ['japan', 'japannews', 'japanlife', 'tokyo', 'osaka', 'japanpics', 'japanese', 'newsokur', 'kyoto', 'fukuoka'],
      'South Korea': ['korea', 'seoul', 'busan', 'korean', 'hanguk', 'KoreanPolitics'],
      'North Korea': ['northkorea', 'pyongyang', 'dprk'],
      'India': ['india', 'IndiaSpeaks', 'indianews', 'mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune'],
      'Pakistan': ['pakistan', 'islamabad', 'karachi', 'lahore', 'rawalpindi', 'PakistanPolitics'],
      'Bangladesh': ['bangladesh', 'dhaka', 'chittagong', 'sylhet', 'BangladeshPolitics'],
      'Indonesia': ['indonesia', 'jakarta', 'surabaya', 'bandung', 'IndonesianPolitics'],
      'Malaysia': ['malaysia', 'kualalumpur', 'penang', 'johor', 'MalaysianPolitics'],
      'Philippines': ['philippines', 'manila', 'cebu', 'davao', 'PhilippinePolitics'],
      'Vietnam': ['vietnam', 'hanoi', 'saigon', 'danang', 'VietnamPolitics'],
      'Thailand': ['thailand', 'bangkok', 'chiangmai', 'phuket', 'ThaiPolitics'],
      'Myanmar': ['myanmar', 'burma', 'yangon', 'mandalay', 'MyanmarNews'],
      'Singapore': ['singapore', 'SGNews', 'singaporefi', 'NUSWhispers'],
      'Cambodia': ['cambodia', 'phnompenh', 'siemreap', 'CambodianPolitics'],
      'Laos': ['laos', 'vientiane', 'laopdr', 'LaoNews'],
      'Nepal': ['nepal', 'kathmandu', 'pokhara', 'NepaliPolitics'],
      'Sri Lanka': ['srilanka', 'colombo', 'kandy', 'SriLankanPolitics'],
      'Mongolia': ['mongolia', 'ulaanbaatar', 'MongoliaPolitics'],
      'Bhutan': ['bhutan', 'thimphu', 'BhutanNews'],
      'Brunei': ['brunei', 'bsb', 'bruneians'],
      'Timor-Leste': ['timorleste', 'easttimor', 'dili'],
      'Maldives': ['maldives', 'male', 'MaldivesNews'],

      'Turkey': ['turkey', 'istanbul', 'turkish', 'ankara', 'izmir', 'TurkishPolitics'],
      'Iran': ['iran', 'iranian', 'tehran', 'mashhad', 'isfahan', 'IranPolitics'],
      'Saudi Arabia': ['saudiarabia', 'riyadh', 'jeddah', 'mecca', 'SaudiNews'],
      'Israel': ['israel', 'telaviv', 'jerusalem', 'haifa', 'IsraeliPolitics'],
      'United Arab Emirates': ['dubai', 'abudhabi', 'UAE', 'sharjah', 'UAENews'],
      'Iraq': ['iraq', 'baghdad', 'basra', 'mosul', 'IraqiPolitics'],
      'Syria': ['syria', 'damascus', 'aleppo', 'SyrianPolitics'],
      'Jordan': ['jordan', 'amman', 'zarqa', 'JordanPolitics'],
      'Lebanon': ['lebanon', 'beirut', 'tripoli', 'LebanesePolitics'],
      'Palestine': ['palestine', 'gaza', 'westbank', 'ramallah', 'PalestineNews'],
      'Yemen': ['yemen', 'sanaa', 'aden', 'YemenNews'],
      'Oman': ['oman', 'muscat', 'salalah', 'OmanNews'],
      'Kuwait': ['kuwait', 'kuwaitcity', 'KuwaitPolitics'],
      'Qatar': ['qatar', 'doha', 'QatarNews'],
      'Bahrain': ['bahrain', 'manama', 'BahrainNews'],
      'Azerbaijan': ['azerbaijan', 'baku', 'azeri', 'AzerbaijanNews'],
      'Armenia': ['armenia', 'yerevan', 'hayastan', 'ArmenianPolitics'],
      'Georgia': ['Sakartvelo', 'tbilisi', 'georgia', 'GeorgianPolitics'],

      'Australia': ['australia', 'AustralianPolitics', 'sydney', 'melbourne', 'brisbane', 'perth', 'adelaide', 'straya', 'ausnews', 'canberra'],
      'New Zealand': ['newzealand', 'auckland', 'wellington', 'christchurch', 'nzpolitics', 'kiwilife'],
      'Papua New Guinea': ['papuanewguinea', 'png', 'portmoresby'],

      'South Africa': ['southafrica', 'johannesburg', 'capetown', 'durban', 'pretoria', 'RSA', 'southafricanews'],
      'Nigeria': ['nigeria', 'lagos', 'abuja', 'port_harcourt', 'NigerianPolitics'],
      'Egypt': ['egypt', 'cairo', 'alexandria', 'EgyptPolitics'],
      'Kenya': ['kenya', 'nairobi', 'mombasa', 'KenyanPolitics'],
      'Ethiopia': ['ethiopia', 'addisababa', 'EthiopianPolitics'],
      'Ghana': ['ghana', 'accra', 'kumasi', 'GhanaPolitics'],
      'Morocco': ['morocco', 'casablanca', 'rabat', 'marrakech'],
      'Tanzania': ['tanzania', 'daressalaam', 'zanzibar'],
      'Algeria': ['algeria', 'algiers', 'oran', 'AlgerianPolitics'],
      'Sudan': ['sudan', 'khartoum', 'SudanPolitics'],
      'Uganda': ['uganda', 'kampala', 'UgandanPolitics'],
      'Angola': ['angola', 'luanda', 'AngolaNews'],
      'Mozambique': ['mozambique', 'maputo', 'MozambiqueNews'],
      'Zimbabwe': ['zimbabwe', 'harare', 'bulawayo'],
      'Cameroon': ['cameroon', 'yaounde', 'douala'],
      'Tunisia': ['tunisia', 'tunis', 'TunisianPolitics'],
      'Senegal': ['senegal', 'dakar', 'SenegaleseNews'],
      'Mali': ['mali', 'bamako', 'MaliNews'],
      'Zambia': ['zambia', 'lusaka', 'ZambianNews'],
      'Madagascar': ['madagascar', 'antananarivo'],
      'Ivory Coast': ['cotedivoire', 'ivorycoast', 'abidjan'],
      'Burkina Faso': ['burkinafaso', 'ouagadougou'],
      'Niger': ['niger', 'niamey'],
      'Malawi': ['malawi', 'lilongwe'],
      'Somalia': ['somalia', 'mogadishu'],
      'Chad': ['chad', 'ndjamena'],
      'Rwanda': ['rwanda', 'kigali'],
      'Benin': ['benin', 'cotonou', 'portonovo'],
      'Burundi': ['burundi', 'bujumbura'],
      'Libya': ['libya', 'tripoli', 'benghazi'],
      'Gabon': ['gabon', 'libreville'],
      'Guinea': ['guinea', 'conakry'],
      'Sierra Leone': ['sierraleone', 'freetown'],
      'Liberia': ['liberia', 'monrovia'],
      'Eritrea': ['eritrea', 'asmara'],
      'Central African Republic': ['centralafricanrepublic', 'bangui'],
      'South Sudan': ['southsudan', 'juba'],
      'Lesotho': ['lesotho', 'maseru'],
      'Botswana': ['botswana', 'gaborone'],
      'Namibia': ['namibia', 'windhoek'],
      'Mauritania': ['mauritania', 'nouakchott'],
      'Togo': ['togo', 'lome'],
      'Congo': ['congo', 'brazzaville'],
      'Democratic Republic of the Congo': ['DRCongo', 'kinshasa', 'lubumbashi'],
      'Djibouti': ['djibouti', 'djibouticity'],
      'Eswatini': ['eswatini', 'swaziland', 'mbabane'],
      'Guinea-Bissau': ['guineabissau', 'bissau'],
      'Equatorial Guinea': ['equatorialguinea', 'malabo'],
      'Comoros': ['comoros', 'moroni'],
      'Cape Verde': ['capeverde', 'praia'],
      'Sao Tome and Principe': ['saotomeandprincipe', 'saotome'],

      'Brazil': ['brasil', 'brazil', 'saopaulo', 'riodejaneiro', 'brasilivre', 'brNews', 'BrasilOnReddit', 'curitiba', 'belohorizonte', 'fortaleza'],
      'Argentina': ['argentina', 'buenosaires', 'cordoba', 'rosario', 'ArgentinaPolitics'],
      'Colombia': ['Colombia', 'bogota', 'medellin', 'cali', 'ColombianPolitics'],
      'Chile': ['chile', 'santiago', 'valparaiso', 'ChileanPolitics'],
      'Peru': ['peru', 'lima', 'arequipa', 'trujillo', 'PeruvianPolitics'],
      'Venezuela': ['venezuela', 'caracas', 'maracaibo', 'valencia'],
      'Ecuador': ['ecuador', 'quito', 'guayaquil', 'cuenca'],
      'Bolivia': ['bolivia', 'lapaz', 'santacruz', 'cochabamba'],
      'Paraguay': ['paraguay', 'asuncion', 'ciudaddeleste'],
      'Uruguay': ['uruguay', 'montevideo', 'UruguayanPolitics'],
      'Guyana': ['guyana', 'georgetown'],
      'Suriname': ['suriname', 'paramaribo'],
      'French Guiana': ['guyane', 'cayenne'],

      'Panama': ['panama', 'panamacity', 'PanamaPolitics'],
      'Costa Rica': ['costarica', 'sanjose', 'CostaRicaPolitics'],
      'Guatemala': ['guatemala', 'guatemalacity', 'GuatemalaPolitics'],
      'Honduras': ['honduras', 'tegucigalpa', 'sanpedrosula'],
      'El Salvador': ['elsalvador', 'sansalvador'],
      'Nicaragua': ['nicaragua', 'managua'],
      'Belize': ['belize', 'belizecity'],
      'Dominican Republic': ['dominicanrepublic', 'santodomingo', 'puntacana'],
      'Haiti': ['haiti', 'portauprince'],
      'Cuba': ['cuba', 'havana', 'CubanPolitics'],
      'Jamaica': ['jamaica', 'kingston', 'montegobay', 'JamaicanLife'],
      'Trinidad and Tobago': ['trinidad', 'portofspain'],
      'Bahamas': ['bahamas', 'nassau'],
      'Barbados': ['barbados', 'bridgetown'],

      'Kazakhstan': ['kazakhstan', 'astana', 'almaty', 'KazakhPolitics'],
      'Uzbekistan': ['uzbekistan', 'tashkent', 'samarkand'],
      'Turkmenistan': ['turkmenistan', 'ashgabat'],
      'Kyrgyzstan': ['kyrgyzstan', 'bishkek', 'osh'],
      'Tajikistan': ['tajikistan', 'dushanbe'],
    }

    return subredditMap[location] || subredditMap['Global'];
  }
}