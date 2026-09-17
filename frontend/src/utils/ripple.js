export function createRipple(event) {
  const target = event.currentTarget;
  if (!target) return;

  const circle = document.createElement('span');
  const diameter = Math.max(target.clientWidth, target.clientHeight);
  const radius = diameter / 2;
  const rect = target.getBoundingClientRect();

  circle.style.width = `${diameter}px`;
  circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - rect.left - radius}px`;
  circle.style.top = `${event.clientY - rect.top - radius}px`;
  circle.classList.add('ripple-circle');

  // Remove existing ripple if still active
  const existing = target.querySelector('.ripple-circle');
  if (existing) {
    existing.remove();
  }

  target.appendChild(circle);
  setTimeout(() => {
    circle.remove();
  }, 600);
}
