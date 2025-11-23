let currentSlide = 1;
const totalSlides = 5;
const sliderContainer = document.getElementById('sliderContainer');
let isAnimating = false;

// 스와이프/드래그 관련 변수
let startX = 0;
let currentX = 0;
let isDragging = false;
let startTransform = 0;
let hasMoved = false; // 실제로 드래그했는지 확인

// 스크롤 트리거 변수
let isScrollTriggered = false;

// 각 화면별 이동할 페이지 매핑
const pageMapping = {
    1: 'plan.html',
    2: 'produce.html',
    3: 'consume.html',
    4: 'reform.html',
    5: 'donate.html'
};

// 초기 위치 설정 (첫 번째 실제 슬라이드로)
sliderContainer.style.transform = `translateX(-100vw)`;

function updateSlide(animate = true) {
    if (animate) {
        sliderContainer.style.transition = 'transform 0.6s ease-in-out';
    } else {
        sliderContainer.style.transition = 'none';
    }
    const offset = -(currentSlide) * 100;
    sliderContainer.style.transform = `translateX(${offset}vw)`;
}

function right_on() {
    if (isAnimating) return;
    isAnimating = true;

    currentSlide++;
    updateSlide(true);

    if (currentSlide === totalSlides + 1) {
        setTimeout(() => {
            currentSlide = 1;
            updateSlide(false);
            setTimeout(() => {
                isAnimating = false;
            }, 50);
        }, 600);
    } else {
        setTimeout(() => {
            isAnimating = false;
        }, 600);
    }
}

function left_on() {
    if (isAnimating) return;
    isAnimating = true;

    currentSlide--;
    updateSlide(true);

    if (currentSlide === 0) {
        setTimeout(() => {
            currentSlide = totalSlides;
            updateSlide(false);
            setTimeout(() => {
                isAnimating = false;
            }, 50);
        }, 600);
    } else {
        setTimeout(() => {
            isAnimating = false;
        }, 600);
    }
}

// 드래그/스와이프 시작
function handleStart(e) {
    // 화살표 아이콘과 그 부모 요소 클릭 시 드래그 방지
    const target = e.target;
    const isArrowArea = target.tagName === 'ION-ICON' || 
                        target.classList.contains('left') || 
                        target.classList.contains('right') ||
                        target.closest('.left') || 
                        target.closest('.right');
    
    if (isArrowArea) {
        return;
    }
    
    if (isAnimating) return;
    
    isDragging = true;
    hasMoved = false;
    startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    currentX = startX;
    startTransform = -(currentSlide) * window.innerWidth;
    
    sliderContainer.style.transition = 'none';
}

// 드래그/스와이프 중
function handleMove(e) {
    if (!isDragging) return;
    
    e.preventDefault();
    currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const diff = currentX - startX;
    
    // 5px 이상 움직였을 때만 hasMoved를 true로
    if (Math.abs(diff) > 5) {
        hasMoved = true;
    }
    
    const newTransform = startTransform + diff;
    sliderContainer.style.transform = `translateX(${newTransform}px)`;
}

// 드래그/스와이프 종료
function handleEnd(e) {
    if (!isDragging) return;
    
    isDragging = false;
    
    // 실제로 드래그하지 않았으면 (단순 클릭) 아무것도 하지 않음
    if (!hasMoved) {
        sliderContainer.style.transition = 'transform 0.3s ease-out';
        updateSlide(false);
        return;
    }
    
    const diff = currentX - startX;
    const threshold = window.innerWidth * 0.2;
    
    if (Math.abs(diff) > threshold) {
        if (diff > 0) {
            left_on();
        } else {
            right_on();
        }
    } else {
        sliderContainer.style.transition = 'transform 0.3s ease-out';
        updateSlide(false);
    }
}

// 로딩 페이지 표시 및 페이지 전환
function showLoadingAndNavigate() {
    if (isScrollTriggered) return;
    isScrollTriggered = true;
    
    // 현재 화면에 해당하는 페이지 URL
    const targetPage = pageMapping[currentSlide];
    
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

// 스크롤 이벤트 감지
let lastScrollTime = 0;
function handleScroll(e) {
    if (isScrollTriggered || isDragging) return;
    
    const now = Date.now();
    if (now - lastScrollTime < 500) return; // 0.5초 디바운스
    
    if (e.deltaY > 0) { // 아래로 스크롤
        lastScrollTime = now;
        showLoadingAndNavigate();
    }
}

// 터치 스크롤 감지
let touchStartY = 0;
let isTouchScrolling = false;
function handleTouchStartScroll(e) {
    // 화살표 아이콘 터치 시 스크롤 감지 방지
    if (e.target.tagName === 'ION-ICON' || e.target.closest('.left') || e.target.closest('.right')) {
        return;
    }
    touchStartY = e.touches[0].clientY;
    isTouchScrolling = false;
}

function handleTouchMoveScroll(e) {
    if (isScrollTriggered || isDragging) return;
    
    // 화살표 아이콘 터치 시 스크롤 감지 방지
    if (e.target.tagName === 'ION-ICON' || e.target.closest('.left') || e.target.closest('.right')) {
        return;
    }
    
    const touchEndY = e.touches[0].clientY;
    const diff = touchStartY - touchEndY;
    
    // 수직으로만 스크롤하는지 확인
    if (!isTouchScrolling && Math.abs(diff) > 50) {
        isTouchScrolling = true;
        showLoadingAndNavigate();
    }
}

// 이벤트 리스너
sliderContainer.addEventListener('mousedown', handleStart);
document.addEventListener('mousemove', handleMove);
document.addEventListener('mouseup', handleEnd);

sliderContainer.addEventListener('touchstart', handleStart, { passive: false });
document.addEventListener('touchmove', handleMove, { passive: false });
document.addEventListener('touchend', handleEnd);

// 스크롤 이벤트
document.addEventListener('wheel', handleScroll, { passive: true });
sliderContainer.addEventListener('touchstart', handleTouchStartScroll, { passive: true });
sliderContainer.addEventListener('touchmove', handleTouchMoveScroll, { passive: true });

sliderContainer.addEventListener('dragstart', (e) => e.preventDefault());

// 키보드 화살표 키
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight') {
        right_on();
    } else if (e.key === 'ArrowLeft') {
        left_on();
    }
});