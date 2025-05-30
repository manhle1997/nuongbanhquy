// --- Cấu hình Firebase ---
// TODO: Thay thế bằng cấu hình Firebase của bạn

const firebaseConfig = {
    apiKey: "AIzaSyCEDipe5Ttl6uhfN06OghJJor09J_gPd8M",
    authDomain: "nuongbanhquy-a9563.firebaseapp.com",
    projectId: "nuongbanhquy-a9563",
    storageBucket: "nuongbanhquy-a9563.firebasestorage.app",
    messagingSenderId: "1039715952133",
    appId: "1:1039715952133:web:cc24e4b560cc4719c95e6c",
    measurementId: "G-59Q647M8WD"
  };

  // Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- Các biến trạng thái của Game ---
let currency = 0;
let currencyPerSecond = 0;
let clickPower = 1;
let currentUser = null; // Sẽ lưu đối tượng user của Firebase
let activeUpgradeTab = 'nhanCong'; // Biến lưu tab nâng cấp đang active

// --- DOM Elements ---
const authContainer = document.getElementById('authContainer');
const emailInput = document.getElementById('emailInput'); // Đã đổi từ usernameInput trong HTML
const passwordInput = document.getElementById('passwordInput');
const loginButton = document.getElementById('loginButton');
const registerButton = document.getElementById('registerButton');
const authMessage = document.getElementById('authMessage');

const gameContainer = document.querySelector('.container');
const userSessionDisplay = document.getElementById('userSession');
const loggedInUserDisplay = document.getElementById('loggedInUser');
const logoutButton = document.getElementById('logoutButton');
const gameTitle = document.getElementById('gameTitle'); // Lấy tham chiếu đến h1

const currencyDisplay = document.getElementById('currencyDisplay');
const cpsDisplay = document.getElementById('cpsDisplay');
const clickPowerDisplay = document.getElementById('clickPowerDisplay');
const clickButton = document.getElementById('clickButton');

// DOM Elements cho các container nâng cấp theo tab
const upgradesNhanCongContainer = document.getElementById('upgradesNhanCongContainer');
const upgradesThietBiContainer = document.getElementById('upgradesThietBiContainer');
const upgradesKiNangContainer = document.getElementById('upgradesKiNangContainer');

const saveButton = document.getElementById('saveButton');
const loadButton = document.getElementById('loadButton');
const resetButton = document.getElementById('resetButton');

const leaderboardPopup = document.getElementById('leaderboardPopup');
const leaderboardList = document.getElementById('leaderboardList');

const commentsSection = document.getElementById('commentsSection');
const commentsList = document.getElementById('commentsList');
const commentInput = document.getElementById('commentInput');
const sendCommentButton = document.getElementById('sendCommentButton');

// DOM Elements cho Visitor Bakery Popup
const visitorBakeryPopup = document.getElementById('visitorBakeryPopup');
const closeVisitorPopupButton = document.getElementById('closeVisitorPopupButton');
const visitorBakeryName = document.getElementById('visitorBakeryName');
const visitorCurrencyDisplay = document.getElementById('visitorCurrencyDisplay');
const visitorCpsDisplay = document.getElementById('visitorCpsDisplay');
const visitorClickPowerDisplay = document.getElementById('visitorClickPowerDisplay');
const visitorUpgradesList = document.getElementById('visitorUpgradesList');

const stealCookiesButton = document.getElementById('stealCookiesButton');
const stealResultDisplay = document.getElementById('stealResultDisplay');

// DOM Elements cho Steal Notification Popup
const stealNotificationPopup = document.getElementById('stealNotificationPopup');
const stealNotificationMessage = document.getElementById('stealNotificationMessage');
const closeStealNotificationButton = document.getElementById('closeStealNotificationButton');

// --- Firestore Collection Name ---
const GAME_DATA_COLLECTION = 'DATA_GAME';
const COMMENTS_COLLECTION = 'COMMENTS_GAME'; // Collection mới cho bình luận

