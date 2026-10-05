import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';

let client = null;
let isReady = false;

export const initializeWhatsApp = () => {
  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  client.on('qr', (qr) => {
    console.log('\n======================================================');
    console.log('📲 WhatsApp Authentication Required!');
    console.log('Please scan the QR code below using your WhatsApp app:');
    console.log('Open WhatsApp -> Linked Devices -> Link a Device');
    console.log('======================================================\n');
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    isReady = true;
    console.log('\n======================================================');
    console.log('✅ WhatsApp Client is READY and authenticated!');
    console.log('Automatic SOS messages will now be sent via WhatsApp.');
    console.log('======================================================\n');
  });

  client.on('auth_failure', msg => {
    console.error('❌ WhatsApp Authentication failure:', msg);
    isReady = false;
  });

  client.on('disconnected', (reason) => {
    console.log('❌ WhatsApp Client was disconnected:', reason);
    isReady = false;
    // Attempt to re-initialize or user needs to restart server
  });

  console.log('⏳ Initializing WhatsApp Client. Please wait...');
  client.initialize();
};

const waitForReady = async (timeoutMs = 15000) => {
  if (isReady) return true;
  return new Promise((resolve, reject) => {
    let checkInterval = setInterval(() => {
      if (isReady) {
        clearInterval(checkInterval);
        resolve(true);
      }
    }, 500);
    setTimeout(() => {
      clearInterval(checkInterval);
      if (!isReady) reject(new Error('WhatsApp client timeout waiting for READY state'));
    }, timeoutMs);
  });
};

export const sendWhatsAppSOS = async (contactNumbers, mapsLink) => {
  if (!client) {
    throw new Error('WhatsApp client is not initialized.');
  }

  try {
    await waitForReady(15000);
  } catch (err) {
    throw new Error('WhatsApp client is not ready. Please check backend terminal to authenticate.');
  }

  const messageText = `🚨 *EMERGENCY ALERT!* 🚨\n\nI need help right now.\nMy live location:\n${mapsLink}\n\n_Please respond immediately!_`;
  
  const results = [];

  for (let number of contactNumbers) {
    try {
      // Safely format number to WhatsApp ID
      let cleanNumber = String(number).replace(/\D/g, '');
      
      // Default to India (+91) if 10 digits
      if (cleanNumber.length === 10) {
        cleanNumber = '91' + cleanNumber;
      }

      const chatId = `${cleanNumber}@c.us`;
      
      console.log(`Verifying WhatsApp number for ${cleanNumber}...`);
      
      // Check if number is actually registered on WhatsApp to prevent unhandled promise rejection crashes
      const isRegistered = await client.getNumberId(chatId);
      
      if (!isRegistered) {
        console.warn(`❌ Number ${cleanNumber} is not registered on WhatsApp.`);
        results.push({ number: cleanNumber, status: 'failed', error: 'Not registered on WhatsApp' });
        continue;
      }

      console.log(`Sending WhatsApp SOS to ${cleanNumber}...`);
      await client.sendMessage(isRegistered._serialized, messageText);
      console.log(`✅ Message sent to ${cleanNumber}`);
      results.push({ number: cleanNumber, status: 'success' });
      
    } catch (error) {
      console.error(`❌ Failed to send WhatsApp message to ${number}:`, error);
      results.push({ number, status: 'failed', error: error.message || 'Unknown WhatsApp Error' });
    }
  }

  // If all failed, we might want to know, but we still return 200 to frontend so it doesn't crash the UI completely
  return results;
};
