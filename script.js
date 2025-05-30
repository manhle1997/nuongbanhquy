const mainSwitch = document.getElementById('mainSwitch');
const arm = document.getElementById('arm');
const lid = document.getElementById('lid');
const uselessBox = document.getElementById('uselessBox'); // Cho hiệu ứng rung lắc (tùy chọn)

// Các phần tử mới cho khuôn mặt và thoại
const eyesElement = document.querySelector('.eyes');
const mouthElement = document.querySelector('.mouth');
const dialogueBubbleElement = document.getElementById('dialogueBubble');
const dialogueTextElement = document.getElementById('dialogueText');

let isAnimating = false; // Cờ để ngăn kích hoạt lại khi đang chạy animation

// --- Các câu thoại dễ thương ---
const dialogues = {
    onFlip: ["Hửm? :o", "Lại chơi hảaa?", "Hihi, thử đi!", "Uwaaa!"],
    armActive: ["Để tớ!", "Xem nè! ✨", "Vèo~"],
    switchOff: ["Xong! >ω<", "Dễ ẹc!", "Tớ thắng! Yay!", "Hihihi!"],
    idle: ["...", "Chơi với tớ đi...", "Buồn ngủ quá... zzz"]
};

// --- Hàm tiện ích ---
function getRandomDialogue(type) {
    const Dtype = dialogues[type] || dialogues.idle;
    return Dtype[Math.floor(Math.random() * Dtype.length)];
}

function setExpression(eyeClass = '', mouthClass = '') {
    // Reset classes, giữ lại class cơ bản
    eyesElement.className = 'eyes';
    if (eyeClass) eyesElement.classList.add(eyeClass);

    mouthElement.className = 'mouth';
    if (mouthClass) mouthElement.classList.add(mouthClass);
}

let dialogueTimeout; // Để quản lý timeout của bong bóng thoại
function showDialogue(text, duration = 2500) {
    clearTimeout(dialogueTimeout); // Xóa timeout cũ nếu có
    dialogueTextElement.textContent = text;
    dialogueBubbleElement.classList.add('show');

    if (duration > 0) {
        dialogueTimeout = setTimeout(() => {
            dialogueBubbleElement.classList.remove('show');
        }, duration);
    }
}

function hideDialogue() {
    clearTimeout(dialogueTimeout);
    dialogueBubbleElement.classList.remove('show');
}

// --- Logic chính ---
mainSwitch.addEventListener('change', function() {
    if (this.checked) {
        // Công tắc vừa được BẬT
        if (isAnimating) {
            this.checked = false;
            return;
        }
        isAnimating = true;
        console.log("Công tắc BẬT! Bắt đầu chuỗi hành động.");

        setExpression('surprised', 'ooh');
        showDialogue(getRandomDialogue('onFlip'));

        // 1. Mở nắp (CSS transition cho lid là 0.4s)
        lid.classList.add('open');

        // Đợi nắp mở xong rồi mới cho tay ra
        setTimeout(() => {
            setExpression('focused', ''); // Miệng có thể giữ nguyên hoặc thay đổi
            showDialogue(getRandomDialogue('armActive'), 1500); // Thời gian thoại ngắn hơn
            // 2. Cánh tay vươn ra (CSS transition cho arm là 0.3s)
            arm.classList.add('active');

            // Đợi tay vươn ra xong rồi mới tắt công tắc
            setTimeout(() => {
                // 3. Cánh tay tắt công tắc
                mainSwitch.checked = false;
                setExpression('closed', 'smile'); // Nhắm mắt cười khi thành công
                showDialogue(getRandomDialogue('switchOff'));

                // (Tùy chọn) Hộp rung lắc nhẹ
                // randomBoxShake();

                // Đợi một chút để thấy công tắc đã bị tắt, rồi mới rút tay
                setTimeout(() => {
                    // 4. Cánh tay rút lại (CSS transition cho arm là 0.3s)
                    arm.classList.remove('active');

                    // Đợi tay rút vào xong rồi mới đóng nắp
                    setTimeout(() => {
                        // 5. Đóng nắp (CSS transition cho lid là 0.4s)
                        lid.classList.remove('open');
                        setExpression('', ''); // Trở về mặc định khi đóng nắp

                        // Đợi nắp đóng xong, hoàn tất chuỗi animation
                        setTimeout(() => {
                            isAnimating = false;
                            hideDialogue(); // Ẩn thoại khi kết thúc chuỗi
                            console.log("Chuỗi hành động HOÀN TẤT.");

                            // Thoại chờ sau một lúc
                            setTimeout(() => {
                                if (!mainSwitch.checked && !isAnimating) {
                                    showDialogue(getRandomDialogue('idle'));
                                    // Thêm hiệu ứng nháy mắt
                                    setExpression('closed','');
                                    setTimeout(() => setExpression('',''), 300); // Mở mắt sau 0.3s
                                }
                            }, 2500); // Hiện thoại chờ sau 2.5s

                        }, 400); // Thời gian khớp với transition đóng nắp

                    }, 300 + 50); // Thời gian khớp với transition rút tay + chút xíu

                }, 300); // Thời gian ngắn để thấy công tắc đã tắt

            }, 300 + 200); // Thời gian tay vươn ra (300ms) + một chút trì hoãn (200ms)

        }, 400); // Thời gian khớp với transition mở nắp

    } else {
        // Công tắc bị TẮT
        if (!isAnimating) {
            console.log("Công tắc TẮT (bởi người dùng hoặc đã hoàn tất).");
            hideDialogue();
            setExpression('', ''); // Reset biểu cảm về mặc định
        }
    }
});

// Khởi tạo trạng thái ban đầu
setExpression('', ''); // Mắt mở, miệng thường (mặc định)
setTimeout(() => { // Hiển thị thoại chờ ban đầu
    if (!mainSwitch.checked && !isAnimating) { // Chỉ hiện khi không có gì xảy ra
         showDialogue(getRandomDialogue('idle'));
    }
}, 2000); // Hiện sau 2 giây

// (Tùy chọn) Hàm làm cho hộp rung lắc một chút
function randomBoxShake() {
    uselessBox.style.transition = 'transform 0.1s ease-in-out';
    const randomX = (Math.random() - 0.5) * 6; // Giảm độ rung
    const randomY = (Math.random() - 0.5) * 6;
    uselessBox.style.transform = `translate(${randomX}px, ${randomY}px)`;

    setTimeout(() => {
        uselessBox.style.transform = 'translate(0, 0)';
    }, 100);
}