// --- Định nghĩa các nâng cấp ---
const initialUpgradesState = [
    // Tab: Nhân Công
    { id: 'baker', name: 'Thuê Thợ Phụ', category: 'nhanCong', cost: 15, cps_increase: 1, level: 0, maxLevel: 10, description: "Mỗi cấp tăng 1 bánh/giây." },
    { id: 'master_baker', name: 'Thợ Làm Bánh Lão Luyện', category: 'nhanCong', cost: 200, cps_increase: 8, level: 0, maxLevel: 12, description: "Kinh nghiệm đầy mình, +8 bánh/giây mỗi cấp." },
    { id: 'apprentice', name: 'Tuyển Thực Tập Sinh', category: 'nhanCong', cost: 50, cps_increase: 0.5, click_power_increase: 0.5, level: 0, maxLevel: 10, description: "Hỗ trợ lặt vặt, +0.5 bánh/giây và +0.5 bánh/click mỗi cấp." },

    // Tab: Thiết Bị
    { id: 'oven', name: 'Lò Nướng Xịn', category: 'thietBi', cost: 100, cps_increase: 5, level: 0, maxLevel: 15, description: "Mỗi cấp tăng 5 bánh/giây." },
    {
        id: 'mixer',
        name: 'Máy Trộn Bột',
        category: 'thietBi',
        cost: 250,
        cps_increase: 10,
        level: 0,
        maxLevel: 8,
        description: "Tự động hóa khâu trộn bột, tăng 10 bánh/giây mỗi cấp."
    },
    {
        id: 'conveyor_belt',
        name: 'Băng Chuyền Sản Xuất',
        category: 'thietBi',
        cost: 1000,
        cps_increase: 25,
        level: 0,
        maxLevel: 10,
        description: "Tăng tốc độ sản xuất, +25 bánh/giây mỗi cấp."
    },

    // Tab: Kĩ Năng
    { id: 'rolling_pin', name: 'Cây Lăn Bột Thần Kỳ', category: 'kiNang', cost: 50, click_power_increase: 1, level: 0, maxLevel: 5, description: "Mỗi cấp tăng 1 bánh/click." },
    {
        id: 'microwave',
        name: 'Lò Vi Sóng Siêu Tốc',
        category: 'kiNang', // Ví dụ: coi đây là một "kĩ năng" sử dụng lò vi sóng
        cost: 500,
        click_power_increase: 5,
        level: 0,
        maxLevel: 7,
        description: "Nướng bánh nhanh hơn bao giờ hết, tăng 5 bánh/click mỗi cấp."
    },
    {
        id: 'marketing_skill',
        name: 'Kĩ Năng Tiếp Thị',
        category: 'kiNang',
        cost: 750,
        // Loại nâng cấp này có thể không trực tiếp tăng CPS hay Click Power
        // mà có thể mở khóa tính năng khác, hoặc tăng giá bán bánh (logic phức tạp hơn)
        // Tạm thời để nó tăng một chút CPS tượng trưng
        cps_increase: 2, // Ví dụ: thu hút thêm khách hàng
        level: 0,
        maxLevel: 5,
        description: "Quảng bá tiệm bánh, thu hút thêm khách hàng (+2 bánh/giây mỗi cấp)."
    }
];
let upgrades = [];

function initializeUpgrades() {
    upgrades = JSON.parse(JSON.stringify(initialUpgradesState));
}

// --- Các hàm xử lý Game ---
function updateDisplay() {
    currencyDisplay.textContent = formatNumber(currency);
    cpsDisplay.textContent = formatNumber(currencyPerSecond);
    clickPowerDisplay.textContent = formatNumber(clickPower);
    renderUpgrades(activeUpgradeTab); // Gọi renderUpgrades với tab đang active
}

function formatNumber(num) {
    if (num < 1000) return num.toFixed(0);
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
    return (num / 1000000000).toFixed(1) + 'B';
}

clickButton.addEventListener('click', () => {
    currency += clickPower;
    updateDisplay();
});

function renderUpgrades(category) {
    if (!category) category = activeUpgradeTab; // Nếu không có category, dùng tab đang active
    // Xác định container dựa trên category
    let currentUpgradesContainer;
    if (category === 'nhanCong') {
        currentUpgradesContainer = upgradesNhanCongContainer;
    } else if (category === 'thietBi') {
        currentUpgradesContainer = upgradesThietBiContainer;
    } else if (category === 'kiNang') {
        currentUpgradesContainer = upgradesKiNangContainer;
    } else {
        return; // Không có category hợp lệ
    }

    // Xóa các nâng cấp cũ trong container hiện tại
    currentUpgradesContainer.innerHTML = '';

    // Lọc và hiển thị các nâng cấp thuộc category được chọn
    upgrades.filter(u => u.category === category).forEach(upgrade => {
        if (upgrade) { // Kiểm tra xem upgrade có tồn tại không
            const upgradeDiv = document.createElement('div');
            upgradeDiv.classList.add('upgrade');
            upgradeDiv.innerHTML = `
                <h3>${upgrade.name} (Cấp ${upgrade.level})</h3>
                <p>${upgrade.description}</p>
                <p>Giá: ${formatNumber(upgrade.cost)} bánh quy</p>
                <p>Hiện tại: +${upgrade.level * (upgrade.cps_increase || 0)} bánh/s, +${upgrade.level * (upgrade.click_power_increase || 0)} bánh/click</p>
                ${upgrade.level >= (upgrade.maxLevel || Infinity) ? '<p>Đã đạt cấp tối đa</p>' : `<button data-id="${upgrade.id}">Mua (Cấp ${upgrade.level + 1})</button>`}
            `;
            currentUpgradesContainer.appendChild(upgradeDiv);

            if (upgrade.level < (upgrade.maxLevel || Infinity)) {
                const buyButton = upgradeDiv.querySelector('button');
                buyButton.disabled = currency < upgrade.cost;
                buyButton.addEventListener('click', () => buyUpgrade(upgrade.id));
            }
        }
    });
}

function buyUpgrade(upgradeId) {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    if (upgrade && currency >= upgrade.cost && upgrade.level < (upgrade.maxLevel || Infinity) ) {
        currency -= upgrade.cost;
        upgrade.level++;
        upgrade.cost = Math.ceil(upgrade.cost * 1.15);

        if (upgrade.cps_increase) {
            currencyPerSecond += upgrade.cps_increase;
        }
        if (upgrade.click_power_increase) {
            clickPower += upgrade.click_power_increase;
        }
        updateDisplay();
    }
}

setInterval(() => {
    if (currentUser) { // Chỉ cộng tiền nếu người dùng đã đăng nhập và game đang chạy
        currency += currencyPerSecond;
        updateDisplay();
    }
}, 1000);

