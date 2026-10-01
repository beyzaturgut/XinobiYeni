const heroSlides = [
  {
    title: "Gündelik ritüeller için sessiz teknoloji.",
    copy: "Metalin güçlü karakterini, yalın tasarımı ve kişisel seçimleri aynı üründe buluşturun.",
    image: "../../../apps/web/public/assets/products/tea-maker-101-blue.webp",
    alt: "Lacivert Xinobi Çay Makinesi 101",
    model: "Çay Makinesi 101",
    variant: "Lacivert",
  },
  {
    title: "Kahvenin ritmi, günün temposuna uyum sağlar.",
    copy: "Sade kullanım ve güçlü form, kahve köşenizde tek bir çizgide buluşur.",
    image: "../../../apps/web/public/assets/products/coffee-maker-101-red.webp",
    alt: "Kırmızı Xinobi Kahve Makinesi 101",
    model: "Kahve Makinesi 101",
    variant: "Kırmızı",
  },
  {
    title: "Temiz hava, sakin bir yaşam alanı.",
    copy: "Yaşam alanınıza uyum sağlayan yalın ve anlaşılır bir teknoloji deneyimi.",
    image: "../../../apps/web/public/assets/products/air-purifier-101.webp",
    alt: "Xinobi Hava Temizleme 101",
    model: "Hava Temizleme 101",
    variant: "Gümüş gri",
  },
];

const hero = {
  title: document.querySelector("[data-hero-title]"),
  copy: document.querySelector("[data-hero-copy]"),
  image: document.querySelector("[data-hero-image]"),
  model: document.querySelector("[data-hero-model]"),
  variant: document.querySelector("[data-hero-variant]"),
  index: document.querySelector("[data-hero-index]"),
};
let activeSlide = 0;
let heroPaused = matchMedia("(prefers-reduced-motion: reduce)").matches;
let heroTimer;

function showSlide(index, announce = true) {
  activeSlide = (index + heroSlides.length) % heroSlides.length;
  const slide = heroSlides[activeSlide];
  hero.title.textContent = slide.title;
  hero.copy.textContent = slide.copy;
  hero.image.src = slide.image;
  hero.image.alt = slide.alt;
  hero.model.textContent = slide.model;
  hero.variant.textContent = slide.variant;
  hero.index.textContent = String(activeSlide + 1).padStart(2, "0");
  if (!announce) hero.index.closest("span").setAttribute("aria-live", "off");
  else hero.index.closest("span").setAttribute("aria-live", "polite");
}

function restartHero() {
  clearInterval(heroTimer);
  if (!heroPaused) heroTimer = setInterval(() => showSlide(activeSlide + 1, false), 6500);
}

document.querySelector("[data-hero-prev]").addEventListener("click", () => { showSlide(activeSlide - 1); restartHero(); });
document.querySelector("[data-hero-next]").addEventListener("click", () => { showSlide(activeSlide + 1); restartHero(); });
document.querySelector("[data-hero-pause]").addEventListener("click", (event) => {
  heroPaused = !heroPaused;
  event.currentTarget.textContent = heroPaused ? "▶" : "Ⅱ";
  event.currentTarget.setAttribute("aria-label", heroPaused ? "Otomatik geçişi başlat" : "Otomatik geçişi duraklat");
  restartHero();
});
restartHero();

const megaMenu = document.querySelector("#mega-menu");
const menuTriggers = [...document.querySelectorAll("[aria-controls='mega-menu']")];
function setMenu(open, trigger = menuTriggers[0]) {
  megaMenu.hidden = !open;
  menuTriggers.forEach((item) => item.setAttribute("aria-expanded", String(open)));
  if (open) megaMenu.querySelector("a").focus();
  else trigger.focus();
}
menuTriggers.forEach((trigger) => trigger.addEventListener("click", () => setMenu(megaMenu.hidden, trigger)));
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
