let blockchain = []; // Array to hold the blockchain
let peer = null;
let connections = []; // Array to hold all peer connections

// Initialize PeerJS
function initializePeer() {
    peer = new Peer({ host: 'https://peerconnect-one.vercel.app', path: '/' });
 // Create a new peer with a unique ID

    peer.on('open', (id) => {
        document.getElementById('peer-id').textContent = `Your Peer ID: ${id}`;
        console.log('Your Peer ID:', id);
    });

    peer.on('connection', (connection) => {
        connections.push(connection);
        console.log('Incoming peer connection:', connection.peer);
        handleConnection(connection);
    });
}

// Handle peer connections and broadcast messages
function handleConnection(connection) {
    connection.on('data', (data) => {
        if (data.type === 'sync') {
            // Sync blockchain if the received one is longer
            if (data.blockchain.length > blockchain.length) {
                blockchain = data.blockchain;
                console.log('Blockchain synced with peer. New length:', blockchain.length);
                updateBlockchainDisplay();
            }
        } else if (data.type === 'newBlock') {
            blockchain.push(data.block);
            console.log('New block received from peer:', data.block);
            updateBlockchainDisplay();

            // Broadcast the new block to all other connections
            broadcastNewBlock(data.block, connection.peer);
        }
    });

    // Request full blockchain from connected peer to sync
    connection.send({ type: 'sync', blockchain: blockchain });
}

// Connect to another peer
document.getElementById('connect-peer').addEventListener('click', () => {
    const peerId = document.getElementById('peer-connect-id').value;
    const conn = peer.connect(peerId);

    conn.on('open', () => {
        connections.push(conn);
        console.log('Connected to peer:', peerId);

        // Send current blockchain to sync
        conn.send({ type: 'sync', blockchain: blockchain });
    });

    handleConnection(conn);
});

// Create a new vote (block)
document.getElementById('vote-btn').addEventListener('click', () => {
    const vote = document.getElementById('vote').value;
    if (vote.trim() === "") return;

    const previousHash = blockchain.length ? blockchain[blockchain.length - 1].hash : '0';
    const block = {
        index: blockchain.length + 1,
        vote: vote,
        previousHash: previousHash,
        timestamp: Date.now(),
        hash: calculateHash(vote, previousHash)
    };

    blockchain.push(block);
    console.log('New block created:', block);
    updateBlockchainDisplay();

    // Broadcast the new block to all peers
    broadcastNewBlock(block);
});

// Function to broadcast a new block to all connected peers except the sender
function broadcastNewBlock(block, excludePeerId = null) {
    connections.forEach((conn) => {
        if (conn.peer !== excludePeerId) {
            conn.send({ type: 'newBlock', block: block });
            console.log('Broadcasting new block to peer:', conn.peer);
        }
    });
}

// Function to calculate hash for the block
function calculateHash(vote, previousHash) {
    return String(vote + previousHash + Date.now()); // Simple hash function for demonstration
}

// Update the blockchain display
function updateBlockchainDisplay() {
    const blockchainDisplay = document.getElementById('blockchain-display');
    blockchainDisplay.value = JSON.stringify(blockchain, null, 2);
    console.log('Blockchain display updated:', blockchain);
}

// Toggle Peer ID visibility
document.getElementById('show-peer-id').addEventListener('click', () => {
    const peerIdSection = document.getElementById('peer-id-section');
    peerIdSection.style.display = peerIdSection.style.display === 'none' ? 'block' : 'none';
});

// Toggle Blockchain display visibility
document.getElementById('show-blockchain').addEventListener('click', () => {
    const blockchainSection = document.getElementById('blockchain-section');
    blockchainSection.style.display = blockchainSection.style.display === 'none' ? 'block' : 'none';
});

// Initialize PeerJS on page load
initializePeer();