// --- Quản lý màn hình ---
function showAuthScreen() {
    authContainer.style.display = 'block';
    gameContainer.style.display = 'none';
    userSessionDisplay.style.display = 'none';
    leaderboardPopup.style.display = 'none'; // Ẩn leaderboard khi ở màn hình auth
    commentsSection.style.display = 'none'; // Ẩn comments khi ở màn hình auth
    authMessage.textContent = '';
    emailInput.value = '';
    passwordInput.value = '';
}

async function showGameScreen() {
    leaderboardPopup.style.display = 'block'; // Hiển thị leaderboard
    commentsSection.style.display = 'block'; // Hiển thị comments
    authContainer.style.display = 'none';
    gameContainer.style.display = 'block';
    userSessionDisplay.style.display = 'block';
    if (currentUser) {
        loggedInUserDisplay.textContent = currentUser.email;
        // Cập nhật tiêu đề game với tên người dùng
        if (currentUser.email) {
            const userName = currentUser.email.split('@')[0];
            gameTitle.textContent = `Tiệm bánh của ${userName}`;
        }

    }
    await loadGame(); // Tải game cho người dùng hiện tại từ Firestore
    await fetchAndDisplayLeaderboard(); // Tải và hiển thị leaderboard
    listenForComments(); // Bắt đầu lắng nghe bình luận
}

// --- Xử lý Đăng nhập / Đăng ký (với Firebase) ---
async function handleLoginAttempt() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    authMessage.textContent = '';

    if (!email || !password) {
        authMessage.textContent = 'Vui lòng nhập email và mật khẩu.';
        return;
    }

    try {
        await auth.signInWithEmailAndPassword(email, password);
        
        
        // onAuthStateChanged sẽ xử lý việc hiển thị màn hình game
        authMessage.textContent = '';
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        authMessage.textContent = getFirebaseErrorMessage(error);
    }
}

async function handleRegisterAttempt() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    authMessage.textContent = '';

    if (!email || !password) {
        authMessage.textContent = 'Vui lòng nhập email và mật khẩu.';
        return;
    }
    if (password.length < 6) { // Firebase yêu cầu mật khẩu tối thiểu 6 ký tự
        authMessage.textContent = 'Mật khẩu phải có ít nhất 6 ký tự.';
        return;
    }

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const newUser = userCredential.user;

        // Ngay sau khi tạo tài khoản thành công, tạo dữ liệu game mặc định cho người dùng mới
        if (newUser) {
            const defaultGameState = {
                email: newUser.email, // Lưu email để tiện lấy cho leaderboard
                currency: 0, 
                upgrades: initialUpgradesState.map(u => ({ id: u.id, level: 0, cost: u.cost }))
            };
            await db.collection(GAME_DATA_COLLECTION).doc(newUser.uid).set(defaultGameState);
            console.log(`Đã tạo dữ liệu game mặc định cho người dùng mới: ${newUser.uid}`);
        }
        authMessage.textContent = 'Đăng ký thành công! Vui lòng đăng nhập.';
    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        authMessage.textContent = getFirebaseErrorMessage(error);
    }
}

async function handleLogout() {
    try {
        await auth.signOut();
        // onAuthStateChanged sẽ xử lý việc reset trạng thái và hiển thị màn hình auth
    } catch (error) {
        console.error("Lỗi đăng xuất:", error);
        authMessage.textContent = "Lỗi khi đăng xuất. Vui lòng thử lại.";
    }
}

function getFirebaseErrorMessage(error) {
    switch (error.code) {
        case 'auth/invalid-email':
            return 'Địa chỉ email không hợp lệ.';
        case 'auth/user-disabled':
            return 'Tài khoản này đã bị vô hiệu hóa.';
        case 'auth/user-not-found':
            return 'Không tìm thấy người dùng với email này.';
        case 'auth/wrong-password':
            return 'Mật khẩu không đúng.';
        case 'auth/email-already-in-use':
            return 'Địa chỉ email này đã được sử dụng.';
        case 'auth/weak-password':
            return 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.';
        case 'auth/requires-recent-login':
            return 'Hành động này yêu cầu đăng nhập lại. Vui lòng đăng xuất và đăng nhập lại.';
        default:
            return 'Đã xảy ra lỗi. Vui lòng thử lại.';
    }
}

// --- Lưu và Tải Game (với Firebase Firestore) ---
async function saveGame() {
    if (!currentUser || !currentUser.uid) {
        alert('Bạn cần đăng nhập để lưu game.');
        return;
    }
    const gameState = {
        currency: currency,
        email: currentUser.email,
        // currencyPerSecond và clickPower sẽ được tính lại khi tải dựa trên level của upgrades
        upgrades: upgrades.map(u => ({ id: u.id, level: u.level, cost: u.cost })) // Lưu level và cost hiện tại
    };

    try {
        await db.collection(GAME_DATA_COLLECTION).doc(currentUser.uid).set(gameState);
        // Sau khi lưu game thành công, cập nhật leaderboard
        await fetchAndDisplayLeaderboard();
        alert(`Đã lưu game cho ${currentUser.email}!`);

    } catch (error) {
        console.error("Lỗi lưu game:", error);
        alert("Lưu game thất bại. Vui lòng thử lại.");
    }
}

