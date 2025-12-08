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

describe('Admin notifications cases', () => {

    // // Test cases for send broadCast api

    test('test endpoint /admin/sendBroadcast when any header missing or entered wrong', async () => {
        const response = await request(app).post('/admin/sendBroadcast').set({});
        expect(response.body.code).toBe(100);
    });

    test('test endpoint /admin/sendBroadcast when acccess token missing or wrong', async () => {
        const header = { ...apiHeader }
        header['access-token'] = ''
        const response = await request(app).post('/admin/sendBroadcast').set(header);
        expect(response.body.code).toBe(103);
    });

    test('test endpoint /admin/sendBroadcast when any key missing from body', async () => {
        const sendData = {}
        const response = await request(app).post(`/admin/sendBroadcast`).set(apiHeader).send(sendData);
        expect(response.body.code).toBe(105);
    });

    test('test endpoint /admin/sendBroadcast when broadcast mesage is send to all users successfully', async () => {
        const sendData = { title : "broadcast message", description : "decription is for all useer", userId : ''}
        const response = await request(app).post(`/admin/sendBroadcast`).set(apiHeader).send(sendData); 
        expect(response.body.code).toBe(200);
    });

    // test('test endpoint /admin/sendBroadcast when user id is provided wrong', async () => {
    //     const sendData = {}
    //     const response = await request(app).post(`/admin/sendBroadcast}`).set(apiHeader).send(sendData);
    //     expect(response.body.code).toBe(137);
    // });

    test('test endpoint /admin/sendBroadcast when broadcast mesage is send to specific users successfully', async () => {
        const sendData = { title : "broadcast message", description : "decription is for sepcific useer", userId : "676baf5bcae90957fcce03cb"}
        const response = await request(app).post(`/admin/sendBroadcast`).set(apiHeader).send(sendData);
        expect(response.body.code).toBe(200);
    });

    // Test cases for admin broadCastNotifications list api 
    
    test('test endpoint /admin/broadCastNotifications when any header missing or entered wrong', async () => {
        const response = await request(app).get('/admin/broadCastNotifications').set({});
        expect(response.body.code).toBe(100);
    });

    test('test endpoint /admin/broadCastNotifications when acccess token missing or wrong', async () => {
        const header = { ...apiHeader }
        header['access-token'] = ''
        const response = await request(app).get('/admin/broadCastNotifications').set(header);
        expect(response.body.code).toBe(103);
    });

    let broadCastNotifications = [];
    test('test endpoint /admin/broadCastNotifications when admin broadCastNotifications fetch successfully', async () => {
        const query = { pageNo : 1 }
        const response = await request(app).get('/admin/broadCastNotifications').set(apiHeader).query(query);
        expect(response.body.code).toBe(200);      
        broadCastNotifications = response.body.data.notificationList;
    });

    // Test cases for delete broadcastenotifications

    test('test endpoint /admin/broadCastNotifications when any header missing or entered wrong', async () => {
        const response = await request(app).delete('/admin/broadCastNotification').set({});
        expect(response.body.code).toBe(100);
    });

    test('test endpoint /admin/broadCastNotifications when acccess token missing or wrong', async () => {
        const header = { ...apiHeader }
        header['access-token'] = ''
        const response = await request(app).delete('/admin/broadCastNotification').set(header);
        expect(response.body.code).toBe(103);
    });

    test('test endpoint /admin/broadCastNotifications when admin broadCastNotification id is wrong', async () => {
        const query = { ids : "t78268tnkjhikhkj" }
        const response = await request(app).delete('/admin/broadCastNotification').set(apiHeader).query(query);
        expect(response.body.code).toBe(140);      
    });

    test('test endpoint /admin/broadCastNotifications when admin broadCastNotifications delete successfully', async () => {
        const query = { ids : `${broadCastNotifications[0]._id}`  }
        const response = await request(app).delete('/admin/broadCastNotification').set(apiHeader).query(query);
        expect(response.body.code).toBe(200);
    });

    // test('test endpoint /admin/broadCastNotifications when multiples broadCastNotifications delete successfully', async () => {
    //     const query = { ids : `${broadCastNotifications[0]._id},${broadCastNotifications[1]._id}`  }
    //     const response = await request(app).delete('/admin/broadCastNotification').set(apiHeader).query(query);
    //     expect(response.body.code).toBe(200);
    // });


    // Test cases for notification list api

    test('test endpoint /admin/notifications when any header missing or entered wrong', async () => {
        const response = await request(app).get('/admin/notifications').set({});
        expect(response.body.code).toBe(100);
    });

    test('test endpoint /admin/notifications when acccess token missing or wrong', async () => {
        const header = { ...apiHeader }
        header['access-token'] = ''
        const response = await request(app).get('/admin/notifications').set(header);
        expect(response.body.code).toBe(103);
    });

    let Notifications = [];
    test('test endpoint /admin/notifications when admin notifications fetch successfully', async () => {
        const query = { pageNumber : 1 }
        const response = await request(app).get('/admin/notifications').set(apiHeader).query(query);
        expect(response.body.code).toBe(200);     
        Notifications = response.body.data.notificationList;
    });
  
    // Test cases for change read status api

    test('test endpoint /admin/notificationRead when any header missing or entered wrong', async () => {
        const response = await request(app).patch('/admin/notificationRead').set({});
        expect(response.body.code).toBe(100);
    });

    test('test endpoint /admin/notificationRead when acccess token missing or wrong', async () => {
        const header = { ...apiHeader }
        header['access-token'] = ''
        const response = await request(app).patch('/admin/notificationRead').set(header);
        expect(response.body.code).toBe(103);
    });

    test('test endpoint /admin/notificationRead when provided notification id is wrong', async () => {
        const query = { notificationId : "guyegiuhfklfl"}
        const response = await request(app).patch(`/admin/notificationRead`).set(apiHeader).query(query);
        expect(response.body.code).toBe(140);
    });

    // working only for condition where admin have notification in list
    // test('test endpoint /admin/notificationRead when notification read status changed', async () => {       
    //     const query = { notificationId : Notifications[0]._id }
    //     const response = await request(app).patch(`/admin/notificationRead`).set(apiHeader).query(query);
    //     expect(response.body.code).toBe(200);
    // });

    // Test cases for admin notification delete api
    
    test('test endpoint /admin/clearNotifications when any header missing or entered wrong', async () => {
        const response = await request(app).delete('/admin/clearNotifications').set({});
        expect(response.body.code).toBe(100);
    });

    test('test endpoint /admin/clearNotifications when acccess token missing or wrong', async () => {
        const header = { ...apiHeader }
        header['access-token'] = '';
        const response = await request(app).delete('/admin/clearNotifications').set(header);
        expect(response.body.code).toBe(103);
    });
        
    test('test endpoint /admin/clearNotifications when clearNotifications successfully', async () => { 
        const response = await request(app).delete(`/admin/clearNotifications`).set(apiHeader);
        expect(response.body.code).toBe(200);
    });
});