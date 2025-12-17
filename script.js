document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimation();
    initDiagnosis();
    initMobileMenu();
    initFAQ();
    initYearCalc(); // 年数自動計算の呼び出し
});

// === 年数自動計算 (1991年3月基準) ===
function initYearCalc() {
    const startYear = 1991;
    const startMonth = 2; // 3月 (JavaScriptの月は0始まりのため2)
    const today = new Date();
    
    let years = today.getFullYear() - startYear;
    
    // 現在の月が3月未満の場合は1年引く
    if (today.getMonth() < startMonth) {
        years--;
    }
    
    // クラスが付与された要素を全て更新
    document.querySelectorAll('.calc-year').forEach(el => {
        el.innerText = years;
    });
}

// === スクロールアニメーション ===
function initScrollAnimation() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-up, .feature-img, .feature-text').forEach(el => {
        if(!el.classList.contains('fade-up') && !el.classList.contains('fade-right') && !el.classList.contains('fade-left')) {
            el.classList.add('fade-up'); // デフォルト
        }
        observer.observe(el);
    });
}

// === ぴったり診断 & ROI計算 ===
function initDiagnosis() {
    const guardsInput = document.getElementById('diag-guards');
    const typeChecks = document.querySelectorAll('input[name="biz-type"]');
    const methodRadios = document.querySelectorAll('input[name="current-method"]');
    const issueChecks = document.querySelectorAll('input[name="issue"]');
    
    if(!guardsInput) return;

    const runDiagnosis = () => {
        // 1. 入力値の取得
        const guards = parseInt(guardsInput.value);
        document.getElementById('diag-val-guards').innerText = guards;

        // Q1: 業務区分（係数設定）
        // 優先度・係数順: 2号(1.3) > 1号(1.2) > 5号(1.15) > 4号(1.1) > 3号(1.05)
        let typeCoeff = 1.0;
        let selectedTypes = [];
        typeChecks.forEach(chk => {
            if(chk.checked) {
                selectedTypes.push(chk.value);
                // 各業務タイプの係数をチェックし、現在のtypeCoeffより大きければ更新
                let currentCoeff = 1.0;
                if(chk.value === 'type2') currentCoeff = 1.3;
                else if(chk.value === 'type1') currentCoeff = 1.2;
                else if(chk.value === 'type5') currentCoeff = 1.15;
                else if(chk.value === 'type4') currentCoeff = 1.1;
                else if(chk.value === 'type3') currentCoeff = 1.05;
                
                if(currentCoeff > typeCoeff) typeCoeff = currentCoeff;
            }
        });

        // Q2: 現在の管理方法（係数）
        // 紙=1.2, Excel=1.0, System=0.8
        let methodCoeff = 1.0;
        methodRadios.forEach(r => { 
            if(r.checked) {
                if(r.value === 'paper') methodCoeff = 1.2;
                if(r.value === 'excel') methodCoeff = 1.0;
                if(r.value === 'system') methodCoeff = 0.8;
            }
        });

        // Q4: 選択された課題
        let selectedIssues = [];
        issueChecks.forEach(chk => { if(chk.checked) selectedIssues.push(chk.value); });

        // --- 削減効果計算 (ROI) ---
        // ターゲット: 50名で22万円削減 (Control:2000, Edu:900, Payroll:1500)
        const baseMetrics = {
            'control': { cost: 2000, time: 45 }, 
            'edu':     { cost: 900,  time: 20 }, 
            'payroll': { cost: 1500, time: 35 }  
        };

        const badgesContainer = document.getElementById('res-badges');
        const descContainer = document.getElementById('res-desc');
        badgesContainer.innerHTML = ''; 
        
        let totalMonthlySaving = 0;
        let totalTimeSavingMin = 0;
        let descText = "";

        if(selectedIssues.length === 0) {
            badgesContainer.innerHTML = '<span class="p-badge" style="background:rgba(255,255,255,0.2);color:white;">課題を選択してください</span>';
            descText = "現状の課題を選択すると、改善効果が表示されます。";
        } else {
            // プランと数値の積み上げ
            if(selectedIssues.includes('control')) {
                badgesContainer.innerHTML += '<span class="p-badge p-kansei">管制Pro</span>';
                totalMonthlySaving += baseMetrics.control.cost;
                totalTimeSavingMin += baseMetrics.control.time;
            }
            if(selectedIssues.includes('edu')) {
                badgesContainer.innerHTML += '<span class="p-badge p-edu">教育Pro</span>';
                totalMonthlySaving += baseMetrics.edu.cost;
                totalTimeSavingMin += baseMetrics.edu.time;
            }
            if(selectedIssues.includes('payroll')) {
                badgesContainer.innerHTML += '<span class="p-badge p-keibi">警備Pro</span>';
                totalMonthlySaving += baseMetrics.payroll.cost;
                totalTimeSavingMin += baseMetrics.payroll.time;
            }

            // テキスト生成
            if(selectedIssues.length === 3) {
                descText = "すべての管理業務をDX化するフルパッケージ。<br>管理部門の残業をほぼゼロにし、コア業務へ集中できる環境を作ります。";
            } else if(selectedIssues.length === 2) {
                 descText = "選択された2つの課題を重点的に解決するプラン。<br>現場負担の軽減とコンプライアンス強化を同時に実現します。";
            } else {
                descText = "特定業務の効率化に特化したスモールスタートプラン。<br>導入効果を即座に実感でき、段階的なDXにも最適です。";
            }
        }
        
        descContainer.innerHTML = descText;

        // 係数を適用 (業務区分 × 管理方法)
        const totalCoeff = typeCoeff * methodCoeff;

        // 最終計算
        // 金額 = (単価合計 * 係数 * 人数)
        const finalAmount = Math.floor(totalMonthlySaving * totalCoeff * guards);
        animateValue('res-amount', finalAmount);

        // 時間 = (分合計 * 係数 * 人数) / 60
        const finalHours = Math.floor((totalTimeSavingMin * totalCoeff * guards) / 60);
        animateValue('res-hours', finalHours);

        // === 負担軽減バーの動的変動ロジック（修正版：未選択時100%） ===
        
        let remainingPercent = 100.0; // デフォルトは100%（削減なし）

        // 課題が1つ以上選択されている場合のみ、削減計算を行う
        if (selectedIssues.length > 0) {
            
            // 1. ベースの削減率を決定（あえてキリの悪い数字を設定）
            remainingPercent = 61.2; // デフォルト(他社ソフト)
            
            methodRadios.forEach(r => {
                if(r.checked) {
                    if(r.value === 'paper') remainingPercent = 28.4; // 紙
                    if(r.value === 'excel') remainingPercent = 46.7; // Excel
                    if(r.value === 'system') remainingPercent = 61.2; // システム
                }
            });

            // 2. 選択した課題数によるボーナス
            const issueCount = selectedIssues.length;
            if (issueCount === 2) remainingPercent -= 4.3;
            if (issueCount === 3) remainingPercent -= 8.9;

            // 3. 隊員数による「ゆらぎ」の演出
            const fluctuation = (guards % 6) * 0.1; 
            remainingPercent -= fluctuation;

            // 最小値ガード
            if (remainingPercent < 15.0) remainingPercent = 15.0;
        }

        // 4. UIへの反映（小数点第1位まで表示）
        const barFill = document.querySelector('.rb-fill.rb-after');
        if (barFill) {
            const finalPercentStr = remainingPercent.toFixed(1);
            
            barFill.style.width = finalPercentStr + '%';
            
            const barText = barFill.querySelector('.rb-text');
            if (barText) {
                barText.innerText = `導入後：${finalPercentStr}%`;
            }
        }

        // === アイコンによる視覚化 ===
        // 令和7年度の交通誘導警備員A全国平均値より換算
        const guardUnitPrice = 17931;
        const equivalentGuards = Math.floor(finalAmount / guardUnitPrice);

        // 更新処理
        const countSpan = document.getElementById('pv-count');
        if(countSpan) countSpan.innerText = equivalentGuards;

        const iconContainer = document.getElementById('pv-icons');
        if(iconContainer) {
            iconContainer.innerHTML = '';
            // アイコン生成
            for(let i=0; i < equivalentGuards; i++) {
                const icon = document.createElement('i');
                // 帽子を被った人物アイコン（警察風）が無料版にないため、人型（fa-user）を採用
                icon.className = 'fas fa-user pv-icon';
                iconContainer.appendChild(icon);
            }
        }
    };

    // イベントリスナー
    guardsInput.addEventListener('input', runDiagnosis);
    typeChecks.forEach(c => c.addEventListener('change', runDiagnosis));
    methodRadios.forEach(r => r.addEventListener('change', runDiagnosis));
    issueChecks.forEach(c => c.addEventListener('change', runDiagnosis));
    
    // 初期実行
    runDiagnosis();
}

