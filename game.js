// ==========================================
// 1. DỮ LIỆU TRẠNG THÁI GAME
// ==========================================

let activeEventCellId = null;

// const players = [
//     { id: 1, name: "Người chơi 1", color: "#ff4757", pos: 0, money: 20000, inJail: false, isBankrupt: false },
//     { id: 2, name: "Người chơi 2", color: "#1e90ff", pos: 0, money: 20000, inJail: false, isBankrupt: false },
//     { id: 3, name: "Người chơi 3", color: "#2ed573", pos: 0, money: 20000, inJail: false, isBankrupt: false },
//     { id: 4, name: "Người chơi 4", color: "#ffa502", pos: 0, money: 20000, inJail: false, isBankrupt: false }
// ];

// Thay mảng cố định bằng mảng rỗng để đợi dữ liệu từ màn hình Lobby nạp vào
let players = []; 
const defaultColors = ["#ff4757", "#1e90ff", "#2ed573", "#ffa502", "#a55eea", "#fd79a8"]; // Thêm sẵn vài màu đẹp

// ==========================================
// 1.5. LOGIC LOBBY - THIẾT LẬP GAME BAN ĐẦU
// ==========================================
function initLobby() {
    const setupScreen = document.getElementById('setup-screen');
    const playerCountSelect = document.getElementById('player-count');
    const playerDetailsContainer = document.getElementById('player-details');
    const startGameBtn = document.getElementById('start-game-btn');

    // Hàm tạo form nhập liệu
    function renderPlayerInputs() {
        const count = parseInt(playerCountSelect.value);
        playerDetailsContainer.innerHTML = ''; 

        for (let i = 0; i < count; i++) {
            const row = document.createElement('div');
            row.className = 'player-input-row';
            row.innerHTML = `
                <strong>P${i + 1}</strong>
                <input type="text" id="p-name-${i}" placeholder="Tên..." value="Người chơi ${i + 1}">
                <input type="color" id="p-color-${i}" value="${defaultColors[i] || '#000000'}">
            `;
            playerDetailsContainer.appendChild(row);
        }
    }

    // Lắng nghe thay đổi số lượng
    playerCountSelect.addEventListener('change', renderPlayerInputs);

    // Hàm xáo trộn mảng (Random thứ tự đi)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Khi bấm Bắt Đầu
    startGameBtn.addEventListener('click', () => {
        const count = parseInt(playerCountSelect.value);
        let tempPlayers = [];

        // Lấy dữ liệu từ form
        for (let i = 0; i < count; i++) {
            const nameInput = document.getElementById(`p-name-${i}`).value.trim() || `Người chơi ${i + 1}`;
            const colorInput = document.getElementById(`p-color-${i}`).value;
            
            tempPlayers.push({
                name: nameInput,
                color: colorInput,
                money: 20000,   
                pos: 0,         
                inJail: false,
                isBankrupt: false
            });
        }

        // Random thứ tự đi
        shuffleArray(tempPlayers);

        // Gán ID (1, 2, 3...) theo thứ tự mới đã random để khớp với logic cũ của bạn
        players = tempPlayers.map((p, index) => {
            p.id = index + 1; 
            return p;
        });

        // Ẩn màn hình Lobby
        setupScreen.style.display = 'none';

        // Gọi hàm khởi tạo bàn cờ của bạn
        initBoard(); 
        
        // In ra log thứ tự đi
        const logDisplay = document.getElementById('game-log');
        if(logDisplay) {
            logDisplay.innerText = "🎲 Game bắt đầu! Thứ tự đi đã được random ngẫu nhiên.\n";
            players.forEach((p, i) => {
                logDisplay.innerText += `${i + 1}. ${p.name}\n`;
            });
        }
    });

    // Chạy lần đầu để render form sẵn
    renderPlayerInputs();
}

let currentPlayerIndex = 0;

// Tọa độ 38 ô
const pathCoords = [
    {r: 10, c: 11}, {r: 10, c: 10}, {r: 10, c: 9}, {r: 10, c: 8}, {r: 10, c: 7}, {r: 10, c: 6}, {r: 10, c: 5}, {r: 10, c: 4}, {r: 10, c: 3}, {r: 10, c: 2},
    {r: 10, c: 1},  {r: 9, c: 1}, {r: 8, c: 1}, {r: 7, c: 1}, {r: 6, c: 1}, {r: 5, c: 1}, {r: 4, c: 1}, {r: 3, c: 1}, {r: 2, c: 1},
    {r: 1, c: 1},   {r: 1, c: 2}, {r: 1, c: 3}, {r: 1, c: 4}, {r: 1, c: 5}, {r: 1, c: 6}, {r: 1, c: 7}, {r: 1, c: 8}, {r: 1, c: 9}, {r: 1, c: 10},
    {r: 1, c: 11},  {r: 2, c: 11}, {r: 3, c: 11}, {r: 4, c: 11}, {r: 5, c: 11}, {r: 6, c: 11}, {r: 7, c: 11}, {r: 8, c: 11}, {r: 9, c: 11}
];

