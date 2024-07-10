import { fetchBreeds, fetchCatByBreed } from './cat-api';
import Notiflix from 'notiflix';
import Choices from 'choices.js';

let breeds = [];
let originalBreeds = [];
const breedSelect = document.getElementById('breed-select');
const carousel = document.querySelector('.carousel');
const loader = document.querySelector('.loader');
const error = document.querySelector('.error');
let choices;
let slickInitialized = false;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    showLoader();
    originalBreeds = await fetchBreeds();
    breeds = [...originalBreeds];
    populateBreedSelect(breeds);
    initializeCarousel(breeds);
    await loadBreedImages(breeds);
    hideLoader();
  } catch (err) {
    hideLoader();
    showError(err.message);
  }
});

function populateBreedSelect(breeds) {
  const options = breeds.map(breed => ({
    value: breed.id,
    label: breed.name,
  }));
  choices = new Choices(breedSelect, {
    searchEnabled: true,
    itemSelectText: '',
    shouldSort: false,
    placeholder: true,
    placeholderValue: 'Selectează o rasă...',
    allowHTML: true,
  });
  choices.setChoices(options, 'value', 'label', true);
}

function handleBreedSelect(event) {
  const breedId = event.detail.value;
  const index = originalBreeds.findIndex(breed => breed.id === breedId);
  if (slickInitialized) {
    $('.carousel').slick('slickGoTo', index);
  }
}

breedSelect.addEventListener('change', handleBreedSelect);

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function initializeCarousel(breeds) {
  const slides = breeds
    .map(breed => {
      return `
        <div class="slide" id="slide-${breed.id}">
          <div class="slide-content">
            <h3>${breed.name}</h3>
            <p>${breed.description}</p>
          </div>
        </div>
      `;
    })
    .join('');
  carousel.innerHTML = slides;
  $(carousel).slick({
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: true,
    variableWidth: true,
    adaptiveHeight: false,
  });
  slickInitialized = true;
}

async function loadBreedImages(breeds) {
  for (const breed of breeds) {
    try {
      const catData = await fetchCatByBreed(breed.id);
      if (catData && catData.url) {
        const slide = document.getElementById(`slide-${breed.id}`);
        const img = document.createElement('img');
        img.src = catData.url;
        img.alt = breed.name;
        img.width = 400;
        slide
          .querySelector('.slide-content')
          .insertBefore(img, slide.querySelector('h3'));
      }
    } catch (error) {
      console.error(`Error fetching image for breed ${breed.id}:`, error);
    }
    await delay(0);
  }
}

function showLoader() {
  loader.style.display = 'block';
}

function hideLoader() {
  loader.style.display = 'none';
}

function showError(message) {
  error.style.display = 'block';
  Notiflix.Notify.failure(message);
}
