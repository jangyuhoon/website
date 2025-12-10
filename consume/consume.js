let currentPage = 1;
const postsPerPage = 10;
let searchKeyword = '';

let selectedTag = null;
let tagSearchKeyword = '';
let currentTagPage = 1;
const tagsPerPage = 7;

let sortOrder = 'latest';
let currentUser = null;
let isMyPostsMode = false; // 나의 게시글 모드 여부
let isMyLikesMode = false; // 나의 좋아요 모드 여부
let isNavigating = false; // 페이지 전환 중인지 여부

function checkLoginStatus() {
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
        currentUser = JSON.parse(loggedInUser);
        updateIconDisplay();
    } else {
        currentUser = null;
        updateIconDisplay();
    }
}

function updateIconDisplay() {
    const mainlogin = document.getElementById('mainlogin');
    
    if (mainlogin) { // Check if element exists
        if (currentUser) {
            mainlogin.textContent = currentUser.nickname;
        } else {
            mainlogin.textContent = '로그인';
        }
    }
}

function handleloginClick(event) {
    event.stopPropagation();
    
    if (currentUser) {
        toggleUserDropdown();
    } else {
        openLoginModal();
    }
}

function toggleUserDropdown() {
    const mainDropdown = document.getElementById('mainUserDropdown');
    const mainlogin = document.getElementById('mainlogin');
    
    if (mainDropdown && mainlogin) { // Check if elements exist
        const isActive = mainDropdown.classList.toggle('active');
        
        if (isActive) {
            const iconRect = mainlogin.getBoundingClientRect();
            mainDropdown.style.top = (iconRect.bottom + 10) + 'px';
            mainDropdown.style.left = iconRect.left + 'px';
            mainDropdown.style.width = iconRect.width + 'px';
        }
    }
}

function closeUserDropdown() {
    const mainDropdown = document.getElementById('mainUserDropdown');
    if (mainDropdown) { // Check if element exists
        mainDropdown.classList.remove('active');
    }
}

function openUserInfo() {
    closeUserDropdown();
    if (!currentUser) return;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === currentUser.id);
    
    if (user) {
        const createdDate = new Date(user.createdAt).toLocaleString('ko-KR');
        alert(`=== 회원 정보 ===\n아이디: ${user.id}\n닉네임: ${user.nickname}\n가입일: ${createdDate}`);
    }
}

async function openMyPosts() {
    closeUserDropdown();
    if (!currentUser) return;
    
    // 나의 게시글 모드 활성화 (sessionStorage로 변경)
    sessionStorage.setItem('consumeIsMyPostsMode', 'true');
    sessionStorage.removeItem('consumeIsMyLikesMode'); // 다른 모드 비활성화

    // 검색 및 필터 초기화
    searchKeyword = '';
    document.getElementById('search_function').value = '';
    selectedTag = null;
    tagSearchKeyword = '';
    document.getElementById('tagsearch_function').value = '';
    currentPage = 1;
    
    await loadPosts();
    alert(`${currentUser.nickname}님이 작성한 게시글만 표시됩니다.`);
}

async function openMyLikes() {
    closeUserDropdown();
    if (!currentUser) return;
    
    // 나의 좋아요 모드 활성화 (sessionStorage로 변경)
    sessionStorage.setItem('consumeIsMyLikesMode', 'true');
    sessionStorage.removeItem('consumeIsMyPostsMode'); // 다른 모드 비활성화

    // 검색 및 필터 초기화
    searchKeyword = '';
    document.getElementById('search_function').value = '';
    selectedTag = null;
    tagSearchKeyword = '';
    document.getElementById('tagsearch_function').value = '';
    currentPage = 1;
    
    await loadPosts();
    alert(`${currentUser.nickname}님이 좋아요를 누른 게시글만 표시됩니다.`);
}

// =========================================================
// 나의 알림 기능 (새로운 기능)
// =========================================================

// 알림 모달 열기
function openMyNotifications() {
    closeUserDropdown(); // 사용자 드롭다운 닫기
    const modal = document.getElementById('notificationModal');
    if (modal) {
        modal.classList.add('active');
        loadNotifications(); // 알림 불러오기
    }
}

