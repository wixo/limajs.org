'use strict';

const limaJS = {
  day: null,
  month: null,
};

const onWindowScroll = ({ event, logo, scheme }) => {
  scheme
    .from_hue(event.path[1].scrollY)
    .scheme('analogic')
    .variation('soft');
  const colors = scheme.colors();

  logo.style.background = `linear-gradient(#${colors[0]},#${colors[3]})`;
};

const colorLogo = () => {
  const scheme = new ColorScheme();
  const logo = document.querySelector('.logo');
  const fakeEvent = { path: [null, { scrollY: 0 }] };

  onWindowScroll({ event: fakeEvent, logo, scheme });
  document.addEventListener('scroll', event => onWindowScroll({ event, logo, scheme }));
};

const replaceSocialIcons = container => {
  [...container.children].forEach(child => {
    fetch('images/icons/' + child.className + '.svg')
      .then(response => response.text())
      .then(svg => {
        child.innerHTML = svg;
      });
  });
};

const fetchEvents = () => new Promise((resolve, reject) => {
  const callbackId = `__callback_${Date.now()}`;
  window[callbackId] = resolve;
  const script = document.createElement('script');
  script.src = `https://api.meetup.com/LimaJS/events?callback=${callbackId}`;
  document.body.appendChild(script);
});

const buildSponsors = container => {
  fetch('./SPONSORS.md')
    .then(response => response.text())
    .then(markdown => {
      container.innerHTML += snarkdown(markdown);
    });
};

const formatDateTimeToGCalendar = dateTime => {
  return dateTime
    .toISOString()
    .split('-')
    .join('')
    .split(':')
    .join('')
    .split('.000')
    .join('');
};

const addToCalendarLink = container => {
  const baseURL = 'https://calendar.google.com/calendar/r/eventedit';
  const eventName = 'Lima JS';
  const startDateTime = formatDateTimeToGCalendar(
    new Date(new Date().getUTCFullYear(), limaJS.month - 1, limaJS.day, 19, 0, 0),
  );
  const endDateTime = formatDateTimeToGCalendar(
    new Date(new Date().getUTCFullYear(), limaJS.month - 1, limaJS.day, 22, 0, 0),
  );
  const link = `${baseURL}?text=${eventName}&dates=${startDateTime}/${endDateTime}`;

  container.setAttribute('href', link);
};

const buildGoogleCalendarURL = (meetup) => {
  const baseURL = 'https://calendar.google.com/calendar/r/eventedit';
  const startDateTime = formatDateTimeToGCalendar(new Date(meetup.time));
  const endDateTime = formatDateTimeToGCalendar(new Date(meetup.time + meetup.duration));
  return `${baseURL}?text=${meetup.name}&dates=${startDateTime}/${endDateTime}`
};

const NextEvent = (meetup) => `
  <h3><a href="${meetup.link}">${meetup.name}</a></h3>
  <p>
    📅 ${(new Date(meetup.time)).toLocaleString('es-PE').slice(0, -3)}<br />
    📍 ${meetup.venue.name}
  <p>
  <p>${meetup.description}</p>
  <p>
    <a class="button add-to-calendar" href="${buildGoogleCalendarURL(meetup)}">
      <span>Agregar a Calendario</span>
    </a>
  </p>
`;


const FutureEvents = (meetups) => `
  <h2 class="section-title">Eventos futuros</h3>
  ${meetups.map(meetup => `
    <div>
      <a href="${meetup.link}">
        ${(new Date(meetup.time)).toLocaleDateString('es-PE')}
        ${meetup.name}
        @ ${meetup.venue.name}
      </a>
    </div>
  `).join('\n')}
`;

const PastEvents = (meetups) => `
  <a href="https://www.meetup.com/LimaJS/events/past/">Ver eventos pasados en meetup.com</a>
`;

const renderEvents = (container, meetups) => {
  const [next, ...rest] = meetups;
  container.innerHTML = `
    ${NextEvent(next)}
    <hr />
    ${FutureEvents(rest.slice(0, 3))}
    <hr />
    ${PastEvents()}
  `;
};

const main = () => {
  replaceSocialIcons(document.querySelector('section.social'));
  buildSponsors(document.querySelector('div.sponsors'));
  colorLogo();
  fetchEvents()
    .then(({ data }) => renderEvents(document.querySelector('div.LimaJS-schedule'), data))
    .catch(err => alert(`Error cargando datos de meetup.com.\n${err.message}`));
};

window.addEventListener('load', main);

//
// Google analytics tracker
//
(function(l,i,m,a,_,j,s){l['GoogleAnalyticsObject']=_;l[_]=l[_]||function(){
(l[_].q=l[_].q||[]).push(arguments)},l[_].l=1*new Date();j=i.createElement(m),
s=i.getElementsByTagName(m)[0];j.async=1;j.src=a;s.parentNode.insertBefore(j,s)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-37026516-1', 'auto');
ga('send', 'pageview');
