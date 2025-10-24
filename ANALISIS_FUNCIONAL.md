# Anàlisi Funcional: Gestor d'Accions de Millora

## 1. Introducció

### 1.1. Propòsit

Aquest document descriu els requisits funcionals i no funcionals de l'aplicació "Gestor d'Accions de Millora". L'objectiu és servir com a guia per a l'equip de desenvolupament, stakeholders i usuaris clau, definint el comportament esperat del sistema, les seves funcionalitats i les regles de negoci que el governen.

### 1.2. Abast

L'aplicació permetrà la gestió integral del cicle de vida de les accions de millora, incloent-hi la seva creació, anàlisi de causes, definició de plans d'acció, verificació i tancament. Incorporarà funcionalitats d'intel·ligència artificial per a assistir els usuaris en la redacció i anàlisi.

## 2. Rols d'Usuari

El sistema definirà diversos rols per a gestionar els permisos i l'accés a les funcionalitats:

-   **Creador**: Qualsevol usuari autenticat. Pot crear noves accions de millora i tancar les que ell mateix ha creat.
-   **Responsable d'Anàlisi**: Usuari o grup designat per a investigar les causes d'una acció i proposar un pla.
-   **Responsable d'Execució**: Usuari designat per a executar una de les tasques del pla d'acció.
-   **Responsable de Verificació**: Usuari designat per a comprovar l'eficàcia de les accions implantades.
-   **Administrador**: Superusuari amb accés a totes les funcionalitats, incloent-hi la gestió d'usuaris i la configuració del sistema.

## 3. Requisits Funcionals

### 3.1. RF-001: Autenticació i Gestió d'Usuaris

-   **RF-001.1**: El sistema ha de permetre als usuaris iniciar sessió mitjançant la seva compta de Google.
-   **RF-001.2**: El sistema ha de permetre als usuaris iniciar sessió amb correu electrònic i contrasenya.
-   **RF-001.3**: Els usuaris han de poder restablir la seva contrasenya si l'han oblidat.
-   **RF-001.4**: Els administradors han de poder gestionar els usuaris del sistema (crear, editar, eliminar) i assignar-los rols.
-   **RF--001.5**: Els administradors han de poder suplantar la identitat d'altres usuaris per a finalitats de suport.

### 3.2. RF-002: Gestió d'Accions de Millora (CRUD)

-   **RF-002.1: Creació**: Qualsevol usuari autenticat pot crear una nova acció de millora.
    -   La acció es pot desar com a "Borrador" (només visible per al creador) o "Enviar per a Anàlisi".
    -   Camps obligatoris: Assumpte, Observacions, Àmbit, Origen, Responsable d'Anàlisi.
-   **RF-002.2: Lectura (Llistat)**: Els usuaris han de poder visualitzar un llistat de totes les accions a les quals tenen accés.
    -   El llistat ha de ser paginat, ordenable i filtrable per múltiples criteris (ID, títol, estat, àmbit, responsable, etc.).
-   **RF-002.3: Lectura (Detall)**: Els usuaris han de poder obrir una acció per a veure'n tots els detalls, organitzats en pestanyes segons la fase del cicle de vida.
-   **RF-002.4: Modificació**: Els usuaris amb permisos poden editar les dades d'una acció, segons l'estat en què es trobi.
    -   Exemple: El creador pot editar un "Borrador"; el responsable d'anàlisi pot editar la secció d'anàlisi de causes.
-   **RF-002.5: Seguiment**: Els usuaris han de poder marcar accions com a "seguides" per a tenir-les localitzades al seu panell de control.

### 3.3. RF-003: Cicle de Vida d'una Acció (Workflow)

El sistema ha de gestionar el flux de treball d'una acció a través dels següents estats:

1.  **Borrador**: Estat inicial. Només visible per al creador.
2.  **Pendent Anàlisi**: La acció s'ha enviat al responsable designat, que ha de dur a terme l'anàlisi de causes.
3.  **Pendent Comprobació**: El responsable d'anàlisi ha completat l'anàlisi i ha definit un pla d'acció. Ara, el responsable de verificació ha de comprovar-ne l'eficàcia.
4.  **Pendent de Tancament**: La verificació s'ha completat. El creador original ha de donar el seu vistiplau final.
5.  **Finalitzada**: La acció s'ha tancat.
    -   Si el tancament és "Conforme", el cicle acaba.
    -   Si el tancament és "No Conforme", el sistema ha de crear automàticament una nova acció (tipus BIS) vinculada a l'original per a continuar el tractament.

