const mongoose = require('mongoose');
const UsersSchema = require("../schemas/usersSchema");
require('dotenv').config();

let uriAddOn = process.env.ADDONURI;
const databases = [`${process.env.MONGOURI}${process.env.DB_NAME}${uriAddOn}`];

async function seedAdmin() {
    for (const mongoURI of databases) {
        console.log(`\nConnecting to database: ${mongoURI}`);
        try {
            await mongoose.connect(mongoURI);

            await UsersSchema.deleteMany({ role: 'admin' });

            const admin = new UsersSchema({
                fullname: 'Admin',
                email: 'admin@gmail.com',
                password: '$2a$10$4IxtnXoD5J5XxhyFp/die.f.ZdU9IJCcIstXH8f/tlof8/GmklWSa', // Admin@123
                role: 'admin',
                subrole: null,
                isActive: true,
            });

            await admin.save();
            console.log(`Admin user seeded successfully in database: ${mongoURI}`);
        } catch (error) {
            console.error(`Error seeding admin user in database ${mongoURI}:`, error);
        } finally {
            await mongoose.connection.close();
        }
    }
}

seedAdmin();
