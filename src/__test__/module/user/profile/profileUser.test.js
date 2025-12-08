import app from "~/index";
import request from 'supertest';
import path from "path";
import { LocalStorage } from "node-localstorage";

const fs = require('fs'),
    container = require('~/dependency'),
    commonHelpers = container.resolve("commonHelpers"),
    commonConstants = container.resolve("commonConstants");

var localStorage = new LocalStorage(path.join(process.cwd(), 'src/__test__/localStorage')),
    apiHeader = JSON.parse(localStorage.getItem('apiHeader'));


describe('User profile test cases', () => {

    // Test cases for user get profile api 

    test('test endpoint /user/v1/profile when any header missing or entered wrong', async () => {
        const response = await request(app).get('/user/v1/profile').set({});
        expect(response.body.code).toBe(100);
    });

    test('test endpoint /user/v1/profile when acccess token missing or wrong', async () => {
        const header = { ...apiHeader }
        header['access-token'] = ''
        const response = await request(app).get('/user/v1/profile').set(header);
        expect(response.body.code).toBe(103);
    });

    let userProfile;
    test('test endpoint /user/v1/profile when admin profile fetch successfully', async () => {
        const response = await request(app).get('/user/v1/profile').set(apiHeader);
        expect(response.body.code).toBe(200);
        userProfile = response.body.data;
    });

    // Test cases for update admin profile api

    test('test endpoint /user/v1/profile when any header missing or entered wrong', async () => {
        const response = await request(app).put('/user/v1/profile').set({});
        expect(response.body.code).toBe(100);
    });

    test('test endpoint /user/v1/profile when acccess token missing or wrong', async () => {
        const header = { ...apiHeader }
        header['access-token'] = ''
        const response = await request(app).put('/user/v1/profile').set(header);
        expect(response.body.code).toBe(103);
    });

    test('test endpoint /user/v1/profile when any key missing or wrong from body', async () => {
        const response = await request(app).put('/user/v1/profile').set(apiHeader).send({});
        expect(response.body.code).toBe(105);
    });

    test('test endpoint /user/v1/profile when admin profile update  successfully', async () => {
        const data = { fullname: userProfile.fullname, licenseNumber: "46545565" };
        const response = await request(app).put('/user/v1/profile').set(apiHeader).send(data);
        expect(response.body.code).toBe(200);
    });

    // Test cases for change password api

    test('test endpoint /user/v1/changePassword when any header missing or entered wrong', async () => {
        const response = await request(app).put('/user/v1/changePassword').set({});
        expect(response.body.code).toBe(100);
    });

    test('test endpoint /user/v1/changePassword when acccess token missing or wrong', async () => {
        const header = { ...apiHeader }
        header['access-token'] = ''
        const response = await request(app).put('/user/v1/changePassword').set(header);
        expect(response.body.code).toBe(103);
    });

    test('test endpoint /user/v1/changePassword when any key missing or wrong from body', async () => {
        const response = await request(app).put('/user/v1/changePassword').set(apiHeader).send({});
        expect(response.body.code).toBe(105);
    });

    test('test endpoint /user/v1/changePassword when old password is not match', async () => {
        const sendData = { oldPassword: 'Test@1234', newPassword: 'test@1234', cnfPassword: 'test@1234' }
        const response = await request(app).put('/user/v1/changePassword').set(apiHeader).send(sendData);
        expect(response.body.code).toBe(105);
    });

    test('test endpoint /user/v1/changePassword when old password is changed successfully', async () => {
        const sendData = { oldPassword: 'Test@123', newPassword: 'Test@123', cnfPassword: 'Test@123' }
        const response = await request(app).put('/user/v1/changePassword').set(apiHeader).send(sendData);
        expect(response.body.code).toBe(200);
    });

    // Test cases for admin get pageContent

    test('test endpoint /user/v1/pageContent when any header missing or entered wrong', async () => {
        const response = await request(app).get('/user/v1/pageContent').set({});
        expect(response.body.code).toBe(100);
    });

    test('test endpoint /user/v1/pageContent when any key is missing from body', async () => {
        const header = { ...apiHeader }
        const response = await request(app).get('/user/v1/pageContent').set(header).send({});
        expect(response.body.code).toBe(105);
    });

    test('test endpoint /user/v1/pageContent when page content added successfully', async () => {
        const header = { ...apiHeader }
        const data = { pageName: "aboutUs" } // "termsCondition", "privacyPolicy"
        const response = await request(app).get('/user/v1/pageContent').set(header).query(data);
        expect(response.body.code).toBe(200);
    });

    // Test cases for change notification status

    test('test endpoint /user/v1/notificationStatus when any header missing or entered wrong', async () => {
        const response = await request(app).put('/user/v1/notificationStatus').set({});
        expect(response.body.code).toBe(100);
    });

    test('test endpoint /user/v1/notificationStatus when acccess token missing or wrong', async () => {
        const header = { ...apiHeader }
        header['access-token'] = ''
        const response = await request(app).put('/user/v1/notificationStatus').set(header);
        expect(response.body.code).toBe(103);
    });

    test('test endpoint /user/v1/notificationStatus when notifiaction status is changed successfully', async () => {
        const response = await request(app).put('/user/v1/notificationStatus').set(apiHeader);
        expect(response.body.code).toBe(200);
    });

    // Test cases for update image (profile or license)

    test('test endpoint /user/v1/updateUserImg when any header missing or entered wrong', async () => {
        const response = await request(app).put('/user/v1/updateUserImg').set({});
        expect(response.body.code).toBe(100);
    });

    test('test endpoint /user/v1/updateUserImg when acccess token missing or wrong', async () => {
        const header = { ...apiHeader }
        header['access-token'] = ''
        const response = await request(app).put('/user/v1/updateUserImg').set(header);
        expect(response.body.code).toBe(103);
    });

    test('test endpoint /user/v1/updateUserImg when any key missing from body', async () => {
        const response = await request(app).put('/user/v1/updateUserImg').set(apiHeader).send();
        expect(response.body.code).toBe(105);
    });

});