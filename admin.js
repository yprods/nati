document.addEventListener('DOMContentLoaded', () => {
    const connectionStatusContent = document.getElementById('connectionStatusContent');
    const contactsTableBody = document.querySelector('#contactsTable tbody');
    const noContactsMessage = document.getElementById('noContactsMessage');

    // Function to update the WhatsApp connection status
    async function updateConnectionStatus() {
        try {
            const response = await fetch('/api/qr');
            const data = await response.json();

            // Clear previous content before adding new content
            connectionStatusContent.innerHTML = '';

            switch (data.status) {
                case 'connected':
                    connectionStatusContent.innerHTML = `
                            <p class="status-message connected">✅ מחובר לוואטסאפ בהצלחה!</p>
                        `;
                    break;
                case 'qr_received':
                    connectionStatusContent.innerHTML = `
                            <p class="status-message pending">⚠️ נדרשת התחברות לוואטסאפ</p>
                            <p>אנא סרוק את קוד ה-QR באמצעות האפליקציה בטלפון שלך (הגדרות > מכשירים מקושרים > קישור מכשיר).</p>
                            <img id="qrCodeImage" src="${data.qrImage}" alt="קוד QR לחיבור WhatsApp" style="display: block;" />
                        `;
                    break;
                case 'waiting':
                    connectionStatusContent.innerHTML = `
                            <div class="spinner"></div>
                            <p class="status-message pending">⏳ ממתין ליצירת קוד QR...</p>
                        `;
                    break;
                case 'error':
                case 'disconnected':
                    connectionStatusContent.innerHTML = `
                            <p class="status-message disconnected">❌ שגיאה: ${data.message || 'החיבור נותק. יש לבדוק את השרת.'}</p>
                        `;
                    break;
                default:
                    connectionStatusContent.innerHTML = `
                            <p class="status-message disconnected">❌ סטטוס חיבור לא ידוע.</p>
                        `;
            }
        } catch (error) {
            console.error('Error fetching connection status:', error);
            connectionStatusContent.innerHTML = `
                    <p class="status-message disconnected">❌ שגיאה בטעינת מצב חיבור. אנא רענן את העמוד.</p>
                `;
        }
    }

    // Function to load contact inquiries
    async function loadContacts() {
        try {
            const response = await fetch('/api/contacts');
            const data = await response.json();

            if (data.success && data.contacts.length > 0) {
                contactsTableBody.innerHTML = '';
                noContactsMessage.style.display = 'none';
                data.contacts.forEach(contact => {
                    const row = contactsTableBody.insertRow();
                    const timestamp = new Date(contact.timestamp).toLocaleString('he-IL');
                    row.innerHTML = `
                            <td>${contact.id}</td>
                            <td>${contact.fullName}</td>
                            <td>${contact.address || 'לא צויין'}</td>
                            <td>${contact.phone}</td>
                            <td>${contact.message}</td>
                            <td>${timestamp}</td>
                        `;
                });
            } else {
                contactsTableBody.innerHTML = '';
                noContactsMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Error loading contacts:', error);
            contactsTableBody.innerHTML = `<tr><td colspan="6" style="color:red;text-align:center;">שגיאה בטעינת פניות: ${error.message}</td></tr>`;
            noContactsMessage.style.display = 'none';
        }
    }

    // Initial calls and periodic updates
    updateConnectionStatus(); // First call to check status
    loadContacts(); // First call to load contacts

    setInterval(updateConnectionStatus, 5000); // Check status every 5 seconds
    setInterval(loadContacts, 30000); // Refresh contacts list every 30 seconds
});