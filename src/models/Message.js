const db = require('../../config/db');
const moment = require('moment-timezone');

const Message = {
    async createMessage(name, email, message, company) {
        try {
            const nowDate = moment().tz('America/Sao_Paulo').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'); // Current date and time in UTC
            let contactId;

            // Check if the contact already exists
            const [existingContact] = await db.promise().query(
                'SELECT PF_ContactReceiptID, Company FROM PF_ContactReceipt WHERE Email = ?',
                [email]
            );

            if (existingContact.length > 0) {
                contactId = existingContact[0].PF_ContactReceiptID;

                // Update history if the company has changed
                if (existingContact[0].Company !== company) {
                    await db.promise().query(
                        'INSERT INTO PF_ContactCompanyHistory (PF_ContactReceiptID, OldCompany, NewCompany, ChangeDate) VALUES (?, ?, ?, ?)',
                        [contactId, existingContact[0].Company, company, nowDate]
                    );

                    // Update the company in the contact
                    await db.promise().query(
                        'UPDATE PF_ContactReceipt SET Company = ? WHERE PF_ContactReceiptID = ?',
                        [company, contactId]
                    );
                }
            } else {
                // Create new contact
                const [insertContactResult] = await db.promise().query(
                    'INSERT INTO PF_ContactReceipt (Name, Email, CreateDate, Company) VALUES (?, ?, ?, ?)',
                    [name, email, nowDate, company || null]
                );
                contactId = insertContactResult.insertId;
            }

            // Insert message
            const [insertMessageResult] = await db.promise().query(
                'INSERT INTO PF_MessageReceipt (Message, CreateDate, PF_ContactReceiptID) VALUES (?, ?, ?)',
                [message, nowDate, contactId]
            );

            return insertMessageResult.insertId;
        } catch (err) {
            console.error('Error creating message:', err);
            throw err;
        }
    },

    async getMessages() {
        try {
            const [messages] = await db.promise().query(
                `SELECT mr.PF_MessageReceiptID, mr.Message, mr.CreateDate, 
                        cr.Name, cr.Email, 
                        COALESCE(
                            (SELECT OldCompany FROM PF_ContactCompanyHistory 
                             WHERE PF_ContactReceiptID = cr.PF_ContactReceiptID 
                             AND ChangeDate > mr.CreateDate 
                             ORDER BY ChangeDate ASC LIMIT 1), 
                            cr.Company
                        ) AS Company
                 FROM PF_MessageReceipt mr 
                 INNER JOIN PF_ContactReceipt cr ON mr.PF_ContactReceiptID = cr.PF_ContactReceiptID`
            );

            const adjustedMessages = messages.map(message => ({
                ...message,
                CreateDate: moment.utc(message.CreateDate).tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss'),
            }));
            return adjustedMessages;
        } catch (err) {
            console.error('Error getting messages:', err);
            throw err;
        }
    },
};

module.exports = Message;