// 현재 로그인 중인 사용자 정보
let currentUser = null;
let isNavigating = false; // 페이지 전환 중인지 여부

// 페이지 로드 시 로그인 상태 확인
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

// 아이콘 표시 업데이트
function updateIconDisplay() {
    const mainlogin = document.getElementById('mainlogin');
    
    if (currentUser) {
        mainlogin.textContent = currentUser.nickname;
    } else {
        mainlogin.textContent = '로그인';
    }
}

// 아이콘 클릭 핸들러
function handleloginClick(event) {
    event.stopPropagation();
    
    if (currentUser) {
        toggleUserDropdown();
    } else {
        openLoginModal();
    }
}

// 사용자 드롭다운 토글
function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    const icon = document.getElementById('mainlogin');
    
    const isActive = dropdown.classList.toggle('active');
    
    if (isActive) {
        const iconRect = icon.getBoundingClientRect();
        dropdown.style.top = (iconRect.bottom + 10) + 'px';
        dropdown.style.left = iconRect.left + 'px';
        dropdown.style.width = iconRect.width + 'px';
    }
}

// 드롭다운 닫기
function closeUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.remove('active');
}

// 회원 정보
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

// 나의 게시글
function openMyPosts() {
    closeUserDropdown();
    if (!currentUser) return;
    
    // produce 게시판의 '나의 게시글' 모드 활성화
    localStorage.setItem('produceIsMyPostsMode', 'true');
    // 다른 모드 비활성화 (명확성을 위해)
    localStorage.removeItem('produceIsMyLikesMode');
    
    window.location.href = 'produce.html';
}

// 나의 좋아요
function openMyLikes() {
    closeUserDropdown();
    if (!currentUser) return;
    
    // produce 게시판의 '나의 좋아요' 모드 활성화
    localStorage.setItem('produceIsMyLikesMode', 'true');
    // 다른 모드 비활성화
    localStorage.removeItem('produceIsMyPostsMode');

    window.location.href = 'produce.html';
}

// 로그인 모달 열기
function openLoginModal() {
    closeSignupModal();
    const modal = document.getElementById('loginModal');
    modal.classList.add('active');
    
    document.getElementById('loginId').value = '';
    document.getElementById('loginPassword').value = '';
}

// 로그인 모달 닫기
function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.remove('active');
}

// 로그인 처리
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

// 회원가입 모달 열기
function openSignupModal() {
    closeLoginModal();
    const modal = document.getElementById('signupModal');
    modal.classList.add('active');
    
    document.getElementById('signupId').value = '';
    document.getElementById('signupPassword').value = '';
    document.getElementById('signupPasswordConfirm').value = '';
    document.getElementById('signupNickname').value = '';
}

// 회원가입 모달 닫기
function closeSignupModal() {
    const modal = document.getElementById('signupModal');
    modal.classList.remove('active');
}

// 회원가입 처리
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

// 로그아웃 함수
function logout() {
    closeUserDropdown();
    localStorage.removeItem('currentUser');
    currentUser = null;
    updateIconDisplay();
    alert('로그아웃 되었습니다.');
}

// 로딩 페이지 표시 및 페이지 전환 (main.js에서 가져옴)
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

// 카테고리 드롭다운 토글
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

// URL에서 게시글 ID 가져오기
function getPostIdFromURL() {
    const hash = window.location.hash;
    return hash ? parseInt(hash.substring(1)) : null;
}

// localStorage에서 게시글 가져오기
function getPosts() {
    return JSON.parse(localStorage.getItem('producePosts')) || [];
}

// 특정 ID의 게시글 찾기
function getPostById(id) {
    const posts = getPosts();
    return posts.find(post => post.id === id);
}

// 검색 기능 - 메인 페이지로 이동
function search_on() {
    const searchInput = document.querySelector('.search_text');
    const keyword = searchInput.value.trim();
    
    console.log('검색어:', keyword);
    
    // 검색어를 localStorage에 저장
    if (keyword) {
        localStorage.setItem('produceSearchKeyword', keyword);
        console.log('localStorage에 저장됨:', keyword);
    } else {
        localStorage.removeItem('produceSearchKeyword');
    }
    
    // 메인 페이지로 이동
    showLoadingAndNavigateToPage('produce.html');
}

