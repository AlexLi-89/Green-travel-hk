// 初始化地圖，設置視圖為香港的大致坐標和縮放級別
var map = L.map('map').setView([22.3193, 114.1694], 11);

// 添加一個底圖圖層（這裡使用OpenStreetMap）
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// 嘗試從CSDI加載一個數據集，例如：郊野公園
// 注意：你需要去portal.csdi.gov.hk找到具體數據集的API URL
fetch('https://portal.csdi.gov.hk/你的數據集API地址')
  .then(response => response.json())
  .then(data => {
      console.log('成功獲取數據:', data);
      // 在這裡寫處理數據和在地圖上添加標記的代碼
      // L.marker([緯度, 經度]).addTo(map).bindPopup('景點名稱');
  })
  .catch(error => {
      console.error('獲取數據失敗:', error);
  });