// Dữ liệu quản lý Đất đai (Tạo tự động 38 ô)
const boardData = [
    // ==========================================
    // ⬇️ CẠNH DƯỚI (11 ô - Từ phải sang trái)
    // ==========================================
    { id: 0,  name: "XUẤT PHÁT", type: 'special', price: 0, rent: 0, owner: null, level: 0 },
    { id: 1,  name: "Cà Mau",     type: 'land',    price: 500, rent: 50, owner: null, level: 0 },
    { id: 2,  name: "Cơ hội",     type: 'special', price: 0, rent: 0, owner: null, level: 0 },
    { id: 3,  name: "Vĩnh Long",     type: 'land',    price: 700, rent: 70, owner: null, level: 0 },
    { id: 4,  name: "Vũng Tàu",     type: 'land',    price: 800, rent: 80, owner: null, level: 0 },
    { id: 5,  name: "Bến xe miền Nam",  type: 'special', price: 0, rent: 0, owner: null, level: 0 }, 
    { id: 6,  name: "TP. HCM",     type: 'land',    price: 1000, rent: 100, owner: null, level: 0 },
    { id: 7,  name: "Đà Lạt",     type: 'land',    price: 1100, rent: 110, owner: null, level: 0 },
    { id: 8,  name: "Khí Vận", type: 'special', price: 0, rent: 0, owner: null, level: 0 },
    { id: 9,  name: "Đồng Nai",     type: 'land',    price: 1300, rent: 130, owner: null, level: 0 },
    { id: 10, name: "TÙ",   type: 'special', price: 0, rent: 0, owner: null, level: 0 },

    // ==========================================
    // ⬅️ CẠNH TRÁI (8 ô - Từ dưới lên trên)
    // ==========================================
    { id: 11, name: "Hà Tĩnh",     type: 'land',    price: 1400, rent: 140, owner: null, level: 0 },
    { id: 12, name: "Bãi đổ xe", type: 'special', price: 0, rent: 0, owner: null, level: 0 },
    { id: 13, name: "Đắk Lắk",    type: 'land',    price: 1600, rent: 160, owner: null, level: 0 },
    { id: 14, name: "Đà Nẵng",    type: 'land',    price: 1600, rent: 160, owner: null, level: 0 },
    { id: 15, name: "Bến xe miền Tây",  type: 'special', price: 0, rent: 0, owner: null, level: 0 },
    { id: 16, name: "Huế",    type: 'land',    price: 1900, rent: 190, owner: null, level: 0 },
    { id: 17, name: "Nha Trang",    type: 'land',    price: 2000, rent: 200, owner: null, level: 0 },
    { id: 18, name: "Nghệ An",    type: 'land',    price: 2100, rent: 210, owner: null, level: 0 },

    // ==========================================
    // ⬆️ CẠNH TRÊN (11 ô - Từ trái sang phải)
    // ==========================================
    { id: 19, name: "Tổ chức sự kiện", type: 'special', price: 0, rent: 0, owner: null, level: 0 },
    { id: 20, name: "Tuyên Quang",    type: 'land',    price: 2200, rent: 220, owner: null, level: 0 },
    { id: 21, name: "Khí Vận", type: 'special', price: 0, rent: 0, owner: null, level: 0},
    { id: 22, name: "Thái Nguyên",    type: 'land',    price: 2600, rent: 260, owner: null, level: 0 },
    { id: 23, name: "Quảng Ninh",    type: 'land',    price: 2800, rent: 280, owner: null, level: 0 },
    { id: 24, name: "Bến xe miền Bắc",  type: 'special', price: 0, rent: 0, owner: null, level: 0 },
    { id: 25, name: "Bắc Bling",    type: 'land',    price: 3000, rent: 300, owner: null, level: 0 },
    { id: 26, name: "Hải Phòng",    type: 'land',    price: 3200, rent: 320, owner: null, level: 0 },
    { id: 27, name: "Cơ hội",     type: 'special', price: 0, rent: 0, owner: null, level: 0 },
    { id: 28, name: "Thanh Hóa",    type: 'land',    price: 3500, rent: 350, owner: null, level: 0 },
    { id: 29, name: "Sân bay",    type: 'special', price: 0, rent: 0, owner: null, level: 0 },

    // ==========================================
    // ➡️ CẠNH PHẢI (8 ô - Từ trên xuống dưới)
    // ==========================================
    { id: 30, name: "Điện Biên",    type: 'land',    price: 3800, rent: 380, owner: null, level: 0 },
    { id: 31, name: "Phú Quốc",    type: 'land',    price: 4000, rent: 400, owner: null, level: 0 },
    { id: 32, name: "Lào Cai",    type: 'land',    price: 4200, rent: 420, owner: null, level: 0 },
    { id: 33, name: "Bến xe miền Đông",  type: 'special', price: 0, rent: 0, owner: null, level: 0 },
    { id: 34, name: "Cao Bằng",    type: 'land',    price: 4500, rent: 450, owner: null, level: 0 },
    { id: 35, name: "Hà Nội",    type: 'land',    price: 4800, rent: 480, owner: null, level: 0 },
    { id: 36, name: "Thuế",    type: 'special', price: 0, rent: 0, owner: null, level: 0 },
    { id: 37, name: "Lạng Sơn",    type: 'land',    price: 5500, rent: 550, owner: null, level: 0 }
];

