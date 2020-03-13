#!/usr/bin/env node
const os = require('os');
const https = require('https');
const fs = require('fs');

const program = require('commander');
const XLSX = require('xlsx');
const cheerio = require('cheerio');
const request = require('request');
const puppeteer = require('puppeteer');

/**----------------------------------------------------------------*/
program
  .command('lowercase <str>')
  .description('Lowercase the given string')
  .action(str => {
    console.log(str.toLowerCase());
  });

program
  .command('uppercase <str>')
  .description('Uppercase the given string')
  .action(str => {
    console.log(str.toUpperCase());
  });

program
  .command('capitalize <str>')
  .description('Capitalize the given string')
  .action(str => {
    console.log(str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase()));
  });

/**---------------------------------------------------------------- */
program
  .command('add <numbers...>')
  .description('add all numbers')
  .action(numbers => {
    console.log(numbers.reduce((acc, curr) => acc * 1 + curr * 1));
  });

program
  .command('subtract <numbers...>')
  .description('subtract all numbers')
  .action(numbers => {
    console.log(numbers.reduce((acc, curr) => acc * 1 - curr * 1));
  });

program
  .command('multiply <numbers...>')
  .description('multiply all numbers')
  .action(numbers => {
    console.log(numbers.reduce((acc, curr) => acc * 1 * curr * 1));
  });

program
  .command('divide <numbers...>')
  .description('divide all numbers')
  .action(numbers => {
    console.log(numbers.reduce((acc, curr) => ((acc * 1) / curr) * 1));
  });

/**---------------------------------------------------------------- */
program
  .command('palindrome <sentence>')
  .description('check if a sentence is palindrome')
  .action(sentence => {
    const str = sentence.toLowerCase().replace(/[^A-Za-z0-9]+/g, '');
    let result;

    if (
      str ===
      str
        .split('')
        .reverse()
        .join('')
    ) {
      result = 'Yes';
    } else {
      result = 'No';
    }

    console.log(`String: ${sentence}`);
    console.log(`Is palindrome ? ${result}`);
  });

/**---------------------------------------------------------------- */
program
  .command('obfuscate <str>')
  .description('obfuscate a given string')
  .action(str => {
    const chars = str.split('');
    let result = '';
    chars.forEach(char => {
      result += `&#${char.charCodeAt(0)};`;
    });

    console.log(result);
  });

/**---------------------------------------------------------------- */
program
  .command('random [dir]')
  .option('--length <len>', 'set the length of the random string', 32)
  .option('--letters <let>', 'set only letters for the random string', 'true')
  .option('--numbers <num>', 'set only numbers for the random string', 'true')
  .option('--uppercase', 'uppercase the random string', false)
  .option('--lowercase', 'lowercase the random string', false)
  .description('generate a random string')
  .action(function(dir, cmdObj) {
    let str = '';
    let chars = '';

    cmdObj.letters = cmdObj.letters === 'true';
    cmdObj.numbers = cmdObj.numbers === 'true';

    if (cmdObj.letters && cmdObj.numbers) {
      chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    } else if (cmdObj.letters && !cmdObj.numbers) {
      chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    } else if (!cmdObj.letters && cmdObj.numbers) {
      chars = '0123456789';
    }

    for (let i = 0; i < cmdObj.length; i++) {
      str += chars[Math.floor(Math.random() * chars.length)];
    }

    if (cmdObj.uppercase) return console.log(str.toUpperCase());
    if (cmdObj.lowercase) return console.log(str.toLowerCase());
    console.log(str);
  });

/**---------------------------------------------------------------- */
program
  .command('ip')
  .description('return your ip address in private network')
  .action(() => {
    const networkInterfaces = os.networkInterfaces();
    console.log(networkInterfaces.en0[1].address);
  });

/**---------------------------------------------------------------- */
program
  .command('ip-external')
  .description('return your ip address in public network')
  .action(() => {
    let ip = '';
    const options = {
      host: 'api.ipify.org'
    };

    https.get(options, res => {
      res.on('data', chunk => {
        ip += chunk;
      });
      res.on('end', () => {
        console.log(ip);
      });
    });
  });

/**---------------------------------------------------------------- */
program
  .command('headlines')
  .description('get headlines from https://www.kompas.com')
  .action(() => {
    request.get('https://indeks.kompas.com/headline', (err, res, data) => {
      const $ = cheerio.load(data);
      const links = $('.article__link');
      for (let i = 0; i < links.length; i++) {
        const title = links[i].children[0].data;
        const url = links[i].attribs.href;
        console.log(`Title: ${title}`);
        console.log(`URL: ${url} \n`);
      }
    });
  });

