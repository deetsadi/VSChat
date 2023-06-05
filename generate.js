const _openai = require('openai')

async function generate(prompt, apiKey, max_tokens) {

  const configuration = new _openai.Configuration({
    apiKey: apiKey
  });
  const openai = new _openai.OpenAIApi(configuration);

  const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 0.8,
      max_tokens: max_tokens
  });

  return (completion.data.choices[0].text);

}

exports.generate = generate;