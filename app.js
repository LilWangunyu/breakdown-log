// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyB95EmFfy2_9oplbO6-QGIDh9wGzk624wU",
    authDomain: "datashoe-breakdown-log-4f26e.firebaseapp.com",
    databaseURL: "https://datashoe-breakdown-log-4f26e-default-rtdb.firebaseio.com",
    projectId: "datashoe-breakdown-log-4f26e",
    storageBucket: "datashoe-breakdown-log-4f26e.firebasestorage.app",
    messagingSenderId: "908134441127",
    appId: "1:908134441127:web:00eb44150266dd2908fb82"
};

// Admin Configuration
const ADMIN_PASSWORD = "DataShoeSecure123!"; // Set your fixed password here
const REQUIRED_FIELDS = ["date", "technician", "machine", "factory", "natureOfBreakdown"];

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

// Core Functions
function submitBreakdown() {
    const inputs = {
        date: document.getElementById('date').value,
        technician: document.getElementById('technician').value,
        machine: document.getElementById('machine').value,
        factory: document.getElementById('factory').value,
        natureOfBreakdown: document.getElementById('natureOfBreakdown').value,
        time: document.getElementById('time').value,
        sparePart: document.getElementById('sparePart').value
    };

    // Validation
    if (!REQUIRED_FIELDS.every(field => inputs[field])) {
        alert("Please fill all required fields (*)");
        return;
    }

    const entry = {
        ...inputs,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    database.ref(`factories/${inputs.factory}`).push(entry)
        .then(() => {
            alert("Report submitted successfully!");
            loadData();
            clearForm();
        })
        .catch(error => alert(`Error: ${error.message}`));
}

function subscribeWithPassword() {
    const email = document.getElementById('subscriberEmail').value;
    const password = document.getElementById('adminPassword').value;

    if (!email || !password) {
        alert("Both fields are required!");
        return;
    }

    if (password !== ADMIN_PASSWORD) {
        alert("Invalid subscription password!");
        return;
    }

    database.ref('subscribers').push({
        email: email,
        subscribedAt: firebase.database.ServerValue.TIMESTAMP
    })
    .then(() => {
        document.getElementById('authStatus').textContent = "Successfully subscribed!";
        document.getElementById('subscriberEmail').value = "";
        document.getElementById('adminPassword').value = "";
    })
    .catch(error => alert(`Error: ${error.message}`));
}

// Data Management
function loadData() {
    database.ref('factories').on('value', (snapshot) => {
        const dataDisplay = document.getElementById('dataDisplay');
        dataDisplay.innerHTML = "";
        
        snapshot.forEach(factory => {
            factory.forEach(entry => {
                const data = entry.val();
                dataDisplay.innerHTML += `
                    <div class="entry">
                        <p><strong>Date:</strong> ${data.date}</p>
                        <p><strong>Technician:</strong> ${data.technician}</p>
                        <p><strong>Machine:</strong> ${data.machine}</p>
                        <p><strong>Factory:</strong> ${factory.key}</p>
                        <p><strong>Issue:</strong> ${data.natureOfBreakdown}</p>
                        ${data.time ? `<p><strong>Repair Time:</strong> ${data.time}</p>` : ''}
                        ${data.sparePart ? `<p><strong>Spare Part:</strong> ${data.sparePart}</p>` : ''}
                        <button class="delete-btn" onclick="deleteEntry('${factory.key}', '${entry.key}')">Delete</button>
                    </div>
                `;
            });
        });
    });
}

function deleteEntry(factory, key) {
    if (confirm("Permanently delete this entry?")) {
        database.ref(`factories/${factory}/${key}`).remove()
            .then(() => loadData())
            .catch(error => alert(`Error: ${error.message}`));
    }
}

function searchReports() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    database.ref('factories').once('value', (snapshot) => {
        const results = [];
        snapshot.forEach(factory => {
            factory.forEach(entry => {
                const data = entry.val();
                if (JSON.stringify(data).toLowerCase().includes(query)) {
                    results.push(data);
                }
            });
        });
        displaySearchResults(results);
    });
}

function displaySearchResults(results) {
    const dataDisplay = document.getElementById('dataDisplay');
    dataDisplay.innerHTML = results.map(data => `
        <div class="entry">
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Machine:</strong> ${data.machine}</p>
            <p><strong>Factory:</strong> ${data.factory}</p>
            <p><strong>Issue:</strong> ${data.natureOfBreakdown}</p>
        </div>
    `).join("");
}

function clearForm() {
    document.querySelectorAll('.form input').forEach(input => {
        if (!input.required) input.value = '';
    });
}

// Initialize
window.onload = loadData;