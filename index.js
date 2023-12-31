const express = require("express");
const admin = require("firebase-admin");
const serviceAccount = require("./key.json"); // Replace with your own key.json file from service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    // Replace with your own databaseURL from firebase project settings
    "https://golf-calf-default-rtdb.asia-southeast1.firebasedatabase.app",
});

const app = express();
const db = admin.database();
const ref = db.ref("chatrooms");

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});

const receiverFCM = "d9H3QrH6T8u5QrH6T8u5QrH6T8u5";  // Dummy ideally obtain it from message body.

ref.on("child_added", (snapshot) => {
  const chatroomID = snapshot.key;
  const chatroomRef = db.ref(`chatrooms/${chatroomID}/messages`);
  chatroomRef.on("child_added", (snapshot) => {
    const messageID = snapshot.key;
    const { sender, message } = snapshot.val(); // also add a receiver FCM  to the message;
    console.log(chatroomID, messageID, sender, message);

    // Send push notification to receiver
    const messagePayload = {
      notification: {
        title: "New Message",
        body: `You have a new message from ${sender}: ${message}`,
      },
      token: receiverFCM, // Replace with the receiver's FCM token
    };

    admin
      .messaging()
      .send(messagePayload)
      .then((response) => {
        console.log("Push notification sent successfully:", response);
      })
      .catch((error) => {
        console.error("Error sending push notification:", error);
      });
  });
});
