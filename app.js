/**
 * High School Teacher Workload Calculator - Main Application Engine
 * מנוע אפליקציית חישוב משרות ושעות מורים בתיכון
 */

// Application State
const state = {
  currentLang: localStorage.getItem('school_workload_lang') || 'he',
  activeTab: 'calculator',
  currentTeacher: {
    name: '',
    id: '',
    age: 42,
    reform: 'combined', // 'oz', 'ofek', 'combined'
    ofekType: 'junior_high', // 'junior_high', 'primary'
    frontalOz: 12,
    frontalOfek: 10,
    isMother: false,
    roleEducator: false,
    roleGradeCoord: false,
    roleSubjectCoord: false,
    otherRoleHours: 0
  },
  editingId: null,
  roster: [],
  rosterSearch: '',
  rosterFilterReform: 'all',
  rosterFilterStatus: 'all',
  
  // Reverse Planner State
  reverseTargetPct: 100,
  reverseAge: 45,
  reverseReform: 'combined',
  reverseSplitRatio: 0.5
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  loadRosterFromStorage();
  bindEvents();
  renderCurrentCalculation();
  renderRoster();
  calculateReversePlanner();
});

// Translation Helper
function t(key) {
  const dict = TRANSLATIONS[state.currentLang] || TRANSLATIONS.he;
  return dict[key] || TRANSLATIONS.he[key] || key;
}

// Language Switcher
function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) return;
  state.currentLang = lang;
  localStorage.setItem('school_workload_lang', lang);
  
  // Set HTML attributes
  const isRtl = (lang === 'he');
  document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lang);

  // Update UI texts
  applyTranslations();
  renderCurrentCalculation();
  renderRoster();
  calculateReversePlanner();
  updateAgeReductionHint();
}

function initLanguage() {
  setLanguage(state.currentLang);
  const langSelect = document.getElementById('langSelect');
  if (langSelect) {
    langSelect.value = state.currentLang;
  }
}

function applyTranslations() {
  // Elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.innerHTML = t(key);
  });

  // Elements with data-i18n-placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.setAttribute('placeholder', t(key));
  });

  // Elements with data-i18n-title
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    el.setAttribute('title', t(key));
  });
}

// Bind User Interface Events
function bindEvents() {
  // Language Selector
  const langSelect = document.getElementById('langSelect');
  if (langSelect) {
    langSelect.addEventListener('change', (e) => setLanguage(e.target.value));
  }

  // Navigation Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tabName = btn.getAttribute('data-tab');
      switchTab(tabName);
    });
  });

  // Single Teacher Form Inputs
  const bindInput = (id, prop, isNumber = false, isCheckbox = false) => {
    const el = document.getElementById(id);
    if (!el) return;
    const updateHandler = () => {
      if (isCheckbox) {
        state.currentTeacher[prop] = el.checked;
      } else if (isNumber) {
        state.currentTeacher[prop] = Math.max(0, parseFloat(el.value) || 0);
      } else {
        state.currentTeacher[prop] = el.value;
      }
      renderCurrentCalculation();
      updateAgeReductionHint();
    };
    el.addEventListener('input', updateHandler);
    el.addEventListener('change', updateHandler);
  };

  bindInput('teacherNameInput', 'name');
  bindInput('teacherIdInput', 'id');
  bindInput('teacherAgeInput', 'age', true);
  bindInput('frontalOzInput', 'frontalOz', true);
  bindInput('frontalOfekInput', 'frontalOfek', true);
  bindInput('otherRoleHoursInput', 'otherRoleHours', true);
  bindInput('isMotherInput', 'isMother', false, true);
  bindInput('roleEducatorInput', 'roleEducator', false, true);
  bindInput('roleGradeCoordInput', 'roleGradeCoord', false, true);
  bindInput('roleSubjectCoordInput', 'roleSubjectCoord', false, true);
  bindInput('countRolesInPercentageInput', 'countRolesInPercentage', false, true);

  // Reform Selection Cards
  document.querySelectorAll('.reform-card').forEach(card => {
    card.addEventListener('click', () => {
      const reformValue = card.getAttribute('data-reform');
      setReform(reformValue);
    });
  });

  // Reset Form Button
  const resetBtn = document.getElementById('resetFormBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetCurrentTeacher);
  }

  // Save to Roster Button
  const saveBtn = document.getElementById('saveToRosterBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', saveCurrentTeacherToRoster);
  }

  // Cancel Edit Button
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', cancelEditing);
  }

  // Roster Search and Filters
  const rosterSearch = document.getElementById('rosterSearchInput');
  if (rosterSearch) {
    rosterSearch.addEventListener('input', (e) => {
      state.rosterSearch = e.target.value.trim().toLowerCase();
      renderRoster();
    });
  }

  const filterReform = document.getElementById('filterReformSelect');
  if (filterReform) {
    filterReform.addEventListener('change', (e) => {
      state.rosterFilterReform = e.target.value;
      renderRoster();
    });
  }

  const filterStatus = document.getElementById('filterStatusSelect');
  if (filterStatus) {
    filterStatus.addEventListener('change', (e) => {
      state.rosterFilterStatus = e.target.value;
      renderRoster();
    });
  }

  // Demo Data & Clear Roster Buttons
  const loadDemoBtn = document.getElementById('loadDemoBtn');
  if (loadDemoBtn) {
    loadDemoBtn.addEventListener('click', loadDemoData);
  }

  const clearRosterBtn = document.getElementById('clearRosterBtn');
  if (clearRosterBtn) {
    clearRosterBtn.addEventListener('click', clearAllTeachers);
  }

  // Export Buttons
  const exportExcelBtn = document.getElementById('exportExcelBtn');
  if (exportExcelBtn) {
    exportExcelBtn.addEventListener('click', exportRosterToCSV);
  }

  // Print Buttons
  const printReportBtn = document.getElementById('printReportBtn');
  if (printReportBtn) {
    printReportBtn.addEventListener('click', () => window.print());
  }

  const printCurrentBtn = document.getElementById('printCurrentTeacherBtn');
  if (printCurrentBtn) {
    printCurrentBtn.addEventListener('click', () => {
      printTeacherOfficialSheet();
    });
  }

  // Reverse Planner Inputs
  const reverseTarget = document.getElementById('reverseTargetInput');
  if (reverseTarget) {
    reverseTarget.addEventListener('input', (e) => {
      state.reverseTargetPct = parseFloat(e.target.value) || 100;
      calculateReversePlanner();
    });
  }

  const reverseAge = document.getElementById('reverseAgeInput');
  if (reverseAge) {
    reverseAge.addEventListener('input', (e) => {
      state.reverseAge = parseFloat(e.target.value) || 45;
      calculateReversePlanner();
    });
  }

  const reverseReform = document.getElementById('reverseReformSelect');
  if (reverseReform) {
    reverseReform.addEventListener('change', (e) => {
      state.reverseReform = e.target.value;
      toggleReverseSplitOptions();
      calculateReversePlanner();
    });
  }

  const reverseSplit = document.getElementById('reverseSplitSelect');
  if (reverseSplit) {
    reverseSplit.addEventListener('change', (e) => {
      state.reverseSplitRatio = parseFloat(e.target.value) || 0.5;
      calculateReversePlanner();
    });
  }
}

