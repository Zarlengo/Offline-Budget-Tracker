let db;

const request = window.indexedDB.open('budget', 1);

request.onupgradeneeded = ({ target }) => {
    const db = target.result;
    db.createObjectStore('pending', { autoIncrement: true });
}

request.onsuccess = ({ target }) => {
    db = target.result;
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = ({ target }) => {
    console.log({ errorCode: target.errorCode });
}

const saveRecord = (record) => {
    const transaction = db.transaction(['pending'], 'readwrite');
    const transactionStore = transaction.objectStore('pending');
    transactionStore.add(record);
}

const checkDatabase = () => {
    const transaction = db.transaction('pending', 'readwrite');
    const pendingStore = transaction.objectStore('pending');
    const getAll = pendingStore.getAll();

    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                }
            })
            .then(response => response.json())
            .then(() => {
                const transaction = db.transaction(['pending'], 'readwrite');
                const pendingStore = transaction.objectStore('pending');
                pendingStore.clear();
            });
        }
    };
};


window.addEventListener('online', checkDatabase);
