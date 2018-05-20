# Ajouter un rendu CSS à la liste des rendus

Dans le cas d'un ajout d'attribut ou d'une valeur d'attribut à une balise, il est fort probable que la conversion HTML du XML ignore la CSS à appliquer.

Par exemple, la valeur `superscript-double-underlined` doit être explicitement transformée en valeur CSS pour être prise en compte.

Pour cela, la méthode conseillée est d'utiliser les classes CSS fournies par le framework Bootstrap (http://getbootstrap.com, onglet Documentation). Par exemple, un `rend="centered"` en XML peut être traduit avec la classe `text-center` de Bootstrap.

Dans le cas où aucune classe de Bootstrap ne correspond à la valeur (comme pour l'exemple `superscript-double-underlined`), 
il faut définir nos propres classes CSS dans le fichier **webapp/app/web/custom/css/style.css**. 
La granularité des classes CSS doit être la plus fine possible. Dans le cas de `superscript-double-underlined`, 
on a donc 2 notions différents : `superscript` et `double-underlined`, ce qui doit correspondre à deux classes différentes. 
Nous définissons donc dans le fichier **style.css** deux classes : `text-sup` (pour `superscript`) et `text-double-underlined`
(pour `double-underlined`).

Une fois que nous avons la liste des classes CSS à appliquer pour transformer un rendu XML en HTML, il est nécessaire de se rendre dans
**webapp/app/System/Services/TranscriptService.js** à la fonction *convertXMLAttributes* et d'ajouter une possibilité au switch déjà présent :
    
    case "superscript-double-underlined": 
        value = "text-sup text-double-underlined"; 
        break;
        
Et voilà !

À noter qu'en précisant `value =  "";` à une condition, vous supprimez un rendu HTML qui est exprimé en XML.