// 綠色足跡平台 - 修正字段映射版本
document.addEventListener('DOMContentLoaded', function() {
    console.log('綠色足跡平台開始加載...');
    initApp();
});

// DOM 元素
let locationList, locationDetail, weatherInfo, trafficInfo;
let btnAll, btnSparse, btnCrowded, btnRefresh, recommendedLocation;

// 當前顯示的景點列表
let currentLocations = [];
let allLocations = [];

// API 端點 - 香港政府公園數據
const PARKS_API = 'https://portal.csdi.gov.hk/server/services/common/lcsd_rcd_1629267205215_19292/MapServer/WFSServer?service=wfs&request=GetFeature&typenames=PARKS&outputFormat=geojson&maxFeatures=50';

// 初始化應用
async function initApp() {
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
        // 顯示加載狀態
        locationList.innerHTML = '<li class="location-item"><div class="loading-section"><i class="fas fa-spinner fa-spin"></i><p>正在從政府開放數據平台獲取公園數據...</p></div></li>';
        
        // 從API獲取真實公園數據
        allLocations = await fetchRealParksData();
        currentLocations = [...allLocations];
        
        if (allLocations.length === 0) {
            throw new Error('未能從API獲取任何公園數據');
        }
        
        // 顯示所有公園
        displayLocations(currentLocations);
        
        // 推薦最佳公園
        recommendBestLocation(allLocations);
        
        // 顯示第一個公園的詳情
        if (allLocations.length > 0) {
            showLocationDetail(allLocations[0]);
        }
        
        // 設置事件監聽
        setupEventListeners();
        
        console.log('應用初始化完成，載入', allLocations.length, '個真實公園數據');
        // 顯示前幾個公園的真實名稱作為測試
        console.log('真實公園名稱範例:', allLocations.slice(0, 3).map(p => p.name));
        
    } catch (error) {
        console.error('應用初始化失敗:', error);
        locationList.innerHTML = '<li class="location-item error-message">加載真實公園數據失敗: ' + error.message + '，請稍後刷新頁面重試</li>';
    }
}

// 從API獲取真實公園數據
async function fetchRealParksData() {
    try {
        console.log('正在從政府API獲取真實公園數據...');
        const response = await fetch(PARKS_API);
        
        if (!response.ok) {
            throw new Error(`公園API請求失敗: ${response.status} ${response.statusText}`);
        }
        
        const geoJson = await response.json();
        
        if (!geoJson.features || geoJson.features.length === 0) {
            throw new Error('公園API返回空數據集');
        }
        
        console.log('成功獲取', geoJson.features.length, '個公園的原始數據');
        
        // 調試：查看第一個特徵的完整結構
        if (geoJson.features.length > 0) {
            console.log('第一個公園的完整數據:', geoJson.features[0]);
            console.log('第一個公園的屬性字段:', Object.keys(geoJson.features[0].properties || {}));
        }
        
        // 處理並轉換API數據
        return processRealParksData(geoJson);
        
    } catch (error) {
        console.error('獲取真實公園數據失敗:', error);
        throw error;
    }
}

// 處理真實公園API數據 - 優先顯示中文名稱
function processRealParksData(geoJson) {
    const parks = [];
    
    geoJson.features.forEach((feature, index) => {
        const properties = feature.properties || {};
        const geometry = feature.geometry || {};
        
        // 只處理有座標的公園
        if (geometry.type === 'Point' && geometry.coordinates) {
            const coordinates = {
                latitude: geometry.coordinates[1],
                longitude: geometry.coordinates[0]
            };
            
            // 優先使用中文名稱，其次是英文名稱
            const parkName = properties.NameTC || properties.NameEN || `公園 ${index + 1}`;
            const parkDescription = properties.AddressTC || properties.AddressEN || 
                                  properties.FacilityTypeTC || properties.FacilityTypeEN || 
                                  '香港康樂及文化事務署管理的公園設施';
            
            console.log(`公園 ${index + 1}:`, {
                中文名稱: properties.NameTC,
                英文名稱: properties.NameEN,
                名稱: parkName,
                coordinates: coordinates
            });
            
            // 生成模擬的擁擠程度和天氣
            const crowdLevel = generateSimulatedCrowdLevel(index);
            const weatherData = generateSimulatedWeatherData();
            
            parks.push({
                id: index + 1,
                name: parkName,
                description: parkDescription,
                crowdLevel: crowdLevel,
                weather: weatherData.weather,
                temperature: weatherData.temperature,
                coordinates: coordinates,
                apiData: properties,
                dataSource: '真實API數據'
            });
        }
    });
    
    return parks;
}

// 生成模擬擁擠程度
function generateSimulatedCrowdLevel(index) {
    const patterns = [1, 1, 2, 1, 3, 2, 1, 2, 3, 1, 2, 1, 2, 1, 3];
    return patterns[index % patterns.length];
}

