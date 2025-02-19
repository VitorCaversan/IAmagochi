import { loadPet, savePet } from './petStorage.js';

const METERS_MAX_VALUE = 10;
const MS_TO_DECREASE_STATUS = 60000;

function typeText(element, text, isBuddy = false) {
  return new Promise((resolve) => {
      const speed = 30;
      let index = 0;
      const messageParagraph = document.createElement('p');
      
      if (isBuddy) {
          messageParagraph.style.color = '#000';
      }
      
      if (text === "Buddy: ...") {
          messageParagraph.style.color = '#000';
          messageParagraph.innerHTML = '<strong>Buddy:</strong> <span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>';
          element.appendChild(messageParagraph);
          
          // add animation to the dots
          const dots = messageParagraph.querySelectorAll('.dot');
          dots.forEach((dot, i) => {
              dot.style.animationDelay = `${i * 0.15}s`;
          });
          
          resolve(messageParagraph);
          return;
      }
      element.appendChild(messageParagraph);
      const [sender, ...messageParts] = text.split(':');
      const message = messageParts.join(':');
      
      messageParagraph.innerHTML = `<strong>${sender}:</strong>`;

      function type() {
          if (index < message.length) {
              messageParagraph.innerHTML = `<strong>${sender}:</strong>${message.substring(0, index + 1)}`;
              index++;
              setTimeout(type, speed);
          } else {
              resolve(messageParagraph);
          }
      }

      if (isBuddy) {
          type();
      } else {
          messageParagraph.innerHTML = `<strong>${sender}:</strong>${message}`;
          resolve(messageParagraph);
      }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const pet = loadPet();
  if (!pet) {
    window.location.href = 'createPet.html';
    return;
  }

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

async function appendMessage(sender, message) {    
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
    const fullMessage = `${sender}: ${message}`;
    const isBuddy = sender === "Buddy";
    return typeText(chatDisplay, fullMessage, isBuddy);
}
  
function checkCalendarConfig() {
    const calendarConfig = JSON.parse(localStorage.getItem("calendarConfig"));
    return calendarConfig;
}

function buildPrompt(userMessage) {
    if (!pet) {
        return userMessage;
    }
 
   const calendarConfig = checkCalendarConfig();

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

   if (isUserCurrentlyBusy()) {
    return `
      The user is currently in a busy hour (study or sleep time).
      You are NOT allowed to proceed with normal conversation.
      Respond ONLY with a short, friendly message telling the user they're busy now,
      and that they can return later to continue.
      user message: ${userMessage}
    `;
   }

   const personalityStr = `Rage (${pet.personality.anger}), Happiness (${pet.personality.happiness}), Sadness (${pet.personality.sadness})`;
   const petHunger = 10 - pet.attributes.satiation;
   const petTiredness = 10 - pet.attributes.energy;
   
   return `
    Pet Name: ${pet.petName}
    Nickname: ${pet.nickname}
    Species: ${pet.species}

    Internal usage only:
    Personality: ${personalityStr}
    Hunger level: ${petHunger} (0-10)
    Tiredness level: ${petTiredness} (0-10)

    Important: Do NOT mention numeric values or attribute names directly.
    Reflect the pet's emotional and physical state in a short, friendly tone simple minded creature.

    IMPORTANT: Always respond in the same language as the user's message.

    user message: ${userMessage}
   `;
  }

  chatSendButton.addEventListener("click", async () => {
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;
    await appendMessage("You", userMessage);
    chatInput.value = "";
    const typingIndicator = await appendMessage("Buddy", "...");

    const prompt = buildPrompt(userMessage);

      try {
         const response = await fetch("http://10.147.17.5:5005/ask?prompt=" + encodeURIComponent(prompt + userMessage));
         const data = await response.json();
         typingIndicator.remove();
         appendMessage("Buddy", data.response || "Sorry, I didn't understand that.");
         const chatSound = document.getElementById('chatSound');
         chatSound.currentTime = 0;
         chatSound.play();
      } catch (error) {
        typingIndicator.remove();

        appendMessage("Buddy", `Error: ${error.message}`);
        const chatSound = document.getElementById('chatSound');
        chatSound.currentTime = 0;
        chatSound.play();
      }
   });

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

  calendar.style.display = "none";

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

   const calendarConfig = {
     studyTime: studyTimeAnswer,
     sleepTime: sleepTimeAnswer
   };
   localStorage.setItem("calendarConfig", JSON.stringify(calendarConfig));

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
 
 function isUserCurrentlyBusy() {
    const config = JSON.parse(localStorage.getItem("calendarConfig"));
    if (!config) return false;
    
    const { studyTime, sleepTime } = config;

    const occupiedHoursMap = {
      'Morning': [8, 9, 10, 11],
      'Afternoon': [12, 13, 14, 15],
      'Morning-Afternoon': [7, 8, 9, 10, 12, 13, 14, 15],
      '19h': [19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5],
      '20h': [20, 21, 22, 23, 0, 1, 2, 3, 4, 5],
      '21h': [21, 22, 23, 0, 1, 2, 3, 4, 5],
      '22h': [22, 23, 0, 1, 2, 3, 4, 5]
    };

    const busyHours = new Set([
      ... (occupiedHoursMap[studyTime] || []),
      ... (occupiedHoursMap[sleepTime] || [])
    ]);

    const currentHour = new Date().getHours();

    return busyHours.has(currentHour);
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

    pet.personality.anger = (anger >= 0) ? Math.min(anger, METERS_MAX_VALUE) : 0;
    pet.personality.happiness = (happiness >= 0) ? Math.min(happiness, METERS_MAX_VALUE) : 0;
    pet.attributes.energy = (METERS_MAX_VALUE - ((sleepiness >= 0) ? Math.min(sleepiness, METERS_MAX_VALUE) : 0));
    pet.attributes.satiation = (satiation >= 0) ? Math.min(satiation, METERS_MAX_VALUE) : 0;

    savePet(pet);
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