async function loadGame() {
    // Reset trạng thái game cục bộ trước khi tải
    currency = 0;
    currencyPerSecond = 0;
    clickPower = 1;
    initializeUpgrades(); // Đặt lại upgrades về trạng thái ban đầu

    if (!currentUser || !currentUser.uid) {
        updateDisplay(); // Cập nhật hiển thị với trạng thái game mới/reset
        return;
    }

    try {
        const doc = await db.collection(GAME_DATA_COLLECTION).doc(currentUser.uid).get();
        if (doc.exists) {
            const gameState = doc.data();
            currency = gameState.currency || 0;
            // Kiểm tra và cập nhật email nếu thiếu trong DB và người dùng hiện tại có email
            if (!gameState.email && currentUser && currentUser.email) {
                console.log(`Cập nhật email cho người dùng ${currentUser.uid} trong DB khi tải game.`);
                // Không cần await ở đây nếu không muốn chặn luồng tải game
                // Chỉ là một nỗ lực "best-effort" để cập nhật
                db.collection(GAME_DATA_COLLECTION).doc(currentUser.uid).update({ email: currentUser.email }).catch(err => console.error("Lỗi cập nhật email khi tải game:", err));
            }

            if (gameState.upgrades && Array.isArray(gameState.upgrades)) {
                gameState.upgrades.forEach(savedUpgrade => {
                    const gameUpgrade = upgrades.find(u => u.id === savedUpgrade.id);
                    const initialGameUpgrade = initialUpgradesState.find(u => u.id === savedUpgrade.id);
                    if (gameUpgrade && initialGameUpgrade) {
                        gameUpgrade.level = savedUpgrade.level || 0;
                        // Ưu tiên cost đã lưu, nếu không có thì tính lại dựa trên level (hoặc dùng cost ban đầu nếu level 0)
                        gameUpgrade.cost = savedUpgrade.cost !== undefined ? savedUpgrade.cost : (gameUpgrade.level > 0 ? Math.ceil(initialGameUpgrade.cost * Math.pow(1.15, gameUpgrade.level)) : initialGameUpgrade.cost) ;


                        // Tính lại CPS và ClickPower dựa trên level đã load
                        for (let i = 0; i < gameUpgrade.level; i++) {
                            if (initialGameUpgrade.cps_increase) currencyPerSecond += initialGameUpgrade.cps_increase;
                            if (initialGameUpgrade.click_power_increase) clickPower += initialGameUpgrade.click_power_increase;
                        }
                    }
                });
            }
        } else {
            // Không có dữ liệu lưu, game bắt đầu mới (trạng thái đã được reset ở trên)
        }
    } catch (error) {
        console.error("Lỗi tải game:", error);
        alert("Tải game thất bại. Bắt đầu game mới.");
        // Đảm bảo game được reset nếu tải lỗi (đã làm ở đầu hàm)
    }
    updateDisplay(); // Cập nhật giao diện sau khi tải hoặc bắt đầu mới
}

async function resetGame() {
    if (!currentUser || !currentUser.uid) {
        alert('Vui lòng đăng nhập để thực hiện thao tác này.');
        return;
    }
    if (confirm(`Bạn có chắc muốn chơi lại từ đầu cho tài khoản ${currentUser.email}? Mọi tiến trình sẽ bị mất.`)) {
        try {
            // Tạo trạng thái game mặc định để ghi đè
            const defaultGameState = {
                currency: 0,
                email: currentUser.email,
                upgrades: initialUpgradesState.map(u => ({ id: u.id, level: 0, cost: u.cost }))
            };
            await db.collection(GAME_DATA_COLLECTION).doc(currentUser.uid).set(defaultGameState);

            // Reset trạng thái game cục bộ và cập nhật hiển thị
            currency = 0;
            currencyPerSecond = 0;
            clickPower = 1;
            initializeUpgrades();
            updateDisplay();
            alert(`Đã chơi lại từ đầu cho ${currentUser.email}!`);
        } catch (error) {
            console.error("Lỗi reset game:", error);
            alert("Reset game thất bại. Vui lòng thử lại.");
        }
    }
}

// Biến để lưu trữ listener của leaderboard, giúp chúng ta có thể detach khi cần
let leaderboardListener = null;