/**---------------------------------------------------------------- */
program
  .command('convert <input> <output>')
  .description('import from or export to CSV / XLS / XLSX file')
  .action((input, output) => {
    const workbook = XLSX.readFile(input);
    XLSX.writeFile(workbook, output);
  });

/**---------------------------------------------------------------- */
const generate = (path, startIndex, endIndex, countFormat) => {
  let result = '';
  let tmp = path.split('');
  tmp.splice(startIndex, endIndex, ...countFormat);
  tmp = tmp.join('');

  if (!fs.existsSync(`./${tmp}`)) result = tmp;

  return result;
};

const generateUniqueFileName = (path, output) => {
  let result = undefined;
  let countFormat = '';
  if (!fs.existsSync(`./${path}`)) {
    result = path;
  } else {
    let count = 1;
    if (output) {
      while (true) {
        countFormat = `(${count})`;
        result = generate(path, -4, 0, countFormat);
        if (result) break;
        else count++;
      }
    } else {
      while (true) {
        countFormat = ('000' + count).substr(-3).split('');
        result = generate(path, -7, 3, countFormat);
        if (result) break;
        else count++;
      }
    }
  }

  return result;
};

program
  .command('screenshot <url>')
  .option('--format <fmt>', 'set the extension for the file', 'png')
  .option(
    '--output <out>',
    'set the file name along with extension',
    'screenshot-001.png'
  )
  .description('Get a screenshot from a URL')
  .action(async (url, cmdObj) => {
    const format = cmdObj.format;
    const output = cmdObj.output;

    let path = '';

    if (output !== 'screenshot-001.png') {
      path = generateUniqueFileName(output, true);
    } else {
      path = generateUniqueFileName(`screenshot-001.${format}`, false);
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    if (path.slice(-3) === 'pdf') {
      await page.goto(url, {
        waitUntil: 'networkidle2'
      });
      await page.pdf({ path, format: 'A4' });
    } else {
      await page.goto(url);
      await page.screenshot({ path });
    }

    await browser.close();
  });

/**---------------------------------------------------------------- */
const slugify = string => {
  const a =
    'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;';
  const b =
    'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------';
  const p = new RegExp(a.split('').join('|'), 'g');

  return string
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(p, c => b.charAt(a.indexOf(c)))
    .replace(/&/g, '-and-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

program
  .command('screenshot-list <file>')
  .description('Get screenshots from a list of files')
  .option('--format <fmt>', 'set the extension for the file', 'png')
  .action(async (file, cmdObj) => {
    const result = fs.readFileSync(file, 'utf8');
    const urls = result.split('\n');
    const format = cmdObj.format;

    for (let url of urls) {
      const fileName = slugify(url);
      path = generateUniqueFileName(`${fileName}.${format}`, true);

      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      if (path.slice(-3) === 'pdf') {
        await page.goto(url, {
          waitUntil: 'networkidle2'
        });
        await page.pdf({ path, format: 'A4' });
      } else {
        await page.goto(url);
        await page.screenshot({ path });
      }
      await browser.close();
    }
  });

/**---------------------------------------------------------------- */
program
  .command('movies')
  .description(
    'Get all information about new movies in theaters for today from CGV'
  )
  .action(() => {
    const axios = require('axios');
    axios
      .get('https://www.cgv.id/en/loader/home_movie_list/')
      .then(response => {
        const data = response.data.now_playing;
        let $ = cheerio.load(data);
        return $('a');
      })
      .then(async links => {
        for (let i = 0; i < links.length; i++) {
          const url = `https://www.cgv.id${links[i].attribs.href}`;

          await axios.get(url).then(response => {
            $ = cheerio.load(response.data);
            if (i > 0) {
              console.log(
                '---------------------------------------------------------------------------------------------------------'
              );
            }

            const title = $('.movie-info-title \n')
              .text()
              .trim();
            console.log(`${title} \n`);
            const allInformation = $('.movie-add-info > ul > li');
            for (let j = 0; j < allInformation.length; j++) {
              console.log(allInformation[j].children[0].data);
            }
            let trailer = $('.trailer-btn-wrapper > img').attr('onclick');
            trailer = trailer.match(/'([^']+)'/)[1];
            console.log(`Trailer: ${trailer}`);
            const synopsis = $('.movie-synopsis')
              .text()
              .trim();
            console.log(`Synopsis \n ${synopsis}`);
          });
        }
      });
  });
program.parse(process.argv);
