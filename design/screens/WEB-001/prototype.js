const heroSlides = [
  "../../banner/Koyu mermerde beyaz hava temizleyici-1.png",
  "../../banner/Krom detaylı lüks kahve makinesi-2.png",
  "../../banner/Pembe çay makinesi yanında Türk çayı-3.png",
];

const heroImage = document.querySelector("[data-hero-image]");
const heroDots = [...document.querySelectorAll("[data-slide]")];
let activeSlide = 0;
let heroTimer;

function showSlide(index) {
  activeSlide = (index + heroSlides.length) % heroSlides.length;
  heroImage.src = heroSlides[activeSlide];
  heroImage.alt = `Xinobi tanıtım bannerı ${activeSlide + 1}`;
  heroDots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === activeSlide));
}

function restartHero() {
  clearInterval(heroTimer);
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) heroTimer = setInterval(() => showSlide(activeSlide + 1), 6500);
}

heroDots.forEach((dot) => dot.addEventListener("click", () => { showSlide(Number(dot.dataset.slide)); restartHero(); }));
restartHero();

const megaMenu = document.querySelector("#mega-menu");
const menuTriggers = [...document.querySelectorAll("[aria-controls='mega-menu']")];
function setMenu(open, trigger = menuTriggers[0], manageFocus = true) {
  megaMenu.hidden = !open;
  menuTriggers.forEach((item) => item.setAttribute("aria-expanded", String(open)));
  if (manageFocus && open) megaMenu.querySelector("a").focus();
  else if (manageFocus) trigger.focus();
}
let menuCloseTimer;
const desktopMenuTrigger = document.querySelector(".nav-trigger");
const mobileMenuTrigger = document.querySelector(".menu");
desktopMenuTrigger.addEventListener("click", () => setMenu(true, desktopMenuTrigger));
mobileMenuTrigger.addEventListener("click", () => setMenu(megaMenu.hidden, mobileMenuTrigger));
desktopMenuTrigger.addEventListener("mouseenter", () => { clearTimeout(menuCloseTimer); setMenu(true, desktopMenuTrigger, false); });
desktopMenuTrigger.addEventListener("mouseleave", () => { menuCloseTimer = setTimeout(() => setMenu(false, desktopMenuTrigger, false), 160); });
megaMenu.addEventListener("mouseenter", () => clearTimeout(menuCloseTimer));
megaMenu.addEventListener("mouseleave", () => { menuCloseTimer = setTimeout(() => setMenu(false, desktopMenuTrigger, false), 160); });
document.querySelector(".mega-close").addEventListener("click", () => setMenu(false));
megaMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));

function scrollTrack(selector, direction) {
  const track = document.querySelector(selector);
  track.scrollBy({ left: direction * Math.max(280, track.clientWidth * 0.75), behavior: "smooth" });
}
document.querySelector("[data-product-prev]").addEventListener("click", () => scrollTrack("[data-product-track]", -1));
document.querySelector("[data-product-next]").addEventListener("click", () => scrollTrack("[data-product-track]", 1));

const nobiPanel = document.querySelector("#nobi-panel");
const nobiTrigger = document.querySelector(".nobi");
function setNobi(open) {
  nobiPanel.hidden = !open;
  nobiTrigger.setAttribute("aria-expanded", String(open));
  if (open) nobiPanel.querySelector("[data-nobi-close]").focus();
  else nobiTrigger.focus();
}
nobiTrigger.addEventListener("click", () => setNobi(nobiPanel.hidden));
document.querySelector("[data-nobi-close]").addEventListener("click", () => setNobi(false));

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!nobiPanel.hidden) setNobi(false);
  else if (!megaMenu.hidden) setMenu(false);
});
