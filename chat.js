firebase.initializeApp({
  apiKey: "AIzaSyAa9nIvVqumqkClFO8il19Va0KoQ_wmN8M",
  authDomain: "yexs-chat.firebaseapp.com",
  databaseURL: "https://yexs-chat-default-rtdb.firebaseio.com",
  projectId: "yexs-chat",
  storageBucket: "yexs-chat.appspot.com",
  messagingSenderId: "784190773413",
  appId: "1:784190773413:web:5de305c6e34bc779a6154c"
});
const database = firebase.database();
const auth = firebase.auth();
const storage = firebase.storage();

/**
 * @param {string} query The CSS-like query to search for.
 * @returns {Element?} The first element that matches the query, or `null` if no elements match the provided query.
 * @example
 * elem("h1#heading.black > span:nth-child(2) + i[data-name='italic'] ~ strong:last-child")
*/
const elem = (query) => document.querySelector(query);
/**
 * @param {string} query The CSS query to search for.
 * @returns {Element[]} An array of elements matching the query, or an empty array if no elements match the provided query.
*/
const elems = (query) => Array.from(document.querySelectorAll(query));
const channelContent = elem("ul#channel-content");

elem("#message-form").addEventListener("submit", messageSub);
elem("#message-input").addEventListener("keydown", function(ev) {
  if(ev.key === "Tab") {
    ev.preventDefault();
    this.setRangeText('\t', this.selectionStart, this.selectionEnd, "end");
  }
});

/** @description If there are list items (chat messages) present within ***`ul#channel-content`***, it will be scrolled by a certain amount so it can be successfully viewed by the user. */

function scrollChatMessages() {
  const liElems = elems("ul#channel-content > li");
  if(liElems.length > 0)
    liElems.at(-1).scrollIntoView();
}

/**
 * @param {string} str The string to perform the replace operation on.
 * @param {(string|RegExp)[]} find An array of strings and/or regexes for which to look for matches in `str`.
 * @param {string[]} replace An array of strings to replace respective matches from `find` with.
 * @returns {string} `str` with all of the matches of each item in `find` in `str` replaced with all of the strings in `replace`.
*/

function replaceArray(str, find, replace) {
  var replaceString = str;
  var regex; 
  for (var i = 0; i < find.length; i++) {
    regex = new RegExp(find[i], "g");
    replaceString = replaceString.replace(regex, replace[i]);
  }
  return replaceString;
}

/**
 * @param {string} str String to convert
 * @returns {Element} Returns a element node that is constructed from the markup inside `str` and sanitized.
*/

function strToNode(str) {
  const el = document.createElement("div");
  el.insertAdjacentHTML("beforeend", str.trim());
  return el.children[0];
}

/**
 * @param {string} name The name of the new chat category.
 * @returns {HTMLDivElement} The `div` element that represents the category after it is appended to `div#categories`.
*/

function createCategory(name) {
  return elem("div#categories").appendChild(strToNode(`
    <div class="category" data-name="${name}">
      <label class="name">${name}<input type="checkbox" /></label>
      <div class="channels-container">
        <div class="channels"></div>
      </div>
    </div>
  `));
}

/**
 * @param {string} name The name of the channel.
 * @param {"chat"|"list"|"news"} type The type of the channel.
 * @param {string} categoryName The name of the category to add the channel to.
 * @returns {HTMLAnchorElement} The `a` element that represents the new channel after it is appended to the `div.channels` element within the category with the name of `categoryName`.
*/

function createChannel(name, type, categoryName) {
  return elem(`div.category[data-name=${categoryName}] div.channels`).appendChild(strToNode(`
    <a href="#${name}" id="${name}" class="channel" data-type="${type}">${name}</a>
  `));
}

const ownerUIDs = ["pZ9mJ2ZI3HOpHHD1LfEvGAxJSAK2"];

