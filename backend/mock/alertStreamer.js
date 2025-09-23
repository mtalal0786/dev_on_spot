import connectDB from '../config/db.js';
import SecurityAlert from '../models/SecurityAlert.js';
import { notifyEmailSubscribers } from '../services/alertNotifier.js';

async function startAlertStreamer() {
  await connectDB();
  console.log('🔄 Listening for new alerts...');

  const changeStream = SecurityAlert.watch([{ $match: { operationType: 'insert' } }]);

  changeStream.on('change', async (change) => {
    const alert = change.fullDocument;

    // Notify all subscribed users
    await notifyEmailSubscribers(alert);
  });

  changeStream.on('error', (err) => console.error('Change Stream error:', err));
}

startAlertStreamer();
