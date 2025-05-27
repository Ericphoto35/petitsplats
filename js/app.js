// Variables globales pour stocker les états
let allRecipes = [];
let selectedFilters = {
  mainSearch: '',
  ingredients: [],
  appliances: [],
  ustensils: []
};

// Fonction pour récupérer les recettes depuis le fichier JSON
async function getRecipes() {
  try {
    const response = await fetch('./data/recipes.json');
    const data = await response.json();
    return data.recipes;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Fonction qui applique tous les filtres en cascade
// FilterRecipesByAttributes line 100
function applyAllFilters() {
  const recipesCounter = document.querySelector('.recipes-counter');

  // Commencer avec toutes les recettes
  let filteredRecipes = [...allRecipes];


  // Appliquer le filtre de recherche principal
  if (selectedFilters.mainSearch && selectedFilters.mainSearch.length >= 3) {
    filteredRecipes = searchRecipes(filteredRecipes, selectedFilters.mainSearch);
  }

  // Appliquer les filtres d'ingrédients
  selectedFilters.ingredients.forEach(ingredient => {
    filteredRecipes = filterRecipesByAttribute(filteredRecipes, 'ingredient', ingredient);
  });

  // Appliquer les filtres d'appareils
  selectedFilters.appliances.forEach(appliance => {
    filteredRecipes = filterRecipesByAttribute(filteredRecipes, 'appliance', appliance);
  });

  // Appliquer les filtres d'ustensiles
  selectedFilters.ustensils.forEach(ustensil => {
    filteredRecipes = filterRecipesByAttribute(filteredRecipes, 'ustensil', ustensil);
  });

  // Afficher les recettes filtrées line 218
  displayRecipes(filteredRecipes);

  // Mettre à jour les dropdowns avec les options disponibles line 58
  updateDropdownOptions(filteredRecipes);
  recipesCounter.textContent = `${filteredRecipes.length} recettes`;
  return filteredRecipes;
}

// Fonction pour mettre à jour les options de dropdown en fonction des recettes filtrées
function updateDropdownOptions(filteredRecipes) {
  // Extraire Unique
  const uniqueIngredients = extractUniqueIngredients(filteredRecipes);
  const uniqueAppliances = extractUniqueAppliances(filteredRecipes);
  const uniqueUstensils = extractUniqueUstensils(filteredRecipes);

  // Récupérer les termes de recherche actuels
  const ingredientSearchTerm = document.getElementById('ingredientSearchInput');
  const applianceSearchTerm = document.getElementById('appliancesSearchInput');
  const ustensilSearchTerm = document.getElementById('ustensilsSearchInput');

  // Mettre à jour les dropdowns
  displayIngredients(uniqueIngredients, ingredientSearchTerm);
  displayAppliances(uniqueAppliances, applianceSearchTerm);
  displayUstensils(uniqueUstensils, ustensilSearchTerm);
}

// Fonction pour filtrer les recettes par recherche principale
function searchRecipes(recipes, searchTerm) {
  if (!searchTerm || searchTerm.length < 3) {
    return recipes;
  }

  searchTerm = searchTerm.toLowerCase();

  const results = recipes.filter(recipe => {
    const nameMatch = recipe.name.toLowerCase().includes(searchTerm);
    const descriptionMatch = recipe.description.toLowerCase().includes(searchTerm);
    const ingredientsMatch = recipe.ingredients.some(ing =>
      ing.ingredient.toLowerCase().includes(searchTerm)
    );

    return nameMatch || descriptionMatch || ingredientsMatch;
  });

  console.log('Résultats de la recherche pour "' + searchTerm + '" :', results);
  console.log('Nombre de recettes trouvées :', results.length);

  return results;
}

// Fonction pour filtrer les recettes par ingrédient, appareil ou ustensile
function filterRecipesByAttribute(recipes, attribute, value) {
  if (!value || value.length === 0) {
    return recipes;
  }

  value = value.toLowerCase();

  if (attribute === 'ingredient') {
    return recipes.filter(recipe =>
        recipe.ingredients.some(ing =>
            ing.ingredient.toLowerCase().includes(value)
        )
    );
  } else if (attribute === 'appliance') {
    return recipes.filter(recipe =>
        recipe.appliance && recipe.appliance.toLowerCase().includes(value)
    );
  } else if (attribute === 'ustensil') {
    return recipes.filter(recipe =>
        recipe.ustensils && Array.isArray(recipe.ustensils) &&
        recipe.ustensils.some(ustensil =>
            ustensil.toLowerCase().includes(value)
        )
    );
  } else {
    console.error(`Type de filtre invalide: ${attribute}`);
    return recipes;
  }
}

// Classe pour créer les éléments de recette
class Recettes {
  constructor(data) {
    this.id = data.id;
    this.image = data.image;
    this.name = data.name;
    this.description = data.description;
    this.ingredients = data.ingredients;
  }

  createRecettesElement() {
    const recetteElement = document.createElement('article');
    recetteElement.classList.add('recette');

    // Création image
    const imageElement = document.createElement('img');
    imageElement.src = `img/recettes/${this.image}`;
    imageElement.alt = this.name;
    imageElement.classList.add('image__recettes');

    // Création  titre
    const titleElement = document.createElement('h2');
    titleElement.textContent = this.name;
    titleElement.classList.add('title__recettes');

    // Création titleSubElement
    const titleSubElement = document.createElement('h3');
    titleSubElement.classList.add('title__recettes--sub');
    titleSubElement.textContent = "Description";

    // Creation paragraphElement
    const paragraphElement = document.createElement('p');
    paragraphElement.classList.add('description__recettes');
    paragraphElement.textContent = this.description;

    // Creation titleSubElement pour les ingrédients
    const titleSubElement2 = document.createElement('h3');
    titleSubElement2.classList.add('title__recettes--sub');
    titleSubElement2.textContent = "Ingrédients";

    // Création d'un conteneur pour les ingrédients
    const ingredientsContainer = document.createElement('div');
    ingredientsContainer.classList.add('ingredients__container');

    // Parcourir le tableau d'ingrédients et créer une div pour chacun
    this.ingredients.forEach(ingredient => {
      const ingredientDiv = document.createElement('div');
      ingredientDiv.classList.add('ingredient__item');

      // Création du titre pour chaque ingrédient (son nom)
      const ingredientTitle = document.createElement('h4');
      ingredientTitle.textContent = ingredient.ingredient;
      ingredientTitle.classList.add('ingredient__name');

      // Création d'un paragraphe pour la quantité et l'unité
      const ingredientQuantity = document.createElement('p');
      ingredientQuantity.textContent = `${ingredient.quantity} ${ingredient.unit ?? ''}`;
      ingredientQuantity.classList.add('ingredient__quantity');

      // Ajout du titre et de la quantité à la div de l'ingrédient
      ingredientDiv.appendChild(ingredientTitle);
      ingredientDiv.appendChild(ingredientQuantity);

      // Ajout de la div de l'ingrédient au conteneur d'ingrédients
      ingredientsContainer.appendChild(ingredientDiv);
    });

    // Ajout des éléments à l'article
    recetteElement.appendChild(imageElement);
    recetteElement.appendChild(titleElement);
    recetteElement.appendChild(titleSubElement);
    recetteElement.appendChild(paragraphElement);
    recetteElement.appendChild(titleSubElement2);
    recetteElement.appendChild(ingredientsContainer);

    return recetteElement;
  }
}

function recettesFactory(data) {
  return new Recettes(data);
}

// Fonction pour afficher les recettes
function displayRecipes(recipes) {
  const recipesContainer = document.querySelector('#recipes-container');

  if (!recipesContainer) {
    console.error("Conteneur de recettes non trouvé dans le DOM");
    return;
  }

  recipesContainer.innerHTML = '';

  if (recipes.length === 0) {
    const noRecipesMessage = document.createElement('div');
    noRecipesMessage.classList.add('no-recipes-message');
    noRecipesMessage.textContent = 'Aucune recette ne correspond à votre recherche';
    recipesContainer.appendChild(noRecipesMessage);
    return;
  }

  recipes.forEach(recipe => {
    const recetteModel = recettesFactory(recipe);
    const recetteElement = recetteModel.createRecettesElement();
    recipesContainer.appendChild(recetteElement);
  });
}

// Extraire les ingrédients uniques
function extractUniqueIngredients(recipes) {
  const ingredientSet = new Set();

  recipes.forEach(recipe => {
    recipe.ingredients.forEach(ingredient => {
      ingredientSet.add(ingredient.ingredient);
    });
  });

  return Array.from(ingredientSet).sort();
}

// Afficher les ingrédients dans le dropdown
function displayIngredients(ingredients, searchTerm = '') {
  const dropdownContent = document.getElementById('dropdown-content__ingredients');

  if (!dropdownContent) {
    console.error("Conteneur du dropdown d'ingrédients non trouvé dans le DOM");
    return;
  }

  dropdownContent.innerHTML = '';

  // Par défaut, cacher le contenu du dropdown
  dropdownContent.style.display = 'none';

  // Ne montrer le contenu que si un terme de recherche est saisi
  if (searchTerm && searchTerm.length > 0) {
    // Afficher le conteneur
    dropdownContent.style.display = 'block';

    searchTerm = searchTerm.toLowerCase();
    const filteredIngredients = ingredients.filter(ingredient =>
      ingredient.toLowerCase().includes(searchTerm) &&
      !selectedFilters.ingredients.includes(ingredient)
    );

    // Créer une liste pour les ingrédients filtrés
    const ingredientsList = document.createElement('ul');
    ingredientsList.classList.add('ingredients-list');

    // Ajouter uniquement les ingrédients filtrés à la liste
    filteredIngredients.forEach(ingredient => {
      const ingredientItem = document.createElement('li');
      ingredientItem.textContent = ingredient;
      ingredientItem.classList.add('ingredient-item');

      // Ajouter le gestionnaire de clic
      ingredientItem.addEventListener('click', () => {
        // Ajouter l'ingrédient à la liste des filtres sélectionnés
        if (!selectedFilters.ingredients.includes(ingredient)) {
          selectedFilters.ingredients.push(ingredient);

          // Effacer le champ de recherche
          document.getElementById('ingredientSearchInput').value = '';

          // Créer et afficher le tag pour l'ingrédient sélectionné
          addSelectedFilterTag('ingredient', ingredient);

          // Appliquer tous les filtres et mettre à jour l'interface
          applyAllFilters();

          // Fermer le dropdown
          dropdownContent.style.display = 'none';
        }
      });

      ingredientsList.appendChild(ingredientItem);
    });

    // Ajouter au conteneur dropdown
    dropdownContent.appendChild(ingredientsList);

    // Gestion des erreurs
    if (filteredIngredients.length === 0) {
      const noResultsMsg = document.createElement('p');
      noResultsMsg.textContent = 'Aucun ingrédient ne correspond à votre recherche';
      noResultsMsg.classList.add('no-results-message');
      dropdownContent.appendChild(noResultsMsg);
    }
  }
}

// Extraire les appareils uniques
function extractUniqueAppliances(recipes) {
  const applianceSet = new Set();

  recipes.forEach(recipe => {
    if (recipe.appliance) {
      applianceSet.add(recipe.appliance);
    }
  });

  return Array.from(applianceSet).sort();
}

// Afficher les appareils dans le dropdown
function displayAppliances(appliances, searchTerm = '') {
  const dropdownContent = document.getElementById('dropdown-content__appliances');

  if (!dropdownContent) {
    console.error("Conteneur du dropdown d'appareils non trouvé dans le DOM");
    return;
  }

  dropdownContent.innerHTML = '';

  // Par défaut, cacher le contenu du dropdown
  dropdownContent.style.display = 'none';

  // Ne montrer le contenu que si un terme de recherche est saisi
  if (searchTerm && searchTerm.length > 0) {
    // Afficher le conteneur
    dropdownContent.style.display = 'block';

    searchTerm = searchTerm.toLowerCase();
    const filteredAppliances = appliances.filter(appliance =>
      appliance.toLowerCase().includes(searchTerm) &&
      !selectedFilters.appliances.includes(appliance)
    );

    // Liste pour les appareils filtrés
    const appliancesList = document.createElement('ul');
    appliancesList.classList.add('appliances-list');

    // Appareils filtrés à la liste
    filteredAppliances.forEach(appliance => {
      const appliancesItem = document.createElement('li');
      appliancesItem.textContent = appliance;
      appliancesItem.classList.add('appliance-item');

      // Ajouter le gestionnaire de clic
      appliancesItem.addEventListener('click', () => {
        // Ajouter l'appareil à la liste des filtres sélectionnés
        if (!selectedFilters.appliances.includes(appliance)) {
          selectedFilters.appliances.push(appliance);

          // Effacer le champ de recherche
          document.getElementById('appliancesSearchInput').value = '';

          // Créer et afficher le tag pour l'appareil sélectionné
          addSelectedFilterTag('appliance', appliance);

          // Appliquer tous les filtres et mettre à jour l'interface
          applyAllFilters();

          // Fermer le dropdown
          dropdownContent.style.display = 'none';
        }
      });

      appliancesList.appendChild(appliancesItem);
    });

    dropdownContent.appendChild(appliancesList);

    // Gestion des erreurs
    if (filteredAppliances.length === 0) {
      const noResultsMsg = document.createElement('p');
      noResultsMsg.textContent = 'Aucun appareil ne correspond à votre recherche';
      noResultsMsg.classList.add('no-results-message');
      dropdownContent.appendChild(noResultsMsg);
    }
  }
}

// Extraire les ustensiles uniques
function extractUniqueUstensils(recipes) {
  const ustensilSet = new Set();

  recipes.forEach(recipe => {
    if (recipe.ustensils && Array.isArray(recipe.ustensils)) {
      recipe.ustensils.forEach(ustensil => {
        ustensilSet.add(ustensil);
      });
    }
  });

  return Array.from(ustensilSet).sort();
}

// Afficher les ustensiles dans le dropdown
function displayUstensils(ustensils, searchTerm = '') {
  const dropdownContent = document.getElementById('dropdown-content__ustensils');

  if (!dropdownContent) {
    console.error("Conteneur du dropdown d'ustensiles non trouvé dans le DOM");
    return;
  }

  dropdownContent.innerHTML = '';

  // Par défaut, cacher le contenu du dropdown
  dropdownContent.style.display = 'none';

  // Ne montrer le contenu que si un terme de recherche est saisi
  if (searchTerm && searchTerm.length > 0) {
    // Afficher le conteneur
    dropdownContent.style.display = 'block';

    searchTerm = searchTerm.toLowerCase();
    const filteredUstensils = ustensils.filter(ustensil =>
      ustensil.toLowerCase().includes(searchTerm) &&
      !selectedFilters.ustensils.includes(ustensil)
    );

    const ustensilsList = document.createElement('ul');
    ustensilsList.classList.add('ustensils-list');

    filteredUstensils.forEach(ustensil => {
      const ustensilItem = document.createElement('li');
      ustensilItem.textContent = ustensil;
      ustensilItem.classList.add('ustensil-item');

      // Ajouter le gestionnaire de clic
      ustensilItem.addEventListener('click', () => {
        // Ajouter l'ustensile à la liste des filtres sélectionnés
        if (!selectedFilters.ustensils.includes(ustensil)) {
          selectedFilters.ustensils.push(ustensil);

          // Effacer le champ de recherche
          document.getElementById('ustensilsSearchInput').value = '';

          // Créer et afficher le tag pour l'ustensile sélectionné
          addSelectedFilterTag('ustensil', ustensil);

          // Appliquer tous les filtres et mettre à jour l'interface
          applyAllFilters();

          // Fermer le dropdown
          dropdownContent.style.display = 'none';
        }
      });

      ustensilsList.appendChild(ustensilItem);
    });

    dropdownContent.appendChild(ustensilsList);

    // Gestion des erreurs
    if (filteredUstensils.length === 0) {
      const noResultsMsg = document.createElement('p');
      noResultsMsg.textContent = 'Aucun ustensile ne correspond à votre recherche';
      noResultsMsg.classList.add('no-results-message');
      dropdownContent.appendChild(noResultsMsg);
    }
  }
}

function addSelectedFilterTag(type, value) {
  let container, tagClass, deleteClass;
  const ingredientSearchInput = document.getElementById('ingredientSearchInput');
  const appliancesSearchInput = document.getElementById('appliancesSearchInput');
  const ustensilsSearchInput = document.getElementById('ustensilsSearchInput');
  const inputIngredientsCross = document.querySelector('.cross');
  const inputAppliancesCross = document.querySelector('.crossApp');
  const inputUstensilsCross = document.querySelector('.crossUs');


  if (type === 'ingredient') {
    container = document.getElementById('ing-selected');
    tagClass = 'selected-ingredient';
    deleteClass = 'delete-ingredient';
    ingredientSearchInput.style.display = 'none';
    inputIngredientsCross.style.display = 'none';

  } else if (type === 'appliance') {
    container = document.getElementById('app-selected');
    tagClass = 'selected-appliance';
    deleteClass = 'delete-appliance';
    appliancesSearchInput.style.display = 'none';
    inputAppliancesCross.style.display = 'none';

  } else if (type === 'ustensil') {
    container = document.getElementById('us-selected');
    tagClass = 'selected-ustensil';
    deleteClass = 'delete-ustensil';
    ustensilsSearchInput.style.display = 'none';
    inputUstensilsCross.style.display = 'none';

  } else {
    console.error(`Type de filtre inconnu: ${type}`);
    return;
  }

  if (!container) {
    console.error(`Conteneur pour ${type} non trouvé`);
    return;
  }

  // Créer le tag
  const tagElement = document.createElement('div');
  tagElement.classList.add(tagClass);
  tagElement.textContent = value;
  tagElement.dataset.value = value;// Stocker la valeur pour la retrouver facilement


  // Ajouter le bouton de suppression
  const deleteButton = document.createElement('span');
  deleteButton.textContent = '×';
  deleteButton.classList.add(deleteClass);
  tagElement.appendChild(deleteButton);

  // Ajouter le tag au conteneur
  container.appendChild(tagElement);
}

// Fonction pour supprimer un filtre
function removeFilter(type, value) {
  const ingredientSearchInput = document.getElementById('ingredientSearchInput');
  const appliancesSearchInput = document.getElementById('appliancesSearchInput');
  const ustensilsSearchInput = document.getElementById('ustensilsSearchInput');


  if (type === 'ingredient') {
    selectedFilters.ingredients = selectedFilters.ingredients.filter(item => item !== value);
    if (selectedFilters.ingredients.length === 0) {
      ingredientSearchInput.style.display = 'block';
    }
    } else if (type === 'appliance') {
    selectedFilters.appliances = selectedFilters.appliances.filter(item => item !== value);
    if (selectedFilters.appliances.length === 0) {
      appliancesSearchInput.style.display = 'block';
    }
  } else if (type === 'ustensil') {
    selectedFilters.ustensils = selectedFilters.ustensils.filter(item => item !== value);
    if (selectedFilters.ustensils.length === 0) {
      ustensilsSearchInput.style.display = 'block';
    }
  } else {
    console.error(`Type de filtre inconnu: ${type}`);
  }

  // Appliquer les filtres mis à jour
  applyAllFilters();
}


/////// Initialisation ///////
document.addEventListener('DOMContentLoaded', () => {
  getRecipes().then(recipes => {
    allRecipes = recipes;
    const recipesCounter = document.querySelector('.recipes-counter');
    if (allRecipes === recipes) {
      recipesCounter.textContent = `${recipes.length} recettes`;
    }
    // Afficher toutes les recettes au départ
    displayRecipes(recipes);

    // Recherche principale
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        selectedFilters.mainSearch = e.target.value;
        applyAllFilters();
      });
    }

    // Recherche d'ingrédients
    const ingredientSearchInput = document.getElementById('ingredientSearchInput');
    const inputIngredientsCross = document.querySelector('.cross');
    if (ingredientSearchInput) {
      ingredientSearchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value;
        const filteredRecipes = applyAllFilters();// Obtenir les recettes actuellement filtrées
        inputIngredientsCross.style.display = 'block';
        displayIngredients(extractUniqueIngredients(filteredRecipes), searchTerm);
      });
      inputIngredientsCross.addEventListener('click', () => {
        selectedFilters.ingredients = [];
        document.getElementById('ingredientSearchInput').value = '';
        inputIngredientsCross.style.display = 'none';
        applyAllFilters();
      });
    }

    // Recherche d'appareils
    const applianceSearchInput = document.getElementById('appliancesSearchInput');
    const inputAppliancesCross = document.querySelector('.crossApp');
    if (applianceSearchInput) {
      applianceSearchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value;
        const filteredRecipes = applyAllFilters(); // Obtenir les recettes actuellement filtrées
        inputAppliancesCross.style.display = 'block';
        displayAppliances(extractUniqueAppliances(filteredRecipes), searchTerm);
      });
      inputAppliancesCross.addEventListener('click', () => {
        selectedFilters.appliances = [];
        document.getElementById('appliancesSearchInput').value = '';
        inputAppliancesCross.style.display = 'none';
        applyAllFilters();
      });
    }

    // Recherche d'ustensiles
    const ustensilSearchInput = document.getElementById('ustensilsSearchInput');
    const inputUstensilsCross = document.querySelector('.crossUs');
    if (ustensilSearchInput) {
      ustensilSearchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value;
        const filteredRecipes = applyAllFilters(); // Obtenir les recettes actuellement filtrées
        inputUstensilsCross.style.display = 'block';
        displayUstensils(extractUniqueUstensils(filteredRecipes), searchTerm);
      });
      inputUstensilsCross.addEventListener('click', () => {
        selectedFilters.ustensils = [];
        document.getElementById('ustensilsSearchInput').value = '';
        inputUstensilsCross.style.display = 'none';
        applyAllFilters();
      });
    }

    // Gestion de la suppression des filtres sélectionnés
    document.getElementById('ing-selected').addEventListener('click', (e) => {
      const chevronIngredients = document.getElementById("chevron-ing");
      const inputIngredientsCross = document.querySelector('.cross');

      if (e.target.classList.contains('delete-ingredient')) {
        e.stopPropagation();
        const value = e.target.parentElement.dataset.value;
        e.target.parentElement.remove();
        removeFilter('ingredient', value);
        if (selectedFilters.ingredients.length === 0) {
          chevronIngredients.style.transform = "rotate(360deg)";
          inputIngredientsCross.style.display = 'none';
        }
      }
    });

    document.getElementById('app-selected').addEventListener('click', (e) => {
      const chevronAppliances = document.getElementById("chevron-app");
      const inputAppliancesCross = document.querySelector('.crossApp');

      if (e.target.classList.contains('delete-appliance')) {
        e.stopPropagation();
        const value = e.target.parentElement.dataset.value;
        e.target.parentElement.remove();
        removeFilter('appliance', value);
        if (selectedFilters.appliances.length === 0) {
          chevronAppliances.style.transform = "rotate(360deg)";
          inputAppliancesCross.style.display = 'none';
        }
      }
    });

    document.getElementById('us-selected').addEventListener('click', (e) => {
      const chevronUstensils = document.getElementById("chevron-us");
      const inputUstensilsCross = document.querySelector('.crossUs');

      if (e.target.classList.contains('delete-ustensil')) {
        e.stopPropagation();
        const value = e.target.parentElement.dataset.value;
        e.target.parentElement.remove();
        removeFilter('ustensil', value);
        if (selectedFilters.ustensils.length === 0) {
          chevronUstensils.style.transform = "rotate(360deg)";
          inputUstensilsCross.style.display = 'none';
        }
      }
    });
  });
});