// TỰ ĐỘNG TÍNH TIỀN PHẠT CƠ BẢN (0 nhà = 25% giá đất)
boardData.forEach(cell => {
    if (cell.type === 'land') {
        cell.rent = cell.price * 0.25;
    }
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ==========================================
// 2. KHỞI TẠO BÀN CỜ (CẬP NHẬT GIAO DIỆN CỘT MỚI)
// ==========================================
function initBoard() {
    const cells = document.querySelectorAll('.cell');
    
    pathCoords.forEach((coord, index) => {
        const cellDOM = Array.from(cells).find(c => {
            const rMatch = c.style.gridRow.match(/\d+/);
            const cMatch = c.style.gridColumn.match(/\d+/);
            return rMatch && cMatch && parseInt(rMatch[0]) === coord.r && parseInt(cMatch[0]) === coord.c;
        });
        
        if (cellDOM) {
            cellDOM.dataset.index = index; 
            const cellData = boardData[index];

            // NẾU LÀ Ô ĐẤT -> Tự động chia layout có cột nhà
            if (cellData.type === 'land') {
                cellDOM.classList.add('land'); // Thêm class land để CSS nhận diện
                
                // Lấy tên gốc bạn đã gõ trong HTML (Cà Mau, Vĩnh Long...)
                const originalName = cellDOM.innerText.split('\n')[0].trim();
                
                // Ghi đè cấu trúc HTML bên trong ô đó
                cellDOM.innerHTML = `
                    <div class="cell-content">
                        <div class="main-info">
                            <span class="land-name">${originalName}</span>
                            <span class="land-price">${cellData.price}</span>
                        </div>
                        <div class="house-column">
                            <div class="house-cell"></div>
                            <div class="house-cell"></div>
                            <div class="house-cell"></div>
                            <div class="house-cell"></div>
                        </div>
                    </div>
                    <div class="token-area"></div>
                `;
            } 
            // NẾU LÀ Ô ĐẶC BIỆT (Xuất phát, Khí vận...) -> Giữ nguyên HTML của bạn
            else {
                const oldArea = cellDOM.querySelector('.token-area');
                if(oldArea) oldArea.remove();

                const tokenArea = document.createElement('div');
                tokenArea.className = 'token-area';
                cellDOM.appendChild(tokenArea);
            }
        }
    });

    players.forEach(drawPlayerToken);
    updateTurnUI();
}

// ==========================================
// 3. LOGIC VẼ QUÂN CỜ VÀ GIAO DIỆN
// ==========================================
function drawPlayerToken(player) {
    let token = document.getElementById(`token-p${player.id}`);
    if (!token) {
        token = document.createElement('div');
        token.id = `token-p${player.id}`;
        token.className = 'player-token';
        token.style.backgroundColor = player.color;
    }

    token.classList.remove('hop');
    void token.offsetWidth;
    token.classList.add('hop');

    const targetCellArea = document.querySelector(`.cell[data-index="${player.pos}"] .token-area`);
    if (targetCellArea) targetCellArea.appendChild(token);
}

function updateTurnUI() {
    const currentPlayer = players[currentPlayerIndex];
    const turnDisplay = document.getElementById('player-turn');
    turnDisplay.innerText = `Lượt: ${currentPlayer.name} (${currentPlayer.money})`;
    turnDisplay.style.color = currentPlayer.color;
}

// ==========================================
// 4. LOGIC MUA ĐẤT - XÂY NHÀ - NỘP PHẠT
// ==========================================

function getNextPlayerIndex() {
    let nextIdx = (currentPlayerIndex + 1) % players.length;
    // Bỏ qua những người đã phá sản
    while (players[nextIdx].isBankrupt) {
        nextIdx = (nextIdx + 1) % players.length;
        if (nextIdx === currentPlayerIndex) {
            alert("TRÒ CHƠI KẾT THÚC! Chỉ còn 1 người sống sót!");
            break;
        }
    }
    return nextIdx;
}

// HÀM HIỂN THỊ THÔNG BÁO TÙY CHỈNH
function showModal(title, message, type = 'alert', options = []) {
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');
        const btnContainer = document.getElementById('modal-buttons');

        // Cập nhật nội dung
        modalTitle.innerText = title;
        modalMessage.innerHTML = message; // Dùng innerHTML để có thể truyền thẻ <br> xuống dòng
        btnContainer.innerHTML = ''; // Xóa nút cũ

        modal.style.display = 'flex';

        if (type === 'confirm') {
            const btnYes = document.createElement('button');
            btnYes.className = 'btn-yes';
            btnYes.innerText = 'Đồng Ý';
            btnYes.onclick = () => { modal.style.display = 'none'; resolve(true); };

            const btnNo = document.createElement('button');
            btnNo.className = 'btn-no';
            btnNo.innerText = 'Bỏ Qua';
            btnNo.onclick = () => { modal.style.display = 'none'; resolve(false); };

            btnContainer.appendChild(btnYes);
            btnContainer.appendChild(btnNo);
        } else if(type === 'select') {
            // TẠO MENU THẢ XUỐNG CHO SỰ KIỆN
            let selectHTML = `<select id="modal-select" style="margin-top:15px; padding:10px; width:100%; border-radius:8px; border:1px solid #ccc; font-size:16px;">`;
            options.forEach(opt => {
                selectHTML += `<option value="${opt.id}">${opt.name}</option>`;
            });
            selectHTML += `</select>`;
            modalMessage.innerHTML += selectHTML;

            const btnOk = document.createElement('button');
            btnOk.className = 'btn-yes';
            btnOk.innerText = 'Tổ chức';
            btnOk.onclick = () => {
                const selectedValue = document.getElementById('modal-select').value;
                modal.style.display = 'none';
                resolve(parseInt(selectedValue));
            };
            btnContainer.appendChild(btnOk);
        } else {
            // Nút OK cho thông báo dạng Alert (Nộp phạt, Hết tiền...)
            const btnOk = document.createElement('button');
            btnOk.className = 'btn-ok';
            btnOk.innerText = 'Chấp nhận';
            btnOk.onclick = () => { modal.style.display = 'none'; resolve(true); };
            
            btnContainer.appendChild(btnOk);
        }
    });
}

// Mảng hệ số phạt tương ứng với số nhà: [0 nhà, 1 nhà, 2 nhà, 3 nhà, 4 nhà]
const rentMultipliers = [0.25, 0.5, 1.0, 1.5, 2.0];

