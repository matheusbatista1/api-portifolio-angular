const Message = require('../models/Message');

const sendMessage = async (req, res) => {
    try {
        const { name, email, message, company } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const messageId = await Message.createMessage(name, email, message, company);
        res.status(201).json({ message: 'Message sent successfully', id: messageId });
    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).json({ error: 'Failed to send message', details: err });
    }
};

const getMessages = async (req, res) => {
    try {
        const messages = await Message.getMessages();
        res.status(200).json(messages);
    } catch (err) {
        console.error('Error getting messages:', err);
        res.status(500).json({ error: 'Failed to retrieve messages', details: err });
    }
};

module.exports = { sendMessage, getMessages };