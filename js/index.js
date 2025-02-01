document.addEventListener("DOMContentLoaded", () => {
   const chatDisplay = document.getElementById("chat-display");
   const chatInput = document.getElementById("chat-input");
   const chatSendButton = document.getElementById("chat-send-button");

   function appendMessage(sender, message) {
      const messageElement = document.createElement("p");
      messageElement.textContent = `${sender}: ${message}`;
      chatDisplay.appendChild(messageElement);
      chatDisplay.scrollTop = chatDisplay.scrollHeight; // Scroll to the latest message
   }

   chatSendButton.addEventListener("click", async () => {
      const prompt = " Pet Name: Fluffy  User Nickname: Alfons  Pet Species: Cat Pet Personality: Rage (2/10), Happiness (8/10), Sadness (1/10)  Pet Hunger: 10/10  Pet Tiredness: 4/10  Prioritize responding based on the pet's personality and current status. Make sure the response reflects the pet's emotional and physical state (e.g., hunger, tiredness, happiness, sadness, or rage). Use a short, friendly, and engaging tone as the pet would. Keep the language simple, suitable for a child aged 6-12, and make the Buddy sound like a curious and playful creature with a simple mind. user message: "
      const userMessage = chatInput.value.trim();
      if (!userMessage) return;

      appendMessage("You", userMessage);
      chatInput.value = "";

      try {
         const response = await fetch("http://10.147.17.5:5005/ask?prompt=" + encodeURIComponent(prompt + userMessage));
         const data = await response.json();
         appendMessage("Buddy", data.response || "Sorry, I didn't understand that.");
      } catch (error) {
         appendMessage("Buddy", `Error: ${error.message}`);
      }
   });

   document.getElementById('chat-input').addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
         event.preventDefault();
         document.getElementById('chat-send-button').click();
      }
   });


   // CALENDAR PART

   const calendarToggleBtn = document.getElementById('calendar-toggle-button');
   const calendar = document.getElementById("calendar");
   const calendarOverlay = document.getElementById("calendar-overlay");

   calendar.style.display = "none"; // Hide the calendar by default

   calendarToggleBtn.addEventListener('click', function() {
      if (calendar.style.display === 'none') {
         calendar.style.display = 'block';
         calendarOverlay.style.display = 'block';
      } else {
         calendar.style.display = 'none';
         calendarOverlay.style.display = 'none';
      }
   });

   calendarOverlay.addEventListener('click', function() {
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

   cfgBtn.addEventListener('click', function() {
      studyTimePopup.style.display = 'block';
      calendar.style.display = 'none';
      calendarOverlay.style.display = 'none';
   });

   studyTimeCloseBtn.addEventListener('click', function() {
      studyTimePopup.style.display = 'none';
      calendar.style.display = 'block';
      calendarOverlay.style.display = 'block';
   });

   window.addEventListener('click', function(event) {
      if (event.target == studyTimePopup) {
         studyTimePopup.style.display = 'none';
      }
      else if (event.target == sleepTimePopup) {
         sleepTimePopup.style.display = 'none';
      }
   });

   let answer = '';
   studyTimePopupOpts.forEach(option => {
      option.addEventListener('click', function() {
         answer = this.getAttribute('data-answer');
         studyTimePopup.style.display = 'none';
         sleepTimePopup.style.display = 'block';
      });
   });

   sleepTimeCloseBtn.addEventListener('click', function() {
      sleepTimePopup.style.display = 'none';
      calendar.style.display = 'block';
      calendarOverlay.style.display = 'block';
   });

   sleepTimePopupOpts.forEach(option => {
      option.addEventListener('click', function() {
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
