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

        const fromTimezone = this.fromTimezoneSelect.value;
        const toTimezone = this.toTimezoneSelect.value;

        // Convert timezone using a more iPhone-compatible method
        const convertedDate = this.convertTimezone(fromTimezone, toTimezone);
        
        // Update result title
        const toName = this.getTimezoneDisplayName(toTimezone);
        this.resultTitle.textContent = `${toName}`;

        this.displayResult(convertedDate, toTimezone);
    }

    convertTimezone(fromTimezone, toTimezone) {
        try {
            // Create date string in a format that works well on all browsers
            const dateTimeString = `${this.dateInput.value} ${this.timeInput.value}:00`;
            
            // Use a more direct approach that works better on Safari/iPhone
            const inputDate = new Date(dateTimeString);
            
            // Create the same moment in time but interpreted in different timezones
            const tempDate = new Date('2023-07-15T12:00:00Z'); // Fixed UTC reference
            
            // Get current time in both timezones for offset calculation
            const fromTime = new Intl.DateTimeFormat('sv-SE', {
                timeZone: fromTimezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }).format(tempDate);
            
            const toTime = new Intl.DateTimeFormat('sv-SE', {
                timeZone: toTimezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }).format(tempDate);
            
            const fromDateObj = new Date(fromTime);
            const toDateObj = new Date(toTime);
            const offsetMs = fromDateObj.getTime() - toDateObj.getTime();
            
            // Apply offset to input time
            return new Date(inputDate.getTime() - offsetMs);
            
        } catch (error) {
            console.error('Conversion error:', error);
            // Ultra-simple fallback
            return new Date(`${this.dateInput.value}T${this.timeInput.value}`);
        }
    }

    displayResult(date, targetTimezone) {
        try {
            // Use Intl.DateTimeFormat for better cross-browser compatibility
            const timeStr = new Intl.DateTimeFormat('en-US', {
                timeZone: targetTimezone,
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).format(date);

            const dateStr = new Intl.DateTimeFormat('en-US', {
                timeZone: targetTimezone,
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(date);

            // Get timezone abbreviation
            const timeZoneStr = new Intl.DateTimeFormat('en-US', {
                timeZone: targetTimezone,
                timeZoneName: 'short'
            }).format(date).split(', ').pop();

            this.resultTime.textContent = timeStr;
            this.resultDate.textContent = dateStr;
            this.resultTimezone.textContent = timeZoneStr;

            // Calculate day difference
            const inputDate = new Date(`${this.dateInput.value}T${this.timeInput.value}`);
            const resultDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const inputDateOnly = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());
            
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

        } catch (error) {
            console.error('Display error:', error);
            this.resultTime.textContent = 'Error';
            this.resultDate.textContent = 'Conversion failed';
            this.resultTimezone.textContent = '--';
        }
    }
}

// Initialize the converter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TimezoneConverter();
});