// ==========================================
// HỆ THỐNG THANH TOÁN & PHÁ SẢN
// ==========================================
async function processPayment(debtor, amount, creditor = null) {
    // 1. Nếu đủ tiền mặt -> Trừ tiền luôn, kết thúc.
    if (debtor.money >= amount) {
        debtor.money -= amount;
        if (creditor) creditor.money += amount;
        return true; 
    }

    // 2. Không đủ tiền mặt -> Tính TỔNG TÀI SẢN (Tiền + Đất + Nhà)
    let totalPropertyAssets = 0;
    const ownedCells = boardData.filter(c => c.type === 'land' && c.owner === debtor.id);
    
    ownedCells.forEach(cell => {
        const housePrice = Math.floor(cell.price / 2);
        totalPropertyAssets += cell.price + (cell.level * housePrice);
    });

    const netWorth = debtor.money + totalPropertyAssets;

    // 3. XỬ LÝ PHÁ SẢN (Tổng tài sản < Nợ)
    if (netWorth < amount) {
        await showModal(
            'PHÁ SẢN! 💀', 
            `Tổng tài sản (${netWorth}) không đủ trả nợ (${amount}).<br>Bạn đã bị loại và bay ra đảo!`, 
            'alert'
        );
        
        debtor.isBankrupt = true;
        document.getElementById('game-log').innerText += `\n💀 ${debtor.name} đã PHÁ SẢN!`;

        // Trả nốt số tiền mặt cuối cùng cho chủ nợ (nếu có)
        if (creditor) creditor.money += debtor.money;
        debtor.money = 0;
        
        // Tịch thu toàn bộ sổ đỏ, reset đất về trạng thái vô chủ
        ownedCells.forEach(cell => {
            cell.owner = null;
            cell.level = 0;
            const cellDOM = document.querySelector(`.cell[data-index="${cell.id}"]`);
            if (cellDOM) {
                cellDOM.style.backgroundColor = "";
                cellDOM.style.border = "";
                cellDOM.querySelectorAll('.house-cell').forEach(h => h.classList.remove('bolded'));
            }
            // Nếu ô này đang có sự kiện, hủy sự kiện luôn
            if (activeEventCellId === cell.id) {
                activeEventCellId = null;
                document.querySelector(`.cell[data-index="${cell.id}"]`).classList.remove('event-active');
                const icon = document.querySelector(`.cell[data-index="${cell.id}"] .event-icon`);
                if(icon) icon.remove();
            }
        });

        // Đá quân cờ ra Đảo
        const token = document.getElementById(`token-p${debtor.id}`);
        token.classList.add('bankrupt');
        document.getElementById('island-tokens').appendChild(token);

        return false; // Thanh toán thất bại
    }

    // 4. CHƯA PHÁ SẢN NHƯNG THIẾU TIỀN MẶT -> ÉP BÁN TÀI SẢN
    await showModal('Cảnh báo! ⚠️', `Bạn thiếu ${amount - debtor.money}. Vui lòng bán bất động sản để trả nợ!`, 'alert');
    
    // Vòng lặp bán tài sản: Chạy đến khi nào tiền mặt đủ trả nợ
    while (debtor.money < amount && !debtor.isBankrupt) {
        for (let i = 0; i < boardData.length; i++) {
            if (debtor.money >= amount) break; // Đủ tiền rồi thì dừng lặp ngay

            const cell = boardData[i];
            if (cell.type === 'land' && cell.owner === debtor.id) {
                const housePrice = Math.floor(cell.price / 2);

                if (cell.level > 0) {
                    // CÓ NHÀ -> Hỏi bán nhà
                    const options = [{id: 0, name: 'Bỏ qua ô này'}];
                    for (let h = 1; h <= cell.level; h++) {
                        options.push({id: h, name: `Bán ${h} nhà (+${h * housePrice})`});
                    }
                    
                    const sellCount = await showModal(
                        'Siết Nợ Nhà 🏠',
                        `${cell.name} có ${cell.level} nhà.<br>Cần ${amount - debtor.money} nữa. Bạn muốn bán mấy nhà?`,
                        'select', options
                    );

                    if (sellCount > 0) {
                        cell.level -= sellCount;
                        debtor.money += sellCount * housePrice;
                        document.getElementById('game-log').innerText += `\n🏠 ${debtor.name} bán ${sellCount} nhà ở ${cell.name}.`;
                        
                        const cellDOM = document.querySelector(`.cell[data-index="${cell.id}"]`);
                        if (cellDOM) {
                            cellDOM.querySelectorAll('.house-cell').forEach((h, idx) => {
                                if (idx < cell.level) h.classList.add('bolded');
                                else h.classList.remove('bolded');
                            });
                        }
                    }
                } else {
                    // KHÔNG CÓ NHÀ -> Hỏi bán đất
                    const wantToSell = await showModal(
                        'Siết Nợ Đất 🌍',
                        `${cell.name} chưa có nhà.<br>Cần ${amount - debtor.money} nữa. Bán đất này lấy <b>${cell.price}</b>?`,
                        'confirm'
                    );

                    if (wantToSell) {
                        cell.owner = null;
                        debtor.money += cell.price;
                        document.getElementById('game-log').innerText += `\n🌍 ${debtor.name} bán đất ${cell.name}.`;
                        
                        const cellDOM = document.querySelector(`.cell[data-index="${cell.id}"]`);
                        if (cellDOM) {
                            cellDOM.style.backgroundColor = "";
                            cellDOM.style.border = "";
                        }
                        if (activeEventCellId === cell.id) {
                            activeEventCellId = null;
                            cellDOM.classList.remove('event-active');
                            const icon = cellDOM.querySelector('.event-icon');
                            if(icon) icon.remove();
                        }
                    }
                }
                updateTurnUI(); // Cập nhật tiền lên màn hình liên tục
            }
        }
    }

    // Sau khi vòng lặp kết thúc, trừ tiền nợ
    debtor.money -= amount;
    if (creditor) creditor.money += amount;
    updateTurnUI();
    return true;
}

