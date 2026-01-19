import random
from collections import defaultdict

def parse_retete(file_path):
    """Parsează fișierul RETETE.txt și extrage rețetele."""
    retete = []
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    current_recipe = {}
    
    for line in lines:
        line = line.strip()
        
        # Detectează rețete noi (linii cu numere și punct, ex. "1. Pui copt...")
        if line and line[0].isdigit() and '. ' in line:
            if current_recipe:
                retete.append(current_recipe)
            recipe_name = line.split('. ', 1)[1]
            current_recipe = {'Nume': recipe_name, 'Ingrediente': [], 'Proteina': ''}
        
        # Detectează ingrediente
        elif line.startswith('Ingrediente:'):
            current_recipe['Ingrediente'] = [i.strip() for i in line.split(':', 1)[1].split(',')]
        
        # Detectează proteina
        elif line.startswith('Proteina:'):
            current_recipe['Proteina'] = line.split(':', 1)[1].strip()
    
    if current_recipe:
        retete.append(current_recipe)
    
    return retete

def generate_weekly_menu(retete):
    """Generează meniu săptămânal random fără repetări, respectând restricțiile."""
    freq_limits = {
        'carne roșie': 1,
        'carne de pasare': 2,
        'pește': 2,
        'ouă': 5,
        'mezeluri': 0.5,
        'legume uscate': 2,
    }
    
    counters = defaultdict(int)
    menu = {}
    used_recipes = set()
    
    for day in range(1, 8):
        available = [r for r in retete 
                    if r['Nume'] not in used_recipes 
                    and can_use_recipe(r, counters, freq_limits)]
        
        if not available:
            menu[day] = "Nicio rețetă disponibilă (restricții depășite)"
            continue
        
        recipe = random.choice(available)
        menu[day] = recipe['Nume']
        used_recipes.add(recipe['Nume'])
        
        # Actualizează contoare
        prot = recipe['Proteina'].lower()
        if prot in freq_limits:
            counters[prot] += 1

    return menu

def can_use_recipe(recipe, counters, freq_limits):
    """Verifică dacă rețeta respectă limitele de frecvență."""
    prot = recipe['Proteina'].lower()
    if prot in freq_limits:
        if counters[prot] >= freq_limits[prot]:
            return False
    return True

if __name__ == "__main__":
    retete = parse_retete('RETETE.txt')
    
    print("=== RETETE DISPONIBILE ===\n")
    for i, r in enumerate(retete, 1):
        print(f"{i}. {r['Nume']}")
        print(f"   Ingrediente: {', '.join(r['Ingrediente'])}")
        print(f"   Proteina: {r['Proteina']}\n")
    
    print("\n=== MENIU SĂPTĂMÂNAL (RANDOM) ===\n")
    menu = generate_weekly_menu(retete)
    
    for day, recipe in menu.items():
        print(f"Ziua {day}: {recipe}")