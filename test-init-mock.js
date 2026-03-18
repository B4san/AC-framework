import { initCommand } from './src/commands/init.js';
import inquirer from 'inquirer';

inquirer.prompt = async (questions) => {
  console.log("Mocking prompt:", questions[0].name);
  if (questions[0].name === 'template') {
    return { template: 'new_project' };
  }
  if (questions[0].name === 'selected') {
    return { selected: ['.cursor', '.cline'] };
  }
  if (questions[0].name === 'wantMore') {
    return { wantMore: false };
  }
  if (questions[0].name === 'confirm') {
    return { confirm: true };
  }
  if (questions[0].name === 'enableMemory') {
    return { enableMemory: false };
  }
  return {};
};

initCommand().catch(console.error);
