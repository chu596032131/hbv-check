document.addEventListener('DOMContentLoaded', function() {
    // 獲取DOM元素
    const hepatitisForm = document.getElementById('hepatitisForm');
    const checkButton = document.getElementById('checkButton');
    const resultSection = document.getElementById('resultSection');
    const resultContent = document.getElementById('resultContent');
    const backButton = document.getElementById('backButton');
    const pregnancyCheckbox = document.getElementById('pregnancy');
    const pregnancyWeekGroup = document.getElementById('pregnancy_week_group');

    // 顯示/隱藏懷孕週數輸入框
    pregnancyCheckbox.addEventListener('change', function() {
        pregnancyWeekGroup.style.display = this.checked ? 'block' : 'none';
    });
    
    // 性別選擇事件 - 自動設置ALT正常值上限
    document.getElementById('gender').addEventListener('change', function() {
        const gender = this.value;
        if (gender === 'male') {
            document.getElementById('alt_upper_limit').value = 50; // 男性正常值上限為50U/L
        } else if (gender === 'female') {
            document.getElementById('alt_upper_limit').value = 35; // 女性正常值上限為35U/L
        }
    });
    
    // 自動計算FIB-4值的事件監聽器
    function calculateFIB4() {
        const birthdate = document.getElementById('birthdate').value;
        const alt = parseFloat(document.getElementById('alt').value) || 0;
        const ast = parseFloat(document.getElementById('ast').value) || 0;
        const platelets = parseFloat(document.getElementById('platelets').value) || 0;
        
        // 計算年齡
        let age = 0;
        if (birthdate) {
            const today = new Date();
            const birthDate = new Date(birthdate);
            age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
        }
        
        // 計算FIB-4值
        if (age > 0 && ast > 0 && platelets > 0 && alt > 0) {
            // FIB-4 = age [years] x AST [U/L]/(platelet [10^9/L] x (ALT [U/L])^(1/2))
            const fib4Value = (age * ast) / (platelets * Math.sqrt(alt));
            document.getElementById('fib4_value').value = fib4Value.toFixed(2);
        }
    }
    
    // 為相關輸入欄位添加事件監聽器
    document.getElementById('birthdate').addEventListener('change', calculateFIB4);
    document.getElementById('alt').addEventListener('input', calculateFIB4);
    document.getElementById('ast').addEventListener('input', calculateFIB4);
    document.getElementById('platelets').addEventListener('input', calculateFIB4);

    // 檢查資格按鈕點擊事件
    checkButton.addEventListener('click', function() {
        const formData = getFormData();
        const eligibilityResults = checkEligibility(formData);
        
        // 添加FIB-4判讀結果
        if (formData.fib4_value > 0) {
            const fib4Interpretation = interpretFIB4(formData.fib4_value);
            const fib4Result = {
                condition: 'FIB-4肝纖維化指數評估',
                eligible: true,
                reason: `FIB-4值: ${formData.fib4_value.toFixed(2)} - ${fib4Interpretation.result}\n${fib4Interpretation.description}`
            };
            eligibilityResults.unshift(fib4Result);
        }
        
        displayResults(eligibilityResults);
        hepatitisForm.style.display = 'none';
        resultSection.style.display = 'block';
    });

    // 返回修改按鈕點擊事件
    backButton.addEventListener('click', function() {
        resultSection.style.display = 'none';
        hepatitisForm.style.display = 'block';
    });

    // 已移除PDF生成功能

    // 獲取表單數據
    function getFormData() {
        // 根據性別設置ALT正常值上限
        const gender = document.getElementById('gender').value;
        let defaultAltUpperLimit = 40;
        if (gender === 'male') {
            defaultAltUpperLimit = 50; // 男性正常值上限為50U/L
            document.getElementById('alt_upper_limit').value = 50;
        } else if (gender === 'female') {
            defaultAltUpperLimit = 35; // 女性正常值上限為35U/L
            document.getElementById('alt_upper_limit').value = 35;
        }
        
        // 獲取基本數據
        const birthdate = document.getElementById('birthdate').value;
        const alt = parseFloat(document.getElementById('alt').value) || 0;
        const ast = parseFloat(document.getElementById('ast').value) || 0;
        const platelets = parseFloat(document.getElementById('platelets').value) || 0;
        
        // 計算年齡
        let age = 0;
        if (birthdate) {
            const today = new Date();
            const birthDate = new Date(birthdate);
            age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
        }
        
        // 計算FIB-4值
        let fib4Value = 0;
        if (age > 0 && ast > 0 && platelets > 0 && alt > 0) {
            // FIB-4 = age [years] x AST [U/L]/(platelet [10^9/L] x (ALT [U/L])^(1/2))
            fib4Value = (age * ast) / (platelets * Math.sqrt(alt));
            // 更新FIB-4輸入欄位
            document.getElementById('fib4_value').value = fib4Value.toFixed(2);
        }
        
        const formData = {
            name: document.getElementById('name').value,
            birthdate: birthdate,
            age: age,
            gender: gender,
            hbsag: document.getElementById('hbsag').value,
            hbeag: document.getElementById('hbeag').value,
            hbvdna: parseFloat(document.getElementById('hbvdna').value) || 0,
            alt: alt,
            ast: ast,
            alt_upper_limit: parseFloat(document.getElementById('alt_upper_limit').value) || defaultAltUpperLimit,
            prothrombin_time: parseFloat(document.getElementById('prothrombin_time').value) || 0,
            bilirubin: parseFloat(document.getElementById('bilirubin').value) || 0,
            platelets: platelets,
            liver_biopsy: document.getElementById('liver_biopsy').checked,
            varices: document.getElementById('varices').checked,
            splenomegaly: document.getElementById('splenomegaly').checked,
            low_platelets: document.getElementById('low_platelets').checked,
            fibroscan: document.getElementById('fibroscan').checked,
            ct_mri: document.getElementById('ct_mri').checked,
            fibrosis: document.querySelector('input[name="fibrosis"]:checked')?.value || '',
            fibroscan_value: parseFloat(document.getElementById('fibroscan_value').value) || 0,
            arfi_value: parseFloat(document.getElementById('arfi_value').value) || 0,
            fib4_value: fib4Value,
            liver_failure: document.getElementById('liver_failure').checked,
            organ_transplant: document.getElementById('organ_transplant').checked,
            liver_transplant: document.getElementById('liver_transplant').checked,
            chemotherapy: document.getElementById('chemotherapy').checked,
            liver_cancer: document.getElementById('liver_cancer').checked,
            immunosuppressants: document.getElementById('immunosuppressants').checked,
            pregnancy: document.getElementById('pregnancy').checked,
            pregnancy_week: parseFloat(document.getElementById('pregnancy_week').value) || 0
        };
        return formData;
    }
    
    // 判讀FIB-4結果
    function interpretFIB4(fib4Value) {
        if (fib4Value < 1.45) {
            return {
                result: '低風險',
                description: 'FIB-4 < 1.45，表示肝纖維化程度較低（F0-F1），排除顯著纖維化的準確性約90%。'
            };
        } else if (fib4Value >= 1.45 && fib4Value <= 3.25) {
            return {
                result: '中度風險',
                description: 'FIB-4介於1.45-3.25之間，表示可能有中度肝纖維化（F2），建議進一步檢查。'
            };
        } else {
            return {
                result: '高風險',
                description: 'FIB-4 > 3.25，表示可能有顯著肝纖維化或肝硬化（F3-F4），診斷顯著纖維化的準確性約80%。'
            };
        }
    }

    // 檢查是否符合肝代償不全條件
    function hasLiverDecompensation(formData) {
        return formData.prothrombin_time >= 3 || formData.bilirubin >= 2.0;
    }

    // 檢查是否符合肝硬化條件
    function hasLiverCirrhosis(formData) {
        // 檢查是否符合肝硬化的診斷標準
        const hasCirrhosisCondition = (
            formData.liver_biopsy || 
            formData.varices || 
            formData.splenomegaly || 
            (formData.low_platelets && formData.platelets < 120000) || 
            formData.fibroscan || 
            formData.ct_mri
        );

        // 檢查是否符合肝硬化的HBsAg和HBV DNA條件
        const hasViralCondition = formData.hbsag === 'positive' && formData.hbvdna > 0;

        return hasCirrhosisCondition && hasViralCondition;
    }

    // 檢查是否符合肝纖維化程度條件
    function hasFibrosis(formData, level) {
        if (level === 'F3') {
            return formData.fibrosis === 'F3' || formData.fibrosis === 'F4' || 
                   formData.fibroscan_value >= 9.5 || formData.arfi_value >= 1.81 || 
                   formData.fib4_value >= 3.25;
        } else if (level === 'F2') {
            return formData.fibrosis === 'F2' || formData.fibrosis === 'F3' || formData.fibrosis === 'F4' || 
                   formData.fibroscan_value >= 7.0 || formData.arfi_value >= 1.5 || 
                   formData.fib4_value >= 2.0;
        }
        return false;
    }

    // 檢查資格
    function checkEligibility(formData) {
        const results = [];
        
        // 檢查基本條件
        if (formData.hbsag !== 'positive') {
            results.push({
                condition: '基本條件',
                eligible: false,
                reason: 'HBsAg必須為陽性才符合健保給付條件。'
            });
            return results; // 如果HBsAg不是陽性，直接返回結果
        }
        
        // 提示：條件是獨立的，符合其中一種即可申請健保
        results.push({
            condition: '提示',
            eligible: true,
            reason: '以下條件是獨立的，符合其中一種即可申請健保給付。'
        });

        // 條件1：肝代償不全
        if (hasLiverDecompensation(formData)) {
            results.push({
                condition: '條件1：肝代償不全',
                eligible: true,
                reason: '您符合肝代償不全條件（凝血酶原時間延長≧3秒或總膽紅素≧2.0mg/dL）。',
                treatment: formData.hbeag === 'positive' ? 
                    '治療至e抗原轉陰並再給付最多12個月。' : 
                    '治療至少二年，治療期間需檢驗血清HBV DNA，並於檢驗血清HBV DNA連續三次，每次間隔6個月，均檢驗不出HBV DNA時可停藥，每次療程至多給付36個月。'
            });
        }

        // 條件2：特殊情況
        if (formData.organ_transplant || formData.liver_transplant) {
            results.push({
                condition: '條件2：器官移植',
                eligible: true,
                reason: '您符合器官移植條件。',
                treatment: '可長期使用抗病毒藥物。'
            });
        }

        if (formData.chemotherapy) {
            results.push({
                condition: '條件2：癌症化學療法',
                eligible: true,
                reason: '您符合接受癌症化學療法條件。',
                treatment: '可於化療前1週開始給付使用，直至化療結束後6個月。'
            });
        }

        if (hasLiverCirrhosis(formData)) {
            results.push({
                condition: '條件2：肝硬化',
                eligible: true,
                reason: '您符合肝硬化條件。',
                treatment: '可長期使用抗病毒藥物。'
            });
        }

        if (formData.liver_cancer) {
            results.push({
                condition: '條件2：肝癌根除性治療',
                eligible: true,
                reason: '您符合確診為肝癌並接受根除性治療條件。',
                treatment: '可長期使用抗病毒藥物，直至肝癌復發且未能再次接受根除性治療止。'
            });
        }

        if (formData.immunosuppressants) {
            results.push({
                condition: '條件2：免疫抑制劑治療',
                eligible: true,
                reason: '您符合接受免疫抑制劑治療條件。',
                treatment: '可於治療前一週起，至免疫抑制劑停藥後6個月使用抗病毒藥物。'
            });
        }

        if (formData.pregnancy && formData.pregnancy_week >= 27 && formData.hbvdna >= 200000) {
            results.push({
                condition: '條件2：懷孕',
                eligible: true,
                reason: '您符合懷孕且血清HBV DNA≧ 2x10^5 IU/mL條件。',
                treatment: '於懷孕滿27週後開始給付telbivudine或TDF或TAF，至產後4週。'
            });
        }

        // 條件3：HBeAg陽性
        if (formData.hbeag === 'positive') {
            // 條件3.1：ALT≧5X
            if (formData.alt >= formData.alt_upper_limit * 5) {
                results.push({
                    condition: '條件3：HBeAg陽性且ALT≧5X',
                    eligible: true,
                    reason: `您的ALT值(${formData.alt})大於或等於正常值上限(${formData.alt_upper_limit})的5倍。`,
                    treatment: '治療至e抗原轉陰並再給付最多12個月。'
                });
            }
            // 條件3.2：2X≦ALT<5X且HBV DNA≧20,000 IU/mL
            else if (formData.alt >= formData.alt_upper_limit * 2 && formData.alt < formData.alt_upper_limit * 5 && formData.hbvdna >= 20000) {
                results.push({
                    condition: '條件3：HBeAg陽性且2X≦ALT<5X且HBV DNA≧20,000 IU/mL',
                    eligible: true,
                    reason: `您的ALT值(${formData.alt})介於正常值上限(${formData.alt_upper_limit})的2至5倍之間，且血清HBV DNA≧20,000 IU/mL。`,
                    treatment: '治療至e抗原轉陰並再給付最多12個月。'
                });
            }
            // 條件3.3：纖維化≧F3且ALT>X且HBV DNA≧20,000 IU/mL
            else if (hasFibrosis(formData, 'F3') && formData.alt > formData.alt_upper_limit && formData.hbvdna >= 20000) {
                results.push({
                    condition: '條件3：HBeAg陽性且纖維化≧F3且ALT>X且HBV DNA≧20,000 IU/mL',
                    eligible: true,
                    reason: `您的肝纖維化程度≧F3，ALT值(${formData.alt})大於正常值上限(${formData.alt_upper_limit})，且血清HBV DNA≧20,000 IU/mL。`,
                    treatment: '治療至e抗原轉陰並再給付最多12個月。'
                });
            }
        }

        // 條件4：HBeAg陰性
        if (formData.hbeag === 'negative') {
            // 條件4.1：ALT≧2X且HBV DNA≧2,000 IU/mL
            if (formData.alt >= formData.alt_upper_limit * 2 && formData.hbvdna >= 2000) {
                results.push({
                    condition: '條件4：HBeAg陰性且ALT≧2X且HBV DNA≧2,000 IU/mL',
                    eligible: true,
                    reason: `您的ALT值(${formData.alt})大於或等於正常值上限(${formData.alt_upper_limit})的2倍，且血清HBV DNA≧2,000 IU/mL。`,
                    treatment: '治療至少二年，治療期間需檢驗血清HBV DNA，並於檢驗血清HBV DNA連續三次，每次間隔6個月，均檢驗不出HBV DNA時停藥，每次療程至多給付36個月。'
                });
            }
            // 條件4.2：纖維化≧F2且ALT>X且HBV DNA≧20,000 IU/mL
            else if (hasFibrosis(formData, 'F2') && formData.alt > formData.alt_upper_limit && formData.hbvdna >= 20000) {
                results.push({
                    condition: '條件4：HBeAg陰性且纖維化≧F2且ALT>X且HBV DNA≧20,000 IU/mL',
                    eligible: true,
                    reason: `您的肝纖維化程度≧F2，ALT值(${formData.alt})大於正常值上限(${formData.alt_upper_limit})，且血清HBV DNA≧20,000 IU/mL。`,
                    treatment: '治療至少二年，治療期間需檢驗血清HBV DNA，並於檢驗血清HBV DNA連續三次，每次間隔6個月，均檢驗不出HBV DNA時停藥，每次療程至多給付36個月。'
                });
            }
        }

        // 如果沒有符合任何條件
        if (results.length === 0) {
            results.push({
                condition: '健保給付條件',
                eligible: false,
                reason: '根據您提供的資料，目前不符合健保給付B型肝炎抗病毒藥物的條件。建議定期追蹤，並諮詢醫師意見。'
            });
        }

        return results;
    }

    // 顯示結果
    function displayResults(results) {
        resultContent.innerHTML = '';
        
        // 添加基本資料
        const basicInfo = document.createElement('div');
        basicInfo.className = 'result-item';
        basicInfo.innerHTML = `
            <div class="result-title">基本資料</div>
            <p>姓名：${document.getElementById('name').value || '未填寫'}</p>
            <p>出生日期：${document.getElementById('birthdate').value || '未填寫'}</p>
            <p>性別：${document.getElementById('gender').value === 'male' ? '男' : document.getElementById('gender').value === 'female' ? '女' : '未填寫'}</p>
        `;
        resultContent.appendChild(basicInfo);

        // 添加檢驗數據摘要
        const labData = document.createElement('div');
        labData.className = 'result-item';
        labData.innerHTML = `
            <div class="result-title">檢驗數據摘要</div>
            <p>HBsAg：${document.getElementById('hbsag').value === 'positive' ? '陽性' : document.getElementById('hbsag').value === 'negative' ? '陰性' : '未填寫'}</p>
            <p>HBeAg：${document.getElementById('hbeag').value === 'positive' ? '陽性' : document.getElementById('hbeag').value === 'negative' ? '陰性' : '未填寫'}</p>
            <p>HBV DNA：${document.getElementById('hbvdna').value || '0'} IU/mL</p>
            <p>ALT：${document.getElementById('alt').value || '0'} U/L (正常值上限：${document.getElementById('alt_upper_limit').value || '40'} U/L)</p>
            <p>AST：${document.getElementById('ast').value || '0'} U/L</p>
            <p>血小板：${document.getElementById('platelets').value || '0'} 10^9/L</p>
        `;
        
        // 如果有計算FIB-4值，顯示計算結果
        const fib4Value = parseFloat(document.getElementById('fib4_value').value) || 0;
        if (fib4Value > 0) {
            const fib4Interpretation = interpretFIB4(fib4Value);
            labData.innerHTML += `
                <div class="fib4-result" style="margin-top: 10px; padding: 10px; background-color: #f8f9fa; border-left: 4px solid #17a2b8;">
                    <p><strong>FIB-4肝纖維化指數：</strong> ${fib4Value.toFixed(2)}</p>
                    <p><strong>判讀結果：</strong> ${fib4Interpretation.result}</p>
                    <p>${fib4Interpretation.description}</p>
                </div>
            `;
        }
        resultContent.appendChild(labData);

        // 檢查是否符合健保給付條件
        let isEligible = results.some(result => result.eligible && result.condition !== '提示' && result.condition !== 'FIB-4肝纖維化指數評估');
        
        // 如果符合健保給付條件，添加紅色提示文字和申請單下載連結
        if (isEligible) {
            const eligibleNotice = document.createElement('div');
            eligibleNotice.className = 'result-item eligible-notice';
            eligibleNotice.innerHTML = `
                <div class="result-title">健保給付申請提示</div>
                <p class="important-notice">此案已符合健保給付用藥條件</p>
                <p class="important-notice">此案在門診就診請協助約診GI門診申請用藥</p>
                <p class="important-notice">此案住院請協助照會GI由CR協助評估用藥</p>
                <p><a href="https://eip.hosp.ncku.edu.tw/app/index.php?Action=downloadfile&file=WVhSMFlXTm9MelUxTDNCMFlWOHhNVEE0T1RkZk16azFOalUwT1Y4eU5qQTNPQzV3WkdZPQ==&fname=205401GHYWDC015420XSTSXWZSB4WTYWRKNO40ICGGYTYXEGROB445LLGGKKTTRKWWTSDDZXFGZSNKYWQO30MO25EC2435HCLPYT00PKNKTS01POPK00RPFCUSXWGGID00LKTXHGKKHCPO3520ROOKYSQP3504QPZWUSZSDGYSOK01QKPOWWUT10IG04FG34OO30GDB1B430A1A1" target="_blank" class="download-link">點擊下載申請單</a></p>
            `;
            resultContent.appendChild(eligibleNotice);
        }
        
        // 添加篩檢結果
        for (const result of results) {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.innerHTML = `
                <div class="result-title">${result.condition}</div>
                <p class="${result.eligible ? 'eligible' : 'not-eligible'}">
                    ${result.eligible ? '符合條件' : '不符合條件'}
                </p>
                <p>${result.reason}</p>
                ${result.treatment ? `<p><strong>治療方案：</strong>${result.treatment}</p>` : ''}
            `;
            resultContent.appendChild(resultItem);
        }

        // 添加注意事項
        const notice = document.createElement('div');
        notice.className = 'result-item';
        notice.innerHTML = `
            <div class="result-title">注意事項</div>
            <p class="warning">本篩檢結果僅供參考，實際給付條件請以健保署公告為準，並請諮詢專業醫師。</p>
        `;
        resultContent.appendChild(notice);
    }

    // PDF生成功能已移除
});
