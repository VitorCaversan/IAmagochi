import { loadPet } from './petStorage.js';

function updatePetDisplay() {
    const pet = loadPet();
    if (!pet) {
        window.location.href = 'createPet.html';
        return;
    }
    console.log("teste")
    // Update pet name
    const petNameElement = document.querySelector('.pet-name');
    if (petNameElement) {
        petNameElement.textContent = pet.petName;
    }

    // Update pet sprite based on species
    const catSprite = document.querySelector('.cat-sprite');
    if (catSprite) {
        let spriteUrl = '';
        switch (pet.species) {
            case 'cat':
                spriteUrl = 'images/gifs/Gato.gif';
                break;
            case 'unicorn':
                spriteUrl = 'images/gifs/Unicornio.gif';
                break;
            case 'dragon':
                spriteUrl = 'images/gifs/Dragao.gif';
                break;
        }
        catSprite.style.backgroundImage = `url('${spriteUrl}')`;
        
        // Adjust sprite size if needed
        catSprite.style.width = '32px';
        catSprite.style.height = '32px';
    }
}


document.addEventListener('DOMContentLoaded', updatePetDisplay);