// 게시글 데이터 로드 및 표시
function loadPost() {
    const postId = getPostIdFromURL();
    const likeDiv = document.querySelector('.like'); // Get the .like div

    if (!postId) {
        alert('게시글을 찾을 수 없습니다.');
        window.location.href = 'produce.html';
        return;
    }

    let post = getPostById(postId); // Use 'let' because we'll modify it

    if (!post) {
        alert('해당 게시글이 존재하지 않습니다.');
        window.location.href = 'produce.html';
        return;
    }

    // Initialize likes and likedBy if missing (for older posts)
    if (post.likes === undefined) post.likes = 0;
    if (!post.likedBy) post.likedBy = [];

    // 조회수 증가
    post.views = (post.views || 0) + 1;
    updatePost(post);

    // Initial like state setup
    if (currentUser && post.likedBy.includes(currentUser.id)) {
        likeDiv.classList.add('liked');
    } else {
        likeDiv.classList.remove('liked');
    }

    // 제목 표시
    document.querySelector('.title').textContent = post.title;

    // 설명 표시
    document.querySelector('.subtitle').textContent = post.subtitle || '';

    // 내용 표시
    document.querySelector('.content').textContent = post.content;

    // 이미지 표시
    const imgContainer = document.querySelector('.img_container');
    const img = document.querySelector('.img');

    if (post.image) {
        img.src = post.image;
        img.alt = post.title;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        img.style.objectFit = 'contain';
        img.style.display = 'block';
    } else {
        imgContainer.style.display = 'none';
    }

    // 태그 표시
    const tagContainer = document.querySelector('.tag_container');

    if (post.tags && post.tags.length > 0) {
        tagContainer.innerHTML = post.tags.map(tag =>
            `<div class="tag">#${tag}</div>`
        ).join('');
    } else {
        tagContainer.innerHTML = '<p style="color: #999; font-size: 14px;">태그가 없습니다.</p>';
    }
}

// 게시글 업데이트 (조회수 등)
function updatePost(updatedPost) {
    const posts = getPosts();
    const index = posts.findIndex(post => post.id === updatedPost.id);
    
    if (index !== -1) {
        posts[index] = updatedPost;
        localStorage.setItem('producePosts', JSON.stringify(posts));
        console.log('localStorage posts updated.');
    }
}

// 검색창 엔터키 이벤트 초기화
function initializeSearch() {
    const searchInput = document.querySelector('.search_text');
    
    // 엔터키 이벤트 추가
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            search_on();
        }
    });
}

// 페이지 로드 시 초기화
window.addEventListener('DOMContentLoaded', function() {
    // 로그인 상태 확인
    checkLoginStatus();
    
    // 로그인 모달 외부 클릭 시 닫기
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                closeLoginModal();
            }
        });
    }
    
    // 회원가입 모달 외부 클릭 시 닫기
    const signupModal = document.getElementById('signupModal');
    if (signupModal) {
        signupModal.addEventListener('click', function(e) {
            if (e.target === signupModal) {
                closeSignupModal();
            }
        });
    }
    
    // 문서 전체 클릭 시 드롭다운 닫기
    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown && !dropdown.contains(e.target)) {
            closeUserDropdown();
        }
    });
    
    // Enter 키로 로그인
    const loginPasswordInput = document.getElementById('loginPassword');
    if (loginPasswordInput) {
        loginPasswordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }
    
    // Enter 키로 회원가입
    const signupNicknameInput = document.getElementById('signupNickname');
    if (signupNicknameInput) {
        signupNicknameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSignup();
            }
        });
    }
    
    // 검색 초기화
    initializeSearch();

    // 좋아요 기능 클릭 이벤트 추가 및 호버 로직 수정
    const likeDiv = document.querySelector('.like');
    if (likeDiv) {
        const heartSvg = likeDiv.querySelector('.heart-svg');

        // 호버 이벤트 (기존 코드 수정)
        if (heartSvg) {
            heartSvg.addEventListener('mouseenter', function() {
                if (!likeDiv.classList.contains('liked')) {
                    likeDiv.classList.add('hovering'); // 임시 클래스로 호버 상태 표시
                }
            });

            heartSvg.addEventListener('mouseleave', function() {
                if (!likeDiv.classList.contains('liked')) {
                    likeDiv.classList.remove('hovering');
                }
            });
        }
        
        // 클릭 이벤트
        if (heartSvg) { // Ensure heartSvg exists before attaching listener
            heartSvg.addEventListener('click', function() {
                console.log('--- Like Click Event ---');
                if (!currentUser) {
                    console.log('Not logged in. Opening login modal.');
                    alert('로그인이 필요한 서비스입니다.');
                    openLoginModal();
                    return;
                }
                console.log('Current User:', currentUser);

                const postId = getPostIdFromURL();
                console.log('Post ID:', postId);
                if (!postId) {
                    console.log('No Post ID found.');
                    return;
                }

                let post = getPostById(postId);
                console.log('Initial Post:', JSON.parse(JSON.stringify(post)));
                if (!post) {
                    console.log('Post not found.');
                    return;
                }

                // Initialize likes and likedBy if missing (for older posts)
                if (post.likes === undefined) post.likes = 0;
                if (!post.likedBy) post.likedBy = [];

                const userIndex = post.likedBy.indexOf(currentUser.id);
                console.log('User index in likedBy:', userIndex);

                if (userIndex === -1) { // Not liked, so like it
                    post.likedBy.push(currentUser.id);
                    post.likes++;
                    likeDiv.classList.add('liked');
                    console.log('Post liked. New state:', post.likedBy, post.likes);
                } else { // Already liked, so unlike it
                    post.likedBy.splice(userIndex, 1);
                    post.likes--;
                    likeDiv.classList.remove('liked');
                    console.log('Post unliked. New state:', post.likedBy, post.likes);
                }
                updatePost(post);
                console.log('Post updated and saved. Final Post:', JSON.parse(JSON.stringify(post)));
            });
        }
    }
    
    // 게시글 로드
    loadPost();
});
// URL 해시 변경 시 게시글 다시 로드
window.addEventListener('hashchange', function() {
    loadPost();
});
