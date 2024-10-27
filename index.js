const express = require('express');
const path = require('path');
const { ExpressPeerServer } = require('peer');
const cors = require('cors'); // Import CORS

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Define a route to serve index.html explicitly if needed
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the Express server
const server = app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

// Integrate the PeerJS server with Express server
const peerServer = ExpressPeerServer(server, {
    path: '/peerjs'
});

// Error handling for the Peer server
peerServer.on('connection', (client) => {
    console.log(`Peer connected: ${client.id}`);
});

peerServer.on('disconnect', (client) => {
    console.log(`Peer disconnected: ${client.id}`);
});

// Log any Peer server errors
peerServer.on('error', (err) => {
    console.error('Peer server error:', err);
});

app.use('/peerjs', peerServer);

module.exports = app;
