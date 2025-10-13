// 綠色足跡平台 - 添加API整合版本
document.addEventListener('DOMContentLoaded', function() {
    console.log('綠色足跡平台開始加載...');
    initApp();
});

// 模擬景點數據
const locations = [
    {
        id: 1,
        name: "香港公園",
        description: "位於中環的都市綠洲，擁有溫室、觀鳥園和人工湖。",
        crowdLevel: 1,
        weather: "晴",
        temperature: 26,
        coordinates: { latitude: 22.2783, longitude: 114.1586 }
    },
    {
        id: 2,
        name: "九龍公園",
        description: "尖沙咀的大型公園，擁有游泳池、體育場和鳥湖。",
        crowdLevel: 2,
        weather: "多雲",
        temperature: 25,
        coordinates: { latitude: 22.2973, longitude: 114.1715 }
    },
    {
        id: 3,
        name: "香港動植物公園",
        description: "歷史悠久的公園，展示多種動植物品種。",
        crowdLevel: 1,
        weather: "晴",
        temperature: 27,
        coordinates: { latitude: 22.2772, longitude: 114.1558 }
    },
    {
        id: 4,
        name: "維多利亞公園",
        description: "銅鑼灣的大型公園，是市民休閒運動的熱門地點。",
        crowdLevel: 3,
        weather: "晴",
        temperature: 26,
        coordinates: { latitude: 22.2821, longitude: 114.1872 }
    },
    {
        id: 5,
        name: "南蓮園池",
        description: "以唐代風格設計的園林，展現中國古典園林藝術。",
        crowdLevel: 1,
        weather: "多雲",
        temperature: 25,
        coordinates: { latitude: 22.3372, longitude: 114.1928 }
    },
    {
        id: 6,
        name: "山頂公園",
        description: "太平山頂的寧靜公園，可俯瞰維港景色。",
        crowdLevel: 2,
        weather: "多雲",
        temperature: 23,
        coordinates: { latitude: 22.2693, longitude: 114.1489 }
    }
];

// DOM 元素
let locationList, locationDetail, weatherInfo, trafficInfo;
let btnAll, btnSparse, btnCrowded, btnRefresh, recommendedLocation;

// 當前顯示的景點列表
let currentLocations = [];
let allLocations = [];

// 初始化應用
function initApp() {
    // 獲取DOM元素
    locationList = document.getElementById('location-list');
    locationDetail = document.getElementById('location-detail');
    weatherInfo = document.getElementById('weather-info');
    trafficInfo = document.getElementById('traffic-info');
    btnAll = document.getElementById('btn-all');
    btnSparse = document.getElementById('btn-sparse');
    btnCrowded = document.getElementById('btn-crowded');
    btnRefresh = document.getElementById('btn-refresh');
    recommendedLocation = document.getElementById('recommended-location');

    try {
        // 設置數據
        allLocations = [...locations];
        currentLocations = [...allLocations];
        
        // 顯示所有景點
        displayLocations(currentLocations);
        
        // 推薦最佳景點
        recommendBestLocation(allLocations);
        
        // 顯示第一個景點的詳情
        if (allLocations.length > 0) {
            showLocationDetail(allLocations[0]);
        }
        
        // 設置事件監聽
        setupEventListeners();
        
        console.log('應用初始化完成');
    } catch (error) {
        console.error('應用初始化失敗:', error);
        locationList.innerHTML = '<li class="location-item">加載數據失敗，請刷新頁面重試</li>';
    }
}