// --- Xử lý Bảng Xếp Hạng ---
async function fetchAndDisplayLeaderboard() {
    if (!db) return; // Chưa khởi tạo db
    leaderboardList.innerHTML = '<li>Đang tải...</li>'; // Thông báo đang tải
    // Nếu đã có listener, hãy detach nó trước khi tạo listener mới
    if (leaderboardListener) {
        leaderboardListener(); // Gọi hàm unsubscribe
        leaderboardListener = null;
    }

    leaderboardListener = db.collection(GAME_DATA_COLLECTION)
        .orderBy('currency', 'desc') // Sắp xếp theo 'currency' giảm dần
        .limit(10) // Lấy top 10 người chơi
        .onSnapshot((querySnapshot) => {
            leaderboardList.innerHTML = ''; // Xóa nội dung cũ mỗi khi có cập nhật
            if (querySnapshot.empty) {
                leaderboardList.innerHTML = '<li>Chưa có ai trên bảng xếp hạng.</li>';
                return;
            }

            let rank = 1;
            querySnapshot.forEach(doc => {
                const playerData = doc.data();
                const playerUserId = doc.id; // Đây là UID của người chơi

                let displayName;
                if (playerData.email) {
                    displayName = playerData.email.split('@')[0];
                } else if (currentUser && doc.id === currentUser.uid && currentUser.email) {
                    displayName = currentUser.email.split('@')[0];
                } else {
                    displayName = `User...${doc.id.substring(doc.id.length - 5)}`;
                }

                const listItem = document.createElement('li');
                const isCurrentUserEntry = currentUser && playerUserId === currentUser.uid;

                listItem.innerHTML = `
                    <span class="player-name" data-userid="${playerUserId}" style="cursor: ${isCurrentUserEntry ? 'default' : 'pointer'};">${rank}. ${displayName} ${isCurrentUserEntry ? '(Bạn)' : ''}</span>
                    <span class="player-score">${formatNumber(playerData.currency || 0)} 🍪</span>
                `;
                leaderboardList.appendChild(listItem);
                
                if (!isCurrentUserEntry) {
                    const playerNameSpan = listItem.querySelector('.player-name');
                    if (playerNameSpan) playerNameSpan.addEventListener('click', () => fetchAndDisplayVisitedBakery(playerUserId));
                }
                rank++;
            });
        }, (error) => {
            console.error("Lỗi lắng nghe bảng xếp hạng:", error);
            leaderboardList.innerHTML = '<li>Không thể tải bảng xếp hạng.</li>';
            if (leaderboardListener) {
                leaderboardListener(); // Hủy đăng ký listener nếu có lỗi
                leaderboardListener = null;
            }
        });
}

// --- Tính năng thăm tiệm bánh của người khác ---

// Hàm tính toán CPS và Click Power từ dữ liệu game của một người chơi
function calculateStatsFromPlayerState(playerGameState) {
    let calculatedCps = 0;
    let calculatedClickPower = 1; // Base click power

    if (playerGameState.upgrades && Array.isArray(playerGameState.upgrades)) {
        playerGameState.upgrades.forEach(savedUpgrade => {
            const initialGameUpgrade = initialUpgradesState.find(u => u.id === savedUpgrade.id);
            if (initialGameUpgrade) {
                for (let i = 0; i < savedUpgrade.level; i++) {
                    if (initialGameUpgrade.cps_increase) {
                        calculatedCps += initialGameUpgrade.cps_increase;
                    }
                    if (initialGameUpgrade.click_power_increase) {
                        calculatedClickPower += initialGameUpgrade.click_power_increase;
                    }
                }
            }
        });
    }
    return { cps: calculatedCps, clickPower: calculatedClickPower };
}

// Biến để lưu trữ listener của popup thăm tiệm bánh
let visitedBakeryListener = null;

// Biến cho tính năng ăn cắp
let currentStealTargetId = null;
let lastStealAttemptTimestamps = {}; // Lưu trữ { targetUserId: timestamp }
const STEAL_COOLDOWN_MS = 5 * 60 * 1000; // 5 phút
const STEAL_SUCCESS_CHANCE = 0.4; // 40% tỷ lệ thành công
const BASE_STEAL_PERCENTAGE = 0.005; // Tỷ lệ cắp cơ bản (ví dụ: 0.5%)
const CPS_STEAL_FACTOR = 0.00002; // Yếu tố ảnh hưởng từ CPS của nạn nhân (ví dụ: 0.00002%)
const MAX_STEAL_PERCENTAGE = 0.05; // Tỷ lệ cắp tối đa (ví dụ: 5%)
let stealCooldownInterval = null;

