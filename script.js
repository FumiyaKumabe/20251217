document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimation();
    initDiagnosis();
    initMobileMenu();
    initFAQ();
    initYearCalc();
    initDiagramLines();
    initBarAnimation();
});

/* 創業年数の自動計算 */
function initYearCalc() {
    const startYear = 1991;
    const startMonth = 2; // 2月創業と仮定
    const today = new Date();
    let years = today.getFullYear() - startYear;
    // 創業月前なら-1する
    if (today.getMonth() + 1 < startMonth) {
        years--;
    }
    document.querySelectorAll('.calc-year').forEach(el => {
        el.innerText = years;
    });
}

/* スクロールアニメーション */
function initScrollAnimation() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.fade-up, .feature-img, .feature-text, .stat-card, .fit-box, .comparison-table-wrapper').forEach(el => {
        // すでにクラスがあっても多重付与はされないが、念のためチェック
        if (!el.classList.contains('fade-up') && !el.classList.contains('fade-right') && !el.classList.contains('fade-left')) {
            el.classList.add('fade-up');
        }
        observer.observe(el);
    });
}

/* 図解の線を引く処理 */
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

        // ボード内の相対座標を計算 (scrollも考慮)
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
        line.setAttribute("stroke-dasharray", "6, 4"); // 点線
        line.setAttribute("stroke-linecap", "round");
        svg.appendChild(line);
    };

    const renderAllLines = () => {
        // 既存の線をクリア
        while (svg.firstChild) svg.removeChild(svg.firstChild);
        
        // SVGのサイズをスクロール領域全体に合わせる
        svg.style.width = board.scrollWidth + 'px';
        svg.style.height = board.scrollHeight + 'px';

        const colBlue = '#3b82f6';
        
        // 線の接続定義
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

    // 読み込み完了時とリサイズ時に再描画
    window.addEventListener('load', renderAllLines);
    if (document.readyState === 'complete') renderAllLines();
    else setTimeout(renderAllLines, 500);

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(renderAllLines, 200);
    });
}

/* 数字のカウントアップアニメーション */
function animateValue(id, end) {
    const obj = document.getElementById(id);
    if (!obj) return;
    const currentText = obj.innerText.replace(/,/g, '');
    const start = parseInt(currentText) || 0;
    if (start === end) return;
    
    const duration = 500;
    const startTime = performance.now();
    
    const step = (currentTime) => {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        // イージングなしの線形補間
        const value = Math.floor(progress * (end - start) + start);
        obj.innerText = value.toLocaleString();
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    };
    requestAnimationFrame(step);
}

