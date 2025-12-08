const Sequencer = require('@jest/test-sequencer').default;
const path = require('path');

class TestSequencer extends Sequencer {
  /**
  * Sort test to determine order of execution
  * Sorting is applied after sharding
  * In order to execute test in non-parallel manner use CLI flag(--runInBand).
  * CLI CMD yarn jest --testSequencer="./src/__test__/testSequencer.js" --runInBand
  */
  sort(tests) {
    const orderPath = [
      path.join(process.cwd(), 'src/__test__/config.test.js'),
      path.join(process.cwd(), 'src/__test__/module/user/auth/authUser.test.js'),
      path.join(process.cwd(), 'src/__test__/module/user/profile/profileUser.test.js'),
      path.join(process.cwd(), 'src/__test__/module/user/notification/notification.test.js'),
      path.join(process.cwd(), 'src/__test__/module/admin/auth/authAdmin.test.js'),
      path.join(process.cwd(), 'src/__test__/module/admin/profile/profileAdmin.test.js'),
      path.join(process.cwd(), 'src/__test__/module/admin/notification/notification.test.js'),
    ];

    console.log('Inside testSequencer');
    console.log(orderPath);
    return tests.sort((testA, testB) => {
      const indexA = orderPath.indexOf(testA.path);
      const indexB = orderPath.indexOf(testB.path);
      if (indexA === indexB) return 0; // do not swap when tests both not specify in order.
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA < indexB ? -1 : 1;
    })
  }
}

module.exports = TestSequencer;