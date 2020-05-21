const originFormEle = document.querySelector(`.origin-form`);
const destinationFormEle = document.querySelector(`.destination-form`);
const originsUL = document.querySelector(`.origins`);
const destinationsUL = document.querySelector(`.destinations`);

const apikey = `pk.eyJ1Ijoic3VsYXlsaXUiLCJhIjoiY2thNWlrYmNnMDBpaDNsbm9lOHQ2MG5ncSJ9.iLbn-Tba_v8DH2S_ffwwDA`;

originFormEle.addEventListener(`submit`, function(event){
  const value = event.target.querySelector(`input`).value;

  if(value !== ``) {
    searchOriginLocation(value);
  }
  event.preventDefault();
});

destinationFormEle.addEventListener(`submit`, function(event){
  const value = event.target.querySelector(`input`).value;

  if(value !== ``) {
    searchDestinationLocation(value);
  }
  event.preventDefault();
});

function searchOriginLocation(name) {
  fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${name}.json?bbox=-97.325875,49.766204,-96.953987,49.99275&access_token=${apikey}&limit=10`)
    .then((resp) => {
      if (resp.ok) {
        return resp.json();
      } else {
        throw new Error("There is an error on street name.");
      }
    })
    .then((json) => {
      getOriginsList(json.features);
    })
}

function getOriginsList(features) {
  let streetHTML = ``;
  originsUL.innerHTML = ``;

  features.forEach(feature => {
    if (feature.properties.address !== undefined) {
      streetHTML +=  `
        <li data-long="${feature.center[0]}" data-lat="${feature.center[1]}" class="selected">
          <div class="name">${feature.text}</div>
          <div>${feature.properties.address}</div>
        </li>`
    }
  });

  originsUL.innerHTML = streetHTML;
}