/**
 * @param {string} content The content of `sender`'s message
 * @param {{ displayName: string, photoURL: string, uid: string }} sender The sender of the chat message, the `displayName` being the username of the sender, the `photoURL` being the url to the profile picture of the sender, the `uid` being the unique user id assigned to the sender.
 * @param {number} timestamp a number of milliseconds elapsed since the *epoch* **(12:00 AM, January 1, 1970, UTC.)** that is converted into a `Date` object.
*/

function createChatMessage(content, sender, timestamp) {
  if(content.trim() !== '') {
    const prevMax = channelContent.scrollHeight - channelContent.clientHeight;
    channelContent.insertAdjacentHTML("beforeend", `
      <li class="chat-message" data-status="${sender.uid === auth.currentUser.uid ? 'sent' : 'received'}" data-timestamp="${timestamp}"> 
        <img class='profile-pic' src="${sender.photoURL}" alt="Profile Pic" loading="lazy">
        <div class="user-message">
          <p class="username">${sender.displayName + (ownerUIDs.includes(sender.uid) ? " <span class='owner'>Owner</span>" : '')} <time class="timestamp" datetime="${new Date(timestamp).toISOString()}">${new Date(timestamp).toLocaleString('en-US', { dateStyle: "short", timeStyle: "short" })}</time></p>
          <div class="message-content">${replaceArray(content.trim(), ["\&", "\<", "\>", /*/`{3,4} *(\w*)\s+((?:.|\s)*)`{3,4}/g,*/ /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/g, /@\S+/g], ["&amp;", "&lt;", "&gt;", /*(_, lang, code) => "<pre><code>" + hljs.highlight(code, { language: lang || "plaintext" }).value + "</code></pre>",*/ full => `<a href="${full}" target="_blank">${full}</a>`, full => `<span class='mcolor'>${full}</span>`])}</div>
        </div>
      </li>
    `);
    if(channelContent.scrollTop === prevMax || sender.uid === auth.currentUser.uid)
      scrollChatMessages();
  }
}

/**
 * @param {string} content The content of the bot's message
 * @param {string=} botName The optional name for the bot. Defaults to "Chat Bot."
 * @param {string=} photoURL The optional url pointing to the preferred profile picture for the bot. Defaults to "./favicon.png."
*/

function createBotMessage(content, botName="Chat Bot", photoURL="./favicon.png") {
  if(content.trim() !== '') {
    channelContent.insertAdjacentHTML("beforeend", `
      <li class="chat-message" data-status="received" data-timestamp="${Date.now()}"> 
        <img class='profile-pic' src="${photoURL}" alt="Profile Pic" loading="lazy">
        <div class="user-message">
          <p class="username">${botName} <span class='bot'>Bot</span> <time class="timestamp" datetime="${new Date().toISOString()}">${new Date().toLocaleString('en-US', { dateStyle: "short", timeStyle: "short" })}</time></p>
          <div class="message-content">${content.trim()}<span class='reminder'><i class='fas fa-eye'></i> Only you can see this.</span></div>
        </div>
      </li>
    `);
    scrollChatMessages();
  }
}

/**
 * @param {string[]} keys An array of keys to extract from `object`.
 * @param {object} object The object to extract the keys from.
 * @returns {object} `object` with the only the keys specified in `keys` included and all other omitted.
*/

function extractKeys(keys, object) {
  return Object.fromEntries(Object.entries(object).filter(([key]) => keys.includes(key)));
}

/**
 * @description Display a fixed error snackbar notification that stays for 2 seconds on the bottom right of the screen with a message of `msg`.
 * @param {string} msg The message to display on the snackbar notification. 
*/

function errorNotif(msg) {
  SnackBar({
    message: msg,
    status: "error",
    position: "br",
    icon: '!',
    fixed: true,
    timeout: 2000
  });
}

