import { DirectorioItem } from '../data/initialData';

export interface BirthdayRecord {
  item: DirectorioItem;
  ageTurning: number;
  birthdayDate: Date;
  isToday: boolean;
  isTomorrow: boolean;
  isPastThisWeek: boolean;
  daysUntil: number; // 0 for today, 1 for tomorrow, negative for earlier this week
  dayName: string; // e.g. "Martes"
  dateFormatted: string; // e.g. "20 de Octubre"
  statusBadge: 'HOY' | 'MAÑANA' | 'ESTA SEMANA' | `FUE EL ${string}` | string;
  whatsappGreetingUrl: string;
}

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Returns the Monday and Sunday for the week containing referenceDate
 */
export function getWeekRange(referenceDate: Date = new Date()): { monday: Date; sunday: Date } {
  const d = new Date(referenceDate);
  d.setHours(0, 0, 0, 0);
  
  // day: 0 (Sun) to 6 (Sat). We want Monday as start (day 1)
  const currentDay = d.getDay();
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { monday, sunday };
}

/**
 * Extracts clean digits from phone for WhatsApp link
 */
export function getCleanPhoneForWhatsApp(phone: string): string {
  let clean = phone.replace(/\D/g, '');
  if (!clean.startsWith('54') && clean.startsWith('37')) {
    clean = '549' + clean;
  } else if (!clean.startsWith('54')) {
    clean = '54' + clean;
  }
  return clean;
}

/**
 * Creates standard campaign greeting message for WhatsApp
 */
export function createBirthdayGreeting(item: DirectorioItem, ageTurning: number): string {
  return `¡Hola ${item.nombreApellido}! 🎂🎉 Desde el Comando de Campaña Provincial de Misiones te enviamos un muy feliz cumpleaños (${ageTurning} años). Que disfrutes tu día junto a tu familia y seres queridos. ¡Un fuerte abrazo y gracias por tu compromiso en ${item.municipio}! 🎈🏛️`;
}

/**
 * Finds all directory items whose birthday falls in the current calendar week (Monday to Sunday)
 */
export function getBirthdaysInCurrentWeek(
  directorio: DirectorioItem[], 
  referenceDate: Date = new Date()
): BirthdayRecord[] {
  const { monday, sunday } = getWeekRange(referenceDate);
  const refYear = referenceDate.getFullYear();
  const todayZero = new Date(referenceDate);
  todayZero.setHours(0, 0, 0, 0);

  const results: BirthdayRecord[] = [];

  for (const item of directorio) {
    if (!item.fechaNacimiento) continue;

    const parts = item.fechaNacimiento.split('-');
    if (parts.length < 3) continue;

    const birthYear = parseInt(parts[0], 10);
    const birthMonth = parseInt(parts[1], 10) - 1; // 0-indexed
    const birthDay = parseInt(parts[2], 10);

    if (isNaN(birthYear) || isNaN(birthMonth) || isNaN(birthDay)) continue;

    // Check birthday in current year, previous year, and next year (handles year-end transition)
    const possibleYears = [refYear, refYear - 1, refYear + 1];
    
    for (const testYear of possibleYears) {
      const bdayThisYear = new Date(testYear, birthMonth, birthDay);
      bdayThisYear.setHours(0, 0, 0, 0);

      if (bdayThisYear >= monday && bdayThisYear <= sunday) {
        const ageTurning = testYear - birthYear;
        const diffMs = bdayThisYear.getTime() - todayZero.getTime();
        const daysUntil = Math.round(diffMs / (1000 * 60 * 60 * 24));
        
        const isToday = daysUntil === 0;
        const isTomorrow = daysUntil === 1;
        const isPastThisWeek = daysUntil < 0;

        const dayName = DIAS_SEMANA[bdayThisYear.getDay()];
        const dateFormatted = `${birthDay} de ${MESES[birthMonth]}`;

        let statusBadge: BirthdayRecord['statusBadge'] = 'ESTA SEMANA';
        if (isToday) {
          statusBadge = 'HOY';
        } else if (isTomorrow) {
          statusBadge = 'MAÑANA';
        } else if (isPastThisWeek) {
          statusBadge = `FUE EL ${dayName.toUpperCase()}` as BirthdayRecord['statusBadge'];
        }

        const phoneClean = getCleanPhoneForWhatsApp(item.telefono);
        const greetingText = createBirthdayGreeting(item, ageTurning);
        const whatsappGreetingUrl = `https://wa.me/${phoneClean}?text=${encodeURIComponent(greetingText)}`;

        results.push({
          item,
          ageTurning,
          birthdayDate: bdayThisYear,
          isToday,
          isTomorrow,
          isPastThisWeek,
          daysUntil,
          dayName,
          dateFormatted,
          statusBadge,
          whatsappGreetingUrl
        });
        break; // matched this week
      }
    }
  }

  // Sort: Today first, then upcoming days this week, then past days of this week
  results.sort((a, b) => {
    if (a.isToday && !b.isToday) return -1;
    if (!a.isToday && b.isToday) return 1;
    if (a.daysUntil >= 0 && b.daysUntil >= 0) return a.daysUntil - b.daysUntil;
    if (a.daysUntil >= 0 && b.daysUntil < 0) return -1;
    if (a.daysUntil < 0 && b.daysUntil >= 0) return 1;
    return b.daysUntil - a.daysUntil;
  });

  return results;
}

/**
 * Returns active birthday notifications for current week with smart fallback to campaign reference date
 */
export function getActiveBirthdayNotifications(
  directorio: DirectorioItem[],
  customDate?: Date
): {
  records: BirthdayRecord[];
  weekRangeText: string;
  referenceDate: Date;
  todayCount: number;
} {
  let refDate = customDate || new Date();
  let list = getBirthdaysInCurrentWeek(directorio, refDate);

  // If system date returns 0 records, fallback to current campaign date 2026-10-20
  if (list.length === 0 && !customDate) {
    const campaignDate = new Date(2026, 9, 20); // 20 Oct 2026
    const campaignList = getBirthdaysInCurrentWeek(directorio, campaignDate);
    if (campaignList.length > 0) {
      refDate = campaignDate;
      list = campaignList;
    }
  }

  const { monday, sunday } = getWeekRange(refDate);
  const weekRangeText = `Semana del ${monday.getDate()} al ${sunday.getDate()} de ${MESES[sunday.getMonth()]} de ${sunday.getFullYear()}`;
  const todayCount = list.filter(r => r.isToday).length;

  return {
    records: list,
    weekRangeText,
    referenceDate: refDate,
    todayCount
  };
}

