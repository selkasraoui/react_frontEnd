# TaskFlow — Solutions complètes des TPs

> **EMSI — Développement Front-End** | Séances 1, 2 & 3

## Séance 1 — Le Web Moderne & React

###  Q1 — Que contient le <body> d'index.html ? Lien avec le CSR ?

Le `<body>` contient uniquement `<div id="root"></div>` — une div vide.

C'est le point d'entrée du **Client-Side Rendering (CSR)** : le HTML initial est quasi-vide, et c'est JavaScript (React) qui construit tout le DOM côté navigateur au runtime. Contrairement au SSR (Server-Side Rendering) où le serveur envoie du HTML déjà rempli, ici le navigateur reçoit un shell vide puis React "hydrate" l'interface.

---

### Q2 — Différence entre données en dur et une API REST ?

**Données en dur** : statiques, dans le code source. Impossible de les modifier sans redéployer l'application. Pas de persistance ni de partage entre utilisateurs.

**API REST** : les données vivent sur un serveur indépendant. On peut les lire (GET), créer (POST), modifier (PUT/PATCH), supprimer (DELETE) sans toucher au code frontend. Plusieurs clients (web, mobile) peuvent consommer la même API. Les données persistent et sont partagées.

---

### Q3 — Pourquoi className au lieu de class en JSX ?

`class` est un **mot réservé en JavaScript** (utilisé pour les classes ES6). JSX étant du JavaScript, utiliser `class` créerait une ambiguïté syntaxique. React utilise donc `className` qui correspond à la propriété DOM `element.className`.

Même logique pour `htmlFor` au lieu de `for` sur les labels.

---

### Q4 — Pourquoi `key={p.id}` est obligatoire dans `.map()` ? 

React utilise les `key` pour identifier de manière unique chaque élément d'une liste. Lors d'un re-render, React compare l'ancienne liste à la nouvelle grâce aux keys pour savoir quoi ajouter, supprimer ou déplacer — sans tout recréer.

**Avec l'index comme key** : si on insère un élément au début de la liste, tous les indices changent. React pense que tous les éléments ont changé → re-renders inutiles, bugs d'animation, problèmes avec les inputs contrôlés. Il faut toujours utiliser l'`id` unique de la donnée.

---

###  Q5 — Combien de fois le `useEffect` s'exécute-t-il ? Pourquoi ?  
**Une seule fois**, au montage initial du composant.

Le tableau de dépendances vide `[]` indique à React : *"n'exécute cet effet qu'une fois, après le premier render"*. Sans ce tableau, l'effet se déclencherait à chaque re-render. Avec des dépendances comme `[userId]`, il se redéclencherait à chaque changement de `userId`.

---

###  Q6 — Arrêtez json-server et rechargez. Que se passe-t-il ?

