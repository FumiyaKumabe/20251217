document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimation();
    initDiagnosis();
    initMobileMenu();
    initFAQ();
    initYearCalc(); 
    initDiagramLines();
});

/* Year Auto Calc */
function initYearCalc() {
    const startYear = 1991;
    const startMonth = 2; 
    const today = new Date();
    let years = today.getFullYear() - startYear;
    if (today.getMonth() < startMonth) {
        years--;
    }
    document.querySelectorAll('.calc-year').forEach(el => {
        el.innerText = years;
    });
}

/* Scroll Animation */
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
            el.classList.add('fade-up'); 
        }
        observer.observe(el);
    });
}

/* Diagram Lines */
function initDiagramLines() {
    const board = document.querySelector('.diagram-board');
    if (!board) return;

    let svg = board.querySelector('.diagram-svg');
    if (!svg) {
        svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.classList.add('diagram-svg');
        board.prepend(svg);
    }

    const drawLine = (startSel, endSel, color = '#3b82f6') => {
        const startEl = board.querySelector(startSel);
        const endEl = board.querySelector(endSel);
        if (!startEl || !endEl) return;

        const startRect = startEl.getBoundingClientRect();
        const endRect = endEl.getBoundingClientRect();
        const boardRect = board.getBoundingClientRect();

        const x1 = startRect.left + startRect.width / 2 - boardRect.left + board.scrollLeft;
        const y1 = startRect.top + startRect.height / 2 - boardRect.top + board.scrollTop;
        const x2 = endRect.left + endRect.width / 2 - boardRect.left + board.scrollLeft;
        const y2 = endRect.top + endRect.height / 2 - boardRect.top + board.scrollTop;

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("stroke", color);
        line.setAttribute("stroke-width", "2");
        line.setAttribute("stroke-dasharray", "6, 4");
        line.setAttribute("stroke-linecap", "round");
        svg.appendChild(line);
    };

    const renderAllLines = () => {
        while (svg.firstChild) svg.removeChild(svg.firstChild);
        svg.style.width = board.scrollWidth + 'px';
        svg.style.height = board.scrollHeight + 'px';

        const colBlue = '#3b82f6';
        drawLine('.area-order', '.area-auto', colBlue);
        drawLine('.area-auto', '.area-send', colBlue);
        drawLine('.area-send', '.area-shift', colBlue);
        drawLine('.area-shift', '.area-contact', colBlue);
        drawLine('.area-contact', '.area-report', colBlue);
        drawLine('.area-report', '.area-workdata', colBlue);

        drawLine('.area-workdata', '.area-invoice', colBlue);
        drawLine('.area-invoice', '.area-payment', colBlue);
        drawLine('.area-payment', '.area-mgmt', colBlue);
        drawLine('.area-workdata', '.area-payroll', colBlue);

        drawLine('.area-payroll', '.area-daily', colBlue);
        drawLine('.area-payroll', '.area-ledger', colBlue);
        drawLine('.area-payroll', '.area-yearend', colBlue);
    };

    window.addEventListener('load', renderAllLines);
    if (document.readyState === 'complete') renderAllLines();
    else setTimeout(renderAllLines, 500);

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(renderAllLines, 200);
    });
}