async function fetchAndDisplayVisitedBakery(userIdToVisit) {
    if (!userIdToVisit || !db) {
        console.error("[Visitor] Invalid userIdToVisit or db not initialized.");
        return;
    }
    console.log("[Visitor] Attempting to visit bakery of user ID:", userIdToVisit);

    currentStealTargetId = userIdToVisit; // Lưu mục tiêu hiện tại
    // Reset và hiển thị popup với trạng thái đang tải
    visitorBakeryName.textContent = "Đang tải tiệm bánh...";
    visitorCurrencyDisplay.textContent = "...";
    visitorCpsDisplay.textContent = "...";
    visitorClickPowerDisplay.textContent = "...";
    visitorUpgradesList.innerHTML = '<li>Đang tải nâng cấp...</li>';
    visitorBakeryPopup.classList.add('active');
    updateStealButtonState(userIdToVisit); // Cập nhật trạng thái nút ăn cắp

    // Hủy listener cũ nếu có
    if (visitedBakeryListener) {
        visitedBakeryListener();
        visitedBakeryListener = null;
    }

    visitedBakeryListener = db.collection(GAME_DATA_COLLECTION).doc(userIdToVisit)
        .onSnapshot((docSnap) => {
            console.log("[Visitor] Snapshot received for user ID:", userIdToVisit);
            if (docSnap.exists) {
                const visitedPlayerData = docSnap.data();
                console.log("[Visitor] Document data:", visitedPlayerData);

                if (!visitedPlayerData) {
                    console.error("[Visitor] Document exists but data is undefined/null for user ID:", userIdToVisit);
                    visitorBakeryName.textContent = "Lỗi dữ liệu người chơi";
                    visitorUpgradesList.innerHTML = '<li>Không thể đọc dữ liệu của người chơi này.</li>';
                    return;
                }

                const userEmail = visitedPlayerData.email || `User ${userIdToVisit.substring(0, 5)}...`;
                const userName = userEmail.split('@')[0];

                visitorBakeryName.textContent = `Tiệm bánh của ${userName}`;
                visitorCurrencyDisplay.textContent = formatNumber(visitedPlayerData.currency || 0); // Cập nhật real-time

                const stats = calculateStatsFromPlayerState(visitedPlayerData); // Tính lại stats nếu nâng cấp thay đổi
                visitorCpsDisplay.textContent = formatNumber(stats.cps);
                visitorClickPowerDisplay.textContent = formatNumber(stats.clickPower);

                visitorUpgradesList.innerHTML = '';
                let hasUpgrades = false;
                if (visitedPlayerData.upgrades && Array.isArray(visitedPlayerData.upgrades) && visitedPlayerData.upgrades.length > 0) {
                    visitedPlayerData.upgrades.forEach(upg => {
                        const initialUpg = initialUpgradesState.find(iUpg => iUpg.id === upg.id);
                        if (initialUpg && upg.level > 0) {
                            const li = document.createElement('li');
                            li.textContent = `${initialUpg.name}: Cấp ${upg.level}`;
                            visitorUpgradesList.appendChild(li);
                            hasUpgrades = true;
                        }
                    });
                }
                if (!hasUpgrades) {
                    visitorUpgradesList.innerHTML = '<li>Người chơi này chưa mua nâng cấp nào.</li>';
                }
            } else {
                console.warn("[Visitor] No such document for user ID:", userIdToVisit);
                visitorBakeryName.textContent = "Không tìm thấy tiệm bánh";
                visitorUpgradesList.innerHTML = `<li>Không có dữ liệu cho người chơi với ID: ${userIdToVisit.substring(0,8)}...</li>`;
            }
        }, (error) => {
            console.error("[Visitor] Error listening to visited bakery:", error);
            visitorBakeryName.textContent = "Lỗi tải dữ liệu";
            let errorMessage = 'Đã xảy ra lỗi khi lắng nghe thông tin tiệm bánh.';
            if (error.code === 'permission-denied') {
                errorMessage = 'Lỗi: Không có quyền truy cập dữ liệu của người chơi này. Vui lòng kiểm tra lại cài đặt Firestore Rules.';
            } else if (error.message) {
                errorMessage = `Lỗi: ${error.message}`;
            }
            visitorUpgradesList.innerHTML = `<li>${errorMessage}</li>`;
            if (visitedBakeryListener) {
                visitedBakeryListener(); // Hủy đăng ký listener nếu có lỗi
                visitedBakeryListener = null;
            }
        });
}

closeVisitorPopupButton.addEventListener('click', () => {
    visitorBakeryPopup.classList.remove('active');
    // Hủy listener khi đóng popup
    if (visitedBakeryListener) {
        visitedBakeryListener(); // Gọi hàm unsubscribe
        visitedBakeryListener = null;
        console.log("[Visitor] Detached listener for visited bakery.");
    }
    if (stealCooldownInterval) {
        clearInterval(stealCooldownInterval);
        stealCooldownInterval = null;
    }
    currentStealTargetId = null; // Xóa mục tiêu hiện tại
    stealResultDisplay.textContent = ''; // Xóa thông báo kết quả ăn cắp
});

function updateStealButtonState(targetId) {
    if (stealCooldownInterval) {
        clearInterval(stealCooldownInterval);
        stealCooldownInterval = null;
    }
    stealResultDisplay.textContent = ''; // Xóa thông báo cũ

    if (!currentUser || !targetId || targetId === currentUser.uid) {
        stealCookiesButton.disabled = true;
        stealCookiesButton.textContent = "Không thể ăn cắp";
        return;
    }

    const now = Date.now();
    const lastAttemptTime = lastStealAttemptTimestamps[targetId] || 0;
    const cooldownRemaining = STEAL_COOLDOWN_MS - (now - lastAttemptTime);

    if (cooldownRemaining > 0) {
        stealCookiesButton.disabled = true;
        const updateText = () => {
            const currentNow = Date.now();
            const remaining = STEAL_COOLDOWN_MS - (currentNow - lastAttemptTime);
            if (remaining <= 0) {
                clearInterval(stealCooldownInterval);
                stealCooldownInterval = null;
                stealCookiesButton.disabled = false;
                stealCookiesButton.textContent = "Ăn Cắp Bánh!";
            } else {
                const minutes = Math.floor(remaining / 60000);
                const seconds = Math.floor((remaining % 60000) / 1000);
                stealCookiesButton.textContent = `Chờ ${minutes}m ${seconds}s`;
            }
        };
        updateText(); // Cập nhật lần đầu
        stealCooldownInterval = setInterval(updateText, 1000);
    } else {
        stealCookiesButton.disabled = false;
        stealCookiesButton.textContent = "Ăn Cắp Bánh!";
    }
}

