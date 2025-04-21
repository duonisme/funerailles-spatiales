const express = require('express');
const stripe = require('stripe')('YOUR_STRIPE_SECRET_KEY'); // Remplacez avec ta clé secrète Stripe  
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/create-checkout-session', async (req, res) => {
    const { amount } = req.body; // Récupérer le montant envoyé par le client

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: 'Contribution à l\'Empire',
                    },
                    unit_amount: amount * 100, // Convertir en centimes  
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: 'http://localhost:3000/success', // URL de réussite  
            cancel_url: 'http://localhost:3000/cancel', // URL d'annulation  
        });

        res.json({ id: session.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});