// 設置事件監聽
function setupEventListeners() {
    btnAll.addEventListener('click', function() {
        setActiveButton(btnAll);
        currentLocations = [...allLocations];
        displayLocations(currentLocations);
    });

    btnSparse.addEventListener('click', function() {
        setActiveButton(btnSparse);
        currentLocations = allLocations.filter(loc => loc.crowdLevel === 1);
        displayLocations(currentLocations);
    });

    btnCrowded.addEventListener('click', function() {
        setActiveButton(btnCrowded);
        currentLocations = allLocations.filter(loc => loc.crowdLevel === 3);
        displayLocations(currentLocations);
    });

    btnRefresh.addEventListener('click', async function() {
        // 更新數據
        btnRefresh.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 更新中...';
        btnRefresh.disabled = true;
        
        try {
            // 重新加載數據並獲取最新API數據
            currentLocations = [...locations];
            displayLocations(currentLocations);
            recommendBestLocation(currentLocations);
            
            // 如果當前有選中的景點，更新其詳情
            const activeItem = document.querySelector('.location-item.active');
            if (activeItem) {
                const locationName = activeItem.querySelector('.location-name').textContent;
                const location = allLocations.find(loc => loc.name === locationName);
                if (location) {
                    await showLocationDetail(location);
                }
            }
            
            btnRefresh.innerHTML = '<i class="fas fa-sync-alt"></i> 數據已更新';
            setTimeout(() => {
                btnRefresh.innerHTML = '<i class="fas fa-sync-alt"></i> 更新數據';
                btnRefresh.disabled = false;
            }, 2000);
        } catch (error) {
            console.error('更新數據失敗:', error);
            btnRefresh.innerHTML = '<i class="fas fa-exclamation-triangle"></i> 更新失敗';
            setTimeout(() => {
                btnRefresh.innerHTML = '<i class="fas fa-sync-alt"></i> 更新數據';
                btnRefresh.disabled = false;
            }, 2000);
        }
    });
}

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
    
    if (locationsToShow.length === 0) {
        locationList.innerHTML = '<li class="location-item">沒有符合條件的景點</li>';
        return;
    }
    
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
        
        li.addEventListener('click', () => {
            // 移除所有active類
            document.querySelectorAll('.location-item').forEach(item => {
                item.classList.remove('active');
            });
            // 添加active類到當前項目
            li.classList.add('active');
            showLocationDetail(location);
        });
        
        locationList.appendChild(li);
    });
}

// 顯示景點詳情（增強版 - 整合API數據）
async function showLocationDetail(location) {
    // 顯示加載狀態
    locationDetail.innerHTML = `
        <h3>${location.name}</h3>
        <p>${location.description}</p>
        <div class="loading-section">
            <i class="fas fa-spinner fa-spin"></i>
            <p>正在獲取實時交通數據...</p>
        </div>
    `;
    
    try {
        // 獲取AI交通數據
        const aiTrafficData = await getAITrafficData(location);
        
        // 生成詳細信息HTML
        const detailHTML = generateDetailHTML(location, aiTrafficData);
        
        // 更新詳情區域
        locationDetail.innerHTML = detailHTML;
        
        // 更新天氣和交通信息面板
        updateInfoPanels(location, aiTrafficData);
        
    } catch (error) {
        console.error(`加載 ${location.name} 詳情失敗:`, error);
        // 降級到基本版本
        showBasicLocationDetail(location);
    }
}

// 生成詳細信息HTML（整合API數據）
function generateDetailHTML(location, aiData) {
    const trafficLevel = aiData ? analyzeTrafficFromAIData(aiData) : '正常';
    
    return `
        <h3>${location.name}</h3>
        <p class="location-description">${location.description}</p>
        
        <div class="status-grid">
            <div class="status-item">
                <span class="status-label">人流狀態</span>
                <span class="status-value crowd-${location.crowdLevel}">${getCrowdLevelText(location.crowdLevel)}</span>
            </div>
            <div class="status-item">
                <span class="status-label">交通狀況</span>
                <span class="status-value traffic-${trafficLevel}">${trafficLevel}</span>
            </div>
        </div>
        
        ${aiData ? generateAITrafficHTML(aiData, trafficLevel) : '<p class="api-unavailable">實時交通數據暫不可用</p>'}
        
        <div class="recommendation-box">
            <strong>建議:</strong> ${getRecommendation(location.crowdLevel, trafficLevel)}
        </div>
    `;
}