// 金額アニメーション
function animateValue(id, end) {
    const obj = document.getElementById(id);
    if(!obj) return;
    const start = parseInt(obj.innerText.replace(/,/g, '')) || 0;
    if (start === end) return;

    const duration = 500;
    const startTime = performance.now();

    const step = (currentTime) => {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        obj.innerText = value.toLocaleString();
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    };
    requestAnimationFrame(step);
}

// === 診断結果を持って問い合わせ ===
function inquireWithDiagnosis() {
    const guards = document.getElementById('diag-guards').value;
    const amount = document.getElementById('res-amount').innerText;
    const hours = document.getElementById('res-hours').innerText; 
    
    // 選択値のテキスト化
    let typeText = [];
    document.querySelectorAll('input[name="biz-type"]:checked').forEach(r => {
        typeText.push(r.nextElementSibling.innerText.trim());
    });
    
    // labelタグ化に伴うセレクタ変更
    let methodText = "";
    document.querySelectorAll('input[name="current-method"]:checked').forEach(r => {
        methodText = r.nextElementSibling.querySelector('span').innerText;
    });

    const badges = document.getElementById('res-badges').innerText.replace(/\n/g, ' ');
    
    // メッセージ生成
    const msg = `【Web診断結果からの相談】
--------------------------------
■貴社状況
・隊員規模: ${guards}名
・業務種別: ${typeText.join(', ')}
・現管理法: ${methodText}

■シミュレーション結果
・推奨プラン: ${badges}
・想定効果額: ¥${amount}/月
・想定効果時間: ${hours}時間/月
--------------------------------
（以下にご質問やご要望があれば追記してください）`;
    
    const textArea = document.getElementById('contact-msg');
    if(textArea) {
        textArea.value = msg;
    }
    
    openModal();
}

