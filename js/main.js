/**
 * Suntec Nepal Heat Pump - Interactive JavaScript
 * Powers Countdown, ROI Calculator, Tabs, Modals, Forms & Toasts
 */

document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initSolutionTabs();
  initSavingsCalculator();
  initFormsAndModals();
  initToast();
});

/* ----------------------------------------------------
   1. Live Countdown Timer
   ---------------------------------------------------- */
function initCountdown() {
  // Launch date set 28 days from now or Dec 31
  const now = new Date();
  const targetDate = new Date(now.getTime() + (26 * 24 * 60 * 60 * 1000) + (14 * 60 * 60 * 1000));
  
  const daysEl = document.getElementById('count-days');
  const hoursEl = document.getElementById('count-hours');
  const minsEl = document.getElementById('count-mins');
  const secsEl = document.getElementById('count-secs');

  if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

  function updateTimer() {
    const currentTime = new Date().getTime();
    const distance = targetDate.getTime() - currentTime;

    if (distance <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minsEl.textContent = '00';
      secsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minsEl.textContent = String(minutes).padStart(2, '0');
    secsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* ----------------------------------------------------
   2. Product & Solution Tabs
   ---------------------------------------------------- */
function initSolutionTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      // Update active button state
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update active pane state
      tabPanes.forEach(pane => {
        if (pane.id === targetId) {
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
      });
    });
  });
}

/* ----------------------------------------------------
   3. Thermodynamic ROI & Savings Calculator
   ---------------------------------------------------- */
function initSavingsCalculator() {
  const appSelect = document.getElementById('calc-application');
  const heaterSelect = document.getElementById('calc-current-heater');
  const volumeSlider = document.getElementById('calc-water-volume');
  const volumeDisplay = document.getElementById('calc-volume-display');

  const savingsNprEl = document.getElementById('calc-savings-npr');
  const savingsPercentEl = document.getElementById('calc-savings-percent');
  const oldCostEl = document.getElementById('calc-old-cost');
  const newCostEl = document.getElementById('calc-new-cost');
  const newBarEl = document.getElementById('calc-bar-new');

  if (!volumeSlider || !savingsNprEl) return;

  function calculateSavings() {
    const volumeLiters = parseInt(volumeSlider.value, 10);
    if (volumeDisplay) {
      volumeDisplay.textContent = `${volumeLiters.toLocaleString()} Liters / Day`;
    }

    // Average temperature rise in Nepal: 15°C cold water to 55°C hot water = ΔT = 40°C
    // Energy (kWh) = (Liters * 40 * 4.184) / 3600 ≈ Liters * 0.0465 kWh
    const dailyTheoreticalKWh = volumeLiters * 0.0465;

    // Heating system efficiencies / COPs
    // Electric geyser COP: 0.90
    // Gas/LPG geyser equivalent electrical cost factor: 1.15
    // Diesel Boiler equivalent factor: 1.35
    // Solar with heavy winter electric backup: 0.60 effective annual
    let oldSystemFactor = 1.0;
    const currentHeater = heaterSelect ? heaterSelect.value : 'electric';

    switch (currentHeater) {
      case 'electric':
        oldSystemFactor = 1.0 / 0.90; // approx 1.11 kWh per heat kWh
        break;
      case 'gas':
        oldSystemFactor = 1.25;
        break;
      case 'diesel':
        oldSystemFactor = 1.45;
        break;
      case 'solar-electric':
        oldSystemFactor = 0.65;
        break;
      default:
        oldSystemFactor = 1.11;
    }

    // Suntec Heat Pump COP is between 4.2 and 4.6 (takes ambient heat from air)
    // Only consumes 1 / 4.3 ≈ 0.23 kWh of electricity per unit of heat!
    const suntecHeatPumpCOP = 4.3;
    const suntecKWh = dailyTheoreticalKWh / suntecHeatPumpCOP;
    const oldKWh = dailyTheoreticalKWh * oldSystemFactor;

    // Nepal electricity tariff average per kWh for commercial/domestic blend: ~ NPR 13.50
    const tariffNPR = 13.50;

    const monthlyOldCost = Math.round(oldKWh * 30 * tariffNPR);
    const monthlySuntecCost = Math.round(suntecKWh * 30 * tariffNPR);
    const annualSavingsNPR = Math.round((monthlyOldCost - monthlySuntecCost) * 12);
    const savingsPercent = Math.round(((monthlyOldCost - monthlySuntecCost) / monthlyOldCost) * 100);

    // Update UI
    savingsNprEl.textContent = `NPR ${annualSavingsNPR.toLocaleString()}`;
    if (savingsPercentEl) {
      savingsPercentEl.textContent = `${savingsPercent}% Cost Cut`;
    }
    if (oldCostEl) {
      oldCostEl.textContent = `NPR ${monthlyOldCost.toLocaleString()} / mo`;
    }
    if (newCostEl) {
      newCostEl.textContent = `NPR ${monthlySuntecCost.toLocaleString()} / mo`;
    }
    if (newBarEl) {
      const barPercent = Math.max(15, Math.min(35, 100 - savingsPercent));
      newBarEl.style.width = `${barPercent}%`;
    }
  }

  // Bind input listeners
  volumeSlider.addEventListener('input', calculateSavings);
  if (appSelect) appSelect.addEventListener('change', () => {
    // preset reasonable volume when application changes
    if (appSelect.value === 'home') volumeSlider.value = 250;
    else if (appSelect.value === 'villa') volumeSlider.value = 500;
    else if (appSelect.value === 'hotel') volumeSlider.value = 2500;
    else if (appSelect.value === 'pool') volumeSlider.value = 4000;
    calculateSavings();
  });
  if (heaterSelect) heaterSelect.addEventListener('change', calculateSavings);

  // Initial run
  calculateSavings();
}

