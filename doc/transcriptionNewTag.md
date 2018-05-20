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

    nomSystemeDuGroupe:
        id: "nomSystemeDuGroupe"
        name: "nom public du groupe (affiché)"
        icon: "fa fa-puzzle-piece"
        parent: false|"nomSystemeDuGroupeParent" 
        order: 1
        separator_before: true|false

- _id_ : (requis)
- _name_ : (requis)       
- _icon_ : (requis) Il s'agit de la séquence d'icônes à utiliser, comptabiles avec http://fontawesome.io/icons/. Si pas d'icône, indiquer icon: ""
- _parent_ : (requis) Si autre que false, il s'agit d'un sous-groupe, sinon le groupe est positionné à la racine de la bar de niveau 2
- _order_ : (requis) Il s'agit de l'ordre d'apparition (de gauche à droite) des boutons et des groupes à la racine de la ligne 2 de la bar de bouton, ou dans un groupe si on a un sous-groupe
- _separator_before_ : (optionnel) Est-ce qu'il faut faire apparaitre un séparateur devant le groupe. La valeur doit être false ou absente si on est dans un groupe sans parent.
 
## Définir un élément XML :
**Voici la structure complète possible pour un élément XML :**

    -
        id: "nomSystem"
        btn:
            label: false|"Nom d'affichage dans la bare d'outil"
            title: "Title au passage de la souris sur l'élément"
            label_forced: true|false
            icon: "fa fa-header"
            btn_group: false|"nom système du groupe"
            enabled: false
            view: false
            level: 1|2
            separator_before: true|false
        order: 1
        caret:
            position: "before|prepend|append|after"
        html:
            name: "div"
            unique: true|false
            attributes:
                class: "tei-header"
            icon:
                position: "before|prepend|append|after"
            marker: "{--}"
            extra: "tooltip|popover"
            bgColorText: true|false
            bgColor: "text-warning"
        xml:
            name: "head"
            unique: false
            contains:
                lem: "default"
                note: "emptyContent"
            replicateOnEnter: true|false
            replicateOnCtrlEnter: true|false
        complex_entry: 
            enable: true|false
            children: "lem&&note"

**Détaillons les possibilités :**            
- _id_ : il s'agit du nom système, utilisé par les algorithmes. Dans la mesure du possible, il est recommandé de faire coincider cette valeur avec le tag XML ;
- _btn_ : cette section est utilisée pour ajouter un bouton associé à l'élément XML dans la toolbar. La section est optionnelle (dans le cas où on ne souhaite pas avoir de bouton associé à l'élément. C'est par exemple le cas pour abbr, sic, corr, etc.) ;
    - _label_ : si la valeur est `false`, le système utilise le gloss définit dans le modèle XML. Si la valeur est une chaine de caractères, elle suplante le modèle ;
    - _title_ : chaine de caractères affichée au survol du bouton dans la toolbar par la souris ; 
    - _label_forced_ : si la valeur est `true`, le système affiche sur le bouton le label ; si la valeur est `false`, le label n'est pas affiché ;
    - _icon_ : la valeur doit être une suite d'icônes issue de http://fontawesome.io/icons/ . Si pas d'icône, il faut indiquer `""` et pas `false` ;
    - _btn_group_ : si le bouton se situe dans un groupe, on indique ici lequel ;
    - _enabled_ : la valeur est forcément `false`, il s'agit d'une ligne présente uniquement pour les aglo ;
    - _view_ : idem ;
    - _level_ : 1 pour les éléments de structure, 2 pour les autres ;
    - _separator_before_ : optionnel, booléan : sert à indiquer lorsque l'on souhaite placer un séparateur (de sous-groupe) devant le bouton. Valable uniquement pour les boutons présents dans des groupes.
