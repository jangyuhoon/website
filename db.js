(function(window) {
    'use strict';

    const DB_NAME = 'CycleAppDB';
    const DB_VERSION = 1;
    let db;

    function openDB() {
        return new Promise((resolve, reject) => {
            if (db) {
                return resolve(db);
            }

            const request = window.indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => {
                console.error('Database error:', event.target.error);
                reject('Database error: ' + event.target.error);
            };

            request.onsuccess = (event) => {
                db = event.target.result;
                resolve(db);
            };

            request.onupgradeneeded = (event) => {
                console.log('Database upgrade needed.');
                db = event.target.result;
                if (!db.objectStoreNames.contains('plan_posts')) {
                    db.createObjectStore('plan_posts', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('consume_posts')) {
                    db.createObjectStore('consume_posts', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('reform_posts')) {
                    db.createObjectStore('reform_posts', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('plan_saved_hashtags')) {
                    db.createObjectStore('plan_saved_hashtags', { keyPath: 'tag' });
                }
                if (!db.objectStoreNames.contains('consume_saved_hashtags')) {
                    db.createObjectStore('consume_saved_hashtags', { keyPath: 'tag' });
                }
                if (!db.objectStoreNames.contains('reform_saved_hashtags')) {
                    db.createObjectStore('reform_saved_hashtags', { keyPath: 'tag' });
                }
                // Other stores like 'users', 'notifications' can be added here if needed
            };
        });
    }

    function getStore(storeName, mode) {
        return new Promise((resolve, reject) => {
            openDB().then(db => {
                const transaction = db.transaction(storeName, mode);
                const store = transaction.objectStore(storeName);
                resolve(store);
            }).catch(reject);
        });
    }

    const dbApi = {
        add: function(storeName, item) {
            return new Promise((resolve, reject) => {
                getStore(storeName, 'readwrite').then(store => {
                    const request = store.add(item);
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = (event) => reject('Add error: ' + event.target.error);
                }).catch(reject);
            });
        },

        get: function(storeName, id) {
            return new Promise((resolve, reject) => {
                getStore(storeName, 'readonly').then(store => {
                    const request = store.get(id);
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = (event) => reject('Get error: ' + event.target.error);
                }).catch(reject);
            });
        },

        getAll: function(storeName) {
            return new Promise((resolve, reject) => {
                getStore(storeName, 'readonly').then(store => {
                    const request = store.getAll();
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = (event) => reject('GetAll error: ' + event.target.error);
                }).catch(reject);
            });
        },

        put: function(storeName, item) {
            return new Promise((resolve, reject) => {
                getStore(storeName, 'readwrite').then(store => {
                    const request = store.put(item);
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = (event) => reject('Put error: ' + event.target.error);
                }).catch(reject);
            });
        },

        delete: function(storeName, id) {
            return new Promise((resolve, reject) => {
                getStore(storeName, 'readwrite').then(store => {
                    const request = store.delete(id);
                    request.onsuccess = () => resolve();
                    request.onerror = (event) => reject('Delete error: ' + event.target.error);
                }).catch(reject);
            });
        },
        
        // This function can be used to migrate data from localStorage to IndexedDB
        migrateFromLocalStorage: function(localStorageKey, storeName) {
            return new Promise((resolve, reject) => {
                const data = JSON.parse(localStorage.getItem(localStorageKey)) || [];
                if (data.length === 0) {
                    return resolve(); // No data to migrate
                }

                openDB().then(db => {
                    const transaction = db.transaction(storeName, 'readwrite');
                    const store = transaction.objectStore(storeName);
                    
                    let completed = 0;
                    if (data.length === 0) {
                        return resolve();
                    }
                    
                    data.forEach(item => {
                        // Ensure item has an ID
                        if (item.id === undefined) {
                            console.warn('Skipping item without id:', item);
                            completed++;
                            if (completed === data.length) {
                                resolve();
                            }
                            return;
                        }
                        const request = store.put(item);
                        request.onsuccess = () => {
                            completed++;
                            if (completed === data.length) {
                                // Once migration is successful, we can consider clearing the old localStorage data
                                // localStorage.removeItem(localStorageKey); 
                                // For safety, we'll leave it for now and let the user clear it manually if desired.
                                console.log(`Migration for ${localStorageKey} completed.`);
                                resolve();
                            }
                        };
                        request.onerror = (event) => {
                           console.error(`Failed to migrate item:`, item, event.target.error);
                           completed++;
                           if (completed === data.length) {
                               // Still resolve, but with errors logged.
                               resolve();
                           }
                        };
                    });
                }).catch(reject);
            });
        }
    };

    window.appDB = dbApi;
})(window);
