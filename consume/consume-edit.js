let tagify = null;
let writeSelectedCategory = null; // Unused, but keep for consistency if it was intended

let isNavigating = false; // 페이지 전환 중인지 여부
let currentPostId = null; // 현재 편집 중인 게시글 ID

// User Auth variables and functions (duplicated from main.js for independence)
let currentUser = null;

async function getPosts() {
    try {
        const posts = await appDB.getAll('consume_posts');
        return posts;
    } catch (error) {
        console.error('Failed to get posts from IndexedDB:', error);
        return [];
    }
}

// 특정 ID의 게시글 찾기
async function getPostById(id) {
    try {
        const post = await appDB.get('consume_posts', id);
        return post;
    } catch (error) {
        console.error(`Failed to get post with ID ${id} from IndexedDB:`, error);
        return null;
    }
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

async function openMyPosts() {
    closeUserDropdown();
    if (!currentUser) return;
    // 나의 게시글 모드 활성화 (sessionStorage에 저장)
    sessionStorage.setItem('consumeIsMyPostsMode', 'true');
    sessionStorage.removeItem('consumeIsMyLikesMode'); // 다른 모드 비활성화

    // 검색 및 필터 초기화는 consume.js에서 처리되므로 여기서는 페이지 이동만
    showLoadingAndNavigateToPage('consume.html');
}

async function openMyLikes() {
    closeUserDropdown();
    if (!currentUser) return;
    alert('나의 좋아요 기능은 준비 중입니다.'); // 이 페이지에서는 직접적인 로딩 기능이 없으므로, consume.html로 이동 후 처리
    sessionStorage.setItem('consumeIsMyLikesMode', 'true');
    sessionStorage.removeItem('consumeIsMyPostsMode'); // 다른 모드 비활성화
    showLoadingAndNavigateToPage('consume.html');
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

// 로딩 페이지 표시 및 페이지 전환 (from read.js)
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

async function initializeTagify(initialTags = []) {
    if (tagify) tagify.destroy(); // Destroy previous instance if exists
    const input = document.querySelector('input.tag');
    if (input) { // Check if element exists
        const storedTags = await appDB.getAll('consume_saved_hashtags');
        const whitelist = storedTags.map(t => t.tag);
        tagify = new Tagify(input, {
            whitelist: whitelist,
            enforceWhitelist: false,
            dropdown: {
                enabled: 0,
                maxItems: 10,
                closeOnSelect: false
            }
        });
        if (initialTags.length > 0) {
            tagify.addTags(initialTags);
        }
    }
}

// 금액 입력 콤마 추가 함수
function addCommas(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 콤마 제거하고 숫자만 추출
function removeCommas(str) {
    return str.replace(/,/g, '');
}

// 금액 입력 필드 초기화
function initializeAmountInput() {
    const amountInput = document.querySelector('.subtitle');
    
    if (amountInput) {
        // type을 text로 변경
        amountInput.type = 'text';
        
        // 기존 값이 있으면 콤마 포맷 적용
        if (amountInput.value) {
            const numericValue = removeCommas(amountInput.value);
            if (numericValue) {
                amountInput.value = addCommas(numericValue);
            }
        }
        
        // 입력 시 자동으로 콤마 추가
        amountInput.addEventListener('input', function(e) {
            let value = removeCommas(e.target.value);
            
            // 숫자만 허용
            value = value.replace(/[^\d]/g, '');
            
            if (value) {
                e.target.value = addCommas(value);
            } else {
                e.target.value = '';
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

// 기존 savePost 함수를 updatePost 함수로 변경
async function updatePost() {
    if (!currentUser) {
        alert('로그인이 필요한 서비스입니다.');
        openLoginModal();
        return;
    }
    if (!currentPostId) {
        alert('편집할 게시글 ID를 찾을 수 없습니다.');
        return;
    }

    const title = document.querySelector('#writePage .title')?.value.trim();
    const subtitleInput = document.querySelector('#writePage .subtitle');
    const subtitle = subtitleInput ? removeCommas(subtitleInput.value.trim()) : ''; // 콤마 제거 후 저장
    const content = document.querySelector('#writePage .content')?.value.trim();
    const tags = tagify ? tagify.value.map(tag => tag.value) : [];
    const imageFile = document.getElementById('img_add')?.files[0];

    if (!title) {
        alert('제목을 입력해주세요.');
        return;
    }
    
    // 금액 검증
    if (subtitle) {
        const amountValue = parseInt(subtitle);
        if (isNaN(amountValue) || amountValue < 1000) {
            alert('값이 최소값보다 작습니다.');
            return;
        }
    }
    
    if (!content) {
        alert('내용을 입력해주세요.');
        return;
    }

    try {
        const existingPost = await appDB.get('consume_posts', parseInt(currentPostId));

        if (!existingPost) {
            alert('해당 게시글을 찾을 수 없습니다.');
            return;
        }

        let imageData = existingPost.image;
        let imageName = existingPost.imageName;

        if (imageFile) {
            imageData = await readImageAsBase64(imageFile);
            imageName = imageFile.name;
        }

        // 기존 태그들의 count 감소
        const oldTags = existingPost.tags || [];
        for (const oldTag of oldTags) {
            try {
                const existingTag = await appDB.get('consume_saved_hashtags', oldTag);
                if (existingTag) {
                    existingTag.count = Math.max((existingTag.count || 1) - 1, 0);
                    if (existingTag.count === 0) {
                        await appDB.delete('consume_saved_hashtags', oldTag);
                    } else {
                        await appDB.put('consume_saved_hashtags', existingTag);
                    }
                }
            } catch (error) {
                console.warn(`Failed to decrease count for hashtag ${oldTag}:`, error);
            }
        }

        // 새 태그들의 count 증가
        for (const newTag of tags) {
            try {
                const existingTag = await appDB.get('consume_saved_hashtags', newTag);
                if (existingTag) {
                    existingTag.count = (existingTag.count || 0) + 1;
                    await appDB.put('consume_saved_hashtags', existingTag);
                } else {
                    await appDB.add('consume_saved_hashtags', { tag: newTag, count: 1 });
                }
            } catch (error) {
                console.warn(`Failed to save hashtag ${newTag}:`, error);
            }
        }

        // 게시글 데이터 업데이트
        const updatedPostData = {
            ...existingPost,
            title: title,
            subtitle: subtitle,
            content: content,
            tags: tags,
            image: imageData,
            imageName: imageName,
            updatedAt: new Date().toISOString()
        };

        await appDB.put('consume_posts', updatedPostData);

        console.log('게시글 업데이트 완료:', updatedPostData);
        alert('게시글이 성공적으로 수정되었습니다!');
        showLoadingAndNavigateToPage('consume-read.html#' + currentPostId);

    } catch (error) {
        console.error('게시글 업데이트 실패:', error);
        alert('게시글 업데이트에 실패했습니다. 콘솔을 확인해주세요.');
    }
}

// 게시글 삭제 함수
async function deletePost() {
    if (!currentUser) {
        alert('로그인이 필요한 서비스입니다.');
        openLoginModal();
        return;
    }
    if (!currentPostId) {
        alert('삭제할 게시글 ID를 찾을 수 없습니다.');
        return;
    }

    if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) {
        return;
    }

    try {
        const existingPost = await appDB.get('consume_posts', parseInt(currentPostId));
        if (!existingPost) {
            alert('해당 게시글을 찾을 수 없습니다.');
            return;
        }

        // 게시글의 태그들 count 감소
        const tags = existingPost.tags || [];
        for (const tag of tags) {
            try {
                const existingTag = await appDB.get('consume_saved_hashtags', tag);
                if (existingTag) {
                    existingTag.count = Math.max((existingTag.count || 1) - 1, 0);
                    if (existingTag.count === 0) {
                        await appDB.delete('consume_saved_hashtags', tag);
                    } else {
                        await appDB.put('consume_saved_hashtags', existingTag);
                    }
                }
            } catch (error) {
                console.warn(`Failed to decrease count for hashtag ${tag}:`, error);
            }
        }

        await appDB.delete('consume_posts', parseInt(currentPostId));

        console.log('게시글 삭제 완료:', currentPostId);
        alert('게시글이 성공적으로 삭제되었습니다!');
        
        showLoadingAndNavigateToPage('consume.html');
    } catch (error) {
        console.error('게시글 삭제 실패:', error);
        alert('게시글 삭제에 실패했습니다. 콘솔을 확인해주세요.');
    }
}

// 게시글 데이터를 불러와 폼에 채우는 함수
async function loadPostForEdit(postId) {
    const post = await getPostById(parseInt(postId));

    if (!post) {
        alert('편집할 게시글을 찾을 수 없습니다.');
        window.location.href = 'consume.html'; // 게시글 목록 페이지로 리다이렉트
        return;
    }

    // 현재 사용자가 게시글의 작성자인지 확인
    if (!currentUser || post.authorId !== currentUser.id) {
        alert('이 게시글을 수정할 권한이 없습니다.');
        showLoadingAndNavigateToPage('consume-read.html#' + postId); // 읽기 페이지로 리다이렉트
        return;
    }

    // 폼 필드 채우기
    document.querySelector('#postId').value = post.id;
    document.querySelector('#writePage .title').value = post.title;
    
    // subtitle 값 설정 (콤마 포맷 적용)
    const subtitleInput = document.querySelector('#writePage .subtitle');
    if (subtitleInput) {
        subtitleInput.type = 'text'; // type을 text로 변경
        const subtitleValue = post.subtitle || '';
        if (subtitleValue) {
            const numericValue = removeCommas(subtitleValue.toString()); // post.subtitle이 숫자일 수 있으므로 toString() 추가
            subtitleInput.value = addCommas(numericValue);
        } else {
            subtitleInput.value = '';
        }
    }
    
    document.querySelector('#writePage .content').value = post.content;
    
    const imgLogSpan = document.getElementById('img_log');
    if (imgLogSpan) {
        imgLogSpan.textContent = post.imageName || '선택된 파일 없음';
    }

    // Tagify 초기화 및 태그 채우기
    await initializeTagify(post.tags);
}


window.addEventListener('DOMContentLoaded', async function() { // async로 변경
    checkLoginStatus();
    
    // localStorage -> IndexedDB 마이그레이션 (한 번만 실행)
    await appDB.migrateFromLocalStorage('consumePosts', 'consume_posts');

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
    
    // URL에서 postId 추출
    const hash = window.location.hash;
    if (hash && hash.startsWith('#')) {
        currentPostId = parseInt(hash.substring(1)); // parseInt로 변환
    }

    if (currentPostId) {
        await loadPostForEdit(currentPostId); // await 추가
    } else {
        alert('편집할 게시글 ID가 URL에 없습니다.');
        window.location.href = 'consume.html'; // ID가 없으면 목록 페이지로 리다이렉트
    }

    // 금액 입력 필드 초기화 (loadPostForEdit 이후에 호출)
    setTimeout(() => {
        initializeAmountInput();
    }, 100);

    // 검색 초기화 (read.js에서 가져옴) - 현재 페이지에서는 검색 기능이 직접 사용되지 않을 수 있지만, 구조 유지를 위해 남겨둠.
    // 검색창 엔터키 이벤트 초기화 (from read.js)
    const searchInput = document.querySelector('.search_text');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                search_on();
            }
        });
    }
});

// 검색 기능 - 메인 페이지로 이동 (from read.js)
function search_on() {
    const searchInput = document.querySelector('.search_text');
    const keyword = searchInput.value.trim();
    
    console.log('검색어:', keyword);
    
    // 검색어를 localStorage에 저장
    if (keyword) {
        localStorage.setItem('consumeSearchKeyword', keyword);
        console.log('localStorage에 저장됨:', keyword);
    } else {
        localStorage.removeItem('consumeSearchKeyword');
    }
    
    // 메인 페이지로 이동
    showLoadingAndNavigateToPage('consume.html');
}