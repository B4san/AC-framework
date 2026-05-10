import inquirer from 'inquirer';

const choices = [
  { name: 'Option A', value: 'a' },
  { name: 'Option B', value: 'b' }
];

inquirer.prompt([{
  type: 'list',
  name: 'q1',
  message: 'Choose:',
  choices
}]).then(console.log).catch(console.error);
