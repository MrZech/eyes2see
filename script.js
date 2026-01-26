const reveals = document.querySelectorAll('.reveal');
const scrollIndicator = document.getElementById('scrollIndicator');
const heroHalo = document.querySelector('.hero-art .halo');
const heroGrid = document.querySelector('.hero-art .grid');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

reveals.forEach((el) => observer.observe(el));

const updateScrollIndicator = () => {
  if (!scrollIndicator) {
    return;
  }

  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  scrollIndicator.style.height = `${Math.min(progress, 100)}%`;
};

const updateHeroParallax = () => {
  if (!heroHalo || !heroGrid) {
    return;
  }

  const scrollTop = window.scrollY;
  const haloShift = Math.min(scrollTop * 0.12, 50);
  const gridShift = Math.min(scrollTop * 0.08, 35);

  heroHalo.style.transform = `translateY(${haloShift}px)`;
  heroGrid.style.transform = `translateY(${gridShift}px) perspective(800px) rotateX(6deg)`;
};

const handleScroll = () => {
  updateScrollIndicator();
  updateHeroParallax();
};

handleScroll();
window.addEventListener('scroll', handleScroll, { passive: true });
window.addEventListener('resize', handleScroll);