function initDropdown() {
  // Récupérer tous les éléments nécessaires
  const ingredientsDropdownElements = document.querySelector(".dropdown-button__ingredients");
  const ingredientsHidden = document.querySelector(".dropdownhidden");
  const appliancesDropdownElements = document.querySelector(".dropdown-button__appliances");
  const appliancesHidden = document.querySelector(".dropdownApphidden");
  const ustensilsDropdownElements = document.querySelector(".dropdown-button__ustensiles");
  const ustensilsHidden = document.querySelector(".dropdownUshidden");

  const chevronIngredients = document.getElementById("chevron-ing");
  const chevronAppliances = document.getElementById("chevron-app");
  const chevronUstensils = document.getElementById("chevron-us");

  // Utiliser des variables séparées pour chaque dropdown
  let isIngredientsVisible = false;
  let isAppliancesVisible = false;
  let isUstensilsVisible = false;

  let chevronIngUp = false;
  let chevronAppUp = false;
  let chevronUstUp = false;


  // Gestion du dropdown des ingrédients
  ingredientsDropdownElements.addEventListener("click", function () {
    if (isIngredientsVisible) {
      ingredientsHidden.style.display = "none";
      isIngredientsVisible = false;
      chevronIngUp = false;
      chevronIngredients.style.transform = "rotate(360deg)";
    } else {
      ingredientsHidden.style.display = "block";
      isIngredientsVisible = true;
      chevronIngredients.style.transform = "rotate(180deg)";
      chevronIngUp = true;

    }
  });

  // Gestion du dropdown des appareils
  appliancesDropdownElements.addEventListener("click", function () {
    if (isAppliancesVisible) {
      appliancesHidden.style.display = "none";
      isAppliancesVisible = false;
      chevronAppUp = false;
      chevronAppliances.style.transform = "rotate(360deg)";
    } else {
      appliancesHidden.style.display = "block";
      isAppliancesVisible = true;
      chevronAppliances.style.transform = "rotate(180deg)";
      chevronAppUp = true;
    }
  });

  // Gestion du dropdown des ustensiles
  ustensilsDropdownElements.addEventListener("click", function () {
    if (isUstensilsVisible) {
      ustensilsHidden.style.display = "none";
      isUstensilsVisible = false;
      chevronUstUp = false;
      chevronUstensils.style.transform = "rotate(360deg)";
    } else {
      ustensilsHidden.style.display = "block";
      isUstensilsVisible = true;
      chevronUstensils.style.transform = "rotate(180deg)";
      chevronUstUp = true;
    }
  });

  console.log("Initialisation des dropdowns terminée");
}


initDropdown();