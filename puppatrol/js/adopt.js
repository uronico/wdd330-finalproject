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

  adoptedPets.forEach(pet => {
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
    `;
    adoptedPetsSection.appendChild(petCard);
  });
}

backToHomeBtn.addEventListener('click', () => {
  window.location.href = 'index.html';
});

// Initialize: Load config then pets
loadConfig().then(() => {
  loadAdoptedPets();
});