/**
 * @description if `message` is not empty (i.e. all whitespace or `length` of 0) and it doesn't contain `atob("bmlnZ2Vy")`, it will be added to the messages of the current channel with a key of `Date.now()` and having the properties of the current user (`auth.currentUser`) and `message`. The `#message-input` element will be cleared if `clearMessageInput` is `true`, and any errors that are thrown will print as notifications. An error notification also occurs if the first condition evaluates to `false`.
 * @param {string} message The message for `auth.currentUser` to send.
 * @param {boolean=} clearMessageInput A boolean that if `true`, clears the `#message-input` element. Defaults to `true`.
*/

function sendMessage(message, clearMessageInput=true) {
  if(message.trim() !== '' && !message.toLowerCase().includes(atob("bmlnZ2Vy"))) {
    database.ref(`channels/${location.hash.slice(1)}/messages/${Date.now()}`).set({
      user: extractKeys(["displayName", "photoURL", "uid"], auth.currentUser),
      message
    }).then(() => clearMessageInput && (elem("#message-input").value = '')).catch(err => errorNotif(err.message));
  } else errorNotif("Enter A Valid Message!");
}

String.prototype.if = function(value) {
  if(value) return this.valueOf();
  return '';
}

/**
 * @typedef {object} CommandArgument
 * @prop {string} name The name of the argument.
 * @prop {boolean=} optional A boolean that represents if the argument is optional or not. Defaults to `false`.
*/

/**
 * @typedef {object} Command
 * @prop {string} name The name of the command.
 * @prop {string[]} aliases All aliases or alternative names of the command.
 * @prop {CommandArgument[]} args An array of objects that represent argument definitions for the command.
 * @prop {CommandCallback} callback The callback function that is executed when the command is recognized.
*/

/**
 * @callback CommandCallback
 * @param {object} argsObject The object that contains the named arguments with the values as specified in the command calling.
*/

/** @type {Command[]} */

const commands = [{
  name: "shrug",
  aliases: [],
  args: [{
    name: "message",
    optional: true
  }],
  callback: ({ message='' }) => {
    sendMessage(message + " ¯\\_(ツ)_/¯");
  }
}, {
  name: "tableflip",
  aliases: ["fliptable"],
  args: [{
    name: "message",
    optional: true
  }],
  callback: ({ message='' }) => {
    sendMessage(message + " (╯°□°）╯︵ ┻━┻");
  }
}, {
  name: "help",
  aliases: ["helpme"],
  args: [],
  callback: () => {
    createBotMessage("Commands: <ul>" + commands.map(({ name, aliases, args }) => `<li>/${name + (' ' + args.map(({ name, optional }) => `&lt;${name + '?'.if(optional || false)}&gt;`).join(' ')).if(args.length > 0) + (" | Aliases: " + aliases.join(', ')).if(aliases.length > 0)}</li>`).join('') + "</ul>");
  }
}];

/**
 * @description Listens for the submit event on `#message-form` and prevents the default redirect from happening. It then pulls the message from the `#message-input` element's value and if it starts with a '/' character, it is recognized as a command and parsed and executed as one, if not, `sendMessage` is called with the pulled message as its singular argument.
 * @param {SubmitEvent} e The event that is fired when the `#message-form` element is submitted.
 */

function messageSub(e) {
    e.preventDefault();

    const message = elem("#message-input").value; 

    if(message.startsWith('/')) {
      const cmdName = message.slice(1).split(' ').shift().toLowerCase();
      const cmdArgs = message.split(' ').slice(1);

      if(cmd = commands.find(({ name, aliases }) => name === cmdName || aliases.includes(cmdName)))
        cmd.callback(Object.fromEntries(cmd.args.map(({ name }, i) => [name, cmdArgs[i]])));
      else createBotMessage("Unknown Command. Use /help or /helpme for a list of commands.");
    } else sendMessage(message);
}

elem('i[class^="fa"]#eye').onclick = function() {
  this.previousElementSibling.type = this.previousElementSibling.type === "password" ? "text" : "password";
  this.classList.toggle("fa-eye");
  this.classList.toggle("fa-eye-slash");
  this.previousElementSibling.focus();
}

