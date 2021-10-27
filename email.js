const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const {encode} = require('js-base64')
require('dotenv').config();

// If modifying these scopes, delete token.json.
// const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
const SCOPES = ['https://mail.google.com/']
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = process.env.Token;

exports.sendEmailEvent = function (to, from, subject, message){
// Load client secrets from a local file.
    fs.readFile(process.env.Credentials, (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Gmail API.
    authorize(JSON.parse(content), function(auth) { 
        // listLabels(auth, to, from, subject, message)
        listLabels(auth, to, from, subject, message)
    });
  });
}


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}


/** Creates a very basic email structure
 * @param to Email address to send to
 * @param from Email address to put as sender
 * @param subject The subject of the email [warn: encoding, see comment]
 * @param message The body of the email
 */
function MakeEmail(to, from, subject, message) {
    // OK, so here's the magic
    // The array is used only to make this easier to understand, everything is concatenated at the end
    // Set the headers first, then the recipient(s), sender & subject, and finally the message itself
    const str = [
        'Content-Type: text/plain; charset="UTF-8"\n', // Setting the content type as UTF-8 makes sure that the body is interpreted as such by Google
        'to: ', to,'\n',
        'from: ', from,'\n',
        // Here's the trick: by telling the interpreter that the string is base64 encoded UTF-8 string, you can send non-7bit-ASCII characters in the subject
        // I'm not sure why this is so not intuitive (probably historical/compatibility reasons),
        // but you need to make sure the encoding of the file, the server environment & everything else matches what you specify here
        'subject: =?utf-8?B?', encode(subject, true),'?=\n\n', // Encoding is base64 with URL safe settings - just in case you want a URL in the subject (pls no, doesn't make sense)
        message, // The message body can be whatever you want. Parse templates, write simple text, do HTML magic or whatever you like - just use the correct content type header
    ].join('');

    const encodedMail = encode(str, true); // Base64 encode using URL safe settings

    return encodedMail;
}


/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth, to, from, subject, message) {
    const gmail = google.gmail({version: 'v1', auth});

   gmail.users.messages.send({
        auth: auth, // Pass the auth object created above
        requestBody: {
            // I'm fairly certain that the raw property is the most sure-fire way of telling the API what you want to send
            // This is actually a whole email, not just the body, see below
            raw: MakeEmail(from, to, subject, message),
        },
        userId: 'me', // Using me will set the authenticated user (in the auth object) as the requester
    });
}