async function handleCellAction(player) {
    const cell = boardData[player.pos];
    const logDisplay = document.getElementById('game-log');
    const cellDOM = document.querySelector(`.cell[data-index="${player.pos}"]`);

    if (cell.id === 10) { // Ô ID 10 là ô TÙ
        player.inJail = true;
        await showModal('Vào Tù!', 'Bạn đã bị bắt vào tù! ⛓️<br>Lượt sau phải đổ đôi hoặc trả 500 để ra ngoài.', 'alert');
        logDisplay.innerText += `\n🚨 ${player.name} đã bị bắt vào tù!`;
        return; // Dừng xử lý các sự kiện khác
    }

    // --- TÍNH NĂNG TỔ CHỨC SỰ KIỆN (ID 19) ---
    if (cell.id === 19) {
        // Lọc ra các ô đất mà người chơi này đang sở hữu
        const playerLands = boardData.filter(c => c.type === 'land' && c.owner === player.id);
        
        if (playerLands.length === 0) {
            await showModal('Sự kiện', 'Bạn dẫm vào ô Tổ chức Sự kiện, nhưng bạn chưa có mảnh đất nào để tổ chức!', 'alert');
        } else {
            const selectedLandId = await showModal(
                'Tổ Chức Sự Kiện 🎉', 
                'Chọn một khu đất của bạn để tổ chức lễ hội!<br>Tiền phạt tại ô đó sẽ <b>tăng 100% (x2)</b>.', 
                'select', 
                playerLands
            );

            if (selectedLandId !== undefined && selectedLandId !== null) {
                // Xóa hiệu ứng sự kiện ở ô cũ (nếu đang có)
                if (activeEventCellId !== null) {
                    const oldEventCellDOM = document.querySelector(`.cell[data-index="${activeEventCellId}"]`);
                    if (oldEventCellDOM) {
                        oldEventCellDOM.classList.remove('event-active');
                        const oldIcon = oldEventCellDOM.querySelector('.event-icon');
                        if (oldIcon) oldIcon.remove();
                    }
                }

                // Cập nhật sự kiện mới
                activeEventCellId = selectedLandId;
                const newEventLand = boardData.find(l => l.id === selectedLandId);
                const newEventCellDOM = document.querySelector(`.cell[data-index="${selectedLandId}"]`);
                
                if (newEventCellDOM) {
                    newEventCellDOM.classList.add('event-active');
                    const icon = document.createElement('div');
                    icon.className = 'event-icon';
                    icon.innerText = '🎉';
                    newEventCellDOM.appendChild(icon);
                }
                
                await showModal('Thành công', `Sự kiện đang diễn ra tại <b>${newEventLand.name}</b>!<br>Ai dẫm vào sẽ nộp phạt sấp mặt!`, 'alert');
                logDisplay.innerText += `\n🎉 ${player.name} mở sự kiện tại ${newEventLand.name}!`;
            }
        }
        return;
    }

    // --- TÍNH NĂNG SÂN BAY (ID 29) ---
    if (cell.id === 29) {
        logDisplay.innerText += `\n✈️ ${player.name} đã đến Sân bay. Chờ chuyến bay vào lượt sau!`;
        await showModal(
            'Đến Sân Bay ✈️', 
            'Bạn đang ở phòng chờ VIP!<br>Ở lượt tiếp theo, bạn có quyền chọn mua vé máy bay thay vì đổ xúc xắc.', 
            'alert'
        );
        return; // Kết thúc hành động của ô này
    }

    // --- TÍNH NĂNG BÃI ĐỖ XE (ID 12) ---
    if (cell.id === 12) {
        const parkingFee = 500;
        await showModal('Bãi Đỗ Xe 🅿️', `Bạn phải trả <b>$${parkingFee}</b> tiền phí gửi xe!`, 'alert');
        
        // Gọi hàm processPayment (không truyền chủ nợ nên tiền sẽ nộp cho hệ thống)
        const paid = await processPayment(player, parkingFee);
        if (paid) {
            logDisplay.innerText += `\n🅿️ ${player.name} đã nộp $${parkingFee} phí đỗ xe.`;
        }
        return; // Kết thúc xử lý
    }

    // --- TÍNH NĂNG ĐÓNG THUẾ (ID 36) ---
    if (cell.id === 36) {
        // 1. Tính tổng tài sản (chỉ tính đất và nhà, không tính tiền mặt hiện có)
        let totalPropertyAssets = 0;
        const ownedCells = boardData.filter(c => c.type === 'land' && c.owner === player.id);
        
        ownedCells.forEach(c => {
            const housePrice = Math.floor(c.price / 2);
            totalPropertyAssets += c.price + (c.level * housePrice);
        });

        // 2. Xét trường hợp vô sản (chưa mua gì)
        if (totalPropertyAssets === 0) {
            await showModal('Đóng Thuế 💸', 'Bạn chưa sở hữu bất động sản nào nên được miễn thuế! 🎉', 'alert');
            logDisplay.innerText += `\n💸 ${player.name} được miễn thuế vì chưa có tài sản.`;
        } else {
            // 3. Tính thuế 10%
            const taxAmount = Math.floor(totalPropertyAssets * 0.1); 
            
            await showModal(
                'Cục Thuế Bất Động Sản 💸', 
                `Tổng giá trị đất và nhà của bạn là: <b>${totalPropertyAssets}</b>.<br>Bạn phải nộp 10% thuế: <b style="color:red">-${taxAmount}</b>!`, 
                'alert'
            );
            
            // Ép thanh toán thuế
            const paid = await processPayment(player, taxAmount);
            if (paid) {
                logDisplay.innerText += `\n💸 ${player.name} đã nộp ${taxAmount} tiền thuế.`;
            }
        }
        return; // Kết thúc xử lý
    }

    
    // Nếu là ô đặc biệt (Xuất phát, Vào tù,...)
    if (cell.type === 'special') {
        logDisplay.innerText += `\n📍 Đứng vào ô sự kiện đặc biệt!`;
        return;
    }

    // 1. ĐẤT CHƯA CÓ CHỦ -> HỎI MUA
    if (cell.owner === null) {
        // GỌI HÀM SHOW MODAL THAY CHO CONFIRM
        const wantToBuy = await showModal(
            `Mua ${cell.name}?`, 
            `Bạn hiện có <b>${player.money}</b> <br> Giá mua: <b>${cell.price}</b><br>Tiền phạt cơ bản: <b>${cell.rent}</b>`, 
            'confirm'
        );
        
        if (wantToBuy) {
            if (player.money >= cell.price) {
                player.money -= cell.price;
                cell.owner = player.id;
                
                if (cellDOM) {
                    cellDOM.style.backgroundColor = player.color + "66";
                    cellDOM.style.border = `2px solid ${player.color}`;
                }
                logDisplay.innerText += `\n🏠 ${player.name} đã mua ${cell.name}!`;
            } else {
                await showModal('Thất bại', 'Bạn không đủ tiền để mua mảnh đất này!', 'alert');
            }
        }
    } 
    // 2. ĐẤT CỦA MÌNH -> HỎI XÂY NHÀ
    else if (cell.owner === player.id) {
        if (cell.level < 4) {
            const housePrice = Math.floor(cell.price / 2);
            const wantToBuild = await showModal(
                `Xây nhà tại ${cell.name}?`, 
                `Đất đang có ${cell.level} nhà.<br>Xây thêm nhà thứ ${cell.level + 1} giá: <b>${housePrice}</b>?`, 
                'confirm'
            );
            
            if (wantToBuild && player.money >= housePrice) {
                player.money -= housePrice;
                cell.level++;
                cell.rent = cell.price * rentMultipliers[cell.level];
                
                // CẬP NHẬT GIAO DIỆN TÔ MÀU CỘT NHÀ MỚI
                if (cellDOM) {
                    const houseCells = cellDOM.querySelectorAll('.house-cell');
                    houseCells.forEach((house, i) => {
                        // Nếu vị trí ô (i) nhỏ hơn số nhà hiện có (level), thì tô đậm nó!
                        if (i < cell.level) {
                            house.classList.add('bolded');
                        } else {
                            house.classList.remove('bolded');
                        }
                    });
                }
                logDisplay.innerText += `\n🏗️ ${player.name} xây nhà! Phạt mức mới: ${cell.rent}.`;
            } else if (wantToBuild && player.money < housePrice) {
                await showModal('Thất bại', 'Không đủ tiền xây nhà!', 'alert');
            }
        } else {
            await showModal('Thông báo', 'Khu đất này đã xây tối đa 4 nhà (Khách sạn).', 'alert');
        }
    }
    // 3. ĐẤT CỦA NGƯỜI KHÁC -> NỘP PHẠT
    else {
        const owner = players.find(p => p.id === cell.owner);
        let currentRent = cell.price * rentMultipliers[cell.level];

        // KIỂM TRA SỰ KIỆN TẠI Ô NÀY (Tăng 100% nghĩa là nhân 2)
        const isEventActive = (activeEventCellId === cell.id);
        if (isEventActive) {
            currentRent = currentRent * 2; 
        }
        
        // KIỂM TRA XEM CHỦ ĐẤT CÓ ĐANG Ở TÙ KHÔNG
        if(owner.inJail) {
            await showModal(
                'Thoát nạn! 🎉', 
                `Bạn đạp trúng ${cell.name} của <b>${owner.name}</b>.<br>Nhưng do chủ đất đang "bóc lịch" trong tù nên bạn được miễn tiền phạt!`, 
                'alert'
            );
            logDisplay.innerText += `\n🎉 ${player.name} thoát được ${currentRent} tiền phạt vì ${owner.name} đang ở tù!`;
        } else {
            // NẾU CHỦ ĐẤT TỰ DO THÌ NỘP PHẠT BÌNH THƯỜNG
            let message = `Bạn đạp trúng ${cell.name} của <b>${owner.name}</b>!`;
            if (isEventActive) message += `<br><b style="color:#d63031">🔥 ĐANG CÓ SỰ KIỆN! PHẠT x2! 🔥</b>`;
            message += `<br>Mức phạt: <b>${currentRent}</b>.`;

            await showModal('Nộp phạt!', message, 'alert');
            
            const paid = await processPayment(player, currentRent, owner);
            if (paid) {
                logDisplay.innerText += `\n💸 ${player.name} nộp phạt ${currentRent} cho ${owner.name}!`;
            }
        }
    }
}