Le `catch` du try/catch se déclenche. L'erreur est loggée dans la console. L'état `loading` passe à `false` dans le `finally`, mais les tableaux `projects` et `columns` restent vides → l'interface s'affiche vide (ou avec un message d'erreur si vous en avez ajouté un).

---

###  Q7 — Onglet Network (F12) : requêtes vers localhost:4000 ?

Oui, deux requêtes GET apparaissent vers `localhost:4000`.

- Si le serveur tourne : code **200 OK**
- Si arrêté : erreur réseau (ECONNREFUSED, pas de code HTTP)

---

###  Q8 — Les nouvelles données s'affichent après modification de db.json ?

Oui, après rechargement. React refait un `fetch` au montage → reçoit les nouvelles données → met à jour le state → re-render.

---

###  Q9 — Flux complet : json-server → composants → props

```
json-server (port 4000)
  └─► fetch() dans useEffect
        └─► Promise.all([GET /projects, GET /columns])
              └─► setProjects() + setColumns() → useState
                    └─► Re-render de App
                          ├─► <Sidebar projects={projects} />
                          └─► <MainContent columns={columns} />
```

---

## Séance 2 — Auth Context & Protected Layout

###  Q1 — `useReducer` vs `useState` : quand utiliser lequel ?

`useState` : adapté pour un état simple (string, boolean, number) ou indépendant.

`useReducer` : adapté quand l'état est complexe (objet avec plusieurs champs), quand les transitions d'état suivent une logique précise, ou quand plusieurs actions modifient le même state. L'authReducer gère user, loading et error ensemble de façon cohérente.

--- 

###  Q2 — Pourquoi `useAuth()` lance une erreur si le context est null ?

Si `useAuth()` retournait silencieusement `null`, le composant qui l'utilise planterait avec une erreur confuse du type *"Cannot read properties of null"*, difficile à déboguer.

En lançant une erreur explicite `"useAuth doit être utilisé dans un AuthProvider"`, on signale immédiatement la vraie cause : le développeur a oublié d'envelopper son arbre dans `<AuthProvider>`. C'est un **guard de développement** qui prévient le mauvais usage du hook.

---

###  Q3 — Sans Context, combien de props pour partager le user ?

Sans Context, il faudrait du **prop drilling** :

```
App → passe user à Header                          (1 prop)
App → passe user à Dashboard → passe à Sidebar    (2 props)
App → passe dispatch partout pour logout...
```

Minimum **5 à 8 props** à ajouter, modifier et maintenir. Si on ajoute un composant intermédiaire, il faut lui faire "passer" les props même s'il n'en a pas besoin. Le Context évite cette chaîne de transmission.

---

### Q4 — Pourquoi `e.preventDefault()` est indispensable ?

Par défaut, la soumission d'un `<form>` HTML déclenche un **rechargement de la page** (comportement natif du navigateur). Dans une SPA React, cela détruirait tout le state et ferait un rechargement complet.

`e.preventDefault()` annule ce comportement, permettant à React de gérer la soumission avec `handleSubmit` (fetch vers l'API, dispatch du reducer, etc.) sans perdre l'état de l'application.

---

### Q5 — Que fait la destructuration `{ password: _, ...user }` ?

Cette syntaxe extrait le champ `password` dans une variable `_` (convention pour "ignoré"), et collecte **tout le reste** dans `user`.

```ts
// Objet reçu de l'API :
{ id: "1", email: "admin@taskflow.com", password: "admin123", name: "Admin" }

// Après destructuration :
user = { id: "1", email: "admin@taskflow.com", name: "Admin" }
```

On exclut le mot de passe pour ne pas le stocker dans le state React (Context). Principe du **moindre privilège** : ne garder que ce dont on a besoin.

---

### Q6 — Pourquoi Dashboard est un composant séparé ?

**1. Isolation des hooks** : le `useEffect` qui fetch les données ne doit s'exécuter *que* quand l'utilisateur est connecté. Si tout était dans `App`, le `useEffect` s'exécuterait au montage d'App, avant même que `authState.user` soit défini.

**2. Montage/démontage propre** : quand on se déconnecte, `App` remplace `<Dashboard />` par `<Login />`. Dashboard est *démonté*, son state (`projects`, `columns`, `loading`) est détruit. Cela évite des données obsolètes d'un ancien utilisateur qui persisteraient.

---

### Q7 — Testez le flux complet login → dashboard → déconnexion

**1. Entrez admin@taskflow.com / admin123 → cliquez 'Se connecter'**
**2. LOGIN_START : loading = true, bouton désactivé**
**3. Fetch vers localhost:4000/users?email=admin@taskflow.com**
**4. Vérification du mot de passe côté client**
**5. LOGIN_SUCCESS : user = { id: '1', name: 'Admin', email: '...' }**
**6. App re-render → affiche <Dashboard /> car authState.user !== null**
**7. Cliquez 'Déconnexion' → dispatch LOGOUT → user = null → retour <Login />**

---


### Q8 — Flux du callback onLogout

```
1. Utilisateur clique "Déconnexion" dans <Header>
2. onClick → appelle onLogout() (prop reçue)
3. onLogout = () => dispatch({ type: 'LOGOUT' })
4. dispatch envoyé au authReducer
5. Reducer retourne initialState : { user: null, loading: false, error: null }
6. AuthContext met à jour state
7. App re-render : authState.user === null
8. App retourne <Login /> au lieu de <Dashboard />
9. Dashboard démonté, Login monté
```

Le Header ne sait pas ce que fait `onLogout` — il appelle juste la fonction. C'est le principe d'**inversion de contrôle** : le parent contrôle le comportement, l'enfant exécute l'action.

---

###  Q9 — Pourquoi le flash disparaît avec `useLayoutEffect` ?

| Hook | Ordre d'exécution |
|------|-------------------|
| `useEffect` | Render → Commit → **Paint** → Effect |
| `useLayoutEffect` | Render → Commit → **Effect** → Paint |

Avec `useEffect` : l'utilisateur voit brièvement le tooltip à `(0,0)` **avant** que l'effet corrige la position (flash visible).

Avec `useLayoutEffect` : le navigateur attend que l'effet soit terminé **avant** de peindre → position déjà corrigée → pas de flash.

---

###  Q10 — Pourquoi ne pas utiliser `useLayoutEffect` partout ?

`useLayoutEffect` s'exécute de manière **synchrone** et **bloque le Paint**. Si l'effet est lent (calcul lourd, fetch réseau), il bloque l'affichage et rend l'interface non-réactive.

À utiliser **uniquement** quand on a besoin de lire/modifier le DOM avant que l'utilisateur le voie : mesures, positions, animations sans flash.

---

## Séance 3 — React Router, Axios & CRUD

### Q1 — Pourquoi `<Navigate />` (composant) et pas `navigate()` (hook) ?

Le hook `useNavigate()` ne peut être appelé qu'**à l'intérieur d'un event handler ou d'un useEffect** — pas directement dans le render (JSX). Or, dans `ProtectedRoute`, la redirection se fait pendant le rendu conditionnel :

```tsx
if (!state.user) return <Navigate to="/login" ... />;
```

`<Navigate />` est un composant React normal qui peut être retourné dans le JSX. Il effectue la redirection comme effet de son montage. C'est la bonne manière de rediriger **au moment du rendu**.

---

### Q2 — Bug + `navigate(from)` vs `navigate(from, { replace: true })`

**Le bug** : `navigate(from)` *sans* `replace: true` pousse une nouvelle entrée dans l'historique. Après le login, l'historique contient `[/login, /dashboard]`. En cliquant "Retour", le navigateur revient à `/login` — l'utilisateur est déjà connecté mais se retrouve sur la page login.

**La correction** :

```ts
// AVANT (bug) :
if (state.user) navigate(from);

// APRÈS (correction) :
if (state.user) navigate(from, { replace: true });
```

`replace: true` **remplace** l'entrée courante dans l'historique. Après le login, `/login` n'existe plus dans l'historique → bouton Retour emmène vers la page précédente logique.

---

### Q3 — Pourquoi `setProjects(prev => [...prev, data])` après un POST ?

- **Performance** : un re-fetch GET ferait un aller-retour réseau inutile. Le serveur vient de confirmer la création avec `data` (l'objet avec son `id` généré).
- **Réactivité immédiate** : l'UI se met à jour instantanément sans attendre un second fetch.
- **Cohérence** : `data` retourné par l'API est la source de vérité — il contient l'`id` final assigné par le serveur.

---

###  Bugs de ProjectDetail

**Bug 1 — dépendances manquantes dans `useEffect`** :

```ts
// AVANT (bug) :
useEffect(() => { ... }, []); // si l'id change, l'effet ne se re-déclenche pas

// APRÈS (correction) :
useEffect(() => { ... }, [id, navigate]);
```

**Bug 2 — accès non-sécurisé à `user`** :

```tsx
// AVANT (bug) :
userName={authState.user.name}   // TypeError si user est null

// APRÈS (correction) :
userName={authState.user?.name}  // optional chaining
```

---

### Q4 — Scénarios de navigation

| Scénario | Résultat attendu |
|----------|-----------------|
| `/dashboard` sans être connecté | Redirige vers `/login` (ProtectedRoute) |
| `/projects/1` sans être connecté | Redirige vers `/login` avec `state.from = /projects/1` |
| `/nimportequoi` | Route `*` → redirige vers `/dashboard` |
| `/` (racine) | Redirige vers `/dashboard` |
| Connecté + bouton Retour | Reste sur le dashboard (`replace:true` a supprimé `/login` de l'historique) |

---

### Q5 — Différence entre `<Link>` et `<NavLink>`

| | `<Link>` | `<NavLink>` |
|---|---|---|
| Navigation | ✅ | ✅ |
| `isActive` prop | ❌ | ✅ |
| Classe active auto | ❌ | ✅ |

Dans la Sidebar, on utilise `<NavLink>` pour appliquer automatiquement la classe `.active` (fond vert, texte vert, bold) sur le projet actuellement visité — sans écrire de logique manuelle de comparaison d'URL.

---

### Q6 — Bug ProjectForm + réutilisation POST/PUT

**Le bug** : `e.preventDefault()` manque dans `handleSubmit` :

```ts
function handleSubmit(e: React.FormEvent) {
  e.preventDefault(); // ← manquait ! Sans ça, la page recharge
  onSubmit(name, color);
}
```

**Ce qui change entre POST et PUT** : la logique externe (le callback `onSubmit`), pas le composant :

```ts
// Pour le POST (création) :
onSubmit={(name, color) => api.post('/projects', { name, color })}

// Pour le PUT (édition) :
onSubmit={(name, color) => api.put('/projects/' + id, { ...project, name, color })}
```

Le composant reçoit aussi des `initialName` et `initialColor` différents (vides pour create, valeurs existantes pour edit).

---

### Q7-Q8 — Gestion d'erreurs Axios vs fetch

**Q7** : Oui, le message d'erreur s'affiche. Axios lance une exception quand la connexion est refusée → le `catch` se déclenche → `setError()` → affiché dans le JSX.

**Q8 — fetch vs Axios sur les erreurs HTTP** :

```ts
// Avec fetch : un 404 NE lance PAS d'erreur, il faut vérifier manuellement
const res = await fetch('/projects/999');
if (!res.ok) throw new Error(`HTTP ${res.status}`); // obligatoire !

// Avec Axios : toute réponse >= 400 lance automatiquement une erreur
try {
  await api.get('/projects/999');
} catch (err) {
  if (axios.isAxiosError(err)) {
    console.log(err.response?.status); // 404
  }
}
```

---

### BONUS — Implémentation renameProject & deleteProject

```ts
// PUT — renameProject
async function renameProject(project: Project) {
  const newName = prompt('Nouveau nom :', project.name);
  if (!newName || newName === project.name) return;
  setSaving(true);
  setError(null);
  try {
    const { data } = await api.put('/projects/' + project.id, { ...project, name: newName });
    setProjects(prev => prev.map(p => p.id === project.id ? data : p));
  } catch (err) {
    if (axios.isAxiosError(err)) setError(`Erreur ${err.response?.status}`);
    else setError('Erreur inconnue');
  } finally {
    setSaving(false);
  }
}

// DELETE — deleteProject
async function deleteProject(id: string) {
  if (!confirm('Êtes-vous sûr ?')) return;
  setSaving(true);
  setError(null);
  try {
    await api.delete('/projects/' + id);
    setProjects(prev => prev.filter(p => p.id !== id));
  } catch (err) {
    if (axios.isAxiosError(err)) setError(`Erreur ${err.response?.status}`);
    else setError('Erreur inconnue');
  } finally {
    setSaving(false);
  }
}
```

---

*EMSI — Développement Front-End - 4IIR - Dev 6 -EL-GHAZOUI Mohamed* 

--- 
