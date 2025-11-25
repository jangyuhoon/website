// 현재 로그인 중인 사용자 정보
let currentUser = null;

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
    const iconArea = document.getElementById('iconArea');
    
    if (currentUser) {
        iconArea.textContent = currentUser.nickname;
    } else {
        iconArea.textContent = '로그인';
    }
}

// 아이콘 클릭 핸들러
function handleIconClick(event) {
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
    const icon = document.getElementById('iconArea');
    
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
    
    window.location.href = 'plan.html';
}

// 나의 좋아요
function openMyLikes() {
    closeUserDropdown();
    if (!currentUser) return;
    
    alert('나의 좋아요 기능은 준비 중입니다.');
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

// 카테고리 드롭다운 토글
function category_on() {
    const dropdown = document.querySelector('.category_dropdown');
    const icon = document.querySelector('.category_icon');
    
    dropdown.classList.toggle('active');
    icon.style.transform =
        icon.style.transform === 'rotate(180deg)' ? 'rotate(0deg)' : 'rotate(180deg)';
}

// URL에서 게시글 ID 가져오기
function getPostIdFromURL() {
    const hash = window.location.hash;
    return hash ? parseInt(hash.substring(1)) : null;
}

// localStorage에서 게시글 가져오기
function getPosts() {
    return JSON.parse(localStorage.getItem('posts')) || [];
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
        localStorage.setItem('searchKeyword', keyword);
        console.log('localStorage에 저장됨:', keyword);
    } else {
        localStorage.removeItem('searchKeyword');
    }
    
    // 메인 페이지로 이동
    window.location.href = 'plan.html';
}

// 게시글 데이터 로드 및 표시
function loadPost() {
    const postId = getPostIdFromURL();
    
    if (!postId) {
        alert('게시글을 찾을 수 없습니다.');
        window.location.href = 'plan.html';
        return;
    }
    
    const post = getPostById(postId);
    
    if (!post) {
        alert('해당 게시글이 존재하지 않습니다.');
        window.location.href = 'plan.html';
        return;
    }
    
    // 조회수 증가
    post.views = (post.views || 0) + 1;
    updatePost(post);
    
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
        localStorage.setItem('posts', JSON.stringify(posts));
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
    loginModal.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            closeLoginModal();
        }
    });
    
    // 회원가입 모달 외부 클릭 시 닫기
    const signupModal = document.getElementById('signupModal');
    signupModal.addEventListener('click', function(e) {
        if (e.target === signupModal) {
            closeSignupModal();
        }
    });
    
    // 문서 전체 클릭 시 드롭다운 닫기
    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('userDropdown');
        
        if (!dropdown.contains(e.target)) {
            closeUserDropdown();
        }
    });
    
    // Enter 키로 로그인
    document.getElementById('loginPassword').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });
    
    // Enter 키로 회원가입
    document.getElementById('signupNickname').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSignup();
        }
    });
    
    // 검색 초기화
    initializeSearch();

    // 좋아요 아이콘 호버 이벤트
    const likeIcon = document.querySelector('.like ion-icon');
    if (likeIcon) {
        likeIcon.addEventListener('mouseenter', function() {
            this.setAttribute('name', 'heart');
        });

        likeIcon.addEventListener('mouseleave', function() {
            this.setAttribute('name', 'heart-outline');
        });
    }
    
    // 게시글 로드
    loadPost();
});

// URL 해시 변경 시 게시글 다시 로드
window.addEventListener('hashchange', function() {
    loadPost();
});