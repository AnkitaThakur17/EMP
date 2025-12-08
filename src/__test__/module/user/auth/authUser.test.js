import app from "~/index";
import request from 'supertest';
import path from "path";
import { LocalStorage } from "node-localstorage";

const fs = require('fs'),
    container = require('~/dependency'),
    commonHelpers = container.resolve("commonHelpers"),
    commonConstants = container.resolve("commonConstants"),
    BaseModel = container.resolve('BaseModel'),
    UserSchema = container.resolve('UserSchema'),
    UserOtpCountSchema = container.resolve('UserOtpCountSchema'),
    NotificationSchema = container.resolve('NotificationSchema');

var localStorage = new LocalStorage(path.join(process.cwd(), 'src/__test__/localStorage')),
    apiHeader = JSON.parse(localStorage.getItem('apiHeader')),
    userDetails = JSON.parse(localStorage.getItem('userDetails')).userfirst,
    passcode = ""

describe('User auth test cases', () => {
    beforeAll(async () => {        
        await BaseModel.deleteManyObjByQuery({}, UserSchema );
        await BaseModel.deleteManyObjByQuery({}, UserOtpCountSchema );
        await BaseModel.deleteManyObjByQuery({}, NotificationSchema );
    });

    test('test endpoint /user/v1/signUp when any header missing or entered wrong', async () => {
        const response = await request(app).post('/user/v1/signUp').set({});
        expect(response.body.code).toBe(100);
    });

    test('test endpoint /user/v1/signUp when device type header missing or entered wrong', async () => {  
        const header = { ...apiHeader }    
        header['device-type'] = '4'     
        const response = await request(app).post('/user/v1/signUp').set(header).send();
        expect(response.body.code).toBe(101);
    });

    test('test endpoint /user/v1/signUp when api key header missing or entered wrong', async () => {  
        const header = { ...apiHeader }    
        header['api-key'] = 'anjdgdiuhdikljgujgkhk'     
        const response = await request(app).post('/user/v1/signUp').set(header).send();
        expect(response.body.code).toBe(102);
    });

    test('test endpoint /user/v1/signUp when any keys are missing in from body', async () => {        
        const response = await request(app).post('/user/v1/signUp').set(apiHeader).send();      
        expect(response.body.code).toBe(105);
    });

    test('test endpoint /user/v1/signUp when one keys is missing in from body ', async () => {
        let data = { ...userDetails }
        delete data.email;       
        const response = await request(app).post('/user/v1/signUp').set(apiHeader).send(data);
        expect(response.body.code).toBe(105);
    });
    
    test('test endpoint /user/v1/signUp when entered invalid email format', async () => {
        let data = { ...userDetails }
        data["email"] = "abc@gamil";
        const response = await request(app).post('/user/v1/signUp').set(apiHeader).send(data);
        expect(response.body.code).toBe(105);
    });  

    test('test endpoint /user/v1/signUp when user License number should have minimum 8 digit', async () => {
        let data = { ...userDetails }
        const response = await request(app).post('/user/v1/signUp').set(apiHeader).send(data);
        expect(response.body.code).toBe(105);
    });

    test('test endpoint /user/v1/signUp when user signup successfully ', async () => {
        let data = { ...userDetails };
        data["licenseNumber"] = "67844542"
        const response = await request(app).post('/user/v1/signUp').set(apiHeader).send(data);
        expect(response.body.code).toBe(200);
        expect(response.body).toHaveProperty("data");
        apiHeader['access-token'] = response.body.data.token;
        localStorage.setItem('apiHeader', JSON.stringify(apiHeader));
    });

    test('test endpoint /user/v1/signUp when user email already exist', async () => {
        let data = { ...userDetails }; 
        data["licenseNumber"] = "67844502"
        const response = await request(app).post('/user/v1/signUp').set(apiHeader).send(data);
        expect(response.body.code).toBe(117);
    });

    test('test endpoint /user/v1/signUp when user phone number already exist', async () => {
        let data = { ...userDetails };
        data['email'] = 'any@gmail.com'
        data["licenseNumber"] = "67844512"        
        const response = await request(app).post('/user/v1/signUp').set(apiHeader).send(data);
        expect(response.body.code).toBe(118);
    });

    test('test endpoint /user/v1/signUp when user license number already exist ', async () => {
        let data = { ...userDetails };
        data['email'] = 'any@gmail.com'
        data['phoneNumber'] = '4654104578';
        data["licenseNumber"] = "67844542"
        const response = await request(app).post('/user/v1/signUp').set(apiHeader).send(data);
        expect(response.body.code).toBe(131);
    });

    // Test cases for user login api 

    test('test endpoint /user/v1/login when any header missing or entered wrong', async () => {
        const response = await request(app).post('/user/v1/login').set({});
        expect(response.body.code).toBe(100);
    });

    test('test endpoint /user/v1/login when any keys are missing in from body ', async () => {
        const response = await request(app).post('/user/v1/login').set(apiHeader).send({});
        expect(response.body.code).toBe(105);
    });

    test('test endpoint /user/v1/login when entered invalid email format', async () => {
        let data = { email: 'username@gmail', password: 'Mindiii@123' };
        const response = await request(app).post('/user/v1/login').set(apiHeader).send(data)
        expect(response.body.code).toBe(107);
    });

    test('test endpoint /user/v1/login when entered email not exists', async () => {
        let data = { email: "mindiii@mailinator.com", password: 'Test@123' };
        const response = await request(app).post('/user/v1/login').set(apiHeader).send(data)
        expect(response.body.code).toBe(107);
    });
    
    test('test endpoint /user/v1/login when entered invalid login credentials', async () => {
        let data = { email: "user1@gmail.com", password: 'Test@1233' };
        const response = await request(app).post('/user/v1/login').set(apiHeader).send(data);
        expect(response.body.code).toBe(111);
    });

    test('test endpoint /user/v1/login when user login successfully', async () => {
        let data = { email: "user1@gmail.com", password: 'Test@123' };
        const response = await request(app).post('/user/v1/login').set(apiHeader).send(data);
        apiHeader['access-token'] = response.body.data.token;
        localStorage.setItem('apiHeader', JSON.stringify(apiHeader));
        expect(response.body.code).toBe(200);
    });

    // // Test cases for user forgot password 

    test('test endpoint /user/v1/forgotPassword when any header missing or entered wrong', async () => {
        const response = await request(app).post('/user/v1/forgotPassword').set({});
        expect(response.body.code).toBe(100);
    });

    test('test endpoint /user/v1/forgotPassword when any keys are missing in from body ', async () => {
        const response = await request(app).post('/user/v1/forgotPassword').set(apiHeader).send();
        expect(response.body.code).toBe(105);
    });

    test('test endpoint /user/v1/forgotPassword when entered invalid email format', async () => {
        let data = { email: 'user1@gmail' };
        const response = await request(app).post('/user/v1/forgotPassword').set(apiHeader).send(data)
        expect(response.body.code).toBe(105);
    });

    test('test endpoint /user/v1/forgotPassword when entered email not exists', async () => {
        let data = { email: "users@swiftvan.com" };
        const response = await request(app).post('/user/v1/forgotPassword').set(apiHeader).send(data)
        expect(response.body.code).toBe(107);
    });

    test('test endpoint /user/v1/forgotPassword when email code send successfully', async () => {
        let data = { email: "user1@gmail.com" };
        const response = await request(app).post('/user/v1/forgotPassword').set(apiHeader).send(data);
        expect(response.body.code).toBe(200);
    });

    // Test cases for user reset password 

    test('test endpoint /user/v1/resetPassword when any header missing or entered wrong', async () => {
        const response = await request(app).put('/user/v1/resetPassword').set({});
        expect(response.body.code).toBe(100);
    });

    test('test endpoint /user/v1/resetPassword when any keys are missing in from body ', async () => {
        const response = await request(app).put('/user/v1/resetPassword').set(apiHeader).send();
        expect(response.body.code).toBe(105);
    });
    
    test('test endpoint /user/v1/resetPassword when entered password does not match', async () => {
        let data = { email: "user1@gmail.com", password: "Test@12", cnf_password: "Test@123", code: 1234 };

        const response = await request(app).put('/user/v1/resetPassword').set(apiHeader).send(data);
        expect(response.body.code).toBe(105);
    });

    test('test endpoint /user/v1/resetPassword when entered invalid email format', async () => {
        let data = { email: 'username@gmail', password: 'Mindiii@123' };
        const response = await request(app).put('/user/v1/resetPassword').set(apiHeader).send(data)
        expect(response.body.code).toBe(105);
    });

    test('test endpoint /user/v1/resetPassword when user not found (wrong email)', async () => {
        let data = { email: "user@mailinatr.com", password: "Test@1234", cnf_password: "Test@1234", code: 1234 };
        const response = await request(app).put('/user/v1/resetPassword').set(apiHeader).send(data);
        expect(response.body.code).toBe(107);
    });

    test('test endpoint /user/v1/resetPassword when entered code does not match', async () => {
        let data = { email: "user1@gmail.com", password: "Test@123", cnf_password: "Test@123", code: 1234 };
        const response = await request(app).put('/user/v1/resetPassword').set(apiHeader).send(data);
        expect(response.body.code).toBe(124);
    });

    test('test endpoint /user/v1/resetPassword when password reset successfully', async () => {
        passcode = await BaseModel.fetchSingleObj({ email: "user1@gmail.com" }, UserSchema, 'passCode');       
        let data = { email: "user1@gmail.com", password: "Test@123", cnf_password: "Test@123", code: passcode.passCode };        
        const response = await request(app).put('/user/v1/resetPassword').set(apiHeader).send(data);
        expect(response.body.code).toBe(200);
    });

    test('test endpoint /user/v1/resetPassword when password code is already used', async () => {
        let data = { email: "user1@gmail.com", password: "Test@123", cnf_password: "Test@123", code: passcode.passCode };
        const response = await request(app).put('/user/v1/resetPassword').set(apiHeader).send(data);
        expect(response.body.code).toBe(125);
    });

});