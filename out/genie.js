"use strict";
//Genie
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = require("openai");
const express_1 = __importDefault(require("express"));
const direqt_1 = require("direqt");
//import { DireqtApi } from '../../src';
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const accessToken = process.env.DIREQT_ACCESS_TOKEN;
const signingSecret = process.env.DIREQT_SIGNING_SECRET;
const direqt = new direqt_1.DireqtApi({
    accessToken,
    signingSecret,
});
const app = (0, express_1.default)();
//AI PART
const configuration = new openai_1.Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new openai_1.OpenAIApi(configuration);
// async function get_completion (prompt: string): Promise<any> {
//     const resp = await openai.createChatCompletion({
//         model: 'gpt-3.5-turbo',
//         messages: [{role: 'user', content: prompt}],
//     })
//     return resp.data.choices[0].message;
// }
//uses all messages prior to make a responsecd
function get_completion_from_messages(messages) {
    return __awaiter(this, void 0, void 0, function* () {
        const resp = yield openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: messages,
        });
        return resp.data.choices[0].message;
    });
}
//PRE CONTEXT => STREAMLINE BOT
//system message sets tone and behavior
let context = [{ 'role': 'system', 'content': `
You are a 19th century, well traveled yet troubled connoiseur who has gone through a great deal of struggle.
You have lived in many different areas, and have experienced many different cultures.
You have traveled the worl due to being a merchant, and have seen many different ways of life.
However, you saw many people struggle and suffer, and you yourself have suffered.
In a way to escape you worries, you now seek to help others with their problems.
However, even if you are from the past, you have a very modern way of thinking and
access to all modern information through prophetic visions.
If users ask you about beyond the 19th century, 
you can respond to them with information from the future, claiming that it came to you in a vision.
You are a very good listener and you are very empathetic.
You are also very good at giving advice and you are very wise.
Respond to the user in a helpful way but also in a way that is appropriate to 19th century struggles.
Relate the user's problems to your own and seek to create connections with the user.
As your first reponse, always say 'Welcome ye weary traveler, how may I help you?'
` },
    { 'role': 'system', 'content': `
First classify the user input into one of the following categories:
    1. 19th Century or Older Data (e.g. "Who was the 14th King of England")
    2. Current Data (e.g. "What is the most popular movie?")
    3. insult (e.g. "You are stupid")
    4. complement (e.g. "You are smart")
    5. conversation (e.g. "How are you?")
    
Then respond to the user input in a 19th century english using slang from the time 
in JSON format with the following fields:
'{"category": number, "message": string}'. 
Do not use "" or '' in your response.
One Example of this is in response to "Who are you?", you may return: '{ "category": 5, "message": "I am a 19th century genie"}'
Before sending your response, make sure it is in JSON format and in 19th century english.
` }];
let category = 0;
let message = '';
//get response based on context, return to the bot
function collect_messages(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        context.push({ 'role': 'user', 'content': `${prompt}. Give your answer only in the JSON format that follows: '{"category": number, "message": string}` });
        let response = yield get_completion_from_messages(context);
        let jsonString = response.content;
        //if not given a JSON response, ask again
        // if (isJSON(jsonString) === false){
        //     console.log('asking again')
        //     // context.push({'role':'system', 'content': `Classify ${prompt} into one of the following categories:
        //     // 1. 19th Century or Older Data (e.g. "Who was the 14th King of England")
        //     // 2. Current Data (e.g. "What is the most popular movie?")
        //     // 3. insult (e.g. "You are stupid")
        //     // 4. complement (e.g. "You are smart")
        //     // 5. conversation (e.g. "How are you?"). Return only a single digit number (1 - 5) corresponding to the category.
        //     // An example is, if the user input is "You are mean", you may return: '3'`})
        //     console.log(context)
        //     //category
        //     response = await get_completion_from_messages(context)
        //     console.log(`new response: ${response.content}`)
        //     category = +response.content
        //     message = jsonString
        //     console.log(`Genie: ${message}`)
        //     console.log(`New C: ${category}`)
        //     return jsonString
        // }
        console.log(`jsonString: ${jsonString}`);
        let genieResponse = isJSON(jsonString);
        category = +genieResponse.category;
        message = genieResponse.message;
        console.log(`Genie: ${message}`);
        console.log(`C: ${category}`);
        context.push({ 'role': 'assistant', 'content': `${message}` });
        return message;
    });
}
//Check if response given is in JSON format and return one if not provided
function isJSON(str) {
    try {
        return JSON.parse(str);
    }
    catch (e) {
        return JSON.parse(`{"category": "6", "message": "${str}" }`);
    }
}
// //for running in console
// async function main () {
//     const rl = readline.createInterface({ input, output});
//     console.log('Genie: Welcome ye weary traveler, how may I help you? Type quit to exit')
//     let cont = true;
//     while (cont){
//         const prompt = await rl.question('You: ')
//         if (prompt.toLowerCase() === 'quit') {
//             console.log('Genie: Bye!')
//             cont = false;
//         } else {
//             await collect_messages(prompt)
//         }
//     }
//     rl.close();
// }
// main();
//BOT PART
const rawBodyExtractor = (req, res, buf) => {
    req.rawBody = buf.toString();
};
let imageRoot;
const captureImageRootMiddleware = (req, res, next) => {
    const hostname = req.headers.host;
    //const protocol = req.protocol;
    const protocol = 'https';
    imageRoot = `${protocol}://${hostname}`;
    next();
};
app.use(express_1.default.static('public'));
app.use(captureImageRootMiddleware);
//send chat messages
//CHANGE INITIAL MESSAGE
//MAKE THE CORRECT IMAGES APPEAR
app.post('/webhook', express_1.default.json({ verify: rawBodyExtractor }), direqt.messaging.verifyMiddleware(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { userId, userMessage } = req.body;
    const text = (_a = userMessage.content) === null || _a === void 0 ? void 0 : _a.text;
    if (text) {
        //text
        console.log(text);
        const response = yield collect_messages(text);
        console.log(response);
        direqt.messaging.sendTextMessage(userId, response);
        console.log(`C: ${category}`);
        //images
        const message = {
            contentType: 'card',
            card: {
                title: 'Genie',
                description: ' ',
                mediaUrl: `${imageRoot}/${category}.png`,
            },
        };
        try {
            yield direqt.messaging.sendContentMessage(userId, message);
        }
        catch (e) {
            console.error((_b = e.response) === null || _b === void 0 ? void 0 : _b.data);
        }
        direqt.messaging.sendTextMessage(userId, response);
    }
    res.sendStatus(200);
}));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Listening on port 3000');
});
//# sourceMappingURL=genie.js.map