// 生成模擬天氣數據
function generateSimulatedWeatherData() {
    const weatherTypes = ['晴', '多雲', '多雲', '晴', '多雲'];
    const temperatures = [24, 25, 26, 27, 25, 26];
    
    return {
        weather: weatherTypes[Math.floor(Math.random() * weatherTypes.length)],
        temperature: temperatures[Math.floor(Math.random() * temperatures.length)]
    };
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
        btnRefresh.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 更新中...';
        btnRefresh.disabled = true;
        
        try {
            // 重新獲取真實公園數據
            allLocations = await fetchRealParksData();
            currentLocations = [...allLocations];
            displayLocations(currentLocations);
            recommendBestLocation(currentLocations);
            
            // 如果當前有選中的公園，更新其詳情
            const activeItem = document.querySelector('.location-item.active');
            if (activeItem) {
                const locationId = parseInt(activeItem.dataset.id);
                const location = allLocations.find(loc => loc.id === locationId);
                if (location) {
                    showLocationDetail(location);
                }
            }
            
            btnRefresh.innerHTML = '<i class="fas fa-sync-alt"></i> 數據已更新';
            setTimeout(() => {
                btnRefresh.innerHTML = '<i class="fas fa-sync-alt"></i> 更新數據';
                btnRefresh.disabled = false;
            }, 2000);
        } catch (error) {
            console.error('更新真實公園數據失敗:', error);
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

// 顯示公園列表
function displayLocations(locationsToShow) {
    locationList.innerHTML = '';
    
    if (locationsToShow.length === 0) {
        locationList.innerHTML = '<li class="location-item">沒有符合條件的公園</li>';
        return;
    }
    
    locationsToShow.forEach(location => {
        const li = document.createElement('li');
        li.className = 'location-item';
        li.dataset.id = location.id;
        
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
                <div class="data-source-tag">${location.dataSource}</div>
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

// 顯示公園詳情
function showLocationDetail(location) {
    // 使用模擬交通數據
    const traffic = generateSimulatedTraffic(location.name);
    
    const detailHTML = `
        <h3>${location.name}</h3>
        <p class="location-description">${location.description}</p>
        
        <div class="data-source-info">
            <i class="fas fa-database"></i> 數據來源: 香港政府開放數據平台
        </div>
        
        <div class="status-grid">
            <div class="status-item">
                <span class="status-label">人流狀態</span>
                <span class="status-value crowd-${location.crowdLevel}">${getCrowdLevelText(location.crowdLevel)}</span>
            </div>
            <div class="status-item">
                <span class="status-label">交通狀況</span>
                <span class="status-value traffic-${traffic.level}">${traffic.text}</span>
            </div>
        </div>
        
        <div class="coordinates-info">
            <strong>真實地理位置:</strong><br>
            緯度: ${location.coordinates.latitude.toFixed(6)}<br>
            經度: ${location.coordinates.longitude.toFixed(6)}
        </div>
        
        <div class="api-raw-data">
            <details>
                <summary>查看原始API數據</summary>
                <pre>${JSON.stringify(location.apiData, null, 2)}</pre>
            </details>
        </div>
        
        <div class="simulation-notice">
            <i class="fas fa-info-circle"></i>
            <p>目前僅公園數據為真實API數據，人流、交通和天氣為模擬數據，後續將逐步接入更多真實API</p>
        </div>
        
        <div class="recommendation-box">
            <strong>建議:</strong> ${getRecommendation(location.crowdLevel, traffic.text)}
        </div>
    `;
    
    locationDetail.innerHTML = detailHTML;
    
    // 更新天氣和交通信息面板
    updateInfoPanels(location, traffic);
}

// 生成模擬交通數據
function generateSimulatedTraffic(parkName) {
    if (parkName.includes('香港公園') || parkName.includes('動植物')) {
        return { level: '暢通', text: '交通暢通' };
    } else if (parkName.includes('九龍') || parkName.includes('維多利亞')) {
        return { level: '繁忙', text: '交通繁忙' };
    } else {
        return { level: '正常', text: '交通正常' };
    }
}

// 更新信息面板
function updateInfoPanels(location, traffic) {
    weatherInfo.innerHTML = `
        <div class="weather-icon">
            <i class="fas ${getWeatherIcon(location.weather)}"></i>
        </div>
        <div class="weather-details">
            <h3>${location.name}天氣</h3>
            <p>${location.weather}，溫度 ${location.temperature}°C</p>
            <small>模擬數據</small>
        </div>
    `;
    
    let trafficLightClass = 'green';
    if (traffic.level === '正常') {
        trafficLightClass = 'orange';
    } else if (traffic.level === '繁忙') {
        trafficLightClass = 'red';
    }
    
    trafficInfo.innerHTML = `
        <h3>前往${location.name}的交通狀況</h3>
        <div class="traffic-status">
            <div class="traffic-light ${trafficLightClass}"></div>
            <p>${traffic.text} (模擬數據)</p>
        </div>
    `;
}

// 推薦最佳公園
function recommendBestLocation(locations) {
    const bestLocation = locations.find(loc => loc.crowdLevel === 1) || locations[0];
    
    if (bestLocation) {
        recommendedLocation.textContent = bestLocation.name;
        recommendedLocation.setAttribute('title', `推薦理由: ${getCrowdLevelText(bestLocation.crowdLevel)}`);
    }
}

// 根據擁擠程度返回文本
function getCrowdLevelText(level) {
    switch(level) {
        case 1: return '人流稀疏';
        case 2: return '人流中等';
        case 3: return '人流擁擠';
        default: return '數據分析中';
    }
}

// 根據擁擠程度和交通狀況返回建議
function getRecommendation(crowdLevel, traffic) {
    if (crowdLevel === 1 && traffic === '交通暢通') {
        return '現在是遊覽的絕佳時機，人流稀疏且交通便利！';
    } else if (crowdLevel === 1 && traffic !== '交通暢通') {
        return '公園人流稀疏，但前往的交通可能較為繁忙，建議使用公共交通。';
    } else if (crowdLevel === 3 && traffic === '交通繁忙') {
        return '目前遊客較多且交通繁忙，強烈建議選擇其他時間或其他公園。';
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