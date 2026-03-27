// DOM 요소
const descriptionSectionEl = document.getElementById("description-section");
const startButtonEl = document.getElementById("startButton");
const downloadButtonEl = document.getElementById("downloadButton");
const videoElement = document.getElementById("videoElement");
const photoCaptureSectionEl = document.getElementById("photo-capture-section");
const photoChoiceSectionEl = document.getElementById("photo-choice-section");
const photoOutputSectionEl = document.getElementById("photo-output-section");
const captureButton = document.getElementById("captureButton");
const photoList = document.getElementById("photoList");
const selectPhotoList = document.getElementById("selectPhotoList");
const remainingCountElement = document.getElementById("remainingCount");
const countdownTimer = document.getElementById("countdownTimer");
const selectCompleteButtonEl = document.getElementById("selectCompleteButton");
const frameHoles = document.querySelectorAll(".frame-hole");

// 프레임 배열
const frameArr = [
  {
    imgSrc: "frame/4.3frame.png",
    name: "4.3frame"
  },
  {
    imgSrc: "frame/치이카와 인생네컷1.png",
    name: "치이카와 인생네컷1"
  },
  {
    imgSrc: "frame/치이카와 인생네컷2.png",
    name: "치이카와 인생네컷2"
  },
  {
    imgSrc: "frame/치이카와 인생네컷3.png",
    name: "치이카와 인생네컷3"
  },
  {
    imgSrc: "frame/치이카와 인생네컷4.png",
    name: "치이카와 인생네컷4"
  },
  {
    imgSrc: "frame/치이카와 인생네컷5.png",
    name: "치이카와 인생네컷5"
  },
  {
    imgSrc: "frame/치이카와 인생네컷6.png",
    name: "치이카와 인생네컷6"
  },
  {
    imgSrc: "frame/잔망루피프레임.png",
    name: "잔망루피"
  },
  {
    imgSrc: "frame/이웃집토토로 프레임.png",
    name: "이웃집토토로"
  }
];

// 이미지 필터 설정
const imageFilters = {
  brightness: 25,     // 밝기
  contrast: -10,     // 대비
  saturation: 10    // 채도
};



// 상태 변수
const photoArr = [];
const selectedPhotoArr = [];
const maxCount = 5;
let remainingCount = maxCount;
const countdownDuration = 10;
let countdownIntervalId;
let countdownTime = countdownDuration;

// RGB to HSL 변환
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h, s, l };
}

// HSL to RGB 변환
function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

// processImage 함수를 CSS 필터 방식으로 수정
function processImage(canvas) {
  const ctx = canvas.getContext('2d');
  
  // 원본 이미지 저장
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.scale(-1, 1);
  tempCtx.drawImage(videoElement, -canvas.width, 0, canvas.width, canvas.height);
  
  // CSS 필터 적용
  ctx.filter = `
    brightness(${1 + imageFilters.brightness/100})
    contrast(${1 + imageFilters.contrast/100})
    saturate(${1 + imageFilters.saturation/100})
  `;
  
  // 필터 적용된 이미지 그리기
  ctx.scale(-1, 1);
  ctx.drawImage(tempCanvas, -canvas.width, 0, canvas.width, canvas.height);
}

// 비디오 필터 함수는 동일하게 유지
function applyVideoFilter() {
  if (videoElement) {
    const filterString = `
      brightness(${1 + imageFilters.brightness/100})
      contrast(${1 + imageFilters.contrast/100})
      saturate(${1 + imageFilters.saturation/100})
    `;
    videoElement.style.filter = filterString;
  }
}


// 카운트다운 시작
function startCountdown() {
  countdownTime = countdownDuration;
  countdownTimer.textContent = countdownTime;

  countdownIntervalId = setInterval(() => {
    countdownTime--;
    countdownTimer.textContent = countdownTime;

    if (countdownTime <= 0) {
      clearInterval(countdownIntervalId);
      capturePhoto();
    }
  }, 1000);
}

// 사진 촬영
function capturePhoto() {
  if (countdownIntervalId) {
    clearInterval(countdownIntervalId);
  }

  const canvas = document.createElement("canvas");
  canvas.width = videoElement.width;
  canvas.height = videoElement.height;
  const context = canvas.getContext("2d");
  
  // 비디오 프레임 캡처
  context.scale(-1, 1);
  context.drawImage(videoElement, -canvas.width, 0, canvas.width, canvas.height);
  
  // 이미지 처리 적용
  processImage(canvas);

  // 이미지 저장 및 표시
  const imageData = canvas.toDataURL();
  photoArr.push(imageData);

  const listItem = document.createElement("li");
  const image = document.createElement("img");
  image.style.width = "240px";
  image.style.height = "180px";
  image.src = imageData;
  listItem.appendChild(image);
  photoList.appendChild(listItem);

  remainingCount--;
  remainingCountElement.innerHTML = `남은 사진 촬영 횟수: ${remainingCount}회`;

  if (remainingCount > 0) {
    startCountdown();
  } else {
    if (captureButton) {
      captureButton.disabled = true;
    }
    choicePhoto();
  }
}