async function handleStealAttempt() {
    if (!currentStealTargetId || !currentUser || currentStealTargetId === currentUser.uid) {
        stealResultDisplay.textContent = "Không thể tự ăn cắp chính mình!";
        stealResultDisplay.style.color = 'orange';
        return;
    }

    stealCookiesButton.disabled = true; // Vô hiệu hóa nút trong khi xử lý

    const targetUserId = currentStealTargetId;
    const now = Date.now();
    if ((now - (lastStealAttemptTimestamps[targetUserId] || 0)) < STEAL_COOLDOWN_MS) {
        stealResultDisplay.textContent = "Bạn cần chờ để ăn cắp người này lần nữa!";
        stealResultDisplay.style.color = 'orange';
        updateStealButtonState(targetUserId); // Cập nhật lại nút với thời gian chờ
        return;
    }

    const thiefRef = db.collection(GAME_DATA_COLLECTION).doc(currentUser.uid);
    const victimRef = db.collection(GAME_DATA_COLLECTION).doc(targetUserId);

    try {
        let stolenAmount = 0;
        await db.runTransaction(async (transaction) => {
            const victimDoc = await transaction.get(victimRef);
            if (!victimDoc.exists) {
                throw "Không tìm thấy nạn nhân!";
            }
            const victimData = victimDoc.data();
            const victimCurrency = victimData.currency || 0;

            // Tính toán chỉ số của nạn nhân (bao gồm CPS)
            const victimStats = calculateStatsFromPlayerState(victimData);
            const victimCPS = victimStats.cps || 0;

            if (Math.random() < STEAL_SUCCESS_CHANCE) { // Thành công
                // Tính tỷ lệ cắp động dựa trên CPS của nạn nhân
                let dynamicStealPercentage = BASE_STEAL_PERCENTAGE + (victimCPS * CPS_STEAL_FACTOR);
                // Giới hạn tỷ lệ cắp tối đa
                dynamicStealPercentage = Math.min(dynamicStealPercentage, MAX_STEAL_PERCENTAGE);

                stolenAmount = Math.floor(victimCurrency * dynamicStealPercentage);
                stolenAmount = Math.max(0, Math.min(stolenAmount, victimCurrency)); // Đảm bảo không âm và không quá số hiện có

                if (stolenAmount > 0 && victimCurrency >= stolenAmount) { // Đảm bảo nạn nhân có đủ để bị cắp
                    transaction.update(victimRef, { currency: firebase.firestore.FieldValue.increment(-stolenAmount) });
                    transaction.update(thiefRef, { currency: firebase.firestore.FieldValue.increment(stolenAmount) });
                } else {
                    // Thay vì throw, chúng ta sẽ set stolenAmount = -1 (hoặc một giá trị đặc biệt)
                    // để biết rằng không cắp được gì và hiển thị thông báo phù hợp sau transaction.
                    stolenAmount = -1; // Đánh dấu trường hợp không có bánh để cắp
                    // Không throw lỗi ở đây nữa để transaction vẫn có thể hoàn thành (nếu không có lỗi khác)
                }
            } else { // Thất bại
                throw "Ăn cắp thất bại! May mắn lần sau.";
            }
        });

        // Nếu giao dịch thành công và stolenAmount > 0
        if (stolenAmount > 0) { // Cắp thành công
            currency += stolenAmount; // Cập nhật tiền của người chơi hiện tại
            updateDisplay(); // Cập nhật hiển thị của người chơi hiện tại
            // Hiển thị popup thông báo ăn cắp thành công
            stealNotificationMessage.textContent = `Bạn đã ăn cắp thành công ${formatNumber(stolenAmount)} bánh quy! 🥳`;
            stealNotificationPopup.classList.add('active');
            stealResultDisplay.textContent = ''; // Xóa thông báo cũ trong popup thăm
        } else if (stolenAmount === -1) { // Trường hợp nạn nhân không có bánh để cắp
            stealNotificationMessage.textContent = "Nạn nhân không có bánh để cắp! 😥";
            stealNotificationPopup.classList.add('active');
            stealResultDisplay.textContent = ''; // Xóa thông báo cũ
        }
        // Trường hợp ăn cắp thất bại (do Math.random() >= STEAL_SUCCESS_CHANCE) sẽ được xử lý ở khối catch


    } catch (error) {
        console.error("Lỗi khi ăn cắp:", error);
        // Hiển thị thông báo thất bại trong popup riêng
        let failMessage = "Có lỗi xảy ra khi cố gắng ăn cắp. 😵";
        if (typeof error === 'string') {
            failMessage = error; // Sử dụng thông báo lỗi cụ thể nếu có (ví dụ: "Ăn cắp thất bại! May mắn lần sau.")
        }
        stealNotificationMessage.textContent = failMessage;
        stealNotificationPopup.classList.add('active');
        stealResultDisplay.textContent = ''; // Xóa thông báo cũ trong popup thăm

    } finally {
        lastStealAttemptTimestamps[targetUserId] = Date.now(); // Đặt thời gian chờ dù thành công hay thất bại
        updateStealButtonState(targetUserId); // Cập nhật lại trạng thái nút (sẽ hiển thị cooldown)
    }
}

// --- Xử lý Bình Luận Real-time ---
let commentsListener = null; // Biến lưu trữ listener của comments

