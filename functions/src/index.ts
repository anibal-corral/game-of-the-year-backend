import * as functions from "firebase-functions";
// import * as admin from 'firebase-admin';
import * as express from "express";
import * as cors from "cors";


const admin = require("firebase-admin");

const serviceAccount = require("./mykeys.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
//   databaseURL:""
});

const db = admin.firestore();


// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.json({
    msg: "Hello from Firebase!!!",
  });
});

export const getGameOfTheYear = functions.https.onRequest(
    async (request, response) => {
      //  const name = "anastasia";
      const collection = db.collection("gameoftheyear");
      const docSnap = await collection.get();
      const games= docSnap.docs.map((doc:any) => doc.data());
      response.json(games);
    });


// express

const app = express();
app.use(cors({origin: true}));
app.get("/gameoftheyear", async (req, res)=>{
  const collection = db.collection("gameoftheyear");
  const docSnap = await collection.get();
  const games= docSnap.docs.map((doc:any) => doc.data());
  res.json(games);
});
app.post("/gameoftheyear/:id", async (req, res)=>{
  const id = req.params.id;
  const gameRef = db.collection("gameoftheyear").doc(id);
  const gameSnap = await gameRef.get();
  // Validation id
  if (!gameSnap.exists) {
    res.status(404).json({
      ok: false,
      msg: "There is no game with this ID "+ id,
    });
  } else {
    const before = gameSnap.data();
    await gameRef.update({
      votes: before.votes + 1,
    });
    res.json(
        {
          ok: true,
          msg: "Thanks",
        }
    );
  }
});


exports.api = functions.https.onRequest(app);
