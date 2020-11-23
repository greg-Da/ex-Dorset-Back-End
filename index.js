const express = require('express')
const app = express()
const { MongoClient, ObjectId } = require("mongodb");

// create connection to the database                                                                                                                                        
const url = "changeMe"
const client = new MongoClient(url, { useUnifiedTopology: true });
 
 // The database to use
 const dbName = "games";
 

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false}))

let db, gamesDb;

run().catch(console.dir);


//home page route
app.get('/', (req, res) => { 
    //display hello world on the landing page
    res.send('Hello world')
})

//get one game router
app.get('/games/:id', (req, res) => {
    console.log('You are in the games route');
    async function findgames() {
        try{
            //get games by id function mongoDB findOne()
            const foundgames = await  gamesDb.findOne({_id:ObjectId(req.params.id)})
            res.json(foundgames)
        } catch(err){
            // if an error occur display this
            res.send('Invalid game id');
        }
    };
    findgames();
})

//get all games
app.get('/games', (req,res) => {
    console.log('Getting all games');

    async function getAllgames() {
        // create an array of games to be displayed 
        let listGames = [];
        // search games in the database
        const gamesCursor = gamesDb.find();
        await gamesCursor.forEach(games => {
            listGames.push(games);
        });
        // display all games
        res.send(listGames);
    }

    getAllgames();
});


//post games route
app.post('/games', (req, res) =>{
    console.log('I have received a post request in the /games route');
    //create a games object
    let games = new Games(req.body.editor, req.body.newGame, req.body.console, req.body.pgRating)
    //insert it to the database
    gamesDb.insertOne(games)
    res.sendStatus(200)

})


// games router for the update
app.put('/games', (req, res) => {
    console.log(' games router for update ');
    async function findgames() {
        try{
            // find the object to modify
        const foundgames = await  gamesDb.findOne({"_id": ObjectId(req.body.id)})
        //if the games is found edit it and send a message to the user
        if(foundgames !== null){
            let games = new Games(
                            foundgames.editor, 
                            foundgames.newGame, 
                            foundgames.console, 
                            foundgames.pgRating)
            games.editor = req.body.editor;
            games.newGame = req.body.newGame;
            games.console = req.body.console;
            games.pgRating = req.body.pgRating;
            // modify the entry in the database
            try{
            const updateResult = await gamesDb.updateOne(
                                                {"_id": ObjectId(req.body.id)}, 
                                                {$set:games})
            } catch(err){
                console.log(err.stack)
            }
            res.send("The games was updated");            
        } else {
              //if the games is not found send a message to the user saying that this entry doe not exist
            res.send("The games was not updated");
        }}catch(err){
            res.send("Object id is invalid")
        }
    };
    findgames();

})
// games router to delete
app.delete('/games', (req, res) =>{

    console.log('games router to delete one games');

    // find the object to delete and delete it
    gamesDb.deleteOne({"_id": ObjectId(req.body.id)})
    async function findgames() {
        const foundgames = await  gamesDb.findOne({"_id": ObjectId(req.body.id)})
        if(foundgames !== null){
            res.send("The entry was not deleted")
        }
        res.send("The entry was deleted")
    };
    findgames();
})

//code used to start our application
async function run() {
    // try to start the application only if the database is connected correctly
    try {
        //connect to the database
        await client.connect();
        
        //connect to the right database ("games")
        db = client.db(dbName);

        //get reference to our games "table"
        gamesDb = db.collection("games");

        //start listening to requests (get/post/etc.)
        app.listen(3000);
    } catch (err) {
        //in case we couldn't connect to our database throw the error in the console
         console.log(err.stack);
    }
}

class Games {
    constructor(editor, newGame = true, console, pgRating){
        this.editor = editor;
        this.newGame = newGame;
        this.console = console;
        this.pgRating = pgRating;
    }

    printValues(){
        console.log(this.editor, this.newGame, this.console, this.pgRating);
    }
}