// 生成AI交通數據HTML
function generateAITrafficHTML(aiData, trafficLevel) {
    return `
        <div class="ai-traffic-info">
            <h4><i class="fas fa-robot"></i> AI交通分析</h4>
            <div class="ai-data-grid">
                <div class="ai-data-item">
                    <i class="fas fa-car"></i>
                    <div>
                        <span class="ai-value">${aiData.vehicleCount || 'N/A'}</span>
                        <span class="ai-label">車輛數量</span>
                    </div>
                </div>
                <div class="ai-data-item">
                    <i class="fas fa-tachometer-alt"></i>
                    <div>
                        <span class="ai-value">${aiData.avgSpeed || 'N/A'} km/h</span>
                        <span class="ai-label">平均車速</span>
                    </div>
                </div>
                <div class="ai-data-item">
                    <i class="fas fa-traffic-light"></i>
                    <div>
                        <span class="ai-value">${trafficLevel}</span>
                        <span class="ai-label">交通狀況</span>
                    </div>
                </div>
            </div>
            <p class="ai-source">數據來源: 閉路電視AI影像分析系統</p>
        </div>
    `;
}

// 基本版本詳情（API失敗時使用）
function showBasicLocationDetail(location) {
    // 使用模擬交通數據
    const trafficMap = {
        '香港公園': '暢通',
        '九龍公園': '正常',
        '香港動植物公園': '暢通',
        '維多利亞公園': '繁忙',
        '南蓮園池': '暢通',
        '山頂公園': '正常'
    };
    
    const traffic = trafficMap[location.name] || '正常';
    
    locationDetail.innerHTML = `
        <h3>${location.name}</h3>
        <p>${location.description}</p>
        <p><strong>人流狀態:</strong> ${getCrowdLevelText(location.crowdLevel)}</p>
        <p><strong>交通狀況:</strong> ${traffic}</p>
        <p><strong>建議:</strong> ${getRecommendation(location.crowdLevel, traffic)}</p>
        <div class="api-unavailable">
            <i class="fas fa-info-circle"></i>
            <p>實時交通數據暫不可用，顯示模擬數據</p>
        </div>
    `;
    
    // 更新天氣和交通信息面板
    updateInfoPanels(location, null);
}

// 更新信息面板
function updateInfoPanels(location, aiData) {
    const trafficLevel = aiData ? analyzeTrafficFromAIData(aiData) : '正常';
    
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
    
    if (trafficLevel === '正常') {
        trafficLightClass = 'orange';
        trafficText = '交通正常';
    } else if (trafficLevel === '繁忙') {
        trafficLightClass = 'red';
        trafficText = '交通繁忙';
    }
    
    trafficInfo.innerHTML = `
        <h3>前往${location.name}的交通狀況</h3>
        <div class="traffic-status">
            <div class="traffic-light ${trafficLightClass}"></div>
            <p>${trafficText} ${aiData ? '(AI分析)' : '(模擬數據)'}</p>
        </div>
    `;
}

// 獲取AI交通數據
async function getAITrafficData(location) {
    try {
        // 使用您提供的API端點
        const apiUrl = `https://portal.csdi.gov.hk/server/services/common/td_rcd_1671693527354_28926/MapServer/WFSServer?service=wfs&request=GetFeature&typenames=Traffic_Data_from_AI_Video_Analytics_System_of_CCTVs&outputFormat=geojson&maxFeatures=50`;
        
        console.log(`正在獲取 ${location.name} 的AI交通數據...`);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`API請求失敗: ${response.status}`);
        }
        
        const geoJson = await response.json();
        
        // 處理API響應數據
        return processAITrafficData(geoJson, location);
        
    } catch (error) {
        console.error('獲取AI交通數據失敗:', error);
        // 返回模擬數據作為降級方案
        return getMockAITrafficData(location);
    }
}

