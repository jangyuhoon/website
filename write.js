document.getElementById('img_add').addEventListener('change', function(e) {
    const fileName = e.target.files[0] ? e.target.files[0].name : '선택된 파일 없음';
    document.getElementById('img_log').textContent = fileName;
});

var input = document.querySelector('input.tag');

// 저장된 해시태그 목록 (localStorage에서 불러오기)
let savedHashtags = JSON.parse(localStorage.getItem('savedHashtags')) || [];

// Tagify 초기화
const tagify = new Tagify(input, {
    whitelist: savedHashtags,
    enforceWhitelist: false,
    dropdown: {
        enabled: 0,
        maxItems: 10,
        closeOnSelect: false
    }
});

// 게시글 목록 불러오기
function getPosts() {
    return JSON.parse(localStorage.getItem('posts')) || [];
}

// 게시글 저장하기
function savePost(post) {
    const posts = getPosts();
    posts.push(post);
    localStorage.setItem('posts', JSON.stringify(posts));
}

// 이미지를 Base64로 변환
function readImageAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// 게시 버튼 클릭 시
document.querySelector('.save').addEventListener('click', async function() {
    const title = document.querySelector('.title').value.trim();
    const subtitle = document.querySelector('.subtitle').value.trim();
    const content = document.querySelector('.content').value.trim();
    const tags = tagify.value.map(tag => tag.value);
    const imageFile = document.getElementById('img_add').files[0];
    
    // 필수 항목 확인
    if (!title) {
        alert('제목을 입력해주세요.');
        return;
    }
    
    if (!content) {
        alert('내용을 입력해주세요.');
        return;
    }
    
    // 이미지 처리 (있는 경우 Base64로 변환)
    let imageData = null;
    if (imageFile) {
        try {
            imageData = await readImageAsBase64(imageFile);
        } catch (error) {
            console.error('이미지 읽기 실패:', error);
        }
    }
    
    // 새로운 해시태그를 저장 목록에 추가 (중복 제거)
    tags.forEach(tag => {
        if (!savedHashtags.includes(tag)) {
            savedHashtags.push(tag);
        }
    });
    
    // 해시태그 목록 localStorage에 저장
    localStorage.setItem('savedHashtags', JSON.stringify(savedHashtags));
    
    // Tagify 자동완성 목록 업데이트
    tagify.whitelist = savedHashtags;
    
    // 게시글 ID 생성 (타임스탬프 기반)
    const posts = getPosts();
    const postId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;
    
    // 게시글 데이터 생성
    const postData = {
        id: postId,
        title: title,
        subtitle: subtitle,
        content: content,
        tags: tags,
        image: imageData,
        imageName: imageFile?.name || null,
        createdAt: new Date().toISOString(),
        views: 0
    };
    
    // 게시글 저장
    savePost(postData);
    
    console.log('게시글 저장 완료:', postData);
    console.log('저장된 해시태그:', savedHashtags);
    
    alert('게시 완료!');
    
    // read.html로 이동 (게시글 ID 전달)
    window.location.href = `read.html#${postId}`;
    
    // 또는 폼 초기화 후 현재 페이지에 머물기
    /*
    document.querySelector('.title').value = '';
    document.querySelector('.subtitle').value = '';
    document.querySelector('.content').value = '';
    tagify.removeAllTags();
    document.getElementById('img_add').value = '';
    document.getElementById('img_log').textContent = '선택된 파일 없음';
    */
});