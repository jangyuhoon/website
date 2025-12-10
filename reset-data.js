// reset-data.js
// db.js를 먼저 로드하여 IndexedDB 기능에 접근할 수 있도록 함
// 이 스크립트는 직접 HTML에서 호출되지 않고, 개발자가 수동으로 실행할 때 사용되거나
// 특정 페이지에서 호출될 수 있으므로, db.js가 로드되어 있다고 가정하거나
// 여기서 동적으로 로드해야 함. 현재는 db.js가 루트에 있다고 가정하고 직접 임포트.

// IndexedDB 초기화를 위한 DB 이름
const DB_NAME = 'CycleAppDB';

async function clearIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(DB_NAME);

        request.onsuccess = function() {
            console.log("IndexedDB successfully deleted.");
            resolve();
        };

        request.onerror = function(event) {
            console.error("Error deleting IndexedDB:", event.target.error);
            reject(event.target.error);
        };

        request.onblocked = function() {
            console.warn("IndexedDB deletion blocked. Close all connections to the database.");
            alert("데이터베이스 삭제가 차단되었습니다. 모든 앱 탭을 닫고 다시 시도해주세요.");
            reject("Deletion blocked");
        };
    });
}

async function data_reset() {
    // 1. localStorage 데이터 제거
    const keysToRemove = [
        'currentUser',
        // 'posts', 'consumePosts', 'reformPosts'는 이제 IndexedDB로 마이그레이션되므로 localStorage에서 제거 필요 없음 (마이그레이션 시점에 이미 처리됨)
        // 'savedHashtags', 'consumeSavedHashtags', 'reformSavedHashtags'도 마찬가지
        'userNotifications',
        'userSelections',
        'searchKeyword', // Old/general search keyword
        'planSearchKeyword',
        'consumeSearchKeyword',
        'reformSearchKeyword',
        // sessionStorage 관련 키는 브라우저 닫으면 자동 삭제되므로 여기서 제거할 필요 없음.
        // 'planIsMyPostsMode', 'planIsMyLikesMode' 등
    ];

    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`Removed localStorage item: ${key}`);
    });
    
    console.log('All specified localStorage data has been cleared.');

    // 2. IndexedDB 데이터 제거
    try {
        await clearIndexedDB();
        console.log('IndexedDB data has been cleared.');
    } catch (error) {
        console.error('Failed to clear IndexedDB:', error);
        alert('IndexedDB 초기화에 실패했습니다. 콘솔을 확인해주세요.');
        return;
    }

    alert('모든 저장된 애플리케이션 데이터가 초기화되었습니다. 페이지를 새로고침합니다.');
    window.location.reload();
}

// 개발 편의를 위해 페이지 로드 시 바로 실행되도록 함
data_reset();