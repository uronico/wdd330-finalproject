// Load config (for localStorage key)
let config = {};

async function loadConfig() {
  try {
    const response = await fetch('data/config.json');
    if (!response.ok) throw new Error('Failed to load config');
    config = await response.json();
  } catch (error) {
    console.error('Config load error:', error);
    // Fallback config if JSON fails
    config = {
      dogApi: {
        breedsUrl: 'https://api.thedogapi.com/v1/breeds',
        imagesUrl: 'https://api.thedogapi.com/v1/images/search'
      },
      catApi: {
        breedsUrl: 'https://api.thecatapi.com/v1/breeds',
        imagesUrl: 'https://api.thecatapi.com/v1/images/search'
      },
      localStorageKey: 'adoptedPets'
    };
  }
}

const backToHomeBtn = document.getElementById('backToHomeBtn');
const adoptedPetsSection = document.getElementById('adoptedPets');
const noAdoptionsSection = document.getElementById('noAdoptions');
const errorSection = document.getElementById('error');

function loadAdoptedPets() {
  errorSection.classList.add('hidden');
  const adoptedPets = JSON.parse(localStorage.getItem(config.localStorageKey)) || [];

  if (adoptedPets.length === 0) {
    adoptedPetsSection.classList.add('hidden');
    noAdoptionsSection.classList.remove('hidden');
    return;
  }

  noAdoptionsSection.classList.add('hidden');
  adoptedPetsSection.classList.remove('hidden');
  adoptedPetsSection.innerHTML = ''; // Clear previous content

  adoptedPets.forEach((pet, index) => {
    const petCard = document.createElement('div');
    petCard.className = `adopted-pet ${pet.type}`;
    const typeIcon = pet.type === 'dog' ? '🐶' : '🐱';
    const detail1Label = pet.type === 'dog' ? 'Breed Group:' : 'Origin:';
    const detail2Label = 'Life Span:';

    petCard.innerHTML = `
      <img src="${pet.imageUrl}" alt="${pet.name}" />
      <h3><span class="type-icon">${typeIcon}</span>${pet.name}</h3>
      <p><strong>${detail1Label}</strong> ${pet.detail1}</p>
      <p><strong>Temperament:</strong> ${pet.temperament}</p>
      <p><strong>${detail2Label}</strong> ${pet.detail2}</p>
      <button class="remove-btn" data-pet-index="${index}">Remove</button>
    `;
    adoptedPetsSection.appendChild(petCard);
  });

  // Add event listeners to all remove buttons after rendering
  const removeButtons = adoptedPetsSection.querySelectorAll('.remove-btn');
  removeButtons.forEach((btn, btnIndex) => {
    btn.addEventListener('click', () => removePet(btnIndex));
  });
}

function removePet(petIndex) {
  const adoptedPets = JSON.parse(localStorage.getItem(config.localStorageKey)) || [];
  
  if (petIndex < 0 || petIndex >= adoptedPets.length) return;

  // Confirm removal
  const petToRemove = adoptedPets[petIndex];
  if (!confirm(`Are you sure you want to remove ${petToRemove.name} (${petToRemove.type}) from your adopted pets?`)) {
    return; // Cancel if user says no
  }

  // Filter out the pet
  adoptedPets.splice(petIndex, 1); // Remove by index
  localStorage.setItem(config.localStorageKey, JSON.stringify(adoptedPets));

  // Re-load the list to update display
  loadAdoptedPets();
}

backToHomeBtn.addEventListener('click', () => {
  window.location.href = 'index.html';
});

// Initialize: Load config then pets
loadConfig().then(() => {
  loadAdoptedPets();
});
