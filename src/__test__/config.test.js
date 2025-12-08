// This test file will only be use for initial config.
import path from "path";
import { LocalStorage } from "node-localstorage";
const container = require('~/dependency'),
  DateTimeUtil = container.resolve("DateTimeUtil"),
  currentTime = DateTimeUtil.getCurrentTimeObjForDB();

describe('Initial test configuration', () => {
  test('setting-up test configuration', () => {
    // constructor function to create a storage directory inside our project for test cases.
    var localStorage = new LocalStorage(path.join(__dirname, 'localStorage'));
    // Setting localStorage Item.

    localStorage.setItem('apiHeader', JSON.stringify(
      {
        'device-id': '12345',
        'device-type': 'web',
        'device-token': 'abcxyz',
        'api-key': 'EwdwpWUPSWMA3psnbJsGN33AF0I8R4HL',
        'access-token': ''
      }
    ));

    localStorage.setItem('userDetails', JSON.stringify(
      {
        userfirst : {
          'fullname': 'anything user',
          'email': 'user1@gmail.com',
          'dialCode': '+91',
          'phoneCountryCode': 'IN',
          'phoneNumber': '41652122235',
          'licenseNumber': '12345',
          'password': 'Test@123',
          'confirmPassword': 'Test@123',
        }
      }
    ));

  })
});