// ==========================================
// 5. DI CHUYỂN & VÒNG LẶP LƯỢT CHƠI
// ==========================================
async function moveTokenStepByStep(player, steps) {
    const rollBtn = document.getElementById('roll-dice-btn');
    const logDisplay = document.getElementById('game-log');
    
    rollBtn.disabled = true;
    rollBtn.style.opacity = '0.5';

    for (let i = 0; i < steps; i++) {
        player.pos = (player.pos + 1) % 38;
        drawPlayerToken(player);
        
        if (player.pos === 0) {
            player.money += 2000;
            updateTurnUI();
            logDisplay.innerText = `🎉 ${player.name} đi qua Xuất Phát! Nhận 2000.`;
        }
        await sleep(250); 
    }
    
    // Đợi quân cờ đứng vững 100ms rồi mới kích hoạt sự kiện ô
    await sleep(100);
    await handleCellAction(player);

    rollBtn.disabled = false;
    rollBtn.style.opacity = '1';
}

// ==========================================
// 6. XỬ LÝ SỰ KIỆN ĐỔ XÚC XẮC & LƯỢT CHƠI
// ==========================================
document.getElementById('roll-dice-btn').addEventListener('click', async () => {
    const player = players[currentPlayerIndex];
    const logDisplay = document.getElementById('game-log');
    
    // --- 1. KIỂM TRA NẾU ĐANG Ở TÙ ---
    if (player.inJail) {
        const payToEscape = await showModal(
            'Đang Ở Tù ⛓️',
            `Bạn có muốn nộp <b>500</b> để ra tù ngay lập tức không?<br>Tiền hiện tại: ${player.money}`,
            'confirm'
        );

        if (payToEscape) {
            // Thay vì trừ tiền trực tiếp, dùng processPayment
            const paid = await processPayment(player, 500);
            if (paid) {
                player.inJail = false;
                await showModal('Thành công', 'Đã nộp 500. Bạn được tự do đổ xúc xắc!', 'alert');
                logDisplay.innerText += `\n💸 ${player.name} nộp 500 ra tù.`;
            } else {
                // Nếu không nộp được (vì phá sản luôn), thì kết thúc lượt
                currentPlayerIndex = getNextPlayerIndex();
                updateTurnUI();
                return;
            }
        }
    }

    // --- 1.5 KIỂM TRA NẾU ĐANG ĐỨNG Ở SÂN BAY (ID 29) ---
    if (player.pos === 29 && !player.inJail) {
        const flightCost = 500; // Giá vé máy bay
        
        // Lọc danh sách đất vô chủ
        const destinationOptions = boardData
            .filter(c => c.type === 'land' && c.owner === null || c.owner === player.id)
            .map(c => ({ id: c.id, name: c.name }));

        if (destinationOptions.length > 0) {
            const wantToFly = await showModal(
                'Cất Cánh ✈️', 
                `Bạn đang ở Sân bay. Bạn có muốn bỏ lượt đổ xúc xắc và chi <b>$${flightCost}</b> bay đến một khu đất trống không?`, 
                'confirm'
            );

            if (wantToFly) {
                if (player.money >= flightCost) {
                    const targetCellId = await showModal(
                        'Chọn Chuyến Bay 🌍', 
                        'Hành khách vui lòng chọn điểm đến:', 
                        'select', 
                        destinationOptions
                    );

                    if (targetCellId !== undefined && targetCellId !== null) {
                        const targetCell = boardData.find(c => c.id === targetCellId);
                        
                        // Trừ tiền vé
                        player.money -= flightCost;
                        updateTurnUI();
                        logDisplay.innerText = `✈️ ${player.name} chi ${flightCost} bay thẳng đến ${targetCell.name}.`;

                        // Logic vạch xuất phát
                        if (targetCellId < 29) {
                            player.money += 2000;
                            logDisplay.innerText += `\n🎉 Bay ngang qua Xuất Phát! Nhận thưởng 2000.`;
                            updateTurnUI(); 
                        }

                        // Dịch chuyển quân cờ
                        player.pos = targetCellId;
                        drawPlayerToken(player);
                        
                        await sleep(200);
                        await handleCellAction(player); // Tự động gọi hàm hỏi mua đất
                        
                        // ĐÃ BAY THÌ KHÔNG ĐỔ XÚC XẮC NỮA -> CHUYỂN LƯỢT LUÔN
                        currentPlayerIndex = getNextPlayerIndex();
                        updateTurnUI();
                        return; // 🛑 Lệnh return này rất quan trọng để dừng việc đổ xúc xắc bên dưới!
                    }
                } else {
                    await showModal('Hết tiền! 🚫', `Bạn chỉ có $${player.money}, không đủ $${flightCost} mua vé. Phải đi bộ thôi!`, 'alert');
                }
            }
        } else {
             // Đất đã bán hết
             await showModal('Thông báo', 'Tất cả các khu đất đều đã có chủ. Sân bay tạm ngưng phục vụ!', 'alert');
        }
    }

    // --- 2. ĐỔ XÚC XẮC & TẠO HIỆU ỨNG ---
    const rollBtn = document.getElementById('roll-dice-btn');
    rollBtn.disabled = true; // Khóa nút bấm trong lúc đang lắc xúc xắc

    // Tính toán kết quả thật
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const total = dice1 + dice2;

    // Mảng chứa các mặt xúc xắc Unicode (vị trí 1 đến 6)
    const diceFaces = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    const diceResultDOM = document.getElementById('dice-result');

    logDisplay.innerText = `🎲 Đang đổ xúc xắc...`;

    // CHẠY HIỆU ỨNG LẮC (Thay đổi mặt liên tục mỗi 100ms)
    const rollInterval = setInterval(() => {
        const r1 = Math.floor(Math.random() * 6) + 1;
        const r2 = Math.floor(Math.random() * 6) + 1;
        diceResultDOM.innerHTML = `
            <div class="dice-wrapper">
                <div class="dice-icon rolling">${diceFaces[r1]}</div>
                <div class="dice-icon rolling">${diceFaces[r2]}</div>
            </div>
        `;
    }, 100);

    // Chờ 1 giây để người chơi xem hiệu ứng lắc
    await sleep(1000); 
    clearInterval(rollInterval);

    // HIỂN THỊ KẾT QUẢ THẬT
    diceResultDOM.innerHTML = `
        <div class="dice-wrapper">
            <div class="dice-icon" style="transform: scale(1.15);">${diceFaces[dice1]}</div>
            <div class="dice-icon" style="transform: scale(1.15);">${diceFaces[dice2]}</div>
        </div>
        <div class="dice-total">Kết quả: ${total} bước</div>
    `;
    
    // Đợi thêm nửa giây để người chơi nhìn rõ số rồi mới đi/xét ở tù
    await sleep(500);

    // --- 3. XỬ LÝ KẾT QUẢ ĐỔ NẾU VẪN CÒN Ở TÙ ---
    if (player.inJail) {
        if (dice1 === dice2) {
            player.inJail = false;
            logDisplay.innerText = `🔥 Đổ được đôi! ${player.name} vượt ngục thành công!`;
            await showModal('Vượt Ngục!', `Bạn đã đổ được đôi (${dice1}-${dice2}). Bạn được tự do đi ${total} bước!`, 'alert');
            
            await moveTokenStepByStep(player, total);
        } else {
            logDisplay.innerText = `❌ ${dice1} và ${dice2} không phải đôi. ${player.name} tiếp tục ở tù.`;
            await showModal('Xui xẻo', `Bạn đổ ra ${dice1} và ${dice2}. Chờ lượt sau nhé!`, 'alert');
        }
        
        // Hết lượt ở tù (dù ra được hay không thì đổ xong là mất lượt)
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        updateTurnUI();
        rollBtn.disabled = false;
        return; // Kết thúc hành động của nút đổ xúc xắc tại đây
    }

    // --- 4. DI CHUYỂN BÌNH THƯỜNG (Nếu không ở tù) ---
    logDisplay.innerText = `Đang di chuyển ${total} bước...`;

    // Chờ đi xong & xử lý sự kiện mua đất/nộp phạt
    await moveTokenStepByStep(player, total);

    // Xử lý chuyển lượt
    if (dice1 !== dice2) {
        currentPlayerIndex = getNextPlayerIndex();
        logDisplay.innerText += `\nKết thúc lượt.`;
    } else {
        logDisplay.innerText += `\n🔥 Đổ được đôi! ${player.name} được đi tiếp.`;
    }

    updateTurnUI();
    rollBtn.disabled = false;
});