### 3.4. RF-004: Panell de Control (Dashboard)

-   **RF-004.1**: Cada usuari ha de tenir un panell de control personalitzat en iniciar sessió.
-   **RF-004.2**: El panell ha de mostrar un widget amb "Les Meves Accions Pendents", que són aquelles que requereixen una acció per part de l'usuari (p. ex., un anàlisi a fer, una verificació a realitzar).
-   **RF-004.3**: El panell ha de mostrar un widget amb les "Accions en Seguiment".
-   **RF-004.4**: L'usuari ha de poder reordenar els widgets del panell mitjançant "drag-and-drop", i la seva preferència s'ha de desar.

### 3.5. RF-005: Funcionalitats d'IA (Genkit)

-   **RF-005.1: Millora de Text**: En crear o editar una acció, l'usuari ha de poder utilitzar un assistent d'IA per a millorar la claredat i professionalitat del text de les observacions.
-   **RF-005.2: Suggeriment d'Anàlisi**: El responsable d'anàlisi ha de poder sol·licitar a un assistent d'IA una proposta d'anàlisi de causes i un pla d'acció basat en les observacions inicials.
-   **RF-005.3: Dictat per Veu**: Els camps de text llargs han de permetre l'entrada de contingut mitjançant dictat per veu.

### 3.6. RF-006: Gestió de Dades Mestres

-   **RF-006.1**: Els administradors han de poder accedir a una secció de "Configuració" per a gestionar les taules mestres del sistema.
-   **RF-006.2**: S'ha de poder gestionar (crear, editar, eliminar) els següents tipus de dades: Àmbits, Orígens, Classificacions, Àrees Afectades i Rols de Responsabilitat.
-   **RF-006.3**: La gestió d'Orígens i Classificacions ha de ser jeràrquica, depenent de l'Àmbit seleccionat.

### 3.7. RF-007: Informes i Exportació

-   **RF-007.1**: El sistema ha de proporcionar una secció d'informes amb visualitzacions gràfiques sobre l'estat de les accions.
-   **RF-007.2**: S'ha de poder exportar el detall complet d'una acció individual a format PDF.
-   **RF-007.3**: S'ha de poder exportar el llistat d'accions (amb els filtres aplicats) a format Excel.

## 4. Requisits No Funcționals

-   **RNF-001 (Rendiment)**: Les consultes a la base de dades han d'estar optimitzades. La càrrega inicial de llistats llargs no ha de bloquejar la interfície.
-   **RNF-002 (Usabilitat)**: La interfície ha de ser intuïtiva, moderna i responsiva (adaptable a dispositius mòbils).
-   **RNF-003 (Seguretat)**: L'accés a les dades ha d'estar restringit segons el rol de l'usuari. Les regles de seguretat de Firestore han de garantir que un usuari només pot llegir o modificar les dades a les quals té permís.
-   **RNF-004 (Escalabilitat)**: L'arquitectura basada en Firebase ha de permetre un creixement futur en volum de dades i usuaris sense degradar el rendiment.
-   **RNF-005 (Internacionalització)**: La aplicació ha d'estar preparada per a suportar múltiples idiomes (inicialment, català i castellà).

## 5. Model de Dades Simplificat

-   **Acció de Millora**: Entitat principal que conté tota la informació de l'acció, incloent-hi títol, descripció, estats, dates, responsables, anàlisi, pla d'acció, comentaris i adjunts.
-   **Usuari**: Emmagatzema la informació del perfil de l'usuari, incloent-hi el seu nom, email, rol i avatar.
-   **Dades Mestres**: Col·leccions separades per a Àmbits, Orígens, Classificacions, Centres, etc.
-   **Configuració App**: Documentació on es guarden paràmetres globals com els prompts de la IA o la configuració del workflow.