// Switch Active Tab
function switchTab(tabName) {
  state.activeTab = tabName;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
  });
  document.querySelectorAll('.tab-content').forEach(section => {
    section.classList.toggle('hidden', section.id !== `tabSection-${tabName}`);
  });
}

// Set Reform Type in Single Teacher Form
function setReform(reform) {
  state.currentTeacher.reform = reform;
  document.querySelectorAll('.reform-card').forEach(card => {
    card.classList.toggle('selected', card.getAttribute('data-reform') === reform);
  });

  const ofekContainer = document.getElementById('ofekHoursContainer');
  const ozContainer = document.getElementById('ozHoursContainer');

  if (reform === 'oz') {
    if (ofekContainer) ofekContainer.classList.add('hidden');
    if (ozContainer) ozContainer.classList.remove('hidden');
  } else if (reform === 'ofek') {
    if (ofekContainer) ofekContainer.classList.remove('hidden');
    if (ozContainer) ozContainer.classList.add('hidden');
  } else {
    // combined
    if (ofekContainer) ofekContainer.classList.remove('hidden');
    if (ozContainer) ozContainer.classList.remove('hidden');
  }

  renderCurrentCalculation();
  updateAgeReductionHint();
}

// Calculate Total Special Role Hours
function calculateRoleHoursTotal(tObj) {
  let hours = Math.max(0, parseFloat(tObj.otherRoleHours) || 0);
  if (tObj.roleEducator) hours += 2; // מחנך כיתה = 2 ש"ש בתקן
  if (tObj.roleGradeCoord) hours += 3; // רכז שכבה = 3 ש"ש בתקן
  if (tObj.roleSubjectCoord) hours += 2; // רכז מקצוע = 2 ש"ש בתקן
  return Number(hours.toFixed(2));
}

// Render Age Reduction Hint
function updateAgeReductionHint() {
  const age = state.currentTeacher.age || 40;
  const hintEl = document.getElementById('ageHoursHintBadge');
  if (!hintEl) return;

  const ozRule = MOE_RULES.OZ_LE_TMURA.getStructureByAge(age);
  const ofekRule = MOE_RULES.OFEK_HADASH_JUNIOR_HIGH.getStructureByAge(age);

  if (ozRule.ageReduction > 0 || ofekRule.ageReduction > 0) {
    let text = '';
    if (state.currentLang === 'he') {
      text = `🎉 זכאות לשעות גיל: הפחתה של ${Math.max(ozRule.ageReduction, ofekRule.ageReduction)} שעות פרונטליות שהומרו לשעות שהייה (מדרגת גיל ${ozRule.ageBracket}).`;
    } else if (state.currentLang === 'ru') {
      text = `🎉 Возрастная льгота: сокращение на ${Math.max(ozRule.ageReduction, ofekRule.ageReduction)} фронтальных часа в пользу часов пребывания (возрастная категория ${ozRule.ageBracket}).`;
    } else {
      text = `🎉 Age entitlement: reduction of ${Math.max(ozRule.ageReduction, ofekRule.ageReduction)} frontal hours transferred to staying hours (age bracket ${ozRule.ageBracket}).`;
    }
    hintEl.innerHTML = text;
    hintEl.classList.remove('hidden');
  } else {
    hintEl.classList.add('hidden');
  }
}

