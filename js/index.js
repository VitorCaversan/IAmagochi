import { loadPet } from './petStorage.js';

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

  function buildPrompt(userMessage) {
    // Build a personality string from the pet's personality values.
    const personality = pet.personality;
    const personalityStr = `Rage (${personality.anger}/10), Happiness (${personality.happiness}/10), Sadness (${personality.sadness}/10)`;

    // Use pet attributes to indicate hunger and tiredness.
    // (Adjust these calculations as needed based on your attributes' logic.)
    const attributes = pet.attributes;
    const petHunger = attributes.satiation; // Here, 'satiation' is used as a hunger indicator.
    const petTiredness = attributes.energy;  // 'energy' indicates tiredness.

    return `Pet Name: ${pet.petName}  User Nickname: ${pet.nickname}  Pet Species: ${pet.species}  Pet Personality: ${personalityStr}  Pet Hunger: ${petHunger}/10  Pet Tiredness: ${petTiredness}/10  Prioritize responding based on the pet's personality and current status. Make sure the response reflects the pet's emotional and physical state (e.g., hunger, tiredness, happiness, sadness, or rage). Use a short, friendly, and engaging tone as the pet would. Keep the language simple, suitable for a child aged 6-12, and make the Buddy sound like a curious and playful creature with a simple mind. user message: ${userMessage}`;
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
});
