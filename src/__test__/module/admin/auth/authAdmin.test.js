import app from "~/index";
import request from 'supertest';
import path from "path";
import { LocalStorage } from "node-localstorage";

const fs = require('fs'),
    container = require('~/dependency'),
    commonHelpers = container.resolve("commonHelpers"),
    commonConstants = container.resolve("commonConstants"),
    BaseModel = container.resolve('BaseModel');
    AdminSchema = container.resolve('AdminSchema');

var localStorage = new LocalStorage(path.join(process.cwd(), 'src/__test__/localStorage')),
    apiHeader = JSON.parse(localStorage.getItem('apiHeader')),
    passcode = ""

describe('Admin auth test cases', () => {

    // Test cases for admin login api 

    test('test endpoint /admin/login when any header missing or entered wrong', async () => {
        const response = await request(app).post('/admin/login').set({});
        expect(response.body.code).toBe(100);
    });


    test('test endpoint /admin/login when any keys are missing in from body ', async () => {
        const response = await request(app).post('/admin/login').set(apiHeader).send({});
        expect(response.body.code).toBe(105);
    });

    test('test endpoint /admin/login when entered invalid email format', async () => {
        let data = { email: 'username@gmail', password: 'Mindiii@123' };

        const response = await request(app).post('/admin/login').set(apiHeader).send(data)
        expect(response.body.code).toBe(107);
    });

    test('test endpoint /admin/login when entered email not exists', async () => {
        let data = { email: "mindiii@mailinator.com", password: 'Admin@123' };

        const response = await request(app).post('/admin/login').set(apiHeader).send(data)
        expect(response.body.code).toBe(107);
    });
    test('test endpoint /admin/login when admin login successfully', async () => {
        let data = { email: "frontier@mailinator.com", password: 'Admin@123' };
        const response = await request(app).post('/admin/login').set(apiHeader).send(data);
        apiHeader['access-token'] = response.body.data.token;
        localStorage.setItem('apiHeader', JSON.stringify(apiHeader));
        expect(response.body.code).toBe(200);
    });

    test('test endpoint /admin/login when entered invalid login credentials', async () => {
        let data = { email: "admin@mailinator.com", password: 'Admin@123' };

        const response = await request(app).post('/admin/login').set(apiHeader).send(data),
            resBody = response.body;
        expect(response.body.code).toBe(107);
    });

    // test('test endpoint /admin/login when entered status is inactive', async () => {
    //     let data = { email: "mindiii@mailinator.com", password: 'Admin@12345'};
    //     await BaseModel.updateObj({'is_active':0}, {email: "mindiii@mailinator.com"}, tableConstants.TB_ADMIN);

    //     const response = await request(app).post('/admin/login').set(apiHeader).send(data),
    //         resBody = response.body;
    //     expect(response.body.code).toBe(113);
    //     await BaseModel.updateObj({'is_active':1}, {email: "mindiii@mailinator.com"}, tableConstants.TB_ADMIN);

    // });

    // Test cases for admin forgot password 

    test('test endpoint /admin/forgotPassword when any header missing or entered wrong', async () => {
        const response = await request(app).post('/admin/forgotPassword').set({});
        expect(response.body.code).toBe(100);
    });


    test('test endpoint /admin/forgotPassword when any keys are missing in from body ', async () => {
        const response = await request(app).post('/admin/forgotPassword').set(apiHeader).send();
        expect(response.body.code).toBe(105);
    });

    test('test endpoint /admin/forgotPassword when entered invalid email format', async () => {
        let data = { email: 'username@gmail', password: 'Mindiii@123' };

        const response = await request(app).post('/admin/forgotPassword').set(apiHeader).send(data),
            resBody = response.body;
        expect(response.body.code).toBe(105);
    });

    test('test endpoint /admin/forgotPassword when entered email not exists', async () => {
        let data = { email: "admins@swiftvan.com" };

        const response = await request(app).post('/admin/forgotPassword').set(apiHeader).send(data),
            resBody = response.body;
        expect(response.body.code).toBe(107);
    });

    test('test endpoint /admin/forgotPassword when email code not send successfully', async () => {
        let data = { email: "admins@swiftvan.com" };

        const response = await request(app).post('/admin/forgotPassword').set(apiHeader).send(data);
        expect(response.body.code).toBe(107);

    }, 8000);

    test('test endpoint /admin/forgotPassword when email code send successfully', async () => {
        let data = { email: "frontier@mailinator.com" };

        const response = await request(app).post('/admin/forgotPassword').set(apiHeader).send(data);
        expect(response.body.code).toBe(200);

    });

    // Test cases for admin reset password 

    test('test endpoint /admin/resetPassword when any header missing or entered wrong', async () => {
        const response = await request(app).put('/admin/resetPassword').set({});
        expect(response.body.code).toBe(100);
    });

    test('test endpoint /admin/resetPassword when any keys are missing in from body ', async () => {
        const response = await request(app).put('/admin/resetPassword').set(apiHeader).send();
        expect(response.body.code).toBe(105);
    });

    test('test endpoint /admin/resetPassword when entered invalid email format', async () => {
        let data = { email: 'username@gmail', password: 'Mindiii@123' };

        const response = await request(app).put('/admin/resetPassword').set(apiHeader).send(data),
            resBody = response.body;
        expect(response.body.code).toBe(105);
    });

    test('test endpoint /admin/resetPassword when entered password does not match', async () => {
        let data = { email: "frontier@mailinator.com", password: "Admin@12", cnf_password: "Admin@123", code: 1234 };

        const response = await request(app).put('/admin/resetPassword').set(apiHeader).send(data);
        expect(response.body.code).toBe(105);
    });

    test('test endpoint /admin/resetPassword when admin not found (wrong email)', async () => {
        let data = { email: "admin@mailinatr.com", password: "Admin@1234", cnf_password: "Admin@1234", code: 1234 };

        const response = await request(app).put('/admin/resetPassword').set(apiHeader).send(data);
        expect(response.body.code).toBe(130);
    });

    test('test endpoint /admin/resetPassword when entered code does not match', async () => {
        let data = { email: "frontier@mailinator.com", password: "Admin@123", cnf_password: "Admin@123", code: 1234 };

        const response = await request(app).put('/admin/resetPassword').set(apiHeader).send(data);
        expect(response.body.code).toBe(124);
    });

    test('test endpoint /admin/resetPassword when password reset successfully', async () => {
        passcode = await BaseModel.fetchSingleObj({ email: "frontier@mailinator.com" }, AdminSchema, 'passCode');       
        let data = { email: "frontier@mailinator.com", password: "Admin@123", cnf_password: "Admin@123", code: passcode.passCode };        
        const response = await request(app).put('/admin/resetPassword').set(apiHeader).send(data);
        expect(response.body.code).toBe(200);
    });

    test('test endpoint /admin/resetPassword when password code is already used', async () => {
        let data = { email: "frontier@mailinator.com", password: "Admin@123", cnf_password: "Admin@123", code: passcode.passCode };
        const response = await request(app).put('/admin/resetPassword').set(apiHeader).send(data);
        expect(response.body.code).toBe(125);
    });
});