/* Diagnosis */
function initDiagnosis() {
    const guardsInput = document.getElementById('diag-guards');
    const typeChecks = document.querySelectorAll('input[name="biz-type"]');
    const methodRadios = document.querySelectorAll('input[name="current-method"]');
    const issueChecks = document.querySelectorAll('input[name="issue"]');
    
    if(!guardsInput) return;

    const runDiagnosis = () => {
        const guards = parseInt(guardsInput.value);
        document.getElementById('diag-val-guards').innerText = guards;

        let typeCoeff = 1.0;
        let selectedTypes = [];
        typeChecks.forEach(chk => {
            if(chk.checked) {
                selectedTypes.push(chk.value);
                let currentCoeff = 1.0;
                if(chk.value === 'type2') currentCoeff = 1.3;
                else if(chk.value === 'type1') currentCoeff = 1.2;
                else if(chk.value === 'type5') currentCoeff = 1.15;
                else if(chk.value === 'type4') currentCoeff = 1.1;
                else if(chk.value === 'type3') currentCoeff = 1.05;
                if(currentCoeff > typeCoeff) typeCoeff = currentCoeff;
            }
        });

        let methodCoeff = 1.0;
        methodRadios.forEach(r => { 
            if(r.checked) {
                if(r.value === 'paper') methodCoeff = 1.2;
                if(r.value === 'excel') methodCoeff = 1.0;
                if(r.value === 'system') methodCoeff = 0.8;
            }
        });

        let selectedIssues = [];
        issueChecks.forEach(chk => { if(chk.checked) selectedIssues.push(chk.value); });

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

            if(selectedIssues.length === 3) {
                descText = "すべての管理業務をDX化するフルパッケージ。<br>管理部門の残業をほぼゼロにし、コア業務へ集中できる環境を作ります。";
            } else if(selectedIssues.length === 2) {
                 descText = "選択された2つの課題を重点的に解決するプラン。<br>現場負担の軽減とコンプライアンス強化を同時に実現します。";
            } else {
                descText = "特定業務の効率化に特化したスモールスタートプラン。<br>導入効果を即座に実感でき、段階的なDXにも最適です。";
            }
        }
        
        descContainer.innerHTML = descText;

        const totalCoeff = typeCoeff * methodCoeff;
        const finalAmount = Math.floor(totalMonthlySaving * totalCoeff * guards);
        animateValue('res-amount', finalAmount);

        const finalHours = Math.floor((totalTimeSavingMin * totalCoeff * guards) / 60);
        animateValue('res-hours', finalHours);
        
        let remainingPercent = 100.0;
        if (selectedIssues.length > 0) {
            remainingPercent = 61.2;
            methodRadios.forEach(r => {
                if(r.checked) {
                    if(r.value === 'paper') remainingPercent = 28.4;
                    if(r.value === 'excel') remainingPercent = 46.7;
                    if(r.value === 'system') remainingPercent = 61.2;
                }
            });

            const issueCount = selectedIssues.length;
            if (issueCount === 2) remainingPercent -= 4.3;
            if (issueCount === 3) remainingPercent -= 8.9;

            const fluctuation = (guards % 6) * 0.1; 
            remainingPercent -= fluctuation;
            if (remainingPercent < 15.0) remainingPercent = 15.0;
        }

        const barFill = document.querySelector('.rb-fill.rb-after');
        if (barFill) {
            const finalPercentStr = remainingPercent.toFixed(1);
            barFill.style.width = finalPercentStr + '%';
            const barText = barFill.querySelector('.rb-text');
            if (barText) {
                barText.innerText = `導入後：${finalPercentStr}%`;
            }
        }

        const guardUnitPrice = 17931;
        const equivalentGuards = Math.floor(finalAmount / guardUnitPrice);
        const countSpan = document.getElementById('pv-count');
        if(countSpan) countSpan.innerText = equivalentGuards;

        const iconContainer = document.getElementById('pv-icons');
        if(iconContainer) {
            iconContainer.innerHTML = '';
            for(let i=0; i < equivalentGuards; i++) {
                const icon = document.createElement('i');
                icon.className = 'fas fa-user pv-icon';
                iconContainer.appendChild(icon);
            }
        }
    };

    guardsInput.addEventListener('input', runDiagnosis);
    typeChecks.forEach(c => c.addEventListener('change', runDiagnosis));
    methodRadios.forEach(r => r.addEventListener('change', runDiagnosis));
    issueChecks.forEach(c => c.addEventListener('change', runDiagnosis));
    runDiagnosis();
}

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

function inquireWithDiagnosis() {
    const guards = document.getElementById('diag-guards').value;
    const amount = document.getElementById('res-amount').innerText;
    const hours = document.getElementById('res-hours').innerText; 
    
    let typeText = [];
    document.querySelectorAll('input[name="biz-type"]:checked').forEach(r => {
        typeText.push(r.nextElementSibling.innerText.trim());
    });
    
    let methodText = "";
    document.querySelectorAll('input[name="current-method"]:checked').forEach(r => {
        methodText = r.nextElementSibling.querySelector('span').innerText;
    });

    const badges = document.getElementById('res-badges').innerText.replace(/\n/g, ' ');
    
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

function initFAQ() {
    const questions = document.querySelectorAll('.faq-question');
    questions.forEach(q => {
        q.addEventListener('click', () => {
            const item = q.parentElement;
            const answer = item.querySelector('.faq-answer');
            item.classList.toggle('active');
            if (item.classList.contains('active')) {
                answer.style.height = answer.scrollHeight + 'px';
            } else {
                answer.style.height = '0px';
            }
        });
    });
}