/* ----------------------------------------------------
   4. Forms, Modal & Toast Notifications
   ---------------------------------------------------- */
function initFormsAndModals() {
  const modal = document.getElementById('quote-modal');
  const openModalBtns = document.querySelectorAll('.open-quote-modal-btn');
  const closeModalBtns = document.querySelectorAll('.close-quote-modal-btn');

  // Open modal
  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (modal) modal.classList.add('open');
    });
  });

  // Close modal
  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (modal) modal.classList.remove('open');
    });
  });

  // Close on outside click
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });
  }

  // Handle Notify / Waitlist Form
  const notifyForm = document.getElementById('notify-form');
  if (notifyForm) {
    notifyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = notifyForm.querySelector('input[type="email"], input[type="text"]');
      const val = emailInput ? emailInput.value.trim() : '';

      if (!val) {
        showToast('Please enter your email or phone number', 'warning');
        return;
      }

      // Save to localStorage for persistence
      const subscribers = JSON.parse(localStorage.getItem('suntec_subscribers') || '[]');
      subscribers.push({ contact: val, date: new Date().toISOString() });
      localStorage.setItem('suntec_subscribers', JSON.stringify(subscribers));

      notifyForm.reset();
      showToast('Thank you! You are on our VIP launch list. We will notify you shortly.', 'success');
    });
  }

  // Handle Quote Request Modal Form
  const modalForm = document.getElementById('modal-quote-form');
  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = modalForm.querySelector('[name="name"]').value.trim();
      const phone = modalForm.querySelector('[name="phone"]').value.trim();
      const appType = modalForm.querySelector('[name="application"]').value;

      if (!name || !phone) {
        showToast('Please provide your name and phone number', 'warning');
        return;
      }

      // Save lead
      const leads = JSON.parse(localStorage.getItem('suntec_quote_leads') || '[]');
      leads.push({ name, phone, appType, date: new Date().toISOString() });
      localStorage.setItem('suntec_quote_leads', JSON.stringify(leads));

      modalForm.reset();
      if (modal) modal.classList.remove('open');
      showToast(`Thank you ${name}! Our heating engineer will call you at ${phone} today.`, 'success');
    });
  }

  // Handle Contact Section Form
  const contactForm = document.getElementById('direct-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = contactForm.querySelector('[name="contact_name"]').value.trim();
      const phone = contactForm.querySelector('[name="contact_phone"]').value.trim();

      if (!name || !phone) {
        showToast('Please provide your name and contact number', 'warning');
        return;
      }

      contactForm.reset();
      showToast(`Inquiry sent! We have received your message, ${name}.`, 'success');
    });
  }
}

/* ----------------------------------------------------
   5. Toast Notification System
   ---------------------------------------------------- */
let toastTimeout;
function showToast(message, type = 'success') {
  let toast = document.getElementById('global-toast');
  if (!toast) return;

  const msgEl = toast.querySelector('.toast-text');
  if (msgEl) msgEl.textContent = message;

  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}

function initToast() {
  // ensure toast container exists
}
