/**
 * Ministry of Education (Israel) Teacher Workload Rules & Formulas
 * משרד החינוך - תקנות חישוב משרות, שעות שהייה, שעות פרטניות, שעות גיל ומשרה משולבת
 * מותאם להסכמים קיבוציים מעודכנים (תשפ"ה / 2024 והסכמים קודמים)
 */

const MOE_RULES = {
  // עוז לתמורה (תיכון / חטיבה עליונה - כיתות י'-י"ב)
  OZ_LE_TMURA: {
    nameHe: 'עוז לתמורה (חט"ע / תיכון)',
    nameEn: 'Oz LeTmura (High School)',
    nameRu: 'Оз ле-Тмура (Старшая школа)',
    
    // החזרת מבנה המשרה לפי גיל והסכם (הסכם 38 שעות מעודכן או הסכם 40 שעות קלאסי)
    getStructureByAge: function(age, agreementVersion = 'updated38') {
      const isUpdated = (agreementVersion === 'updated38');

      if (isUpdated) {
        // הסכם מעודכן (תשפ"ה / 2024) - בסיס משרה 38 שעות שבועיות
        // מורה רגיל: 25 פרונטלי, 3 פרטני, 10 שהייה (סה"כ 38 שעות)
        // שעות שהייה קבועות בבסיס 10 ש"ש (אינן עולות עם הגיל!)
        if (age >= 55) {
          // גיל 55 ומעלה: הפחתת 4 שעות פרונטליות (בסיס 21, פרטני 3, שהייה 10 = סה"כ נוכחות 34 ש"ש)
          return {
            agreementVersion: 'updated38',
            totalHours100: 34,
            standardTotalHours: 38,
            frontalBase: 21,
            individualBase: 3,
            stayingBase: 10,
            ageReduction: 4,
            ageBracket: '55+'
          };
        } else if (age >= 50) {
          // גיל 50-54: הפחתת 2 שעות פרונטליות (בסיס 23, פרטני 3, שהייה 10 = סה"כ נוכחות 36 ש"ש)
          return {
            agreementVersion: 'updated38',
            totalHours100: 36,
            standardTotalHours: 38,
            frontalBase: 23,
            individualBase: 3,
            stayingBase: 10,
            ageReduction: 2,
            ageBracket: '50-54'
          };
        } else {
          // מתחת לגיל 50: בסיס מלא
          return {
            agreementVersion: 'updated38',
            totalHours100: 38,
            standardTotalHours: 38,
            frontalBase: 25,
            individualBase: 3,
            stayingBase: 10,
            ageReduction: 0,
            ageBracket: '<50'
          };
        }
      } else {
        // הסכם קלאסי (הסכם 40 שעות שבועיות)
        // מורה רגיל: 24 פרונטלי, 6 פרטני, 10 שהייה (סה"כ 40 שעות)
        if (age >= 57) {
          return {
            agreementVersion: 'classic40',
            totalHours100: 40,
            standardTotalHours: 40,
            frontalBase: 20,
            individualBase: 6,
            stayingBase: 10,
            ageReduction: 4,
            ageBracket: '57+'
          };
        } else if (age >= 55) {
          return {
            agreementVersion: 'classic40',
            totalHours100: 40,
            standardTotalHours: 40,
            frontalBase: 21,
            individualBase: 6,
            stayingBase: 10,
            ageReduction: 3,
            ageBracket: '55-56'
          };
        } else if (age >= 50) {
          return {
            agreementVersion: 'classic40',
            totalHours100: 40,
            standardTotalHours: 40,
            frontalBase: 22,
            individualBase: 6,
            stayingBase: 10,
            ageReduction: 2,
            ageBracket: '50-54'
          };
        } else {
          return {
            agreementVersion: 'classic40',
            totalHours100: 40,
            standardTotalHours: 40,
            frontalBase: 24,
            individualBase: 6,
            stayingBase: 10,
            ageReduction: 0,
            ageBracket: '<50'
          };
        }
      }
    }
  },

  // אופק חדש (חטיבת ביניים - כיתות ז'-ט')
  OFEK_HADASH_JUNIOR_HIGH: {
    nameHe: 'אופק חדש (חטיבת ביניים ז\'-ט\')',
    nameEn: 'Ofek Hadash (Junior High 7-9)',
    nameRu: 'Офек Хадаш (Средняя школа 7-9)',
    standardTotalHours: 36,
    
    // שעות פרונטליות, פרטניות ושהייה לפי מדרגות גיל בחט"ב
    // בסיס תקני למורה רגיל: 23 פרונטלי, 4 פרטני, 9 שהייה = סה"כ 36 שעות שבועיות
    getStructureByAge: function(age) {
      if (age >= 55) {
        // גיל 55 ומעלה: הפחתת 3 שעות פרונטליות ושעה פרטנית אחת (בסיס 20 פרונטלי, 3 פרטני, 9 שהייה = 32 ש"ש)
        return {
          totalHours100: 32,
          standardTotalHours: 36,
          frontalBase: 20,
          individualBase: 3,
          stayingBase: 9,
          ageReduction: 3,
          ageBracket: '55+'
        };
      } else if (age >= 50) {
        // גיל 50-54: הפחתת 2 שעות פרונטליות (בסיס 21 פרונטלי, 4 פרטני, 9 שהייה = 34 ש"ש)
        return {
          totalHours100: 34,
          standardTotalHours: 36,
          frontalBase: 21,
          individualBase: 4,
          stayingBase: 9,
          ageReduction: 2,
          ageBracket: '50-54'
        };
      } else {
        // מתחת לגיל 50: בסיס רגיל בחט"ב - 23 פרונטלי, 4 פרטני, 9 שהייה
        return {
          totalHours100: 36,
          standardTotalHours: 36,
          frontalBase: 23,
          individualBase: 4,
          stayingBase: 9,
          ageReduction: 0,
          ageBracket: '<50'
        };
      }
    }
  },

  // אופק חדש (יסודי - למורים שמלמדים ביסודי)
  OFEK_HADASH_PRIMARY: {
    nameHe: 'אופק חדש (יסודי)',
    nameEn: 'Ofek Hadash (Primary)',
    nameRu: 'Офек Хадаш (Начальная школа)',
    standardTotalHours: 36,
    
    // מורה רגיל ביסודי: 26 פרונטלי, 5 פרטני, 5 שהייה = סה"כ 36 שעות שבועיות
    getStructureByAge: function(age) {
      if (age >= 55) {
        return {
          totalHours100: 33,
          standardTotalHours: 36,
          frontalBase: 23,
          individualBase: 5,
          stayingBase: 5,
          ageReduction: 3,
          ageBracket: '55+'
        };
      } else if (age >= 50) {
        return {
          totalHours100: 34,
          standardTotalHours: 36,
          frontalBase: 24,
          individualBase: 5,
          stayingBase: 5,
          ageReduction: 2,
          ageBracket: '50-54'
        };
      } else {
        return {
          totalHours100: 36,
          standardTotalHours: 36,
          frontalBase: 26,
          individualBase: 5,
          stayingBase: 5,
          ageReduction: 0,
          ageBracket: '<50'
        };
      }
    }
  },

  /**
   * חישוב נתוני משרה עבור מורה
   * @param {Object} params
   * @param {number} params.age - גיל המורה
   * @param {string} params.reform - 'oz', 'ofek', 'combined'
   * @param {number} params.frontalOz - שעות פרונטליות בעוז לתמורה
   * @param {number} params.frontalOfek - שעות פרונטליות באופק חדש
   * @param {string} params.ozAgreement - 'updated38' (default) or 'classic40'
   * @param {boolean} params.isMother - זכאות למשרת אם (ילד מתחת לגיל 14)
   * @param {string} params.motherOption - 'reduction' (קיצור נוכחות/שהייה) or 'salary' (תוספת 7% לשכר)
   * @param {string} params.ofekType - 'junior_high' (default) or 'primary'
   * @param {number} params.roleHours - שעות תפקיד / גמול נוספות
   * @returns {Object} Full breakdown of job percentage, hours, staying hours, overtime, age hours
   */
  calculateWorkload: function(params) {
    const age = Number(params.age) || 35;
    const reform = params.reform || 'oz'; // 'oz', 'ofek', 'combined'
    const ofekType = params.ofekType || 'junior_high';
    const ozAgreement = params.ozAgreement || 'updated38'; // 'updated38' or 'classic40'
    const isMother = Boolean(params.isMother);
    const motherOption = params.motherOption || 'reduction'; // 'reduction' or 'salary'
    
    // שעות תפקיד וגמולים
    const roleEducator = Boolean(params.roleEducator);
    const roleGradeCoord = Boolean(params.roleGradeCoord);
    const roleSubjectCoord = Boolean(params.roleSubjectCoord);
    const otherRoleHours = Math.max(0, Number(params.otherRoleHours) || 0);

    const roleEducatorHours = roleEducator ? 2 : 0;
    const roleGradeCoordHours = roleGradeCoord ? 3 : 0;
    const roleSubjectCoordHours = roleSubjectCoord ? 2 : 0;
    const totalRoleHours = Number((roleEducatorHours + roleGradeCoordHours + roleSubjectCoordHours + otherRoleHours).toFixed(2));
    const countRolesInPercentage = (params.countRolesInPercentage !== false); // ברירת מחדל: שעות תפקיד נספרות למשרה

    const frontalOzInput = Math.max(0, Number(params.frontalOz) || 0);
    const frontalOfekInput = Math.max(0, Number(params.frontalOfek) || 0);

    const ozRules = this.OZ_LE_TMURA.getStructureByAge(age, ozAgreement);
    const ofekStructure = ofekType === 'primary' 
      ? this.OFEK_HADASH_PRIMARY 
      : this.OFEK_HADASH_JUNIOR_HIGH;
    const ofekRules = ofekStructure.getStructureByAge(age);

    let result = {
      age: age,
      reform: reform,
      ofekType: ofekType,
      ozAgreement: ozAgreement,
      isMother: isMother,
      motherOption: motherOption,
      roleHours: totalRoleHours,
      roleDetails: {
        educator: roleEducatorHours,
        gradeCoord: roleGradeCoordHours,
        subjectCoord: roleSubjectCoordHours,
        other: otherRoleHours,
        total: totalRoleHours,
        countInPercentage: countRolesInPercentage
      },
      
      // אופק חדש
      ofek: {
        active: reform === 'ofek' || reform === 'combined',
        frontal: 0,
        roleHours: 0,
        individual: 0,
        staying: 0,
        totalHours: 0,
        percentage: 0,
        baseFrontal: ofekRules.frontalBase,
        baseIndividual: ofekRules.individualBase,
        baseStaying: ofekRules.stayingBase,
        ageReduction: ofekRules.ageReduction,
        ageBracket: ofekRules.ageBracket,
        stayingFormula: ''
      },

      // עוז לתמורה
      oz: {
        active: reform === 'oz' || reform === 'combined',
        frontal: 0,
        roleHours: 0,
        individual: 0,
        staying: 0,
        totalHours: 0,
        percentage: 0,
        baseFrontal: ozRules.frontalBase,
        baseIndividual: ozRules.individualBase,
        baseStaying: ozRules.stayingBase,
        ageReduction: ozRules.ageReduction,
        ageBracket: ozRules.ageBracket,
        stayingFormula: ''
      },

      // סיכום כולל
      total: {
        frontalHours: 0,
        roleHours: totalRoleHours,
        individualHours: 0,
        nominalStayingHours: 0, // שעות שהייה תקניות לפני הפחתת אם
        stayingHours: 0,        // שעות שהייה בפועל במערכת
        scheduledStayingHoursRounded: 0, // המלצת שיבוץ מעוגלת לחצי שעה
        motherReductionHours: 0,
        motherSalaryBonus: 0,
        totalWeeklyHours: 0,
        jobPercentage: 0,
        overtimePercentage: 0,
        overtimeFrontalHours: 0,
        status: 'normal',
        statusLabelHe: '',
        ageHoursAwarded: 0,
        motherHourEligible: false,
        motherHourStatus: 'none', // 'active_reduction', 'active_salary', 'below_threshold', 'none'
        missingFrontalFor100: 0
      }
    };

    // חישוב שעות לפי רפורמה
    if (reform === 'oz') {
      result.oz.frontal = frontalOzInput;
      result.oz.roleHours = totalRoleHours;
      const effectiveTeachingOz = countRolesInPercentage ? (frontalOzInput + totalRoleHours) : frontalOzInput;
      result.oz.percentage = (effectiveTeachingOz / ozRules.frontalBase) * 100;
      
      const ratio = (frontalOzInput / ozRules.frontalBase);
      result.oz.individual = Number((ozRules.individualBase * ratio).toFixed(2));
      result.oz.staying = Number((ozRules.stayingBase * ratio).toFixed(2));
      result.oz.totalHours = Number((frontalOzInput + totalRoleHours + result.oz.individual + result.oz.staying).toFixed(2));
      result.oz.stayingFormula = `${ozRules.stayingBase} × (${frontalOzInput} / ${ozRules.frontalBase}) = ${result.oz.staying.toFixed(2)}`;
      
      result.total.ageHoursAwarded = Number((ozRules.ageReduction * ratio).toFixed(2));
    } else if (reform === 'ofek') {
      result.ofek.frontal = frontalOfekInput;
      result.ofek.roleHours = totalRoleHours;
      const effectiveTeachingOfek = countRolesInPercentage ? (frontalOfekInput + totalRoleHours) : frontalOfekInput;
      result.ofek.percentage = (effectiveTeachingOfek / ofekRules.frontalBase) * 100;
      
      const ratio = (frontalOfekInput / ofekRules.frontalBase);
      result.ofek.individual = Number((ofekRules.individualBase * ratio).toFixed(2));
      result.ofek.staying = Number((ofekRules.stayingBase * ratio).toFixed(2));
      result.ofek.totalHours = Number((frontalOfekInput + totalRoleHours + result.ofek.individual + result.ofek.staying).toFixed(2));
      result.ofek.stayingFormula = `${ofekRules.stayingBase} × (${frontalOfekInput} / ${ofekRules.frontalBase}) = ${result.ofek.staying.toFixed(2)}`;

      result.total.ageHoursAwarded = Number((ofekRules.ageReduction * ratio).toFixed(2));
    } else if (reform === 'combined') {
      // משרה משולבת
      result.ofek.frontal = frontalOfekInput;
      result.ofek.percentage = (frontalOfekInput / ofekRules.frontalBase) * 100;
      const ratioOfek = (frontalOfekInput / ofekRules.frontalBase);
      result.ofek.individual = Number((ofekRules.individualBase * ratioOfek).toFixed(2));
      result.ofek.staying = Number((ofekRules.stayingBase * ratioOfek).toFixed(2));
      result.ofek.totalHours = Number((result.ofek.frontal + result.ofek.individual + result.ofek.staying).toFixed(2));
      result.ofek.stayingFormula = `${ofekRules.stayingBase} × (${frontalOfekInput} / ${ofekRules.frontalBase}) = ${result.ofek.staying.toFixed(2)}`;

      result.oz.frontal = frontalOzInput;
      result.oz.roleHours = totalRoleHours;
      const effectiveOz = countRolesInPercentage ? (frontalOzInput + totalRoleHours) : frontalOzInput;
      result.oz.percentage = (effectiveOz / ozRules.frontalBase) * 100;
      const ratioOz = (frontalOzInput / ozRules.frontalBase);
      result.oz.individual = Number((ozRules.individualBase * ratioOz).toFixed(2));
      result.oz.staying = Number((ozRules.stayingBase * ratioOz).toFixed(2));
      result.oz.totalHours = Number((frontalOzInput + totalRoleHours + result.oz.individual + result.oz.staying).toFixed(2));
      result.oz.stayingFormula = `${ozRules.stayingBase} × (${frontalOzInput} / ${ozRules.frontalBase}) = ${result.oz.staying.toFixed(2)}`;

      result.total.ageHoursAwarded = Number(
        ((ofekRules.ageReduction * ratioOfek) + (ozRules.ageReduction * ratioOz)).toFixed(2)
      );
    }

    // סיכום כולל
    const totalPercentage = Number((result.ofek.percentage + result.oz.percentage).toFixed(2));
    const totalFrontal = Number((result.ofek.frontal + result.oz.frontal).toFixed(2));
    const totalIndividual = Number((result.ofek.individual + result.oz.individual).toFixed(2));
    const nominalStaying = Number((result.ofek.staying + result.oz.staying).toFixed(2));

    // בדיקת והחלת משרת אם (זכאות מ-79% משרה ומעלה)
    let motherReduction = 0;
    let motherSalaryBonus = 0;
    if (isMother) {
      if (totalPercentage >= 78.9) {
        result.total.motherHourEligible = true;
        if (motherOption === 'reduction') {
          // קיצור שעות נוכחות/שהייה בבית הספר: הפחתת 2 שעות שהייה שבועיות ללא פגיעה בשכר ובמשרה
          motherReduction = Math.min(2.0, nominalStaying);
          result.total.motherHourStatus = 'active_reduction';
        } else {
          // תוספת שכר: תוספת של 7% לשכר המשרה ללא הפחתת שעות במערכת
          motherSalaryBonus = 7.0;
          result.total.motherHourStatus = 'active_salary';
        }
      } else {
        result.total.motherHourEligible = false;
        result.total.motherHourStatus = 'below_threshold';
      }
    } else {
      result.total.motherHourStatus = 'none';
    }

    // שעות שהייה בפועל במערכת
    const actualStaying = Math.max(0, Number((nominalStaying - motherReduction).toFixed(2)));
    result.total.nominalStayingHours = nominalStaying;
    result.total.motherReductionHours = motherReduction;
    result.total.motherSalaryBonus = motherSalaryBonus;
    result.total.stayingHours = actualStaying;
    // המלצת שיבוץ מעוגלת לחצי שעה למערכת השעות
    result.total.scheduledStayingHoursRounded = Math.round(actualStaying * 2) / 2;

    const totalWeekly = Number((totalFrontal + totalRoleHours + totalIndividual + actualStaying).toFixed(2));

    result.total.jobPercentage = totalPercentage;
    result.total.frontalHours = totalFrontal;
    result.total.individualHours = totalIndividual;
    result.total.totalWeeklyHours = totalWeekly;

    // ניתוח שעות נוספות ותקן
    if (totalPercentage > 100.05) {
      const overtimePct = Number((totalPercentage - 100).toFixed(2));
      result.total.overtimePercentage = overtimePct;
      // שעות פרונטליות מעל התקן
      const overtimeFrontal = Number((totalFrontal * (overtimePct / totalPercentage)).toFixed(2));
      result.total.overtimeFrontalHours = overtimeFrontal;

      if (totalPercentage > 125.05) {
        result.total.status = 'exceeded'; // מעל 125% מחייב אישור מיוחד
        result.total.statusLabelHe = 'חריגת משרה (מעל 125% - דורש אישור מיוחד של משה"ח)';
      } else {
        result.total.status = 'overtime';
        result.total.statusLabelHe = 'שעות נוספות מאושרות (100%-125% - נדרש אישור פיקוח)';
      }
    } else if (totalPercentage >= 99.95) {
      result.total.status = 'full_time';
      result.total.statusLabelHe = 'משרה מלאה (100%)';
    } else {
      result.total.status = 'part_time';
      result.total.statusLabelHe = 'משרה חלקית';
      
      // כמה שעות פרונטליות חסרות ל-100%
      const missingPct = 100 - totalPercentage;
      if (reform === 'oz') {
        result.total.missingFrontalFor100 = Number(((missingPct / 100) * ozRules.frontalBase).toFixed(2));
      } else if (reform === 'ofek') {
        result.total.missingFrontalFor100 = Number(((missingPct / 100) * ofekRules.frontalBase).toFixed(2));
      } else {
        // במשרה משולבת נציג לפי עוז או לפי אופק
        result.total.missingFrontalOz = Number(((missingPct / 100) * ozRules.frontalBase).toFixed(2));
        result.total.missingFrontalOfek = Number(((missingPct / 100) * ofekRules.frontalBase).toFixed(2));
      }
    }

    return result;
  },

  /**
   * חישוב הפוך: לפי אחוז משרה מבוקש וגיל, לחשב את מספר השעות הנדרשות
   */
  calculateRequiredHours: function(targetPercentage, age, reform, splitRatio = 0.5, ozAgreement = 'updated38') {
    const target = Number(targetPercentage) || 100;
    const teacherAge = Number(age) || 35;
    const ozRules = this.OZ_LE_TMURA.getStructureByAge(teacherAge, ozAgreement);
    const ofekRules = this.OFEK_HADASH_JUNIOR_HIGH.getStructureByAge(teacherAge);

    if (reform === 'oz') {
      const frontal = Number(((target / 100) * ozRules.frontalBase).toFixed(2));
      return this.calculateWorkload({
        age: teacherAge,
        reform: 'oz',
        ozAgreement: ozAgreement,
        frontalOz: frontal
      });
    } else if (reform === 'ofek') {
      const frontal = Number(((target / 100) * ofekRules.frontalBase).toFixed(2));
      return this.calculateWorkload({
        age: teacherAge,
        reform: 'ofek',
        frontalOfek: frontal
      });
    } else {
      // משרה משולבת לפי יחס חלוקה (ברירת מחדל 50%-50%)
      const targetOfekPct = target * splitRatio;
      const targetOzPct = target * (1 - splitRatio);
      const frontalOfek = Number(((targetOfekPct / 100) * ofekRules.frontalBase).toFixed(2));
      const frontalOz = Number(((targetOzPct / 100) * ozRules.frontalBase).toFixed(2));

      return this.calculateWorkload({
        age: teacherAge,
        reform: 'combined',
        ozAgreement: ozAgreement,
        frontalOfek: frontalOfek,
        frontalOz: frontalOz
      });
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MOE_RULES;
}
