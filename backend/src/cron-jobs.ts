import * as cron from 'node-cron';
import { db } from './database';

const checkBalanceCron = async () => {
    try {
        await db.query("UPDATE account SET closed = true WHERE balance <= -100;")
    } catch (e) {
        console.log("Error in balance cron job\n", e);
    }
}

cron.schedule('0 12 * * *', checkBalanceCron)