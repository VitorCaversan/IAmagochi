import { savePet } from './petStorage.js';

const speciesPersonalities = {
   cat: { anger: 3, happiness: 7, sadness: 2 },
   unicorn: { anger: 1, happiness: 9, sadness: 1 },
   dragon: { anger: 8, happiness: 6, sadness: 3 }
};

const defaultAttributes = {
   cat: { level: 1,
          experience: 0,
          energy: 5, // contrário de sleepiness
          satiation: 8, // contrário de hunger
          excitement: 1}, // contrário de boredom
   unicorn: { level: 1,
              experience: 0,
              energy: 9, // contrário de sleepiness
              satiation: 10, // contrário de hunger
              excitement: 10},
   dragon: { level: 1,
             experience: 0,
             energy: 9, // contrário de sleepiness
             satiation: 1, // contrário de hunger
             excitement: 4}
};

function updatePersonality(species) {
   if (species && speciesPersonalities[species]) {
      const { anger, happiness, sadness } = speciesPersonalities[species];
      document.getElementById("anger").value = anger;
      document.getElementById("happiness").value = happiness;
      document.getElementById("sadness").value = sadness;
   }
}

function updatePetImg(species) {
   const img = document.getElementById("pet");
   if ("cat" === species) {
      img.src = "../images/gifs/Gato.gif";
   }
   else if ("unicorn" === species) {
      img.src = "../images/gifs/Unicornio.gif";
   }
   else if ("dragon" === species) {
      img.src = "../images/gifs/Dragao.gif";
   }
   else {
      img.src = "";
   }
}

function updatePetDescription(species) {
   const descriptionText = document.getElementById("descriptionText");
   let description = "";

   switch (species) {
      case "cat":
         description = "Hi! I'm a cat. I'm independent and curious. I love to explore and can be very affectionate.";
         break;
      case "unicorn":
         description = "Hello! I'm a unicorn. I'm magical and rare. I'm a symbol of purity and grace, bringing joy to everyone around me.";
         break;
      case "dragon":
         description = "Greetings! I'm a dragon. I'm powerful and majestic. I'm known for my strength and wisdom, often guarding treasures. Quite angry though.";
         break;
      default:
         description = "Please select a species to hear me talk about myself.";
   }

   descriptionText.textContent = description;
}

function createPet() {
   const petName = document.getElementById("petName").value;
   const nickname = document.getElementById("nickname").value;
   const pronouns = document.querySelector("input[name='pronouns']:checked")?.value;
   const species = document.querySelector("input[name='species']:checked")?.value;

   if (!petName || !nickname || !pronouns || !species) {
      alert("Please fill in all fields.");
      return;
   }

   const personality = speciesPersonalities[species];
   const attributes = defaultAttributes[species];

   const pet = {
      petName,
      nickname,
      pronouns,
      species,
      personality: personality,
      attributes: attributes
   }
   savePet(pet)

   console.log("Pet Created:", pet);
   alert(`Pet "${petName}" created successfully!`);

   window.location.href = "index.html";
}

document.querySelectorAll("input[name='species']").forEach(radio => {
   radio.addEventListener("change", (event) => {
      updatePersonality(event.target.value);
      updatePetImg(event.target.value);
      updatePetDescription(event.target.value);
   });
});


document.getElementById("petForm").addEventListener("submit", function(event) {
   event.preventDefault();
   createPet();
});