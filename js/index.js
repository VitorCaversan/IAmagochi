import { loadPet } from './petStorage.js';

const METERS_MAX_VALUE = 10;
const MS_TO_DECREASE_STATUS = 60000; // 60 seconds

document.addEventListener("DOMContentLoaded", () => {
  // Load pet data from storage. If none is found, redirect to pet creation.
  const pet = loadPet();
  if (!pet) {
    window.location.href = 'createPet.html';
    return;
  }

  // Update the UI with the pet's name (if applicable)
  const petNameElement = document.querySelector('.pet-name');
  if (petNameElement) {
    petNameElement.textContent = pet.petName;
  }

  // -------------------------
  // CHAT FUNCTIONALITY
  // -------------------------
  const chatDisplay = document.getElementById("chat-display");
  const chatInput = document.getElementById("chat-input");
  const chatSendButton = document.getElementById("chat-send-button");

  // Function to append a chat message to the chat display
  function appendMessage(sender, message) {
    const messageElement = document.createElement("p");
    messageElement.textContent = `${sender}: ${message}`;
    chatDisplay.appendChild(messageElement);
    chatDisplay.scrollTop = chatDisplay.scrollHeight; // Scroll to the latest message
  }

  function checkCalendarConfig() {
   const calendarConfig = JSON.parse(localStorage.getItem("calendarConfig"));
   return calendarConfig;
 }

  function buildPrompt(userMessage) {
   const pet = loadPet();
   if (!pet) {
     return userMessage;
   }
 
   const calendarConfig = checkCalendarConfig();
 
   // If the user has NOT set up the calendar, block normal conversation:
   if (!calendarConfig) {
     return `
       The user has NOT set up the calendar yet.
       You are NOT allowed to proceed with normal conversation.
       ONLY respond with a message that instructs the user to set up their calendar.
       The pet's emotional and physical attributes are all measured on a 0–10 scale.
       Use a short, friendly tone.
       user message: ${userMessage}
     `;
   }
   const personalityStr = `Rage (${pet.personality.anger}/10), Happiness (${pet.personality.happiness}/10), Sadness (${pet.personality.sadness}/10)`;
   const petHunger = pet.attributes.satiation;  // 0–10
   const petTiredness = pet.attributes.energy;  // 0–10
   
   return `
     Pet Name: ${pet.petName}
     User Nickname: ${pet.nickname}
     Pet Species: ${pet.species}
     Pet Personality: ${personalityStr}
     Pet Hunger: ${petHunger}/10
     Pet Tiredness: ${petTiredness}/10
     All attributes are measured on a 0–10 scale.
     Prioritize responding based on the pet's personality and current status.
     Make sure the response reflects the pet's emotional and physical state.
     Use a short, friendly tone.
     user message: ${userMessage}
   `;
  }

  // Event listener for the chat send button.
  chatSendButton.addEventListener("click", async () => {
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    appendMessage("You", userMessage);
    chatInput.value = "";

    // Build the prompt dynamically.
    const prompt = buildPrompt(userMessage);

    try {
      const response = await fetch("http://10.147.17.5:5005/ask?prompt=" + encodeURIComponent(prompt));
      const data = await response.json();
      appendMessage("Buddy", data.response || "Sorry, I didn't understand that.");
    } catch (error) {
      appendMessage("Buddy", `Error: ${error.message}`);
    }
  });

  // Allow sending a message with the Enter key.
  document.getElementById('chat-input').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      chatSendButton.click();
    }
  });

  // -------------------------
  // CALENDAR FUNCTIONALITY
  // -------------------------
  const calendarToggleBtn = document.getElementById('calendar-toggle-button');
  const calendar = document.getElementById("calendar");
  const calendarOverlay = document.getElementById("calendar-overlay");

  calendar.style.display = "none"; // Hide the calendar by default

  calendarToggleBtn.addEventListener('click', function () {
    if (calendar.style.display === 'none') {
      calendar.style.display = 'block';
      calendarOverlay.style.display = 'block';
    } else {
      calendar.style.display = 'none';
      calendarOverlay.style.display = 'none';
    }
  });

  calendarOverlay.addEventListener('click', function () {
    calendar.style.display = 'none';
    calendarOverlay.style.display = 'none';
  });

  const cfgBtn = document.getElementById('calendar-config-button');
  const studyTimePopup = document.getElementById('studyTimePopup');
  const studyTimeCloseBtn = studyTimePopup.querySelector('.close-popup');
  const studyTimePopupOpts = studyTimePopup.querySelectorAll('.popup-option');

  const sleepTimePopup = document.getElementById('sleepTimePopup');
  const sleepTimeCloseBtn = sleepTimePopup.querySelector('.close-popup');
  const sleepTimePopupOpts = sleepTimePopup.querySelectorAll('.popup-option');

  cfgBtn.addEventListener('click', function () {
    studyTimePopup.style.display = 'block';
    calendar.style.display = 'none';
    calendarOverlay.style.display = 'none';
  });

  studyTimeCloseBtn.addEventListener('click', function () {
    studyTimePopup.style.display = 'none';
    calendar.style.display = 'block';
    calendarOverlay.style.display = 'block';
  });

  window.addEventListener('click', function (event) {
    if (event.target == studyTimePopup) {
      studyTimePopup.style.display = 'none';
    } else if (event.target == sleepTimePopup) {
      sleepTimePopup.style.display = 'none';
    }
  });

  let answer = '';
  studyTimePopupOpts.forEach(option => {
    option.addEventListener('click', function () {
      answer = this.getAttribute('data-answer');
      studyTimePopup.style.display = 'none';
      sleepTimePopup.style.display = 'block';
    });
  });

  sleepTimeCloseBtn.addEventListener('click', function () {
    sleepTimePopup.style.display = 'none';
    calendar.style.display = 'block';
    calendarOverlay.style.display = 'block';
  });

  sleepTimePopupOpts.forEach(option => {
    option.addEventListener('click', function () {
      answer = answer + '_' + this.getAttribute('data-answer');
      sleepTimePopup.style.display = 'none';
      fillCalendar(answer);
    });
  });

  function fillCalendar(answer) {
   const [studyTimeAnswer, sleepTimeAnswer] = answer.split('_');
 
   // Save the calendar config to localStorage
   const calendarConfig = {
     studyTime: studyTimeAnswer,
     sleepTime: sleepTimeAnswer
   };
   localStorage.setItem("calendarConfig", JSON.stringify(calendarConfig));
 
   // (Existing code to mark hours as 'occupied')
   const occupiedHours = {
     'Morning': [8, 9, 10, 11],
     'Afternoon': [12, 13, 14, 15],
     'Morning-Afternoon': [7, 8, 9, 10, 12, 13, 14, 15],
     '19h': [19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5],
     '20h': [20, 21, 22, 23, 0, 1, 2, 3, 4, 5],
     '21h': [21, 22, 23, 0, 1, 2, 3, 4, 5],
     '22h': [22, 23, 0, 1, 2, 3, 4, 5],
   };
 
   const days = document.querySelectorAll('.day');
   days.forEach(day => {
     const hoursContainer = day.querySelector('.hours');
     hoursContainer.innerHTML = ''; // Clear previous hours
 
     for (let hour = 0; hour < 24; hour++) {
       const hourBlock = document.createElement('div');
       hourBlock.classList.add('hour-block');
       hourBlock.textContent = `${hour}:00`;
       if (occupiedHours[studyTimeAnswer].includes(hour) ||
           occupiedHours[sleepTimeAnswer].includes(hour)) {
         hourBlock.classList.add('occupied');
       }
       hoursContainer.appendChild(hourBlock);
     }
   });

   calendar.style.display = 'block';
   calendarOverlay.style.display = 'block';
 }
 

  // -------------------------
  // STATUS METERS
  // -------------------------
  function updateStatusMeters(anger, happiness, sleepiness, satiation) {
    const angerMeter = document.getElementById('anger');
    const happinessMeter = document.getElementById('happiness');
    const sleepinessMeter = document.getElementById('sleepiness');
    const satiationMeter = document.getElementById('satiation');

    angerMeter.value = anger;
    happinessMeter.value = happiness;
    sleepinessMeter.value = sleepiness;
    satiationMeter.value = satiation;

    // Update the pet's personality and attributes ranging from 0 to 10
    pet.personality.anger = (anger >= 0) ? Math.min(anger, METERS_MAX_VALUE) : 0;
    pet.personality.happiness = (happiness >= 0) ? Math.min(happiness, METERS_MAX_VALUE) : 0;
    pet.attributes.energy = (METERS_MAX_VALUE - ((sleepiness >= 0) ? Math.min(sleepiness, METERS_MAX_VALUE) : 0));
    pet.attributes.satiation = (satiation >= 0) ? Math.min(satiation, METERS_MAX_VALUE) : 0;
  }

  updateStatusMeters(pet.personality.anger,
                     pet.personality.happiness,
                     ((METERS_MAX_VALUE-pet.attributes.energy)),
                     (pet.attributes.satiation));

  const playBtn = document.querySelector('.play');
  const feedBtn = document.querySelector('.feed');
  var   ticksToIncreaseAnger     = 0;
  var   ticksToDecreaseHappiness = 0;

  playBtn.addEventListener('click', function () {
    updateStatusMeters((pet.personality.anger + 1),
                       (pet.personality.happiness + 1),
                       ((METERS_MAX_VALUE - pet.attributes.energy) + 1),
                       (pet.attributes.satiation - 1));

    ticksToDecreaseHappiness = 0;
  });

  feedBtn.addEventListener('click', function () {
    updateStatusMeters((pet.personality.anger - 1),
                       (pet.personality.happiness + 1),
                       ((METERS_MAX_VALUE - pet.attributes.energy) - 1),
                       (pet.attributes.satiation + 1));

    ticksToIncreaseAnger     = 0;
    ticksToDecreaseHappiness = 0;
  });

  // Make energy and satiation drop every time frame
  setInterval(() => {
    pet.attributes.energy = Math.max(pet.attributes.energy - 1, 0);
    pet.attributes.satiation = Math.max(pet.attributes.satiation - 1, 0);

    if (pet.attributes.energy < 4 || pet.attributes.satiation < 4) {
      ticksToIncreaseAnger++;
      ticksToDecreaseHappiness++;

      if (ticksToIncreaseAnger >= 3) {
        pet.personality.anger = Math.min(pet.personality.anger + 1, METERS_MAX_VALUE);
        ticksToIncreaseAnger = 0;
      }
      if (ticksToDecreaseHappiness >= 2) {
        pet.personality.happiness = Math.max(pet.personality.happiness - 1, 0);
        ticksToDecreaseHappiness = 0;
      }
    }

    updateStatusMeters(
      pet.personality.anger,
      pet.personality.happiness,
      (METERS_MAX_VALUE - pet.attributes.energy),
      pet.attributes.satiation
    );

    if (pet.attributes.energy === 0 || pet.attributes.satiation === 0) {
      alert("Your pet is very hungry or tired! Please feed or let it rest.");
    }
  }, MS_TO_DECREASE_STATUS);
});
