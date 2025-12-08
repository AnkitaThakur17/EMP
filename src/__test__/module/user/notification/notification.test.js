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

describe('User notifications cases', () => {

    // Test cases for notification list api

    test('test endpoint /user/v1/notifications when any header missing or entered wrong', async () => {
        const response = await request(app).get('/user/v1/notifications').set({});
        expect(response.body.code).toBe(100);
    });

    test('test endpoint /user/v1/notifications when acccess token missing or wrong', async () => {
        const header = { ...apiHeader }
        header['access-token'] = ''
        const response = await request(app).get('/user/v1/notifications').set(header);
        expect(response.body.code).toBe(103);
    });

    let Notifications = [];
    test('test endpoint /user/v1/notifications when admin notifications fetch successfully', async () => {
        const query = { pageNumber : 1 }
        const response = await request(app).get('/user/v1/notifications').set(apiHeader).query(query);
        expect(response.body.code).toBe(200);            
        Notifications = response.body.data.notificationList;
    });
  
    // Test cases for change read status api

    test('test endpoint /user/v1/notificationRead when any header missing or entered wrong', async () => {
        const response = await request(app).patch('/user/v1/notificationRead').set({});
        expect(response.body.code).toBe(100);
    });

    test('test endpoint /user/v1/notificationRead when acccess token missing or wrong', async () => {
        const header = { ...apiHeader }
        header['access-token'] = ''
        const response = await request(app).patch('/user/v1/notificationRead').set(header);
        expect(response.body.code).toBe(103);
    });

    test('test endpoint /user/v1/notificationRead when provided notification id is wrong', async () => {
        const query = { notificationId : "guyegiuhfklfl"}
        const response = await request(app).patch(`/user/v1/notificationRead`).set(apiHeader).query(query);
        expect(response.body.code).toBe(140);
    });

    test('test endpoint /user/v1/notificationRead when notification read status changed', async () => {       
        const query = { notificationId : Notifications[0]._id }
        const response = await request(app).patch(`/user/v1/notificationRead`).set(apiHeader).query(query);
        expect(response.body.code).toBe(200);
    });

    // Test cases for user notification clear all api
    
    test('test endpoint /user/v1/clearNotifications when any header missing or entered wrong', async () => {
        const response = await request(app).get('/user/v1/clearNotifications').set({});
        expect(response.body.code).toBe(100);
    });

    test('test endpoint /user/v1/clearNotifications when acccess token missing or wrong', async () => {
        const header = { ...apiHeader }
        header['access-token'] = '';
        const response = await request(app).get('/user/v1/clearNotifications').set(header);
        expect(response.body.code).toBe(103);
    });
        
    test('test endpoint /user/v1/clearNotifications when clearNotifications successfully', async () => { 
        const response = await request(app).get(`/user/v1/clearNotifications`).set(apiHeader);
        expect(response.body.code).toBe(200);
    });
});