// 監聽特殊條件選擇
document.getElementById('hbsag_special').addEventListener('change', checkSpecialCondition);
document.getElementById('antihbc').addEventListener('change', checkSpecialCondition);

function checkSpecialCondition() {
    const hbsag = document.getElementById('hbsag_special').value;
    const antihbc = document.getElementById('antihbc').value;
    const section = document.getElementById('hbsag_neg_antihbc_pos_conditions');

    if (hbsag === 'negative' && antihbc === 'positive') {
        section.style.display = 'block';
    } else {
        section.style.display = 'none';
    }
}

// 檢核邏輯
function checkEligibility() {
    let eligible = false;

    // 一般條件（範例：HBsAg 陽性）
    if (document.getElementById('hbsag').value === 'positive') {
        eligible = true;
    }

    // 特殊條件檢核
    if (document.getElementById('hbsag_special').value === 'negative' &&
        document.getElementById('antihbc').value === 'positive') {

        if (
            document.getElementById('non_liver_transplant_pre7').checked ||
            document.getElementById('chemo_hbv_reactivation').checked ||
            document.getElementById('liver_transplant_prophylaxis').checked ||
            document.getElementById('chemo_prevention').checked
        ) {
            eligible = true;
        }
    }

    const resultBox = document.getElementById('result');
    if (eligible) {
        resultBox.textContent = "✅ 符合健保給付條件";
        resultBox.className = "section pass";
    } else {
        resultBox.textContent = "❌ 不符合健保給付條件";
        resultBox.className = "section fail";
    }
}