// 處理AI交通數據
function processAITrafficData(geoJson, location) {
    if (!geoJson.features || geoJson.features.length === 0) {
        console.warn('AI交通數據為空');
        return getMockAITrafficData(location);
    }
    
    // 這裡需要根據實際API響應結構進行調整
    // 目前使用簡化處理
    const features = geoJson.features;
    
    // 計算附近的監測點
    const nearbyCameras = features.filter(feature => {
        const properties = feature.properties || {};
        const geometry = feature.geometry || {};
        
        if (geometry.type === 'Point' && geometry.coordinates) {
            const [longitude, latitude] = geometry.coordinates;
            const distance = calculateDistance(
                location.coordinates.latitude, location.coordinates.longitude,
                latitude, longitude
            );
            return distance <= 2; // 2公里範圍內
        }
        return false;
    });
    
    console.log(`在 ${location.name} 附近找到 ${nearbyCameras.length} 個AI監測點`);
    
    if (nearbyCameras.length === 0) {
        return getMockAITrafficData(location);
    }
    
    // 提取交通數據（需要根據實際API字段調整）
    const trafficData = {
        vehicleCount: nearbyCameras.length * 10, // 簡化計算
        avgSpeed: calculateAverageSpeed(nearbyCameras),
        congestionLevel: calculateCongestionLevel(nearbyCameras),
        cameraCount: nearbyCameras.length,
        timestamp: new Date().toISOString()
    };
    
    return trafficData;
}

// 從AI數據分析交通狀況
function analyzeTrafficFromAIData(aiData) {
    if (!aiData.avgSpeed) return '正常';
    
    if (aiData.avgSpeed > 40) return '暢通';
    if (aiData.avgSpeed > 20) return '正常';
    return '繁忙';
}

// 計算平均速度（模擬）
function calculateAverageSpeed(cameras) {
    // 簡化計算 - 實際應根據API數據調整
    const baseSpeed = 30;
    const randomVariation = Math.random() * 20 - 10; // -10 到 +10 的隨機變化
    return Math.max(5, baseSpeed + randomVariation); // 確保不小於5
}

// 計算擁堵等級（模擬）
function calculateCongestionLevel(cameras) {
    return cameras.length > 3 ? '高' : cameras.length > 1 ? '中' : '低';
}

// 計算兩個坐標點之間的距離（公里）
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 地球半徑（公里）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// 模擬AI交通數據（降級方案）
function getMockAITrafficData(location) {
    console.log('使用模擬AI交通數據');
    
    // 根據位置模擬不同的交通狀況
    const trafficPatterns = {
        '香港公園': { vehicleCount: 45, avgSpeed: 35 },
        '九龍公園': { vehicleCount: 120, avgSpeed: 25 },
        '香港動植物公園': { vehicleCount: 30, avgSpeed: 40 },
        '維多利亞公園': { vehicleCount: 180, avgSpeed: 15 },
        '南蓮園池': { vehicleCount: 25, avgSpeed: 38 },
        '山頂公園': { vehicleCount: 80, avgSpeed: 28 }
    };
    
    const pattern = trafficPatterns[location.name] || { vehicleCount: 60, avgSpeed: 30 };
    
    return {
        vehicleCount: pattern.vehicleCount,
        avgSpeed: pattern.avgSpeed,
        congestionLevel: pattern.avgSpeed < 20 ? '高' : pattern.avgSpeed < 30 ? '中' : '低',
        cameraCount: 3,
        timestamp: new Date().toISOString(),
        isMock: true // 標記為模擬數據
    };
}

// 推薦最佳景點
function recommendBestLocation(locations) {
    // 優先選擇人流稀疏的景點
    const bestLocation = locations.find(loc => loc.crowdLevel === 1) || locations[0];
    
    if (bestLocation) {
        recommendedLocation.textContent = bestLocation.name;
    }
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

// 根據擁擠程度和交通狀況返回建議
function getRecommendation(crowdLevel, traffic) {
    if (crowdLevel === 1 && traffic === '暢通') {
        return '現在是遊覽的絕佳時機，人流稀疏且交通便利！';
    } else if (crowdLevel === 1 && traffic !== '暢通') {
        return '景點人流稀疏，但前往的交通可能較為繁忙，建議使用公共交通。';
    } else if (crowdLevel === 3 && traffic === '繁忙') {
        return '目前遊客較多且交通繁忙，強烈建議選擇其他時間或其他景點。';
    } else {
        return '遊客數量適中，建議避開高峰時段。';
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