window.onload = () => {
    // Chỉ bật Lobby lên trước, không vẽ bàn cờ ngay
    initLobby(); 
};

// ==========================================
// 🛠️ HÀM CHEAT ĐỂ TEST NHANH (Gõ testGame() vào tab Console F12)
// ==========================================
window.testGame = async function() {
    const p1 = players[0]; // Người chơi 1
    const p2 = players[1]; // Người chơi 2

    // 1. Tặng P1 một mảnh đất đắt tiền (Ví dụ: Hà Nội - ID 35) & Xây sẵn nhà
    const testLand = boardData[35];
    testLand.owner = p1.id;
    testLand.level = 2;
    testLand.rent = testLand.price * rentMultipliers[3];
    
    // Tô màu đất cho P1
    const landDOM = document.querySelector(`.cell[data-index="35"]`);
    if(landDOM) {
        landDOM.style.backgroundColor = p1.color + "66";
        landDOM.style.border = `2px solid ${p1.color}`;
        landDOM.querySelectorAll('.house-cell').forEach((h, i) => {
            if (i < testLand.level) h.classList.add('bolded');
        });
    }

    // 2. Tặng P2 một mảnh đất rẻ (Cà Mau - ID 1) để lỡ có thiếu tiền thì hệ thống ép bán mảnh này
    boardData[1].owner = p2.id;
    const cheapLandDOM = document.querySelector(`.cell[data-index="1"]`);
    if(cheapLandDOM) cheapLandDOM.style.backgroundColor = p2.color + "66";

    // Ép P2 nghèo đi (chỉ còn $1000) để test vụ siết nợ
    p2.money = 1000;

    // 3. Dịch chuyển P1 vào ô Tổ Chức Sự Kiện (ID 19)
    p1.pos = 19;
    drawPlayerToken(p1);
    currentPlayerIndex = 0; // Đổi lượt về P1
    updateTurnUI();
    
    // Gọi hàm xử lý ô cho P1 (Nó sẽ hiện bảng hỏi tổ chức sự kiện ở đâu)
    // Lưu ý: Lúc này bạn nhớ CHỌN TỔ CHỨC Ở HÀ NỘI nhé!
    await handleCellAction(p1); 

    // 4. NGAY SAU KHI P1 TỔ CHỨC XONG -> DỊCH CHUYỂN P2 VÀO HÀ NỘI (ID 35)
    p2.pos = 35;
    drawPlayerToken(p2);
    currentPlayerIndex = 1; // Đổi lượt về P2
    updateTurnUI();

    // Khởi động án tử cho P2 (Chạy hàm nộp phạt)
    await handleCellAction(p2);
};

