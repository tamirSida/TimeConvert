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
        this.fromZoneDisplay = document.getElementById('from-zone');
        this.toZoneDisplay = document.getElementById('to-zone');
        this.swapBtn = document.getElementById('swap-btn');
        this.resultTime = document.getElementById('result-time');
        this.resultDate = document.getElementById('result-date');
        this.resultTimezone = document.getElementById('result-timezone');
        this.resultTitle = document.getElementById('result-title');
        this.nowBtn = document.getElementById('now-btn');
        this.tomorrowBtn = document.getElementById('tomorrow-btn');
        this.nextWeekBtn = document.getElementById('next-week-btn');
        
        // Set default direction (Israel -> PST)
        this.isIsraelToPst = true;
        this.updateTimezoneDisplay();
    }

    setupEventListeners() {
        this.dateInput.addEventListener('change', () => this.updateConversion());
        this.timeInput.addEventListener('change', () => this.updateConversion());
        this.swapBtn.addEventListener('click', () => this.swapTimezones());
        
        this.nowBtn.addEventListener('click', () => this.setCurrentDateTime());
        this.tomorrowBtn.addEventListener('click', () => this.setTomorrowDateTime());
        this.nextWeekBtn.addEventListener('click', () => this.setNextWeekDateTime());
    }

    swapTimezones() {
        this.isIsraelToPst = !this.isIsraelToPst;
        this.updateTimezoneDisplay();
        this.updateConversion();
    }

    updateTimezoneDisplay() {
        if (this.isIsraelToPst) {
            this.fromZoneDisplay.textContent = 'Israel';
            this.toZoneDisplay.textContent = 'PST (California)';
        } else {
            this.fromZoneDisplay.textContent = 'PST (California)';
            this.toZoneDisplay.textContent = 'Israel (Jerusalem)';
        }
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
            this.resultTitle.textContent = 'Converted Time';
            return;
        }

        // Update result title
        const toName = this.isIsraelToPst ? 'PST (California)' : 'Israel (Jerusalem)';
        this.resultTitle.textContent = toName;

        this.convertTime();
    }

    convertTime() {
        // Create date from input
        const inputDateTime = `${this.dateInput.value}T${this.timeInput.value}:00`;
        const inputDate = new Date(inputDateTime);
        
        let resultDate;
        
        // Simple conversion logic: Israel is 10 hours ahead of PST
        if (this.isIsraelToPst) {
            // Israel to PST: subtract 10 hours
            resultDate = new Date(inputDate.getTime() - (10 * 60 * 60 * 1000));
        } else {
            // PST to Israel: add 10 hours
            resultDate = new Date(inputDate.getTime() + (10 * 60 * 60 * 1000));
        }

        // Format time (24-hour format)
        const hours = resultDate.getHours().toString().padStart(2, '0');
        const minutes = resultDate.getMinutes().toString().padStart(2, '0');
        const timeStr = `${hours}:${minutes}`;

        // Format date
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const dateStr = resultDate.toLocaleDateString('en-US', options);

        // Set timezone abbreviation
        const timezoneStr = this.isIsraelToPst ? 'PST' : 'IST';

        // Display results
        this.resultTime.textContent = timeStr;
        this.resultDate.textContent = dateStr;
        this.resultTimezone.textContent = timezoneStr;

        // Add day difference indicator
        const dayDiff = resultDate.getDate() - inputDate.getDate();
        
        if (dayDiff === 1) {
            this.resultDate.textContent += ' (Next Day)';
        } else if (dayDiff === -1) {
            this.resultDate.textContent += ' (Previous Day)';
        }
    }
}

// Initialize the converter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TimezoneConverter();
});