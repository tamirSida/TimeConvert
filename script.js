class TimezoneConverter {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.setCurrentDateTime();
        this.updateConversion();
    }

    initializeElements() {
        this.dateInput = document.getElementById('date');
        this.timeInput = document.getElementById('time');
        this.fromTimezoneSelect = document.getElementById('from-timezone');
        this.toTimezoneSelect = document.getElementById('to-timezone');
        this.resultTime = document.getElementById('result-time');
        this.resultDate = document.getElementById('result-date');
        this.resultTimezone = document.getElementById('result-timezone');
        this.resultTitle = document.getElementById('result-title');
        this.nowBtn = document.getElementById('now-btn');
        this.tomorrowBtn = document.getElementById('tomorrow-btn');
        this.nextWeekBtn = document.getElementById('next-week-btn');
        
        // Set default values (Israel -> PST as requested)
        this.fromTimezoneSelect.value = 'Asia/Jerusalem';
        this.toTimezoneSelect.value = 'America/Los_Angeles';
    }

    setupEventListeners() {
        this.dateInput.addEventListener('change', () => this.updateConversion());
        this.timeInput.addEventListener('change', () => this.updateConversion());
        this.fromTimezoneSelect.addEventListener('change', () => this.updateConversion());
        this.toTimezoneSelect.addEventListener('change', () => this.updateConversion());
        
        this.nowBtn.addEventListener('click', () => this.setCurrentDateTime());
        this.tomorrowBtn.addEventListener('click', () => this.setTomorrowDateTime());
        this.nextWeekBtn.addEventListener('click', () => this.setNextWeekDateTime());
    }

    setCurrentDateTime() {
        const now = new Date();
        this.dateInput.value = this.formatDateForInput(now);
        this.timeInput.value = this.formatTimeForInput(now);
        this.updateConversion();
    }

    setTomorrowDateTime() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        this.dateInput.value = this.formatDateForInput(tomorrow);
        this.timeInput.value = this.formatTimeForInput(tomorrow);
        this.updateConversion();
    }

    setNextWeekDateTime() {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        this.dateInput.value = this.formatDateForInput(nextWeek);
        this.timeInput.value = this.formatTimeForInput(nextWeek);
        this.updateConversion();
    }

    formatDateForInput(date) {
        return date.toISOString().split('T')[0];
    }

    formatTimeForInput(date) {
        return date.toTimeString().slice(0, 5);
    }

    getTimezoneDisplayName(timezone) {
        const timezoneNames = {
            'Asia/Jerusalem': 'Israel (Jerusalem)',
            'America/Los_Angeles': 'PST (California)',
            'America/New_York': 'EST (New York)',
            'Europe/London': 'GMT (London)',
            'Europe/Paris': 'CET (Paris)',
            'Europe/Berlin': 'CET (Berlin)',
            'Asia/Tokyo': 'JST (Tokyo)',
            'Asia/Shanghai': 'CST (Shanghai)',
            'Asia/Dubai': 'GST (Dubai)',
            'Australia/Sydney': 'AEDT (Sydney)',
            'America/Chicago': 'CST (Chicago)',
            'America/Denver': 'MST (Denver)',
            'UTC': 'UTC'
        };
        return timezoneNames[timezone] || timezone;
    }

    updateConversion() {
        if (!this.dateInput.value || !this.timeInput.value) {
            this.resultTime.textContent = '--:--';
            this.resultDate.textContent = 'Select date and time';
            this.resultTimezone.textContent = '--';
            this.resultTitle.textContent = 'Converted Time';
            return;
        }

        const inputDateTime = new Date(`${this.dateInput.value}T${this.timeInput.value}`);
        const fromTimezone = this.fromTimezoneSelect.value;
        const toTimezone = this.toTimezoneSelect.value;

        // Convert timezone
        const convertedDate = this.convertTimezone(inputDateTime, fromTimezone, toTimezone);
        
        // Update result title
        const fromName = this.getTimezoneDisplayName(fromTimezone);
        const toName = this.getTimezoneDisplayName(toTimezone);
        this.resultTitle.textContent = `${toName}`;

        this.displayResult(convertedDate, toTimezone, inputDateTime);
    }

    convertTimezone(inputDate, fromTimezone, toTimezone) {
        // Create a date object that represents the input time in the source timezone
        const sourceDate = new Date(inputDate.toLocaleString('en-US', { timeZone: fromTimezone }));
        const sourceOffset = inputDate.getTime() - sourceDate.getTime();
        
        // Create UTC time by adding the offset
        const utcTime = new Date(inputDate.getTime() + sourceOffset);
        
        // Convert to target timezone
        const targetDate = new Date(utcTime.toLocaleString('en-US', { timeZone: toTimezone }));
        const targetOffset = utcTime.getTime() - targetDate.getTime();
        
        return new Date(utcTime.getTime() + targetOffset);
    }

    displayResult(date, targetTimezone, originalDate) {
        // Format time
        const timeOptions = {
            timeZone: targetTimezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };
        
        // Format date
        const dateOptions = {
            timeZone: targetTimezone,
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        const formattedTime = new Intl.DateTimeFormat('en-US', timeOptions).format(date);
        const formattedDate = new Intl.DateTimeFormat('en-US', dateOptions).format(date);
        
        // Get timezone abbreviation
        const timezoneOptions = {
            timeZone: targetTimezone,
            timeZoneName: 'short'
        };
        const timezoneInfo = new Intl.DateTimeFormat('en-US', timezoneOptions).format(date);
        const timezoneName = timezoneInfo.split(', ').pop();

        this.resultTime.textContent = formattedTime;
        this.resultDate.textContent = formattedDate;
        this.resultTimezone.textContent = timezoneName;

        // Calculate and display day difference
        const inputDateOnly = new Date(originalDate.getFullYear(), originalDate.getMonth(), originalDate.getDate());
        const resultDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayDiff = Math.round((resultDateOnly.getTime() - inputDateOnly.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
            this.resultDate.textContent += ' (Next Day)';
        } else if (dayDiff === -1) {
            this.resultDate.textContent += ' (Previous Day)';
        } else if (dayDiff > 1) {
            this.resultDate.textContent += ` (+${dayDiff} days)`;
        } else if (dayDiff < -1) {
            this.resultDate.textContent += ` (${Math.abs(dayDiff)} days ago)`;
        }
    }
}

// Initialize the converter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TimezoneConverter();
});