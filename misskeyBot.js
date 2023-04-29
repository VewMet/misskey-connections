const express = require('express');
const misskeyApi = require('misskey-js').api;

const app = express();
const port = 4000; // or any other port of your choice

// Replace <YOUR_ACCESS_TOKEN> with your Misskey access token
const accessToken = '6vT5CTjroUIXmH7r';

app.get('/', async (req, res) => {
  try {
    // Create a Misskey client instance with the access token
    const api = new misskeyApi.APIClient({
      origin: 'http://127.0.0.1:3000', // for localtesting, do not use "localhost", use "127.0.0.1"
      credential: accessToken,
    });
    
    const meta = await api.request('notes/create', { text: `jai siaram`, visibility:"public", localOnly:true,credential:accessToken });
    console.log('meta is: ', meta)

    // // Set the note content and visibility
    // const note = {
    //   text: 'This is a test note from Express.js',
    //   visibility: 'home', // You can change this to 'public' or 'followers' as well
    // };

    // // Create the note using the Misskey client
    // const createdNote = await misskey.notes.create(note);

    // console.log('Note created successfully:', createdNote);
    // res.send('Note created successfully!');
  } catch (error) {
    console.error('Error creating note:', error);
    res.send('Error creating note.');
  }
});

app.listen(port, () => {
  console.log(`Express app listening at http://localhost:${port}`);
});