// Render Current Calculation Results Card & Metrics
function renderCurrentCalculation() {
  const tObj = state.currentTeacher;
  const roleHours = calculateRoleHoursTotal(tObj);

  const calc = MOE_RULES.calculateWorkload({
    age: tObj.age,
    reform: tObj.reform,
    frontalOz: (tObj.reform === 'ofek') ? 0 : tObj.frontalOz,
    frontalOfek: (tObj.reform === 'oz') ? 0 : tObj.frontalOfek,
    isMother: tObj.isMother,
    roleEducator: tObj.roleEducator,
    roleGradeCoord: tObj.roleGradeCoord,
    roleSubjectCoord: tObj.roleSubjectCoord,
    otherRoleHours: tObj.otherRoleHours,
    countRolesInPercentage: (tObj.countRolesInPercentage !== false)
  });

  // Store calculated in state for save
  state.currentCalculated = calc;

  // Percentage Display
  const pctEl = document.getElementById('resJobPercentage');
  if (pctEl) {
    pctEl.innerText = `${calc.total.jobPercentage.toFixed(2)}%`;
  }

  // Progress Bar
  const progBar = document.getElementById('resProgressBar');
  if (progBar) {
    const widthPct = Math.min(100, (calc.total.jobPercentage / 140) * 100);
    progBar.style.width = `${widthPct}%`;

    // Colors
    if (calc.total.jobPercentage > 125) {
      progBar.className = 'progress-bar-fill h-full bg-red-600';
    } else if (calc.total.jobPercentage > 100) {
      progBar.className = 'progress-bar-fill h-full bg-amber-500';
    } else if (calc.total.jobPercentage >= 99.9) {
      progBar.className = 'progress-bar-fill h-full bg-emerald-600';
    } else {
      progBar.className = 'progress-bar-fill h-full bg-blue-600';
    }
  }

  // Status Badge
  const badgeEl = document.getElementById('resStatusBadge');
  if (badgeEl) {
    badgeEl.className = 'badge-status';
    if (calc.total.status === 'exceeded') {
      badgeEl.classList.add('badge-exceeded');
      badgeEl.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-red-600"></span> ${t('statusExceeded')}`;
    } else if (calc.total.status === 'overtime') {
      badgeEl.classList.add('badge-overtime');
      badgeEl.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-amber-600"></span> ${t('statusOvertime')}`;
    } else if (calc.total.status === 'full_time') {
      badgeEl.classList.add('badge-full-time');
      badgeEl.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-emerald-600"></span> ${t('statusFullTime')}`;
    } else {
      badgeEl.classList.add('badge-part-time');
      badgeEl.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-blue-600"></span> ${t('statusPartTime')}`;
    }
  }

  // Numeric Cards
  const setCardValue = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = (typeof val === 'number') ? val.toFixed(1) : val;
  };

  setCardValue('resFrontalHours', calc.total.frontalHours);
  setCardValue('resRoleHours', calc.total.roleHours);
  setCardValue('resIndividualHours', calc.total.individualHours);
  setCardValue('resStayingHours', calc.total.stayingHours);
  setCardValue('resWeeklyHours', calc.total.totalWeeklyHours);
  setCardValue('resOvertimeHours', calc.total.overtimeFrontalHours);
  setCardValue('resAgeHours', calc.total.ageHoursAwarded);

  // Update Role Hours Pill in Input Area
  const rolePill = document.getElementById('roleHoursTotalPill');
  if (rolePill) {
    rolePill.innerText = `${calc.total.roleHours.toFixed(1)} ש"ש`;
    rolePill.className = calc.total.roleHours > 0 
      ? 'text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-600 text-white' 
      : 'text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-900';
  }

  // Update Dynamic Mother Hours Status Hint
  const motherBadge = document.getElementById('motherHourHintBadge');
  if (motherBadge) {
    if (tObj.isMother) {
      motherBadge.classList.remove('hidden');
      if (calc.total.motherHourEligible) {
        motherBadge.className = 'mt-2 p-2 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5';
        motherBadge.innerHTML = `<span>👩‍👧</span> <span><strong>זכאות פעילה:</strong> קיצור 2 שעות שהייה שבועיות בביה"ס (שבוע מקוצר של ${calc.total.totalWeeklyHours.toFixed(1)} ש"ש ללא פגיעה בשכר ובמשרה).</span>`;
      } else {
        motherBadge.className = 'mt-2 p-2 rounded-lg text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1.5';
        motherBadge.innerHTML = `<span>⚠️</span> <span><strong>שימי לב:</strong> משרת אם מוענקת לפי משה"ח רק מ-79% משרה ומעלה (כרגע המשרה היא ${calc.total.jobPercentage.toFixed(1)}%).</span>`;
      }
    } else {
      motherBadge.classList.add('hidden');
    }
  }

  // Status Notice & Recommendations
  const noticeBox = document.getElementById('resNoticeBox');
  if (noticeBox) {
    let motherHtml = '';
    if (calc.total.motherHourEligible) {
      motherHtml = `
        <div class="p-2.5 rounded-lg bg-pink-50 border border-pink-200 text-pink-900 text-xs font-bold flex items-center justify-between">
          <span class="flex items-center gap-1.5"><span>👩‍👧</span> <span>הטבת משרת אם פעילה: הופחתו 2 שעות שהייה שבועיות</span></span>
          <span class="bg-pink-100 text-pink-800 px-2 py-0.5 rounded text-[11px] font-black">-2 ש"ש שהייה</span>
        </div>
      `;
    }

    let roleHtml = '';
    if (calc.total.roleHours > 0) {
      roleHtml = `
        <div class="p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold flex items-center justify-between">
          <span class="flex items-center gap-1.5"><span>🎖️</span> <span>שעות תפקיד וגמול במערכת: <strong>${calc.total.roleHours.toFixed(1)} ש"ש</strong></span></span>
          <span class="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-[11px] font-bold">${calc.roleDetails.countInPercentage ? 'משוקלל באחוז המשרה' : 'שעות נוכחות'}</span>
        </div>
      `;
    }

    let statusHtml = '';
    if (calc.total.status === 'exceeded') {
      statusHtml = `<div class="p-3 rounded-lg border border-red-300 bg-red-50 text-red-800 text-sm">⚠️ <strong>${t('statusExceeded')}</strong>: ${t('exceededNotice')}</div>`;
    } else if (calc.total.status === 'overtime') {
      statusHtml = `<div class="p-3 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-sm">ℹ️ <strong>${t('statusOvertime')}</strong>: ${t('overtimeNotice')} (${calc.total.overtimePercentage.toFixed(1)}% / ${calc.total.overtimeFrontalHours.toFixed(1)} ${t('hours')} שעות נוספות)</div>`;
    } else if (calc.total.status === 'part_time') {
      let missingDetails = '';
      if (tObj.reform === 'oz') {
        missingDetails = `${calc.total.missingFrontalFor100.toFixed(1)} ${t('hoursInOz')}`;
      } else if (tObj.reform === 'ofek') {
        missingDetails = `${calc.total.missingFrontalFor100.toFixed(1)} ${t('hoursInOfek')}`;
      } else {
        missingDetails = `${calc.total.missingFrontalOz.toFixed(1)} ${t('hoursInOz')} או ${calc.total.missingFrontalOfek.toFixed(1)} ${t('hoursInOfek')}`;
      }
      statusHtml = `<div class="p-3 rounded-lg border border-blue-200 bg-blue-50 text-blue-900 text-sm">💡 ${t('missingHoursNotice')} <strong>${missingDetails}</strong>.</div>`;
    } else {
      statusHtml = `<div class="p-3 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-900 text-sm">✅ משרה מלאה ומאוזנת בדיוק 100%! ללא חוסר או שעות נוספות.</div>`;
    }

    noticeBox.innerHTML = motherHtml + roleHtml + statusHtml;
    noticeBox.className = 'space-y-2 mb-5';
    noticeBox.classList.remove('hidden');
  }

  // Render Reform Breakdown Table
  renderReformBreakdownTable(calc);
}

