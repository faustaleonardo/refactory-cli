#!/usr/bin/env node
const os = require('os');
const https = require('https');

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

program.parse(process.argv);

/**---------------------------------------------------------------- */
program
  .command('convert <input> <output>')
  .description('import from or export to CSV / XLS / XLSX file')
  .action((input, output) => {
    const workbook = XLSX.readFile(input);
    XLSX.writeFile(workbook, output);
  });

/**---------------------------------------------------------------- */
// CONTINUE TOMORROW
program
  .command('screenshot <url>')
  .description('Get a screenshot from a URL')
  .action(async url => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    await page.screenshot({ path: 'example.png' });

    await browser.close();
  });
program.parse(process.argv);
