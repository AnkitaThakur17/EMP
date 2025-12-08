import app from "~/index";
import request from 'supertest';
import path from "path";
import { LocalStorage } from "node-localstorage";

const fs = require('fs'),
    container = require('~/dependency'),
    commonHelpers = container.resolve("commonHelpers"),
    commonConstants = container.resolve("commonConstants");

var localStorage = new LocalStorage(path.join(process.cwd(), 'src/__test__/localStorage')),
    apiHeader = JSON.parse(localStorage.getItem('apiHeader')),
    passcode = ""

describe('Admin profile test cases', () => {

    // Test cases for admin get profile api 

    test('test endpoint /admin/profile when any header missing or entered wrong', async () => {
        const response = await request(app).get('/admin/profile').set({});
        expect(response.body.code).toBe(100);
    });

    test('test endpoint /admin/profile when acccess token missing or wrong', async () => {
        const header = { ...apiHeader }
        header['access-token'] = ''
        const response = await request(app).get('/admin/profile').set(header);
        expect(response.body.code).toBe(103);
    });

    let adminProfile;
    test('test endpoint /admin/profile when admin profile fetch successfully', async () => {
        const response = await request(app).get('/admin/profile').set(apiHeader);
        expect(response.body.code).toBe(200);
        adminProfile = response.body.data;
    });

    // Test cases for update admin profile api

    test('test endpoint /admin/profile when any header missing or entered wrong', async () => {
        const response = await request(app).put('/admin/profile').set({});
        expect(response.body.code).toBe(100);
    });

    test('test endpoint /admin/profile when acccess token missing or wrong', async () => {
        const header = { ...apiHeader }
        header['access-token'] = ''
        const response = await request(app).put('/admin/profile').set(header);
        expect(response.body.code).toBe(103);
    });

    test('test endpoint /admin/profile when any key missing or wrong from body', async () => {
        const response = await request(app).put('/admin/profile').set(apiHeader).send({});
        expect(response.body.code).toBe(105);
    });

    test('test endpoint /admin/profile when admin profile update  successfully', async () => {
        const data = { fullname : adminProfile.fullname };
        const response = await request(app).put('/admin/profile').set(apiHeader).send(data);
        expect(response.body.code).toBe(200);
    });

    // Test cases for change password api

    test('test endpoint /admin/changePassword when any header missing or entered wrong', async () => {
        const response = await request(app).put('/admin/changePassword').set({});
        expect(response.body.code).toBe(100);
    });

    test('test endpoint /admin/changePassword when acccess token missing or wrong', async () => {
        const header = { ...apiHeader }
        header['access-token'] = ''
        const response = await request(app).put('/admin/changePassword').set(header);
        expect(response.body.code).toBe(103);
    });

    test('test endpoint /admin/changePassword when any key missing or wrong from body', async () => {
        const response = await request(app).put('/admin/changePassword').set(apiHeader).send({});
        expect(response.body.code).toBe(105);
    });

    test('test endpoint /admin/changePassword when old password is not match', async () => {
        const sendData = { old_password: 'Test@1234', new_password: 'test@1234', confirm_password: 'test@1234' }
        const response = await request(app).put('/admin/changePassword').set(apiHeader).send(sendData);
        expect(response.body.code).toBe(105);
    });

    test('test endpoint /admin/changePassword when old password is changed successfully', async () => {
        const sendData = { oldPassword: 'Admin@123', newPassword : 'Admin@123', cnfPassword: 'Admin@123' }
        const response = await request(app).put('/admin/changePassword').set(apiHeader).send(sendData);
        expect(response.body.code).toBe(200);
    });

    // Test cases for admin pageContent

    test('test endpoint /admin/pageContent when any header missing or entered wrong', async () => {
        const response = await request(app).put('/admin/pageContent').set({});
        expect(response.body.code).toBe(100);
    });

    test('test endpoint /admin/pageContent when acccess token missing or wrong', async () => {
        const header = { ...apiHeader }
        header['access-token'] = ''
        const response = await request(app).put('/admin/pageContent').set(header);
        expect(response.body.code).toBe(103);
    });
    
    test('test endpoint /admin/pageContent when any key is missing from body', async () => {
        const header = { ...apiHeader }
        const data = { name : "aboutUs" }
        const response = await request(app).put('/admin/pageContent').set(header).send(data);
        expect(response.body.code).toBe(105);
    });
    
    test('test endpoint /admin/pageContent when page content added successfully', async () => {
        const header = { ...apiHeader }
        const data = { name : "aboutUs", content : "this is about us page content" } // "termsCondition", "privacyPolicy"
        const response = await request(app).put('/admin/pageContent').set(header).send(data);
        expect(response.body.code).toBe(200);
    });

    // Test cases for admin get pageContent

    test('test endpoint /admin/pageContent when any header missing or entered wrong', async () => {
        const response = await request(app).get('/admin/pageContent').set({});
        expect(response.body.code).toBe(100);
    });

    test('test endpoint /admin/pageContent when any key is missing from body', async () => {
        const header = { ...apiHeader }
        const response = await request(app).get('/admin/pageContent').set(header).send({});
        expect(response.body.code).toBe(105);
    });
    
    test('test endpoint /admin/pageContent when page content added successfully', async () => {
        const header = { ...apiHeader }
        const data = { pageName : "aboutUs" } // "termsCondition", "privacyPolicy"
        const response = await request(app).get('/admin/pageContent').set(header).query(data);
        expect(response.body.code).toBe(200);
    });

    // Test cases for admin logout  api

    test('test endpoint /admin/logout when any header missing or entered wrong', async () => {
        const response = await request(app).get('/admin/logout').set({});
        expect(response.body.code).toBe(100);
    });

    test('test endpoint /admin/logout when acccess token missing or wrong', async () => {
        const header = { ...apiHeader }
        header['access-token'] = ''
        const response = await request(app).get('/admin/logout').set(header);
        expect(response.body.code).toBe(103);
    });

    // test('test endpoint /admin/logout when admin logout successfully', async () => {
    //     const header = { ...apiHeader }
    //     const response = await request(app).get('/admin/logout').set(header);
    //     expect(response.body.code).toBe(200);
    // });

});