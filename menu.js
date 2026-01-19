const fs = require('fs');
const path = require('path');

function parseRetete(content) {
    const retete = [];
    const lines = content.split('\n');
    let currentRecipe = {};

    lines.forEach(line => {
        line = line.trim();

        if (line && /^\d+\. /.test(line)) {
            if (currentRecipe.Nume) {
                retete.push(currentRecipe);
            }
            const recipeName = line.split('. ').slice(1).join('. ');
            currentRecipe = { Nume: recipeName, Ingrediente: [], Proteina: '' };
        } else if (line.startsWith('Ingrediente:')) {
            currentRecipe.Ingrediente = line
                .split(':')[1]
                .split(',')
                .map(i => i.trim());
        } else if (line.startsWith('Proteina:')) {
            currentRecipe.Proteina = line.split(':')[1].trim();
        }
    });

    if (currentRecipe.Nume) {
        retete.push(currentRecipe);
    }

    return retete;
}

function generateWeeklyMenu(retete) {
    const freqLimits = {
        'carne roșie': 1,
        'carne de pasare': 2,
        'pește': 2,
        'ouă': 5,
        'mezeluri': 0.5,
        'legume uscate': 2,
    };

    const counters = {};
    const menu = {};
    const usedRecipes = new Set();

    for (let day = 1; day <= 7; day++) {
        const available = retete.filter(r => 
            !usedRecipes.has(r.Nume) && canUseRecipe(r, counters, freqLimits)
        );

        if (available.length === 0) {
            menu[day] = 'Nicio rețetă disponibilă';
            continue;
        }

        const recipe = available[Math.floor(Math.random() * available.length)];
        menu[day] = recipe.Nume;
        usedRecipes.add(recipe.Nume);

        const prot = recipe.Proteina.toLowerCase();
        if (prot in freqLimits) {
            counters[prot] = (counters[prot] || 0) + 1;
        }
    }

    return menu;
}

function canUseRecipe(recipe, counters, freqLimits) {
    const prot = recipe.Proteina.toLowerCase();
    if (prot in freqLimits) {
        if ((counters[prot] || 0) >= freqLimits[prot]) {
            return false;
        }
    }
    return true;
}

exports.handler = async (event, context) => {
    try {
        // Citește fișierul RETETE.txt din rădăcina proiectului
        const retetePath = path.join(__dirname, '../../RETETE.txt');
        const content = fs.readFileSync(retetePath, 'utf8');
        const retete = parseRetete(content);
        const menu = generateWeeklyMenu(retete);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(menu),
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error generating menu', details: error.message }),
        };
    }
};