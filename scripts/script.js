// 模擬景點數據（實際應用中將從API獲取）
const locations = [
    {
        id: 1,
        name: "香港公園",
        description: "位於中環的都市綠洲，擁有溫室、觀鳥園和人工湖。",
        crowdLevel: 1, // 1=稀疏, 2=中等, 3=擁擠
        weather: "晴",
        temperature: 26,
        traffic: "暢通"
    },
    {
        id: 2,
        name: "九龍公園",
        description: "尖沙咀的大型公園，擁有游泳池、體育場和鳥湖。",
        crowdLevel: 2,
        weather: "多雲",
        temperature: 25,
        traffic: "正常"
    },
    {
        id: 3,
        name: "香港動植物公園",
        description: "歷史悠久的公園，展示多種動植物品種。",
        crowdLevel: 1,
        weather: "晴",
        temperature: 27,
        traffic: "暢通"
    },
    {
        id: 4,
        name: "維多利亞公園",
        description: "銅鑼灣的大型公園，是市民休閒運動的熱門地點。",
        crowdLevel: 3,
        weather: "晴",
        temperature: 26,
        traffic: "繁忙"
    },
    {
        id: 5,
        name: "南蓮園池",
        description: "以唐代風格設計的園林，展現中國古典園林藝術。",
        crowdLevel: 1,
        weather: "多雲",
        temperature: 25,
        traffic: "暢通"
    },
    {
        id: 6,
        name: "山頂公園",
        description: "太平山頂的寧靜公園，可俯瞰維港景色。",
        crowdLevel: 2,
        weather: "多雲",
        temperature: 23,
        traffic: "正常"
    }
];

// DOM 元素
const locationList = document.getElementById('location-list');
const locationDetail = document.getElementById('location-detail');
const weatherInfo = document.getElementById('weather-info');
const trafficInfo = document.getElementById('traffic-info');
const btnAll = document.getElementById('btn-all');
const btnSparse = document.getElementById('btn-sparse');
const btnCrowded = document.getElementById('btn-crowded');
const btnRefresh = document.getElementById('btn-refresh');
const recommendedLocation = document.getElementById('recommended-location');

// 初始化顯示所有景點
displayLocations(locations);

// 推薦人流最稀疏的景點
const sparseLocations = locations.filter(loc => loc.crowdLevel === 1);
if (sparseLocations.length > 0) {
    recommendedLocation.textContent = sparseLocations[0].name;
}

// 按鈕事件監聽
btnAll.addEventListener('click', function() {
    setActiveButton(btnAll);
    displayLocations(locations);
});

btnSparse.addEventListener('click', function() {
    setActiveButton(btnSparse);
    const sparseLocations = locations.filter(loc => loc.crowdLevel === 1);
    displayLocations(sparseLocations);
});

btnCrowded.addEventListener('click', function() {
    setActiveButton(btnCrowded);
    const crowdedLocations = locations.filter(loc => loc.crowdLevel === 3);
    displayLocations(crowdedLocations);
});

btnRefresh.addEventListener('click', function() {
    // 模擬數據刷新
    btnRefresh.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 更新中...';
    setTimeout(() => {
        btnRefresh.innerHTML = '<i class="fas fa-sync-alt"></i> 更新數據';
        alert('數據已更新！');
    }, 1500);
});

// 設置活動按鈕
function setActiveButton(activeBtn) {
    [btnAll, btnSparse, btnCrowded].forEach(btn => {
        btn.classList.remove('active');
    });
    activeBtn.classList.add('active');
}

// 顯示景點列表
function displayLocations(locationsToShow) {
    locationList.innerHTML = '';
    
    locationsToShow.forEach(location => {
        const li = document.createElement('li');
        li.className = 'location-item';
        
        // 根據擁擠程度設置樣式
        let crowdClass = '';
        let crowdLabel = '';
        let crowdDots = '';
        
        if (location.crowdLevel === 1) {
            crowdClass = 'sparse';
            crowdLabel = '人流稀疏';
            crowdDots = '<div class="crowd-dot active"></div><div class="crowd-dot"></div><div class="crowd-dot"></div>';
        } else if (location.crowdLevel === 2) {
            crowdClass = 'medium';
            crowdLabel = '人流中等';
            crowdDots = '<div class="crowd-dot active"></div><div class="crowd-dot active medium"></div><div class="crowd-dot"></div>';
        } else {
            crowdClass = 'crowded';
            crowdLabel = '人流擁擠';
            crowdDots = '<div class="crowd-dot active"></div><div class="crowd-dot active medium"></div><div class="crowd-dot active high"></div>';
        }
        
        li.innerHTML = `
            <div class="location-info">
                <div class="location-name">${location.name}</div>
                <div class="location-desc">${location.description}</div>
            </div>
            <div class="crowd-indicator">
                <div class="crowd-dots">
                    ${crowdDots}
                </div>
                <div class="crowd-label ${crowdClass}">${crowdLabel}</div>
            </div>
        `;
        
        li.addEventListener('click', () => showLocationDetail(location));
        locationList.appendChild(li);
    });
}

// 顯示景點詳情
function showLocationDetail(location) {
    // 更新詳情區域
    locationDetail.innerHTML = `
        <h3>${location.name}</h3>
        <p>${location.description}</p>
        <p><strong>當前狀態:</strong> ${getCrowdLevelText(location.crowdLevel)}</p>
        <p><strong>建議:</strong> ${getRecommendation(location.crowdLevel)}</p>
    `;
    
    // 更新天氣信息
    weatherInfo.innerHTML = `
        <div class="weather-icon">
            <i class="fas ${getWeatherIcon(location.weather)}"></i>
        </div>
        <div class="weather-details">
            <h3>${location.name}天氣</h3>
            <p>${location.weather}，溫度 ${location.temperature}°C</p>
        </div>
    `;
    
    // 更新交通信息
    let trafficLightClass = 'green';
    let trafficText = '交通暢通';
    
    if (location.traffic === '正常') {
        trafficLightClass = 'orange';
        trafficText = '交通正常';
    } else if (location.traffic === '繁忙') {
        trafficLightClass = 'red';
        trafficText = '交通繁忙';
    }
    
    trafficInfo.innerHTML = `
        <h3>前往${location.name}的交通狀況</h3>
        <div class="traffic-status">
            <div class="traffic-light ${trafficLightClass}"></div>
            <p>${trafficText}</p>
        </div>
    `;
}

// 根據擁擠程度返回文本
function getCrowdLevelText(level) {
    switch(level) {
        case 1: return '人流稀疏';
        case 2: return '人流中等';
        case 3: return '人流擁擠';
        default: return '未知';
    }
}

// 根據擁擠程度返回建議
function getRecommendation(level) {
    switch(level) {
        case 1: return '現在是遊覽的好時機，可以享受寧靜的環境。';
        case 2: return '遊客數量適中，建議避開高峰時段。';
        case 3: return '目前遊客較多，建議選擇其他時間或其他景點。';
        default: return '';
    }
}

// 根據天氣返回圖標
function getWeatherIcon(weather) {
    switch(weather) {
        case '晴': return 'fa-sun';
        case '多雲': return 'fa-cloud';
        case '雨': return 'fa-cloud-rain';
        case '雷雨': return 'fa-bolt';
        default: return 'fa-cloud';
    }
}

// 初始顯示第一個景點的詳情
showLocationDetail(locations[0]);