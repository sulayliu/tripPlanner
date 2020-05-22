const originFormEle = document.querySelector(`.origin-form`);
const destinationFormEle = document.querySelector(`.destination-form`);
const originUL = document.querySelector(`.origins`);
const destinationUL = document.querySelector(`.destinations`);
const buttonEle = document.querySelector(`.plan-trip`);
const mapKey = `pk.eyJ1Ijoic3VsYXlsaXUiLCJhIjoiY2thNWlrYmNnMDBpaDNsbm9lOHQ2MG5ncSJ9.iLbn-Tba_v8DH2S_ffwwDA`;
const tranKey = `1JEha51b8t7HwrkzlGmM`;
let originLon;
let originLat;
let destinationLon;
let destinationLat;

originFormEle.addEventListener(`submit`, function(event){
  const value = event.target.querySelector(`input`).value;
  originLat = undefined;
  originLon = undefined;

  if(value !== ``) {
    searchLocation(value, originUL);
  }
  event.preventDefault();
});

destinationFormEle.addEventListener(`submit`, function(event){
  const value = event.target.querySelector(`input`).value;

  destinationLon = undefined;
  destinationLat = undefined;

  if(value !== ``) {
    searchLocation(value, destinationUL);
  }
  event.preventDefault();
});

originUL.addEventListener(`click`, function(event) {
  const clickedEle = event.target.closest('li');

  removeTheSelectedList(originUL);
  clickedEle.classList.add(`selected`);
  originLon = clickedEle.dataset.long;
  originLat = clickedEle.dataset.lat;
});

destinationUL.addEventListener(`click`, function(event) {
  const clickedEle = event.target.closest('li');

  removeTheSelectedList(destinationUL);
  clickedEle.classList.add(`selected`);
  destinationLon = clickedEle.dataset.long;
  destinationLat = clickedEle.dataset.lat;
});

buttonEle.addEventListener(`click`, function(event) {
  if(originLon !== undefined && destinationLon !== undefined) {
    if(originLat == destinationLat && originLon == destinationLon) {
      alert(`No need to move!`);
    } else {
      GetTrip(originLat, originLon, destinationLat, destinationLon);
    }
  }
});

// function that capitalize the first letter.
String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1)
}

// Remove the selected class from existed list.
function removeTheSelectedList(location) {
  const lists = location.querySelectorAll(`li`);

  lists.forEach((list) => {
    if(list.classList.contains(`selected`)) {
      list.classList.remove(`selected`);
    }
  });
}

// Search location function.
function searchLocation(name, ULEle) {
  fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${name}.json?bbox=-97.325875,49.766204,-96.953987,49.99275&access_token=${mapKey}&limit=10`)
    .then((resp) => {
      if (resp.ok) {
        return resp.json();
      } else {
        throw new Error("There is an error on street name.");
      }
    })
    .then((json) => {
      getStreetsList(json.features, ULEle);
    })
}

// List the search results.
function getStreetsList(features, ULEle) {
  let streetHTML = ``;
  ULEle.innerHTML = ``;

  features.forEach(feature => {
    if (feature.properties.address !== undefined) {
      streetHTML +=  `
        <li data-long="${feature.center[0]}" data-lat="${feature.center[1]}">
          <div class="name">${feature.text}</div>
          <div>${feature.properties.address}</div>
        </li>`
    }
  });

  ULEle.innerHTML = streetHTML;
}

// Fetch the trip plan.
function GetTrip(originlat, originlon, destlat, destlon) {
  fetch(`https://api.winnipegtransit.com/v3/trip-planner.json?origin=geo/${originlat},${originlon}&api-key=${tranKey}&destination=geo/${destlat},${destlon}`)
    .then((resp) => {
      if (resp.ok) {
        return resp.json();
      } else {
        throw new Error("There is an error on getting trip.");
      }
    })
    .then((json) => {
      TripplanHTML(json.plans[0].segments);
    })
}

// List the trip plan on the page.
function TripplanHTML(segments) {
  const mytripEle = document.querySelector(`.my-trip`);
  mytripEle.innerHTML = ``;
  let html = ``;
  segments.forEach((segment) => {
    if (segment.type === `walk`) {
      if (segment.to.stop === undefined) {
        html +=  `<li>
        <i class="fas fa-walking" aria-hidden="true"></i>
        ${segment.type.capitalize()} for ${segment.times.durations.total} minutes
        to your destination.
      </li>`
      } else {
        html +=  `<li>
        <i class="fas fa-walking" aria-hidden="true"></i>
        ${segment.type.capitalize()} for ${segment.times.durations.total} minutes
        to stop #${segment.to.stop.key} - ${segment.to.stop.name}
      </li>`
      }
    } else if (segment.type === `ride`) {
      html +=  `<li>
        <i class="fas fa-bus" aria-hidden="true"></i>
        ${segment.type.capitalize()} the ${segment.route.name ? segment.route.name : segment.route.key} for ${segment.times.durations.total} minutes.
      </li>`
    } else if (segment.type === `ride`) {
      html +=  `<li>
      <i class="fas fa-ticket-alt" aria-hidden="true"></i>
      ${segment.type.capitalize()} from stop #${segment.from.stop.key} - ${segment.from.stop.name} to stop #${segment.to.stop.key} - ${segment.to.stop.name}
    </li>`
    }
  });

  mytripEle.innerHTML = html;
}