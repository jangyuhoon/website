let savedHashtags = JSON.parse(localStorage.getItem('savedHashtags')) || [];
let currentPage = 1;
const postsPerPage = 10;
let searchKeyword = '';

let selectedTag = null;
let tagSearchKeyword = '';
let currentTagPage = 1;
const tagsPerPage = 15;

let sortOrder = 'latest';
let currentUser = null;
let isMyPostsMode = false; // 나의 게시글 모드 여부
let isMyLikesMode = false; // 나의 좋아요 모드 여부

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
    const mainIcon = document.getElementById('mainIcon');
    
    if (mainIcon) { // Check if element exists
        if (currentUser) {
            mainIcon.textContent = currentUser.nickname;
        } else {
            mainIcon.textContent = '로그인';
        }
    }
}

function handleIconClick(event) {
    event.stopPropagation();
    
    if (currentUser) {
        toggleUserDropdown();
    } else {
        openLoginModal();
    }
}

function toggleUserDropdown() {
    const mainDropdown = document.getElementById('mainUserDropdown');
    const mainIcon = document.getElementById('mainIcon');
    
    if (mainDropdown && mainIcon) { // Check if elements exist
        const isActive = mainDropdown.classList.toggle('active');
        
        if (isActive) {
            const iconRect = mainIcon.getBoundingClientRect();
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

function openMyPosts() {
    closeUserDropdown();
    if (!currentUser) return;
    
    // 나의 게시글 모드 활성화
    isMyPostsMode = true;
    
    // 검색 및 필터 초기화
    searchKeyword = '';
    document.getElementById('search_function').value = '';
    selectedTag = null;
    tagSearchKeyword = '';
    document.getElementById('tagsearch_function').value = '';
    currentPage = 1;
    
    loadPosts();
    alert(`${currentUser.nickname}님이 작성한 게시글만 표시됩니다.`);
}

function openMyLikes() {
    closeUserDropdown();
    if (!currentUser) return;
    
    // 나의 좋아요 모드 활성화
    isMyLikesMode = true;
    isMyPostsMode = false; // 나의 게시글 모드 비활성화

    // 검색 및 필터 초기화
    searchKeyword = '';
    document.getElementById('search_function').value = '';
    selectedTag = null;
    tagSearchKeyword = '';
    document.getElementById('tagsearch_function').value = '';
    currentPage = 1;
    
    loadPosts();
    alert(`${currentUser.nickname}님이 좋아요를 누른 게시글만 표시됩니다.`);
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

function changeSortOrder(order) {
    // 이전에는 popular일 때 return 했으나, 이제 구현하므로 제거
    
    sortOrder = order;
    
    document.getElementById('sort_latest').checked = (order === 'latest');
    document.getElementById('sort_views').checked = (order === 'views');
    
    currentPage = 1;
    loadPosts();
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
    window.location.href = 'write.html';
}

function open_main() {
    currentPage = 1;
    
    // 나의 게시글 모드 해제
    isMyPostsMode = false;
    isMyLikesMode = false; // 나의 좋아요 모드 해제
    
    const savedSearchKeyword = localStorage.getItem('searchKeyword');
    if (savedSearchKeyword) {
        searchKeyword = savedSearchKeyword;
        document.getElementById('search_function').value = savedSearchKeyword;
        localStorage.removeItem('searchKeyword');
    } else {
        searchKeyword = '';
        document.getElementById('search_function').value = '';
    }
    
    selectedTag = null;
    tagSearchKeyword = '';
    document.getElementById('tagsearch_function').value = '';
    currentTagPage = 1;
    loadTags();
    loadPosts();
}

function getPosts() {
    return JSON.parse(localStorage.getItem('posts')) || [];
}

function search_on() {
    searchKeyword = document.getElementById('search_function').value.trim().toLowerCase();
    currentPage = 1;
    loadPosts();
}

function filterPosts(posts) {
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

function tag_on() {
    tagSearchKeyword = document.getElementById('tagsearch_function').value.trim().toLowerCase();
    currentTagPage = 1;
    loadTags();
}

function selectTag(tag) {
    if (selectedTag === tag) {
        selectedTag = null;
    } else {
        selectedTag = tag;
    }
    currentPage = 1;
    loadTags();
    loadPosts();
}

function getTagCounts() {
    const posts = getPosts();
    const tagCounts = {};
    
    posts.forEach(post => {
        if (post.tags) {
            post.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        }
    });
    
    return tagCounts;
}

function loadTags() {
    const tagCounts = getTagCounts();
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

function changeTagPage(page) {
    const tagCounts = getTagCounts();
    let allTags = Object.keys(tagCounts);
    
    if (tagSearchKeyword) {
        allTags = allTags.filter(tag => tag.toLowerCase().includes(tagSearchKeyword));
    }
    
    const totalPages = Math.ceil(allTags.length / tagsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentTagPage = page;
    loadTags();
}

function loadPosts() {
    let posts = getPosts();
    const listitem = document.getElementById('listitem');
    const listpageDiv = document.getElementById('listpage');
    
    if (posts.length === 0) {
        listitem.innerHTML = '<p style="text-align: center; color: #999;">작성된 게시글이 없습니다.</p>';
        listpageDiv.innerHTML = '';
        return;
    }
    
    posts = filterPosts(posts);
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
        // 나의 게시글 모드일 때는 edit.html로, 아니면 read.html로
        const linkPage = (isMyPostsMode && currentUser && post.authorId === currentUser.id) 
            ? 'edit.html' 
            : 'read.html';
        
        return `
        <div class="post-card" onclick="viewPost(${post.id}, '${linkPage}')">
            <div class="post-content-area">
                <div class="post-title">${post.title}</div>
                <div class="post-subtitle">${post.subtitle || ''}</div>
                <div class="post-tags">
                    ${post.tags.map(tag => `<span class="post-tag">#${tag}</span>`).join('')}
                </div>
                <div class="post-meta">
                    ${post.author ? `작성자: ${post.author} | ` : ''}${new Date(post.createdAt).toLocaleString('ko-KR')} | 조회 ${post.views} | 좋아요 ${post.likes}
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

function changePage(page) {
    const posts = sortPosts(filterPosts(getPosts()));
    const totalPages = Math.ceil(posts.length / postsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    loadPosts();
    
    document.getElementById('listitem').scrollTop = 0;
}

function viewPost(postId, linkPage = 'read.html') {
    window.location.href = `${linkPage}#${postId}`;
}

window.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    
    const loginModal = document.getElementById('loginModal');
    loginModal.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            closeLoginModal();
        }
    });
    
    const signupModal = document.getElementById('signupModal');
    signupModal.addEventListener('click', function(e) {
        if (e.target === signupModal) {
            closeSignupModal();
        }
    });
    
    document.addEventListener('click', function(e) {
        const mainDropdown = document.getElementById('mainUserDropdown');
        
        if (mainDropdown && !mainDropdown.contains(e.target)) { // Check if element exists
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
    
    const savedSearchKeyword = localStorage.getItem('searchKeyword');
    console.log('저장된 검색어:', savedSearchKeyword);
    
    if (savedSearchKeyword) {
        searchKeyword = savedSearchKeyword;
        document.getElementById('search_function').value = savedSearchKeyword;
        localStorage.removeItem('searchKeyword');
        console.log('검색어 적용됨:', searchKeyword);
    }
    
    loadTags();
    loadPosts();
});