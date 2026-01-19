const fs = require('fs');
const path = require('path');

const retetele = [
    { Nume: 'Pui copt cu cartofi la cuptor și legume', Ingrediente: ['pui', 'cartofi', 'morcovi', 'broccoli', 'ulei', 'usturoi'], Proteina: 'carne de pasare' },
    { Nume: 'Somon la cuptor cu legume', Ingrediente: ['somon', 'morcovi', 'broccoli', 'cartofi dulci', 'ulei de masline'], Proteina: 'pește' },
    { Nume: 'Paste Carbonara (1 dată/lună - mezeluri)', Ingrediente: ['paste', 'ouă', 'bacon', 'brânză dură', 'piperă'], Proteina: 'ouă (și mezeluri)' },
    { Nume: 'Cotlet de pui la cuptor cu orez', Ingrediente: ['pui', 'orez', 'broccoli', 'morcovi', 'ulei'], Proteina: 'carne de pasare' },
    { Nume: 'Peștele alb (cod/merlan) la cuptor cu lămâie', Ingrediente: ['cod/merlan', 'lămâie', 'ulei', 'usturoi', 'dafin'], Proteina: 'pește' },
    { Nume: 'Ciorba de legume cu orez', Ingrediente: ['linte', 'morcovi', 'cartof', 'ceapă', 'roșii', 'orez'], Proteina: 'legume uscate' },
    { Nume: 'Pui cu smântână și ciuperci', Ingrediente: ['pui', 'ciuperci', 'smântână light', 'ceapă', 'usturoi'], Proteina: 'carne de pasare' },
    { Nume: 'Chilly con carne cu orez', Ingrediente: ['carne de vită', 'fasole boabe', 'ceapă', 'roșii', 'usturoi', 'ardei', 'orez'], Proteina: 'carne roșie' },
    { Nume: 'Creamy meatballs (chiftele în sos)', Ingrediente: ['carne tocată vită', 'grâu', 'mazare', 'ceapă', 'usturoi'], Proteina: 'carne roșie' },
    { Nume: 'Couscous cu piept de pui și legume', Ingrediente: ['piept de pui', 'dovlecel', 'ardei gras', 'couscous'], Proteina: 'carne de pasare' }
];

function parseRetete(content) {
    return retetele;
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
        const retete = parseRetete();
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