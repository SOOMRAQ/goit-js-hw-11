import axios from 'axios';
import { Notify } from 'notiflix';

// Описаний в документації
import SimpleLightbox from 'simplelightbox';
// Додатковий імпорт стилів
import 'simplelightbox/dist/simple-lightbox.min.css';

// Variables -------------------------------------------------
const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadMore = document.querySelector('.load-more');

var lightbox = new SimpleLightbox('.gallery__link', {
  captionsData: 'alt',
  captionDelay: 250,
  overlayOpacity: 0.9,
  navText: ['⇜', '⇝'],
  closeText: '✗',
});

// API ------
const USER_KEY = '30894904-b3442836f64f4cd578f07534a';

let page = 1;

// Event-listeners -------------------------------------------
form.addEventListener('submit', event => {
  event.preventDefault();
  gallery.innerHTML = '';
  loadMore.style.display = 'none';
  page = 1;

  fetchData();
});

loadMore.style.display = 'none';
loadMore.addEventListener('click', () => fetchData());

// Functions -------------------------------------------------

async function fetchData() {
  const parametres = new URLSearchParams({
    key: USER_KEY,
    q: form.searchQuery.value,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: page,
    per_page: 40,
  });

  try {
    const result = await axios.get(`https://pixabay.com/api/?${parametres}`);

    if (result.data.hits.length === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    } else if (page === 1) {
      loadMore.style.display = 'block';
      //   lightbox.refresh();
      Notify.success(`Hooray! We found ${result.data.totalHits} images.`);
    } else if (result.data.totalHits === gallery.children.length) {
      Notify.info(`We're sorry, but you've reached the end of search results.`);
    }

    gallery.insertAdjacentHTML(
      'beforeend',
      result.data.hits.map(createMarkup).join('')
    );
    page++;

    if (result.data.totalHits <= gallery.children.length) {
      loadMore.style.display = 'none';
      Notify.info(`We're sorry, but you've reached the end of search results.`);
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

function createMarkup({
  webformatURL,
  tags,
  likes,
  views,
  comments,
  downloads,
  largeImageURL,
}) {
  return `
   <a class="gallery__link" href="${largeImageURL}">
          <div class="photo-card">
            <img src=${webformatURL} alt="${tags}" loading="lazy" class="photo-preview" />
            <div class="info">
              <p class="info-item">
                <b>Likes</b> ${likes}
              </p>
              <p class="info-item">
                <b>Views</b> ${views}
              </p>
              <p class="info-item">
                <b>Comments</b> ${comments}
              </p>
              <p class="info-item">
                <b>Downloads</b> ${downloads}
              </p>
            </div>
          </div></a>
  `;
}
