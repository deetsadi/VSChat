# VSChat

## Description
A VSCode extension that allows a seamless integration of ChatGPT into the IDE. Just supply your OpenAI API Key and get up running in seconds.

## Installation
The extension is available here: https://marketplace.visualstudio.com/items?itemName=aditya-sridhar.vschat-gpt

## Instructions
Open the command palette (View->Command Palette) within VSCode and click on the command titled `Set OpenAI API Key`. Enter your API key and hit enter. Note that the API key is preserved over restarts, so you do not have to set it again.

To send a prompt to ChatGPT, just wrap the text in the `@s` and `@e` decorators. 
ex. `@s ping a rest api in python @e`
You will see the text inside the decorators get a glowing bounding box for a few seconds as the prompt is processed, and then the response will be added below the original line.

Currently, the maximum number of tokens set for ChatGPT's response is 200. There will be a feature to configure this limit to your choice soon.

## Demo
![demo_vid_2](https://github.com/deetsadi/VSChat/assets/47929718/a687d268-328f-4665-bed7-efee3ca93ddc)


