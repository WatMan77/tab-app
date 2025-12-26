import * as cron from 'node-cron';
import { db } from './database';
import { io } from '..';
const checkBalanceCron = async () => {
    try {
        await db`
        UPDATE account
        SET closed = true
        WHERE balance <= 0
        `;
        io.emit('accounts-updated');
    } catch (e) {
        console.log("Error in balance cron job\n", e);
    }
};

cron.schedule('0 12 * * *', checkBalanceCron);
