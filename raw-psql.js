const { Pool } = require('pg');
const fs = require('fs');

// Create a new Pool instance
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'misskey',
  password: 'example-misskey-pass',
  port: 5432 // default PostgreSQL port
});

(async function(){
  const client = await pool.connect();
  const email='pp@pp.co';
  return joinFederation(client);
  const userId = await getUserIdByEmail(client, email);
  const gt_createdAt = '2023-02-14';
  const q_inputs_userId = new Array(20).fill(userId);
  let parameters = [gt_createdAt, ...q_inputs_userId];
  const notes_id_list = await getNotesIds(client, parameters);
  parameters = [...parameters, notes_id_list];
  const home_timeline_notes = (await getNotesByIds(client, parameters));
  console.log(home_timeline_notes);
  client.release()
})();

async function getUserIdByEmail(client, email){
  try{
    const res = await client.query(`SELECT "userId" FROM user_profile WHERE "email"=$1;`, [email]);
    return res.rows[0].userId;
  } catch(err){
    console.error(err);
  } 
}

async function getNotesIds(client, parameters){
  const filename = 'query-home-timeline-1.txt';
  const sqlQuery = fs.readFileSync(filename, 'utf8');
  try {
    const res = await client.query(sqlQuery, parameters)
    const notes_id_list = res.rows.map(o=>o.note_id);
    return notes_id_list;
  } catch (err) {
    console.error(err)
  } finally {
    // pool.end()
  }
}

async function getNotesByIds(client, parameters){
  
/* 
YOU MAY NEED TO
INCLUDE MORE KEYS
IN FUTURE
*/
  const include = [
    'user_username',
    'note_hasPoll',
    'note_id',
    'note_text',
    'note_createdAt',
    'note_threadId',
    'reply_id',
    'reply_text',
    'reply_replyId',
    'reply_renoteId',
    'reply_threadId',
    'reply_hasPoll',
    'replyUser_username',
    // 'renote_text',
    // 'renoteUser_username',
    // 'renote_replyId',
    // 'renote_renoteId',
    // 'renote_threadId'
  ];
  const filename = 'query-home-timeline-2.txt';
  const sqlQuery = fs.readFileSync(filename, 'utf8');
  try {
    const res = await client.query(sqlQuery, parameters)
    const textVars = {};
      const textVarIndex = (text) => {
        let index;
        const textVarExists = Object.entries(textVars).some(([key,txt])=>{
          if(txt === text){
            index = key;
            return true;
          };
        });
        if(!textVarExists){
          index = Object.keys(textVars).length + 1;
          textVars['$'+index] = text;
        }         
        return index;
      }
    const notes_id_list = res.rows.map(o=>{
      const {note_createdAt, reply_id, replyUser_username, reply_text, user_username, note_text, renote_id, renoteUser_username, renote_text} = o;
      let textTransform;
      
      if(reply_id){

        textTransform = `${replyUser_username} said, "$${textVarIndex(reply_text)}". ${user_username} replied, "$${textVarIndex(note_text)}" on ${note_createdAt.toDateString()} `
      }
      else if(renote_id){
        textTransform = `${renoteUser_username} said, "$${textVarIndex(renote_text)}". ${user_username} shared and commented, "${textVarIndex(note_text)}"  on ${note_createdAt.toDateString()} `
      } else {
        textTransform = `${user_username} said, "$${textVarIndex(note_text)}" on ${note_createdAt.toDateString()}`
      }
      return textTransform;
    });
    return JSON.stringify(textVars) + '\n' + notes_id_list.join('\n');
  } catch (err) {
    console.error(err)
  } finally {
    pool.end()
  }
}

async function joinFederation(client){
  const federationArr = ['moon.org','sd.uk'];
  try{
    const res = await client.query(`select "id","whitelistedHosts", "blockedHosts" from meta;`, []);
    const {id, whitelistedHosts, blockedHosts} = res.rows[0];
    // ALERT TODO how to handle case when user had set blockList mode, currently, that setting will be overwritten
    // ALERT one of the two- whitelistedHosts or blockedHosts MUST be an empty array, otherwise misskey image will crash for admin
    const newWhitelistedHosts = Array.from(new Set([...whitelistedHosts, ...federationArr]))
    const newBlockedHosts = [];
    const update = {
      text: `UPDATE meta
      SET "whitelistedHosts" = $1, "blockedHosts" = $2
      WHERE id = $3`,
      values: [newWhitelistedHosts, newBlockedHosts, id],
    };
    const updated = await client.query(update);
    if(!updated){
      throw new Error("UPDATE failed")
    }
    return;
  } catch(err){
    console.error(err);
  } 
}