async function handleSendComment() {
    const text = commentInput.value.trim();
    if (!text) {
        alert("Vui lòng nhập nội dung bình luận.");
        return;
    }
    if (!currentUser || !currentUser.uid) {
        alert("Bạn cần đăng nhập để bình luận.");
        return;
    }

    try {
        sendCommentButton.disabled = true; // Vô hiệu hóa nút gửi tạm thời
        await db.collection(COMMENTS_COLLECTION).add({
            text: text,
            userId: currentUser.uid,
            userEmail: currentUser.email, // Lưu email để hiển thị
            timestamp: firebase.firestore.FieldValue.serverTimestamp() // Dùng server timestamp
        });
        commentInput.value = ''; // Xóa input sau khi gửi
    } catch (error) {
        console.error("Lỗi gửi bình luận:", error);
        alert("Không thể gửi bình luận. Vui lòng thử lại.");
    } finally {
        sendCommentButton.disabled = false; // Kích hoạt lại nút gửi
    }
}

function listenForComments() {
    if (!db) return;

    // Hủy listener cũ nếu có
    if (commentsListener) {
        commentsListener();
        commentsListener = null;
    }

    commentsListener = db.collection(COMMENTS_COLLECTION)
      .orderBy('timestamp', 'desc') // Sắp xếp bình luận mới nhất lên đầu
      .limit(20) // Giới hạn số lượng bình luận hiển thị ban đầu
      .onSnapshot((querySnapshot) => {
          commentsList.innerHTML = ''; // Xóa bình luận cũ
          if (querySnapshot.empty) {
              commentsList.innerHTML = '<p style="text-align:center; color:#999;">Chưa có bình luận nào.</p>';
              return;
          }
          querySnapshot.forEach((doc) => {
              const comment = doc.data();
              const commentDiv = document.createElement('div');
              commentDiv.classList.add('comment-item');

              const userSpan = document.createElement('span');
              userSpan.classList.add('comment-user');
              userSpan.textContent = comment.userEmail ? comment.userEmail.split('@')[0] : 'Ẩn danh';

              const textSpan = document.createElement('span');
              textSpan.classList.add('comment-text');
              textSpan.textContent = `: ${comment.text}`;
              
              commentDiv.appendChild(userSpan);
              commentDiv.appendChild(textSpan);
              commentsList.prepend(commentDiv); // Thêm bình luận mới lên đầu danh sách
          });
      }, (error) => {
          console.error("Lỗi lắng nghe bình luận:", error);
          commentsList.innerHTML = '<p style="text-align:center; color:red;">Không thể tải bình luận.</p>';
          if (commentsListener) {
            commentsListener();
            commentsListener = null;
          }
      });
}

// --- Event Listeners ---
saveButton.addEventListener('click', saveGame);
loadButton.addEventListener('click', loadGame); 
resetButton.addEventListener('click', resetGame);
loginButton.addEventListener('click', handleLoginAttempt);
registerButton.addEventListener('click', handleRegisterAttempt);
stealCookiesButton.addEventListener('click', handleStealAttempt);
logoutButton.addEventListener('click', handleLogout);
sendCommentButton.addEventListener('click', handleSendComment);
closeStealNotificationButton.addEventListener('click', () => {
    stealNotificationPopup.classList.remove('active');
});


// Xử lý chuyển tab cho nâng cấp
const tabLinks = document.querySelectorAll('.tab-link');
const tabContents = document.querySelectorAll('.tab-content');
tabLinks.forEach(link => {
    link.addEventListener('click', () => {
        const tabId = link.getAttribute('data-tab');

        tabLinks.forEach(item => item.classList.remove('active'));
        tabContents.forEach(item => item.classList.remove('active'));

        link.classList.add('active');
        activeUpgradeTab = tabId; // Cập nhật tab đang active
        document.getElementById(tabId).classList.add('active');

        renderUpgrades(tabId); // Render lại nâng cấp cho tab mới được chọn
    });
});

// --- Theo dõi trạng thái đăng nhập ---
auth.onAuthStateChanged(async (user) => {
    initializeUpgrades(); // Luôn khởi tạo/reset định nghĩa nâng cấp
    if (user) {
        // Người dùng đã đăng nhập
        activeUpgradeTab = 'nhanCong'; // Reset về tab mặc định khi đăng nhập
        currentUser = user;
        await showGameScreen(); // Sẽ gọi loadGame bên trong
    } else {
        // Người dùng đã đăng xuất hoặc chưa đăng nhập
        currentUser = null;
        // Reset trạng thái game về mặc định trước khi hiển thị màn hình đăng nhập
        currency = 0;
        currencyPerSecond = 0;
        clickPower = 1;
        // initializeUpgrades(); // Đã gọi ở trên
        updateDisplay(); // Cập nhật hiển thị (sẽ là 0 hết)
        showAuthScreen();
        // Hủy các listeners khi người dùng đăng xuất
        if (leaderboardListener) { leaderboardListener(); leaderboardListener = null; console.log("Detached leaderboard listener."); }
        if (visitedBakeryListener) { visitedBakeryListener(); visitedBakeryListener = null; console.log("Detached visited bakery listener."); }
        if (commentsListener) { commentsListener(); commentsListener = null; console.log("Detached comments listener."); } 
        if (stealCooldownInterval) { clearInterval(stealCooldownInterval); stealCooldownInterval = null; }

        gameTitle.textContent = "Game nướng bánh - Đợi lương"; // Reset tiêu đề khi đăng xuất
        leaderboardPopup.style.display = 'none'; // Ẩn leaderboard khi đăng xuất
        commentsSection.style.display = 'none'; // Ẩn comments khi đăng xuất
    }
});