// === モバイルメニュー ===
function initMobileMenu() {
    const toggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.nav-menu');
    
    if(toggle && nav) {
        toggle.addEventListener('click', () => {
            nav.style.display = nav.style.display === 'flex' ? '' : 'flex';
            if(nav.style.display === 'flex') {
                nav.style.position = 'absolute';
                nav.style.top = '70px';
                nav.style.left = '0';
                nav.style.width = '100%';
                nav.style.background = 'white';
                nav.style.flexDirection = 'column';
                nav.style.padding = '20px';
                nav.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)';
            }
        });
    }
}

// === モーダル制御 ===
function openModal() {
    document.getElementById('contactModal').classList.add('active');
}

function closeModal() {
    document.getElementById('contactModal').classList.remove('active');
}

window.onclick = function(event) {
    const modal = document.getElementById('contactModal');
    if (event.target == modal) {
        closeModal();
    }
}

// === 算出根拠の開閉 (追加) ===
function toggleCalcDetails() {
    const box = document.getElementById('calc-details');
    const icon = document.getElementById('toggle-icon');
    
    if (box.style.display === 'none') {
        box.style.display = 'block';
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    } else {
        box.style.display = 'none';
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    }
}

// === FAQ Accordion (New) ===
function initFAQ() {
    const questions = document.querySelectorAll('.faq-question');
    
    questions.forEach(q => {
        q.addEventListener('click', () => {
            const item = q.parentElement;
            const answer = item.querySelector('.faq-answer');
            
            // Toggle active class
            item.classList.toggle('active');
            
            // Slide animation
            if (item.classList.contains('active')) {
                answer.style.height = answer.scrollHeight + 'px';
            } else {
                answer.style.height = '0px';
            }
        });
    });
}