/**
 *  [{
    user_username: 'pp',
    note_hasPoll: false,
    note_id: '9ck4knsklm',
    note_text: '@l Yeahh babes',
    note_createdAt: 2023-03-20T08:24:30.836Z,
    note_threadId: '9cj69zuzym',
    reply_id: '9ck4kaielj',
    reply_text: '@l OK JIJI',
    reply_replyId: '9cj69zuzym',
    reply_renoteId: null,
    reply_threadId: '9cj69zuzym',
    reply_hasPoll: false,
    replyUser_username: 'pp'
  },
  {
    user_username: 'pp',
    note_hasPoll: false,
    note_id: '9ck4kaielj',
    note_text: '@l OK JIJI',
    note_createdAt: 2023-03-20T08:24:13.622Z,
    note_threadId: '9cj69zuzym',
    reply_id: '9cj69zuzym',
    reply_text: '@pp oye',
    reply_replyId: null,
    reply_renoteId: null,
    reply_threadId: null,
    reply_hasPoll: false,
    replyUser_username: 'l'
  },
  {
    user_username: 'l',
    note_hasPoll: false,
    note_id: '9cj69zuzym',
    note_text: '@pp oye',
    note_createdAt: 2023-03-19T16:24:26.315Z,
    note_threadId: null,
    reply_id: null,
    reply_text: null,
    reply_replyId: null,
    reply_renoteId: null,
    reply_threadId: null,
    reply_hasPoll: null,
    replyUser_username: null
  },
  {
    user_username: 'pp',
    note_hasPoll: false,
    note_id: '9cigi0hgvb',
    note_text: 'hello world',
    note_createdAt: 2023-03-19T04:22:50.356Z,
    note_threadId: null,
    reply_id: null,
    reply_text: null,
    reply_replyId: null,
    reply_renoteId: null,
    reply_threadId: null,
    reply_hasPoll: null,
    replyUser_username: null
  }
]
 */
/**
 * TEST input - raw text bodies
 * 

pp said, "@l ok. I can place a letter on the president’s table". pp replied, "@l Won’t that be difficult? What if the president does not come to office or does not read the stack of letters? You should come up with a better plan dude" on Mon Mar 20 2023 13:54:30 GMT+0530 (India Standard Time) 
l said, "@pp How do we make our voices heard? All the factories are down. Workers are on strike. Border is under strain. War may be coming. Situation is pretty tense here. I am looking a way out of the country already". pp replied, "@l ok. I can place a letter on the president’s table" on Mon Mar 20 2023 13:54:13 GMT+0530 (India Standard Time) 
l said, "@pp How do we make our voices heard? All the factories are down. Workers are on strike. Border is under strain. War may be coming. Situation is pretty tense here. I am looking a way out of the country already" on Sun Mar 19 2023 21:54:26 GMT+0530 (India Standard Time)
pp said, "total anarchy. No one is coming down the heavens to rescue us." on Sun Mar 19 2023 09:52:50 GMT+0530 (India Standard Time)
 
TEST input - mapped text bodies

{"$1":"@l ok. I can place a letter on the president’s table","$2":"@l Won’t that be difficult? What if the president does not come to office or does not read the stack of letters? You should come up with a better plan dude","$3":"@pp How do we make our voices heard? All the factories are down. Workers are on strike. Border is under strain. War may be coming. Situation is pretty tense here. I am looking a way out of the country already","$4":"total anarchy. No one is coming down the heavens to rescue us."}
pp said, "$1". pp replied, "$2" on Mon Mar 20 2023 
l said, "$3". pp replied, "$$1" on Mon Mar 20 2023 
l said, "$$3" on Sun Mar 19 2023
pp said, "$4" on Sun Mar 19 2023


PROMPT___________
tweet bodies are stored in vars like $1, $2, etc.
I am giving you these vars and a list of tweets.
You need to summarize it very shortly in 300 characters suitable for sms.
The summary should mainly contain the context, some emotion, and human readable chronology if needed, 
capturing briefly what happened. You can paraphrase if needed.

{"$1":"@l ok. I can place a letter on the president’s table","$2":"@l Won’t that be difficult? What if the president does not come to office or does not read the stack of letters? You should come up with a better plan dude","$3":"@pp How do we make our voices heard? All the factories are down. Workers are on strike. Border is under strain. War may be coming. Situation is pretty tense here. I am looking a way out of the country already","$4":"total anarchy. No one is coming down the heavens to rescue us."}
pp said, "$1". pp replied, "$2" on Mon Mar 20 2023 
l said, "$3". pp replied, "$$1" on Mon Mar 20 2023 
l said, "$$3" on Sun Mar 19 2023
pp said, "$4" on Sun Mar 19 2023

RESPONSE 1______________
On Mar 19, pp described the situation as "total anarchy" & l asked how to make voices heard.
On Mar 20, l suggested placing a letter on the president's table, but pp doubted its effectiveness.
Meanwhile, pp expressed concern about the tense situation, with factories shut, workers on strike & war looming,
and even contemplating leaving the country.

RESPONSE 2______________
The situation in the country is tense with factories shut down,
workers on strike, and a possible war on the horizon.
@pp is looking for a way out of the country.
@l suggested placing a letter on the president's table but @pp thinks it's not a good idea.
According to @pp, there is total anarchy, and no one is coming to rescue them.

etc etc
*/