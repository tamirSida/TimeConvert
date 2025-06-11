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
        this.timezoneSelect = document.getElementById('timezone');
        this.resultTime = document.getElementById('result-time');
        this.resultDate = document.getElementById('result-date');
        this.resultTimezone = document.getElementById('result-timezone');
        this.resultTitle = document.getElementById('result-title');
        this.nowBtn = document.getElementById('now-btn');
        this.tomorrowBtn = document.getElementById('tomorrow-btn');
        this.nextWeekBtn = document.getElementById('next-week-btn');
    }

    setupEventListeners() {
        this.dateInput.addEventListener('change', () => this.updateConversion());
        this.timeInput.addEventListener('change', () => this.updateConversion());
        this.timezoneSelect.addEventListener('change', () => this.updateConversion());
        
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

    updateConversion() {
        if (!this.dateInput.value || !this.timeInput.value) {
            this.resultTime.textContent = '--:--';
            this.resultDate.textContent = 'Select date and time';
            this.resultTimezone.textContent = '--';
            return;
        }

        const inputDateTime = new Date(`${this.dateInput.value}T${this.timeInput.value}`);
        const isFromIsrael = this.timezoneSelect.value === 'israel';

        let convertedDate;
        if (isFromIsrael) {
            // Convert from Israel to PST
            convertedDate = this.convertFromIsraelToPST(inputDateTime);
            this.resultTitle.textContent = 'Time in PST (California)';
        } else {
            // Convert from PST to Israel
            convertedDate = this.convertFromPSTToIsrael(inputDateTime);
            this.resultTitle.textContent = 'Time in Israel (Jerusalem)';
        }

        this.displayResult(convertedDate, isFromIsrael);
    }

    convertFromIsraelToPST(israelTime) {
        // Israel is UTC+2 (standard) or UTC+3 (daylight saving)
        // PST is UTC-8, PDT is UTC-7
        
        // Create date in Israel timezone
        const israelDate = new Date(israelTime.toLocaleString("en-US", {timeZone: "Asia/Jerusalem"}));
        const israelOffset = israelTime.getTime() - israelDate.getTime();
        const israelUTC = new Date(israelTime.getTime() + israelOffset);
        
        // Convert to PST/PDT
        const pstDate = new Date(israelUTC.toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));
        return pstDate;
    }

    convertFromPSTToIsrael(pstTime) {
        // Create date in PST timezone
        const pstDate = new Date(pstTime.toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));
        const pstOffset = pstTime.getTime() - pstDate.getTime();
        const pstUTC = new Date(pstTime.getTime() + pstOffset);
        
        // Convert to Israel time
        const israelDate = new Date(pstUTC.toLocaleString("en-US", {timeZone: "Asia/Jerusalem"}));
        return israelDate;
    }

    displayResult(date, isFromIsrael) {
        const targetTimezone = isFromIsrael ? "America/Los_Angeles" : "Asia/Jerusalem";
        
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
        
        // Get timezone name
        const timezoneOptions = {
            timeZone: targetTimezone,
            timeZoneName: 'short'
        };
        const timezoneInfo = new Intl.DateTimeFormat('en-US', timezoneOptions).format(date);
        const timezoneName = timezoneInfo.split(', ').pop();

        this.resultTime.textContent = formattedTime;
        this.resultDate.textContent = formattedDate;
        this.resultTimezone.textContent = timezoneName;

        // Add day difference indicator
        const inputDate = new Date(`${this.dateInput.value}T${this.timeInput.value}`);
        const dayDiff = Math.floor((date.getTime() - inputDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
            this.resultDate.textContent += ' (Next Day)';
        } else if (dayDiff === -1) {
            this.resultDate.textContent += ' (Previous Day)';
        } else if (dayDiff > 1) {
            this.resultDate.textContent += ` (+${dayDiff} days)`;
        } else if (dayDiff < -1) {
            this.resultDate.textContent += ` (${dayDiff} days)`;
        }
    }
}

// Initialize the converter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TimezoneConverter();
});