if("user-email" in localStorage && "user-password" in localStorage) {
  auth.signInWithEmailAndPassword(localStorage.getItem("user-email"), localStorage.getItem("user-password")).then(async userCredential => {
    loadMessages();
    const user = userCredential.user;
    const photoRef = storage.ref(`userPhotos/${user.uid}`);
    const photoURL = await photoRef.getDownloadURL();
    elem("#user > img.profile-pic").setAttribute("src", photoURL);
    elem("#user > #user-info > p.username").textContent = user.displayName;
    elem("#user-form").toggleAttribute("hidden");
    elem("#chat").toggleAttribute("hidden");
    scrollChatMessages();
  }).catch(thrownError => errorNotif(thrownError.message));
}

elem("#form-change").onclick = function() {
  if(elem("#user-form").getAttribute("data-mode") === "login") {
    this.textContent = "Login";
    elem("#user-form h1").textContent = "Register";
    elem("#user-form").setAttribute("data-mode", "register");
  } else if(elem("#user-form").getAttribute("data-mode") === "register") {
    this.textContent = "Register";
    elem("#user-form h1").textContent = "Login";
    elem("#user-form").setAttribute("data-mode", "login");
  }
  elems("#photo-input, #username-input").forEach(v => v.toggleAttribute("required"));
}

/**
 * @description If the user is on the login screen then sign ing with the provided credentials and do necessary operations. If the user is on the register screen, then the user is signed up with provided credentials and necessary operations are performed. If **Remember Me** is toggled, then save the user's credentials for the next visit to the website.
 * @param {SubmitEvent} ev The event fired when `#user-form` is submitted.
 */

elem("#user-form").onsubmit = function(ev) { 
   ev.preventDefault();

   if(this.getAttribute("data-mode") === "login")
      auth.signInWithEmailAndPassword(elem("#email-input").value, elem("#password-input").value).then(async userCredential => {
        loadMessages();
        const user = userCredential.user;
        const photoRef = storage.ref(`userPhotos/${user.uid}`);
        const photoURL = await photoRef.getDownloadURL();
        elem("#user img.profile-pic").setAttribute("src", photoURL);
        elem("#user p.username").textContent = user.displayName;
        this.toggleAttribute("hidden");
        elem("#chat").toggleAttribute("hidden");
        scrollChatMessages();
      }).catch(thrownError => errorNotif(thrownError.message));
   else if(this.getAttribute("data-mode") === "register")
      auth.createUserWithEmailAndPassword(elem("#email-input").value, elem("#password-input").value).then(async userCredential => {
        loadMessages();
        const user = userCredential.user;
        const displayName = elem("#username-input").value;
        const photoFile = elem("#photo-input").files[0];
        if(displayName.length > 25 || displayName.toLowerCase().includes(atob('bmlnZ2Vy')))
          throw new TypeError((displayName.length > 25 ? "Username is too long! " : '') + (displayName.toLowerCase().includes(atob("bmlnZ2Vy")) ? "That username is already in use!" : ''));
        const photoRef = (await storage.ref("userPhotos").child(user.uid).put(photoFile)).ref;
        const photoURL = await photoRef.getDownloadURL();
        user.updateProfile({ displayName, photoURL });
        auth.updateCurrentUser(user);
        elem("#user img.profile-pic").setAttribute("src", photoURL);
        elem("#user p.username").textContent = displayName;
        this.toggleAttribute("hidden");
        elem("#chat").toggleAttribute("hidden");
        scrollChatMessages();
      }).catch(thrownError => errorNotif(thrownError.message));
  if(this.querySelector("button.toggle-btn").classList.contains("active")) {
    localStorage.setItem("user-email", elem("#email-input").value);
    localStorage.setItem("user-password", elem("#password-input").value);
  }
}

