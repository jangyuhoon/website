let tagify = null;
let savedHashtags = JSON.parse(localStorage.getItem('savedHashtags')) || [];
let writeSelectedCategory = null; // Unused, but keep for consistency if it was intended

// User Auth variables and functions (duplicated from main.js for independence)
let currentUser = null;

function getPosts() { // Utility function, duplicated for independence
    return JSON.parse(localStorage.getItem('posts')) || [];
}

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
    const writelogin = document.getElementById('writelogin'); // Only writeIcon in write.html
    if (writelogin) { // Check if element exists
        if (currentUser) {
            writelogin.textContent = currentUser.nickname;
        } else {
            writelogin.textContent = '로그인';
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
    const writeDropdown = document.getElementById('writeUserDropdown'); // Only writeUserDropdown
    const writelogin = document.getElementById('writelogin');
    if (writeDropdown && writelogin) { // Check if elements exist
        const isActive = writeDropdown.classList.toggle('active');
        if (isActive) {
            const iconRect = writelogin.getBoundingClientRect();
            writeDropdown.style.top = (iconRect.bottom + 10) + 'px';
            writeDropdown.style.left = iconRect.left + 'px';
            writeDropdown.style.width = iconRect.width + 'px';
        }
    }
}

function closeUserDropdown() {
    const writeDropdown = document.getElementById('writeUserDropdown'); // Only writeUserDropdown
    if (writeDropdown) { // Check if element exists
        writeDropdown.classList.remove('active');
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
    // Redirect to plan.html's my posts mode
    localStorage.setItem('isMyPostsMode', 'true'); // Flag for plan.html
    window.location.href = 'plan.html';
}

function openMyLikes() {
    closeUserDropdown();
    if (!currentUser) return;
    alert('나의 좋아요 기능은 준비 중입니다.');
}

function openLoginModal() {
    closeSignupModal();
    const modal = document.getElementById('loginModal');
    if (modal) modal.classList.add('active'); // Check if modal exists
    
    const loginIdInput = document.getElementById('loginId');
    const loginPasswordInput = document.getElementById('loginPassword');
    if (loginIdInput) loginIdInput.value = '';
    if (loginPasswordInput) loginPasswordInput.value = '';
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.classList.remove('active'); // Check if modal exists
}

function handleLogin() {
    const id = document.getElementById('loginId')?.value.trim(); // Optional chaining for robustness
    const password = document.getElementById('loginPassword')?.value.trim(); // Optional chaining
    
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
        currentUser = { id: user.id, nickname: user.nickname };
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
    if (modal) modal.classList.add('active'); // Check if modal exists
    
    const signupIdInput = document.getElementById('signupId');
    const signupPasswordInput = document.getElementById('signupPassword');
    const signupPasswordConfirmInput = document.getElementById('signupPasswordConfirm');
    const signupNicknameInput = document.getElementById('signupNickname');

    if (signupIdInput) signupIdInput.value = '';
    if (signupPasswordInput) signupPasswordInput.value = '';
    if (signupPasswordConfirmInput) signupPasswordConfirmInput.value = '';
    if (signupNicknameInput) signupNicknameInput.value = '';
}

function closeSignupModal() {
    const modal = document.getElementById('signupModal');
    if (modal) modal.classList.remove('active'); // Check if modal exists
}

function handleSignup() {
    const id = document.getElementById('signupId')?.value.trim(); // Optional chaining
    const password = document.getElementById('signupPassword')?.value.trim(); // Optional chaining
    const passwordConfirm = document.getElementById('signupPasswordConfirm')?.value.trim(); // Optional chaining
    const nickname = document.getElementById('signupNickname')?.value.trim(); // Optional chaining
    
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
    const newUser = { id: id, password: password, nickname: nickname, createdAt: new Date().toISOString() };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    alert('회원가입이 완료되었습니다!');
    closeSignupModal();
    currentUser = { id: newUser.id, nickname: newUser.nickname };
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

function open_main() { // This function in write.js will redirect to plan.html
    window.location.href = 'plan.html';
}

function initializeTagify() {
    if (tagify) return; // Prevent re-initialization
    const input = document.querySelector('input.tag');
    if (input) { // Check if element exists
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
}

document.addEventListener('DOMContentLoaded', () => {
    const imgAddInput = document.getElementById('img_add');
    const imgLogSpan = document.getElementById('img_log');

    if (imgAddInput && imgLogSpan) { // Check if elements exist
        imgAddInput.addEventListener('change', function(e) {
            const fileName = e.target.files[0] ? e.target.files[0].name : '선택된 파일 없음';
            imgLogSpan.textContent = fileName;
        });
    }
});


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
    const title = document.querySelector('#writePage .title')?.value.trim(); // Optional chaining
    const subtitle = document.querySelector('#writePage .subtitle')?.value.trim(); // Optional chaining
    const content = document.querySelector('#writePage .content')?.value.trim(); // Optional chaining
    const tags = tagify ? tagify.value.map(tag => tag.value) : [];
    const imageFile = document.getElementById('img_add')?.files[0]; // Optional chaining
    
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
        views: 0,
        likes: 0,
        likedBy: []
    };
    posts.push(postData);
    localStorage.setItem('posts', JSON.stringify(posts));
    console.log('게시글 저장 완료:', postData);
    alert('게시 완료!');
    
    // Clear form fields
    const writePageTitle = document.querySelector('#writePage .title');
    const writePageSubtitle = document.querySelector('#writePage .subtitle');
    const writePageContent = document.querySelector('#writePage .content');
    const imgAddElement = document.getElementById('img_add');
    const imgLogElement = document.getElementById('img_log');

    if (writePageTitle) writePageTitle.value = '';
    if (writePageSubtitle) writePageSubtitle.value = '';
    if (writePageContent) writePageContent.value = '';
    if (tagify) tagify.removeAllTags();
    if (imgAddElement) imgAddElement.value = '';
    if (imgLogElement) imgLogElement.textContent = '선택된 파일 없음';
    
    // Redirect to plan.html after saving the post
    window.location.href = 'plan.html';
}


// Event listeners for write.html
window.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    
    const loginModal = document.getElementById('loginModal');
    if (loginModal) { // Check if element exists
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                closeLoginModal();
            }
        });
    }
    
    const signupModal = document.getElementById('signupModal');
    if (signupModal) { // Check if element exists
        signupModal.addEventListener('click', function(e) {
            if (e.target === signupModal) {
                closeSignupModal();
            }
        });
    }
    
    document.addEventListener('click', function(e) {
        const writeDropdown = document.getElementById('writeUserDropdown');
        if (writeDropdown && !writeDropdown.contains(e.target)) { // Check if element exists
            closeUserDropdown();
        }
    });
    
    const loginPasswordInput = document.getElementById('loginPassword');
    if (loginPasswordInput) { // Check if element exists
        loginPasswordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }
    
    const signupNicknameInput = document.getElementById('signupNickname');
    if (signupNicknameInput) { // Check if element exists
        signupNicknameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSignup();
            }
        });
    }
    
    // Initialize Tagify when the write page loads
    initializeTagify();

    // 검색 초기화
    initializeSearch();
});

// 검색 기능 - 메인 페이지로 이동 (from read.js)
function search_on() {
    const searchInput = document.querySelector('.search_text');
    const keyword = searchInput.value.trim();
    
    console.log('검색어:', keyword);
    
    // 검색어를 localStorage에 저장
    if (keyword) {
        localStorage.setItem('searchKeyword', keyword);
        console.log('localStorage에 저장됨:', keyword);
    } else {
        localStorage.removeItem('searchKeyword');
    }
    
    // 메인 페이지로 이동
    window.location.href = 'plan.html';
}

// 검색창 엔터키 이벤트 초기화 (from read.js)
function initializeSearch() {
    const searchInput = document.querySelector('.search_text');
    
    // 엔터키 이벤트 추가
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            search_on();
        }
    });
}