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

// 香港天文台天氣API
const WEATHER_API = 'https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=tc';

// 香港天文台天氣預報API
const WEATHER_FORECAST_API = 'https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=flw&lang=tc';

// 香港天文台溫度站點座標信息
const WEATHER_STATIONS_COORDS = {
    '京士柏': { latitude: 22.3114, longitude: 114.1744 },
    '香港天文台': { latitude: 22.3027, longitude: 114.1772 },
    '黃竹坑': { latitude: 22.2489, longitude: 114.1689 },
    '打鼓嶺': { latitude: 22.5400, longitude: 114.1400 },
    '流浮山': { latitude: 22.4700, longitude: 113.9800 },
    '大埔': { latitude: 22.4500, longitude: 114.1600 },
    '沙田': { latitude: 22.3800, longitude: 114.1900 },
    '屯門': { latitude: 22.3900, longitude: 113.9800 },
    '將軍澳': { latitude: 22.3100, longitude: 114.2600 },
    '西貢': { latitude: 22.3800, longitude: 114.2700 },
    '長洲': { latitude: 22.2100, longitude: 114.0300 },
    '赤鱲角': { latitude: 22.3100, longitude: 113.9200 },
    '青衣': { latitude: 22.3600, longitude: 114.1100 },
    '荃灣可觀': { latitude: 22.3800, longitude: 114.1200 },
    '荃灣城門谷': { latitude: 22.3700, longitude: 114.1300 },
    '香港公園': { latitude: 22.2800, longitude: 114.1600 },
    '筲箕灣': { latitude: 22.2800, longitude: 114.2300 },
    '九龍城': { latitude: 22.3200, longitude: 114.1900 },
    '跑馬地': { latitude: 22.2700, longitude: 114.1800 },
    '黃大仙': { latitude: 22.3400, longitude: 114.1900 },
    '赤柱': { latitude: 22.2200, longitude: 114.2100 },
    '觀塘': { latitude: 22.3100, longitude: 114.2300 },
    '深水埗': { latitude: 22.3300, longitude: 114.1600 },
    '啟德跑道公園': { latitude: 22.3200, longitude: 114.2100 },
    '元朗公園': { latitude: 22.4500, longitude: 114.0300 },
    '大美督': { latitude: 22.4700, longitude: 114.2400 }
};

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
            
            parks.push({
                id: index + 1,
                name: parkName,
                description: parkDescription,
                coordinates: coordinates,
                apiData: properties,
                dataSource: '真實API數據'
            });
        }
    });
    
    return parks;
}

// 計算兩個座標點之間的距離（公里）
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 地球半徑(公里)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// 找到最近的天氣站點
function findNearestWeatherStation(parkCoordinates) {
    let nearest = null;
    let minDistance = Infinity;
    
    for (const [stationName, coords] of Object.entries(WEATHER_STATIONS_COORDS)) {
        const distance = calculateDistance(
            parkCoordinates.latitude, parkCoordinates.longitude,
            coords.latitude, coords.longitude
        );
        if (distance < minDistance) {
            minDistance = distance;
            nearest = {
                name: stationName,
                distance: distance,
                coordinates: coords
            };
        }
    }
    
    return nearest;
}

// 智能地點配對方法（名稱匹配 + 距離回退）
function findMatchingWeatherLocation(parkName, parkCoordinates) {
    // 香港天文台API中的地點名稱映射
    const weatherLocationMap = {
        '香港公園': '香港公園',
        '維多利亞公園': '跑馬地',
        '九龍公園': '九龍城',
        '動植物公園': '香港公園',
        '海洋公園': '黃竹坑',
        '沙田公園': '沙田',
        '大埔海濱公園': '大埔',
        '屯門公園': '屯門',
        '元朗公園': '元朗公園',
        '將軍澳海濱公園': '將軍澳',
        '西貢海濱公園': '西貢',
        '荃灣公園': '荃灣城門谷',
        '青衣公園': '青衣',
        '長洲': '長洲',
        '赤柱': '赤柱',
        '筲箕灣': '筲箕灣',
        '觀塘': '觀塘',
        '深水埗': '深水埗',
        '黃大仙': '黃大仙',
        '啟德': '啟德跑道公園',
        '大美督': '大美督',
        '流浮山': '流浮山',
        '打鼓嶺': '打鼓嶺',
        '赤鱲角': '赤鱲角'
    };
    
    // 直接匹配
    if (weatherLocationMap[parkName]) {
        return {
            name: weatherLocationMap[parkName],
            method: 'direct_match',
            distance: null
        };
    }
    
    // 部分匹配
    for (const [key, value] of Object.entries(weatherLocationMap)) {
        if (parkName.includes(key) || key.includes(parkName)) {
            return {
                name: value,
                method: 'partial_match',
                distance: null
            };
        }
    }
    
    // 如果沒有名稱匹配，使用距離計算找到最近的天氣站點
    if (parkCoordinates) {
        const nearestStation = findNearestWeatherStation(parkCoordinates);
        if (nearestStation) {
            return {
                name: nearestStation.name,
                method: 'distance_fallback',
                distance: nearestStation.distance
            };
        }
    }
    
    // 最後回退到香港天文台
    return {
        name: '香港天文台',
        method: 'default_fallback',
        distance: null
    };
}