// Render Breakdown Table in Results
function renderReformBreakdownTable(calc) {
  const tbody = document.getElementById('resBreakdownTableBody');
  if (!tbody) return;

  let html = '';

  if (calc.ofek.active) {
    html += `
      <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
        <td class="p-3 font-semibold text-slate-800 flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-blue-500"></span>
          ${t('reformOfekOnly')}
        </td>
        <td class="p-3 text-center">${calc.ofek.baseFrontal} ${t('hours')}</td>
        <td class="p-3 text-center font-bold text-blue-700">${calc.ofek.frontal.toFixed(1)}</td>
        <td class="p-3 text-center">${calc.ofek.individual.toFixed(1)}</td>
        <td class="p-3 text-center">${calc.ofek.staying.toFixed(1)}</td>
        <td class="p-3 text-center font-bold text-slate-900">${calc.ofek.percentage.toFixed(2)}%</td>
        <td class="p-3 text-center font-medium">${calc.ofek.totalHours.toFixed(1)}</td>
      </tr>
    `;
  }

  if (calc.oz.active) {
    html += `
      <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
        <td class="p-3 font-semibold text-slate-800 flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-indigo-500"></span>
          ${t('reformOzOnly')}
        </td>
        <td class="p-3 text-center">${calc.oz.baseFrontal} ${t('hours')}</td>
        <td class="p-3 text-center font-bold text-indigo-700">${calc.oz.frontal.toFixed(1)}</td>
        <td class="p-3 text-center">${calc.oz.individual.toFixed(1)}</td>
        <td class="p-3 text-center">${calc.oz.staying.toFixed(1)}</td>
        <td class="p-3 text-center font-bold text-slate-900">${calc.oz.percentage.toFixed(2)}%</td>
        <td class="p-3 text-center font-medium">${calc.oz.totalHours.toFixed(1)}</td>
      </tr>
    `;
  }

  if (calc.total.roleHours > 0) {
    html += `
      <tr class="border-b border-purple-100 bg-purple-50/50 hover:bg-purple-100/50 transition-colors">
        <td class="p-3 font-semibold text-purple-900 flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-purple-600"></span>
          ${t('roleHoursCard')}
        </td>
        <td class="p-3 text-center text-slate-400">-</td>
        <td class="p-3 text-center font-bold text-purple-700">${calc.total.roleHours.toFixed(1)}</td>
        <td class="p-3 text-center text-slate-400">-</td>
        <td class="p-3 text-center text-slate-400">-</td>
        <td class="p-3 text-center font-bold text-purple-900">${calc.roleDetails.countInPercentage ? 'נכלל במשרה' : '-'}</td>
        <td class="p-3 text-center font-medium">${calc.total.roleHours.toFixed(1)}</td>
      </tr>
    `;
  }

  if (calc.total.motherReductionHours > 0) {
    html += `
      <tr class="border-b border-pink-100 bg-pink-50/40 hover:bg-pink-100/40 transition-colors">
        <td class="p-3 font-semibold text-pink-900 flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-pink-500"></span>
          הטבת משרת אם (קיצור שהייה)
        </td>
        <td class="p-3 text-center text-slate-400">-</td>
        <td class="p-3 text-center text-slate-400">-</td>
        <td class="p-3 text-center text-slate-400">-</td>
        <td class="p-3 text-center font-bold text-pink-700">-${calc.total.motherReductionHours.toFixed(1)}</td>
        <td class="p-3 text-center font-bold text-emerald-700">100% שכר</td>
        <td class="p-3 text-center font-bold text-pink-700">-${calc.total.motherReductionHours.toFixed(1)}</td>
      </tr>
    `;
  }

  // Total summary row
  html += `
    <tr class="bg-slate-100/80 font-bold text-slate-900 border-t-2 border-slate-300">
      <td class="p-3 flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-slate-800"></span>
        סה"כ משוקלל / Total
      </td>
      <td class="p-3 text-center">-</td>
      <td class="p-3 text-center text-primary font-black">${(calc.total.frontalHours + (calc.roleDetails.countInPercentage ? calc.total.roleHours : 0)).toFixed(1)}</td>
      <td class="p-3 text-center">${calc.total.individualHours.toFixed(1)}</td>
      <td class="p-3 text-center">${calc.total.stayingHours.toFixed(1)}</td>
      <td class="p-3 text-center text-primary font-black">${calc.total.jobPercentage.toFixed(2)}%</td>
      <td class="p-3 text-center font-black">${calc.total.totalWeeklyHours.toFixed(1)}</td>
    </tr>
  `;

  tbody.innerHTML = html;
}

// Reset Current Teacher Fields
function resetCurrentTeacher() {
  state.currentTeacher = {
    name: '',
    id: '',
    age: 42,
    reform: 'combined',
    ofekType: 'junior_high',
    frontalOz: 12,
    frontalOfek: 10,
    isMother: false,
    roleEducator: false,
    roleGradeCoord: false,
    roleSubjectCoord: false,
    otherRoleHours: 0,
    countRolesInPercentage: true
  };
  state.editingId = null;

  document.getElementById('teacherNameInput').value = '';
  document.getElementById('teacherIdInput').value = '';
  document.getElementById('teacherAgeInput').value = 42;
  document.getElementById('frontalOzInput').value = 12;
  document.getElementById('frontalOfekInput').value = 10;
  document.getElementById('otherRoleHoursInput').value = 0;
  document.getElementById('isMotherInput').checked = false;
  document.getElementById('roleEducatorInput').checked = false;
  document.getElementById('roleGradeCoordInput').checked = false;
  document.getElementById('roleSubjectCoordInput').checked = false;
  const countRolesEl = document.getElementById('countRolesInPercentageInput');
  if (countRolesEl) countRolesEl.checked = true;

  setReform('combined');
  toggleEditModeButtons(false);
  renderCurrentCalculation();
}

// Save Current Teacher to Roster
function saveCurrentTeacherToRoster() {
  const tObj = state.currentTeacher;
  const name = tObj.name ? tObj.name.trim() : '';

  if (!name) {
    alert(t('pleaseEnterName'));
    document.getElementById('teacherNameInput').focus();
    return;
  }

  const calc = state.currentCalculated || MOE_RULES.calculateWorkload({
    age: tObj.age,
    reform: tObj.reform,
    frontalOz: tObj.frontalOz,
    frontalOfek: tObj.frontalOfek
  });

  if (calc.total.frontalHours <= 0) {
    alert(t('pleaseEnterFrontal'));
    return;
  }

  const teacherRecord = {
    id: state.editingId || 't_' + Date.now(),
    name: name,
    code: tObj.id || '',
    age: tObj.age,
    reform: tObj.reform,
    ofekType: tObj.ofekType,
    frontalOz: tObj.frontalOz,
    frontalOfek: tObj.frontalOfek,
    isMother: tObj.isMother,
    roleEducator: tObj.roleEducator,
    roleGradeCoord: tObj.roleGradeCoord,
    roleSubjectCoord: tObj.roleSubjectCoord,
    otherRoleHours: tObj.otherRoleHours,
    countRolesInPercentage: (tObj.countRolesInPercentage !== false),
    calculated: calc,
    updatedAt: new Date().toISOString()
  };

  if (state.editingId) {
    const idx = state.roster.findIndex(x => x.id === state.editingId);
    if (idx !== -1) {
      state.roster[idx] = teacherRecord;
    }
    state.editingId = null;
    toggleEditModeButtons(false);
    showToast(t('teacherUpdatedAlert'));
  } else {
    state.roster.unshift(teacherRecord);
    showToast(t('teacherSavedAlert'));
  }

  saveRosterToStorage();
  renderRoster();
}

