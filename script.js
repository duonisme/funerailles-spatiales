// Initialisation de Stripe
const stripe = Stripe('pk_test_51RAwIPEQOEc6IaLCkB4iqy5fOFEOqffN9AFwyMs2mdlKGnJXrjk7h5TwIpwYtF6eZlmhbUHpczrRT4bsznGCUfXI00KUXT0AXR'); // Remplace par ta clé publique Stripe

// Animation au défilement pour les parchemins
const parchments = document.querySelectorAll('.parchment');

const revealParchments = () => {
    parchments.forEach(parchment => {
        const parchmentTop = parchment.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        if (parchmentTop < windowHeight * 0.8 && !parchment.classList.contains('visible')) {
            parchment.classList.add('visible');
            const sound = parchment.querySelector('.parchment-sound');
            if (sound) sound.play();
            createParticles(parchment.querySelector('.parchment-particles'), false);
        }
    });
};
window.addEventListener('scroll', revealParchments);

// Particules dorées
function createParticles(canvas, isHover = false) {
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = [];
    const particleCount = isHover ? 10 : 30;
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: isHover ? canvas.width / 2 : Math.random() * canvas.width,
            y: isHover ? canvas.height / 2 : Math.random() * canvas.height,
            size: Math.random() * (isHover ? 3 : 5) + 2,
            speedX: Math.random() * 2 - 1,
            speedY: Math.random() * 2 - 1,
            opacity: 1
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 215, 0, ${particle.opacity})`;
            ctx.fill();
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.opacity -= isHover ? 0.05 : 0.02;
        });
        if (particles.some(p => p.opacity > 0)) {
            requestAnimationFrame(animate);
        }
    }
    animate();
}

// Particules au survol
parchments.forEach(parchment => {
    parchment.addEventListener('mouseenter', () => {
        createParticles(parchment.querySelector('.parchment-particles'), true);
    });
});

// Menu burger (mobile)
const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');
burger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Effet de hover pour les boutons
document.querySelectorAll('.cta-button').forEach(button => {
    button.addEventListener('mouseover', () => {
        button.style.boxShadow = '0 5px 20px rgba(255, 215, 0, 0.6)';
    });
    button.addEventListener('mouseout', () => {
        button.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.4)';
    });
});

// Navigation fluide
document.querySelectorAll('.nav-links a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        window.scrollTo({
            top: targetSection.offsetTop - 70,
            behavior: 'smooth'
        });
        document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
        this.classList.add('active');
    });
});

// Gestion du paiement Stripe
document.getElementById('stripe-button')?.addEventListener('click', async () => {
    const amount = document.querySelector('input[name="amount"]:checked').value;
    const privileges = {
        50: 'Citoyen',
        100: 'Sénateur',
        500: 'Consul',
        1000: 'César'
    };
    const privilege = privileges[amount];

    try {
        const response = await fetch('/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: parseInt(amount), privilege })
        });
        const session = await response.json();
        stripe.redirectToCheckout({ sessionId: session.id });
    } catch (error) {
        console.error('Erreur Stripe:', error);
    }
});

// Gestion du paiement PayPal
paypal.Buttons({
    createOrder: function(data, actions) {
        const amount = document.querySelector('input[name="amount"]:checked').value;
        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: amount,
                    currency_code: 'EUR'
                },
                custom_id: `amount=${amount}`
            }]
        });
    },
    onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
            const amount = document.querySelector('input[name="amount"]:checked').value;
            const privileges = {
                50: 'Citoyen',
                100: 'Sénateur',
                500: 'Consul',
                1000: 'César'
            };
            const privilege = privileges[amount];
            window.location.href = `thank-you.html?amount=${amount}&privilege=${privilege}`;
        });
    }
}).render('#paypal-button-container');