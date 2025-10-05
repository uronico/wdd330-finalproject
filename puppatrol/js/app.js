// Load config first
let config = {};
let currentPet = null;
let currentPetType = null; // 'dog' or 'cat'

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

const fetchDogBtn = document.getElementById('fetchDogBtn');
const fetchCatBtn = document.getElementById('fetchCatBtn');
const petInfoSection = document.getElementById('petInfo');
const petName = document.getElementById('petName');
const petImage = document.getElementById('petImage');
const petDetail1 = document.getElementById('petDetail1');
const petTemperament = document.getElementById('petTemperament');
const petDetail2 = document.getElementById('petDetail2');
const detailLabel1 = document.getElementById('detailLabel1');
const detailLabel2 = document.getElementById('detailLabel2');
const adoptMeBtn = document.getElementById('adoptMeBtn');
const errorSection = document.getElementById('error');

async function fetchRandomPet(type) {
  errorSection.classList.add('hidden');
  petInfoSection.classList.add('hidden');
  adoptMeBtn.style.display = 'none';

  const apiConfig = type === 'dog' ? config.dogApi : config.catApi;
  const icon = type === 'dog' ? '🐶' : '🐱';
  const detail1Label = type === 'dog' ? 'Breed Group:' : 'Origin:';
  const detail2Label = type === 'dog' ? 'Life Span:' : 'Life Span:';
  const breedsUrl = `${apiConfig.breedsUrl}`;
  const imagesUrl = `${apiConfig.imagesUrl}`;

  try {
    // Fetch all breeds
    const breedsResponse = await fetch(breedsUrl);
    if (!breedsResponse.ok) throw new Error(`Failed to fetch ${type} breeds`);
    const breeds = await breedsResponse.json();

    // Pick a random breed
    const randomBreed = breeds[Math.floor(Math.random() * breeds.length)];

    // Fetch image for the breed
    // Note: For cats, use 'breed_ids' (plural) as per TheCatAPI docs
    const imageParams = type === 'dog' ? `?breed_id=${randomBreed.id}&limit=1` : `?breed_ids=${randomBreed.id}&limit=1`;
    const imageResponse = await fetch(`${imagesUrl}${imageParams}`);
    if (!imageResponse.ok) throw new Error(`Failed to fetch ${type} image`);
    const images = await imageResponse.json();

    const imageUrl = images.length > 0 ? images[0].url : '';

    // Store current pet data
    currentPet = {
      type: type,
      name: randomBreed.name,
      detail1: type === 'dog' ? (randomBreed.breed_group || 'Unknown') : (randomBreed.origin || 'Unknown'),
      temperament: randomBreed.temperament || 'Unknown',
      detail2: randomBreed.life_span || 'Unknown',
      imageUrl: imageUrl || `https://via.placeholder.com/400x300?text=No+${type.charAt(0).toUpperCase() + type.slice(1)} +Image+Available`
    };
    currentPetType = type;

    // Update UI
    petName.textContent = `${icon} ${currentPet.name}`;
    petDetail1.textContent = currentPet.detail1;
    petTemperament.textContent = currentPet.temperament;
    petDetail2.textContent = currentPet.detail2;
    petImage.src = currentPet.imageUrl;
    petImage.alt = currentPet.name;
    detailLabel1.textContent = detail1Label;
    detailLabel2.textContent = detail2Label;

    adoptMeBtn.style.display = 'inline-block';
    petInfoSection.classList.remove('hidden');
  } catch (error) {
    errorSection.textContent = `Error: ${error.message}`;
    errorSection.classList.remove('hidden');
  }
}

function adoptPet() {
  if (!currentPet) return;

  // Get existing adopted pets from localStorage
  let adoptedPets = JSON.parse(localStorage.getItem(config.localStorageKey)) || [];

  // Add current pet (avoid duplicates by checking name and type)
  if (!adoptedPets.some(pet => pet.name === currentPet.name && pet.type === currentPet.type)) {
    adoptedPets.push(currentPet);
    localStorage.setItem(config.localStorageKey, JSON.stringify(adoptedPets));
  }

  // Navigate to adopted page
  window.location.href = 'adopted.html';
}

// Initialize: Load config then attach event listeners for both buttons
loadConfig().then(() => {
  fetchDogBtn.addEventListener('click', () => fetchRandomPet('dog'));
  fetchCatBtn.addEventListener('click', () => fetchRandomPet('cat'));
  adoptMeBtn.addEventListener('click', adoptPet);
});