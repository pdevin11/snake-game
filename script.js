window.onload = function(){

    var canvasWidth = 900;
    var canvasHeight = 600;
    var blockSize = 30;
    var ctx;
    var delay = 100;                                                     // Défini le délai de refresh
    var snakee;
    var apple;
    var widthInBlocks = canvasWidth / blockSize;
    var heightInBlocks = canvasHeight / blockSize;
    var score;

    init();

    /* --------------------------------------------------------- */
    /* Initialisation du canvas et du serpent à son état initial */
    /* --------------------------------------------------------- */

    function init(){
        var canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.border = "30px solid gray";
        canvas.style.margin = "50px auto";
        canvas.style.display = 'block';
        canvas.style.backgroundColor = '#ddd';
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');
        snakee = new Snake([[6, 4], [5, 4], [4, 4]], "right");                          // Défini la position initiale du serpent
        apple = new Apple([10, 10]);                                                    // Dessine une pomme
        score = 0;
        refreshCanvas();                                                                // Appelle la fonction refreshCanvas() qui lance l'animation
    };

    /* ----------------------------------------------------------------- */
    /* Rafraichissement du canvas pour simuler le déplacement du serpent */
    /* ----------------------------------------------------------------- */

    function refreshCanvas(){
        snakee.advance();

        if(snakee.checkCollision()){
            gameOver();
        } else {
            if(snakee.isEatingApple(apple))
            {
                score++;
                snakee.ateApple = true;
                do{
                    apple.setNewPosition();
                } while(apple.isOnSnake(snakee))
            }
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);                 // Supprime le tracé précédent
            drawScore();
            snakee.draw();
            apple.draw();
            setTimeout(refreshCanvas, delay);                               // Relance la fonction refreshCanvas() à la fin du delai
        }
    }

    /* ---------------------------------------- */
    /* Gestion de l'affichage en cas de défaite */
    /* ---------------------------------------- */

    function gameOver(){
        ctx.save();
        ctx.font = "bold 70px sans-serif";
        ctx.fillStyle = "#000";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = "white";
        ctx.lineWidth = 5;
        var centreX = canvasWidth / 2;
        var centreY = canvasHeight / 2;
        ctx.strokeText('Game Over', centreX, centreY - 180);
        ctx.fillText('Game Over', centreX, centreY - 180);

        ctx.font = "bold 30px sans-serif";
        ctx.strokeText('Appuyer sur la touche Espace pour rejouer', centreX, centreY - 120);
        ctx.fillText('Appuyer sur la touche Espace pour rejouer', centreX, centreY - 120);
        ctx.restore();
    };

    /* ---------------------------------------------- */
    /* Gestion de la relance du jeu après une défaite */
    /* ---------------------------------------------- */

    function restart(){
        snakee = new Snake([[6, 4], [5, 4], [4, 4]], "right");
        apple = new Apple([10, 10]);
        score = 0;
        refreshCanvas();
    };

    /* ----------------------- */
    /* Affiche le score actuel */
    /* ----------------------- */

    function drawScore(){
        ctx.save();
        ctx.font = 'bold 200px sans-serif';
        ctx.fillStyle = "gray";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        var centreX = canvasWidth / 2;
        var centreY = canvasHeight / 2;
        ctx.fillText(score.toString(), centreX, centreY);
        ctx.restore();
    };

    /* ---------------------------------------------------------------------- */
    /* Dessine un nouveau bloc correspondant à une partir du corps du serpent */
    /* ---------------------------------------------------------------------- */

    function drawBlock(ctx, position){
        var x = position[0] * blockSize;
        var y = position[1] * blockSize;
        ctx.fillRect(x, y, blockSize, blockSize);
    };

    /* ---------------------------------------- */
    /* Gestion du serpent (dessin, déplacement) */
    /* ---------------------------------------- */

    function Snake(body, direction){
        this.body = body;
        this.direction = direction;
        this.ateApple = false;

        /* Dessine le serpent */

        this.draw = function(){
            ctx.save();                                    // sauvegarde le contexte du serpent en entrant dans sa fonction
            ctx.fillStyle = "#ff0000";
            for(var i = 0; i < this.body.length; i++){
                drawBlock(ctx, this.body[i]);
            }
            ctx.restore();
        }

        /* Permet le déplacement du serpent */

        this.advance = function(){
            var nextPosition = this.body[0].slice();
            
            switch(this.direction){
                case "left": nextPosition[0] -= 1;          // Diminue les abcisses donc déplacement vers la gauche
                    break;

                case "right": nextPosition[0] += 1;         // Augmente les abcisses donc déplacement vers la droite
                    break;

                case "down": nextPosition[1] += 1;          // Augmente les ordonnées donc déplacement vers le bas
                    break;

                case "up": nextPosition[1] -= 1;            // Diminue les ordonnées donc déplacement vers le haut
                    break;
                default: 
                    throw('Invalid Direction');
            }

            this.body.unshift(nextPosition);                // permet de rajouter nextPosition à la première place du body

            /* Si le serpent ne mange pas de pomme, suppression du dernier bloc, sinon on le laisse pour qu'il grandisse */

            if(!this.ateApple){
                this.body.pop();                                // supprime le dernier élément pour déplacer la queue
            } else {
                this.ateApple = false;                          // Remet ateApple à false pour qu'il ne grandisse que d'un bloc
            }
        }

        /* Modifie la direction de déplacement du serpent */

        this.setDirection = function(newDirection){
            var allowedDirections;

            switch(this.direction){
                case "left":
                case "right": 
                    allowedDirections = ['up', 'down'];
                    break;
                case "up":
                case "down": 
                    allowedDirections = ['left', 'right'];
                    break;
                default: 
                    throw('Invalid Direction');
            }
        
            /* Vérifie si la direction demandée est possible */

            if(allowedDirections.indexOf(newDirection) > -1){ 
                /* indexOf retourne l'index de newDirection dans allowedDirections, donc s'il est présent, l'index est 0 ou 1 et donc une direction autorisée */
                this.direction = newDirection;
            }
        };

        /* Vérifie si le serpent est entré en collision avec un mur ou avec lui même */

        this.checkCollision = function(){
            var wallCollision = false;
            var snakeCollision = false;
            var head = this.body[0];                                                // Récupère la tête du serpent
            var rest = this.body.slice(1);                                          // Récupère le array contenant le corps du serpent à partir de l'indice 1, donc sans la tête
            var snakeX = head[0];
            var snakeY = head[1];
            var minX = 0;
            var minY = 0;
            var maxX = widthInBlocks - 1;
            var maxY = heightInBlocks - 1;
            var isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;       // Si la tête sort à droite ou à gauche
            var isNotBetweenVertitalWalls = snakeY < minY || snakeY > maxY;         // Si la tête sort en haut ou en bas

            /* Collision avec un mur */

            if(isNotBetweenHorizontalWalls || isNotBetweenVertitalWalls){
                wallCollision = true;
            }

            /* Collision avec lui-même */

            for(var i = 0; i < rest.length; i++){
                if(snakeX === rest[i][0] && snakeY === rest[i][1]){
                    snakeCollision = true;
                }
            }

            return wallCollision || snakeCollision;
        };

        /* Vérifie si le serpent mange la pomme */

        this.isEatingApple = function(appleToEat){
            var head = this.body[0];
            if(head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1]){
                return true;
            } else {
                return false;
            }
        };
    }

    /* ---------------------------------------- */
    /* Gestion de la pomme (apparition, dessin) */
    /* ---------------------------------------- */

    function Apple(position){
        this.position = position;

        /* Dessine la pomme */

        this.draw = function(){
            ctx.save();
            ctx.fillStyle = "#33cc33";
            ctx.beginPath();
            var radius = blockSize / 2;
            var x = this.position[0] * blockSize + radius;           // Défini les abcisses du point central du cercle (la position du bloc * la taille d'un bloc + le rayon)
            var y = this.position[1] * blockSize + radius;           // Défini les ordonnées du point central du cercle (la position du bloc * la taille d'un bloc + le rayon)
            ctx.arc(x, y, radius, 0, Math.PI * 2, true);             // Dessine le cercle
            ctx.fill();
            ctx.restore();
        };

        /* Dessine une nouvelle pomme si la première est mangée */

        this.setNewPosition = function(){
            var newX = Math.round(Math.random() * (widthInBlocks - 1));             // Retourne un nombre entier (Math.round) comprit entre 0 (minX) et 29 (maxX)
            var newY = Math.round(Math.random() * (heightInBlocks -1));             // Retourne un nombre entier comprit entre 0 et 29
            this.position = [newX, newY];
        };

        /* Vérifie si la pomme est dessiné sur un emplacement où se trouve le serpent */

        this.isOnSnake = function(snakeToCheck){
            var isOnSnake = false;

            for (var i = 0; i < snakeToCheck.body.length; i++){
                if (this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1]){
                    isOnSnake = true;
                }
            }
            return isOnSnake;
        };
    }

    /* -------------------------------------------------- */
    /* Gestion de la direction en fonction de la touche pressée */
    /* -------------------------------------------------- */

    document.onkeydown = function handleKeyDown(e){
        var key = e.keyCode;
        var newDirection;

        switch(key){
            case 90: newDirection = "up"                    // Z (haut)
                break;  
            case 83: newDirection = "down"                  // S (bas)
                break;
            case 81: newDirection = "left"                  // Q (gauche)
                break;
            case 68: newDirection = "right"                 // D (droite)
                break;
            case 32: restart();                             // ESPACE
                return;
            default:
                return;
        }
        snakee.setDirection(newDirection);
    }
}