// 알림 모달 닫기
function closeNotificationModal() {
    const modal = document.getElementById('notificationModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// 알림 저장 (게시글 작성자에게)
async function generateNotification(selectorId, selectedPostId) {
    const posts = await getPosts(); // IndexedDB에서 게시글 가져오기
    const selectedPost = posts.find(post => post.id === selectedPostId);

    if (!selectedPost || !selectedPost.authorId) {
        console.error('게시글 또는 작성자 정보를 찾을 수 없습니다.');
        return;
    }

    // 선택한 사용자 정보
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const selectorUser = users.find(user => user.id === selectorId);
    const selectorNickname = selectorUser ? selectorUser.nickname : '알 수 없는 사용자';

    const recipientUserId = selectedPost.authorId;
    const notificationId = Date.now(); // 고유 알림 ID

    const notification = {
        id: notificationId,
        selectorId: selectorId,
        selectorNickname: selectorNickname,
        postId: selectedPostId,
        postTitle: selectedPost.title,
        postLink: `consume-read.html#${selectedPostId}`, // 현재 페이지의 게시글 링크
        message: `${selectorNickname}님이 회원님의 게시글 "${selectedPost.title}"을(를) 선택하였습니다.`,
        timestamp: new Date().toISOString(),
        read: false
    };

    const userNotifications = JSON.parse(localStorage.getItem('userNotifications')) || {};
    if (!userNotifications[recipientUserId]) {
        userNotifications[recipientUserId] = [];
    }
    userNotifications[recipientUserId].unshift(notification); // 최신 알림을 앞에 추가

    localStorage.setItem('userNotifications', JSON.stringify(userNotifications));
    console.log('알림이 생성되어 저장되었습니다:', notification);
    updateNotificationCount(); // 알림 생성 시 UI 업데이트
}

// 현재 사용자의 알림을 불러와 모달에 표시
function loadNotifications() {
    const notificationList = document.getElementById('notificationList');
    if (!notificationList) return;

    notificationList.innerHTML = ''; // 기존 알림 비우기

    if (!currentUser) {
        notificationList.innerHTML = '<p class="notification-empty">로그인 후 알림을 확인해주세요.</p>';
        return;
    }

    const userNotifications = JSON.parse(localStorage.getItem('userNotifications')) || {};
    const notifications = userNotifications[currentUser.id] || [];

    if (notifications.length === 0) {
        notificationList.innerHTML = '<p class="notification-empty">새로운 알림이 없습니다.</p>';
        return;
    }

    notifications.forEach(notif => {
        const notificationItem = document.createElement('div');
        notificationItem.classList.add('notification-item');
        if (!notif.read) {
            notificationItem.classList.add('unread');
        }

        notificationItem.innerHTML = `
            <p>${notif.message}</p>
            <a href="${notif.postLink}" onclick="markNotificationAsRead(${notif.id}); closeNotificationModal();">게시글 보기</a>
            <span class="notification-time">${new Date(notif.timestamp).toLocaleString('ko-KR')}</span>
            <button class="notification-delete" onclick="deleteNotification(${notif.id})">삭제</button>
        `;
        notificationList.appendChild(notificationItem);
    });

    updateNotificationCount();
}

// 알림 읽음 처리
function markNotificationAsRead(notificationId) {
    if (!currentUser) return;

    const userNotifications = JSON.parse(localStorage.getItem('userNotifications')) || {};
    const notifications = userNotifications[currentUser.id] || [];

    const notifIndex = notifications.findIndex(notif => notif.id === notificationId);
    if (notifIndex !== -1) {
        notifications[notifIndex].read = true;
        userNotifications[currentUser.id] = notifications;
        localStorage.setItem('userNotifications', JSON.stringify(userNotifications));
        updateNotificationCount();
        loadNotifications(); // UI 업데이트
    }
}

// 알림 삭제
function deleteNotification(notificationId) {
    if (!currentUser) return;

    if (confirm('정말 이 알림을 삭제하시겠습니까?')) {
        const userNotifications = JSON.parse(localStorage.getItem('userNotifications')) || {};
        let notifications = userNotifications[currentUser.id] || [];
    
        notifications = notifications.filter(notif => notif.id !== notificationId);
        userNotifications[currentUser.id] = notifications;
        localStorage.setItem('userNotifications', JSON.stringify(userNotifications));
        updateNotificationCount();
        loadNotifications(); // UI 업데이트
    }
}

// 읽지 않은 알림 개수 업데이트 (UI에 표시할 경우)
function updateNotificationCount() {
    if (!currentUser) {
        const notificationCountElement = document.getElementById('notificationCount');
        if (notificationCountElement) {
            notificationCountElement.textContent = '';
            notificationCountElement.style.display = 'none';
        }
        return;
    }
    const userNotifications = JSON.parse(localStorage.getItem('userNotifications')) || {};
    const notifications = userNotifications[currentUser.id] || [];
    const unreadCount = notifications.filter(notif => !notif.read).length;

    const notificationCountElement = document.getElementById('notificationCount');
    if (notificationCountElement) {
        notificationCountElement.textContent = unreadCount > 0 ? unreadCount : '';
        notificationCountElement.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
}

function openLoginModal() {
    closeSignupModal();
    const modal = document.getElementById('loginModal');
    modal.classList.add('active');
    
    document.getElementById('loginId').value = '';
    document.getElementById('loginPassword').value = '';
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.remove('active');
}

function handleLogin() {
    const id = document.getElementById('loginId').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    if (!id) {
        alert('아이디를 입력해주세요.');
        return;
    }
    
    if (!password) {
        alert('비밀번호를 입력해주세요.');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === id && u.password === password);
    
    if (user) {
        currentUser = {
            id: user.id,
            nickname: user.nickname
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateIconDisplay();
        closeLoginModal();
        alert(`${user.nickname}님, 환영합니다!`);
    } else {
        alert('아이디 또는 비밀번호가 일치하지 않습니다.');
    }
}

function openSignupModal() {
    closeLoginModal();
    const modal = document.getElementById('signupModal');
    modal.classList.add('active');
    
    document.getElementById('signupId').value = '';
    document.getElementById('signupPassword').value = '';
    document.getElementById('signupPasswordConfirm').value = '';
    document.getElementById('signupNickname').value = '';
}

function closeSignupModal() {
    const modal = document.getElementById('signupModal');
    modal.classList.remove('active');
}

function handleSignup() {
    const id = document.getElementById('signupId').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const passwordConfirm = document.getElementById('signupPasswordConfirm').value.trim();
    const nickname = document.getElementById('signupNickname').value.trim();
    
    if (!id || id.length < 3) {
        alert('아이디는 3자 이상이어야 합니다.');
        return;
    }
    
    if (!password || password.length < 4) {
        alert('비밀번호는 4자 이상이어야 합니다.');
        return;
    }
    
    if (password !== passwordConfirm) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }
    
    if (!nickname || nickname.length < 2) {
        alert('닉네임은 2자 이상이어야 합니다.');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    const existingUser = users.find(u => u.id === id);
    if (existingUser) {
        alert('이미 사용 중인 아이디입니다.');
        return;
    }
    
    const existingNickname = users.find(u => u.nickname === nickname);
    if (existingNickname) {
        alert('이미 사용 중인 닉네임입니다.');
        return;
    }
    
    const newUser = {
        id: id,
        password: password,
        nickname: nickname,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('회원가입이 완료되었습니다!');
    closeSignupModal();
    
    currentUser = {
        id: newUser.id,
        nickname: newUser.nickname
    };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateIconDisplay();
    alert(`${newUser.nickname}님, 환영합니다!`);
}

function logout() {
    closeUserDropdown();
    localStorage.removeItem('currentUser');
    currentUser = null;
    updateIconDisplay();
    alert('로그아웃 되었습니다.');
}

// 로딩 페이지 표시 및 페이지 전환 (index.js에서 가져와 수정)
function showLoadingAndNavigateToPage(targetPage) {
    if (isNavigating) return;
    isNavigating = true;
    
    // 로딩 오버레이 생성
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="loading-content">
            <div class="spinner">
                <svg viewBox="0 0 100 100">
                    <path d="M50,15 L60,25 L50,35 L40,25 Z" class="arrow arrow1"/>
                    <path d="M73,27 L78,40 L65,45 L60,32 Z" class="arrow arrow2"/>
                    <path d="M77,55 L72,68 L59,63 L64,50 Z" class="arrow arrow3"/>
                    <path d="M65,78 L50,83 L45,70 L60,65 Z" class="arrow arrow4"/>
                    <path d="M35,78 L30,65 L43,60 L48,73 Z" class="arrow arrow5"/>
                </svg>
            </div>
            <div class="loading-text">페이지 이동 중<span class="dots">.</span></div>
            <div class="progress-bar-container">
                <div class="progress-bar" id="progress-bar"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(loadingOverlay);
    
    // CSS 스타일 추가
    const style = document.createElement('style');
    style.textContent = `
        #loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: white;
            z-index: 9999;
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
            animation: fadeIn 0.5s forwards;
        }
        
        @keyframes fadeIn {
            to { opacity: 1; }
        }
        
        .loading-content {
            text-align: center;
        }
        
        .spinner {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
        }
        
        .spinner svg {
            width: 100%;
            height: 100%;
            animation: rotate 2s linear infinite;
        }
        
        @keyframes rotate {
            100% { transform: rotate(360deg); }
        }
        
        .arrow {
            fill: #333;
            opacity: 0.8;
        }
        
        .arrow1 { animation: fadeArrow 1.5s ease-in-out 0s infinite; }
        .arrow2 { animation: fadeArrow 1.5s ease-in-out 0.3s infinite; }
        .arrow3 { animation: fadeArrow 1.5s ease-in-out 0.6s infinite; }
        .arrow4 { animation: fadeArrow 1.5s ease-in-out 0.9s infinite; }
        .arrow5 { animation: fadeArrow 1.5s ease-in-out 1.2s infinite; }
        
        @keyframes fadeArrow {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
        }
        
        .loading-text {
            font-size: 1.2rem;
            color: #333;
            margin-bottom: 20px;
        }
        
        .dots {
            display: inline-block;
            width: 20px;
            text-align: left;
            animation: dotAnimation 1.5s infinite;
        }
        
        @keyframes dotAnimation {
            0% { content: '.'; }
            33% { content: '..'; }
            66% { content: '...'; }
            100% { content: '.'; }
        }
        
        .dots::after {
            content: '.';
            animation: dotContent 1.5s infinite;
        }
        
        @keyframes dotContent {
            0% { content: '.'; }
            33% { content: '..'; }
            66% { content: '...'; }
            100% { content: '.'; }
        }
        
        .progress-bar-container {
            width: 300px;
            height: 30px;
            background: #f0f0f0;
            border-radius: 15px;
            overflow: hidden;
            border: 2px solid #ddd;
            margin: 0 auto;
        }
        
        .progress-bar {
            width: 0%;
            height: 100%;
            background: #333;
            border-radius: 15px;
            transition: width 0.3s ease;
        }
    `;
    document.head.appendChild(style);
    
    // iframe으로 다음 페이지 미리 로딩
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = targetPage;
    document.body.appendChild(iframe);
    
    const progressBar = document.getElementById('progress-bar');
    let progress = 0;
    
    // 로딩 진행률 시뮬레이션
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        progressBar.style.width = progress + '%';
        
        if (progress >= 100) {
            clearInterval(loadingInterval);
            setTimeout(() => {
                window.location.href = targetPage;
            }, 500);
        }
    }, 200);
    
    // iframe 로드 완료 시 진행률 100%로
    iframe.onload = () => {
        progress = 100;
        progressBar.style.width = '100%';
    };
    
    // 타임아웃 설정 (최대 5초)
    setTimeout(() => {
        if (progress < 100) {
            progress = 100;
            progressBar.style.width = '100%';
            clearInterval(loadingInterval);
            setTimeout(() => {
                window.location.href = targetPage;
            }, 500);
        }
    }, 5000);
}

async function changeSortOrder(order) {
    // 이전에는 popular일 때 return 했으나, 이제 구현하므로 제거
    
    sortOrder = order;
    
    document.getElementById('sort_latest').checked = (order === 'latest');
    document.getElementById('sort_views').checked = (order === 'views');
    
    currentPage = 1;
    await loadPosts();
}



function category_on() {
    const dropdown = document.querySelector('.category_dropdown');
    const category = document.querySelector('.category');

    dropdown.classList.toggle('active');

    if (dropdown.classList.contains('active')) {
        // 활성화 상태 → 검정 배경 + 흰 텍스트
        category.style.backgroundColor = 'black';
        category.style.color = 'white';
    } else {
        // 기본 상태 → 흰 배경 + 검정 텍스트
        category.style.backgroundColor = 'white';
        category.style.color = 'black';
    }
}

function open_write() {
    if (!currentUser) {
        alert('로그인이 필요한 서비스입니다.');
        openLoginModal();
        return;
    }
    showLoadingAndNavigateToPage('consume-write.html');
}

// IndexedDB에서 게시글 가져오기
async function getPosts() {
    try {
        const posts = await appDB.getAll('consume_posts');
        return posts;
    } catch (error) {
        console.error('Failed to get posts from IndexedDB:', error);
        return [];
    }
}

async function search_on() {
    searchKeyword = document.getElementById('search_function').value.trim().toLowerCase();
    currentPage = 1;
    localStorage.setItem('consumeSearchKeyword', searchKeyword); // 검색어 저장
    await loadPosts();
}

async function filterPosts(posts) {
    // 나의 게시글 모드일 때
    if (isMyPostsMode && currentUser) {
        posts = posts.filter(post => post.authorId === currentUser.id);
    }
    
    // 나의 좋아요 모드일 때
    if (isMyLikesMode && currentUser) {
        posts = posts.filter(post => post.likedBy && post.likedBy.includes(currentUser.id));
    }
    
    // 검색어 필터링
    if (searchKeyword) {
        posts = posts.filter(post => {
            const title = post.title.toLowerCase();
            const subtitle = (post.subtitle || '').toLowerCase();
            return title.includes(searchKeyword) || subtitle.includes(searchKeyword);
        });
    }
    
    // 태그 필터링
    if (selectedTag) {
        posts = posts.filter(post => {
            return post.tags && post.tags.includes(selectedTag);
        });
    }
    
    return posts;
}

function sortPosts(posts) {
    if (sortOrder === 'latest') {
        return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOrder === 'views') {
        return posts.sort((a, b) => {
            const viewsDiff = (b.views ?? 0) - (a.views ?? 0);
            if (viewsDiff === 0) {
                return new Date(b.createdAt) - new Date(a.createdAt); // 조회수가 같으면 최신순
            }
            return viewsDiff;
        });
    } else if (sortOrder === 'popular') {
        return posts.sort((a, b) => {
            const likesDiff = (b.likes ?? 0) - (a.likes ?? 0);
            if (likesDiff === 0) {
                return new Date(b.createdAt) - new Date(a.createdAt); // 좋아요 수가 같으면 최신순
            }
            return likesDiff;
        });
    }
    
    return posts;
}

async function tag_on() {
    tagSearchKeyword = document.getElementById('tagsearch_function').value.trim().toLowerCase();
    currentTagPage = 1;
    await loadTags();
}

async function selectTag(tag) {
    if (selectedTag === tag) {
        selectedTag = null;
    } else {
        selectedTag = tag;
    }
    currentPage = 1;
    await loadTags();
    await loadPosts();
}

async function getTagCounts() {
    // 태그를 consume_saved_hashtags 객체 저장소에서 가져오도록 변경
    try {
        const allTags = await appDB.getAll('consume_saved_hashtags');
        const tagCounts = {};
        allTags.forEach(t => {
            tagCounts[t.tag] = t.count;
        });
        return tagCounts;
    } catch (error) {
        console.error('Failed to get tag counts from IndexedDB:', error);
        return {};
    }
}

async function loadTags() {
    const tagCounts = await getTagCounts(); // async로 변경
    let allTags = Object.keys(tagCounts);
    const tagitem = document.getElementById('tagitem');
    const tagpage = document.getElementById('tagpage');
    
    if (allTags.length === 0) {
        tagitem.innerHTML = '<p style="text-align: center; color: #999; font-size: 12px;">저장된 태그가 없습니다.</p>';
        tagpage.innerHTML = '';
        return;
    }
    
    if (tagSearchKeyword) {
        allTags = allTags.filter(tag => tag.toLowerCase().includes(tagSearchKeyword));
    }
    
    if (allTags.length === 0) {
        tagitem.innerHTML = '<p style="text-align: center; color: #999; font-size: 12px;">검색 결과가 없습니다.</p>';
        tagpage.innerHTML = '';
        return;
    }
    
    allTags.sort((a, b) => tagCounts[b] - tagCounts[a]);
    
    const totalPages = Math.ceil(allTags.length / tagsPerPage);
    
    if (currentTagPage > totalPages) {
        currentTagPage = totalPages;
    }
    if (currentTagPage < 1) {
        currentTagPage = 1;
    }
    
    const startIndex = (currentTagPage - 1) * tagsPerPage;
    const endIndex = startIndex + tagsPerPage;
    const currentTags = allTags.slice(startIndex, endIndex);
    
    tagitem.innerHTML = currentTags.map(tag => `
        <div class="tag-item ${selectedTag === tag ? 'active' : ''}" onclick="selectTag('${tag}')">
            <span>#${tag}</span>
            <span class="tag-count">${tagCounts[tag]}</span>
        </div>
    `).join('');
    
    rendertagpage(totalPages);
}

function rendertagpage(totalPages) {
    const tagpage = document.getElementById('tagpage');
    
    if (totalPages <= 1) {
        tagpage.innerHTML = '';
        return;
    }
    
    let listpageHTML = '';
    
    listpageHTML += `<button onclick="changeTagPage(${currentTagPage - 1})" ${currentTagPage === 1 ? 'disabled' : ''}>‹</button>`;
    
    for (let i = 1; i <= Math.min(totalPages, 5); i++) {
        const page = currentTagPage <= 3 ? i : 
                    currentTagPage >= totalPages - 2 ? totalPages - 5 + i :
                    currentTagPage - 3 + i;
                    
        if (page > 0 && page <= totalPages) {
            listpageHTML += `<button class="${page === currentTagPage ? 'active' : ''}" onclick="changeTagPage(${page})">${page}</button>`;
        }
    }
    
    listpageHTML += `<button onclick="changeTagPage(${currentTagPage + 1})" ${currentTagPage === totalPages ? 'disabled' : ''}>›</button>`;
    
    tagpage.innerHTML = listpageHTML;
}

async function changeTagPage(page) {
    const tagCounts = await getTagCounts(); // async로 변경
    let allTags = Object.keys(tagCounts);
    
    if (tagSearchKeyword) {
        allTags = allTags.filter(tag => tag.toLowerCase().includes(tagSearchKeyword));
    }
    
    const totalPages = Math.ceil(allTags.length / tagsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentTagPage = page;
    await loadTags();
}

async function loadPosts() {
    let posts = await getPosts(); // IndexedDB에서 게시글 가져오기
    const listitem = document.getElementById('listitem');
    const listpageDiv = document.getElementById('listpage');
    
    if (posts.length === 0) {
        listitem.innerHTML = '<p style="text-align: center; color: #999;">작성된 게시글이 없습니다.</p>';
        listpageDiv.innerHTML = '';
        return;
    }

    // sessionStorage에서 나의 게시글/좋아요 모드 상태 불러오기
    isMyPostsMode = sessionStorage.getItem('consumeIsMyPostsMode') === 'true';
    isMyLikesMode = sessionStorage.getItem('consumeIsMyLikesMode') === 'true';
    
    posts = await filterPosts(posts); // async로 변경
    posts = sortPosts(posts);
    
    if (posts.length === 0) {
        listitem.innerHTML = '<p style="text-align: center; color: #999;">검색 결과가 없습니다.</p>';
        listpageDiv.innerHTML = '';
        return;
    }
    
    const totalPages = Math.ceil(posts.length / postsPerPage);
    
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }
    if (currentPage < 1) {
        currentPage = 1;
    }
    
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const currentPosts = posts.slice(startIndex, endIndex);
    
    listitem.innerHTML = currentPosts.map(post => {
        // 나의 게시글 모드일 때는 consume-edit.html로, 아니면 consume-read.html로
        const linkPage = (isMyPostsMode && currentUser && post.authorId === currentUser.id) 
            ? 'consume-edit.html' 
            : 'consume-read.html';
        
        return `
        <div class="post-card" onclick="viewPost(${post.id}, '${linkPage}')">
            <div class="post-content-area">
                <div class="post-title">${post.title}</div>
                <div class="post-subtitle">${post.subtitle || ''}원</div>
                <div class="post-tags">
                    ${post.tags.map(tag => `<span class="post-tag">#${tag}</span>`).join('')}
                </div>
            </div>
            ${post.image ? `<img src="${post.image}" alt="${post.title}" class="post-image">` : ''}
        </div>
        `;
    }).join('');
    
    renderlistpage(totalPages);
}

function renderlistpage(totalPages) {
    const listpageDiv = document.getElementById('listpage');
    
    if (totalPages <= 1) {
        listpageDiv.innerHTML = '';
        return;
    }
    
    let listpageHTML = '';
    
    listpageHTML += `<button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>‹ 이전</button>`;
    
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 ||
            i === totalPages ||
            (i >= currentPage - 2 && i <= currentPage + 2)
        ) {
            listpageHTML += `<button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            listpageHTML += `<span class="page-info">...</span>`;
        }
    }
    
    listpageHTML += `<button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>다음 ›</button>`;
    
    listpageDiv.innerHTML = listpageHTML;
}

async function changePage(page) {
    const posts = await getPosts(); // IndexedDB에서 게시글 가져오기
    const filteredPosts = await filterPosts(posts); // async로 변경
    const sortedPosts = sortPosts(filteredPosts);

    const totalPages = Math.ceil(sortedPosts.length / postsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    await loadPosts(); // async로 변경
    
    document.getElementById('listitem').scrollTop = 0;
}

function viewPost(postId, linkPage = 'consume-read.html') {
    const targetUrl = `${linkPage}#${postId}`;
    showLoadingAndNavigateToPage(targetUrl);
}

window.addEventListener('DOMContentLoaded', async function() { // async로 변경
    checkLoginStatus(); // 로그인 상태 확인
    
    // localStorage -> IndexedDB 마이그레이션 (한 번만 실행)
    await appDB.migrateFromLocalStorage('consumePosts', 'consume_posts'); 
    // consumeSavedHashtags도 마이그레이션
    // localStorage의 consumeSavedHashtags는 ['태그1', '태그2'] 형태이므로, IndexedDB에는 { tag: '태그1' } 형태로 저장해야 함
    const savedHashtagsFromLS = JSON.parse(localStorage.getItem('consumeSavedHashtags')) || [];
    if (savedHashtagsFromLS.length > 0) {
        for (const hashtag of savedHashtagsFromLS) {
            try {
                await appDB.put('consume_saved_hashtags', { id: hashtag, tag: hashtag, count: 1 }); // 'id'를 태그 자체로 사용하거나 다른 고유값 생성
            } catch (error) {
                console.warn(`Failed to migrate hashtag ${hashtag}:`, error);
            }
        }
        localStorage.removeItem('consumeSavedHashtags');
        console.log('Hashtags migrated and consumeSavedHashtags removed from localStorage.');
    }
    
    const loginModal = document.getElementById('loginModal');
    loginModal.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            closeLoginModal();
        }
    });

    // 알림 모달 외부 클릭 시 닫기
    const notificationModal = document.getElementById('notificationModal');
    if (notificationModal) {
        notificationModal.addEventListener('click', function(e) {
            if (e.target === notificationModal) {
                closeNotificationModal();
            }
        });
    }
    
    document.addEventListener('click', function(e) {
        const mainDropdown = document.getElementById('mainUserDropdown');
        const mainlogin = document.getElementById('mainlogin'); // login icon
        
        // 드롭다운 외부, 로그인 아이콘 외부 클릭 시 닫기
        if (mainDropdown && !mainDropdown.contains(e.target) && mainlogin && !mainlogin.contains(e.target)) {
            closeUserDropdown();
        }
    });
    
    document.getElementById('loginPassword').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });
    
    document.getElementById('signupNickname').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSignup();
        }
    });
    
    // 이 페이지에 진입할 때 localStorage에서 검색 키워드, 나의 게시글/좋아요 모드 상태를 읽어옴
    const savedSearchKeyword = localStorage.getItem('consumeSearchKeyword');
    console.log('저장된 검색어:', savedSearchKeyword);
    
    if (savedSearchKeyword) {
        searchKeyword = savedSearchKeyword;
        document.getElementById('search_function').value = searchKeyword; // 검색창에 값 설정
        // 검색어는 DOMContentLoaded 후 loadPosts에서 반영될 것이므로 여기서 지울 필요 없음
    }
    
    // 최상위 창일 경우에만 localStorage 상태를 클리어하여, iframe 로드 시 중복 적용 방지
    // (그러나 이 스크립트가 iframe 내에서도 로드된다면, 그 동작은 달라질 수 있음)
    if (window.top === window.self) {
        localStorage.removeItem('consumeSearchKeyword');
        sessionStorage.removeItem('consumeIsMyPostsMode');
        sessionStorage.removeItem('consumeIsMyLikesMode');
    }
    
    await loadTags(); // async로 변경
    await loadPosts(); // async로 변경
    updateNotificationCount(); // 알림 개수 초기화
});