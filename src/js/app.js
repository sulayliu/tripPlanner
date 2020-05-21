const originFormEle = document.querySelector(`.origin-form`);
const destinationFormEle = document.querySelector(`.destination-form`);

const apikey = `pk.eyJ1Ijoic3VsYXlsaXUiLCJhIjoiY2thNWlrYmNnMDBpaDNsbm9lOHQ2MG5ncSJ9.iLbn-Tba_v8DH2S_ffwwDA`;

originFormEle.addEventListener(`submit`, function(event){
  const value = event.target.querySelector(`input`).value;
  if(value !== ``) {
    console.log(value)
    // searchStreets(inputEle.value);
  }
  event.preventDefault();
});


function searchStreets(name) {
  fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${name}.json?bbox=-97.325875, 49.766204, -96.953987, 49.99275&access_token=${apikey}&limit=10`)
    .then((resp) => {
      if (resp.ok) {
        return resp.json();
      } else {
        throw new Error("There is an error on street name.");
      }
    })
    .then((json) => {
      getStreetList(json.features);
    })
}


function getStreetList(features) {
  let streetHTML = ``;

  features.sort((a, b) => GetDistance(a.center[0], a.center[1], localLng, localLat) - GetDistance(b.center[0], b.center[1], localLng, localLat));
  
  features.forEach(feature => {
    if (feature.properties.address !== undefined) {
      streetHTML +=  `
      <li class="poi" data-long="${feature.center[0]}" data-lat="${feature.center[1]}">
        <ul>
          <li class="name">${feature.text}</li>
          <li class="street-address">${feature.properties.address}</li>
          <li class="distance">${GetDistance(feature.center[0], feature.center[1], localLng, localLat)} KM</li>
        </ul>
      </li>`
    }
  });

  ulEle.innerHTML = streetHTML;
}