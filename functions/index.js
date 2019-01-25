'use strict';
const admin = require('firebase-admin');
const functions = require('firebase-functions');
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

const addName=(name) => {
return new Promise((resolve,reject)=>{
    db.collection('names').add({
        name: name.sukunimi.toLowerCase()
    }).then((ref) =>{
        resolve(`New document added with ID: ${ref.id}`);
        return true;
    }).catch((err)=>{
        console.log('Error adding new name', err);
        reject(err);
    });
});
};

const remove = (params)=>{
    return new Promise((resolve,reject)=>{
        db.collection('names').doc(params.id).delete().then(() =>{
            //console.log("poiston result" + result);
            //console.log(result);
            resolve("Poisto onnistui");
            return true;
        }).catch((err)=>
            reject(err));

    });
};

const removeName = (params)=>{
    return new Promise ((resolve,reject)=>{
        nameSearch(params).then(result => {
            if (result) {
               // db.collection('names').doc(result.id).delete();
                resolve(remove(result));
                return remove(result);
                //console.log(`${result.id} = document id ja ${result.ref} = ref joka on jonkinlainen objekti`);
            } else {
                resolve(`${params.sukunimi} wasn't found!`);
                return false;
            }
        }).catch((err)=>{
            reject(err);
        })
    });
};

const getAllNames = ()=>{
    return new Promise((resolve,reject)=>{
        db.collection('names').get()
            .then((snapshot) => {
                let outputMessage = "The names in the database are: ";
                snapshot.forEach((doc) => {
                    outputMessage += `${doc.data().name}, `;
                });
                resolve(outputMessage);
                return true;
            })
            .catch((err) => {
                reject(err);
            });
    });
};


const nameSearch = (params) =>{
    return new Promise( (resolve,reject)=> {
        db.collection('names').get()
            .then((snapshot) => {
                snapshot.forEach((doc) => {
                    if (doc.data().name.toLowerCase() === params.sukunimi.toLowerCase()) {
                        resolve(doc);
                        return doc;
                        //Huom forEachista ei pääse siististi pois kesken kaiken
                    }
                });
                resolve (false);
                return false;
            })
            .catch((err) => {
                console.log('Error getting documents', err);
                reject(err);
            });
    })};

const responseSender=(message,response)=>{
    response.send({
        fulfillmentText: message
    });
};

const nameHandler = (returnValue,params,response)=>{
        if(returnValue){
            nameFound(params.sukunimi, response);
        }else{
            nameNotFound(params.sukunimi, response);
        }
        return true;
};
const nameFound =(name,response)=>{
    responseSender(`Yes, name ${name} was found!`,response);
};
const nameNotFound = (name,response)=>{
    responseSender(`Sorry, the name ${name} was not found!`,response);
};
const nameCheck = (name)=>{
    const letters = /^[A-Za-z\-_ ’'‘äöå]+$/;
    if(name.value.match(letters)){
        return true
    }else{
        responseSender("Invalid name",response);
        return false;
    }
};

 exports.nameCheck = functions.https.onRequest((request, response) => {
    // console.log(dbData);
    const params = request.body.queryResult.parameters;
     //Refence the document db.collection('nimi').doc('docnimi sdalkKDKAl23LSKD2');
     // const dbData = db.collection('names').doc('Je0lGxgDbEBYIQz25tIW');
     /* const databaseCollection = db.collection('names');
      response.send({
          fulfillmentText: "Sorry, name was not found"
      });*/
   // console.log(request.body.queryResult.intent.displayName);


     /*
    if(!nameCheck(params.sukunimi)){
        responseSender("Invalid name",response);
    }*/
     //nameCheck(params.sukunimi);

     //toimmiva verrrsio
    switch(request.body.queryResult.intent.displayName){
        case "nameSearch":
            nameSearch(params)
                .then(result =>
                    nameHandler(result,params,response)
                ).catch((err)=>{
                console.log(err);
            });
            break;
        case "addName":
            addName(params,response).then(result =>
                responseSender(result,response)
            ).catch((err)=>{
               console.log(err);
            });
            break;
        case "getAllNames":
            getAllNames().then(result =>
                responseSender(result,response)
            ).catch((err)=>{
                console.log(err);
            });
            break;
        case "removeName":
            removeName(params).then((result) =>{
                    return responseSender(result,response)
                }).catch((err)=>{
               console.log(err);
            });
            break;
    }
 });


