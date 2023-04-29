const openailib = require("openai");
const Configuration = openailib.Configuration;
const OpenAIApi = openailib.OpenAIApi;
const configuration = new Configuration({
    apiKey: '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',
  });
  const openai = new OpenAIApi(configuration);


const generateQuiz = async (topic, numberOfQuestions = 10, optionsCount = 3) => {
    const prompt = `Generate a quiz about ${topic} with ${numberOfQuestions < 20 ? numberOfQuestions : 10} questions, each with ${optionsCount} answer options. The quiz should be in the following raw format:
  
    1. Question: Example question?
    Answer: Example answer
    Options:
    - Example option 1
    - Example option 2
    - Example option 3
  
    ...`;
  
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt,
        max_tokens: 100,
        temperature: 0.8,
        n: 1,
    });
  
    const rawQuiz = response.data.choices[0].text.trim();
    // console.log(rawQuiz, '**2');
    const questions = rawQuiz.split('\n\n');
  
    const quiz = questions.map((questionText, index) => {
      const lines = questionText.split('\n');
      const questionLine = (lines.shift()).replace(/^\d+\.\s/, '');
      const answerLine = lines.shift();
      const options = (lines.slice(1)).map(line => (line.slice(2)).trim());
  
      return {
        numb: index + 1,
        question: questionLine.trim(),
        answer: answerLine.slice(8).trim(),
        options,
      };
    });
  
    return quiz;
  };

generateQuiz("indian ocean", 2, 2).then((res)=>console.log("*** quiz is ****", res, "***"))
  