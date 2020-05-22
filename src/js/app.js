const originFormEle = document.querySelector(`.origin-form`);
const destinationFormEle = document.querySelector(`.destination-form`);
const originsUL = document.querySelector(`.origins`);
const destinationsUL = document.querySelector(`.destinations`);
const buttonEle = document.querySelector(`.plan-trip`);
let originLon;
let originLat;
let destinationLon;
let destinationLat;

const mapKey = `pk.eyJ1Ijoic3VsYXlsaXUiLCJhIjoiY2thNWlrYmNnMDBpaDNsbm9lOHQ2MG5ncSJ9.iLbn-Tba_v8DH2S_ffwwDA`;
const tranKey = `1JEha51b8t7HwrkzlGmM`;

originFormEle.addEventListener(`submit`, function(event){
  const value = event.target.querySelector(`input`).value;

  if(value !== ``) {
    searchLocation(value, originsUL);
  }
  event.preventDefault();
});

destinationFormEle.addEventListener(`submit`, function(event){
  const value = event.target.querySelector(`input`).value;

  if(value !== ``) {
    searchLocation(value, destinationsUL);
  }
  event.preventDefault();
});

originsUL.addEventListener(`click`, function(event) {
  const lists = originsUL.querySelectorAll(`li`);
  const clickedEle = event.target.closest('li');

  lists.forEach((list) => {
    if(list.classList.contains(`selected`)) {
      list.classList.remove(`selected`);
    }
  })
  clickedEle.classList.add(`selected`);
  originLon = clickedEle.dataset.long;
  originLat = clickedEle.dataset.lat;
  console.log(originLon, originLat);
});

destinationsUL.addEventListener(`click`, function(event) {
  const lists = destinationsUL.querySelectorAll(`li`);
  const clickedEle = event.target.closest('li');

  lists.forEach((list) => {
    if(list.classList.contains(`selected`)) {
      list.classList.remove(`selected`);
    }
  })
  clickedEle.classList.add(`selected`);
  destinationLon = clickedEle.dataset.long;
  destinationLat = clickedEle.dataset.lat;
  console.log(destinationLon, destinationLat);
});

buttonEle.addEventListener(`click`, function(event) {
  if(originLon !== undefined && destinationLon !== undefined) {
    if(originLat == destinationLat && originLon == destinationLon) {
      alert(`No need move!`);
    } else {
      GetTrip(originLat, originLon, destinationLat, destinationLon);
    }
  }
});

// function that capitalize the first letter.
String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1)
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
      console.log(json.plans[0].segments);
      TripplanHTML(json.plans[0].segments);
    })
}

// A function that return the related icon class.
function getIconClass(name) {
  const icons = {
    walk: `fas fa-walking`,
    ride: `fas fa-bus`,
    transfer :`fas fa-ticket-alt`,
  };
  return icons[name];
}

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
        ${segment.type.capitalize()} the Route ${segment.route.key} ${segment.route.name} for ${segment.times.durations.total} minutes.
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