// 사진 선택 화면 표시
function choicePhoto() {
  photoCaptureSectionEl.classList.add("visibility-hidden");
  photoChoiceSectionEl.classList.remove("visibility-hidden");

  const photoItems = photoList.querySelectorAll("li");
  photoItems.forEach((item) => {
    item.addEventListener("click", function() {
      if (this.classList.contains("selected")) {
        this.classList.remove("selected");
        const imgSrc = this.querySelector("img").src;
        const index = selectedPhotoArr.indexOf(imgSrc);
        if (index > -1) {
          selectedPhotoArr.splice(index, 1);
        }
      } else {
        if (selectedPhotoArr.length >= 4) return;
        this.classList.add("selected");
        const imgSrc = this.querySelector("img").src;
        selectedPhotoArr.push(imgSrc);
      }

      checkSelectedPhoto();
      inputPhotoFrame();
      inputVirtualFrame();
    });
  });
}

// 선택된 사진 가상 프레임에 표시
function inputVirtualFrame() {
  const selectPhotoItems = Array.from(selectPhotoList.querySelectorAll("li"));
  selectPhotoItems.forEach((item, index) => {
    item.innerHTML = "";
    const imageSrc = selectedPhotoArr[index];
    if (imageSrc) {
      const image = document.createElement("img");
      image.src = imageSrc;
      image.alt = `Selected Image ${index + 1}`;
      item.appendChild(image);
    }
  });
}

// 선택된 사진 실제 프레임에 표시
function inputPhotoFrame() {
  frameHoles.forEach((hole, index) => {
    hole.innerHTML = "";
    const imageSrc = selectedPhotoArr[index % selectedPhotoArr.length];
    if (imageSrc && index < selectedPhotoArr.length * 2) {
      const image = document.createElement("img");
      image.src = imageSrc;
      image.alt = `Selected Image ${index + 1}`;
      image.classList.add("selected-image");
      hole.appendChild(image);
    }
  });
}

// 선택 완료 버튼 상태 관리
function checkSelectedPhoto() {
  if (selectedPhotoArr.length === 4) {
    selectCompleteButtonEl.removeAttribute("disabled");
  } else {
    selectCompleteButtonEl.setAttribute("disabled", "true");
  }
}

// 프레임 선택 화면 표시
function choiceFrame() {
  photoChoiceSectionEl.classList.add("visibility-hidden");
  photoOutputSectionEl.classList.remove("visibility-hidden");

  const selectFrameSectionEl = document.getElementById("select-frame-section");
  const frameImg1 = document.getElementById('frame-img1');
  const frameImg2 = document.getElementById('frame-img2');

  frameArr.forEach((frame, index) => {
    const divTag = document.createElement("div");
    divTag.classList.add("select-frame-item");
    divTag.id = `frameImg${index}`;
    
    divTag.addEventListener('click', () => {
      frameImg1.src = frame.imgSrc;
      frameImg2.src = frame.imgSrc;
    });

    const textTag = document.createElement('div');
    textTag.classList.add('select-frame-item-name');
    textTag.innerHTML = frame.name;
    divTag.appendChild(textTag);

    selectFrameSectionEl.appendChild(divTag);
  });
}

// 최종 이미지 다운로드
function downloadImage() {
  const element = document.getElementById("memorism-photo");
  html2canvas(element, { 
    scale: 2,
    backgroundColor: 'black'
  }).then(function(canvas) {
    // 새 캔버스 생성
    const finalCanvas = document.createElement('canvas');
    const ctx = finalCanvas.getContext('2d');
    
    // 최종 크기는 640px × 1840px (20px 여백 포함)
    finalCanvas.width = 1240;     // 600 + (20px × 2)
    finalCanvas.height = 1840;   // 1800 + (20px × 2)
    
    // 검은색 배경
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
    
    // scale: 2가 적용된 이미지를 20px 여백을 두고 그리기
    ctx.drawImage(canvas, 20, 20);
    
    const image = finalCanvas.toDataURL("image/png", 1.0);
    const link = document.createElement("a");
    link.href = image;
    link.download = "shinseong_memorism.png";
    link.click();
  });
}

// 초기화
function initialize() {
  descriptionSectionEl.classList.add("visibility-hidden");
  photoCaptureSectionEl.classList.remove("visibility-hidden");

  remainingCount = maxCount;
  remainingCountElement.innerHTML = `남은 사진 촬영 횟수: ${remainingCount}회`;
  applyVideoFilter();

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      videoElement.srcObject = stream;
      videoElement.play();
      startCountdown();
    })
    .catch((error) => {
      console.error("Error accessing webcam:", error);
    });
}

// 이벤트 리스너 설정
function setupEventListeners() {
  startButtonEl.addEventListener("click", initialize);
  selectCompleteButtonEl.addEventListener("click", choiceFrame);
  downloadButtonEl.addEventListener("click", downloadImage);
  if (captureButton) {
    captureButton.addEventListener("click", capturePhoto);
  }
}

// OpenCV 준비되면 실행
function onOpenCvReady() {
  console.log('OpenCV.js is ready');
  setupEventListeners();
}

// 페이지 로드 시 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', setupEventListeners);