// ==========================================
// ✈️ HÀM CHEAT ĐỂ TEST SÂN BAY (Gõ testAirport() vào Console)
// ==========================================
window.testAirport = async function() {
    const p1 = players[0]; // Lấy người chơi 1
    const p2 = players[1]; // Người chơi 2
    
    // 1. Tặng P1 một mảnh đất đắt tiền (Ví dụ: Hà Nội - ID 35) & Xây sẵn nhà
    const testLand = boardData[35];
    testLand.owner = p1.id;
    testLand.level = 2;
    testLand.rent = testLand.price * rentMultipliers[3];
    
    // Tô màu đất cho P1
    const landDOM = document.querySelector(`.cell[data-index="35"]`);
    if(landDOM) {
        landDOM.style.backgroundColor = p1.color + "66";
        landDOM.style.border = `2px solid ${p1.color}`;
        landDOM.querySelectorAll('.house-cell').forEach((h, i) => {
            if (i < testLand.level) h.classList.add('bolded');
        });
    }

    // 2. Tặng P2 một mảnh đất rẻ (Cà Mau - ID 1) để lỡ có thiếu tiền thì hệ thống ép bán mảnh này
    boardData[1].owner = p2.id;
    const cheapLandDOM = document.querySelector(`.cell[data-index="1"]`);
    if(cheapLandDOM) cheapLandDOM.style.backgroundColor = p2.color + "66";

    p1.pos = 29;
    drawPlayerToken(p1);
};

// ==========================================
// 💸 HÀM CHEAT ĐỂ TEST ĐÓNG THUẾ (Gõ testTax() vào Console)
// ==========================================
window.testTax = async function() {
    const p1 = players[0]; 
    
    // Tặng P1 Hà Nội (ID 35, giá 4800) + 4 nhà (Mỗi nhà 2400 -> Tổng nhà 9600)
    // Tổng giá trị tài sản ô này = 4800 + 9600 = 14400. Thuế 10% sẽ là 1440.
    const land = boardData[35];
    land.owner = p1.id;
    land.level = 4;

    const land1 = boardData[34];
    land1.owner = p1.id;
    land1.level = 0;
    
    // Tô màu cho vui mắt
    const landDOM = document.querySelector(`.cell[data-index="35"]`);
    if(landDOM) {
        landDOM.style.backgroundColor = p1.color + "66";
        landDOM.querySelectorAll('.house-cell').forEach(h => h.classList.add('bolded'));
    }
    const landDOM1 = document.querySelector(`.cell[data-index="34"]`);
    if(landDOM1) {
        landDOM1.style.backgroundColor = p1.color + "66";
    }

    // Set tiền P1 xuống thấp (ví dụ 1000) để test xem đóng thuế 1440 có bị ép bán nhà không
    p1.money = 1000;
    
    // Dịch chuyển đến ô Thuế (ID 36)
    p1.pos = 36;
    currentPlayerIndex = 0;
    drawPlayerToken(p1);
    updateTurnUI();
    
    // Kích hoạt ô Thuế
    await handleCellAction(p1);
};