/**
 * @description Opens a file picker. A promise is returned that resolves one `File` if `multiple` is `false`, otherwise an array of the selected `File`s.
 * @param {{ accept: string, multiple: boolean }=} options If `options.multiple` is `true`, then allow selection of multiple files, `options.accept` is a comma seperated list of MIME types that are allowed when picking the file. `options.multiple` defaults to `false` and `options.accept` defaults to `*`.
 * @returns {Promise<File|File[]>}
*/

function openFilePicker({ accept="*", multiple=false }={}) {
	const fileInput = document.createElement("input");
	fileInput.type = "file";
  fileInput.accept = accept;
  fileInput.multiple = multiple;
	if(fileInput.showPicker)
    fileInput.showPicker();
  else fileInput.click();
	return new Promise((res) => {
		fileInput.addEventListener("change", () => res( multiple ? Array.from(fileInput.files) : fileInput.files[0] ));
	});
}

elem("div#user img.profile-pic").onclick = async function() {
  const file = await openFilePicker({ accept: "image/png, image/jpeg" });
  const photoRef = storage.ref("userPhotos/" + auth.currentUser.uid);
  await photoRef.put(file);
  this.src = this.src + '?' + Date.now(); // cache bust
}

/**
 * @description Fires when any child (message) of the current channel is added from another user or from the console. Also fires when a new channel a selected, and it's children (messages) are initialized.
 * @param {firebase.database.DataSnapshot} snapshot The snapshot for the added or initialized message.
*/

function chatChannelChildAdded(snapshot) {
  createChatMessage(snapshot.val().message, snapshot.val().user, Number(snapshot.key));
}

/**
 * @description Fires when any child (message) of the current channel is removed from the console.
 * @param {firebase.database.DataSnapshot} snapshot The snapshot for the removed message.
*/
  
function chatChannelChildRemoved(snapshot) {
  for(const listItem of elems("ul#channel-content > li")) {
    if(listItem.getAttribute('data-timestamp') === snapshot.key)
      listItem.remove();
  }
}

/**
 * @description Fires when any child (message) of the current channel is modified from the console.
 * @param {firebase.database.DataSnapshot} snapshot The snapshot for the changed message.
*/
  
function chatChannelChildChanged(snapshot) {
  if(messageElem = elems("ul#channel-content > li").find(v => v.getAttribute('data-timestamp') === snapshot.key)) {
    const { message, user: { photoURL, displayName } } = snapshot.val();
    messageElem.querySelector(".profile-pic").src = photoURL;
    messageElem.querySelector(".username").firstChild.replaceWith(new Text(displayName + ' '));
    messageElem.querySelector(".message-content").textContent = message;
  }
}

/** @type {firebase.database.Reference} */
let hashRef;

/** @description Loads and displays the messages of the current channel (dependent on ~~`window.`~~`location.hash`) and if the channel is read-only, disable use of message input. */

async function loadMessages() {
  if(location.hash === '' || location.hash.trim() === "#") location.hash = "general";
  if(hashRef) {
    hashRef.child("messages").off("child_added", chatChannelChildAdded);
    hashRef.child("messages").off("child_removed", chatChannelChildRemoved);
    hashRef.child("messages").off("child_changed", chatChannelChildChanged);
  }
  channelContent.replaceChildren();
  (elem(`a.channel[data-type]${location.hash}`) || createChannel(location.hash.slice(1), "chat", "chats")).closest("div.category[data-name]").querySelector("input[type='checkbox']").checked = true;
  channelContent.setAttribute("data-channel", location.hash.slice(1));
  hashRef = database.ref(`channels/${location.hash.slice(1)}`);
  hashRef.child("messages").on("child_added", chatChannelChildAdded);
  hashRef.child("messages").on("child_removed", chatChannelChildRemoved);
  hashRef.child("messages").on("child_changed", chatChannelChildChanged);
  elem("#message-input").value = '';
  const readonly = (await hashRef.child("readonly").get()).val();
  elem("#message-input").disabled = readonly;
  elem("#message-input").placeholder = readonly ? "You do not have permissions to send messages in this channel." : "Enter Message...";
}
  
window.onhashchange = loadMessages;