/* モバイルメニュー制御 */
function initMobileMenu() {
    const toggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.nav-menu');
    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            // style.displayのトグル
            nav.style.display = nav.style.display === 'flex' ? '' : 'flex';
            
            // モバイル用スタイルの適用（CSSクラス制御の方が望ましいが、JSでの簡易実装）
            if (nav.style.display === 'flex') {
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

/* FAQのアコーディオン */
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

/* 診断ロジック：ROIシミュレーション */
function initDiagnosis() {
    const guardsInput = document.getElementById('diag-guards');
    const typeChecks = document.querySelectorAll('input[name="biz-type"]');
    const methodRadios = document.querySelectorAll('input[name="current-method"]');
    const issueChecks = document.querySelectorAll('input[name="issue"]');

    if (!guardsInput) return;

    const runDiagnosis = () => {
        const guards = parseInt(guardsInput.value);
        document.getElementById('diag-val-guards').innerText = guards;

        // --- 係数計算 ---
        // 業務難易度係数
        let typeCoeff = 1.0;
        typeChecks.forEach(chk => {
            if (chk.checked) {
                let currentCoeff = 1.0;
                if (chk.value === 'type2') currentCoeff = 1.3; // 2号は高い
                else if (chk.value === 'type1') currentCoeff = 1.2;
                else if (chk.value === 'type5') currentCoeff = 1.15;
                else if (chk.value === 'type4') currentCoeff = 1.1;
                else if (chk.value === 'type3') currentCoeff = 1.05;
                
                // 最も高い係数を採用
                if (currentCoeff > typeCoeff) typeCoeff = currentCoeff;
            }
        });

        // 管理方法係数
        let methodCoeff = 1.0;
        methodRadios.forEach(r => {
            if (r.checked) {
                if (r.value === 'paper') methodCoeff = 1.2; // 紙は非効率なので改善幅大
                if (r.value === 'excel') methodCoeff = 1.0;
                if (r.value === 'system') methodCoeff = 0.8; // 既にシステム利用なら改善幅小
            }
        });

        let selectedIssues = [];
        issueChecks.forEach(chk => {
            if (chk.checked) selectedIssues.push(chk.value);
        });

        // 課題別削減単価パラメータ
        const baseMetrics = {
            'control': {
                cost: 2000,
                time: 45,
                label: '管制Pro (スマホ連携)',
                icon: 'fa-mobile-alt'
            },
            'edu': {
                cost: 900,
                time: 20,
                label: '教育Pro (法令自動化)',
                icon: 'fa-book-reader'
            },
            'payroll': {
                cost: 1500,
                time: 35,
                label: '警備Pro (基幹・事務)',
                icon: 'fa-desktop'
            }
        };

        // 解決のキーポイント（製品カード）の提示
        const solContainer = document.getElementById('res-specific-solutions');
        if (solContainer) {
            solContainer.innerHTML = '';
            selectedIssues.forEach(key => {
                const sol = baseMetrics[key];
                solContainer.innerHTML += `
                    <div style="background: rgba(255,255,255,0.95); padding: 12px; border-radius: 6px; color: #0a2540; font-size: 0.85rem; font-weight: 900; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <i class="fas ${sol.icon}" style="color: #d97706; margin-right: 8px;"></i> ${sol.label}
                    </div>`;
            });
        }

        // 動的アドバイス生成
        const adviceBox = document.getElementById('diagnosis-advice-box');
        const issueKey = selectedIssues.sort().join(',');

        const adviceMap = {
            'control,edu,payroll': '<strong>【経営DXの完成形】</strong> 全ての基幹業務を統合することで、事務員1名分の工数を「売上を作る営業活動」に完全シフトできます。警備業に特化した全自動フローを構築可能です。',
            'control,edu': '<strong>【現場と法の守りを強化】</strong> スマホ連携による欠員防止と、自動帳票による監査対策を両立。現場管理者の「心理的ストレス」を劇的に軽減し、定着率向上に寄与します。',
            'edu,payroll': '<strong>【バックオフィスの完全自動化】</strong> 複雑な手当計算と教育実施簿が連動。月末の残業を根絶し、人為的なミスによる信頼失墜や行政処分のリスクをゼロにします。',
            'control,payroll': '<strong>【採算管理のスピードアップ】</strong> 上下番データが即座に給与・請求へ反映。現場ごとの「今日の利益」が即座に見えるようになり、不採算案件の早期見極めが可能になります。',
            'control': '<strong>【管制の属人化を解消】</strong> ベテランの頭の中にしかない配置ノウハウをシステムへ。スマホ連携により、朝晩の電話連絡に縛られない柔軟な管制体制を構築できます。',
            'edu': '<strong>【監査への不安を解消】</strong> 実施漏れのアラート機能で、常に「100点満点」の備付書類を維持。法改正にも自動対応し、経営の持続性を高めます。',
            'payroll': '<strong>【1円単位の収支改善】</strong> 複雑な給与計算を自動化し、請求漏れを徹底排除。システム導入初月から事務コスト削減による利益向上を実感いただけます。',
            '': '現状の課題を選択すると、貴社の状況に合わせた改善アドバイスと削減シミュレーションが表示されます。'
        };

        if (adviceBox) {
            const adviceText = adviceMap[issueKey] || '選択された課題に基づき、最適な運用体制をご提案いたします。';
            adviceBox.innerHTML = `<p style="color: #fff; line-height: 1.6;"><i class="fas fa-lightbulb" style="color: #fbbf24; margin-right: 10px;"></i> ${adviceText}</p>`;
        }

        // 推奨プラン名と「具体的な機能説明」の動的生成
        const badgesContainer = document.getElementById('res-badges');
        const descContainer = document.getElementById('res-desc');

        if (badgesContainer) {
            badgesContainer.innerHTML = '';
            if (selectedIssues.length > 0) {
                // バッジ表示
                if (selectedIssues.includes('control')) badgesContainer.innerHTML += '<span class="p-badge p-kansei">管制効率化</span>';
                if (selectedIssues.includes('edu')) badgesContainer.innerHTML += '<span class="p-badge p-edu">法令自動化</span>';
                if (selectedIssues.includes('payroll')) badgesContainer.innerHTML += '<span class="p-badge p-keibi">事務工数削減</span>';

                // プラン詳細テキスト生成
                if (descContainer) {
                    const detail = getPlanDetail(selectedIssues, guards);
                    descContainer.innerHTML = `
                        <div style="margin-bottom: 8px;">${detail.title}</div>
                        <div style="font-weight: 400; font-size: 0.85rem; color: #fff; opacity: 0.9; line-height: 1.5; text-align: left;">
                            ${detail.desc}
                        </div>`;
                }
            } else if (descContainer) {
                descContainer.innerHTML = "";
            }
        }

        // 数値計算
        let totalMonthlySaving = 0;
        let totalTimeSavingMin = 0;
        selectedIssues.forEach(issue => {
            totalMonthlySaving += baseMetrics[issue].cost;
            totalTimeSavingMin += baseMetrics[issue].time;
        });

        const totalCoeff = typeCoeff * methodCoeff;
        
        // 金額計算
        const finalAmount = Math.floor(totalMonthlySaving * totalCoeff * guards);
        animateValue('res-amount', finalAmount);

        // 時間計算
        const finalHours = Math.floor((totalTimeSavingMin * totalCoeff * guards) / 60);
        animateValue('res-hours', finalHours);

        // 視覚化 (人間換算)
        // 令和7年度 交通誘導警備員A 全国平均日当などを参考に設定
        const guardUnitPrice = 17931; 
        const equivalentGuards = Math.floor(finalAmount / guardUnitPrice);
        const countSpan = document.getElementById('pv-count');
        if (countSpan) countSpan.innerText = equivalentGuards;

        const iconContainer = document.getElementById('pv-icons');
        if (iconContainer) {
            iconContainer.innerHTML = '';
            // 表示数制限（多すぎるとレイアウト崩れるため最大50）
            for (let i = 0; i < Math.min(equivalentGuards, 50); i++) {
                const icon = document.createElement('i');
                icon.className = 'fas fa-user pv-icon';
                iconContainer.appendChild(icon);
            }
        }
    };

    // 内部関数：選択項目に応じたプランテキストの出し分け
    function getPlanDetail(issues, count) {
        const isLarge = count >= 100;
        const key = issues.sort().join(',');

        // パターン別テキストマッピング
        const texts = {
            'control,edu,payroll': {
                title: isLarge ? '【大規模トータル経営DXプラン】' : '【標準トータル効率化プラン】',
                desc: isLarge ? '全拠点の管制・教育・給与を完全統合。多層構造の組織でもリアルタイムな収支管理を可能にする、経営基盤の抜本改革プランです。' : '日報・請求・給与をシームレスに連動させ、少人数の事務体制でもミスなく業務を完結。現場主義のパッケージプランです。'
            },
            'control': {
                title: isLarge ? '【大規模管制最適化プラン】' : '【現場管制DXプラン】',
                desc: isLarge ? '数百名規模の隊員配置をAIがサポート。拠点を跨いだ応援要請や、大規模現場の上下番管理を効率化する管制特化プランです。' : 'ホワイトボードや電話での管制から脱却。スマホ連携で配置ミスと連絡コストを最小化し、管制業務の属人化を防ぎます。'
            },
            'edu': {
                title: '【法令遵守・監査対策プラン】',
                desc: '警備業法に特化した教育管理を実現。複雑な実施簿の自動生成とアラート機能で、監査担当者の心理的負担をゼロにします。'
            },
            'payroll': {
                title: '【バックオフィス自動化プラン】',
                desc: '警備業特有の複雑な手当計算や請求処理を自動化。月末に集中する事務残業を根絶し、正確な原価管理を可能にします。'
            },
            'control,edu': {
                title: '【現場管理・コンプラ強化プラン】',
                desc: '管制の効率化と法的書類の整備を同時に実現。現場の稼働と教育状況を連動させ、法令違反のリスクをシステムで遮断します。'
            },
            'control,payroll': {
                title: '【採算重視・収支改善プラン】',
                desc: '配置データと給与・請求を直結。現場ごとの粗利を当日中に可視化し、収支の「どんぶり勘定」を解消する収益改善プランです。'
            },
            'edu,payroll': {
                title: '【事務労務・完全ガードプラン】',
                desc: '教育実施簿と給与計算の二重入力を廃止。バックオフィス業務のミスを徹底的に排除し、事務部門の生産性を最大化します。'
            }
        };

        return texts[key] || {
            title: isLarge ? '【大規模運用最適化プラン】' : '【標準業務効率化プラン】',
            desc: '貴社の課題に合わせた最適な構成をご提案します。まずは無料デモにて実際の操作感をご覧ください。'
        };
    }

    // イベントリスナー登録
    guardsInput.addEventListener('input', runDiagnosis);
    issueChecks.forEach(c => c.addEventListener('change', runDiagnosis));
    methodRadios.forEach(r => r.addEventListener('change', runDiagnosis));
    typeChecks.forEach(c => c.addEventListener('change', runDiagnosis));
    
    // 初回実行
    runDiagnosis();
}

/* PDFレポート生成 */
function generatePDFReport() {
    const guards = document.getElementById('diag-guards').value;
    const amount = document.getElementById('res-amount').innerText;
    const hours = document.getElementById('res-hours').innerText;
    
    // UIフィードバック
    const btn = document.querySelector('.diagnosis-result .btn-white') || document.activeElement;
    
    let originalContent = '';
    if (btn) {
        originalContent = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 生成中...';
        btn.disabled = true;
    }

    // 擬似的な生成遅延
    setTimeout(() => {
        alert(`【レポート生成完了】\n・想定削減額：月間 ${amount} 円\n・想定削減時間：月間 ${hours} 時間\n・対象規模：${guards} 名\n\n貴社の社名入り詳細資料をPDFとして出力します。`);
        
        if (btn) {
            btn.innerHTML = originalContent;
            btn.disabled = false;
        }
    }, 1500);
}

/* 問い合わせへの反映 */
function inquireWithDiagnosis() {
    // 診断結果の値を取得
    const guards = document.getElementById('diag-guards').value;
    const amount = document.getElementById('res-amount').innerText;
    const hours = document.getElementById('res-hours').innerText;
    const adviceBox = document.getElementById('diagnosis-advice-box');
    const adviceText = adviceBox ? adviceBox.innerText : "なし";

    let typeText = [];
    document.querySelectorAll('input[name="biz-type"]:checked').forEach(r => {
        typeText.push(r.nextElementSibling.innerText.trim());
    });

    let methodText = "";
    document.querySelectorAll('input[name="current-method"]:checked').forEach(r => {
        const span = r.nextElementSibling.querySelector('span');
        methodText = span ? span.innerText : r.nextElementSibling.innerText.trim();
    });

    // フォームへ入力
    const msg = `【Web診断結果からの相談】\n・隊員規模: ${guards}名\n・種別: ${typeText.join(', ')}\n・現状: ${methodText}\n・削減額: ¥${amount}/月 (${hours}時間)\n・アドバイス: ${adviceText}\n\n詳細なデモとお見積りを希望します。`;
    const textArea = document.getElementById('contact-msg');
    if (textArea) textArea.value = msg;
    
    openModal();
}

/* グラフアニメーション */
function initBarAnimation() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                bar.style.width = bar.getAttribute('data-width');
                observer.unobserve(bar);
            }
        });
    }, {
        threshold: 0.5
    });
    document.querySelectorAll('.animate-bar').forEach(bar => observer.observe(bar));
}

/* モーダル表示制御 */
function openModal() {
    const modal = document.getElementById('contactModal');
    if (modal) modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('contactModal');
    if (modal) modal.classList.remove('active');
}

window.onclick = function(event) {
    const modal = document.getElementById('contactModal');
    if (event.target == modal) closeModal();
}

/* 試算根拠の表示 (Diagnosis Section) */
function toggleCalcDetails() {
    const box = document.getElementById('calc-details');
    const icon = document.getElementById('toggle-icon');
    if (!box) return;
    
    const isHidden = box.style.display === 'none' || box.style.display === '';
    box.style.display = isHidden ? 'block' : 'none';
    
    if (icon) {
        icon.classList.toggle('fa-chevron-down', !isHidden);
        icon.classList.toggle('fa-chevron-up', isHidden);
    }
}

/* 算出根拠データの表示切替 (Workload Comparison Section) */
function toggleEvidence() {
    const body = document.getElementById('evidence-body');
    const icon = document.getElementById('evidence-toggle-icon');
    
    if (body.style.display === 'none' || body.style.display === '') {
        body.style.display = 'flex';
        if (icon) {
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
        }
    } else {
        body.style.display = 'none';
        if (icon) {
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
        }
    }
}