# Ajouter un nouvel élément XML
Au préalable, vérifier que la balise est bien présente dans le modèle XML et dans le fichier **teiInfo.json**

Modifier **webapp/app/System/Transcript/toolbar.yml**.
Il est nécessaire d'ajouter un item à la liste des tags, représentant le tag que l'on veut ajouter.

## Où positionner l'entrée dans la liste ?
La liste n'est pas ordonnée de manière totalement aléatoire. Son agencement influence pour certains éléments les choix de conversion en HTML.

- Si la balise à ajouter est une balise de premier niveau (c'est-à-dire une balise de structure la plupart du temps), elle doit être positionnée dans la première partie de la liste, sous le commentaire `# Level 1`. La position au sein de la liste des level 1 importe peu (si ce n'est à des fins de lecture du code par l'équipe de dev).
- Si la balise est autre, elle doit se situer dans la section suivante (`# Level 2`). Au sein des balises de niveau 2, l'objectif est de suivre un ordonnancement logique : les balises en dehors de groupe sont positionnées au début de la liste, puis les autres suivent par groupe et sous-groupe. À chaque fois, on cherche à respecter l'ordre d'apparition dans la bar de boutons de l'interface de transcription.

## Gérer les groupes de balises :
Un groupe de balise est représenté par une liste déroulante de balises dans la bar d'outils de l'interface de transcription.

Ces groupes sont définis tout en haut du fichier **toolbar.yml**. 

Un groupe peut être positionné à la racine de la ligne 2 de la bar d'outils ou au sein d'un autre groupe (c'est donc un sous-groupe).

Le template YML d'insertion d'un groupe est le suivant :

    nomSystemeDuGroupe: # requis
        id: "nomSystemeDuGroupe" # requis
        name: "nom public du groupe (affiché)" #requis
        icon: "fa fa-puzzle-piece" # requis | Il s'agit de la séquence d'icônes à utiliser, comptabiles avec http://fontawesome.io/icons/. Si pas d'icône, indiquer icon: ""
        parent: false|"nomSystemeDuGroupeParent" # requis | Si autre que false, il s'agit d'un sous-groupe, sinon le groupe est positionné à la racine de la bar de niveau 2
        order: 1 # requis | Il s'agit de l'ordre d'apparition (de gauche à droite) des boutons et des groupes à la racine de la ligne 2 de la bar de bouton, ou dans un groupe si on a un sous-groupe
        separator_before: true|false # optionnel | Est-ce qu'il faut faire apparaitre un séparateur devant le groupe. La valeur doit être false ou absente si on est dans un groupe sans parent.
        
## Définir un élément XML :

## Gérer les éléments abstraits :