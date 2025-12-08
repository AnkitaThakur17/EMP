// /**
//  * This code is written for running seeds for multiple MongoDB databases.
//  * To run this code, use the command: node seed_runner.js
//  */
// const prompt = require('prompt-sync')();
// const path = require('path');
// const fs = require('fs');
// const { exec, execSync } = require('child_process');

// const command = prompt('Enter the seed command (all|specific):');
// if (!['all', 'specific'].includes(command)) {
//     console.log("Invalid command!");
//     return false;
// }

// require('dotenv').config();

// async function runSeed(seedFile = null) {
//     console.log('********* Running seeds for databases *********');
//     const seedDir = path.join(__dirname, 'src', 'seeds');

//     if (command === 'all') {
//         const files = fs.readdirSync(seedDir).filter(file => file.endsWith('.js'));
//         for (const file of files) {
//             exec(`node src/seeds/${file}`, (error) => {
//                 if (error) {
//                     console.error(`exec error: ${error}`);
//                     return;
//                 }
//                 console.log(`Running seed file: ${file}`);
//             });
//         }
//     } else if (command === 'specific') {
//         if (seedFile) {
//             const seedPath = path.join(seedDir, seedFile);
//             if (fs.existsSync(seedPath)) {
//                 try {
//                     execSync(`node src/seeds/${seedFile}`, { stdio: 'inherit' });
//                     console.log(`Finished running seed file: ${seedFile}`);
//                 } catch (error) {
//                     console.error(`exec error: ${error}`);
//                 }
//             } else {
//                 console.log("Specified seed file does not exist.");
//             }
//         } else {
//             console.log("Please provide a seed file name.");
//         }
//     }
// }

// (async () => {
//     console.log(`\n********* Running seeds for databases *********`);
//     const seedFile = command === 'specific' ? prompt('Enter the specific seed file name (e.g., adminSeed.js):') : null;
//     await runSeed(seedFile);
// })();


/**
 * This code is written for running seeds for multiple MongoDB databases.
 * To run this code, use the command: node seed_runner.js
 */
const prompt = require('prompt-sync')();
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
require('dotenv').config();

const command = prompt('Enter the seed command (all|specific): ').trim();

if (!['all', 'specific'].includes(command)) {
//   console.log('Invalid command! Use "all" or "specific".');
  process.exit(1);
}

async function runSeed(seedFile = null) {
  console.log('\n********* Running seeds for databases *********');
  const seedDir = path.join(__dirname, 'src', 'seeds');

  // If 'all' — run all seed files in src/seeds
  if (command === 'all') {
    const files = fs.readdirSync(seedDir).filter(file => file.endsWith('.js'));

    for (const file of files) {
    //   console.log(`\n Running seed file: ${file}`);
      try {
        execSync(`node ${path.join(seedDir, file)}`, { stdio: 'inherit' });
        // console.log(`Finished running ${file}`);
      } catch (error) {
        console.error(` Error running ${file}:`, error.message);
      }
    }
  }

  //  If 'specific' — run a single seed file
  else if (command === 'specific') {
    if (!seedFile) {
      console.log('Please provide a seed file name.');
      return;
    }

    const seedPath = path.join(seedDir, seedFile);
    if (!fs.existsSync(seedPath)) {
      console.log('Specified seed file does not exist.');
      return;
    }

    try {
      console.log(`\nRunning seed file: ${seedFile}`);
      execSync(`node ${seedPath}`, { stdio: 'inherit' });
      console.log(`Finished running ${seedFile}`);
    } catch (error) {
      console.error(`Error running ${seedFile}:`, error.message);
    }
  }
}

// Run the seeder
(async () => {
  const seedFile = command === 'specific' ? prompt('Enter the specific seed file name (e.g., adminSeed.js): ') : null;
  await runSeed(seedFile);
})();
