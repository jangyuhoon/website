let tagify = null;
let savedHashtags = JSON.parse(localStorage.getItem('savedHashtags')) || [];
let currentPage = 1;
const postsPerPage = 10;
let searchKeyword = '';

let selectedTag = null;
let tagSearchKeyword = '';
let currentTagPage = 1;
const tagsPerPage = 15;

let sortOrder = 'latest';
let writeSelectedCategory = null;
let currentUser = null;
let isMyPostsMode = false; // 나의 게시글 모드 여부

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
    const writeIcon = document.getElementById('writeIcon');
    
    if (currentUser) {
        mainIcon.textContent = currentUser.nickname;
        writeIcon.textContent = currentUser.nickname;
    } else {
        mainIcon.textContent = '로그인';
        writeIcon.textContent = '로그인';
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
    const writeDropdown = document.getElementById('writeUserDropdown');
    const mainIcon = document.getElementById('mainIcon');
    const writeIcon = document.getElementById('writeIcon');
    
    if (document.getElementById('mainPage').style.display !== 'none') {
        const isActive = mainDropdown.classList.toggle('active');
        
        if (isActive) {
            const iconRect = mainIcon.getBoundingClientRect();
            mainDropdown.style.top = (iconRect.bottom + 10) + 'px';
            mainDropdown.style.left = iconRect.left + 'px';
            mainDropdown.style.width = iconRect.width + 'px';
        }
    } else {
        const isActive = writeDropdown.classList.toggle('active');
        
        if (isActive) {
            const iconRect = writeIcon.getBoundingClientRect();
            writeDropdown.style.top = (iconRect.bottom + 10) + 'px';
            writeDropdown.style.left = iconRect.left + 'px';
            writeDropdown.style.width = iconRect.width + 'px';
        }
    }
}

function closeUserDropdown() {
    const mainDropdown = document.getElementById('mainUserDropdown');
    const writeDropdown = document.getElementById('writeUserDropdown');
    
    mainDropdown.classList.remove('active');
    writeDropdown.classList.remove('active');
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
    
    // 글 작성 페이지에서 나의 게시글을 클릭한 경우 메인 페이지로 이동
    if (document.getElementById('writePage').style.display !== 'none') {
        open_main();
        return;
    }
    
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
    
    alert('나의 좋아요 기능은 준비 중입니다.');
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
    if (order === 'popular') {
        return;
    }
    
    sortOrder = order;
    
    document.getElementById('sort_latest').checked = (order === 'latest');
    document.getElementById('sort_views').checked = (order === 'views');
    
    currentPage = 1;
    loadPosts();
}

function writecategory_on() {
    const dropdown = document.querySelector('.writecategory_dropdown');
    const icon = document.querySelector('.writecategory_icon');
    
    dropdown.classList.toggle('active');
    icon.style.transform =
        icon.style.transform === 'rotate(180deg)' ? 'rotate(0deg)' : 'rotate(180deg)';
}

function category_on() {
    const dropdown = document.querySelector('.category_dropdown');
    const icon = document.querySelector('.category_icon');

    dropdown.classList.toggle('active');
    icon.style.transform =
        icon.style.transform === 'rotate(180deg)' ? 'rotate(0deg)' : 'rotate(180deg)';
}

function open_write() {
    if (!currentUser) {
        alert('로그인이 필요한 서비스입니다.');
        openLoginModal();
        return;
    }
    
    document.getElementById('mainPage').style.display = 'none';
    document.getElementById('writePage').style.display = 'block';
    initializeTagify();
}

function open_main() {
    document.getElementById('writePage').style.display = 'none';
    document.getElementById('mainPage').style.display = 'block';
    currentPage = 1;
    
    // 나의 게시글 모드 해제
    isMyPostsMode = false;
    
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

function initializeTagify() {
    if (tagify) return;
    
    const input = document.querySelector('input.tag');
    tagify = new Tagify(input, {
        whitelist: savedHashtags,
        enforceWhitelist: false,
        dropdown: {
            enabled: 0,
            maxItems: 10,
            closeOnSelect: false
        }
    });
}

document.getElementById('img_add').addEventListener('change', function(e) {
    const fileName = e.target.files[0] ? e.target.files[0].name : '선택된 파일 없음';
    document.getElementById('img_log').textContent = fileName;
});

function getPosts() {
    return JSON.parse(localStorage.getItem('posts')) || [];
}

function readImageAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function savePost() {
    if (!currentUser) {
        alert('로그인이 필요한 서비스입니다.');
        openLoginModal();
        return;
    }
    
    const title = document.querySelector('#writePage .title').value.trim();
    const subtitle = document.querySelector('#writePage .subtitle').value.trim();
    const content = document.querySelector('#writePage .content').value.trim();
    const tags = tagify ? tagify.value.map(tag => tag.value) : [];
    const imageFile = document.getElementById('img_add').files[0];
    
    if (!title) {
        alert('제목을 입력해주세요.');
        return;
    }
    
    if (!content) {
        alert('내용을 입력해주세요.');
        return;
    }
    
    let imageData = null;
    if (imageFile) {
        try {
            imageData = await readImageAsBase64(imageFile);
        } catch (error) {
            console.error('이미지 읽기 실패:', error);
        }
    }
    
    tags.forEach(tag => {
        if (!savedHashtags.includes(tag)) {
            savedHashtags.push(tag);
        }
    });
    
    localStorage.setItem('savedHashtags', JSON.stringify(savedHashtags));
    
    if (tagify) {
        tagify.whitelist = savedHashtags;
    }
    
    const posts = getPosts();
    const postId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;
    
    const postData = {
        id: postId,
        title: title,
        subtitle: subtitle,
        content: content,
        tags: tags,
        image: imageData,
        imageName: imageFile?.name || null,
        author: currentUser.nickname,
        authorId: currentUser.id,
        createdAt: new Date().toISOString(),
        views: 0
    };
    
    posts.push(postData);
    localStorage.setItem('posts', JSON.stringify(posts));
    
    console.log('게시글 저장 완료:', postData);
    
    alert('게시 완료!');
    
    document.querySelector('#writePage .title').value = '';
    document.querySelector('#writePage .subtitle').value = '';
    document.querySelector('#writePage .content').value = '';
    if (tagify) tagify.removeAllTags();
    document.getElementById('img_add').value = '';
    document.getElementById('img_log').textContent = '선택된 파일 없음';
    
    open_main();
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
        return posts.sort((a, b) => b.views - a.views);
    } else if (sortOrder === 'popular') {
        return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
                    ${post.author ? `작성자: ${post.author} | ` : ''}${new Date(post.createdAt).toLocaleString('ko-KR')} | 조회 ${post.views}
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
        const writeDropdown = document.getElementById('writeUserDropdown');
        
        if (!mainDropdown.contains(e.target) && !writeDropdown.contains(e.target)) {
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