- _order_ : découle de `btn` (mais il n'est pas dedans), est optionnel de la même manière que `btn`. Indique l'ordre d'apparition du bouton dans les différentes lignes de boutons ou groupe.
- _caret_ : découle de `btn` (mais il n'est pas dedans), est optionnel de la même manière que `btn`. Section dédiée à la gestion du positionnement du curseur lorsque l'on clique sur le bouton
    - _position_ : accepte 4 valeurs (`"before|prepend|append|after"`), en fonction de là où l'on souhaite faire apparaitre le curseur dans la situation où l'on sélectionne un block de texte puis on lui applique une balise. Par défaut, la valeur est `prepend`.
- _html_ : section dédiée à la gestion de la conversion en HTML du tag ;
    - _name_ : balise HTML utilisée pour représenter l'élément. Le plus simple est le mieux : il ne faut pas chercher à représenter sémantiquement les concepts ici, puisque c'est uniquement du visuel : donc pour les balises XML inline, on utilise `span` et pour les balises block, `div`. Sauf exception type les listes, les sauts de ligne.
    - _unique_ : il s'agit de dire au système si la balise est simple (`<br />`) ou "double" (`<div></div>`) ;
    - _attributes_ : liste des attributs à appliquer à la balise. 
        - [nom de l'attribut] class: [valeur de l'attribut] "tei-header" -> le plus simple pour le rendu CSS est de définir des classes pour chaque élément et de les spécifier dans le fichier CSS. Attention, le nom de l'élément doit être assez spécifique pour ne pas outrepasser d'autres classes.
    - _icon_: (optionnel) C'est une valeur indirectement reliée à l'icône utilisé pour le bouton. Il faut donc avoir un bouton pour l'utiliser.
        - _position_ : où l'icône doit-il être placé par rapport au texte qu'il marque ? Valeurs acceptées: `before|prepend|append|after` ; valeur par défaut : `preprend` ;
    - _marker_ : (optionnel) Si on souhaite mettre en valeur un élément HTML, on indique dans cette section la double valeur avec lequel l'entourer. E.g. `{--}` viendra encadrer une note de la manière suivante : `{Ceci est la note}` ;
    - _extra_: (optionnel) Si on souhaite qu'une info apparaisse au survol du HTML, on peut spécifier ici le type de forme de l'info. L'info en elle-même est reprise en fonction de la balise, d'une balise jointe ou du bouton. Cette section est gérée plus spécifiquement par la fonction *tagConstruction* présente dans le fichier **webapp/app/System/Service/TranscriptService.js** ;
    _ _bgColorText_: (optionnel) Si on souhaite coloré le texte, on indique ici `true` ;
    - _bgColor_: (optionnel) Si le précédent élément vaut `true`, on spécifie ici la classe CSS à appliquer ;
- _xml_ : section regroupant les informations sur l'élément XML :
    - _name_ : balise XML représentée. L'idéal étant de faire correspondre le nom système avec cette valeur ;
    - _unique_ : il s'agit de dire au système si la balise est simple (`<lb/>`) ou "double" (`<corr></corr>`) ; Attention, dans le cas où une balise peut être vide, et donc devenir simple (`<sic></sic>` > `<sic/>`), il faut ajouter **au-dessous** de l'élément un deuxième élément spécifique à la version raccourcie :
        
            -
                id: "sic"
                html:
                    name: "span"
                    unique: false
                    attributes:
                        class: "sic"
                xml:
                    name: "sic"
                    unique: false
                    replicateOnEnter: false
                    replicateOnCtrlEnter: false
                complex_entry: 
                    enable: false
            -
                id: "sicShort"
                html:
                    name: "span"
                    unique: false
                    attributes:
                        class: "sic"
                xml:
                    name: "sic"
                    unique: true
                    replicateOnEnter: false
                    replicateOnCtrlEnter: false
                complex_entry:
                    enable: false
     
    - _contains_ : Si l'on souhaite insérer un block de balises plutôt qu'un simple balise (e.g. `<app><lem></lem><note></note></app>` au lieu de simplement `<app></app>`), on définit dans cette section les balises à ajouter. Les balises sont ajoutées dans l'ordre définit ici :
        - [nom de la  balise] lem: [est-ce qu'il s'agit de la balise qui contient le texte préselectionné (`default`) ou d'une balise vide (`emptyContent`)] > Le nom de la balise est le nom système d'une balise existante !        
    - _replicateOnEnter_ et _replicateOnCtrlEnter_: si la valeur est `true`, la balise est répliquée à la suite lorsque l'action `Enter` ou `CtrlEnter` est executée et que SmartTEI est activée ;
- _complex_entry_ : cette section active ou désactive la gestion des entrées complexes pour les balises > **fonction non disponible pour le moment** ;
    - _enable_ : est-ce que la gestion des entrées complexes est activée pour cette balise ? ;
    - _children_ : détaille les cas spécifiques d'enfants possible pour cette balise > **fonction non disponible pour le moment** ;

## Gérer les éléments abstraits :
Il peut arriver que la ligne `contains` dans la section `xml` ne suffise pas à représenter les différentes facettes d'une balise. 
C'est notamment le cas pour `choice` et ses dérivés. Dans la version actuelle de la barre de transcription, l'utilisateur 
peut ajouter plusieurs types de `choice` (`<choice><sic></sic><corr></corr></choice>` ou `<choice><abbr></abrr><expan></expan></choice>`). 
Ces éléments sont définis au niveau de l'utilisateur par la balise qui fait le plus sens : `abbr` et `sic`. 
Mais d'un point de vue du système c'est bien un `choice` qu'on insère à chaque fois. On utilise donc des éléments abstraits pour résoudre cette situation.
**Exemple avec le `choice` des abbréviations :**

    -
        id: "choiceAbbr" # Le nom système ne pas peut être similaire à la balise car sinon il y aurait plusieurs noms système identiques
        btn:
            label: "Marquer une abréviation" # Ici on représente bien à l'utilisateur l'abbréviation et non le choice
            label_forced: true
            title: "Signaler la présence d'une abréviation"
            icon: "fa fa-compress"
            btn_group: "microPhenomena"
            enabled: false
            view: false
            level: 2
            separator_before: false
        order: 1
        caret:
            position: "prepend"
        html:
            name: "span"
            unique: false
            attributes:
                class: "choice text-primary"
            marker: "[--]"
            bgColor: "text-info"
            bgColorText: true
        xml:
            name: "choice" # Mais c'est bien un choice qui est inséré
            unique: false
            contains:
                abbr: "default" # Et qui contient les éléments propres à la représentation d'une abbréviation
                expan: "emptyContent"
            replicateOnEnter: false
            replicateOnCtrlEnter: false
        complex_entry:
            enable: true
            children: ""