// 獲取天氣數據
async function fetchWeatherData() {
    try {
        const response = await fetch(WEATHER_API);
        const weatherData = await response.json();
        return weatherData;
    } catch (error) {
        console.error('獲取天氣數據失敗:', error);
        return null;
    }
}

// 獲取天氣預報數據
async function fetchWeatherForecast() {
    try {
        const response = await fetch(WEATHER_FORECAST_API);
        const forecastData = await response.json();
        return forecastData;
    } catch (error) {
        console.error('獲取天氣預報失敗:', error);
        return null;
    }
}

// 根據地點名稱獲取溫度
function getTemperatureByLocation(weatherData, locationName) {
    if (!weatherData || !weatherData.temperature || !weatherData.temperature.data) {
        return null;
    }
    
    const temperatureData = weatherData.temperature.data.find(item => item.place === locationName);
    return temperatureData ? temperatureData.value : null;
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
        // 暫時顯示所有景點，後續可根據真實數據進行篩選
        currentLocations = [...allLocations];
        displayLocations(currentLocations);
    });

    btnCrowded.addEventListener('click', function() {
        setActiveButton(btnCrowded);
        // 暫時顯示所有景點，後續可根據真實數據進行篩選
        currentLocations = [...allLocations];
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
        
        
        li.innerHTML = `
            <div class="location-info">
                <div class="location-name">${location.name}</div>
                <div class="location-desc">${location.description}</div>
                <div class="data-source-tag">${location.dataSource}</div>
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
        
        // 添加懸停效果
        li.addEventListener('mouseenter', () => {
            if (!li.classList.contains('active')) {
                li.style.backgroundColor = '#f0f7f0';
            }
        });
        
        li.addEventListener('mouseleave', () => {
            if (!li.classList.contains('active')) {
                li.style.backgroundColor = '';
            }
        });
        
        locationList.appendChild(li);
    });
    
    // 添加簡單的滾動監聽器
    setupSimpleScrollListener();
}

// 設置簡單的滾動監聽器
function setupSimpleScrollListener() {
    let scrollTimeout;
    
    // 監聽景點列表容器的滾動事件
    locationList.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            updateActiveLocationOnScroll();
        }, 100); // 防抖處理
    });
    
    // 監聽整個頁面的滾動事件
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            updateActiveLocationOnScroll();
        }, 100);
    });
}

// 根據滾動位置更新活動景點
function updateActiveLocationOnScroll() {
    const locationItems = document.querySelectorAll('.location-item');
    if (locationItems.length === 0) return;
    
    const locationListRect = locationList.getBoundingClientRect();
    const listTop = locationListRect.top;
    const listBottom = locationListRect.bottom;
    const listCenter = (listTop + listBottom) / 2;
    
    let bestMatch = null;
    let bestDistance = Infinity;
    
    locationItems.forEach(item => {
        const itemRect = item.getBoundingClientRect();
        const itemTop = itemRect.top;
        const itemBottom = itemRect.bottom;
        const itemCenter = (itemTop + itemBottom) / 2;
        
        // 檢查項目是否在可見區域內
        if (itemTop >= listTop && itemBottom <= listBottom) {
            // 計算項目中心到列表中心的距離
            const distance = Math.abs(itemCenter - listCenter);
            
            if (distance < bestDistance) {
                bestDistance = distance;
                bestMatch = item;
            }
        }
    });
    
    // 如果沒有找到在可見區域內的項目，選擇最接近列表頂部的項目
    if (!bestMatch) {
        locationItems.forEach(item => {
            const itemRect = item.getBoundingClientRect();
            const itemTop = itemRect.top;
            const distance = Math.abs(itemTop - listTop);
            
            if (distance < bestDistance) {
                bestDistance = distance;
                bestMatch = item;
            }
        });
    }
    
    // 如果有找到最佳匹配且不是當前活動項目，則更新
    if (bestMatch && !bestMatch.classList.contains('active')) {
        const locationId = parseInt(bestMatch.dataset.id);
        const location = allLocations.find(loc => loc.id === locationId);
        
        if (location) {
            // 移除所有active類
            document.querySelectorAll('.location-item').forEach(item => {
                item.classList.remove('active');
            });
            // 添加active類到最佳匹配項目
            bestMatch.classList.add('active');
            showLocationDetail(location);
            
            // 調試信息
            console.log('滾動同步更新:', location.name);
        }
    }
}

// 顯示公園詳情
async function showLocationDetail(location) {
    const detailHTML = `
        <h3>${location.name}</h3>
        <p class="location-description">${location.description}</p>
        
        <div class="data-source-info">
            <i class="fas fa-database"></i> 數據來源: 香港政府開放數據平台
        </div>
        
        <div class="coordinates-info">
            <strong>地理位置:</strong><br>
            緯度: ${location.coordinates.latitude.toFixed(6)}<br>
            經度: ${location.coordinates.longitude.toFixed(6)}
        </div>
        
    `;
    
    locationDetail.innerHTML = detailHTML;
    
    // 獲取並顯示天氣數據
    await updateWeatherInfo(location.name, location.coordinates);
    
    trafficInfo.innerHTML = '<p>交通信息暫無數據</p>';
}

// 更新天氣信息
async function updateWeatherInfo(parkName, parkCoordinates) {
    try {
        weatherInfo.innerHTML = '<div class="loading-section"><i class="fas fa-spinner fa-spin"></i><p>正在獲取天氣數據...</p></div>';
        
        const weatherData = await fetchWeatherData();
        
        if (weatherData) {
            const weatherMatch = findMatchingWeatherLocation(parkName, parkCoordinates);
            const temperature = getTemperatureByLocation(weatherData, weatherMatch.name);
            
            if (temperature !== null) {
                let methodText = '';
                switch(weatherMatch.method) {
                    case 'direct_match':
                        methodText = '直接配對';
                        break;
                    case 'partial_match':
                        methodText = '名稱配對';
                        break;
                    case 'distance_fallback':
                        methodText = `距離配對 (${weatherMatch.distance.toFixed(1)}km)`;
                        break;
                    case 'default_fallback':
                        methodText = '默認配對';
                        break;
                }
                
                weatherInfo.innerHTML = `
                    <div class="weather-icon">
                        <i class="fas fa-thermometer-half"></i>
                    </div>
                    <div class="weather-details">
                        <h3>${weatherMatch.name}天氣</h3>
                        <p>溫度: ${temperature}°C</p>
                        <small>數據來源: 香港天文台 (${methodText})</small>
                        <button class="weather-details-btn" onclick="showWeatherDetails()">
                            <i class="fas fa-info-circle"></i> 查看天氣詳情
                        </button>
                    </div>
                `;
            } else {
                weatherInfo.innerHTML = '<p>該地點暫無溫度數據</p>';
            }
        } else {
            weatherInfo.innerHTML = '<p>天氣數據獲取失敗</p>';
        }
    } catch (error) {
        console.error('更新天氣信息失敗:', error);
        weatherInfo.innerHTML = '<p>天氣數據獲取失敗</p>';
    }
}

// 顯示天氣詳情
async function showWeatherDetails() {
    try {
        // 顯示加載狀態
        weatherInfo.innerHTML = '<div class="loading-section"><i class="fas fa-spinner fa-spin"></i><p>正在獲取天氣詳情...</p></div>';
        
        const forecastData = await fetchWeatherForecast();
        
        if (forecastData) {
            weatherInfo.innerHTML = `
                <div class="weather-forecast-details">
                    <h3><i class="fas fa-cloud-sun"></i> 天氣詳情</h3>
                    
                    <div class="forecast-section">
                        <h4><i class="fas fa-info-circle"></i> 一般情況</h4>
                        <p>${forecastData.generalSituation || '暫無數據'}</p>
                    </div>
                    
                    <div class="forecast-section">
                        <h4><i class="fas fa-wind"></i> 熱帶氣旋信息</h4>
                        <p>${forecastData.tcInfo || '暫無熱帶氣旋'}</p>
                    </div>
                    
                    <div class="forecast-section">
                        <h4><i class="fas fa-calendar-day"></i> 預測時段</h4>
                        <p><strong>${forecastData.forecastPeriod || '本港地區'}</strong></p>
                    </div>
                    
                    <div class="forecast-section">
                        <h4><i class="fas fa-cloud-rain"></i> 天氣預測</h4>
                        <p>${forecastData.forecastDesc || '暫無預測'}</p>
                    </div>
                    
                    <div class="forecast-section">
                        <h4><i class="fas fa-eye"></i> 展望</h4>
                        <p>${forecastData.outlook || '暫無展望'}</p>
                    </div>
                    
                    <div class="forecast-meta">
                        <small><i class="fas fa-clock"></i> 更新時間: ${new Date(forecastData.updateTime).toLocaleString('zh-TW')}</small>
                        <button class="weather-back-btn" onclick="updateWeatherInfo('${document.querySelector('.location-item.active')?.querySelector('.location-name')?.textContent || ''}')">
                            <i class="fas fa-arrow-left"></i> 返回溫度顯示
                        </button>
                    </div>
                </div>
            `;
        } else {
            weatherInfo.innerHTML = '<p>天氣詳情獲取失敗</p>';
        }
    } catch (error) {
        console.error('獲取天氣詳情失敗:', error);
        weatherInfo.innerHTML = '<p>天氣詳情獲取失敗</p>';
    }
}



// 推薦最佳公園
function recommendBestLocation(locations) {
    if (locations.length > 0) {
        const bestLocation = locations[0];
        recommendedLocation.textContent = bestLocation.name;
        recommendedLocation.setAttribute('title', '推薦理由: 基於政府開放數據');
    }
}