// Edit Teacher from Roster
function editTeacher(id) {
  const item = state.roster.find(x => x.id === id);
  if (!item) return;

  state.editingId = item.id;
  state.currentTeacher = {
    name: item.name,
    id: item.code || '',
    age: item.age,
    reform: item.reform,
    ofekType: item.ofekType || 'junior_high',
    frontalOz: item.frontalOz || 0,
    frontalOfek: item.frontalOfek || 0,
    isMother: item.isMother || false,
    roleEducator: item.roleEducator || false,
    roleGradeCoord: item.roleGradeCoord || false,
    roleSubjectCoord: item.roleSubjectCoord || false,
    otherRoleHours: item.otherRoleHours || 0,
    countRolesInPercentage: (item.countRolesInPercentage !== false)
  };

  // Populate inputs
  document.getElementById('teacherNameInput').value = state.currentTeacher.name;
  document.getElementById('teacherIdInput').value = state.currentTeacher.id;
  document.getElementById('teacherAgeInput').value = state.currentTeacher.age;
  document.getElementById('frontalOzInput').value = state.currentTeacher.frontalOz;
  document.getElementById('frontalOfekInput').value = state.currentTeacher.frontalOfek;
  document.getElementById('otherRoleHoursInput').value = state.currentTeacher.otherRoleHours;
  document.getElementById('isMotherInput').checked = state.currentTeacher.isMother;
  document.getElementById('roleEducatorInput').checked = state.currentTeacher.roleEducator;
  document.getElementById('roleGradeCoordInput').checked = state.currentTeacher.roleGradeCoord;
  document.getElementById('roleSubjectCoordInput').checked = state.currentTeacher.roleSubjectCoord;
  const countRolesEl = document.getElementById('countRolesInPercentageInput');
  if (countRolesEl) countRolesEl.checked = state.currentTeacher.countRolesInPercentage;

  setReform(state.currentTeacher.reform);
  toggleEditModeButtons(true);
  switchTab('calculator');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelEditing() {
  resetCurrentTeacher();
}

function toggleEditModeButtons(isEditing) {
  const saveBtn = document.getElementById('saveToRosterBtn');
  const cancelBtn = document.getElementById('cancelEditBtn');
  if (saveBtn) {
    saveBtn.innerText = isEditing ? t('updateTeacher') : t('saveToRoster');
    saveBtn.className = isEditing 
      ? 'px-6 py-2.5 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-md transition-all'
      : 'px-6 py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-primary-hover shadow-md transition-all';
  }
  if (cancelBtn) {
    cancelBtn.classList.toggle('hidden', !isEditing);
  }
}

// Delete Teacher from Roster
function deleteTeacher(id) {
  if (confirm(t('confirmDelete'))) {
    state.roster = state.roster.filter(x => x.id !== id);
    saveRosterToStorage();
    renderRoster();
  }
}

// Clear All Teachers
function clearAllTeachers() {
  if (confirm(t('confirmClearAll'))) {
    state.roster = [];
    saveRosterToStorage();
    renderRoster();
  }
}

// Render Roster Table and Summary
function renderRoster() {
  const tbody = document.getElementById('rosterTableBody');
  const emptyState = document.getElementById('rosterEmptyState');
  if (!tbody) return;

  // Filter roster
  let filtered = [...state.roster];

  if (state.rosterSearch) {
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(state.rosterSearch) ||
      (item.code && item.code.toLowerCase().includes(state.rosterSearch))
    );
  }

  if (state.rosterFilterReform !== 'all') {
    filtered = filtered.filter(item => item.reform === state.rosterFilterReform);
  }

  if (state.rosterFilterStatus === 'overtime') {
    filtered = filtered.filter(item => item.calculated.total.jobPercentage > 100);
  }

  // Update Summary Stats
  const totalTeachers = state.roster.length;
  let sumPct = 0;
  let sumFrontal = 0;
  let sumOvertime = 0;

  state.roster.forEach(tItem => {
    sumPct += tItem.calculated.total.jobPercentage;
    sumFrontal += tItem.calculated.total.frontalHours;
    sumOvertime += tItem.calculated.total.overtimeFrontalHours;
  });

  const avgPct = totalTeachers > 0 ? (sumPct / totalTeachers).toFixed(1) : 0;

  const countEl = document.getElementById('statTotalTeachers');
  if (countEl) countEl.innerText = totalTeachers;
  const avgEl = document.getElementById('statAvgPct');
  if (avgEl) avgEl.innerText = `${avgPct}%`;
  const frontalEl = document.getElementById('statTotalFrontal');
  if (frontalEl) frontalEl.innerText = sumFrontal.toFixed(1);
  const otEl = document.getElementById('statTotalOvertime');
  if (otEl) otEl.innerText = sumOvertime.toFixed(1);

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  let rowsHtml = '';
  filtered.forEach(item => {
    const c = item.calculated.total;
    
    // Reform Badge
    let reformBadge = '';
    if (item.reform === 'oz') {
      reformBadge = `<span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">${t('reformOzOnly')}</span>`;
    } else if (item.reform === 'ofek') {
      reformBadge = `<span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">${t('reformOfekOnly')}</span>`;
    } else {
      reformBadge = `<span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200">${t('reformCombined')}</span>`;
    }

    // Percentage badge
    let pctClass = 'text-blue-700';
    if (c.jobPercentage > 125) pctClass = 'text-red-700 font-black';
    else if (c.jobPercentage > 100) pctClass = 'text-amber-700 font-bold';
    else if (c.jobPercentage === 100) pctClass = 'text-emerald-700 font-black';

    rowsHtml += `
      <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
        <td class="p-3.5">
          <div class="font-bold text-slate-800">${item.name}</div>
          ${item.code ? `<div class="text-xs text-slate-400">ת"ז: ${item.code}</div>` : ''}
        </td>
        <td class="p-3.5 text-center font-medium">${item.age}</td>
        <td class="p-3.5">${reformBadge}</td>
        <td class="p-3.5 text-center font-bold text-base ${pctClass}">
          ${c.jobPercentage.toFixed(1)}%
        </td>
        <td class="p-3.5 text-center font-semibold text-slate-700">${c.frontalHours.toFixed(1)}</td>
        <td class="p-3.5 text-center text-slate-600">${c.individualHours.toFixed(1)}</td>
        <td class="p-3.5 text-center text-slate-600">${c.stayingHours.toFixed(1)}</td>
        <td class="p-3.5 text-center font-bold text-slate-800">${c.totalWeeklyHours.toFixed(1)}</td>
        <td class="p-3.5 text-center">
          ${c.overtimeFrontalHours > 0 
            ? `<span class="px-2 py-0.5 text-xs font-bold rounded-md bg-amber-100 text-amber-800">+${c.overtimeFrontalHours.toFixed(1)} ש"ש</span>` 
            : `<span class="text-slate-300">-</span>`}
        </td>
        <td class="p-3.5 text-center">
          ${c.ageHoursAwarded > 0 
            ? `<span class="px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald-100 text-emerald-800">${c.ageHoursAwarded.toFixed(1)} שעות</span>` 
            : `<span class="text-slate-300">-</span>`}
        </td>
        <td class="p-3.5 text-center">
          <div class="flex items-center justify-center gap-1.5">
            <button onclick="editTeacher('${item.id}')" class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-primary hover:text-white transition-all text-slate-700" title="${t('edit')}">
              ✏️ ${t('edit')}
            </button>
            <button onclick="deleteTeacher('${item.id}')" class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-red-600 hover:text-white transition-all text-slate-700" title="${t('delete')}">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = rowsHtml;
}

// Storage helpers
function saveRosterToStorage() {
  try {
    localStorage.setItem('school_teachers_roster_data', JSON.stringify(state.roster));
  } catch (e) {
    console.error('Failed to save to local storage', e);
  }
}

function loadRosterFromStorage() {
  try {
    const raw = localStorage.getItem('school_teachers_roster_data');
    if (raw) {
      state.roster = JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read from local storage', e);
    state.roster = [];
  }
}

// Load Realistic Demo Staff for High School Coordinator
function loadDemoData() {
  const demoTeachers = [
    {
      name: 'שרה לוי',
      code: '028475912',
      age: 48,
      reform: 'combined',
      ofekType: 'junior_high',
      frontalOz: 12,
      frontalOfek: 10,
      isMother: true,
      roleEducator: true,
      roleGradeCoord: false,
      roleSubjectCoord: false,
      otherRoleHours: 0
    },
    {
      name: 'דוד כהן',
      code: '015948372',
      age: 56, // Age reduction!
      reform: 'oz',
      ofekType: 'junior_high',
      frontalOz: 21, // 100% full time with age reduction
      frontalOfek: 0,
      isMother: false,
      roleEducator: false,
      roleGradeCoord: true,
      roleSubjectCoord: false,
      otherRoleHours: 0
    },
    {
      name: 'רחל גולדברג',
      code: '034829104',
      age: 38,
      reform: 'ofek',
      ofekType: 'junior_high',
      frontalOz: 0,
      frontalOfek: 21, // 100%
      isMother: true,
      roleEducator: true,
      roleGradeCoord: false,
      roleSubjectCoord: false,
      otherRoleHours: 0
    },
    {
      name: 'מיכאל אברמוביץ\'',
      code: '049182374',
      age: 53, // Age reduction 2 hours
      reform: 'combined',
      ofekType: 'junior_high',
      frontalOz: 14,
      frontalOfek: 12, // Overtime teacher!
      isMother: false,
      roleEducator: false,
      roleGradeCoord: false,
      roleSubjectCoord: true,
      otherRoleHours: 0
    },
    {
      name: 'מרים ששון',
      code: '058291047',
      age: 58, // Age reduction 4 hours in Oz!
      reform: 'oz',
      ofekType: 'junior_high',
      frontalOz: 20, // 100%
      frontalOfek: 0,
      isMother: false,
      roleEducator: false,
      roleGradeCoord: false,
      roleSubjectCoord: false,
      otherRoleHours: 0
    }
  ];

  state.roster = demoTeachers.map((t, idx) => {
    const calc = MOE_RULES.calculateWorkload({
      age: t.age,
      reform: t.reform,
      frontalOz: t.frontalOz,
      frontalOfek: t.frontalOfek,
      isMother: t.isMother,
      roleEducator: t.roleEducator,
      roleGradeCoord: t.roleGradeCoord,
      roleSubjectCoord: t.roleSubjectCoord,
      otherRoleHours: t.otherRoleHours,
      countRolesInPercentage: true
    });
    return {
      id: 'demo_' + idx + '_' + Date.now(),
      ...t,
      countRolesInPercentage: true,
      calculated: calc,
      updatedAt: new Date().toISOString()
    };
  });

  saveRosterToStorage();
  renderRoster();
  showToast(state.currentLang === 'he' ? '5 מורים לדוגמה נטענו בהצלחה!' : '5 sample teachers loaded!');
}

// Export to CSV / Excel with UTF-8 BOM
function exportRosterToCSV() {
  if (state.roster.length === 0) {
    alert(state.currentLang === 'he' ? 'אין מורים לייצוא' : 'No teachers to export');
    return;
  }

  const isHe = state.currentLang === 'he';
  const headers = isHe
    ? ['שם המורה', 'ת"ז / קוד', 'גיל', 'רפורמה', '% משרה', 'שעות פרונטליות', 'שעות פרטניות', 'שעות שהייה', 'סה"כ שבועיות', 'שעות נוספות', 'הפחתת שעות גיל', 'סטטוס']
    : ['Teacher Name', 'ID Code', 'Age', 'Reform', 'Job %', 'Frontal Hours', 'Individual Hours', 'Staying Hours', 'Weekly Total', 'Overtime Hours', 'Age Hours Reduction', 'Status'];

  const rows = state.roster.map(tItem => {
    const c = tItem.calculated.total;
    let reformName = tItem.reform;
    if (tItem.reform === 'oz') reformName = isHe ? 'עוז לתמורה' : 'Oz LeTmura';
    else if (tItem.reform === 'ofek') reformName = isHe ? 'אופק חדש' : 'Ofek Hadash';
    else reformName = isHe ? 'משרה משולבת' : 'Combined';

    return [
      `"${tItem.name.replace(/"/g, '""')}"`,
      `"${tItem.code || ''}"`,
      tItem.age,
      `"${reformName}"`,
      c.jobPercentage.toFixed(2),
      c.frontalHours.toFixed(1),
      c.individualHours.toFixed(1),
      c.stayingHours.toFixed(1),
      c.totalWeeklyHours.toFixed(1),
      c.overtimeFrontalHours.toFixed(1),
      c.ageHoursAwarded.toFixed(1),
      `"${c.statusLabelHe || c.status}"`
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `teachers_workload_roster_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Print Teacher Official Sheet
function printTeacherOfficialSheet() {
  const tObj = state.currentTeacher;
  const calc = state.currentCalculated || MOE_RULES.calculateWorkload({
    age: tObj.age,
    reform: tObj.reform,
    frontalOz: tObj.frontalOz,
    frontalOfek: tObj.frontalOfek,
    isMother: tObj.isMother,
    roleEducator: tObj.roleEducator,
    roleGradeCoord: tObj.roleGradeCoord,
    roleSubjectCoord: tObj.roleSubjectCoord,
    otherRoleHours: tObj.otherRoleHours,
    countRolesInPercentage: (tObj.countRolesInPercentage !== false)
  });

  const printArea = document.getElementById('printOnlyReportArea');
  if (!printArea) {
    window.print();
    return;
  }

  const isHe = state.currentLang === 'he';
  const now = new Date().toLocaleDateString('he-IL');

  printArea.innerHTML = `
    <div class="p-8 border-2 border-slate-300 rounded-xl max-w-4xl mx-auto my-6 bg-white">
      <div class="flex justify-between items-center border-b pb-4 mb-6">
        <div class="flex items-center gap-4">
          <img src="school-logo.png" alt="קמפוס עירוני רבין" class="h-20 w-auto object-contain">
          <div>
            <div class="text-xs font-black text-purple-900 tracking-wider">${t('schoolName')} | ${t('schoolMotto')}</div>
            <h1 class="text-2xl font-black text-slate-900">${t('officialReportHeader')}</h1>
            <p class="text-sm text-slate-500">${t('updatedMoeBadge')}</p>
          </div>
        </div>
        <div class="text-left text-sm text-slate-600">
          <div>${t('datePrinted')}: <strong>${now}</strong></div>
          <div>שנת לימודים: תשפ"ז / 2026-2027</div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
        <div>${t('teacherName')}: <strong class="text-lg">${tObj.name || 'ישראל ישראלי'}</strong></div>
        <div>${t('teacherId')}: <strong>${tObj.id || '-'}</strong></div>
        <div>${t('teacherAge')}: <strong>${tObj.age} (${t('yearsOld')})</strong></div>
        <div>${t('reformAffiliation')}: <strong>${tObj.reform === 'oz' ? t('reformOzOnly') : (tObj.reform === 'ofek' ? t('reformOfekOnly') : t('reformCombined'))}</strong></div>
      </div>

      <h3 class="text-lg font-bold mb-3 border-b pb-1">${t('calculationResults')}</h3>
      <table class="w-full text-center border-collapse border border-slate-300 mb-6 text-sm">
        <thead class="bg-slate-200">
          <tr>
            <th class="border border-slate-300 p-2">${t('tableReformCol')}</th>
            <th class="border border-slate-300 p-2">${t('tableBaseFrontalCol')}</th>
            <th class="border border-slate-300 p-2">${t('tableActualFrontalCol')}</th>
            <th class="border border-slate-300 p-2">${t('tableIndividualCol')}</th>
            <th class="border border-slate-300 p-2">${t('tableStayingCol')}</th>
            <th class="border border-slate-300 p-2">${t('tablePercentageCol')}</th>
            <th class="border border-slate-300 p-2">${t('tableTotalHoursCol')}</th>
          </tr>
        </thead>
        <tbody>
          ${calc.ofek.active ? `
            <tr>
              <td class="border border-slate-300 p-2">${t('reformOfekOnly')}</td>
              <td class="border border-slate-300 p-2">${calc.ofek.baseFrontal}</td>
              <td class="border border-slate-300 p-2 font-bold">${calc.ofek.frontal.toFixed(1)}</td>
              <td class="border border-slate-300 p-2">${calc.ofek.individual.toFixed(1)}</td>
              <td class="border border-slate-300 p-2">${calc.ofek.staying.toFixed(1)}</td>
              <td class="border border-slate-300 p-2 font-bold">${calc.ofek.percentage.toFixed(2)}%</td>
              <td class="border border-slate-300 p-2">${calc.ofek.totalHours.toFixed(1)}</td>
            </tr>
          ` : ''}
          ${calc.oz.active ? `
            <tr>
              <td class="border border-slate-300 p-2">${t('reformOzOnly')}</td>
              <td class="border border-slate-300 p-2">${calc.oz.baseFrontal}</td>
              <td class="border border-slate-300 p-2 font-bold">${calc.oz.frontal.toFixed(1)}</td>
              <td class="border border-slate-300 p-2">${calc.oz.individual.toFixed(1)}</td>
              <td class="border border-slate-300 p-2">${calc.oz.staying.toFixed(1)}</td>
              <td class="border border-slate-300 p-2 font-bold">${calc.oz.percentage.toFixed(2)}%</td>
              <td class="border border-slate-300 p-2">${calc.oz.totalHours.toFixed(1)}</td>
            </tr>
          ` : ''}
          ${calc.total.roleHours > 0 ? `
            <tr class="bg-purple-50">
              <td class="border border-slate-300 p-2 font-bold text-purple-900">${t('roleHoursCard')}</td>
              <td class="border border-slate-300 p-2">-</td>
              <td class="border border-slate-300 p-2 font-bold text-purple-700">${calc.total.roleHours.toFixed(1)}</td>
              <td class="border border-slate-300 p-2">-</td>
              <td class="border border-slate-300 p-2">-</td>
              <td class="border border-slate-300 p-2 font-bold text-purple-900">${calc.roleDetails.countInPercentage ? 'נכלל במשרה' : '-'}</td>
              <td class="border border-slate-300 p-2 font-bold">${calc.total.roleHours.toFixed(1)}</td>
            </tr>
          ` : ''}
          ${calc.total.motherReductionHours > 0 ? `
            <tr class="bg-pink-50">
              <td class="border border-slate-300 p-2 font-bold text-pink-900">הטבת משרת אם (קיצור שהייה)</td>
              <td class="border border-slate-300 p-2">-</td>
              <td class="border border-slate-300 p-2">-</td>
              <td class="border border-slate-300 p-2">-</td>
              <td class="border border-slate-300 p-2 font-bold text-pink-700">-${calc.total.motherReductionHours.toFixed(1)}</td>
              <td class="border border-slate-300 p-2 font-bold text-emerald-700">100% שכר</td>
              <td class="border border-slate-300 p-2 font-bold text-pink-700">-${calc.total.motherReductionHours.toFixed(1)}</td>
            </tr>
          ` : ''}
          <tr class="bg-slate-100 font-bold">
            <td class="border border-slate-300 p-2">סה"כ משוקלל</td>
            <td class="border border-slate-300 p-2">-</td>
            <td class="border border-slate-300 p-2 text-primary font-black">${(calc.total.frontalHours + (calc.roleDetails.countInPercentage ? calc.total.roleHours : 0)).toFixed(1)}</td>
            <td class="border border-slate-300 p-2">${calc.total.individualHours.toFixed(1)}</td>
            <td class="border border-slate-300 p-2">${calc.total.stayingHours.toFixed(1)}</td>
            <td class="border border-slate-300 p-2 text-primary font-black">${calc.total.jobPercentage.toFixed(2)}%</td>
            <td class="border border-slate-300 p-2 font-black">${calc.total.totalWeeklyHours.toFixed(1)}</td>
          </tr>
        </tbody>
      </table>

      <div class="grid grid-cols-2 gap-4 mb-8 text-sm">
        <div class="p-3 bg-slate-50 rounded border border-slate-200">
          <div>סטטוס משרה: <strong>${calc.total.statusLabelHe || calc.total.status}</strong></div>
          <div>שעות גיל שהוענקו: <strong>${calc.total.ageHoursAwarded.toFixed(1)} ש"ש</strong></div>
          <div>שעות תפקיד: <strong>${calc.total.roleHours.toFixed(1)} ש"ש</strong></div>
        </div>
        <div class="p-3 bg-slate-50 rounded border border-slate-200">
          <div>שעות נוספות מעל 100%: <strong>${calc.total.overtimeFrontalHours.toFixed(1)} ש"ש (${calc.total.overtimePercentage.toFixed(1)}%)</strong></div>
          <div>הטבת משרת אם: <strong>${calc.total.motherHourEligible ? 'פעילה (הופחתו 2 ש"ש שהייה)' : (tObj.isMother ? 'לא זכאית (מתחת ל-79%)' : 'לא')}</strong></div>
        </div>
      </div>

      <div class="mt-12 pt-8 border-t flex justify-between text-center">
        <div class="w-1/3">
          <div class="border-b border-slate-400 pb-8 mb-2"></div>
          <div class="text-sm font-semibold">${t('signature')}</div>
        </div>
        <div class="w-1/3">
          <div class="border-b border-slate-400 pb-8 mb-2"></div>
          <div class="text-sm font-semibold">חתימת המורה</div>
        </div>
      </div>
    </div>
  `;

  window.print();
}

// Reverse Planner Calculations
function toggleReverseSplitOptions() {
  const splitContainer = document.getElementById('reverseSplitContainer');
  if (splitContainer) {
    splitContainer.classList.toggle('hidden', state.reverseReform !== 'combined');
  }
}

function calculateReversePlanner() {
  const resultContainer = document.getElementById('reversePlannerResults');
  if (!resultContainer) return;

  const target = state.reverseTargetPct;
  const age = state.reverseAge;
  const reform = state.reverseReform;
  const split = state.reverseSplitRatio;

  const calc = MOE_RULES.calculateRequiredHours(target, age, reform, split);

  let html = `
    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-sm text-slate-500">${t('targetPercentage')}:</span>
          <div class="text-3xl font-black text-primary">${target}%</div>
        </div>
        <div class="text-sm text-slate-600 bg-white px-3 py-1.5 rounded-lg border shadow-sm">
          ${t('teacherAge')}: <strong>${age}</strong> (${calc.oz.ageBracket})
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <div class="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
          <div class="text-xs text-slate-500 mb-1">${t('frontalHoursCard')}</div>
          <div class="text-xl font-black text-blue-700">${calc.total.frontalHours.toFixed(1)}</div>
        </div>
        <div class="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
          <div class="text-xs text-slate-500 mb-1">${t('individualHoursCard')}</div>
          <div class="text-xl font-bold text-slate-800">${calc.total.individualHours.toFixed(1)}</div>
        </div>
        <div class="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
          <div class="text-xs text-slate-500 mb-1">${t('stayingHoursCard')}</div>
          <div class="text-xl font-bold text-slate-800">${calc.total.stayingHours.toFixed(1)}</div>
        </div>
        <div class="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
          <div class="text-xs text-slate-500 mb-1">${t('totalWeeklyHours')}</div>
          <div class="text-xl font-black text-slate-900">${calc.total.totalWeeklyHours.toFixed(1)}</div>
        </div>
      </div>
    </div>
  `;

  if (reform === 'combined') {
    html += `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 rounded-xl border border-blue-200 bg-blue-50/50">
          <div class="font-bold text-blue-900 text-base mb-2 flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-blue-500"></span>
            ${t('reformOfekOnly')} (${calc.ofek.percentage.toFixed(1)}%)
          </div>
          <ul class="text-sm space-y-1.5 text-slate-700">
            <li>שעות פרונטליות נדרשות: <strong class="text-blue-700 text-base">${calc.ofek.frontal.toFixed(1)}</strong></li>
            <li>שעות פרטניות נגזרות: <strong>${calc.ofek.individual.toFixed(1)}</strong></li>
            <li>שעות שהייה נגזרות: <strong>${calc.ofek.staying.toFixed(1)}</strong></li>
            <li>סה"כ שעות שבועיות באופק: <strong>${calc.ofek.totalHours.toFixed(1)}</strong></li>
          </ul>
        </div>

        <div class="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50">
          <div class="font-bold text-indigo-900 text-base mb-2 flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-indigo-500"></span>
            ${t('reformOzOnly')} (${calc.oz.percentage.toFixed(1)}%)
          </div>
          <ul class="text-sm space-y-1.5 text-slate-700">
            <li>שעות פרונטליות נדרשות: <strong class="text-indigo-700 text-base">${calc.oz.frontal.toFixed(1)}</strong></li>
            <li>שעות פרטניות נגזרות: <strong>${calc.oz.individual.toFixed(1)}</strong></li>
            <li>שעות שהייה נגזרות: <strong>${calc.oz.staying.toFixed(1)}</strong></li>
            <li>סה"כ שעות שבועיות בעוז: <strong>${calc.oz.totalHours.toFixed(1)}</strong></li>
          </ul>
        </div>
      </div>
    `;
  }

  resultContainer.innerHTML = html;
}

// Toast notification
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-5 left-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce transition-all text-sm font-semibold';
  toast.innerHTML = `<span>✓</span> <span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 2500);
}
