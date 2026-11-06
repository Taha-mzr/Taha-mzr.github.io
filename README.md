# Portfolio — Mohamed Taha Mazzir

Site statique (HTML, CSS, JavaScript), sans outil de build. Deux petites bibliothèques
sont chargées depuis cdnjs : Three.js (le nuage de particules) et Matter.js (la pile d'outils).
Si elles ne chargent pas, le site reste complet, simplement sans ces deux effets.

```
portfolio/
├── index.html      le contenu du site
├── style.css       le design
├── script.js       les animations (nuage 3D, texte géant, projets horizontaux, pile physique)
├── assets/photo.jpg
├── cv/CV_Mazzir_Mohamed_Taha.pdf
└── .nojekyll
```

## Voir le site en local

Ouvrir `index.html` dans un navigateur suffit (connexion internet nécessaire pour les polices et le nuage 3D).

## Mettre en ligne sur GitHub Pages (5 minutes)

1. Sur GitHub, créer un dépôt public nommé **`Taha-mzr.github.io`**
   (le site sera alors à l'adresse `https://taha-mzr.github.io`).
   Avec un autre nom, par exemple `portfolio`, l'adresse sera `https://taha-mzr.github.io/portfolio`.
2. Envoyer le contenu du dossier `portfolio/` à la racine du dépôt :
   ```bash
   cd portfolio
   git init
   git add .
   git commit -m "Portfolio"
   git branch -M main
   git remote add origin https://github.com/Taha-mzr/Taha-mzr.github.io.git
   git push -u origin main
   ```
   Ou, sans terminal : bouton **Add file › Upload files** sur la page du dépôt, puis glisser tous les fichiers.
3. Dans le dépôt : **Settings › Pages › Build and deployment**, choisir
   *Deploy from a branch*, branche `main`, dossier `/ (root)`, puis **Save**.
4. Attendre une à deux minutes : le site est en ligne.

## Modifier le contenu

- **Textes** : tout est dans `index.html`, section par section (repères `HERO`, `QUI JE SUIS`, `PARCOURS`,
  `PROJET PHARE`, `PROJETS`, `OUTILS`, `CONTACT`).
- **Le nuage de particules** : chaque section a des attributs `data-shape` (forme : `sphere`, `finger` (avec `data-anchor` pour la coller à un élément),
  `shield`, `galaxy`, `helix`, `at`, `lockseq` (la clé et le cadenas), `dust`), `data-cx` / `data-cy` (position, de -0.5 à 0.5),
  `data-scale` (taille) et `data-alpha` (opacité).
- **La boîte à outils** : une compétence = une ligne `<li>` dans `#pills`. La classe donne la couleur :
  `p-sun` offensif, `p-blue` défensif, `p-paper` IA, `p-line` infra et code.
- **Les couleurs** : les quatre variables en haut de `style.css` (`--blue`, `--paper`, `--ink`, `--sun`).
- **Le CV** : remplacer `cv/CV_Mazzir_Mohamed_Taha.pdf` en gardant le même nom.
- **Le scanner MCP** : quand le dépôt GitHub du projet sera public, ajouter son lien dans la section
  `PROJET PHARE` et remplacer le cas de test par un vrai constat.

## Bon à savoir

- Aucun cookie, aucun traceur.
- Le site respecte le réglage « réduire les animations » du système : tout s'affiche, sans mouvement.
- Sur téléphone, les projets se font défiler au doigt et les outils réagissent au toucher.
- Le numéro de téléphone n'est pas affiché sur la page (il reste dans le CV en PDF) pour limiter le démarchage automatique.
